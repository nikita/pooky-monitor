const config = require("./config");
const { WebhookClient, RichEmbed } = require("discord.js");
const rp = require("request-promise");
const cheerio = require("cheerio");
const logger = require("./classes/logger");
const { sleep, formatProxy, proxiesExist } = require("./classes/utils");

class PookyMonitor {
  constructor(id, proxy = "localhost") {
    this.id = id;
    this.proxy = formatProxy(proxy);

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
    this.lastStatus = false;
    this.pookyFound = false;
    this.supremeRegion = "";
  }

  log = msg => logger(`[Task ${this.id}] ${msg}`);

  async getSupremeRegion() {
    try {
      const response = await this.session.get(
        `https://www.supremenewyork.com?p=${new Date().getTime()}`
      );
      const $ = cheerio.load(response, { xmlMode: false });

      this.supremeRegion = $("body").hasClass("eu") ? "🇬🇧" : "🇺🇸";
    } catch (err) {
      this.log(`getSupremeRegion() Error : ${err}`, "error");
      await sleep(config.retryDelay);
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
          this.hash = this.pookyUrl.match(/pooky.min.*(?=\.)/);
          this.pookyFound = true;
          return;
        }
      }
      // Should only get hit when no pooky found.
      this.pookyFound = false;
    } catch (err) {
      this.log(`checkForPooky() Error : ${err}`, "error");
      await sleep(config.retryDelay);
    }
  }

  async monitorPooky() {
    this.log(
      `Monitoring pooky ${
        this.proxy ? `with proxy ${this.proxy}` : "without proxy"
      }`
    );

    // Get our supreme region for this task.
    await this.getSupremeRegion();

    while (true) {
      this.checkForPooky();

      // Pooky now on.
      if (this.pookyFound && !this.lastStatus) {
        this.lastStatus = true;

        // Send discord embed to webhook if enabled
        if (config.discord.enabled) {
          this.sendWebhook(this.pookyUrl, this.tohru, this.hash);
        }

        this.log(
          `Pooky found URL: ${this.pookyUrl} Tohru: ${this.tohru} Hash: ${this.hash}`
        );
        // Pooky now off.
      } else if (!this.pookyFound && this.lastStatus) {
        this.lastStatus = false;
        this.tohru = "";
        this.pookyUrl = "";
      }
      await sleep(config.monitorDelay);
    }
  }

  sendWebhook(url, tohru, hash) {
    const webhookSplit = config.discord.webhook_url.match(
      /discordapp.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/
    );
    const webhook = new WebhookClient(webhookSplit[1], webhookSplit[2]);

    webhook.send(
      new RichEmbed()
        .setColor("#ABC2D2")
        .setAuthor("Pooky — Monitor", "https://i.imgur.com/7ShkUT5.png")
        .setDescription("A new pooky script was detected on Supreme.")
        .addField("URL", url, true)
        .addField("Tohru", tohru, true)
        .setTimestamp()
        .setFooter(`Hash: ${hash} | Region: ${this.supremeRegion}`)
    );
  }
}

const main = () => {
  // Check if we have any proxies.
  if (proxiesExist(config)) {
    for (const [i, proxy] of config.proxies.entries()) {
      new PookyMonitor(i, proxy).monitorPooky();
    }
  } else {
    new PookyMonitor(0).monitorPooky();
  }
};

main();
