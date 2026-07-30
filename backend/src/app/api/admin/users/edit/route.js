import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// POST /api/admin/users/edit
export async function POST(request) {
  try {
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const body = await request.json();
    const { id, role, email } = body;

    if (!id || !role || !email) {
      return NextResponse.json({ error: "ID, Role, dan Email wajib diisi!" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const strTargetId = String(id);

    // Check uniqueness: 1 Email = 1 Akun across ALL tables
    // Check admins (exclude self if role is admin)
    const allAdmins = await query("SELECT id, username, email FROM admins");
    const duplicateAdmin = (allAdmins || []).find(a => 
      a.email && a.email.toLowerCase() === normalizedEmail && 
      !(role === "admin" && String(a.id) === strTargetId)
    );
    if (duplicateAdmin) {
      return NextResponse.json({
        error: `Email '${normalizedEmail}' sudah digunakan oleh akun Admin '${duplicateAdmin.username}'. 1 Email hanya untuk 1 Akun!`
      }, { status: 400 });
    }

    // Check staffs (exclude self if role is staff)
    const allStaffs = await query("SELECT id, username, email FROM staffs");
    const duplicateStaff = (allStaffs || []).find(s => 
      s.email && s.email.toLowerCase() === normalizedEmail && 
      !(role === "staff" && String(s.id) === strTargetId)
    );
    if (duplicateStaff) {
      return NextResponse.json({
        error: `Email '${normalizedEmail}' sudah digunakan oleh akun Staff '${duplicateStaff.username}'. 1 Email hanya untuk 1 Akun!`
      }, { status: 400 });
    }

    // Perform update
    const targetIdNum = parseInt(id, 10);
    if (role === "admin") {
      await query("UPDATE admins SET email = ? WHERE id = ?", [normalizedEmail, targetIdNum]);
    } else if (role === "staff") {
      await query("UPDATE staffs SET email = ? WHERE id = ?", [normalizedEmail, targetIdNum]);
    } else {
      return NextResponse.json({ error: "Role tidak valid!" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Email akun ${role.toUpperCase()} berhasil diperbarui menjadi ${normalizedEmail}!`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
