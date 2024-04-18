/* global discovery */

discovery.page.define('default', [
    {
        view: 'page-header',
        content: [
            'h1:#.model.name',
            {
                view: 'block',
                className: 'source',
                content: [
                    'text:"Source: "',
                    'link:{ href: source.home, text: "w3c/csswg-drafts" }',
                    'text:" commit "',
                    { view: 'link', data: '{ text: source.commitShort, href: `${source.home}commit/${source.commit}` }' },
                    { view: 'text', when: 'source.commitDate', data: '" on " + source.commitDate.datetime()' },
                    'text:` (last check at ${source.checkDate.datetime()})`'
                ]
            }
        ]
    },
    {
        view: 'context',
        data: [
            { title: 'Specs', query: 'specs.sort(props.title asc)' },
            { title: 'Definitions', query: 'defs' },
            { title: 'Productions', query: 'prods' },
            { title: 'IDL sections', query: 'idls' },
            { title: 'Problem syntaxes', query: 'defs.[definitionSyntax.value.error or definitionSyntax.newValues.error] +\nprods.[definitionSyntax.error]' }
        ],
        content: {
            view: 'inline-list',
            item: 'indicator',
            data: `.({
                label: title,
                value: query.query(#.data, #).size(),
                href: href or pageLink('discovery', { title, query, view })
            })`
        }
    },
    'html:"<br><br>"',
    {
        view: 'ul',
        item: 'link:{ text: title, href: pageLink("discovery", { ..., noedit: true }) }',
        data: [
            {
                title: 'Specs and statuses',
                query: 'specs.sort(props.title ascN)',
                view: '{\n    view: \'ol\',\n    limit: false,\n    item: [\n        \'auto-link\',\n        \'badge:{ text: props.status or "?", color: props.status.color() }\'\n    ]\n}'
            },
            {
                title: 'Problem syntaxes',
                query: '(defs + prods)\n.group(=> definitionSyntax.error or definitionSyntax.value.error).[key]\n',
                view: '{\n    view: \'list\',\n    item: {\n        view: \'expand\',\n        expanded: true,\n        header: \'pre:key\',\n        content: {\n            view: \'list\',\n            data: \'value\',\n            item: [\'def\', \'source:{ content: value or props.value }\']\n        }\n    }\n}'
            },
            {
                title: 'Missed productions',
                query: '$knownProds: prods.name + genericProds;\n\n(defs.definitionSyntax.value.syntax + prods.definitionSyntax.syntax)\n..(syntaxChildren()).[type="Type" and name not in $knownProds].name',
                view: '{\n    view: \'ol\',\n    limit: false,\n    item: \'text:"<"+$+">"\'\n}'
            },
            {
                title: 'IDL sections by spec',
                query: 'idls.group(=>source.spec).sort(key.props.title ascN)',
                view: '{\n    view: \'list\',\n    item: [\n        \'h2:key.props.title\',\n        {\n            view: \'list\',\n            data: \'value\',\n            item: {\n                view: \'definition\',\n                content: \'source:{content}\'\n            }\n        }\n    ]\n}'
            }
        ]
    }
]);
