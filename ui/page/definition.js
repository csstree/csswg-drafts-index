discovery.page.define('definition', {
    view: 'context',
    data: 'pick(<id = #.id>)',
    content: [
        'h1:name',
        'struct'
    ]
}, {
    resolveLink: 'def'
});
