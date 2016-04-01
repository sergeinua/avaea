FROM node:4.4.1

COPY ./images/node/bin/run_avaea.sh /usr/local/bin/run_avaea.sh

COPY ./images/node/bin/run_abo.sh /usr/local/bin/run_abo.sh

RUN chmod +x /usr/local/bin/run_avaea.sh

RUN chmod +x /usr/local/bin/run_abo.sh
