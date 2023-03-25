const TelegramBot = require("node-telegram-bot-api");

module.exports = new TelegramBot(process.env.TELEGRAM_TOKEN);
