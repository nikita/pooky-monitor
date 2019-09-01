require("dotenv").config();

const Discord = require("discord.js");
const webhookSplit = process.env.WEBHOOK_URL.match(
  /discordapp.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/
);
const webhook = new Discord.WebhookClient(webhookSplit[1], webhookSplit[2]);

const sendWebhook = (url, tohru, region) => {
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
      .setFooter(`Hash: ${hash} | Region: ${region}`)
  );
};

const main = () => {
  sendWebhook(
    "https://d17ol771963kd3.cloudfront.net/assets/pooky.min.bf511c63b0cb9dbdbf3f.js",
    "696d1bdc2500351afaa2443e86f3ad5d19a460f5d891e67691dd85e1ab4a40b54b4b98e75facbe45203749bcb9442c5c",
    "🇬🇧"
  );
};

main();
