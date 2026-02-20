#!/usr/bin/env bash
set -e

[ -f .env ] || { echo ".env not found"; exit 1; }
[ -f app.jar ] || { echo "app.jar not found. Run make deploy-helios"; exit 1; }

source .env
SERVER_PORT=${SERVER_PORT:-31337}

if [ "${AI_GATEWAY_ENABLED}" = "true" ]; then
    GATEWAY_URL="${AI_GATEWAY_URL:-http://localhost:33333}"
    curl -s -f "${GATEWAY_URL}/health" > /dev/null 2>&1 || {
        echo "AI Gateway not available at ${GATEWAY_URL}"
        [ -t 0 ] || echo "Continuing without AI"
        if [ -t 0 ]; then
            read -p "Continue? (y/N) " -r
            [[ $REPLY =~ ^[Yy]$ ]] || exit 1
        fi
    }
fi

java -Xmx512m -Xms256m -jar app.jar \
    --spring.profiles.active=production \
    --server.port=${SERVER_PORT} \
    > backend.log 2>&1 &
echo $! > backend.pid

sleep 5
curl -s http://localhost:${SERVER_PORT}/actuator/health > /dev/null && echo "Backend up" || echo "Check backend.log"
