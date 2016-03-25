FROM postgres:9.3

COPY ./images/postgres/data/avaea.sql /docker-entrypoint-initdb.d/
