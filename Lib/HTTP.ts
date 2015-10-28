/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/request/request.d.ts" />
/// <reference path="../typings/async/async.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />

import http = require("http");
import request = require("request");
import async = require("async");
import _ = require("lodash");

export type Request = { method: string, server: string, port: number, path: string, data: any };
export type Next = (error?: any) => void;
export type ProcessRequest = (link: Request, response: any, next: any) => void;

export class Fetcher {

    requests: Request[];
    errors: Request[];
    processRequest: ProcessRequest;

    constructor(requests: Request[], processRequest: ProcessRequest) {
        this.requests = requests;
        this.errors = [];
        this.processRequest = processRequest;
    }

    fetch = (r: Request, next: Next) => {
        if (r.method) {
            const options = { method: r.method, hostname: r.server, port: r.port, path: r.path }
            const req = http.request(options, (res) => { this.processRequest(r, res, next); });
            req.on("error", (err: any) => {
                console.log("HTTP/Fetcher:", r.path, err);
                this.errors.push(r);
                next(err);
            });
            req.end();
        } else {
            request(r.path, (err, response, body) => {
                if (!err && response.statusCode === 200) {
                    this.processRequest(r, body, next);
                } else {
                    console.log("HTTP/Fetcher:", r.path, err);
                    this.errors.push(r);
                    next(err);
                }
            });
        }
    }

    fetchAll = (next: any) => {
        async.each(this.requests, this.fetch, (err) => {
            if (err) {
                console.log("HTTP/Fetcher:", err);
                next(err);
            } else if (this.errors.length > 0) {
                this.requests = <Request[]>[];
                for (const e of this.errors) this.requests.push(e);
                this.errors = <Request[]>[];
                this.fetchAll(next);
            } else {
                next();
            }
        });
    }

}

export class GroupFetcher {

    groups: Request[][];
    processRequest: ProcessRequest;

    constructor(requests: Request[], nPar: number, processRequest: ProcessRequest) {
        this.groups = _.chunk(requests, nPar);
        this.processRequest = processRequest;
    }

    fetchGroup = (group: Request[], next: Next) => {
        new Fetcher(group, this.processRequest).fetchAll(next);
    }

    fetch = (next: Next) => {
        async.eachSeries(this.groups, this.fetchGroup, (err) => {
            if (err) {
                console.log("HTTP/GroupFetcher:", err);
                next(err);
            } else
                next();
        });
    }
    
}

function formatDate(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate() }/${date.getFullYear() }`;
}

export class UpdateChecker {

    requests: Request[]
    fetcher: GroupFetcher;

    counter = 0;
    hash: { [key: string]: any } = {};

    constructor(requests: Request[], nPar: number) {
        this.requests = requests;
        this.fetcher = new GroupFetcher(requests, nPar, (r: Request, res: any, next: any) => {
            if (res.statusCode == 200) {
                const data = r.data
                const date = formatDate(new Date(res.headers['last-modified']));
                if (!this.hash[date]) this.hash[date] = {};
                this.hash[date][data] = {
                    link: r.path,
                    size: parseInt(res.headers['content-length'])
                };
                ++this.counter;
                const p = Math.round(100.0 * this.counter / requests.length)
                console.log(`${this.counter} ${data} done, ${p}% overall`);
            }
            next()
        });
    }

    check(done: any) {
        this.fetcher.fetch(() => {
            console.log("done");
            const times: any = [];
            for (let [t, o] of _.pairs(this.hash)) times.push({ date: t, ships: o });
            times.sort((a: any, b: any) => { return new Date(b.date).getTime() - new Date(a.date).getTime() });
            for (const t of times) {
                var x: any = {};
                for (const k of Object.keys(t.ships).sort()) x[k] = t.ships[k];
                t.ships = x;
            }
            done(times)
        });
    }

}
