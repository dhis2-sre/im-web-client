SHELL := /bin/bash
tag ?= latest
version ?= $(shell yq e '.version' helm/chart/Chart.yaml)
clean-cmd = docker compose down --remove-orphans --volumes

docker-image:
	@echo "ENVIRONMENT: $$ENVIRONMENT"; \
	[[ -f env/${ENVIRONMENT}.env ]] && source env/${ENVIRONMENT}.env; \
	echo "IM_API: $$IM_API"; \
	IMAGE_TAG=$(tag) docker compose build prod

push-docker-image:
	IMAGE_TAG=$(tag) docker compose push prod

dev:
	docker compose up --build dev

clean:
	$(clean-cmd)

.PHONY: docker-image push-docker-image


## CI/CD
init:
	echo TODO

check:
	echo TODO

keys:
	echo TODO

smoke-test:
	IMAGE_TAG=$(tag) docker compose up -d prod

test:
	echo TODO

.PHONY: init check keys smoke-test test
