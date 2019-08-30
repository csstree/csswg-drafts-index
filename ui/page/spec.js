discovery.page.define('spec', {
    view: 'context',
    data: 'specs.pick(<id = #.id>)',
    content: [
        'h1:props.title',
        {
            view: 'key-value',
            data: 'props',
            value: 'pre:value'
        },
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
