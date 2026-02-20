#!/bin/bash
set -e

[ -f .env ] || { echo ".env not found"; exit 1; }
source .env

HELIOS_HOST="${HELIOS_HOST:-se.ifmo.ru}"
HELIOS_USER="${HELIOS_USER:-s409858}"
HELIOS_PORT="${HELIOS_PORT:-2222}"
REMOTE_DIR="coursework"

cd "$(dirname "$0")/.."
./gradlew clean build -x test

ssh -p ${HELIOS_PORT} ${HELIOS_USER}@${HELIOS_HOST} "mkdir -p ${REMOTE_DIR}"
scp -P ${HELIOS_PORT} "$(ls build/libs/*-SNAPSHOT.jar | grep -v plain | head -1)" ${HELIOS_USER}@${HELIOS_HOST}:${REMOTE_DIR}/app.jar
scp -P ${HELIOS_PORT} .env.helios ${HELIOS_USER}@${HELIOS_HOST}:${REMOTE_DIR}/.env
ssh -p ${HELIOS_PORT} ${HELIOS_USER}@${HELIOS_HOST} "mkdir -p ${REMOTE_DIR}/db"
scp -P ${HELIOS_PORT} src/main/resources/db/*.sql ${HELIOS_USER}@${HELIOS_HOST}:${REMOTE_DIR}/db/
scp -P ${HELIOS_PORT} scripts/start-backend-helios.sh ${HELIOS_USER}@${HELIOS_HOST}:${REMOTE_DIR}/start.sh
ssh -p ${HELIOS_PORT} ${HELIOS_USER}@${HELIOS_HOST} "chmod +x ${REMOTE_DIR}/start.sh"

echo "Done. SSH to Helios, cd coursework, ./start.sh"
