-- Seat selection: simpan nomor kursi pilihan peserta (JSON array index 0-99 per kategori)
-- Contoh isi: [22] (personal) atau [22,23] (couple)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS seat_numbers TEXT;
