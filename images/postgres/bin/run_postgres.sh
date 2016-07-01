#!/bin/bash

file=/usr/var/avaea/migrations.lock

if [ -e "$file" ] ; then
    unlink "$file"
fi

nohup /docker-entrypoint.sh postgres > /dev/null 2>&1 &

sleep 20

if [ ! -e "$file" ] ; then
    touch "$file"
fi

sleep infinity
