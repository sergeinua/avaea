-- Table: iprediction

-- DROP TABLE iprediction;

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