import React from "react";

/**
 * ErrorBoundary — jaring pengaman React.
 * Kalau komponen halaman manapun throw saat render ( penyebab "halaman putih" ),
 * tampilkan layar pemulihan ramah + tombol muat ulang, BUKAN layar kosong.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => {
    try {
      // buang cache app lama yang mungkin rusak sebelum reload
      localStorage.removeItem("dutaqu_packages_cache_v1");
    } catch (e) { /* abaikan */ }
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#f1f5f9" }}>
          <div style={{ maxWidth: "420px", background: "white", borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 12px 32px rgba(12,36,80,0.12)" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>⚠️</div>
            <h2 style={{ color: "#0c2450", marginBottom: "8px", fontSize: "20px" }}>Halaman Tertahan, Bukan Hilang</h2>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
              Terjadi gangguan kecil saat memuat halaman (biasanya karena data lama di cache HP).
              Data pendaftaran Anda aman. Tekan tombol di bawah untuk memuat ulang.
            </p>
            <button
              onClick={this.handleReload}
              style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: "12px", padding: "13px 28px", fontSize: "15px", fontWeight: 800, cursor: "pointer" }}
            >
              🔄 Muat Ulang Halaman
            </button>
            <p style={{ color: "#94a3b8", fontSize: "11.5px", marginTop: "16px", wordBreak: "break-all" }}>
              Kode error: {String(this.state.error.message || this.state.error).slice(0, 120)}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
