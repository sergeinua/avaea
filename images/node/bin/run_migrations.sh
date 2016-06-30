#!/bin/bash

set -e

file=/usr/var/avaea/migrations.lock

npm i

n=0
until [ $n -ge 6 ]
do

    if [ -e "$file" ] ; then
        node_modules/db-migrate/bin/db-migrate up --config database.json -e docker
        echo "Migrations executed successfully."
        exit 0
    else
        echo "Waiting for postgres..."
    fi

    n=$[$n+1]
    sleep 15
done

echo "Migrations failed by timeout."
exit 1


