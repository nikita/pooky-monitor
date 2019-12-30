exports.proxiesExist = config =>
  Array.isArray(config.proxies) && config.proxies.length;

exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.formatProxy = proxy => {
  if (proxy && ["localhost", ""].indexOf(proxy) < 0) {
    proxy = proxy.replace(" ", "_");
    const proxySplit = proxy.split(":");
    if (proxySplit.length > 3)
      return (
        "http://" +
        proxySplit[2] +
        ":" +
        proxySplit[3] +
        "@" +
        proxySplit[0] +
        ":" +
        proxySplit[1]
      );
    else return "http://" + proxySplit[0] + ":" + proxySplit[1];
  } else return undefined;
};
