/// <reference path="../typings/node/node.d.ts" />

import * as http from "http";
const httpProxy = require("http-proxy");
import {loadConfig} from "./Config";

const {config, proxyLog} = loadConfig();

console.log("starting proxy on port", config.port);
console.log("  logging proxy:", config.log.proxy);
console.log("  logging API:", "unimplemented");
console.log("  saving api_start2:", "unimplemented");
console.log("  fixing DMM cookie:", config.fix_dmm_cookie);
console.log("  waiting when no network:", config.anti_cat.wait_for_network);
console.log("  using cache when no network:", "unimplemented");
console.log("  re-request API on network errors:", "unimplemented (unsafe)");
console.log("  caching assets:", "unimplemented");
console.log("  using modded assets:", "unimplemented");
console.log("  caching core SWF files:", "unimplemented");
console.log("  using local KC server:", "unimplemented");

function handleProxyError(err: NodeJS.ErrnoException, req: http.IncomingMessage, res: http.ServerResponse): void {
    const method = req.method,
          url = req.url;
    proxyLog.log("[ERROR]", method, url, err.errno, err.syscall);
    // TODO: use ENOENT?
    if (config.anti_cat.wait_for_network && err.syscall === "getaddrinfo") {
        proxyLog.log("  waiting for network...");
        // TOOD: don't leak?
        setTimeout(
            () => { handleClient(req, res); },
            config.anti_cat.wait_for_network * 1000
        );
    } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end();
    }
}

function rewriteProxiedRequest(proxyReq: http.ServerResponse, req: http.IncomingMessage): void {
    const host = req.headers.host,
          method = req.method,
          url = req.url;
    if (host.match(/.*dmm.com$/)) {
        proxyLog.log("[REWRITE] fixing DMM cookie", method, url);
        const newCookie = proxyReq.getHeader("cookie")
            .replace("ckcy=2", "ckcy=1")
            .replace("cklg=ja", "cklg=welcome");
        proxyReq.setHeader("cookie", newCookie);
    }
}

const proxy = httpProxy.createProxyServer({});
proxy.on("error", handleProxyError);
if (config.fix_dmm_cookie) {
    proxy.on("proxyReq", rewriteProxiedRequest);
}
/*
proxy.on("proxyRes", (proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) => {
});
 */

function handleClient(req: http.IncomingMessage, res: http.ServerResponse): void {
    const host = req.headers.host,
          url = req.url,
          method = req.method;
    proxyLog.log("[REQUEST]", method, url);
    proxy.web(req, res, { target: `http://${host}` });
}

const server = http.createServer(handleClient);
server.listen(config.port);
