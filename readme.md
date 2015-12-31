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

Barely tested, no warranty.

* Run as `./ts Proxy/Main.ts`, configure using `Proxy/config.json`:
 * `port`: set proxy port (it should be set together with hostname in viewer/browser settings in order to use the proxy).
 * `log.proxy`: log proxy events (requests, errors, changes, etc.) if specified (`true` for `stdout`, string for a file).
 * `fix_dmm_cookie`: set to `true` to rewrite cookies when browsing DMM, similarly to https://github.com/gakada/DMM.
 * `anti_cat.wait_for_network`: seconds to wait (repeatedly) when there is no network (should be >= 1, disabled otherwise), prevent some cat errors.
* In plans:
 * `log.api`: log API request/responses if specified.
 * `log.api_start2`: save `api_start2` to a file if specified.
 * `anti_cat.use_cached_assets`: switch to locally saved game assets (if any) on network errors, also prevent some cat errors.
 * `anti_cat.spam_api`: retry API calls on network errors (probably unsafe and shouldn't be used normally).
 * `cache_assets`: save game assets locally, use them while `last-modified` is up-to-date.
 * `use_modded_assets`: ignore `last-modified` and always use specified assets from a local storage.
 * `cache_core_swf`: save core SWF files (offline mode bootstrap).
 * `use_local_kc_server`: redirect API calls to a specified server that mocks game API (offline/sandboxed mode).
