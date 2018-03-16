const {spawnSync} = require('child_process')
const {readFileSync, readJsonSync, outputFileSync} = require('fs-extra')
const filenamify = require('filenamify')
const {mapValues, invert} = require('lodash')
const {eachLimit, mapValuesLimit, retryable} = require('async')

const {id, fail, writeJsonSync, getArgs} = require('../lib/utils')
const {luaToJson} = require('../lib/lua')
const mw = require('../lib/mw')

const config = require('./config')

const dataDir = `${__dirname}/../data/wikia`

let namespaces

let user
if (process.env.mw_name && process.env.mw_password) {
  user = {name: process.env.mw_name, password: process.env.mw_password}
}

const concurrency = parseInt(process.env.mw_concurrency) || config.bot.concurrency

module.exports = (next, all = false, spawnLua = false) => mw(config.bot, user, bot => {
  const fetchNamespaces = next => {
    bot.getSiteInfo(['namespaces'], (error, data) => {
      fail(error)
      namespaces = mapValues(invert(mapValues(data.namespaces, v => v['*'])), v => parseInt(v))
      writeJsonSync(`${dataDir}/namespaces.json`, namespaces, (a, b) => namespaces[a] - namespaces[b])
      next()
    })
  }

  const fetchModuleNames = next => {
    console.log('wikia/fetch: fetching module names')
    if (all) {
      bot.getPagesInNamespace(namespaces.Module, (error, pages) => {
        fail(error)
        next({
          all: pages.filter(e => e.title.startsWith('Module:')).map(e => e.title.replace('Module:', ''))
        })
      })
    } else {
      mapValuesLimit(config.modules, concurrency, (category, key, next) => {
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
    eachLimit(pages, concurrency, retryable((page, next) => {
      bot.getArticle(`Module:${page}`, (error, data) => {
        if (!error) {
          ++i
          if (i % 100 === 0) {
            console.log(`  ${Math.round(100 * i / pages.length)}%`)
          }
          outputFileSync(`${dataDir}/lua/${filenamify(page)}.lua`, data)
          filenames[page] = filenamify(page)
        } else {
          console.log(`  retrying for ${page}`)
        }
        next(error)
      })
    }),
    error => {
      fail(error)
      writeJsonSync(`${dataDir}/module_filenames.json`, filenames)
      console.log(`  got ${i} modules`)
      next(filenames)
    })
  }

  fetchNamespaces(() => {
    fetchModuleNames(modules => {
      if (all) {
        writeJsonSync(`${dataDir}/modules-all.json`, modules.all)
      } else {
        writeJsonSync(`${dataDir}/modules.json`, modules)
      }
      fetchModules(modules, filenames => {
        if (all) {
          next()
          return
        }
        console.log(`wikia/fetch: converting Lua to JSON`)
        if (spawnLua) {
          // Todo: remove later
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
        } else {
          const data = {}
          for (const key in modules) {
            data[key] = data[key] || {}
            for (const page of modules[key]) {
              data[key][page] = luaToJson(readFileSync(`${dataDir}/lua/${filenames[page]}.lua`).toString())
            }
          }
          writeJsonSync(`${dataDir}/data.json`, data)
          for (const key in data) {
            writeJsonSync(`${dataDir}/${key}.json`, data[key])
          }
        }
        next()
      })
    })
  })
})

const args = getArgs(['run', 'all', 'spawnLua'])

if (args.run) {
  module.exports(id, args.all, args.spawnLua)
}
