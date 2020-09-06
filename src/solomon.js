const axios = require('axios');
const jwt = require('./jwt');
const bot = require('./bot');

let token = null;

const auth = async() => {
    const sign = await jwt.getSign();
    try {
        const {data} = await axios({
            url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                jwt: sign,
            },
        });
        return data.iamToken;
    } catch (err) {
        console.log('err', err);
        throw err;
    }
};

const write = async(labels, value, type, withFail = false) => {
    if (token === null) {
        token = await auth();
    }

    try {
        const ts = new Date().toISOString();
        await axios({
            url: 'https://monitoring.api.cloud.yandex.net/monitoring/v2/data/write',
            params: {
                folderId: 'b1g6f4ujk4avpi4ahodf',
                service: 'custom',
            },
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: {
                'ts': ts,
                'metrics': [
                    {
                        'name': 'kushot',
                        'labels': labels,
                        'type': type,
                        'ts': ts,
                        'value': value,
                        'timeseries': [
                            {
                                ts,
                                value,
                            },
                        ],
                    },
                ],
            },
        });
    } catch (error) {
        token = null;
        if (withFail) {
            bot.bot.report(JSON.stringify({
                message: error.message,
                stack: error.stack,
            }, null, 2));
        } else {
            write(labels, value, type, true);
        }
    }
};

module.exports.auth = auth;
module.exports.write = write;
