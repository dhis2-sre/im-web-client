#!/bin/sh
envsubst < /usr/share/nginx/html/env-config.template.js > /run/env/env-config.js
exec "$@"
