const config = require('@config');

const TelegramBot = require('node-telegram-bot-api');

const chats = require('./chats');
const EventEmitter = require('events');

const bot = new TelegramBot(config.token, {
    polling: true,
});

bot.owner = config.owner;
bot.report = (msg) => bot.sendMessage(bot.owner, msg);

const isCommand = (caption) => caption && caption.startsWith('/');
const withOwnerAuth = (fn) => {
    return (message, ...args) => {
        if (message.from.id !== config.owner) {
            bot.sendMessage(message.chat.id, 'ТЫ НЕ ПРОЙДЕШЬ!');
            return null;
        }
        return fn(message, ...args);
    };
};

let fs;

const emitter = new EventEmitter();

const initBot = (incomingFs) => {
    fs = incomingFs;
    bot.on('polling_error', console.error);

    bot.on('message', (message) => {
        console.log('message', message);
        const {caption, text} = message;
        const command = caption || text;

        if (isCommand(command)) {
            const commandRx = /\/(\w+)\s*(\((.+)\))?/g;
            const [, commandName, , args] = commandRx.exec(command);
            const handler = commands[commandName];

            if (handler) {
                return handler(message, args ? args.split(',').map(e => e.trim()) : []);
            }
        }
    });

    return emitter;
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
    const image = await fs.getFile(fid);

    if (image) {
        if (image.content.type === 'tmp') {
            await fs.remove(image.content.file.file_unique_id);
            await fs.uploadByTgFile(image.content.file);
            return bot.sendMessage(from, 'Твою кортинку заопрувили!');
        } else {
            bot.report('Уже заапрувлен');
        }
    } else {
        return bot.report('Такого файла нет');
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
    await fs.clear();
    bot.report('Готово');
};

const onAddChat = async(message, [chatId, name]) => {
    await chats.set(chatId, name);
    emitter.emit('chats:change');
    bot.report('Готово');
};

const setCron = async(message, [cron]) => {
    await chats.setCron(message.chat.id, cron);
    emitter.emit('chats:change');
    bot.sendMessage(message.chat.id, 'Готово');
};

const random = async(message) => {
    const file = await fs.getRandomFile();
    await bot.sendPhoto(message.chat.id || message.from.id, file.content.data.file_id);
};

const onRemoveChat = async(message, [chatId]) => {
    await chats.remove(chatId);
    emitter.emit('chats:change');
    bot.report('Чат удален, все ок');
};

const onShowChats = async() => {
    bot.report(JSON.stringify(await chats.get()));
};

const onShowChatId = async(message) => {
    bot.report(JSON.stringify(message.chat));
};

const commands = {
    'upload': onUpload,
    'approve': withOwnerAuth(onApprove),
    'disapprove': withOwnerAuth(onDisapprove),
    'report': withOwnerAuth(onReport),
    'files': withOwnerAuth(onAll),
    'addChat': withOwnerAuth(onAddChat),
    'removeChat': withOwnerAuth(onRemoveChat),
    'chats': withOwnerAuth(onShowChats),
    'chatId': withOwnerAuth(onShowChatId),
    'setCron': withOwnerAuth(setCron),
    'dangerously_delete_all_WARNING': withOwnerAuth(onDeleteAll),
    'random': random,
};

module.exports.bot = bot;
module.exports.initBot = initBot;
