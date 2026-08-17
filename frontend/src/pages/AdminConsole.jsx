import { API_BASE } from "../apiConfig";
import React, { useState, useEffect } from "react";
import { LogIn, Users, CreditCard, Check, X, ShieldAlert, Camera, PlusCircle, RefreshCw, Trash2, Tag, Key, UserCheck, BarChart3, Clock, DollarSign, UserX } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function AdminConsole() {
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
  const [demoOtp, setDemoOtp] = useState("");

  // Admin Direct User Password Reset State
  const [resetUserModal, setResetUserModal] = useState(null);
  const [directPassVal, setDirectPassVal] = useState("");
  const [directPassMsg, setDirectPassMsg] = useState("");
  const [directPassErr, setDirectPassErr] = useState("");
  const [directPassLoading, setDirectPassLoading] = useState(false);

  // User Email Edit Modal State
  const [editUserModal, setEditUserModal] = useState(null);
  const [editEmailVal, setEditEmailVal] = useState("");
  const [editEmailMsg, setEditEmailMsg] = useState("");
  const [editEmailErr, setEditEmailErr] = useState("");
  const [editEmailLoading, setEditEmailLoading] = useState(false);

  const handleEditUserEmail = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    setEditEmailErr("");
    setEditEmailMsg("");
    setEditEmailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/edit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: editUserModal.id,
          role: editUserModal.role,
          email: editEmailVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal meng-edit email user.");
      setEditEmailMsg(data.message);
      fetchDashboardData();
      setTimeout(() => {
        setEditUserModal(null);
        setEditEmailMsg("");
      }, 1800);
    } catch (err) {
      setEditEmailErr(err.message);
    } finally {
      setEditEmailLoading(false);
    }
  };


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

  const handleAdminDirectResetUser = async (e) => {
    e.preventDefault();
    if (!resetUserModal) return;
    setDirectPassErr("");
    setDirectPassMsg("");
    setDirectPassLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/reset`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: resetUserModal.id,
          role: resetUserModal.role,
          new_password: directPassVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal me-reset password user.");
      setDirectPassMsg(data.message);
      setDirectPassVal("");
      setTimeout(() => {
        setResetUserModal(null);
        setDirectPassMsg("");
      }, 2000);
    } catch (err) {
      setDirectPassErr(err.message);
    } finally {
      setDirectPassLoading(false);
    }
  };


  // Dashboard state
  const [activeTab, setActiveTab] = useState("registrations"); // registrations, packages, vouchers, users, scan
  const [registrations, setRegistrations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Registration list states
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, paid, rejected
  const [searchQuery, setSearchQuery] = useState("");

  // Receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Package editor states
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgEditName, setPkgEditName] = useState("");
  const [pkgEditPrice, setPkgEditPrice] = useState("");
  const [pkgEditDesc, setPkgEditDesc] = useState("");
  const [pkgUpdateMessage, setPkgUpdateMessage] = useState("");

  // Voucher creator states
  const [newVoucherCode, setNewVoucherCode] = useState("");
  const [newVoucherType, setNewVoucherType] = useState("fixed");
  const [newVoucherValue, setNewVoucherValue] = useState("");
  const [newVoucherMaxUses, setNewVoucherMaxUses] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");

  // User creator states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("staff"); // staff, admin
  const [userMessage, setUserMessage] = useState("");

  // Scan check-in states
  const [scanCode, setScanCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [checkinHistory, setCheckinHistory] = useState([]);

  // Helper: get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("dutaquran_admin_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // Load state on mount/storage check
  useEffect(() => {
    const token = localStorage.getItem("dutaquran_admin_token");
    if (token) {
      setIsLoggedIn(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoadingLogin(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal masuk");

      localStorage.setItem("dutaquran_admin_token", data.token);
      setIsLoggedIn(true);
      fetchDashboardData();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dutaquran_admin_token");
    setIsLoggedIn(false);
    setRegistrations([]);
    setPackages([]);
    setVouchers([]);
    setUsers([]);
    setCheckinHistory([]);
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const headers = getAuthHeaders();

      // 1. Fetch Registrations
      const regRes = await fetch(`${API_BASE}/api/admin/registrations`, { headers });
      if (regRes.status === 401 || regRes.status === 403) {
        handleLogout();
        setLoginError("Sesi login telah kadaluarsa. Silakan login kembali.");
        return;
      }
      const regData = await regRes.json();
      setRegistrations(regData);

      // 2. Fetch Packages (public, no auth needed)
      const pkgRes = await fetch(`${API_BASE}/api/packages`);
      const pkgData = await pkgRes.json();
      setPackages(pkgData);

      // 3. Fetch Vouchers
      const voucherRes = await fetch(`${API_BASE}/api/admin/vouchers`, { headers });
      const voucherData = await voucherRes.json();
      setVouchers(voucherData);

      // 4. Fetch Users (Admins and Staffs)
      const userRes = await fetch(`${API_BASE}/api/admin/users`, { headers });
      const userData = await userRes.json();
      setUsers(userData);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleVerify = async (id, status) => {
    if (!window.confirm(`Apakah Anda yakin ingin memverifikasi status registrasi ini sebagai '${status}'?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/verify`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memverifikasi");

      alert(data.message);
      fetchDashboardData(); // Refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePkgEditSelect = (pkg) => {
    setEditingPkg(pkg);
    setPkgEditName(pkg.name);
    setPkgEditPrice(pkg.price);
    setPkgEditDesc(pkg.description);
    setPkgUpdateMessage("");
  };

  const handlePkgUpdate = async (e) => {
    e.preventDefault();
    setPkgUpdateMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/packages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: editingPkg.id,
          name: pkgEditName,
          price: pkgEditPrice,
          description: pkgEditDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengupdate paket");

      setPkgUpdateMessage("Paket berhasil diperbarui!");
      setEditingPkg(null);
      fetchDashboardData();
    } catch (err) {
      setPkgUpdateMessage(`Error: ${err.message}`);
    }
  };

  // Voucher Creation
  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    setVoucherMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/vouchers`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: newVoucherCode,
          discount_type: newVoucherType,
          discount_value: newVoucherValue,
          max_uses: newVoucherMaxUses || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat voucher");
      setVoucherMessage("Voucher berhasil dibuat!");
      setNewVoucherCode("");
      setNewVoucherValue("");
      setNewVoucherMaxUses("");
      fetchDashboardData();
    } catch (err) {
      setVoucherMessage(`Error: ${err.message}`);
    }
  };

  // Voucher Deletion
  const handleDeleteVoucher = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus voucher ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/vouchers?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus voucher");
      alert(data.message);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // User Creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat user");
      setUserMessage(`User ${newUsername} (${newRole}) berhasil dibuat!`);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      fetchDashboardData();
    } catch (err) {
      setUserMessage(`Error: ${err.message}`);
    }
  };

  // User Deletion
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user dengan role '${role}' ini?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users?id=${id}&role=${role}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus user");
      alert(data.message);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScanCheckIn = async (e) => {
    e.preventDefault();
    if (!scanCode) return;
    setScanning(true);
    setScanResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/scan-checkin`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ registration_code: scanCode.trim() }),
      });

      const data = await res.json();
      setScanResult(data);
      if (res.ok && data.success) {
        // Add to local check-in history
        setCheckinHistory(prev => [
          { ...data.guest, time: new Date().toLocaleTimeString("id-ID") },
          ...prev
        ]);
        setScanCode(""); // Clear search bar on success check-in
        fetchDashboardData(); // Refresh list
      }
    } catch (err) {
      setScanResult({ success: false, error: "System Error", message: err.message });
    } finally {
      setScanning(false);
    }
  };

  // HTML5 QR Code Scanner setup for Admin Check-In tab
  useEffect(() => {
    if (!isLoggedIn || activeTab !== "scan") return;

    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "admin-qr-reader", 
        { 
          fps: 10, 
          qrbox: { width: 220, height: 220 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0
        }, 
        /* verbose= */ false
      );

      const onScanSuccess = async (decodedText) => {
        if (scanning) return;
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
            setCheckinHistory(prev => [
              { ...data.guest, time: new Date().toLocaleTimeString("id-ID") },
              ...prev
            ]);
            fetchDashboardData(); // Refresh counts
          }
        } catch (err) {
          setScanResult({ success: false, error: "System Error", message: err.message });
        } finally {
          setScanning(false);
        }
      };

      scanner.render(onScanSuccess, (err) => {});

      return () => {
        scanner.clear().catch(err => console.error("Error clearing admin scanner:", err));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn, activeTab]);

  // Filter and search logic for registrations list
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesStatus = filterStatus === "all" || reg.status === filterStatus;
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.registration_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.whatsapp.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Compute dashboard statistics
  const stats = {
    totalRegistrations: registrations.length,
    totalPaid: registrations.filter(r => r.status === "paid").length,
    totalPending: registrations.filter(r => r.status === "pending").length,
    totalRejected: registrations.filter(r => r.status === "rejected").length,
    totalCheckedIn: registrations.filter(r => r.checked_in).length,
    totalRevenue: registrations
      .filter(r => r.status === "paid")
      .reduce((sum, r) => sum + parseFloat(r.total_price || 0), 0),
  };

  // Ringkasan kuota seat per kategori (war tiket) — 3 status: terisi (lunas) / booking (pending) / kosong
  const seatCategories = ["economy", "reguler", "premium"]
    .map((cat) => {
      const p = packages.find((x) => x.category === cat && x.seat_type === "personal");
      if (!p) return null;
      const total = p.seats_total ?? 100;
      const taken = Math.min(p.seats_taken ?? 0, total);
      const pending = Math.min(p.seats_pending ?? 0, taken);
      return {
        category: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        total,
        taken,
        pending,
        paid: Math.min(p.seats_paid ?? Math.max(0, taken - pending), total),
        free: Math.max(0, total - taken),
        remaining: p.seats_remaining ?? Math.max(0, total - taken),
        isReleased: p.is_released ?? true,
      };
    })
    .filter(Boolean);

  // Get checked-in registrations for history view
  const checkedInRegistrations = registrations
    .filter(r => r.checked_in)
    .sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at));

  if (!isLoggedIn) {
    return (
      <>
      <div className="container" style={{ padding: "80px 24px", display: "flex", justifyContent: "center" }}>
        <div className="glass-card admin-login-card" style={{ maxWidth: "440px", width: "100%", padding: "40px", background: "rgba(255, 255, 255, 0.85)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ background: "rgba(29, 78, 216, 0.08)", width: "56px", height: "56px", borderRadius: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", marginBottom: "16px" }}>
              <LogIn size={26} />
            </div>
            <h2>Admin Console</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Masuk untuk mengelola data pendaftaran tiket.</p>
          </div>

          {loginError && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", padding: "12px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin"
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                required 
              />
            </div>
            
            <div style={{ textAlign: "right", marginBottom: "16px" }}>
              <button 
                type="button" 
                onClick={() => { setShowForgotModal(true); setForgotStep(1); setForgotMsg(""); setForgotErr(""); setForgotEmail(""); setForgotOtp(""); setForgotNewPass(""); }}
                style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "13px", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
              >
                Lupa Password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loadingLogin}>
              {loadingLogin ? "Memverify..." : "Masuk"}
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
            <h3 style={{ marginBottom: "8px", color: "var(--color-primary)", textAlign: "center" }}>🔐 Reset Password Akun</h3>
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
      {/* Header Admin */}
      <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "20px", marginBottom: "32px" }}>
        <div>
          <h2>Dashboard Admin Duta Qur'an</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Kelola pembayaran, edit harga paket, generate voucher diskon, check-in e-tiket, dan kelola user akses.</p>
        </div>
        <div className="admin-header-actions" style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ padding: "10px 16px", borderRadius: "10px" }} disabled={loadingData}>
            <RefreshCw size={16} className={loadingData ? "animate-spin" : ""} /> Refresh Data
          </button>
          <button className="btn btn-danger" onClick={handleLogout} style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "14px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Statistics Cards */}
      <div className="admin-stats-grid" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: "16px", 
        marginBottom: "32px" 
      }}>
        <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)", borderRadius: "16px", padding: "20px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Pendaftar</span>
            <Users size={18} style={{ opacity: 0.7 }} />
          </div>
          <div className="stat-value" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1 }}>{stats.totalRegistrations}</div>
          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "6px" }}>{stats.totalPaid} terkonfirmasi</div>
        </div>

        <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", borderRadius: "16px", padding: "20px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Pendapatan</span>
            <DollarSign size={18} style={{ opacity: 0.7 }} />
          </div>
          <div className="stat-value" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1 }}>Rp {stats.totalRevenue.toLocaleString("id-ID")}</div>
          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "6px" }}>Dari {stats.totalPaid} peserta lunas</div>
        </div>

        <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)", borderRadius: "16px", padding: "20px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.5px" }}>Menunggu Verif</span>
            <Clock size={18} style={{ opacity: 0.7 }} />
          </div>
          <div className="stat-value" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1 }}>{stats.totalPending}</div>
          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "6px" }}>{stats.totalRejected} ditolak</div>
        </div>

        <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)", borderRadius: "16px", padding: "20px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.5px" }}>Sudah Check-In</span>
            <UserCheck size={18} style={{ opacity: 0.7 }} />
          </div>
          <div className="stat-value" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1 }}>{stats.totalCheckedIn}</div>
          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "6px" }}>dari {stats.totalPaid} tiket lunas</div>
        </div>
      </div>

      {/* Ringkasan Status Seat per Kategori (kontrol manual via verifikasi pembayaran) */}
      {seatCategories.length > 0 && (
        <div className="glass-card" style={{ background: "rgba(255,255,255,0.9)", borderRadius: "16px", padding: "20px", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
            <strong style={{ color: "var(--color-primary)", fontSize: "15px" }}>Status Seat per Kategori (Kontrol Manual)</strong>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Verifikasi = kursi jadi <b style={{ color: "#16a34a" }}>terisi</b> • Tolak = kursi kembali <b style={{ color: "#475569" }}>kosong</b>
            </span>
          </div>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
            <span><i style={{ display: "inline-block", width: 12, height: 8, borderRadius: 2, background: "#a78bfa", marginRight: 4 }} />Booking (menunggu verifikasi)</span>
            <span><i style={{ display: "inline-block", width: 12, height: 8, borderRadius: 2, background: "linear-gradient(180deg,#86efac,#16a34a)", marginRight: 4 }} />Terisi (lunas)</span>
            <span><i style={{ display: "inline-block", width: 12, height: 8, borderRadius: 2, background: "#e2e8f0", border: "1px solid #cbd5e1", marginRight: 4 }} />Kosong</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
            {seatCategories.map((c) => {
              const color = c.category === "premium" ? "#f59e0b" : c.category === "reguler" ? "#2563eb" : "#10b981";
              const pct = (v) => `${Math.max(0, Math.min(100, (v / c.total) * 100))}%`;
              return (
                <div key={c.category} style={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "14px", background: "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "13.5px", color: "var(--color-primary)" }}>
                      {c.label} Seat {!c.isReleased && <span title="Belum dibuka">(🔒 belum dibuka)</span>}
                    </strong>
                    <span style={{ fontSize: "12.5px", fontWeight: 800, color: c.free <= 0 ? "#dc2626" : color }}>
                      sisa {c.free}/{c.total}
                    </span>
                  </div>
                  {/* bar 3 status */}
                  <div style={{ display: "flex", height: "10px", borderRadius: "999px", overflow: "hidden", background: "#eef2f7", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <span title={`${c.pending} booking`} style={{ width: pct(c.pending), background: "#a78bfa" }} />
                    <span title={`${c.paid} terisi`} style={{ width: pct(c.paid), background: `linear-gradient(180deg, ${color}cc, ${color})` }} />
                    <span title={`${c.free} kosong`} style={{ flex: 1, background: "#e2e8f0" }} />
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "7px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <span><b style={{ color: "#7c3aed" }}>{c.pending}</b> booking</span>
                    <span><b style={{ color }}>{c.paid}</b> terisi</span>
                    <span><b>{c.free}</b> kosong</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin Tab Selectors */}
      <div className="admin-tab-nav" style={{ display: "flex", gap: "12px", borderBottom: "2px solid rgba(0,0,0,0.05)", paddingBottom: "12px", marginBottom: "32px", overflowX: "auto" }}>
        <button 
          className={`btn ${activeTab === "registrations" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "12px", padding: "10px 20px", fontSize: "14px" }}
          onClick={() => setActiveTab("registrations")}
        >
          <Users size={16} /> Pesanan & Verifikasi Pembayaran
        </button>
        <button 
          className={`btn ${activeTab === "packages" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "12px", padding: "10px 20px", fontSize: "14px" }}
          onClick={() => setActiveTab("packages")}
        >
          <CreditCard size={16} /> Kelola Paket Tiket
        </button>
        <button 
          className={`btn ${activeTab === "vouchers" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "12px", padding: "10px 20px", fontSize: "14px" }}
          onClick={() => setActiveTab("vouchers")}
        >
          <Tag size={16} /> Kelola Voucher
        </button>
        <button 
          className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "12px", padding: "10px 20px", fontSize: "14px" }}
          onClick={() => setActiveTab("users")}
        >
          <Key size={16} /> Kelola Akses (Staff/Admin)
        </button>
        <button 
          className={`btn ${activeTab === "scan" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "12px", padding: "10px 20px", fontSize: "14px" }}
          onClick={() => setActiveTab("scan")}
        >
          <Camera size={16} /> Scan QR / Check-In
        </button>
      </div>

      {/* Tab 1: Registrations List */}
      {activeTab === "registrations" && (
        <div className="glass-card" style={{ background: "white", padding: "28px" }}>
          <div className="admin-filter-row" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            {/* Search Input */}
            <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px" }}>
              <div style={{ position: "relative", width: "100%" }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Cari Nama, WhatsApp, atau Kode Registrasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-muted)" }}>Filter:</span>
              <select 
                className="form-control" 
                style={{ padding: "8px 16px", width: "auto" }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Verifikasi (Pending)</option>
                <option value="paid">Lunas (Paid)</option>
                <option value="rejected">Ditolak (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Registrations List Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="admin-reg-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(0,0,0,0.06)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px" }}>Kode / Tanggal</th>
                  <th style={{ padding: "12px" }}>Detail Guest</th>
                  <th style={{ padding: "12px" }}>Paket Program</th>
                  <th style={{ padding: "12px" }}>Kursi</th>
                  <th style={{ padding: "12px" }}>Nominal Transfer</th>
                  <th style={{ padding: "12px" }}>Status / Bukti</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                      Tidak ada data pendaftaran ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td style={{ padding: "14px 12px" }}>
                        <strong style={{ color: "var(--color-primary)" }}>{reg.registration_code}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                          {new Date(reg.created_at).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ fontWeight: 700 }}>{reg.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reg.whatsapp}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reg.email}</div>
                      </td>
                      <td style={{ padding: "14px 12px", fontWeight: 600 }}>
                        {reg.package_name}
                        {reg.checked_in && (
                          <span style={{ display: "block", fontSize: "11px", color: "#16a34a", fontWeight: "bold", marginTop: "2px" }}>
                            ✓ Checked In
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {(() => {
                          if (!reg.seat_numbers) return <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>;
                          try {
                            const arr = typeof reg.seat_numbers === "string" ? JSON.parse(reg.seat_numbers) : reg.seat_numbers;
                            const c = (reg.category || "x").charAt(0).toUpperCase();
                            return (
                              <span style={{ background: "#e0f2fe", border: "1px solid #7dd3fc", color: "#0369a1", fontWeight: 800, borderRadius: "7px", padding: "3px 8px", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                                {Array.isArray(arr) ? arr.map((n) => `${c}-${n + 1}`).join(" + ") : "—"}
                              </span>
                            );
                          } catch (e) { return <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>; }
                        })()}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ fontWeight: 700 }}>Rp {parseFloat(reg.total_price).toLocaleString("id-ID")}</div>
                        {parseFloat(reg.discount_amount) > 0 && (
                          <div style={{ fontSize: "11px", color: "#16a34a" }}>Potongan: -Rp {parseFloat(reg.discount_amount).toLocaleString("id-ID")} ({reg.voucher_code})</div>
                        )}
                        <div style={{ fontSize: "11px", color: "#1d4ed8" }}>Kode unik: +{reg.unique_code}</div>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span className={`status-badge status-${reg.status}`} style={{ fontSize: "11px", padding: "4px 10px" }}>
                          {reg.status === "paid" ? "CONFIRMED ✓" : reg.status === "pending" ? "BOOKING — menunggu verifikasi" : reg.status === "rejected" ? "DITOLAK" : reg.status}
                        </span>
                        {reg.payment_proof ? (
                          <button 
                            onClick={() => setSelectedReceipt(reg.payment_proof)}
                            style={{ display: "block", fontSize: "11px", color: "var(--color-primary)", border: "none", background: "none", cursor: "pointer", marginTop: "6px", textDecoration: "underline" }}
                          >
                            Lihat Bukti Transfer
                          </button>
                        ) : (
                          <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "6px" }}>Belum upload bukti</div>
                        )}
                      </td>
                      <td style={{ padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          {reg.status !== "paid" && (
                            <button 
                              className="btn btn-success" 
                              style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "12px" }}
                              onClick={() => handleVerify(reg.id, "paid")}
                            >
                              <Check size={14} /> Setujui
                            </button>
                          )}
                          {reg.status !== "rejected" && (
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "12px" }}
                              onClick={() => handleVerify(reg.id, "rejected")}
                            >
                              <X size={14} /> Tolak
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Packages Editor */}
      {activeTab === "packages" && (
        <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          
          {/* Packages List Card */}
          <div className="glass-card" style={{ background: "white", padding: "28px" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--color-primary)" }}>Daftar Paket Tiket</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {packages.map((pkg) => (
                <div key={pkg.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", color: "var(--text-dark)" }}>{pkg.name}</h4>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-primary)", marginTop: "4px" }}>
                      Rp {parseFloat(pkg.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "6px 12px", fontSize: "13px", borderRadius: "8px" }}
                    onClick={() => handlePkgEditSelect(pkg)}
                  >
                    Edit Detail
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Package Update Form */}
          <div className="glass-card" style={{ background: "white", padding: "28px" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--color-primary)" }}>Kelola Detail Paket</h3>
            {pkgUpdateMessage && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#eff6ff", color: "var(--color-primary)", fontSize: "14px", fontWeight: 600, marginBottom: "20px", textAlign: "center" }}>
                {pkgUpdateMessage}
              </div>
            )}
            
            {editingPkg ? (
              <form onSubmit={handlePkgUpdate}>
                <div className="form-group">
                  <label className="form-label">Nama Paket</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={pkgEditName} 
                    onChange={(e) => setPkgEditName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Harga Dasar (IDR)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={pkgEditPrice} 
                    onChange={(e) => setPkgEditPrice(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi Ringkas</label>
                  <textarea 
                    className="form-control" 
                    style={{ height: "100px", resize: "none" }}
                    value={pkgEditDesc} 
                    onChange={(e) => setPkgEditDesc(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>
                    Simpan Perubahan
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ padding: "10px" }} onClick={() => setEditingPkg(null)}>
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <PlusCircle size={32} style={{ color: "var(--color-accent)", marginBottom: "12px" }} />
                <p>Pilih salah satu paket di sebelah kiri untuk mengedit nama, deskripsi, atau harga pendaftarannya.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Kelola Voucher */}
      {activeTab === "vouchers" && (
        <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          
          {/* Vouchers List */}
          <div className="glass-card" style={{ background: "white", padding: "28px" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--color-primary)" }}>Daftar Voucher Aktif</h3>
            
            {vouchers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                Belum ada voucher aktif.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {vouchers.map((v) => (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px" }}>
                    <div>
                      <h4 style={{ fontSize: "16px", color: "var(--text-dark)", letterSpacing: "0.5px" }}>{v.code}</h4>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Diskon: <strong>{v.discount_type === "fixed" ? `Rp ${parseFloat(v.discount_value).toLocaleString("id-ID")}` : `${v.discount_value}%`}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Kuota Terpakai: {v.used_count} / {v.max_uses || "∞"}
                      </div>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: "8px", borderRadius: "8px", display: "inline-flex", alignItems: "center" }}
                      onClick={() => handleDeleteVoucher(v.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voucher Creator Form */}
          <div className="glass-card" style={{ background: "white", padding: "28px" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--color-primary)" }}>Generate Voucher Baru</h3>
            {voucherMessage && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#eff6ff", color: "var(--color-primary)", fontSize: "14px", fontWeight: 600, marginBottom: "20px", textAlign: "center" }}>
                {voucherMessage}
              </div>
            )}
            
            <form onSubmit={handleCreateVoucher}>
              <div className="form-group">
                <label className="form-label">Kode Voucher (Kapital)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: PROMO30"
                  value={newVoucherCode} 
                  onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipe Diskon</label>
                <select 
                  className="form-control"
                  value={newVoucherType}
                  onChange={(e) => setNewVoucherType(e.target.value)}
                  required
                >
                  <option value="fixed">Flat (Potongan Nominal Rupiah)</option>
                  <option value="percentage">Persentase (%)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Nilai Diskon</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder={newVoucherType === "fixed" ? "Contoh: 15000" : "Contoh: 10"}
                  value={newVoucherValue} 
                  onChange={(e) => setNewVoucherValue(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maksimal Penggunaan / Kuota (Kosongkan jika tak terbatas)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Contoh: 50"
                  value={newVoucherMaxUses} 
                  onChange={(e) => setNewVoucherMaxUses(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "16px", padding: "12px" }}>
                Generate Voucher
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Kelola Akses User (Admin/Staff) */}
      {activeTab === "users" && (
        <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          
          {/* Users List Card */}
          <div className="glass-card" style={{ background: "white", padding: "28px" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--color-primary)" }}>Daftar Pengguna Akses</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {users.map((u) => (
                <div key={`${u.role}-${u.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                      {u.username} 
                      <span className={`status-badge`} style={{ 
                        fontSize: "10px", 
                        padding: "2px 8px", 
                        background: u.role === "admin" ? "#dbeafe" : "#f3f4f6", 
                        color: u.role === "admin" ? "#1e40af" : "#374151" 
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Email: {u.email}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", background: "#f1f5f9", color: "#334155" }}
                      onClick={() => { setEditUserModal(u); setEditEmailVal(u.email === "-" ? "manusiaberdosa95@gmail.com" : u.email); setEditEmailMsg(""); setEditEmailErr(""); }}
                    >
                      ✏️ Edit Email
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                      onClick={() => { setResetUserModal(u); setDirectPassVal(""); setDirectPassMsg(""); setDirectPassErr(""); }}
                    >
                      <Key size={13} /> Reset Pass
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: "8px", borderRadius: "8px" }}
                      onClick={() => handleDeleteUser(u.id, u.role)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Creator Form */}
          <div className="glass-card" style={{ background: "white", padding: "28px" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--color-primary)" }}>Tambah Pengguna Baru</h3>
            {userMessage && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#eff6ff", color: "var(--color-primary)", fontSize: "14px", fontWeight: 600, marginBottom: "20px", textAlign: "center" }}>
                {userMessage}
              </div>
            )}
            
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: staff_reza"
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email (Untuk Reset Password)</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Contoh: reza@dutaqu.com"
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password Akses</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Password aman"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hak Akses / Jabatan</label>
                <select 
                  className="form-control"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  required
                >
                  <option value="staff">Staff Lapangan (Hanya Bisa Scan E-Tiket)</option>
                  <option value="admin">Administrator (Akses Penuh Kelola Uang & Tiket)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "16px", padding: "12px" }}>
                Daftarkan Pengguna
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: Scan QR Ticket / Check-In */}
      {activeTab === "scan" && (
        <div className="admin-scan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          {/* Scanner + Manual Input */}
          <div className="glass-card" style={{ background: "white", padding: "32px", textAlign: "center" }}>
            <div style={{ background: "rgba(29, 78, 216, 0.08)", width: "56px", height: "56px", borderRadius: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", marginBottom: "16px" }}>
              <Camera size={26} />
            </div>
            <h3 style={{ marginBottom: "8px" }}>Check-In E-Tiket Masuk</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
              Arahkan QR Code peserta ke kamera, atau masukkan Kode Registrasi tiket secara manual di bawah ini.
            </p>

            {/* HTML5 QR Reader Container */}
            <div 
              id="admin-qr-reader" 
              style={{ 
                width: "100%", 
                maxWidth: "320px", 
                margin: "0 auto 24px auto", 
                borderRadius: "12px", 
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.1)"
              }}
            ></div>

            <form onSubmit={handleScanCheckIn} className="scan-manual-form" style={{ display: "flex", gap: "12px", maxWidth: "500px", margin: "0 auto 32px auto" }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Masukkan Kode Manual: REG-20260711-XXXX"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={scanning}>
                {scanning ? "Memproses..." : "Check-In"}
              </button>
            </form>

            {/* Scan results output dialog */}
            {scanResult && (
              <div style={{
                background: scanResult.success ? "#d1fae5" : scanResult.error === "Tiket Sudah Terpakai!" ? "#fef3c7" : "#fee2e2",
                border: "1px solid",
                borderColor: scanResult.success ? "#a7f3d0" : scanResult.error === "Tiket Sudah Terpakai!" ? "#fde68a" : "#fca5a5",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "left",
                maxWidth: "500px",
                margin: "0 auto"
              }}>
                {scanResult.success ? (
                  <div>
                    <h4 style={{ color: "#065f46", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Check size={20} style={{ color: "#10b981" }} /> Check-In Berhasil!
                    </h4>
                    <div style={{ fontSize: "14px", color: "#047857", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div><strong>Nama Tamu:</strong> {scanResult.guest.name}</div>
                      <div><strong>Paket:</strong> {scanResult.guest.package_name}</div>
                      {(() => {
                        const g = scanResult.guest;
                        if (!g || !g.seat_numbers) return null;
                        let seats = null;
                        try {
                          const arr = typeof g.seat_numbers === "string" ? JSON.parse(g.seat_numbers) : g.seat_numbers;
                          if (Array.isArray(arr) && arr.length > 0) seats = arr;
                        } catch (e) {}
                        if (!seats) return null;
                        const c = (g.category || "x").charAt(0).toUpperCase();
                        return (
                          <div style={{ fontSize: "15px", fontWeight: 800, color: "#0369a1", background: "#e0f2fe", border: "1px solid #7dd3fc", borderRadius: "8px", padding: "6px 10px", display: "inline-block" }}>
                            💺 Kursi: {seats.map((n) => `${c}-${n + 1}`).join(" + ")} • {g.seat_type === "couple" ? "2 seat (couple)" : "1 seat (personal)"}
                          </div>
                        );
                      })()}
                      <div><strong>WhatsApp:</strong> {scanResult.guest.whatsapp}</div>
                      <div><strong>Jam Masuk:</strong> {new Date(scanResult.guest.checked_in_at).toLocaleTimeString("id-ID")}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: scanResult.error === "Tiket Sudah Terpakai!" ? "#b45309" : "#b91c1c", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <ShieldAlert size={20} /> {scanResult.error}
                    </h4>
                    <p style={{ fontSize: "13px", color: scanResult.error === "Tiket Sudah Terpakai!" ? "#d97706" : "#c2410c" }}>
                      {scanResult.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Check-In History */}
          <div className="glass-card" style={{ background: "white", padding: "28px" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 size={20} /> Riwayat Check-In ({checkedInRegistrations.length} tamu)
            </h3>
            
            {checkedInRegistrations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <UserX size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                <p>Belum ada peserta yang check-in.</p>
              </div>
            ) : (
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table className="checkin-history-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(0,0,0,0.06)", color: "var(--text-muted)", position: "sticky", top: 0, background: "white" }}>
                      <th style={{ padding: "10px 8px" }}>#</th>
                      <th style={{ padding: "10px 8px" }}>Nama Tamu</th>
                      <th style={{ padding: "10px 8px" }}>Paket</th>
                      <th style={{ padding: "10px 8px" }}>Jam Masuk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkedInRegistrations.map((reg, idx) => (
                      <tr key={reg.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <td style={{ padding: "10px 8px", color: "var(--text-muted)" }}>{idx + 1}</td>
                        <td style={{ padding: "10px 8px" }}>
                          <div style={{ fontWeight: 700 }}>{reg.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{reg.registration_code}</div>
                        </td>
                        <td style={{ padding: "10px 8px", fontSize: "12px" }}>{reg.package_name}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 600, color: "#059669" }}>
                          {reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleTimeString("id-ID") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setSelectedReceipt(null)}>
          <div className="glass-card" style={{ background: "white", padding: "16px", maxWidth: "500px", width: "100%", textAlign: "center", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginBottom: "12px" }}>Bukti Transfer Pembayaran</h4>
            <div style={{ maxHeight: "70vh", overflowY: "auto", background: "#f8fafc", padding: "10px", borderRadius: "10px" }}>
              <img 
                src={selectedReceipt} 
                alt="Bukti Transfer" 
                style={{ maxWidth: "100%", height: "auto", borderRadius: "6px" }} 
              />
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: "16px", width: "100%" }}
              onClick={() => setSelectedReceipt(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Edit User Email Modal */}
      {editUserModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1100, padding: "20px"
        }} onClick={() => setEditUserModal(null)}>
          <div className="glass-card" style={{ background: "white", padding: "28px", maxWidth: "440px", width: "100%", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "8px", color: "var(--color-primary)" }}>✏️ Edit Email Pengguna</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
              Ubah email pribadi terdaftar untuk akun <strong>{editUserModal.username}</strong> ({editUserModal.role.toUpperCase()})
            </p>

            {editEmailMsg && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#d1fae5", color: "#065f46", fontSize: "13px", marginBottom: "16px" }}>
                {editEmailMsg}
              </div>
            )}

            {editEmailErr && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", fontSize: "13px", marginBottom: "16px" }}>
                {editEmailErr}
              </div>
            )}

            <form onSubmit={handleEditUserEmail}>
              <div className="form-group">
                <label className="form-label">Email Pribadi Terdaftar (Untuk Reset Pass)</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Contoh: manusiaberdosa95@gmail.com"
                  value={editEmailVal}
                  onChange={(e) => setEditEmailVal(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditUserModal(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={editEmailLoading}>
                  {editEmailLoading ? "Menyimpan..." : "Simpan Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}