#!/bin/bash
set -e

[ -f .env ] || { echo ".env not found"; exit 1; }
source .env

VPS_HOST="${VPS_HOST:-185.103.101.103}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
REMOTE_DIR="ai-gateway"

cd "$(dirname "$0")/.."
rsync -avz -e "ssh -p ${VPS_PORT}" --exclude node_modules --exclude .env ai-gateway/ ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/

[ -f ai-gateway/.env ] && scp -P ${VPS_PORT} ai-gateway/.env ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/.env

ssh -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST} "cd ${REMOTE_DIR} && npm install --production"
ssh -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST} "pkill -f 'node.*server.js' 2>/dev/null; cd ${REMOTE_DIR} && mkdir -p logs && nohup node server.js > logs/gateway.log 2>&1 &"
sleep 2
ssh -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST} "curl -s http://localhost:9999/health" | grep -q healthy && echo "OK" || echo "Check VPS logs"
