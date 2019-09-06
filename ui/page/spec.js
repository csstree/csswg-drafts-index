discovery.page.define('spec', {
    view: 'context',
    data: `specs.pick(<id = #.id>).($spec:$;{
        ...,
        defs: @.defs.[source.spec = $spec],
        idls: @.idls.[source.spec = $spec]
    })`,
    content: [
        'h1:props.title',
        'h5:file',
        {
            view: 'key-value',
            data: 'props',
            value: {
                view: 'switch',
                content: [
                    { when: 'key="status"', content: 'badge:{ text: value, color: value.color() }'},
                    { when: 'key in ["ed", "tr"]', content: { view:'pre', content: 'link:{ href: value, external: true }' } },
                    { when: 'value.isArray() and value', content: { view: 'ul', data: 'value', item: 'pre' } },
                    { content: 'pre:value' }
                ]
            }
        },
        {
            view: 'table',
            when: 'defs',
            data: 'defs.props',
            cols: {
                el: false,
                type: false,
                source: false,
                id: false,
                name: 'auto-link',
                value: 'syntax:value'
            }
        },
        {
            view: 'list',
            when: 'idls',
            data: 'idls',
            item: [
                'h5:source.spec.file + ":" + source.line',
                'source:{content}'
            ]
        }
    ]
}, {
    resolveLink: 'spec'
});
