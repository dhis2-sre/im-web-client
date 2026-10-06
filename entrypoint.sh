#!/bin/sh
# The dashboard the component log links point at. Defaulted here so an environment that says nothing
# still gets working links: the deployment descriptors can set it, but the one on the im-vm servers
# is pinned to a commit of its own and cannot be relied on to carry a new variable.
export GRAFANA_LOGS_URL="${GRAFANA_LOGS_URL:-https://grafana.im.dhis2.org/d/b275a775-8360-485a-896c-832ef6fef29d/instance-logs}"

envsubst < /usr/share/nginx/html/env-config.template.js > /run/env/env-config.js
exec "$@"
