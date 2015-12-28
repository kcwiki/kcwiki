/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/cheerio/cheerio.d.ts" />
/// <reference path="../typings/mkdirp/mkdirp.d.ts" />

import * as fs from "fs";
import * as cheerio from "cheerio";
import * as mkdirp from "mkdirp";
import * as HTTP from "../Lib/HTTP";

type Link = { data: string, url: string };

const enemy = process.argv[2] === "enemy";

const names = require(`./Data/Wikia${enemy ? "Enemy" : "Ship"}Modules`);
const links = [];

for (const name of names) {
    links.push({ data: name, url: `http://kancolle.wikia.com/wiki/Module:${name.replace("'", "")}` });
}

mkdirp.sync(`${__dirname}/Output/Lua`);

const fetcher = new HTTP.Fetcher(links, (link, body, next) => {
    const code = cheerio.load(body)(".source-lua").text().replace(/\u00A0/g, " ");
    fs.writeFile(`${__dirname}/Output/Lua/${link.data}.lua`, code, (err) => {
        if (err) {
            next(err);
        } else {
            console.log("Fetch:", link.data);
            next();
        }
    });
});

fetcher.fetchAll(() => { console.log("done"); });
