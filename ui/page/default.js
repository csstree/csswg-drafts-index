/* global discovery */

discovery.page.define('default', [
    'h1:#.name',{
        view: 'context',
        data: [
            { title: 'Specs', query: 'specs' },
            { title: 'Definitions', query: 'defs' }
        ],
        content: {
            view: 'inline-list',
            item: 'indicator',
            data: `.({
                label: title,
                value: query.query(#.data, #).size(),
                href: href or pageLink('report', { query, title })
            })`
        }
    }
]);
