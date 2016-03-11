SET search_path TO public;

ALTER TABLE "user" DROP COLUMN IF EXISTS is_whitelist;
-- access to whitelist: 1=enable; 0=disable
ALTER TABLE "user" ADD is_whitelist INTEGER DEFAULT 0 NOT NULL CHECK (is_whitelist IN(0, 1));
update "user" set is_whitelist =1;