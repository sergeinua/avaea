FROM node:4.4.7

RUN apt-get update

COPY ./images/node/bin/run_avaea.sh /usr/local/bin/run_avaea.sh

COPY ./images/node/bin/run_abo.sh /usr/local/bin/run_abo.sh

COPY ./images/node/bin/run_migrations.sh /usr/local/bin/run_migrations.sh

RUN chmod +x /usr/local/bin/run_avaea.sh

RUN chmod +x /usr/local/bin/run_abo.sh

RUN chmod +x /usr/local/bin/run_migrations.sh
