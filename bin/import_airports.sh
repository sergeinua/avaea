cat <<EOF
BEGIN;
ALTER TABLE airports_new RENAME TO airports_old;
CREATE TABLE airports_new (
  id		int primary key,
  name 		varchar,
  city 		varchar,
  country	varchar,
  iata_3code	varchar(5),
  icao_4code	varchar(5),
  latitude	float,
  longitude	float,
  altitude	float,
  timezone	int,
  dst		varchar(2),
  tz		varchar
);
EOF
# Replace apostrophe ' with backtick `
/usr/bin/curl -s https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat | sed -r -e "s/'/\`/g" -e 's/\\N/null/g' -e 's/"/#/g' -e "s/#/'/g" -e 's/^/INSERT INTO airports_new(id,name,city,country,iata_3code,icao_4code,latitude,longitude,altitude,timezone,dst,tz) VALUES\(/' -e 's/$/);/'
cat <<EOF
DROP TABLE airports_old;
COMMIT;
EOF
