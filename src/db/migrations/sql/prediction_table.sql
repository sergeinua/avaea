-- Table: tprediction

-- DROP TABLE tprediction;

CREATE TABLE tprediction
(
  "user" integer,
  uuid text,
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