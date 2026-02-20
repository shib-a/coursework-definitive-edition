#!/bin/bash
set -e

[ -f .env ] || { echo ".env not found"; exit 1; }
source .env

HELIOS_HOST="${HELIOS_HOST:-se.ifmo.ru}"
HELIOS_USER="${HELIOS_USER:-s409858}"
HELIOS_PORT="${HELIOS_PORT:-2222}"

curl -s http://localhost:9999/health > /dev/null || { echo "Run make tunnel first"; exit 1; }

pkill -f "ssh.*${HELIOS_HOST}.*33333" 2>/dev/null || true
sleep 1

ssh -f -N -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes \
    -R 33333:localhost:9999 -p ${HELIOS_PORT} ${HELIOS_USER}@${HELIOS_HOST}

echo "Helios:33333 -> localhost:9999"
