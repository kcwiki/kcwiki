import * as fs from "fs";
import * as _ from "lodash";
import * as HTTP from "../Lib/HTTP";
import * as Ship from "../Lib/Ship";

if (process.argv[2] === "diff") {
    
    const excludeShips = process.argv[3] ? process.argv.slice(3).filter((v) => v.length > 0) : [];
    
    const responsesCurr = require(`${__dirname}/Data/Voice/Responses.json`);
    const responsesPrev = require(`${__dirname}/Data/Voice/ResponsesPrev.json`);
    for (const [ship, lines] of _.pairs(responsesCurr)) {
        const shipName = new Ship.Name(ship);
        for (const [line, lineCurr] of _.pairs(lines)) {
            const lineName = new Ship.Line(shipName, line),
                  linePrev = responsesPrev[ship] && responsesPrev[ship][line];
            if (linePrev) {
                if (lineCurr.modified === linePrev.modified) {
                    console.log(`same time: ${line} for ${ship}`);
                }
                if (lineCurr.size !== linePrev.size) {
                    console.log(`${lineName.url()} ${shipName.fullName(true).replace(/ /g, "_")}_${line}`);
                }
            } else {
                if (!_.includes(excludeShips, shipName.name)) {
                    console.log(`previous responses: no ${line} for ${ship}`);
                }
            }
        }
    }
    process.exit();
}

const updateNumber = parseInt(process.argv[2]) || 0;
const secretaryOnly = process.argv[3] === "secretary";
const ships = process.argv[4] ? process.argv.slice(4).filter((v) => v.length > 0) : Ship.names;

const requests: HTTP.Request[] = [];

for (const name of ships) {
    for (const [lineName, n] of _.pairs(Ship.Line.names)) {
        if (!secretaryOnly || n === 2 || n === 3 || n === 4) {
            const line = new Ship.Line(new Ship.Name(name), lineName);
            requests.push({ data: [name, lineName], method: "HEAD", url: line.url() });
        }
    }
}

const updateChecker = new HTTP.UpdateChecker(requests, 16);

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
