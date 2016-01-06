import * as fs from "fs";
import {Log} from "./Log";

export type Config = {
    port: number,

    log: {
        proxy: string | boolean,
        mode: string,
        api: string | boolean,
        api_start2: string | boolean,
        exit: boolean,
    }

    fix_dmm_cookie: boolean,

    anti_cat: {
        wait_for_network: number,
        use_cache: boolean,
    },

    cache: string | boolean,
    use_cache: boolean,
    mods: string | boolean,
    use_kc_server: string,
};

function checkConfig(config: Config): void {
    config.port = config.port || 3000;
    if (config.log) {
        config.log.proxy = config.log.proxy || false;
        config.log.mode = config.log.mode || "w";
        config.log.api = (config.log.api === true ? "api" : config.log.api) || false;
        config.log.api_start2 = (config.log.api_start2 === true ? "api_start2" : config.log.api_start2) || false;
        config.log.exit = (config.log.exit ? true : false);
    } else {
        config.log = {
            proxy: false,
            mode: "w",
            api: false,
            api_start2: false,
            exit: false,
        };
    }
    config.fix_dmm_cookie = config.fix_dmm_cookie || false;
    if (config.anti_cat) {
        config.anti_cat.wait_for_network
            = typeof(config.anti_cat.wait_for_network) === "number" && config.anti_cat.wait_for_network >= 1
            ? config.anti_cat.wait_for_network
            : undefined;
        config.anti_cat.use_cache = (config.anti_cat.use_cache ? true : false);
    } else {
        config.anti_cat = {
            wait_for_network: undefined,
            use_cache: false,
        };
    }
    config.cache = (config.cache === true ? "cache" : config.cache) || false;
    config.use_cache = (config.use_cache ? true : false);
    config.mods = (config.mods === true ? "mods" : config.mods) || false;
    config.use_kc_server = config.use_kc_server || undefined;
}

export function loadConfig() {
    const arg = process.argv[2];
    const configFile = arg ? arg : `${__dirname}/config.json`;
    let config = <Config>{};
    if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile).toString());
    } else {
        console.log("config file doesn't exist, using defaults (everything is disabled)");
    }
    checkConfig(config);
    const proxyLog = new Log(config.log.proxy, config.log.mode);
    return { config, proxyLog };
}
