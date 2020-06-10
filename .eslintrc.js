const path = require('path');
const pkg = require('./package.json');

module.exports = {
    'extends': [
        'nodejs',
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:node/recommended',
        'standard',
    ],
    'plugins': [
        'promise',
        'import',
        'node'
    ],
    'env': {
        'browser': false,
        'node': true,
        'es6': true,
    },
    'globals': {
        '__DEV__': false,
        '__TEST__': false,
        '__PROD__': false,
        '__COVERAGE__': false,
        '__CLIENT__': false,
        '__SERVER__': false,
        'describe': false,
        'it': false,
        'expect': false,
        'console': false,
        'setInterval': false,
    },

    'settings': {
        'import/resolver': {
            'alias': Object.entries(pkg._moduleAliases).map(([alias, pathToAlias]) => [
                alias,
                path.resolve(__dirname, pathToAlias),
            ]),
        }
    },

    'rules': {
        'no-console': 0,
        'no-process-exit': 0,
        'semi': [
            'error',
            'always',
        ],
        'no-useless-constructor': 0,
        'no-duplicate-imports': 0,
        'key-spacing': 0,
        'max-len': [
            2,
            140,
            2,
        ],
        'object-curly-spacing': [
            2,
            'never',
        ],
        'indent': [
            'error',
            4,
        ],
        'space-before-function-paren': [
            'error',
            'never',
        ],
        'comma-dangle': [
            'error',
            {
                'arrays': 'always-multiline',
                'imports': 'always-multiline',
                'exports': 'always-multiline',
                'functions': 'always-multiline',
                'objects': 'always-multiline',
            },
        ],
        'import/no-unresolved': [2, {commonjs: true, amd: false}],
        'node/no-missing-require': 0,
        'node/shebang': 0,
    },
};

