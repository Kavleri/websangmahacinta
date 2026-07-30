const nodemailer = require("nodemailer");

async function testSmtp() {
  const transporter = nodemailer.createTransport({
    host: "mail.sangmahacinta.com",
    port: 465,
    secure: true,
    auth: {
      user: "no-reply@sangmahacinta.com",
      pass: "dceVdHWDZXBtdk6"
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Duta Qur\'an" <no-reply@sangmahacinta.com>',
      to: "manusiaberdosa95@gmail.com",
      subject: "🔐 Tes Kode OTP Reset Password - Duta Qur'an",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #1d4ed8; text-align: center;">Duta Qur'an</h2>
          <p style="text-align: center; color: #475569;">Halo! Email SMTP dari no-reply@sangmahacinta.com berhasil terhubung 100%!</p>
        </div>
      `
    });
    console.log("SMTP SUCCESS:", info.response);
  } catch (err) {
    console.error("SMTP ERROR:", err.message);
  }
}

testSmtp();
