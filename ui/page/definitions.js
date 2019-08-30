discovery.page.define('definitions', {
    view: 'context',
    data: 'defs.[props.name = #.id]',
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
                    data: 'props',
                    value: {
                        view: 'switch',
                        content: [
                            { when: 'key = "value"', content: 'syntax:value' },
                            { content: 'pre:value' }
                        ]
                    }
                }
            ]
        }
    ]
}, {
    resolveLink: 'def'
});
