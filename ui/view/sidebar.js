discovery.view.define('sidebar', {
    view: 'content-filter',
    content: [
        {
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
                        'badge:{ text: type, color: "#cee4ab" }',
                        {
                            view: 'auto-link',
                            content: 'text-match:{ text, match: #.filter }'
                        }
                    ]
                }
            }
        }
    ]
}, {
    tag: false
});
