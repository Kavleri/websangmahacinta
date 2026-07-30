import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// POST /api/admin/users/reset
export async function POST(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const body = await request.json();
    const { id, role, new_password } = body;

    if (!id || !role || !new_password) {
      return NextResponse.json({ error: "ID, Role, dan Password Baru wajib diisi!" }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter!" }, { status: 400 });
    }

    if (role === "admin") {
      await query("UPDATE admins SET password_hash = ? WHERE id = ?", [new_password, parseInt(id, 10)]);
    } else if (role === "staff") {
      await query("UPDATE staffs SET password_hash = ? WHERE id = ?", [new_password, parseInt(id, 10)]);
    } else {
      return NextResponse.json({ error: "Role tidak valid!" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Password akun ${role} berhasil diperbarui oleh Admin!`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
