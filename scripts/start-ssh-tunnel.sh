#!/bin/bash
set -e

[ -f .env ] || { echo ".env not found"; exit 1; }
source .env

VPS_HOST="${VPS_HOST:-your-vps-ip}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
LOCAL_PORT="${GATEWAY_LOCAL_PORT:-9999}"
REMOTE_PORT="${GATEWAY_REMOTE_PORT:-9999}"

pkill -f "ssh.*${VPS_HOST}.*${LOCAL_PORT}" 2>/dev/null || true
sleep 1

lsof -ti :${LOCAL_PORT} | xargs kill -9 2>/dev/null || true
sleep 1

ssh -f -N -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes \
    -L ${LOCAL_PORT}:localhost:${REMOTE_PORT} -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST}

sleep 2
curl -s http://localhost:${LOCAL_PORT}/health || echo "Gateway not responding on VPS"
