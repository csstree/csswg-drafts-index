discovery.page.define('spec', {
    view: 'context',
    data: 'specs.pick(<id = #.id>)',
    content: [
        'h1:props.title',
        'key-value:props',
        {
            view: 'table',
            data: '$spec:$; #.data.defs.[source.spec = $spec].props',
            cols: {
                el: false,
                type: false,
                source: false,
                id: false,
                name: 'auto-link',
                value: 'syntax:value'
            }
        }
    ]
}, {
    resolveLink: 'spec'
});
