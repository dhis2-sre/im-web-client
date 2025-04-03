FROM node:23-alpine AS builder
ARG VITE_API_URL
RUN corepack enable && corepack prepare yarn --activate
WORKDIR /app
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable
COPY . .
RUN yarn build

FROM nginxinc/nginx-unprivileged:alpine
USER root
RUN apk --no-cache -U upgrade
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/build .
USER nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]
