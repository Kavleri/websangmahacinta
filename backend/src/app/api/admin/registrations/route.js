import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/registrations
export async function GET(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;
    const registrations = await query(
      "SELECT * FROM registrations ORDER BY created_at DESC"
    );

    const packages = await query("SELECT * FROM packages");

    const mappedResults = registrations.map(reg => {
      const pkg = packages.find(p => p.id === parseInt(reg.package_id, 10));
      return {
        id: reg.id,
        registration_code: reg.registration_code,
        package_id: reg.package_id,
        package_name: pkg ? pkg.name : "Paket Tidak Diketahui",
        category: pkg ? pkg.category : null,
        seat_type: pkg ? pkg.seat_type : null,
        seat_numbers: reg.seat_numbers || null,
        has_proof: !!reg.payment_proof,
        name: reg.name,
        email: reg.email,
        whatsapp: reg.whatsapp,
        base_price: reg.base_price,
        unique_code: reg.unique_code,
        total_price: reg.total_price,
        status: reg.status,
        checked_in: reg.checked_in === 1 || reg.checked_in === true || reg.checked_in === "1" || reg.checked_in === 1,
        checked_in_at: reg.checked_in_at,
        created_at: reg.created_at
      };
    });

    return NextResponse.json(mappedResults);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/registrations?id=XX — hapus permanen registrasi yang DITOLAK
// (hanya rejected; pending/paid tidak boleh dihapus dari sini agar data transaksi aman)
export async function DELETE(request) {
  try {
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"), 10);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "ID registrasi tidak valid!" }, { status: 400 });
    }

    const rows = await query("SELECT id, status, registration_code FROM registrations WHERE id = ?", [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Registrasi tidak ditemukan!" }, { status: 404 });
    }
    if (rows[0].status !== "rejected") {
      return NextResponse.json({ error: "Hanya pendaftaran berstatus DITOLAK yang bisa dihapus." }, { status: 400 });
    }

    await query("DELETE FROM registrations WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: `Registrasi ${rows[0].registration_code} (ditolak) telah dihapus permanen.`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
