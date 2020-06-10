require('module-alias/register');

const fs = require('fs');
const path = require('path');
const Tfs = require('./src/tfs/tfs');
const pgAdapter = require('./src/tfs/adapter');
const config = require('./src/config');
const {bot} = require('./src/bot');

async function upload() {
    const adapter = await pgAdapter();
    const tfs = new Tfs({
        idsPool: [config.owner],
        bot,
        fs: adapter,
    });

    const files = fs.readdirSync('./imgs');

    for (const file of files) {
        console.log('uploading file', file);
        await tfs.upload(path.resolve(__dirname, 'imgs', file));
    }
}

upload();
