import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/users
export async function GET(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    // 1. Fetch admins
    const admins = await query("SELECT id, username, email, created_at FROM admins");
    const mappedAdmins = admins.map(a => ({
      id: a.id,
      username: a.username,
      email: a.email || "-",
      role: "admin",
      created_at: a.created_at
    }));

    // 2. Fetch staffs
    const staffs = await query("SELECT id, username, email, created_at FROM staffs");
    const mappedStaffs = staffs.map(s => ({
      id: s.id,
      username: s.username,
      email: s.email || "-",
      role: "staff",
      created_at: s.created_at
    }));

    // 3. Combine and return
    const allUsers = [...mappedAdmins, ...mappedStaffs];
    return NextResponse.json(allUsers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/users
export async function POST(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const body = await request.json();
    const { username, email, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Username, Password, dan Hak Akses (Role) wajib diisi!" }, { status: 400 });
    }

    if (role !== "admin" && role !== "staff") {
      return NextResponse.json({ error: "Hak akses tidak valid!" }, { status: 400 });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // Check email uniqueness across ALL tables (1 Email = 1 Akun)
    if (normalizedEmail) {
      const allAdmins = await query("SELECT id, username, email FROM admins");
      const dupAdmin = (allAdmins || []).find(a => a.email && a.email.toLowerCase() === normalizedEmail);
      if (dupAdmin) {
        return NextResponse.json({
          error: `Email '${normalizedEmail}' sudah terdaftar pada akun Admin (${dupAdmin.username}). 1 Email hanya untuk 1 Akun!`
        }, { status: 400 });
      }

      const allStaffs = await query("SELECT id, username, email FROM staffs");
      const dupStaff = (allStaffs || []).find(s => s.email && s.email.toLowerCase() === normalizedEmail);
      if (dupStaff) {
        return NextResponse.json({
          error: `Email '${normalizedEmail}' sudah terdaftar pada akun Staff (${dupStaff.username}). 1 Email hanya untuk 1 Akun!`
        }, { status: 400 });
      }
    }

    if (role === "admin") {
      // Check duplicate username
      const allAdmins = await query("SELECT id, username FROM admins");
      const existing = (allAdmins || []).find(a => a.username === normalizedUsername);
      if (existing) {
        return NextResponse.json({ error: "Username admin sudah terdaftar!" }, { status: 400 });
      }

      // Insert
      await query(
        "INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)",
        [normalizedUsername, normalizedEmail, password]
      );
    } else {
      // Check duplicate username
      const allStaffs = await query("SELECT id, username FROM staffs");
      const existing = (allStaffs || []).find(s => s.username === normalizedUsername);
      if (existing) {
        return NextResponse.json({ error: "Username staff sudah terdaftar!" }, { status: 400 });
      }

      // Insert
      await query(
        "INSERT INTO staffs (username, email, password_hash) VALUES (?, ?, ?)",
        [normalizedUsername, normalizedEmail, password]
      );
    }

    return NextResponse.json({
      success: true,
      message: `User dengan hak akses ${role} berhasil dibuat!`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=X&role=Y
export async function DELETE(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");

    if (!id || !role) {
      return NextResponse.json({ error: "ID dan Role user wajib ditentukan!" }, { status: 400 });
    }

    if (role === "admin") {
      // Safety check: Don't let them delete the last admin
      const admins = await query("SELECT id FROM admins");
      if (admins.length <= 1) {
        return NextResponse.json({ error: "Tidak dapat menghapus admin terakhir!" }, { status: 400 });
      }

      await query("DELETE FROM admins WHERE id = ?", [parseInt(id, 10)]);
    } else if (role === "staff") {
      await query("DELETE FROM staffs WHERE id = ?", [parseInt(id, 10)]);
    } else {
      return NextResponse.json({ error: "Role tidak valid!" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus!"
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
