const path = require('path');

module.exports = {
    name: 'CSSWG drafts index',
    data: () => require('../index.js'),
    prepare: path.join(__dirname, 'prepare.js'),
    view: {
        basedir: __dirname,
        libs: {
            csstree: '../node_modules/css-tree/dist/csstree.js'
        },
        assets: [
            './page/common.css',
            './page/default.js',
            './page/definition.js',
            './page/spec.js',
            './view/key-value.css',
            './view/key-value.js',
            './view/sidebar.css',
            './view/sidebar.js',
            './view/syntax.css',
            './view/syntax.js'
        ]
    }
};
