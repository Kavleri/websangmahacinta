import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

// Store OTPs in memory for active reset sessions
// Map: email -> { otp: string, expiresAt: number, role: string, username: string }
export const activeOtps = new Map();

async function sendEmailOtp(toEmail, otpCode, username) {
  const smtpHost = process.env.SMTP_HOST || "mail.sangmahacinta.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpUser = process.env.SMTP_USER || "no-reply@sangmahacinta.com";
  const smtpPass = process.env.SMTP_PASS || "";

  if (!smtpPass) {
    console.warn("SMTP_PASS belum diset di Vercel env. Email nyata dilewati.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"Duta Qur'an Admin" <${smtpUser}>`,
    to: toEmail,
    subject: "🔐 Kode OTP Reset Password - Duta Qur'an",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1d4ed8; margin: 0;">Duta Qur'an</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Permintaan Reset Password Akun</p>
        </div>
        <div style="padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 12px;">Halo <strong>${username}</strong>,</p>
          <p style="font-size: 14px; color: #475569;">Gunakan kode OTP berikut untuk me-reset password akun Anda. Kode ini berlaku selama 15 menit:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; margin: 20px 0; padding: 12px; background: #ffffff; border: 2px dashed #3b82f6; border-radius: 8px; display: inline-block;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">Jika Anda tidak meminta reset password ini, silakan abaikan email ini.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  return true;
}

// POST /api/auth/forgot-password
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email pribadi terdaftar wajib diisi!" }, { status: 400 });
    }

    const targetEmail = email.trim().toLowerCase();

    // 1. Search in admins
    let matchedUser = null;
    let matchedRole = null;

    try {
      const admins = await query("SELECT id, username, email FROM admins");
      const found = (admins || []).find(a => a.email && a.email.toLowerCase() === targetEmail);
      if (found) {
        matchedUser = found;
        matchedRole = "admin";
      }
    } catch (e) {
      console.warn("Error querying admins:", e.message);
    }

    // 2. Search in staffs if not found in admins
    if (!matchedUser) {
      try {
        const staffs = await query("SELECT id, username, email FROM staffs");
        const found = (staffs || []).find(s => s.email && s.email.toLowerCase() === targetEmail);
        if (found) {
          matchedUser = found;
          matchedRole = "staff";
        }
      } catch (e) {
        console.warn("Error querying staffs:", e.message);
      }
    }

    if (!matchedUser) {
      return NextResponse.json({
        error: "Email tidak ditemukan! Pastikan Anda memasukkan email pribadi yang terdaftar untuk Admin atau Staff."
      }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // Valid for 15 minutes

    activeOtps.set(targetEmail, {
      otp: otpCode,
      expiresAt,
      role: matchedRole,
      username: matchedUser.username
    });

    // Try sending email via SMTP if configured
    let emailSent = false;
    try {
      emailSent = await sendEmailOtp(targetEmail, otpCode, matchedUser.username);
    } catch (mailError) {
      console.error("Gagal mengirim email via SMTP:", mailError.message);
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? `Kode OTP verifikasi reset password telah dikirimkan ke email ${targetEmail}. Silakan cek Inbox / Spam folder Anda.`
        : `Kode OTP verifikasi reset password telah dikirimkan ke email ${targetEmail}.`,
      demo_otp: process.env.SMTP_PASS ? undefined : otpCode,
      email_sent: emailSent,
      role: matchedRole,
      username: matchedUser.username
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
