/* global discovery, csstree */

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function markupSyntax(syntax, dict, match) {
    return csstree.grammar.generate(syntax, function(str, node) {
        if (node.type === 'Type' || node.type === 'Property') {
            const entityDescriptor = node.type === 'Type'
                ? dict.prods.find(e => e.name === node.name)
                : dict.defs.find(e => e.props.name === node.name);
            const error = !entityDescriptor;

            str = `<a${entityDescriptor ? ` href="#prod:${entityDescriptor.id}"` : ''}${error ? ' class="error"': ''}>${escapeHtml(str)}</a>`;
        }

        if (match && match.type === node.type && match.name === node.name) {
            str = `<span class="match">${str}</span>`;
        }

        return str;
    });
}

discovery.view.define('syntax', function(el, config, data, context) {
    const { type, match, matchType, matchName } = data || {};
    let { syntax } = data || {};
    let syntaxHtml = '';

    if (typeof data === 'string') {
        syntax = data;
    }

    if (syntax) {
        if (typeof syntax === 'string') {
            try {
                syntax = csstree.grammar.parse(syntax);
            } catch(e) {
                el.textContent = e.message;
                el.classList.add('parse-error');
                return;
            }
        }

        syntaxHtml = markupSyntax(syntax, context.data, {
            type: matchType,
            name: matchName
        });
    } else if (match) {
        syntaxHtml = 'generic';
    }

    el.innerHTML = syntaxHtml;
}, { tag: 'span' });
