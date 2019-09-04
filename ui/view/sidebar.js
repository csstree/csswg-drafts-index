discovery.view.define('sidebar', {
    view: 'tabs',
    name: 'splitBy',
    tabs: [
        { value: 'byspec', text: 'By spec' },
        { value: 'byentry', text: 'Index' }
    ],
    content: {
        view: 'content-filter',
        content: [
            {
                view: 'switch',
                content: [
                    {
                        when: '#.splitBy="byspec"',
                        content: {
                            view: 'list',
                            emptyText: 'No matches',
                            data: `
                                specs
                                .sort(<props.title>)
                                .($spec: $;{
                                    ...,
                                    defs: @.defs
                                        .[source.spec = $spec and (no #.filter or props.name ~= #.filter)]
                                        .sort(<props.name>)
                                })
                                .[defs.size() or (#.filter and props.title ~= #.filter)]
                            `,
                            item: {
                                view: 'toc-section',
                                header: [
                                    {
                                        view: 'auto-link',
                                        content: 'text-match:{ text, match: #.filter }'
                                    },
                                    {
                                        view: 'pill-badge',
                                        data: '{ text: defs.size() }'
                                    }
                                ],
                                content: {
                                    view: 'list',
                                    emptyText: false && 'No definitions',
                                    data: 'defs',
                                    item: [
                                        {
                                            view: 'auto-link',
                                            content: 'text-match:{ text, match: #.filter }'
                                        },
                                        'badge:{ text: type, color: "#d8e1f3" }'
                                    ]
                                }
                            }
                        }
                    },
                    {
                        when: '#.splitBy="byentry"',
                        content: {
                            view: 'list',
                            data: `
                                defs
                                    .[no #.filter or props.name ~= #.filter]
                                    .group(<props.name>)
                                    .({
                                        id: key,
                                        type: value.type,
                                        name: value.props.name.pick(),
                                        count: value.size()
                                    })
                                    .sort(<name>)
                            `,
                            item: [
                                {
                                    view: 'link',
                                    data: `{
                                        text: name,
                                        href: name.pageLink("defs"),
                                        match: #.filter
                                    }`,
                                    content: 'text-match'
                                },
                                {
                                    view: 'pill-badge',
                                    when: 'count > 1',
                                    data: '{ text: count }'
                                },
                                {
                                    view: 'inline-list',
                                    data: 'type',
                                    item: 'badge:{ text: $, color: "#d8e1f3" }'
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}, {
    tag: false
});
