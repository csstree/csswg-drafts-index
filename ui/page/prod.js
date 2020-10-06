discovery.page.define('prod', {
    view: 'context',
    data: 'prods.pick(<id = #.id>)',
    content: [
        `badge:{
            text: source.spec.props.title,
            href: source.spec.id.pageLink("spec"),
            color: "#fae2ec"
        }`,
        'h1:"<" + name + ">"',
        'syntax:value',
        'h5:"Defined in: " + source.spec.file + " on line " + source.line',
        {
            view: 'context',
            data: '#.data.prods.[name = @.name and $ != @].source.spec',
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
});
