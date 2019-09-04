const path = require('path');
const fs = require('fs');
const CSSWG_PATH = path.resolve('./csswg-drafts');
const knownProperties = new Set(require('./real-web-css/scripts/usage/Declaration.json').valid);
const ignoreDirs = new Set([
    'indexes',
    'css-module-bikeshed'
]);
const uniqueCls = new Set();
const specs = [];
const defs = [];
const propWriters = {
    default: function(dict, key, value) {
        if (key in dict === false) {
            dict[key] = value;
        } else {
            dict[key] = dict[key] ? dict[key] + '\n' + value : value;
        }
    },
    array: function(dict, key, value) {
        if (key in dict === false) {
            dict[key] = [value];
        } else {
            dict[key].push(value);
        }
    },
    commaSeparatedArray: function(dict, key, value) {
        value.trim().split(/\s*,\s*/).forEach(value =>
            propWriters.array(dict, key, value)
        );
    }
};
const entryKeyType = {
    spec: {
        editor: propWriters.array,
        formerEditor: propWriters.array,
        '!contributors': propWriters.array,
        previousVersion: propWriters.array,
        ignoredTerms: propWriters.commaSeparatedArray,
        ignoredVars: propWriters.commaSeparatedArray,
        issueTracking: propWriters.array,
        canIUseUrl: propWriters.array,
        ignoreCanIUseUrlFailure: propWriters.array,
        '!changeLog': propWriters.array
    }
};

function writePropValue(dict, key, type, value) {
    const propWriter = (entryKeyType[type] && entryKeyType[type][key]) || propWriters.default;

    propWriter(dict, key, value);
}

function processTextBlock(lines, type) {
    const props = {};
    const keyValueRx = /^\s*(\S.+?):\s*(.*)/;
    let prevProp = '';

    for (let i = 0; i < lines.length; i++) {
        // csswg-drafts/css-fonts-4/Overview.bs
        if (/^\s*<!--/.test(lines[i])) {
            continue;
        }

        const keyValueMatch = lines[i].match(keyValueRx);

        if (keyValueMatch && !/https?$/.test(keyValueMatch[1])) {
            const key = keyValueMatch[1]
                .toLowerCase()
                .replace(/&nbsp;/gi, ' ')  // Applies&nbsp;to
                .replace(/<.+?>/g, '')     // <a href="#values">Value</dfn>
                .replace(/\s+(\S)/g, (m, ch) => ch.toUpperCase());
            let value = keyValueMatch[2];

            // FIXME: https://github.com/w3c/csswg-drafts/pull/4262
            if (value === ': discrete') {
                value = 'discrete';
            }

            writePropValue(props, key, type, value);

            prevProp = key;
        } else {
            if (prevProp) {
                writePropValue(props, prevProp, type, lines[i].trim());
            } else {
                console.log('[WTF]!:', lines[i])
            }
        }
    }

    return props;
}

function processTableBlock(lines, type) {
    return processTextBlock(
        lines
            .join('\n')
            .replace(/([ \t]+)<tr>\n\s*<th>(.+?)\n\s*<td>\s*/g, '$1$2 ')
            .split('\n'),
        type
    );
}

function cleanupPropValue(dict, prop) {
    if (prop in dict) {
        dict[prop] = dict[prop]
            .replace(/<<(.+?)>>/g, '<$1>')
            // FIXME?
            .replace(/<\/?(nobr|var|code|br)>(?!>)/g, '')
            .replace(/<span .+?>|<\/span>/g, '')
            // FIXME: 1 entry
            .replace(/&nbsp;?/g, ' ')
            // FIXME: 8 entry
            .replace(/&lt;?/g, '<')
            .replace(/&gt;?/g, '>')
            // FIXME: 1 entry
            .replace(/&amp;?/g, '&');
    }
}

const blocks = {
    metadata: 'spec',
    propdef: 'prop',
    'propdef-shorthand': 'prop',
    'propdef-partial': 'prop-partial',
    'descdef-mq': 'media-query',
    'descdef': 'descriptor'
};

