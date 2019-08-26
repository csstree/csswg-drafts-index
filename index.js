const path = require('path');
const fs = require('fs');
const CSSWG_PATH = path.resolve('./csswg-drafts');
const knownProperties = new Set(require('./real-web-css/scripts/usage/Declaration.json').valid);
const ignoreDirs = new Set([
    'indexes',
    'css-module-bikeshed'
]);
const uniqueCls = new Set();

function processBs(fn) {
    // comment to process all files
    if (fn !== path.resolve('./csswg-drafts/css-backgrounds-4/Overview.bs')) {
        return;
    }

    const content = fs.readFileSync(fn, 'utf8');
    
    const rx = /<(\S+)\s+class=(?:'([^']+)'|"([^"]+)"|(\S+))>\n\s*(\S+):\s*(.*)\n(?:(.*:.*\n)*?\s*(?:Value|New [vV]alues):\s*([^\n]+))?/i;
    const x = (content.match(new RegExp(rx, 'g')) || [])
        .reduce((res, entry) => {
            const [, el, cls1, cls2, cls3, firstProp, names, val] = entry.match(rx);
            let type = (cls1 || cls2 || cls3).replace(/\s+/g, '-');

            if (type === 'shorthand-propdef') {
                type = 'propdef-shorthand';
            }

            console.log('----\n' + entry);

            return res.concat(names.replace(/<[^>]+>/g, '').split(/\s*,\s*/).map(name => ({
                el,
                type,
                firstProp,
                name,
                val
            })));
        }, [])
        .filter(entry => entry.type.match(/propdef\b/));

    if (!x.length) {
        // console.log('    <No entries>');
    } else {
        console.log(fn);
        // console.log(x);
        x.forEach(({ type, name }) => {
            uniqueCls.add(name);
            console.log(`    [${type}] ${name}`);
        })
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

console.log(`Props (${uniqueCls.size}):\n- `);
printList(uniqueCls);
console.log()
return;


// const newProps = [...uniqueCls].filter(name => !knownProperties.has(name));
// console.log(`New props (${newProps.length}):`);
// printList(newProps);
// console.log();

// const noSpecProps = [...knownProperties].filter(name => !uniqueCls.has(name));
// console.log(`No spec props (${noSpecProps.length}):`);
// printList(noSpecProps);
// console.log();
