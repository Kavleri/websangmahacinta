import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminOrStaff } from "@/lib/auth";
import crypto from "crypto";

const getEnv = (key, fallback) => (process.env && process.env[key]) || fallback;
const QR_SECRET_SALT = getEnv("QR_SECRET_SALT", "dutaqu_secret_salt_2026");

// POST /api/admin/scan-checkin
export async function POST(request) {
  try {
    // Verify admin or staff authorization
    const authError = requireAdminOrStaff(request, NextResponse);
    if (authError) return authError;
    const body = await request.json();
    const { registration_code } = body;

    if (!registration_code) {
      return NextResponse.json({ error: "Kode registrasi tiket tidak ditemukan dalam scan!" }, { status: 400 });
    }

    let finalCode = registration_code.trim();

    // 1. Verify digital signature if present (e.g. format CODE:SIGNATURE)
    if (finalCode.includes(":")) {
      const parts = finalCode.split(":");
      const code = parts[0];
      const sig = parts[1];

      const expectedSig = crypto.createHmac("sha256", QR_SECRET_SALT).update(code).digest("hex");
      if (sig !== expectedSig) {
        return NextResponse.json({
          success: false,
          error: "Tiket Palsu / Invalid!",
          message: "Tanda tangan digital QR Code tidak cocok. Tiket ini tidak sah dan kemungkinan hasil manipulasi!"
        }, { status: 400 });
      }
      finalCode = code; // Use the verified code
    }

    // 2. Fetch registration
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

    // 3. Check if payment is paid
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

