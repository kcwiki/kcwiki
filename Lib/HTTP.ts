import * as http from "http";
import * as url from "url";
import * as request from "request";
import * as async from "async";
import * as _ from "lodash";

export type Request = { method?: string, url: string, data: any };
export type Next = (_error?: any) => void;
export type ProcessRequest = (_link: Request, _body: any, _next: any, _response?: http.IncomingMessage) => void;

export class Fetcher {

    constructor(requests: Request[], processRequest: ProcessRequest, ignoreErrors: boolean = false) {
        this.requests = requests;
        this.errors = [];
        this.processRequest = processRequest;
        this.ignoreErrors = ignoreErrors;
    }

    private requests: Request[];
    private errors: Request[];
    private processRequest: ProcessRequest;
    private ignoreErrors: boolean;

    public fetchAll: Function = (next: any): void => {
        async.each(this.requests, this.fetch, () => {
            if (this.errors.length > 0) {
                this.requests = [];
                for (const e of this.errors) {
                    this.requests.push(e);
                }
                this.errors = [];
                this.fetchAll(next);
            } else {
                next();
            }
        });
    };

    private fetch = (r: Request, next: Next): void => {
        if (!r.url) {
            next();
            return;
        }
        if (r.method) {
            const u = url.parse(r.url);
            const options = { hostname: u.hostname, method: r.method, path: u.path, port: parseInt(u.port) };
            const req = http.request(options, (res) => { this.processRequest(r, res, next, res); });
            req.on("error", (err: any) => {
                if (!this.ignoreErrors) {
                    console.log("HTTP/Fetcher:", r.url, err);
                    this.errors.push(r);
                }
                next();
            });
            req.end();
        } else {
            request(r.url, (err: any, res: http.IncomingMessage, body: any) => {
                if (!this.ignoreErrors) {
                    if (!err && res.statusCode === 200) {
                        this.processRequest(r, body, next, res);
                    } else {
                        console.log("HTTP/Fetcher:", r.url, err);
                        this.errors.push(r);
                        next();
                    }
                } else {
                    this.processRequest(r, body, next, res);
                }
            });
        }
    };

}

export class GroupFetcher {

    public ignoreErrors: boolean;

    private errors: number;
    private groups: Request[][];
    private processRequest: ProcessRequest;

    constructor(requests: Request[], nPar: number, processRequest: ProcessRequest) {
        this.errors = 0;
        this.groups = _.chunk(requests, nPar);
        this.processRequest = processRequest;
        this.ignoreErrors = false;
    }

    public fetch(next: Next): void {
        async.eachSeries(this.groups, this.fetchGroup, (err: any) => {
            if (err) {
                ++this.errors;
                console.log("HTTP/GroupFetcher:", err);
            }
            next(this.errors);
        });
    }

    private fetchGroup = (group: Request[], next: Next): void => {
        new Fetcher(group, this.processRequest, this.ignoreErrors).fetchAll(next);
    };

}

function formatDate(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate() }/${date.getFullYear() }`;
}

export function sortObject(o: any): any {
    if (typeof o !== "object") {
        return o;
    }
    let x: any = {};
    for (const k of Object.keys(o).sort()) {
        x[k] = o[k];
    }
    return x;
}

export function sortSubObjects(o: any): void {
    for (const [k, v] of _.pairs(o)) {
        o[k] = sortObject(v);
    }
}

export function sortSubArrays(o: any): void {
    for (const [k, v] of _.pairs(o)) {
        o[k] = v.sort();
    }
}

export class UpdateChecker {

    private requests: Request[];
    private fetcher: GroupFetcher;

    private counter: number = 0;
    private hash: { [date: string]: { [key: string]: { [key: string]: any } } } = {};
    private responses: { [ship: string]: { [line: string]: { modified: string, size: string } } } = {};

    constructor(requests: Request[], nPar: number) {
        this.requests = requests;
        this.fetcher = new GroupFetcher(requests, nPar, (r: Request, res: any, next: any) => {
            if (res.statusCode === 200) {
                const time = formatDate(new Date(res.headers["last-modified"]));
                if (!this.hash[time]) {
                    this.hash[time] = {};
                }
                const data = r.data;
                if (typeof(data) === "string") {
                    this.hash[time][data] = {
                        link: r.url,
                        size: parseInt(res.headers["content-length"]),
                    };
                    if (!this.responses[data]) {
                        this.responses[data] = {};
                    }
                    this.responses[data] = {
                        modified: res.headers["last-modified"],
                        size: res.headers["content-length"],
                    };
                    ++this.counter;
                    const p = Math.round(100.0 * this.counter / requests.length);
                    console.log(`${this.counter} ${data} done, ${p}% overall`);
                } else {
                    const ship = r.data[0];
                    const line = r.data[1];
                    if (!this.hash[time][ship]) {
                        this.hash[time][ship] = {};
                    }
                    this.hash[time][ship][line] = {
                        line: line,
                        link: r.url,
                        size: parseInt(res.headers["content-length"]),
                    };
                    if (!this.responses[ship]) {
                        this.responses[ship] = {};
                    }
                    this.responses[ship][line] = {
                        modified: res.headers["last-modified"],
                        size: res.headers["content-length"],
                    };
                    ++this.counter;
                    const p = Math.round(100.0 * this.counter / requests.length);
                    console.log(`${this.counter} ${data[0]}/${data[1]} done, ${p}% overall`);
                }
            } else {
                ++this.counter;
                const p = Math.round(100.0 * this.counter / requests.length);
                console.log(`${this.counter} ${r.data} status: ${res.statusCode}, ${p}% overall`);
            }
            next();
        });
    }

    public check(done: any): void {
        this.fetcher.fetch((errors: number) => {

            console.log(`group fetch done with ${errors} errors`);

            // convert to a list of objects
            const times = <[{date: string, ships: {[key: string]: any} }]>[];
            for (const [t, o] of _.pairs(this.hash)) {
                times.push({ date: t, ships: o });
            }

            // sort by date
            times.sort((a: any, b: any) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            // sort alphabetically
            // todo: might move UpdateChecker to a module and sort by ship/line ids using Ship 
            for (const t of times) {
                t.ships = sortObject(t.ships);
                sortSubObjects(t.ships);
            }
            this.responses = sortObject(this.responses);
            sortSubObjects(this.responses);

            done(times, this.responses);

        });
    }

}
