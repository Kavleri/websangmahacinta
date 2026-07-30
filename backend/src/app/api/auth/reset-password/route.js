import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { activeOtps } from "../forgot-password/route";

// POST /api/auth/reset-password
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp_code, new_password } = body;

    if (!email || !otp_code || !new_password) {
      return NextResponse.json({ error: "Email, Kode OTP, dan Password Baru wajib diisi!" }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter!" }, { status: 400 });
    }

    const targetEmail = email.trim().toLowerCase();
    const session = activeOtps.get(targetEmail);

    if (!session) {
      return NextResponse.json({ error: "Sesi reset password tidak ditemukan atau telah kedaluwarsa. Silakan minta OTP baru." }, { status: 400 });
    }

    if (Date.now() > session.expiresAt) {
      activeOtps.delete(targetEmail);
      return NextResponse.json({ error: "Kode OTP telah kedaluwarsa (lebih dari 15 menit). Silakan minta OTP baru." }, { status: 400 });
    }

    if (session.otp !== otp_code.trim()) {
      return NextResponse.json({ error: "Kode OTP yang Anda masukkan salah!" }, { status: 400 });
    }

    // Find the user and update password
    const role = session.role;
    const username = session.username;

    if (role === "admin") {
      const allAdmins = await query("SELECT id, username, email FROM admins");
      const target = (allAdmins || []).find(a => a.username === username || (a.email && a.email.toLowerCase() === targetEmail));
      if (target) {
        await query("UPDATE admins SET password_hash = ? WHERE id = ?", [new_password, target.id]);
      }
    } else {
      const allStaffs = await query("SELECT id, username, email FROM staffs");
      const target = (allStaffs || []).find(s => s.username === username || (s.email && s.email.toLowerCase() === targetEmail));
      if (target) {
        await query("UPDATE staffs SET password_hash = ? WHERE id = ?", [new_password, target.id]);
      }
    }

    // Clear active OTP
    activeOtps.delete(targetEmail);

    return NextResponse.json({
      success: true,
      message: `Password akun ${role.toUpperCase()} (${username}) berhasil diperbarui! Silakan login dengan password baru Anda.`,
      role,
      username
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
