discovery.view.define('sidebar', {
    view: 'tabs',
    name: 'splitBy',
    beforeTabs: 'text:"Definitions"',
    tabs: [
        { value: 'byspec', text: 'By spec' },
        { value: 'byentry', text: 'Alphabetically' }
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
                                .sort(props.title asc)
                                .($spec: $;{
                                    ...,
                                    defs: @.defs
                                        .[source.spec = $spec and (no #.filter or name ~= #.filter)]
                                        .sort(name asc, type desc)
                                })
                                .[no #.filter or defs.size() or (#.filter and props.title ~= #.filter)]
                            `,
                            item: {
                                view: 'toc-section',
                                className: data => !data.defs.length ? 'empty' : '',
                                header: [
                                    {
                                        view: 'auto-link',
                                        content: 'text-match:{ text, match: #.filter }'
                                    },
                                    {
                                        view: 'pill-badge',
                                        when: 'defs',
                                        data: '{ text: defs.size() }'
                                    }
                                ],
                                content: {
                                    view: 'list',
                                    emptyText: false,
                                    limit: '= size() | $ % 15 > 3 ? 15 : $',
                                    data: 'defs',
                                    item: [
                                        {
                                            view: 'auto-link',
                                            content: 'text-match:{ text, match: #.filter }'
                                        },
                                        'badge:type'
                                    ]
                                }
                            }
                        }
                    },
                    {
                        when: '#.splitBy="byentry"',
                        content: {
                            view: 'list',
                            limit: 100,
                            data: `
                                (defs + prods)
                                    .[name ~= #.filter]
                                    .group(=>name)
                                    .({
                                        id: key,
                                        type: value.type,
                                        name: value.name[],
                                        count: value.size()
                                    })
                                    .sort(name asc)
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
                                    view: 'block',
                                    className: 'variants',
                                    when: 'count > 1',
                                    content: 'text:`x ${count}`'
                                },
                                {
                                    view: 'inline-list',
                                    data: 'type',
                                    item: 'badge'
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
