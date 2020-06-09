const {Pool} = require('pg');
const config = require('@root/config');
const pool = new Pool(config.db);

module.exports.query = (q) => new Promise((resolve, reject) => {
    pool.query(q, (err, res) => {
        if (err) {
            pool.end();
            return reject(err);
        }

        resolve(res);
    });
});
