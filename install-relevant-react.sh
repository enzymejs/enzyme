#!/bin/sh

REACT="${REACT:-${1:-16}}"

echo "installing React $REACT"

if [ "$REACT" = "0.13" ]; then
  npm run env -- 13
elif [ "$REACT" = "0.14" ]; then
  npm run env -- 14
else
  npm run env -- "${REACT}"
fi
