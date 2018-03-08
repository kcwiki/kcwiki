const api = require('../data/api/api_start2.json')

exports.api = api
exports.ships = api.api_mst_ship.filter(e => e.api_id <= 1500)
exports.enemies = api.api_mst_ship.filter(e => e.api_id >= 1501)
exports.shipTypes = api.api_mst_stype
exports.equipment = api.api_mst_slotitem.filter(e => e.api_id <= 500)
exports.enemyEquipment = api.api_mst_slotitem.filter(e => e.api_id >= 501)
exports.equipmentTypes = api.api_mst_slotitem_equiptype
exports.items = api.api_mst_useitem
exports.worlds = api.api_mst_maparea
exports.maps = api.api_mst_mapinfo
exports.expeditions = api.api_mst_mission
