const dotenv = require('dotenv');
dotenv.config();

const config = {
    port: process.env.PORT,
    token: process.env.BOT_TOKEN,
    owner:  Number(process.env.OWNER),

    db: {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT || 5432,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
    },

    socksHost: process.env.SOCKS5_HOST,
    socksPort: Number(process.env.SOCKS5_PORT),
};

module.exports = config;
