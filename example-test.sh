#!/bin/sh

cd node_modules/enzyme-example-$1
npm install
npm i ../../
npm test
