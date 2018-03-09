const fs = require('fs')
const data = require('./data/data')

let s = 'map_id,map_name,node_id,node_name,is_boss,diff,pattern,hq_min,hq_max,formation,rank,ship_id,count\n'

/* eslint-disable max-depth */
for (const mapId in data) {
  const mapData = data[mapId]
  for (const nodeId in mapData.nodes) {
    const nodeData = mapData.nodes[nodeId]
    for (const diff in nodeData.diffs) {
      for (const pattern in nodeData.diffs[diff]) {
        const patternData = nodeData.diffs[diff][pattern]
        for (const formation in patternData.formations) {
          for (const rank in patternData.formations[formation]) {
            for (const ship in patternData.formations[formation][rank]) {
              const count = patternData.formations[formation][rank][ship]
              s += `${mapId},${mapData.name},${nodeId},${nodeData.name},${nodeData.isBoss ? 1 : 0},${diff},${pattern},${patternData.hqMin},${patternData.hqMax},${formation},${rank},${ship},${count}\n`
            }
          }
        }
      }
    }
  }
}

fs.writeFileSync(`${__dirname}/data/data.csv`, s)
