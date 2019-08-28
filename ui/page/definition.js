discovery.page.define('definition', {
    view: 'context',
    data: 'defs.pick(<id = #.id>)',
    content: [
        'badge:{ text: source.spec.title, href: source.spec.id.pageLink("spec"), color: "#fae2ec" }',
        'h1:name',
        'key-value'
    ]
}, {
    resolveLink: 'def'
});
