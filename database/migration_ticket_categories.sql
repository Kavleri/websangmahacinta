-- =============================================================
-- Migrasi Sistem Tiket 3 Kategori + War Tiket (Duta QU 2026)
-- Event: Seminar Sang Maha Cinta — Rabu, 09 September 2026
-- Kuota: 100 seat per kategori (couple = 2 seat)
-- Jadwal war (WIB = UTC+7):
--   Economy : 17 - 20 Agustus 2026 (release 2026-08-16T17:00:00Z)
--   Reguler : 21 - 24 Agustus 2026 (release 2026-08-20T17:00:00Z)
--   Premium : 25 - 28 Agustus 2026 (release 2026-08-24T17:00:00Z)
-- =============================================================

-- 1. Kolom baru di tabel packages
ALTER TABLE packages ADD COLUMN IF NOT EXISTS category TEXT;       -- 'economy' | 'reguler' | 'premium' | NULL (paket lama)
ALTER TABLE packages ADD COLUMN IF NOT EXISTS seat_type TEXT;      -- 'personal' | 'couple' | NULL
ALTER TABLE packages ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;  -- jam pembukaan war tiket
ALTER TABLE packages ADD COLUMN IF NOT EXISTS war_ends_at TIMESTAMPTZ;  -- akhir jadwal war (hanya informasi)
ALTER TABLE packages ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2. Tabel kuota per kategori (bisa diubah admin jika perlu)
CREATE TABLE IF NOT EXISTS ticket_quota (
    category TEXT PRIMARY KEY,
    total_seats INT NOT NULL DEFAULT 100
);
INSERT INTO ticket_quota (category, total_seats) VALUES
    ('economy', 100),
    ('reguler', 100),
    ('premium', 100)
ON CONFLICT (category) DO UPDATE SET total_seats = EXCLUDED.total_seats;

-- 3. Reset paket kategori (idempoten) lalu insert 6 paket tiket baru
DELETE FROM packages WHERE category IS NOT NULL;

INSERT INTO packages (name, price, description, features, category, seat_type, released_at, war_ends_at, sort_order) VALUES
(
  'Economy Seat - Personal', 100000.00,
  'Tiket seminar 1 orang di area Economy (barisan belakang aula).',
  '["Seat area Economy (100 seat terbatas)", "Seminar Kit & Modul Digital", "E-Sertifikat Peserta", "Mengikuti seluruh sesi seminar 3 narasumber", "Gabung komunitas keluarga sakinah"]'::jsonb,
  'economy', 'personal', '2026-08-16T17:00:00Z', '2026-08-20T16:59:59Z', 1
),
(
  'Economy Seat - Couple', 150000.00,
  'Tiket seminar untuk 2 orang (pasangan) di area Economy (barisan belakang aula).',
  '["2 Seat area Economy (100 seat terbatas)", "2x Seminar Kit & Modul Digital", "2x E-Sertifikat Peserta", "Mengikuti seluruh sesi seminar 3 narasumber", "Gabung komunitas keluarga sakinah"]'::jsonb,
  'economy', 'couple', '2026-08-16T17:00:00Z', '2026-08-20T16:59:59Z', 2
),
(
  'Reguler Seat - Personal', 150000.00,
  'Tiket seminar 1 orang di area Reguler (barisan tengah aula).',
  '["Seat area Reguler (100 seat terbatas)", "Seminar Kit & Modul Digital", "E-Sertifikat Peserta", "Mengikuti seluruh sesi seminar 3 narasumber", "Gabung komunitas keluarga sakinah"]'::jsonb,
  'reguler', 'personal', '2026-08-20T17:00:00Z', '2026-08-24T16:59:59Z', 3
),
(
  'Reguler Seat - Couple', 250000.00,
  'Tiket seminar untuk 2 orang (pasangan) di area Reguler (barisan tengah aula).',
  '["2 Seat area Reguler (100 seat terbatas)", "2x Seminar Kit & Modul Digital", "2x E-Sertifikat Peserta", "Mengikuti seluruh sesi seminar 3 narasumber", "Gabung komunitas keluarga sakinah"]'::jsonb,
  'reguler', 'couple', '2026-08-20T17:00:00Z', '2026-08-24T16:59:59Z', 4
),
(
  'Premium Seat - Personal', 200000.00,
  'Tiket seminar 1 orang di area Premium (barisan paling depan, paling dekat panggung).',
  '["Seat area Premium baris depan (100 seat terbatas)", "Seminar Kit & Modul Digital", "E-Sertifikat Peserta", "Prioritas sesi tanya jawab narasumber", "Mengikuti seluruh sesi seminar 3 narasumber", "Gabung komunitas keluarga sakinah"]'::jsonb,
  'premium', 'personal', '2026-08-24T17:00:00Z', '2026-08-28T16:59:59Z', 5
),
(
  'Premium Seat - Couple', 350000.00,
  'Tiket seminar untuk 2 orang (pasangan) di area Premium (barisan paling depan, paling dekat panggung).',
  '["2 Seat area Premium baris depan (100 seat terbatas)", "2x Seminar Kit & Modul Digital", "2x E-Sertifikat Peserta", "Prioritas sesi tanya jawab narasumber", "Mengikuti seluruh sesi seminar 3 narasumber", "Gabung komunitas keluarga sakinah"]'::jsonb,
  'premium', 'couple', '2026-08-24T17:00:00Z', '2026-08-28T16:59:59Z', 6
);

-- 4. Pastikan paket lama (seminar lama & volunteer) tidak tampil di katalog baru
UPDATE packages SET category = NULL, seat_type = NULL, released_at = NULL, war_ends_at = NULL, sort_order = 0
WHERE id IN (SELECT id FROM packages WHERE category IS NULL);
