import React from "react";

/**
 * SeatMap3D — Peta kursi aula 3D interaktif (CSS murni), dilihat dari pintu masuk.
 * Layout aula 300 seat (theater): panggung depan, Premium 100 (emas), Reguler 100 (biru),
 * Economy 100 (hijau), lorong tengah, 4 tiang, pintu masuk belakang.
 *
 * Status kursi (pembayaran manual, diverifikasi admin):
 * - paid    : terisi/lunas → solid warna zona + glow
 * - booked  : booking (pending verifikasi) → ungu
 * - free    : kosong → putih (bisa diklik saat mode pilih kursi)
 * - selected: kursi pilihan user saat ini → putih bercahaya
 *
 * Interaktif: saat selectMode aktif ({cat, need}), kursi kosong di zona tsb bisa diklik.
 */
const ZONES = [
  { cat: "premium", label: "PREMIUM", color: "#f59e0b", dark: "#b45309" },
  { cat: "reguler", label: "REGULER", color: "#2563eb", dark: "#1d4ed8" },
  { cat: "economy", label: "ECONOMY", color: "#10b981", dark: "#047857" }
];
// Layout sesuai diagram aula 25x25m: tiap zona 15 kursi/baris = 7 kiri + 8 kanan
// (dipisah lorong tengah 2,5m), 7 baris (15x7=105 -> disesuaikan 100), lorong samping 2,5m.
const ROWS = 7;
const PER_ROW = 15;
const ZONE_TOP = [13, 41, 69];
const ZONE_H = 26;

export const seatLabel = (cat, idx) => `${(cat || "x").charAt(0).toUpperCase()}-${idx + 1}`;

// Blok kiri kolom 0-6 (x 8-36%), lorong tengah (40-58%), blok kanan kolom 7-14 (x 60-92%)
function seatPos(col, row) {
  const x = col < 7 ? 8 + col * 4.7 : 60 + (col - 7) * 4.4;
  const y = 10 + row * 12.2;
  return { x, y };
}

// Mode FLAT (fullscreen HP): denah 2D — baris sangat renggang (tiap baris = 13.3% zona,
// tinggi kursi ~2.8% zona) sehingga TIDAK ADA baris yang menutup baris lain. Akurat utk jari.
function seatPosFlat(col, row) {
  const x = col < 7 ? 6 + col * 5.0 : 59 + (col - 7) * 5.0;
  const y = 8 + row * 13.4;
  return { x, y };
}

// Gabungkan kursi eksplisit (paid/booked index) + legacy (isi otomatis dari index terendah yang kosong)
export function buildStates(map) {
  const st = Array(105).fill("free");
  const m = map || {};
  (m.paid || []).forEach((n) => { if (n >= 0 && n < 105) st[n] = "paid"; });
  (m.booked || []).forEach((n) => { if (n >= 0 && n < 105 && st[n] === "free") st[n] = "booked"; });
  let legacyPaid = m.legacyPaid || 0;
  let legacyBooked = m.legacyBooked || 0;
  for (let i = 0; i < 105 && (legacyPaid > 0 || legacyBooked > 0); i++) {
    if (st[i] !== "free") continue;
    if (legacyPaid > 0) { st[i] = "paid"; legacyPaid--; }
    else { st[i] = "booked"; legacyBooked--; }
  }
  return st;
}

export default function SeatMap3D({ seatsMaps = {}, selectMode = null, selected = [], onSeatClick, wrapClass = "", flat = false }) {
  const zoneState = (cat) => {
    const st = categoryFreeCount(cat, seatsMaps[cat]);
    return st;
  };
  const categoryFreeCount = (cat, map) => {
    const states = buildStates(map);
    return { states, free: states.filter((s) => s === "free").length };
  };

  return (
    <div className={`seat3d-wrap${wrapClass ? " " + wrapClass : ""}`}>
      <div className="seat3d-scene">
        <div className="seat3d-world">

          <div className="seat3d-backwall">
            <div className="seat3d-mihrab" />
          </div>
          <div className="seat3d-dome" />

          <div className="seat3d-stage">
            <div className="seat3d-stage-top" />
            <div className="seat3d-stage-face"><span>PANGGUNG</span></div>
          </div>

          <div className="seat3d-floor">
            <div className="seat3d-carpet" />
            <div className="seat3d-aisle" />

            {ZONES.map((z, zi) => {
              const { states, free } = zoneState(z.cat);
              const active = selectMode && selectMode.cat === z.cat;
              const seats = [];
              for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < PER_ROW; col++) {
                  const idx = row * PER_ROW + col;
                  const { x, y } = flat ? seatPosFlat(col, row) : seatPos(col, row);
                  const isSelected = active && selected.includes(idx);
                  let state = states[idx];
                  if (isSelected) state = "selected";
                  const clickable = active && states[idx] === "free" && !!onSeatClick;
                  seats.push(
                    <span
                      key={idx}
                      className={`seat3d-seat ${state}${clickable ? " pickable" : ""}`}
                      style={{ left: `${x}%`, top: `${y}%`, "--c": z.color, "--cd": z.dark }}
                      onClick={clickable ? () => onSeatClick(z.cat, idx) : undefined}
                      title={active ? `${seatLabel(z.cat, idx)} — ${state === "free" ? "kosong (klik untuk pilih)" : state === "paid" ? "terisi (lunas)" : "booking (menunggu verifikasi)"}` : seatLabel(z.cat, idx)}
                    />
                  );
                }
              }
              return (
                <div
                  key={z.cat}
                  className={`seat3d-zone${active ? " zone-active" : ""}${selectMode && !active ? " zone-dim" : ""}`}
                  style={{ top: `${ZONE_TOP[zi]}%`, height: `${ZONE_H}%`, borderColor: `${z.color}66`, background: `linear-gradient(180deg, ${z.color}14, ${z.color}08)` }}
                >
                  {seats}
                </div>
              );
            })}

            {ZONES.map((z, zi) => {
              const { free } = zoneState(z.cat);
              return (
                <div key={z.cat + "-plate"} className="seat3d-plate" style={{ top: `${ZONE_TOP[zi] - 1.5}%`, background: z.color }}>
                  {z.label} <em>· sisa {free}</em>
                </div>
              );
            })}

            <div className="seat3d-pillar pl1" />
            <div className="seat3d-pillar pr1" />
            <div className="seat3d-pillar pl2" />
            <div className="seat3d-pillar pr2" />
          </div>

          <div className="seat3d-entrance">
            <div className="seat3d-door" /><div className="seat3d-door" />
            <span>PINTU MASUK UTAMA</span>
          </div>
        </div>
      </div>

      <div className="seat3d-legend">
        <span><i className="sw-selected" /><b>Pilihanmu</b></span>
        <span><i className="sw-booked" /><b>Booking</b> (menunggu verifikasi)</span>
        <span><i className="sw-paid" /><b>Terisi</b> (lunas)</span>
        <span><i className="sw-free" /><b>Kosong</b> (bisa dipilih)</span>
      </div>
      <p className="seat3d-note">
        Klik kursi <b>kosong</b> pada zona pilihanmu untuk memilih seat. Kursi <b>booking</b> menjadi <b>terisi</b>
        setelah pembayaran diverifikasi admin, atau kembali <b>kosong</b> jika ditolak.
      </p>
    </div>
  );
}
