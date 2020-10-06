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
            './page/def.js',
            './page/def.css',
            './page/defs.js',
            './page/prod.js',
            './page/spec.js',
            './view/def.css',
            './view/def.js',
            './view/definition.css',
            './view/definition.js',
            './view/github-link.css',
            './view/github-link.js',
            './view/key-value.css',
            './view/key-value.js',
            './view/pre.css',
            './view/pre.js',
            './view/sidebar.css',
            './view/sidebar.js',
            './view/spec-location.css',
            './view/spec-location.js',
            './view/syntax.css',
            './view/syntax.js'
        ]
    }
};
