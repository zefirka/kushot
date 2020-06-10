const fuzz = require('fuzzball');
const {random} = require('./utils');

/** __MODEL__:
{
    's1; s2; ...sn': {
        '<ratio>': {
            '<probability>': 'a1; a2; a3',
        },
    },
};
*/

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
            return mapped;
        }
    }).filter(Boolean).map((probs) => {
        return probs.map((prob) => {
            return Object.entries(prob).map(([thresholdProb, answer]) => {
                if (Math.random() <= Number(thresholdProb)) {
                    console.log('answer', answer);
                    return random(answer.split(';').map(e => e.trim()).filter(Boolean));
                }
            }).filter(Boolean);
        }).filter(e => e.length);
    });
};
