import React, { useState } from "react";
import { Compass, Search, Menu, X } from "lucide-react";

export default function Navbar({ currentPage, setPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (pageName) => {
    setPage(pageName);
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", position: "relative" }}>
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); handleNavClick("landing"); }}>
          <Compass className="animate-spin-slow" size={28} />
          <span>Duta Qur'an</span>
        </a>
        
        {/* Desktop links */}
        <div className="nav-links desktop-menu">
          <a 
            href="#landing" 
            className={`nav-link ${currentPage === "landing" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavClick("landing"); }}
          >
            Beranda
          </a>
          <a 
            href="#status" 
            className={`nav-link ${currentPage === "status" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={(e) => { e.preventDefault(); handleNavClick("status"); }}
          >
            <Search size={16} /> Cek Tiket
          </a>
        </div>

        {/* Mobile menu toggle button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "none",
            color: "var(--color-primary)",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "8px",
            transition: "var(--transition)"
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile menu drawer */}
        {isOpen && (
          <div className="mobile-menu-drawer glass-card">
            <a 
              href="#landing" 
              className={`mobile-nav-link ${currentPage === "landing" ? "active" : ""}`}
              onClick={(e) => { e.preventDefault(); handleNavClick("landing"); }}
            >
              Beranda
            </a>
            <a 
              href="#status" 
              className={`mobile-nav-link ${currentPage === "status" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              onClick={(e) => { e.preventDefault(); handleNavClick("status"); }}
            >
              <Search size={16} /> Cek Tiket
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
