const TZ = new Date().getTimezoneOffset() * 60 * 1000;

function generateColor(value) {
    return 'hsl(' + String(value).split('').reduce((r, c) => (r + r ^ c.charCodeAt(0)), 0) + ', 50%, 85%)';
}

function parseProdSyntax(entry) {
    entry.definitionSyntax = {
        syntax: null,
        error: null
    };

    try {
        entry.definitionSyntax.syntax = csstree.definitionSyntax.parse(entry.value);
    } catch(e) {
        entry.definitionSyntax.error = e.message;
    }
}

function parseDefSyntax(entry, key) {
    if (entry.props[key]) {
        if (!entry.definitionSyntax) {
            entry.definitionSyntax = {};
        }

        const res = entry.definitionSyntax[key] = {
            syntax: null,
            error: null
        };

        try {
            res.syntax = csstree.definitionSyntax.parse(entry.props[key]);
        } catch(e) {
            res.error = e.message;
        }
    }
}

discovery.setPrepare(function(data, { defineObjectMarker, addQueryHelpers }) {
    const colorMap = new Map([
        ['FPWD', '#ffbdbd'],
        ['WD',   '#ffcb88'],
        ['ED',   '#ffcb88'],
        ['LC',   '#fde66e'],
        ['CR',   '#e6ea37'],
        ['PR',   '#c8e62b'],
        ['REC',  '#a2d278']
    ]);

    const specIndex = new Map();
    const specMarker = defineObjectMarker('spec', {
        lookupRefs: ['id'],
        ref: 'id',
        title: value => value.props.title,
        page: 'spec'
    });
    for (const spec of data.specs) {
        specIndex.set(spec.id, spec);
        specMarker(spec);
    }

    const defMarker = defineObjectMarker('def', {
        refs: ['props'],
        lookupRefs: ['id', 'props'],
        ref: 'id',
        title: value => value.props.name,
        page: 'def'
    });
    data.defs.forEach(item => {
        item.source.spec = specIndex.get(item.source.spec);
        item.id = item.source.spec.id + '/' + item.type + '/' + item.props.name;
        parseDefSyntax(item, 'value');
        parseDefSyntax(item, 'newValues');
        defMarker(item);
    });

    const prodMarker = defineObjectMarker('prod', {
        ref: 'id',
        title: value => '<' + value.name + '>',
        page: 'prod'
    });
    data.prods.forEach(item => {
        item.source.spec = specIndex.get(item.source.spec);
        item.id = item.source.spec.id + '/prod/' + item.name;
        parseProdSyntax(item, 'value');
        prodMarker(item);
    });

    data.idls.forEach(item => {
        item.source.spec = specIndex.get(item.source.spec);
    });

    // from css-tree/lib/lexer/generic.js
    data.genericProds = [
        "ident-token", "function-token", "at-keyword-token", "hash-token", "string-token",
        "bad-string-token", "url-token", "bad-url-token", "delim-token", "number-token",
        "percentage-token", "dimension-token", "whitespace-token", "CDO-token", "CDC-token",
        "colon-token", "semicolon-token", "comma-token", "[-token", "]-token", "(-token", ")-token",
        "{-token", "}-token", "string", "ident", "custom-ident", "custom-property-name", "hex-color",
        "id-selector", "an-plus-b", "urange", "declaration-value", "any-value", "dimension",
        "angle", "decibel", "frequency", "flex", "length", "resolution", "semitones", "time",
        "percentage", "zero", "number", "integer"
    ];

    addQueryHelpers({
        isArray: value => Array.isArray(value),
        color: value => colorMap.has(value) ? colorMap.get(value) : generateColor(value),
        datetime: value => new Date(value - TZ).toISOString().replace(/T/, ' ').replace(/\..+$/, ''),
        syntaxChildren(current) {
            const children = [];

            if (current) {
                if (current.term) {
                    children.push(current.term);
                }
                if (current.terms) {
                    children.push(...current.terms);
                }
            }

            return children;
        }
    });

});
