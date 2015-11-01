///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>

import immutable = require("immutable");

const servers: { [name: string]: string } = require("../Data/Servers.json");

export const ips = immutable.Map<string, string>(servers);

export const Yokosuka = servers["Yokosuka"];
export const Kure = servers["Kure"];
export const Sasebo = servers["Sasebo"];
export const Maizuru = servers["Maizuru"];
export const Oominato = servers["Oominato"];
export const Torakku = servers["Torakku"];
export const Ringa = servers["Ringa"];
export const Rabauru = servers["Rabauru"];
export const Shootorando = servers["Shootorando"];
export const Buin = servers["Buin"];
export const Tauitaui = servers["Tauitaui"];
export const Parao = servers["Parao"];
export const Burunei = servers["Burunei"];
export const Paramushiru = servers["Paramushiru"];
export const Hitokappu = servers["Hitokappu"];
export const Sukumo = servers["Sukumo"];
export const Kanoya = servers["Kanoya"];
export const Iwagawa = servers["Iwagawa"];
export const Saiki = servers["Saiki"];
export const Hashirajima = servers["Hashirajima"];
