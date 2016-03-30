FROM postgres:9.3

VOLUME /var/lib/postgresql

COPY ./images/postgres/data/avaea.sql.gz /docker-entrypoint-initdb.d/
