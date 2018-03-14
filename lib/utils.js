const {writeFileSync} = require('fs')
const {sync: writeJsonFileSync} = require('write-json-file')

exports.id = x => x

exports.fail = error => {
  if (error) {
    throw new Error(error.toString())
  }
}

exports.writeJsonSync = (filepath, data, sortKeys = true) => {
  if (Array.isArray(data)) {
    writeFileSync(filepath, JSON.stringify(data.sort(), null, 2))
  } else {
    writeJsonFileSync(filepath, data, {indent: 2, sortKeys})
  }
}

exports.diff = (a, b) => a.filter(x => b.indexOf(x) < 0)

exports.getArgs = flags => {
  const r = {}
  flags.forEach(flag => {
    r[flag] = process.argv.includes(flag)
  })
  return r
}
