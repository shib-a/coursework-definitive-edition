#!/usr/bin/env bash
set -e

grep -q "Host tiishka-helios" ~/.ssh/config 2>/dev/null || {
    echo "Add to ~/.ssh/config:
Host tiishka-helios
    HostName se.ifmo.ru
    User s409858
    Port 2222"
    exit 1
}

lsof -i :8080 | grep -q ssh && { echo "Tunnel already running"; exit 0; }

ssh -N -L 8080:localhost:31337 tiishka-helios
