-- Table: airports

DROP TABLE if exists airports;

CREATE TABLE airports (
  id        int primary key,
  name     varchar,
  city     varchar,
  country    varchar,
  iata_3code    varchar(5),
  icao_4code    varchar(5),
  latitude    float,
  longitude    float,
  altitude    float,
  timezone    float,
  dst        varchar(2),
  tz        varchar,
  state     varchar,
  state_short     varchar,
  pax          float,
  neighbors varchar
);
CREATE INDEX ON airports ((lower(iata_3code)));

ALTER TABLE airports
  OWNER TO avaea;

-- Table airlines

DROP TABLE if exists airlines;

CREATE TABLE airlines (
  id		int primary key,
  name		varchar,
  alias		varchar,
  iata_2code	varchar(5),
  icao_3code	varchar(5),
  callsign	varchar,
  country	varchar,
  active	boolean
);


-- Table: booking

DROP TABLE if exists booking;

CREATE TABLE booking
(
  user_id integer,
  pnr text,
  reference_number text,
  itinerary_id text,
  itinerary_data json,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT booking_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE booking
  OWNER TO avaea;

-- Table: iprediction

DROP TABLE if exists iprediction;

CREATE TABLE iprediction
(
  "user" integer,
  uuid text,
  search_params json,
  type text,
  prediction json,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT iprediction_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE iprediction
  OWNER TO avaea;

-- Table: "order"

DROP TABLE if exists "order";

CREATE TABLE "order"
(
  id integer NOT NULL,
  "orderData" json,
  "user" integer,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT order_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE "order"
  OWNER TO avaea;

-- Table: passport

DROP TABLE if exists passport;

CREATE TABLE passport
(
  protocol text,
  password text,
  "accessToken" text,
  provider text,
  identifier text,
  tokens json,
  "user" integer,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT passport_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE passport
  OWNER TO avaea;

-- Table: profile

DROP TABLE if exists profile;

CREATE TABLE profile
(
  "user" integer,
  "firstName" text,
  "middleName" text,
  "lastName" text,
  gender text,
  birthday date,
  pax_type text,
  address text,
  "notifyContact" json,
  "travelWith" json,
  "milesPrograms" json,
  "loungeMembership" json,
  employer json,
  ethnicity text,
  "showTiles" boolean,
  "preferredAirlines" json,
  city text,
  state text,
  country_code text,
  zip_code text,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT profile_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE profile
  OWNER TO avaea;

-- Table: search

DROP TABLE if exists search;

CREATE TABLE search
(
  hash text,
  params json,
  result json,
  "user" integer,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT search_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE search
  OWNER TO avaea;

-- Table: tile

DROP TABLE if exists tile;

CREATE TABLE tile
(
  name text,
  items_per_tile integer,
  default_items json,
  default_order integer,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT tile_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tile
  OWNER TO avaea;

-- Table: tprediction

DROP TABLE if exists tprediction;

CREATE TABLE tprediction
(
  "user" integer,
  uuid text,
  search_params json,
  tile_name text,
  result json,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT tprediction_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tprediction
  OWNER TO avaea;

-- Table: "user"

DROP TABLE if exists "user";

CREATE TABLE "user"
(
  username text,
  email text,
  is_whitelist integer,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT user_pkey PRIMARY KEY (id),
  CONSTRAINT user_email_key UNIQUE (email),
  CONSTRAINT user_username_key UNIQUE (username)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE "user"
  OWNER TO avaea;

-- Table: useraction

DROP TABLE if exists useraction;

CREATE TABLE useraction
(
  "user" integer,
  "actionType" text,
  "logInfo" json,
  id serial NOT NULL,
  "createdAt" timestamp with time zone,
  "updatedAt" timestamp with time zone,
  CONSTRAINT useraction_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE useraction
  OWNER TO avaea;




/*

minimal support table and functions in PostgreSQL database

for real use you probably want to at least implement some kind of expiry policy
and additionally put some data fields in their own table fields for easier
manipulation

*/


-- minimal table for session store
DROP TABLE if exists sails_session_store;
CREATE TABLE sails_session_store(
    sid text PRIMARY KEY,
    data json NOT NULL,
    created_at timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- set data for session
CREATE OR REPLACE FUNCTION sails_session_store_set(sid_in text, data_in json)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- delete current session data if it exists so the next insert succeeds
  DELETE FROM sails_session_store WHERE sid = sid_in;
  INSERT INTO sails_session_store(sid, data) VALUES(sid_in, data_in);
END;
$$;

-- get stored session
CREATE OR REPLACE FUNCTION sails_session_store_get(sid_in text, OUT data_out json)
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT data FROM sails_session_store WHERE sid = sid_in INTO data_out;
END;
$$;

-- destroy session
CREATE OR REPLACE FUNCTION sails_session_store_destroy(sid_in text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM sails_session_store WHERE sid = sid_in;
END;
$$;

-- count sessions
CREATE OR REPLACE FUNCTION sails_session_store_length(OUT length int)
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT count(*) FROM sails_session_store INTO length;
END;
$$;

-- delete all sessions
CREATE OR REPLACE FUNCTION sails_session_store_clear()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM sails_session_store;
END;
$$;