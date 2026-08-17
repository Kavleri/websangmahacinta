import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminOrStaff } from "@/lib/auth";

// GET /api/admin/proof?id=<registration_id>
// Mengambil SATU bukti transfer (data-URI) milik pendaftar — dipanggil saat admin klik "Lihat Bukti".
// (Terpisah dari daftar supaya respons list tidak membawa base64 ratusan KB.)
export async function GET(request) {
  try {
    const authError = requireAdminOrStaff(request, NextResponse);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id"), 10);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "ID registrasi tidak valid!" }, { status: 400 });
    }

    const rows = await query("SELECT payment_proof FROM registrations WHERE id = ?", [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Registrasi tidak ditemukan!" }, { status: 404 });
    }
    if (!rows[0].payment_proof) {
      return NextResponse.json({ error: "Pendaftar ini belum mengunggah bukti transfer." }, { status: 404 });
    }

    return NextResponse.json({ payment_proof: rows[0].payment_proof });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
