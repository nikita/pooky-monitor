const chalk = require("chalk");
const moment = require("moment");

module.exports = function logger(msg, type) {
  const types = {
    log: chalk.white,
    debug: chalk.magentaBright,
    success: chalk.greenBright,
    error: chalk.redBright
  };

  const momentOptions = {
    log: "LOG",
    debug: "DBG",
    success: "LOG",
    error: "ERR"
  };

  const currentTime = moment();
  const formattedDate = currentTime.format("M/DD/YYYY");
  const formattedTime = currentTime.format("H:mm:ss.SSS");

  if (type) {
    console.log(
      types[type](
        `[${formattedDate}] [${formattedTime}] [${momentOptions[type]}] - ${msg}`
      )
    );
  } else {
    console.log(`[${formattedDate}] [${formattedTime}] - ${msg}`);
  }
};
