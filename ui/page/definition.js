discovery.page.define('definition', {
    view: 'context',
    data: 'defs.pick(<id = #.id>)',
    content: [
        `badge:{
            text: source.spec.props.title,
            href: source.spec.id.pageLink("spec"),
            color: "#fae2ec"
        }`,
        'h1:props.name',
        'key-value:props'
    ]
}, {
    resolveLink: 'def'
});
