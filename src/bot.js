const config = require('@config');

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(config.token, {polling: true});
bot.owner = config.owner;
bot.report = (msg) => bot.sendMessage(bot.owner, msg);

module.exports = bot;
