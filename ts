#!/bin/sh

tsc --module commonjs "$1.ts"
node "$1.js" "$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9"
rm "$1.js"
