const path = require('path');
const fs = require('fs');
const getRepoInfo = require('git-repo-info');
const CSSWG_PATH = path.resolve('./csswg-drafts');
// const knownProperties = new Set(require('./real-web-css/scripts/usage/Declaration.json').valid);
const ignoreDirs = new Set([
    'indexes',
    'css-module-bikeshed'
]);
const blockStartRx = /^(\s*)<(\S+)\s+class=(?:'([^']+)'|"([^"]+)"|(\S+))>/i;
const blockEndRx = /^\s*<\/(\S+?)>/;
const prodValueEndEx = /<(dfn|dl|dd)|<\/(pre|div|dt)|\)<\/span|\n\n/g;
const specs = [];
const defs = [];
const prods = [];
const idls = [];
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
            dict[key] = value ? [value] : [];
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
        linkDefaults: propWriters.commaSeparatedArray,
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
        const line = lines[i].trimRight();
        const keyValueMatch = line.match(keyValueRx);

        if (keyValueMatch && !/https?$/.test(keyValueMatch[1])) {
            const key = keyValueMatch[1]
                .toLowerCase()
                .replace(/&nbsp;/gi, ' ')  // Applies&nbsp;to
                .replace(/<.+?>/g, '')     // <a href="#values">Value</dfn>
                .replace(/\s+(\S)/g, (m, ch) => ch.toUpperCase());
            let value = keyValueMatch[2];

            writePropValue(props, key, type, value);

            prevProp = key;
        } else {
            if (prevProp) {
                writePropValue(props, prevProp, type, line.trim());
            } else {
                console.warn('[WTF]!: (line ' + i + ')', line)
            }
        }
    }

    return props;
}

function processTableBlock(lines, type) {
    return processTextBlock(
        lines
            .join('\n')
            .replace(/([ \t]+)<tr>\n\s*<t[hd]>(.+?)\n\s*<td>\s*/g, '$1$2 ')
            .replace(/<\/t[rdh]>/g, '')
            .replace(/\s*<tbody> *\n*|\s*<\/tbody>\s*/g, '')
            .replace(/^\s*<(\S+)>(.+?:)<\/\1>/m, '$2')
            .replace(/(\n *)+/g, '$1')
            .split(/\n+/),
        type
    );
}

function cleanupValue(value) {
    return value
        // FIXME?
        .replace(/<!--(.|\s)+?-->/g, '')
        .replace(/<\/?(nobr|var|code|br|em|i)>(?!>)/g, '')
        .replace(/<var .+?>/g, '')
        .replace(/<span.*?>(?!>)|<\/span>/g, '')
        // FIXME: 1 entry
        .replace(/&nbsp;?/g, ' ')
        // FIXME: 8 entry
        .replace(/&lt;?/g, '<')
        .replace(/&gt;?/g, '>')
        // FIXME: 1 entry
        .replace(/&amp;?/g, '&')
        // ok
        .replace(/&infin;?|Infinity/g, '∞')
        .replace(/<\/?a>/g, '')
        .replace(/''(?:[^/]+\/)?(\S+?)''/g, '$1')
        .replace(/<<(.+?)>>/g, '<$1>');
}

function cleanupPropValue(dict, prop) {
    if (prop in dict) {
        dict[prop] = cleanupValue(dict[prop]);
    }
}

function normalizeOffset(text){
    if (text.indexOf('\n') === -1) {
        return text;
    }

    text = text
        .replace(/\t/g, '    ')
        // cut first empty lines
        .replace(/^(?:\s*[\n])+?( *)/, '$1')
        .trimRight();

    // fix empty strings
    text = text.replace(/\n +\n/g, '\n\n');

    // normalize text offset
    var minOffset = 1000;
    var lines = text.split(/\n+/);

    for (var i = 1; i < lines.length; i++) {
        var m = lines[i].match(/^\s*/);
        if (m[0].length < minOffset) {
            minOffset = m[0].length;
        }
        if (minOffset == 0) {
            break;
        }
    }

    if (minOffset > 0) {
        text = text.replace(new RegExp('(^|\\n) {' + minOffset + '}', 'g'), '$1');
    }

    return text;
}

const blocks = {
    'metadata': 'spec',
    'propdef': 'prop',
    'propdef-shorthand': 'prop',
    'propdef-partial': 'prop-partial',
    'descdef-mq': 'media-query',
    'descdef': 'descriptor',
    'idl': 'idl'
};

