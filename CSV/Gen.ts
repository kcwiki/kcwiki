import * as fs from "fs";
import * as _ from "lodash";
import * as Ship from "../Lib/Ship";
const enemyData = require("../Lua/Output/enemy.json");

class Log {

    private file: fs.WriteStream;

    constructor(file: string) {
        this.file = fs.createWriteStream(file, { flags: "w" });
    }

    public write(s: string): void {
        this.file.write(s.toString() + "\n");
    }

};

export function writeShipsCsv(): void {
    const log = new Log(`${__dirname}/Ships.csv`);
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
    "api_leng": "range",
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
    "api_afterbull": "remodel_ammo",
};

export function writeShipStatsCsv(): void {
    const log = new Log(`${__dirname}/ShipStats.csv`);
    let h = "name";
    for (const [, stat] of _.pairs(api2Stats)) {
        if (typeof stat === "object") {
            for (const subStat of stat) {
                h += `,${subStat}`;
            }
        } else {
            h += `,${stat}`;
        }
    }
    log.write(h);
    for (const name of Ship.names) {
        const s = Ship.en2Stat(name);
        let l = name;
        for (const [apiStat, stat] of _.pairs(api2Stats)) {
            if (typeof stat === "object") {
                for (let i = 0; i < stat.length; ++i) {
                    l += `,${s[apiStat][i]}`;
                }
            } else {
                l += `,${s[apiStat]}`;
            }
        }
        log.write(l);
    }
}

export function writeBaseShipsCsv(): void {
    const log = new Log(`${__dirname}/BaseShipNames.csv`);
    log.write("name,api_name,api_yomi");
    for (const name of Ship.baseNames()) {
        log.write(`${name},${Ship.en2Jp[name]},${Ship.en2Stat(name).api_yomi}`);
    }
}

export function writeShipVoiceLinesCsv(): void {
    const log = new Log(`${__dirname}/ShipVoiceLines.csv`);
    log.write("ship,line,url");
    for (const name of Ship.names) {
        for (const lineName in Ship.Line.names) {
            const line = new Ship.Line(new Ship.Name(name), lineName);
            log.write(`${name},${lineName},${line.url()}`);
        }
    }
}

function findEnemy(id: number): any {
    for (const [, forms] of _.pairs(enemyData)) {
        for (const [form, obj] of _.pairs(forms)) {
            if (obj._api_id === id) {
                obj.form = form;
                return obj;
            }
        }
    }
    return undefined;
}

export function writeEnemy(): void {
    const log = new Log(`${__dirname}/Enemy.csv`);
    log.write("name,api_name,api_yomi,api_id,api_stype,api_soku,api_slot_num,api_filename,api_version,swf");
    for (const s of Ship.apiStart2.api_data.api_mst_ship) {
        if (!Ship.jp2En[s.api_name]) {
            for (const s2 of Ship.apiStart2.api_data.api_mst_shipgraph) {
                if (s2.api_id === s.api_id) {
                    const enemy = findEnemy(parseInt(s.api_id));
                    if (!enemy) {
                        console.log(s);
                    }
                    const name = enemy._name + (enemy._display_suffix ? ` ${enemy._display_suffix}` : "")
                        + (enemy._name !== enemy.form && enemy.form !== "" && !enemy._display_suffix ? ` ${enemy.form}` : "");
                    log.write(`${name},${s.api_name},${s.api_yomi},${s.api_id},${s.api_stype},${s.api_soku},${s.api_slot_num},${s2.api_filename},${s2.api_version},${Ship.mst_shipgraph2Swf(s2)}`);
                }
            }
        }
    }
}

writeShipsCsv();
writeBaseShipsCsv();
writeShipStatsCsv();
writeShipVoiceLinesCsv();
writeEnemy();
