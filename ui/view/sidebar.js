discovery.view.define('sidebar', {
    view: 'content-filter',
    content: [
        {
            view: 'list',
            emptyText: 'No matches',
            data: `
                specs
                .sort(<title>)
                .($spec: $;{
                    ...,
                    defs: @.defs
                        .[source.spec = $spec and (no #.filter or name ~= #.filter)]
                        .sort(<name>)
                })
                .[defs.size() or (#.filter and title ~= #.filter)]
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
                        'badge:{ text: defType, color: "#cee4ab" }',
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
