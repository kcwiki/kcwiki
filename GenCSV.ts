
import fs = require("fs");
import _ = require("lodash");
import Ship = require("./Lib/Ship");

class Log {

    file: fs.WriteStream;

    constructor(file: string) {
        this.file = fs.createWriteStream(file, { flags: "w" });
    }

    write(s: string): void {
        this.file.write(s.toString() + "\n");
    }

};

export function writeShipsCsv(): void {
    const log = new Log("Data/Ships.csv");
    log.write("name,api_name,api_id,api_sortno,api_filename,api_version,swf");
    for (const name of Ship.names) {
        const s = Ship.en2Stat(name), s2 = Ship.en2Stat2(name);
        log.write(`${name},${Ship.en2Jp[name]},${s.api_id},${s.api_sortno},${s2.api_filename},${s2.api_version},${Ship.en2Swf(name)}`);
    }
}

const api2Stats = {
    "api_stype": "type",
    "api_backs": "rarity",
    "api_afterlv": "remodel_level",
    "api_soku": "speed",
    // api_leng?
    "api_slot_num": "slots",
    "api_maxeq": ["slot_size_1", "slot_size_2", "slot_size_3", "slot_size_4"],
    "api_buildtime": "build_time",
    "api_broken": ["scrap_fuel", "scrap_ammo", "scrap_steel", "scrap_baux"],
    "api_powup": ["firepower_mod", "torpedo_mod", "aa_mod", "armor_mod"],
    
    "api_taik": ["hp", "hp_max"],
    "api_souk": ["armor", "armor_max"],
    "api_houg": ["firepower", "firepower_max"],
    "api_raig": ["torpedo", "torpedo_max"],
    "api_tyku": ["aa", "aa_max"],
    "api_luck": ["luck", "luck_max"],
    
    "api_fuel_max": "fuel",
    "api_bull_max": "ammo",
    
    "api_afterfuel": "remodel_steel",
    "api_afterbull": "remodel_ammo"
}

export function writeShipstatsCsv(): void {
    const log = new Log("Data/ShipStats.csv");
    var h = "name"
    for (const [, stat] of _.pairs(api2Stats))
        if (typeof stat === "object")
            for (const sub_stat of stat)
                h += `,${sub_stat}`;
        else
            h += `,${stat}`;
    log.write(h);
    for (const name of Ship.names) {
        const s = Ship.en2Stat(name);
        var l = name;
        for (const [api_stat, stat] of _.pairs(api2Stats))
            if (typeof stat === "object")
                for (var i = 0; i < stat.length; ++i)
                    l += `,${s[api_stat][i]}`;
            else
                l += `,${s[api_stat]}`;      
        log.write(l);
    }
}

export function writeBaseShipsCsv(): void {
    const log = new Log("Data/BaseShipNames.csv");
    log.write("name,api_name,api_yomi");
    for (const name of Ship.baseNames())
        log.write(`${name},${Ship.en2Jp[name]},${Ship.en2Stat(name).api_yomi}`);
}

const enemy = require("./Data/enemy.json");

function findEnemy(id: number) {
    for (const [name, forms] of _.pairs(enemy)) {
        for (const [form, obj] of _.pairs(forms)) {
            if (obj._api_id === id) {
                obj.form = form;
                return obj;
            }
        }
    }
    return null;
}

export function writeEnemy(): void {
    const log = new Log("Data/Enemy.csv");
    log.write("name,api_name,api_yomi,api_id,api_stype,api_soku,api_slot_num,api_filename,api_version,swf");
    for (const s of Ship.apiStart2.api_data.api_mst_ship)
        if (!Ship.jp2En[s.api_name])
            for (const s2 of Ship.apiStart2.api_data.api_mst_shipgraph)
                if (s2.api_id === s.api_id) {
                    const enemy = findEnemy(parseInt(s.api_id));
                    const name = enemy._name + (enemy._display_suffix ? ` ${enemy._display_suffix}` : "")
                        + (enemy._name !== enemy.form && enemy.form !== "" && !enemy._display_suffix ? ` ${enemy.form}` : "");
                    log.write(`${name},${s.api_name},${s.api_yomi},${s.api_id},${s.api_stype},${s.api_soku},${s.api_slot_num},${s2.api_filename},${s2.api_version},${Ship.mst_shipgraph2Swf(s2)}`);
                }
}

writeShipsCsv();
writeBaseShipsCsv();
writeShipstatsCsv();
writeEnemy();

/* TODO
 * Fetch Lua modules and perform check vs API
 * Use a translation file instead of enemy.json
 */

/*
/// <reference path="typings/cheerio/cheerio.d.ts" />

const wikiaEnemy = require("./Data/WikiaEnemy.json");

import cheerio = require("cheerio");
import HTTP = require("./Lib/HTTP");
var url = require("url");
var path = require("path");

type Link = { name: string, link: string }

let links = <Link[]>[];

for (const link of wikiaEnemy)
    links.push({ name: path.basename(url.parse(link).pathname).replace("Module:", "").replace(/_/g, " "), link: link });

const fetcher = new HTTP.Fetcher(links, (link: { name: string, link: string }, body: string, next: HTTP.Next) => {
    console.log("Fetch:", link.link, link.name, url.parse(link.link).basename);
    const code = cheerio.load(body)(".source-lua").text().replace(/\u00A0/g, " ");
    fs.writeFile(`Data/Enemy/${link.name}.lua`, code, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Fetch:", link.name);
            next();
        }
    });
});

fetcher.fetchAll();
*/

/*
/// <reference path="typings/cheerio/cheerio.d.ts" />

import cheerio = require("cheerio");
import HTTP = require("./Lib/HTTP");
var url = require("url");
var path = require("path");

var shipMs = require("./Data/WikiaShipModules.json")

type Link = { name: string, link: string }

let links = <Link[]>[];

for (const name of shipMs)
    links.push({ name: name, link: `http://kancolle.wikia.com/wiki/Module:${name.replace("'", "")}` });

const fetcher = new HTTP.Fetcher(links, (link: { name: string, link: string }, body: string, next: HTTP.Next) => {
    console.log("Fetch:", link.link, link.name);
    const code = cheerio.load(body)(".source-lua").text().replace(/\u00A0/g, " ");
    fs.writeFile(`Data/Ships/${link.name}.lua`, code, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Fetch:", link.name);
            next();
        }
    });
});

fetcher.fetchAll();
*/
