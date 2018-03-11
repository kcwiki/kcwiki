import test from 'ava'
import {readdirSync, removeSync} from 'fs-extra'

import fetch from './wikia/fetch'

const wikiaDataDir = `${__dirname}/data/wikia`

test.serial.cb('wikia/fetch should fetch something', t => {
  removeSync(wikiaDataDir)
  fetch(() => {
    t.is(readdirSync(wikiaDataDir).length, 10)
    t.end()
  })
})

test.serial('wikia/translations should generate something', t => {
  require('./wikia/translations')()
  t.is(readdirSync(wikiaDataDir).length, 16)
})
