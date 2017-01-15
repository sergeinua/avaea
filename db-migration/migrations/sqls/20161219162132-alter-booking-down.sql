ALTER TABLE booking DROP id_pub;
ALTER TABLE booking DROP status_eticket;
ALTER TABLE booking DROP eticket_number;
DROP INDEX "booking_createdAt";