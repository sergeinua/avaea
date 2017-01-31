DROP TABLE IF EXISTS vanity_urls;

CREATE TABLE "vanity_urls" (
  "id" serial NOT NULL PRIMARY KEY,
  "vanity_url" VARCHAR NOT NULL UNIQUE,
  "destination_url" VARCHAR NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE,
  "updatedAt" TIMESTAMP WITH TIME ZONE
)
WITH (
  OIDS=FALSE
);

ALTER TABLE "vanity_urls" OWNER TO avaea;

INSERT INTO vanity_urls(vanity_url, destination_url) VALUES ('http://stage.avaea.com/vanityURL/', 'http://stage.avaea.com/');
