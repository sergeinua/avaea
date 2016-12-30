SET search_path TO public;

CREATE TABLE booking(
  -- pk
  id SERIAL NOT NULL PRIMARY KEY,
  -- ref to "user"
  user_id INTEGER NOT NULL,
  -- returned by API data
  pnr TEXT,
  reference_number TEXT,
  -- Itinerary
  itinerary_id TEXT,
  itinerary_data JSON,
  createdAt TIMESTAMPTZ,
  updatedAt TIMESTAMPTZ
);