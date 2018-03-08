const Bot = require('nodemw')

const {fail} = require('./utils')

module.exports = (config, user, next) => {
  const bot = new Bot(config)
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
