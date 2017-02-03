DROP TABLE IF EXISTS vanity_urls;

CREATE TABLE "vanity_urls" (
  "id" serial NOT NULL PRIMARY KEY,
  "vanity_url" VARCHAR NOT NULL UNIQUE,
  "destination_url" VARCHAR NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE
)
WITH (
  OIDS=FALSE
);

ALTER TABLE "vanity_urls" OWNER TO avaea;