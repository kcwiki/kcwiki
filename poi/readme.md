# Requirements

* `bash`, `coreutils`, `curl`, etc. for top level scripts. [MSYS2](https://www.msys2.org/) is recommended for Windows.
* [MongoDB](https://www.mongodb.com/) for PoiDB backend (up to ~10 GB of disk space and few GB of free RAM is required to process the dump).
* [Node.js](https://nodejs.org/) for most scripts (do `npm i` first).
* All should be in `PATH`.

# Overview

There are 2 backends that generate pattern and drop data in JSON format, frontend (Wikia) scripts are used to generate NodeInfo and DropList wikitext from that data.

    poidb  : dump -> db -> | data -> NodeInfo, DropList
    kcwiki : wikitext   -> |

Using

    poidb.sh fetch: poidb/dump.gz, poidb/dump.ts
    poidb.sh restore: poidb/db
    poidb.sh data ...: data/data.json

# PoiDB backend

Using [Poi Statistics MongoDB dump](https://github.com/kcwikizh/poi-statistics/issues/21).

Usage:

    sh poidb.sh [ fetch ] [ new ] [ restore ] [ data <map id>... ] [ stop ]

* `sh poidb.sh fetch` : download the dump in `poidb/dump.gz`. Timestamp (`poidb/dump.ts`) is used to handle updates.
* `sh poidb.sh new` : clear `poidb/db`.
* `sh poidb.sh restore` : spawn `mongod` on `poidb/db`, extract with `mongorestore` from `poidb/dump.gz`.
* `sh poidb.sh data <map id>...` : spawn `mongod` on `poidb/db`, collect, validate and group pattern and drop data in `data/data.json` for given maps. Uses `poidb-data.js`.
* `sh poidb.sh stop`: stop `mongod`.

Commands can be combined, e.g.

    $ sh poidb.sh fetch new restore data 411 412 413 414 415 416 417 stop

# TODO

* KCWiki backend, using `https://db.kcwiki.org/wiki/enemy/` wikitext pages.
* Drops in KCWiki backend.
* Backend for [poi-statistics](https://db.kcwiki.org/drop/) website data (JSON).
* Frontend.
