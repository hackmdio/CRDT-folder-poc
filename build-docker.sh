#!/usr/bin/env bash

npm i
npm run build -- --mode=development

docker build . -t hmd-crdt-folder-poc
