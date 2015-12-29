# Requirements

* If on Windows: https://desktop.github.com/
* https://www.free-decompiler.com/flash/ (with Java) for SWF extraction.
* https://nodejs.org/ & typescript (duh): `npm install typescript -g; npm install tsd -g; npm install; tsd install`
* `git submodule update`

# Assets

## CG

* Get `Lib/Data/api_start2.json` first (or use the old one).
* Make sure `Lib/KanColleViewer-Translations/Ships.xml` is synced with `Lib/Data/api_start2.json` (or names for new ships will be untranslated).
* Check ship/enemy/seasonal ship/unknown ship SWF updates (write `Asset/Data/CG/*`): `./ts Asset/CheckCG` for latest update or `./ts Asset/CheckCG <update-number>` for previous update (previous updates get overridden by new updates).
* Check `Asset/Data/CG/*` files.
* Download updated SWF and extract CG for specified update (in `Asset/Output/CG/*`): `./Asset/GetCG`.
* To download all library SWF files (include seasonal cards): `./ts GetLibrarySwf` (write `Asset/Output/LibrarySwf/*`).

## Voice

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

* Get current ranking points for all servers (using http://senka.me/): `./GetServerRanks` (write `Output/ranks`).

# In plans

## Proxy

* Save `api_start2` automatically.
* Log all API responses for future analysis (a-la logbook, but in raw JSON).
* Prevent cat errors caused by `getaddrinfo` (and more? probably can use cached assets, probably can't re-request API calls, except maybe some).
* Caching and modding for assets.
* Mocking and offline mode for API.
