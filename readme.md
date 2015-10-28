# Requirements

* If on Windows: https://desktop.github.com/
* https://www.free-decompiler.com/flash/ (with Java)
* https://nodejs.org/ & typescript (duh): `npm install typescript -g; npm install tsd -g; npm install; tsd install`

# Updates

* Get `Data/api_start2.json` first (or use the old one)
* Make sure `./Lib/KanColleViewer-Translations/Ships.xml` is synced with `Data/api_start2.json`
* Check ship SWF updates (write `Data/CG/*`): `./ts CheckCG`
* Check `Data/CG/*` files.
* Download updated SWF and extract CG (in `Output/CG/*`): `./GetCG`