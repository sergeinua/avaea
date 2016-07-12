FROM postgres:9.3

COPY ./images/postgres/bin/run_postgres.sh /usr/local/bin/run_postgres.sh

RUN chmod +x /usr/local/bin/run_postgres.sh

