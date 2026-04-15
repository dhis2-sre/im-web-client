FROM node:23-alpine AS builder
RUN corepack enable && corepack prepare yarn --activate
WORKDIR /app
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable
COPY . .
RUN yarn build

FROM nginxinc/nginx-unprivileged:alpine
USER root
RUN apk --no-cache -U upgrade && apk add --no-cache gettext
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/build .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir /run/env && chown nginx:nginx /run/env
USER nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
