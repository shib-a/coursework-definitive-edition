#!/bin/bash
set -e

[ -f .env ] || { echo ".env not found"; exit 1; }
source .env

cd "$(dirname "$0")/.."
scp -P ${HELIOS_PORT:-2222} src/main/resources/db/*.sql ${HELIOS_USER:-s409858}@${HELIOS_HOST:-se.ifmo.ru}:~/
ssh -p ${HELIOS_PORT:-2222} ${HELIOS_USER:-s409858}@${HELIOS_HOST:-se.ifmo.ru} "psql -h pg -d studs -f schema.sql && psql -h pg -d studs -f functions.sql && rm schema.sql functions.sql"
echo "DB init done"
