-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS staffs CASCADE;
DROP TABLE IF EXISTS vouchers CASCADE;

-- Packages table
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    features JSONB NOT NULL, -- Stored as a JSONB array of strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    registration_code VARCHAR(50) UNIQUE NOT NULL,
    package_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    unique_code INT NOT NULL, -- 3-digit random number to identify payment transfers (100 - 999)
    total_price DECIMAL(10,2) NOT NULL, -- base_price + unique_code
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
    payment_proof VARCHAR(255) NULL, -- Stores relative path to uploaded receipt
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP NULL DEFAULT NULL,
    voucher_code VARCHAR(50) NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    secure_signature VARCHAR(64) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL, -- Stored securely (plain for simplicity of this demo)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staffs table
CREATE TABLE staffs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INT NULL,
    used_count INT DEFAULT 0,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO packages (name, price, description, features) VALUES 
('Seminar Sang Maha Cinta - Regular', 200000.00, 'Tiket masuk reguler untuk 1 orang mengikuti seluruh rangkaian seminar pasca-nikah.', '["Tiket Masuk Utama", "Seminar Kit & Buku Catatan", "Sertifikat Digital", "Coffee Break & Makan Siang"]'::jsonb),
('Seminar Sang Maha Cinta - Couple Promo', 350000.00, 'Paket khusus berpasangan (suami-istri atau calon pasangan). Lebih hemat untuk 2 tiket.', '["Tiket Masuk untuk 2 Orang", "2x Seminar Kit & Buku Catatan", "Sertifikat Digital Pasangan", "2x Coffee Break & Makan Siang", "Duduk di Area Baris Depan"]'::jsonb),
('Seminar Sang Maha Cinta - VIP Premium', 400000.00, 'Tiket premium dengan fasilitas eksklusif, sesi tanya jawab privat, dan cinderamata spesial.', '["Tiket Masuk Area VIP (Baris Paling Depan)", "Exclusive Seminar Kit", "Eksklusif Buku Tanda Tangan Pembicara", "Premium Lunch & Snack Box", "Sesi Foto Khusus Bersama Pembicara"]'::jsonb),
('Program Volunteer PeraQ - Basic', 50000.00, 'Kontribusi registrasi volunteer dasar mencakup merchandise official dan donasi 1 Mushaf Al-Quran.', '["Official T-Shirt Volunteer PeraQ", "ID Card & Sertifikat Volunteer", "Donasi 1 Mushaf Al-Quran ke Lokasi Mitra", "Konsumsi Selama Kegiatan (1 Hari)"]'::jsonb),
('Program Volunteer PeraQ - Donatur Peduli', 100000.00, 'Kontribusi volunteer plus donasi ekstra (3 Mushaf Al-Quran) untuk disebarkan ke TPQ/Rumah Tahfiz.', '["Official T-Shirt Volunteer PeraQ", "ID Card & Sertifikat Volunteer", "Donasi 3 Mushaf Al-Quran ke Lokasi Mitra", "Konsumsi Selama Kegiatan (1 Hari)", "Merchandise Tambahan (Pin & Totebag)"]'::jsonb);

-- Seed default admin account
-- Username: admin, Password: admindutaquran123, Email: admin@dutaqu.com
INSERT INTO admins (username, email, password_hash) VALUES 
('admin', 'admin@dutaqu.com', 'admindutaquran123');

-- Seed default staff account
-- Username: staff, Password: staffdutaqu2026, Email: staff@dutaqu.com
INSERT INTO staffs (username, email, password_hash) VALUES 
('staff', 'staff@dutaqu.com', 'staffdutaqu2026');

-- Seed default voucher for testing
-- Code: DISKON20, discount 20000 flat, max 100 uses
INSERT INTO vouchers (code, discount_type, discount_value, max_uses) VALUES 
('DISKON20', 'fixed', 20000.00, 100);

