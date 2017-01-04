ALTER TABLE booking ADD id_pub UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE;
ALTER TABLE booking ADD eticket_number TEXT;
ALTER TABLE booking ADD status_eticket SMALLINT DEFAULT 1 NOT NULL CHECK (status_eticket IN (1,2));
UPDATE booking SET status_eticket=2; -- processed
CREATE INDEX "booking_createdAt" ON booking("createdAt");