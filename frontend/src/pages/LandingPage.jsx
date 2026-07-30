import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import { CheckCircle2, Users, BookOpen, Heart, ShieldAlert, Calendar, Clock, MapPin, Smile, HelpCircle, AlertCircle, XCircle } from "lucide-react";
import { API_BASE } from "../apiConfig";

export default function LandingPage({ onSelectPackage, setPage }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/packages`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data paket.");
        return res.json();
      })
      .then((data) => {
        setPackages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Hero setPage={setPage} />

      {/* Tentang Seminar / Pain Points Section */}
      <section id="about-section" style={{ padding: "80px 0", background: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(12, 36, 80, 0.05)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "1.5px", color: "var(--color-accent)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Refleksi Pernikahan
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "var(--color-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
              Apakah Rumah Tanggamu benar-benar baik-baik saja?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "18px", fontWeight: "600", marginBottom: "32px" }}>
              Pernah Merasakan Ini?
            </p>
          </div>

          {/* Pain Points List */}
          <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto 48px auto", padding: "32px", background: "white" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "20px" }}>
              <li style={{ display: "flex", gap: "16px", alignItems: "flex-start", fontSize: "16px" }}>
                <AlertCircle size={22} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <span>Rumah tangga terlihat baik-baik saja, tapi entah kenapa tidak lagi terasa hangat.</span>
              </li>
              <li style={{ display: "flex", gap: "16px", alignItems: "flex-start", fontSize: "16px" }}>
                <AlertCircle size={22} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <span>Sudah berusaha menjadi pasangan yang baik, tetapi merasa tidak dihargai.</span>
              </li>
              <li style={{ display: "flex", gap: "16px", alignItems: "flex-start", fontSize: "16px" }}>
                <AlertCircle size={22} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <span>Sering salah paham meski membahas hal-hal kecil.</span>
              </li>
              <li style={{ display: "flex", gap: "16px", alignItems: "flex-start", fontSize: "16px" }}>
                <AlertCircle size={22} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <span>Merasa pasangan berubah dan semakin sulit dipahami.</span>
              </li>
              <li style={{ display: "flex", gap: "16px", alignItems: "flex-start", fontSize: "16px" }}>
                <AlertCircle size={22} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <span>Ingin membangun keluarga yang bahagia, tetapi tidak tahu harus memulai dari mana.</span>
              </li>
              <li style={{ display: "flex", gap: "16px", alignItems: "flex-start", fontSize: "16px" }}>
                <AlertCircle size={22} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                <span>Menjelang pernikahan namun masih memiliki banyak pertanyaan dan kekhawatiran.</span>
              </li>
            </ul>
            <div style={{ marginTop: "28px", textAlign: "center", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "24px" }}>
              <p style={{ fontStyle: "italic", color: "var(--color-primary)", fontWeight: "600", fontSize: "16px" }}>
                "Jika salah satunya pernah Anda rasakan, Anda tidak sendirian."
              </p>
            </div>
          </div>

          {/* Bukan Karena Kurang Cinta Section */}
          <div className="glass-card" style={{ 
            maxWidth: "800px", 
            margin: "0 auto 64px auto", 
            padding: "40px", 
            background: "linear-gradient(135deg, rgba(12, 36, 80, 0.03) 0%, rgba(37, 99, 235, 0.03) 100%)", 
            border: "1px dashed var(--color-accent)",
            textAlign: "center" 
          }}>
            <h3 style={{ fontSize: "22px", color: "var(--color-primary)", marginBottom: "16px", fontWeight: "700" }}>
              Bukan Karena Kurang Cinta
            </h3>
            <p style={{ color: "var(--text-dark)", fontSize: "16px", lineHeight: "1.7", marginBottom: "20px" }}>
              Banyak pasangan tidak kekurangan cinta. Mereka hanya belum belajar cara memahami, mengungkapkan, dan merawat cinta dengan benar.
            </p>
            <p style={{ color: "var(--color-accent)", fontSize: "16px", fontWeight: "600", lineHeight: "1.7" }}>
              Karena pernikahan yang bahagia tidak dibangun oleh perasaan semata, tetapi oleh ilmu, kesabaran, komunikasi, dan kedekatan kepada Sang Maha Cinta.
            </p>
          </div>

          {/* Quote Cards Section */}
          <div style={{ marginTop: "64px" }}>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
                Mungkin Anda Pernah Berpikir...
              </p>
            </div>
            
            <div className="quote-grid">
              <div className="quote-card">
                <p className="quote-text">"Saya sudah berjuang selama ini, tapi kenapa pasangan saya tidak peka?"</p>
              </div>
              <div className="quote-card">
                <p className="quote-text">"Kami jarang bertengkar, tapi kenapa rasanya semakin jauh?"</p>
              </div>
              <div className="quote-card">
                <p className="quote-text">"Setiap kami mencoba komunikasi kenapa malah berantem?"</p>
              </div>
              <div className="quote-card">
                <p className="quote-text">"Apakah hubungan yang sehat memang sesulit ini?"</p>
              </div>
              <div className="quote-card">
                <p className="quote-text">"Kenapa orang yang dulu begitu saya cintai sekarang terasa sulit dipahami?"</p>
              </div>
              <div className="quote-card">
                <p className="quote-text">"Bagaimana cara menjaga cinta agar tidak hanya indah di awal pernikahan?"</p>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "48px" }}>
              <p style={{ fontSize: "18px", color: "var(--color-primary)", fontWeight: "700" }}>
                Seminar ini dirancang untuk menjawab pertanyaan-pertanyaan tersebut.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Narasumber Utama Section */}
      <section id="speakers-section" style={{ padding: "80px 0", background: "transparent", borderBottom: "1px solid rgba(12, 36, 80, 0.05)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "1.5px", color: "var(--color-accent)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Narasumber Utama
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "var(--color-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
              Belajar Langsung dari Praktisi & Pembimbing Pernikahan
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "800px", margin: "0 auto", fontSize: "16px" }}>
              Narasumber kami siap membagikan ilmu, pengalaman, serta studi kasus nyata untuk membangun pondasi keluarga sakinah.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px"
          }}>
            {/* Speaker 1 */}
            <div className="glass-card" style={{ background: "white", padding: "24px", textAlign: "center" }}>
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0c2450 0%, #2563c7 100%)",
                margin: "0 auto 20px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "36px",
                fontWeight: "bold"
              }}>
                AR
              </div>
              <h3 style={{ fontSize: "20px", color: "var(--color-primary)", marginBottom: "6px" }}>Ustadz Abdul Rohman</h3>
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "12px" }}>Ketua Program Duta Qur'an</p>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                Fokus pada penyampaian materi Visi Pernikahan Berkah, manajemen niat, serta landasan teologis pembentukan keluarga sakinah.
              </p>
            </div>

            {/* Speaker 2 */}
            <div className="glass-card" style={{ background: "white", padding: "24px", textAlign: "center" }}>
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0c2450 0%, #2563c7 100%)",
                margin: "0 auto 20px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "36px",
                fontWeight: "bold"
              }}>
                AH
              </div>
              <h3 style={{ fontSize: "20px", color: "var(--color-primary)", marginBottom: "6px" }}>Ustazah Alya Hijab</h3>
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "12px" }}>Pakar Psikologi Pasangan</p>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                Ahli dalam menjembatani cara berkomunikasi, memahami perbedaan psikologi laki-laki dan perempuan, serta bahasa kasih.
              </p>
            </div>

            {/* Speaker 3 */}
            <div className="glass-card" style={{ background: "white", padding: "24px", textAlign: "center" }}>
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0c2450 0%, #2563c7 100%)",
                margin: "0 auto 20px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "36px",
                fontWeight: "bold"
              }}>
                UH
              </div>
              <h3 style={{ fontSize: "20px", color: "var(--color-primary)", marginBottom: "6px" }}>Ustadz Hisyam</h3>
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "12px" }}>Mentor & Konselor Keluarga</p>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                Berpengalaman mendampingi ratusan pasangan dalam resolusi konflik rumah tangga dan implementasi sakinah harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda & Rundown Section */}
      <section id="agenda-section" style={{ padding: "80px 0", background: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(12, 36, 80, 0.05)" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "1.5px", color: "var(--color-accent)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Rundown Seminar
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "var(--color-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
              Agenda Kegiatan Pembelajaran
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
              Jadwal sesi seminar interaktif sehari penuh yang dirancang terstruktur demi kenyamanan belajar Anda.
            </p>
          </div>

          <div className="glass-card" style={{ background: "white", padding: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Row 1 */}
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" }}>
                <div style={{ fontWeight: "800", color: "var(--color-accent)", fontSize: "15px", whiteSpace: "nowrap", width: "120px" }}>
                  07.30 - 08.00
                </div>
                <div>
                  <h4 style={{ color: "var(--color-primary)", fontSize: "16px" }}>Registrasi &amp; Penukaran Tiket QR</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Verifikasi e-tiket oleh panitia, pembagian Seminar Kit dan tempat duduk.</p>
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" }}>
                <div style={{ fontWeight: "800", color: "var(--color-accent)", fontSize: "15px", whiteSpace: "nowrap", width: "120px" }}>
                  08.00 - 10.15
                </div>
                <div>
                  <h4 style={{ color: "var(--color-primary)", fontSize: "16px" }}>Sesi 1: Memahami Bahasa &amp; Cara Pandang Pasangan</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Dipimpin oleh Ustadz Abdul Rohman. Membedah mindset dasar suami-istri.</p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="rundown-item">
                <div className="rundown-time">
                  09.30 - 11.45
                </div>
                <div>
                  <h4 style={{ color: "var(--color-primary)", fontSize: "16px" }}>Sesi 2: Menjembatani Komunikasi &amp; Konflik Pasangan</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Dipimpin oleh Ustazah Alya Hijab. Sesi praktis mengenai cara berdiskusi tanpa emosi dan meredam ketegangan.</p>
                </div>
              </div>

              {/* Row 4 */}
              <div className="rundown-item">
                <div className="rundown-time">
                  11.45 - 13.00
                </div>
                <div>
                  <h4 style={{ color: "var(--color-primary)", fontSize: "16px" }}>Istirahat, Shalat &amp; Makan Siang (ISHOMA)</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Waktu istirahat santai, shalat berjamaah, dan makan siang bersama pasangan.</p>
                </div>
              </div>

              {/* Row 5 */}
              <div className="rundown-item">
                <div className="rundown-time">
                  13.00 - 13.30
                </div>
                <div>
                  <h4 style={{ color: "var(--color-primary)", fontSize: "16px" }}>Refleksi Interaktif &amp; Games Berpasangan</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Ice breaking dan latihan pengenalan bahasa cinta pasangan secara langsung melalui lembar aktivitas.</p>
                </div>
              </div>

              {/* Row 6 */}
              <div className="rundown-item" style={{ borderBottom: "none", paddingBottom: "0" }}>
                <div className="rundown-time">
                  13.30 - 16.00
                </div>
                <div>
                  <h4 style={{ color: "var(--color-primary)", fontSize: "16px" }}>Sesi 3: Menumbuhkan Rumah Tangga Sakinah &amp; Penutup</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Dipimpin oleh Ustadz Hisyam. Diakhiri dengan sesi tanya jawab interaktif dan foto bersama.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Detail Acara Summary Section */}
      <section id="details-section" style={{ padding: "80px 0", background: "transparent", borderBottom: "1px solid rgba(12, 36, 80, 0.05)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "1.5px", color: "var(--color-accent)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Detail Acara
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "var(--color-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
              Catat Waktunya, Hadir Bersama Pasangan
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px"
          }}>
            <div className="glass-card" style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "24px" }}>
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>TANGGAL</p>
              <h4 style={{ fontSize: "18px", color: "var(--color-primary)" }}>Sabtu, 18 Juli 2026</h4>
            </div>
            <div className="glass-card" style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "24px" }}>
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>WAKTU</p>
              <h4 style={{ fontSize: "18px", color: "var(--color-primary)" }}>07.30 – 16.00 WIB</h4>
            </div>
            <div className="glass-card" style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "24px" }}>
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>LOKASI</p>
              <h4 style={{ fontSize: "18px", color: "var(--color-primary)" }}>Segera Diumumkan</h4>
            </div>
            <div className="glass-card" style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "24px" }}>
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>PESERTA</p>
              <h4 style={{ fontSize: "18px", color: "var(--color-primary)" }}>Pasangan & Calon Pengantin</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Apa yang Akan Anda Bawa Pulang Section */}
      <section id="benefits-section" style={{ padding: "80px 0", background: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(12, 36, 80, 0.05)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "1.5px", color: "var(--color-accent)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Manfaat Kegiatan
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "var(--color-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
              Apa yang Akan Anda Bawa Pulang?
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "800px", margin: "0 auto", fontSize: "16px" }}>
              Seminar ini didesain agar Anda tidak pulang dengan tangan kosong, melainkan membawa bekal praktis untuk hubungan yang lebih hangat.
            </p>
          </div>

          <div className="glass-card" style={{ maxWidth: "750px", margin: "0 auto", padding: "32px", background: "rgba(255,255,255,0.9)" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "18px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px", color: "var(--text-dark)" }}>
                <span style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold" }}>✓</span>
                <span>Cara memahami kebutuhan emosional pasangan</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px", color: "var(--text-dark)" }}>
                <span style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold" }}>✓</span>
                <span>Teknik komunikasi yang membuat pasangan merasa didengar</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px", color: "var(--text-dark)" }}>
                <span style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold" }}>✓</span>
                <span>Cara menyelesaikan konflik tanpa saling menyakiti</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px", color: "var(--text-dark)" }}>
                <span style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold" }}>✓</span>
                <span>Langkah membangun kembali kehangatan dalam hubungan</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px", color: "var(--text-dark)" }}>
                <span style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold" }}>✓</span>
                <span>Perspektif Islam tentang cinta, sakinah, dan keluarga bahagia</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px", color: "var(--text-dark)" }}>
                <span style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold" }}>✓</span>
                <span>Lembar refleksi yang bisa langsung dipraktikkan bersama pasangan</span>
              </li>
            </ul>
          </div>

          {/* Kenapa Seminar Ini Berbeda Section */}
          <div style={{ marginTop: "80px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h3 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", color: "var(--color-primary)", fontWeight: "700" }}>
                Kenapa Seminar Ini Berbeda?
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "8px" }}>
                Kami memadukan pendekatan psikologi modern dan nilai-nilai spiritual dalam format yang sangat praktis.
              </p>
            </div>

            <div className="compare-grid" style={{ maxWidth: "900px", margin: "0 auto" }}>
              {/* What we don't discuss */}
              <div className="compare-card" style={{ borderTop: "4px solid #ef4444" }}>
                <h4 className="compare-card-title" style={{ color: "#b91c1c" }}>
                  <XCircle size={20} /> Bukan Membahas:
                </h4>
                <ul className="compare-list">
                  <li className="compare-item">
                    <span style={{ color: "#ef4444", fontWeight: "bold" }}>❌</span>
                    <span>Cara mendapatkan pasangan</span>
                  </li>
                  <li className="compare-item">
                    <span style={{ color: "#ef4444", fontWeight: "bold" }}>❌</span>
                    <span>Romantisme sesaat</span>
                  </li>
                  <li className="compare-item">
                    <span style={{ color: "#ef4444", fontWeight: "bold" }}>❌</span>
                    <span>Teori hubungan yang sulit dipraktikkan</span>
                  </li>
                </ul>
              </div>

              {/* What we do discuss */}
              <div className="compare-card" style={{ borderTop: "4px solid #10b981" }}>
                <h4 className="compare-card-title" style={{ color: "#065f46" }}>
                  <CheckCircle2 size={20} style={{ color: "#10b981" }} /> Tetapi Membahas:
                </h4>
                <ul className="compare-list">
                  <li className="compare-item">
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>✔️</span>
                    <span>Cara mempertahankan cinta setelah menikah</span>
                  </li>
                  <li className="compare-item">
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>✔️</span>
                    <span>Cara memahami pasangan dengan lebih dalam</span>
                  </li>
                  <li className="compare-item">
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>✔️</span>
                    <span>Cara membangun rumah tangga yang tenang dan bertumbuh</span>
                  </li>
                  <li className="compare-item">
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>✔️</span>
                    <span>Cara menghadirkan Allah sebagai pusat cinta dalam keluarga</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilihan Paket Section */}
      <section id="packages-section" style={{ padding: "80px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "56px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "1.5px", color: "var(--color-accent)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Investasi Cinta
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "var(--color-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
              Jangan Tunggu Sampai Hubungan Kehilangan Kehangatannya
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "700px", margin: "0 auto 32px auto", fontSize: "16px" }}>
              Belajar merawat cinta sebelum masalah menjadi semakin besar. Daftar Sekarang dan Bertumbuh Bersama Sang Maha Cinta.
            </p>
          </div>

          {/* Benefits Value Table Card */}
          <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto 56px auto", padding: "36px", background: "white", textAlign: "left" }}>
            <h3 style={{ fontSize: "20px", color: "var(--color-primary)", marginBottom: "20px", textAlign: "center", fontWeight: "700" }}>
              Nilai yang Akan Anda Dapatkan
            </h3>
            
            <div style={{ overflowX: "auto" }}>
              <table className="value-table">
                <thead>
                  <tr>
                    <th>Fasilitas &amp; Benefit</th>
                    <th style={{ textAlign: "right" }}>Nilai Manfaat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Seminar Intensif 1 Hari</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>Rp250.000</td>
                  </tr>
                  <tr>
                    <td>Materi &amp; Modul Digital</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>Rp150.000</td>
                  </tr>
                  <tr>
                    <td>Sesi Tanya Jawab dengan Narasumber</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>Rp200.000</td>
                  </tr>
                  <tr>
                    <td>Lembar Refleksi Pasangan</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>Rp100.000</td>
                  </tr>
                  <tr>
                    <td>Konsultasi &amp; Insight Pernikahan</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>Rp300.000</td>
                  </tr>
                  <tr>
                    <td>Networking &amp; Komunitas Pembelajar</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>Rp150.000</td>
                  </tr>
                  <tr>
                    <td>E-Sertifikat</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>Rp50.000</td>
                  </tr>
                  <tr style={{ background: "rgba(37, 99, 235, 0.04)" }}>
                    <td><strong>Total Nilai Manfaat</strong></td>
                    <td style={{ textAlign: "right", color: "var(--color-primary)", fontWeight: "800" }}><strong>Rp1.200.000</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Price Normal & Discount Display Box */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
              gap: "20px", 
              marginTop: "28px",
              paddingTop: "28px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              textAlign: "center" 
            }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Harga Normal</p>
                <p style={{ fontSize: "28px", fontWeight: "800", color: "#ef4444", textDecoration: "line-through", marginTop: "4px" }}>Rp1.200.000</p>
              </div>
              <div style={{ background: "rgba(16, 185, 129, 0.05)", borderRadius: "12px", padding: "12px" }}>
                <p style={{ fontSize: "12px", fontWeight: "800", color: "#059669", textTransform: "uppercase" }}>Harga Spesial Seminar</p>
                <p style={{ fontSize: "24px", fontWeight: "800", color: "#059669", marginTop: "4px" }}>Rp200.000 <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--text-muted)" }}>/ orang</span></p>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-primary)", marginTop: "2px" }}>atau <span style={{ fontSize: "18px", fontWeight: "800" }}>Rp350.000</span> / pasangan</p>
              </div>
            </div>

            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6", maxWidth: "650px", margin: "0 auto" }}>
                Satu sesi konsultasi pernikahan bisa mencapai ratusan ribu hingga jutaan rupiah. Di seminar ini, Anda mendapatkan bekal yang dapat diterapkan seumur hidup hanya mulai <strong>Rp350.000</strong>.
              </p>
            </div>
          </div>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "40px" }}>
              <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid rgba(29, 78, 216, 0.15)", borderTopColor: "var(--color-accent)", borderRadius: "50%" }}></div>
              <p style={{ fontWeight: 600, color: "var(--text-muted)" }}>Memuat data paket...</p>
            </div>
          )}

          {error && (
            <div className="glass-card" style={{ maxWidth: "500px", margin: "0 auto", padding: "24px", borderColor: "#fca5a5", background: "rgba(254, 226, 226, 0.8)", display: "flex", alignItems: "center", gap: "12px" }}>
              <ShieldAlert className="text-danger" style={{ color: "#dc2626" }} size={28} />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontWeight: 700, color: "#991b1b" }}>Error</p>
                <p style={{ fontSize: "14px", color: "#b91c1c" }}>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
              justifyContent: "center"
            }}>
              {packages.filter(pkg => pkg.id === 1 || pkg.id === 2).map((pkg) => {
                let parsedFeatures = [];
                try {
                  parsedFeatures = typeof pkg.features === "string" ? JSON.parse(pkg.features) : pkg.features;
                } catch (e) {
                  parsedFeatures = Array.isArray(pkg.features) ? pkg.features : [];
                }

                return (
                  <div key={pkg.id} className="glass-card" style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "32px",
                    textAlign: "left",
                    background: "rgba(255, 255, 255, 0.95)"
                  }}>
                    <div>
                      <h3 style={{ fontSize: "22px", color: "var(--color-primary)", marginBottom: "12px" }}>{pkg.name}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "14px", minHeight: "60px", marginBottom: "20px" }}>{pkg.description}</p>
                      
                      {/* Price tag */}
                      <div style={{ marginBottom: "24px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-muted)" }}>Rp</span>
                        <span style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-dark)", marginLeft: "4px" }}>
                          {parseFloat(pkg.price).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Benefit list */}
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px", marginBottom: "32px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px", letterSpacing: "0.5px" }}>Fasilitas & Benefit:</p>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                          {parsedFeatures.map((feat, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-dark)" }}>
                              <CheckCircle2 size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary" 
                      style={{ width: "100%", padding: "12px" }}
                      onClick={() => onSelectPackage(pkg)}
                    >
                      Daftar Sekarang
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
