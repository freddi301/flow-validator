#!/usr/bin/env bash

set -e

COMMIT=$(git rev-parse master)
TAG=$(git describe $(git rev-list --tags --max-count=1))

mkdir -p doc-building
cd doc-building
git init
mkdir -p doc-building
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages
git pull ../ gh-pages

cd ..
git --work-tree=./doc-building checkout master -- .

cd doc-building
cat .gitignore | sed '/docs/d' > .gitignore
yarn
npm run doc:build
git add --all
git commit -m "$TAG $COMMIT"
echo "$TAG $COMMIT"
