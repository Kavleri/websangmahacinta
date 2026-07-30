import pg from "pg";
import fs from "fs";
import path from "path";

// Database configuration supporting standard connection URI (e.g. Supabase DATABASE_URL)
function getResolvedConnectionString() {
  const rawString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || ""}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_DATABASE || "postgres"}`;
  
  if (rawString.includes("db.cpsjztftrurtuvmiypjv.supabase.co")) {
    const urlPattern = /postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^??#\s]+)/;
    const match = rawString.match(urlPattern);
    if (match) {
      const password = match[2];
      const database = match[5];
      // Rewrite to Tokyo IPv4 Connection Pooler (ap-northeast-1) on transaction port 6543
      const poolerString = `postgresql://postgres.cpsjztftrurtuvmiypjv:${password}@aws-0-ap-northeast-1.pooler.supabase.com:6543/${database}?sslmode=require`;
      return poolerString;
    }
  }
  return rawString;
}

const connectionString = getResolvedConnectionString();

let pool = null;
let useFallback = false;

// Fallback JSON DB setup
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const fallbackFilePath = isVercel
  ? path.join("/tmp", "db_fallback.json")
  : path.join(process.cwd(), "db_fallback.json");
const templateFilePath = path.join(process.cwd(), "db_fallback.json");

const defaultPackages = [
  {
    id: 1,
    name: "Seminar Sang Maha Cinta - Regular",
    price: 200000.00,
    description: "Tiket masuk reguler untuk 1 orang mengikuti seluruh rangkaian seminar pasca-nikah.",
    features: ["Tiket Masuk Utama", "Seminar Kit & Buku Catatan", "Sertifikat Digital", "Coffee Break & Makan Siang"]
  },
  {
    id: 2,
    name: "Seminar Sang Maha Cinta - Couple Promo",
    price: 350000.00,
    description: "Paket khusus berpasangan (suami-istri atau calon pasangan). Lebih hemat untuk 2 tiket.",
    features: ["Tiket Masuk untuk 2 Orang", "2x Seminar Kit & Buku Catatan", "Sertifikat Digital Pasangan", "2x Coffee Break & Makan Siang", "Duduk di Area Baris Depan"]
  },
  {
    id: 3,
    name: "Seminar Sang Maha Cinta - VIP Premium",
    price: 400000.00,
    description: "Tiket premium dengan fasilitas eksklusif, sesi tanya jawab privat, dan cinderamata spesial.",
    features: ["Tiket Masuk Area VIP (Baris Paling Depan)", "Exclusive Seminar Kit", "Eksklusif Buku Tanda Tangan Pembicara", "Premium Lunch & Snack Box", "Sesi Foto Khusus Bersama Pembicara"]
  },
  {
    id: 4,
    name: "Program Volunteer PeraQ - Basic",
    price: 50000.00,
    description: "Kontribusi registrasi volunteer dasar mencakup merchandise official dan donasi 1 Mushaf Al-Quran.",
    features: ["Official T-Shirt Volunteer PeraQ", "ID Card & Sertifikat Volunteer", "Donasi 1 Mushaf Al-Quran ke Lokasi Mitra", "Konsumsi Selama Kegiatan (1 Hari)"]
  },
  {
    id: 5,
    name: "Program Volunteer PeraQ - Donatur Peduli",
    price: 100000.00,
    description: "Kontribusi volunteer plus donasi ekstra (3 Mushaf Al-Quran) untuk disebarkan ke TPQ/Rumah Tahfiz.",
    features: ["Official T-Shirt Volunteer PeraQ", "ID Card & Sertifikat Volunteer", "Donasi 3 Mushaf Al-Quran ke Lokasi Mitra", "Konsumsi Selama Kegiatan (1 Hari)", "Merchandise Tambahan (Pin & Totebag)"]
  }
];

const defaultAdmins = [
  {
    id: 1,
    username: "admin",
    email: "manusiaberdosa95@gmail.com",
    password_hash: "admindutaquran123"
  }
];

const defaultVouchers = [
  {
    id: 1,
    code: "DISKON20",
    discount_type: "fixed",
    discount_value: 20000.00,
    max_uses: 100,
    used_count: 0,
    expires_at: null
  }
];

