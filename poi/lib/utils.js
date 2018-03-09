const handle = err => {
  if (err) {
    throw new Error(err.toString())
  }
}

const using = (dataFn, context, handleFn = handle) => (err, data) => {
  handleFn(err)
  dataFn(data || context)
}

exports.handle = handle
exports.using = using
