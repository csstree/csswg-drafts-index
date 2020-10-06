discovery.page.define('defs', {
    view: 'context',
    data: '(defs + prods).[name = #.id]',
    content: [
        'h1:props.name',
        {
            view: 'list',
            item: {
                view: 'definition',
                content: [
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
        }
    ]
});
