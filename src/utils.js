const {Pool} = require('pg');
const config = require('@root/config');

module.exports.query = (q) => new Promise((resolve, reject) => {
    const pool = new Pool(config.db);
    pool.query(q, (err, res) => {
        if (err) {
            pool.end();
            return reject(err);
        }

        resolve(res);
    });
});

module.exports.random = (items) => items[Math.floor(Math.random() * items.length)];
