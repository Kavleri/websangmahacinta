import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

const getEnv = (key, fallback) => (process.env && process.env[key]) || fallback;
const QR_SECRET_SALT = getEnv("QR_SECRET_SALT", "dutaqu_secret_salt_2026");

// GET /api/check-status?query=value
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchVal = searchParams.get("query");

    if (!searchVal) {
      return NextResponse.json({ error: "Silakan masukkan nomor WhatsApp atau Kode Registrasi!" }, { status: 400 });
    }

    // 1. Fetch matching registrations
    const registrations = await query(
      "SELECT * FROM registrations WHERE registration_code = ? OR whatsapp = ?",
      [searchVal, searchVal]
    );

    if (!registrations || registrations.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch packages to map names
    const packages = await query("SELECT * FROM packages");

    const mappedResults = registrations.map(reg => {
      const pkg = packages.find(p => p.id === parseInt(reg.package_id, 10));
      const signature = crypto.createHmac("sha256", QR_SECRET_SALT).update(reg.registration_code).digest("hex");
      
      return {
        id: reg.id,
        registration_code: reg.registration_code,
        package_id: reg.package_id,
        package_name: pkg ? pkg.name : "Paket Tidak Diketahui",
        category: pkg ? pkg.category : null,
        seat_type: pkg ? pkg.seat_type : null,
        seat_numbers: reg.seat_numbers || null,
        name: reg.name,
        email: reg.email,
        whatsapp: reg.whatsapp,
        base_price: reg.base_price,
        unique_code: reg.unique_code,
        total_price: reg.total_price,
        status: reg.status,
        payment_proof: reg.payment_proof,
        checked_in: reg.checked_in === 1 || reg.checked_in === true || reg.checked_in === "1",
        checked_in_at: reg.checked_in_at,
        created_at: reg.created_at,
        voucher_code: reg.voucher_code || null,
        discount_amount: reg.discount_amount ? parseFloat(reg.discount_amount) : 0.00,
        qr_payload: `${reg.registration_code}:${signature}`
      };
    });

    return NextResponse.json(mappedResults);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

