require('module-alias/register');
const fuzz = require('fuzzball');
const {random} = require('./utils');

const D = {
    'да': {
        '100': {
            '0.5': 'пизда',
        },
    },
    'хочу кушать; я хочу кушать; кушать хочу; хочу кушоть; я хочу кушоть; кушоть хочу;': {
        '100': {
            '0.82': 'хватит кушать',
            '0.58': 'сколько можно кушоть',
        },
        '60': {
            '0.38': 'хватит кушать',
            '0.18': 'сколько можно кушоть',
        },
    },
};

module.exports = (text, dictionary) => {
    const dict = {};

    Object.keys(dictionary).forEach(key => {
        key.split(';').map(e => e.trim()).filter(Boolean).forEach(k => {
            dict[k] = dictionary[key];
        });
    });

    return Object.entries(dict).map(([template, description]) => {
        const mapped = Object.entries(description).map(([thresholdRatio, probs]) => {
            if (fuzz.ratio(template, text) >= Number(thresholdRatio)) {
                return probs;
            }
        }).filter(Boolean);

        if (mapped.length) {
            return [mapped[0]];
        }
    }).filter(Boolean).map((probs) => {
        return probs.map((prob) => {
            return Object.entries(prob).map(([thresholdProb, answer]) => {
                if (Math.random() <= Number(thresholdProb)) {
                    return random(answer.split(';').map(e => e.trim()).filter(Boolean));
                }
            }).filter(Boolean);
        }).filter(e => e.length);
    });
};

console.log(module.exports('хочу кушоть', D));
