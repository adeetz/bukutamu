-- Manual migration to add pageTitle column to settings table
-- Run this SQL in your Neon database dashboard or using direct connection

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS "pageTitle" VARCHAR(255) NOT NULL DEFAULT 'Diskominfo Kabupaten Tanah Bumbu';

-- Update existing record if exists
UPDATE settings 
SET "pageTitle" = 'Diskominfo Kabupaten Tanah Bumbu'
WHERE "pageTitle" IS NULL OR "pageTitle" = '';

-- Verify the change
SELECT * FROM settings;
