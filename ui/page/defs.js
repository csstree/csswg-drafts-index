discovery.page.define('defs', {
    view: 'context',
    data: '(defs + prods).[name = #.id]',
    content: [
        'h1:props.name',
        {
            view: 'list',
            item: [
                {
                    view: 'h4',
                    content: [
                        'auto-link:source.spec',
                        'badge:{ text: type, color: "#cee4ab" }'
                    ]
                },
                {
                    view: 'key-value',
                    when: 'props',
                    data: 'props',
                    value: {
                        view: 'switch',
                        content: [
                            { when: 'key in ["value", "newValues"]', content: 'syntax:value' },
                            { content: 'pre:value' }
                        ]
                    }
                },
                {
                    view: 'syntax',
                    when: 'type="prod"',
                    data: 'value'
                }
            ]
        }
    ]
});
