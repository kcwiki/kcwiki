const {writeJsonSync} = require('../lib/utils')
const {ships, enemies, equipment, enemyEquipment, shipTypes, equipmentTypes, items} = require('../lib/kc')
const {getShipData, formatShipName, getId, formatEnemyName, getEquipmentData, getEquipmentId,
  getShipType, getShipTypeId, getEquipmentType, getEquipmentTypeId, getItem, getItemId} = require('../lib/wikia')

const dataDir = `${__dirname}/../data/wikia`

console.log('wikia/tranlations: generating ship names')

const shipNames = {}
for (const ship of ships) {
  shipNames[ship.api_name] = formatShipName(getShipData(ship.api_id, ship.api_name))
}
writeJsonSync(`${dataDir}/ship_names.json`, shipNames, (a, b) => getId(a) - getId(b))

console.log('wikia/tranlations: generating enemy names')

const enemyNames = {}
for (const ship of enemies) {
  enemyNames[ship.api_name] = formatEnemyName(getShipData(ship.api_id, ship.api_name, 'enemies'))
}
writeJsonSync(`${dataDir}/enemy_names.json`, enemyNames)
// Use (a, b) => getId(a) - getId(b) here

console.log('wikia/tranlations: generating equipment names')

const equipmentNames = {}
for (const e of equipment) {
  equipmentNames[e.api_name] = getEquipmentData(e.api_id)._name
}
writeJsonSync(`${dataDir}/equipment_names.json`, equipmentNames, (a, b) => getEquipmentId(a) - getEquipmentId(b))

console.log('wikia/tranlations: generating enemy equipment names')

const enemyEquipmentNames = {}
for (const e of enemyEquipment) {
  enemyEquipmentNames[e.api_name] = getEquipmentData(e.api_id, 'enemy_equipment')._name
}
writeJsonSync(`${dataDir}/enemy_equipment_names.json`, enemyEquipmentNames, (a, b) => getEquipmentId(a) - getEquipmentId(b))

console.log('wikia/tranlations: generating ship type names')

const shipTypeNames = {}
for (const e of shipTypes) {
  shipTypeNames[e.api_name] = getShipType(e.api_id) || e.api_name
}
writeJsonSync(`${dataDir}/ship_type_names.json`, shipTypeNames, (a, b) => getShipTypeId(a) - getShipTypeId(b))

console.log('wikia/tranlations: generating equipment type names')

const equipmentTypeNames = {}
for (const e of equipmentTypes) {
  equipmentTypeNames[e.api_name] = getEquipmentType(e.api_id) || e.api_name
}
writeJsonSync(`${dataDir}/equipment_type_names.json`, equipmentTypeNames, (a, b) => getEquipmentTypeId(a) - getEquipmentTypeId(b))

console.log('wikia/tranlations: generating item names')

const itemNames = {}
for (const e of items) {
  if (e.api_name !== '') {
    itemNames[e.api_name] = getItem(e.api_id) || e.api_name
  }
}
writeJsonSync(`${dataDir}/item_names.json`, itemNames, (a, b) => getItemId(a) - getItemId(b))

module.exports = () => {}
