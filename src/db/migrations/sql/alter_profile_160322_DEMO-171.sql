SET search_path TO public;

ALTER TABLE IF EXISTS profile ADD COLUMN city TEXT;
ALTER TABLE IF EXISTS profile ADD COLUMN state TEXT;
ALTER TABLE IF EXISTS profile ADD COLUMN country_code TEXT;
ALTER TABLE IF EXISTS profile ADD COLUMN zip_code TEXT;
