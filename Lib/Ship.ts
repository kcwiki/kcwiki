/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/xml2js/xml2js.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />

import fs = require("fs")
import xml2js = require("xml2js")
import _ = require("lodash")

import Server = require("./Server")

const apiStart2 = require("../Data/api_start2");

type Dict = { [key: string]: string }

const en2Jp: Dict = {};
const jp2En: Dict = {};

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

export function en2Swf(name: string): string {
    return `http://${Server.ips.get("Yokosuka")}/kcs/resources/swf/ships/${en2Code(name)}.swf?VERSION=${en2Stat2(name).api_version}`;
}
