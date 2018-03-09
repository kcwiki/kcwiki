#!/bin/bash

mkdir -p {data,poidb/db}

fetch() {
  last_ts="$(cat "poidb/dump.ts" 2>/dev/null)"
  current_ts="$(curl -sI "https://poi.io/dump/dropshiprecords.gz" | grep "last-modified" | cut -c 16-)"
  echo "last timestamp: ${last_ts}"
  echo "current timestamp: ${current_ts}"
  if [ "$last_ts" = "$current_ts" ] ; then
    echo "timestamps are equal, continuing download..."
    curl -C - -o "poidb/dump.gz" "https://poi.io/dump/dropshiprecords.gz"
  else
    echo "new timestamp, removing and starting new download..."
    echo "$current_ts" > "poidb/dump.ts"
    rm -f "poidb/dump.gz"
    curl -C - -o "poidb/dump.gz" "https://poi.io/dump/dropshiprecords.gz"
  fi
  last_ts="$(cat "poidb/dump.ts" 2>/dev/null)"
  current_ts="$(curl -sI "https://poi.io/dump/dropshiprecords.gz" | grep "last-modified" | cut -c 16-)"
  echo "last timestamp: ${last_ts}"
  echo "current timestamp: ${current_ts}"
  if [ "$last_ts" != "$current_ts" ] ; then
    echo "timestamp changed during download!"
  else
    echo "done, timestamps are equal"
  fi
}

mongo_started=0

start_mongo() {
  if [ "$mongo_started" = "0" ] ; then
    echo "spawning mongod..."
    mongod --quiet --dbpath poidb/db > /dev/null &
    ((++mongo_started))
    sleep 10
  fi
}

restore() {
  echo "extracting with mongorestore..."
  time mongorestore --quiet --gzip --archive=poidb/dump.gz -d poi-production
  sleep 10
}

stop=0
commands=0
for arg in "$@" ; do
  if [ "$arg" = "stop" ] ; then
    stop=1
  elif [ "$arg" = "fetch" ] ; then
    fetch
  elif [ "$arg" = "new" ] ; then
    echo "clearing db directory..."
    rm -rf poidb/db
    mkdir -p poidb/db
  elif [ "$arg" = "restore" ] ; then
    start_mongo
    restore
  elif [ "$arg" = "data" ] ; then
    start_mongo
    time node poidb-data "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9" "${10}" "${11}" "${12}" "${13}" "${14}" "${15}"
  else
    if ! [[ "$arg" =~ ^[0-9]+$ ]] ; then
      echo "unknown command $arg"
    fi
    continue
  fi
  ((++commands))
done

if [ "$commands" = "0" ] ; then
  echo "usage: sh poidb.sh [ fetch ] [ new ] [ restore ] [ data <map id>... ]"
fi

if [ "$stop" = "1" ] ; then
  echo "stopping mongod..."
  mongo --eval "db.getSiblingDB('admin').shutdownServer()"
fi
