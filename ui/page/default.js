/* global discovery */

discovery.page.define('default', [
    'h1:#.name',
    {
        view: 'context',
        data: [
            { title: 'Specs', query: 'specs.sort(<props.title>)' },
            { title: 'Definitions', query: 'defs' },
            { title: 'Problem syntaxes', query: 'defs.[definitionSyntax.value.error]' }
        ],
        content: {
            view: 'inline-list',
            item: 'indicator',
            data: `.({
                label: title,
                value: query.query(#.data, #).size(),
                href: href or pageLink('report', { title, query, view })
            })`
        }
    },
    {
        view: 'section',
        header: 'text:"Reports"',
        content: {
            view: 'ul',
            item: 'link:{ text: title, href: pageLink("report", { ..., noedit: true }) }'
        },
        data: [
            {
                title: 'Specs and statuses',
                query: 'specs.sort(<props.title>)',
                view: '{\n    view: \'ol\',\n    limit: false,\n    item: [\'auto-link\', \'badge:props.status\']\n}'
            },
            {
                title: 'Problem syntaxes',
                noedit: true,
                query: 'defs.group(<definitionSyntax.value.error>).[key]',
                view: '{\n    view: \'list\',\n    item: {\n        view: \'expand\',\n        expanded: true,\n        title: \'pre:key\',\n        content: {\n            view: \'list\',\n            data: \'value\',\n            item: \'def\'\n        }\n    }\n}'
            }
        ]
    }
]);
