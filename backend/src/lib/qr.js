import crypto from "crypto";

const getEnv = (key, fallback) => (process.env && process.env[key]) || fallback;
const QR_SECRET_SALT = getEnv("QR_SECRET_SALT", "dutaqu_secret_salt_2026");
const QR_PREFIX = "DUTAQR1";

function sign(value) {
  return crypto.createHmac("sha256", QR_SECRET_SALT).update(value).digest("hex");
}

function equalHex(left, right) {
  if (!/^[a-f0-9]{64}$/i.test(left || "") || !/^[a-f0-9]{64}$/i.test(right || "")) return false;
  return crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

// Payload QR baru: DUTAQR1|database_id|registration_code|signature
// Signature mencakup id + kode, lalu scan mencocokkan keduanya ke database.
export function createQrPayload(id, registrationCode) {
  const numericId = parseInt(id, 10);
  const code = String(registrationCode || "").trim();
  return `${QR_PREFIX}|${numericId}|${code}|${sign(`${numericId}:${code}`)}`;
}

// Plain code tetap diterima hanya untuk input manual admin/staff.
// QR baru dan QR versi sebelumnya wajib lolos signature.
export function parseQrInput(input) {
  const raw = String(input || "").trim();
  if (!raw) return { valid: false, reason: "empty" };

  if (raw.startsWith(`${QR_PREFIX}|`)) {
    const parts = raw.split("|");
    if (parts.length !== 4) return { valid: false, reason: "malformed" };
    const id = parseInt(parts[1], 10);
    const code = parts[2];
    const signature = parts[3];
    if (!Number.isInteger(id) || id <= 0 || !code || !equalHex(signature, sign(`${id}:${code}`))) {
      return { valid: false, reason: "invalid_signature" };
    }
    return { valid: true, code, id, signed: true, version: 1 };
  }

  // Kompatibilitas QR versi lama: KODE:SIGNATURE (tetap diverifikasi).
  if (raw.includes(":")) {
    const parts = raw.split(":");
    if (parts.length !== 2) return { valid: false, reason: "malformed" };
    const code = parts[0];
    const signature = parts[1];
    if (!code || !equalHex(signature, sign(code))) {
      return { valid: false, reason: "invalid_signature" };
    }
    return { valid: true, code, id: null, signed: true, version: 0 };
  }

  return { valid: true, code: raw, id: null, signed: false, manual: true };
}
