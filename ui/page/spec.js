discovery.page.define('spec', {
    view: 'context',
    data: `specs.pick(<id = #.id>).($spec:$;{
        ...,
        defs: @.defs.[source.spec = $spec],
        idls: @.idls.[source.spec = $spec]
    })`,
    content: [
        'h1:props.title',
        {
            view: 'definition',
            content: {
                view: 'key-value',
                data: 'props',
                limit: 10,
                value: {
                    view: 'switch',
                    content: [
                        { when: 'key="status"', content: 'badge:{ text: value, color: value.color() }'},
                        { when: 'key in ["ed", "tr"]', content: { view:'pre', content: 'link:{ href: value, external: true }' } },
                        { when: 'value.isArray() and value', content: { view: 'ul', data: 'value', item: 'pre' } },
                        { content: 'pre:value' }
                    ]
                }
            }
        },
        'h2:"Properties"',
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
            view: 'context',
            data: 'idls',
            whenData: true,
            content: [
                'h2:"Interfaces"',
                {
                    view: 'list',
                    item: {
                        view: 'definition',
                        content: 'source:{content}'
                    }
                }
            ]
        }
    ]
});
