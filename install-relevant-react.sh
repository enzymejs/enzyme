#!/bin/sh

REACT="${REACT:-${1:-16}}"

echo "installing React $REACT"

if [ "$REACT" = "0.13" ]; then
  echo "*** npm run env: -- 13"
  npm run env: -- 13
elif [ "$REACT" = "0.14" ]; then
  echo "*** npm run env: -- 14"
  npm run env: -- 14
else
  echo "*** npm run env: -- "${REACT}""
  npm run env: -- "${REACT}"
fi
