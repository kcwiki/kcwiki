const {readFileSync} = require('fs')
const {findIndex} = require('lodash')

const readFunction = (path, name) => {
  const code = readFileSync(path).toString()
  return code
    .match(new RegExp(`function ${name}[\\s\\S]*?code([\\s\\S]*?)end`))[1]
    .trim()
    .replace(/  +/g, '')
    .replace(/setlocal_/g, 'setlocal ')
    .replace(/getlocal_/g, 'getlocal ')
    .replace(/Qname\(PackageNamespace\(""\),"(.+?)"\)/g, '$1')
    .replace(/Qname\(PackageNamespace\("(.+?):(.+?)"\),"(.+?)"\)/g, '$1.$2.$3')
    .replace(/Qname\(PrivateNamespace\("(.+?):(.+?)"\),"(.+?)"\)/g, '$1.$2.$3')
    .replace(/Qname\(PackageNamespace\("(.+?)"\),"(.+?)"\)/g, '$1.$2')
    .replace(/Qname\(PrivateNamespace\("(.+?)"\),"(.+?)"\)/g, '$1.$2')
    .replace(/ofs(.+?):/g, 'ofs$1:\n')
}

const parseCode = code => {
  return code.split('\n').map(e => e.trim().split(' ').map(e => e.trim())).map(e => {
    return {inst: e[0], args: e.slice(1).map(e => Number.isNaN(parseInt(e, 10)) ? e : parseInt(e, 10))}
  })
}

function VM (code, regs = [], lex = {}, debug) {
  const registers = {}
  for (let i = 0; i <= 8; ++i) {
    registers[i] = Number.isInteger(regs[i - 1]) ? regs[i - 1] : 0
  }

  const stack = []

  let cp = 0

  let result

  const log = s => {
    if (debug) {
      console.log(s)
    }
  }

  const findOffset = label =>
    findIndex(code, e => e.inst.startsWith(`${label}:`))

  return {

    getlocal (n) {
      stack.push(registers[n])
    },

    setlocal (n) {
      registers[n] = stack.pop()
    },

    getlex (name) {
      stack.push(lex[name])
    },

    findpropstrict (name) {
      stack.push(lex[name])
    },

    getproperty (name) {
      stack.push(stack.pop()[name])
    },

    pushscope () {
      stack.pop()
    },

    pushbyte (x) {
      stack.push(x)
    },

    pushshort (x) {
      stack.push(x)
    },

    pushnull () {
      stack.push(null)
    },

    pushtrue () {
      stack.push(true)
    },

    label () {},

    coerce () {},

    convert_i (_) { // eslint-disable-line camelcase
      stack.push(parseInt(stack.pop(), 10))
    },

    callproperty (name, n) {
      let args = []
      for (let i = 0; i < n; ++i) {
        args.push(stack.pop())
      }
      args = args.reverse()
      const obj = stack.pop()
      stack.push(obj[name](...args))
    },

    newarray (n) {
      let arr = []
      for (let i = 0; i < n; ++i) {
        arr.push(stack.pop())
      }
      arr = arr.reverse()
      stack.push(arr)
    },

    jump (label) {
      log(`  > ${findOffset(label)}`)
      return findOffset(label)
    },

    ifstricteq (label) {
      const x = stack.pop()
      const y = stack.pop()
      if (x === y) {
        log(`  > ${findOffset(label)}`)
        return findOffset(label)
      }
    },

    ifne (label) {
      const x = stack.pop()
      const y = stack.pop()
      if (x !== y) {
        log(`  > ${findOffset(label)}`)
        return findOffset(label)
      }
    },

    returnvalue () {
      result = stack.pop()
      return -1
    },

    stack: () => stack,
    registers: () => registers,
    result: () => result,

    runCommand (command) {
      log(`${command.inst} ${command.args.join(' ')}`)
      const inst = this[command.inst]
      if (!inst && !command.inst.match(/^ofs.+?$/)) {
        throw new Error(`avm2: can't run this: ${command.inst}`)
      }
      if (inst) {
        const ret = inst(...command.args)
        log(`    stack     : ${JSON.stringify(this.stack())}`)
        log(`    registers : ${JSON.stringify(this.registers())}`)
        return ret
      }
    },

    run () {
      for (; cp >= 0 && cp < code.length; ++cp) {
        const ctrl = this.runCommand(code[cp])
        if (ctrl > 0) {
          cp = ctrl
        } else if (ctrl === -1) {
          return
        }
      }
    }
  }
}

exports.readFunction = readFunction
exports.parseCode = parseCode
exports.VM = VM
