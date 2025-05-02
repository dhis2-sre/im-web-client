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

- `openapi-typescript@5.4.1` is used because later versions do not work with OpenAPI V2, which our backend is stuck on

## TODO

- Validate create group form
    - Can submit without hostname... No effect, no error
- Loading shows within form
