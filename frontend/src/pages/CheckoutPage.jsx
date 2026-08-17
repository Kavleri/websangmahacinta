import React, { useState } from "react";
import { Info, ShieldAlert, CheckCircle, Upload, ArrowLeft, Send } from "lucide-react";
import { API_BASE, VERCEL_BASE } from "../apiConfig";

export default function CheckoutPage({ selectedPackage, selectedSeat, setPage, setQueryCode }) {
  const seatLabels = selectedSeat && selectedSeat.seats
    ? selectedSeat.seats.map((n) => `${(selectedSeat.cat || "x").charAt(0).toUpperCase()}-${n + 1}`).join(" + ")
    : null;
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
  // Alur baru: pilih file -> SUBMIT -> tersimpan -> halaman terima kasih -> konfirmasi WA
  const [submitted, setSubmitted] = useState(false);

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
          seat_numbers: selectedSeat && selectedSeat.seats ? selectedSeat.seats : undefined,
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

  // Kompres foto di browser (max sisi 1280px, JPEG) supaya ringan di-upload
  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1280;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Gagal memproses gambar."));
          resolve(new File([blob], "bukti-transfer.jpg", { type: "image/jpeg" }));
        }, "image/jpeg", 0.82);
      };
      img.onerror = () => reject(new Error("File bukan gambar yang valid."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });

  // SUBMIT: simpan bukti TF ke sistem -> lanjut halaman terima kasih
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedFile || !regData) return;

    setUploading(true);
    setUploadError(null);
    try {
      const compressed = await compressImage(selectedFile);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("registration_code", regData.registration_code);

      const response = await fetch(`${VERCEL_BASE}/api/upload-proof`, { method: "POST", body: fd });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan bukti transfer.");

      setUploadSuccess(true);
      setRegData({ ...regData, payment_proof: data.payment_proof });
      setSubmitted(true);
      setTimeout(() => {
        const el = document.getElementById("thanks-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
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
    const message = `Halo Admin PeraQ/Duta Qur'an,\n\nSaya sudah melakukan transfer pembayaran registrasi untuk program kami.\n\nDetail Pendaftaran:\n- Nama: ${regData.name}\n- Kode Registrasi: ${regData.registration_code}\n- Program/Paket: ${regData.packageName}${regData.seat_numbers && regData.seat_numbers.length ? `\n- Kursi: ${regData.seat_numbers.map((n) => `${(regData.category || selectedSeat?.cat || "x").charAt(0).toUpperCase()}-${n + 1}`).join(" + ")}` : ""}\n- Total Transfer: Rp ${parseFloat(regData.total_price).toLocaleString("id-ID")}\n\nSaya lampirkan bukti pembayaran saya di halaman website. Mohon bantuannya untuk melakukan verifikasi tiket. Terima kasih!`;

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
              {seatLabels && (
                <span style={{ width: "100%", background: "#e0f2fe", border: "1.5px solid #38bdf8", borderRadius: "8px", padding: "6px 10px", fontWeight: 800, color: "#0369a1", textAlign: "center" }}>
                  💺 Kursi pilihanmu: {seatLabels}
                </span>
              )}
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
            <div style={{ padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: "12px", padding: "12px 14px", marginBottom: "14px" }}>
                <CheckCircle size={20} style={{ color: "#059669", flexShrink: 0 }} />
                <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#065f46", margin: 0 }}>
                  Kursi sudah dikunci untukmu. Selesaikan pembayaran di panel sebelah →
                </p>
              </div>
              <div style={{ background: "rgba(29, 78, 216, 0.06)", border: "1px dashed var(--color-primary)", borderRadius: "10px", padding: "10px 12px", marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.5px", color: "var(--text-muted)", margin: "0 0 4px 0" }}>KODE REGISTRASI</p>
                <p style={{ fontSize: "17px", fontWeight: 800, color: "var(--color-primary)", margin: 0, letterSpacing: "0.5px" }}>{regData.registration_code}</p>
                {seatLabels && (
                  <p style={{ fontSize: "13px", margin: "6px 0 0 0" }}>
                    💺 Kursi: <b style={{ color: "#0369a1" }}>{seatLabels}</b> <span style={{ color: "var(--text-muted)" }}>(dikunci selama verifikasi)</span>
                  </p>
                )}
              </div>
              <button className="btn btn-secondary" style={{ width: "100%", fontSize: "13px", padding: "9px" }} onClick={handleCheckTicket}>
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
                <div style={{ background: "#d1fae5", color: "#065f46", padding: "14px", borderRadius: "10px", fontSize: "14px", display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", fontWeight: 700 }}>
                  <CheckCircle size={18} /> Bukti transfer TERSIMPAN di sistem.
                </div>
              ) : (
                <form onSubmit={handleSubmitProof} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" }}>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange} 
                    style={{ fontSize: "13px", width: "100%" }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: "13px", fontSize: "15px", width: "100%", fontWeight: 800 }} disabled={uploading || !selectedFile}>
                    <Upload size={18} /> {uploading ? "Menyimpan Bukti Transfer..." : "SUBMIT — Simpan Bukti Transfer"}
                  </button>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>
                    Foto otomatis dikompres. Setelah submit, lanjut konfirmasi ke admin via WhatsApp.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ===== HALAMAN TERIMA KASIH (muncul setelah SUBMIT) ===== */}
        {regData && submitted && (
          <div id="thanks-section" className="glass-card" style={{ background: "rgba(255,255,255,0.95)", gridColumn: "1 / -1", textAlign: "center", padding: "40px 28px", border: "2px solid #34d399" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#d1fae5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              <CheckCircle size={38} />
            </div>
            <h3 style={{ color: "var(--color-primary)", marginBottom: "10px" }}>Terima Kasih, {regData.name}! 🎉</h3>
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--text-dark)", maxWidth: "460px", margin: "0 auto 22px auto" }}>
              Pemesanan tiket Anda <b>dalam proses verifikasi</b>. Silakan melakukan
              <b> konfirmasi pembayaran</b> melalui link berikut agar admin segera memeriksa bukti transfer Anda:
            </p>
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-whatsapp" 
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 30px", fontSize: "16px", fontWeight: 800 }}
            >
              <Send size={18} /> Konfirmasi Pembayaran ke Admin
            </a>
            <div style={{ marginTop: "26px", fontSize: "13px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span>Kode Registrasi: <b style={{ color: "var(--color-primary)" }}>{regData.registration_code}</b></span>
              {seatLabels && <span>Kursi Anda: <b style={{ color: "#0369a1" }}>{seatLabels}</b> (dikunci selama verifikasi)</span>}
              <span>Status saat ini: <b style={{ color: "#7c3aed" }}>Menunggu verifikasi admin</b></span>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: "24px", padding: "10px 22px" }} onClick={handleCheckTicket}>
              Lihat Detail Status Tiket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