function processBs(fn) {
    const relfn = path.relative(CSSWG_PATH, fn);
    const specEntry = {
        file: relfn,
        id: path.dirname(relfn),
        props: {
            title: path.dirname(relfn)
        }
    };

    // if (relfn !== 'css-backgrounds-4/Overview.bs') {
    if (relfn !== 'css-fonts-3/Fonts.src.html') {
        // uncomment to process a single file
        // return;
    }

    specs.push(specEntry);

    let content = fs.readFileSync(fn, 'utf8');
    let offset = 0;
    const linesOffset = [];
    const lines = content.split(/(\r\n?|\n)/).filter((part, idx) => {
        if (idx % 2 === 0) {
            linesOffset.push(offset);
        }

        offset += part.length;
        return idx % 2 === 0;
    });

    for (let i = 0; i < lines.length; i++) {
        const [, title] = lines[i].match(/<title>(.+)<\/title>/) || [];

        if (title) {
            specEntry.props.title = title;
            continue;
        }

        // NOTE: much better is to search productions in <pre class="prod"> blocks,
        // however many specs do not wrap productions in such blocks; Suppose that's
        // should be fixed. Until that use dirty and hacky approach.
        const prodMatch = lines[i].match(/<dfn( .*?)?>(.+?)<\/dfn>\s*=/);

        if (prodMatch) {
            const normName = prodMatch[2]
                .replace(/<\/?var>/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

            // const [a, b] = [content.substr(linesOffset[i] + prodMatch.index, prodMatch[0].length), prodMatch[0]];
            // a !== b && console.log(xcount, relfn, '[a:' + a + ']', '[b:' + b + ']');

            if (/^@|[>)]$/.test(normName) || normName === 'content-list') {
                let attrEntries = prodMatch[1] && prodMatch[1]
                    .match(/\s+[^=]+(?:=(?:"[^"]+"|'[^']+'|\S+))?/g);
                const valueStart = linesOffset[i] + prodMatch.index + prodMatch[0].length;
                let valueEnd;

                prodValueEndEx.lastIndex = valueStart;
                valueEnd = prodValueEndEx.exec(content).index;
                if (content.charAt(valueEnd) === ')') {
                    valueEnd++;
                }

                prods.push({
                    type: 'prod',
                    name: normName.replace(/[<>]/g, ''),
                    dfnName: normName,
                    source: {
                        spec: path.dirname(relfn),
                        line: i + 1
                    },
                    attrs: attrEntries && attrEntries.reduce((res, attr) => {
                        const m = attr.trim().match(/([^=]+)(?:=(['"])(.+?)\2|=(\S+))?/);
                        res[m[1]] = m[3] || m[4] || true;
                        return res;
                    }, {}),
                    value: normalizeOffset(
                        cleanupValue(content.substring(valueStart, valueEnd).trim())
                            .replace(/<a (.|\s)+?>|<\/a>/g, '')
                    )
                });
            }
        }
        
        const blockStart = lines[i].match(blockStartRx);

        if (blockStart) {
            const [, blockStartOffset, el, cls1, cls2, cls3] = blockStart;
            const blockStartEnd = blockStart.index + blockStart[0].length;
            let type = (cls1 || cls2 || cls3).replace(/\s+/g, '-');
            let singleLineBlock = false;
            const blockStartContent = lines[i]
                .slice(blockStart.index + blockStart[0].length)
                .trim()
                .replace(new RegExp('</' + el + '>$'), m => {
                    singleLineBlock = true;
                    return '';
                });

            if (!blocks.hasOwnProperty(type) || el === 'code') {
                continue;
            }

            type = blocks[type];

            const blockEnd = blockStartOffset + '</' + el + '>';
            const blockLines = [];
            let entry = Object.create(null);
            
            if (type === 'spec') {
                entry = specEntry;
            } else {
                entry.type = type;
                entry.source = {
                    spec: path.dirname(relfn),
                    line: i + 1 // lines from 1
                };
            }

            if (blockStartContent) {
                blockLines.push(blockStartContent);
            }

            if (!singleLineBlock) {
                for (i++; i < lines.length; i++) {
                    if (!lines[i]) {
                        continue;
                    }

                    const [blockEndMatch] = lines[i].match(blockEndRx) || [''];

                    if (blockEndMatch === blockEnd) {
                        break;
                    }

                    // FIXME: css-font-4
                    if (el === 'pre' && lines[i].indexOf('};</pre>') !== -1) {
                        blockLines.push('};');
                        break;
                    }

                    blockLines.push(lines[i]);
                }
            };

            if (type === 'idl') {
                entry.content = normalizeOffset(blockLines.join('\n').trim())
                    // FIXME
                    .replace(/<dfn.+?>|<\/dfn>/g, '')
                    .replace(/<!--(.|\s)+?-->/g, '');
                idls.push(entry);
                continue;
            }

            entry.props = el === 'table'
                ? processTableBlock(blockLines, type)
                : processTextBlock(blockLines, type);

            if (type === 'spec') {
                if (!entry.props.title) {
                    entry.props.title = entry.id;
                }            
            } else {
                cleanupPropValue(entry.props, 'value');
                cleanupPropValue(entry.props, 'newValues');
                cleanupPropValue(entry.props, 'initial');
                cleanupPropValue(entry.props, 'appliesTo');
                cleanupPropValue(entry.props, 'computedValue');
                cleanupPropValue(entry.props, 'animationType');
                cleanupPropValue(entry.props, 'animatable');
                cleanupPropValue(entry.props, 'percentages');

                (entry.props.name || 'unknown').replace(/<[^>]+>/g, '').split(/\s*,\s*/).map(name => {
                    defs.push({
                        ...entry,
                        name,
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
            processBs(fn);
            // console.log('HTML:', fn);
            // TODO: process html files too
        } else {
            console.log('Skip:', fpath);
            // console.log('SKIP:', fpath);
        }
    }
});

const {
    sha: commit,
    abbreviatedSha: commitShort,
    branch,
    committerDate: commitDate
} = getRepoInfo(CSSWG_PATH);
module.exports = {
    source: {
        home: 'https://github.com/w3c/csswg-drafts/',
        commit,
        commitShort,
        commitDate,
        branch
    },
    specs,
    defs,
    prods,
    idls
};

if (process.mainModule === module) {
    console.log(module.exports);
}
