#!/bin/bash

set -e

npm i

./node_modules/sails/bin/sails.js lift
