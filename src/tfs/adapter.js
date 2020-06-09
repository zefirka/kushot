const {Pool} = require('pg');

const config = require('@root/config');

console.log('config.db', config.db);
const pool = new Pool(config.db);

const query = (q) => new Promise((resolve, reject) => {
    pool.query(q, (err, res) => {
        if (err) {
            pool.end();
            return reject(err);
        }

        resolve(res);
    });
});

module.exports = async() => {
    let {rows: data} = await query('SELECT * from kushot.files');

    const sync = async() => {
        const res = await query('SELECT * from kushot.files');
        data = res.rows || [];
    };

    return {
        set: async(id, data) => {
            await query(`INSERT INTO kushot.files (id, content) VALUES ('${id}', '${JSON.stringify(data)}')`);
            await sync();
        },
        remove: async(id) => {
            await query(`DELETE FROM kushot.files where id='${id}'`);
            await sync();
        },
        get: async(id) => {
            return data.find(item => item.id === id);
        },
        list: async() => {
            return data;
        },
        clear: async() => {
            await query(`DELETE from kushot.files`);
            await sync();
        },
    };
};
