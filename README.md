# Instance Manager Web Client

## Run the app locally

1. `yarn`
2. `yarn start`

## Run using docker compose

```sh
make dev
```

## Run using skaffold

```sh
skaffold dev
```

## Notes about fixed dependency versions

-   `openapi-typescript@5.4.1` is used because later versions do not work with OpenAPI V2, which our backend is stuck on
-   `axios-jwt` is fixed to `3.0.0` because the latest version at the time of writing (13-07-2023)
    has [a bug](https://github.com/jetbridge/axios-jwt/issues/57). We should be able to upgrade once this is fixed.

## TODO

-   Validate create group form
    -   Can submit without hostname... No effect, no error
-   Loading shows within form
