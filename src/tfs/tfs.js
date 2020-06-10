const path = require('path');
const fs = require('fs');
const axios = require('axios');
const {random} = require('@root/utils');

module.exports = class Tafs {
    constructor(options) {
        this.bot = options.bot;
        this.ids = options.idsPool;

        this.fsAdapter = options.fs;

        this._id = 0;
    }

    list() {
        return this.fsAdapter.list();
    }

    async getRandomFile() {
        const list = await this.fsAdapter.list();
        return random(list);
    }

    get sendId() {
        const id = this.ids[this._id];
        this._id = (this._id + 1) % this.ids.length;
        return id;
    }

    async put(id, data) {
        this.fsAdapter.set(id, data);
    }

    async upload(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }

        const result = await this.bot.sendPhoto(this.sendId, filePath);

        const {file_id: fid, file_unique_id: fuid} = result.photo.pop();
        const link = await this.bot.getFileLink(fid);

        return this.fsAdapter.set(fuid, {
            type: path.extname(filePath),
            data: {
                file_id: fid,
                file_unique_id: fuid,
                link: link,
            },
        });
    }

    async uploadByTgFile(file) {
        const link = await this.bot.getFileLink(file.file_id);

        return this.fsAdapter.set(file.file_unique_id, {
            type: path.extname(link),
            data: {
                file_unique_id: file.file_unique_id,
                file_id: file.file_id,
                link: link,
            },
        });
    }

    async uploadByUrl(url) {
        const fpath = `/tmp/f_${url.split('/').pop()}`;
        const writer = fs.createWriteStream(fpath);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const result = await this.upload(fpath);

        fs.unlinkSync(fpath);

        return result;
    }

    getFile(path) {
        return this.fsAdapter.get(path);
    }

    remove(path) {
        return this.fsAdapter.remove(path);
    }

    clear() {
        return this.fsAdapter.clear();
    }
};
