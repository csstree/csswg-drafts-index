discovery.page.define('def', {
    view: 'context',
    data: 'defs.pick(<id = #.id>)',
    content: [
        `badge:{
            text: source.spec.props.title,
            href: source.spec.id.pageLink("spec"),
            color: "#fae2ec"
        }`,
        'h1:props.name',
        {
            view: 'key-value',
            data: 'props',
            value: {
                view: 'switch',
                content: [
                    { when: 'key in ["value", "newValues"]', content: 'syntax:value' },
                    { content: 'pre:value' }
                ]
            }
        },
        'h5:"Defined in: " + source.spec.file + " on line " + source.line',
        {
            view: 'context',
            data: '#.data.defs.[props.name = @.props.name and $ != @].source.spec',
            content: {
                view: 'context',
                when: 'size()',
                content: [
                    'h5:"Also defined in:"',
                    {
                        view: 'ul',
                        item: 'auto-link'
                    }
                ]
            }
        }
    ]
}, {
    resolveLink: 'def'
});
