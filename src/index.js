require('module-alias/register');

const Tfs = require('./tfs/tfs');
const bot = require('./bot');
const pgAdapter = require('./tfs/adapter');
const config = require('./config');

const isCommand = (caption) => caption && caption.startsWith('/');

let fs = null;

const initBot = () => {
    bot.on('polling_error', console.error);

    bot.on('message', (message) => {
        console.log('message', message);
        const {caption, text} = message;
        const command = caption || text;

        if (isCommand(command)) {
            const commandRx = /\/(\w+)\s*(\((.+)\))?/g;
            const [, commandName, , args] = commandRx.exec(command);
            console.log('commandName', commandName);
            console.log('args', args);
            const handler = commands[commandName];
            if (handler) {
                return handler(message, args ? args.split(',').map(e => e.trim()) : []);
            }
        }
    });
};

const onUpload = async(message) => {
    const from = message.from.id;

    if (!message.photo) {
        return bot.sendMessage(from, 'Картинки то нет! Оло!');
    }

    const file = message.photo.pop();

    await fs.put(file.file_unique_id, {
        type: 'tmp',
        file,
    });

    return bot.sendPhoto(bot.owner, file.file_id, {
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': [
                [`/approve (${file.file_unique_id}, ${from})`],
                [`/disapprove (${file.file_unique_id})`, `/report (${file.file_unique_id}, ${from})`],
            ],
        },
    });
};

const onApprove = async(message, [fid, from]) => {
    console.log('message', message);
    console.log('fid', fid);

    const image = await fs.getFile(fid);

    if (image) {
        await fs.remove(image.content.file.file_unique_id);
        await fs.uploadByTgFile(image.content.file);
        return bot.sendMessage(from, 'Твою кортинку заопрувили!');
    }
};

const onDisapprove = async(message, [fid]) => {
    const image = await fs.getFile(fid);

    if (image) {
        await fs.remove(fid);
    }
};

const onReport = async(message, [fid, from]) => {
    await onDisapprove(message, [fid]);

    bot.sendMessage(from, 'Ты че пес?! Нельзя такие кортинки!');
};

const onAll = async() => {
    const list = await fs.list();

    if (list.length) {
        list.forEach((file) => {
            console.log('file', file);
        });
        bot.report(`Всего файлов ${list.length}`);
    } else {
        bot.report('Все пусто!');
    }
};

const onDeleteAll = async() => {
    return await fs.clear();
};

const commands = {
    'upload': onUpload,
    'approve': onApprove,
    'disapprove': onDisapprove,
    'report': onReport,
    'all': onAll,
    'dangerously_delete_all_WARNING': onDeleteAll,
};

module.exports = async function main() {
    const adapter = await pgAdapter();
    fs = new Tfs({
        idsPool: [config.owner],
        bot,
        fs: adapter,
    });

    initBot(fs);
};

// cron.schedule(process.env.CRON || '00 13 * * 1-5', () => {
//     CHAT_IDS.forEach(chatId => {
//         const rando = (Math.random() * TOTAL >> 0)
//         bot.sendPhoto(chatId, `./imgs/${rando}.jpg`);
//     })
// }, {
//     scheduled: true,
//     timezone: 'Europe/Moscow'
// })

// console.log('Cron started to run: ' + (process.env.CRON || '00 13 * * 1-5'));

// express().get('/', (req, res) => res.send('Alive')).listen(PORT, () => console.log(`Listening on ${PORT}`))

