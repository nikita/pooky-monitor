const config = require("./config");
const { proxiesExist } = require("./classes/utils");
const PookyMonitor = require("./classes/PookyMonitor");

const main = () => {
  // Check if we have any proxies.
  if (proxiesExist(config)) {
    for (const [i, proxy] of config.proxies.entries()) {
      new PookyMonitor(i, proxy, config).monitorPooky();
    }
  } else {
    new PookyMonitor(0, "localhost", config).monitorPooky();
  }
};

main();
