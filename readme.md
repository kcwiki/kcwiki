# Requirements

* If on Windows: https://desktop.github.com/
* https://nodejs.org/ & typescript (duh): `npm install typescript -g; npm install tsd -g; npm install; tsd install`
* `git submodule update`

# Assets

## CG

Requires https://www.free-decompiler.com/flash/ (with Java) for SWF extraction.

* Get `Lib/Data/api_start2.json` first (or use the old one).
* Make sure `Lib/KanColleViewer-Translations/Ships.xml` is synced with `Lib/Data/api_start2.json` (or names for new ships will be untranslated).
* Check ship/enemy/seasonal ship/unknown ship SWF updates (write `Asset/Data/CG/*`): `./ts Asset/CheckCG` for latest update or `./ts Asset/CheckCG <update-number>` for previous update (previous updates get overridden by new updates).
* Check `Asset/Data/CG/*` files.
* Download updated SWF and extract CG for specified update (in `Asset/Output/CG/*`): `./Asset/GetCG`.
* To download all library SWF files (include seasonal cards): `./ts GetLibrarySwf` (write `Asset/Output/LibrarySwf/*`).

## Voice

Requires https://www.ffmpeg.org/ for `mp3 -> ogg` conversion.

* For ship voice lines (enemy lines not supported), same, but use `Voice` instead of `CG` (`Asset/Output/{mp3,ogg}/*` generated).
* Use `./ts Asset/CheckVoice <update-number> secretary` to check secretary lines only.

# CSV stats

Requires `Lua/Output/enemy.json` for enemy names translations (not supported by `KanColleViewer-Translations`).

* `./ts CSV/Gen` to generate CSV files in `CSV` directory (ship and enemy stats from `api_start2`).

# Lua

* Download Lua modules: `./ts Lua/Get` for ship modules, `./ts Lua/Get enemy` for enemy modules (write `Lua/Output/Lua/*`).
* Convert to JSON: `lua Lua/Convert.lua > Lua/Output/Ships.json`, `lua Lua/Convert.lua enemy > Lua/Output/Enemy.json`.
* Check JSON vs `api_start2`, `port`, etc.: TBD.

# Wiki

TBD:

* Fetcher/checker for ship pages.
* Voice list and update report scripts.

# Misc

* Get current ranking points for all servers (using http://senka.me/): `Misc/GetServerRanks` (write `Misc/Output/ranks` wikitext), rerun if required (CloudFlare/connection issues), clean `Misc/Output/*` and rerun to update.

# Proxy

* Run as `./ts Proxy/Main.ts <config-file>`, see `Proxy/examples/*` for config examples (without config will work as a basic HTTP proxy with all features disabled):
 * `port`: set proxy port (default is `3000`, also should be set together with hostname in viewer/browser settings in order to use the proxy).
 * `log.proxy`: log proxy events to a file (`stdout` if `true`). Use `log.mode` to set [writing mode](https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback).
 * `log.api`: log API responses to a directory (`Proxy/api` if `true`).
 * `log.api_start2`: save `api_start2` response to a file (`Proxy/api_start2` if `true`). Use `log.exit` to close the proxy after `api_start2` is saved.
 * `fix_dmm_cookie`: set to `true` to rewrite cookies when browsing DMM, similarly to https://github.com/gakada/DMM.
 * `anti_cat.wait_for_network`: seconds to wait (repeatedly) when there is no network (should be >= 1, disabled otherwise), prevent some cat errors.
 * `cache`: save game assets and core SWF files to a directory (`Proxy/cache` if `true`). 
* In plans:
 * `anti_cat.use_cache`: switch to locally saved game assets (if any) on network errors, also prevent some cat errors.
 * `anti_cat.spam_api`: retry API calls on network errors (probably unsafe and shouldn't be used normally).
 * `use_cache`: use locally cached assets when `last-modified` is up-to-date.
 * `use_mods`: ignore `last-modified` and always use specified assets from a local storage.
 * `use_kc_server`: redirect API calls to a specified server that mocks game API (offline/sandboxed mode, static files that require `api_token` should be already cached by proxy, other static files can be still required from Yokosuka, the server should reimplement parts of the dynamic API, i.e. player state and JSON responses).

Current status (work = somehow tested and should work, but still can be bugged):

* Tested with Firefox only.
* HTTPS traffic doesn't go through this proxy.
* HTTP work, DMM browsing (including cookie fix) work, HTTP headers should be unaffected (except DMM cookies when `fix_dmm_cookie` is enabled).
* KC, API logging and resource saving work:
 * `Proxy/examples/login.log`: activity from DMM game link to Homeport.
