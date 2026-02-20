#!/bin/bash
set -e

[ -f .env ] || { echo ".env not found"; exit 1; }
source .env

ssh -p ${HELIOS_PORT:-2222} ${HELIOS_USER:-s409858}@${HELIOS_HOST:-se.ifmo.ru} "psql -h pg -d studs -c '\dt tiishka_*'"
