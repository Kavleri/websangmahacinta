import React from "react";

/**
 * SeatMap3D — Peta kursi aula 3D (CSS murni, tanpa gambar/library)
 * Mengikuti layout asli aula 300 seat (theater mode):
 * - Panggung di sisi depan
 * - Premium (emas) 100 seat paling dekat panggung
 * - Reguler (biru) 100 seat di tengah
 * - Economy (hijau) 100 seat paling belakang
 * - Lorong tengah membagi tiap zona jadi kiri-kanan
 * - 4 tiang struktural di kiri-kanan aula
 * - Pintu masuk utama di sisi belakang (dekat economy)
 */
const ZONES = [
  { cat: "premium", label: "Premium", color: "#f59e0b", dark: "#b45309", rows: 5, perRow: 20 },
  { cat: "reguler", label: "Reguler", color: "#2563eb", dark: "#1d4ed8", rows: 5, perRow: 20 },
  { cat: "economy", label: "Economy", color: "#10b981", dark: "#047857", rows: 5, perRow: 20 }
];

export default function SeatMap3D({ categoryStats }) {
  const stat = (cat) => {
    const st = categoryStats[cat] || { total: 100, taken: 0, remaining: 100 };
    const taken = Math.min(st.taken || 0, st.total);
    return { ...st, taken };
  };

  return (
    <div className="seat3d-wrap">
      {/* Lampu atmosfer aula */}
      <div className="seat3d-glow seat3d-glow-l" />
      <div className="seat3d-glow seat3d-glow-r" />

      <div className="seat3d-scene">
        <div className="seat3d-world">

          {/* ===== PLAFON LENTERA (khas aula masjid) ===== */}
          <div className="seat3d-dome">
            <div className="seat3d-dome-top" />
            <div className="seat3d-dome-light" />
          </div>

          {/* ===== DINDING BELAKANG + PANGGUNG ===== */}
          <div className="seat3d-backwall">
            <div className="seat3d-mihrab" />
          </div>
          <div className="seat3d-stage">
            <div className="seat3d-stage-top" />
            <div className="seat3d-stage-face">
              <span>PANGGUNG</span>
            </div>
            <div className="seat3d-stage-skirt" />
          </div>

          {/* ===== 4 TIANG STRUKTURAL ===== */}
          <div className="seat3d-pillar seat3d-pillar-fl" ><i /><i /></div>
          <div className="seat3d-pillar seat3d-pillar-fr" ><i /><i /></div>
          <div className="seat3d-pillar seat3d-pillar-bl" ><i /><i /></div>
          <div className="seat3d-pillar seat3d-pillar-br" ><i /><i /></div>

          {/* ===== ZONA KURSI (floor miring perspektif) ===== */}
          <div className="seat3d-floor">
            {/* Karpet aula — paling bawah (dirender dulu) */}
            <div className="seat3d-carpet" />

            {ZONES.map((z, zi) => {
              const st = stat(z.cat);
              const seats = [];
              const half = z.perRow / 2; // 10 kiri + 10 kanan per baris
              for (let row = 0; row < z.rows; row++) {
                for (let col = 0; col < z.perRow; col++) {
                  const idx = row * z.perRow + col;
                  seats.push(
                    <span
                      key={idx}
                      className={`seat3d-seat${idx < st.taken ? " taken" : ""}${row === 0 ? " front" : ""}`}
                      style={{
                        left: `${(col < half ? 1 + col * 4.2 : 57 + (col - half) * 4.2)}%`,
                        top: `${row * 19.5}%`,
                        "--c": z.color,
                        "--cd": z.dark
                      }}
                    />
                  );
                }
              }
              return (
                <div key={z.cat} className="seat3d-zone" style={{ top: `${14 + zi * 28}%` }}>
                  <div
                    className="seat3d-zone-floor"
                    style={{ background: `linear-gradient(180deg, ${z.color}22, ${z.color}0d)`, borderColor: z.color, boxShadow: `inset 0 0 24px rgba(0,0,0,0.22), 0 0 0 1px ${z.color}44` }}
                  >
                    {seats}
                  </div>
                </div>
              );
            })}

            {/* Label zona: anak langsung world agar berdiri tegak (preserve-3d) */}
            {ZONES.map((z, zi) => {
              const st = stat(z.cat);
              return (
                <div
                  key={z.cat + "-tag"}
                  className="seat3d-zone-tag"
                  style={{ top: `${40 + zi * 28}%`, background: z.color }}
                >
                  {z.label} — sisa {st.total - st.taken} seat
                </div>
              );
            })}

            {/* Lorong tengah — di atas zona (karpet sudah dirender duluan) */}
            <div className="seat3d-aisle" />
          </div>

          {/* ===== PINTU MASUK ===== */}
          <div className="seat3d-entrance">
            <div className="seat3d-door" /><div className="seat3d-door door-r" />
            <span>PINTU MASUK UTAMA</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <span><i style={{ background: "#f59e0b" }} />Premium (dekat panggung)</span>
        <span><i style={{ background: "#2563eb" }} />Reguler (tengah)</span>
        <span><i style={{ background: "#10b981" }} />Economy (belakang)</span>
        <span><i className="lg-taken" />terisi = sudah diambil peserta</span>
      </div>
      <p className="seat3d-note">
        *Denah 3D ilustrasi mengikuti layout aula (300 seat, mode theater, lorong tengah, 4 tiang struktural).
        Seat dalam satu zona bebas dipilih peserta (first come, first served).
      </p>
    </div>
  );
}
