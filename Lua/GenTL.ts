import * as fs from "fs";

const shipData = require("../Lib/Data/ShipData");
const enemyData = require("../Lib/Data/EnemyData");
const equipmentData = require("../Lib/Data/EquipmentData");
const enemyEquipmentData = require("../Lib/Data/EnemyEquipmentData");

type Dict = { [key: string]: string };

const shipTL: Dict = {}, enemyTL: Dict = {}, equipmentTL: Dict = {}, enemyEquipmentTL: Dict = {};

for (const ship in shipData) {
    for (const form in shipData[ship]) {
        const shipTable = shipData[ship][form];
        if (shipTable._japanese_name && ! shipTL[shipTable._japanese_name]) {
            const enName = shipTable._suffix ? `${shipTable._name} ${shipTable._suffix}` : shipTable._name;
            shipTL[shipTable._japanese_name] = enName;
        }
    }
}

for (const ship in enemyData) {
    for (const form in enemyData[ship]) {
        const shipTable = enemyData[ship][form];
        if (shipTable._japanese_name) {
            const name = shipTable._japanese_name.replace("elite", "").replace("flagship", "");
            if (! enemyTL[name]) {
                const enName = shipTable._suffix ? `${shipTable._name} ${shipTable._suffix}` : shipTable._name;
                enemyTL[name] = enName.replace(" Flagship", "");
            }
        }
    }
}

for (const eq in equipmentData) {
    const eqTable = equipmentData[eq];
    if (eqTable._japanese_name) {
        equipmentTL[eqTable._japanese_name] = eqTable._name;
    }
}

for (const eq in enemyEquipmentData) {
    const eqTable = enemyEquipmentData[eq];
    if (eqTable._japanese_name) {
        enemyEquipmentTL[eqTable._japanese_name] = eqTable._name;
    }
}

function xmlItems(tlTable: Dict, tag: string): string {
    let result = "";
    for (const jpName in tlTable) {
        const en = tlTable[jpName]
                .replace("Carrier Kai Ni", "Kai Ni")
                .replace("zwei", "Zwei")
                .replace("drei", "Drei")
                .replace("Junyou", "Jun'you")
                .replace("Верный", "Verniy")
                .replace("&", "&amp;"),
            jp = jpName.replace("&", "&amp;");
        result += `  <${tag}>\n    <JP-Name>${jp}</JP-Name>\n    <TR-Name>${en}</TR-Name>\n  </${tag}>\n`;
    }
    return result;
}

fs.writeFileSync("Lib/Data/Ships.xml", `<?xml version="1.0" encoding="utf-8"?>\n<Ships Version="">\n${xmlItems(shipTL, "Ship")}${xmlItems(enemyTL, "Ship")}</Ships>\n`);
fs.writeFileSync("Lib/Data/Equipment.xml", `<?xml version="1.0" encoding="utf-8"?>\n<Equipment Version="">\n${xmlItems(equipmentTL, "Item")}${xmlItems(enemyEquipmentTL, "Item")}</Equipment>\n`);
fs.writeFileSync("Lib/Data/Ships.json", JSON.stringify(shipTL, undefined, 2) + "\n");
fs.writeFileSync("Lib/Data/Enemy.json", JSON.stringify(enemyTL, undefined, 2) + "\n");
fs.writeFileSync("Lib/Data/Equipment.json", JSON.stringify(equipmentTL, undefined, 2) + "\n");
fs.writeFileSync("Lib/Data/EnemyEquipment.json", JSON.stringify(enemyEquipmentTL, undefined, 2) + "\n");
