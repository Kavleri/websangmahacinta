import React, { useState } from "react";
import { Info, ShieldAlert, CheckCircle, Upload, ArrowLeft, Send } from "lucide-react";
import { API_BASE } from "../apiConfig";

export default function CheckoutPage({ selectedPackage, setPage, setQueryCode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [regData, setRegData] = useState(null);
  const [error, setError] = useState(null);

  // Voucher states
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  if (!selectedPackage) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <div className="glass-card" style={{ maxWidth: "500px", margin: "0 auto", padding: "40px" }}>
          <ShieldAlert size={48} style={{ color: "var(--color-primary)", marginBottom: "16px" }} />
          <h3>Keranjang Kosong</h3>
          <p style={{ color: "var(--text-muted)", margin: "12px 0 24px 0" }}>Silakan pilih paket pendaftaran terlebih dahulu di halaman utama.</p>
          <button className="btn btn-primary" onClick={() => setPage("landing")}>Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    setCheckingVoucher(true);
    setVoucherError(null);
    try {
      const res = await fetch(`${API_BASE}/api/vouchers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menerapkan voucher.");
      setAppliedVoucher(data);
    } catch (err) {
      setVoucherError(err.message);
      setAppliedVoucher(null);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          voucher_code: appliedVoucher ? appliedVoucher.code : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan registrasi.");
      }

      setRegData(data.registration);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadSuccess(false);
    setUploadError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !regData) return;

    setUploading(true);
    setUploadError(null);

    const uploadFormData = new FormData();
    uploadFormData.append("file", selectedFile);
    uploadFormData.append("registration_code", regData.registration_code);

    try {
      const response = await fetch(`${API_BASE}/api/upload-proof`, {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah bukti transfer.");
      }

      setUploadSuccess(true);
      // Update local status representation if successful
      setRegData({ ...regData, payment_proof: data.payment_proof });
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!regData) return "";
    const adminNumber = "6285762219848"; // 085762219848 formatted for international link
    
    // Construct pre-filled message text
    const message = `Halo Admin PeraQ/Duta Qur'an,\n\nSaya sudah melakukan transfer pembayaran registrasi untuk program kami.\n\nDetail Pendaftaran:\n- Nama: ${regData.name}\n- Kode Registrasi: ${regData.registration_code}\n- Program/Paket: ${regData.packageName}\n- Total Transfer: Rp ${parseFloat(regData.total_price).toLocaleString("id-ID")}\n\nSaya lampirkan bukti pembayaran saya di halaman website. Mohon bantuannya untuk melakukan verifikasi tiket. Terima kasih!`;
    
    return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckTicket = () => {
    if (regData) {
      setQueryCode(regData.registration_code);
      setPage("status");
    }
  };

  // Pre-calculate discount for layout display before submit
  const getPreDiscount = () => {
    if (!appliedVoucher) return 0;
    const base = parseFloat(selectedPackage.price);
    if (appliedVoucher.discount_type === "fixed") {
      return appliedVoucher.discount_value;
    } else {
      return base * (appliedVoucher.discount_value / 100);
    }
  };
  const preDiscount = getPreDiscount();

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <button className="btn btn-secondary" onClick={() => setPage("landing")} style={{ marginBottom: "24px", padding: "8px 16px", borderRadius: "8px" }}>
        <ArrowLeft size={16} /> Kembali
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", alignItems: "start" }}>
        
        {/* Form Pendaftaran Card */}
        <div className="glass-card" style={{ background: "rgba(255, 255, 255, 0.85)" }}>
          <h3 style={{ color: "var(--color-primary)", marginBottom: "8px" }}>Form Registrasi</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "12px" }}>
            Isi formulir pendaftaran di bawah ini untuk paket: <strong>{selectedPackage.name}</strong>
          </p>
          {selectedPackage.category && (
            <div style={{ background: "rgba(29, 78, 216, 0.06)", border: "1px solid rgba(29, 78, 216, 0.15)", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", fontSize: "13px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Kategori: {selectedPackage.category}
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                Seat diambil: <strong>{selectedPackage.seat_type === "couple" ? "2 seat (couple)" : "1 seat (personal)"}</strong>
                {typeof selectedPackage.seats_remaining === "number" && (
                  <> • sisa {selectedPackage.seats_remaining} seat</>
                )}
              </span>
            </div>
          )}

          {error && (
            <div className="glass-card" style={{ borderColor: "#fca5a5", background: "rgba(254, 226, 226, 0.8)", padding: "16px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
              <ShieldAlert style={{ color: "#dc2626" }} />
              <p style={{ color: "#b91c1c", fontSize: "14px" }}>{error}</p>
            </div>
          )}

          {!regData ? (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  placeholder="Contoh: Muhammad Hisyam" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Email</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  placeholder="Contoh: hisyam@gmail.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor WhatsApp Aktif</label>
                <input 
                  type="tel" 
                  name="whatsapp" 
                  className="form-control" 
                  placeholder="Contoh: 081234567890" 
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required 
                />
              </div>

              {/* Voucher input group */}
              <div className="form-group" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px", marginTop: "16px" }}>
                <label className="form-label">Kode Voucher (Opsional)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: DISKON20"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    disabled={appliedVoucher !== null || submitting}
                  />
                  {appliedVoucher ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: "10px 16px" }}
                      onClick={() => { setAppliedVoucher(null); setVoucherInput(""); }}
                    >
                      Batal
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: "10px 16px" }}
                      disabled={checkingVoucher || !voucherInput.trim() || submitting}
                      onClick={handleApplyVoucher}
                    >
                      {checkingVoucher ? "..." : "Terapkan"}
                    </button>
                  )}
                </div>
                {voucherError && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>{voucherError}</p>}
                {appliedVoucher && (
                  <p style={{ color: "#16a34a", fontSize: "12px", fontWeight: "600", marginTop: "6px" }}>
                    ✓ Voucher {appliedVoucher.code} berhasil diterapkan (Diskon: {appliedVoucher.discount_type === 'percentage' ? `${appliedVoucher.discount_value}%` : `Rp ${appliedVoucher.discount_value.toLocaleString("id-ID")}`})
                  </p>
                )}
              </div>

              {appliedVoucher && (
                <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.04)", marginBottom: "16px", fontSize: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Harga Awal:</span>
                    <span style={{ textDecoration: "line-through" }}>Rp {parseFloat(selectedPackage.price).toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#16a34a", marginTop: "4px" }}>
                    <span>Potongan Diskon:</span>
                    <span>- Rp {preDiscount.toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: "8px", paddingTop: "8px" }}>
                    <span>Harga Baru:</span>
                    <span>Rp {(parseFloat(selectedPackage.price) - preDiscount).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }} disabled={submitting}>
                {submitting ? "Memproses Registrasi..." : "Buat Kode Pembayaran"}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ color: "#10b981", background: "#d1fae5", width: "60px", height: "60px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <CheckCircle size={32} />
              </div>
              <h4 style={{ color: "var(--text-dark)", marginBottom: "8px" }}>Pendaftaran Tersimpan</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
                Kode Registrasi Anda adalah:
              </p>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-primary)", letterSpacing: "1px", background: "rgba(29, 78, 216, 0.08)", padding: "12px", borderRadius: "10px", border: "1px dashed var(--color-primary)", marginBottom: "24px" }}>
                {regData.registration_code}
              </div>
              <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleCheckTicket}>
                Lihat Detail Status Tiket
              </button>
            </div>
          )}
        </div>

        {/* Payment Detail Card */}
        {regData && (
          <div className="glass-card" style={{ background: "rgba(255, 255, 255, 0.9)", border: "1px solid var(--color-primary)" }}>
            <h3 style={{ color: "var(--color-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Info size={22} /> Instruksi Pembayaran
            </h3>

            {/* Unique Code Alert Section */}
            <div style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                TRANSFER NOMINAL PAS SAMPAI 3 DIGIT TERAKHIR!
              </p>
              
              <div style={{ fontSize: "14px", color: "var(--text-dark)", display: "flex", flexDirection: "column", gap: "8px", textAlign: "left", margin: "16px 0", background: "white", padding: "14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Harga Paket:</span>
                  <span>Rp {parseFloat(regData.base_price).toLocaleString("id-ID")}</span>
                </div>
                {parseFloat(regData.discount_amount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontWeight: "600" }}>
                    <span>Diskon Voucher ({regData.voucher_code}):</span>
                    <span>- Rp {parseFloat(regData.discount_amount).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-primary)", fontWeight: "600" }}>
                  <span>Kode Unik Transfer:</span>
                  <span>+{regData.unique_code}</span>
                </div>
              </div>
              
              <div style={{ borderTop: "1px dashed rgba(29, 78, 216, 0.2)", paddingTop: "12px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total yang harus ditransfer:</p>
                <p style={{ fontSize: "24px", fontWeight: 900, color: "#1e3a8a", margin: "4px 0" }}>
                  Rp {parseFloat(regData.total_price).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Transfer targets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", fontSize: "14px" }}>
              <div style={{ background: "white", padding: "14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontWeight: 700, color: "var(--text-dark)" }}>Bank Syariah Indonesia (BSI)</p>
                <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-primary)", margin: "4px 0" }}>7172839401</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>a.n. Duta Quran Indonesia</p>
              </div>
            </div>

            {/* Upload form for payment proof */}
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "16px", color: "var(--text-dark)", marginBottom: "12px" }}>Unggah Bukti Pembayaran</h4>
              
              {uploadError && (
                <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px" }}>
                  {uploadError}
                </div>
              )}

              {uploadSuccess ? (
                <div style={{ background: "#d1fae5", color: "#065f46", padding: "12px", borderRadius: "8px", fontSize: "13px", display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                  <CheckCircle size={18} /> Bukti transfer berhasil diunggah!
                </div>
              ) : (
                <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange} 
                    style={{ fontSize: "13px", width: "100%" }}
                    required
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: "8px", fontSize: "14px", alignSelf: "flex-start" }} disabled={uploading || !selectedFile}>
                    <Upload size={16} /> {uploading ? "Mengunggah..." : "Unggah Bukti"}
                  </button>
                </form>
              )}
            </div>

            {/* WA Notification Confirmation Button */}
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                Setelah mentransfer dan mengunggah bukti, konfirmasikan ke admin WhatsApp untuk aktivasi tiket Anda secara cepat:
              </p>
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-whatsapp" 
                style={{ width: "100%", padding: "12px" }}
              >
                <Send size={18} /> Konfirmasi ke Admin (WA)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

