FROM postgres:9.3

COPY ./images/postgres/data/avaea.sql.gz /docker-entrypoint-initdb.d/
