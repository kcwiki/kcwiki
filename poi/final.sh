#!/bin/bash

mkdir -p {config,output}

cut=${cut:--1}
echo cut = $cut

echo "fetching KC3Kai edges.json file"
curl -s -o config/edges.json https://raw.githubusercontent.com/KC3Kai/KC3Kai/update-cumulative/src/data/edges.json

echo "converting data to CSV..."
node data-csv

echo "generating wikitext from data..."
for arg in "$@" ; do
  node csv-data $arg $cut -1 -1 101
  node data-nodeinfo $arg
done
