const {readJsonSync} = require('fs-extra')

const {api, shipTypes, equipmentTypes} = require('../lib/kc')
const {fail} = require('./utils')

const data = readJsonSync(`${__dirname}/../data/wikia/data.json`, {throws: false})

module.exports.getShipData = (apiId, jpName, collection = 'ships') => {
  for (const ship in data[collection]) {
    for (const form in data[collection][ship]) {
      const formData = data[collection][ship][form]
      if (formData._api_id === apiId) {
        const name = formData._japanese_name.replace('elite', '').replace('flagship', '')
        if (name !== jpName) {
          fail(`wikia/getShipData: ${jpName} !== ${name} for ${formData._name} (${apiId}) from ${collection}`)
        }
        return formData
      }
    }
  }
  // Legacy modules
  if (collection === 'enemies' && apiId >= 1501) {
    return module.exports.getShipData(apiId - 1000, jpName, collection)
  }
  fail(`wikia/getShipData: can't find ${collection} data for ${apiId}, ${jpName}`)
}

module.exports.getEquipmentData = (apiId, collection = 'equipment') => {
  for (const eq in data[collection]) {
    if (data[collection][eq]._id === apiId) {
      return data[collection][eq]
    }
  }
  // Bad categories?
  if (collection === 'enemy_equipment') {
    return module.exports.getEquipmentData(apiId)
  }
  fail(`wikia/getEquipmentData: can't find ${collection} data for ${apiId}`)
}

module.exports.getId = jpName =>
  api.api_mst_ship.find(e => e.api_name === jpName).api_sortno ||
  api.api_mst_ship.find(e => e.api_name === jpName).api_id ||
  fail(`wikia/getId: can't find id for ${jpName}`)

module.exports.getEquipmentId = jpName =>
  api.api_mst_slotitem.find(e => e.api_name === jpName).api_id ||
  fail(`wikia/getEquipmentId: can't find id for ${jpName}`)

module.exports.formatShipName = data =>
  `${data._name}${data._suffix && data._suffix !== '' ? ` ${data._suffix}` : ''}`

// Use min. id instead?
module.exports.formatEnemyName = data =>
  module.exports.formatShipName(data)
    .replace(/ I$/, '')
    .replace(/ II$/, '')
    .replace(/ III$/, '')
    .replace(/ IV$/, '')
    .replace(/ V$/, '')
    .replace(/ VI$/, '')
    .replace(/ VII$/, '')
    .replace(/ Vita$/, '')
    .replace(/ Flagship$/, '')
    .replace(/ Elite$/, '')

module.exports.getShipType = id => data.misc.ShipTypes[id]
module.exports.getShipTypeId = jpName => shipTypes.find(e => e.api_name === jpName).api_id

module.exports.getEquipmentType = id => data.misc.EquipmentTypes[id]
module.exports.getEquipmentTypeId = jpName => equipmentTypes.find(e => e.api_name === jpName).api_id
