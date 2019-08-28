discovery.view.define('sidebar', {
    view: 'tree',
    data: '.group(<file>).({ id: key, children: value })',
    children: 'children',
    expanded: 0,
    limitLines: false,
    limit: false,
    item: 'auto-link'
});
