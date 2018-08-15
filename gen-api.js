const { writeJsonSync } = require('./lib/utils')

writeJsonSync(
  `${__dirname}/data/api/api_start2.json`,
  require(`${__dirname}/data/api/api_start2.raw.json`).api_data,
  false
)
