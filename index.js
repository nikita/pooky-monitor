const Discord = require("discord.js");
const rp = require("request-promise");
const cheerio = require("cheerio");
const logger = require("./classes/logger");
const config = require("./config");

class PookyMonitor {
  constructor(id, proxy = "localhost") {
    this.id = id;
    this.proxy = this.formatProxy(proxy);

    this.session = rp.defaults({
      headers: {
        "Accept-Language": "en-US,en,en-GB;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "Cache-Control": "no-cache"
      },
      proxy: this.proxy,
      timeout: 5000
    });

    this.tohru = "";
    this.pookyUrl = "";
    this.pookyFound = false;
    this.supremeRegion;
  }

  async getSupremeRegion() {
    try {
      const response = await this.session.get(
        `https://www.supremenewyork.com?p=${new Date().getTime()}`
      );
      const $ = cheerio.load(response, { xmlMode: false });

      this.supremeRegion = $("body").hasClass("eu") ? "🇬🇧" : "🇺🇸";
    } catch (err) {
      this.log(`getSupremeRegion() Error : ${err}`, "error");
      // Sleep for 5 seconds.
      await this.sleep(5000);
    }
  }

  async checkForPooky() {
    try {
      const response = await this.session.get(
        `https://www.supremenewyork.com?p=${new Date().getTime()}`
      );
      const $ = cheerio.load(response, { xmlMode: false });
      const scripts = $("script").get();

      for (let script of scripts) {
        // Check for tohru.
        if (
          script.children[0] &&
          script.children[0].data &&
          script.children[0].data.includes("supremetohru")
        ) {
          this.tohru = script.children[0].data.match(/(?<=")[^"]+(?=")/)[0];
        }

        // Check for pooky url.
        if (
          script.attribs.src != null &&
          script.attribs.src.includes("pooky")
        ) {
          this.pookyUrl = `https://${script.attribs.src.replace("//", "")}`;
          this.pookyFound = true;
          return;
        }
      }
      // Should only get hit when no pooky found.
      this.pookyFound = false;
    } catch (err) {
      log(`checkForPooky() Error : ${err}`, "error");
      // Sleep for 5 seconds.
      await this.sleep(5000);
    }
  }

  async monitorPooky() {
    this.proxy
      ? this.log(`Monitoring pooky with proxy ${this.proxy}`)
      : this.log(`Monitoring pooky without proxy`);

    let lastStatus = false;

    // Get our supreme region for this task.
    await this.getSupremeRegion();

    while (true) {
      this.checkForPooky();

      // Pooky now on.
      if (this.pookyFound && !lastStatus) {
        lastStatus = true;
        if (config.discord.enabled) {
          this.sendWebhook(this.pookyUrl, this.tohru);
        }
        // Pooky now off.
      } else if (!this.pookyFound && lastStatus) {
        lastStatus = false;
        this.tohru = "";
        this.pookyUrl = "";
      }
      // Sleep for 1 second.
      await this.sleep(1000);
    }
  }

  sendWebhook(url, tohru) {
    const webhookSplit = config.discord.webhook_url.match(
      /discordapp.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/
    );
    const webhook = new Discord.WebhookClient(webhookSplit[1], webhookSplit[2]);

    const color = "#ABC2D2";
    const hash = url.match(/pooky.min.*(?=\.)/);
    webhook.send(
      new Discord.RichEmbed()
        .setColor(color)
        .setAuthor("Pooky — Monitor", "https://i.imgur.com/7ShkUT5.png")
        .setDescription("A new pooky script was detected on Supreme.")
        .addField("URL", url, true)
        .addField("Tohru", tohru, true)
        .setTimestamp()
        .setFooter(`Hash: ${hash} | Region: ${this.supremeRegion}`)
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatProxy(proxy) {
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
  }

  log(msg) {
    logger(`[Task ${this.id}] ${msg}`);
  }
}

const main = () => {
  // Check if we have any proxies.
  if (Array.isArray(config.proxies) && config.proxies.length) {
    for (const [i, proxy] of config.proxies.entries()) {
      const pookyMonitor = new PookyMonitor(i, proxy);
      pookyMonitor.monitorPooky();
    }
  } else {
    const pookyMonitor = new PookyMonitor();
    pookyMonitor.monitorPooky();
  }
};

main();
