SHELL := /bin/bash

# Every target needs the dev overlay: the build contexts, the published ports and the dev and test
# services all live there. .envrc exports this as well for bare docker compose calls, but CI runs
# these targets without direnv.
export COMPOSE_FILE ?= docker-compose.yml:docker-compose.dev.yml

tag ?= latest
version ?= $(shell yq e '.version' helm/chart/Chart.yaml)
clean-cmd = docker compose down --remove-orphans --volumes

dev:
	docker compose up --build dev

docker-image:
	@echo "ENVIRONMENT: $$ENVIRONMENT"; \
	echo "API_URL: $$API_URL"; \
	IMAGE_TAG=$(tag) docker compose build prod

push-docker-image:
	IMAGE_TAG=$(tag) docker compose push prod

clean:
	$(clean-cmd)

e2e-test:
	docker compose run --remove-orphans e2e-test

e2e-test-ui:
	npx playwright test --ui

test:
	docker compose run test

.PHONY: docker-image push-docker-image test


## CI/CD
init:
	echo TODO

check:
	echo TODO

keys:
	echo TODO

smoke-test:
	IMAGE_TAG=$(tag) docker compose up -d prod

.PHONY: init check keys smoke-test
