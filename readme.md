For old scripts, see the `old` branch.

Old and new scripts will be added here in due time.

# `data/`

[kcdata](https://github.com/gakada/kcdata) submodule, various manual or generated data.

# `wikia/`

KanColle Wikia scripts.

* `fetch`: convert Lua data modules to JSON. Fetches all modules in categories specified in `modules` in `config` file, converts them to JSON with `convert.lua`, writes JSON files in `data/wikia/`.
* `translations`: run after `fetch` to generate translation JSON files (`*_names.json`) in `data/wikia/`.
* `equipability`: generate client based equipability data in `data/client/`.

# TODO

* More translations?
* Publish asset scanners and fetchers.
  * Need a good HTTP requesting library.
* Publish PoiDB tool.
* Total check for Wikia JSON data.
* Publish/make more Wikia automation.
* [nodemw](https://github.com/macbre/nodemw) is lacking.
