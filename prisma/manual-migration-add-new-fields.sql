-- Manual migration to add new fields to buku_tamu table
-- Run this SQL script in your database

-- Add new columns to buku_tamu table
ALTER TABLE buku_tamu 
ADD COLUMN whatsapp VARCHAR(20),
ADD COLUMN tempat_kunjungan VARCHAR(100),
ADD COLUMN tanggal_kunjungan VARCHAR(10),
ADD COLUMN jam_kunjungan VARCHAR(5);

-- Set default values for existing records (optional)
UPDATE buku_tamu 
SET 
  whatsapp = '',
  tempat_kunjungan = 'Kantor Bupati',
  tanggal_kunjungan = DATE(created_at),
  jam_kunjungan = TIME(created_at)
WHERE whatsapp IS NULL;

-- Make new columns NOT NULL after setting defaults
ALTER TABLE buku_tamu 
ALTER COLUMN whatsapp SET NOT NULL,
ALTER COLUMN tempat_kunjungan SET NOT NULL,
ALTER COLUMN tanggal_kunjungan SET NOT NULL,
ALTER COLUMN jam_kunjungan SET NOT NULL;