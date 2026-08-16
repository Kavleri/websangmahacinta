import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Timer, Heart, Users, CheckCircle2 } from "lucide-react";

// Jadwal penting (WIB) — countdown otomatis mengikuti milestone berikutnya
// (War Economy sudah BERLANGSUNG sejak 16 Agustus 00.00 WIB)
const MILESTONES = [
  { at: new Date("2026-08-21T00:00:00+07:00"), label: "Pembukaan War Tiket Reguler" },
  { at: new Date("2026-08-25T00:00:00+07:00"), label: "Pembukaan War Tiket Premium" },
  { at: new Date("2026-08-28T23:59:59+07:00"), label: "Penutupan War Tiket Premium" },
  { at: new Date("2026-09-09T07:30:00+07:00"), label: "Hari Seminar Sang Maha Cinta" }
];

function getNextMilestone(now) {
  for (const m of MILESTONES) {
    if (now < m.at.getTime()) return m;
  }
  return null;
}

export default function Hero({ setPage }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [countdownLabel, setCountdownLabel] = useState("Memuat jadwal penting...");

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const milestone = getNextMilestone(now);
      if (!milestone) {
        setCountdownLabel("Semoga bermanfaat — sampai jumpa di lokasi!");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCountdownLabel(`Menuju ${milestone.label}:`);
      const difference = milestone.at.getTime() - now;
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-section" style={{
      position: "relative",
      overflow: "hidden",
      padding: "80px 0 80px 0",
      background: "radial-gradient(circle at 10% 20%, rgba(226, 238, 255, 0.6) 0%, rgba(255, 255, 255, 0.9) 90%)"
    }}>
      {/* Decorative Sparkles */}
      <div className="sparkle-bg">
        <div className="sparkle" style={{ top: "15%", left: "8%", width: "6px", height: "6px", animationDelay: "0s" }}></div>
        <div className="sparkle" style={{ top: "25%", left: "85%", width: "8px", height: "8px", animationDelay: "2s" }}></div>
        <div className="sparkle" style={{ top: "50%", left: "45%", width: "5px", height: "5px", animationDelay: "4s" }}></div>
        <div className="sparkle" style={{ top: "75%", left: "12%", width: "7px", height: "7px", animationDelay: "1s" }}></div>
        <div className="sparkle" style={{ top: "85%", left: "75%", width: "6px", height: "6px", animationDelay: "3s" }}></div>
      </div>

      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "48px",
          alignItems: "center"
        }}>
          {/* Left Column: Headline and Info */}
          <div style={{ textAlign: "left", position: "relative", zIndex: 2 }}>
            <h1 style={{
              fontFamily: "var(--font-accent)",
              fontSize: "clamp(55px, 7vw, 90px)",
              color: "var(--color-accent)",
              lineHeight: 0.9,
              marginBottom: "-10px",
              fontWeight: "400"
            }}>
              Sang Maha Cinta
            </h1>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: "400",
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              lineHeight: 1,
              marginBottom: "24px"
            }}>
              Menikah Untuk Bahagia
            </h2>

            <p style={{
              color: "var(--text-muted)",
              fontSize: "16px",
              marginBottom: "36px",
              lineHeight: "1.7",
              maxWidth: "500px"
            }}>
              Sehari penuh belajar merawat cinta dan membangun rumah tangga yang tenang, hangat, dan bahagia — bersama pasangan maupun bagi Anda yang sedang mempersiapkan pernikahan.
            </p>

            {/* Event Meta Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "36px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%", background: "rgba(29, 78, 216, 0.08)", color: "var(--color-primary)", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>TANGGAL</p>
                  <p style={{ fontSize: "14px", fontWeight: 700 }}>Rabu, 09 September 2026</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%", background: "rgba(29, 78, 216, 0.08)", color: "var(--color-primary)", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={18} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>WAKTU</p>
                  <p style={{ fontSize: "14px", fontWeight: 700 }}>07.30 - 15.00 WIB</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%", background: "rgba(29, 78, 216, 0.08)", color: "var(--color-primary)", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>LOKASI</p>
                  <p style={{ fontSize: "14px", fontWeight: 700 }}>Masjid At-Tohir (Exit Tol Cimanggis), Kota Depok, Jawa Barat</p>
                </div>
              </div>
            </div>

            {/* Countdown Premium */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "40px",
              alignItems: "flex-start"
            }}>
              <span style={{ 
                fontSize: "12px", 
                fontWeight: 800, 
                color: "var(--color-primary)", 
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <Timer size={15} style={{ color: "var(--color-accent)" }} /> {countdownLabel}
              </span>
              <div style={{ display: "flex", gap: "12px" }}>
                {/* Days */}
                <div style={{
                  background: "white",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(29, 78, 216, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "65px",
                  border: "1px solid rgba(29, 78, 216, 0.05)"
                }}>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-primary)", lineHeight: 1 }}>{timeLeft.days}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "4px" }}>Hari</span>
                </div>
                
                {/* Hours */}
                <div style={{
                  background: "white",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(29, 78, 216, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "65px",
                  border: "1px solid rgba(29, 78, 216, 0.05)"
                }}>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-primary)", lineHeight: 1 }}>{timeLeft.hours}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "4px" }}>Jam</span>
                </div>
                
                {/* Minutes */}
                <div style={{
                  background: "white",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(29, 78, 216, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "65px",
                  border: "1px solid rgba(29, 78, 216, 0.05)"
                }}>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-primary)", lineHeight: 1 }}>{timeLeft.minutes}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "4px" }}>Menit</span>
                </div>
                
                {/* Seconds */}
                <div style={{
                  background: "white",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(29, 78, 216, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "65px",
                  border: "1px solid rgba(29, 78, 216, 0.05)"
                }}>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-accent)", lineHeight: 1 }}>{timeLeft.seconds}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "4px" }}>Detik</span>
                </div>
              </div>
            </div>

            <div>
              <a href="#packages-section" className="btn btn-primary" style={{ padding: "16px 36px" }}>
                Daftar &amp; Amankan Tiket
              </a>
            </div>
          </div>

          {/* Right Column: Beautiful Flyer Image Frame */}
          <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "100%",
              maxWidth: "380px",
              aspectRatio: "3/4",
              background: "white",
              border: "4px solid white",
              boxShadow: "0 20px 40px rgba(12, 36, 80, 0.15)",
              borderRadius: "24px",
              overflow: "hidden",
              display: "flex"
            }}>
              <img 
                src="/flyer.jpg" 
                alt="Flyer Sang Maha Cinta" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
