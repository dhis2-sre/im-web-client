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

# Release

From an up to date master, pick the version and run:

```shell
make release version=0.39.0
```

It tags master and pushes the tag, which builds `dhis2/im-web-client:<version>` and deploys it to prod.

# Design

- https://www.figma.com/proto/DOrik1KNpszSVrGFmChez3/Instance-manager?node-id=48-3665&starting-point-node-id=1%3A2