const defaultStaffs = [
  {
    id: 1,
    username: "staff",
    email: "staff@dutaqu.com",
    password_hash: "staffdutaqu2026"
  }
];

// Memory-based fallback in case write permissions fail (e.g. Vercel serverless environment)
let memoryFallbackDb = null;

function initFallbackDb() {
  if (memoryFallbackDb) return;

  let initialData = {
    packages: defaultPackages,
    registrations: [],
    admins: defaultAdmins,
    vouchers: defaultVouchers,
    staffs: defaultStaffs
  };

  if (fs.existsSync(templateFilePath)) {
    try {
      const templateData = fs.readFileSync(templateFilePath, "utf8");
      const parsed = JSON.parse(templateData);
      initialData = {
        packages: parsed.packages || defaultPackages,
        registrations: parsed.registrations || [],
        admins: parsed.admins || defaultAdmins,
        vouchers: parsed.vouchers || defaultVouchers,
        staffs: parsed.staffs || defaultStaffs
      };
    } catch (e) {
      console.warn("Could not read template file:", e.message);
    }
  }

  try {
    if (!fs.existsSync(fallbackFilePath)) {
      fs.writeFileSync(fallbackFilePath, JSON.stringify(initialData, null, 2), "utf8");
      console.log("Initialized JSON fallback database at", fallbackFilePath);
    }
  } catch (error) {
    console.warn("Could not write initial fallback file:", error.message);
  }

  memoryFallbackDb = initialData;
}

function readFallbackDb() {
  initFallbackDb();
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, "utf8");
      const parsed = JSON.parse(data);
      // Ensure all collections exist in case of old db_fallback.json files
      memoryFallbackDb = {
        packages: parsed.packages || defaultPackages,
        registrations: parsed.registrations || [],
        admins: parsed.admins || defaultAdmins,
        vouchers: parsed.vouchers || defaultVouchers,
        staffs: parsed.staffs || defaultStaffs
      };
    }
  } catch (error) {
    console.warn("Error reading JSON fallback database from disk, using memory state:", error.message);
  }
  return memoryFallbackDb;
}

function writeFallbackDb(data) {
  memoryFallbackDb = data;
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.warn("Error writing JSON fallback database to disk, updated in-memory state:", error.message);
  }
}

// Try connection pool setup
try {
  if (connectionString.includes("supabase.co") || connectionString.includes("supabase.com")) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
  // Support SSL for Supabase connection (standard production config)
  pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("supabase.co") || connectionString.includes("supabase.com") ? { rejectUnauthorized: false } : false
  });
} catch (err) {
  console.warn("PostgreSQL pool creation failed. Switching to JSON file fallback database.", err.message);
  useFallback = true;
}

