#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../frontend/design"

curl -s http://localhost:8080/actuator/health > /dev/null 2>&1 || {
    echo "Backend not found. Run: make helios-tunnel"
    if [ -t 0 ]; then
        read -p "Continue? (y/N) " -n 1 -r
        echo
        [[ $REPLY =~ ^[Yy]$ ]] || exit 1
    else
        exit 1
    fi
}

npm start
