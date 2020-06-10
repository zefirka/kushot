require('module-alias/register');

const Tfs = require('./tfs/tfs');
const {bot, initBot} = require('./bot');
const pgAdapter = require('./tfs/adapter');
const config = require('./config');
const {
    start: startCron,
    restart: restartCron,
} = require('./crons');

module.exports = async function main() {
    const adapter = await pgAdapter();
    const fs = new Tfs({
        idsPool: [config.owner],
        bot,
        fs: adapter,
    });

    const botEvents = initBot(fs);

    botEvents.on('chats:change', () => {
        restartCron(fs);
    });

    startCron(fs);
};
