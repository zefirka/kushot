const express = require('express');
const cron = require('node-cron')
const PORT = process.env.PORT || 5000
const TOKEN = process.env.TOKEN;
const CHAT_IDS = (process.env.CHAT_IDS || '').split(',').map(Number)
const OWNER = Number(process.env.OWNER);


const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(TOKEN, {
    polling: true
});

bot.on("polling_error", (err) => console.log(err));

bot.onText(/\/kushot/, (msg) => {
    const chatId = msg.chat.id;
    const from = msg.from.id;

    if (CHAT_IDS.indexOf(chatId) >= 0) {
        const rando = (Math.random() * 19 >> 0)
        bot.sendPhoto(chatId, `./imgs/${rando}.jpg`);
    } else {
        if (from === OWNER) {
            bot.sendMessage(OWNER, chatId);
        } else {
            bot.sendMessage(chatId, 'Попроси @zeffirsky включить меня');
        }
    }    
});

cron.schedule(process.env.CRON || '55 00 * * 1-5', () => {
    CHAT_IDS.forEach(chatId => {
        const rando = (Math.random() * 19 >> 0)
        bot.sendPhoto(chatId, `./imgs/${rando}.jpg`);
    })
}, {
    scheduled: true,
    timezone: 'Europe/Moscow'
})

express().get('/', (req, res) => res.send('Alive')).listen(PORT, () => console.log(`Listening on ${PORT}`))


