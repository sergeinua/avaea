FROM nginx

RUN apt-get update && apt-get install -y openssh-server

RUN mkdir /root/.ssh

COPY ./images/nginx/keys/* /root/.ssh/

RUN chmod 0400 /root/.ssh/*

COPY ./images/nginx/config/demo /etc/nginx/conf.d/default.conf

COPY ./images/nginx/config/abo /etc/nginx/conf.d/abo.conf

COPY ./images/nginx/bin/setup_and_run.sh /usr/local/bin/setup_and_run.sh

RUN chmod +x /usr/local/bin/setup_and_run.sh

