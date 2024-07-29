#!/usr/bin/env bash

if [ "$APP_MODE" = "static" ]; then
    npm run start
fi

if [ "$APP_MODE" = "webrtc" ]; then
    npm run webrtc
fi
