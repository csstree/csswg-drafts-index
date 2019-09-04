/* global discovery */

discovery.page.define('default', [
    'h1:#.name',
    {
        view: 'context',
        data: [
            { title: 'Specs', query: 'specs.sort(<props.title>)' },
            { title: 'IDL sections', query: 'idls' },
            { title: 'Definitions', query: 'defs' },
            { title: 'Productions', query: 'prods' },
            { title: 'Problem syntaxes', query: 'defs.[definitionSyntax.value.error or definitionSyntax.newValues.error] +\nprods.[definitionSyntax.error]' }
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
    'html:"<br><br>"',
    {
        view: 'ul',
        item: 'link:{ text: title, href: pageLink("report", { ..., noedit: true }) }',
        data: [
            {
                title: 'Specs and statuses',
                query: 'specs.sort(<props.title>)',
                view: '{\n    view: \'ol\',\n    limit: false,\n    item: [\'auto-link\', \'badge:{ text: props.status, color: props.status.color() }\']\n}'
            },
            {
                title: 'Problem syntaxes',
                query: '(defs + prods)\n.group(<definitionSyntax.error or definitionSyntax.value.error>).[key]\n',
                view: '{\n    view: \'list\',\n    item: {\n        view: \'expand\',\n        expanded: true,\n        title: \'pre:key\',\n        content: {\n            view: \'list\',\n            data: \'value\',\n            item: \'def\'\n        }\n    }\n}'
            },
            {
                title: 'Missed productions',
                query: '(defs.definitionSyntax.value.syntax + prods.definitionSyntax.syntax)\n..(syntaxChildren()).[type="Type"].name\n- prods.name\n- genericProds'
            },
            {
                title: 'IDL sections by spec',
                query: 'idls.group(<source.spec>).sort(<key.props.title>)',
                view: '{\n    view: \'list\',\n    item: [\n        \'h1:key.props.title\',\n        {\n            view: \'list\',\n            data: \'value.content\',\n            item: \'pre\'\n        }\n    ]\n}'
            }
        ]
    }
]);
