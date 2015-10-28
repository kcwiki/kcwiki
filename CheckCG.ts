
import fs = require("fs");
import _ = require("lodash")
import HTTP = require("./Lib/HTTP");
import Ship = require("./Lib/Ship");
import Server = require("./Lib/Server")

const requests: HTTP.Request[] = Ship.names.map((name) => {
    return { data: name, method: "HEAD", server: Server.ips.get("Yokosuka"), port: 80, path: Ship.en2Swf(name) }
});

const updateChecker = new HTTP.UpdateChecker(requests, 32);

updateChecker.check((times: any) => {
    var current = times[0];
    console.log("latest update:", current.date);
    var updatedFiles = "";
    for (let [ship, swf] of _.pairs(current.ships))
        updatedFiles += `${swf.link} ${ship.replace(/\ /g, "_") }\n`;
    fs.writeFileSync("Data/CG/Updated", updatedFiles);
    fs.writeFileSync("Data/CG/Updates.json", JSON.stringify(times, null, 2));
});
