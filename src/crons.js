const cron = require('node-cron');

const config = require('@config');
const solomon = require('./solomon');

const chatsApi = require('./chats');
const {bot} = require('./bot');

let tasks = [];

let daysWithouJewishTricks = 0;

async function start(fs) {
    const chats = await chatsApi.get();

    chats.forEach((chat) => {
        const task = cron.schedule(chat.cron || config.cronTab, async() => {
            const file = await fs.getRandomFile();
            daysWithouJewishTricks += 1;

            solomon.write({
                sensor: 'uptime.days',
                chatId: chat.id,
            }, daysWithouJewishTricks, 'COUNTER');
            return bot.sendPhoto(chat.id, file.content.data.file_id);
        }, {
            scheduled: true,
            timezone: 'Europe/Moscow',
        });

        console.log(`Setted cron for ${chat.id} at ${chat.cron || config.cronTab}`);

        tasks.push(task);
    });
}

async function restart(fs) {
    if (tasks.length) {
        tasks.forEach((task) => task.stop());
    }

    await start(fs);
}

module.exports = {start, restart};
