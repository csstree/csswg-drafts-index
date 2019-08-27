const path = require('path');
const fs = require('fs');
const CSSWG_PATH = path.resolve('./csswg-drafts');
const knownProperties = new Set(require('./real-web-css/scripts/usage/Declaration.json').valid);
const ignoreDirs = new Set([
    'indexes',
    'css-module-bikeshed'
]);
const uniqueCls = new Set();
const defs = [];

function processBs(fn) {
    // comment to process all files
    if (fn !== path.resolve('./csswg-drafts/css-backgrounds-4/Overview.bs')) {
        return;
    }

    const content = fs.readFileSync(fn, 'utf8');
    const lines = content.split(/\r\n?|\n/);
    const blockStartRx = /^(\s*)<(\S+)\s+class=(?:'([^']+)'|"([^"]+)"|(\S+))>/i;
    const blockEndRx = /^\s*<\/(\S+?)>/;
    const keyValueRx = /^\s*(\S.+?):\s*(.+)/;

    for (let i = 0; i < lines.length; i++) {
        const blockStart = lines[i].match(blockStartRx);
        
        if (blockStart) {
            const [, offset, el, cls1, cls2, cls3] = blockStart;
            let type = (cls1 || cls2 || cls3).replace(/\s+/g, '-');

            if (type === 'shorthand-propdef') {
                type = 'propdef-shorthand';
            }

            if (!type.match(/propdef\b/)) {
                continue;
            }

            // console.log('>>>>>', type);
            const lineNum = i;
            const blockEnd = offset + '</' + el + '>';
            let block = Object.create(null);
            let prevProp = '';

            block.loc = path.relative(CSSWG_PATH, fn) + ':' + lineNum;

            for (i++; i < lines.length; i++) {
                if (!lines[i]) {
                    continue;
                }

                const [blockEndMatch] = lines[i].match(blockEndRx) || [''];

                if (blockEndMatch === blockEnd) {
                    break;
                }

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

            if (block.value) {
                block.value = block.value
                    .replace(/<</g, '<')
                    .replace(/>>/g, '>');
            }

            (block.name || 'unknown').replace(/<[^>]+>/g, '').split(/\s*,\s*/).map(name => {
                defs.push({ ...block, name });
            });


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
            // skip
            // console.log('SKIP:', fpath);
        }
    }
});

function printList(ar) {
    Array.from(ar).sort().forEach(item => console.log('- ' + item));
}

// console.log(`Props (${uniqueCls.size}):\n- `);
// printList(uniqueCls);
// console.log()
console.log(defs);


// const newProps = [...uniqueCls].filter(name => !knownProperties.has(name));
// console.log(`New props (${newProps.length}):`);
// printList(newProps);
// console.log();

// const noSpecProps = [...knownProperties].filter(name => !uniqueCls.has(name));
// console.log(`No spec props (${noSpecProps.length}):`);
// printList(noSpecProps);
// console.log();
