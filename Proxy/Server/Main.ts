/// <reference path="../../typings/node/node.d.ts" />

import * as path from "path";
import * as fs from "fs";
import * as http from "http";

const port = parseInt(process.argv[2]);

function handleClient(req: http.IncomingMessage, res: http.ServerResponse): void {
    req.url = req.url.replace("/kcsapi/", "");
    const p = path.join(__dirname, "api", req.url);
    console.log(req.method, req.url);
    if (fs.existsSync(p)) {
        fs.createReadStream(p).pipe(res);
    }
}

const server = http.createServer(handleClient);
server.listen(port);
