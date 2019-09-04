discovery.page.define('spec', {
    view: 'context',
    data: 'specs.pick(<id = #.id>)',
    content: [
        'h1:props.title',
        {
            view: 'key-value',
            data: 'props',
            value: {
                view: 'switch',
                content: [
                    { when: 'key="status"', content: 'badge:{ text: value, color: value.color() }'},
                    { when: 'value.isArray()', content: { view: 'ul', data: 'value', item: 'pre' } },
                    { content: 'pre:value' }
                ]
            }
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
