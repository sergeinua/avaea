#!/bin/bash

set -e

ssh -nNT -o StrictHostKeyChecking=no -L *:23457:sandbox.trippro.com:80 -p 54976 tunnel@52.24.104.220 -f -i ~/.ssh/tunnel_rsa

nginx -g "daemon off;"