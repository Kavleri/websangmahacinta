import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminOrStaff } from "@/lib/auth";
import { parseQrInput } from "@/lib/qr";

// POST /api/admin/scan-checkin
export async function POST(request) {
  try {
    // Verify admin or staff authorization
    const authError = requireAdminOrStaff(request, NextResponse);
    if (authError) return authError;
    const body = await request.json();
    const { registration_code, scan_mode = "manual" } = body;

    if (!registration_code) {
      return NextResponse.json({ error: "Kode registrasi tiket tidak ditemukan dalam scan!" }, { status: 400 });
    }

    const parsed = parseQrInput(registration_code);
    if (scan_mode === "qr" && (!parsed.valid || !parsed.signed)) {
      return NextResponse.json({
        success: false,
        error: "QR Code Tidak Valid!",
        message: "Scanner hanya menerima QR E-Tiket resmi yang diterbitkan setelah pembayaran disetujui."
      }, { status: 400 });
    }
    if (!parsed.valid) {
      return NextResponse.json({
        success: false,
        error: "Tiket Palsu / Invalid!",
        message: "QR Code tidak valid atau telah dimanipulasi. Minta peserta membuka E-Tiket terbaru dari halaman Cek Tiket."
      }, { status: 400 });
    }
    const finalCode = parsed.code;

    // Fetch registration berdasarkan kode dari QR/input manual
    const registrations = await query(
      "SELECT * FROM registrations WHERE registration_code = ?",
      [finalCode]
    );

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Tiket Tidak Valid!",
        message: "Kode registrasi tidak terdaftar dalam sistem."
      }, { status: 404 });
    }

    const reg = registrations[0];

    // QR versi baru mengikat ID database + kode registrasi.
    // Jika salah satu tidak cocok, QR dianggap hasil manipulasi.
    if (parsed.signed && parsed.version === 1 && parsed.id !== reg.id) {
      return NextResponse.json({
        success: false,
        error: "Tiket Palsu / Invalid!",
        message: "QR Code tidak cocok dengan data registrasi di database."
      }, { status: 400 });
    }

    // Check if payment is paid
    if (reg.status !== "paid") {
      return NextResponse.json({
        success: false,
        error: "Pembayaran Belum Dikonfirmasi!",
        message: `Status tiket saat ini adalah '${reg.status}'. Mohon selesaikan verifikasi pembayaran terlebih dahulu.`
      }, { status: 400 });
    }

    // 4. Check if already checked in
    const isCheckedIn = reg.checked_in === 1 || reg.checked_in === true || reg.checked_in === "1";
    if (isCheckedIn) {
      const checkInTime = reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleTimeString("id-ID") : "Sebelumnya";
      return NextResponse.json({
        success: false,
        error: "Tiket Sudah Terpakai!",
        message: `Tiket atas nama "${reg.name}" sudah melakukan check-in pada pukul ${checkInTime}.`
      }, { status: 400 });
    }

    // 5. Perform check-in
    const nowISO = new Date().toISOString();
    await query(
      "UPDATE registrations SET checked_in = TRUE, checked_in_at = ? WHERE registration_code = ?",
      [nowISO, finalCode]
    );

    // Fetch package name for success details
    const packages = await query("SELECT * FROM packages");
    const pkg = packages.find(p => p.id === parseInt(reg.package_id, 10));

    return NextResponse.json({
      success: true,
      message: "Check-in Berhasil!",
      guest: {
        name: reg.name,
        whatsapp: reg.whatsapp,
        package_name: pkg ? pkg.name : "Paket Tidak Diketahui",
        category: pkg ? pkg.category : null,
        seat_type: pkg ? pkg.seat_type : null,
        seat_numbers: reg.seat_numbers || null,
        checked_in_at: nowISO
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

