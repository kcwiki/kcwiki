/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/mkdirp/mkdirp.d.ts" />

import * as fs from "fs";

export class Object {

    public file: string;
    public data: any;

    constructor(file: string) {
        this.file = file;
        this.data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file).toString()) : {};
        process.on("SIGINT", (code: number) => {
            console.log("saving cache...");
            fs.writeFileSync(file, JSON.stringify(this.data, undefined, 2));
            process.exit(code);
        });
    }

    public flush(): void {
        fs.writeFileSync(this.file, JSON.stringify(this.data, undefined, 2));
    }

    public get(key: string): any {
        return this.data[key];
    }

    public get2(key1: string, key2: string): any {
        const tmp = this.data[key1];
        return tmp ? tmp[key2] : undefined;
    }

    public set(key: string, value: any): void {
        this.data[key] = value;
    }

    public set2(key1: string, key2: string, value: any): void {
        if (typeof this.data[key1] !== "object") {
            this.data[key1] = {};
        }
        this.data[key1][key2] = value;
    }

}
