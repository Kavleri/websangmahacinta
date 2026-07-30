import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/vouchers/apply
export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Kode voucher harus diisi!" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // 1. Fetch voucher from DB
    const vouchers = await query(
      "SELECT * FROM vouchers WHERE code = ?",
      [normalizedCode]
    );

    if (!vouchers || vouchers.length === 0) {
      return NextResponse.json({ error: "Kode voucher tidak valid!" }, { status: 404 });
    }

    const voucher = vouchers[0];

    // 2. Check if expired
    if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
      return NextResponse.json({ error: "Voucher telah kedaluwarsa!" }, { status: 400 });
    }

    // 3. Check if max uses reached
    if (voucher.max_uses !== null && voucher.used_count >= voucher.max_uses) {
      return NextResponse.json({ error: "Kuota penggunaan voucher telah habis!" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: parseFloat(voucher.discount_value)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
