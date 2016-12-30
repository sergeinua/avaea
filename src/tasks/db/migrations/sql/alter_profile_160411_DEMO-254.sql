SET search_path TO public;

ALTER TABLE IF EXISTS profile ADD COLUMN gender TEXT;
ALTER TABLE IF EXISTS profile ADD COLUMN birthday date;
ALTER TABLE IF EXISTS profile ADD COLUMN pax_type TEXT;
