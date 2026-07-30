import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/admin/login
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan Password wajib diisi!" }, { status: 400 });
    }

    const admins = await query(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );

    if (!admins || admins.length === 0) {
      return NextResponse.json({ error: "Username tidak ditemukan!" }, { status: 401 });
    }

    const admin = admins[0];

    // Check password (direct match for simple local setup or hashed checking)
    if (admin.password_hash !== password) {
      return NextResponse.json({ error: "Password salah!" }, { status: 401 });
    }

    // Generate a simple token (mock authentication)
    const token = `dutaquran_admin_token_${Buffer.from(username + ":" + Date.now()).toString("base64")}`;

    return NextResponse.json({
      success: true,
      message: "Login admin berhasil!",
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
