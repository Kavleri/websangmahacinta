import React from "react";

/**
 * SeatMap3D — Peta kursi aula 3D (CSS murni), dilihat dari pintu masuk ke arah panggung.
 * Layout aula 300 seat (theater): panggung depan, Premium (emas) 100 seat paling depan,
 * Reguler (biru) 100 seat tengah, Economy (hijau) 100 seat belakang, lorong tengah,
 * 4 tiang struktural, pintu masuk utama di sisi belakang.
 *
 * Status kursi (pembayaran manual, diverifikasi admin):
 * - terisi  (paid)   : solid warna zona + glow
 * - booking (pending): ungu (menunggu verifikasi pembayaran)
 * - kosong           : kursi putih
 */
const ZONES = [
  { cat: "premium", label: "PREMIUM", color: "#f59e0b", dark: "#b45309" },
  { cat: "reguler", label: "REGULER", color: "#2563eb", dark: "#1d4ed8" },
  { cat: "economy", label: "ECONOMY", color: "#10b981", dark: "#047857" }
];
const ROWS = 5;        // baris per zona
const PER_ROW = 20;    // 10 kiri + 10 kanan (dipisah lorong tengah)
const ZONE_TOP = [13, 41, 69];  // posisi awal tiap zona (% dari world)
const ZONE_H = 26;     // tinggi zona (%)

// Grid kursi di dalam zona (% dari zona): 2 blok 10 kolom + lorong tengah
function seatPos(col, row) {
  const x = col < 10 ? 4 + col * 3.2 : 63 + (col - 10) * 3.2;
  const y = 13 + row * 17;
  return { x, y };
}

export default function SeatMap3D({ categoryStats }) {
  const stat = (cat) => {
    const s = categoryStats[cat] || {};
    const total = s.total ?? 100;
    const taken = Math.min(s.taken ?? 0, total);
    const paid = Math.min(s.paid ?? taken, total);
    const pending = Math.min(s.pending ?? 0, total - paid);
    return { total, taken, paid, pending, free: Math.max(0, total - paid - pending) };
  };

  return (
    <div className="seat3d-wrap">
      <div className="seat3d-scene">
        <div className="seat3d-world">

          {/* Dinding belakang + kubah + mihrab */}
          <div className="seat3d-backwall">
            <div className="seat3d-mihrab" />
          </div>
          <div className="seat3d-dome" />

          {/* Panggung */}
          <div className="seat3d-stage">
            <div className="seat3d-stage-top" />
            <div className="seat3d-stage-face"><span>PANGGUNG</span></div>
          </div>

          {/* Lantai aula */}
          <div className="seat3d-floor">
            <div className="seat3d-carpet" />
            <div className="seat3d-aisle" />

            {ZONES.map((z, zi) => {
              const st = stat(z.cat);
              const seats = [];
              for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < PER_ROW; col++) {
                  const idx = row * PER_ROW + col;
                  const { x, y } = seatPos(col, row);
                  let state = "";
                  if (idx < st.paid) state = " paid";
                  else if (idx < st.paid + st.pending) state = " booked";
                  seats.push(
                    <span
                      key={idx}
                      className={`seat3d-seat${state}`}
                      style={{ left: `${x}%`, top: `${y}%`, "--c": z.color, "--cd": z.dark }}
                    />
                  );
                }
              }
              return (
                <div key={z.cat} className="seat3d-zone" style={{ top: `${ZONE_TOP[zi]}%`, height: `${ZONE_H}%`, borderColor: `${z.color}66`, background: `linear-gradient(180deg, ${z.color}14, ${z.color}08)` }}>
                  {seats}
                </div>
              );
            })}

            {/* Papan nama zona: berdiri di lorong tengah, tepat di batas depan tiap zona */}
            {ZONES.map((z, zi) => {
              const st = stat(z.cat);
              return (
                <div key={z.cat + "-plate"} className="seat3d-plate" style={{ top: `${ZONE_TOP[zi] - 1.5}%`, background: z.color }}>
                  {z.label} <em>· sisa {st.free}</em>
                </div>
              );
            })}

            {/* 4 tiang struktural di sisi kiri-kanan aula */}
            <div className="seat3d-pillar pl1" />
            <div className="seat3d-pillar pr1" />
            <div className="seat3d-pillar pl2" />
            <div className="seat3d-pillar pr2" />
          </div>

          {/* Pintu masuk utama */}
          <div className="seat3d-entrance">
            <div className="seat3d-door" /><div className="seat3d-door" />
            <span>PINTU MASUK UTAMA</span>
          </div>
        </div>
      </div>

      {/* Legenda status kursi */}
      <div className="seat3d-legend">
        <span><i className="sw-paid" /><b>Terisi</b> (lunas)</span>
        <span><i className="sw-booked" /><b>Booking</b> (menunggu verifikasi)</span>
        <span><i className="sw-free" /><b>Kosong</b> (bisa dipesan)</span>
      </div>
      <p className="seat3d-note">
        Kursi <b>booking</b> akan menjadi <b>terisi</b> setelah pembayaran diverifikasi admin,
        atau kembali <b>kosong</b> jika ditolak. Seat dalam satu zona bebas dipilih peserta (first come, first served).
      </p>
    </div>
  );
}
