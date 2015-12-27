/// <reference path="../typings/node/node.d.ts" />

import * as child_process from "child_process";
const api = require("../Lib/Data/api_start2.json");

child_process.spawnSync("mkdir", ["-p", `${__dirname}/Output/LibrarySwf/`]);

for (const s of api.api_data.api_mst_shipgraph) {
    let name: string = undefined;
    for (const s2 of api.api_data.api_mst_ship) {
        if (s2.api_id === s.api_id) {
            name = s2.api_name;
            break;
        }
    }
    if (!name) {
        const url = `http://203.104.209.71/kcs/resources/swf/ships/${s.api_filename}.swf?VERSION=${s.api_version}`;
        console.log(s.api_id, url);
        child_process.spawnSync("curl", [url, "-o", `${__dirname}/Output/LibrarySwf/${s.api_filename}.swf`]);
    }
}
