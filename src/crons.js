const cron = require('node-cron');

const config = require('@config');

const chatsApi = require('./chats');
const {bot} = require('./bot');

let tasks = [];

async function start(fs) {
    const chats = await chatsApi.get();
    console.log('chats', chats);

    chats.forEach((chat) => {
        const task = cron.schedule(chat.cron || config.cronTab, async() => {
            const file = await fs.getRandomFile();
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
