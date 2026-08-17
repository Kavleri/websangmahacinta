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
    let registerSeatNumbers = null;

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
        allRegs = await query("SELECT package_id, status, seat_numbers FROM registrations");
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

      // 1c. Validasi & klaim kursi pilihan peserta (seat selection)
      if (Array.isArray(body.seat_numbers) && body.seat_numbers.length > 0) {
        const seatsNeededSel = selectedPackage.seat_type === "couple" ? 2 : 1;
        const seats = body.seat_numbers.map((n) => parseInt(n, 10));
        const seatLabel = (n) => `${selectedPackage.category.charAt(0).toUpperCase()}-${n + 1}`;
        const valid = seats.length === seatsNeededSel &&
          seats.every((n) => Number.isInteger(n) && n >= 0 && n <= 99) &&
          new Set(seats).size === seats.length;
        if (!valid) {
          return NextResponse.json({
            error: `Pilihan kursi tidak valid. ${seatsNeededSel === 2 ? "Pilih tepat 2 kursi berdampingan (sebaris, satu blok)." : "Pilih 1 kursi."}`
          }, { status: 400 });
        }
        if (seatsNeededSel === 2) {
          const pair = seats.slice().sort((a, b) => a - b);
          const sameRow = Math.floor(pair[0] / 15) === Math.floor(pair[1] / 15);
          const adjacentSameBlock = pair[1] === pair[0] + 1 && pair[0] % 15 !== 6 && pair[0] % 15 !== 14; // kolom 6 & 14 = ujung blok (seberang lorong tengah)
          if (!sameRow || !adjacentSameBlock) {
            return NextResponse.json({ error: "Kursi couple harus 2 kursi berdampingan pada baris yang sama." }, { status: 400 });
          }
        }
        // Cek bentrok dengan kursi yang sudah diklaim (pending/paid) di kategori yang sama
        const claimed = new Set();
        for (const r of allRegs || []) {
          if (!catIds.has(String(r.package_id))) continue;
          if (r.status !== "pending" && r.status !== "paid") continue;
          if (!r.seat_numbers) continue;
          try {
            const arr = JSON.parse(r.seat_numbers);
            if (Array.isArray(arr)) arr.forEach((n) => claimed.add(parseInt(n, 10)));
          } catch (e) { /* abaikan data rusak */ }
        }
        const clash = seats.filter((n) => claimed.has(n));
        if (clash.length > 0) {
          return NextResponse.json({
            error: `Kursi ${clash.map(seatLabel).join(", ")} sudah diambil peserta lain. Silakan pilih kursi kosong lain.`
          }, { status: 409 });
        }
        registerSeatNumbers = JSON.stringify(seats);
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
      "INSERT INTO registrations (registration_code, package_id, name, email, whatsapp, base_price, unique_code, total_price, status, voucher_code, discount_amount, seat_numbers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)",
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
        discount,
        registerSeatNumbers
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
        seat_numbers: registerSeatNumbers ? JSON.parse(registerSeatNumbers) : null,
        qr_payload: `${regCode}:${signature}`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

