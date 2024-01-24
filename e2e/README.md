# Introduction
Our E2E tests are based on the Playwright framework.

We're using the environment variables defined in .env as the rest of the application.
Most noticeable `USER_EMAIL`, `USER_PASSWORD` and `HOST?` needs to be configured.

## Run in Docker
```sh
make e2e-test
```

## Run locally with UI
```sh
make e2e-test-ui
```
