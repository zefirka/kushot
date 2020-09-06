const jose = require('node-jose');
const keyF = require('../key.json');
const key = keyF.private_key;

const serviceAccountId = 'ajeq9fvqkirhsv3c5b29';
const keyId = 'aje5nk164p4n05nlvg0o';
const now = Math.floor(new Date().getTime() / 1000);

const payload = {
    aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
    iss: serviceAccountId,
    iat: now,
    exp: now + 3600,
};

module.exports.getSign = () => {
    return jose.JWK.asKey(key, 'pem', {kid: keyId, alg: 'PS256'})
        .then((result) => {
            return jose.JWS.createSign({
                format: 'compact',
            }, result)
                .update(JSON.stringify(payload))
                .final();
        });
};
