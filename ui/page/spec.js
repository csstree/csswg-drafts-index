discovery.page.define('spec', {
    view: 'context',
    data: '{ name: #.id, defs: defs.[source.spec.id=#.id] }',
    content: [
        'h1:name',
        {
            view: 'table',
            data: 'defs',
            cols: {
                el: false,
                type: false,
                source: false,
                id: false,
                name: 'auto-link',
                value: 'syntax:{syntax:$.value}'
            }
        }
    ]
}, {
    resolveLink: 'spec'
});
