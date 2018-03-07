const {sync: writeJsonFileSync} = require('write-json-file')

exports.fail = error => {
  if (error) {
    throw new Error(error.toString())
  }
}

exports.writeJsonSync = (filepath, data, sortKeys = true) => writeJsonFileSync(filepath, data, {indent: 2, sortKeys})

exports.diff = (a, b) => a.filter(x => b.indexOf(x) < 0)
