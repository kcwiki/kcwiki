#!/bin/sh

tsc --module commonjs $1.ts
node $1.js $2 $3
rm $1.js
