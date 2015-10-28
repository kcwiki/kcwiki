///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>

import immutable = require("immutable");

export const ips = immutable.Map<string, string>(require("../Data/Servers.json"));
