import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Search, Compass, ShieldAlert, CheckCircle, Upload, FileText, Calendar, Clock } from "lucide-react";
import { API_BASE } from "../apiConfig";

export default function StatusPage({ defaultQuery }) {
  const [queryVal, setQueryVal] = useState(defaultQuery || "");
  const [registrations, setRegistrations] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // States for uploading proof from status page
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const fetchStatus = async (val) => {
    if (!val) return;
    setSearching(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/check-status?query=${encodeURIComponent(val)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat status pendaftaran.");
      }
      setRegistrations(data);
      if (data.length === 0) {
        setError("Data pendaftaran tidak ditemukan. Pastikan Nomor WhatsApp atau Kode Registrasi sudah benar.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (defaultQuery) {
      fetchStatus(defaultQuery);
    }
  }, [defaultQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStatus(queryVal);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError(null);
  };

  const handleUploadProof = async (regCode, id) => {
    if (!selectedFile) return;
    setUploadingId(id);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("registration_code", regCode);

    try {
      const response = await fetch(`${API_BASE}/api/upload-proof`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah bukti transfer.");
      }
      // Refresh matching results
      fetchStatus(queryVal);
      setSelectedFile(null);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "36px", color: "var(--color-primary)", marginBottom: "8px" }}>Cek Status Tiket & Pembayaran</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
          Masukkan Nomor WhatsApp pendaftaran atau Kode Registrasi Anda untuk melihat status pembayaran dan mengunduh E-Tiket QR Code.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto 40px auto", padding: "24px", background: "rgba(255, 255, 255, 0.85)" }}>
        <form onSubmit={handleSearchSubmit} className="search-form" style={{ display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: 081234567890 ATAU REG-20260711-XXXX"
              value={queryVal}
              onChange={(e) => setQueryVal(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={searching}>
            <Search size={18} /> {searching ? "Mencari..." : "Cari Tiket"}
          </button>
        </form>
      </div>

      {error && (
        <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto 40px auto", borderColor: "#fca5a5", background: "rgba(254, 226, 226, 0.8)", display: "flex", gap: "12px", alignItems: "center" }}>
          <ShieldAlert style={{ color: "#dc2626" }} />
          <p style={{ color: "#b91c1c", fontSize: "14px" }}>{error}</p>
        </div>
      )}

      {/* Query Results Display */}
      {registrations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center" }}>
          {registrations.map((reg) => {
            const isApproved = reg.status === "paid";
            const hasUploadedProof = !!reg.payment_proof;

            return (
              <div key={reg.id} style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "32px",
                width: "100%",
                maxWidth: "1000px",
                alignItems: "stretch"
              }}>
                
                {/* Details Sheet */}
                <div className="glass-card" style={{ background: "rgba(255, 255, 255, 0.85)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <span className={`status-badge status-${reg.status}`}>
                        {reg.status === "paid" ? "Pembayaran Sukses" : reg.status === "rejected" ? "Bukti Ditolak" : "Menunggu Verifikasi"}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>{reg.registration_code}</span>
                    </div>

                    <h3 style={{ color: "var(--color-primary)", marginBottom: "16px" }}>{reg.package_name}</h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text-dark)", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px", marginBottom: "20px" }}>
                      <div><strong>Nama:</strong> {reg.name}</div>
                      <div><strong>WhatsApp:</strong> {reg.whatsapp}</div>
                      <div><strong>Email:</strong> {reg.email}</div>
                      <div>
                        <strong>Total Tagihan:</strong> Rp {parseFloat(reg.total_price).toLocaleString("id-ID")}
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                          (Termasuk kode unik: +{reg.unique_code})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment proof actions inside status check */}
                  {!isApproved && (
                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px" }}>
                      {hasUploadedProof ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "8px" }}>
                          <FileText size={16} /> Bukti transfer telah terunggah. Silakan tunggu verifikasi admin WhatsApp.
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", marginBottom: "8px" }}>MOHON UNGGAH BUKTI TRANSFER:</p>
                          {uploadError && <p style={{ color: "#dc2626", fontSize: "11px", marginBottom: "6px" }}>{uploadError}</p>}
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: "12px" }} />
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              disabled={uploadingId === reg.id || !selectedFile}
                              onClick={() => handleUploadProof(reg.registration_code, reg.id)}
                            >
                              {uploadingId === reg.id ? "Uploading..." : "Upload"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* E-Ticket Display (If Paid) or Status Panel (If Pending/Rejected) */}
                <div style={{ display: "flex" }}>
                  {isApproved ? (
                    /* Beautiful Premium E-Ticket layout */
                    <div className="glass-card" style={{
                      background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                      color: "white",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "32px",
                      position: "relative",
                      overflow: "hidden",
                      border: "none",
                      width: "100%",
                      boxShadow: "0 10px 30px rgba(30, 64, 175, 0.35)"
                    }}>
                      {/* Ticket Cutout Shapes */}
                      <div style={{ position: "absolute", left: "-16px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-primary)" }}></div>
                      <div style={{ position: "absolute", right: "-16px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-primary)" }}></div>
                      
                      {/* Sparkles background inside ticket */}
                      <div className="sparkle-bg">
                        <div className="sparkle" style={{ top: "10%", left: "80%", width: "4px", height: "4px", animationDelay: "1s" }}></div>
                        <div className="sparkle" style={{ top: "80%", left: "10%", width: "5px", height: "5px", animationDelay: "3s" }}></div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", color: "var(--color-accent)", textTransform: "uppercase" }}>E-TIKET MASUK</p>
                          <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "20px", color: "white", marginTop: "4px" }}>Duta Qur'an Indonesia</h3>
                        </div>
                        <Compass className="animate-spin-slow" size={24} style={{ color: "var(--color-accent)" }} />
                      </div>

                      <div style={{ display: "flex", gap: "24px", margin: "24px 0", alignItems: "center", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
                        {/* QR Code */}
                        <div style={{ background: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 8px 16px rgba(0,0,0,0.15)", display: "flex", flexShrink: 0 }}>
                          <QRCodeSVG 
                            value={reg.registration_code} 
                            size={100}
                            bgColor={"#ffffff"}
                            fgColor={"#0f172a"}
                            level={"M"}
                            includeMargin={false}
                          />
                        </div>

                        {/* Event summary details */}
                        <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <p style={{ fontWeight: 700, fontSize: "16px", color: "white" }}>{reg.name}</p>
                          <p style={{ opacity: 0.8 }}>{reg.package_name}</p>
                          {(() => {
                            let seats = null;
                            if (reg.seat_numbers) {
                              try {
                                const arr = typeof reg.seat_numbers === "string" ? JSON.parse(reg.seat_numbers) : reg.seat_numbers;
                                if (Array.isArray(arr) && arr.length > 0) seats = arr;
                              } catch (e) { /* abaikan */ }
                            }
                            const catInitial = (reg.category || reg.package_name || "x").charAt(0).toUpperCase();
                            return seats ? (
                              <p style={{ marginTop: "2px" }}>
                                <span style={{ background: "rgba(56, 189, 248, 0.25)", border: "1px solid #38bdf8", borderRadius: "8px", padding: "3px 10px", fontWeight: 800, color: "#e0f2fe", fontSize: "13px" }}>
                                  💺 Kursi: {seats.map((n) => `${catInitial}-${n + 1}`).join(" + ")}
                                </span>
                              </p>
                            ) : null;
                          })()}
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", opacity: 0.7, marginTop: "4px" }}>
                            <Calendar size={12} /> <span>Rabu, 09 September 2026</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", opacity: 0.7 }}>
                            <Clock size={12} /> <span>07.30 - 15.00 WIB</span>
                          </div>
                        </div>
                      </div>

                      {/* Check-in Ticket status badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(255,255,255,0.2)", paddingTop: "16px", position: "relative", zIndex: 1 }}>
                        <span style={{ fontSize: "11px", opacity: 0.7 }}>Tunjukkan QR Code ini pada panitia saat masuk</span>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          padding: "4px 12px",
                          borderRadius: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          background: reg.checked_in ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.15)",
                          color: reg.checked_in ? "#34d399" : "#e2e8f0",
                          border: reg.checked_in ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(255,255,255,0.1)"
                        }}>
                          {reg.checked_in ? "Masuk (Checked In)" : "Belum Check-In"}
                        </span>
                      </div>

                    </div>
                  ) : (
                    /* Instructions card if still pending */
                    <div className="glass-card" style={{
                      background: "rgba(255,255,255,0.6)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      padding: "32px",
                      width: "100%"
                    }}>
                      <div style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: reg.status === "rejected" ? "#fee2e2" : "#fef3c7",
                        color: reg.status === "rejected" ? "#ef4444" : "#f59e0b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px"
                      }}>
                        <Compass size={28} />
                      </div>
                      <h4 style={{ color: "var(--text-dark)" }}>
                        {reg.status === "rejected" ? "Pembayaran Ditolak" : "Menunggu Verifikasi"}
                      </h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px", maxWidth: "260px" }}>
                        {reg.status === "rejected" 
                          ? "Unggahan bukti pembayaran Anda ditolak oleh admin. Pastikan nominal dan bukti sudah benar, lalu unggah kembali." 
                          : "Panitia sedang memverifikasi transfer Anda. E-Tiket QR Code akan otomatis muncul di sini setelah disetujui."
                        }
                      </p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
