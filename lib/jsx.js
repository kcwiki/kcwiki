const parameter = (name, def) => ({
  type: 'parameter',
  value: `{{{${name}${def ? `|${def === true ? '' : def}` : ''}}}}`,
  compile () {
    return this.value
  }
})

// Todo: support storing in a variable
const mapping = (p, domain, f, g) => {
  const values = {}
  for (const e of domain) {
    values[f(e)] = g(e)
  }
  return {
    type: 'switch',
    parameter: p,
    values: values,
    compile () {
      return `{{#switch:${this.parameter.value}${Object.keys(this.values).map(k => `|${k}=${this.values[k]}`).join('')}}}`
    }
  }
}

const compileStyle = style =>
  Object.keys(style).map(k => `${k}:${style[k]}`).join(';')

// Todo: validation, escaping
const compile_ = (e, tags = []) => {
  if (!e) {
    return
  }
  if (typeof e === 'string') {
    tags.push(e)
  } else if (e.type === 'link') {
    tags.push(`[[${e.props.target}|${compile_(e.props.children)}]]`)
  } else {
    const attrs = []
    for (const p in e.props) {
      if (p === 'className') {
        attrs.push(`class="${e.props[p]}"`)
      } else if (p === 'style') {
        attrs.push(`style="${compileStyle(e.props[p])}"`)
      } else if (p !== 'children') {
        attrs.push(`${p}="${e.props[p]}"`)
      }
    }
    tags.push(`<${e.type}${attrs.length > 0 ? ' ' + attrs.join(' ') : ''}>`)
    const cs = Array.isArray(e.props.children) ? e.props.children : e.props.children ? [e.props.children] : []
    for (const c of cs) {
      compile_(c, tags)
    }
    tags.push(`</${e.type}>`)
  }
  return tags.join('')
}

const compile = c => {
  const props = {}
  for (const k in c.args) {
    props[k] = c.args[k].compile()
  }
  return compile_(c(props))
}

exports.parameter = parameter
exports.mapping = mapping
exports.compile = compile
