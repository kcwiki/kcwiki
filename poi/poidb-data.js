const fs = require('fs')
const _ = require('lodash')
const MongoClient = require('mongodb').MongoClient
const u = require('./lib/utils')

// Command line arguments

const mapIds = process.argv.slice(2).map(e => parseInt(e)).filter(e => !Number.isNaN(e))
if (mapIds.length === 0) {
  console.log('usage: node poidb-data <map id> ...')
  process.exit()
} else {
  console.log(`collecting data for maps ${mapIds.join(', ')}...`)
}

// Initial validation and grouping for records

let dataPrev
if (fs.existsSync(`${__dirname}/data/data.json`)) {
  dataPrev = require(`${__dirname}/data/data.json`)
}

function checkRecord (record) {
  if (dataPrev && dataPrev[record.mapId] && dataPrev[record.mapId].name !== record.quest) {
    console.error(`bad map name: ${record.quest}`)
    return false
  }
  if (dataPrev && dataPrev[record.mapId] && dataPrev[record.mapId].nodes[record.cellId] && dataPrev[record.mapId].nodes[record.cellId].name !== record.enemy) {
    console.error(`bad node name: ${record.enemy}`)
    return false
  }
  if (!Number.isInteger(record.shipId)) {
    console.error(`shipId is not an integer: ${record.shipId}`)
    return false
  }
  if (!Number.isInteger(record.itemId)) {
    console.error(`itemId is not an integer: ${record.itemId}`)
    return false
  }
  if (!Number.isInteger(record.mapId)) {
    console.error(`mapId is not an integer: ${record.mapId}`)
    return false
  }
  if (typeof (record.quest) !== 'string' || record.quest === '') {
    console.error(`quest is not a string or empty: ${record.quest}`)
    return false
  }
  if (!Number.isInteger(record.cellId)) {
    console.error(`cellId is not an integer: ${record.cellId}`)
    return false
  }
  if (typeof (record.enemy) !== 'string' || record.enemy === '') {
    console.error(`enemy is not a string or empty: ${record.enemy}`)
    return false
  }
  if (typeof (record.rank) !== 'string' || ['S', 'A', 'B', 'C', 'D', 'E'].indexOf(record.rank) === -1) {
    console.error(`rank is not a string or invalid: ${record.rank}`)
    return false
  }
  if (typeof (record.isBoss) !== 'boolean') {
    console.error(`isBoss is not a boolean: ${record.isBoss}`)
    return false
  }
  if (!Number.isInteger(record.teitokuLv) || record.teitokuLv < 1 || record.teitokuLv > 120) {
    console.error(`teitokuLv is not an integer or invalid: ${record.teitokuLv}`)
    return false
  }
  if (!Number.isInteger(record.mapLv) || record.mapLv < 1 || record.mapLv > 4) {
    console.error(`mapLv is not an integer or invalid: ${record.mapLv}`)
    return false
  }
  if (!record.enemyShips1 || !record.enemyShips2) {
    console.error('missing enemyShips1 or enemyShips2')
    return false
  }
  if (record.enemyShips1.find(id => !Number.isInteger(id)) || record.enemyShips2.find(id => !Number.isInteger(id))) {
    console.error('enemyShips1 or enemyShips2 contains a non-integer')
    return false
  }
  if (record.enemyShips1.length === 0) {
    console.error('enemyShips1 is empty')
    return false
  }
  if (typeof (record.origin) !== 'string' || record.origin === '') {
    console.error('origin is not a string or empty')
    return false
  }
  if (!Number.isInteger(record.enemyFormation) || [1, 2, 3, 4, 5, 6, 11, 12, 13, 14].indexOf(record.enemyFormation) === -1) {
    console.error(`enemyFormation is not an integer or invalid: ${record.enemyFormation} ${record.origin}`)
    return false
  }
  return true
}

const data = {}

