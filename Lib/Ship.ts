/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/xml2js/xml2js.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />

import fs = require("fs")
import xml2js = require("xml2js")
import _ = require("lodash")

import Server = require("./Server")

export const apiStart2 = require("../Data/api_start2");

type Dict = { [key: string]: string }

export const en2Jp: Dict = {};
export const jp2En: Dict = {};

xml2js.parseString(
    fs.readFileSync("./Lib/KanColleViewer-Translations/Ships.xml").toString(),
    (_: any, r: any) => {
        for (const s of r.Ships.Ship) {
            en2Jp[s["TR-Name"][0]] = s["JP-Name"][0];
            jp2En[s["JP-Name"][0]] = s["TR-Name"][0];
        }
    }
);

export const names = Object.keys(en2Jp);

export const mst_ships = apiStart2.api_data.api_mst_ship.map((s: any) => {
	return s.api_name;
});

export const mst_shipgraph_ships = apiStart2.api_data.api_mst_shipgraph.map((s: any) => {
	return { api_id: s.api_id, api_sortno: s.api_sortno, api_filename: s.api_filename, api_version: s.api_version };
});

export function mst_shipgraph_ship2Jp(s: any) {
	for (var s2 of apiStart2.api_data.api_mst_ship)
		if (s2.api_id === s.api_id)
            return s2.api_name;
    return null;
}

export const nameless_mst_shipgraph_ships: string[] = [];
for (const s of apiStart2.api_data.api_mst_shipgraph) {
    var name: string = null;
	for (var s2 of apiStart2.api_data.api_mst_ship)
		if (s2.api_id === s.api_id) {
			name = s2.api_name;
			break;
		}
	if (!name)
        nameless_mst_shipgraph_ships.push(name);
}

export function jp2Stat(name: string): any {
    for (const s of apiStart2.api_data.api_mst_ship)
        if (s.api_name === name)
            return s;
    return null;
}

export function en2Stat(name: string) {
    return jp2Stat(en2Jp[name]);
}

export function jp2Id(name: string): number {
    const s = jp2Stat(name);
    return s ? s.api_id : null;
}

export function id2Code(id: number): string {
    for (let s of apiStart2.api_data.api_mst_shipgraph)
        if (s.api_id === id)
            return s.api_filename;
    return null;
}

export function id2Stat(id: number): any {
    for (const s of apiStart2.api_data.api_mst_ship)
        if (s.api_id === id)
            return s;
    return null;
}

export function id2Stat2(id: number): any {
    for (const s of apiStart2.api_data.api_mst_shipgraph)
        if (s.api_id === id)
            return s;
    return null;
}

export function en2Stat2(name: string) {
    return id2Stat2(jp2Id(en2Jp[name]));
}

export function en2Code(name: string): string {
    return id2Code(jp2Id(en2Jp[name]));
}

export function mst_shipgraph2Swf(s: any): string {
    return `http://${Server.Yokosuka}/kcs/resources/swf/ships/${s.api_filename}.swf?VERSION=${s.api_version}`
}

export function en2Swf(name: string): string {
	const s = en2Stat2(name);
    return s ? mst_shipgraph2Swf(s) : null;
}

const types: { [name: string]: number } = require("../Data/ShipTypes.json");

export class Name {

	static exceptions: { [name: string]: { name: string, remodel: number } } = {
		"Ro-500": { name: "U-511", remodel: 1 },
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

	name: string;
	remodel: number;

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

	private exception(): string {
		for (let baseName of Object.keys(Name.exceptions)) {
			const ship = Name.exceptions[baseName];
			if (ship.name === this.name && ship.remodel === this.remodel)
				return baseName;
		}
		return null;
	}

	private toKai(): string {
		if (this.name === "Bismarck" || this.name === "Z1" || this.name === "Z3")
			return ["", "Kai", "Zwei", "Drei"][this.remodel];
			
		for (let [exc, s] of _.pairs(Name.exceptions))
			if (s.name === this.name && s.remodel === this.remodel)
				return exc;

		return ["", "Kai", "Kai2", "Kai2 A"][this.remodel];
	}

	// return KCV ship name (useSpace = true), or wikia ship name (useSpace = false)
	fullName(useSpace: boolean = true): string {
		const exc = this.exception();
		if (exc)
			return useSpace ? exc : exc.replace(/\ /g, "");
		else {
			const kai = this.toKai();
			if (useSpace)
				return kai !== "" ? this.name + " " + this.toKai() : this.name;
			else
				return kai !== "" ? this.name.replace(/\ /g, "") + this.toKai() : this.name.replace(/\ /g, "");
		}
	}

	typ(): number {
		return en2Stat(this.fullName()).api_stype;
	}

    isCarrier(): boolean {
        var carrierTypes: number[] = [types["CVL"], types["CV"], types["CVB"]];
        return _.contains(carrierTypes, this.typ());
	}

}

export function baseNames(): string[] {
	const res = <string[]>[];
	for (const name of names)
		if (new Name(name, null, null).remodel === 0)
			res.push(name);
	return res;
}

export class Line {

	static names: { [name: string]: number } = require("../Data/ShipVoice/QuoteNames.json");

	shipName: Name;
	line: string;

	constructor(shipName: Name, line: string) {
		if (line === "Air_Battle")
			line = "Night_Attack";
		this.shipName = shipName;
		this.line = line;
	}

	url(server: string = "Yokosuka"): string {
		return (server ? `http://${Server.ips.get(server)}` : "") + "/kcs/sound/kc" + en2Code(this.shipName.fullName()) + "/" + Line.names[this.line] + ".mp3";
	}

	wikia(): string {
		let line = this.line;
		if (this.shipName.isCarrier() && line === "Night_Attack")
			line = "Air_Battle";
		return this.shipName.fullName(false).replace("'", "") + "-" + line + ".ogg";
	}

}
