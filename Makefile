tag ?= latest
version ?= $(shell yq e '.version' helm/chart/Chart.yaml)
clean-cmd = docker compose down --remove-orphans --volumes

docker-image:
	@[[ -f env/${ENVIRONMENT}.env ]] && source env/${ENVIRONMENT}.env; \
	IMAGE_TAG=$(tag) docker compose build prod

push-docker-image:
	IMAGE_TAG=$(tag) docker compose push prod

dev:
	docker compose up --build dev

clean:
	$(clean-cmd)

helm-chart:
	@helm package helm/chart

push-helm:
	@curl --user "$(CHART_AUTH_USER):$(CHART_AUTH_PASS)" \
        -F "chart=@im-web-client-$(version).tgz" \
        https://helm-charts.fitfit.dk/api/charts

.PHONY: docker-image push-docker-image helm-chart push-helm


## CI/CD
check:
	echo cicd

keys:
	echo cicd

smoke-test:
	IMAGE_TAG=$(tag) docker compose up -d prod

test:
	echo cicd

.PHONY: check keys smoke-test test
