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
        name: reg.name,
        email: reg.email,
        whatsapp: reg.whatsapp,
        base_price: reg.base_price,
        unique_code: reg.unique_code,
        total_price: reg.total_price,
        status: reg.status,
        payment_proof: reg.payment_proof,
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
