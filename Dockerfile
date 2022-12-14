FROM node:19-alpine AS builder
ARG REACT_APP_IM_API
WORKDIR /app
COPY package*.json ./
RUN yarn install --check-files --immutable
COPY . .
RUN yarn build

FROM nginxinc/nginx-unprivileged:alpine
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/build .
USER nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]
