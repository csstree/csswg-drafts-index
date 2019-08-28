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

function processTextBlock(lines, block) {
    const keyValueRx = /^\s*(\S.+?):\s*(.+)/;
    let prevProp = '';

    for (let i = 0; i < lines.length; i++) {
        const keyValueMatch = lines[i].match(keyValueRx);

        if (keyValueMatch) {
            let key = keyValueMatch[1].toLowerCase().replace(/\s+(\S)/g, (m, ch) => ch.toUpperCase());
            const value = keyValueMatch[2];

            if (key in block) {
                block[key] += '\n' + value;
            } else {
                block[key] = value;
            }

            prevProp = key;
        } else {
            if (prevProp) {
                block[prevProp] += '\n' + lines[i].trim();
            } else {
                console.log('[WTF]!:', lines[i])
            }
        }
    }

    return block;
}

function processTableBlock(lines, block) {
    return block;
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

    const content = fs.readFileSync(fn, 'utf8');
    const lines = content.split(/\r\n?|\n/);
    const blockStartRx = /^(\s*)<(\S+)\s+class=(?:'([^']+)'|"([^"]+)"|(\S+))>/i;
    const blockEndRx = /^\s*<\/(\S+?)>/;
    const spec = {
        id: path.dirname(relfn),
        title: path.dirname(relfn),
        file: relfn
    };

    for (let i = 0; i < lines.length; i++) {
        const blockStart = lines[i].match(blockStartRx);
        
        if (blockStart) {
            const [, offset, el, cls1, cls2, cls3] = blockStart;
            let type = (cls1 || cls2 || cls3).replace(/\s+/g, '-');

            // FIXME: 2 entries in css-overflow-3
            if (type === 'shorthand-propdef') {
                // console.log(fn, i);
                type = 'propdef-shorthand';
            }

            if (!blocks.hasOwnProperty(type)) {
                continue;
            }

            type = blocks[type];

            // console.log('>>>>>', type);
            const blockEnd = offset + '</' + el + '>';
            const blockLines = [];
            let entry = Object.create(null);

            entry.defType = type;
            
            if (type === 'spec') {
                entry.id = path.dirname(relfn);
            } else {
                entry.el = el;
                entry.source = {
                    spec: path.dirname(relfn),
                    line: i
                };
            }

            for (i++; i < lines.length; i++) {
                if (!lines[i]) {
                    continue;
                }

                const [blockEndMatch] = lines[i].match(blockEndRx) || [''];

                // FIXME: wrong indent
                // - css-gcpm-3/Overview.bs:437
                // - css-gcpm-3/Overview.bs:448
                if (blockEndMatch === blockEnd) {
                    break;
                }

                blockLines.push(lines[i]);
            };

            entry = el === 'table'
                ? processTableBlock(blockLines, entry)
                : processTextBlock(blockLines, entry);

            if (type === 'spec') {
                specs.push(entry);

                if (!entry.title) {
                    entry.title = entry.id;
                    console.log(entry);
                }            
            } else {
                if (entry.value) {
                    entry.value = entry.value
                        .replace(/<<(('?)[a-z\d\-]+(?:\(\))?\2)>>/g, '<$1>')
                        // FIXME: 1 entry
                        .replace(/&nbsp;?/g, ' ')
                        // FIXME: 8 entry
                        .replace(/&lt;?/g, '<')
                        .replace(/&gt;?/g, '>')
                        // FIXME: 1 entry
                        .replace(/&amp;?/g, '&');
                }

                if (entry.computedValue) {
                    entry.computedValue = entry.computedValue
                        .replace(/<<(('?)[a-z\d\-]+(?:\(\))?\2)>>/g, '<$1>');
                }

                (entry.name || 'unknown').replace(/<[^>]+>/g, '').split(/\s*,\s*/).map(name => {
                    defs.push({ ...entry, name });
                });
            }

            // console.log(block);
            // console.log('');
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
