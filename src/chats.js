const {query} = require('@root/utils');

module.exports = {
    get: async() => {
        const {rows} = await query('SELECT * from kushot.chats');
        return rows || [];
    },
    set: async(id) => {
        return await query(`INSERT INTO kushot.chats (id) VALUES ('${id}')`);
    },
    remove: async(id) => {
        return await query(`DELETE FROM kushot.chats where id='${id}'`);
    },
};
