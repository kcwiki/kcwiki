
import fs = require("fs");
import _ = require("lodash")
import HTTP = require("./Lib/HTTP");
import Ship = require("./Lib/Ship");
import Server = require("./Lib/Server")

const requests: HTTP.Request[] = Ship.mst_shipgraph_ships.map((s) => {
    var name = Ship.mst_shipgraph_ship2Jp(s);
    name = Ship.jp2En[name] || name;
    return { data: name || s.api_id.toString(), method: "HEAD", url: Ship.mst_shipgraph2Swf(s) }
});

const updateChecker = new HTTP.UpdateChecker(requests, 64);

const updateNumber = parseInt(process.argv[2]) || 0;

updateChecker.check((times: any) => {
    var current = times[updateNumber];
    console.log("latest update:", current.date);
    var updatedFiles = "";
    for (let [ship, swf] of _.pairs(current.ships))
        updatedFiles += `${swf.link} ${ship.replace(/\ /g, "_") }\n`;
    fs.writeFileSync("Data/CG/Updated", updatedFiles);
    fs.writeFileSync("Data/CG/Updates.json", JSON.stringify(times, null, 2));
});
