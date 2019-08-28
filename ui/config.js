const path = require('path');

module.exports = {
    name: 'CSSWG drafts index',
    data: () => require('../index.js'),
    prepare: path.join(__dirname, 'prepare.js'),
    view: {
        basedir: __dirname,
        assets: [
            './page/definition.js',
            './page/spec.js',
            './view/sidebar.js'
        ]
    }
};
