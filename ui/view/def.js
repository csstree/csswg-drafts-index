discovery.view.define('def', [
    { view: 'block', className: 'header', content: [
        'auto-link',
        'badge:{ text: type }'
    ] },
    { view: 'block', className: 'source', content: [
        'auto-link:source.spec',
        'text:" on line " + source.line'
    ] }
]);
