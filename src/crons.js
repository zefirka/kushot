const cron = require('node-cron');

const config = require('@config');

const chats = require('./chats');
const {bot} = require('./bot');

let task;

function start(fs) {
    task = cron.schedule(config.cronTab || '00 13 * * 1-5', async() => {
        const chatIds = await chats.get();

        chatIds.forEach(({id}) => {
            const file = fs.getRandomFile();
            bot.sendPhoto(id, file.content.file_id);
        });
    }, {
        scheduled: true,
        timezone: 'Europe/Moscow',
    });

    console.log('Cron started to run: ' + (process.env.CRON || '00 13 * * 1-5'));
}

function restart(fs) {
    if (task) {
        task.stop();
    }

    start(fs);
}

module.exports = {start, restart};
