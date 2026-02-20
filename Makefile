.PHONY: help install tunnel frontend deploy

help:
	@echo "install tunnel tunnel-reverse helios-tunnel frontend deploy init-db helios clean"

install:
	cd ai-gateway && npm install
	cd frontend/design && npm install

tunnel:
	./scripts/start-ssh-tunnel.sh

tunnel-reverse:
	./scripts/start-reverse-tunnel.sh

helios-tunnel:
	./scripts/start-helios-tunnel.sh

frontend:
	./scripts/start-frontend.sh

deploy:
	./scripts/deploy-to-helios.sh

deploy-helios:
	./scripts/deploy-to-helios.sh

deploy-vps:
	./scripts/deploy-to-vps.sh

init-db:
	./scripts/init-db-helios.sh

helios:
	./scripts/ssh-helios.sh

backend:
	./gradlew bootRun

gateway:
	cd ai-gateway && npm start

config:
	@[ -f .env ] || cp .env.example .env
	@[ -f ai-gateway/.env ] || cp ai-gateway/.env.example ai-gateway/.env
	@[ -f .env.helios ] || cp .env.helios.example .env.helios

clean:
	./gradlew clean
	rm -rf frontend/design/build
	rm -f *.log

.DEFAULT_GOAL := help
