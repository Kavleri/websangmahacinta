import React, { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import CheckoutPage from "./pages/CheckoutPage";
import StatusPage from "./pages/StatusPage";
import AdminConsole from "./pages/AdminConsole";
import StaffScanGate from "./pages/StaffScanGate";

function App() {
  const [page, setPage] = useState("landing"); // landing, checkout, status, admin, staff
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [queryCode, setQueryCode] = useState("");

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin-secret-gate-7832419084321") {
      setPage("admin");
    } else if (path === "/staff-scan-gate") {
      setPage("staff");
    }
  }, []);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setPage("checkout");
  };

  const handleSetPage = (newPage) => {
    setPage(newPage);
    if (newPage !== "status") {
      setQueryCode(""); 
    }
    // Clean pathname if navigating away from secret admin/staff paths
    if (window.location.pathname !== "/" && newPage !== "admin" && newPage !== "staff") {
      window.history.pushState({}, "", "/");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {page !== "staff" && <Navbar currentPage={page} setPage={handleSetPage} />}

      <main style={{ flex: 1 }}>
        {page === "landing" && (
          <LandingPage 
            onSelectPackage={handleSelectPackage} 
            setPage={handleSetPage} 
          />
        )}
        
        {page === "checkout" && (
          <CheckoutPage 
            selectedPackage={selectedPackage} 
            setPage={handleSetPage} 
            setQueryCode={setQueryCode}
          />
        )}

        {page === "status" && (
          <StatusPage 
            defaultQuery={queryCode} 
          />
        )}

        {page === "admin" && (
          <AdminConsole />
        )}

        {page === "staff" && (
          <StaffScanGate />
        )}
      </main>

      <footer>
        <div className="container">
          <p style={{ marginBottom: "8px" }}>
            &copy; 2026 <strong>Duta Qur'an Indonesia</strong>. All Rights Reserved.
          </p>
          <p style={{ fontSize: "12px", opacity: 0.6 }}>
            Program PeraQ (Pegang Erat Qur'anmu) &amp; Seminar Sang Maha Cinta.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

