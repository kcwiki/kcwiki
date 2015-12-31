import * as fs from "fs";

export class Log {

    private file: NodeJS.WritableStream;

    constructor(file: string | boolean, mode?: string) {
        this.file
            = typeof file === "string"
            ? fs.createWriteStream(file, { flags: mode || "w" })
            : file
            ? process.stdout
            : undefined;
    }

    public log(...args: any[]): void {
        if (this.file) {
            const s: string[] = [];
            for (const arg of args) {
                if (arg !== undefined) {
                    s.push(arg.toString());
                }
            }
            this.file.write(`${s.join(" ")}\n`);
        }
    }

};
