import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const CATEGORY_QUOTA_DEFAULT = 100;
const CATEGORIES = ["economy", "reguler", "premium"];

// GET /api/packages — katalog paket + status kuota seat & jadwal war tiket real-time
export async function GET(request) {
  try {
    const packages = await query("SELECT * FROM packages");

    // Kuota per kategori (tabel ticket_quota; default 100 jika tidak tersedia)
    let quotaRows = [];
    try {
      quotaRows = await query("SELECT category, total_seats FROM ticket_quota");
    } catch (e) {
      console.warn("ticket_quota tidak terbaca, pakai default:", e.message);
    }
    const quotaByCategory = {};
    for (const row of quotaRows || []) {
      quotaByCategory[row.category] = parseInt(row.total_seats, 10);
    }

    // Hitung seat terpakai per kategori: registrasi pending + paid (couple = 2 seat)
    let regs = [];
    try {
      regs = await query("SELECT package_id, status FROM registrations");
    } catch (e) {
      console.warn("registrations tidak terbaca:", e.message);
    }
    const pkgById = {};
    for (const p of packages || []) pkgById[String(p.id)] = p;
    const takenByCategory = { economy: 0, reguler: 0, premium: 0 };
    const pendingByCategory = { economy: 0, reguler: 0, premium: 0 };
    for (const r of regs || []) {
      const p = pkgById[String(r.package_id)];
      if (!p || !p.category || !CATEGORIES.includes(p.category)) continue;
      if (r.status === "pending" || r.status === "paid") {
        takenByCategory[p.category] += p.seat_type === "couple" ? 2 : 1;
      }
      if (r.status === "pending") {
        pendingByCategory[p.category] += 1;
      }
    }

    const now = Date.now();
    const enriched = (packages || []).map((p) => {
      if (!p.category) return p;
      const total = quotaByCategory[p.category] ?? CATEGORY_QUOTA_DEFAULT;
      const taken = takenByCategory[p.category] || 0;
      const remaining = Math.max(0, total - taken);
      const seatsPerTicket = p.seat_type === "couple" ? 2 : 1;
      const releasedAtMs = p.released_at ? new Date(p.released_at).getTime() : 0;
      return {
        ...p,
        seats_total: total,
        seats_taken: taken,
        seats_remaining: remaining,
        seats_pending: pendingByCategory[p.category] || 0,
        seats_per_ticket: seatsPerTicket,
        is_released: releasedAtMs > 0 ? now >= releasedAtMs : true,
        is_sold_out: remaining < seatsPerTicket
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/packages (Admin modify packages)
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, price, description } = body;

    if (!id || !name || price === undefined || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      "UPDATE packages SET name = ?, price = ?, description = ? WHERE id = ?",
      [name, parseFloat(price), description, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
