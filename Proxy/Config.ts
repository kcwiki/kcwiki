import * as fs from "fs";
import {Log} from "./Log";

export type Config = {
    port?: number,

    // TODO: append mode
    log?: {
        proxy?: string | boolean,
        api?: string | boolean,
        api_start2: string | boolean,
    }

    fix_dmm_cookie?: boolean,

    anti_cat?: {
        wait_for_network?: number,
    }
};

function checkConfig(config: Config): void {
    config.port = config.port || 3000;
    if (config.log) {
        config.log.proxy = config.log.proxy || false;
        config.log.api = config.log.api || false;
        config.log.api_start2 = config.log.api_start2 || false;
    } else {
        config.log = {
            proxy: false,
            api: false,
            api_start2: false,
        };
    }
    config.fix_dmm_cookie = config.fix_dmm_cookie || false;
    if (config.anti_cat) {
        config.anti_cat.wait_for_network
            = typeof(config.anti_cat.wait_for_network) === "number" && config.anti_cat.wait_for_network >= 1
            ? config.anti_cat.wait_for_network
            : undefined;
    } else {
        config.anti_cat = {
            wait_for_network: undefined
        };
    }
}

export function loadConfig() {
    const configFile = `${__dirname}/config.json`;
    if (fs.existsSync(configFile)) {
        const config: Config = JSON.parse(fs.readFileSync(configFile).toString());
        checkConfig(config);
        const proxyLog = new Log(config.log.proxy);
        const apiLog = new Log(config.log.api);
        return { config, proxyLog, apiLog };
    } else {
        console.log("config.json should exist");
        process.exit();
    }
}
