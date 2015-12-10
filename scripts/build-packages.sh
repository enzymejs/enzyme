#!/usr/bin/env zsh

# die on error
setopt -e

for pkg in packages/*/ ; do
  pushd ${pkg} > /dev/null
  npm run build
  popd > /dev/null
done
