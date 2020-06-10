const cron = require('node-cron');

const config = require('@config');

const chats = require('./chats');
const {bot} = require('./bot');

let task;

function start(fs) {
    task = cron.schedule(config.cronTab || '00 13 * * 1-5', async() => {
        const chatIds = await chats.get();
        chatIds.forEach(async({id}) => {
            const file = await fs.getRandomFile();
            console.log(file);
            console.log(id);
            return bot.sendPhoto(id, file.content.data.file_id);
        });
    }, {
        scheduled: true,
        timezone: 'Europe/Moscow',
    });
}

function restart(fs) {
    if (task) {
        task.stop();
    }

    start(fs);
}

module.exports = {start, restart};
