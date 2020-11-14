const definitionConfig = {
    view: 'definition',
    content: {
        view: 'key-value',
        data: 'props',
        value: {
            view: 'switch',
            content: [
                { when: 'key in ["value", "newValues"]', content: 'syntax:value' },
                { content: 'pre:value' }
            ]
        }
    }
};

discovery.page.define('def', {
    view: 'context',
    data: 'defs.pick(<id = #.id>)',
    content: [
        {
            view: 'page-header',
            prelude: `badge:{
                text: source.spec.props.title,
                href: source.spec.id.pageLink("spec"),
                color: "rgba(237, 177, 9, 0.35)"
            }`,
            content: 'h1:props.name'
        },
        definitionConfig,
        {
            view: 'context',
            data: '#.data.defs.[props.name = @.props.name and $ != @]',
            whenData: true,
            content: [
                'h2:"Also defined in:"',
                {
                    view: 'list',
                    item: definitionConfig
                }
            ]
        }
    ]
});