export async function query(sql, params = []) {
  if (useFallback) {
    return handleFallbackQuery(sql, params);
  }

  try {
    // Convert SQL '?' to '$1, $2, ...' for pg compatible placeholder queries
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    
    const client = await pool.connect();
    try {
      const res = await client.query(pgSql, params);
      
      // Normalize INSERT and UPDATE output formats to match mysql expected returns
      if (pgSql.trim().toLowerCase().startsWith("insert")) {
        return { insertId: res.rows[0]?.id || 1 }; 
      }
      if (pgSql.trim().toLowerCase().startsWith("update")) {
        return { affectedRows: res.rowCount };
      }
      return res.rows;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn("PostgreSQL Query error. Attempting JSON fallback database.", err.message);
    useFallback = true;
    initFallbackDb();
    return handleFallbackQuery(sql, params);
  }
}

// Mock Query parser for simple queries used in our API routes
function handleFallbackQuery(sql, params) {
  const db = readFallbackDb();
  const sqlNormalized = sql.trim().replace(/\s+/g, " ").toLowerCase();

  // 1. SELECT * FROM packages
  if (sqlNormalized.includes("select * from packages") || sqlNormalized.includes("select id, name, price")) {
    return db.packages;
  }

  // 2. INSERT INTO registrations
  if (sqlNormalized.startsWith("insert into registrations")) {
    // Fields: registration_code, package_id, name, email, whatsapp, base_price, unique_code, total_price, status, voucher_code, discount_amount
    const reg = {
      id: db.registrations.length + 1,
      registration_code: params[0],
      package_id: parseInt(params[1], 10),
      name: params[2],
      email: params[3],
      whatsapp: params[4],
      base_price: parseFloat(params[5]),
      unique_code: parseInt(params[6], 10),
      total_price: parseFloat(params[7]),
      status: "pending",
      payment_proof: null,
      checked_in: 0,
      checked_in_at: null,
      created_at: new Date().toISOString(),
      voucher_code: params[8] || null,
      discount_amount: parseFloat(params[9]) || 0.00
    };
    db.registrations.push(reg);
    writeFallbackDb(db);
    return { insertId: reg.id };
  }

  // 3. SELECT * FROM registrations WHERE registration_code = ? OR whatsapp = ?
  if (sqlNormalized.includes("select") && sqlNormalized.includes("registrations") && sqlNormalized.includes("where")) {
    const isSingleCheck = sqlNormalized.includes("registration_code = ?") || sqlNormalized.includes("whatsapp = ?");
    if (isSingleCheck) {
      const searchVal = params[0];
      const match = db.registrations.filter(r => 
        r.registration_code === searchVal || r.whatsapp === searchVal
      );
      return match;
    }
    
    // Select all for admin dashboard
    if (sqlNormalized.includes("order by created_at desc")) {
      return db.registrations.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  // 4. UPDATE registrations SET payment_proof = ?, status = ? WHERE id = ? or code = ?
  if (sqlNormalized.startsWith("update registrations")) {
    if (sqlNormalized.includes("payment_proof = ?") && sqlNormalized.includes("registration_code = ?")) {
      const proof = params[0];
      const code = params[1];
      const index = db.registrations.findIndex(r => r.registration_code === code);
      if (index !== -1) {
        db.registrations[index].payment_proof = proof;
        db.registrations[index].status = "pending"; // reset to pending on re-upload if needed
        writeFallbackDb(db);
        return { affectedRows: 1 };
      }
    }
    
    if (sqlNormalized.includes("status = ?") && sqlNormalized.includes("id = ?")) {
      const status = params[0];
      const id = parseInt(params[1], 10);
      const index = db.registrations.findIndex(r => r.id === id);
      if (index !== -1) {
        db.registrations[index].status = status;
        writeFallbackDb(db);
        return { affectedRows: 1 };
      }
    }

    if (sqlNormalized.includes("checked_in = 1") && sqlNormalized.includes("checked_in_at = ?") && sqlNormalized.includes("registration_code = ?")) {
      const checked_in_at = params[0];
      const code = params[1];
      const index = db.registrations.findIndex(r => r.registration_code === code);
      if (index !== -1) {
        db.registrations[index].checked_in = 1;
        db.registrations[index].checked_in_at = checked_in_at;
        writeFallbackDb(db);
        return { affectedRows: 1 };
      }
    }
  }

  // 5. SELECT * FROM admins
  if (sqlNormalized.includes("select") && sqlNormalized.includes("from admins")) {
    if (sqlNormalized.includes("where username = ?")) {
      const username = params[0];
      return db.admins.filter(a => a.username === username || a.email === username);
    }
    return db.admins;
  }

  // 6. UPDATE packages SET price = ?, name = ? etc.
  if (sqlNormalized.startsWith("update packages")) {
    // For package management
    // Example: UPDATE packages SET name = ?, price = ?, description = ? WHERE id = ?
    const name = params[0];
    const price = parseFloat(params[1]);
    const desc = params[2];
    const id = parseInt(params[3], 10);
    const index = db.packages.findIndex(p => p.id === id);
    if (index !== -1) {
      db.packages[index].name = name;
      db.packages[index].price = price;
      db.packages[index].description = desc;
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
  }

  // 7. SELECT * FROM vouchers
  if (sqlNormalized.includes("select * from vouchers")) {
    if (sqlNormalized.includes("where code = ?")) {
      const code = params[0]?.toUpperCase();
      return db.vouchers.filter(v => v.code.toUpperCase() === code);
    }
    return db.vouchers;
  }

  // 8. INSERT INTO vouchers
  if (sqlNormalized.startsWith("insert into vouchers")) {
    const v = {
      id: db.vouchers.length + 1,
      code: params[0].toUpperCase(),
      discount_type: params[1],
      discount_value: parseFloat(params[2]),
      max_uses: params[3] ? parseInt(params[3], 10) : null,
      used_count: 0,
      expires_at: null
    };
    db.vouchers.push(v);
    writeFallbackDb(db);
    return { insertId: v.id };
  }

  // 9. DELETE FROM vouchers WHERE id = ?
  if (sqlNormalized.startsWith("delete from vouchers")) {
    const id = parseInt(params[0], 10);
    const index = db.vouchers.findIndex(v => v.id === id);
    if (index !== -1) {
      db.vouchers.splice(index, 1);
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
  }

  // 10. UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?
  if (sqlNormalized.startsWith("update vouchers set used_count")) {
    const code = params[0]?.toUpperCase();
    const index = db.vouchers.findIndex(v => v.code.toUpperCase() === code);
    if (index !== -1) {
      db.vouchers[index].used_count += 1;
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
  }

  // 11. SELECT * FROM staffs
  if (sqlNormalized.includes("select") && sqlNormalized.includes("from staffs")) {
    if (sqlNormalized.includes("where username = ?")) {
      const username = params[0];
      return db.staffs.filter(s => s.username === username || s.email === username);
    }
    return db.staffs;
  }

  // 12. INSERT INTO admins
  if (sqlNormalized.startsWith("insert into admins")) {
    // fields: username, email, password_hash
    const a = {
      id: db.admins.length + 1,
      username: params[0],
      email: params[1] || null,
      password_hash: params[2],
      created_at: new Date().toISOString()
    };
    db.admins.push(a);
    writeFallbackDb(db);
    return { insertId: a.id };
  }

  // 13. INSERT INTO staffs
  if (sqlNormalized.startsWith("insert into staffs")) {
    // fields: username, email, password_hash
    const s = {
      id: db.staffs.length + 1,
      username: params[0],
      email: params[1] || null,
      password_hash: params[2],
      created_at: new Date().toISOString()
    };
    db.staffs.push(s);
    writeFallbackDb(db);
    return { insertId: s.id };
  }

  // 14. DELETE FROM admins WHERE id = ?
  if (sqlNormalized.startsWith("delete from admins")) {
    const id = parseInt(params[0], 10);
    const index = db.admins.findIndex(a => a.id === id);
    if (index !== -1) {
      db.admins.splice(index, 1);
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
  }

  // 15. DELETE FROM staffs WHERE id = ?
  if (sqlNormalized.startsWith("delete from staffs")) {
    const id = parseInt(params[0], 10);
    const index = db.staffs.findIndex(s => s.id === id);
    if (index !== -1) {
      db.staffs.splice(index, 1);
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
  }

  // 16. UPDATE admins SET email = ? WHERE id = ?
  if (sqlNormalized.startsWith("update admins set email")) {
    const email = params[0];
    const id = parseInt(params[1], 10);
    const index = db.admins.findIndex(a => a.id === id);
    if (index !== -1) {
      db.admins[index].email = email;
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 17. UPDATE staffs SET email = ? WHERE id = ?
  if (sqlNormalized.startsWith("update staffs set email")) {
    const email = params[0];
    const id = parseInt(params[1], 10);
    const index = db.staffs.findIndex(s => s.id === id);
    if (index !== -1) {
      db.staffs[index].email = email;
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 18. UPDATE admins SET password_hash = ? WHERE id = ?
  if (sqlNormalized.startsWith("update admins set password_hash")) {
    const pw = params[0];
    const id = parseInt(params[1], 10);
    const index = db.admins.findIndex(a => a.id === id);
    if (index !== -1) {
      db.admins[index].password_hash = pw;
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 19. UPDATE staffs SET password_hash = ? WHERE id = ?
  if (sqlNormalized.startsWith("update staffs set password_hash")) {
    const pw = params[0];
    const id = parseInt(params[1], 10);
    const index = db.staffs.findIndex(s => s.id === id);
    if (index !== -1) {
      db.staffs[index].password_hash = pw;
      writeFallbackDb(db);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // Default empty result
  return [];
}
