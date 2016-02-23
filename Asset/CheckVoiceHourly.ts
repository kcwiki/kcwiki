import * as fs from "fs";
import * as _ from "lodash";
import * as HTTP from "../Lib/HTTP";
import * as Ship from "../Lib/Ship";

const requests: {method: string, url: string, data: Ship.Name}[] = [];

const ships = Ship.names;

for (const name of ships) {
    const ship = new Ship.Name(name);
    const line = new Ship.Line(ship, "Hourly 00");
    requests.push({ data: ship, method: "HEAD", url: line.url() });
}

let shipsWithHourlies = {};

const fetcher = new HTTP.GroupFetcher(requests, 32, (request, response, next, res) => {
    if (res.statusCode === 200) {
        const ship: Ship.Name = request.data;
        if (shipsWithHourlies[ship.name]) {
            shipsWithHourlies[ship.name].push(ship.toKai());
        } else {
            shipsWithHourlies[ship.name] = [ship.toKai()];
        }
    }
    next();
});

console.log("checking ships with hourlies...");
fetcher.ignoreErrors = true;
fetcher.fetch(() => {
    console.log("done");
    HTTP.sortSubArrays(shipsWithHourlies);
    shipsWithHourlies = HTTP.sortObject(shipsWithHourlies);
    fs.writeFileSync(`${__dirname}/Output/hourlies.json`, JSON.stringify(shipsWithHourlies, undefined, 2));
});