function addRecord (record) {
  if (!data[record.mapId]) {
    data[record.mapId] = {names: {}, nodes: {}}
    data[record.mapId].names[record.quest] = 1
  } else if (!data[record.mapId].names[record.quest]) {
    data[record.mapId].names[record.quest] = 1
  } else {
    data[record.mapId].names[record.quest] += 1
  }
  if (!data[record.mapId].nodes[record.cellId]) {
    data[record.mapId].nodes[record.cellId] = {names: {}, isBoss: record.isBoss, diffs: {}}
    data[record.mapId].nodes[record.cellId].names[record.enemy] = 1
  } else if (!data[record.mapId].nodes[record.cellId].names[record.enemy]) {
    data[record.mapId].nodes[record.cellId].names[record.enemy] = 1
  } else {
    data[record.mapId].nodes[record.cellId].names[record.enemy] += 1
  }
  if (!data[record.mapId].nodes[record.cellId].diffs[record.mapLv]) {
    data[record.mapId].nodes[record.cellId].diffs[record.mapLv] = {}
  }
  const enemyPattern = `${record.enemyShips1.join('/')};${record.enemyShips2.join('/')}`
  if (!data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern]) {
    data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern] = {hqMin: record.teitokuLv, hqMax: record.teitokuLv, formations: {}}
  } else {
    const pattern = data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern]
    if (record.teitokuLv < pattern.hqMin) {
      pattern.hqMin = record.teitokuLv
    } else if (record.teitokuLv > pattern.hqMax) {
      pattern.hqMax = record.teitokuLv
    }
  }
  if (!data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern].formations[record.enemyFormation]) {
    data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern].formations[record.enemyFormation] = {}
  }
  if (!data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern].formations[record.enemyFormation][record.rank]) {
    data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern].formations[record.enemyFormation][record.rank] = {}
  }
  const ships = data[record.mapId].nodes[record.cellId].diffs[record.mapLv][enemyPattern].formations[record.enemyFormation][record.rank]
  if (ships[record.shipId]) {
    ++ships[record.shipId]
  } else {
    ships[record.shipId] = 1
  }
  // Todo: items
}

// Final validation for grouped data

function checkData () {
  for (const mapId in data) {
    if (Object.keys(data[mapId].names).length !== 1) {
      console.log(`${mapId}: map name conflicts:`)
      for (const name of Object.keys(data[mapId].names)) {
        console.log(`  ${name}: ${data[mapId].names[name]}`)
      }
    }
    data[mapId].name = _.maxBy(_.toPairs(data[mapId].names), e => e[1])[0]
    for (const cellId in data[mapId].nodes) {
      if (Object.keys(data[mapId].nodes[cellId].names).length !== 1) {
        console.log(`${mapId}: ${cellId}: node name conflicts:`)
        for (const name of Object.keys(data[mapId].nodes[cellId].names)) {
          console.log(`  ${name}: ${data[mapId].nodes[cellId].names[name]}`)
        }
      }
      data[mapId].nodes[cellId].name = _.maxBy(_.toPairs(data[mapId].nodes[cellId].names), e => e[1])[0]
    }
  }
}

// Collecting and saving

let records = 0
let accepted = 0

const onRecord = record => {
  ++records
  if (checkRecord(record)) {
    ++accepted
    addRecord(record)
  }
}

const onFinish = db => {
  db.close()
  checkData()
  console.log(`${records} records, ${accepted} accepted`)
  fs.writeFileSync(`${__dirname}/data/data.json`, JSON.stringify(data))
}

// DB configuration and connection

const server = 'localhost'
const port = 27017
const dbName = 'poi-production'
const url = `mongodb://${server}:${port}/${dbName}`
const collectionName = 'dropshiprecords'

MongoClient.connect(url, u.using(db => {
  db.collection(collectionName)
    .find({$or: mapIds.map(id => ({mapId: id}))})
    .forEach(onRecord, u.using(onFinish, db))
}))
