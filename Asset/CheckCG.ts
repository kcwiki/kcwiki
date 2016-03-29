import * as fs from "fs";
import * as _ from "lodash";
import * as HTTP from "../Lib/HTTP";
import * as Ship from "../Lib/Ship";

const requests: HTTP.Request[] = Ship.mstShipgraphShips.map((s: any) => {
    let name = Ship.mst_shipgraph_ship2Jp(s);   
    name = Ship.jp2En[name]
        || Ship.jp2EnEnemy[name] && `${Ship.jp2EnEnemy[name]} ${s.api_id}`
        || name && `${name} ${s.api_id}`
        || `${s.api_id}`;
    return { data: name || s.api_id.toString(), method: "HEAD", url: Ship.mst_shipgraph2Swf(s) };
});

const updateChecker = new HTTP.UpdateChecker(requests, 64);

const updateNumber = parseInt(process.argv[2]) || 0;

updateChecker.check((times: any, responses: any) => {
    const current = times[updateNumber];
    console.log("latest update:", current.date);
    let updatedFiles = "";
    for (const [ship, swf] of _.pairs(current.ships)) {
        updatedFiles += `${swf.link} ${ship.replace(/\ /g, "_") }\n`;
    }
    fs.writeFileSync(`${__dirname}/Data/CG/Responses.json`, JSON.stringify(responses, undefined, 2));
    fs.writeFileSync(`${__dirname}/Data/CG/Updated`, updatedFiles);
    fs.writeFileSync(`${__dirname}/Data/CG/Updates.json`, JSON.stringify(times, undefined, 2));
});
