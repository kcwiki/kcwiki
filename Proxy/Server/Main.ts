/// <reference path="../../typings/node/node.d.ts" />

import * as path from "path";
import * as fs from "fs";
import * as http from "http";

import * as Storage from "../Storage";
import * as API from "./API";

const port = parseInt(process.argv[2]);

const user = new Storage.Object(path.join(__dirname, "users", "Dandy.json"));

const apiTable = API.getTable(user);

function handleClient(req: http.IncomingMessage, res: http.ServerResponse): void {
    req.url = req.url.replace("/kcsapi/", "");
    const p = path.join(__dirname, "api", req.url);
    console.log(req.method, req.url);
    const fn = apiTable[req.url];
    if (fn) {
        console.log("  using API implementation");
        fn(res);
    } else if (fs.existsSync(p)) {
        console.log("  using API cache");
        fs.createReadStream(p).pipe(res);
    }
}

const server = http.createServer(handleClient);
server.listen(port);
