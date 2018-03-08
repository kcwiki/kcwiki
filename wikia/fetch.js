const {spawnSync} = require('child_process')
const {readJsonSync, outputFileSync} = require('fs-extra')
const filenamify = require('filenamify')
const {eachLimit, mapValuesLimit} = require('async')

const {fail, writeJsonSync} = require('../lib/utils')
const mw = require('../lib/mw')

const config = require('./config')

const dataDir = `${__dirname}/../data/wikia`

module.exports = next => mw(config.bot, null, bot => {
  const fetchModuleNames = next => {
    console.log('wikia/fetch: fetching module names')
    mapValuesLimit(config.modules, config.bot.concurrency, (category, key, next) => {
      bot.getPagesInCategory(category.category || category, (error, pages) => {
        fail(error)
        console.log(`  ${key}`)
        next(error, pages.filter(e => e.title.startsWith('Module:')).map(e => e.title.replace('Module:', '')))
      })
    },
    (error, data) => {
      fail(error)
      for (const key in config.modules) {
        if (config.modules[key].move_to) {
          data[config.modules[key].move_to].push(...data[key])
          delete data[key]
        }
      }
      next(data)
    })
  }

  const fetchModules = (data, next) => {
    console.log('wikia/fetch: fetching modules')
    const pages = []
    for (const key in data) {
      for (const page of data[key]) {
        pages.push(page)
      }
    }
    const filenames = {}
    let i = 0
    eachLimit(pages, config.bot.concurrency, (page, next) => {
      bot.getArticle(`Module:${page}`, (error, data) => {
        fail(error)
        outputFileSync(`${dataDir}/lua/${filenamify(page)}.lua`, data)
        filenames[page] = filenamify(page)
        ++i
        next()
      })
    },
    error => {
      fail(error)
      writeJsonSync(`${dataDir}/module_filenames.json`, filenames)
      console.log(`  got ${i} modules`)
      next()
    })
  }

  fetchModuleNames(data => {
    writeJsonSync(`${dataDir}/modules.json`, data)
    fetchModules(data, () => {
      console.log(`wikia/fetch: converting Lua to JSON`)
      const lua = spawnSync('lua', [`${__dirname}/convert.lua`, __dirname])
      if (lua.stdout.toString() !== '') {
        console.log(lua.stdout.toString())
      }
      if (lua.stderr.toString() !== '') {
        console.log(lua.stderr.toString())
      }
      const data = readJsonSync(`${dataDir}/data.json`)
      // Resorting
      writeJsonSync(`${dataDir}/data.json`, data)
      for (const key in data) {
        writeJsonSync(`${dataDir}/${key}.json`, data[key])
      }
      next()
    })
  })
})
