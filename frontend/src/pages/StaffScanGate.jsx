import { API_BASE } from "../apiConfig";
import React, { useState, useEffect } from "react";
import { Compass, ShieldAlert, Check, LogOut, Camera, Clipboard, ShieldCheck, Clock } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function StaffScanGate() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotErr, setForgotErr] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setForgotErr("");
    setForgotMsg("");
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal meminta OTP reset password.");
      setForgotStep(2);
      setForgotMsg(data.message);
    } catch (err) {
      setForgotErr(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyResetPassword = async (e) => {
    e.preventDefault();
    setForgotErr("");
    setForgotMsg("");
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp_code: forgotOtp,
          new_password: forgotNewPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui password.");
      setForgotMsg(data.message);
      if (data.username) setUsername(data.username);
      setPassword(forgotNewPass);
      setTimeout(() => {
        setShowForgotModal(false);
      }, 2500);
    } catch (err) {
      setForgotErr(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  
  // Scanner state
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  
  // Scan history (local session)
  const [scanHistory, setScanHistory] = useState([]);

  // Helper: get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("dutaquran_staff_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoadingLogin(true);

    try {
      const res = await fetch(`${API_BASE}/api/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal masuk");

      localStorage.setItem("dutaquran_staff_token", data.token);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("dutaquran_staff_token");
    setScanResult(null);
    setScanHistory([]);
  };

  useEffect(() => {
    const token = localStorage.getItem("dutaquran_staff_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // HTML5 QR Code Scanner setup
  useEffect(() => {
    if (!isLoggedIn) return;

    // Use a small timeout to make sure DOM container is rendered
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "staff-qr-reader", 
        { 
          fps: 10, 
          qrbox: { width: 220, height: 220 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0
        }, 
        /* verbose= */ false
      );

      const onScanSuccess = async (decodedText) => {
        if (scanning) return; // Prevent double calls during fetch
        setScanning(true);
        setScanResult(null);
        
        try {
          const res = await fetch(`${API_BASE}/api/admin/scan-checkin`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ registration_code: decodedText })
          });
          const data = await res.json();
          setScanResult(data);
          
          if (res.ok && data.success) {
            // Add to local scan history
            setScanHistory(prev => [
              { 
                name: data.guest.name, 
                package_name: data.guest.package_name,
                whatsapp: data.guest.whatsapp,
                time: new Date().toLocaleTimeString("id-ID"),
                status: "success"
              },
              ...prev
            ]);
          }
        } catch (err) {
          setScanResult({ success: false, error: "System Error", message: err.message });
        } finally {
          setScanning(false);
        }
      };

      const onScanFailure = (error) => {
        // Silent failure is fine
      };

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear().catch(err => console.error("Gagal membersihkan scanner:", err));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  // Handle manual backup check-in
  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    if (!manualCode.trim() || scanning) return;
    setScanning(true);
    setScanResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/scan-checkin`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ registration_code: manualCode.trim() })
      });
      const data = await res.json();
      setScanResult(data);
      
      if (res.ok && data.success) {
        // Add to local scan history
        setScanHistory(prev => [
          { 
            name: data.guest.name, 
            package_name: data.guest.package_name,
            whatsapp: data.guest.whatsapp,
            time: new Date().toLocaleTimeString("id-ID"),
            status: "success"
          },
          ...prev
        ]);
        setManualCode(""); // Reset manual input on success
      }
    } catch (err) {
      setScanResult({ success: false, error: "System Error", message: err.message });
    } finally {
      setScanning(false);
    }
  };

  // Login Form Panel
  if (!isLoggedIn) {
    return (
      <>
      <div className="container" style={{ padding: "80px 24px", display: "flex", justifyContent: "center" }}>
        <div className="glass-card staff-login-card" style={{ maxWidth: "400px", width: "100%", padding: "40px", background: "rgba(255, 255, 255, 0.85)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ background: "rgba(29, 78, 216, 0.08)", width: "56px", height: "56px", borderRadius: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", marginBottom: "16px" }}>
              <ShieldCheck size={26} />
            </div>
            <h2>Staff Gate Portal</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Masuk khusus staff penerima tamu untuk pemindaian tiket.</p>
          </div>

          {loginError && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", padding: "12px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Username Staff</label>
              <input 
                type="text" 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username staff"
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Password Akses Staff</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password staff"
                required 
              />
            </div>
            
            <div style={{ textAlign: "right", marginBottom: "16px" }}>
              <button 
                type="button" 
                onClick={() => { setShowForgotModal(true); setForgotStep(1); setForgotMsg(""); setForgotErr(""); setForgotEmail(""); setForgotOtp(""); setForgotNewPass(""); }}
                style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "13px", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
              >
                Lupa Password Staff?
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loadingLogin}>
              {loadingLogin ? "Memproses..." : "Buka Pintu Scan (Gate)"}
            </button>
          </form>
        </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1100, padding: "20px"
        }} onClick={() => setShowForgotModal(false)}>
          <div className="glass-card" style={{ background: "white", padding: "28px", maxWidth: "440px", width: "100%", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "8px", color: "var(--color-primary)", textAlign: "center" }}>🔐 Reset Password Staff</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", marginBottom: "20px" }}>
              {forgotStep === 1 ? "Masukkan Email Pribadi terdaftar untuk menerima Kode OTP Reset." : "Masukkan Kode OTP & Password Baru Anda."}
            </p>

            {forgotMsg && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#d1fae5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: "13px", marginBottom: "16px" }}>
                {forgotMsg}
              </div>
            )}

            {forgotErr && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", marginBottom: "16px" }}>
                {forgotErr}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendForgotOtp}>
                <div className="form-group">
                  <label className="form-label">Email Pribadi Terdaftar</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Contoh: admin@dutaqu.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForgotModal(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={forgotLoading}>
                    {forgotLoading ? "Kirim..." : "Kirim OTP Reset"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyResetPassword}>
                <div className="form-group">
                  <label className="form-label">Kode OTP (6 Digit)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Masukkan 6 angka OTP"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label className="form-label">Password Baru</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Minimal 6 karakter"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setForgotStep(1)}>
                    Kembali
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={forgotLoading}>
                    {forgotLoading ? "Memproses..." : "Perbarui Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </div>
      </>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Header Staff */}
      <div className="staff-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "20px", marginBottom: "32px" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Compass className="animate-spin-slow" size={28} style={{ color: "var(--color-accent)" }} /> 
            Staff Gate Portal
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Arahkan kamera HP Anda ke QR Code e-tiket peserta untuk check-in.</p>
        </div>
        <div className="staff-header-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-primary)", background: "rgba(29, 78, 216, 0.08)", padding: "6px 12px", borderRadius: "8px" }}>
            ✓ {scanHistory.length} tamu hari ini
          </span>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "14px" }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>

      <div className="staff-scan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "32px", alignItems: "start" }}>
        {/* Left Column: Camera Scanner */}
        <div className="glass-card" style={{ background: "white", padding: "24px", textAlign: "center" }}>
          <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            <Camera size={18} /> Kamera Scanner
          </h3>
          
          {/* HTML5 QR Reader Container */}
          <div 
            id="staff-qr-reader" 
            style={{ 
              width: "100%", 
              maxWidth: "350px", 
              margin: "0 auto 20px auto", 
              borderRadius: "12px", 
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.1)"
            }}
          ></div>

          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
            Pastikan pencahayaan layar HP tamu cukup terang.
          </p>
        </div>

        {/* Right Column: Scan Results, Manual Fallback, and History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Scan Results Board */}
          <div className="glass-card" style={{ background: "white", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "20px" }}>
              Status Scan Terakhir
            </h3>

            {scanning && (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                Memproses tiket...
              </div>
            )}

            {!scanning && !scanResult && (
              <div style={{ 
                border: "2px dashed rgba(0,0,0,0.06)", 
                borderRadius: "12px", 
                padding: "40px", 
                textAlign: "center", 
                color: "var(--text-muted)",
                fontSize: "14px"
              }}>
                Belum ada tiket yang discan. Arahkan kamera ke QR Code.
              </div>
            )}

            {!scanning && scanResult && (
              <div style={{
                background: scanResult.success ? "#d1fae5" : scanResult.error === "Tiket Sudah Terpakai!" ? "#fef3c7" : "#fee2e2",
                border: "1px solid",
                borderColor: scanResult.success ? "#a7f3d0" : scanResult.error === "Tiket Sudah Terpakai!" ? "#fde68a" : "#fca5a5",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "left"
              }}>
                {scanResult.success ? (
                  <div>
                    <h4 style={{ color: "#065f46", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Check size={18} style={{ color: "#10b981" }} /> CHECK-IN BERHASIL!
                    </h4>
                    <div style={{ fontSize: "14px", color: "#047857", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div><strong>Nama Tamu:</strong> {scanResult.guest.name}</div>
                      <div><strong>Paket:</strong> {scanResult.guest.package_name}</div>
                      <div><strong>WhatsApp:</strong> {scanResult.guest.whatsapp}</div>
                      <div><strong>Jam Check-In:</strong> {new Date(scanResult.guest.checked_in_at).toLocaleTimeString("id-ID")}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: scanResult.error === "Tiket Sudah Terpakai!" ? "#b45309" : "#b91c1c", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <ShieldAlert size={18} /> {scanResult.error}
                    </h4>
                    <p style={{ fontSize: "13px", color: scanResult.error === "Tiket Sudah Terpakai!" ? "#d97706" : "#c2410c" }}>
                      {scanResult.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="glass-card" style={{ background: "white", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clipboard size={18} /> Cek Manual (Darurat)
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Jika kamera bermasalah atau barcode tidak terbaca, masukkan kode tiket manual di bawah ini:
            </p>
            <form onSubmit={handleManualCheckIn} style={{ display: "flex", gap: "10px" }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Contoh: REG-20260711-XXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                required
                disabled={scanning}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }} disabled={scanning || !manualCode.trim()}>
                Check-in
              </button>
            </form>
          </div>

          {/* Scan History (Session) */}
          {scanHistory.length > 0 && (
            <div className="glass-card" style={{ background: "white", padding: "24px" }}>
              <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} /> Riwayat Scan Sesi Ini ({scanHistory.length})
              </h3>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {scanHistory.map((entry, idx) => (
                  <div key={idx} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "10px 0", 
                    borderBottom: idx < scanHistory.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none"
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>{entry.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{entry.package_name}</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#059669" }}>
                      {entry.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}