function generateColor(value) {
    return 'hsl(' + String(value).split('').reduce((r, c) => (r + r ^ c.charCodeAt(0)), 0) + ', 50%, 85%)';
}

function parseProdSyntax(entry) {
    entry.definitionSyntax = {
        syntax: null,
        error: null
    };

    try {
        entry.definitionSyntax.syntax = csstree.grammar.parse(entry.value);
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
            res.syntax = csstree.grammar.parse(entry.props[key]);
        } catch(e) {
            res.error = e.message;
        }
    }
}

discovery.setPrepare(function(data) {
    const colorMap = new Map([
        ['FPWD', '#ffbdbd'],
        ['WD',   '#ffcb88'],
        ['ED',   '#ffcb88'],
        ['LC',   '#fde66e'],
        ['CR',   '#e6ea37'],
        ['PR',   '#c8e62b'],
        ['REC',  '#a2d278']
    ]);

    const specIndex = data.specs.reduce(
        (map, item) => map
            .set(item, item)
            .set(item.id, item),
        new Map()
    );
    discovery.addEntityResolver(value => {
        if (value) {
            value = specIndex.get(value) || specIndex.get(value.id);
        }

        if (value) {
            return {
                type: 'spec',
                id: value.id,
                name: value.props.title,
                entity: value
            };
        }
    });

    data.defs.forEach(item => {
        item.source.spec = specIndex.get(item.source.spec);
        item.id = item.source.spec.id + '/' + item.type + '/' + item.props.name;
        parseDefSyntax(item, 'value');
        parseDefSyntax(item, 'newValues');
    });
    
    const defIndex = data.defs.reduce(
        (map, item) => map
            .set(item, item)
            .set(item.id, item)
            .set(item.props, item),
        new Map()
    );
    discovery.addEntityResolver(value => {
        if (value) {
            value = defIndex.get(value) || defIndex.get(value.id);
        }

        if (value) {
            return {
                type: 'def',
                id: value.id,
                name: value.props.name,
                entity: value
            };
        }
    });

    data.prods.forEach(item => {
        item.source.spec = specIndex.get(item.source.spec);
        item.id = item.source.spec.id + '/prod/' + item.name;
        parseProdSyntax(item, 'value');
    });

    const prodIndex = data.prods.reduce(
        (map, item) => map
            .set(item, item)
            .set(item.id, item),
        new Map()
    );
    discovery.addEntityResolver(value => {
        if (value) {
            value = prodIndex.get(value) || prodIndex.get(value.id);
        }

        if (value) {
            return {
                type: 'prod',
                id: value.id,
                name: '<' + value.name + '>',
                entity: value
            };
        }
    });

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

    discovery.addQueryHelpers({
        isArray: value => Array.isArray(value),
        color: value => colorMap.has(value) ? colorMap.get(value) : generateColor(value),
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
