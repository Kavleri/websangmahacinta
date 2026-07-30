import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/vouchers
export async function GET(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const vouchers = await query("SELECT * FROM vouchers ORDER BY created_at DESC");
    return NextResponse.json(vouchers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/vouchers
export async function POST(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const body = await request.json();
    const { code, discount_type, discount_value, max_uses } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: "Data kode, tipe diskon, dan nilai wajib diisi!" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check if voucher code already exists
    const existing = await query("SELECT id FROM vouchers WHERE code = ?", [normalizedCode]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Kode voucher sudah terdaftar!" }, { status: 400 });
    }

    // Insert new voucher
    const result = await query(
      "INSERT INTO vouchers (code, discount_type, discount_value, max_uses) VALUES (?, ?, ?, ?)",
      [
        normalizedCode,
        discount_type,
        parseFloat(discount_value),
        max_uses ? parseInt(max_uses, 10) : null
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Voucher berhasil dibuat!",
      voucherId: result.insertId
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/vouchers?id=X
export async function DELETE(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID voucher wajib disertakan!" }, { status: 400 });
    }

    await query("DELETE FROM vouchers WHERE id = ?", [parseInt(id, 10)]);

    return NextResponse.json({
      success: true,
      message: "Voucher berhasil dihapus!"
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
