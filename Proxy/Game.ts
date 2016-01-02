/*
 * Some definitions related to the game API.
 */

export const kcServers: { [ip: string]: string } = {
    "203.104.209.71": "Yokosuka",
    "125.6.184.15": "Kure",
    "125.6.184.16": "Sasebo",
    "125.6.187.205": "Maizuru",
    "125.6.187.229": "Oominato",
    "125.6.187.253": "Torakku",
    "125.6.188.25": "Ringa",
    "203.104.248.135": "Rabauru",
    "125.6.189.7": "Shootorando",
    "125.6.189.39": "Buin",
    "125.6.189.71": "Tauitaui",
    "125.6.189.103": "Parao",
    "125.6.189.135": "Burunei",
    "125.6.189.167": "Hitokappu",
    "125.6.189.215": "Paramushiru",
    "125.6.189.247": "Sukumo",
    "203.104.209.23": "Kanoya",
    "203.104.209.39": "Iwagawa",
    "203.104.209.55": "Saiki",
    "203.104.209.102": "Hashirajima",
};

export function isDMM(host: string): boolean {
    return host.match(/.*dmm\.com$/) ? true : false;
}

export function isAPIStart(url: string): boolean {
    return url.match(/^http:\/\/.*\/kcsapi\/api_start2$/) ? true : false;
}

export function isAPI(url: string): string {
    const parts = url.match(/^http:\/\/.*\/kcsapi\/(.*)$/);
    return parts ? parts[1] : undefined;
}

export function isAsset(url: string): string {
    const parts = url.match(/^http:\/\/.*\/kcs\/([^\?]*).*$/);
    return parts ? parts[1] : undefined;
}
