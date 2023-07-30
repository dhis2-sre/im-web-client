SHELL := /bin/bash
tag ?= latest
version ?= $(shell yq e '.version' helm/chart/Chart.yaml)
clean-cmd = docker compose down --remove-orphans --volumes

docker-image:
	@echo "ENVIRONMENT: $$ENVIRONMENT"; \
	echo "API_URL: $$API_URL"; \
	IMAGE_TAG=$(tag) docker compose build prod

push-docker-image:
	IMAGE_TAG=$(tag) docker compose push prod

dev:
	docker compose up --build dev

clean:
	$(clean-cmd)

e2e-test:
	docker compose run test

cypress:
	yarn run cypress open --config-file ./cypress/cypress.config.js

.PHONY: docker-image push-docker-image test cypress


## CI/CD
init:
	echo TODO

check:
	echo TODO

keys:
	echo TODO

smoke-test:
	IMAGE_TAG=$(tag) docker compose up -d prod

.PHONY: init check keys smoke-test test
