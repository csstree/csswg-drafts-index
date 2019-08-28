discovery.page.define('spec', {
    view: 'context',
    data: '{ name: #.id, defs: .[file=#.id] }',
    content: [
        'h1:name',
        {
            view: 'table',
            data: 'defs',
            cols: {
                el: false,
                type: false,
                file: false,
                line: false,
                id: false
            }
        }
    ]
}, {
    resolveLink: 'spec'
});
