# Requirements

* If on Windows: https://desktop.github.com/
* https://www.free-decompiler.com/flash/ (with Java)
* https://nodejs.org/ & typescript (duh): `npm install typescript -g; npm install tsd -g; npm install; tsd install`

# Updates

* Get `Data/api_start2.json` first (or use the old one)
* Make sure `./Lib/KanColleViewer-Translations/Ships.xml` is synced with `Data/api_start2.json`
* Check ship/enemy/seasonal ship/unknown ship SWF updates (write `Data/CG/*`): `./ts CheckCG` for latest update or `./ts CheckCG <update-number>` for previous update (previous updates get overriden by new updates).
* Check `Data/CG/*` files.
* Download updated SWF and extract CG for specified update (in `Output/CG/*`): `./GetCG`

# Other

* Get current ranking points for all servers (using http://senka.me/): `./GetServerRanks` (write `Output/ranks`) 
* Generate `Ships.csv`, `BaseShipNames.csv`, `ShipStats.csv` and `Enemy.csv` in `Data/`: `./ts GenCSV` (using `Data/api_start2.json`, `./Lib/KanColleViewer-Translations/Ships.xml` and `Data/enemy.json`)
