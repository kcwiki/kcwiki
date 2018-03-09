const fs = require('fs')

const defaultOptions = {newline: /\r?\n/, separator: ',', header: true}

module.exports = (path, schema = {}, options = defaultOptions) => {
  const data = fs.readFileSync(path).toString().split(options.newline).map(e => e.split(options.separator))
  const header = options.header && data[0]
  if (!header) {
    return data
  }
  schema = schema || {}
  const result = []
  for (let i = 1; i < data.length; ++i) {
    const p = {}
    for (let j = 0; j < header.length; ++j) {
      const name = header[j]
      const convertor = schema[name]
      if (typeof convertor === 'function') {
        p[name] = convertor(data[i][j])
      } else if (typeof convertor === 'object') {
        p[name] = convertor[data[i][j]]
      } else {
        p[name] = data[i][j]
      }
    }
    result.push(p)
  }
  return result
}
