import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// POST /api/admin/verify
export async function POST(request) {
  try {
    // Verify admin authorization
    const authError = requireAdmin(request, NextResponse);
    if (authError) return authError;
    const body = await request.json();
    const { id, status } = body; // status: 'paid' or 'rejected'

    if (!id || !status) {
      return NextResponse.json({ error: "Missing registration ID or status" }, { status: 400 });
    }

    if (status !== "paid" && status !== "rejected" && status !== "pending") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const result = await query(
      "UPDATE registrations SET status = ? WHERE id = ?",
      [status, parseInt(id, 10)]
    );

    return NextResponse.json({
      success: true,
      message: `Registrasi berhasil diupdate menjadi ${status}!`,
      result
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
