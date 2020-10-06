discovery.view.define('spec-location', [
    {
        view: 'auto-link',
        data: 'spec',
        whenData: '$ and (#.page != "spec" or id != #.id)'
    },
    // 'text:" on line " + line'
    'github-link'
]);
