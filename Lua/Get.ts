import * as fs from "fs";
import * as cheerio from "cheerio";
import * as mkdirp from "mkdirp";
import * as HTTP from "../Lib/HTTP";

type Link = { data: string, url: string };

const list = process.argv[2] || "ship";

const lists: { [key: string]: string } = {
    "ship": "WikiaShipModules",
    "enemy": "WikiaEnemyModules",
    "equipment": "WikiaEquipmentModules",
    "enemy_equipment": "WikiaEnemyEquipmentModules",
};

const names = require(`./Data/${lists[list]}`);
const links: Link[] = [];

for (const name of names) {
    links.push({ data: name, url: `http://kancolle.wikia.com/wiki/Module:${name}` });
}

mkdirp.sync(`${__dirname}/Output/Lua`);

const fetcher = new HTTP.Fetcher(links, (link, body, next) => {
    const code = cheerio.load(body)(".source-lua").text().replace(/\u00A0/g, " ");
    fs.writeFile(`${__dirname}/Output/Lua/${link.data.replace(/\//g, "").replace("ä", "a")}.lua`, code, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Fetch:", link.data);
            next();
        }
    });
});

fetcher.fetchAll(() => { console.log("done"); });
