/* global discovery, csstree */

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function markupSyntax(syntax, match) {
    return csstree.grammar.generate(syntax, function(str, node) {
        if (node.type === 'Type' || node.type === 'Property') {
            const entityDescriptor = discovery.resolveEntity(node);
            const error = !entityDescriptor || !entityDescriptor.entity.match;

            str = `<a href="#${node.type}:${node.name}"${error ? ' class="error"': ''}>${escapeHtml(str)}</a>`;

        }

        if (match && match.type === node.type && match.name === node.name) {
            str = `<span class="match">${str}</span>`;
        }

        return str;
    });
}

discovery.view.define('syntax', function(el, config, data) {
    const { type, match, matchType, matchName } = data || {};
    let { syntax } = data || {};
    let syntaxHtml = '';

    if (typeof data === 'string') {
        syntax = data;
    }

    if (syntax) {
        if (typeof syntax === 'string') {
            syntax = csstree.grammar.parse(syntax);
        }

        syntaxHtml = markupSyntax(syntax, {
            type: matchType,
            name: matchName
        });
    } else if (match) {
        syntaxHtml = 'generic';
    }

    el.innerHTML = syntaxHtml;
}, { tag: 'span' });
