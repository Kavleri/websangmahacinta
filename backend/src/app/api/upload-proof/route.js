import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/upload-proof — simpan bukti transfer sebagai data-URI di database.
// (Filesystem Vercel read-only, file fisik tidak persisten — DB adalah sumber kebenaran.)
const MAX_BYTES = 1_500_000; // ~1.5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const regCode = formData.get("registration_code");

    if (!file || !regCode) {
      return NextResponse.json({ error: "File bukti transfer dan Kode Registrasi wajib diunggah!" }, { status: 400 });
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Format file harus JPG, PNG, atau WebP." }, { status: 400 });
    }

    const registrations = await query(
      "SELECT * FROM registrations WHERE registration_code = ?",
      [regCode]
    );
    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ error: "Kode registrasi tidak ditemukan!" }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Ukuran file maksimal 1.5MB. Silakan kecilkan dulu." }, { status: 400 });
    }

    const b64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type || "image/jpeg"};base64,${b64}`;

    await query(
      "UPDATE registrations SET payment_proof = ? WHERE registration_code = ?",
      [dataUri, regCode]
    );

    return NextResponse.json({
      success: true,
      message: "Bukti transfer berhasil disimpan!",
      payment_proof: dataUri
    }, { headers: CORS });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }
}
