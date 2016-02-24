-- Table: profile

ALTER TABLE profile ADD COLUMN "showTiles" boolean DEFAULT true;

-- or
-- ALTER TABLE profile ALTER COLUMN "showTiles" SET DEFAULT true
-- if column already exists
