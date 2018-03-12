For old scripts, see the `old` branch.

Old and new scripts will be added here in due time.

## `data/`

[kcdata](https://github.com/gakada/kcdata) submodule, various manual or generated data.

## `wikia/`

KanColle Wikia scripts.

* `node wikia/fetch run`: convert Lua data modules to JSON. Fetches all modules in categories specified in `modules` in `config` file, converts them to JSON with `luaparse`, writes JSON files in `data/wikia/`.
* `node wikia/fetch run all`: fetch all Lua modules, including code.
* `node wikia/translations`: run after `fetch` to generate translation JSON files (`*_names.json`) in `data/wikia/`.
* `sh plugin-translator.sh`: run `node wikia/fetch run`, `node wikia/translations` and copy generated translations in `../plugin-translator/`.

## `poi/`

PoiDB scripts, see [readme](poi/readme.md).

## `misc/`

* `node misc/equipability`: generate client based equipability data in `data/client/`.

## TODO

* Publish asset scanners and fetchers.
  * Need a good HTTP requesting library.
* Publish second half of PoiDB tool.
* Total check for Wikia JSON data.
* Publish/make more Wikia automation.
* [nodemw](https://github.com/macbre/nodemw) is lacking.
