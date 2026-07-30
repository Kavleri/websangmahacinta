CREATE DATABASE IF NOT EXISTS web_dutaqu;
USE web_dutaqu;

-- Drop tables if they exist to start fresh (useful for testing)
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS admins;

-- Packages table
CREATE TABLE packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    features JSON NOT NULL, -- Stored as a JSON array of strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrations table
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_code VARCHAR(50) UNIQUE NOT NULL,
    package_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    unique_code INT NOT NULL, -- 3-digit random number to identify payment transfers (100 - 999)
    total_price DECIMAL(10,2) NOT NULL, -- base_price + unique_code
    status ENUM('pending', 'paid', 'rejected') DEFAULT 'pending',
    payment_proof VARCHAR(255) NULL, -- Stores relative path to uploaded receipt
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- For simplicity of this demo, we can store plain or md5/sha256
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default packages for the two programs mentioned (Sang Maha Cinta and PeraQ)
INSERT INTO packages (name, price, description, features) VALUES 
('Seminar Sang Maha Cinta - Regular', 150000.00, 'Tiket masuk reguler untuk 1 orang mengikuti seluruh rangkaian seminar pasca-nikah.', '["Tiket Masuk Utama", "Seminar Kit & Buku Catatan", "Sertifikat Digital", "Coffee Break & Makan Siang"]'),
('Seminar Sang Maha Cinta - Couple Promo', 275000.00, 'Paket khusus berpasangan (suami-istri atau calon pasangan). Lebih hemat untuk 2 tiket.', '["Tiket Masuk untuk 2 Orang", "2x Seminar Kit & Buku Catatan", "Sertifikat Digital Pasangan", "2x Coffee Break & Makan Siang", "Duduk di Area Baris Depan"]'),
('Seminar Sang Maha Cinta - VIP Premium', 400000.00, 'Tiket premium dengan fasilitas eksklusif, sesi tanya jawab privat, dan cinderamata spesial.', '["Tiket Masuk Area VIP (Baris Paling Depan)", "Exclusive Seminar Kit", "Eksklusif Buku Tanda Tangan Pembicara", "Premium Lunch & Snack Box", "Sesi Foto Khusus Bersama Pembicara"]'),
('Program Volunteer PeraQ - Basic', 50000.00, 'Kontribusi registrasi volunteer dasar mencakup merchandise official dan donasi 1 Mushaf Al-Quran.', '["Official T-Shirt Volunteer PeraQ", "ID Card & Sertifikat Volunteer", "Donasi 1 Mushaf Al-Quran ke Lokasi Mitra", "Konsumsi Selama Kegiatan (1 Hari)"]'),
('Program Volunteer PeraQ - Donatur Peduli', 100000.00, 'Kontribusi volunteer plus donasi ekstra (3 Mushaf Al-Quran) untuk disebarkan ke TPQ/Rumah Tahfiz.', '["Official T-Shirt Volunteer PeraQ", "ID Card & Sertifikat Volunteer", "Donasi 3 Mushaf Al-Quran ke Lokasi Mitra", "Konsumsi Selama Kegiatan (1 Hari)", "Merchandise Tambahan (Pin & Totebag)"]');

-- Seed default admin account
-- Username: admin, Password: admindutaquran123 (hashed or verified directly)
INSERT INTO admins (username, password_hash) VALUES 
('admin', 'admindutaquran123');