function processBs(fn) {
    const relfn = path.relative(CSSWG_PATH, fn);

    // comment to process all files
    if (relfn !== 'css-backgrounds-4/Overview.bs') {
        // return;
    }

    let content = fs.readFileSync(fn, 'utf8');

    const lines = content.split(/\r\n?|\n/);
    const blockStartRx = /^(\s*)<(\S+)\s+class=(?:'([^']+)'|"([^"]+)"|(\S+))>/i;
    const blockEndRx = /^\s*<\/(\S+?)>/;

    for (let i = 0; i < lines.length; i++) {
        const blockStart = lines[i].match(blockStartRx);
        
        if (blockStart) {
            const [, offset, el, cls1, cls2, cls3] = blockStart;
            let type = (cls1 || cls2 || cls3).replace(/\s+/g, '-');

            if (!blocks.hasOwnProperty(type)) {
                continue;
            }

            type = blocks[type];

            const blockEnd = offset + '</' + el + '>';
            const blockLines = [];
            let entry = Object.create(null);

            entry.type = type;
            
            if (type === 'spec') {
                entry.file = relfn;
                entry.id = path.dirname(relfn);
            } else {
                entry.source = {
                    spec: path.dirname(relfn),
                    line: i + 2 // lines from 1 + skip current line
                };
            }

            for (i++; i < lines.length; i++) {
                if (!lines[i]) {
                    continue;
                }

                const [blockEndMatch] = lines[i].match(blockEndRx) || [''];

                if (blockEndMatch === blockEnd) {
                    break;
                }

                blockLines.push(lines[i]);
            };

            entry.props = el === 'table'
                ? processTableBlock(blockLines, type)
                : processTextBlock(blockLines, type);

            if (type === 'spec') {
                specs.push(entry);

                if (!entry.props.title) {
                    entry.props.title = entry.id;
                }            
            } else {
                cleanupPropValue(entry.props, 'value');
                cleanupPropValue(entry.props, 'newValues');
                cleanupPropValue(entry.props, 'computedValue');

                if (entry.props.computedValue) {
                    entry.props.computedValue = entry.props.computedValue
                        .replace(/<<(('?)[a-z\d\-]+(?:\(\))?\2)>>/g, '<$1>');
                }

                (entry.props.name || 'unknown').replace(/<[^>]+>/g, '').split(/\s*,\s*/).map(name => {
                    defs.push({
                        ...entry,
                        props: { ...entry.props, name }
                    });
                });
            }
        }
    }
}

fs.readdirSync(CSSWG_PATH).forEach(function(p) {
    const fpath = path.join(CSSWG_PATH, p);

    if (fs.statSync(fpath).isDirectory()) {
        let fn;

        if (ignoreDirs.has(p)) {
            return;
        }

        if (fs.existsSync(fn = path.join(fpath, 'Overview.bs'))) {
            processBs(fn);
        } else if (
            fs.existsSync(fn = path.join(fpath, 'Overview.src.html')) ||
            fs.existsSync(fn = path.join(fpath, 'Fonts.src.html'))
        ) {
            // TODO: process html files too
        } else {
            // console.log('SKIP:', fpath);
        }
    }
});


module.exports = {
    specs,
    defs
};

if (process.mainModule === module) {
    console.log(module.exports);
}

// function printList(ar) {
//     Array.from(ar).sort().forEach(item => console.log('- ' + item));
// }

// console.log(`Props (${uniqueCls.size}):\n- `);
// printList(uniqueCls);
// console.log()

// const newProps = [...uniqueCls].filter(name => !knownProperties.has(name));
// console.log(`New props (${newProps.length}):`);
// printList(newProps);
// console.log();

// const noSpecProps = [...knownProperties].filter(name => !uniqueCls.has(name));
// console.log(`No spec props (${noSpecProps.length}):`);
// printList(noSpecProps);
// console.log();
