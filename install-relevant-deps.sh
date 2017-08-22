#!/bin/sh

REACT=${REACT:-15}

echo "installing React $REACT"

if [ "$REACT" = "0.13" ]; then
    npm run react:13
fi

if [ "$REACT" = "0.14" ]; then
    npm run react:14
fi

if [ "$REACT" = "15.4" ]; then
    npm run react:15.4
fi

if [ "$REACT" = "15" ]; then
    npm run react:15
fi

if [ "$REACT" = "16" ]; then
    npm run react:16
fi

JSDOM=${JSDOM:-7}

if [ "$JSDOM" = "7" ]; then
    npm run env -- jsdom:7
fi

if [ "$JSDOM" = "8" ]; then
    npm run env -- jsdom:8
fi

if [ "$JSDOM" = "9" ]; then
    npm run env -- jsdom:9
fi

if [ "$JSDOM" = "10" ]; then
    npm run env -- jsdom:10
fi

if [ "$JSDOM" = "11" ]; then
    npm run env -- jsdom:11
fi
