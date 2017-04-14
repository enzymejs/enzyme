#!/bin/sh

set -e

npm run clean
npm run build
cd node_modules/enzyme-example-$1
npm install
npm i ../../
npm test
