discovery.view.define('github-link', {
    view: 'link',
    className: 'github-link',
    data: `{
        external: true,
        href: #.data.source.home + "blob/" + #.data.source.commit + "/" + (spec.file or file) + (line ? "#L" + line : ''),
        text: ' ' // spec.file + ":" + line
    }`
}, {
    tag: false
});
