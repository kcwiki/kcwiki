import * as fs from "fs";
import * as _ from "lodash";
import * as HTTP from "../Lib/HTTP";
import * as Ship from "../Lib/Ship";

const requests: HTTP.Request[] = [];

const secretaryOnly = process.argv[3] === "secretary";
const ships = process.argv[4] ? process.argv.slice(4).filter((v) => v.length > 0) : Ship.names;

for (const name of ships) {
    for (const [lineName, n] of _.pairs(Ship.Line.names)) {
        if (!secretaryOnly || n === 2 || n === 3 || n === 4) {
            const line = new Ship.Line(new Ship.Name(name), lineName);
            requests.push({ data: [name, lineName], method: "HEAD", url: line.url() });
        }
    }
}

const updateChecker = new HTTP.UpdateChecker(requests, 16);

const updateNumber = parseInt(process.argv[2]) || 0;

updateChecker.check((times: any, responses: any) => {
    const current = times[updateNumber];
    console.log("latest update:", current.date);
    let updatedFiles = "";
    for (const [ship, lines] of _.pairs(current.ships)) {
        for (const [lineName, line] of _.pairs(lines)) {
            updatedFiles += `${line.link} ${ship.replace(/ /g, "_")}_${lineName}\n`;
        }
    }
    fs.writeFileSync(`${__dirname}/Data/Voice/Responses.json`, JSON.stringify(responses, undefined, 2));
    fs.writeFileSync(`${__dirname}/Data/Voice/Updated`, updatedFiles);
    fs.writeFileSync(`${__dirname}/Data/Voice/Updates.json`, JSON.stringify(times, undefined, 2));
});
