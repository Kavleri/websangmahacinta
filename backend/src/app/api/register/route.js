import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

const getEnv = (key, fallback) => (process.env && process.env[key]) || fallback;
const QR_SECRET_SALT = getEnv("QR_SECRET_SALT", "dutaqu_secret_salt_2026");

// POST /api/register
export async function POST(request) {
  try {
    const body = await request.json();
    const { package_id, name, email, whatsapp, voucher_code } = body;

    if (!package_id || !name || !email || !whatsapp) {
      return NextResponse.json({ error: "Semua data field wajib diisi!" }, { status: 400 });
    }

    // 1. Fetch package detail to get the price
    const packages = await query("SELECT * FROM packages");
    const selectedPackage = packages.find(p => p.id === parseInt(package_id, 10));

    if (!selectedPackage) {
      return NextResponse.json({ error: "Paket tidak ditemukan!" }, { status: 404 });
    }

    // 1b. Penegakan war tiket & kuota seat (server-side, jam server WIB-aman)
    if (selectedPackage.category) {
      const releasedAtMs = selectedPackage.released_at ? new Date(selectedPackage.released_at).getTime() : 0;
      if (releasedAtMs > Date.now()) {
        const openAt = new Date(releasedAtMs).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
        return NextResponse.json({
          error: `Pembelian kategori ${selectedPackage.category.toUpperCase()} belum dibuka. War tiket dibuka ${openAt} WIB.`
        }, { status: 403 });
      }

      let quotaRows = [];
      try {
        quotaRows = await query("SELECT category, total_seats FROM ticket_quota");
      } catch (e) { /* fallback default di bawah */ }
      const quotaRow = (quotaRows || []).find(q => q.category === selectedPackage.category);
      const totalSeats = parseInt(quotaRow ? quotaRow.total_seats : "100", 10);

      let allRegs = [];
      try {
        allRegs = await query("SELECT package_id, status FROM registrations");
      } catch (e) { /* fallback: dianggap kosong */ }
      const catIds = new Set(
        (packages || []).filter(p => p.category === selectedPackage.category).map(p => String(p.id))
      );
      let seatsTaken = 0;
      for (const r of allRegs || []) {
        if (!catIds.has(String(r.package_id))) continue;
        if (r.status === "pending" || r.status === "paid") {
          const p = (packages || []).find(x => String(x.id) === String(r.package_id));
          seatsTaken += p && p.seat_type === "couple" ? 2 : 1;
        }
      }
      const seatsNeeded = selectedPackage.seat_type === "couple" ? 2 : 1;
      if (seatsTaken + seatsNeeded > totalSeats) {
        return NextResponse.json({
          error: "Maaf, seat untuk kategori ini sudah HABIS. Silakan pilih kategori tiket lainnya."
        }, { status: 409 });
      }
    }

    const basePrice = parseFloat(selectedPackage.price);
    let discount = 0.00;
    let validVoucherCode = null;

    // 2. Validate voucher if provided
    if (voucher_code) {
      const normalizedCode = voucher_code.trim().toUpperCase();
      const vouchers = await query(
        "SELECT * FROM vouchers WHERE code = ?",
        [normalizedCode]
      );

      if (vouchers && vouchers.length > 0) {
        const voucher = vouchers[0];
        const isExpired = voucher.expires_at && new Date(voucher.expires_at) < new Date();
        const maxReached = voucher.max_uses !== null && voucher.used_count >= voucher.max_uses;

        if (!isExpired && !maxReached) {
          validVoucherCode = voucher.code;
          if (voucher.discount_type === "fixed") {
            discount = parseFloat(voucher.discount_value);
          } else if (voucher.discount_type === "percentage") {
            discount = basePrice * (parseFloat(voucher.discount_value) / 100);
          }
          // Cap discount at base price
          if (discount > basePrice) {
            discount = basePrice;
          }
        }
      }
    }

    // 3. Generate a unique code (100-999) that is not currently active for pending registrations of this package
    const activePending = await query(
      "SELECT unique_code FROM registrations WHERE package_id = ? AND status = 'pending'",
      [package_id]
    );
    const activeCodes = activePending.map(r => parseInt(r.unique_code, 10));

    let uniqueCode = Math.floor(100 + Math.random() * 900);
    let attempts = 0;
    while (activeCodes.includes(uniqueCode) && attempts < 900) {
      uniqueCode = Math.floor(100 + Math.random() * 900);
      attempts++;
    }

    const finalBasePrice = basePrice - discount;
    const totalPrice = finalBasePrice + uniqueCode;

    // 4. Generate unique registration code
    // Format: REG-<YYYYMMDD>-<4 random alphanumeric uppercase characters>
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const regCode = `REG-${dateStr}-${randStr}`;

    // 5. Generate secure digital signature for the QR Code
    const signature = crypto.createHmac("sha256", QR_SECRET_SALT).update(regCode).digest("hex");

    // 6. Save to DB
    // Check if DATABASE_URL connection string supports pg compatible dynamic inserts
    const insertResult = await query(
      "INSERT INTO registrations (registration_code, package_id, name, email, whatsapp, base_price, unique_code, total_price, status, voucher_code, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
      [
        regCode,
        parseInt(package_id, 10),
        name,
        email,
        whatsapp,
        basePrice,
        uniqueCode,
        totalPrice,
        validVoucherCode,
        discount
      ]
    );

    // 7. Increment voucher usage count if valid voucher was applied
    if (validVoucherCode) {
      await query(
        "UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?",
        [validVoucherCode]
      );
    }

    return NextResponse.json({
      success: true,
      registration: {
        id: insertResult.insertId,
        registration_code: regCode,
        package_id,
        packageName: selectedPackage.name,
        name,
        email,
        whatsapp,
        base_price: basePrice,
        unique_code: uniqueCode,
        total_price: totalPrice,
        status: "pending",
        voucher_code: validVoucherCode,
        discount_amount: discount,
        qr_payload: `${regCode}:${signature}`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

