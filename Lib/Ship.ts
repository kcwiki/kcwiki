import * as _ from "lodash";
import * as Server from "./Server";
export const apiStart2 = require("./Data/api_start2.json");
export const types = require("./Data/ShipTypes.json");
export const jp2En: Dict = require("./Data/Ships.json");
export const jp2EnEnemy: Dict = require("./Data/Enemy.json");

type Dict = { [key: string]: string };

export const en2Jp: Dict = {};
for (const en in jp2En) {
    en2Jp[jp2En[en]] = en;
}

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
        "Верный": { name: "Hibiki", remodel: 2 },
        "Italia": { name: "Littorio", remodel: 1 },
        "Chitose A": { name: "Chitose", remodel: 2 },
        "Chitose Carrier": { name: "Chitose", remodel: 3 },
        "Chitose Carrier Kai": { name: "Chitose", remodel: 4 },
        "Chitose Carrier Kai Ni": { name: "Chitose", remodel: 5 },
        "Chiyoda A": { name: "Chiyoda", remodel: 2 },
        "Chiyoda Carrier": { name: "Chiyoda", remodel: 3 },
        "Chiyoda Carrier Kai": { name: "Chiyoda", remodel: 4 },
        "Chiyoda Carrier Kai Ni": { name: "Chiyoda", remodel: 5 },
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
        let t = fullName.match(/(.*) Kai Ni A/);
        if (t) {
            this.name = t[1];
            this.remodel = 3;
            return;
        }
        t = fullName.match(/(.*) Kai Ni B/);
        if (t) {
            this.name = t[1];
            this.remodel = 3;
            return;
        }
        t = fullName.match(/(.*) Kai Ni D/);
        if (t) {
            this.name = t[1];
            this.remodel = 3;
            return;
        }
        t = fullName.match(/(.*) Kai Ni/);
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
        t = fullName.match(/(.*) drei/);
        if (t) {
            this.name = t[1];
            this.remodel = 3;
            return;
        }
        t = fullName.match(/(.*) zwei/);
        if (t) {
            this.name = t[1];
            this.remodel = 2;
            return;
        }
        this.name = fullName;
        this.remodel = 0;
    }

    public fullName(useSpace: boolean = true, useNi: boolean = true): string {
        const exc = this.exception();
        if (exc) {
            return useSpace ? exc : exc.replace(/\ /g, "");
        } else {
            const kai = this.toKai(useNi);
            if (useSpace) {
                return kai !== "" ? this.name + " " + this.toKai(useNi) : this.name;
            } else {
                return kai !== "" ? this.name.replace(/\ /g, "_") + this.toKai(useNi).replace(/\ /g, "") : this.name.replace(/\ /g, "_");
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

    public toKai(useNi: boolean = true): string {
        if (this.name === "Bismarck" || this.name === "Z1" || this.name === "Z3") {
            return ["", "Kai", "zwei", "drei"][this.remodel];
        }
        if (this.name === "Kasumi" && this.remodel === 3) {
            return useNi ? "Kai Ni B" : "Kai2 B";
        }
        if (this.name === "Asashio" && this.remodel === 3) {
            return useNi ? "Kai Ni D" : "Kai2 D";
        }
        for (const [exc, s] of _.pairs(Name.exceptions)) {
            if (s.name === this.name && s.remodel === this.remodel) {
                return useNi ? exc : exc.replace("Kai Ni", "Kai2");
            }
        }
        return ["", "Kai", useNi ? "Kai Ni" : "Kai2", useNi ? "Kai Ni A" : "Kai2 A"][this.remodel];
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

    private static crKeys: number[] = [
        604825, 607300, 613847, 615318, 624009, 631856, 635451, 637218, 640529, 643036,
        652687, 658008, 662481, 669598, 675545, 685034, 687703, 696444, 702593, 703894,
        711191, 714166, 720579, 728970, 738675, 740918, 743009, 747240, 750347, 759846,
        764051, 770064, 773457, 779858, 786843, 790526, 799973, 803260, 808441, 816028,
        825381, 827516, 832463, 837868, 843091, 852548, 858315, 867580, 875771, 879698,
        882759, 885564, 888837, 896168,
    ];

    public shipName: Name;
    public line: string;



    private static getFileName(shipApiId: number, voiceLineId: number): number {
        return 100000 + 17 * (shipApiId + 7) * (Line.crKeys[voiceLineId] - Line.crKeys[voiceLineId - 1]) % 99173;
    }

    constructor(shipName: Name, line: string) {
        if (line === "Air_Battle") {
            line = "Night_Attack";
        }
        this.shipName = shipName;
        this.line = line;
    }

    public url(server: string = "Yokosuka"): string {
        const stat2 = en2Stat2(this.shipName.fullName());
        const filename = Line.getFileName(stat2.api_id, Line.names[this.line]);
        return (server ? `http://${Server.ips[server]}` : "") + "/kcs/sound/kc" + en2Code(this.shipName.fullName()) + "/" + filename + ".mp3?VERSION=" + stat2.api_version;
    }

    public wikia(): string {
        let line = this.line;
        if (this.shipName.isCarrier() && line === "Night_Attack") {
            line = "Air_Battle";
        }
        return this.shipName.fullName(false).replace("'", "") + "-" + line + ".ogg";
    }

}
