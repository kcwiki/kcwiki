const Bot = require('nodemw')

const {fail} = require('./utils')

module.exports = (config, next) => {
  let user
  if (process.env.mw_name && process.env.mw_password) {
    user = {name: process.env.mw_name, password: process.env.mw_password}
  } else if (config.user && config.user.name && config.user.password && config.user.name !== '' && config.user.password !== '') {
    user = {name: config.user.name, password: config.user.password}
  }

  const concurrency = parseInt(process.env.mw_concurrency) || config.bot.concurrency
  config.bot.concurrency = concurrency

  const bot = new Bot(config.bot)
  bot.concurrency = concurrency

  if (user) {
    bot.logIn(user.name, user.password, (error, loginData) => {
      fail(error)
      if (loginData.result !== 'Success' || loginData.lgusername !== user.name) {
        fail(`mw: can't login as ${user.name}`)
      } else {
        console.log(`mw: logged in as ${user.name}`)
      }
      next(bot)
    })
  } else {
    next(bot)
  }
}
