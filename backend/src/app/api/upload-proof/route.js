import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";

// POST /api/upload-proof
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const regCode = formData.get("registration_code");

    if (!file || !regCode) {
      return NextResponse.json({ error: "File bukti transfer dan Kode Registrasi wajib diunggah!" }, { status: 400 });
    }

    // Validate registration exists
    const registrations = await query(
      "SELECT * FROM registrations WHERE registration_code = ?",
      [regCode]
    );

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ error: "Kode registrasi tidak ditemukan!" }, { status: 404 });
    }

    // File buffer extraction
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save directory configuration
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate safe filename
    const fileExtension = file.name.split(".").pop();
    const safeFilename = `proof_${regCode}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, safeFilename);

    // Write file to path
    fs.writeFileSync(filePath, buffer);

    // Save relative path for frontend access (served statically by Next.js)
    const publicPath = `/uploads/${safeFilename}`;

    // Update DB
    await query(
      "UPDATE registrations SET payment_proof = ? WHERE registration_code = ?",
      [publicPath, regCode]
    );

    return NextResponse.json({
      success: true,
      message: "Bukti transfer berhasil diunggah!",
      payment_proof: publicPath
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export const config = {
  api: {
    bodyParser: false, // Disallow standard parsing to allow file data streaming
  },
};
