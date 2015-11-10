cat <<EOF
BEGIN;
CREATE TABLE airlines_new (
  id		int primary key,
  name		varchar,
  alias		varchar,
  iata_2code	varchar(5),
  icao_3code	varchar(5),
  callsign	varchar,
  country	varchar,
  active	boolean
);
EOF
# prepare values for postgres inserts
/usr/bin/curl -s https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat | sed -r -e 's/\\N/null/g' | sed -r -e "s/\\\//g" | sed -r -e "s/'/''/g" -e 's/"[Y|y]"/true/g' -e 's/"[N|n]"/false/g' -e 's/"/#/g' -e "s/#/'/g" -e 's/^/INSERT INTO airlines_new(id,name,alias,iata_2code,icao_3code,callsign,country,active) VALUES\(/' -e 's/$/);/'
cat <<EOF
COMMIT;
EOF
