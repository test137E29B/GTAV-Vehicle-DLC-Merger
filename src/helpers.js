const chalk = require('chalk');
const { debug } = require('./config.js');

module.exports = {
  logInfo: function (message) {
    console.log(chalk.bgBlue(`❔ ${message}`));
  },
  logSuccess: function (message) {
    console.log(chalk.bgGreen(`✔️  ${message}`));
  },
  logDebug: function (message) {
    if (!debug) return;
    console.log(chalk.bgGray(`🤓 ${message}`));
  },
  logError: function (message) {
    console.log(chalk.bgRed(`❌ ${message}`));
  },
  logWarning: function (message) {
    console.log(chalk.bgYellow(`⚠️  ${message}`));
  },
  logLogo: function () {
    console.log(chalk.bgRed(`
|======================================|
|                                      |
|  Vehicle DLC Merger for RageMP / SP  |
|  Author: @Nameless#0001              |
|                                      |
|======================================|`));
  }
}