import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/staff/login
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan Password wajib diisi!" }, { status: 400 });
    }

    const staffs = await query(
      "SELECT * FROM staffs WHERE username = ?",
      [username]
    );

    if (!staffs || staffs.length === 0) {
      return NextResponse.json({ error: "Username staff tidak ditemukan!" }, { status: 401 });
    }

    const staff = staffs[0];

    // Check password (direct match for simple local setup or hashed checking)
    if (staff.password_hash !== password) {
      return NextResponse.json({ error: "Password staff salah!" }, { status: 401 });
    }

    // Generate a simple token (mock authentication)
    const token = `dutaquran_staff_token_${Buffer.from(username + ":" + Date.now()).toString("base64")}`;

    return NextResponse.json({
      success: true,
      message: "Login staff berhasil!",
      token,
      staff: {
        id: staff.id,
        username: staff.username
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
