/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/xml2js/xml2js.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />

import * as fs from "fs";
import * as xml2js from "xml2js";
import * as _ from "lodash";
import * as Server from "./Server";
export const apiStart2 = require("./Data/api_start2.json");
export const types = require("./Data/ShipTypes.json");

type Dict = { [key: string]: string }

export const en2Jp: Dict = {};
export const jp2En: Dict = {};

xml2js.parseString(
    fs.readFileSync(`${__dirname}/KanColleViewer-Translations/Ships.xml`).toString(),
    (_: any, r: any) => {
        for (const s of r.Ships.Ship) {
            en2Jp[s["TR-Name"][0]] = s["JP-Name"][0];
            jp2En[s["JP-Name"][0]] = s["TR-Name"][0];
        }
    }
);

export const names = Object.keys(en2Jp);

export const mstShips = apiStart2.api_data.api_mst_ship.map((s: any) => {
    return s.api_name;
});

export const mstShipgraphShips = apiStart2.api_data.api_mst_shipgraph.map((s: any) => {
    return { api_filename: s.api_filename, api_id: s.api_id, api_sortno: s.api_sortno, api_version: s.api_version };
});

export function mst_shipgraph_ship2Jp(s: any): string {
    for (const s2 of apiStart2.api_data.api_mst_ship) {
        if (s2.api_id === s.api_id) {
            return s2.api_name;
        }
    }
    return undefined;
}

export const namelessMstShipgraphShips: string[] = [];
for (const s of apiStart2.api_data.api_mst_shipgraph) {
    let name: string = undefined;
    for (const s2 of apiStart2.api_data.api_mst_ship) {
        if (s2.api_id === s.api_id) {
            name = s2.api_name;
            break;
        }
    }
    if (!name) {
        namelessMstShipgraphShips.push(name);
    }
}

export function jp2Stat(name: string): any {
    for (const s of apiStart2.api_data.api_mst_ship) {
        if (s.api_name === name) {
            return s;
        }
    }
    return undefined;
}

export function en2Stat(name: string): any {
    return jp2Stat(en2Jp[name]);
}

export function jp2Id(name: string): number {
    const s = jp2Stat(name);
    return s ? s.api_id : undefined;
}

export function id2Code(id: number): string {
    for (const s of apiStart2.api_data.api_mst_shipgraph) {
        if (s.api_id === id) {
            return s.api_filename;
        }
    }
    return undefined;
}

export function id2Stat(id: number): any {
    for (const s of apiStart2.api_data.api_mst_ship) {
        if (s.api_id === id) {
            return s;
        }
    }
    return undefined;
}

export function id2Stat2(id: number): any {
    for (const s of apiStart2.api_data.api_mst_shipgraph) {
        if (s.api_id === id) {
            return s;
        }
    }
    return undefined;
}

export function en2Stat2(name: string): any {
    return id2Stat2(jp2Id(en2Jp[name]));
}

export function en2Code(name: string): string {
    return id2Code(jp2Id(en2Jp[name]));
}

export function mst_shipgraph2Swf(s: any): string {
    return `http://${Server.yokosuka}/kcs/resources/swf/ships/${s.api_filename}.swf?VERSION=${s.api_version}`;
}

export function en2Swf(name: string): string {
    const s = en2Stat2(name);
    return s ? mst_shipgraph2Swf(s) : undefined;
}

export class Name {

    public static exceptions: { [name: string]: { name: string, remodel: number } } = {
        "Ro-500": { name: "U-511", remodel: 2 },
        "Ryuuhou": { name: "Taigei", remodel: 1 },
        "Ryuuhou Kai": { name: "Taigei", remodel: 2 },
        "Verniy": { name: "Hibiki", remodel: 2 },
        "Italia": { name: "Littorio", remodel: 1 },
        "Chitose A": { name: "Chitose", remodel: 2 },
        "Chitose CVL": { name: "Chitose", remodel: 3 },
        "Chitose CVL Kai": { name: "Chitose", remodel: 4 },
        "Chitose CVL Kai2": { name: "Chitose", remodel: 5 },
        "Chiyoda A": { name: "Chiyoda", remodel: 2 },
        "Chiyoda CVL": { name: "Chiyoda", remodel: 3 },
        "Chiyoda CVL Kai": { name: "Chiyoda", remodel: 4 },
        "Chiyoda CVL Kai2": { name: "Chiyoda", remodel: 5 },
    };

