FROM nginx

# Setup ssh for tunneling
RUN apt-get update && apt-get install -y --fix-missing openssh-server \
    build-essential \
    python-dev \
    python-setuptools \
    python-pip \
    python-smbus \
    libssl-dev \
    libffi-dev \
    wget

RUN mkdir /root/.ssh
COPY ./images/nginx/keys/* /root/.ssh/
RUN chmod 0400 /root/.ssh/*

RUN wget https://bootstrap.pypa.io/ez_setup.py -O - | python

RUN pip install pyasn1 --upgrade

RUN pip install ansible

RUN mkdir /var/run/sshd

RUN unlink /etc/nginx/conf.d/default.conf

COPY ./images/nginx/bin/setup_and_run.sh /usr/local/bin/setup_and_run.sh

RUN chmod +x /usr/local/bin/setup_and_run.sh

WORKDIR /usr/var/avaea/deploy/playbooks


