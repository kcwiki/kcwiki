const {execSync} = require('child_process')

const {writeJsonSync} = require('../lib/utils')
const avm2 = require('../lib/avm2')

console.log('fetching RemodelMain.swf...')

execSync('curl -s -o RemodelMain.swf 125.6.189.135/kcs/scenes/RemodelMain.swf')

console.log('extracting EquipList.pcode...')

execSync('ffdec -format script:pcode -export script . RemodelMain.swf')
execSync('cp scripts/scene/remodel/view/changeEquip/EquipList.pcode EquipList.pcode')

console.log('extracting _createType3List pcode...')

const functionCode = avm2.readFunction('EquipList.pcode', '_createType3List')

console.log('parsing _createType3List pcode...')

const code = avm2.parseCode(functionCode)

console.log('preparing exception table by running pcode...')

const runCode = id => {
  let arrangeListCalls = 0
  const vm = new avm2.VM(code, [id], {
    'scene.remodel.view.changeEquip.EquipList._selected_ship_mst_id': id,
    'scene.remodel.view.changeEquip.EquipList._arrangeList': {
      'scene.remodel.view.changeEquip.EquipList._arrangeList': (_, allow, disallow) => {
        ++arrangeListCalls
        if (arrangeListCalls > 1) {
          console.log('? calling _arrangeList more than one time')
        }
        return {allow, disallow}
      }
    },
    DataFacade: {
      getMasterShipData: () => ({getShipType: () => 0}),
      getMasterShipTypeData: () => ({
        getShipTypeData: () => ({equipTypes: []})
      })
    }
  })
  vm.run()
  return vm.result()
}

const data = {}
for (let id = 1; id < 1000; ++id) {
  const r = runCode(id)
  if (r.allow || r.disallow) {
    data[id] = r
  }
}
writeJsonSync(`${__dirname}/../data/client/equipability.json`, data)

execSync('rm -rf scripts RemodelMain.swf EquipList.pcode')
