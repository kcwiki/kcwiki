/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/mkdirp/mkdirp.d.ts" />

import * as path from "path";
import * as fs from "fs";
import * as zlib from "zlib";
import * as http from "http";
import * as mkdirp from "mkdirp";
const httpProxy = require("http-proxy");

import {loadConfig} from "./Config";
import * as Storage from "./Storage";
import * as Game from "./Game";

const {config, proxyLog} = loadConfig();

console.log("starting proxy on port", config.port);
console.log("  logging proxy:", config.log.proxy);
if (config.log.proxy) {
    console.log("    mode:", config.log.mode);
}
console.log("  logging API:", config.log.api);
console.log("  saving api_start2:", config.log.api_start2);
if (config.log.api_start2) {
    console.log("    exit on completion:", config.log.exit);
}
console.log("  fixing DMM cookie:", config.fix_dmm_cookie);
console.log("  waiting when no network:", config.anti_cat.wait_for_network);
console.log("  using cache when no network:", config.anti_cat.use_cache);
console.log("  re-request API on network errors:", "unimplemented (unsafe)");
console.log("  caching assets:", config.cache);
console.log("  caching core SWF files:", config.cache);
console.log("  using cached assets (always when in offline mode):", config.use_cache);
console.log("  using modded assets:", config.mods);
console.log("  using local KC server:", config.use_kc_server);

function handleProxyError(err: NodeJS.ErrnoException, req: http.IncomingMessage, res: http.ServerResponse): void {
    const method = req.method,
          url = req.url;
    proxyLog.log("[ERROR]", method, url, err.errno, err.syscall);
    const assetPath = Game.isAsset(url);
    if (config.anti_cat.use_cache && assetPath && pipeAsset(assetPath, res)) {
        ;
    } else if (config.anti_cat.wait_for_network && err.syscall === "getaddrinfo") {
        // todo: use ENOENT?
        proxyLog.log("  waiting for network...");
        // todo: don't leak?
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
    const host = req.headers.host;
    // restoring original headers
    const headers = req.rawHeaders;
    for (let i = 0; i < headers.length; i += 2) {
        proxyReq.setHeader(headers[i], headers[i + 1]);
    }
    if (config.fix_dmm_cookie && Game.isDMM(host)) {
        proxyLog.log("  [REWRITE] fixing DMM cookie:", host);
        const oldCookie = proxyReq.getHeader("Cookie");
        if (oldCookie) {
            const newCookie = oldCookie.replace("ckcy=2", "ckcy=1").replace("cklg=ja", "cklg=welcome");
            proxyReq.setHeader("Cookie", newCookie);
        }
    }
}

const cache = config.cache ? new Storage.Object(path.join(__dirname, config.cache, "cache.json")) : undefined;

function onTargetResponse(proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url;
    if (config.log.api_start2 && Game.isAPIStart(url)) {
        const filePath = <string>config.log.api_start2;
        proxyLog.log("  [LOGGING] api_start2");
        if (proxyRes.headers["content-encoding"] === "gzip") {
            const file = fs.createWriteStream(filePath);
            proxyRes.pipe(zlib.createGunzip()).pipe(file);
            file.on("finish", () => {
                if (config.log.exit) {
                    process.exit();
                }
            });
        }
        return;
    }
    const apiPath = Game.isAPI(url);
    if (config.log.api && apiPath) {
        const apiDir = path.join(__dirname, <string>config.log.api, apiPath);
        const filePath = new Date().toISOString().replace("T", "_").replace(/:/g, "-").replace("Z", "").replace(".", "_");
        const fullPath = path.join(apiDir, filePath);
        proxyLog.log("  [LOGGING]", apiPath);
        // todo: create directory structure beforehand
        mkdirp.sync(apiDir);
        const encoding = proxyRes.headers["content-encoding"];
        if (encoding === "gzip") {
            proxyRes.pipe(zlib.createGunzip()).pipe(fs.createWriteStream(fullPath));
        } else if (!encoding) {
            proxyRes.pipe(fs.createWriteStream(fullPath));
        } else {
            proxyLog.log("  [LOGGER] unhandled encoding:", encoding);
        }
        return;
    }
    const assetPath = Game.isAsset(url);
    if (config.cache && assetPath) {
        const remoteModified = proxyRes.headers["last-modified"];
        const localModified = cache.get2(assetPath, "last-modified");
        const assetDir = path.join(__dirname, config.cache, path.dirname(assetPath));
        const fullPath = path.join(__dirname, config.cache, assetPath);
        proxyLog.log("  [CACHING]", assetPath);
        cache.set2(assetPath, "last-modified", remoteModified);
        // todo: create directory structure beforehand
        mkdirp.sync(assetDir);
        proxyRes.pipe(fs.createWriteStream(fullPath));
    }
}

const proxy = httpProxy.createProxyServer({});
proxy.on("error", handleProxyError);
proxy.on("proxyReq", rewriteProxiedRequest);
proxy.on("proxyRes", onTargetResponse);

function pipeAsset(assetPath: string, res: http.ServerResponse, mod?: boolean): boolean {
    const fullPath = path.join(__dirname, mod ? config.mods : config.cache, assetPath);
    // todo: create index beforehand
    if (fs.existsSync(fullPath)) {
        proxyLog.log(mod ? "  [MODDED]" : "  [CACHED]", assetPath);
        fs.createReadStream(fullPath).pipe(res);
        return true;
    } else {
        return false;
    }
}

function handleClient(req: http.IncomingMessage, res: http.ServerResponse): void {
    const host = req.headers.host,
          url = req.url,
          method = req.method;
    proxyLog.log("[REQUEST]", method, url);
    const assetPath = Game.isAsset(url);
    // todo: remote proxy?
    if (host.match(/^127\.0\.0\.1(:\d+)?$/) || host.match(/^localhost(:\d+)?$/)) {
        // todo: redirect to mainD2.swf when use_kc_server
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("proxy mode");
    } else if (config.mods && assetPath && pipeAsset(assetPath, res, true)) {
        ;
    } else if (config.cache && assetPath && pipeAsset(assetPath, res)) {
        ;
    } else if (config.use_kc_server) {
        if (assetPath && !pipeAsset(assetPath, res)) {
            // todo: re-cache from Yokosuka
            res.writeHead(500);
            res.end();
        } else if (Game.isAPI(url)) {
            proxy.web(req, res, { target: `http://${config.use_kc_server}` });
        }
    } else {
        proxy.web(req, res, { target: `http://${host}` });
    }
}

const server = http.createServer(handleClient);
server.listen(config.port);
