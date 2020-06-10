const {query} = require('@root/utils');

module.exports = {
    get: async() => {
        const {rows} = await query('SELECT * from kushot.chats');
        return rows || [];
    },
    set: async(id, name = 'unknown') => {
        return await query(`INSERT INTO kushot.chats (id, name) VALUES ('${id}', '${name}')`);
    },
    setCron: async(id, cron) => {
        return await query(`UPDATE kushot.chats set cron='${cron}' where id='${id}'`);
    },
    remove: async(id) => {
        return await query(`DELETE FROM kushot.chats where id='${id}'`);
    },
};