    public name: string;
    public remodel: number;

    constructor(fullName: string, name: string = undefined, remodel: number = undefined) {
        if (name) {
            this.name = name;
            this.remodel = remodel;
            return;
        }
        const exc = Name.exceptions[fullName];
        if (exc) {
            this.name = exc.name;
            this.remodel = exc.remodel;
            return;
        }
        let t = fullName.match(/(.*) Kai2 A/);
        if (t) {
            this.name = t[1];
            this.remodel = 3;
            return;
        }
        t = fullName.match(/(.*) Kai2/);
        if (t) {
            this.name = t[1];
            this.remodel = 2;
            return;
        }
        t = fullName.match(/(.*) Kai/);
        if (t) {
            this.name = t[1];
            this.remodel = 1;
            return;
        }
        t = fullName.match(/(.*) Drei/);
        if (t) {
            this.name = t[1];
            this.remodel = 3;
            return;
        }
        t = fullName.match(/(.*) Zwei/);
        if (t) {
            this.name = t[1];
            this.remodel = 2;
            return;
        }
        this.name = fullName;
        this.remodel = 0;
    }

    public fullName(useSpace: boolean = true): string {
        const exc = this.exception();
        if (exc) {
            return useSpace ? exc : exc.replace(/\ /g, "");
        } else {
            const kai = this.toKai();
            if (useSpace) {
                return kai !== "" ? this.name + " " + this.toKai() : this.name;
            } else {
                return kai !== "" ? this.name.replace(/\ /g, "_") + this.toKai().replace(/\ /g, "") : this.name.replace(/\ /g, "_");
            }
        }
    }

    public typ(): number {
        return en2Stat(this.fullName()).api_stype;
    }

    public isCarrier(): boolean {
        const carrierTypes: number[] = [types.CVL, types.CV, types.CVB];
        return _.contains(carrierTypes, this.typ());
    }

    public exception(): string {
        for (const baseName of Object.keys(Name.exceptions)) {
            const ship = Name.exceptions[baseName];
            if (ship.name === this.name && ship.remodel === this.remodel) {
                return baseName;
            }
        }
        return undefined;
    }

    public toKai(): string {
        if (this.name === "Bismarck" || this.name === "Z1" || this.name === "Z3") {
            return ["", "Kai", "Zwei", "Drei"][this.remodel];
        }
        for (const [exc, s] of _.pairs(Name.exceptions)) {
            if (s.name === this.name && s.remodel === this.remodel) {
                return exc;
            }
        }
        return ["", "Kai", "Kai2", "Kai2 A"][this.remodel];
    }

}

export function baseNames(): string[] {
    const res = <string[]>[];
    for (const name of names) {
        if (new Name(name, undefined, undefined).remodel === 0) {
            res.push(name);
        }
    }
    return res;
}

export class Line {

    public static names: { [name: string]: number } = require("./Data/ShipLines.json");

    public shipName: Name;
    public line: string;

    constructor(shipName: Name, line: string) {
        if (line === "Air_Battle") {
            line = "Night_Attack";
        }
        this.shipName = shipName;
        this.line = line;
    }

    public url(server: string = "Yokosuka"): string {
        return (server ? `http://${Server.ips[server]}` : "") + "/kcs/sound/kc" + en2Code(this.shipName.fullName()) + "/" + Line.names[this.line] + ".mp3";
    }

    public wikia(): string {
        let line = this.line;
        if (this.shipName.isCarrier() && line === "Night_Attack") {
            line = "Air_Battle";
        }
        return this.shipName.fullName(false).replace("'", "") + "-" + line + ".ogg";
    }

}
