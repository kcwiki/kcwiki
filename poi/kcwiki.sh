#!/bin/bash

mkdir -p kcwiki

for arg in "$@" ; do
  curl -s -o kcwiki/$arg.wiki https://db.kcwiki.org/wiki/enemy/$arg.html
done
