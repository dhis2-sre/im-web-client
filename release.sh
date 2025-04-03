#!/usr/bin/env bash

git checkout master
git pull
tag=$(git tag --sort=-creatordate | head -n 1)

doesn't work... Needs to be the next tag

echo "$tag"
git tag "$tag"
git push --tags
