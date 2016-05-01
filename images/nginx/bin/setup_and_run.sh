#!/bin/bash

set -e

/usr/sbin/sshd

ansible-playbook -i hosts --extra-vars "APP=demo" deploy.sandbox.yml
ansible-playbook -i hosts --extra-vars "APP=abo" deploy.sandbox.yml

ssh -nNT -o StrictHostKeyChecking=no -L *:23457:sandbox.trippro.com:80 -p 54976 tunnel@52.24.104.220 -f -i ~/.ssh/tunnel_rsa

nginx -g "daemon off;"