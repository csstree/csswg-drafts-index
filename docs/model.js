(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.discovery = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });

const csstree = exports.csstree = (function(){
var exports = {};
var module = { exports: exports };
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.csstree = factory());
}(this, function () { 'use strict';

    //
    //                              list
    //                            ┌──────┐
    //             ┌──────────────┼─head │
    //             │              │ tail─┼──────────────┐
    //             │              └──────┘              │
    //             ▼                                    ▼
    //            item        item        item        item
    //          ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
    //  null ◀──┼─prev │◀───┼─prev │◀───┼─prev │◀───┼─prev │
    //          │ next─┼───▶│ next─┼───▶│ next─┼───▶│ next─┼──▶ null
    //          ├──────┤    ├──────┤    ├──────┤    ├──────┤
    //          │ data │    │ data │    │ data │    │ data │
    //          └──────┘    └──────┘    └──────┘    └──────┘
    //

    function createItem(data) {
        return {
            prev: null,
            next: null,
            data: data
        };
    }

    function allocateCursor(node, prev, next) {
        var cursor;

        if (cursors !== null) {
            cursor = cursors;
            cursors = cursors.cursor;
            cursor.prev = prev;
            cursor.next = next;
            cursor.cursor = node.cursor;
        } else {
            cursor = {
                prev: prev,
                next: next,
                cursor: node.cursor
            };
        }

        node.cursor = cursor;

        return cursor;
    }

    function releaseCursor(node) {
        var cursor = node.cursor;

        node.cursor = cursor.cursor;
        cursor.prev = null;
        cursor.next = null;
        cursor.cursor = cursors;
        cursors = cursor;
    }

    var cursors = null;
    var List = function() {
        this.cursor = null;
        this.head = null;
        this.tail = null;
    };

    List.createItem = createItem;
    List.prototype.createItem = createItem;

    List.prototype.updateCursors = function(prevOld, prevNew, nextOld, nextNew) {
        var cursor = this.cursor;

        while (cursor !== null) {
            if (cursor.prev === prevOld) {
                cursor.prev = prevNew;
            }

            if (cursor.next === nextOld) {
                cursor.next = nextNew;
            }

            cursor = cursor.cursor;
        }
    };

    List.prototype.getSize = function() {
        var size = 0;
        var cursor = this.head;

        while (cursor) {
            size++;
            cursor = cursor.next;
        }

        return size;
    };

    List.prototype.fromArray = function(array) {
        var cursor = null;

        this.head = null;

        for (var i = 0; i < array.length; i++) {
            var item = createItem(array[i]);

            if (cursor !== null) {
                cursor.next = item;
            } else {
                this.head = item;
            }

            item.prev = cursor;
            cursor = item;
        }

        this.tail = cursor;

        return this;
    };

    List.prototype.toArray = function() {
        var cursor = this.head;
        var result = [];

        while (cursor) {
            result.push(cursor.data);
            cursor = cursor.next;
        }

        return result;
    };

    List.prototype.toJSON = List.prototype.toArray;

    List.prototype.isEmpty = function() {
        return this.head === null;
    };

    List.prototype.first = function() {
        return this.head && this.head.data;
    };

    List.prototype.last = function() {
        return this.tail && this.tail.data;
    };

    List.prototype.each = function(fn, context) {
        var item;

        if (context === undefined) {
            context = this;
        }

        // push cursor
        var cursor = allocateCursor(this, null, this.head);

        while (cursor.next !== null) {
            item = cursor.next;
            cursor.next = item.next;

            fn.call(context, item.data, item, this);
        }

        // pop cursor
        releaseCursor(this);
    };

    List.prototype.forEach = List.prototype.each;

    List.prototype.eachRight = function(fn, context) {
        var item;

        if (context === undefined) {
            context = this;
        }

        // push cursor
        var cursor = allocateCursor(this, this.tail, null);

        while (cursor.prev !== null) {
            item = cursor.prev;
            cursor.prev = item.prev;

            fn.call(context, item.data, item, this);
        }

        // pop cursor
        releaseCursor(this);
    };

    List.prototype.forEachRight = List.prototype.eachRight;

    List.prototype.nextUntil = function(start, fn, context) {
        if (start === null) {
            return;
        }

        var item;

        if (context === undefined) {
            context = this;
        }

        // push cursor
        var cursor = allocateCursor(this, null, start);

        while (cursor.next !== null) {
            item = cursor.next;
            cursor.next = item.next;

            if (fn.call(context, item.data, item, this)) {
                break;
            }
        }

        // pop cursor
        releaseCursor(this);
    };

    List.prototype.prevUntil = function(start, fn, context) {
        if (start === null) {
            return;
        }

        var item;

        if (context === undefined) {
            context = this;
        }

        // push cursor
        var cursor = allocateCursor(this, start, null);

        while (cursor.prev !== null) {
            item = cursor.prev;
            cursor.prev = item.prev;

            if (fn.call(context, item.data, item, this)) {
                break;
            }
        }

        // pop cursor
        releaseCursor(this);
    };

    List.prototype.some = function(fn, context) {
        var cursor = this.head;

        if (context === undefined) {
            context = this;
        }

        while (cursor !== null) {
            if (fn.call(context, cursor.data, cursor, this)) {
                return true;
            }

            cursor = cursor.next;
        }

        return false;
    };

    List.prototype.map = function(fn, context) {
        var result = new List();
        var cursor = this.head;

        if (context === undefined) {
            context = this;
        }

        while (cursor !== null) {
            result.appendData(fn.call(context, cursor.data, cursor, this));
            cursor = cursor.next;
        }

        return result;
    };

    List.prototype.filter = function(fn, context) {
        var result = new List();
        var cursor = this.head;

        if (context === undefined) {
            context = this;
        }

        while (cursor !== null) {
            if (fn.call(context, cursor.data, cursor, this)) {
                result.appendData(cursor.data);
            }
            cursor = cursor.next;
        }

        return result;
    };

    List.prototype.clear = function() {
        this.head = null;
        this.tail = null;
    };

    List.prototype.copy = function() {
        var result = new List();
        var cursor = this.head;

        while (cursor !== null) {
            result.insert(createItem(cursor.data));
            cursor = cursor.next;
        }

        return result;
    };

    List.prototype.prepend = function(item) {
        //      head
        //    ^
        // item
        this.updateCursors(null, item, this.head, item);

        // insert to the beginning of the list
        if (this.head !== null) {
            // new item <- first item
            this.head.prev = item;

            // new item -> first item
            item.next = this.head;
        } else {
            // if list has no head, then it also has no tail
            // in this case tail points to the new item
            this.tail = item;
        }

        // head always points to new item
        this.head = item;

        return this;
    };

    List.prototype.prependData = function(data) {
        return this.prepend(createItem(data));
    };

    List.prototype.append = function(item) {
        return this.insert(item);
    };

    List.prototype.appendData = function(data) {
        return this.insert(createItem(data));
    };

    List.prototype.insert = function(item, before) {
        if (before !== undefined && before !== null) {
            // prev   before
            //      ^
            //     item
            this.updateCursors(before.prev, item, before, item);

            if (before.prev === null) {
                // insert to the beginning of list
                if (this.head !== before) {
                    throw new Error('before doesn\'t belong to list');
                }

                // since head points to before therefore list doesn't empty
                // no need to check tail
                this.head = item;
                before.prev = item;
                item.next = before;

                this.updateCursors(null, item);
            } else {

                // insert between two items
                before.prev.next = item;
                item.prev = before.prev;

                before.prev = item;
                item.next = before;
            }
        } else {
            // tail
            //      ^
            //      item
            this.updateCursors(this.tail, item, null, item);

            // insert to the ending of the list
            if (this.tail !== null) {
                // last item -> new item
                this.tail.next = item;

                // last item <- new item
                item.prev = this.tail;
            } else {
                // if list has no tail, then it also has no head
                // in this case head points to new item
                this.head = item;
            }

            // tail always points to new item
            this.tail = item;
        }

        return this;
    };

    List.prototype.insertData = function(data, before) {
        return this.insert(createItem(data), before);
    };

    List.prototype.remove = function(item) {
        //      item
        //       ^
        // prev     next
        this.updateCursors(item, item.prev, item, item.next);

        if (item.prev !== null) {
            item.prev.next = item.next;
        } else {
            if (this.head !== item) {
                throw new Error('item doesn\'t belong to list');
            }

            this.head = item.next;
        }

        if (item.next !== null) {
            item.next.prev = item.prev;
        } else {
            if (this.tail !== item) {
                throw new Error('item doesn\'t belong to list');
            }

            this.tail = item.prev;
        }

        item.prev = null;
        item.next = null;

        return item;
    };

    List.prototype.push = function(data) {
        this.insert(createItem(data));
    };

    List.prototype.pop = function() {
        if (this.tail !== null) {
            return this.remove(this.tail);
        }
    };

    List.prototype.unshift = function(data) {
        this.prepend(createItem(data));
    };

    List.prototype.shift = function() {
        if (this.head !== null) {
            return this.remove(this.head);
        }
    };

    List.prototype.prependList = function(list) {
        return this.insertList(list, this.head);
    };

    List.prototype.appendList = function(list) {
        return this.insertList(list);
    };

    List.prototype.insertList = function(list, before) {
        // ignore empty lists
        if (list.head === null) {
            return this;
        }

        if (before !== undefined && before !== null) {
            this.updateCursors(before.prev, list.tail, before, list.head);

            // insert in the middle of dist list
            if (before.prev !== null) {
                // before.prev <-> list.head
                before.prev.next = list.head;
                list.head.prev = before.prev;
            } else {
                this.head = list.head;
            }

            before.prev = list.tail;
            list.tail.next = before;
        } else {
            this.updateCursors(this.tail, list.tail, null, list.head);

            // insert to end of the list
            if (this.tail !== null) {
                // if destination list has a tail, then it also has a head,
                // but head doesn't change

                // dest tail -> source head
                this.tail.next = list.head;

                // dest tail <- source head
                list.head.prev = this.tail;
            } else {
                // if list has no a tail, then it also has no a head
                // in this case points head to new item
                this.head = list.head;
            }

            // tail always start point to new item
            this.tail = list.tail;
        }

        list.head = null;
        list.tail = null;

        return this;
    };

    List.prototype.replace = function(oldItem, newItemOrList) {
        if ('head' in newItemOrList) {
            this.insertList(newItemOrList, oldItem);
        } else {
            this.insert(newItemOrList, oldItem);
        }

        this.remove(oldItem);
    };

    var List_1 = List;

    var createCustomError = function createCustomError(name, message) {
        // use Object.create(), because some VMs prevent setting line/column otherwise
        // (iOS Safari 10 even throws an exception)
        var error = Object.create(SyntaxError.prototype);
        var errorStack = new Error();

        error.name = name;
        error.message = message;

        Object.defineProperty(error, 'stack', {
            get: function() {
                return (errorStack.stack || '').replace(/^(.+\n){1,3}/, name + ': ' + message + '\n');
            }
        });

        return error;
    };

    var MAX_LINE_LENGTH = 100;
    var OFFSET_CORRECTION = 60;
    var TAB_REPLACEMENT = '    ';

    function sourceFragment(error, extraLines) {
        function processLines(start, end) {
            return lines.slice(start, end).map(function(line, idx) {
                var num = String(start + idx + 1);

                while (num.length < maxNumLength) {
                    num = ' ' + num;
                }

                return num + ' |' + line;
            }).join('\n');
        }

        var lines = error.source.split(/\r\n?|\n|\f/);
        var line = error.line;
        var column = error.column;
        var startLine = Math.max(1, line - extraLines) - 1;
        var endLine = Math.min(line + extraLines, lines.length + 1);
        var maxNumLength = Math.max(4, String(endLine).length) + 1;
        var cutLeft = 0;

        // column correction according to replaced tab before column
        column += (TAB_REPLACEMENT.length - 1) * (lines[line - 1].substr(0, column - 1).match(/\t/g) || []).length;

        if (column > MAX_LINE_LENGTH) {
            cutLeft = column - OFFSET_CORRECTION + 3;
            column = OFFSET_CORRECTION - 2;
        }

        for (var i = startLine; i <= endLine; i++) {
            if (i >= 0 && i < lines.length) {
                lines[i] = lines[i].replace(/\t/g, TAB_REPLACEMENT);
                lines[i] =
                    (cutLeft > 0 && lines[i].length > cutLeft ? '\u2026' : '') +
                    lines[i].substr(cutLeft, MAX_LINE_LENGTH - 2) +
                    (lines[i].length > cutLeft + MAX_LINE_LENGTH - 1 ? '\u2026' : '');
            }
        }

        return [
            processLines(startLine, line),
            new Array(column + maxNumLength + 2).join('-') + '^',
            processLines(line, endLine)
        ].filter(Boolean).join('\n');
    }

    var SyntaxError$1 = function(message, source, offset, line, column) {
        var error = createCustomError('SyntaxError', message);

        error.source = source;
        error.offset = offset;
        error.line = line;
        error.column = column;

        error.sourceFragment = function(extraLines) {
            return sourceFragment(error, isNaN(extraLines) ? 0 : extraLines);
        };
        Object.defineProperty(error, 'formattedMessage', {
            get: function() {
                return (
                    'Parse error: ' + error.message + '\n' +
                    sourceFragment(error, 2)
                );
            }
        });

        // for backward capability
        error.parseError = {
            offset: offset,
            line: line,
            column: column
        };

        return error;
    };

    var _SyntaxError = SyntaxError$1;

    // CSS Syntax Module Level 3
    // https://www.w3.org/TR/css-syntax-3/
    var TYPE = {
        EOF: 0,                 // <EOF-token>
        Ident: 1,               // <ident-token>
        Function: 2,            // <function-token>
        AtKeyword: 3,           // <at-keyword-token>
        Hash: 4,                // <hash-token>
        String: 5,              // <string-token>
        BadString: 6,           // <bad-string-token>
        Url: 7,                 // <url-token>
        BadUrl: 8,              // <bad-url-token>
        Delim: 9,               // <delim-token>
        Number: 10,             // <number-token>
        Percentage: 11,         // <percentage-token>
        Dimension: 12,          // <dimension-token>
        WhiteSpace: 13,         // <whitespace-token>
        CDO: 14,                // <CDO-token>
        CDC: 15,                // <CDC-token>
        Colon: 16,              // <colon-token>     :
        Semicolon: 17,          // <semicolon-token> ;
        Comma: 18,              // <comma-token>     ,
        LeftSquareBracket: 19,  // <[-token>
        RightSquareBracket: 20, // <]-token>
        LeftParenthesis: 21,    // <(-token>
        RightParenthesis: 22,   // <)-token>
        LeftCurlyBracket: 23,   // <{-token>
        RightCurlyBracket: 24,  // <}-token>
        Comment: 25
    };

    var NAME = Object.keys(TYPE).reduce(function(result, key) {
        result[TYPE[key]] = key;
        return result;
    }, {});

    var _const = {
        TYPE: TYPE,
        NAME: NAME
    };

    var EOF = 0;

    // https://drafts.csswg.org/css-syntax-3/
    // § 4.2. Definitions

    // digit
    // A code point between U+0030 DIGIT ZERO (0) and U+0039 DIGIT NINE (9).
    function isDigit(code) {
        return code >= 0x0030 && code <= 0x0039;
    }

    // hex digit
    // A digit, or a code point between U+0041 LATIN CAPITAL LETTER A (A) and U+0046 LATIN CAPITAL LETTER F (F),
    // or a code point between U+0061 LATIN SMALL LETTER A (a) and U+0066 LATIN SMALL LETTER F (f).
    function isHexDigit(code) {
        return (
            isDigit(code) || // 0 .. 9
            (code >= 0x0041 && code <= 0x0046) || // A .. F
            (code >= 0x0061 && code <= 0x0066)    // a .. f
        );
    }

    // uppercase letter
    // A code point between U+0041 LATIN CAPITAL LETTER A (A) and U+005A LATIN CAPITAL LETTER Z (Z).
    function isUppercaseLetter(code) {
        return code >= 0x0041 && code <= 0x005A;
    }

    // lowercase letter
    // A code point between U+0061 LATIN SMALL LETTER A (a) and U+007A LATIN SMALL LETTER Z (z).
    function isLowercaseLetter(code) {
        return code >= 0x0061 && code <= 0x007A;
    }

    // letter
    // An uppercase letter or a lowercase letter.
    function isLetter(code) {
        return isUppercaseLetter(code) || isLowercaseLetter(code);
    }

    // non-ASCII code point
    // A code point with a value equal to or greater than U+0080 <control>.
    function isNonAscii(code) {
        return code >= 0x0080;
    }

    // name-start code point
    // A letter, a non-ASCII code point, or U+005F LOW LINE (_).
    function isNameStart(code) {
        return isLetter(code) || isNonAscii(code) || code === 0x005F;
    }

    // name code point
    // A name-start code point, a digit, or U+002D HYPHEN-MINUS (-).
    function isName(code) {
        return isNameStart(code) || isDigit(code) || code === 0x002D;
    }

    // non-printable code point
    // A code point between U+0000 NULL and U+0008 BACKSPACE, or U+000B LINE TABULATION,
    // or a code point between U+000E SHIFT OUT and U+001F INFORMATION SEPARATOR ONE, or U+007F DELETE.
    function isNonPrintable(code) {
        return (
            (code >= 0x0000 && code <= 0x0008) ||
            (code === 0x000B) ||
            (code >= 0x000E && code <= 0x001F) ||
            (code === 0x007F)
        );
    }

    // newline
    // U+000A LINE FEED. Note that U+000D CARRIAGE RETURN and U+000C FORM FEED are not included in this definition,
    // as they are converted to U+000A LINE FEED during preprocessing.
    // TODO: we doesn't do a preprocessing, so check a code point for U+000D CARRIAGE RETURN and U+000C FORM FEED
    function isNewline(code) {
        return code === 0x000A || code === 0x000D || code === 0x000C;
    }

    // whitespace
    // A newline, U+0009 CHARACTER TABULATION, or U+0020 SPACE.
    function isWhiteSpace(code) {
        return isNewline(code) || code === 0x0020 || code === 0x0009;
    }

    // § 4.3.8. Check if two code points are a valid escape
    function isValidEscape(first, second) {
        // If the first code point is not U+005C REVERSE SOLIDUS (\), return false.
        if (first !== 0x005C) {
            return false;
        }

        // Otherwise, if the second code point is a newline or EOF, return false.
        if (isNewline(second) || second === EOF) {
            return false;
        }

        // Otherwise, return true.
        return true;
    }

    // § 4.3.9. Check if three code points would start an identifier
    function isIdentifierStart(first, second, third) {
        // Look at the first code point:

        // U+002D HYPHEN-MINUS
        if (first === 0x002D) {
            // If the second code point is a name-start code point or a U+002D HYPHEN-MINUS,
            // or the second and third code points are a valid escape, return true. Otherwise, return false.
            return (
                isNameStart(second) ||
                second === 0x002D ||
                isValidEscape(second, third)
            );
        }

        // name-start code point
        if (isNameStart(first)) {
            // Return true.
            return true;
        }

        // U+005C REVERSE SOLIDUS (\)
        if (first === 0x005C) {
            // If the first and second code points are a valid escape, return true. Otherwise, return false.
            return isValidEscape(first, second);
        }

        // anything else
        // Return false.
        return false;
    }

    // § 4.3.10. Check if three code points would start a number
    function isNumberStart(first, second, third) {
        // Look at the first code point:

        // U+002B PLUS SIGN (+)
        // U+002D HYPHEN-MINUS (-)
        if (first === 0x002B || first === 0x002D) {
            // If the second code point is a digit, return true.
            if (isDigit(second)) {
                return 2;
            }

            // Otherwise, if the second code point is a U+002E FULL STOP (.)
            // and the third code point is a digit, return true.
            // Otherwise, return false.
            return second === 0x002E && isDigit(third) ? 3 : 0;
        }

        // U+002E FULL STOP (.)
        if (first === 0x002E) {
            // If the second code point is a digit, return true. Otherwise, return false.
            return isDigit(second) ? 2 : 0;
        }

        // digit
        if (isDigit(first)) {
            // Return true.
            return 1;
        }

        // anything else
        // Return false.
        return 0;
    }

    //
    // Misc
    //

    // detect BOM (https://en.wikipedia.org/wiki/Byte_order_mark)
    function isBOM(code) {
        // UTF-16BE
        if (code === 0xFEFF) {
            return 1;
        }

        // UTF-16LE
        if (code === 0xFFFE) {
            return 1;
        }

        return 0;
    }

    // Fast code category
    //
    // https://drafts.csswg.org/css-syntax/#tokenizer-definitions
    // > non-ASCII code point
    // >   A code point with a value equal to or greater than U+0080 <control>
    // > name-start code point
    // >   A letter, a non-ASCII code point, or U+005F LOW LINE (_).
    // > name code point
    // >   A name-start code point, a digit, or U+002D HYPHEN-MINUS (-)
    // That means only ASCII code points has a special meaning and we define a maps for 0..127 codes only
    var CATEGORY = new Array(0x80);
    charCodeCategory.Eof = 0x80;
    charCodeCategory.WhiteSpace = 0x82;
    charCodeCategory.Digit = 0x83;
    charCodeCategory.NameStart = 0x84;
    charCodeCategory.NonPrintable = 0x85;

    for (var i = 0; i < CATEGORY.length; i++) {
        switch (true) {
            case isWhiteSpace(i):
                CATEGORY[i] = charCodeCategory.WhiteSpace;
                break;

            case isDigit(i):
                CATEGORY[i] = charCodeCategory.Digit;
                break;

            case isNameStart(i):
                CATEGORY[i] = charCodeCategory.NameStart;
                break;

            case isNonPrintable(i):
                CATEGORY[i] = charCodeCategory.NonPrintable;
                break;

            default:
                CATEGORY[i] = i || charCodeCategory.Eof;
        }
    }

    function charCodeCategory(code) {
        return code < 0x80 ? CATEGORY[code] : charCodeCategory.NameStart;
    }
    var charCodeDefinitions = {
        isDigit: isDigit,
        isHexDigit: isHexDigit,
        isUppercaseLetter: isUppercaseLetter,
        isLowercaseLetter: isLowercaseLetter,
        isLetter: isLetter,
        isNonAscii: isNonAscii,
        isNameStart: isNameStart,
        isName: isName,
        isNonPrintable: isNonPrintable,
        isNewline: isNewline,
        isWhiteSpace: isWhiteSpace,
        isValidEscape: isValidEscape,
        isIdentifierStart: isIdentifierStart,
        isNumberStart: isNumberStart,

        isBOM: isBOM,
        charCodeCategory: charCodeCategory
    };

    var isDigit$1 = charCodeDefinitions.isDigit;
    var isHexDigit$1 = charCodeDefinitions.isHexDigit;
    var isUppercaseLetter$1 = charCodeDefinitions.isUppercaseLetter;
    var isName$1 = charCodeDefinitions.isName;
    var isWhiteSpace$1 = charCodeDefinitions.isWhiteSpace;
    var isValidEscape$1 = charCodeDefinitions.isValidEscape;

    function getCharCode(source, offset) {
        return offset < source.length ? source.charCodeAt(offset) : 0;
    }

    function getNewlineLength(source, offset, code) {
        if (code === 13 /* \r */ && getCharCode(source, offset + 1) === 10 /* \n */) {
            return 2;
        }

        return 1;
    }

    function cmpChar(testStr, offset, referenceCode) {
        var code = testStr.charCodeAt(offset);

        // code.toLowerCase() for A..Z
        if (isUppercaseLetter$1(code)) {
            code = code | 32;
        }

        return code === referenceCode;
    }

    function cmpStr(testStr, start, end, referenceStr) {
        if (end - start !== referenceStr.length) {
            return false;
        }

        if (start < 0 || end > testStr.length) {
            return false;
        }

        for (var i = start; i < end; i++) {
            var testCode = testStr.charCodeAt(i);
            var referenceCode = referenceStr.charCodeAt(i - start);

            // testCode.toLowerCase() for A..Z
            if (isUppercaseLetter$1(testCode)) {
                testCode = testCode | 32;
            }

            if (testCode !== referenceCode) {
                return false;
            }
        }

        return true;
    }

    function findWhiteSpaceStart(source, offset) {
        for (; offset >= 0; offset--) {
            if (!isWhiteSpace$1(source.charCodeAt(offset))) {
                break;
            }
        }

        return offset + 1;
    }

    function findWhiteSpaceEnd(source, offset) {
        for (; offset < source.length; offset++) {
            if (!isWhiteSpace$1(source.charCodeAt(offset))) {
                break;
            }
        }

        return offset;
    }

    function findDecimalNumberEnd(source, offset) {
        for (; offset < source.length; offset++) {
            if (!isDigit$1(source.charCodeAt(offset))) {
                break;
            }
        }

        return offset;
    }

    // § 4.3.7. Consume an escaped code point
    function consumeEscaped(source, offset) {
        // It assumes that the U+005C REVERSE SOLIDUS (\) has already been consumed and
        // that the next input code point has already been verified to be part of a valid escape.
        offset += 2;

        // hex digit
        if (isHexDigit$1(getCharCode(source, offset - 1))) {
            // Consume as many hex digits as possible, but no more than 5.
            // Note that this means 1-6 hex digits have been consumed in total.
            for (var maxOffset = Math.min(source.length, offset + 5); offset < maxOffset; offset++) {
                if (!isHexDigit$1(getCharCode(source, offset))) {
                    break;
                }
            }

            // If the next input code point is whitespace, consume it as well.
            var code = getCharCode(source, offset);
            if (isWhiteSpace$1(code)) {
                offset += getNewlineLength(source, offset, code);
            }
        }

        return offset;
    }

    // §4.3.11. Consume a name
    // Note: This algorithm does not do the verification of the first few code points that are necessary
    // to ensure the returned code points would constitute an <ident-token>. If that is the intended use,
    // ensure that the stream starts with an identifier before calling this algorithm.
    function consumeName(source, offset) {
        // Let result initially be an empty string.
        // Repeatedly consume the next input code point from the stream:
        for (; offset < source.length; offset++) {
            var code = source.charCodeAt(offset);

            // name code point
            if (isName$1(code)) {
                // Append the code point to result.
                continue;
            }

            // the stream starts with a valid escape
            if (isValidEscape$1(code, getCharCode(source, offset + 1))) {
                // Consume an escaped code point. Append the returned code point to result.
                offset = consumeEscaped(source, offset) - 1;
                continue;
            }

            // anything else
            // Reconsume the current input code point. Return result.
            break;
        }

        return offset;
    }

    // §4.3.12. Consume a number
    function consumeNumber(source, offset) {
        var code = source.charCodeAt(offset);

        // 2. If the next input code point is U+002B PLUS SIGN (+) or U+002D HYPHEN-MINUS (-),
        // consume it and append it to repr.
        if (code === 0x002B || code === 0x002D) {
            code = source.charCodeAt(offset += 1);
        }

        // 3. While the next input code point is a digit, consume it and append it to repr.
        if (isDigit$1(code)) {
            offset = findDecimalNumberEnd(source, offset + 1);
            code = source.charCodeAt(offset);
        }

        // 4. If the next 2 input code points are U+002E FULL STOP (.) followed by a digit, then:
        if (code === 0x002E && isDigit$1(source.charCodeAt(offset + 1))) {
            // 4.1 Consume them.
            // 4.2 Append them to repr.
            code = source.charCodeAt(offset += 2);

            // 4.3 Set type to "number".
            // TODO

            // 4.4 While the next input code point is a digit, consume it and append it to repr.

            offset = findDecimalNumberEnd(source, offset);
        }

        // 5. If the next 2 or 3 input code points are U+0045 LATIN CAPITAL LETTER E (E)
        // or U+0065 LATIN SMALL LETTER E (e), ... , followed by a digit, then:
        if (cmpChar(source, offset, 101 /* e */)) {
            var sign = 0;
            code = source.charCodeAt(offset + 1);

            // ... optionally followed by U+002D HYPHEN-MINUS (-) or U+002B PLUS SIGN (+) ...
            if (code === 0x002D || code === 0x002B) {
                sign = 1;
                code = source.charCodeAt(offset + 2);
            }

            // ... followed by a digit
            if (isDigit$1(code)) {
                // 5.1 Consume them.
                // 5.2 Append them to repr.

                // 5.3 Set type to "number".
                // TODO

                // 5.4 While the next input code point is a digit, consume it and append it to repr.
                offset = findDecimalNumberEnd(source, offset + 1 + sign + 1);
            }
        }

        return offset;
    }

    // § 4.3.14. Consume the remnants of a bad url
    // ... its sole use is to consume enough of the input stream to reach a recovery point
    // where normal tokenizing can resume.
    function consumeBadUrlRemnants(source, offset) {
        // Repeatedly consume the next input code point from the stream:
        for (; offset < source.length; offset++) {
            var code = source.charCodeAt(offset);

            // U+0029 RIGHT PARENTHESIS ())
            // EOF
            if (code === 0x0029) {
                // Return.
                offset++;
                break;
            }

            if (isValidEscape$1(code, getCharCode(source, offset + 1))) {
                // Consume an escaped code point.
                // Note: This allows an escaped right parenthesis ("\)") to be encountered
                // without ending the <bad-url-token>. This is otherwise identical to
                // the "anything else" clause.
                offset = consumeEscaped(source, offset);
            }
        }

        return offset;
    }

    var utils = {
        consumeEscaped: consumeEscaped,
        consumeName: consumeName,
        consumeNumber: consumeNumber,
        consumeBadUrlRemnants: consumeBadUrlRemnants,

        cmpChar: cmpChar,
        cmpStr: cmpStr,

        getNewlineLength: getNewlineLength,
        findWhiteSpaceStart: findWhiteSpaceStart,
        findWhiteSpaceEnd: findWhiteSpaceEnd
    };

    var TYPE$1 = _const.TYPE;
    var NAME$1 = _const.NAME;


    var cmpStr$1 = utils.cmpStr;

    var EOF$1 = TYPE$1.EOF;
    var WHITESPACE = TYPE$1.WhiteSpace;
    var COMMENT = TYPE$1.Comment;

    var OFFSET_MASK = 0x00FFFFFF;
    var TYPE_SHIFT = 24;

    var TokenStream = function() {
        this.offsetAndType = null;
        this.balance = null;

        this.reset();
    };

    TokenStream.prototype = {
        reset: function() {
            this.eof = false;
            this.tokenIndex = -1;
            this.tokenType = 0;
            this.tokenStart = this.firstCharOffset;
            this.tokenEnd = this.firstCharOffset;
        },

        lookupType: function(offset) {
            offset += this.tokenIndex;

            if (offset < this.tokenCount) {
                return this.offsetAndType[offset] >> TYPE_SHIFT;
            }

            return EOF$1;
        },
        lookupOffset: function(offset) {
            offset += this.tokenIndex;

            if (offset < this.tokenCount) {
                return this.offsetAndType[offset - 1] & OFFSET_MASK;
            }

            return this.source.length;
        },
        lookupValue: function(offset, referenceStr) {
            offset += this.tokenIndex;

            if (offset < this.tokenCount) {
                return cmpStr$1(
                    this.source,
                    this.offsetAndType[offset - 1] & OFFSET_MASK,
                    this.offsetAndType[offset] & OFFSET_MASK,
                    referenceStr
                );
            }

            return false;
        },
        getTokenStart: function(tokenIndex) {
            if (tokenIndex === this.tokenIndex) {
                return this.tokenStart;
            }

            if (tokenIndex > 0) {
                return tokenIndex < this.tokenCount
                    ? this.offsetAndType[tokenIndex - 1] & OFFSET_MASK
                    : this.offsetAndType[this.tokenCount] & OFFSET_MASK;
            }

            return this.firstCharOffset;
        },

        // TODO: -> skipUntilBalanced
        getRawLength: function(startToken, mode) {
            var cursor = startToken;
            var balanceEnd;
            var offset = this.offsetAndType[Math.max(cursor - 1, 0)] & OFFSET_MASK;
            var type;

            loop:
            for (; cursor < this.tokenCount; cursor++) {
                balanceEnd = this.balance[cursor];

                // stop scanning on balance edge that points to offset before start token
                if (balanceEnd < startToken) {
                    break loop;
                }

                type = this.offsetAndType[cursor] >> TYPE_SHIFT;

                // check token is stop type
                switch (mode(type, this.source, offset)) {
                    case 1:
                        break loop;

                    case 2:
                        cursor++;
                        break loop;

                    default:
                        offset = this.offsetAndType[cursor] & OFFSET_MASK;

                        // fast forward to the end of balanced block
                        if (this.balance[balanceEnd] === cursor) {
                            cursor = balanceEnd;
                        }
                }
            }

            return cursor - this.tokenIndex;
        },
        isBalanceEdge: function(pos) {
            return this.balance[this.tokenIndex] < pos;
        },
        isDelim: function(code, offset) {
            if (offset) {
                return (
                    this.lookupType(offset) === TYPE$1.Delim &&
                    this.source.charCodeAt(this.lookupOffset(offset)) === code
                );
            }

            return (
                this.tokenType === TYPE$1.Delim &&
                this.source.charCodeAt(this.tokenStart) === code
            );
        },

        getTokenValue: function() {
            return this.source.substring(this.tokenStart, this.tokenEnd);
        },
        getTokenLength: function() {
            return this.tokenEnd - this.tokenStart;
        },
        substrToCursor: function(start) {
            return this.source.substring(start, this.tokenStart);
        },

        skipWS: function() {
            for (var i = this.tokenIndex, skipTokenCount = 0; i < this.tokenCount; i++, skipTokenCount++) {
                if ((this.offsetAndType[i] >> TYPE_SHIFT) !== WHITESPACE) {
                    break;
                }
            }

            if (skipTokenCount > 0) {
                this.skip(skipTokenCount);
            }
        },
        skipSC: function() {
            while (this.tokenType === WHITESPACE || this.tokenType === COMMENT) {
                this.next();
            }
        },
        skip: function(tokenCount) {
            var next = this.tokenIndex + tokenCount;

            if (next < this.tokenCount) {
                this.tokenIndex = next;
                this.tokenStart = this.offsetAndType[next - 1] & OFFSET_MASK;
                next = this.offsetAndType[next];
                this.tokenType = next >> TYPE_SHIFT;
                this.tokenEnd = next & OFFSET_MASK;
            } else {
                this.tokenIndex = this.tokenCount;
                this.next();
            }
        },
        next: function() {
            var next = this.tokenIndex + 1;

            if (next < this.tokenCount) {
                this.tokenIndex = next;
                this.tokenStart = this.tokenEnd;
                next = this.offsetAndType[next];
                this.tokenType = next >> TYPE_SHIFT;
                this.tokenEnd = next & OFFSET_MASK;
            } else {
                this.tokenIndex = this.tokenCount;
                this.eof = true;
                this.tokenType = EOF$1;
                this.tokenStart = this.tokenEnd = this.source.length;
            }
        },

        dump: function() {
            var offset = this.firstCharOffset;

            return Array.prototype.slice.call(this.offsetAndType, 0, this.tokenCount).map(function(item, idx) {
                var start = offset;
                var end = item & OFFSET_MASK;

                offset = end;

                return {
                    idx: idx,
                    type: NAME$1[item >> TYPE_SHIFT],
                    chunk: this.source.substring(start, end),
                    balance: this.balance[idx]
                };
            }, this);
        }
    };

    var TokenStream_1 = TokenStream;

    function noop(value) {
        return value;
    }

    function generateMultiplier(multiplier) {
        if (multiplier.min === 0 && multiplier.max === 0) {
            return '*';
        }

        if (multiplier.min === 0 && multiplier.max === 1) {
            return '?';
        }

        if (multiplier.min === 1 && multiplier.max === 0) {
            return multiplier.comma ? '#' : '+';
        }

        if (multiplier.min === 1 && multiplier.max === 1) {
            return '';
        }

        return (
            (multiplier.comma ? '#' : '') +
            (multiplier.min === multiplier.max
                ? '{' + multiplier.min + '}'
                : '{' + multiplier.min + ',' + (multiplier.max !== 0 ? multiplier.max : '') + '}'
            )
        );
    }

    function generateTypeOpts(node) {
        switch (node.type) {
            case 'Range':
                return (
                    ' [' +
                    (node.min === null ? '-∞' : node.min) +
                    ',' +
                    (node.max === null ? '∞' : node.max) +
                    ']'
                );

            default:
                throw new Error('Unknown node type `' + node.type + '`');
        }
    }

    function generateSequence(node, decorate, forceBraces, compact) {
        var combinator = node.combinator === ' ' || compact ? node.combinator : ' ' + node.combinator + ' ';
        var result = node.terms.map(function(term) {
            return generate(term, decorate, forceBraces, compact);
        }).join(combinator);

        if (node.explicit || forceBraces) {
            result = (compact || result[0] === ',' ? '[' : '[ ') + result + (compact ? ']' : ' ]');
        }

        return result;
    }

    function generate(node, decorate, forceBraces, compact) {
        var result;

        switch (node.type) {
            case 'Group':
                result =
                    generateSequence(node, decorate, forceBraces, compact) +
                    (node.disallowEmpty ? '!' : '');
                break;

            case 'Multiplier':
                // return since node is a composition
                return (
                    generate(node.term, decorate, forceBraces, compact) +
                    decorate(generateMultiplier(node), node)
                );

            case 'Type':
                result = '<' + node.name + (node.opts ? decorate(generateTypeOpts(node.opts), node.opts) : '') + '>';
                break;

            case 'Property':
                result = '<\'' + node.name + '\'>';
                break;

            case 'Keyword':
                result = node.name;
                break;

            case 'AtKeyword':
                result = '@' + node.name;
                break;

            case 'Function':
                result = node.name + '(';
                break;

            case 'String':
            case 'Token':
                result = node.value;
                break;

            case 'Comma':
                result = ',';
                break;

            default:
                throw new Error('Unknown node type `' + node.type + '`');
        }

        return decorate(result, node);
    }

    var generate_1 = function(node, options) {
        var decorate = noop;
        var forceBraces = false;
        var compact = false;

        if (typeof options === 'function') {
            decorate = options;
        } else if (options) {
            forceBraces = Boolean(options.forceBraces);
            compact = Boolean(options.compact);
            if (typeof options.decorate === 'function') {
                decorate = options.decorate;
            }
        }

        return generate(node, decorate, forceBraces, compact);
    };

    function fromMatchResult(matchResult) {
        var tokens = matchResult.tokens;
        var longestMatch = matchResult.longestMatch;
        var node = longestMatch < tokens.length ? tokens[longestMatch].node : null;
        var mismatchOffset = -1;
        var entries = 0;
        var css = '';

        for (var i = 0; i < tokens.length; i++) {
            if (i === longestMatch) {
                mismatchOffset = css.length;
            }

            if (node !== null && tokens[i].node === node) {
                if (i <= longestMatch) {
                    entries++;
                } else {
                    entries = 0;
                }
            }

            css += tokens[i].value;
        }

        return {
            node: node,
            css: css,
            mismatchOffset: mismatchOffset === -1 ? css.length : mismatchOffset,
            last: node === null || entries > 1
        };
    }

    function getLocation(node, point) {
        var loc = node && node.loc && node.loc[point];

        if (loc) {
            return {
                offset: loc.offset,
                line: loc.line,
                column: loc.column
            };
        }

        return null;
    }

    var SyntaxReferenceError = function(type, referenceName) {
        var error = createCustomError(
            'SyntaxReferenceError',
            type + (referenceName ? ' `' + referenceName + '`' : '')
        );

        error.reference = referenceName;

        return error;
    };

    var MatchError = function(message, syntax, node, matchResult) {
        var error = createCustomError('SyntaxMatchError', message);
        var details = fromMatchResult(matchResult);
        var mismatchOffset = details.mismatchOffset || 0;
        var badNode = details.node || node;
        var end = getLocation(badNode, 'end');
        var start = details.last ? end : getLocation(badNode, 'start');
        var css = details.css;

        error.rawMessage = message;
        error.syntax = syntax ? generate_1(syntax) : '<generic>';
        error.css = css;
        error.mismatchOffset = mismatchOffset;
        error.loc = {
            source: (badNode && badNode.loc && badNode.loc.source) || '<unknown>',
            start: start,
            end: end
        };
        error.line = start ? start.line : undefined;
        error.column = start ? start.column : undefined;
        error.offset = start ? start.offset : undefined;
        error.message = message + '\n' +
            '  syntax: ' + error.syntax + '\n' +
            '   value: ' + (error.css || '<empty string>') + '\n' +
            '  --------' + new Array(error.mismatchOffset + 1).join('-') + '^';

        return error;
    };

    var error = {
        SyntaxReferenceError: SyntaxReferenceError,
        MatchError: MatchError
    };

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var keywords = Object.create(null);
    var properties = Object.create(null);
    var HYPHENMINUS = 45; // '-'.charCodeAt()

    function isCustomProperty(str, offset) {
        offset = offset || 0;

        return str.length - offset >= 2 &&
               str.charCodeAt(offset) === HYPHENMINUS &&
               str.charCodeAt(offset + 1) === HYPHENMINUS;
    }

    function getVendorPrefix(str, offset) {
        offset = offset || 0;

        // verdor prefix should be at least 3 chars length
        if (str.length - offset >= 3) {
            // vendor prefix starts with hyper minus following non-hyper minus
            if (str.charCodeAt(offset) === HYPHENMINUS &&
                str.charCodeAt(offset + 1) !== HYPHENMINUS) {
                // vendor prefix should contain a hyper minus at the ending
                var secondDashIndex = str.indexOf('-', offset + 2);

                if (secondDashIndex !== -1) {
                    return str.substring(offset, secondDashIndex + 1);
                }
            }
        }

        return '';
    }

    function getKeywordDescriptor(keyword) {
        if (hasOwnProperty.call(keywords, keyword)) {
            return keywords[keyword];
        }

        var name = keyword.toLowerCase();

        if (hasOwnProperty.call(keywords, name)) {
            return keywords[keyword] = keywords[name];
        }

        var custom = isCustomProperty(name, 0);
        var vendor = !custom ? getVendorPrefix(name, 0) : '';

        return keywords[keyword] = Object.freeze({
            basename: name.substr(vendor.length),
            name: name,
            vendor: vendor,
            prefix: vendor,
            custom: custom
        });
    }

    function getPropertyDescriptor(property) {
        if (hasOwnProperty.call(properties, property)) {
            return properties[property];
        }

        var name = property;
        var hack = property[0];

        if (hack === '/') {
            hack = property[1] === '/' ? '//' : '/';
        } else if (hack !== '_' &&
                   hack !== '*' &&
                   hack !== '$' &&
                   hack !== '#' &&
                   hack !== '+' &&
                   hack !== '&') {
            hack = '';
        }

        var custom = isCustomProperty(name, hack.length);

        // re-use result when possible (the same as for lower case)
        if (!custom) {
            name = name.toLowerCase();
            if (hasOwnProperty.call(properties, name)) {
                return properties[property] = properties[name];
            }
        }

        var vendor = !custom ? getVendorPrefix(name, hack.length) : '';
        var prefix = name.substr(0, hack.length + vendor.length);

        return properties[property] = Object.freeze({
            basename: name.substr(prefix.length),
            name: name.substr(hack.length),
            hack: hack,
            vendor: vendor,
            prefix: prefix,
            custom: custom
        });
    }

    var names = {
        keyword: getKeywordDescriptor,
        property: getPropertyDescriptor,
        isCustomProperty: isCustomProperty,
        vendorPrefix: getVendorPrefix
    };

    var MIN_SIZE = 16 * 1024;
    var SafeUint32Array = typeof Uint32Array !== 'undefined' ? Uint32Array : Array; // fallback on Array when TypedArray is not supported

    var adoptBuffer = function adoptBuffer(buffer, size) {
        if (buffer === null || buffer.length < size) {
            return new SafeUint32Array(Math.max(size + 1024, MIN_SIZE));
        }

        return buffer;
    };

    var TYPE$2 = _const.TYPE;


    var isNewline$1 = charCodeDefinitions.isNewline;
    var isName$2 = charCodeDefinitions.isName;
    var isValidEscape$2 = charCodeDefinitions.isValidEscape;
    var isNumberStart$1 = charCodeDefinitions.isNumberStart;
    var isIdentifierStart$1 = charCodeDefinitions.isIdentifierStart;
    var charCodeCategory$1 = charCodeDefinitions.charCodeCategory;
    var isBOM$1 = charCodeDefinitions.isBOM;


    var cmpStr$2 = utils.cmpStr;
    var getNewlineLength$1 = utils.getNewlineLength;
    var findWhiteSpaceEnd$1 = utils.findWhiteSpaceEnd;
    var consumeEscaped$1 = utils.consumeEscaped;
    var consumeName$1 = utils.consumeName;
    var consumeNumber$1 = utils.consumeNumber;
    var consumeBadUrlRemnants$1 = utils.consumeBadUrlRemnants;

    var OFFSET_MASK$1 = 0x00FFFFFF;
    var TYPE_SHIFT$1 = 24;

    function tokenize(source, stream) {
        function getCharCode(offset) {
            return offset < sourceLength ? source.charCodeAt(offset) : 0;
        }

        // § 4.3.3. Consume a numeric token
        function consumeNumericToken() {
            // Consume a number and let number be the result.
            offset = consumeNumber$1(source, offset);

            // If the next 3 input code points would start an identifier, then:
            if (isIdentifierStart$1(getCharCode(offset), getCharCode(offset + 1), getCharCode(offset + 2))) {
                // Create a <dimension-token> with the same value and type flag as number, and a unit set initially to the empty string.
                // Consume a name. Set the <dimension-token>’s unit to the returned value.
                // Return the <dimension-token>.
                type = TYPE$2.Dimension;
                offset = consumeName$1(source, offset);
                return;
            }

            // Otherwise, if the next input code point is U+0025 PERCENTAGE SIGN (%), consume it.
            if (getCharCode(offset) === 0x0025) {
                // Create a <percentage-token> with the same value as number, and return it.
                type = TYPE$2.Percentage;
                offset++;
                return;
            }

            // Otherwise, create a <number-token> with the same value and type flag as number, and return it.
            type = TYPE$2.Number;
        }

        // § 4.3.4. Consume an ident-like token
        function consumeIdentLikeToken() {
            const nameStartOffset = offset;

            // Consume a name, and let string be the result.
            offset = consumeName$1(source, offset);

            // If string’s value is an ASCII case-insensitive match for "url",
            // and the next input code point is U+0028 LEFT PARENTHESIS ((), consume it.
            if (cmpStr$2(source, nameStartOffset, offset, 'url') && getCharCode(offset) === 0x0028) {
                // While the next two input code points are whitespace, consume the next input code point.
                offset = findWhiteSpaceEnd$1(source, offset + 1);

                // If the next one or two input code points are U+0022 QUOTATION MARK ("), U+0027 APOSTROPHE ('),
                // or whitespace followed by U+0022 QUOTATION MARK (") or U+0027 APOSTROPHE ('),
                // then create a <function-token> with its value set to string and return it.
                if (getCharCode(offset) === 0x0022 ||
                    getCharCode(offset) === 0x0027) {
                    type = TYPE$2.Function;
                    offset = nameStartOffset + 4;
                    return;
                }

                // Otherwise, consume a url token, and return it.
                consumeUrlToken();
                return;
            }

            // Otherwise, if the next input code point is U+0028 LEFT PARENTHESIS ((), consume it.
            // Create a <function-token> with its value set to string and return it.
            if (getCharCode(offset) === 0x0028) {
                type = TYPE$2.Function;
                offset++;
                return;
            }

            // Otherwise, create an <ident-token> with its value set to string and return it.
            type = TYPE$2.Ident;
        }

        // § 4.3.5. Consume a string token
        function consumeStringToken(endingCodePoint) {
            // This algorithm may be called with an ending code point, which denotes the code point
            // that ends the string. If an ending code point is not specified,
            // the current input code point is used.
            if (!endingCodePoint) {
                endingCodePoint = getCharCode(offset++);
            }

            // Initially create a <string-token> with its value set to the empty string.
            type = TYPE$2.String;

            // Repeatedly consume the next input code point from the stream:
            for (; offset < source.length; offset++) {
                var code = source.charCodeAt(offset);

                switch (charCodeCategory$1(code)) {
                    // ending code point
                    case endingCodePoint:
                        // Return the <string-token>.
                        offset++;
                        return;

                    // EOF
                    case charCodeCategory$1.Eof:
                        // This is a parse error. Return the <string-token>.
                        return;

                    // newline
                    case charCodeCategory$1.WhiteSpace:
                        if (isNewline$1(code)) {
                            // This is a parse error. Reconsume the current input code point,
                            // create a <bad-string-token>, and return it.
                            offset += getNewlineLength$1(source, offset, code);
                            type = TYPE$2.BadString;
                            return;
                        }
                        break;

                    // U+005C REVERSE SOLIDUS (\)
                    case 0x005C:
                        // If the next input code point is EOF, do nothing.
                        if (offset === source.length - 1) {
                            break;
                        }

                        var nextCode = getCharCode(offset + 1);

                        // Otherwise, if the next input code point is a newline, consume it.
                        if (isNewline$1(nextCode)) {
                            offset += getNewlineLength$1(source, offset + 1, nextCode);
                        } else if (isValidEscape$2(code, nextCode)) {
                            // Otherwise, (the stream starts with a valid escape) consume
                            // an escaped code point and append the returned code point to
                            // the <string-token>’s value.
                            offset = consumeEscaped$1(source, offset) - 1;
                        }
                        break;

                    // anything else
                    // Append the current input code point to the <string-token>’s value.
                }
            }
        }

        // § 4.3.6. Consume a url token
        // Note: This algorithm assumes that the initial "url(" has already been consumed.
        // This algorithm also assumes that it’s being called to consume an "unquoted" value, like url(foo).
        // A quoted value, like url("foo"), is parsed as a <function-token>. Consume an ident-like token
        // automatically handles this distinction; this algorithm shouldn’t be called directly otherwise.
        function consumeUrlToken() {
            // Initially create a <url-token> with its value set to the empty string.
            type = TYPE$2.Url;

            // Consume as much whitespace as possible.
            offset = findWhiteSpaceEnd$1(source, offset);

            // Repeatedly consume the next input code point from the stream:
            for (; offset < source.length; offset++) {
                var code = source.charCodeAt(offset);

                switch (charCodeCategory$1(code)) {
                    // U+0029 RIGHT PARENTHESIS ())
                    case 0x0029:
                        // Return the <url-token>.
                        offset++;
                        return;

                    // EOF
                    case charCodeCategory$1.Eof:
                        // This is a parse error. Return the <url-token>.
                        return;

                    // whitespace
                    case charCodeCategory$1.WhiteSpace:
                        // Consume as much whitespace as possible.
                        offset = findWhiteSpaceEnd$1(source, offset);

                        // If the next input code point is U+0029 RIGHT PARENTHESIS ()) or EOF,
                        // consume it and return the <url-token>
                        // (if EOF was encountered, this is a parse error);
                        if (getCharCode(offset) === 0x0029 || offset >= source.length) {
                            if (offset < source.length) {
                                offset++;
                            }
                            return;
                        }

                        // otherwise, consume the remnants of a bad url, create a <bad-url-token>,
                        // and return it.
                        offset = consumeBadUrlRemnants$1(source, offset);
                        type = TYPE$2.BadUrl;
                        return;

                    // U+0022 QUOTATION MARK (")
                    // U+0027 APOSTROPHE (')
                    // U+0028 LEFT PARENTHESIS (()
                    // non-printable code point
                    case 0x0022:
                    case 0x0027:
                    case 0x0028:
                    case charCodeCategory$1.NonPrintable:
                        // This is a parse error. Consume the remnants of a bad url,
                        // create a <bad-url-token>, and return it.
                        offset = consumeBadUrlRemnants$1(source, offset);
                        type = TYPE$2.BadUrl;
                        return;

                    // U+005C REVERSE SOLIDUS (\)
                    case 0x005C:
                        // If the stream starts with a valid escape, consume an escaped code point and
                        // append the returned code point to the <url-token>’s value.
                        if (isValidEscape$2(code, getCharCode(offset + 1))) {
                            offset = consumeEscaped$1(source, offset) - 1;
                            break;
                        }

                        // Otherwise, this is a parse error. Consume the remnants of a bad url,
                        // create a <bad-url-token>, and return it.
                        offset = consumeBadUrlRemnants$1(source, offset);
                        type = TYPE$2.BadUrl;
                        return;

                    // anything else
                    // Append the current input code point to the <url-token>’s value.
                }
            }
        }

        if (!stream) {
            stream = new TokenStream_1();
        }

        // ensure source is a string
        source = String(source || '');

        var sourceLength = source.length;
        var offsetAndType = adoptBuffer(stream.offsetAndType, sourceLength + 1); // +1 because of eof-token
        var balance = adoptBuffer(stream.balance, sourceLength + 1);
        var tokenCount = 0;
        var start = isBOM$1(getCharCode(0));
        var offset = start;
        var balanceCloseType = 0;
        var balanceStart = 0;
        var balancePrev = 0;

        // https://drafts.csswg.org/css-syntax-3/#consume-token
        // § 4.3.1. Consume a token
        while (offset < sourceLength) {
            var code = source.charCodeAt(offset);
            var type = 0;

            balance[tokenCount] = sourceLength;

            switch (charCodeCategory$1(code)) {
                // whitespace
                case charCodeCategory$1.WhiteSpace:
                    // Consume as much whitespace as possible. Return a <whitespace-token>.
                    type = TYPE$2.WhiteSpace;
                    offset = findWhiteSpaceEnd$1(source, offset + 1);
                    break;

                // U+0022 QUOTATION MARK (")
                case 0x0022:
                    // Consume a string token and return it.
                    consumeStringToken();
                    break;

                // U+0023 NUMBER SIGN (#)
                case 0x0023:
                    // If the next input code point is a name code point or the next two input code points are a valid escape, then:
                    if (isName$2(getCharCode(offset + 1)) || isValidEscape$2(getCharCode(offset + 1), getCharCode(offset + 2))) {
                        // Create a <hash-token>.
                        type = TYPE$2.Hash;

                        // If the next 3 input code points would start an identifier, set the <hash-token>’s type flag to "id".
                        // if (isIdentifierStart(getCharCode(offset + 1), getCharCode(offset + 2), getCharCode(offset + 3))) {
                        //     // TODO: set id flag
                        // }

                        // Consume a name, and set the <hash-token>’s value to the returned string.
                        offset = consumeName$1(source, offset + 1);

                        // Return the <hash-token>.
                    } else {
                        // Otherwise, return a <delim-token> with its value set to the current input code point.
                        type = TYPE$2.Delim;
                        offset++;
                    }

                    break;

                // U+0027 APOSTROPHE (')
                case 0x0027:
                    // Consume a string token and return it.
                    consumeStringToken();
                    break;

                // U+0028 LEFT PARENTHESIS (()
                case 0x0028:
                    // Return a <(-token>.
                    type = TYPE$2.LeftParenthesis;
                    offset++;
                    break;

                // U+0029 RIGHT PARENTHESIS ())
                case 0x0029:
                    // Return a <)-token>.
                    type = TYPE$2.RightParenthesis;
                    offset++;
                    break;

                // U+002B PLUS SIGN (+)
                case 0x002B:
                    // If the input stream starts with a number, ...
                    if (isNumberStart$1(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                        // ... reconsume the current input code point, consume a numeric token, and return it.
                        consumeNumericToken();
                    } else {
                        // Otherwise, return a <delim-token> with its value set to the current input code point.
                        type = TYPE$2.Delim;
                        offset++;
                    }
                    break;

                // U+002C COMMA (,)
                case 0x002C:
                    // Return a <comma-token>.
                    type = TYPE$2.Comma;
                    offset++;
                    break;

                // U+002D HYPHEN-MINUS (-)
                case 0x002D:
                    // If the input stream starts with a number, reconsume the current input code point, consume a numeric token, and return it.
                    if (isNumberStart$1(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                        consumeNumericToken();
                    } else {
                        // Otherwise, if the next 2 input code points are U+002D HYPHEN-MINUS U+003E GREATER-THAN SIGN (->), consume them and return a <CDC-token>.
                        if (getCharCode(offset + 1) === 0x002D &&
                            getCharCode(offset + 2) === 0x003E) {
                            type = TYPE$2.CDC;
                            offset = offset + 3;
                        } else {
                            // Otherwise, if the input stream starts with an identifier, ...
                            if (isIdentifierStart$1(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                                // ... reconsume the current input code point, consume an ident-like token, and return it.
                                consumeIdentLikeToken();
                            } else {
                                // Otherwise, return a <delim-token> with its value set to the current input code point.
                                type = TYPE$2.Delim;
                                offset++;
                            }
                        }
                    }
                    break;

                // U+002E FULL STOP (.)
                case 0x002E:
                    // If the input stream starts with a number, ...
                    if (isNumberStart$1(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                        // ... reconsume the current input code point, consume a numeric token, and return it.
                        consumeNumericToken();
                    } else {
                        // Otherwise, return a <delim-token> with its value set to the current input code point.
                        type = TYPE$2.Delim;
                        offset++;
                    }

                    break;

                // U+002F SOLIDUS (/)
                case 0x002F:
                    // If the next two input code point are U+002F SOLIDUS (/) followed by a U+002A ASTERISK (*),
                    if (getCharCode(offset + 1) === 0x002A) {
                        // ... consume them and all following code points up to and including the first U+002A ASTERISK (*)
                        // followed by a U+002F SOLIDUS (/), or up to an EOF code point.
                        type = TYPE$2.Comment;
                        offset = source.indexOf('*/', offset + 2) + 2;
                        if (offset === 1) {
                            offset = source.length;
                        }
                    } else {
                        type = TYPE$2.Delim;
                        offset++;
                    }
                    break;

                // U+003A COLON (:)
                case 0x003A:
                    // Return a <colon-token>.
                    type = TYPE$2.Colon;
                    offset++;
                    break;

                // U+003B SEMICOLON (;)
                case 0x003B:
                    // Return a <semicolon-token>.
                    type = TYPE$2.Semicolon;
                    offset++;
                    break;

                // U+003C LESS-THAN SIGN (<)
                case 0x003C:
                    // If the next 3 input code points are U+0021 EXCLAMATION MARK U+002D HYPHEN-MINUS U+002D HYPHEN-MINUS (!--), ...
                    if (getCharCode(offset + 1) === 0x0021 &&
                        getCharCode(offset + 2) === 0x002D &&
                        getCharCode(offset + 3) === 0x002D) {
                        // ... consume them and return a <CDO-token>.
                        type = TYPE$2.CDO;
                        offset = offset + 4;
                    } else {
                        // Otherwise, return a <delim-token> with its value set to the current input code point.
                        type = TYPE$2.Delim;
                        offset++;
                    }

                    break;

                // U+0040 COMMERCIAL AT (@)
                case 0x0040:
                    // If the next 3 input code points would start an identifier, ...
                    if (isIdentifierStart$1(getCharCode(offset + 1), getCharCode(offset + 2), getCharCode(offset + 3))) {
                        // ... consume a name, create an <at-keyword-token> with its value set to the returned value, and return it.
                        type = TYPE$2.AtKeyword;
                        offset = consumeName$1(source, offset + 1);
                    } else {
                        // Otherwise, return a <delim-token> with its value set to the current input code point.
                        type = TYPE$2.Delim;
                        offset++;
                    }

                    break;

                // U+005B LEFT SQUARE BRACKET ([)
                case 0x005B:
                    // Return a <[-token>.
                    type = TYPE$2.LeftSquareBracket;
                    offset++;
                    break;

                // U+005C REVERSE SOLIDUS (\)
                case 0x005C:
                    // If the input stream starts with a valid escape, ...
                    if (isValidEscape$2(code, getCharCode(offset + 1))) {
                        // ... reconsume the current input code point, consume an ident-like token, and return it.
                        consumeIdentLikeToken();
                    } else {
                        // Otherwise, this is a parse error. Return a <delim-token> with its value set to the current input code point.
                        type = TYPE$2.Delim;
                        offset++;
                    }
                    break;

                // U+005D RIGHT SQUARE BRACKET (])
                case 0x005D:
                    // Return a <]-token>.
                    type = TYPE$2.RightSquareBracket;
                    offset++;
                    break;

                // U+007B LEFT CURLY BRACKET ({)
                case 0x007B:
                    // Return a <{-token>.
                    type = TYPE$2.LeftCurlyBracket;
                    offset++;
                    break;

                // U+007D RIGHT CURLY BRACKET (})
                case 0x007D:
                    // Return a <}-token>.
                    type = TYPE$2.RightCurlyBracket;
                    offset++;
                    break;

                // digit
                case charCodeCategory$1.Digit:
                    // Reconsume the current input code point, consume a numeric token, and return it.
                    consumeNumericToken();
                    break;

                // name-start code point
                case charCodeCategory$1.NameStart:
                    // Reconsume the current input code point, consume an ident-like token, and return it.
                    consumeIdentLikeToken();
                    break;

                // EOF
                case charCodeCategory$1.Eof:
                    // Return an <EOF-token>.
                    break;

                // anything else
                default:
                    // Return a <delim-token> with its value set to the current input code point.
                    type = TYPE$2.Delim;
                    offset++;
            }

            switch (type) {
                case balanceCloseType:
                    balancePrev = balanceStart & OFFSET_MASK$1;
                    balanceStart = balance[balancePrev];
                    balanceCloseType = balanceStart >> TYPE_SHIFT$1;
                    balance[tokenCount] = balancePrev;
                    balance[balancePrev++] = tokenCount;
                    for (; balancePrev < tokenCount; balancePrev++) {
                        if (balance[balancePrev] === sourceLength) {
                            balance[balancePrev] = tokenCount;
                        }
                    }
                    break;

                case TYPE$2.LeftParenthesis:
                case TYPE$2.Function:
                    balance[tokenCount] = balanceStart;
                    balanceCloseType = TYPE$2.RightParenthesis;
                    balanceStart = (balanceCloseType << TYPE_SHIFT$1) | tokenCount;
                    break;

                case TYPE$2.LeftSquareBracket:
                    balance[tokenCount] = balanceStart;
                    balanceCloseType = TYPE$2.RightSquareBracket;
                    balanceStart = (balanceCloseType << TYPE_SHIFT$1) | tokenCount;
                    break;

                case TYPE$2.LeftCurlyBracket:
                    balance[tokenCount] = balanceStart;
                    balanceCloseType = TYPE$2.RightCurlyBracket;
                    balanceStart = (balanceCloseType << TYPE_SHIFT$1) | tokenCount;
                    break;
            }

            offsetAndType[tokenCount++] = (type << TYPE_SHIFT$1) | offset;
        }

        // finalize buffers
        offsetAndType[tokenCount] = (TYPE$2.EOF << TYPE_SHIFT$1) | offset; // <EOF-token>
        balance[tokenCount] = sourceLength;
        balance[sourceLength] = sourceLength; // prevents false positive balance match with any token
        while (balanceStart !== 0) {
            balancePrev = balanceStart & OFFSET_MASK$1;
            balanceStart = balance[balancePrev];
            balance[balancePrev] = sourceLength;
        }

        // update stream
        stream.source = source;
        stream.firstCharOffset = start;
        stream.offsetAndType = offsetAndType;
        stream.tokenCount = tokenCount;
        stream.balance = balance;
        stream.reset();
        stream.next();

        return stream;
    }

    // extend tokenizer with constants
    Object.keys(_const).forEach(function(key) {
        tokenize[key] = _const[key];
    });

    // extend tokenizer with static methods from utils
    Object.keys(charCodeDefinitions).forEach(function(key) {
        tokenize[key] = charCodeDefinitions[key];
    });
    Object.keys(utils).forEach(function(key) {
        tokenize[key] = utils[key];
    });

    var tokenizer = tokenize;

    var isDigit$2 = tokenizer.isDigit;
    var cmpChar$1 = tokenizer.cmpChar;
    var TYPE$3 = tokenizer.TYPE;

    var DELIM = TYPE$3.Delim;
    var WHITESPACE$1 = TYPE$3.WhiteSpace;
    var COMMENT$1 = TYPE$3.Comment;
    var IDENT = TYPE$3.Ident;
    var NUMBER = TYPE$3.Number;
    var DIMENSION = TYPE$3.Dimension;
    var PLUSSIGN = 0x002B;    // U+002B PLUS SIGN (+)
    var HYPHENMINUS$1 = 0x002D; // U+002D HYPHEN-MINUS (-)
    var N = 0x006E;           // U+006E LATIN SMALL LETTER N (n)
    var DISALLOW_SIGN = true;
    var ALLOW_SIGN = false;

    function isDelim(token, code) {
        return token !== null && token.type === DELIM && token.value.charCodeAt(0) === code;
    }

    function skipSC(token, offset, getNextToken) {
        while (token !== null && (token.type === WHITESPACE$1 || token.type === COMMENT$1)) {
            token = getNextToken(++offset);
        }

        return offset;
    }

    function checkInteger(token, valueOffset, disallowSign, offset) {
        if (!token) {
            return 0;
        }

        var code = token.value.charCodeAt(valueOffset);

        if (code === PLUSSIGN || code === HYPHENMINUS$1) {
            if (disallowSign) {
                // Number sign is not allowed
                return 0;
            }
            valueOffset++;
        }

        for (; valueOffset < token.value.length; valueOffset++) {
            if (!isDigit$2(token.value.charCodeAt(valueOffset))) {
                // Integer is expected
                return 0;
            }
        }

        return offset + 1;
    }

    // ... <signed-integer>
    // ... ['+' | '-'] <signless-integer>
    function consumeB(token, offset_, getNextToken) {
        var sign = false;
        var offset = skipSC(token, offset_, getNextToken);

        token = getNextToken(offset);

        if (token === null) {
            return offset_;
        }

        if (token.type !== NUMBER) {
            if (isDelim(token, PLUSSIGN) || isDelim(token, HYPHENMINUS$1)) {
                sign = true;
                offset = skipSC(getNextToken(++offset), offset, getNextToken);
                token = getNextToken(offset);

                if (token === null && token.type !== NUMBER) {
                    return 0;
                }
            } else {
                return offset_;
            }
        }

        if (!sign) {
            var code = token.value.charCodeAt(0);
            if (code !== PLUSSIGN && code !== HYPHENMINUS$1) {
                // Number sign is expected
                return 0;
            }
        }

        return checkInteger(token, sign ? 0 : 1, sign, offset);
    }

    // An+B microsyntax https://www.w3.org/TR/css-syntax-3/#anb
    var genericAnPlusB = function anPlusB(token, getNextToken) {
        /* eslint-disable brace-style*/
        var offset = 0;

        if (!token) {
            return 0;
        }

        // <integer>
        if (token.type === NUMBER) {
            return checkInteger(token, 0, ALLOW_SIGN, offset); // b
        }

        // -n
        // -n <signed-integer>
        // -n ['+' | '-'] <signless-integer>
        // -n- <signless-integer>
        // <dashndashdigit-ident>
        else if (token.type === IDENT && token.value.charCodeAt(0) === HYPHENMINUS$1) {
            // expect 1st char is N
            if (!cmpChar$1(token.value, 1, N)) {
                return 0;
            }

            switch (token.value.length) {
                // -n
                // -n <signed-integer>
                // -n ['+' | '-'] <signless-integer>
                case 2:
                    return consumeB(getNextToken(++offset), offset, getNextToken);

                // -n- <signless-integer>
                case 3:
                    if (token.value.charCodeAt(2) !== HYPHENMINUS$1) {
                        return 0;
                    }

                    offset = skipSC(getNextToken(++offset), offset, getNextToken);
                    token = getNextToken(offset);

                    return checkInteger(token, 0, DISALLOW_SIGN, offset);

                // <dashndashdigit-ident>
                default:
                    if (token.value.charCodeAt(2) !== HYPHENMINUS$1) {
                        return 0;
                    }

                    return checkInteger(token, 3, DISALLOW_SIGN, offset);
            }
        }

        // '+'? n
        // '+'? n <signed-integer>
        // '+'? n ['+' | '-'] <signless-integer>
        // '+'? n- <signless-integer>
        // '+'? <ndashdigit-ident>
        else if (token.type === IDENT || (isDelim(token, PLUSSIGN) && getNextToken(offset + 1).type === IDENT)) {
            // just ignore a plus
            if (token.type !== IDENT) {
                token = getNextToken(++offset);
            }

            if (token === null || !cmpChar$1(token.value, 0, N)) {
                return 0;
            }

            switch (token.value.length) {
                // '+'? n
                // '+'? n <signed-integer>
                // '+'? n ['+' | '-'] <signless-integer>
                case 1:
                    return consumeB(getNextToken(++offset), offset, getNextToken);

                // '+'? n- <signless-integer>
                case 2:
                    if (token.value.charCodeAt(1) !== HYPHENMINUS$1) {
                        return 0;
                    }

                    offset = skipSC(getNextToken(++offset), offset, getNextToken);
                    token = getNextToken(offset);

                    return checkInteger(token, 0, DISALLOW_SIGN, offset);

                // '+'? <ndashdigit-ident>
                default:
                    if (token.value.charCodeAt(1) !== HYPHENMINUS$1) {
                        return 0;
                    }

                    return checkInteger(token, 2, DISALLOW_SIGN, offset);
            }
        }

        // <ndashdigit-dimension>
        // <ndash-dimension> <signless-integer>
        // <n-dimension>
        // <n-dimension> <signed-integer>
        // <n-dimension> ['+' | '-'] <signless-integer>
        else if (token.type === DIMENSION) {
            var code = token.value.charCodeAt(0);
            var sign = code === PLUSSIGN || code === HYPHENMINUS$1 ? 1 : 0;

            for (var i = sign; i < token.value.length; i++) {
                if (!isDigit$2(token.value.charCodeAt(i))) {
                    break;
                }
            }

            if (i === sign) {
                // Integer is expected
                return 0;
            }

            if (!cmpChar$1(token.value, i, N)) {
                return 0;
            }

            // <n-dimension>
            // <n-dimension> <signed-integer>
            // <n-dimension> ['+' | '-'] <signless-integer>
            if (i + 1 === token.value.length) {
                return consumeB(getNextToken(++offset), offset, getNextToken);
            } else {
                if (token.value.charCodeAt(i + 1) !== HYPHENMINUS$1) {
                    return 0;
                }

                // <ndash-dimension> <signless-integer>
                if (i + 2 === token.value.length) {
                    offset = skipSC(getNextToken(++offset), offset, getNextToken);
                    token = getNextToken(offset);

                    return checkInteger(token, 0, DISALLOW_SIGN, offset);
                }
                // <ndashdigit-dimension>
                else {
                    return checkInteger(token, i + 2, DISALLOW_SIGN, offset);
                }
            }
        }

        return 0;
    };

    var isHexDigit$2 = tokenizer.isHexDigit;
    var cmpChar$2 = tokenizer.cmpChar;
    var TYPE$4 = tokenizer.TYPE;

    var IDENT$1 = TYPE$4.Ident;
    var DELIM$1 = TYPE$4.Delim;
    var NUMBER$1 = TYPE$4.Number;
    var DIMENSION$1 = TYPE$4.Dimension;
    var PLUSSIGN$1 = 0x002B;     // U+002B PLUS SIGN (+)
    var HYPHENMINUS$2 = 0x002D;  // U+002D HYPHEN-MINUS (-)
    var QUESTIONMARK = 0x003F; // U+003F QUESTION MARK (?)
    var U = 0x0075;            // U+0075 LATIN SMALL LETTER U (u)

    function isDelim$1(token, code) {
        return token !== null && token.type === DELIM$1 && token.value.charCodeAt(0) === code;
    }

    function startsWith(token, code) {
        return token.value.charCodeAt(0) === code;
    }

    function hexSequence(token, offset, allowDash) {
        for (var pos = offset, hexlen = 0; pos < token.value.length; pos++) {
            var code = token.value.charCodeAt(pos);

            if (code === HYPHENMINUS$2 && allowDash && hexlen !== 0) {
                if (hexSequence(token, offset + hexlen + 1, false) > 0) {
                    return 6; // dissallow following question marks
                }

                return 0; // dash at the ending of a hex sequence is not allowed
            }

            if (!isHexDigit$2(code)) {
                return 0; // not a hex digit
            }

            if (++hexlen > 6) {
                return 0; // too many hex digits
            }    }

        return hexlen;
    }

    function withQuestionMarkSequence(consumed, length, getNextToken) {
        if (!consumed) {
            return 0; // nothing consumed
        }

        while (isDelim$1(getNextToken(length), QUESTIONMARK)) {
            if (++consumed > 6) {
                return 0; // too many question marks
            }

            length++;
        }

        return length;
    }

    // https://drafts.csswg.org/css-syntax/#urange
    // Informally, the <urange> production has three forms:
    // U+0001
    //      Defines a range consisting of a single code point, in this case the code point "1".
    // U+0001-00ff
    //      Defines a range of codepoints between the first and the second value, in this case
    //      the range between "1" and "ff" (255 in decimal) inclusive.
    // U+00??
    //      Defines a range of codepoints where the "?" characters range over all hex digits,
    //      in this case defining the same as the value U+0000-00ff.
    // In each form, a maximum of 6 digits is allowed for each hexadecimal number (if you treat "?" as a hexadecimal digit).
    //
    // <urange> =
    //   u '+' <ident-token> '?'* |
    //   u <dimension-token> '?'* |
    //   u <number-token> '?'* |
    //   u <number-token> <dimension-token> |
    //   u <number-token> <number-token> |
    //   u '+' '?'+
    var genericUrange = function urange(token, getNextToken) {
        var length = 0;

        // should start with `u` or `U`
        if (token === null || token.type !== IDENT$1 || !cmpChar$2(token.value, 0, U)) {
            return 0;
        }

        token = getNextToken(++length);
        if (token === null) {
            return 0;
        }

        // u '+' <ident-token> '?'*
        // u '+' '?'+
        if (isDelim$1(token, PLUSSIGN$1)) {
            token = getNextToken(++length);
            if (token === null) {
                return 0;
            }

            if (token.type === IDENT$1) {
                // u '+' <ident-token> '?'*
                return withQuestionMarkSequence(hexSequence(token, 0, true), ++length, getNextToken);
            }

            if (isDelim$1(token, QUESTIONMARK)) {
                // u '+' '?'+
                return withQuestionMarkSequence(1, ++length, getNextToken);
            }

            // Hex digit or question mark is expected
            return 0;
        }

        // u <number-token> '?'*
        // u <number-token> <dimension-token>
        // u <number-token> <number-token>
        if (token.type === NUMBER$1) {
            if (!startsWith(token, PLUSSIGN$1)) {
                return 0;
            }

            var consumedHexLength = hexSequence(token, 1, true);
            if (consumedHexLength === 0) {
                return 0;
            }

            token = getNextToken(++length);
            if (token === null) {
                // u <number-token> <eof>
                return length;
            }

            if (token.type === DIMENSION$1 || token.type === NUMBER$1) {
                // u <number-token> <dimension-token>
                // u <number-token> <number-token>
                if (!startsWith(token, HYPHENMINUS$2) || !hexSequence(token, 1, false)) {
                    return 0;
                }

                return length + 1;
            }

            // u <number-token> '?'*
            return withQuestionMarkSequence(consumedHexLength, length, getNextToken);
        }

        // u <dimension-token> '?'*
        if (token.type === DIMENSION$1) {
            if (!startsWith(token, PLUSSIGN$1)) {
                return 0;
            }

            return withQuestionMarkSequence(hexSequence(token, 1, true), ++length, getNextToken);
        }

        return 0;
    };

    var isIdentifierStart$2 = tokenizer.isIdentifierStart;
    var isHexDigit$3 = tokenizer.isHexDigit;
    var isDigit$3 = tokenizer.isDigit;
    var cmpStr$3 = tokenizer.cmpStr;
    var consumeNumber$2 = tokenizer.consumeNumber;
    var TYPE$5 = tokenizer.TYPE;



    var cssWideKeywords = ['unset', 'initial', 'inherit'];
    var calcFunctionNames = ['calc(', '-moz-calc(', '-webkit-calc('];

    // https://www.w3.org/TR/css-values-3/#lengths
    var LENGTH = {
        // absolute length units
        'px': true,
        'mm': true,
        'cm': true,
        'in': true,
        'pt': true,
        'pc': true,
        'q': true,

        // relative length units
        'em': true,
        'ex': true,
        'ch': true,
        'rem': true,

        // viewport-percentage lengths
        'vh': true,
        'vw': true,
        'vmin': true,
        'vmax': true,
        'vm': true
    };

    var ANGLE = {
        'deg': true,
        'grad': true,
        'rad': true,
        'turn': true
    };

    var TIME = {
        's': true,
        'ms': true
    };

    var FREQUENCY = {
        'hz': true,
        'khz': true
    };

    // https://www.w3.org/TR/css-values-3/#resolution (https://drafts.csswg.org/css-values/#resolution)
    var RESOLUTION = {
        'dpi': true,
        'dpcm': true,
        'dppx': true,
        'x': true      // https://github.com/w3c/csswg-drafts/issues/461
    };

    // https://drafts.csswg.org/css-grid/#fr-unit
    var FLEX = {
        'fr': true
    };

    // https://www.w3.org/TR/css3-speech/#mixing-props-voice-volume
    var DECIBEL = {
        'db': true
    };

    // https://www.w3.org/TR/css3-speech/#voice-props-voice-pitch
    var SEMITONES = {
        'st': true
    };

    // safe char code getter
    function charCode(str, index) {
        return index < str.length ? str.charCodeAt(index) : 0;
    }

    function eqStr(actual, expected) {
        return cmpStr$3(actual, 0, actual.length, expected);
    }

    function eqStrAny(actual, expected) {
        for (var i = 0; i < expected.length; i++) {
            if (eqStr(actual, expected[i])) {
                return true;
            }
        }

        return false;
    }

    // IE postfix hack, i.e. 123\0 or 123px\9
    function isPostfixIeHack(str, offset) {
        if (offset !== str.length - 2) {
            return false;
        }

        return (
            str.charCodeAt(offset) === 0x005C &&  // U+005C REVERSE SOLIDUS (\)
            isDigit$3(str.charCodeAt(offset + 1))
        );
    }

    function outOfRange(opts, value, numEnd) {
        if (opts && opts.type === 'Range') {
            var num = Number(
                numEnd !== undefined && numEnd !== value.length
                    ? value.substr(0, numEnd)
                    : value
            );

            if (isNaN(num)) {
                return true;
            }

            if (opts.min !== null && num < opts.min) {
                return true;
            }

            if (opts.max !== null && num > opts.max) {
                return true;
            }
        }

        return false;
    }

    function consumeFunction(token, getNextToken) {
        var startIdx = token.index;
        var length = 0;

        // balanced token consuming
        do {
            length++;

            if (token.balance <= startIdx) {
                break;
            }
        } while (token = getNextToken(length));

        return length;
    }

    // TODO: implement
    // can be used wherever <length>, <frequency>, <angle>, <time>, <percentage>, <number>, or <integer> values are allowed
    // https://drafts.csswg.org/css-values/#calc-notation
    function calc(next) {
        return function(token, getNextToken, opts) {
            if (token === null) {
                return 0;
            }

            if (token.type === TYPE$5.Function && eqStrAny(token.value, calcFunctionNames)) {
                return consumeFunction(token, getNextToken);
            }

            return next(token, getNextToken, opts);
        };
    }

    function tokenType(expectedTokenType) {
        return function(token) {
            if (token === null || token.type !== expectedTokenType) {
                return 0;
            }

            return 1;
        };
    }

    function func(name) {
        name = name + '(';

        return function(token, getNextToken) {
            if (token !== null && eqStr(token.value, name)) {
                return consumeFunction(token, getNextToken);
            }

            return 0;
        };
    }

    // =========================
    // Complex types
    //

    // https://drafts.csswg.org/css-values-4/#custom-idents
    // 4.2. Author-defined Identifiers: the <custom-ident> type
    // Some properties accept arbitrary author-defined identifiers as a component value.
    // This generic data type is denoted by <custom-ident>, and represents any valid CSS identifier
    // that would not be misinterpreted as a pre-defined keyword in that property’s value definition.
    //
    // See also: https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
    function customIdent(token) {
        if (token === null || token.type !== TYPE$5.Ident) {
            return 0;
        }

        var name = token.value.toLowerCase();

        // The CSS-wide keywords are not valid <custom-ident>s
        if (eqStrAny(name, cssWideKeywords)) {
            return 0;
        }

        // The default keyword is reserved and is also not a valid <custom-ident>
        if (eqStr(name, 'default')) {
            return 0;
        }

        // TODO: ignore property specific keywords (as described https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident)
        // Specifications using <custom-ident> must specify clearly what other keywords
        // are excluded from <custom-ident>, if any—for example by saying that any pre-defined keywords
        // in that property’s value definition are excluded. Excluded keywords are excluded
        // in all ASCII case permutations.

        return 1;
    }

    // https://drafts.csswg.org/css-variables/#typedef-custom-property-name
    // A custom property is any property whose name starts with two dashes (U+002D HYPHEN-MINUS), like --foo.
    // The <custom-property-name> production corresponds to this: it’s defined as any valid identifier
    // that starts with two dashes, except -- itself, which is reserved for future use by CSS.
    // NOTE: Current implementation treat `--` as a valid name since most (all?) major browsers treat it as valid.
    function customPropertyName(token) {
        // ... defined as any valid identifier
        if (token === null || token.type !== TYPE$5.Ident) {
            return 0;
        }

        // ... that starts with two dashes (U+002D HYPHEN-MINUS)
        if (charCode(token.value, 0) !== 0x002D || charCode(token.value, 1) !== 0x002D) {
            return 0;
        }

        return 1;
    }

    // https://drafts.csswg.org/css-color-4/#hex-notation
    // The syntax of a <hex-color> is a <hash-token> token whose value consists of 3, 4, 6, or 8 hexadecimal digits.
    // In other words, a hex color is written as a hash character, "#", followed by some number of digits 0-9 or
    // letters a-f (the case of the letters doesn’t matter - #00ff00 is identical to #00FF00).
    function hexColor(token) {
        if (token === null || token.type !== TYPE$5.Hash) {
            return 0;
        }

        var length = token.value.length;

        // valid values (length): #rgb (4), #rgba (5), #rrggbb (7), #rrggbbaa (9)
        if (length !== 4 && length !== 5 && length !== 7 && length !== 9) {
            return 0;
        }

        for (var i = 1; i < length; i++) {
            if (!isHexDigit$3(token.value.charCodeAt(i))) {
                return 0;
            }
        }

        return 1;
    }

    function idSelector(token) {
        if (token === null || token.type !== TYPE$5.Hash) {
            return 0;
        }

        if (!isIdentifierStart$2(charCode(token.value, 1), charCode(token.value, 2), charCode(token.value, 3))) {
            return 0;
        }

        return 1;
    }

    // https://drafts.csswg.org/css-syntax/#any-value
    // It represents the entirety of what a valid declaration can have as its value.
    function declarationValue(token, getNextToken) {
        if (!token) {
            return 0;
        }

        var length = 0;
        var level = 0;
        var startIdx = token.index;

        // The <declaration-value> production matches any sequence of one or more tokens,
        // so long as the sequence ...
        scan:
        do {
            switch (token.type) {
                // ... does not contain <bad-string-token>, <bad-url-token>,
                case TYPE$5.BadString:
                case TYPE$5.BadUrl:
                    break scan;

                // ... unmatched <)-token>, <]-token>, or <}-token>,
                case TYPE$5.RightCurlyBracket:
                case TYPE$5.RightParenthesis:
                case TYPE$5.RightSquareBracket:
                    if (token.balance > token.index || token.balance < startIdx) {
                        break scan;
                    }

                    level--;
                    break;

                // ... or top-level <semicolon-token> tokens
                case TYPE$5.Semicolon:
                    if (level === 0) {
                        break scan;
                    }

                    break;

                // ... or <delim-token> tokens with a value of "!"
                case TYPE$5.Delim:
                    if (token.value === '!' && level === 0) {
                        break scan;
                    }

                    break;

                case TYPE$5.Function:
                case TYPE$5.LeftParenthesis:
                case TYPE$5.LeftSquareBracket:
                case TYPE$5.LeftCurlyBracket:
                    level++;
                    break;
            }

            length++;

            // until balance closing
            if (token.balance <= startIdx) {
                break;
            }
        } while (token = getNextToken(length));

        return length;
    }

    // https://drafts.csswg.org/css-syntax/#any-value
    // The <any-value> production is identical to <declaration-value>, but also
    // allows top-level <semicolon-token> tokens and <delim-token> tokens
    // with a value of "!". It represents the entirety of what valid CSS can be in any context.
    function anyValue(token, getNextToken) {
        if (!token) {
            return 0;
        }

        var startIdx = token.index;
        var length = 0;

        // The <any-value> production matches any sequence of one or more tokens,
        // so long as the sequence ...
        scan:
        do {
            switch (token.type) {
                // ... does not contain <bad-string-token>, <bad-url-token>,
                case TYPE$5.BadString:
                case TYPE$5.BadUrl:
                    break scan;

                // ... unmatched <)-token>, <]-token>, or <}-token>,
                case TYPE$5.RightCurlyBracket:
                case TYPE$5.RightParenthesis:
                case TYPE$5.RightSquareBracket:
                    if (token.balance > token.index || token.balance < startIdx) {
                        break scan;
                    }

                    break;
            }

            length++;

            // until balance closing
            if (token.balance <= startIdx) {
                break;
            }
        } while (token = getNextToken(length));

        return length;
    }

    // =========================
    // Dimensions
    //

    function dimension(type) {
        return function(token, getNextToken, opts) {
            if (token === null || token.type !== TYPE$5.Dimension) {
                return 0;
            }

            var numberEnd = consumeNumber$2(token.value, 0);

            // check unit
            if (type !== null) {
                // check for IE postfix hack, i.e. 123px\0 or 123px\9
                var reverseSolidusOffset = token.value.indexOf('\\', numberEnd);
                var unit = reverseSolidusOffset === -1 || !isPostfixIeHack(token.value, reverseSolidusOffset)
                    ? token.value.substr(numberEnd)
                    : token.value.substring(numberEnd, reverseSolidusOffset);

                if (type.hasOwnProperty(unit.toLowerCase()) === false) {
                    return 0;
                }
            }

            // check range if specified
            if (outOfRange(opts, token.value, numberEnd)) {
                return 0;
            }

            return 1;
        };
    }

    // =========================
    // Percentage
    //

    // §5.5. Percentages: the <percentage> type
    // https://drafts.csswg.org/css-values-4/#percentages
    function percentage(token, getNextToken, opts) {
        // ... corresponds to the <percentage-token> production
        if (token === null || token.type !== TYPE$5.Percentage) {
            return 0;
        }

        // check range if specified
        if (outOfRange(opts, token.value, token.value.length - 1)) {
            return 0;
        }

        return 1;
    }

    // =========================
    // Numeric
    //

    // https://drafts.csswg.org/css-values-4/#numbers
    // The value <zero> represents a literal number with the value 0. Expressions that merely
    // evaluate to a <number> with the value 0 (for example, calc(0)) do not match <zero>;
    // only literal <number-token>s do.
    function zero(next) {
        if (typeof next !== 'function') {
            next = function() {
                return 0;
            };
        }

        return function(token, getNextToken, opts) {
            if (token !== null && token.type === TYPE$5.Number) {
                if (Number(token.value) === 0) {
                    return 1;
                }
            }

            return next(token, getNextToken, opts);
        };
    }

    // § 5.3. Real Numbers: the <number> type
    // https://drafts.csswg.org/css-values-4/#numbers
    // Number values are denoted by <number>, and represent real numbers, possibly with a fractional component.
    // ... It corresponds to the <number-token> production
    function number(token, getNextToken, opts) {
        if (token === null) {
            return 0;
        }

        var numberEnd = consumeNumber$2(token.value, 0);
        var isNumber = numberEnd === token.value.length;
        if (!isNumber && !isPostfixIeHack(token.value, numberEnd)) {
            return 0;
        }

        // check range if specified
        if (outOfRange(opts, token.value, numberEnd)) {
            return 0;
        }

        return 1;
    }

    // §5.2. Integers: the <integer> type
    // https://drafts.csswg.org/css-values-4/#integers
    function integer(token, getNextToken, opts) {
        // ... corresponds to a subset of the <number-token> production
        if (token === null || token.type !== TYPE$5.Number) {
            return 0;
        }

        // The first digit of an integer may be immediately preceded by `-` or `+` to indicate the integer’s sign.
        var i = token.value.charCodeAt(0) === 0x002B ||       // U+002B PLUS SIGN (+)
                token.value.charCodeAt(0) === 0x002D ? 1 : 0; // U+002D HYPHEN-MINUS (-)

        // When written literally, an integer is one or more decimal digits 0 through 9 ...
        for (; i < token.value.length; i++) {
            if (!isDigit$3(token.value.charCodeAt(i))) {
                return 0;
            }
        }

        // check range if specified
        if (outOfRange(opts, token.value, i)) {
            return 0;
        }

        return 1;
    }

    var generic = {
        // token types
        'ident-token': tokenType(TYPE$5.Ident),
        'function-token': tokenType(TYPE$5.Function),
        'at-keyword-token': tokenType(TYPE$5.AtKeyword),
        'hash-token': tokenType(TYPE$5.Hash),
        'string-token': tokenType(TYPE$5.String),
        'bad-string-token': tokenType(TYPE$5.BadString),
        'url-token': tokenType(TYPE$5.Url),
        'bad-url-token': tokenType(TYPE$5.BadUrl),
        'delim-token': tokenType(TYPE$5.Delim),
        'number-token': tokenType(TYPE$5.Number),
        'percentage-token': tokenType(TYPE$5.Percentage),
        'dimension-token': tokenType(TYPE$5.Dimension),
        'whitespace-token': tokenType(TYPE$5.WhiteSpace),
        'CDO-token': tokenType(TYPE$5.CDO),
        'CDC-token': tokenType(TYPE$5.CDC),
        'colon-token': tokenType(TYPE$5.Colon),
        'semicolon-token': tokenType(TYPE$5.Semicolon),
        'comma-token': tokenType(TYPE$5.Comma),
        '[-token': tokenType(TYPE$5.LeftSquareBracket),
        ']-token': tokenType(TYPE$5.RightSquareBracket),
        '(-token': tokenType(TYPE$5.LeftParenthesis),
        ')-token': tokenType(TYPE$5.RightParenthesis),
        '{-token': tokenType(TYPE$5.LeftCurlyBracket),
        '}-token': tokenType(TYPE$5.RightCurlyBracket),

        // token type aliases
        'string': tokenType(TYPE$5.String),
        'ident': tokenType(TYPE$5.Ident),

        // complex types
        'custom-ident': customIdent,
        'custom-property-name': customPropertyName,
        'hex-color': hexColor,
        'id-selector': idSelector, // element( <id-selector> )
        'an-plus-b': genericAnPlusB,
        'urange': genericUrange,
        'declaration-value': declarationValue,
        'any-value': anyValue,

        // dimensions
        'dimension': calc(dimension(null)),
        'angle': calc(dimension(ANGLE)),
        'decibel': calc(dimension(DECIBEL)),
        'frequency': calc(dimension(FREQUENCY)),
        'flex': calc(dimension(FLEX)),
        'length': calc(zero(dimension(LENGTH))),
        'resolution': calc(dimension(RESOLUTION)),
        'semitones': calc(dimension(SEMITONES)),
        'time': calc(dimension(TIME)),

        // percentage
        'percentage': calc(percentage),

        // numeric
        'zero': zero(),
        'number': calc(number),
        'integer': calc(integer),

        // old IE stuff
        '-ms-legacy-expression': func('expression')
    };

    var _SyntaxError$1 = function SyntaxError(message, input, offset) {
        var error = createCustomError('SyntaxError', message);

        error.input = input;
        error.offset = offset;
        error.rawMessage = message;
        error.message = error.rawMessage + '\n' +
            '  ' + error.input + '\n' +
            '--' + new Array((error.offset || error.input.length) + 1).join('-') + '^';

        return error;
    };

    var TAB = 9;
    var N$1 = 10;
    var F = 12;
    var R = 13;
    var SPACE = 32;

    var Tokenizer = function(str) {
        this.str = str;
        this.pos = 0;
    };

    Tokenizer.prototype = {
        charCodeAt: function(pos) {
            return pos < this.str.length ? this.str.charCodeAt(pos) : 0;
        },
        charCode: function() {
            return this.charCodeAt(this.pos);
        },
        nextCharCode: function() {
            return this.charCodeAt(this.pos + 1);
        },
        nextNonWsCode: function(pos) {
            return this.charCodeAt(this.findWsEnd(pos));
        },
        findWsEnd: function(pos) {
            for (; pos < this.str.length; pos++) {
                var code = this.str.charCodeAt(pos);
                if (code !== R && code !== N$1 && code !== F && code !== SPACE && code !== TAB) {
                    break;
                }
            }

            return pos;
        },
        substringToPos: function(end) {
            return this.str.substring(this.pos, this.pos = end);
        },
        eat: function(code) {
            if (this.charCode() !== code) {
                this.error('Expect `' + String.fromCharCode(code) + '`');
            }

            this.pos++;
        },
        peek: function() {
            return this.pos < this.str.length ? this.str.charAt(this.pos++) : '';
        },
        error: function(message) {
            throw new _SyntaxError$1(message, this.str, this.pos);
        }
    };

    var tokenizer$1 = Tokenizer;

    var TAB$1 = 9;
    var N$2 = 10;
    var F$1 = 12;
    var R$1 = 13;
    var SPACE$1 = 32;
    var EXCLAMATIONMARK = 33;    // !
    var NUMBERSIGN = 35;         // #
    var AMPERSAND = 38;          // &
    var APOSTROPHE = 39;         // '
    var LEFTPARENTHESIS = 40;    // (
    var RIGHTPARENTHESIS = 41;   // )
    var ASTERISK = 42;           // *
    var PLUSSIGN$2 = 43;           // +
    var COMMA = 44;              // ,
    var HYPERMINUS = 45;         // -
    var LESSTHANSIGN = 60;       // <
    var GREATERTHANSIGN = 62;    // >
    var QUESTIONMARK$1 = 63;       // ?
    var COMMERCIALAT = 64;       // @
    var LEFTSQUAREBRACKET = 91;  // [
    var RIGHTSQUAREBRACKET = 93; // ]
    var LEFTCURLYBRACKET = 123;  // {
    var VERTICALLINE = 124;      // |
    var RIGHTCURLYBRACKET = 125; // }
    var INFINITY = 8734;         // ∞
    var NAME_CHAR = createCharMap(function(ch) {
        return /[a-zA-Z0-9\-]/.test(ch);
    });
    var COMBINATOR_PRECEDENCE = {
        ' ': 1,
        '&&': 2,
        '||': 3,
        '|': 4
    };

    function createCharMap(fn) {
        var array = typeof Uint32Array === 'function' ? new Uint32Array(128) : new Array(128);
        for (var i = 0; i < 128; i++) {
            array[i] = fn(String.fromCharCode(i)) ? 1 : 0;
        }
        return array;
    }

    function scanSpaces(tokenizer) {
        return tokenizer.substringToPos(
            tokenizer.findWsEnd(tokenizer.pos)
        );
    }

    function scanWord(tokenizer) {
        var end = tokenizer.pos;

        for (; end < tokenizer.str.length; end++) {
            var code = tokenizer.str.charCodeAt(end);
            if (code >= 128 || NAME_CHAR[code] === 0) {
                break;
            }
        }

        if (tokenizer.pos === end) {
            tokenizer.error('Expect a keyword');
        }

        return tokenizer.substringToPos(end);
    }

    function scanNumber(tokenizer) {
        var end = tokenizer.pos;

        for (; end < tokenizer.str.length; end++) {
            var code = tokenizer.str.charCodeAt(end);
            if (code < 48 || code > 57) {
                break;
            }
        }

        if (tokenizer.pos === end) {
            tokenizer.error('Expect a number');
        }

        return tokenizer.substringToPos(end);
    }

    function scanString(tokenizer) {
        var end = tokenizer.str.indexOf('\'', tokenizer.pos + 1);

        if (end === -1) {
            tokenizer.pos = tokenizer.str.length;
            tokenizer.error('Expect an apostrophe');
        }

        return tokenizer.substringToPos(end + 1);
    }

    function readMultiplierRange(tokenizer) {
        var min = null;
        var max = null;

        tokenizer.eat(LEFTCURLYBRACKET);

        min = scanNumber(tokenizer);

        if (tokenizer.charCode() === COMMA) {
            tokenizer.pos++;
            if (tokenizer.charCode() !== RIGHTCURLYBRACKET) {
                max = scanNumber(tokenizer);
            }
        } else {
            max = min;
        }

        tokenizer.eat(RIGHTCURLYBRACKET);

        return {
            min: Number(min),
            max: max ? Number(max) : 0
        };
    }

    function readMultiplier(tokenizer) {
        var range = null;
        var comma = false;

        switch (tokenizer.charCode()) {
            case ASTERISK:
                tokenizer.pos++;

                range = {
                    min: 0,
                    max: 0
                };

                break;

            case PLUSSIGN$2:
                tokenizer.pos++;

                range = {
                    min: 1,
                    max: 0
                };

                break;

            case QUESTIONMARK$1:
                tokenizer.pos++;

                range = {
                    min: 0,
                    max: 1
                };

                break;

            case NUMBERSIGN:
                tokenizer.pos++;

                comma = true;

                if (tokenizer.charCode() === LEFTCURLYBRACKET) {
                    range = readMultiplierRange(tokenizer);
                } else {
                    range = {
                        min: 1,
                        max: 0
                    };
                }

                break;

            case LEFTCURLYBRACKET:
                range = readMultiplierRange(tokenizer);
                break;

            default:
                return null;
        }

        return {
            type: 'Multiplier',
            comma: comma,
            min: range.min,
            max: range.max,
            term: null
        };
    }

    function maybeMultiplied(tokenizer, node) {
        var multiplier = readMultiplier(tokenizer);

        if (multiplier !== null) {
            multiplier.term = node;
            return multiplier;
        }

        return node;
    }

    function maybeToken(tokenizer) {
        var ch = tokenizer.peek();

        if (ch === '') {
            return null;
        }

        return {
            type: 'Token',
            value: ch
        };
    }

    function readProperty(tokenizer) {
        var name;

        tokenizer.eat(LESSTHANSIGN);
        tokenizer.eat(APOSTROPHE);

        name = scanWord(tokenizer);

        tokenizer.eat(APOSTROPHE);
        tokenizer.eat(GREATERTHANSIGN);

        return maybeMultiplied(tokenizer, {
            type: 'Property',
            name: name
        });
    }

    // https://drafts.csswg.org/css-values-3/#numeric-ranges
    // 4.1. Range Restrictions and Range Definition Notation
    //
    // Range restrictions can be annotated in the numeric type notation using CSS bracketed
    // range notation—[min,max]—within the angle brackets, after the identifying keyword,
    // indicating a closed range between (and including) min and max.
    // For example, <integer [0, 10]> indicates an integer between 0 and 10, inclusive.
    function readTypeRange(tokenizer) {
        // use null for Infinity to make AST format JSON serializable/deserializable
        var min = null; // -Infinity
        var max = null; // Infinity
        var sign = 1;

        tokenizer.eat(LEFTSQUAREBRACKET);

        if (tokenizer.charCode() === HYPERMINUS) {
            tokenizer.peek();
            sign = -1;
        }

        if (sign == -1 && tokenizer.charCode() === INFINITY) {
            tokenizer.peek();
        } else {
            min = sign * Number(scanNumber(tokenizer));
        }

        scanSpaces(tokenizer);
        tokenizer.eat(COMMA);
        scanSpaces(tokenizer);

        if (tokenizer.charCode() === INFINITY) {
            tokenizer.peek();
        } else {
            sign = 1;

            if (tokenizer.charCode() === HYPERMINUS) {
                tokenizer.peek();
                sign = -1;
            }

            max = sign * Number(scanNumber(tokenizer));
        }

        tokenizer.eat(RIGHTSQUAREBRACKET);

        // If no range is indicated, either by using the bracketed range notation
        // or in the property description, then [−∞,∞] is assumed.
        if (min === null && max === null) {
            return null;
        }

        return {
            type: 'Range',
            min: min,
            max: max
        };
    }

    function readType(tokenizer) {
        var name;
        var opts = null;

        tokenizer.eat(LESSTHANSIGN);
        name = scanWord(tokenizer);

        if (tokenizer.charCode() === LEFTPARENTHESIS &&
            tokenizer.nextCharCode() === RIGHTPARENTHESIS) {
            tokenizer.pos += 2;
            name += '()';
        }

        if (tokenizer.charCodeAt(tokenizer.findWsEnd(tokenizer.pos)) === LEFTSQUAREBRACKET) {
            scanSpaces(tokenizer);
            opts = readTypeRange(tokenizer);
        }

        tokenizer.eat(GREATERTHANSIGN);

        return maybeMultiplied(tokenizer, {
            type: 'Type',
            name: name,
            opts: opts
        });
    }

    function readKeywordOrFunction(tokenizer) {
        var name;

        name = scanWord(tokenizer);

        if (tokenizer.charCode() === LEFTPARENTHESIS) {
            tokenizer.pos++;

            return {
                type: 'Function',
                name: name
            };
        }

        return maybeMultiplied(tokenizer, {
            type: 'Keyword',
            name: name
        });
    }

    function regroupTerms(terms, combinators) {
        function createGroup(terms, combinator) {
            return {
                type: 'Group',
                terms: terms,
                combinator: combinator,
                disallowEmpty: false,
                explicit: false
            };
        }

        combinators = Object.keys(combinators).sort(function(a, b) {
            return COMBINATOR_PRECEDENCE[a] - COMBINATOR_PRECEDENCE[b];
        });

        while (combinators.length > 0) {
            var combinator = combinators.shift();
            for (var i = 0, subgroupStart = 0; i < terms.length; i++) {
                var term = terms[i];
                if (term.type === 'Combinator') {
                    if (term.value === combinator) {
                        if (subgroupStart === -1) {
                            subgroupStart = i - 1;
                        }
                        terms.splice(i, 1);
                        i--;
                    } else {
                        if (subgroupStart !== -1 && i - subgroupStart > 1) {
                            terms.splice(
                                subgroupStart,
                                i - subgroupStart,
                                createGroup(terms.slice(subgroupStart, i), combinator)
                            );
                            i = subgroupStart + 1;
                        }
                        subgroupStart = -1;
                    }
                }
            }

            if (subgroupStart !== -1 && combinators.length) {
                terms.splice(
                    subgroupStart,
                    i - subgroupStart,
                    createGroup(terms.slice(subgroupStart, i), combinator)
                );
            }
        }

        return combinator;
    }

    function readImplicitGroup(tokenizer) {
        var terms = [];
        var combinators = {};
        var token;
        var prevToken = null;
        var prevTokenPos = tokenizer.pos;

        while (token = peek(tokenizer)) {
            if (token.type !== 'Spaces') {
                if (token.type === 'Combinator') {
                    // check for combinator in group beginning and double combinator sequence
                    if (prevToken === null || prevToken.type === 'Combinator') {
                        tokenizer.pos = prevTokenPos;
                        tokenizer.error('Unexpected combinator');
                    }

                    combinators[token.value] = true;
                } else if (prevToken !== null && prevToken.type !== 'Combinator') {
                    combinators[' '] = true;  // a b
                    terms.push({
                        type: 'Combinator',
                        value: ' '
                    });
                }

                terms.push(token);
                prevToken = token;
                prevTokenPos = tokenizer.pos;
            }
        }

        // check for combinator in group ending
        if (prevToken !== null && prevToken.type === 'Combinator') {
            tokenizer.pos -= prevTokenPos;
            tokenizer.error('Unexpected combinator');
        }

        return {
            type: 'Group',
            terms: terms,
            combinator: regroupTerms(terms, combinators) || ' ',
            disallowEmpty: false,
            explicit: false
        };
    }

    function readGroup(tokenizer) {
        var result;

        tokenizer.eat(LEFTSQUAREBRACKET);
        result = readImplicitGroup(tokenizer);
        tokenizer.eat(RIGHTSQUAREBRACKET);

        result.explicit = true;

        if (tokenizer.charCode() === EXCLAMATIONMARK) {
            tokenizer.pos++;
            result.disallowEmpty = true;
        }

        return result;
    }

    function peek(tokenizer) {
        var code = tokenizer.charCode();

        if (code < 128 && NAME_CHAR[code] === 1) {
            return readKeywordOrFunction(tokenizer);
        }

        switch (code) {
            case RIGHTSQUAREBRACKET:
                // don't eat, stop scan a group
                break;

            case LEFTSQUAREBRACKET:
                return maybeMultiplied(tokenizer, readGroup(tokenizer));

            case LESSTHANSIGN:
                return tokenizer.nextCharCode() === APOSTROPHE
                    ? readProperty(tokenizer)
                    : readType(tokenizer);

            case VERTICALLINE:
                return {
                    type: 'Combinator',
                    value: tokenizer.substringToPos(
                        tokenizer.nextCharCode() === VERTICALLINE
                            ? tokenizer.pos + 2
                            : tokenizer.pos + 1
                    )
                };

            case AMPERSAND:
                tokenizer.pos++;
                tokenizer.eat(AMPERSAND);

                return {
                    type: 'Combinator',
                    value: '&&'
                };

            case COMMA:
                tokenizer.pos++;
                return {
                    type: 'Comma'
                };

            case APOSTROPHE:
                return maybeMultiplied(tokenizer, {
                    type: 'String',
                    value: scanString(tokenizer)
                });

            case SPACE$1:
            case TAB$1:
            case N$2:
            case R$1:
            case F$1:
                return {
                    type: 'Spaces',
                    value: scanSpaces(tokenizer)
                };

            case COMMERCIALAT:
                code = tokenizer.nextCharCode();

                if (code < 128 && NAME_CHAR[code] === 1) {
                    tokenizer.pos++;
                    return {
                        type: 'AtKeyword',
                        name: scanWord(tokenizer)
                    };
                }

                return maybeToken(tokenizer);

            case ASTERISK:
            case PLUSSIGN$2:
            case QUESTIONMARK$1:
            case NUMBERSIGN:
            case EXCLAMATIONMARK:
                // prohibited tokens (used as a multiplier start)
                break;

            case LEFTCURLYBRACKET:
                // LEFTCURLYBRACKET is allowed since mdn/data uses it w/o quoting
                // check next char isn't a number, because it's likely a disjoined multiplier
                code = tokenizer.nextCharCode();

                if (code < 48 || code > 57) {
                    return maybeToken(tokenizer);
                }

                break;

            default:
                return maybeToken(tokenizer);
        }
    }

    function parse(source) {
        var tokenizer = new tokenizer$1(source);
        var result = readImplicitGroup(tokenizer);

        if (tokenizer.pos !== source.length) {
            tokenizer.error('Unexpected input');
        }

        // reduce redundant groups with single group term
        if (result.terms.length === 1 && result.terms[0].type === 'Group') {
            result = result.terms[0];
        }

        return result;
    }

    // warm up parse to elimitate code branches that never execute
    // fix soft deoptimizations (insufficient type feedback)
    parse('[a&&<b>#|<\'c\'>*||e() f{2} /,(% g#{1,2} h{2,})]!');

    var parse_1 = parse;

    var noop$1 = function() {};

    function ensureFunction(value) {
        return typeof value === 'function' ? value : noop$1;
    }

    var walk = function(node, options, context) {
        function walk(node) {
            enter.call(context, node);

            switch (node.type) {
                case 'Group':
                    node.terms.forEach(walk);
                    break;

                case 'Multiplier':
                    walk(node.term);
                    break;

                case 'Type':
                case 'Property':
                case 'Keyword':
                case 'AtKeyword':
                case 'Function':
                case 'String':
                case 'Token':
                case 'Comma':
                    break;

                default:
                    throw new Error('Unknown type: ' + node.type);
            }

            leave.call(context, node);
        }

        var enter = noop$1;
        var leave = noop$1;

        if (typeof options === 'function') {
            enter = options;
        } else if (options) {
            enter = ensureFunction(options.enter);
            leave = ensureFunction(options.leave);
        }

        if (enter === noop$1 && leave === noop$1) {
            throw new Error('Neither `enter` nor `leave` walker handler is set or both aren\'t a function');
        }

        walk(node);
    };

    var tokenStream = new TokenStream_1();
    var astToTokens = {
        decorator: function(handlers) {
            var curNode = null;
            var prev = { len: 0, node: null };
            var nodes = [prev];
            var buffer = '';

            return {
                children: handlers.children,
                node: function(node) {
                    var tmp = curNode;
                    curNode = node;
                    handlers.node.call(this, node);
                    curNode = tmp;
                },
                chunk: function(chunk) {
                    buffer += chunk;
                    if (prev.node !== curNode) {
                        nodes.push({
                            len: chunk.length,
                            node: curNode
                        });
                    } else {
                        prev.len += chunk.length;
                    }
                },
                result: function() {
                    return prepareTokens(buffer, nodes);
                }
            };
        }
    };

    function prepareTokens(str, nodes) {
        var tokens = [];
        var nodesOffset = 0;
        var nodesIndex = 0;
        var currentNode = nodes ? nodes[nodesIndex].node : null;

        tokenizer(str, tokenStream);

        while (!tokenStream.eof) {
            if (nodes) {
                while (nodesIndex < nodes.length && nodesOffset + nodes[nodesIndex].len <= tokenStream.tokenStart) {
                    nodesOffset += nodes[nodesIndex++].len;
                    currentNode = nodes[nodesIndex].node;
                }
            }

            tokens.push({
                type: tokenStream.tokenType,
                value: tokenStream.getTokenValue(),
                index: tokenStream.tokenIndex, // TODO: remove it, temporary solution
                balance: tokenStream.balance[tokenStream.tokenIndex], // TODO: remove it, temporary solution
                node: currentNode
            });
            tokenStream.next();
            // console.log({ ...tokens[tokens.length - 1], node: undefined });
        }

        return tokens;
    }

    var prepareTokens_1 = function(value, syntax) {
        if (typeof value === 'string') {
            return prepareTokens(value, null);
        }

        return syntax.generate(value, astToTokens);
    };

    var MATCH = { type: 'Match' };
    var MISMATCH = { type: 'Mismatch' };
    var DISALLOW_EMPTY = { type: 'DisallowEmpty' };
    var LEFTPARENTHESIS$1 = 40;  // (
    var RIGHTPARENTHESIS$1 = 41; // )

    function createCondition(match, thenBranch, elseBranch) {
        // reduce node count
        if (thenBranch === MATCH && elseBranch === MISMATCH) {
            return match;
        }

        if (match === MATCH && thenBranch === MATCH && elseBranch === MATCH) {
            return match;
        }

        if (match.type === 'If' && match.else === MISMATCH && thenBranch === MATCH) {
            thenBranch = match.then;
            match = match.match;
        }

        return {
            type: 'If',
            match: match,
            then: thenBranch,
            else: elseBranch
        };
    }

    function isFunctionType(name) {
        return (
            name.length > 2 &&
            name.charCodeAt(name.length - 2) === LEFTPARENTHESIS$1 &&
            name.charCodeAt(name.length - 1) === RIGHTPARENTHESIS$1
        );
    }

    function isEnumCapatible(term) {
        return (
            term.type === 'Keyword' ||
            term.type === 'AtKeyword' ||
            term.type === 'Function' ||
            term.type === 'Type' && isFunctionType(term.name)
        );
    }

    function buildGroupMatchGraph(combinator, terms, atLeastOneTermMatched) {
        switch (combinator) {
            case ' ':
                // Juxtaposing components means that all of them must occur, in the given order.
                //
                // a b c
                // =
                // match a
                //   then match b
                //     then match c
                //       then MATCH
                //       else MISMATCH
                //     else MISMATCH
                //   else MISMATCH
                var result = MATCH;

                for (var i = terms.length - 1; i >= 0; i--) {
                    var term = terms[i];

                    result = createCondition(
                        term,
                        result,
                        MISMATCH
                    );
                }
                return result;

            case '|':
                // A bar (|) separates two or more alternatives: exactly one of them must occur.
                //
                // a | b | c
                // =
                // match a
                //   then MATCH
                //   else match b
                //     then MATCH
                //     else match c
                //       then MATCH
                //       else MISMATCH

                var result = MISMATCH;
                var map = null;

                for (var i = terms.length - 1; i >= 0; i--) {
                    var term = terms[i];

                    // reduce sequence of keywords into a Enum
                    if (isEnumCapatible(term)) {
                        if (map === null && i > 0 && isEnumCapatible(terms[i - 1])) {
                            map = Object.create(null);
                            result = createCondition(
                                {
                                    type: 'Enum',
                                    map: map
                                },
                                MATCH,
                                result
                            );
                        }

                        if (map !== null) {
                            var key = (isFunctionType(term.name) ? term.name.slice(0, -1) : term.name).toLowerCase();
                            if (key in map === false) {
                                map[key] = term;
                                continue;
                            }
                        }
                    }

                    map = null;

                    // create a new conditonal node
                    result = createCondition(
                        term,
                        MATCH,
                        result
                    );
                }
                return result;

            case '&&':
                // A double ampersand (&&) separates two or more components,
                // all of which must occur, in any order.

                // Use MatchOnce for groups with a large number of terms,
                // since &&-groups produces at least N!-node trees
                if (terms.length > 5) {
                    return {
                        type: 'MatchOnce',
                        terms: terms,
                        all: true
                    };
                }

                // Use a combination tree for groups with small number of terms
                //
                // a && b && c
                // =
                // match a
                //   then [b && c]
                //   else match b
                //     then [a && c]
                //     else match c
                //       then [a && b]
                //       else MISMATCH
                //
                // a && b
                // =
                // match a
                //   then match b
                //     then MATCH
                //     else MISMATCH
                //   else match b
                //     then match a
                //       then MATCH
                //       else MISMATCH
                //     else MISMATCH
                var result = MISMATCH;

                for (var i = terms.length - 1; i >= 0; i--) {
                    var term = terms[i];
                    var thenClause;

                    if (terms.length > 1) {
                        thenClause = buildGroupMatchGraph(
                            combinator,
                            terms.filter(function(newGroupTerm) {
                                return newGroupTerm !== term;
                            }),
                            false
                        );
                    } else {
                        thenClause = MATCH;
                    }

                    result = createCondition(
                        term,
                        thenClause,
                        result
                    );
                }
                return result;

            case '||':
                // A double bar (||) separates two or more options:
                // one or more of them must occur, in any order.

                // Use MatchOnce for groups with a large number of terms,
                // since ||-groups produces at least N!-node trees
                if (terms.length > 5) {
                    return {
                        type: 'MatchOnce',
                        terms: terms,
                        all: false
                    };
                }

                // Use a combination tree for groups with small number of terms
                //
                // a || b || c
                // =
                // match a
                //   then [b || c]
                //   else match b
                //     then [a || c]
                //     else match c
                //       then [a || b]
                //       else MISMATCH
                //
                // a || b
                // =
                // match a
                //   then match b
                //     then MATCH
                //     else MATCH
                //   else match b
                //     then match a
                //       then MATCH
                //       else MATCH
                //     else MISMATCH
                var result = atLeastOneTermMatched ? MATCH : MISMATCH;

                for (var i = terms.length - 1; i >= 0; i--) {
                    var term = terms[i];
                    var thenClause;

                    if (terms.length > 1) {
                        thenClause = buildGroupMatchGraph(
                            combinator,
                            terms.filter(function(newGroupTerm) {
                                return newGroupTerm !== term;
                            }),
                            true
                        );
                    } else {
                        thenClause = MATCH;
                    }

                    result = createCondition(
                        term,
                        thenClause,
                        result
                    );
                }
                return result;
        }
    }

    function buildMultiplierMatchGraph(node) {
        var result = MATCH;
        var matchTerm = buildMatchGraph(node.term);

        if (node.max === 0) {
            // disable repeating of empty match to prevent infinite loop
            matchTerm = createCondition(
                matchTerm,
                DISALLOW_EMPTY,
                MISMATCH
            );

            // an occurrence count is not limited, make a cycle;
            // to collect more terms on each following matching mismatch
            result = createCondition(
                matchTerm,
                null, // will be a loop
                MISMATCH
            );

            result.then = createCondition(
                MATCH,
                MATCH,
                result // make a loop
            );

            if (node.comma) {
                result.then.else = createCondition(
                    { type: 'Comma', syntax: node },
                    result,
                    MISMATCH
                );
            }
        } else {
            // create a match node chain for [min .. max] interval with optional matches
            for (var i = node.min || 1; i <= node.max; i++) {
                if (node.comma && result !== MATCH) {
                    result = createCondition(
                        { type: 'Comma', syntax: node },
                        result,
                        MISMATCH
                    );
                }

                result = createCondition(
                    matchTerm,
                    createCondition(
                        MATCH,
                        MATCH,
                        result
                    ),
                    MISMATCH
                );
            }
        }

        if (node.min === 0) {
            // allow zero match
            result = createCondition(
                MATCH,
                MATCH,
                result
            );
        } else {
            // create a match node chain to collect [0 ... min - 1] required matches
            for (var i = 0; i < node.min - 1; i++) {
                if (node.comma && result !== MATCH) {
                    result = createCondition(
                        { type: 'Comma', syntax: node },
                        result,
                        MISMATCH
                    );
                }

                result = createCondition(
                    matchTerm,
                    result,
                    MISMATCH
                );
            }
        }

        return result;
    }

    function buildMatchGraph(node) {
        if (typeof node === 'function') {
            return {
                type: 'Generic',
                fn: node
            };
        }

        switch (node.type) {
            case 'Group':
                var result = buildGroupMatchGraph(
                    node.combinator,
                    node.terms.map(buildMatchGraph),
                    false
                );

                if (node.disallowEmpty) {
                    result = createCondition(
                        result,
                        DISALLOW_EMPTY,
                        MISMATCH
                    );
                }

                return result;

            case 'Multiplier':
                return buildMultiplierMatchGraph(node);

            case 'Type':
            case 'Property':
                return {
                    type: node.type,
                    name: node.name,
                    syntax: node
                };

            case 'Keyword':
                return {
                    type: node.type,
                    name: node.name.toLowerCase(),
                    syntax: node
                };

            case 'AtKeyword':
                return {
                    type: node.type,
                    name: '@' + node.name.toLowerCase(),
                    syntax: node
                };

            case 'Function':
                return {
                    type: node.type,
                    name: node.name.toLowerCase() + '(',
                    syntax: node
                };

            case 'String':
                // convert a one char length String to a Token
                if (node.value.length === 3) {
                    return {
                        type: 'Token',
                        value: node.value.charAt(1),
                        syntax: node
                    };
                }

                // otherwise use it as is
                return {
                    type: node.type,
                    value: node.value.substr(1, node.value.length - 2).replace(/\\'/g, '\''),
                    syntax: node
                };

            case 'Token':
                return {
                    type: node.type,
                    value: node.value,
                    syntax: node
                };

            case 'Comma':
                return {
                    type: node.type,
                    syntax: node
                };

            default:
                throw new Error('Unknown node type:', node.type);
        }
    }

    var matchGraph = {
        MATCH: MATCH,
        MISMATCH: MISMATCH,
        DISALLOW_EMPTY: DISALLOW_EMPTY,
        buildMatchGraph: function(syntaxTree, ref) {
            if (typeof syntaxTree === 'string') {
                syntaxTree = parse_1(syntaxTree);
            }

            return {
                type: 'MatchGraph',
                match: buildMatchGraph(syntaxTree),
                syntax: ref || null,
                source: syntaxTree
            };
        }
    };

    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

    var MATCH$1 = matchGraph.MATCH;
    var MISMATCH$1 = matchGraph.MISMATCH;
    var DISALLOW_EMPTY$1 = matchGraph.DISALLOW_EMPTY;
    var TYPE$6 = _const.TYPE;

    var STUB = 0;
    var TOKEN = 1;
    var OPEN_SYNTAX = 2;
    var CLOSE_SYNTAX = 3;

    var EXIT_REASON_MATCH = 'Match';
    var EXIT_REASON_MISMATCH = 'Mismatch';
    var EXIT_REASON_ITERATION_LIMIT = 'Maximum iteration number exceeded (please fill an issue on https://github.com/csstree/csstree/issues)';

    var ITERATION_LIMIT = 15000;
    var totalIterationCount = 0;

    function reverseList(list) {
        var prev = null;
        var next = null;
        var item = list;

        while (item !== null) {
            next = item.prev;
            item.prev = prev;
            prev = item;
            item = next;
        }

        return prev;
    }

    function areStringsEqualCaseInsensitive(testStr, referenceStr) {
        if (testStr.length !== referenceStr.length) {
            return false;
        }

        for (var i = 0; i < testStr.length; i++) {
            var testCode = testStr.charCodeAt(i);
            var referenceCode = referenceStr.charCodeAt(i);

            // testCode.toLowerCase() for U+0041 LATIN CAPITAL LETTER A (A) .. U+005A LATIN CAPITAL LETTER Z (Z).
            if (testCode >= 0x0041 && testCode <= 0x005A) {
                testCode = testCode | 32;
            }

            if (testCode !== referenceCode) {
                return false;
            }
        }

        return true;
    }

    function isCommaContextStart(token) {
        if (token === null) {
            return true;
        }

        return (
            token.type === TYPE$6.Comma ||
            token.type === TYPE$6.Function ||
            token.type === TYPE$6.LeftParenthesis ||
            token.type === TYPE$6.LeftSquareBracket ||
            token.type === TYPE$6.LeftCurlyBracket ||
            token.type === TYPE$6.Delim
        );
    }

    function isCommaContextEnd(token) {
        if (token === null) {
            return true;
        }

        return (
            token.type === TYPE$6.RightParenthesis ||
            token.type === TYPE$6.RightSquareBracket ||
            token.type === TYPE$6.RightCurlyBracket ||
            token.type === TYPE$6.Delim
        );
    }

    function internalMatch(tokens, state, syntaxes) {
        function moveToNextToken() {
            do {
                tokenIndex++;
                token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
            } while (token !== null && (token.type === TYPE$6.WhiteSpace || token.type === TYPE$6.Comment));
        }

        function getNextToken(offset) {
            var nextIndex = tokenIndex + offset;

            return nextIndex < tokens.length ? tokens[nextIndex] : null;
        }

        function stateSnapshotFromSyntax(nextState, prev) {
            return {
                nextState: nextState,
                matchStack: matchStack,
                syntaxStack: syntaxStack,
                thenStack: thenStack,
                tokenIndex: tokenIndex,
                prev: prev
            };
        }

        function pushThenStack(nextState) {
            thenStack = {
                nextState: nextState,
                matchStack: matchStack,
                syntaxStack: syntaxStack,
                prev: thenStack
            };
        }

        function pushElseStack(nextState) {
            elseStack = stateSnapshotFromSyntax(nextState, elseStack);
        }

        function addTokenToMatch() {
            matchStack = {
                type: TOKEN,
                syntax: state.syntax,
                token: token,
                prev: matchStack
            };

            moveToNextToken();
            syntaxStash = null;

            if (tokenIndex > longestMatch) {
                longestMatch = tokenIndex;
            }
        }

        function openSyntax() {
            syntaxStack = {
                syntax: state.syntax,
                opts: state.syntax.opts || (syntaxStack !== null && syntaxStack.opts) || null,
                prev: syntaxStack
            };

            matchStack = {
                type: OPEN_SYNTAX,
                syntax: state.syntax,
                token: matchStack.token,
                prev: matchStack
            };
        }

        function closeSyntax() {
            if (matchStack.type === OPEN_SYNTAX) {
                matchStack = matchStack.prev;
            } else {
                matchStack = {
                    type: CLOSE_SYNTAX,
                    syntax: syntaxStack.syntax,
                    token: matchStack.token,
                    prev: matchStack
                };
            }

            syntaxStack = syntaxStack.prev;
        }

        var syntaxStack = null;
        var thenStack = null;
        var elseStack = null;

        // null – stashing allowed, nothing stashed
        // false – stashing disabled, nothing stashed
        // anithing else – fail stashable syntaxes, some syntax stashed
        var syntaxStash = null;

        var iterationCount = 0; // count iterations and prevent infinite loop
        var exitReason = null;

        var token = null;
        var tokenIndex = -1;
        var longestMatch = 0;
        var matchStack = {
            type: STUB,
            syntax: null,
            token: null,
            prev: null
        };

        moveToNextToken();

        while (exitReason === null && ++iterationCount < ITERATION_LIMIT) {
            // function mapList(list, fn) {
            //     var result = [];
            //     while (list) {
            //         result.unshift(fn(list));
            //         list = list.prev;
            //     }
            //     return result;
            // }
            // console.log('--\n',
            //     '#' + iterationCount,
            //     require('util').inspect({
            //         match: mapList(matchStack, x => x.type === TOKEN ? x.token && x.token.value : x.syntax ? ({ [OPEN_SYNTAX]: '<', [CLOSE_SYNTAX]: '</' }[x.type] || x.type) + '!' + x.syntax.name : null),
            //         token: token && token.value,
            //         tokenIndex,
            //         syntax: syntax.type + (syntax.id ? ' #' + syntax.id : '')
            //     }, { depth: null })
            // );
            switch (state.type) {
                case 'Match':
                    if (thenStack === null) {
                        // turn to MISMATCH when some tokens left unmatched
                        if (token !== null) {
                            // doesn't mismatch if just one token left and it's an IE hack
                            if (tokenIndex !== tokens.length - 1 || (token.value !== '\\0' && token.value !== '\\9')) {
                                state = MISMATCH$1;
                                break;
                            }
                        }

                        // break the main loop, return a result - MATCH
                        exitReason = EXIT_REASON_MATCH;
                        break;
                    }

                    // go to next syntax (`then` branch)
                    state = thenStack.nextState;

                    // check match is not empty
                    if (state === DISALLOW_EMPTY$1) {
                        if (thenStack.matchStack === matchStack) {
                            state = MISMATCH$1;
                            break;
                        } else {
                            state = MATCH$1;
                        }
                    }

                    // close syntax if needed
                    while (thenStack.syntaxStack !== syntaxStack) {
                        closeSyntax();
                    }

                    // pop stack
                    thenStack = thenStack.prev;
                    break;

                case 'Mismatch':
                    // when some syntax is stashed
                    if (syntaxStash !== null && syntaxStash !== false) {
                        // there is no else branches or a branch reduce match stack
                        if (elseStack === null || tokenIndex > elseStack.tokenIndex) {
                            // restore state from the stash
                            elseStack = syntaxStash;
                            syntaxStash = false; // disable stashing
                        }
                    } else if (elseStack === null) {
                        // no else branches -> break the main loop
                        // return a result - MISMATCH
                        exitReason = EXIT_REASON_MISMATCH;
                        break;
                    }

                    // go to next syntax (`else` branch)
                    state = elseStack.nextState;

                    // restore all the rest stack states
                    thenStack = elseStack.thenStack;
                    syntaxStack = elseStack.syntaxStack;
                    matchStack = elseStack.matchStack;
                    tokenIndex = elseStack.tokenIndex;
                    token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;

                    // pop stack
                    elseStack = elseStack.prev;
                    break;

                case 'MatchGraph':
                    state = state.match;
                    break;

                case 'If':
                    // IMPORTANT: else stack push must go first,
                    // since it stores the state of thenStack before changes
                    if (state.else !== MISMATCH$1) {
                        pushElseStack(state.else);
                    }

                    if (state.then !== MATCH$1) {
                        pushThenStack(state.then);
                    }

                    state = state.match;
                    break;

                case 'MatchOnce':
                    state = {
                        type: 'MatchOnceBuffer',
                        syntax: state,
                        index: 0,
                        mask: 0
                    };
                    break;

                case 'MatchOnceBuffer':
                    var terms = state.syntax.terms;

                    if (state.index === terms.length) {
                        // no matches at all or it's required all terms to be matched
                        if (state.mask === 0 || state.syntax.all) {
                            state = MISMATCH$1;
                            break;
                        }

                        // a partial match is ok
                        state = MATCH$1;
                        break;
                    }

                    // all terms are matched
                    if (state.mask === (1 << terms.length) - 1) {
                        state = MATCH$1;
                        break;
                    }

                    for (; state.index < terms.length; state.index++) {
                        var matchFlag = 1 << state.index;

                        if ((state.mask & matchFlag) === 0) {
                            // IMPORTANT: else stack push must go first,
                            // since it stores the state of thenStack before changes
                            pushElseStack(state);
                            pushThenStack({
                                type: 'AddMatchOnce',
                                syntax: state.syntax,
                                mask: state.mask | matchFlag
                            });

                            // match
                            state = terms[state.index++];
                            break;
                        }
                    }
                    break;

                case 'AddMatchOnce':
                    state = {
                        type: 'MatchOnceBuffer',
                        syntax: state.syntax,
                        index: 0,
                        mask: state.mask
                    };
                    break;

                case 'Enum':
                    if (token !== null) {
                        var name = token.value.toLowerCase();

                        // drop \0 and \9 hack from keyword name
                        if (name.indexOf('\\') !== -1) {
                            name = name.replace(/\\[09].*$/, '');
                        }

                        if (hasOwnProperty$1.call(state.map, name)) {
                            state = state.map[name];
                            break;
                        }
                    }

                    state = MISMATCH$1;
                    break;

                case 'Generic':
                    var opts = syntaxStack !== null ? syntaxStack.opts : null;
                    var lastTokenIndex = tokenIndex + Math.floor(state.fn(token, getNextToken, opts));

                    if (!isNaN(lastTokenIndex) && lastTokenIndex > tokenIndex) {
                        while (tokenIndex < lastTokenIndex) {
                            addTokenToMatch();
                        }

                        state = MATCH$1;
                    } else {
                        state = MISMATCH$1;
                    }

                    break;

                case 'Type':
                case 'Property':
                    var syntaxDict = state.type === 'Type' ? 'types' : 'properties';
                    var dictSyntax = hasOwnProperty$1.call(syntaxes, syntaxDict) ? syntaxes[syntaxDict][state.name] : null;

                    if (!dictSyntax || !dictSyntax.match) {
                        throw new Error(
                            'Bad syntax reference: ' +
                            (state.type === 'Type'
                                ? '<' + state.name + '>'
                                : '<\'' + state.name + '\'>')
                        );
                    }

                    // stash a syntax for types with low priority
                    if (syntaxStash !== false && token !== null && state.type === 'Type') {
                        var lowPriorityMatching =
                            // https://drafts.csswg.org/css-values-4/#custom-idents
                            // When parsing positionally-ambiguous keywords in a property value, a <custom-ident> production
                            // can only claim the keyword if no other unfulfilled production can claim it.
                            (state.name === 'custom-ident' && token.type === TYPE$6.Ident) ||

                            // https://drafts.csswg.org/css-values-4/#lengths
                            // ... if a `0` could be parsed as either a <number> or a <length> in a property (such as line-height),
                            // it must parse as a <number>
                            (state.name === 'length' && token.value === '0');

                        if (lowPriorityMatching) {
                            if (syntaxStash === null) {
                                syntaxStash = stateSnapshotFromSyntax(state, elseStack);
                            }

                            state = MISMATCH$1;
                            break;
                        }
                    }

                    openSyntax();
                    state = dictSyntax.match;
                    break;

                case 'Keyword':
                    var name = state.name;

                    if (token !== null) {
                        var keywordName = token.value;

                        // drop \0 and \9 hack from keyword name
                        if (keywordName.indexOf('\\') !== -1) {
                            keywordName = keywordName.replace(/\\[09].*$/, '');
                        }

                        if (areStringsEqualCaseInsensitive(keywordName, name)) {
                            addTokenToMatch();
                            state = MATCH$1;
                            break;
                        }
                    }

                    state = MISMATCH$1;
                    break;

                case 'AtKeyword':
                case 'Function':
                    if (token !== null && areStringsEqualCaseInsensitive(token.value, state.name)) {
                        addTokenToMatch();
                        state = MATCH$1;
                        break;
                    }

                    state = MISMATCH$1;
                    break;

                case 'Token':
                    if (token !== null && token.value === state.value) {
                        addTokenToMatch();
                        state = MATCH$1;
                        break;
                    }

                    state = MISMATCH$1;
                    break;

                case 'Comma':
                    if (token !== null && token.type === TYPE$6.Comma) {
                        if (isCommaContextStart(matchStack.token)) {
                            state = MISMATCH$1;
                        } else {
                            addTokenToMatch();
                            state = isCommaContextEnd(token) ? MISMATCH$1 : MATCH$1;
                        }
                    } else {
                        state = isCommaContextStart(matchStack.token) || isCommaContextEnd(token) ? MATCH$1 : MISMATCH$1;
                    }

                    break;

                case 'String':
                    var string = '';

                    for (var lastTokenIndex = tokenIndex; lastTokenIndex < tokens.length && string.length < state.value.length; lastTokenIndex++) {
                        string += tokens[lastTokenIndex].value;
                    }

                    if (areStringsEqualCaseInsensitive(string, state.value)) {
                        while (tokenIndex < lastTokenIndex) {
                            addTokenToMatch();
                        }

                        state = MATCH$1;
                    } else {
                        state = MISMATCH$1;
                    }

                    break;

                default:
                    throw new Error('Unknown node type: ' + state.type);
            }
        }

        totalIterationCount += iterationCount;

        switch (exitReason) {
            case null:
                console.warn('[csstree-match] BREAK after ' + ITERATION_LIMIT + ' iterations');
                exitReason = EXIT_REASON_ITERATION_LIMIT;
                matchStack = null;
                break;

            case EXIT_REASON_MATCH:
                while (syntaxStack !== null) {
                    closeSyntax();
                }
                break;

            default:
                matchStack = null;
        }

        return {
            tokens: tokens,
            reason: exitReason,
            iterations: iterationCount,
            match: matchStack,
            longestMatch: longestMatch
        };
    }

    function matchAsList(tokens, matchGraph, syntaxes) {
        var matchResult = internalMatch(tokens, matchGraph, syntaxes || {});

        if (matchResult.match !== null) {
            var item = reverseList(matchResult.match).prev;

            matchResult.match = [];

            while (item !== null) {
                switch (item.type) {
                    case STUB:
                        break;

                    case OPEN_SYNTAX:
                    case CLOSE_SYNTAX:
                        matchResult.match.push({
                            type: item.type,
                            syntax: item.syntax
                        });
                        break;

                    default:
                        matchResult.match.push({
                            token: item.token.value,
                            node: item.token.node
                        });
                        break;
                }

                item = item.prev;
            }
        }

        return matchResult;
    }

    function matchAsTree(tokens, matchGraph, syntaxes) {
        var matchResult = internalMatch(tokens, matchGraph, syntaxes || {});

        if (matchResult.match === null) {
            return matchResult;
        }

        var item = matchResult.match;
        var host = matchResult.match = {
            syntax: matchGraph.syntax || null,
            match: []
        };
        var hostStack = [host];

        // revert a list and start with 2nd item since 1st is a stub item
        item = reverseList(item).prev;

        // build a tree
        while (item !== null) {
            switch (item.type) {
                case OPEN_SYNTAX:
                    host.match.push(host = {
                        syntax: item.syntax,
                        match: []
                    });
                    hostStack.push(host);
                    break;

                case CLOSE_SYNTAX:
                    hostStack.pop();
                    host = hostStack[hostStack.length - 1];
                    break;

                default:
                    host.match.push({
                        syntax: item.syntax || null,
                        token: item.token.value,
                        node: item.token.node
                    });
            }

            item = item.prev;
        }

        return matchResult;
    }

    var match = {
        matchAsList: matchAsList,
        matchAsTree: matchAsTree,
        getTotalIterationCount: function() {
            return totalIterationCount;
        }
    };

    function getTrace(node) {
        function shouldPutToTrace(syntax) {
            if (syntax === null) {
                return false;
            }

            return (
                syntax.type === 'Type' ||
                syntax.type === 'Property' ||
                syntax.type === 'Keyword'
            );
        }

        function hasMatch(matchNode) {
            if (Array.isArray(matchNode.match)) {
                // use for-loop for better perfomance
                for (var i = 0; i < matchNode.match.length; i++) {
                    if (hasMatch(matchNode.match[i])) {
                        if (shouldPutToTrace(matchNode.syntax)) {
                            result.unshift(matchNode.syntax);
                        }

                        return true;
                    }
                }
            } else if (matchNode.node === node) {
                result = shouldPutToTrace(matchNode.syntax)
                    ? [matchNode.syntax]
                    : [];

                return true;
            }

            return false;
        }

        var result = null;

        if (this.matched !== null) {
            hasMatch(this.matched);
        }

        return result;
    }

    function testNode(match, node, fn) {
        var trace = getTrace.call(match, node);

        if (trace === null) {
            return false;
        }

        return trace.some(fn);
    }

    function isType(node, type) {
        return testNode(this, node, function(matchNode) {
            return matchNode.type === 'Type' && matchNode.name === type;
        });
    }

    function isProperty(node, property) {
        return testNode(this, node, function(matchNode) {
            return matchNode.type === 'Property' && matchNode.name === property;
        });
    }

    function isKeyword(node) {
        return testNode(this, node, function(matchNode) {
            return matchNode.type === 'Keyword';
        });
    }

    var trace = {
        getTrace: getTrace,
        isType: isType,
        isProperty: isProperty,
        isKeyword: isKeyword
    };

    function getFirstMatchNode(matchNode) {
        if ('node' in matchNode) {
            return matchNode.node;
        }

        return getFirstMatchNode(matchNode.match[0]);
    }

    function getLastMatchNode(matchNode) {
        if ('node' in matchNode) {
            return matchNode.node;
        }

        return getLastMatchNode(matchNode.match[matchNode.match.length - 1]);
    }

    function matchFragments(lexer, ast, match, type, name) {
        function findFragments(matchNode) {
            if (matchNode.syntax !== null &&
                matchNode.syntax.type === type &&
                matchNode.syntax.name === name) {
                var start = getFirstMatchNode(matchNode);
                var end = getLastMatchNode(matchNode);

                lexer.syntax.walk(ast, function(node, item, list) {
                    if (node === start) {
                        var nodes = new List_1();

                        do {
                            nodes.appendData(item.data);

                            if (item.data === end) {
                                break;
                            }

                            item = item.next;
                        } while (item !== null);

                        fragments.push({
                            parent: list,
                            nodes: nodes
                        });
                    }
                });
            }

            if (Array.isArray(matchNode.match)) {
                matchNode.match.forEach(findFragments);
            }
        }

        var fragments = [];

        if (match.matched !== null) {
            findFragments(match.matched);
        }

        return fragments;
    }

    var search = {
        matchFragments: matchFragments
    };

    var hasOwnProperty$2 = Object.prototype.hasOwnProperty;

    function isValidNumber(value) {
        // Number.isInteger(value) && value >= 0
        return (
            typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value &&
            value >= 0
        );
    }

    function isValidLocation(loc) {
        return (
            Boolean(loc) &&
            isValidNumber(loc.offset) &&
            isValidNumber(loc.line) &&
            isValidNumber(loc.column)
        );
    }

    function createNodeStructureChecker(type, fields) {
        return function checkNode(node, warn) {
            if (!node || node.constructor !== Object) {
                return warn(node, 'Type of node should be an Object');
            }

            for (var key in node) {
                var valid = true;

                if (hasOwnProperty$2.call(node, key) === false) {
                    continue;
                }

                if (key === 'type') {
                    if (node.type !== type) {
                        warn(node, 'Wrong node type `' + node.type + '`, expected `' + type + '`');
                    }
                } else if (key === 'loc') {
                    if (node.loc === null) {
                        continue;
                    } else if (node.loc && node.loc.constructor === Object) {
                        if (typeof node.loc.source !== 'string') {
                            key += '.source';
                        } else if (!isValidLocation(node.loc.start)) {
                            key += '.start';
                        } else if (!isValidLocation(node.loc.end)) {
                            key += '.end';
                        } else {
                            continue;
                        }
                    }

                    valid = false;
                } else if (fields.hasOwnProperty(key)) {
                    for (var i = 0, valid = false; !valid && i < fields[key].length; i++) {
                        var fieldType = fields[key][i];

                        switch (fieldType) {
                            case String:
                                valid = typeof node[key] === 'string';
                                break;

                            case Boolean:
                                valid = typeof node[key] === 'boolean';
                                break;

                            case null:
                                valid = node[key] === null;
                                break;

                            default:
                                if (typeof fieldType === 'string') {
                                    valid = node[key] && node[key].type === fieldType;
                                } else if (Array.isArray(fieldType)) {
                                    valid = node[key] instanceof List_1;
                                }
                        }
                    }
                } else {
                    warn(node, 'Unknown field `' + key + '` for ' + type + ' node type');
                }

                if (!valid) {
                    warn(node, 'Bad value for `' + type + '.' + key + '`');
                }
            }

            for (var key in fields) {
                if (hasOwnProperty$2.call(fields, key) &&
                    hasOwnProperty$2.call(node, key) === false) {
                    warn(node, 'Field `' + type + '.' + key + '` is missed');
                }
            }
        };
    }

    function processStructure(name, nodeType) {
        var structure = nodeType.structure;
        var fields = {
            type: String,
            loc: true
        };
        var docs = {
            type: '"' + name + '"'
        };

        for (var key in structure) {
            if (hasOwnProperty$2.call(structure, key) === false) {
                continue;
            }

            var docsTypes = [];
            var fieldTypes = fields[key] = Array.isArray(structure[key])
                ? structure[key].slice()
                : [structure[key]];

            for (var i = 0; i < fieldTypes.length; i++) {
                var fieldType = fieldTypes[i];
                if (fieldType === String || fieldType === Boolean) {
                    docsTypes.push(fieldType.name);
                } else if (fieldType === null) {
                    docsTypes.push('null');
                } else if (typeof fieldType === 'string') {
                    docsTypes.push('<' + fieldType + '>');
                } else if (Array.isArray(fieldType)) {
                    docsTypes.push('List'); // TODO: use type enum
                } else {
                    throw new Error('Wrong value `' + fieldType + '` in `' + name + '.' + key + '` structure definition');
                }
            }

            docs[key] = docsTypes.join(' | ');
        }

        return {
            docs: docs,
            check: createNodeStructureChecker(name, fields)
        };
    }

    var structure = {
        getStructureFromConfig: function(config) {
            var structure = {};

            if (config.node) {
                for (var name in config.node) {
                    if (hasOwnProperty$2.call(config.node, name)) {
                        var nodeType = config.node[name];

                        if (nodeType.structure) {
                            structure[name] = processStructure(name, nodeType);
                        } else {
                            throw new Error('Missed `structure` field in `' + name + '` node type definition');
                        }
                    }
                }
            }

            return structure;
        }
    };

    var SyntaxReferenceError$1 = error.SyntaxReferenceError;
    var MatchError$1 = error.MatchError;






    var buildMatchGraph$1 = matchGraph.buildMatchGraph;
    var matchAsTree$1 = match.matchAsTree;


    var getStructureFromConfig = structure.getStructureFromConfig;
    var cssWideKeywords$1 = buildMatchGraph$1('inherit | initial | unset');
    var cssWideKeywordsWithExpression = buildMatchGraph$1('inherit | initial | unset | <-ms-legacy-expression>');

    function dumpMapSyntax(map, compact, syntaxAsAst) {
        var result = {};

        for (var name in map) {
            if (map[name].syntax) {
                result[name] = syntaxAsAst
                    ? map[name].syntax
                    : generate_1(map[name].syntax, { compact: compact });
            }
        }

        return result;
    }

    function valueHasVar(tokens) {
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[i].value.toLowerCase() === 'var(') {
                return true;
            }
        }

        return false;
    }

    function buildMatchResult(match, error, iterations) {
        return {
            matched: match,
            iterations: iterations,
            error: error,
            getTrace: trace.getTrace,
            isType: trace.isType,
            isProperty: trace.isProperty,
            isKeyword: trace.isKeyword
        };
    }

    function matchSyntax(lexer, syntax, value, useCommon) {
        var tokens = prepareTokens_1(value, lexer.syntax);
        var result;

        if (valueHasVar(tokens)) {
            return buildMatchResult(null, new Error('Matching for a tree with var() is not supported'));
        }

        if (useCommon) {
            result = matchAsTree$1(tokens, lexer.valueCommonSyntax, lexer);
        }

        if (!useCommon || !result.match) {
            result = matchAsTree$1(tokens, syntax.match, lexer);
            if (!result.match) {
                return buildMatchResult(
                    null,
                    new MatchError$1(result.reason, syntax.syntax, value, result),
                    result.iterations
                );
            }
        }

        return buildMatchResult(result.match, null, result.iterations);
    }

    var Lexer = function(config, syntax, structure) {
        this.valueCommonSyntax = cssWideKeywords$1;
        this.syntax = syntax;
        this.generic = false;
        this.atrules = {};
        this.properties = {};
        this.types = {};
        this.structure = structure || getStructureFromConfig(config);

        if (config) {
            if (config.types) {
                for (var name in config.types) {
                    this.addType_(name, config.types[name]);
                }
            }

            if (config.generic) {
                this.generic = true;
                for (var name in generic) {
                    this.addType_(name, generic[name]);
                }
            }

            if (config.atrules) {
                for (var name in config.atrules) {
                    this.addAtrule_(name, config.atrules[name]);
                }
            }

            if (config.properties) {
                for (var name in config.properties) {
                    this.addProperty_(name, config.properties[name]);
                }
            }
        }
    };

    Lexer.prototype = {
        structure: {},
        checkStructure: function(ast) {
            function collectWarning(node, message) {
                warns.push({
                    node: node,
                    message: message
                });
            }

            var structure = this.structure;
            var warns = [];

            this.syntax.walk(ast, function(node) {
                if (structure.hasOwnProperty(node.type)) {
                    structure[node.type].check(node, collectWarning);
                } else {
                    collectWarning(node, 'Unknown node type `' + node.type + '`');
                }
            });

            return warns.length ? warns : false;
        },

        createDescriptor: function(syntax, type, name) {
            var ref = {
                type: type,
                name: name
            };
            var descriptor = {
                type: type,
                name: name,
                syntax: null,
                match: null
            };

            if (typeof syntax === 'function') {
                descriptor.match = buildMatchGraph$1(syntax, ref);
            } else {
                if (typeof syntax === 'string') {
                    // lazy parsing on first access
                    Object.defineProperty(descriptor, 'syntax', {
                        get: function() {
                            Object.defineProperty(descriptor, 'syntax', {
                                value: parse_1(syntax)
                            });

                            return descriptor.syntax;
                        }
                    });
                } else {
                    descriptor.syntax = syntax;
                }

                // lazy graph build on first access
                Object.defineProperty(descriptor, 'match', {
                    get: function() {
                        Object.defineProperty(descriptor, 'match', {
                            value: buildMatchGraph$1(descriptor.syntax, ref)
                        });

                        return descriptor.match;
                    }
                });
            }

            return descriptor;
        },
        addAtrule_: function(name, syntax) {
            this.atrules[name] = {
                prelude: syntax.prelude ? this.createDescriptor(syntax.prelude, 'AtrulePrelude', name) : null,
                descriptors: syntax.descriptors
                    ? Object.keys(syntax.descriptors).reduce((res, name) => {
                        res[name] = this.createDescriptor(syntax.descriptors[name], 'AtruleDescriptor', name);
                        return res;
                    }, {})
                    : null
            };
        },
        addProperty_: function(name, syntax) {
            this.properties[name] = this.createDescriptor(syntax, 'Property', name);
        },
        addType_: function(name, syntax) {
            this.types[name] = this.createDescriptor(syntax, 'Type', name);

            if (syntax === generic['-ms-legacy-expression']) {
                this.valueCommonSyntax = cssWideKeywordsWithExpression;
            }
        },

        matchAtrulePrelude: function(atruleName, prelude) {
            var atrule = names.keyword(atruleName);

            var atrulePreludeSyntax = atrule.vendor
                ? this.getAtrulePrelude(atrule.name) || this.getAtrulePrelude(atrule.basename)
                : this.getAtrulePrelude(atrule.name);

            if (!atrulePreludeSyntax) {
                if (atrule.basename in this.atrules) {
                    return buildMatchResult(null, new Error('At-rule `' + atruleName + '` should not contain a prelude'));
                }

                return buildMatchResult(null, new SyntaxReferenceError$1('Unknown at-rule', atruleName));
            }

            return matchSyntax(this, atrulePreludeSyntax, prelude, true);
        },
        matchAtruleDescriptor: function(atruleName, descriptorName, value) {
            var atrule = names.keyword(atruleName);
            var descriptor = names.keyword(descriptorName);

            var atruleEntry = atrule.vendor
                ? this.atrules[atrule.name] || this.atrules[atrule.basename]
                : this.atrules[atrule.name];

            if (!atruleEntry) {
                return buildMatchResult(null, new SyntaxReferenceError$1('Unknown at-rule', atruleName));
            }

            if (!atruleEntry.descriptors) {
                return buildMatchResult(null, new Error('At-rule `' + atruleName + '` has no known descriptors'));
            }

            var atruleDescriptorSyntax = descriptor.vendor
                ? atruleEntry.descriptors[descriptor.name] || atruleEntry.descriptors[descriptor.basename]
                : atruleEntry.descriptors[descriptor.name];

            if (!atruleDescriptorSyntax) {
                return buildMatchResult(null, new SyntaxReferenceError$1('Unknown at-rule descriptor', descriptorName));
            }

            return matchSyntax(this, atruleDescriptorSyntax, value, true);
        },
        matchDeclaration: function(node) {
            if (node.type !== 'Declaration') {
                return buildMatchResult(null, new Error('Not a Declaration node'));
            }

            return this.matchProperty(node.property, node.value);
        },
        matchProperty: function(propertyName, value) {
            var property = names.property(propertyName);

            // don't match syntax for a custom property
            if (property.custom) {
                return buildMatchResult(null, new Error('Lexer matching doesn\'t applicable for custom properties'));
            }

            var propertySyntax = property.vendor
                ? this.getProperty(property.name) || this.getProperty(property.basename)
                : this.getProperty(property.name);

            if (!propertySyntax) {
                return buildMatchResult(null, new SyntaxReferenceError$1('Unknown property', propertyName));
            }

            return matchSyntax(this, propertySyntax, value, true);
        },
        matchType: function(typeName, value) {
            var typeSyntax = this.getType(typeName);

            if (!typeSyntax) {
                return buildMatchResult(null, new SyntaxReferenceError$1('Unknown type', typeName));
            }

            return matchSyntax(this, typeSyntax, value, false);
        },
        match: function(syntax, value) {
            if (typeof syntax !== 'string' && (!syntax || !syntax.type)) {
                return buildMatchResult(null, new SyntaxReferenceError$1('Bad syntax'));
            }

            if (typeof syntax === 'string' || !syntax.match) {
                syntax = this.createDescriptor(syntax, 'Type', 'anonymous');
            }

            return matchSyntax(this, syntax, value, false);
        },

        findValueFragments: function(propertyName, value, type, name) {
            return search.matchFragments(this, value, this.matchProperty(propertyName, value), type, name);
        },
        findDeclarationValueFragments: function(declaration, type, name) {
            return search.matchFragments(this, declaration.value, this.matchDeclaration(declaration), type, name);
        },
        findAllFragments: function(ast, type, name) {
            var result = [];

            this.syntax.walk(ast, {
                visit: 'Declaration',
                enter: function(declaration) {
                    result.push.apply(result, this.findDeclarationValueFragments(declaration, type, name));
                }.bind(this)
            });

            return result;
        },

        getAtrulePrelude: function(atruleName) {
            return this.atrules.hasOwnProperty(atruleName) ? this.atrules[atruleName].prelude : null;
        },
        getAtruleDescriptor: function(atruleName, name) {
            return this.atrules.hasOwnProperty(atruleName) && this.atrules.declarators
                ? this.atrules[atruleName].declarators[name] || null
                : null;
        },
        getProperty: function(name) {
            return this.properties.hasOwnProperty(name) ? this.properties[name] : null;
        },
        getType: function(name) {
            return this.types.hasOwnProperty(name) ? this.types[name] : null;
        },

        validate: function() {
            function validate(syntax, name, broken, descriptor) {
                if (broken.hasOwnProperty(name)) {
                    return broken[name];
                }

                broken[name] = false;
                if (descriptor.syntax !== null) {
                    walk(descriptor.syntax, function(node) {
                        if (node.type !== 'Type' && node.type !== 'Property') {
                            return;
                        }

                        var map = node.type === 'Type' ? syntax.types : syntax.properties;
                        var brokenMap = node.type === 'Type' ? brokenTypes : brokenProperties;

                        if (!map.hasOwnProperty(node.name) || validate(syntax, node.name, brokenMap, map[node.name])) {
                            broken[name] = true;
                        }
                    }, this);
                }
            }

            var brokenTypes = {};
            var brokenProperties = {};

            for (var key in this.types) {
                validate(this, key, brokenTypes, this.types[key]);
            }

            for (var key in this.properties) {
                validate(this, key, brokenProperties, this.properties[key]);
            }

            brokenTypes = Object.keys(brokenTypes).filter(function(name) {
                return brokenTypes[name];
            });
            brokenProperties = Object.keys(brokenProperties).filter(function(name) {
                return brokenProperties[name];
            });

            if (brokenTypes.length || brokenProperties.length) {
                return {
                    types: brokenTypes,
                    properties: brokenProperties
                };
            }

            return null;
        },
        dump: function(syntaxAsAst, pretty) {
            return {
                generic: this.generic,
                types: dumpMapSyntax(this.types, !pretty, syntaxAsAst),
                properties: dumpMapSyntax(this.properties, !pretty, syntaxAsAst)
            };
        },
        toString: function() {
            return JSON.stringify(this.dump());
        }
    };

    var Lexer_1 = Lexer;

    var definitionSyntax = {
        SyntaxError: _SyntaxError$1,
        parse: parse_1,
        generate: generate_1,
        walk: walk
    };

    var isBOM$2 = tokenizer.isBOM;

    var N$3 = 10;
    var F$2 = 12;
    var R$2 = 13;

    function computeLinesAndColumns(host, source) {
        var sourceLength = source.length;
        var lines = adoptBuffer(host.lines, sourceLength); // +1
        var line = host.startLine;
        var columns = adoptBuffer(host.columns, sourceLength);
        var column = host.startColumn;
        var startOffset = source.length > 0 ? isBOM$2(source.charCodeAt(0)) : 0;

        for (var i = startOffset; i < sourceLength; i++) { // -1
            var code = source.charCodeAt(i);

            lines[i] = line;
            columns[i] = column++;

            if (code === N$3 || code === R$2 || code === F$2) {
                if (code === R$2 && i + 1 < sourceLength && source.charCodeAt(i + 1) === N$3) {
                    i++;
                    lines[i] = line;
                    columns[i] = column;
                }

                line++;
                column = 1;
            }
        }

        lines[i] = line;
        columns[i] = column;

        host.lines = lines;
        host.columns = columns;
    }

    var OffsetToLocation = function() {
        this.lines = null;
        this.columns = null;
        this.linesAndColumnsComputed = false;
    };

    OffsetToLocation.prototype = {
        setSource: function(source, startOffset, startLine, startColumn) {
            this.source = source;
            this.startOffset = typeof startOffset === 'undefined' ? 0 : startOffset;
            this.startLine = typeof startLine === 'undefined' ? 1 : startLine;
            this.startColumn = typeof startColumn === 'undefined' ? 1 : startColumn;
            this.linesAndColumnsComputed = false;
        },

        ensureLinesAndColumnsComputed: function() {
            if (!this.linesAndColumnsComputed) {
                computeLinesAndColumns(this, this.source);
                this.linesAndColumnsComputed = true;
            }
        },
        getLocation: function(offset, filename) {
            this.ensureLinesAndColumnsComputed();

            return {
                source: filename,
                offset: this.startOffset + offset,
                line: this.lines[offset],
                column: this.columns[offset]
            };
        },
        getLocationRange: function(start, end, filename) {
            this.ensureLinesAndColumnsComputed();

            return {
                source: filename,
                start: {
                    offset: this.startOffset + start,
                    line: this.lines[start],
                    column: this.columns[start]
                },
                end: {
                    offset: this.startOffset + end,
                    line: this.lines[end],
                    column: this.columns[end]
                }
            };
        }
    };

    var OffsetToLocation_1 = OffsetToLocation;

    var TYPE$7 = tokenizer.TYPE;
    var WHITESPACE$2 = TYPE$7.WhiteSpace;
    var COMMENT$2 = TYPE$7.Comment;

    var sequence = function readSequence(recognizer) {
        var children = this.createList();
        var child = null;
        var context = {
            recognizer: recognizer,
            space: null,
            ignoreWS: false,
            ignoreWSAfter: false
        };

        this.scanner.skipSC();

        while (!this.scanner.eof) {
            switch (this.scanner.tokenType) {
                case COMMENT$2:
                    this.scanner.next();
                    continue;

                case WHITESPACE$2:
                    if (context.ignoreWS) {
                        this.scanner.next();
                    } else {
                        context.space = this.WhiteSpace();
                    }
                    continue;
            }

            child = recognizer.getNode.call(this, context);

            if (child === undefined) {
                break;
            }

            if (context.space !== null) {
                children.push(context.space);
                context.space = null;
            }

            children.push(child);

            if (context.ignoreWSAfter) {
                context.ignoreWSAfter = false;
                context.ignoreWS = true;
            } else {
                context.ignoreWS = false;
            }
        }

        return children;
    };

    var findWhiteSpaceStart$1 = utils.findWhiteSpaceStart;

    var noop$2 = function() {};

    var TYPE$8 = _const.TYPE;
    var NAME$2 = _const.NAME;
    var WHITESPACE$3 = TYPE$8.WhiteSpace;
    var IDENT$2 = TYPE$8.Ident;
    var FUNCTION = TYPE$8.Function;
    var URL = TYPE$8.Url;
    var HASH = TYPE$8.Hash;
    var PERCENTAGE = TYPE$8.Percentage;
    var NUMBER$2 = TYPE$8.Number;
    var NUMBERSIGN$1 = 0x0023; // U+0023 NUMBER SIGN (#)
    var NULL = 0;

    function createParseContext(name) {
        return function() {
            return this[name]();
        };
    }

    function processConfig(config) {
        var parserConfig = {
            context: {},
            scope: {},
            atrule: {},
            pseudo: {}
        };

        if (config.parseContext) {
            for (var name in config.parseContext) {
                switch (typeof config.parseContext[name]) {
                    case 'function':
                        parserConfig.context[name] = config.parseContext[name];
                        break;

                    case 'string':
                        parserConfig.context[name] = createParseContext(config.parseContext[name]);
                        break;
                }
            }
        }

        if (config.scope) {
            for (var name in config.scope) {
                parserConfig.scope[name] = config.scope[name];
            }
        }

        if (config.atrule) {
            for (var name in config.atrule) {
                var atrule = config.atrule[name];

                if (atrule.parse) {
                    parserConfig.atrule[name] = atrule.parse;
                }
            }
        }

        if (config.pseudo) {
            for (var name in config.pseudo) {
                var pseudo = config.pseudo[name];

                if (pseudo.parse) {
                    parserConfig.pseudo[name] = pseudo.parse;
                }
            }
        }

        if (config.node) {
            for (var name in config.node) {
                parserConfig[name] = config.node[name].parse;
            }
        }

        return parserConfig;
    }

    var create = function createParser(config) {
        var parser = {
            scanner: new TokenStream_1(),
            locationMap: new OffsetToLocation_1(),

            filename: '<unknown>',
            needPositions: false,
            onParseError: noop$2,
            onParseErrorThrow: false,
            parseAtrulePrelude: true,
            parseRulePrelude: true,
            parseValue: true,
            parseCustomProperty: false,

            readSequence: sequence,

            createList: function() {
                return new List_1();
            },
            createSingleNodeList: function(node) {
                return new List_1().appendData(node);
            },
            getFirstListNode: function(list) {
                return list && list.first();
            },
            getLastListNode: function(list) {
                return list.last();
            },

            parseWithFallback: function(consumer, fallback) {
                var startToken = this.scanner.tokenIndex;

                try {
                    return consumer.call(this);
                } catch (e) {
                    if (this.onParseErrorThrow) {
                        throw e;
                    }

                    var fallbackNode = fallback.call(this, startToken);

                    this.onParseErrorThrow = true;
                    this.onParseError(e, fallbackNode);
                    this.onParseErrorThrow = false;

                    return fallbackNode;
                }
            },

            lookupNonWSType: function(offset) {
                do {
                    var type = this.scanner.lookupType(offset++);
                    if (type !== WHITESPACE$3) {
                        return type;
                    }
                } while (type !== NULL);

                return NULL;
            },

            eat: function(tokenType) {
                if (this.scanner.tokenType !== tokenType) {
                    var offset = this.scanner.tokenStart;
                    var message = NAME$2[tokenType] + ' is expected';

                    // tweak message and offset
                    switch (tokenType) {
                        case IDENT$2:
                            // when identifier is expected but there is a function or url
                            if (this.scanner.tokenType === FUNCTION || this.scanner.tokenType === URL) {
                                offset = this.scanner.tokenEnd - 1;
                                message = 'Identifier is expected but function found';
                            } else {
                                message = 'Identifier is expected';
                            }
                            break;

                        case HASH:
                            if (this.scanner.isDelim(NUMBERSIGN$1)) {
                                this.scanner.next();
                                offset++;
                                message = 'Name is expected';
                            }
                            break;

                        case PERCENTAGE:
                            if (this.scanner.tokenType === NUMBER$2) {
                                offset = this.scanner.tokenEnd;
                                message = 'Percent sign is expected';
                            }
                            break;

                        default:
                            // when test type is part of another token show error for current position + 1
                            // e.g. eat(HYPHENMINUS) will fail on "-foo", but pointing on "-" is odd
                            if (this.scanner.source.charCodeAt(this.scanner.tokenStart) === tokenType) {
                                offset = offset + 1;
                            }
                    }

                    this.error(message, offset);
                }

                this.scanner.next();
            },

            consume: function(tokenType) {
                var value = this.scanner.getTokenValue();

                this.eat(tokenType);

                return value;
            },
            consumeFunctionName: function() {
                var name = this.scanner.source.substring(this.scanner.tokenStart, this.scanner.tokenEnd - 1);

                this.eat(FUNCTION);

                return name;
            },

            getLocation: function(start, end) {
                if (this.needPositions) {
                    return this.locationMap.getLocationRange(
                        start,
                        end,
                        this.filename
                    );
                }

                return null;
            },
            getLocationFromList: function(list) {
                if (this.needPositions) {
                    var head = this.getFirstListNode(list);
                    var tail = this.getLastListNode(list);
                    return this.locationMap.getLocationRange(
                        head !== null ? head.loc.start.offset - this.locationMap.startOffset : this.scanner.tokenStart,
                        tail !== null ? tail.loc.end.offset - this.locationMap.startOffset : this.scanner.tokenStart,
                        this.filename
                    );
                }

                return null;
            },

            error: function(message, offset) {
                var location = typeof offset !== 'undefined' && offset < this.scanner.source.length
                    ? this.locationMap.getLocation(offset)
                    : this.scanner.eof
                        ? this.locationMap.getLocation(findWhiteSpaceStart$1(this.scanner.source, this.scanner.source.length - 1))
                        : this.locationMap.getLocation(this.scanner.tokenStart);

                throw new _SyntaxError(
                    message || 'Unexpected input',
                    this.scanner.source,
                    location.offset,
                    location.line,
                    location.column
                );
            }
        };

        config = processConfig(config || {});
        for (var key in config) {
            parser[key] = config[key];
        }

        return function(source, options) {
            options = options || {};

            var context = options.context || 'default';
            var ast;

            tokenizer(source, parser.scanner);
            parser.locationMap.setSource(
                source,
                options.offset,
                options.line,
                options.column
            );

            parser.filename = options.filename || '<unknown>';
            parser.needPositions = Boolean(options.positions);
            parser.onParseError = typeof options.onParseError === 'function' ? options.onParseError : noop$2;
            parser.onParseErrorThrow = false;
            parser.parseAtrulePrelude = 'parseAtrulePrelude' in options ? Boolean(options.parseAtrulePrelude) : true;
            parser.parseRulePrelude = 'parseRulePrelude' in options ? Boolean(options.parseRulePrelude) : true;
            parser.parseValue = 'parseValue' in options ? Boolean(options.parseValue) : true;
            parser.parseCustomProperty = 'parseCustomProperty' in options ? Boolean(options.parseCustomProperty) : false;

            if (!parser.context.hasOwnProperty(context)) {
                throw new Error('Unknown context `' + context + '`');
            }

            ast = parser.context[context].call(parser, options);

            if (!parser.scanner.eof) {
                parser.error();
            }

            return ast;
        };
    };

    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

    /**
     * Encode an integer in the range of 0 to 63 to a single base 64 digit.
     */
    var encode = function (number) {
      if (0 <= number && number < intToCharMap.length) {
        return intToCharMap[number];
      }
      throw new TypeError("Must be between 0 and 63: " + number);
    };

    /**
     * Decode a single base 64 character code digit to an integer. Returns -1 on
     * failure.
     */
    var decode = function (charCode) {
      var bigA = 65;     // 'A'
      var bigZ = 90;     // 'Z'

      var littleA = 97;  // 'a'
      var littleZ = 122; // 'z'

      var zero = 48;     // '0'
      var nine = 57;     // '9'

      var plus = 43;     // '+'
      var slash = 47;    // '/'

      var littleOffset = 26;
      var numberOffset = 52;

      // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
      if (bigA <= charCode && charCode <= bigZ) {
        return (charCode - bigA);
      }

      // 26 - 51: abcdefghijklmnopqrstuvwxyz
      if (littleA <= charCode && charCode <= littleZ) {
        return (charCode - littleA + littleOffset);
      }

      // 52 - 61: 0123456789
      if (zero <= charCode && charCode <= nine) {
        return (charCode - zero + numberOffset);
      }

      // 62: +
      if (charCode == plus) {
        return 62;
      }

      // 63: /
      if (charCode == slash) {
        return 63;
      }

      // Invalid base64 digit.
      return -1;
    };

    var base64 = {
    	encode: encode,
    	decode: decode
    };

    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     *
     * Based on the Base 64 VLQ implementation in Closure Compiler:
     * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
     *
     * Copyright 2011 The Closure Compiler Authors. All rights reserved.
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     *  * Redistributions of source code must retain the above copyright
     *    notice, this list of conditions and the following disclaimer.
     *  * Redistributions in binary form must reproduce the above
     *    copyright notice, this list of conditions and the following
     *    disclaimer in the documentation and/or other materials provided
     *    with the distribution.
     *  * Neither the name of Google Inc. nor the names of its
     *    contributors may be used to endorse or promote products derived
     *    from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */



    // A single base 64 digit can contain 6 bits of data. For the base 64 variable
    // length quantities we use in the source map spec, the first bit is the sign,
    // the next four bits are the actual value, and the 6th bit is the
    // continuation bit. The continuation bit tells us whether there are more
    // digits in this value following this digit.
    //
    //   Continuation
    //   |    Sign
    //   |    |
    //   V    V
    //   101011

    var VLQ_BASE_SHIFT = 5;

    // binary: 100000
    var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

    // binary: 011111
    var VLQ_BASE_MASK = VLQ_BASE - 1;

    // binary: 100000
    var VLQ_CONTINUATION_BIT = VLQ_BASE;

    /**
     * Converts from a two-complement value to a value where the sign bit is
     * placed in the least significant bit.  For example, as decimals:
     *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
     *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
     */
    function toVLQSigned(aValue) {
      return aValue < 0
        ? ((-aValue) << 1) + 1
        : (aValue << 1) + 0;
    }

    /**
     * Converts to a two-complement value from a value where the sign bit is
     * placed in the least significant bit.  For example, as decimals:
     *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
     *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
     */
    function fromVLQSigned(aValue) {
      var isNegative = (aValue & 1) === 1;
      var shifted = aValue >> 1;
      return isNegative
        ? -shifted
        : shifted;
    }

    /**
     * Returns the base 64 VLQ encoded value.
     */
    var encode$1 = function base64VLQ_encode(aValue) {
      var encoded = "";
      var digit;

      var vlq = toVLQSigned(aValue);

      do {
        digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
          // There are still more digits in this value, so we must make sure the
          // continuation bit is marked.
          digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += base64.encode(digit);
      } while (vlq > 0);

      return encoded;
    };

    /**
     * Decodes the next base 64 VLQ value from the given string and returns the
     * value and the rest of the string via the out parameter.
     */
    var decode$1 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
      var strLen = aStr.length;
      var result = 0;
      var shift = 0;
      var continuation, digit;

      do {
        if (aIndex >= strLen) {
          throw new Error("Expected more digits in base 64 VLQ value.");
        }

        digit = base64.decode(aStr.charCodeAt(aIndex++));
        if (digit === -1) {
          throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
        }

        continuation = !!(digit & VLQ_CONTINUATION_BIT);
        digit &= VLQ_BASE_MASK;
        result = result + (digit << shift);
        shift += VLQ_BASE_SHIFT;
      } while (continuation);

      aOutParam.value = fromVLQSigned(result);
      aOutParam.rest = aIndex;
    };

    var base64Vlq = {
    	encode: encode$1,
    	decode: decode$1
    };

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var util = createCommonjsModule(function (module, exports) {
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */

    /**
     * This is a helper function for getting values from parameter/options
     * objects.
     *
     * @param args The object we are extracting values from
     * @param name The name of the property we are getting.
     * @param defaultValue An optional value to return if the property is missing
     * from the object. If this is not specified and the property is missing, an
     * error will be thrown.
     */
    function getArg(aArgs, aName, aDefaultValue) {
      if (aName in aArgs) {
        return aArgs[aName];
      } else if (arguments.length === 3) {
        return aDefaultValue;
      } else {
        throw new Error('"' + aName + '" is a required argument.');
      }
    }
    exports.getArg = getArg;

    var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
    var dataUrlRegexp = /^data:.+\,.+$/;

    function urlParse(aUrl) {
      var match = aUrl.match(urlRegexp);
      if (!match) {
        return null;
      }
      return {
        scheme: match[1],
        auth: match[2],
        host: match[3],
        port: match[4],
        path: match[5]
      };
    }
    exports.urlParse = urlParse;

    function urlGenerate(aParsedUrl) {
      var url = '';
      if (aParsedUrl.scheme) {
        url += aParsedUrl.scheme + ':';
      }
      url += '//';
      if (aParsedUrl.auth) {
        url += aParsedUrl.auth + '@';
      }
      if (aParsedUrl.host) {
        url += aParsedUrl.host;
      }
      if (aParsedUrl.port) {
        url += ":" + aParsedUrl.port;
      }
      if (aParsedUrl.path) {
        url += aParsedUrl.path;
      }
      return url;
    }
    exports.urlGenerate = urlGenerate;

    /**
     * Normalizes a path, or the path portion of a URL:
     *
     * - Replaces consecutive slashes with one slash.
     * - Removes unnecessary '.' parts.
     * - Removes unnecessary '<dir>/..' parts.
     *
     * Based on code in the Node.js 'path' core module.
     *
     * @param aPath The path or url to normalize.
     */
    function normalize(aPath) {
      var path = aPath;
      var url = urlParse(aPath);
      if (url) {
        if (!url.path) {
          return aPath;
        }
        path = url.path;
      }
      var isAbsolute = exports.isAbsolute(path);

      var parts = path.split(/\/+/);
      for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
        part = parts[i];
        if (part === '.') {
          parts.splice(i, 1);
        } else if (part === '..') {
          up++;
        } else if (up > 0) {
          if (part === '') {
            // The first part is blank if the path is absolute. Trying to go
            // above the root is a no-op. Therefore we can remove all '..' parts
            // directly after the root.
            parts.splice(i + 1, up);
            up = 0;
          } else {
            parts.splice(i, 2);
            up--;
          }
        }
      }
      path = parts.join('/');

      if (path === '') {
        path = isAbsolute ? '/' : '.';
      }

      if (url) {
        url.path = path;
        return urlGenerate(url);
      }
      return path;
    }
    exports.normalize = normalize;

    /**
     * Joins two paths/URLs.
     *
     * @param aRoot The root path or URL.
     * @param aPath The path or URL to be joined with the root.
     *
     * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
     *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
     *   first.
     * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
     *   is updated with the result and aRoot is returned. Otherwise the result
     *   is returned.
     *   - If aPath is absolute, the result is aPath.
     *   - Otherwise the two paths are joined with a slash.
     * - Joining for example 'http://' and 'www.example.com' is also supported.
     */
    function join(aRoot, aPath) {
      if (aRoot === "") {
        aRoot = ".";
      }
      if (aPath === "") {
        aPath = ".";
      }
      var aPathUrl = urlParse(aPath);
      var aRootUrl = urlParse(aRoot);
      if (aRootUrl) {
        aRoot = aRootUrl.path || '/';
      }

      // `join(foo, '//www.example.org')`
      if (aPathUrl && !aPathUrl.scheme) {
        if (aRootUrl) {
          aPathUrl.scheme = aRootUrl.scheme;
        }
        return urlGenerate(aPathUrl);
      }

      if (aPathUrl || aPath.match(dataUrlRegexp)) {
        return aPath;
      }

      // `join('http://', 'www.example.com')`
      if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
        aRootUrl.host = aPath;
        return urlGenerate(aRootUrl);
      }

      var joined = aPath.charAt(0) === '/'
        ? aPath
        : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

      if (aRootUrl) {
        aRootUrl.path = joined;
        return urlGenerate(aRootUrl);
      }
      return joined;
    }
    exports.join = join;

    exports.isAbsolute = function (aPath) {
      return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
    };

    /**
     * Make a path relative to a URL or another path.
     *
     * @param aRoot The root path or URL.
     * @param aPath The path or URL to be made relative to aRoot.
     */
    function relative(aRoot, aPath) {
      if (aRoot === "") {
        aRoot = ".";
      }

      aRoot = aRoot.replace(/\/$/, '');

      // It is possible for the path to be above the root. In this case, simply
      // checking whether the root is a prefix of the path won't work. Instead, we
      // need to remove components from the root one by one, until either we find
      // a prefix that fits, or we run out of components to remove.
      var level = 0;
      while (aPath.indexOf(aRoot + '/') !== 0) {
        var index = aRoot.lastIndexOf("/");
        if (index < 0) {
          return aPath;
        }

        // If the only part of the root that is left is the scheme (i.e. http://,
        // file:///, etc.), one or more slashes (/), or simply nothing at all, we
        // have exhausted all components, so the path is not relative to the root.
        aRoot = aRoot.slice(0, index);
        if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
          return aPath;
        }

        ++level;
      }

      // Make sure we add a "../" for each component we removed from the root.
      return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
    }
    exports.relative = relative;

    var supportsNullProto = (function () {
      var obj = Object.create(null);
      return !('__proto__' in obj);
    }());

    function identity (s) {
      return s;
    }

    /**
     * Because behavior goes wacky when you set `__proto__` on objects, we
     * have to prefix all the strings in our set with an arbitrary character.
     *
     * See https://github.com/mozilla/source-map/pull/31 and
     * https://github.com/mozilla/source-map/issues/30
     *
     * @param String aStr
     */
    function toSetString(aStr) {
      if (isProtoString(aStr)) {
        return '$' + aStr;
      }

      return aStr;
    }
    exports.toSetString = supportsNullProto ? identity : toSetString;

    function fromSetString(aStr) {
      if (isProtoString(aStr)) {
        return aStr.slice(1);
      }

      return aStr;
    }
    exports.fromSetString = supportsNullProto ? identity : fromSetString;

    function isProtoString(s) {
      if (!s) {
        return false;
      }

      var length = s.length;

      if (length < 9 /* "__proto__".length */) {
        return false;
      }

      if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
          s.charCodeAt(length - 2) !== 95  /* '_' */ ||
          s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
          s.charCodeAt(length - 4) !== 116 /* 't' */ ||
          s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
          s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
          s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
          s.charCodeAt(length - 8) !== 95  /* '_' */ ||
          s.charCodeAt(length - 9) !== 95  /* '_' */) {
        return false;
      }

      for (var i = length - 10; i >= 0; i--) {
        if (s.charCodeAt(i) !== 36 /* '$' */) {
          return false;
        }
      }

      return true;
    }

    /**
     * Comparator between two mappings where the original positions are compared.
     *
     * Optionally pass in `true` as `onlyCompareGenerated` to consider two
     * mappings with the same original source/line/column, but different generated
     * line and column the same. Useful when searching for a mapping with a
     * stubbed out mapping.
     */
    function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
      var cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0 || onlyCompareOriginal) {
        return cmp;
      }

      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByOriginalPositions = compareByOriginalPositions;

    /**
     * Comparator between two mappings with deflated source and name indices where
     * the generated positions are compared.
     *
     * Optionally pass in `true` as `onlyCompareGenerated` to consider two
     * mappings with the same generated line and column, but different
     * source/name/original line and column the same. Useful when searching for a
     * mapping with a stubbed out mapping.
     */
    function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0 || onlyCompareGenerated) {
        return cmp;
      }

      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

    function strcmp(aStr1, aStr2) {
      if (aStr1 === aStr2) {
        return 0;
      }

      if (aStr1 === null) {
        return 1; // aStr2 !== null
      }

      if (aStr2 === null) {
        return -1; // aStr1 !== null
      }

      if (aStr1 > aStr2) {
        return 1;
      }

      return -1;
    }

    /**
     * Comparator between two mappings with inflated source and name strings where
     * the generated positions are compared.
     */
    function compareByGeneratedPositionsInflated(mappingA, mappingB) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }

      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }

      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

    /**
     * Strip any JSON XSSI avoidance prefix from the string (as documented
     * in the source maps specification), and then parse the string as
     * JSON.
     */
    function parseSourceMapInput(str) {
      return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
    }
    exports.parseSourceMapInput = parseSourceMapInput;

    /**
     * Compute the URL of a source given the the source root, the source's
     * URL, and the source map's URL.
     */
    function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
      sourceURL = sourceURL || '';

      if (sourceRoot) {
        // This follows what Chrome does.
        if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
          sourceRoot += '/';
        }
        // The spec says:
        //   Line 4: An optional source root, useful for relocating source
        //   files on a server or removing repeated values in the
        //   “sources” entry.  This value is prepended to the individual
        //   entries in the “source” field.
        sourceURL = sourceRoot + sourceURL;
      }

      // Historically, SourceMapConsumer did not take the sourceMapURL as
      // a parameter.  This mode is still somewhat supported, which is why
      // this code block is conditional.  However, it's preferable to pass
      // the source map URL to SourceMapConsumer, so that this function
      // can implement the source URL resolution algorithm as outlined in
      // the spec.  This block is basically the equivalent of:
      //    new URL(sourceURL, sourceMapURL).toString()
      // ... except it avoids using URL, which wasn't available in the
      // older releases of node still supported by this library.
      //
      // The spec says:
      //   If the sources are not absolute URLs after prepending of the
      //   “sourceRoot”, the sources are resolved relative to the
      //   SourceMap (like resolving script src in a html document).
      if (sourceMapURL) {
        var parsed = urlParse(sourceMapURL);
        if (!parsed) {
          throw new Error("sourceMapURL could not be parsed");
        }
        if (parsed.path) {
          // Strip the last path component, but keep the "/".
          var index = parsed.path.lastIndexOf('/');
          if (index >= 0) {
            parsed.path = parsed.path.substring(0, index + 1);
          }
        }
        sourceURL = join(urlGenerate(parsed), sourceURL);
      }

      return normalize(sourceURL);
    }
    exports.computeSourceURL = computeSourceURL;
    });
    var util_1 = util.getArg;
    var util_2 = util.urlParse;
    var util_3 = util.urlGenerate;
    var util_4 = util.normalize;
    var util_5 = util.join;
    var util_6 = util.isAbsolute;
    var util_7 = util.relative;
    var util_8 = util.toSetString;
    var util_9 = util.fromSetString;
    var util_10 = util.compareByOriginalPositions;
    var util_11 = util.compareByGeneratedPositionsDeflated;
    var util_12 = util.compareByGeneratedPositionsInflated;
    var util_13 = util.parseSourceMapInput;
    var util_14 = util.computeSourceURL;

    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */


    var has = Object.prototype.hasOwnProperty;
    var hasNativeMap = typeof Map !== "undefined";

    /**
     * A data structure which is a combination of an array and a set. Adding a new
     * member is O(1), testing for membership is O(1), and finding the index of an
     * element is O(1). Removing elements from the set is not supported. Only
     * strings are supported for membership.
     */
    function ArraySet() {
      this._array = [];
      this._set = hasNativeMap ? new Map() : Object.create(null);
    }

    /**
     * Static method for creating ArraySet instances from an existing array.
     */
    ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
      var set = new ArraySet();
      for (var i = 0, len = aArray.length; i < len; i++) {
        set.add(aArray[i], aAllowDuplicates);
      }
      return set;
    };

    /**
     * Return how many unique items are in this ArraySet. If duplicates have been
     * added, than those do not count towards the size.
     *
     * @returns Number
     */
    ArraySet.prototype.size = function ArraySet_size() {
      return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
    };

    /**
     * Add the given string to this set.
     *
     * @param String aStr
     */
    ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
      var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
      var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
      var idx = this._array.length;
      if (!isDuplicate || aAllowDuplicates) {
        this._array.push(aStr);
      }
      if (!isDuplicate) {
        if (hasNativeMap) {
          this._set.set(aStr, idx);
        } else {
          this._set[sStr] = idx;
        }
      }
    };

    /**
     * Is the given string a member of this set?
     *
     * @param String aStr
     */
    ArraySet.prototype.has = function ArraySet_has(aStr) {
      if (hasNativeMap) {
        return this._set.has(aStr);
      } else {
        var sStr = util.toSetString(aStr);
        return has.call(this._set, sStr);
      }
    };

    /**
     * What is the index of the given string in the array?
     *
     * @param String aStr
     */
    ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
      if (hasNativeMap) {
        var idx = this._set.get(aStr);
        if (idx >= 0) {
            return idx;
        }
      } else {
        var sStr = util.toSetString(aStr);
        if (has.call(this._set, sStr)) {
          return this._set[sStr];
        }
      }

      throw new Error('"' + aStr + '" is not in the set.');
    };

    /**
     * What is the element at the given index?
     *
     * @param Number aIdx
     */
    ArraySet.prototype.at = function ArraySet_at(aIdx) {
      if (aIdx >= 0 && aIdx < this._array.length) {
        return this._array[aIdx];
      }
      throw new Error('No element indexed by ' + aIdx);
    };

    /**
     * Returns the array representation of this set (which has the proper indices
     * indicated by indexOf). Note that this is a copy of the internal array used
     * for storing the members so that no one can mess with internal state.
     */
    ArraySet.prototype.toArray = function ArraySet_toArray() {
      return this._array.slice();
    };

    var ArraySet_1 = ArraySet;

    var arraySet = {
    	ArraySet: ArraySet_1
    };

    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2014 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */



    /**
     * Determine whether mappingB is after mappingA with respect to generated
     * position.
     */
    function generatedPositionAfter(mappingA, mappingB) {
      // Optimized for most common case
      var lineA = mappingA.generatedLine;
      var lineB = mappingB.generatedLine;
      var columnA = mappingA.generatedColumn;
      var columnB = mappingB.generatedColumn;
      return lineB > lineA || lineB == lineA && columnB >= columnA ||
             util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
    }

    /**
     * A data structure to provide a sorted view of accumulated mappings in a
     * performance conscious manner. It trades a neglibable overhead in general
     * case for a large speedup in case of mappings being added in order.
     */
    function MappingList() {
      this._array = [];
      this._sorted = true;
      // Serves as infimum
      this._last = {generatedLine: -1, generatedColumn: 0};
    }

    /**
     * Iterate through internal items. This method takes the same arguments that
     * `Array.prototype.forEach` takes.
     *
     * NOTE: The order of the mappings is NOT guaranteed.
     */
    MappingList.prototype.unsortedForEach =
      function MappingList_forEach(aCallback, aThisArg) {
        this._array.forEach(aCallback, aThisArg);
      };

    /**
     * Add the given source mapping.
     *
     * @param Object aMapping
     */
    MappingList.prototype.add = function MappingList_add(aMapping) {
      if (generatedPositionAfter(this._last, aMapping)) {
        this._last = aMapping;
        this._array.push(aMapping);
      } else {
        this._sorted = false;
        this._array.push(aMapping);
      }
    };

    /**
     * Returns the flat, sorted array of mappings. The mappings are sorted by
     * generated position.
     *
     * WARNING: This method returns internal data without copying, for
     * performance. The return value must NOT be mutated, and should be treated as
     * an immutable borrow. If you want to take ownership, you must make your own
     * copy.
     */
    MappingList.prototype.toArray = function MappingList_toArray() {
      if (!this._sorted) {
        this._array.sort(util.compareByGeneratedPositionsInflated);
        this._sorted = true;
      }
      return this._array;
    };

    var MappingList_1 = MappingList;

    var mappingList = {
    	MappingList: MappingList_1
    };

    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */



    var ArraySet$1 = arraySet.ArraySet;
    var MappingList$1 = mappingList.MappingList;

    /**
     * An instance of the SourceMapGenerator represents a source map which is
     * being built incrementally. You may pass an object with the following
     * properties:
     *
     *   - file: The filename of the generated source.
     *   - sourceRoot: A root for all relative URLs in this source map.
     */
    function SourceMapGenerator(aArgs) {
      if (!aArgs) {
        aArgs = {};
      }
      this._file = util.getArg(aArgs, 'file', null);
      this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
      this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
      this._sources = new ArraySet$1();
      this._names = new ArraySet$1();
      this._mappings = new MappingList$1();
      this._sourcesContents = null;
    }

    SourceMapGenerator.prototype._version = 3;

    /**
     * Creates a new SourceMapGenerator based on a SourceMapConsumer
     *
     * @param aSourceMapConsumer The SourceMap.
     */
    SourceMapGenerator.fromSourceMap =
      function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
        var sourceRoot = aSourceMapConsumer.sourceRoot;
        var generator = new SourceMapGenerator({
          file: aSourceMapConsumer.file,
          sourceRoot: sourceRoot
        });
        aSourceMapConsumer.eachMapping(function (mapping) {
          var newMapping = {
            generated: {
              line: mapping.generatedLine,
              column: mapping.generatedColumn
            }
          };

          if (mapping.source != null) {
            newMapping.source = mapping.source;
            if (sourceRoot != null) {
              newMapping.source = util.relative(sourceRoot, newMapping.source);
            }

            newMapping.original = {
              line: mapping.originalLine,
              column: mapping.originalColumn
            };

            if (mapping.name != null) {
              newMapping.name = mapping.name;
            }
          }

          generator.addMapping(newMapping);
        });
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var sourceRelative = sourceFile;
          if (sourceRoot !== null) {
            sourceRelative = util.relative(sourceRoot, sourceFile);
          }

          if (!generator._sources.has(sourceRelative)) {
            generator._sources.add(sourceRelative);
          }

          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            generator.setSourceContent(sourceFile, content);
          }
        });
        return generator;
      };

    /**
     * Add a single mapping from original source line and column to the generated
     * source's line and column for this source map being created. The mapping
     * object should have the following properties:
     *
     *   - generated: An object with the generated line and column positions.
     *   - original: An object with the original line and column positions.
     *   - source: The original source file (relative to the sourceRoot).
     *   - name: An optional original token name for this mapping.
     */
    SourceMapGenerator.prototype.addMapping =
      function SourceMapGenerator_addMapping(aArgs) {
        var generated = util.getArg(aArgs, 'generated');
        var original = util.getArg(aArgs, 'original', null);
        var source = util.getArg(aArgs, 'source', null);
        var name = util.getArg(aArgs, 'name', null);

        if (!this._skipValidation) {
          this._validateMapping(generated, original, source, name);
        }

        if (source != null) {
          source = String(source);
          if (!this._sources.has(source)) {
            this._sources.add(source);
          }
        }

        if (name != null) {
          name = String(name);
          if (!this._names.has(name)) {
            this._names.add(name);
          }
        }

        this._mappings.add({
          generatedLine: generated.line,
          generatedColumn: generated.column,
          originalLine: original != null && original.line,
          originalColumn: original != null && original.column,
          source: source,
          name: name
        });
      };

    /**
     * Set the source content for a source file.
     */
    SourceMapGenerator.prototype.setSourceContent =
      function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
        var source = aSourceFile;
        if (this._sourceRoot != null) {
          source = util.relative(this._sourceRoot, source);
        }

        if (aSourceContent != null) {
          // Add the source content to the _sourcesContents map.
          // Create a new _sourcesContents map if the property is null.
          if (!this._sourcesContents) {
            this._sourcesContents = Object.create(null);
          }
          this._sourcesContents[util.toSetString(source)] = aSourceContent;
        } else if (this._sourcesContents) {
          // Remove the source file from the _sourcesContents map.
          // If the _sourcesContents map is empty, set the property to null.
          delete this._sourcesContents[util.toSetString(source)];
          if (Object.keys(this._sourcesContents).length === 0) {
            this._sourcesContents = null;
          }
        }
      };

    /**
     * Applies the mappings of a sub-source-map for a specific source file to the
     * source map being generated. Each mapping to the supplied source file is
     * rewritten using the supplied source map. Note: The resolution for the
     * resulting mappings is the minimium of this map and the supplied map.
     *
     * @param aSourceMapConsumer The source map to be applied.
     * @param aSourceFile Optional. The filename of the source file.
     *        If omitted, SourceMapConsumer's file property will be used.
     * @param aSourceMapPath Optional. The dirname of the path to the source map
     *        to be applied. If relative, it is relative to the SourceMapConsumer.
     *        This parameter is needed when the two source maps aren't in the same
     *        directory, and the source map to be applied contains relative source
     *        paths. If so, those relative source paths need to be rewritten
     *        relative to the SourceMapGenerator.
     */
    SourceMapGenerator.prototype.applySourceMap =
      function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
        var sourceFile = aSourceFile;
        // If aSourceFile is omitted, we will use the file property of the SourceMap
        if (aSourceFile == null) {
          if (aSourceMapConsumer.file == null) {
            throw new Error(
              'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
              'or the source map\'s "file" property. Both were omitted.'
            );
          }
          sourceFile = aSourceMapConsumer.file;
        }
        var sourceRoot = this._sourceRoot;
        // Make "sourceFile" relative if an absolute Url is passed.
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        // Applying the SourceMap can add and remove items from the sources and
        // the names array.
        var newSources = new ArraySet$1();
        var newNames = new ArraySet$1();

        // Find mappings for the "sourceFile"
        this._mappings.unsortedForEach(function (mapping) {
          if (mapping.source === sourceFile && mapping.originalLine != null) {
            // Check if it can be mapped by the source map, then update the mapping.
            var original = aSourceMapConsumer.originalPositionFor({
              line: mapping.originalLine,
              column: mapping.originalColumn
            });
            if (original.source != null) {
              // Copy mapping
              mapping.source = original.source;
              if (aSourceMapPath != null) {
                mapping.source = util.join(aSourceMapPath, mapping.source);
              }
              if (sourceRoot != null) {
                mapping.source = util.relative(sourceRoot, mapping.source);
              }
              mapping.originalLine = original.line;
              mapping.originalColumn = original.column;
              if (original.name != null) {
                mapping.name = original.name;
              }
            }
          }

          var source = mapping.source;
          if (source != null && !newSources.has(source)) {
            newSources.add(source);
          }

          var name = mapping.name;
          if (name != null && !newNames.has(name)) {
            newNames.add(name);
          }

        }, this);
        this._sources = newSources;
        this._names = newNames;

        // Copy sourcesContents of applied map.
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            if (aSourceMapPath != null) {
              sourceFile = util.join(aSourceMapPath, sourceFile);
            }
            if (sourceRoot != null) {
              sourceFile = util.relative(sourceRoot, sourceFile);
            }
            this.setSourceContent(sourceFile, content);
          }
        }, this);
      };

    /**
     * A mapping can have one of the three levels of data:
     *
     *   1. Just the generated position.
     *   2. The Generated position, original position, and original source.
     *   3. Generated and original position, original source, as well as a name
     *      token.
     *
     * To maintain consistency, we validate that any new mapping being added falls
     * in to one of these categories.
     */
    SourceMapGenerator.prototype._validateMapping =
      function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                  aName) {
        // When aOriginal is truthy but has empty values for .line and .column,
        // it is most likely a programmer error. In this case we throw a very
        // specific error message to try to guide them the right way.
        // For example: https://github.com/Polymer/polymer-bundler/pull/519
        if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
            throw new Error(
                'original.line and original.column are not numbers -- you probably meant to omit ' +
                'the original mapping entirely and only map the generated position. If so, pass ' +
                'null for the original mapping instead of an object with empty or null values.'
            );
        }

        if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
            && aGenerated.line > 0 && aGenerated.column >= 0
            && !aOriginal && !aSource && !aName) {
          // Case 1.
          return;
        }
        else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
                 && aOriginal && 'line' in aOriginal && 'column' in aOriginal
                 && aGenerated.line > 0 && aGenerated.column >= 0
                 && aOriginal.line > 0 && aOriginal.column >= 0
                 && aSource) {
          // Cases 2 and 3.
          return;
        }
        else {
          throw new Error('Invalid mapping: ' + JSON.stringify({
            generated: aGenerated,
            source: aSource,
            original: aOriginal,
            name: aName
          }));
        }
      };

    /**
     * Serialize the accumulated mappings in to the stream of base 64 VLQs
     * specified by the source map format.
     */
    SourceMapGenerator.prototype._serializeMappings =
      function SourceMapGenerator_serializeMappings() {
        var previousGeneratedColumn = 0;
        var previousGeneratedLine = 1;
        var previousOriginalColumn = 0;
        var previousOriginalLine = 0;
        var previousName = 0;
        var previousSource = 0;
        var result = '';
        var next;
        var mapping;
        var nameIdx;
        var sourceIdx;

        var mappings = this._mappings.toArray();
        for (var i = 0, len = mappings.length; i < len; i++) {
          mapping = mappings[i];
          next = '';

          if (mapping.generatedLine !== previousGeneratedLine) {
            previousGeneratedColumn = 0;
            while (mapping.generatedLine !== previousGeneratedLine) {
              next += ';';
              previousGeneratedLine++;
            }
          }
          else {
            if (i > 0) {
              if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
                continue;
              }
              next += ',';
            }
          }

          next += base64Vlq.encode(mapping.generatedColumn
                                     - previousGeneratedColumn);
          previousGeneratedColumn = mapping.generatedColumn;

          if (mapping.source != null) {
            sourceIdx = this._sources.indexOf(mapping.source);
            next += base64Vlq.encode(sourceIdx - previousSource);
            previousSource = sourceIdx;

            // lines are stored 0-based in SourceMap spec version 3
            next += base64Vlq.encode(mapping.originalLine - 1
                                       - previousOriginalLine);
            previousOriginalLine = mapping.originalLine - 1;

            next += base64Vlq.encode(mapping.originalColumn
                                       - previousOriginalColumn);
            previousOriginalColumn = mapping.originalColumn;

            if (mapping.name != null) {
              nameIdx = this._names.indexOf(mapping.name);
              next += base64Vlq.encode(nameIdx - previousName);
              previousName = nameIdx;
            }
          }

          result += next;
        }

        return result;
      };

    SourceMapGenerator.prototype._generateSourcesContent =
      function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
        return aSources.map(function (source) {
          if (!this._sourcesContents) {
            return null;
          }
          if (aSourceRoot != null) {
            source = util.relative(aSourceRoot, source);
          }
          var key = util.toSetString(source);
          return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
            ? this._sourcesContents[key]
            : null;
        }, this);
      };

    /**
     * Externalize the source map.
     */
    SourceMapGenerator.prototype.toJSON =
      function SourceMapGenerator_toJSON() {
        var map = {
          version: this._version,
          sources: this._sources.toArray(),
          names: this._names.toArray(),
          mappings: this._serializeMappings()
        };
        if (this._file != null) {
          map.file = this._file;
        }
        if (this._sourceRoot != null) {
          map.sourceRoot = this._sourceRoot;
        }
        if (this._sourcesContents) {
          map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
        }

        return map;
      };

    /**
     * Render the source map being generated to a string.
     */
    SourceMapGenerator.prototype.toString =
      function SourceMapGenerator_toString() {
        return JSON.stringify(this.toJSON());
      };

    var SourceMapGenerator_1 = SourceMapGenerator;

    var sourceMapGenerator = {
    	SourceMapGenerator: SourceMapGenerator_1
    };

    var SourceMapGenerator$1 = sourceMapGenerator.SourceMapGenerator;
    var trackNodes = {
        Atrule: true,
        Selector: true,
        Declaration: true
    };

    var sourceMap = function generateSourceMap(handlers) {
        var map = new SourceMapGenerator$1();
        var line = 1;
        var column = 0;
        var generated = {
            line: 1,
            column: 0
        };
        var original = {
            line: 0, // should be zero to add first mapping
            column: 0
        };
        var sourceMappingActive = false;
        var activatedGenerated = {
            line: 1,
            column: 0
        };
        var activatedMapping = {
            generated: activatedGenerated
        };

        var handlersNode = handlers.node;
        handlers.node = function(node) {
            if (node.loc && node.loc.start && trackNodes.hasOwnProperty(node.type)) {
                var nodeLine = node.loc.start.line;
                var nodeColumn = node.loc.start.column - 1;

                if (original.line !== nodeLine ||
                    original.column !== nodeColumn) {
                    original.line = nodeLine;
                    original.column = nodeColumn;

                    generated.line = line;
                    generated.column = column;

                    if (sourceMappingActive) {
                        sourceMappingActive = false;
                        if (generated.line !== activatedGenerated.line ||
                            generated.column !== activatedGenerated.column) {
                            map.addMapping(activatedMapping);
                        }
                    }

                    sourceMappingActive = true;
                    map.addMapping({
                        source: node.loc.source,
                        original: original,
                        generated: generated
                    });
                }
            }

            handlersNode.call(this, node);

            if (sourceMappingActive && trackNodes.hasOwnProperty(node.type)) {
                activatedGenerated.line = line;
                activatedGenerated.column = column;
            }
        };

        var handlersChunk = handlers.chunk;
        handlers.chunk = function(chunk) {
            for (var i = 0; i < chunk.length; i++) {
                if (chunk.charCodeAt(i) === 10) { // \n
                    line++;
                    column = 0;
                } else {
                    column++;
                }
            }

            handlersChunk(chunk);
        };

        var handlersResult = handlers.result;
        handlers.result = function() {
            if (sourceMappingActive) {
                map.addMapping(activatedMapping);
            }

            return {
                css: handlersResult(),
                map: map
            };
        };

        return handlers;
    };

    var hasOwnProperty$3 = Object.prototype.hasOwnProperty;

    function processChildren(node, delimeter) {
        var list = node.children;
        var prev = null;

        if (typeof delimeter !== 'function') {
            list.forEach(this.node, this);
        } else {
            list.forEach(function(node) {
                if (prev !== null) {
                    delimeter.call(this, prev);
                }

                this.node(node);
                prev = node;
            }, this);
        }
    }

    var create$1 = function createGenerator(config) {
        function processNode(node) {
            if (hasOwnProperty$3.call(types, node.type)) {
                types[node.type].call(this, node);
            } else {
                throw new Error('Unknown node type: ' + node.type);
            }
        }

        var types = {};

        if (config.node) {
            for (var name in config.node) {
                types[name] = config.node[name].generate;
            }
        }

        return function(node, options) {
            var buffer = '';
            var handlers = {
                children: processChildren,
                node: processNode,
                chunk: function(chunk) {
                    buffer += chunk;
                },
                result: function() {
                    return buffer;
                }
            };

            if (options) {
                if (typeof options.decorator === 'function') {
                    handlers = options.decorator(handlers);
                }

                if (options.sourceMap) {
                    handlers = sourceMap(handlers);
                }
            }

            handlers.node(node);

            return handlers.result();
        };
    };

    var create$2 = function createConvertors(walk) {
        return {
            fromPlainObject: function(ast) {
                walk(ast, {
                    enter: function(node) {
                        if (node.children && node.children instanceof List_1 === false) {
                            node.children = new List_1().fromArray(node.children);
                        }
                    }
                });

                return ast;
            },
            toPlainObject: function(ast) {
                walk(ast, {
                    leave: function(node) {
                        if (node.children && node.children instanceof List_1) {
                            node.children = node.children.toArray();
                        }
                    }
                });

                return ast;
            }
        };
    };

    var hasOwnProperty$4 = Object.prototype.hasOwnProperty;
    var noop$3 = function() {};

    function ensureFunction$1(value) {
        return typeof value === 'function' ? value : noop$3;
    }

    function invokeForType(fn, type) {
        return function(node, item, list) {
            if (node.type === type) {
                fn.call(this, node, item, list);
            }
        };
    }

    function getWalkersFromStructure(name, nodeType) {
        var structure = nodeType.structure;
        var walkers = [];

        for (var key in structure) {
            if (hasOwnProperty$4.call(structure, key) === false) {
                continue;
            }

            var fieldTypes = structure[key];
            var walker = {
                name: key,
                type: false,
                nullable: false
            };

            if (!Array.isArray(structure[key])) {
                fieldTypes = [structure[key]];
            }

            for (var i = 0; i < fieldTypes.length; i++) {
                var fieldType = fieldTypes[i];
                if (fieldType === null) {
                    walker.nullable = true;
                } else if (typeof fieldType === 'string') {
                    walker.type = 'node';
                } else if (Array.isArray(fieldType)) {
                    walker.type = 'list';
                }
            }

            if (walker.type) {
                walkers.push(walker);
            }
        }

        if (walkers.length) {
            return {
                context: nodeType.walkContext,
                fields: walkers
            };
        }

        return null;
    }

    function getTypesFromConfig(config) {
        var types = {};

        for (var name in config.node) {
            if (hasOwnProperty$4.call(config.node, name)) {
                var nodeType = config.node[name];

                if (!nodeType.structure) {
                    throw new Error('Missed `structure` field in `' + name + '` node type definition');
                }

                types[name] = getWalkersFromStructure(name, nodeType);
            }
        }

        return types;
    }

    function createTypeIterator(config, reverse) {
        var fields = config.fields.slice();
        var contextName = config.context;
        var useContext = typeof contextName === 'string';

        if (reverse) {
            fields.reverse();
        }

        return function(node, context, walk) {
            var prevContextValue;

            if (useContext) {
                prevContextValue = context[contextName];
                context[contextName] = node;
            }

            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                var ref = node[field.name];

                if (!field.nullable || ref) {
                    if (field.type === 'list') {
                        if (reverse) {
                            ref.forEachRight(walk);
                        } else {
                            ref.forEach(walk);
                        }
                    } else {
                        walk(ref);
                    }
                }
            }

            if (useContext) {
                context[contextName] = prevContextValue;
            }
        };
    }

    function createFastTraveralMap(iterators) {
        return {
            Atrule: {
                StyleSheet: iterators.StyleSheet,
                Atrule: iterators.Atrule,
                Rule: iterators.Rule,
                Block: iterators.Block
            },
            Rule: {
                StyleSheet: iterators.StyleSheet,
                Atrule: iterators.Atrule,
                Rule: iterators.Rule,
                Block: iterators.Block
            },
            Declaration: {
                StyleSheet: iterators.StyleSheet,
                Atrule: iterators.Atrule,
                Rule: iterators.Rule,
                Block: iterators.Block,
                DeclarationList: iterators.DeclarationList
            }
        };
    }

    var create$3 = function createWalker(config) {
        var types = getTypesFromConfig(config);
        var iteratorsNatural = {};
        var iteratorsReverse = {};

        for (var name in types) {
            if (hasOwnProperty$4.call(types, name) && types[name] !== null) {
                iteratorsNatural[name] = createTypeIterator(types[name], false);
                iteratorsReverse[name] = createTypeIterator(types[name], true);
            }
        }

        var fastTraversalIteratorsNatural = createFastTraveralMap(iteratorsNatural);
        var fastTraversalIteratorsReverse = createFastTraveralMap(iteratorsReverse);

        var walk = function(root, options) {
            function walkNode(node, item, list) {
                enter.call(context, node, item, list);

                if (iterators.hasOwnProperty(node.type)) {
                    iterators[node.type](node, context, walkNode);
                }

                leave.call(context, node, item, list);
            }

            var enter = noop$3;
            var leave = noop$3;
            var iterators = iteratorsNatural;
            var context = {
                root: root,
                stylesheet: null,
                atrule: null,
                atrulePrelude: null,
                rule: null,
                selector: null,
                block: null,
                declaration: null,
                function: null
            };

            if (typeof options === 'function') {
                enter = options;
            } else if (options) {
                enter = ensureFunction$1(options.enter);
                leave = ensureFunction$1(options.leave);

                if (options.reverse) {
                    iterators = iteratorsReverse;
                }

                if (options.visit) {
                    if (fastTraversalIteratorsNatural.hasOwnProperty(options.visit)) {
                        iterators = options.reverse
                            ? fastTraversalIteratorsReverse[options.visit]
                            : fastTraversalIteratorsNatural[options.visit];
                    } else if (!types.hasOwnProperty(options.visit)) {
                        throw new Error('Bad value `' + options.visit + '` for `visit` option (should be: ' + Object.keys(types).join(', ') + ')');
                    }

                    enter = invokeForType(enter, options.visit);
                    leave = invokeForType(leave, options.visit);
                }
            }

            if (enter === noop$3 && leave === noop$3) {
                throw new Error('Neither `enter` nor `leave` walker handler is set or both aren\'t a function');
            }

            // swap handlers in reverse mode to invert visit order
            if (options.reverse) {
                var tmp = enter;
                enter = leave;
                leave = tmp;
            }

            walkNode(root);
        };

        walk.find = function(ast, fn) {
            var found = null;

            walk(ast, function(node, item, list) {
                if (found === null && fn.call(this, node, item, list)) {
                    found = node;
                }
            });

            return found;
        };

        walk.findLast = function(ast, fn) {
            var found = null;

            walk(ast, {
                reverse: true,
                enter: function(node, item, list) {
                    if (found === null && fn.call(this, node, item, list)) {
                        found = node;
                    }
                }
            });

            return found;
        };

        walk.findAll = function(ast, fn) {
            var found = [];

            walk(ast, function(node, item, list) {
                if (fn.call(this, node, item, list)) {
                    found.push(node);
                }
            });

            return found;
        };

        return walk;
    };

    var clone = function clone(node) {
        var result = {};

        for (var key in node) {
            var value = node[key];

            if (value) {
                if (Array.isArray(value) || value instanceof List_1) {
                    value = value.map(clone);
                } else if (value.constructor === Object) {
                    value = clone(value);
                }
            }

            result[key] = value;
        }

        return result;
    };

    var hasOwnProperty$5 = Object.prototype.hasOwnProperty;
    var shape = {
        generic: true,
        types: {},
        atrules: {},
        properties: {},
        parseContext: {},
        scope: {},
        atrule: ['parse'],
        pseudo: ['parse'],
        node: ['name', 'structure', 'parse', 'generate', 'walkContext']
    };

    function isObject(value) {
        return value && value.constructor === Object;
    }

    function copy(value) {
        if (isObject(value)) {
            return Object.assign({}, value);
        } else {
            return value;
        }
    }
    function extend(dest, src) {
        for (var key in src) {
            if (hasOwnProperty$5.call(src, key)) {
                if (isObject(dest[key])) {
                    extend(dest[key], copy(src[key]));
                } else {
                    dest[key] = copy(src[key]);
                }
            }
        }
    }

    function mix(dest, src, shape) {
        for (var key in shape) {
            if (hasOwnProperty$5.call(shape, key) === false) {
                continue;
            }

            if (shape[key] === true) {
                if (key in src) {
                    if (hasOwnProperty$5.call(src, key)) {
                        dest[key] = copy(src[key]);
                    }
                }
            } else if (shape[key]) {
                if (isObject(shape[key])) {
                    var res = {};
                    extend(res, dest[key]);
                    extend(res, src[key]);
                    dest[key] = res;
                } else if (Array.isArray(shape[key])) {
                    var res = {};
                    var innerShape = shape[key].reduce(function(s, k) {
                        s[k] = true;
                        return s;
                    }, {});
                    for (var name in dest[key]) {
                        if (hasOwnProperty$5.call(dest[key], name)) {
                            res[name] = {};
                            if (dest[key] && dest[key][name]) {
                                mix(res[name], dest[key][name], innerShape);
                            }
                        }
                    }
                    for (var name in src[key]) {
                        if (hasOwnProperty$5.call(src[key], name)) {
                            if (!res[name]) {
                                res[name] = {};
                            }
                            if (src[key] && src[key][name]) {
                                mix(res[name], src[key][name], innerShape);
                            }
                        }
                    }
                    dest[key] = res;
                }
            }
        }
        return dest;
    }

    var mix_1 = function(dest, src) {
        return mix(dest, src, shape);
    };

    function createSyntax(config) {
        var parse = create(config);
        var walk = create$3(config);
        var generate = create$1(config);
        var convert = create$2(walk);

        var syntax = {
            List: List_1,
            SyntaxError: _SyntaxError,
            TokenStream: TokenStream_1,
            Lexer: Lexer_1,

            vendorPrefix: names.vendorPrefix,
            keyword: names.keyword,
            property: names.property,
            isCustomProperty: names.isCustomProperty,

            definitionSyntax: definitionSyntax,
            lexer: null,
            createLexer: function(config) {
                return new Lexer_1(config, syntax, syntax.lexer.structure);
            },

            tokenize: tokenizer,
            parse: parse,
            walk: walk,
            generate: generate,

            find: walk.find,
            findLast: walk.findLast,
            findAll: walk.findAll,

            clone: clone,
            fromPlainObject: convert.fromPlainObject,
            toPlainObject: convert.toPlainObject,

            createSyntax: function(config) {
                return createSyntax(mix_1({}, config));
            },
            fork: function(extension) {
                var base = mix_1({}, config); // copy of config
                return createSyntax(
                    typeof extension === 'function'
                        ? extension(base, Object.assign)
                        : mix_1(base, extension)
                );
            }
        };

        syntax.lexer = new Lexer_1({
            generic: true,
            types: config.types,
            atrules: config.atrules,
            properties: config.properties,
            node: config.node
        }, syntax);

        return syntax;
    }
    var create_1 = function(config) {
        return createSyntax(mix_1({}, config));
    };

    var create$4 = {
    	create: create_1
    };

    var generic$1 = true;
    var types = {
    	"absolute-size": "xx-small|x-small|small|medium|large|x-large|xx-large",
    	"alpha-value": "<number>|<percentage>",
    	"angle-percentage": "<angle>|<percentage>",
    	"angular-color-hint": "<angle-percentage>",
    	"angular-color-stop": "<color>&&<color-stop-angle>?",
    	"angular-color-stop-list": "[<angular-color-stop> [, <angular-color-hint>]?]# , <angular-color-stop>",
    	"animateable-feature": "scroll-position|contents|<custom-ident>",
    	attachment: "scroll|fixed|local",
    	"attr()": "attr( <attr-name> <type-or-unit>? [, <attr-fallback>]? )",
    	"attr-matcher": "['~'|'|'|'^'|'$'|'*']? '='",
    	"attr-modifier": "i|s",
    	"attribute-selector": "'[' <wq-name> ']'|'[' <wq-name> <attr-matcher> [<string-token>|<ident-token>] <attr-modifier>? ']'",
    	"auto-repeat": "repeat( [auto-fill|auto-fit] , [<line-names>? <fixed-size>]+ <line-names>? )",
    	"auto-track-list": "[<line-names>? [<fixed-size>|<fixed-repeat>]]* <line-names>? <auto-repeat> [<line-names>? [<fixed-size>|<fixed-repeat>]]* <line-names>?",
    	"baseline-position": "[first|last]? baseline",
    	"basic-shape": "<inset()>|<circle()>|<ellipse()>|<polygon()>",
    	"bg-image": "none|<image>",
    	"bg-layer": "<bg-image>||<bg-position> [/ <bg-size>]?||<repeat-style>||<attachment>||<box>||<box>",
    	"bg-position": "[[left|center|right|top|bottom|<length-percentage>]|[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]|[center|[left|right] <length-percentage>?]&&[center|[top|bottom] <length-percentage>?]]",
    	"bg-size": "[<length-percentage>|auto]{1,2}|cover|contain",
    	"blur()": "blur( <length> )",
    	"blend-mode": "normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity",
    	box: "border-box|padding-box|content-box",
    	"brightness()": "brightness( <number-percentage> )",
    	"calc()": "calc( <calc-sum> )",
    	"calc-sum": "<calc-product> [['+'|'-'] <calc-product>]*",
    	"calc-product": "<calc-value> ['*' <calc-value>|'/' <number>]*",
    	"calc-value": "<number>|<dimension>|<percentage>|( <calc-sum> )",
    	"cf-final-image": "<image>|<color>",
    	"cf-mixing-image": "<percentage>?&&<image>",
    	"circle()": "circle( [<shape-radius>]? [at <position>]? )",
    	"clamp()": "clamp( <calc-sum>#{3} )",
    	"class-selector": "'.' <ident-token>",
    	"clip-source": "<url>",
    	color: "<rgb()>|<rgba()>|<hsl()>|<hsla()>|<hex-color>|<named-color>|currentcolor|<deprecated-system-color>",
    	"color-stop": "<color-stop-length>|<color-stop-angle>",
    	"color-stop-angle": "<angle-percentage>{1,2}",
    	"color-stop-length": "<length-percentage>{1,2}",
    	"color-stop-list": "[<linear-color-stop> [, <linear-color-hint>]?]# , <linear-color-stop>",
    	combinator: "'>'|'+'|'~'|['||']",
    	"common-lig-values": "[common-ligatures|no-common-ligatures]",
    	compat: "searchfield|textarea|push-button|button-bevel|slider-horizontal|checkbox|radio|square-button|menulist|menulist-button|listbox|meter|progress-bar",
    	"composite-style": "clear|copy|source-over|source-in|source-out|source-atop|destination-over|destination-in|destination-out|destination-atop|xor",
    	"compositing-operator": "add|subtract|intersect|exclude",
    	"compound-selector": "[<type-selector>? <subclass-selector>* [<pseudo-element-selector> <pseudo-class-selector>*]*]!",
    	"compound-selector-list": "<compound-selector>#",
    	"complex-selector": "<compound-selector> [<combinator>? <compound-selector>]*",
    	"complex-selector-list": "<complex-selector>#",
    	"conic-gradient()": "conic-gradient( [from <angle>]? [at <position>]? , <angular-color-stop-list> )",
    	"contextual-alt-values": "[contextual|no-contextual]",
    	"content-distribution": "space-between|space-around|space-evenly|stretch",
    	"content-list": "[<string>|contents|<url>|<quote>|<attr()>|counter( <ident> , <'list-style-type'>? )]+",
    	"content-position": "center|start|end|flex-start|flex-end",
    	"content-replacement": "<image>",
    	"contrast()": "contrast( [<number-percentage>] )",
    	"counter()": "counter( <custom-ident> , [<counter-style>|none]? )",
    	"counter-style": "<counter-style-name>|symbols( )",
    	"counter-style-name": "<custom-ident>",
    	"counters()": "counters( <custom-ident> , <string> , [<counter-style>|none]? )",
    	"cross-fade()": "cross-fade( <cf-mixing-image> , <cf-final-image>? )",
    	"cubic-bezier-timing-function": "ease|ease-in|ease-out|ease-in-out|cubic-bezier( <number> , <number> , <number> , <number> )",
    	"deprecated-system-color": "ActiveBorder|ActiveCaption|AppWorkspace|Background|ButtonFace|ButtonHighlight|ButtonShadow|ButtonText|CaptionText|GrayText|Highlight|HighlightText|InactiveBorder|InactiveCaption|InactiveCaptionText|InfoBackground|InfoText|Menu|MenuText|Scrollbar|ThreeDDarkShadow|ThreeDFace|ThreeDHighlight|ThreeDLightShadow|ThreeDShadow|Window|WindowFrame|WindowText",
    	"discretionary-lig-values": "[discretionary-ligatures|no-discretionary-ligatures]",
    	"display-box": "contents|none",
    	"display-inside": "flow|flow-root|table|flex|grid|ruby",
    	"display-internal": "table-row-group|table-header-group|table-footer-group|table-row|table-cell|table-column-group|table-column|table-caption|ruby-base|ruby-text|ruby-base-container|ruby-text-container",
    	"display-legacy": "inline-block|inline-list-item|inline-table|inline-flex|inline-grid",
    	"display-listitem": "<display-outside>?&&[flow|flow-root]?&&list-item",
    	"display-outside": "block|inline|run-in",
    	"drop-shadow()": "drop-shadow( <length>{2,3} <color>? )",
    	"east-asian-variant-values": "[jis78|jis83|jis90|jis04|simplified|traditional]",
    	"east-asian-width-values": "[full-width|proportional-width]",
    	"element()": "element( <id-selector> )",
    	"ellipse()": "ellipse( [<shape-radius>{2}]? [at <position>]? )",
    	"ending-shape": "circle|ellipse",
    	"env()": "env( <custom-ident> , <declaration-value>? )",
    	"explicit-track-list": "[<line-names>? <track-size>]+ <line-names>?",
    	"family-name": "<string>|<custom-ident>+",
    	"feature-tag-value": "<string> [<integer>|on|off]?",
    	"feature-type": "@stylistic|@historical-forms|@styleset|@character-variant|@swash|@ornaments|@annotation",
    	"feature-value-block": "<feature-type> '{' <feature-value-declaration-list> '}'",
    	"feature-value-block-list": "<feature-value-block>+",
    	"feature-value-declaration": "<custom-ident> : <integer>+ ;",
    	"feature-value-declaration-list": "<feature-value-declaration>",
    	"feature-value-name": "<custom-ident>",
    	"fill-rule": "nonzero|evenodd",
    	"filter-function": "<blur()>|<brightness()>|<contrast()>|<drop-shadow()>|<grayscale()>|<hue-rotate()>|<invert()>|<opacity()>|<saturate()>|<sepia()>",
    	"filter-function-list": "[<filter-function>|<url>]+",
    	"final-bg-layer": "<'background-color'>||<bg-image>||<bg-position> [/ <bg-size>]?||<repeat-style>||<attachment>||<box>||<box>",
    	"fit-content()": "fit-content( [<length>|<percentage>] )",
    	"fixed-breadth": "<length-percentage>",
    	"fixed-repeat": "repeat( [<positive-integer>] , [<line-names>? <fixed-size>]+ <line-names>? )",
    	"fixed-size": "<fixed-breadth>|minmax( <fixed-breadth> , <track-breadth> )|minmax( <inflexible-breadth> , <fixed-breadth> )",
    	"font-stretch-absolute": "normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded|<percentage>",
    	"font-variant-css21": "[normal|small-caps]",
    	"font-weight-absolute": "normal|bold|<number>",
    	"frequency-percentage": "<frequency>|<percentage>",
    	"general-enclosed": "[<function-token> <any-value> )]|( <ident> <any-value> )",
    	"generic-family": "serif|sans-serif|cursive|fantasy|monospace|-apple-system",
    	"generic-name": "serif|sans-serif|cursive|fantasy|monospace",
    	"geometry-box": "<shape-box>|fill-box|stroke-box|view-box",
    	gradient: "<linear-gradient()>|<repeating-linear-gradient()>|<radial-gradient()>|<repeating-radial-gradient()>|<conic-gradient()>|<-legacy-gradient>",
    	"grayscale()": "grayscale( <number-percentage> )",
    	"grid-line": "auto|<custom-ident>|[<integer>&&<custom-ident>?]|[span&&[<integer>||<custom-ident>]]",
    	"historical-lig-values": "[historical-ligatures|no-historical-ligatures]",
    	"hsl()": "hsl( <hue> <percentage> <percentage> [/ <alpha-value>]? )|hsl( <hue> , <percentage> , <percentage> , <alpha-value>? )",
    	"hsla()": "hsla( <hue> <percentage> <percentage> [/ <alpha-value>]? )|hsla( <hue> , <percentage> , <percentage> , <alpha-value>? )",
    	hue: "<number>|<angle>",
    	"hue-rotate()": "hue-rotate( <angle> )",
    	image: "<url>|<image()>|<image-set()>|<element()>|<cross-fade()>|<gradient>",
    	"image()": "image( <image-tags>? [<image-src>? , <color>?]! )",
    	"image-set()": "image-set( <image-set-option># )",
    	"image-set-option": "[<image>|<string>] <resolution>",
    	"image-src": "<url>|<string>",
    	"image-tags": "ltr|rtl",
    	"inflexible-breadth": "<length>|<percentage>|min-content|max-content|auto",
    	"inset()": "inset( <length-percentage>{1,4} [round <'border-radius'>]? )",
    	"invert()": "invert( <number-percentage> )",
    	"keyframes-name": "<custom-ident>|<string>",
    	"keyframe-block": "<keyframe-selector># { <declaration-list> }",
    	"keyframe-block-list": "<keyframe-block>+",
    	"keyframe-selector": "from|to|<percentage>",
    	"leader()": "leader( <leader-type> )",
    	"leader-type": "dotted|solid|space|<string>",
    	"length-percentage": "<length>|<percentage>",
    	"line-names": "'[' <custom-ident>* ']'",
    	"line-name-list": "[<line-names>|<name-repeat>]+",
    	"line-style": "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset",
    	"line-width": "<length>|thin|medium|thick",
    	"linear-color-hint": "<length-percentage>",
    	"linear-color-stop": "<color> <color-stop-length>?",
    	"linear-gradient()": "linear-gradient( [<angle>|to <side-or-corner>]? , <color-stop-list> )",
    	"mask-layer": "<mask-reference>||<position> [/ <bg-size>]?||<repeat-style>||<geometry-box>||[<geometry-box>|no-clip]||<compositing-operator>||<masking-mode>",
    	"mask-position": "[<length-percentage>|left|center|right] [<length-percentage>|top|center|bottom]?",
    	"mask-reference": "none|<image>|<mask-source>",
    	"mask-source": "<url>",
    	"masking-mode": "alpha|luminance|match-source",
    	"matrix()": "matrix( <number>#{6} )",
    	"matrix3d()": "matrix3d( <number>#{16} )",
    	"max()": "max( <calc-sum># )",
    	"media-and": "<media-in-parens> [and <media-in-parens>]+",
    	"media-condition": "<media-not>|<media-and>|<media-or>|<media-in-parens>",
    	"media-condition-without-or": "<media-not>|<media-and>|<media-in-parens>",
    	"media-feature": "( [<mf-plain>|<mf-boolean>|<mf-range>] )",
    	"media-in-parens": "( <media-condition> )|<media-feature>|<general-enclosed>",
    	"media-not": "not <media-in-parens>",
    	"media-or": "<media-in-parens> [or <media-in-parens>]+",
    	"media-query": "<media-condition>|[not|only]? <media-type> [and <media-condition-without-or>]?",
    	"media-query-list": "<media-query>#",
    	"media-type": "<ident>",
    	"mf-boolean": "<mf-name>",
    	"mf-name": "<ident>",
    	"mf-plain": "<mf-name> : <mf-value>",
    	"mf-range": "<mf-name> ['<'|'>']? '='? <mf-value>|<mf-value> ['<'|'>']? '='? <mf-name>|<mf-value> '<' '='? <mf-name> '<' '='? <mf-value>|<mf-value> '>' '='? <mf-name> '>' '='? <mf-value>",
    	"mf-value": "<number>|<dimension>|<ident>|<ratio>",
    	"min()": "min( <calc-sum># )",
    	"minmax()": "minmax( [<length>|<percentage>|<flex>|min-content|max-content|auto] , [<length>|<percentage>|<flex>|min-content|max-content|auto] )",
    	"named-color": "transparent|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen|<-non-standard-color>",
    	"namespace-prefix": "<ident>",
    	"ns-prefix": "[<ident-token>|'*']? '|'",
    	"number-percentage": "<number>|<percentage>",
    	"numeric-figure-values": "[lining-nums|oldstyle-nums]",
    	"numeric-fraction-values": "[diagonal-fractions|stacked-fractions]",
    	"numeric-spacing-values": "[proportional-nums|tabular-nums]",
    	nth: "<an-plus-b>|even|odd",
    	"opacity()": "opacity( [<number-percentage>] )",
    	"overflow-position": "unsafe|safe",
    	"outline-radius": "<length>|<percentage>",
    	"page-body": "<declaration>? [; <page-body>]?|<page-margin-box> <page-body>",
    	"page-margin-box": "<page-margin-box-type> '{' <declaration-list> '}'",
    	"page-margin-box-type": "@top-left-corner|@top-left|@top-center|@top-right|@top-right-corner|@bottom-left-corner|@bottom-left|@bottom-center|@bottom-right|@bottom-right-corner|@left-top|@left-middle|@left-bottom|@right-top|@right-middle|@right-bottom",
    	"page-selector-list": "[<page-selector>#]?",
    	"page-selector": "<pseudo-page>+|<ident> <pseudo-page>*",
    	"perspective()": "perspective( <length> )",
    	"polygon()": "polygon( <fill-rule>? , [<length-percentage> <length-percentage>]# )",
    	position: "[[left|center|right]||[top|center|bottom]|[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]?|[[left|right] <length-percentage>]&&[[top|bottom] <length-percentage>]]",
    	"pseudo-class-selector": "':' <ident-token>|':' <function-token> <any-value> ')'",
    	"pseudo-element-selector": "':' <pseudo-class-selector>",
    	"pseudo-page": ": [left|right|first|blank]",
    	quote: "open-quote|close-quote|no-open-quote|no-close-quote",
    	"radial-gradient()": "radial-gradient( [<ending-shape>||<size>]? [at <position>]? , <color-stop-list> )",
    	"relative-selector": "<combinator>? <complex-selector>",
    	"relative-selector-list": "<relative-selector>#",
    	"relative-size": "larger|smaller",
    	"repeat-style": "repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}",
    	"repeating-linear-gradient()": "repeating-linear-gradient( [<angle>|to <side-or-corner>]? , <color-stop-list> )",
    	"repeating-radial-gradient()": "repeating-radial-gradient( [<ending-shape>||<size>]? [at <position>]? , <color-stop-list> )",
    	"rgb()": "rgb( <percentage>{3} [/ <alpha-value>]? )|rgb( <number>{3} [/ <alpha-value>]? )|rgb( <percentage>#{3} , <alpha-value>? )|rgb( <number>#{3} , <alpha-value>? )",
    	"rgba()": "rgba( <percentage>{3} [/ <alpha-value>]? )|rgba( <number>{3} [/ <alpha-value>]? )|rgba( <percentage>#{3} , <alpha-value>? )|rgba( <number>#{3} , <alpha-value>? )",
    	"rotate()": "rotate( [<angle>|<zero>] )",
    	"rotate3d()": "rotate3d( <number> , <number> , <number> , [<angle>|<zero>] )",
    	"rotateX()": "rotateX( [<angle>|<zero>] )",
    	"rotateY()": "rotateY( [<angle>|<zero>] )",
    	"rotateZ()": "rotateZ( [<angle>|<zero>] )",
    	"saturate()": "saturate( <number-percentage> )",
    	"scale()": "scale( <number> , <number>? )",
    	"scale3d()": "scale3d( <number> , <number> , <number> )",
    	"scaleX()": "scaleX( <number> )",
    	"scaleY()": "scaleY( <number> )",
    	"scaleZ()": "scaleZ( <number> )",
    	"self-position": "center|start|end|self-start|self-end|flex-start|flex-end",
    	"shape-radius": "<length-percentage>|closest-side|farthest-side",
    	"skew()": "skew( [<angle>|<zero>] , [<angle>|<zero>]? )",
    	"skewX()": "skewX( [<angle>|<zero>] )",
    	"skewY()": "skewY( [<angle>|<zero>] )",
    	"sepia()": "sepia( <number-percentage> )",
    	shadow: "inset?&&<length>{2,4}&&<color>?",
    	"shadow-t": "[<length>{2,3}&&<color>?]",
    	shape: "rect( <top> , <right> , <bottom> , <left> )|rect( <top> <right> <bottom> <left> )",
    	"shape-box": "<box>|margin-box",
    	"side-or-corner": "[left|right]||[top|bottom]",
    	"single-animation": "<time>||<timing-function>||<time>||<single-animation-iteration-count>||<single-animation-direction>||<single-animation-fill-mode>||<single-animation-play-state>||[none|<keyframes-name>]",
    	"single-animation-direction": "normal|reverse|alternate|alternate-reverse",
    	"single-animation-fill-mode": "none|forwards|backwards|both",
    	"single-animation-iteration-count": "infinite|<number>",
    	"single-animation-play-state": "running|paused",
    	"single-transition": "[none|<single-transition-property>]||<time>||<timing-function>||<time>",
    	"single-transition-property": "all|<custom-ident>",
    	size: "closest-side|farthest-side|closest-corner|farthest-corner|<length>|<length-percentage>{2}",
    	"step-position": "jump-start|jump-end|jump-none|jump-both|start|end",
    	"step-timing-function": "step-start|step-end|steps( <integer> [, <step-position>]? )",
    	"subclass-selector": "<id-selector>|<class-selector>|<attribute-selector>|<pseudo-class-selector>",
    	"supports-condition": "not <supports-in-parens>|<supports-in-parens> [and <supports-in-parens>]*|<supports-in-parens> [or <supports-in-parens>]*",
    	"supports-in-parens": "( <supports-condition> )|<supports-feature>|<general-enclosed>",
    	"supports-feature": "<supports-decl>|<supports-selector-fn>",
    	"supports-decl": "( <declaration> )",
    	"supports-selector-fn": "selector( <complex-selector> )",
    	symbol: "<string>|<image>|<custom-ident>",
    	target: "<target-counter()>|<target-counters()>|<target-text()>",
    	"target-counter()": "target-counter( [<string>|<url>] , <custom-ident> , <counter-style>? )",
    	"target-counters()": "target-counters( [<string>|<url>] , <custom-ident> , <string> , <counter-style>? )",
    	"target-text()": "target-text( [<string>|<url>] , [content|before|after|first-letter]? )",
    	"time-percentage": "<time>|<percentage>",
    	"timing-function": "linear|<cubic-bezier-timing-function>|<step-timing-function>",
    	"track-breadth": "<length-percentage>|<flex>|min-content|max-content|auto",
    	"track-list": "[<line-names>? [<track-size>|<track-repeat>]]+ <line-names>?",
    	"track-repeat": "repeat( [<positive-integer>] , [<line-names>? <track-size>]+ <line-names>? )",
    	"track-size": "<track-breadth>|minmax( <inflexible-breadth> , <track-breadth> )|fit-content( [<length>|<percentage>] )",
    	"transform-function": "<matrix()>|<translate()>|<translateX()>|<translateY()>|<scale()>|<scaleX()>|<scaleY()>|<rotate()>|<skew()>|<skewX()>|<skewY()>|<matrix3d()>|<translate3d()>|<translateZ()>|<scale3d()>|<scaleZ()>|<rotate3d()>|<rotateX()>|<rotateY()>|<rotateZ()>|<perspective()>",
    	"transform-list": "<transform-function>+",
    	"translate()": "translate( <length-percentage> , <length-percentage>? )",
    	"translate3d()": "translate3d( <length-percentage> , <length-percentage> , <length> )",
    	"translateX()": "translateX( <length-percentage> )",
    	"translateY()": "translateY( <length-percentage> )",
    	"translateZ()": "translateZ( <length> )",
    	"type-or-unit": "string|color|url|integer|number|length|angle|time|frequency|cap|ch|em|ex|ic|lh|rlh|rem|vb|vi|vw|vh|vmin|vmax|mm|Q|cm|in|pt|pc|px|deg|grad|rad|turn|ms|s|Hz|kHz|%",
    	"type-selector": "<wq-name>|<ns-prefix>? '*'",
    	"var()": "var( <custom-property-name> , <declaration-value>? )",
    	"viewport-length": "auto|<length-percentage>",
    	"wq-name": "<ns-prefix>? <ident-token>",
    	"-legacy-gradient": "<-webkit-gradient()>|<-legacy-linear-gradient>|<-legacy-repeating-linear-gradient>|<-legacy-radial-gradient>|<-legacy-repeating-radial-gradient>",
    	"-legacy-linear-gradient": "-moz-linear-gradient( <-legacy-linear-gradient-arguments> )|-webkit-linear-gradient( <-legacy-linear-gradient-arguments> )|-o-linear-gradient( <-legacy-linear-gradient-arguments> )",
    	"-legacy-repeating-linear-gradient": "-moz-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )|-webkit-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )|-o-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )",
    	"-legacy-linear-gradient-arguments": "[<angle>|<side-or-corner>]? , <color-stop-list>",
    	"-legacy-radial-gradient": "-moz-radial-gradient( <-legacy-radial-gradient-arguments> )|-webkit-radial-gradient( <-legacy-radial-gradient-arguments> )|-o-radial-gradient( <-legacy-radial-gradient-arguments> )",
    	"-legacy-repeating-radial-gradient": "-moz-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )|-webkit-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )|-o-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )",
    	"-legacy-radial-gradient-arguments": "[<position> ,]? [[[<-legacy-radial-gradient-shape>||<-legacy-radial-gradient-size>]|[<length>|<percentage>]{2}] ,]? <color-stop-list>",
    	"-legacy-radial-gradient-size": "closest-side|closest-corner|farthest-side|farthest-corner|contain|cover",
    	"-legacy-radial-gradient-shape": "circle|ellipse",
    	"-non-standard-font": "-apple-system-body|-apple-system-headline|-apple-system-subheadline|-apple-system-caption1|-apple-system-caption2|-apple-system-footnote|-apple-system-short-body|-apple-system-short-headline|-apple-system-short-subheadline|-apple-system-short-caption1|-apple-system-short-footnote|-apple-system-tall-body",
    	"-non-standard-color": "-moz-ButtonDefault|-moz-ButtonHoverFace|-moz-ButtonHoverText|-moz-CellHighlight|-moz-CellHighlightText|-moz-Combobox|-moz-ComboboxText|-moz-Dialog|-moz-DialogText|-moz-dragtargetzone|-moz-EvenTreeRow|-moz-Field|-moz-FieldText|-moz-html-CellHighlight|-moz-html-CellHighlightText|-moz-mac-accentdarkestshadow|-moz-mac-accentdarkshadow|-moz-mac-accentface|-moz-mac-accentlightesthighlight|-moz-mac-accentlightshadow|-moz-mac-accentregularhighlight|-moz-mac-accentregularshadow|-moz-mac-chrome-active|-moz-mac-chrome-inactive|-moz-mac-focusring|-moz-mac-menuselect|-moz-mac-menushadow|-moz-mac-menutextselect|-moz-MenuHover|-moz-MenuHoverText|-moz-MenuBarText|-moz-MenuBarHoverText|-moz-nativehyperlinktext|-moz-OddTreeRow|-moz-win-communicationstext|-moz-win-mediatext|-moz-activehyperlinktext|-moz-default-background-color|-moz-default-color|-moz-hyperlinktext|-moz-visitedhyperlinktext|-webkit-activelink|-webkit-focus-ring-color|-webkit-link|-webkit-text",
    	"-non-standard-image-rendering": "optimize-contrast|-moz-crisp-edges|-o-crisp-edges|-webkit-optimize-contrast",
    	"-non-standard-overflow": "-moz-scrollbars-none|-moz-scrollbars-horizontal|-moz-scrollbars-vertical|-moz-hidden-unscrollable",
    	"-non-standard-width": "min-intrinsic|intrinsic|-moz-min-content|-moz-max-content|-webkit-min-content|-webkit-max-content",
    	"-webkit-gradient()": "-webkit-gradient( <-webkit-gradient-type> , <-webkit-gradient-point> [, <-webkit-gradient-point>|, <-webkit-gradient-radius> , <-webkit-gradient-point>] [, <-webkit-gradient-radius>]? [, <-webkit-gradient-color-stop>]* )",
    	"-webkit-gradient-color-stop": "from( <color> )|color-stop( [<number-zero-one>|<percentage>] , <color> )|to( <color> )",
    	"-webkit-gradient-point": "[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]",
    	"-webkit-gradient-radius": "<length>|<percentage>",
    	"-webkit-gradient-type": "linear|radial",
    	"-webkit-mask-box-repeat": "repeat|stretch|round",
    	"-webkit-mask-clip-style": "border|border-box|padding|padding-box|content|content-box|text",
    	"-ms-filter-function-list": "<-ms-filter-function>+",
    	"-ms-filter-function": "<-ms-filter-function-progid>|<-ms-filter-function-legacy>",
    	"-ms-filter-function-progid": "'progid:' [<ident-token> '.']* [<ident-token>|<function-token> <any-value>? )]",
    	"-ms-filter-function-legacy": "<ident-token>|<function-token> <any-value>? )",
    	"-ms-filter": "<string>",
    	age: "child|young|old",
    	"attr-name": "<wq-name>",
    	"attr-fallback": "<any-value>",
    	"border-radius": "<length-percentage>{1,2}",
    	bottom: "<length>|auto",
    	"generic-voice": "[<age>? <gender> <integer>?]",
    	gender: "male|female|neutral",
    	left: "<length>|auto",
    	"mask-image": "<mask-reference>#",
    	"name-repeat": "repeat( [<positive-integer>|auto-fill] , <line-names>+ )",
    	paint: "none|<color>|<url> [none|<color>]?|context-fill|context-stroke",
    	"path()": "path( <string> )",
    	ratio: "<integer> / <integer>",
    	right: "<length>|auto",
    	"svg-length": "<percentage>|<length>|<number>",
    	"svg-writing-mode": "lr-tb|rl-tb|tb-rl|lr|rl|tb",
    	top: "<length>|auto",
    	"track-group": "'(' [<string>* <track-minmax> <string>*]+ ')' ['[' <positive-integer> ']']?|<track-minmax>",
    	"track-list-v0": "[<string>* <track-group> <string>*]+|none",
    	"track-minmax": "minmax( <track-breadth> , <track-breadth> )|auto|<track-breadth>|fit-content",
    	x: "<number>",
    	y: "<number>",
    	declaration: "<ident-token> : <declaration-value>? ['!' important]?",
    	"declaration-list": "[<declaration>? ';']* <declaration>?",
    	url: "url( <string> <url-modifier>* )|<url-token>",
    	"url-modifier": "<ident>|<function-token> <any-value> )",
    	"number-zero-one": "<number [0,1]>",
    	"number-one-or-greater": "<number [1,∞]>",
    	"positive-integer": "<integer [0,∞]>"
    };
    var properties$1 = {
    	"--*": "<declaration-value>",
    	"-ms-accelerator": "false|true",
    	"-ms-block-progression": "tb|rl|bt|lr",
    	"-ms-content-zoom-chaining": "none|chained",
    	"-ms-content-zooming": "none|zoom",
    	"-ms-content-zoom-limit": "<'-ms-content-zoom-limit-min'> <'-ms-content-zoom-limit-max'>",
    	"-ms-content-zoom-limit-max": "<percentage>",
    	"-ms-content-zoom-limit-min": "<percentage>",
    	"-ms-content-zoom-snap": "<'-ms-content-zoom-snap-type'>||<'-ms-content-zoom-snap-points'>",
    	"-ms-content-zoom-snap-points": "snapInterval( <percentage> , <percentage> )|snapList( <percentage># )",
    	"-ms-content-zoom-snap-type": "none|proximity|mandatory",
    	"-ms-filter": "<string>",
    	"-ms-flow-from": "[none|<custom-ident>]#",
    	"-ms-flow-into": "[none|<custom-ident>]#",
    	"-ms-high-contrast-adjust": "auto|none",
    	"-ms-hyphenate-limit-chars": "auto|<integer>{1,3}",
    	"-ms-hyphenate-limit-lines": "no-limit|<integer>",
    	"-ms-hyphenate-limit-zone": "<percentage>|<length>",
    	"-ms-ime-align": "auto|after",
    	"-ms-overflow-style": "auto|none|scrollbar|-ms-autohiding-scrollbar",
    	"-ms-scrollbar-3dlight-color": "<color>",
    	"-ms-scrollbar-arrow-color": "<color>",
    	"-ms-scrollbar-base-color": "<color>",
    	"-ms-scrollbar-darkshadow-color": "<color>",
    	"-ms-scrollbar-face-color": "<color>",
    	"-ms-scrollbar-highlight-color": "<color>",
    	"-ms-scrollbar-shadow-color": "<color>",
    	"-ms-scrollbar-track-color": "<color>",
    	"-ms-scroll-chaining": "chained|none",
    	"-ms-scroll-limit": "<'-ms-scroll-limit-x-min'> <'-ms-scroll-limit-y-min'> <'-ms-scroll-limit-x-max'> <'-ms-scroll-limit-y-max'>",
    	"-ms-scroll-limit-x-max": "auto|<length>",
    	"-ms-scroll-limit-x-min": "<length>",
    	"-ms-scroll-limit-y-max": "auto|<length>",
    	"-ms-scroll-limit-y-min": "<length>",
    	"-ms-scroll-rails": "none|railed",
    	"-ms-scroll-snap-points-x": "snapInterval( <length-percentage> , <length-percentage> )|snapList( <length-percentage># )",
    	"-ms-scroll-snap-points-y": "snapInterval( <length-percentage> , <length-percentage> )|snapList( <length-percentage># )",
    	"-ms-scroll-snap-type": "none|proximity|mandatory",
    	"-ms-scroll-snap-x": "<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-x'>",
    	"-ms-scroll-snap-y": "<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-y'>",
    	"-ms-scroll-translation": "none|vertical-to-horizontal",
    	"-ms-text-autospace": "none|ideograph-alpha|ideograph-numeric|ideograph-parenthesis|ideograph-space",
    	"-ms-touch-select": "grippers|none",
    	"-ms-user-select": "none|element|text",
    	"-ms-wrap-flow": "auto|both|start|end|maximum|clear",
    	"-ms-wrap-margin": "<length>",
    	"-ms-wrap-through": "wrap|none",
    	"-moz-appearance": "none|button|button-arrow-down|button-arrow-next|button-arrow-previous|button-arrow-up|button-bevel|button-focus|caret|checkbox|checkbox-container|checkbox-label|checkmenuitem|dualbutton|groupbox|listbox|listitem|menuarrow|menubar|menucheckbox|menuimage|menuitem|menuitemtext|menulist|menulist-button|menulist-text|menulist-textfield|menupopup|menuradio|menuseparator|meterbar|meterchunk|progressbar|progressbar-vertical|progresschunk|progresschunk-vertical|radio|radio-container|radio-label|radiomenuitem|range|range-thumb|resizer|resizerpanel|scale-horizontal|scalethumbend|scalethumb-horizontal|scalethumbstart|scalethumbtick|scalethumb-vertical|scale-vertical|scrollbarbutton-down|scrollbarbutton-left|scrollbarbutton-right|scrollbarbutton-up|scrollbarthumb-horizontal|scrollbarthumb-vertical|scrollbartrack-horizontal|scrollbartrack-vertical|searchfield|separator|sheet|spinner|spinner-downbutton|spinner-textfield|spinner-upbutton|splitter|statusbar|statusbarpanel|tab|tabpanel|tabpanels|tab-scroll-arrow-back|tab-scroll-arrow-forward|textfield|textfield-multiline|toolbar|toolbarbutton|toolbarbutton-dropdown|toolbargripper|toolbox|tooltip|treeheader|treeheadercell|treeheadersortarrow|treeitem|treeline|treetwisty|treetwistyopen|treeview|-moz-mac-unified-toolbar|-moz-win-borderless-glass|-moz-win-browsertabbar-toolbox|-moz-win-communicationstext|-moz-win-communications-toolbox|-moz-win-exclude-glass|-moz-win-glass|-moz-win-mediatext|-moz-win-media-toolbox|-moz-window-button-box|-moz-window-button-box-maximized|-moz-window-button-close|-moz-window-button-maximize|-moz-window-button-minimize|-moz-window-button-restore|-moz-window-frame-bottom|-moz-window-frame-left|-moz-window-frame-right|-moz-window-titlebar|-moz-window-titlebar-maximized",
    	"-moz-binding": "<url>|none",
    	"-moz-border-bottom-colors": "<color>+|none",
    	"-moz-border-left-colors": "<color>+|none",
    	"-moz-border-right-colors": "<color>+|none",
    	"-moz-border-top-colors": "<color>+|none",
    	"-moz-context-properties": "none|[fill|fill-opacity|stroke|stroke-opacity]#",
    	"-moz-float-edge": "border-box|content-box|margin-box|padding-box",
    	"-moz-force-broken-image-icon": "<integer>",
    	"-moz-image-region": "<shape>|auto",
    	"-moz-orient": "inline|block|horizontal|vertical",
    	"-moz-outline-radius": "<outline-radius>{1,4} [/ <outline-radius>{1,4}]?",
    	"-moz-outline-radius-bottomleft": "<outline-radius>",
    	"-moz-outline-radius-bottomright": "<outline-radius>",
    	"-moz-outline-radius-topleft": "<outline-radius>",
    	"-moz-outline-radius-topright": "<outline-radius>",
    	"-moz-stack-sizing": "ignore|stretch-to-fit",
    	"-moz-text-blink": "none|blink",
    	"-moz-user-focus": "ignore|normal|select-after|select-before|select-menu|select-same|select-all|none",
    	"-moz-user-input": "auto|none|enabled|disabled",
    	"-moz-user-modify": "read-only|read-write|write-only",
    	"-moz-window-dragging": "drag|no-drag",
    	"-moz-window-shadow": "default|menu|tooltip|sheet|none",
    	"-webkit-appearance": "none|button|button-bevel|caps-lock-indicator|caret|checkbox|default-button|listbox|listitem|media-fullscreen-button|media-mute-button|media-play-button|media-seek-back-button|media-seek-forward-button|media-slider|media-sliderthumb|menulist|menulist-button|menulist-text|menulist-textfield|push-button|radio|scrollbarbutton-down|scrollbarbutton-left|scrollbarbutton-right|scrollbarbutton-up|scrollbargripper-horizontal|scrollbargripper-vertical|scrollbarthumb-horizontal|scrollbarthumb-vertical|scrollbartrack-horizontal|scrollbartrack-vertical|searchfield|searchfield-cancel-button|searchfield-decoration|searchfield-results-button|searchfield-results-decoration|slider-horizontal|slider-vertical|sliderthumb-horizontal|sliderthumb-vertical|square-button|textarea|textfield",
    	"-webkit-border-before": "<'border-width'>||<'border-style'>||<'color'>",
    	"-webkit-border-before-color": "<'color'>",
    	"-webkit-border-before-style": "<'border-style'>",
    	"-webkit-border-before-width": "<'border-width'>",
    	"-webkit-box-reflect": "[above|below|right|left]? <length>? <image>?",
    	"-webkit-line-clamp": "none|<integer>",
    	"-webkit-mask": "[<mask-reference>||<position> [/ <bg-size>]?||<repeat-style>||[<box>|border|padding|content|text]||[<box>|border|padding|content]]#",
    	"-webkit-mask-attachment": "<attachment>#",
    	"-webkit-mask-clip": "[<box>|border|padding|content|text]#",
    	"-webkit-mask-composite": "<composite-style>#",
    	"-webkit-mask-image": "<mask-reference>#",
    	"-webkit-mask-origin": "[<box>|border|padding|content]#",
    	"-webkit-mask-position": "<position>#",
    	"-webkit-mask-position-x": "[<length-percentage>|left|center|right]#",
    	"-webkit-mask-position-y": "[<length-percentage>|top|center|bottom]#",
    	"-webkit-mask-repeat": "<repeat-style>#",
    	"-webkit-mask-repeat-x": "repeat|no-repeat|space|round",
    	"-webkit-mask-repeat-y": "repeat|no-repeat|space|round",
    	"-webkit-mask-size": "<bg-size>#",
    	"-webkit-overflow-scrolling": "auto|touch",
    	"-webkit-tap-highlight-color": "<color>",
    	"-webkit-text-fill-color": "<color>",
    	"-webkit-text-stroke": "<length>||<color>",
    	"-webkit-text-stroke-color": "<color>",
    	"-webkit-text-stroke-width": "<length>",
    	"-webkit-touch-callout": "default|none",
    	"-webkit-user-modify": "read-only|read-write|read-write-plaintext-only",
    	"align-content": "normal|<baseline-position>|<content-distribution>|<overflow-position>? <content-position>",
    	"align-items": "normal|stretch|<baseline-position>|[<overflow-position>? <self-position>]",
    	"align-self": "auto|normal|stretch|<baseline-position>|<overflow-position>? <self-position>",
    	all: "initial|inherit|unset|revert",
    	animation: "<single-animation>#",
    	"animation-delay": "<time>#",
    	"animation-direction": "<single-animation-direction>#",
    	"animation-duration": "<time>#",
    	"animation-fill-mode": "<single-animation-fill-mode>#",
    	"animation-iteration-count": "<single-animation-iteration-count>#",
    	"animation-name": "[none|<keyframes-name>]#",
    	"animation-play-state": "<single-animation-play-state>#",
    	"animation-timing-function": "<timing-function>#",
    	appearance: "none|auto|button|textfield|<compat>",
    	azimuth: "<angle>|[[left-side|far-left|left|center-left|center|center-right|right|far-right|right-side]||behind]|leftwards|rightwards",
    	"backdrop-filter": "none|<filter-function-list>",
    	"backface-visibility": "visible|hidden",
    	background: "[<bg-layer> ,]* <final-bg-layer>",
    	"background-attachment": "<attachment>#",
    	"background-blend-mode": "<blend-mode>#",
    	"background-clip": "<box>#",
    	"background-color": "<color>",
    	"background-image": "<bg-image>#",
    	"background-origin": "<box>#",
    	"background-position": "<bg-position>#",
    	"background-position-x": "[center|[left|right|x-start|x-end]? <length-percentage>?]#",
    	"background-position-y": "[center|[top|bottom|y-start|y-end]? <length-percentage>?]#",
    	"background-repeat": "<repeat-style>#",
    	"background-size": "<bg-size>#",
    	"block-overflow": "clip|ellipsis|<string>",
    	"block-size": "<'width'>",
    	border: "<line-width>||<line-style>||<color>",
    	"border-block": "<'border-top-width'>||<'border-top-style'>||<'color'>",
    	"border-block-color": "<'border-top-color'>{1,2}",
    	"border-block-style": "<'border-top-style'>",
    	"border-block-width": "<'border-top-width'>",
    	"border-block-end": "<'border-top-width'>||<'border-top-style'>||<'color'>",
    	"border-block-end-color": "<'border-top-color'>",
    	"border-block-end-style": "<'border-top-style'>",
    	"border-block-end-width": "<'border-top-width'>",
    	"border-block-start": "<'border-top-width'>||<'border-top-style'>||<'color'>",
    	"border-block-start-color": "<'border-top-color'>",
    	"border-block-start-style": "<'border-top-style'>",
    	"border-block-start-width": "<'border-top-width'>",
    	"border-bottom": "<line-width>||<line-style>||<color>",
    	"border-bottom-color": "<'border-top-color'>",
    	"border-bottom-left-radius": "<length-percentage>{1,2}",
    	"border-bottom-right-radius": "<length-percentage>{1,2}",
    	"border-bottom-style": "<line-style>",
    	"border-bottom-width": "<line-width>",
    	"border-collapse": "collapse|separate",
    	"border-color": "<color>{1,4}",
    	"border-end-end-radius": "<length-percentage>{1,2}",
    	"border-end-start-radius": "<length-percentage>{1,2}",
    	"border-image": "<'border-image-source'>||<'border-image-slice'> [/ <'border-image-width'>|/ <'border-image-width'>? / <'border-image-outset'>]?||<'border-image-repeat'>",
    	"border-image-outset": "[<length>|<number>]{1,4}",
    	"border-image-repeat": "[stretch|repeat|round|space]{1,2}",
    	"border-image-slice": "<number-percentage>{1,4}&&fill?",
    	"border-image-source": "none|<image>",
    	"border-image-width": "[<length-percentage>|<number>|auto]{1,4}",
    	"border-inline": "<'border-top-width'>||<'border-top-style'>||<'color'>",
    	"border-inline-end": "<'border-top-width'>||<'border-top-style'>||<'color'>",
    	"border-inline-color": "<'border-top-color'>{1,2}",
    	"border-inline-style": "<'border-top-style'>",
    	"border-inline-width": "<'border-top-width'>",
    	"border-inline-end-color": "<'border-top-color'>",
    	"border-inline-end-style": "<'border-top-style'>",
    	"border-inline-end-width": "<'border-top-width'>",
    	"border-inline-start": "<'border-top-width'>||<'border-top-style'>||<'color'>",
    	"border-inline-start-color": "<'border-top-color'>",
    	"border-inline-start-style": "<'border-top-style'>",
    	"border-inline-start-width": "<'border-top-width'>",
    	"border-left": "<line-width>||<line-style>||<color>",
    	"border-left-color": "<color>",
    	"border-left-style": "<line-style>",
    	"border-left-width": "<line-width>",
    	"border-radius": "<length-percentage>{1,4} [/ <length-percentage>{1,4}]?",
    	"border-right": "<line-width>||<line-style>||<color>",
    	"border-right-color": "<color>",
    	"border-right-style": "<line-style>",
    	"border-right-width": "<line-width>",
    	"border-spacing": "<length> <length>?",
    	"border-start-end-radius": "<length-percentage>{1,2}",
    	"border-start-start-radius": "<length-percentage>{1,2}",
    	"border-style": "<line-style>{1,4}",
    	"border-top": "<line-width>||<line-style>||<color>",
    	"border-top-color": "<color>",
    	"border-top-left-radius": "<length-percentage>{1,2}",
    	"border-top-right-radius": "<length-percentage>{1,2}",
    	"border-top-style": "<line-style>",
    	"border-top-width": "<line-width>",
    	"border-width": "<line-width>{1,4}",
    	bottom: "<length>|<percentage>|auto",
    	"box-align": "start|center|end|baseline|stretch",
    	"box-decoration-break": "slice|clone",
    	"box-direction": "normal|reverse|inherit",
    	"box-flex": "<number>",
    	"box-flex-group": "<integer>",
    	"box-lines": "single|multiple",
    	"box-ordinal-group": "<integer>",
    	"box-orient": "horizontal|vertical|inline-axis|block-axis|inherit",
    	"box-pack": "start|center|end|justify",
    	"box-shadow": "none|<shadow>#",
    	"box-sizing": "content-box|border-box",
    	"break-after": "auto|avoid|always|all|avoid-page|page|left|right|recto|verso|avoid-column|column|avoid-region|region",
    	"break-before": "auto|avoid|always|all|avoid-page|page|left|right|recto|verso|avoid-column|column|avoid-region|region",
    	"break-inside": "auto|avoid|avoid-page|avoid-column|avoid-region",
    	"caption-side": "top|bottom|block-start|block-end|inline-start|inline-end",
    	"caret-color": "auto|<color>",
    	clear: "none|left|right|both|inline-start|inline-end",
    	clip: "<shape>|auto",
    	"clip-path": "<clip-source>|[<basic-shape>||<geometry-box>]|none",
    	color: "<color>",
    	"color-adjust": "economy|exact",
    	"column-count": "<integer>|auto",
    	"column-fill": "auto|balance|balance-all",
    	"column-gap": "normal|<length-percentage>",
    	"column-rule": "<'column-rule-width'>||<'column-rule-style'>||<'column-rule-color'>",
    	"column-rule-color": "<color>",
    	"column-rule-style": "<'border-style'>",
    	"column-rule-width": "<'border-width'>",
    	"column-span": "none|all",
    	"column-width": "<length>|auto",
    	columns: "<'column-width'>||<'column-count'>",
    	contain: "none|strict|content|[size||layout||style||paint]",
    	content: "normal|none|[<content-replacement>|<content-list>] [/ <string>]?",
    	"counter-increment": "[<custom-ident> <integer>?]+|none",
    	"counter-reset": "[<custom-ident> <integer>?]+|none",
    	"counter-set": "[<custom-ident> <integer>?]+|none",
    	cursor: "[[<url> [<x> <y>]? ,]* [auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out|grab|grabbing|hand|-webkit-grab|-webkit-grabbing|-webkit-zoom-in|-webkit-zoom-out|-moz-grab|-moz-grabbing|-moz-zoom-in|-moz-zoom-out]]",
    	direction: "ltr|rtl",
    	display: "block|contents|flex|flow|flow-root|grid|inline|inline-block|inline-flex|inline-grid|inline-list-item|inline-table|list-item|none|ruby|ruby-base|ruby-base-container|ruby-text|ruby-text-container|run-in|table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row|table-row-group|-ms-flexbox|-ms-inline-flexbox|-ms-grid|-ms-inline-grid|-webkit-flex|-webkit-inline-flex|-webkit-box|-webkit-inline-box|-moz-inline-stack|-moz-box|-moz-inline-box",
    	"empty-cells": "show|hide",
    	filter: "none|<filter-function-list>|<-ms-filter-function-list>",
    	flex: "none|[<'flex-grow'> <'flex-shrink'>?||<'flex-basis'>]",
    	"flex-basis": "content|<'width'>",
    	"flex-direction": "row|row-reverse|column|column-reverse",
    	"flex-flow": "<'flex-direction'>||<'flex-wrap'>",
    	"flex-grow": "<number>",
    	"flex-shrink": "<number>",
    	"flex-wrap": "nowrap|wrap|wrap-reverse",
    	float: "left|right|none|inline-start|inline-end",
    	font: "[[<'font-style'>||<font-variant-css21>||<'font-weight'>||<'font-stretch'>]? <'font-size'> [/ <'line-height'>]? <'font-family'>]|caption|icon|menu|message-box|small-caption|status-bar",
    	"font-family": "[<family-name>|<generic-family>]#",
    	"font-feature-settings": "normal|<feature-tag-value>#",
    	"font-kerning": "auto|normal|none",
    	"font-language-override": "normal|<string>",
    	"font-optical-sizing": "auto|none",
    	"font-variation-settings": "normal|[<string> <number>]#",
    	"font-size": "<absolute-size>|<relative-size>|<length-percentage>",
    	"font-size-adjust": "none|<number>",
    	"font-stretch": "<font-stretch-absolute>",
    	"font-style": "normal|italic|oblique <angle>?",
    	"font-synthesis": "none|[weight||style]",
    	"font-variant": "normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>||stylistic( <feature-value-name> )||historical-forms||styleset( <feature-value-name># )||character-variant( <feature-value-name># )||swash( <feature-value-name> )||ornaments( <feature-value-name> )||annotation( <feature-value-name> )||[small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps]||<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero||<east-asian-variant-values>||<east-asian-width-values>||ruby]",
    	"font-variant-alternates": "normal|[stylistic( <feature-value-name> )||historical-forms||styleset( <feature-value-name># )||character-variant( <feature-value-name># )||swash( <feature-value-name> )||ornaments( <feature-value-name> )||annotation( <feature-value-name> )]",
    	"font-variant-caps": "normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps",
    	"font-variant-east-asian": "normal|[<east-asian-variant-values>||<east-asian-width-values>||ruby]",
    	"font-variant-ligatures": "normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>]",
    	"font-variant-numeric": "normal|[<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero]",
    	"font-variant-position": "normal|sub|super",
    	"font-weight": "<font-weight-absolute>|bolder|lighter",
    	gap: "<'row-gap'> <'column-gap'>?",
    	grid: "<'grid-template'>|<'grid-template-rows'> / [auto-flow&&dense?] <'grid-auto-columns'>?|[auto-flow&&dense?] <'grid-auto-rows'>? / <'grid-template-columns'>",
    	"grid-area": "<grid-line> [/ <grid-line>]{0,3}",
    	"grid-auto-columns": "<track-size>+",
    	"grid-auto-flow": "[row|column]||dense",
    	"grid-auto-rows": "<track-size>+",
    	"grid-column": "<grid-line> [/ <grid-line>]?",
    	"grid-column-end": "<grid-line>",
    	"grid-column-gap": "<length-percentage>",
    	"grid-column-start": "<grid-line>",
    	"grid-gap": "<'grid-row-gap'> <'grid-column-gap'>?",
    	"grid-row": "<grid-line> [/ <grid-line>]?",
    	"grid-row-end": "<grid-line>",
    	"grid-row-gap": "<length-percentage>",
    	"grid-row-start": "<grid-line>",
    	"grid-template": "none|[<'grid-template-rows'> / <'grid-template-columns'>]|[<line-names>? <string> <track-size>? <line-names>?]+ [/ <explicit-track-list>]?",
    	"grid-template-areas": "none|<string>+",
    	"grid-template-columns": "none|<track-list>|<auto-track-list>",
    	"grid-template-rows": "none|<track-list>|<auto-track-list>",
    	"hanging-punctuation": "none|[first||[force-end|allow-end]||last]",
    	height: "[<length>|<percentage>]&&[border-box|content-box]?|available|min-content|max-content|fit-content|auto",
    	hyphens: "none|manual|auto",
    	"image-orientation": "from-image|<angle>|[<angle>? flip]",
    	"image-rendering": "auto|crisp-edges|pixelated|optimizeSpeed|optimizeQuality|<-non-standard-image-rendering>",
    	"image-resolution": "[from-image||<resolution>]&&snap?",
    	"ime-mode": "auto|normal|active|inactive|disabled",
    	"initial-letter": "normal|[<number> <integer>?]",
    	"initial-letter-align": "[auto|alphabetic|hanging|ideographic]",
    	"inline-size": "<'width'>",
    	inset: "<'top'>{1,4}",
    	"inset-block": "<'top'>{1,2}",
    	"inset-block-end": "<'top'>",
    	"inset-block-start": "<'top'>",
    	"inset-inline": "<'top'>{1,2}",
    	"inset-inline-end": "<'top'>",
    	"inset-inline-start": "<'top'>",
    	isolation: "auto|isolate",
    	"justify-content": "normal|<content-distribution>|<overflow-position>? [<content-position>|left|right]",
    	"justify-items": "normal|stretch|<baseline-position>|<overflow-position>? [<self-position>|left|right]|legacy|legacy&&[left|right|center]",
    	"justify-self": "auto|normal|stretch|<baseline-position>|<overflow-position>? [<self-position>|left|right]",
    	left: "<length>|<percentage>|auto",
    	"letter-spacing": "normal|<length-percentage>",
    	"line-break": "auto|loose|normal|strict",
    	"line-clamp": "none|<integer>",
    	"line-height": "normal|<number>|<length>|<percentage>",
    	"line-height-step": "<length>",
    	"list-style": "<'list-style-type'>||<'list-style-position'>||<'list-style-image'>",
    	"list-style-image": "<url>|none",
    	"list-style-position": "inside|outside",
    	"list-style-type": "<counter-style>|<string>|none",
    	margin: "[<length>|<percentage>|auto]{1,4}",
    	"margin-block": "<'margin-left'>{1,2}",
    	"margin-block-end": "<'margin-left'>",
    	"margin-block-start": "<'margin-left'>",
    	"margin-bottom": "<length>|<percentage>|auto",
    	"margin-inline": "<'margin-left'>{1,2}",
    	"margin-inline-end": "<'margin-left'>",
    	"margin-inline-start": "<'margin-left'>",
    	"margin-left": "<length>|<percentage>|auto",
    	"margin-right": "<length>|<percentage>|auto",
    	"margin-top": "<length>|<percentage>|auto",
    	mask: "<mask-layer>#",
    	"mask-border": "<'mask-border-source'>||<'mask-border-slice'> [/ <'mask-border-width'>? [/ <'mask-border-outset'>]?]?||<'mask-border-repeat'>||<'mask-border-mode'>",
    	"mask-border-mode": "luminance|alpha",
    	"mask-border-outset": "[<length>|<number>]{1,4}",
    	"mask-border-repeat": "[stretch|repeat|round|space]{1,2}",
    	"mask-border-slice": "<number-percentage>{1,4} fill?",
    	"mask-border-source": "none|<image>",
    	"mask-border-width": "[<length-percentage>|<number>|auto]{1,4}",
    	"mask-clip": "[<geometry-box>|no-clip]#",
    	"mask-composite": "<compositing-operator>#",
    	"mask-image": "<mask-reference>#",
    	"mask-mode": "<masking-mode>#",
    	"mask-origin": "<geometry-box>#",
    	"mask-position": "<position>#",
    	"mask-repeat": "<repeat-style>#",
    	"mask-size": "<bg-size>#",
    	"mask-type": "luminance|alpha",
    	"max-block-size": "<'max-width'>",
    	"max-height": "<length>|<percentage>|none|max-content|min-content|fit-content|fill-available",
    	"max-inline-size": "<'max-width'>",
    	"max-lines": "none|<integer>",
    	"max-width": "<length>|<percentage>|none|max-content|min-content|fit-content|fill-available|<-non-standard-width>",
    	"min-block-size": "<'min-width'>",
    	"min-height": "<length>|<percentage>|auto|max-content|min-content|fit-content|fill-available",
    	"min-inline-size": "<'min-width'>",
    	"min-width": "<length>|<percentage>|auto|max-content|min-content|fit-content|fill-available|<-non-standard-width>",
    	"mix-blend-mode": "<blend-mode>",
    	"object-fit": "fill|contain|cover|none|scale-down",
    	"object-position": "<position>",
    	offset: "[<'offset-position'>? [<'offset-path'> [<'offset-distance'>||<'offset-rotate'>]?]?]! [/ <'offset-anchor'>]?",
    	"offset-anchor": "auto|<position>",
    	"offset-distance": "<length-percentage>",
    	"offset-path": "none|ray( [<angle>&&<size>?&&contain?] )|<path()>|<url>|[<basic-shape>||<geometry-box>]",
    	"offset-position": "auto|<position>",
    	"offset-rotate": "[auto|reverse]||<angle>",
    	opacity: "<number-zero-one>",
    	order: "<integer>",
    	orphans: "<integer>",
    	outline: "[<'outline-color'>||<'outline-style'>||<'outline-width'>]",
    	"outline-color": "<color>|invert",
    	"outline-offset": "<length>",
    	"outline-style": "auto|<'border-style'>",
    	"outline-width": "<line-width>",
    	overflow: "[visible|hidden|clip|scroll|auto]{1,2}|<-non-standard-overflow>",
    	"overflow-anchor": "auto|none",
    	"overflow-block": "visible|hidden|clip|scroll|auto",
    	"overflow-clip-box": "padding-box|content-box",
    	"overflow-inline": "visible|hidden|clip|scroll|auto",
    	"overflow-wrap": "normal|break-word|anywhere",
    	"overflow-x": "visible|hidden|clip|scroll|auto",
    	"overflow-y": "visible|hidden|clip|scroll|auto",
    	"overscroll-behavior": "[contain|none|auto]{1,2}",
    	"overscroll-behavior-x": "contain|none|auto",
    	"overscroll-behavior-y": "contain|none|auto",
    	padding: "[<length>|<percentage>]{1,4}",
    	"padding-block": "<'padding-left'>{1,2}",
    	"padding-block-end": "<'padding-left'>",
    	"padding-block-start": "<'padding-left'>",
    	"padding-bottom": "<length>|<percentage>",
    	"padding-inline": "<'padding-left'>{1,2}",
    	"padding-inline-end": "<'padding-left'>",
    	"padding-inline-start": "<'padding-left'>",
    	"padding-left": "<length>|<percentage>",
    	"padding-right": "<length>|<percentage>",
    	"padding-top": "<length>|<percentage>",
    	"page-break-after": "auto|always|avoid|left|right|recto|verso",
    	"page-break-before": "auto|always|avoid|left|right|recto|verso",
    	"page-break-inside": "auto|avoid",
    	"paint-order": "normal|[fill||stroke||markers]",
    	perspective: "none|<length>",
    	"perspective-origin": "<position>",
    	"place-content": "<'align-content'> <'justify-content'>?",
    	"place-items": "<'align-items'> <'justify-items'>?",
    	"place-self": "<'align-self'> <'justify-self'>?",
    	"pointer-events": "auto|none|visiblePainted|visibleFill|visibleStroke|visible|painted|fill|stroke|all|inherit",
    	position: "static|relative|absolute|sticky|fixed|-webkit-sticky",
    	quotes: "none|[<string> <string>]+",
    	resize: "none|both|horizontal|vertical|block|inline",
    	right: "<length>|<percentage>|auto",
    	rotate: "none|<angle>|[x|y|z|<number>{3}]&&<angle>",
    	"row-gap": "normal|<length-percentage>",
    	"ruby-align": "start|center|space-between|space-around",
    	"ruby-merge": "separate|collapse|auto",
    	"ruby-position": "over|under|inter-character",
    	scale: "none|<number>{1,3}",
    	"scrollbar-color": "auto|dark|light|<color>{2}",
    	"scrollbar-width": "auto|thin|none",
    	"scroll-behavior": "auto|smooth",
    	"scroll-margin": "<length>{1,4}",
    	"scroll-margin-block": "<length>{1,2}",
    	"scroll-margin-block-start": "<length>",
    	"scroll-margin-block-end": "<length>",
    	"scroll-margin-bottom": "<length>",
    	"scroll-margin-inline": "<length>{1,2}",
    	"scroll-margin-inline-start": "<length>",
    	"scroll-margin-inline-end": "<length>",
    	"scroll-margin-left": "<length>",
    	"scroll-margin-right": "<length>",
    	"scroll-margin-top": "<length>",
    	"scroll-padding": "[auto|<length-percentage>]{1,4}",
    	"scroll-padding-block": "[auto|<length-percentage>]{1,2}",
    	"scroll-padding-block-start": "auto|<length-percentage>",
    	"scroll-padding-block-end": "auto|<length-percentage>",
    	"scroll-padding-bottom": "auto|<length-percentage>",
    	"scroll-padding-inline": "[auto|<length-percentage>]{1,2}",
    	"scroll-padding-inline-start": "auto|<length-percentage>",
    	"scroll-padding-inline-end": "auto|<length-percentage>",
    	"scroll-padding-left": "auto|<length-percentage>",
    	"scroll-padding-right": "auto|<length-percentage>",
    	"scroll-padding-top": "auto|<length-percentage>",
    	"scroll-snap-align": "[none|start|end|center]{1,2}",
    	"scroll-snap-coordinate": "none|<position>#",
    	"scroll-snap-destination": "<position>",
    	"scroll-snap-points-x": "none|repeat( <length-percentage> )",
    	"scroll-snap-points-y": "none|repeat( <length-percentage> )",
    	"scroll-snap-stop": "normal|always",
    	"scroll-snap-type": "none|[x|y|block|inline|both] [mandatory|proximity]?",
    	"scroll-snap-type-x": "none|mandatory|proximity",
    	"scroll-snap-type-y": "none|mandatory|proximity",
    	"shape-image-threshold": "<number>",
    	"shape-margin": "<length-percentage>",
    	"shape-outside": "none|<shape-box>||<basic-shape>|<image>",
    	"tab-size": "<integer>|<length>",
    	"table-layout": "auto|fixed",
    	"text-align": "start|end|left|right|center|justify|match-parent",
    	"text-align-last": "auto|start|end|left|right|center|justify",
    	"text-combine-upright": "none|all|[digits <integer>?]",
    	"text-decoration": "<'text-decoration-line'>||<'text-decoration-style'>||<'text-decoration-color'>",
    	"text-decoration-color": "<color>",
    	"text-decoration-line": "none|[underline||overline||line-through||blink]",
    	"text-decoration-skip": "none|[objects||[spaces|[leading-spaces||trailing-spaces]]||edges||box-decoration]",
    	"text-decoration-skip-ink": "auto|none",
    	"text-decoration-style": "solid|double|dotted|dashed|wavy",
    	"text-emphasis": "<'text-emphasis-style'>||<'text-emphasis-color'>",
    	"text-emphasis-color": "<color>",
    	"text-emphasis-position": "[over|under]&&[right|left]",
    	"text-emphasis-style": "none|[[filled|open]||[dot|circle|double-circle|triangle|sesame]]|<string>",
    	"text-indent": "<length-percentage>&&hanging?&&each-line?",
    	"text-justify": "auto|inter-character|inter-word|none",
    	"text-orientation": "mixed|upright|sideways",
    	"text-overflow": "[clip|ellipsis|<string>]{1,2}",
    	"text-rendering": "auto|optimizeSpeed|optimizeLegibility|geometricPrecision",
    	"text-shadow": "none|<shadow-t>#",
    	"text-size-adjust": "none|auto|<percentage>",
    	"text-transform": "none|capitalize|uppercase|lowercase|full-width|full-size-kana",
    	"text-underline-position": "auto|[under||[left|right]]",
    	top: "<length>|<percentage>|auto",
    	"touch-action": "auto|none|[[pan-x|pan-left|pan-right]||[pan-y|pan-up|pan-down]||pinch-zoom]|manipulation",
    	transform: "none|<transform-list>",
    	"transform-box": "border-box|fill-box|view-box",
    	"transform-origin": "[<length-percentage>|left|center|right|top|bottom]|[[<length-percentage>|left|center|right]&&[<length-percentage>|top|center|bottom]] <length>?",
    	"transform-style": "flat|preserve-3d",
    	transition: "<single-transition>#",
    	"transition-delay": "<time>#",
    	"transition-duration": "<time>#",
    	"transition-property": "none|<single-transition-property>#",
    	"transition-timing-function": "<timing-function>#",
    	translate: "none|<length-percentage> [<length-percentage> <length>?]?",
    	"unicode-bidi": "normal|embed|isolate|bidi-override|isolate-override|plaintext|-moz-isolate|-moz-isolate-override|-moz-plaintext|-webkit-isolate",
    	"user-select": "auto|text|none|contain|all",
    	"vertical-align": "baseline|sub|super|text-top|text-bottom|middle|top|bottom|<percentage>|<length>",
    	visibility: "visible|hidden|collapse",
    	"white-space": "normal|pre|nowrap|pre-wrap|pre-line",
    	widows: "<integer>",
    	width: "[<length>|<percentage>]&&[border-box|content-box]?|available|min-content|max-content|fit-content|auto",
    	"will-change": "auto|<animateable-feature>#",
    	"word-break": "normal|break-all|keep-all|break-word",
    	"word-spacing": "normal|<length-percentage>",
    	"word-wrap": "normal|break-word",
    	"writing-mode": "horizontal-tb|vertical-rl|vertical-lr|sideways-rl|sideways-lr|<svg-writing-mode>",
    	"z-index": "auto|<integer>",
    	zoom: "normal|reset|<number>|<percentage>",
    	"-moz-background-clip": "padding|border",
    	"-moz-border-radius-bottomleft": "<'border-bottom-left-radius'>",
    	"-moz-border-radius-bottomright": "<'border-bottom-right-radius'>",
    	"-moz-border-radius-topleft": "<'border-top-left-radius'>",
    	"-moz-border-radius-topright": "<'border-bottom-right-radius'>",
    	"-moz-control-character-visibility": "visible|hidden",
    	"-moz-osx-font-smoothing": "auto|grayscale",
    	"-moz-user-select": "none|text|all|-moz-none",
    	"-ms-flex-align": "start|end|center|baseline|stretch",
    	"-ms-flex-item-align": "auto|start|end|center|baseline|stretch",
    	"-ms-flex-line-pack": "start|end|center|justify|distribute|stretch",
    	"-ms-flex-negative": "<'flex-shrink'>",
    	"-ms-flex-pack": "start|end|center|justify|distribute",
    	"-ms-flex-order": "<integer>",
    	"-ms-flex-positive": "<'flex-grow'>",
    	"-ms-flex-preferred-size": "<'flex-basis'>",
    	"-ms-interpolation-mode": "nearest-neighbor|bicubic",
    	"-ms-grid-column-align": "start|end|center|stretch",
    	"-ms-grid-columns": "<track-list-v0>",
    	"-ms-grid-row-align": "start|end|center|stretch",
    	"-ms-grid-rows": "<track-list-v0>",
    	"-ms-hyphenate-limit-last": "none|always|column|page|spread",
    	"-webkit-background-clip": "[<box>|border|padding|content|text]#",
    	"-webkit-column-break-after": "always|auto|avoid",
    	"-webkit-column-break-before": "always|auto|avoid",
    	"-webkit-column-break-inside": "always|auto|avoid",
    	"-webkit-font-smoothing": "auto|none|antialiased|subpixel-antialiased",
    	"-webkit-mask-box-image": "[<url>|<gradient>|none] [<length-percentage>{4} <-webkit-mask-box-repeat>{2}]?",
    	"-webkit-print-color-adjust": "economy|exact",
    	"-webkit-text-security": "none|circle|disc|square",
    	"-webkit-user-drag": "none|element|auto",
    	"-webkit-user-select": "auto|none|text|all",
    	"alignment-baseline": "auto|baseline|before-edge|text-before-edge|middle|central|after-edge|text-after-edge|ideographic|alphabetic|hanging|mathematical",
    	"baseline-shift": "baseline|sub|super|<svg-length>",
    	behavior: "<url>+",
    	"clip-rule": "nonzero|evenodd",
    	cue: "<'cue-before'> <'cue-after'>?",
    	"cue-after": "<url> <decibel>?|none",
    	"cue-before": "<url> <decibel>?|none",
    	"dominant-baseline": "auto|use-script|no-change|reset-size|ideographic|alphabetic|hanging|mathematical|central|middle|text-after-edge|text-before-edge",
    	fill: "<paint>",
    	"fill-opacity": "<number-zero-one>",
    	"fill-rule": "nonzero|evenodd",
    	"glyph-orientation-horizontal": "<angle>",
    	"glyph-orientation-vertical": "<angle>",
    	kerning: "auto|<svg-length>",
    	marker: "none|<url>",
    	"marker-end": "none|<url>",
    	"marker-mid": "none|<url>",
    	"marker-start": "none|<url>",
    	pause: "<'pause-before'> <'pause-after'>?",
    	"pause-after": "<time>|none|x-weak|weak|medium|strong|x-strong",
    	"pause-before": "<time>|none|x-weak|weak|medium|strong|x-strong",
    	rest: "<'rest-before'> <'rest-after'>?",
    	"rest-after": "<time>|none|x-weak|weak|medium|strong|x-strong",
    	"rest-before": "<time>|none|x-weak|weak|medium|strong|x-strong",
    	"shape-rendering": "auto|optimizeSpeed|crispEdges|geometricPrecision",
    	src: "[<url> [format( <string># )]?|local( <family-name> )]#",
    	speak: "auto|none|normal",
    	"speak-as": "normal|spell-out||digits||[literal-punctuation|no-punctuation]",
    	stroke: "<paint>",
    	"stroke-dasharray": "none|[<svg-length>+]#",
    	"stroke-dashoffset": "<svg-length>",
    	"stroke-linecap": "butt|round|square",
    	"stroke-linejoin": "miter|round|bevel",
    	"stroke-miterlimit": "<number-one-or-greater>",
    	"stroke-opacity": "<number-zero-one>",
    	"stroke-width": "<svg-length>",
    	"text-anchor": "start|middle|end",
    	"unicode-range": "<urange>#",
    	"voice-balance": "<number>|left|center|right|leftwards|rightwards",
    	"voice-duration": "auto|<time>",
    	"voice-family": "[[<family-name>|<generic-voice>] ,]* [<family-name>|<generic-voice>]|preserve",
    	"voice-pitch": "<frequency>&&absolute|[[x-low|low|medium|high|x-high]||[<frequency>|<semitones>|<percentage>]]",
    	"voice-range": "<frequency>&&absolute|[[x-low|low|medium|high|x-high]||[<frequency>|<semitones>|<percentage>]]",
    	"voice-rate": "[normal|x-slow|slow|medium|fast|x-fast]||<percentage>",
    	"voice-stress": "normal|strong|moderate|none|reduced",
    	"voice-volume": "silent|[[x-soft|soft|medium|loud|x-loud]||<decibel>]"
    };
    var defaultSyntax = {
    	generic: generic$1,
    	types: types,
    	properties: properties$1
    };

    var defaultSyntax$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        generic: generic$1,
        types: types,
        properties: properties$1,
        'default': defaultSyntax
    });

    var cmpChar$3 = tokenizer.cmpChar;
    var isDigit$4 = tokenizer.isDigit;
    var TYPE$9 = tokenizer.TYPE;

    var WHITESPACE$4 = TYPE$9.WhiteSpace;
    var COMMENT$3 = TYPE$9.Comment;
    var IDENT$3 = TYPE$9.Ident;
    var NUMBER$3 = TYPE$9.Number;
    var DIMENSION$2 = TYPE$9.Dimension;
    var PLUSSIGN$3 = 0x002B;    // U+002B PLUS SIGN (+)
    var HYPHENMINUS$3 = 0x002D; // U+002D HYPHEN-MINUS (-)
    var N$4 = 0x006E;           // U+006E LATIN SMALL LETTER N (n)
    var DISALLOW_SIGN$1 = true;
    var ALLOW_SIGN$1 = false;

    function checkInteger$1(offset, disallowSign) {
        var pos = this.scanner.tokenStart + offset;
        var code = this.scanner.source.charCodeAt(pos);

        if (code === PLUSSIGN$3 || code === HYPHENMINUS$3) {
            if (disallowSign) {
                this.error('Number sign is not allowed');
            }
            pos++;
        }

        for (; pos < this.scanner.tokenEnd; pos++) {
            if (!isDigit$4(this.scanner.source.charCodeAt(pos))) {
                this.error('Integer is expected', pos);
            }
        }
    }

    function checkTokenIsInteger(disallowSign) {
        return checkInteger$1.call(this, 0, disallowSign);
    }

    function expectCharCode(offset, code) {
        if (!cmpChar$3(this.scanner.source, this.scanner.tokenStart + offset, code)) {
            var msg = '';

            switch (code) {
                case N$4:
                    msg = 'N is expected';
                    break;
                case HYPHENMINUS$3:
                    msg = 'HyphenMinus is expected';
                    break;
            }

            this.error(msg, this.scanner.tokenStart + offset);
        }
    }

    // ... <signed-integer>
    // ... ['+' | '-'] <signless-integer>
    function consumeB$1() {
        var offset = 0;
        var sign = 0;
        var type = this.scanner.tokenType;

        while (type === WHITESPACE$4 || type === COMMENT$3) {
            type = this.scanner.lookupType(++offset);
        }

        if (type !== NUMBER$3) {
            if (this.scanner.isDelim(PLUSSIGN$3, offset) ||
                this.scanner.isDelim(HYPHENMINUS$3, offset)) {
                sign = this.scanner.isDelim(PLUSSIGN$3, offset) ? PLUSSIGN$3 : HYPHENMINUS$3;

                do {
                    type = this.scanner.lookupType(++offset);
                } while (type === WHITESPACE$4 || type === COMMENT$3);

                if (type !== NUMBER$3) {
                    this.scanner.skip(offset);
                    checkTokenIsInteger.call(this, DISALLOW_SIGN$1);
                }
            } else {
                return null;
            }
        }

        if (offset > 0) {
            this.scanner.skip(offset);
        }

        if (sign === 0) {
            type = this.scanner.source.charCodeAt(this.scanner.tokenStart);
            if (type !== PLUSSIGN$3 && type !== HYPHENMINUS$3) {
                this.error('Number sign is expected');
            }
        }

        checkTokenIsInteger.call(this, sign !== 0);
        return sign === HYPHENMINUS$3 ? '-' + this.consume(NUMBER$3) : this.consume(NUMBER$3);
    }

    // An+B microsyntax https://www.w3.org/TR/css-syntax-3/#anb
    var AnPlusB = {
        name: 'AnPlusB',
        structure: {
            a: [String, null],
            b: [String, null]
        },
        parse: function() {
            /* eslint-disable brace-style*/
            var start = this.scanner.tokenStart;
            var a = null;
            var b = null;

            // <integer>
            if (this.scanner.tokenType === NUMBER$3) {
                checkTokenIsInteger.call(this, ALLOW_SIGN$1);
                b = this.consume(NUMBER$3);
            }

            // -n
            // -n <signed-integer>
            // -n ['+' | '-'] <signless-integer>
            // -n- <signless-integer>
            // <dashndashdigit-ident>
            else if (this.scanner.tokenType === IDENT$3 && cmpChar$3(this.scanner.source, this.scanner.tokenStart, HYPHENMINUS$3)) {
                a = '-1';

                expectCharCode.call(this, 1, N$4);

                switch (this.scanner.getTokenLength()) {
                    // -n
                    // -n <signed-integer>
                    // -n ['+' | '-'] <signless-integer>
                    case 2:
                        this.scanner.next();
                        b = consumeB$1.call(this);
                        break;

                    // -n- <signless-integer>
                    case 3:
                        expectCharCode.call(this, 2, HYPHENMINUS$3);

                        this.scanner.next();
                        this.scanner.skipSC();

                        checkTokenIsInteger.call(this, DISALLOW_SIGN$1);

                        b = '-' + this.consume(NUMBER$3);
                        break;

                    // <dashndashdigit-ident>
                    default:
                        expectCharCode.call(this, 2, HYPHENMINUS$3);
                        checkInteger$1.call(this, 3, DISALLOW_SIGN$1);
                        this.scanner.next();

                        b = this.scanner.substrToCursor(start + 2);
                }
            }

            // '+'? n
            // '+'? n <signed-integer>
            // '+'? n ['+' | '-'] <signless-integer>
            // '+'? n- <signless-integer>
            // '+'? <ndashdigit-ident>
            else if (this.scanner.tokenType === IDENT$3 || (this.scanner.isDelim(PLUSSIGN$3) && this.scanner.lookupType(1) === IDENT$3)) {
                var sign = 0;
                a = '1';

                // just ignore a plus
                if (this.scanner.isDelim(PLUSSIGN$3)) {
                    sign = 1;
                    this.scanner.next();
                }

                expectCharCode.call(this, 0, N$4);

                switch (this.scanner.getTokenLength()) {
                    // '+'? n
                    // '+'? n <signed-integer>
                    // '+'? n ['+' | '-'] <signless-integer>
                    case 1:
                        this.scanner.next();
                        b = consumeB$1.call(this);
                        break;

                    // '+'? n- <signless-integer>
                    case 2:
                        expectCharCode.call(this, 1, HYPHENMINUS$3);

                        this.scanner.next();
                        this.scanner.skipSC();

                        checkTokenIsInteger.call(this, DISALLOW_SIGN$1);

                        b = '-' + this.consume(NUMBER$3);
                        break;

                    // '+'? <ndashdigit-ident>
                    default:
                        expectCharCode.call(this, 1, HYPHENMINUS$3);
                        checkInteger$1.call(this, 2, DISALLOW_SIGN$1);
                        this.scanner.next();

                        b = this.scanner.substrToCursor(start + sign + 1);
                }
            }

            // <ndashdigit-dimension>
            // <ndash-dimension> <signless-integer>
            // <n-dimension>
            // <n-dimension> <signed-integer>
            // <n-dimension> ['+' | '-'] <signless-integer>
            else if (this.scanner.tokenType === DIMENSION$2) {
                var code = this.scanner.source.charCodeAt(this.scanner.tokenStart);
                var sign = code === PLUSSIGN$3 || code === HYPHENMINUS$3;

                for (var i = this.scanner.tokenStart + sign; i < this.scanner.tokenEnd; i++) {
                    if (!isDigit$4(this.scanner.source.charCodeAt(i))) {
                        break;
                    }
                }

                if (i === this.scanner.tokenStart + sign) {
                    this.error('Integer is expected', this.scanner.tokenStart + sign);
                }

                expectCharCode.call(this, i - this.scanner.tokenStart, N$4);
                a = this.scanner.source.substring(start, i);

                // <n-dimension>
                // <n-dimension> <signed-integer>
                // <n-dimension> ['+' | '-'] <signless-integer>
                if (i + 1 === this.scanner.tokenEnd) {
                    this.scanner.next();
                    b = consumeB$1.call(this);
                } else {
                    expectCharCode.call(this, i - this.scanner.tokenStart + 1, HYPHENMINUS$3);

                    // <ndash-dimension> <signless-integer>
                    if (i + 2 === this.scanner.tokenEnd) {
                        this.scanner.next();
                        this.scanner.skipSC();
                        checkTokenIsInteger.call(this, DISALLOW_SIGN$1);
                        b = '-' + this.consume(NUMBER$3);
                    }
                    // <ndashdigit-dimension>
                    else {
                        checkInteger$1.call(this, i - this.scanner.tokenStart + 2, DISALLOW_SIGN$1);
                        this.scanner.next();
                        b = this.scanner.substrToCursor(i + 1);
                    }
                }
            } else {
                this.error();
            }

            if (a !== null && a.charCodeAt(0) === PLUSSIGN$3) {
                a = a.substr(1);
            }

            if (b !== null && b.charCodeAt(0) === PLUSSIGN$3) {
                b = b.substr(1);
            }

            return {
                type: 'AnPlusB',
                loc: this.getLocation(start, this.scanner.tokenStart),
                a: a,
                b: b
            };
        },
        generate: function(node) {
            var a = node.a !== null && node.a !== undefined;
            var b = node.b !== null && node.b !== undefined;

            if (a) {
                this.chunk(
                    node.a === '+1' ? '+n' : // eslint-disable-line operator-linebreak, indent
                    node.a ===  '1' ?  'n' : // eslint-disable-line operator-linebreak, indent
                    node.a === '-1' ? '-n' : // eslint-disable-line operator-linebreak, indent
                    node.a + 'n'             // eslint-disable-line operator-linebreak, indent
                );

                if (b) {
                    b = String(node.b);
                    if (b.charAt(0) === '-' || b.charAt(0) === '+') {
                        this.chunk(b.charAt(0));
                        this.chunk(b.substr(1));
                    } else {
                        this.chunk('+');
                        this.chunk(b);
                    }
                }
            } else {
                this.chunk(String(node.b));
            }
        }
    };

    var TYPE$a = tokenizer.TYPE;

    var WhiteSpace = TYPE$a.WhiteSpace;
    var Semicolon = TYPE$a.Semicolon;
    var LeftCurlyBracket = TYPE$a.LeftCurlyBracket;
    var Delim = TYPE$a.Delim;
    var EXCLAMATIONMARK$1 = 0x0021; // U+0021 EXCLAMATION MARK (!)

    function getOffsetExcludeWS() {
        if (this.scanner.tokenIndex > 0) {
            if (this.scanner.lookupType(-1) === WhiteSpace) {
                return this.scanner.tokenIndex > 1
                    ? this.scanner.getTokenStart(this.scanner.tokenIndex - 1)
                    : this.scanner.firstCharOffset;
            }
        }

        return this.scanner.tokenStart;
    }

    // 0, 0, false
    function balanceEnd() {
        return 0;
    }

    // LEFTCURLYBRACKET, 0, false
    function leftCurlyBracket(tokenType) {
        return tokenType === LeftCurlyBracket ? 1 : 0;
    }

    // LEFTCURLYBRACKET, SEMICOLON, false
    function leftCurlyBracketOrSemicolon(tokenType) {
        return tokenType === LeftCurlyBracket || tokenType === Semicolon ? 1 : 0;
    }

    // EXCLAMATIONMARK, SEMICOLON, false
    function exclamationMarkOrSemicolon(tokenType, source, offset) {
        if (tokenType === Delim && source.charCodeAt(offset) === EXCLAMATIONMARK$1) {
            return 1;
        }

        return tokenType === Semicolon ? 1 : 0;
    }

    // 0, SEMICOLON, true
    function semicolonIncluded(tokenType) {
        return tokenType === Semicolon ? 2 : 0;
    }

    var Raw = {
        name: 'Raw',
        structure: {
            value: String
        },
        parse: function(startToken, mode, excludeWhiteSpace) {
            var startOffset = this.scanner.getTokenStart(startToken);
            var endOffset;

            this.scanner.skip(
                this.scanner.getRawLength(startToken, mode || balanceEnd)
            );

            if (excludeWhiteSpace && this.scanner.tokenStart > startOffset) {
                endOffset = getOffsetExcludeWS.call(this);
            } else {
                endOffset = this.scanner.tokenStart;
            }

            return {
                type: 'Raw',
                loc: this.getLocation(startOffset, endOffset),
                value: this.scanner.source.substring(startOffset, endOffset)
            };
        },
        generate: function(node) {
            this.chunk(node.value);
        },

        mode: {
            default: balanceEnd,
            leftCurlyBracket: leftCurlyBracket,
            leftCurlyBracketOrSemicolon: leftCurlyBracketOrSemicolon,
            exclamationMarkOrSemicolon: exclamationMarkOrSemicolon,
            semicolonIncluded: semicolonIncluded
        }
    };

    var TYPE$b = tokenizer.TYPE;
    var rawMode = Raw.mode;

    var ATKEYWORD = TYPE$b.AtKeyword;
    var SEMICOLON = TYPE$b.Semicolon;
    var LEFTCURLYBRACKET$1 = TYPE$b.LeftCurlyBracket;
    var RIGHTCURLYBRACKET$1 = TYPE$b.RightCurlyBracket;

    function consumeRaw(startToken) {
        return this.Raw(startToken, rawMode.leftCurlyBracketOrSemicolon, true);
    }

    function isDeclarationBlockAtrule() {
        for (var offset = 1, type; type = this.scanner.lookupType(offset); offset++) {
            if (type === RIGHTCURLYBRACKET$1) {
                return true;
            }

            if (type === LEFTCURLYBRACKET$1 ||
                type === ATKEYWORD) {
                return false;
            }
        }

        return false;
    }

    var Atrule = {
        name: 'Atrule',
        structure: {
            name: String,
            prelude: ['AtrulePrelude', 'Raw', null],
            block: ['Block', null]
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var name;
            var nameLowerCase;
            var prelude = null;
            var block = null;

            this.eat(ATKEYWORD);

            name = this.scanner.substrToCursor(start + 1);
            nameLowerCase = name.toLowerCase();
            this.scanner.skipSC();

            // parse prelude
            if (this.scanner.eof === false &&
                this.scanner.tokenType !== LEFTCURLYBRACKET$1 &&
                this.scanner.tokenType !== SEMICOLON) {
                if (this.parseAtrulePrelude) {
                    prelude = this.parseWithFallback(this.AtrulePrelude.bind(this, name), consumeRaw);

                    // turn empty AtrulePrelude into null
                    if (prelude.type === 'AtrulePrelude' && prelude.children.head === null) {
                        prelude = null;
                    }
                } else {
                    prelude = consumeRaw.call(this, this.scanner.tokenIndex);
                }

                this.scanner.skipSC();
            }

            switch (this.scanner.tokenType) {
                case SEMICOLON:
                    this.scanner.next();
                    break;

                case LEFTCURLYBRACKET$1:
                    if (this.atrule.hasOwnProperty(nameLowerCase) &&
                        typeof this.atrule[nameLowerCase].block === 'function') {
                        block = this.atrule[nameLowerCase].block.call(this);
                    } else {
                        // TODO: should consume block content as Raw?
                        block = this.Block(isDeclarationBlockAtrule.call(this));
                    }

                    break;
            }

            return {
                type: 'Atrule',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: name,
                prelude: prelude,
                block: block
            };
        },
        generate: function(node) {
            this.chunk('@');
            this.chunk(node.name);

            if (node.prelude !== null) {
                this.chunk(' ');
                this.node(node.prelude);
            }

            if (node.block) {
                this.node(node.block);
            } else {
                this.chunk(';');
            }
        },
        walkContext: 'atrule'
    };

    var TYPE$c = tokenizer.TYPE;

    var SEMICOLON$1 = TYPE$c.Semicolon;
    var LEFTCURLYBRACKET$2 = TYPE$c.LeftCurlyBracket;

    var AtrulePrelude = {
        name: 'AtrulePrelude',
        structure: {
            children: [[]]
        },
        parse: function(name) {
            var children = null;

            if (name !== null) {
                name = name.toLowerCase();
            }

            this.scanner.skipSC();

            if (this.atrule.hasOwnProperty(name) &&
                typeof this.atrule[name].prelude === 'function') {
                // custom consumer
                children = this.atrule[name].prelude.call(this);
            } else {
                // default consumer
                children = this.readSequence(this.scope.AtrulePrelude);
            }

            this.scanner.skipSC();

            if (this.scanner.eof !== true &&
                this.scanner.tokenType !== LEFTCURLYBRACKET$2 &&
                this.scanner.tokenType !== SEMICOLON$1) {
                this.error('Semicolon or block is expected');
            }

            if (children === null) {
                children = this.createList();
            }

            return {
                type: 'AtrulePrelude',
                loc: this.getLocationFromList(children),
                children: children
            };
        },
        generate: function(node) {
            this.children(node);
        },
        walkContext: 'atrulePrelude'
    };

    var TYPE$d = tokenizer.TYPE;

    var IDENT$4 = TYPE$d.Ident;
    var STRING = TYPE$d.String;
    var COLON = TYPE$d.Colon;
    var LEFTSQUAREBRACKET$1 = TYPE$d.LeftSquareBracket;
    var RIGHTSQUAREBRACKET$1 = TYPE$d.RightSquareBracket;
    var DOLLARSIGN = 0x0024;       // U+0024 DOLLAR SIGN ($)
    var ASTERISK$1 = 0x002A;         // U+002A ASTERISK (*)
    var EQUALSSIGN = 0x003D;       // U+003D EQUALS SIGN (=)
    var CIRCUMFLEXACCENT = 0x005E; // U+005E (^)
    var VERTICALLINE$1 = 0x007C;     // U+007C VERTICAL LINE (|)
    var TILDE = 0x007E;            // U+007E TILDE (~)

    function getAttributeName() {
        if (this.scanner.eof) {
            this.error('Unexpected end of input');
        }

        var start = this.scanner.tokenStart;
        var expectIdent = false;
        var checkColon = true;

        if (this.scanner.isDelim(ASTERISK$1)) {
            expectIdent = true;
            checkColon = false;
            this.scanner.next();
        } else if (!this.scanner.isDelim(VERTICALLINE$1)) {
            this.eat(IDENT$4);
        }

        if (this.scanner.isDelim(VERTICALLINE$1)) {
            if (this.scanner.source.charCodeAt(this.scanner.tokenStart + 1) !== EQUALSSIGN) {
                this.scanner.next();
                this.eat(IDENT$4);
            } else if (expectIdent) {
                this.error('Identifier is expected', this.scanner.tokenEnd);
            }
        } else if (expectIdent) {
            this.error('Vertical line is expected');
        }

        if (checkColon && this.scanner.tokenType === COLON) {
            this.scanner.next();
            this.eat(IDENT$4);
        }

        return {
            type: 'Identifier',
            loc: this.getLocation(start, this.scanner.tokenStart),
            name: this.scanner.substrToCursor(start)
        };
    }

    function getOperator() {
        var start = this.scanner.tokenStart;
        var code = this.scanner.source.charCodeAt(start);

        if (code !== EQUALSSIGN &&        // =
            code !== TILDE &&             // ~=
            code !== CIRCUMFLEXACCENT &&  // ^=
            code !== DOLLARSIGN &&        // $=
            code !== ASTERISK$1 &&          // *=
            code !== VERTICALLINE$1         // |=
        ) {
            this.error('Attribute selector (=, ~=, ^=, $=, *=, |=) is expected');
        }

        this.scanner.next();

        if (code !== EQUALSSIGN) {
            if (!this.scanner.isDelim(EQUALSSIGN)) {
                this.error('Equal sign is expected');
            }

            this.scanner.next();
        }

        return this.scanner.substrToCursor(start);
    }

    // '[' <wq-name> ']'
    // '[' <wq-name> <attr-matcher> [ <string-token> | <ident-token> ] <attr-modifier>? ']'
    var AttributeSelector = {
        name: 'AttributeSelector',
        structure: {
            name: 'Identifier',
            matcher: [String, null],
            value: ['String', 'Identifier', null],
            flags: [String, null]
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var name;
            var matcher = null;
            var value = null;
            var flags = null;

            this.eat(LEFTSQUAREBRACKET$1);
            this.scanner.skipSC();

            name = getAttributeName.call(this);
            this.scanner.skipSC();

            if (this.scanner.tokenType !== RIGHTSQUAREBRACKET$1) {
                // avoid case `[name i]`
                if (this.scanner.tokenType !== IDENT$4) {
                    matcher = getOperator.call(this);

                    this.scanner.skipSC();

                    value = this.scanner.tokenType === STRING
                        ? this.String()
                        : this.Identifier();

                    this.scanner.skipSC();
                }

                // attribute flags
                if (this.scanner.tokenType === IDENT$4) {
                    flags = this.scanner.getTokenValue();
                    this.scanner.next();

                    this.scanner.skipSC();
                }
            }

            this.eat(RIGHTSQUAREBRACKET$1);

            return {
                type: 'AttributeSelector',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: name,
                matcher: matcher,
                value: value,
                flags: flags
            };
        },
        generate: function(node) {
            var flagsPrefix = ' ';

            this.chunk('[');
            this.node(node.name);

            if (node.matcher !== null) {
                this.chunk(node.matcher);

                if (node.value !== null) {
                    this.node(node.value);

                    // space between string and flags is not required
                    if (node.value.type === 'String') {
                        flagsPrefix = '';
                    }
                }
            }

            if (node.flags !== null) {
                this.chunk(flagsPrefix);
                this.chunk(node.flags);
            }

            this.chunk(']');
        }
    };

    var TYPE$e = tokenizer.TYPE;
    var rawMode$1 = Raw.mode;

    var WHITESPACE$5 = TYPE$e.WhiteSpace;
    var COMMENT$4 = TYPE$e.Comment;
    var SEMICOLON$2 = TYPE$e.Semicolon;
    var ATKEYWORD$1 = TYPE$e.AtKeyword;
    var LEFTCURLYBRACKET$3 = TYPE$e.LeftCurlyBracket;
    var RIGHTCURLYBRACKET$2 = TYPE$e.RightCurlyBracket;

    function consumeRaw$1(startToken) {
        return this.Raw(startToken, null, true);
    }
    function consumeRule() {
        return this.parseWithFallback(this.Rule, consumeRaw$1);
    }
    function consumeRawDeclaration(startToken) {
        return this.Raw(startToken, rawMode$1.semicolonIncluded, true);
    }
    function consumeDeclaration() {
        if (this.scanner.tokenType === SEMICOLON$2) {
            return consumeRawDeclaration.call(this, this.scanner.tokenIndex);
        }

        var node = this.parseWithFallback(this.Declaration, consumeRawDeclaration);

        if (this.scanner.tokenType === SEMICOLON$2) {
            this.scanner.next();
        }

        return node;
    }

    var Block = {
        name: 'Block',
        structure: {
            children: [[
                'Atrule',
                'Rule',
                'Declaration'
            ]]
        },
        parse: function(isDeclaration) {
            var consumer = isDeclaration ? consumeDeclaration : consumeRule;

            var start = this.scanner.tokenStart;
            var children = this.createList();

            this.eat(LEFTCURLYBRACKET$3);

            scan:
            while (!this.scanner.eof) {
                switch (this.scanner.tokenType) {
                    case RIGHTCURLYBRACKET$2:
                        break scan;

                    case WHITESPACE$5:
                    case COMMENT$4:
                        this.scanner.next();
                        break;

                    case ATKEYWORD$1:
                        children.push(this.parseWithFallback(this.Atrule, consumeRaw$1));
                        break;

                    default:
                        children.push(consumer.call(this));
                }
            }

            if (!this.scanner.eof) {
                this.eat(RIGHTCURLYBRACKET$2);
            }

            return {
                type: 'Block',
                loc: this.getLocation(start, this.scanner.tokenStart),
                children: children
            };
        },
        generate: function(node) {
            this.chunk('{');
            this.children(node, function(prev) {
                if (prev.type === 'Declaration') {
                    this.chunk(';');
                }
            });
            this.chunk('}');
        },
        walkContext: 'block'
    };

    var TYPE$f = tokenizer.TYPE;

    var LEFTSQUAREBRACKET$2 = TYPE$f.LeftSquareBracket;
    var RIGHTSQUAREBRACKET$2 = TYPE$f.RightSquareBracket;

    var Brackets = {
        name: 'Brackets',
        structure: {
            children: [[]]
        },
        parse: function(readSequence, recognizer) {
            var start = this.scanner.tokenStart;
            var children = null;

            this.eat(LEFTSQUAREBRACKET$2);

            children = readSequence.call(this, recognizer);

            if (!this.scanner.eof) {
                this.eat(RIGHTSQUAREBRACKET$2);
            }

            return {
                type: 'Brackets',
                loc: this.getLocation(start, this.scanner.tokenStart),
                children: children
            };
        },
        generate: function(node) {
            this.chunk('[');
            this.children(node);
            this.chunk(']');
        }
    };

    var CDC = tokenizer.TYPE.CDC;

    var CDC_1 = {
        name: 'CDC',
        structure: [],
        parse: function() {
            var start = this.scanner.tokenStart;

            this.eat(CDC); // -->

            return {
                type: 'CDC',
                loc: this.getLocation(start, this.scanner.tokenStart)
            };
        },
        generate: function() {
            this.chunk('-->');
        }
    };

    var CDO = tokenizer.TYPE.CDO;

    var CDO_1 = {
        name: 'CDO',
        structure: [],
        parse: function() {
            var start = this.scanner.tokenStart;

            this.eat(CDO); // <!--

            return {
                type: 'CDO',
                loc: this.getLocation(start, this.scanner.tokenStart)
            };
        },
        generate: function() {
            this.chunk('<!--');
        }
    };

    var TYPE$g = tokenizer.TYPE;

    var IDENT$5 = TYPE$g.Ident;
    var FULLSTOP = 0x002E; // U+002E FULL STOP (.)

    // '.' ident
    var ClassSelector = {
        name: 'ClassSelector',
        structure: {
            name: String
        },
        parse: function() {
            if (!this.scanner.isDelim(FULLSTOP)) {
                this.error('Full stop is expected');
            }

            this.scanner.next();

            return {
                type: 'ClassSelector',
                loc: this.getLocation(this.scanner.tokenStart - 1, this.scanner.tokenEnd),
                name: this.consume(IDENT$5)
            };
        },
        generate: function(node) {
            this.chunk('.');
            this.chunk(node.name);
        }
    };

    var TYPE$h = tokenizer.TYPE;

    var IDENT$6 = TYPE$h.Ident;
    var PLUSSIGN$4 = 0x002B;        // U+002B PLUS SIGN (+)
    var SOLIDUS = 0x002F;         // U+002F SOLIDUS (/)
    var GREATERTHANSIGN$1 = 0x003E; // U+003E GREATER-THAN SIGN (>)
    var TILDE$1 = 0x007E;           // U+007E TILDE (~)

    // + | > | ~ | /deep/
    var Combinator = {
        name: 'Combinator',
        structure: {
            name: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var code = this.scanner.source.charCodeAt(this.scanner.tokenStart);

            switch (code) {
                case GREATERTHANSIGN$1:
                case PLUSSIGN$4:
                case TILDE$1:
                    this.scanner.next();
                    break;

                case SOLIDUS:
                    this.scanner.next();

                    if (this.scanner.tokenType !== IDENT$6 || this.scanner.lookupValue(0, 'deep') === false) {
                        this.error('Identifier `deep` is expected');
                    }

                    this.scanner.next();

                    if (!this.scanner.isDelim(SOLIDUS)) {
                        this.error('Solidus is expected');
                    }

                    this.scanner.next();
                    break;

                default:
                    this.error('Combinator is expected');
            }

            return {
                type: 'Combinator',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: this.scanner.substrToCursor(start)
            };
        },
        generate: function(node) {
            this.chunk(node.name);
        }
    };

    var TYPE$i = tokenizer.TYPE;

    var COMMENT$5 = TYPE$i.Comment;
    var ASTERISK$2 = 0x002A;        // U+002A ASTERISK (*)
    var SOLIDUS$1 = 0x002F;         // U+002F SOLIDUS (/)

    // '/*' .* '*/'
    var Comment = {
        name: 'Comment',
        structure: {
            value: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var end = this.scanner.tokenEnd;

            this.eat(COMMENT$5);

            if ((end - start + 2) >= 2 &&
                this.scanner.source.charCodeAt(end - 2) === ASTERISK$2 &&
                this.scanner.source.charCodeAt(end - 1) === SOLIDUS$1) {
                end -= 2;
            }

            return {
                type: 'Comment',
                loc: this.getLocation(start, this.scanner.tokenStart),
                value: this.scanner.source.substring(start + 2, end)
            };
        },
        generate: function(node) {
            this.chunk('/*');
            this.chunk(node.value);
            this.chunk('*/');
        }
    };

    var isCustomProperty$1 = names.isCustomProperty;
    var TYPE$j = tokenizer.TYPE;
    var rawMode$2 = Raw.mode;

    var IDENT$7 = TYPE$j.Ident;
    var HASH$1 = TYPE$j.Hash;
    var COLON$1 = TYPE$j.Colon;
    var SEMICOLON$3 = TYPE$j.Semicolon;
    var DELIM$2 = TYPE$j.Delim;
    var EXCLAMATIONMARK$2 = 0x0021; // U+0021 EXCLAMATION MARK (!)
    var NUMBERSIGN$2 = 0x0023;      // U+0023 NUMBER SIGN (#)
    var DOLLARSIGN$1 = 0x0024;      // U+0024 DOLLAR SIGN ($)
    var AMPERSAND$1 = 0x0026;       // U+0026 ANPERSAND (&)
    var ASTERISK$3 = 0x002A;        // U+002A ASTERISK (*)
    var PLUSSIGN$5 = 0x002B;        // U+002B PLUS SIGN (+)
    var SOLIDUS$2 = 0x002F;         // U+002F SOLIDUS (/)

    function consumeValueRaw(startToken) {
        return this.Raw(startToken, rawMode$2.exclamationMarkOrSemicolon, true);
    }

    function consumeCustomPropertyRaw(startToken) {
        return this.Raw(startToken, rawMode$2.exclamationMarkOrSemicolon, false);
    }

    function consumeValue() {
        var startValueToken = this.scanner.tokenIndex;
        var value = this.Value();

        if (value.type !== 'Raw' &&
            this.scanner.eof === false &&
            this.scanner.tokenType !== SEMICOLON$3 &&
            this.scanner.isDelim(EXCLAMATIONMARK$2) === false &&
            this.scanner.isBalanceEdge(startValueToken) === false) {
            this.error();
        }

        return value;
    }

    var Declaration = {
        name: 'Declaration',
        structure: {
            important: [Boolean, String],
            property: String,
            value: ['Value', 'Raw']
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var startToken = this.scanner.tokenIndex;
            var property = readProperty$1.call(this);
            var customProperty = isCustomProperty$1(property);
            var parseValue = customProperty ? this.parseCustomProperty : this.parseValue;
            var consumeRaw = customProperty ? consumeCustomPropertyRaw : consumeValueRaw;
            var important = false;
            var value;

            this.scanner.skipSC();
            this.eat(COLON$1);

            if (!customProperty) {
                this.scanner.skipSC();
            }

            if (parseValue) {
                value = this.parseWithFallback(consumeValue, consumeRaw);
            } else {
                value = consumeRaw.call(this, this.scanner.tokenIndex);
            }

            if (this.scanner.isDelim(EXCLAMATIONMARK$2)) {
                important = getImportant.call(this);
                this.scanner.skipSC();
            }

            // Do not include semicolon to range per spec
            // https://drafts.csswg.org/css-syntax/#declaration-diagram

            if (this.scanner.eof === false &&
                this.scanner.tokenType !== SEMICOLON$3 &&
                this.scanner.isBalanceEdge(startToken) === false) {
                this.error();
            }

            return {
                type: 'Declaration',
                loc: this.getLocation(start, this.scanner.tokenStart),
                important: important,
                property: property,
                value: value
            };
        },
        generate: function(node) {
            this.chunk(node.property);
            this.chunk(':');
            this.node(node.value);

            if (node.important) {
                this.chunk(node.important === true ? '!important' : '!' + node.important);
            }
        },
        walkContext: 'declaration'
    };

    function readProperty$1() {
        var start = this.scanner.tokenStart;

        // hacks
        if (this.scanner.tokenType === DELIM$2) {
            switch (this.scanner.source.charCodeAt(this.scanner.tokenStart)) {
                case ASTERISK$3:
                case DOLLARSIGN$1:
                case PLUSSIGN$5:
                case NUMBERSIGN$2:
                case AMPERSAND$1:
                    this.scanner.next();
                    break;

                // TODO: not sure we should support this hack
                case SOLIDUS$2:
                    this.scanner.next();
                    if (this.scanner.isDelim(SOLIDUS$2)) {
                        this.scanner.next();
                    }
                    break;
            }
        }

        if (this.scanner.tokenType === HASH$1) {
            this.eat(HASH$1);
        } else {
            this.eat(IDENT$7);
        }

        return this.scanner.substrToCursor(start);
    }

    // ! ws* important
    function getImportant() {
        this.eat(DELIM$2);
        this.scanner.skipSC();

        var important = this.consume(IDENT$7);

        // store original value in case it differ from `important`
        // for better original source restoring and hacks like `!ie` support
        return important === 'important' ? true : important;
    }

    var TYPE$k = tokenizer.TYPE;
    var rawMode$3 = Raw.mode;

    var WHITESPACE$6 = TYPE$k.WhiteSpace;
    var COMMENT$6 = TYPE$k.Comment;
    var SEMICOLON$4 = TYPE$k.Semicolon;

    function consumeRaw$2(startToken) {
        return this.Raw(startToken, rawMode$3.semicolonIncluded, true);
    }

    var DeclarationList = {
        name: 'DeclarationList',
        structure: {
            children: [[
                'Declaration'
            ]]
        },
        parse: function() {
            var children = this.createList();

            scan:
            while (!this.scanner.eof) {
                switch (this.scanner.tokenType) {
                    case WHITESPACE$6:
                    case COMMENT$6:
                    case SEMICOLON$4:
                        this.scanner.next();
                        break;

                    default:
                        children.push(this.parseWithFallback(this.Declaration, consumeRaw$2));
                }
            }

            return {
                type: 'DeclarationList',
                loc: this.getLocationFromList(children),
                children: children
            };
        },
        generate: function(node) {
            this.children(node, function(prev) {
                if (prev.type === 'Declaration') {
                    this.chunk(';');
                }
            });
        }
    };

    var consumeNumber$3 = utils.consumeNumber;
    var TYPE$l = tokenizer.TYPE;

    var DIMENSION$3 = TYPE$l.Dimension;

    var Dimension = {
        name: 'Dimension',
        structure: {
            value: String,
            unit: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var numberEnd = consumeNumber$3(this.scanner.source, start);

            this.eat(DIMENSION$3);

            return {
                type: 'Dimension',
                loc: this.getLocation(start, this.scanner.tokenStart),
                value: this.scanner.source.substring(start, numberEnd),
                unit: this.scanner.source.substring(numberEnd, this.scanner.tokenStart)
            };
        },
        generate: function(node) {
            this.chunk(node.value);
            this.chunk(node.unit);
        }
    };

    var TYPE$m = tokenizer.TYPE;

    var RIGHTPARENTHESIS$2 = TYPE$m.RightParenthesis;

    // <function-token> <sequence> )
    var _Function = {
        name: 'Function',
        structure: {
            name: String,
            children: [[]]
        },
        parse: function(readSequence, recognizer) {
            var start = this.scanner.tokenStart;
            var name = this.consumeFunctionName();
            var nameLowerCase = name.toLowerCase();
            var children;

            children = recognizer.hasOwnProperty(nameLowerCase)
                ? recognizer[nameLowerCase].call(this, recognizer)
                : readSequence.call(this, recognizer);

            if (!this.scanner.eof) {
                this.eat(RIGHTPARENTHESIS$2);
            }

            return {
                type: 'Function',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: name,
                children: children
            };
        },
        generate: function(node) {
            this.chunk(node.name);
            this.chunk('(');
            this.children(node);
            this.chunk(')');
        },
        walkContext: 'function'
    };

    var TYPE$n = tokenizer.TYPE;

    var HASH$2 = TYPE$n.Hash;

    // '#' ident
    var HexColor = {
        name: 'HexColor',
        structure: {
            value: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;

            this.eat(HASH$2);

            return {
                type: 'HexColor',
                loc: this.getLocation(start, this.scanner.tokenStart),
                value: this.scanner.substrToCursor(start + 1)
            };
        },
        generate: function(node) {
            this.chunk('#');
            this.chunk(node.value);
        }
    };

    var TYPE$o = tokenizer.TYPE;

    var IDENT$8 = TYPE$o.Ident;

    var Identifier = {
        name: 'Identifier',
        structure: {
            name: String
        },
        parse: function() {
            return {
                type: 'Identifier',
                loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
                name: this.consume(IDENT$8)
            };
        },
        generate: function(node) {
            this.chunk(node.name);
        }
    };

    var TYPE$p = tokenizer.TYPE;

    var HASH$3 = TYPE$p.Hash;

    // <hash-token>
    var IdSelector = {
        name: 'IdSelector',
        structure: {
            name: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;

            // TODO: check value is an ident
            this.eat(HASH$3);

            return {
                type: 'IdSelector',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: this.scanner.substrToCursor(start + 1)
            };
        },
        generate: function(node) {
            this.chunk('#');
            this.chunk(node.name);
        }
    };

    var TYPE$q = tokenizer.TYPE;

    var IDENT$9 = TYPE$q.Ident;
    var NUMBER$4 = TYPE$q.Number;
    var DIMENSION$4 = TYPE$q.Dimension;
    var LEFTPARENTHESIS$2 = TYPE$q.LeftParenthesis;
    var RIGHTPARENTHESIS$3 = TYPE$q.RightParenthesis;
    var COLON$2 = TYPE$q.Colon;
    var DELIM$3 = TYPE$q.Delim;

    var MediaFeature = {
        name: 'MediaFeature',
        structure: {
            name: String,
            value: ['Identifier', 'Number', 'Dimension', 'Ratio', null]
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var name;
            var value = null;

            this.eat(LEFTPARENTHESIS$2);
            this.scanner.skipSC();

            name = this.consume(IDENT$9);
            this.scanner.skipSC();

            if (this.scanner.tokenType !== RIGHTPARENTHESIS$3) {
                this.eat(COLON$2);
                this.scanner.skipSC();

                switch (this.scanner.tokenType) {
                    case NUMBER$4:
                        if (this.lookupNonWSType(1) === DELIM$3) {
                            value = this.Ratio();
                        } else {
                            value = this.Number();
                        }

                        break;

                    case DIMENSION$4:
                        value = this.Dimension();
                        break;

                    case IDENT$9:
                        value = this.Identifier();

                        break;

                    default:
                        this.error('Number, dimension, ratio or identifier is expected');
                }

                this.scanner.skipSC();
            }

            this.eat(RIGHTPARENTHESIS$3);

            return {
                type: 'MediaFeature',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: name,
                value: value
            };
        },
        generate: function(node) {
            this.chunk('(');
            this.chunk(node.name);
            if (node.value !== null) {
                this.chunk(':');
                this.node(node.value);
            }
            this.chunk(')');
        }
    };

    var TYPE$r = tokenizer.TYPE;

    var WHITESPACE$7 = TYPE$r.WhiteSpace;
    var COMMENT$7 = TYPE$r.Comment;
    var IDENT$a = TYPE$r.Ident;
    var LEFTPARENTHESIS$3 = TYPE$r.LeftParenthesis;

    var MediaQuery = {
        name: 'MediaQuery',
        structure: {
            children: [[
                'Identifier',
                'MediaFeature',
                'WhiteSpace'
            ]]
        },
        parse: function() {
            this.scanner.skipSC();

            var children = this.createList();
            var child = null;
            var space = null;

            scan:
            while (!this.scanner.eof) {
                switch (this.scanner.tokenType) {
                    case COMMENT$7:
                        this.scanner.next();
                        continue;

                    case WHITESPACE$7:
                        space = this.WhiteSpace();
                        continue;

                    case IDENT$a:
                        child = this.Identifier();
                        break;

                    case LEFTPARENTHESIS$3:
                        child = this.MediaFeature();
                        break;

                    default:
                        break scan;
                }

                if (space !== null) {
                    children.push(space);
                    space = null;
                }

                children.push(child);
            }

            if (child === null) {
                this.error('Identifier or parenthesis is expected');
            }

            return {
                type: 'MediaQuery',
                loc: this.getLocationFromList(children),
                children: children
            };
        },
        generate: function(node) {
            this.children(node);
        }
    };

    var COMMA$1 = tokenizer.TYPE.Comma;

    var MediaQueryList = {
        name: 'MediaQueryList',
        structure: {
            children: [[
                'MediaQuery'
            ]]
        },
        parse: function(relative) {
            var children = this.createList();

            this.scanner.skipSC();

            while (!this.scanner.eof) {
                children.push(this.MediaQuery(relative));

                if (this.scanner.tokenType !== COMMA$1) {
                    break;
                }

                this.scanner.next();
            }

            return {
                type: 'MediaQueryList',
                loc: this.getLocationFromList(children),
                children: children
            };
        },
        generate: function(node) {
            this.children(node, function() {
                this.chunk(',');
            });
        }
    };

    var Nth = {
        name: 'Nth',
        structure: {
            nth: ['AnPlusB', 'Identifier'],
            selector: ['SelectorList', null]
        },
        parse: function(allowOfClause) {
            this.scanner.skipSC();

            var start = this.scanner.tokenStart;
            var end = start;
            var selector = null;
            var query;

            if (this.scanner.lookupValue(0, 'odd') || this.scanner.lookupValue(0, 'even')) {
                query = this.Identifier();
            } else {
                query = this.AnPlusB();
            }

            this.scanner.skipSC();

            if (allowOfClause && this.scanner.lookupValue(0, 'of')) {
                this.scanner.next();

                selector = this.SelectorList();

                if (this.needPositions) {
                    end = this.getLastListNode(selector.children).loc.end.offset;
                }
            } else {
                if (this.needPositions) {
                    end = query.loc.end.offset;
                }
            }

            return {
                type: 'Nth',
                loc: this.getLocation(start, end),
                nth: query,
                selector: selector
            };
        },
        generate: function(node) {
            this.node(node.nth);
            if (node.selector !== null) {
                this.chunk(' of ');
                this.node(node.selector);
            }
        }
    };

    var NUMBER$5 = tokenizer.TYPE.Number;

    var _Number = {
        name: 'Number',
        structure: {
            value: String
        },
        parse: function() {
            return {
                type: 'Number',
                loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
                value: this.consume(NUMBER$5)
            };
        },
        generate: function(node) {
            this.chunk(node.value);
        }
    };

    // '/' | '*' | ',' | ':' | '+' | '-'
    var Operator = {
        name: 'Operator',
        structure: {
            value: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;

            this.scanner.next();

            return {
                type: 'Operator',
                loc: this.getLocation(start, this.scanner.tokenStart),
                value: this.scanner.substrToCursor(start)
            };
        },
        generate: function(node) {
            this.chunk(node.value);
        }
    };

    var TYPE$s = tokenizer.TYPE;

    var LEFTPARENTHESIS$4 = TYPE$s.LeftParenthesis;
    var RIGHTPARENTHESIS$4 = TYPE$s.RightParenthesis;

    var Parentheses = {
        name: 'Parentheses',
        structure: {
            children: [[]]
        },
        parse: function(readSequence, recognizer) {
            var start = this.scanner.tokenStart;
            var children = null;

            this.eat(LEFTPARENTHESIS$4);

            children = readSequence.call(this, recognizer);

            if (!this.scanner.eof) {
                this.eat(RIGHTPARENTHESIS$4);
            }

            return {
                type: 'Parentheses',
                loc: this.getLocation(start, this.scanner.tokenStart),
                children: children
            };
        },
        generate: function(node) {
            this.chunk('(');
            this.children(node);
            this.chunk(')');
        }
    };

    var consumeNumber$4 = utils.consumeNumber;
    var TYPE$t = tokenizer.TYPE;

    var PERCENTAGE$1 = TYPE$t.Percentage;

    var Percentage = {
        name: 'Percentage',
        structure: {
            value: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var numberEnd = consumeNumber$4(this.scanner.source, start);

            this.eat(PERCENTAGE$1);

            return {
                type: 'Percentage',
                loc: this.getLocation(start, this.scanner.tokenStart),
                value: this.scanner.source.substring(start, numberEnd)
            };
        },
        generate: function(node) {
            this.chunk(node.value);
            this.chunk('%');
        }
    };

    var TYPE$u = tokenizer.TYPE;

    var IDENT$b = TYPE$u.Ident;
    var FUNCTION$1 = TYPE$u.Function;
    var COLON$3 = TYPE$u.Colon;
    var RIGHTPARENTHESIS$5 = TYPE$u.RightParenthesis;

    // : [ <ident> | <function-token> <any-value>? ) ]
    var PseudoClassSelector = {
        name: 'PseudoClassSelector',
        structure: {
            name: String,
            children: [['Raw'], null]
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var children = null;
            var name;
            var nameLowerCase;

            this.eat(COLON$3);

            if (this.scanner.tokenType === FUNCTION$1) {
                name = this.consumeFunctionName();
                nameLowerCase = name.toLowerCase();

                if (this.pseudo.hasOwnProperty(nameLowerCase)) {
                    this.scanner.skipSC();
                    children = this.pseudo[nameLowerCase].call(this);
                    this.scanner.skipSC();
                } else {
                    children = this.createList();
                    children.push(
                        this.Raw(this.scanner.tokenIndex, null, false)
                    );
                }

                this.eat(RIGHTPARENTHESIS$5);
            } else {
                name = this.consume(IDENT$b);
            }

            return {
                type: 'PseudoClassSelector',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: name,
                children: children
            };
        },
        generate: function(node) {
            this.chunk(':');
            this.chunk(node.name);

            if (node.children !== null) {
                this.chunk('(');
                this.children(node);
                this.chunk(')');
            }
        },
        walkContext: 'function'
    };

    var TYPE$v = tokenizer.TYPE;

    var IDENT$c = TYPE$v.Ident;
    var FUNCTION$2 = TYPE$v.Function;
    var COLON$4 = TYPE$v.Colon;
    var RIGHTPARENTHESIS$6 = TYPE$v.RightParenthesis;

    // :: [ <ident> | <function-token> <any-value>? ) ]
    var PseudoElementSelector = {
        name: 'PseudoElementSelector',
        structure: {
            name: String,
            children: [['Raw'], null]
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var children = null;
            var name;
            var nameLowerCase;

            this.eat(COLON$4);
            this.eat(COLON$4);

            if (this.scanner.tokenType === FUNCTION$2) {
                name = this.consumeFunctionName();
                nameLowerCase = name.toLowerCase();

                if (this.pseudo.hasOwnProperty(nameLowerCase)) {
                    this.scanner.skipSC();
                    children = this.pseudo[nameLowerCase].call(this);
                    this.scanner.skipSC();
                } else {
                    children = this.createList();
                    children.push(
                        this.Raw(this.scanner.tokenIndex, null, false)
                    );
                }

                this.eat(RIGHTPARENTHESIS$6);
            } else {
                name = this.consume(IDENT$c);
            }

            return {
                type: 'PseudoElementSelector',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: name,
                children: children
            };
        },
        generate: function(node) {
            this.chunk('::');
            this.chunk(node.name);

            if (node.children !== null) {
                this.chunk('(');
                this.children(node);
                this.chunk(')');
            }
        },
        walkContext: 'function'
    };

    var isDigit$5 = tokenizer.isDigit;
    var TYPE$w = tokenizer.TYPE;

    var NUMBER$6 = TYPE$w.Number;
    var DELIM$4 = TYPE$w.Delim;
    var SOLIDUS$3 = 0x002F;  // U+002F SOLIDUS (/)
    var FULLSTOP$1 = 0x002E; // U+002E FULL STOP (.)

    // Terms of <ratio> should be a positive numbers (not zero or negative)
    // (see https://drafts.csswg.org/mediaqueries-3/#values)
    // However, -o-min-device-pixel-ratio takes fractional values as a ratio's term
    // and this is using by various sites. Therefore we relax checking on parse
    // to test a term is unsigned number without an exponent part.
    // Additional checking may be applied on lexer validation.
    function consumeNumber$5() {
        this.scanner.skipWS();

        var value = this.consume(NUMBER$6);

        for (var i = 0; i < value.length; i++) {
            var code = value.charCodeAt(i);
            if (!isDigit$5(code) && code !== FULLSTOP$1) {
                this.error('Unsigned number is expected', this.scanner.tokenStart - value.length + i);
            }
        }

        if (Number(value) === 0) {
            this.error('Zero number is not allowed', this.scanner.tokenStart - value.length);
        }

        return value;
    }

    // <positive-integer> S* '/' S* <positive-integer>
    var Ratio = {
        name: 'Ratio',
        structure: {
            left: String,
            right: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var left = consumeNumber$5.call(this);
            var right;

            this.scanner.skipWS();

            if (!this.scanner.isDelim(SOLIDUS$3)) {
                this.error('Solidus is expected');
            }
            this.eat(DELIM$4);
            right = consumeNumber$5.call(this);

            return {
                type: 'Ratio',
                loc: this.getLocation(start, this.scanner.tokenStart),
                left: left,
                right: right
            };
        },
        generate: function(node) {
            this.chunk(node.left);
            this.chunk('/');
            this.chunk(node.right);
        }
    };

    var TYPE$x = tokenizer.TYPE;
    var rawMode$4 = Raw.mode;

    var LEFTCURLYBRACKET$4 = TYPE$x.LeftCurlyBracket;

    function consumeRaw$3(startToken) {
        return this.Raw(startToken, rawMode$4.leftCurlyBracket, true);
    }

    function consumePrelude() {
        var prelude = this.SelectorList();

        if (prelude.type !== 'Raw' &&
            this.scanner.eof === false &&
            this.scanner.tokenType !== LEFTCURLYBRACKET$4) {
            this.error();
        }

        return prelude;
    }

    var Rule = {
        name: 'Rule',
        structure: {
            prelude: ['SelectorList', 'Raw'],
            block: ['Block']
        },
        parse: function() {
            var startToken = this.scanner.tokenIndex;
            var startOffset = this.scanner.tokenStart;
            var prelude;
            var block;

            if (this.parseRulePrelude) {
                prelude = this.parseWithFallback(consumePrelude, consumeRaw$3);
            } else {
                prelude = consumeRaw$3.call(this, startToken);
            }

            block = this.Block(true);

            return {
                type: 'Rule',
                loc: this.getLocation(startOffset, this.scanner.tokenStart),
                prelude: prelude,
                block: block
            };
        },
        generate: function(node) {
            this.node(node.prelude);
            this.node(node.block);
        },
        walkContext: 'rule'
    };

    var Selector = {
        name: 'Selector',
        structure: {
            children: [[
                'TypeSelector',
                'IdSelector',
                'ClassSelector',
                'AttributeSelector',
                'PseudoClassSelector',
                'PseudoElementSelector',
                'Combinator',
                'WhiteSpace'
            ]]
        },
        parse: function() {
            var children = this.readSequence(this.scope.Selector);

            // nothing were consumed
            if (this.getFirstListNode(children) === null) {
                this.error('Selector is expected');
            }

            return {
                type: 'Selector',
                loc: this.getLocationFromList(children),
                children: children
            };
        },
        generate: function(node) {
            this.children(node);
        }
    };

    var TYPE$y = tokenizer.TYPE;

    var COMMA$2 = TYPE$y.Comma;

    var SelectorList = {
        name: 'SelectorList',
        structure: {
            children: [[
                'Selector',
                'Raw'
            ]]
        },
        parse: function() {
            var children = this.createList();

            while (!this.scanner.eof) {
                children.push(this.Selector());

                if (this.scanner.tokenType === COMMA$2) {
                    this.scanner.next();
                    continue;
                }

                break;
            }

            return {
                type: 'SelectorList',
                loc: this.getLocationFromList(children),
                children: children
            };
        },
        generate: function(node) {
            this.children(node, function() {
                this.chunk(',');
            });
        },
        walkContext: 'selector'
    };

    var STRING$1 = tokenizer.TYPE.String;

    var _String = {
        name: 'String',
        structure: {
            value: String
        },
        parse: function() {
            return {
                type: 'String',
                loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
                value: this.consume(STRING$1)
            };
        },
        generate: function(node) {
            this.chunk(node.value);
        }
    };

    var TYPE$z = tokenizer.TYPE;

    var WHITESPACE$8 = TYPE$z.WhiteSpace;
    var COMMENT$8 = TYPE$z.Comment;
    var ATKEYWORD$2 = TYPE$z.AtKeyword;
    var CDO$1 = TYPE$z.CDO;
    var CDC$1 = TYPE$z.CDC;
    var EXCLAMATIONMARK$3 = 0x0021; // U+0021 EXCLAMATION MARK (!)

    function consumeRaw$4(startToken) {
        return this.Raw(startToken, null, false);
    }

    var StyleSheet = {
        name: 'StyleSheet',
        structure: {
            children: [[
                'Comment',
                'CDO',
                'CDC',
                'Atrule',
                'Rule',
                'Raw'
            ]]
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var children = this.createList();
            var child;

            scan:
            while (!this.scanner.eof) {
                switch (this.scanner.tokenType) {
                    case WHITESPACE$8:
                        this.scanner.next();
                        continue;

                    case COMMENT$8:
                        // ignore comments except exclamation comments (i.e. /*! .. */) on top level
                        if (this.scanner.source.charCodeAt(this.scanner.tokenStart + 2) !== EXCLAMATIONMARK$3) {
                            this.scanner.next();
                            continue;
                        }

                        child = this.Comment();
                        break;

                    case CDO$1: // <!--
                        child = this.CDO();
                        break;

                    case CDC$1: // -->
                        child = this.CDC();
                        break;

                    // CSS Syntax Module Level 3
                    // §2.2 Error handling
                    // At the "top level" of a stylesheet, an <at-keyword-token> starts an at-rule.
                    case ATKEYWORD$2:
                        child = this.parseWithFallback(this.Atrule, consumeRaw$4);
                        break;

                    // Anything else starts a qualified rule ...
                    default:
                        child = this.parseWithFallback(this.Rule, consumeRaw$4);
                }

                children.push(child);
            }

            return {
                type: 'StyleSheet',
                loc: this.getLocation(start, this.scanner.tokenStart),
                children: children
            };
        },
        generate: function(node) {
            this.children(node);
        },
        walkContext: 'stylesheet'
    };

    var TYPE$A = tokenizer.TYPE;

    var IDENT$d = TYPE$A.Ident;
    var ASTERISK$4 = 0x002A;     // U+002A ASTERISK (*)
    var VERTICALLINE$2 = 0x007C; // U+007C VERTICAL LINE (|)

    function eatIdentifierOrAsterisk() {
        if (this.scanner.tokenType !== IDENT$d &&
            this.scanner.isDelim(ASTERISK$4) === false) {
            this.error('Identifier or asterisk is expected');
        }

        this.scanner.next();
    }

    // ident
    // ident|ident
    // ident|*
    // *
    // *|ident
    // *|*
    // |ident
    // |*
    var TypeSelector = {
        name: 'TypeSelector',
        structure: {
            name: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;

            if (this.scanner.isDelim(VERTICALLINE$2)) {
                this.scanner.next();
                eatIdentifierOrAsterisk.call(this);
            } else {
                eatIdentifierOrAsterisk.call(this);

                if (this.scanner.isDelim(VERTICALLINE$2)) {
                    this.scanner.next();
                    eatIdentifierOrAsterisk.call(this);
                }
            }

            return {
                type: 'TypeSelector',
                loc: this.getLocation(start, this.scanner.tokenStart),
                name: this.scanner.substrToCursor(start)
            };
        },
        generate: function(node) {
            this.chunk(node.name);
        }
    };

    var isHexDigit$4 = tokenizer.isHexDigit;
    var cmpChar$4 = tokenizer.cmpChar;
    var TYPE$B = tokenizer.TYPE;
    var NAME$3 = tokenizer.NAME;

    var IDENT$e = TYPE$B.Ident;
    var NUMBER$7 = TYPE$B.Number;
    var DIMENSION$5 = TYPE$B.Dimension;
    var PLUSSIGN$6 = 0x002B;     // U+002B PLUS SIGN (+)
    var HYPHENMINUS$4 = 0x002D;  // U+002D HYPHEN-MINUS (-)
    var QUESTIONMARK$2 = 0x003F; // U+003F QUESTION MARK (?)
    var U$1 = 0x0075;            // U+0075 LATIN SMALL LETTER U (u)

    function eatHexSequence(offset, allowDash) {
        for (var pos = this.scanner.tokenStart + offset, len = 0; pos < this.scanner.tokenEnd; pos++) {
            var code = this.scanner.source.charCodeAt(pos);

            if (code === HYPHENMINUS$4 && allowDash && len !== 0) {
                if (eatHexSequence.call(this, offset + len + 1, false) === 0) {
                    this.error();
                }

                return -1;
            }

            if (!isHexDigit$4(code)) {
                this.error(
                    allowDash && len !== 0
                        ? 'HyphenMinus' + (len < 6 ? ' or hex digit' : '') + ' is expected'
                        : (len < 6 ? 'Hex digit is expected' : 'Unexpected input'),
                    pos
                );
            }

            if (++len > 6) {
                this.error('Too many hex digits', pos);
            }    }

        this.scanner.next();
        return len;
    }

    function eatQuestionMarkSequence(max) {
        var count = 0;

        while (this.scanner.isDelim(QUESTIONMARK$2)) {
            if (++count > max) {
                this.error('Too many question marks');
            }

            this.scanner.next();
        }
    }

    function startsWith$1(code) {
        if (this.scanner.source.charCodeAt(this.scanner.tokenStart) !== code) {
            this.error(NAME$3[code] + ' is expected');
        }
    }

    // https://drafts.csswg.org/css-syntax/#urange
    // Informally, the <urange> production has three forms:
    // U+0001
    //      Defines a range consisting of a single code point, in this case the code point "1".
    // U+0001-00ff
    //      Defines a range of codepoints between the first and the second value, in this case
    //      the range between "1" and "ff" (255 in decimal) inclusive.
    // U+00??
    //      Defines a range of codepoints where the "?" characters range over all hex digits,
    //      in this case defining the same as the value U+0000-00ff.
    // In each form, a maximum of 6 digits is allowed for each hexadecimal number (if you treat "?" as a hexadecimal digit).
    //
    // <urange> =
    //   u '+' <ident-token> '?'* |
    //   u <dimension-token> '?'* |
    //   u <number-token> '?'* |
    //   u <number-token> <dimension-token> |
    //   u <number-token> <number-token> |
    //   u '+' '?'+
    function scanUnicodeRange() {
        var hexLength = 0;

        // u '+' <ident-token> '?'*
        // u '+' '?'+
        if (this.scanner.isDelim(PLUSSIGN$6)) {
            this.scanner.next();

            if (this.scanner.tokenType === IDENT$e) {
                hexLength = eatHexSequence.call(this, 0, true);
                if (hexLength > 0) {
                    eatQuestionMarkSequence.call(this, 6 - hexLength);
                }
                return;
            }

            if (this.scanner.isDelim(QUESTIONMARK$2)) {
                this.scanner.next();
                eatQuestionMarkSequence.call(this, 5);
                return;
            }

            this.error('Hex digit or question mark is expected');
            return;
        }

        // u <number-token> '?'*
        // u <number-token> <dimension-token>
        // u <number-token> <number-token>
        if (this.scanner.tokenType === NUMBER$7) {
            startsWith$1.call(this, PLUSSIGN$6);
            hexLength = eatHexSequence.call(this, 1, true);

            if (this.scanner.isDelim(QUESTIONMARK$2)) {
                eatQuestionMarkSequence.call(this, 6 - hexLength);
                return;
            }

            if (this.scanner.tokenType === DIMENSION$5 ||
                this.scanner.tokenType === NUMBER$7) {
                startsWith$1.call(this, HYPHENMINUS$4);
                eatHexSequence.call(this, 1, false);
                return;
            }

            return;
        }

        // u <dimension-token> '?'*
        if (this.scanner.tokenType === DIMENSION$5) {
            startsWith$1.call(this, PLUSSIGN$6);
            hexLength = eatHexSequence.call(this, 1, true);

            if (hexLength > 0) {
                eatQuestionMarkSequence.call(this, 6 - hexLength);
            }

            return;
        }

        this.error();
    }

    var UnicodeRange = {
        name: 'UnicodeRange',
        structure: {
            value: String
        },
        parse: function() {
            var start = this.scanner.tokenStart;

            // U or u
            if (!cmpChar$4(this.scanner.source, start, U$1)) {
                this.error('U is expected');
            }

            if (!cmpChar$4(this.scanner.source, start + 1, PLUSSIGN$6)) {
                this.error('Plus sign is expected');
            }

            this.scanner.next();
            scanUnicodeRange.call(this);

            return {
                type: 'UnicodeRange',
                loc: this.getLocation(start, this.scanner.tokenStart),
                value: this.scanner.substrToCursor(start)
            };
        },
        generate: function(node) {
            this.chunk(node.value);
        }
    };

    var isWhiteSpace$2 = tokenizer.isWhiteSpace;
    var cmpStr$4 = tokenizer.cmpStr;
    var TYPE$C = tokenizer.TYPE;

    var FUNCTION$3 = TYPE$C.Function;
    var URL$1 = TYPE$C.Url;
    var RIGHTPARENTHESIS$7 = TYPE$C.RightParenthesis;

    // <url-token> | <function-token> <string> )
    var Url = {
        name: 'Url',
        structure: {
            value: ['String', 'Raw']
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var value;

            switch (this.scanner.tokenType) {
                case URL$1:
                    var rawStart = start + 4;
                    var rawEnd = this.scanner.tokenEnd - 1;

                    while (rawStart < rawEnd && isWhiteSpace$2(this.scanner.source.charCodeAt(rawStart))) {
                        rawStart++;
                    }

                    while (rawStart < rawEnd && isWhiteSpace$2(this.scanner.source.charCodeAt(rawEnd - 1))) {
                        rawEnd--;
                    }

                    value = {
                        type: 'Raw',
                        loc: this.getLocation(rawStart, rawEnd),
                        value: this.scanner.source.substring(rawStart, rawEnd)
                    };

                    this.eat(URL$1);
                    break;

                case FUNCTION$3:
                    if (!cmpStr$4(this.scanner.source, this.scanner.tokenStart, this.scanner.tokenEnd, 'url(')) {
                        this.error('Function name must be `url`');
                    }

                    this.eat(FUNCTION$3);
                    this.scanner.skipSC();
                    value = this.String();
                    this.scanner.skipSC();
                    this.eat(RIGHTPARENTHESIS$7);
                    break;

                default:
                    this.error('Url or Function is expected');
            }

            return {
                type: 'Url',
                loc: this.getLocation(start, this.scanner.tokenStart),
                value: value
            };
        },
        generate: function(node) {
            this.chunk('url');
            this.chunk('(');
            this.node(node.value);
            this.chunk(')');
        }
    };

    var Value = {
        name: 'Value',
        structure: {
            children: [[]]
        },
        parse: function() {
            var start = this.scanner.tokenStart;
            var children = this.readSequence(this.scope.Value);

            return {
                type: 'Value',
                loc: this.getLocation(start, this.scanner.tokenStart),
                children: children
            };
        },
        generate: function(node) {
            this.children(node);
        }
    };

    var WHITESPACE$9 = tokenizer.TYPE.WhiteSpace;
    var SPACE$2 = Object.freeze({
        type: 'WhiteSpace',
        loc: null,
        value: ' '
    });

    var WhiteSpace$1 = {
        name: 'WhiteSpace',
        structure: {
            value: String
        },
        parse: function() {
            this.eat(WHITESPACE$9);
            return SPACE$2;

            // return {
            //     type: 'WhiteSpace',
            //     loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
            //     value: this.consume(WHITESPACE)
            // };
        },
        generate: function(node) {
            this.chunk(node.value);
        }
    };

    var node = {
        AnPlusB: AnPlusB,
        Atrule: Atrule,
        AtrulePrelude: AtrulePrelude,
        AttributeSelector: AttributeSelector,
        Block: Block,
        Brackets: Brackets,
        CDC: CDC_1,
        CDO: CDO_1,
        ClassSelector: ClassSelector,
        Combinator: Combinator,
        Comment: Comment,
        Declaration: Declaration,
        DeclarationList: DeclarationList,
        Dimension: Dimension,
        Function: _Function,
        HexColor: HexColor,
        Identifier: Identifier,
        IdSelector: IdSelector,
        MediaFeature: MediaFeature,
        MediaQuery: MediaQuery,
        MediaQueryList: MediaQueryList,
        Nth: Nth,
        Number: _Number,
        Operator: Operator,
        Parentheses: Parentheses,
        Percentage: Percentage,
        PseudoClassSelector: PseudoClassSelector,
        PseudoElementSelector: PseudoElementSelector,
        Ratio: Ratio,
        Raw: Raw,
        Rule: Rule,
        Selector: Selector,
        SelectorList: SelectorList,
        String: _String,
        StyleSheet: StyleSheet,
        TypeSelector: TypeSelector,
        UnicodeRange: UnicodeRange,
        Url: Url,
        Value: Value,
        WhiteSpace: WhiteSpace$1
    };

    var data = getCjsExportFromNamespace(defaultSyntax$1);

    var lexer = {
        generic: true,
        types: data.types,
        atrules: data.atrules,
        properties: data.properties,
        node: node
    };

    var cmpChar$5 = tokenizer.cmpChar;
    var cmpStr$5 = tokenizer.cmpStr;
    var TYPE$D = tokenizer.TYPE;

    var IDENT$f = TYPE$D.Ident;
    var STRING$2 = TYPE$D.String;
    var NUMBER$8 = TYPE$D.Number;
    var FUNCTION$4 = TYPE$D.Function;
    var URL$2 = TYPE$D.Url;
    var HASH$4 = TYPE$D.Hash;
    var DIMENSION$6 = TYPE$D.Dimension;
    var PERCENTAGE$2 = TYPE$D.Percentage;
    var LEFTPARENTHESIS$5 = TYPE$D.LeftParenthesis;
    var LEFTSQUAREBRACKET$3 = TYPE$D.LeftSquareBracket;
    var COMMA$3 = TYPE$D.Comma;
    var DELIM$5 = TYPE$D.Delim;
    var NUMBERSIGN$3 = 0x0023;  // U+0023 NUMBER SIGN (#)
    var ASTERISK$5 = 0x002A;    // U+002A ASTERISK (*)
    var PLUSSIGN$7 = 0x002B;    // U+002B PLUS SIGN (+)
    var HYPHENMINUS$5 = 0x002D; // U+002D HYPHEN-MINUS (-)
    var SOLIDUS$4 = 0x002F;     // U+002F SOLIDUS (/)
    var U$2 = 0x0075;           // U+0075 LATIN SMALL LETTER U (u)

    var _default = function defaultRecognizer(context) {
        switch (this.scanner.tokenType) {
            case HASH$4:
                return this.HexColor();

            case COMMA$3:
                context.space = null;
                context.ignoreWSAfter = true;
                return this.Operator();

            case LEFTPARENTHESIS$5:
                return this.Parentheses(this.readSequence, context.recognizer);

            case LEFTSQUAREBRACKET$3:
                return this.Brackets(this.readSequence, context.recognizer);

            case STRING$2:
                return this.String();

            case DIMENSION$6:
                return this.Dimension();

            case PERCENTAGE$2:
                return this.Percentage();

            case NUMBER$8:
                return this.Number();

            case FUNCTION$4:
                return cmpStr$5(this.scanner.source, this.scanner.tokenStart, this.scanner.tokenEnd, 'url(')
                    ? this.Url()
                    : this.Function(this.readSequence, context.recognizer);

            case URL$2:
                return this.Url();

            case IDENT$f:
                // check for unicode range, it should start with u+ or U+
                if (cmpChar$5(this.scanner.source, this.scanner.tokenStart, U$2) &&
                    cmpChar$5(this.scanner.source, this.scanner.tokenStart + 1, PLUSSIGN$7)) {
                    return this.UnicodeRange();
                } else {
                    return this.Identifier();
                }

            case DELIM$5:
                var code = this.scanner.source.charCodeAt(this.scanner.tokenStart);

                if (code === SOLIDUS$4 ||
                    code === ASTERISK$5 ||
                    code === PLUSSIGN$7 ||
                    code === HYPHENMINUS$5) {
                    return this.Operator(); // TODO: replace with Delim
                }

                // TODO: produce a node with Delim node type

                if (code === NUMBERSIGN$3) {
                    this.error('Hex or identifier is expected', this.scanner.tokenStart + 1);
                }

                break;
        }
    };

    var atrulePrelude = {
        getNode: _default
    };

    var TYPE$E = tokenizer.TYPE;

    var DELIM$6 = TYPE$E.Delim;
    var IDENT$g = TYPE$E.Ident;
    var DIMENSION$7 = TYPE$E.Dimension;
    var PERCENTAGE$3 = TYPE$E.Percentage;
    var NUMBER$9 = TYPE$E.Number;
    var HASH$5 = TYPE$E.Hash;
    var COLON$5 = TYPE$E.Colon;
    var LEFTSQUAREBRACKET$4 = TYPE$E.LeftSquareBracket;
    var NUMBERSIGN$4 = 0x0023;      // U+0023 NUMBER SIGN (#)
    var ASTERISK$6 = 0x002A;        // U+002A ASTERISK (*)
    var PLUSSIGN$8 = 0x002B;        // U+002B PLUS SIGN (+)
    var SOLIDUS$5 = 0x002F;         // U+002F SOLIDUS (/)
    var FULLSTOP$2 = 0x002E;        // U+002E FULL STOP (.)
    var GREATERTHANSIGN$2 = 0x003E; // U+003E GREATER-THAN SIGN (>)
    var VERTICALLINE$3 = 0x007C;    // U+007C VERTICAL LINE (|)
    var TILDE$2 = 0x007E;           // U+007E TILDE (~)

    function getNode(context) {
        switch (this.scanner.tokenType) {
            case LEFTSQUAREBRACKET$4:
                return this.AttributeSelector();

            case HASH$5:
                return this.IdSelector();

            case COLON$5:
                if (this.scanner.lookupType(1) === COLON$5) {
                    return this.PseudoElementSelector();
                } else {
                    return this.PseudoClassSelector();
                }

            case IDENT$g:
                return this.TypeSelector();

            case NUMBER$9:
            case PERCENTAGE$3:
                return this.Percentage();

            case DIMENSION$7:
                // throws when .123ident
                if (this.scanner.source.charCodeAt(this.scanner.tokenStart) === FULLSTOP$2) {
                    this.error('Identifier is expected', this.scanner.tokenStart + 1);
                }
                break;

            case DELIM$6:
                var code = this.scanner.source.charCodeAt(this.scanner.tokenStart);

                switch (code) {
                    case PLUSSIGN$8:
                    case GREATERTHANSIGN$2:
                    case TILDE$2:
                        context.space = null;
                        context.ignoreWSAfter = true;
                        return this.Combinator();

                    case SOLIDUS$5:  // /deep/
                        return this.Combinator();

                    case FULLSTOP$2:
                        return this.ClassSelector();

                    case ASTERISK$6:
                    case VERTICALLINE$3:
                        return this.TypeSelector();

                    case NUMBERSIGN$4:
                        return this.IdSelector();
                }

                break;
        }
    }
    var selector = {
        getNode: getNode
    };

    // https://drafts.csswg.org/css-images-4/#element-notation
    // https://developer.mozilla.org/en-US/docs/Web/CSS/element
    var element = function() {
        this.scanner.skipSC();

        var children = this.createSingleNodeList(
            this.IdSelector()
        );

        this.scanner.skipSC();

        return children;
    };

    // legacy IE function
    // expression( <any-value> )
    var expression = function() {
        return this.createSingleNodeList(
            this.Raw(this.scanner.tokenIndex, null, false)
        );
    };

    var TYPE$F = tokenizer.TYPE;
    var rawMode$5 = Raw.mode;

    var COMMA$4 = TYPE$F.Comma;

    // var( <ident> , <value>? )
    var _var = function() {
        var children = this.createList();

        this.scanner.skipSC();

        // NOTE: Don't check more than a first argument is an ident, rest checks are for lexer
        children.push(this.Identifier());

        this.scanner.skipSC();

        if (this.scanner.tokenType === COMMA$4) {
            children.push(this.Operator());
            children.push(this.parseCustomProperty
                ? this.Value(null)
                : this.Raw(this.scanner.tokenIndex, rawMode$5.exclamationMarkOrSemicolon, false)
            );
        }

        return children;
    };

    var value = {
        getNode: _default,
        '-moz-element': element,
        'element': element,
        'expression': expression,
        'var': _var
    };

    var scope = {
        AtrulePrelude: atrulePrelude,
        Selector: selector,
        Value: value
    };

    var fontFace = {
        parse: {
            prelude: null,
            block: function() {
                return this.Block(true);
            }
        }
    };

    var TYPE$G = tokenizer.TYPE;

    var STRING$3 = TYPE$G.String;
    var IDENT$h = TYPE$G.Ident;
    var URL$3 = TYPE$G.Url;
    var FUNCTION$5 = TYPE$G.Function;
    var LEFTPARENTHESIS$6 = TYPE$G.LeftParenthesis;

    var _import = {
        parse: {
            prelude: function() {
                var children = this.createList();

                this.scanner.skipSC();

                switch (this.scanner.tokenType) {
                    case STRING$3:
                        children.push(this.String());
                        break;

                    case URL$3:
                    case FUNCTION$5:
                        children.push(this.Url());
                        break;

                    default:
                        this.error('String or url() is expected');
                }

                if (this.lookupNonWSType(0) === IDENT$h ||
                    this.lookupNonWSType(0) === LEFTPARENTHESIS$6) {
                    children.push(this.WhiteSpace());
                    children.push(this.MediaQueryList());
                }

                return children;
            },
            block: null
        }
    };

    var media = {
        parse: {
            prelude: function() {
                return this.createSingleNodeList(
                    this.MediaQueryList()
                );
            },
            block: function() {
                return this.Block(false);
            }
        }
    };

    var page = {
        parse: {
            prelude: function() {
                return this.createSingleNodeList(
                    this.SelectorList()
                );
            },
            block: function() {
                return this.Block(true);
            }
        }
    };

    var TYPE$H = tokenizer.TYPE;

    var WHITESPACE$a = TYPE$H.WhiteSpace;
    var COMMENT$9 = TYPE$H.Comment;
    var IDENT$i = TYPE$H.Ident;
    var FUNCTION$6 = TYPE$H.Function;
    var COLON$6 = TYPE$H.Colon;
    var LEFTPARENTHESIS$7 = TYPE$H.LeftParenthesis;

    function consumeRaw$5() {
        return this.createSingleNodeList(
            this.Raw(this.scanner.tokenIndex, null, false)
        );
    }

    function parentheses() {
        this.scanner.skipSC();

        if (this.scanner.tokenType === IDENT$i &&
            this.lookupNonWSType(1) === COLON$6) {
            return this.createSingleNodeList(
                this.Declaration()
            );
        }

        return readSequence.call(this);
    }

    function readSequence() {
        var children = this.createList();
        var space = null;
        var child;

        this.scanner.skipSC();

        scan:
        while (!this.scanner.eof) {
            switch (this.scanner.tokenType) {
                case WHITESPACE$a:
                    space = this.WhiteSpace();
                    continue;

                case COMMENT$9:
                    this.scanner.next();
                    continue;

                case FUNCTION$6:
                    child = this.Function(consumeRaw$5, this.scope.AtrulePrelude);
                    break;

                case IDENT$i:
                    child = this.Identifier();
                    break;

                case LEFTPARENTHESIS$7:
                    child = this.Parentheses(parentheses, this.scope.AtrulePrelude);
                    break;

                default:
                    break scan;
            }

            if (space !== null) {
                children.push(space);
                space = null;
            }

            children.push(child);
        }

        return children;
    }

    var supports = {
        parse: {
            prelude: function() {
                var children = readSequence.call(this);

                if (this.getFirstListNode(children) === null) {
                    this.error('Condition is expected');
                }

                return children;
            },
            block: function() {
                return this.Block(false);
            }
        }
    };

    var atrule = {
        'font-face': fontFace,
        'import': _import,
        'media': media,
        'page': page,
        'supports': supports
    };

    var dir = {
        parse: function() {
            return this.createSingleNodeList(
                this.Identifier()
            );
        }
    };

    var has$1 = {
        parse: function() {
            return this.createSingleNodeList(
                this.SelectorList()
            );
        }
    };

    var lang = {
        parse: function() {
            return this.createSingleNodeList(
                this.Identifier()
            );
        }
    };

    var selectorList = {
        parse: function selectorList() {
            return this.createSingleNodeList(
                this.SelectorList()
            );
        }
    };

    var matches = selectorList;

    var not = selectorList;

    var ALLOW_OF_CLAUSE = true;

    var nthWithOfClause = {
        parse: function nthWithOfClause() {
            return this.createSingleNodeList(
                this.Nth(ALLOW_OF_CLAUSE)
            );
        }
    };

    var nthChild = nthWithOfClause;

    var nthLastChild = nthWithOfClause;

    var DISALLOW_OF_CLAUSE = false;

    var nth = {
        parse: function nth() {
            return this.createSingleNodeList(
                this.Nth(DISALLOW_OF_CLAUSE)
            );
        }
    };

    var nthLastOfType = nth;

    var nthOfType = nth;

    var slotted = {
        parse: function compoundSelector() {
            return this.createSingleNodeList(
                this.Selector()
            );
        }
    };

    var pseudo = {
        'dir': dir,
        'has': has$1,
        'lang': lang,
        'matches': matches,
        'not': not,
        'nth-child': nthChild,
        'nth-last-child': nthLastChild,
        'nth-last-of-type': nthLastOfType,
        'nth-of-type': nthOfType,
        'slotted': slotted
    };

    var parser = {
        parseContext: {
            default: 'StyleSheet',
            stylesheet: 'StyleSheet',
            atrule: 'Atrule',
            atrulePrelude: function(options) {
                return this.AtrulePrelude(options.atrule ? String(options.atrule) : null);
            },
            mediaQueryList: 'MediaQueryList',
            mediaQuery: 'MediaQuery',
            rule: 'Rule',
            selectorList: 'SelectorList',
            selector: 'Selector',
            block: function() {
                return this.Block(true);
            },
            declarationList: 'DeclarationList',
            declaration: 'Declaration',
            value: 'Value'
        },
        scope: scope,
        atrule: atrule,
        pseudo: pseudo,
        node: node
    };

    var walker = {
        node: node
    };

    function merge() {
        var dest = {};

        for (var i = 0; i < arguments.length; i++) {
            var src = arguments[i];
            for (var key in src) {
                dest[key] = src[key];
            }
        }

        return dest;
    }

    var syntax = create$4.create(
        merge(
            lexer,
            parser,
            walker
        )
    );

    var lib = syntax;

    return lib;

}));

return module.exports;
}).call(this);

const plugins = exports.plugins = (function(){
var exports = {};
var module = { exports: exports };
module.exports = []
return module.exports;
}).call(this);
},{}],2:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=_default;var _modelLibs=require("./model-libs.js");function _toConsumableArray(arr){return _arrayWithoutHoles(arr)||_iterableToArray(arr)||_unsupportedIterableToArray(arr)||_nonIterableSpread();}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _iterableToArray(iter){if(typeof Symbol!=="undefined"&&Symbol.iterator in Object(iter))return Array.from(iter);}function _arrayWithoutHoles(arr){if(Array.isArray(arr))return _arrayLikeToArray(arr);}function _createForOfIteratorHelper(o,allowArrayLike){var it;if(typeof Symbol==="undefined"||o[Symbol.iterator]==null){if(Array.isArray(o)||(it=_unsupportedIterableToArray(o))||allowArrayLike&&o&&typeof o.length==="number"){if(it)o=it;var i=0;var F=function F(){};return{s:F,n:function n(){if(i>=o.length)return{done:true};return{done:false,value:o[i++]};},e:function e(_e){throw _e;},f:F};}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion=true,didErr=false,err;return{s:function s(){it=o[Symbol.iterator]();},n:function n(){var step=it.next();normalCompletion=step.done;return step;},e:function e(_e2){didErr=true;err=_e2;},f:function f(){try{if(!normalCompletion&&it["return"]!=null)it["return"]();}finally{if(didErr)throw err;}}};}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen);}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i];}return arr2;}function _default(discovery){function generateColor(value){return'hsl('+String(value).split('').reduce(function(r,c){return r+r^c.charCodeAt(0);},0)+', 50%, 85%)';}function parseProdSyntax(entry){entry.definitionSyntax={syntax:null,error:null};try{entry.definitionSyntax.syntax=_modelLibs.csstree.definitionSyntax.parse(entry.value);}catch(e){entry.definitionSyntax.error=e.message;}}function parseDefSyntax(entry,key){if(entry.props[key]){if(!entry.definitionSyntax){entry.definitionSyntax={};}var res=entry.definitionSyntax[key]={syntax:null,error:null};try{res.syntax=_modelLibs.csstree.definitionSyntax.parse(entry.props[key]);}catch(e){res.error=e.message;}}}discovery.setPrepare(function(data,_ref){var defineObjectMarker=_ref.defineObjectMarker,addQueryHelpers=_ref.addQueryHelpers;var colorMap=new Map([['FPWD','#ffbdbd'],['WD','#ffcb88'],['ED','#ffcb88'],['LC','#fde66e'],['CR','#e6ea37'],['PR','#c8e62b'],['REC','#a2d278']]);var specIndex=new Map();var specMarker=defineObjectMarker('spec',{lookupRefs:['id'],ref:'id',title:function title(value){return value.props.title;},page:'spec'});var _iterator=_createForOfIteratorHelper(data.specs),_step;try{for(_iterator.s();!(_step=_iterator.n()).done;){var spec=_step.value;specIndex.set(spec.id,spec);specMarker(spec);}}catch(err){_iterator.e(err);}finally{_iterator.f();}var defMarker=defineObjectMarker('def',{refs:['props'],lookupRefs:['id','props'],ref:'id',title:function title(value){return value.props.name;},page:'def'});data.defs.forEach(function(item){item.source.spec=specIndex.get(item.source.spec);item.id=item.source.spec.id+'/'+item.type+'/'+item.props.name;parseDefSyntax(item,'value');parseDefSyntax(item,'newValues');defMarker(item);});var prodMarker=defineObjectMarker('prod',{ref:'id',title:function title(value){return'<'+value.name+'>';},page:'prod'});data.prods.forEach(function(item){item.source.spec=specIndex.get(item.source.spec);item.id=item.source.spec.id+'/prod/'+item.name;parseProdSyntax(item,'value');prodMarker(item);});data.idls.forEach(function(item){item.source.spec=specIndex.get(item.source.spec);});data.genericProds=["ident-token","function-token","at-keyword-token","hash-token","string-token","bad-string-token","url-token","bad-url-token","delim-token","number-token","percentage-token","dimension-token","whitespace-token","CDO-token","CDC-token","colon-token","semicolon-token","comma-token","[-token","]-token","(-token",")-token","{-token","}-token","string","ident","custom-ident","custom-property-name","hex-color","id-selector","an-plus-b","urange","declaration-value","any-value","dimension","angle","decibel","frequency","flex","length","resolution","semitones","time","percentage","zero","number","integer"];addQueryHelpers({isArray:function isArray(value){return Array.isArray(value);},color:function color(value){return colorMap.has(value)?colorMap.get(value):generateColor(value);},syntaxChildren:function syntaxChildren(current){var children=[];if(current){if(current.term){children.push(current.term);}if(current.terms){children.push.apply(children,_toConsumableArray(current.terms));}}return children;}});});}

},{"./model-libs.js":1}],3:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=_default;var _modelLibs=require("./model-libs.js");function _default(discovery){!function(module,exports){discovery.page.define('default',['h1:#.name',{view:'h5',content:['text:"Source: "','link:{ href: source.home, text: "w3c/csswg-drafts" }','text:" commit " + source.commitShort + " on  " + source.commitDate']},{view:'context',data:[{title:'Specs',query:'specs.sort(<props.title>)'},{title:'IDL sections',query:'idls'},{title:'Definitions',query:'defs'},{title:'Productions',query:'prods'},{title:'Problem syntaxes',query:'defs.[definitionSyntax.value.error or definitionSyntax.newValues.error] +\nprods.[definitionSyntax.error]'}],content:{view:'inline-list',item:'indicator',data:".({\n                label: title,\n                value: query.query(#.data, #).size(),\n                href: href or pageLink('report', { title, query, view })\n            })"}},'html:"<br><br>"',{view:'ul',item:'link:{ text: title, href: pageLink("report", { ..., noedit: true }) }',data:[{title:'Specs and statuses',query:'specs.sort(<props.title>)',view:'{\n    view: \'ol\',\n    limit: false,\n    item: [\n        \'auto-link\',\n        \'badge:{ text: props.status or "?", color: props.status.color() }\'\n    ]\n}'},{title:'Problem syntaxes',query:'(defs + prods)\n.group(<definitionSyntax.error or definitionSyntax.value.error>).[key]\n',view:'{\n    view: \'list\',\n    item: {\n        view: \'expand\',\n        expanded: true,\n        title: \'pre:key\',\n        content: {\n            view: \'list\',\n            data: \'value\',\n            item: \'def\'\n        }\n    }\n}'},{title:'Missed productions',query:'$knownProds: prods.name + genericProds;\n\n(defs.definitionSyntax.value.syntax + prods.definitionSyntax.syntax)\n..(syntaxChildren()).[type="Type" and name not in $knownProds].name',view:'{\n    view: \'ol\',\n    limit: false,\n    item: \'text:"<"+$+">"\'\n}'},{title:'IDL sections by spec',query:'idls.group(<source.spec>).sort(<key.props.title>)',view:'{\n    view: \'list\',\n    item: [\n        \'h1:key.props.title\',\n        {\n            view: \'list\',\n            data: \'value\',\n            item: {\n                view: \'definition\',\n                content: \'source:{content}\'\n            }\n        }\n    ]\n}'}]}]);}.call(this);!function(module,exports){var definitionConfig={view:'definition',content:{view:'key-value',data:'props',value:{view:'switch',content:[{when:'key in ["value", "newValues"]',content:'syntax:value'},{content:'pre:value'}]}}};discovery.page.define('def',{view:'context',data:'defs.pick(<id = #.id>)',content:["badge:{\n            text: source.spec.props.title,\n            href: source.spec.id.pageLink(\"spec\"),\n            color: \"#fae2ec\"\n        }",'h1:props.name',definitionConfig,{view:'context',data:'#.data.defs.[props.name = @.props.name and $ != @]',whenData:true,content:['h2:"Also defined in:"',{view:'list',item:definitionConfig}]}]});}.call(this);!function(module,exports){discovery.page.define('defs',{view:'context',data:'(defs + prods).[name = #.id]',content:['h1:props.name',{view:'list',item:{view:'definition',content:[{view:'key-value',when:'props',data:'props',value:{view:'switch',content:[{when:'key in ["value", "newValues"]',content:'syntax:value'},{content:'pre:value'}]}},{view:'syntax',when:'type="prod"',data:'value'}]}}]});}.call(this);!function(module,exports){discovery.page.define('prod',{view:'context',data:'prods.pick(<id = #.id>)',content:["badge:{\n            text: source.spec.props.title,\n            href: source.spec.id.pageLink(\"spec\"),\n            color: \"#fae2ec\"\n        }",'h1:"<" + name + ">"','syntax:value','h5:"Defined in: " + source.spec.file + " on line " + source.line',{view:'context',data:'#.data.prods.[name = @.name and $ != @].source.spec',content:{view:'context',when:'size()',content:['h5:"Also defined in:"',{view:'ul',item:'auto-link'}]}}]});}.call(this);!function(module,exports){discovery.page.define('spec',{view:'context',data:"specs.pick(<id = #.id>).($spec:$;{\n        ...,\n        defs: @.defs.[source.spec = $spec],\n        idls: @.idls.[source.spec = $spec]\n    })",content:['h1:props.title',{view:'definition',content:{view:'key-value',data:'props',limit:10,value:{view:'switch',content:[{when:'key="status"',content:'badge:{ text: value, color: value.color() }'},{when:'key in ["ed", "tr"]',content:{view:'pre',content:'link:{ href: value, external: true }'}},{when:'value.isArray() and value',content:{view:'ul',data:'value',item:'pre'}},{content:'pre:value'}]}}},'h2:"Properties"',{view:'table',when:'defs',data:'defs.props',cols:{el:false,type:false,source:false,id:false,name:'auto-link',value:'syntax:value'}},{view:'context',data:'idls',whenData:true,content:['h2:"Interfaces"',{view:'list',item:{view:'definition',content:'source:{content}'}}]}]});}.call(this);!function(module,exports){discovery.view.define('def',[{view:'block',className:'header',content:['auto-link','badge:{ text: type }']},'spec-location:source']);}.call(this);!function(module,exports){discovery.view.define('definition',function(el,config,data,context){return discovery.view.render(el,[{view:'header',content:['spec-location:source or $',{view:'badge',when:'type',data:'{ text: type, color: "#d0dde4" }'}]}].concat(config.content||[]),data,context);});}.call(this);!function(module,exports){discovery.view.define('github-link',{view:'link',className:'github-link',data:"{\n        external: true,\n        href: #.data.source.home + \"blob/\" + #.data.source.commit + \"/\" + (spec.file or file) + (line ? \"#L\" + line : ''),\n        text: ' ' // spec.file + \":\" + line\n    }"},{tag:false});}.call(this);!function(module,exports){discovery.view.define('key-value-item',function(el,config,data,context){var _config$key=config.key,key=_config$key===void 0?'text:key':_config$key,_config$value=config.value,value=_config$value===void 0?'struct:value':_config$value;var keyEl=el.appendChild(document.createElement('span'));var valueEl=el.appendChild(document.createElement('span'));keyEl.className='view-key-value-item-key';this.render(keyEl,key,data,context);valueEl.className='view-key-value-item-value';this.render(valueEl,value,data,context);});discovery.view.define('key-value',function(el,config,data,context){var itemConfig=config.itemConfig,key=config.key,value=config.value,limit=config.limit;var entries=null;if(Array.isArray(data)){entries=data;}else{entries=[];for(var _key in data){if(hasOwnProperty.call(data,_key)){entries.push({key:_key,value:data[_key]});}}}this.renderList(el,this.composeConfig({view:'key-value-item',key:key,value:value},itemConfig),entries,context,0,discovery.view.listLimit(limit,25));});}.call(this);!function(module,exports){discovery.view.define('pre',function(el,config,data,context){var content=config.content;if(content){this.render(el,content,data,context);}else{el.textContent=data;}},{tag:'span'});}.call(this);!function(module,exports){discovery.view.define('sidebar',{view:'tabs',name:'splitBy',tabs:[{value:'byspec',text:'By spec'},{value:'byentry',text:'Index'}],content:{view:'content-filter',content:[{view:'switch',content:[{when:'#.splitBy="byspec"',content:{view:'list',emptyText:'No matches',data:"\n                                specs\n                                .sort(props.title asc)\n                                .($spec: $;{\n                                    ...,\n                                    defs: @.defs\n                                        .[source.spec = $spec and (no #.filter or name ~= #.filter)]\n                                        .sort(name asc, type desc)\n                                })\n                                .[no #.filter or defs.size() or (#.filter and props.title ~= #.filter)]\n                            ",item:{view:'toc-section',className:function className(data){return!data.defs.length?'empty':'';},header:[{view:'auto-link',content:'text-match:{ text, match: #.filter }'},{view:'pill-badge',when:'defs',data:'{ text: defs.size() }'}],content:{view:'list',emptyText:false,data:'defs',item:[{view:'auto-link',content:'text-match:{ text, match: #.filter }'},'badge:{ text: type, color: "#d8e1f3" }']}}}},{when:'#.splitBy="byentry"',content:{view:'list',limit:100,data:"\n                                (defs + prods)\n                                    .[no #.filter or name ~= #.filter]\n                                    .group(=>name)\n                                    .({\n                                        id: key,\n                                        type: value.type,\n                                        name: value.name[],\n                                        count: value.size()\n                                    })\n                                    .sort(name asc)\n                            ",item:[{view:'link',data:"{\n                                        text: name,\n                                        href: name.pageLink(\"defs\"),\n                                        match: #.filter\n                                    }",content:'text-match'},{view:'pill-badge',when:'count > 1',data:'{ text: count }'},{view:'inline-list',data:'type',item:'badge:{ text: $, color: "#d8e1f3" }'}]}}]}]}},{tag:false});}.call(this);!function(module,exports){discovery.view.define('spec-location',[{view:'auto-link',data:'spec',whenData:'$ and (#.page != "spec" or id != #.id)'},'github-link']);}.call(this);!function(module,exports){function escapeHtml(str){return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}function markupSyntax(syntax,dict,match){return _modelLibs.csstree.definitionSyntax.generate(syntax,function(str,node){if(node.type==='Type'||node.type==='Property'){var entityDescriptor=node.type==='Type'?dict.prods.find(function(e){return e.name===node.name;}):dict.defs.find(function(e){return e.props.name===node.name;});var error=!entityDescriptor&&dict.genericProds.indexOf(node.name)===-1;var href=entityDescriptor?node.type==='Type'?"#prod:".concat(entityDescriptor.id):"#defs:".concat(entityDescriptor.name):false;str="<a".concat(href?" href=\"".concat(href,"\""):'').concat(error?' class="error"':'',">").concat(escapeHtml(str),"</a>");}if(match&&match.type===node.type&&match.name===node.name){str="<span class=\"match\">".concat(str,"</span>");}return str;});}discovery.view.define('syntax',function(el,config,data,context){var _ref=data||{},type=_ref.type,match=_ref.match,matchType=_ref.matchType,matchName=_ref.matchName;var _ref2=data||{},syntax=_ref2.syntax;var syntaxHtml='';if(typeof data==='string'){syntax=data;}if(syntax){if(typeof syntax==='string'){try{syntax=_modelLibs.csstree.definitionSyntax.parse(syntax);}catch(e){el.textContent=e.message;el.classList.add('parse-error');return;}}syntaxHtml=markupSyntax(syntax,context.data,{type:matchType,name:matchName});}else if(match){syntaxHtml='generic';}el.innerHTML=syntaxHtml;},{tag:'span'});}.call(this);}

},{"./model-libs.js":1}],4:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _default={name:"Implicit config",mode:function __DISCOVERY_MODE_PLACEHOLDER__(){return"single";}(),isolateStyles:null,data:JSON.parse(function __DISCOVERY_DATA_PLACEHOLDER__(){return"\"data.json\"";}()),model:function __DISCOVERY_SETUP_MODEL_PLACEHOLDER__(){return{"name":"CSSWG drafts index","slug":"default","cache":false,"download":"/gen/build.zip","meta":null};}()};exports["default"]=_default;

},{}],5:[function(require,module,exports){
"use strict";var _lib=require("../lib.js");var _setup=_interopRequireDefault(require("./gen/setup.js"));var _modelLibs=require("./gen/model-libs.js");var _modelView=_interopRequireDefault(require("./gen/model-view.js"));var _modelPrepare=_interopRequireDefault(require("./gen/model-prepare.js"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj};}function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable;});keys.push.apply(keys,symbols);}return keys;}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){_defineProperty(target,key,source[key]);});}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source));}else{ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}}return target;}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}var app=new _lib.App(document.body,_objectSpread({isolateStyleMarker:_setup["default"].isolateStyles,mode:_setup["default"].mode,setup:_setup["default"]},_setup["default"].model?{cache:_setup["default"].model.cache}:{}));app.apply(_modelLibs.plugins);app.apply(_modelView["default"]);app.apply(_modelPrepare["default"]);if(_setup["default"].data){app.loadDataFromUrl(_setup["default"].data,'data');}else{app.renderPage();}

},{"../lib.js":6,"./gen/model-libs.js":1,"./gen/model-prepare.js":2,"./gen/model-view.js":3,"./gen/setup.js":4}],6:[function(require,module,exports){
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).discovery=e()}}((function(){return function e(t,n,r){function i(a,s){if(!n[a]){if(!t[a]){var l="function"==typeof require&&require;if(!s&&l)return l(a,!0);if(o)return o(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var c=n[a]={exports:{}};t[a][0].call(c.exports,(function(e){return i(t[a][1][e]||e)}),c,c.exports,e,t,n,r)}return n[a].exports}for(var o="function"==typeof require&&require,a=0;a<r.length;a++)i(r[a]);return i}({1:[function(e,t,n){t=void 0;var r,i=function(){const e=arguments[arguments.length-1];r=e(),i=void 0};i.amd=!0,function(e,r){"object"==typeof n&&void 0!==t?t.exports=r():"function"==typeof i&&i.amd?i(r):(e="undefined"!=typeof globalThis?globalThis:e||self).jsonExt=r()}(this,(function(){"use strict";function e(e){return"function"==typeof e.pipe&&"function"==typeof e._read&&"object"==typeof e._readableState&&null!==e._readableState}var t={escapableCharCodeSubstitution:{8:"\\b",9:"\\t",10:"\\n",12:"\\f",13:"\\r",34:'\\"',92:"\\\\"},isLeadingSurrogate:function(e){return e>=55296&&e<=56319},isTrailingSurrogate:function(e){return e>=56320&&e<=57343},type:{PRIMITIVE:1,PROMISE:4,ARRAY:3,OBJECT:2,STRING_STREAM:5,OBJECT_STREAM:6},isReadableStream:e,replaceValue:function(e,t,n,r){switch(n&&"function"==typeof n.toJSON&&(n=n.toJSON()),null!==r&&(n=r.call(e,String(t),n)),typeof n){case"function":case"symbol":n=void 0;break;case"object":if(null!==n){const e=n.constructor;e!==String&&e!==Number&&e!==Boolean||(n=n.valueOf())}}return n},getTypeNative:function(e){return null===e||"object"!=typeof e?1:Array.isArray(e)?3:2},getTypeAsync:function(t){return null===t||"object"!=typeof t?1:"function"==typeof t.then?4:e(t)?t._readableState.objectMode?6:5:Array.isArray(t)?3:2},normalizeReplacer:function(e){if("function"==typeof e)return e;if(Array.isArray(e)){const t=new Set(e.map((e=>"string"==typeof e||"number"==typeof e?String(e):null)).filter((e=>"string"==typeof e)));return t.add(""),(e,n)=>t.has(e)?n:void 0}return null},normalizeSpace:function(e){return"number"==typeof e?!(!Number.isFinite(e)||e<1)&&" ".repeat(Math.min(e,10)):"string"==typeof e&&e.slice(0,10)||!1}};const{normalizeReplacer:n,normalizeSpace:r,replaceValue:i,getTypeNative:o,getTypeAsync:a,isLeadingSurrogate:s,isTrailingSurrogate:l,escapableCharCodeSubstitution:u,type:{PRIMITIVE:c,OBJECT:f,ARRAY:d,PROMISE:p,STRING_STREAM:h,OBJECT_STREAM:g}}=t,v=Array.from({length:2048}).map(((e,t)=>u.hasOwnProperty(t)?2:t<32?6:t<128?1:2));function m(e){let t=0,n=!1;for(let r=0;r<e.length;r++){const i=e.charCodeAt(r);if(i<2048)t+=v[i];else{if(s(i)){t+=6,n=!0;continue}l(i)?t=n?t-2:t+6:t+=3}n=!1}return t+2}return{stringifyInfo:function(e,t,s,l){t=n(t),s=function(e){return"string"==typeof(e=r(e))?e.length:0}(s),l=l||{};const u=new Map,v=new Set,y=new Set,b=new Set,w=new Set,x=l.async?a:o,k={"":e};let O=!1,j=0;return function e(n,r){if(O)return;r=i(this,n,r,t);let o=x(r);if(o!==c&&v.has(r))return b.add(r),j+=4,void(l.continueOnCircular||(O=!0));switch(o){case c:void 0!==r||Array.isArray(this)?j+=function(e){switch(typeof e){case"string":return m(e);case"number":return Number.isFinite(e)?String(e).length:4;case"boolean":return e?4:5;case"undefined":case"object":return 4;default:throw new TypeError("Do not know how to serialize a "+typeof e)}}(r):this===k&&(j+=9);break;case f:{if(u.has(r)){y.add(r),j+=u.get(r);break}const t=j;let n=0;j+=2,v.add(r);for(const t in r)if(hasOwnProperty.call(r,t)){const i=j;e.call(r,t,r[t]),i!==j&&(j+=m(t)+1,n++)}n>1&&(j+=n-1),v.delete(r),s>0&&n>0&&(j+=(1+(v.size+1)*s+1)*n,j+=1+v.size*s),u.set(r,j-t);break}case d:{if(u.has(r)){y.add(r),j+=u.get(r);break}const t=j;j+=2,v.add(r);for(let t=0;t<r.length;t++)e.call(r,String(t),r[t]);r.length>1&&(j+=r.length-1),v.delete(r),s>0&&r.length>0&&(j+=(1+(v.size+1)*s)*r.length,j+=1+v.size*s),u.set(r,j-t);break}case p:case h:w.add(r);break;case g:j+=2,w.add(r)}}.call(k,"",e),{minLength:isNaN(j)?1/0:j,circular:[...b],duplicate:[...y],async:[...w]}},stringifyStream:"Method is not supported"}})),Object.defineProperty(n,"__esModule",{value:!0}),n.default=r},{}],2:[function(e,t,n){t=void 0;var r,i,o=function(){const e=arguments[arguments.length-1];r=e(),o=void 0};o.amd=!0,function(e,r){"object"==typeof n&&void 0!==t?t.exports=r():"function"==typeof o&&o.amd?o(r):(e=e||self).CodeMirror=r()}(this,(function(){"use strict";var e=navigator.userAgent,t=navigator.platform,n=/gecko\/\d/i.test(e),r=/MSIE \d/.test(e),i=/Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(e),o=/Edge\/(\d+)/.exec(e),a=r||i||o,s=a&&(r?document.documentMode||6:+(o||i)[1]),l=!o&&/WebKit\//.test(e),u=l&&/Qt\/\d+\.\d+/.test(e),c=!o&&/Chrome\//.test(e),f=/Opera\//.test(e),d=/Apple Computer/.test(navigator.vendor),p=/Mac OS X 1\d\D([8-9]|\d\d)\D/.test(e),h=/PhantomJS/.test(e),g=!o&&/AppleWebKit/.test(e)&&/Mobile\/\w+/.test(e),v=/Android/.test(e),m=g||v||/webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(e),y=g||/Mac/.test(t),b=/\bCrOS\b/.test(e),w=/win/i.test(t),x=f&&e.match(/Version\/(\d*\.\d*)/);x&&(x=Number(x[1])),x&&x>=15&&(f=!1,l=!0);var k=y&&(u||f&&(null==x||x<12.11)),O=n||a&&s>=9;function j(e){return new RegExp("(^|\\s)"+e+"(?:$|\\s)\\s*")}var S,C=function(e,t){var n=e.className,r=j(t).exec(n);if(r){var i=n.slice(r.index+r[0].length);e.className=n.slice(0,r.index)+(i?r[1]+i:"")}};function P(e){for(var t=e.childNodes.length;t>0;--t)e.removeChild(e.firstChild);return e}function A(e,t){return P(e).appendChild(t)}function M(e,t,n,r){var i=document.createElement(e);if(n&&(i.className=n),r&&(i.style.cssText=r),"string"==typeof t)i.appendChild(document.createTextNode(t));else if(t)for(var o=0;o<t.length;++o)i.appendChild(t[o]);return i}function _(e,t,n,r){var i=M(e,t,n,r);return i.setAttribute("role","presentation"),i}function T(e,t){if(3==t.nodeType&&(t=t.parentNode),e.contains)return e.contains(t);do{if(11==t.nodeType&&(t=t.host),t==e)return!0}while(t=t.parentNode)}function E(){var e;try{e=document.activeElement}catch(t){e=document.body||null}for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return e}function L(e,t){var n=e.className;j(t).test(n)||(e.className+=(n?" ":"")+t)}function N(e,t){for(var n=e.split(" "),r=0;r<n.length;r++)n[r]&&!j(n[r]).test(t)&&(t+=" "+n[r]);return t}S=document.createRange?function(e,t,n,r){var i=document.createRange();return i.setEnd(r||e,n),i.setStart(e,t),i}:function(e,t,n){var r=document.body.createTextRange();try{r.moveToElementText(e.parentNode)}catch(e){return r}return r.collapse(!0),r.moveEnd("character",n),r.moveStart("character",t),r};var D=function(e){e.select()};function I(e){var t=Array.prototype.slice.call(arguments,1);return function(){return e.apply(null,t)}}function F(e,t,n){for(var r in t||(t={}),e)!e.hasOwnProperty(r)||!1===n&&t.hasOwnProperty(r)||(t[r]=e[r]);return t}function R(e,t,n,r,i){null==t&&-1==(t=e.search(/[^\s\u00a0]/))&&(t=e.length);for(var o=r||0,a=i||0;;){var s=e.indexOf("\t",o);if(s<0||s>=t)return a+(t-o);a+=s-o,a+=n-a%n,o=s+1}}g?D=function(e){e.selectionStart=0,e.selectionEnd=e.value.length}:a&&(D=function(e){try{e.select()}catch(e){}});var $=function(){this.id=null,this.f=null,this.time=0,this.handler=I(this.onTimeout,this)};function H(e,t){for(var n=0;n<e.length;++n)if(e[n]==t)return n;return-1}$.prototype.onTimeout=function(e){e.id=0,e.time<=+new Date?e.f():setTimeout(e.handler,e.time-+new Date)},$.prototype.set=function(e,t){this.f=t;var n=+new Date+e;(!this.id||n<this.time)&&(clearTimeout(this.id),this.id=setTimeout(this.handler,e),this.time=n)};var W={toString:function(){return"CodeMirror.Pass"}},z={scroll:!1},B={origin:"*mouse"},q={origin:"+move"};function V(e,t,n){for(var r=0,i=0;;){var o=e.indexOf("\t",r);-1==o&&(o=e.length);var a=o-r;if(o==e.length||i+a>=t)return r+Math.min(a,t-i);if(i+=o-r,r=o+1,(i+=n-i%n)>=t)return r}}var U=[""];function G(e){for(;U.length<=e;)U.push(K(U)+" ");return U[e]}function K(e){return e[e.length-1]}function J(e,t){for(var n=[],r=0;r<e.length;r++)n[r]=t(e[r],r);return n}function Y(){}function X(e,t){var n;return Object.create?n=Object.create(e):(Y.prototype=e,n=new Y),t&&F(t,n),n}var Z=/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;function Q(e){return/\w/.test(e)||e>""&&(e.toUpperCase()!=e.toLowerCase()||Z.test(e))}function ee(e,t){return t?!!(t.source.indexOf("\\w")>-1&&Q(e))||t.test(e):Q(e)}function te(e){for(var t in e)if(e.hasOwnProperty(t)&&e[t])return!1;return!0}var ne=/[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;function re(e){return e.charCodeAt(0)>=768&&ne.test(e)}function ie(e,t,n){for(;(n<0?t>0:t<e.length)&&re(e.charAt(t));)t+=n;return t}function oe(e,t,n){for(var r=t>n?-1:1;;){if(t==n)return t;var i=(t+n)/2,o=r<0?Math.ceil(i):Math.floor(i);if(o==t)return e(o)?t:n;e(o)?n=o:t=o+r}}var ae=null;function se(e,t,n){var r;ae=null;for(var i=0;i<e.length;++i){var o=e[i];if(o.from<t&&o.to>t)return i;o.to==t&&(o.from!=o.to&&"before"==n?r=i:ae=i),o.from==t&&(o.from!=o.to&&"before"!=n?r=i:ae=i)}return null!=r?r:ae}var le=function(){var e=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,t=/[stwN]/,n=/[LRr]/,r=/[Lb1n]/,i=/[1n]/;function o(e,t,n){this.level=e,this.from=t,this.to=n}return function(a,s){var l="ltr"==s?"L":"R";if(0==a.length||"ltr"==s&&!e.test(a))return!1;for(var u,c=a.length,f=[],d=0;d<c;++d)f.push((u=a.charCodeAt(d))<=247?"bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN".charAt(u):1424<=u&&u<=1524?"R":1536<=u&&u<=1785?"nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111".charAt(u-1536):1774<=u&&u<=2220?"r":8192<=u&&u<=8203?"w":8204==u?"b":"L");for(var p=0,h=l;p<c;++p){var g=f[p];"m"==g?f[p]=h:h=g}for(var v=0,m=l;v<c;++v){var y=f[v];"1"==y&&"r"==m?f[v]="n":n.test(y)&&(m=y,"r"==y&&(f[v]="R"))}for(var b=1,w=f[0];b<c-1;++b){var x=f[b];"+"==x&&"1"==w&&"1"==f[b+1]?f[b]="1":","!=x||w!=f[b+1]||"1"!=w&&"n"!=w||(f[b]=w),w=x}for(var k=0;k<c;++k){var O=f[k];if(","==O)f[k]="N";else if("%"==O){var j=void 0;for(j=k+1;j<c&&"%"==f[j];++j);for(var S=k&&"!"==f[k-1]||j<c&&"1"==f[j]?"1":"N",C=k;C<j;++C)f[C]=S;k=j-1}}for(var P=0,A=l;P<c;++P){var M=f[P];"L"==A&&"1"==M?f[P]="L":n.test(M)&&(A=M)}for(var _=0;_<c;++_)if(t.test(f[_])){var T=void 0;for(T=_+1;T<c&&t.test(f[T]);++T);for(var E="L"==(_?f[_-1]:l),L=E==("L"==(T<c?f[T]:l))?E?"L":"R":l,N=_;N<T;++N)f[N]=L;_=T-1}for(var D,I=[],F=0;F<c;)if(r.test(f[F])){var R=F;for(++F;F<c&&r.test(f[F]);++F);I.push(new o(0,R,F))}else{var $=F,H=I.length,W="rtl"==s?1:0;for(++F;F<c&&"L"!=f[F];++F);for(var z=$;z<F;)if(i.test(f[z])){$<z&&(I.splice(H,0,new o(1,$,z)),H+=W);var B=z;for(++z;z<F&&i.test(f[z]);++z);I.splice(H,0,new o(2,B,z)),H+=W,$=z}else++z;$<F&&I.splice(H,0,new o(1,$,F))}return"ltr"==s&&(1==I[0].level&&(D=a.match(/^\s+/))&&(I[0].from=D[0].length,I.unshift(new o(0,0,D[0].length))),1==K(I).level&&(D=a.match(/\s+$/))&&(K(I).to-=D[0].length,I.push(new o(0,c-D[0].length,c)))),"rtl"==s?I.reverse():I}}();function ue(e,t){var n=e.order;return null==n&&(n=e.order=le(e.text,t)),n}var ce=[],fe=function(e,t,n){if(e.addEventListener)e.addEventListener(t,n,!1);else if(e.attachEvent)e.attachEvent("on"+t,n);else{var r=e._handlers||(e._handlers={});r[t]=(r[t]||ce).concat(n)}};function de(e,t){return e._handlers&&e._handlers[t]||ce}function pe(e,t,n){if(e.removeEventListener)e.removeEventListener(t,n,!1);else if(e.detachEvent)e.detachEvent("on"+t,n);else{var r=e._handlers,i=r&&r[t];if(i){var o=H(i,n);o>-1&&(r[t]=i.slice(0,o).concat(i.slice(o+1)))}}}function he(e,t){var n=de(e,t);if(n.length)for(var r=Array.prototype.slice.call(arguments,2),i=0;i<n.length;++i)n[i].apply(null,r)}function ge(e,t,n){return"string"==typeof t&&(t={type:t,preventDefault:function(){this.defaultPrevented=!0}}),he(e,n||t.type,e,t),xe(t)||t.codemirrorIgnore}function ve(e){var t=e._handlers&&e._handlers.cursorActivity;if(t)for(var n=e.curOp.cursorActivityHandlers||(e.curOp.cursorActivityHandlers=[]),r=0;r<t.length;++r)-1==H(n,t[r])&&n.push(t[r])}function me(e,t){return de(e,t).length>0}function ye(e){e.prototype.on=function(e,t){fe(this,e,t)},e.prototype.off=function(e,t){pe(this,e,t)}}function be(e){e.preventDefault?e.preventDefault():e.returnValue=!1}function we(e){e.stopPropagation?e.stopPropagation():e.cancelBubble=!0}function xe(e){return null!=e.defaultPrevented?e.defaultPrevented:0==e.returnValue}function ke(e){be(e),we(e)}function Oe(e){return e.target||e.srcElement}function je(e){var t=e.which;return null==t&&(1&e.button?t=1:2&e.button?t=3:4&e.button&&(t=2)),y&&e.ctrlKey&&1==t&&(t=3),t}var Se,Ce,Pe=function(){if(a&&s<9)return!1;var e=M("div");return"draggable"in e||"dragDrop"in e}();function Ae(e){if(null==Se){var t=M("span","​");A(e,M("span",[t,document.createTextNode("x")])),0!=e.firstChild.offsetHeight&&(Se=t.offsetWidth<=1&&t.offsetHeight>2&&!(a&&s<8))}var n=Se?M("span","​"):M("span"," ",null,"display: inline-block; width: 1px; margin-right: -1px");return n.setAttribute("cm-text",""),n}function Me(e){if(null!=Ce)return Ce;var t=A(e,document.createTextNode("AخA")),n=S(t,0,1).getBoundingClientRect(),r=S(t,1,2).getBoundingClientRect();return P(e),!(!n||n.left==n.right)&&(Ce=r.right-n.right<3)}var _e,Te=3!="\n\nb".split(/\n/).length?function(e){for(var t=0,n=[],r=e.length;t<=r;){var i=e.indexOf("\n",t);-1==i&&(i=e.length);var o=e.slice(t,"\r"==e.charAt(i-1)?i-1:i),a=o.indexOf("\r");-1!=a?(n.push(o.slice(0,a)),t+=a+1):(n.push(o),t=i+1)}return n}:function(e){return e.split(/\r\n?|\n/)},Ee=window.getSelection?function(e){try{return e.selectionStart!=e.selectionEnd}catch(e){return!1}}:function(e){var t;try{t=e.ownerDocument.selection.createRange()}catch(e){}return!(!t||t.parentElement()!=e)&&0!=t.compareEndPoints("StartToEnd",t)},Le="oncopy"in(_e=M("div"))||(_e.setAttribute("oncopy","return;"),"function"==typeof _e.oncopy),Ne=null;var De={},Ie={};function Fe(e,t){arguments.length>2&&(t.dependencies=Array.prototype.slice.call(arguments,2)),De[e]=t}function Re(e){if("string"==typeof e&&Ie.hasOwnProperty(e))e=Ie[e];else if(e&&"string"==typeof e.name&&Ie.hasOwnProperty(e.name)){var t=Ie[e.name];"string"==typeof t&&(t={name:t}),(e=X(t,e)).name=t.name}else{if("string"==typeof e&&/^[\w\-]+\/[\w\-]+\+xml$/.test(e))return Re("application/xml");if("string"==typeof e&&/^[\w\-]+\/[\w\-]+\+json$/.test(e))return Re("application/json")}return"string"==typeof e?{name:e}:e||{name:"null"}}function $e(e,t){t=Re(t);var n=De[t.name];if(!n)return $e(e,"text/plain");var r=n(e,t);if(He.hasOwnProperty(t.name)){var i=He[t.name];for(var o in i)i.hasOwnProperty(o)&&(r.hasOwnProperty(o)&&(r["_"+o]=r[o]),r[o]=i[o])}if(r.name=t.name,t.helperType&&(r.helperType=t.helperType),t.modeProps)for(var a in t.modeProps)r[a]=t.modeProps[a];return r}var He={};function We(e,t){F(t,He.hasOwnProperty(e)?He[e]:He[e]={})}function ze(e,t){if(!0===t)return t;if(e.copyState)return e.copyState(t);var n={};for(var r in t){var i=t[r];i instanceof Array&&(i=i.concat([])),n[r]=i}return n}function Be(e,t){for(var n;e.innerMode&&(n=e.innerMode(t))&&n.mode!=e;)t=n.state,e=n.mode;return n||{mode:e,state:t}}function qe(e,t,n){return!e.startState||e.startState(t,n)}var Ve=function(e,t,n){this.pos=this.start=0,this.string=e,this.tabSize=t||8,this.lastColumnPos=this.lastColumnValue=0,this.lineStart=0,this.lineOracle=n};function Ue(e,t){if((t-=e.first)<0||t>=e.size)throw new Error("There is no line "+(t+e.first)+" in the document.");for(var n=e;!n.lines;)for(var r=0;;++r){var i=n.children[r],o=i.chunkSize();if(t<o){n=i;break}t-=o}return n.lines[t]}function Ge(e,t,n){var r=[],i=t.line;return e.iter(t.line,n.line+1,(function(e){var o=e.text;i==n.line&&(o=o.slice(0,n.ch)),i==t.line&&(o=o.slice(t.ch)),r.push(o),++i})),r}function Ke(e,t,n){var r=[];return e.iter(t,n,(function(e){r.push(e.text)})),r}function Je(e,t){var n=t-e.height;if(n)for(var r=e;r;r=r.parent)r.height+=n}function Ye(e){if(null==e.parent)return null;for(var t=e.parent,n=H(t.lines,e),r=t.parent;r;t=r,r=r.parent)for(var i=0;r.children[i]!=t;++i)n+=r.children[i].chunkSize();return n+t.first}function Xe(e,t){var n=e.first;e:do{for(var r=0;r<e.children.length;++r){var i=e.children[r],o=i.height;if(t<o){e=i;continue e}t-=o,n+=i.chunkSize()}return n}while(!e.lines);for(var a=0;a<e.lines.length;++a){var s=e.lines[a].height;if(t<s)break;t-=s}return n+a}function Ze(e,t){return t>=e.first&&t<e.first+e.size}function Qe(e,t){return String(e.lineNumberFormatter(t+e.firstLineNumber))}function et(e,t,n){if(void 0===n&&(n=null),!(this instanceof et))return new et(e,t,n);this.line=e,this.ch=t,this.sticky=n}function tt(e,t){return e.line-t.line||e.ch-t.ch}function nt(e,t){return e.sticky==t.sticky&&0==tt(e,t)}function rt(e){return et(e.line,e.ch)}function it(e,t){return tt(e,t)<0?t:e}function ot(e,t){return tt(e,t)<0?e:t}function at(e,t){return Math.max(e.first,Math.min(t,e.first+e.size-1))}function st(e,t){if(t.line<e.first)return et(e.first,0);var n=e.first+e.size-1;return t.line>n?et(n,Ue(e,n).text.length):function(e,t){var n=e.ch;return null==n||n>t?et(e.line,t):n<0?et(e.line,0):e}(t,Ue(e,t.line).text.length)}function lt(e,t){for(var n=[],r=0;r<t.length;r++)n[r]=st(e,t[r]);return n}Ve.prototype.eol=function(){return this.pos>=this.string.length},Ve.prototype.sol=function(){return this.pos==this.lineStart},Ve.prototype.peek=function(){return this.string.charAt(this.pos)||void 0},Ve.prototype.next=function(){if(this.pos<this.string.length)return this.string.charAt(this.pos++)},Ve.prototype.eat=function(e){var t=this.string.charAt(this.pos);if("string"==typeof e?t==e:t&&(e.test?e.test(t):e(t)))return++this.pos,t},Ve.prototype.eatWhile=function(e){for(var t=this.pos;this.eat(e););return this.pos>t},Ve.prototype.eatSpace=function(){for(var e=this.pos;/[\s\u00a0]/.test(this.string.charAt(this.pos));)++this.pos;return this.pos>e},Ve.prototype.skipToEnd=function(){this.pos=this.string.length},Ve.prototype.skipTo=function(e){var t=this.string.indexOf(e,this.pos);if(t>-1)return this.pos=t,!0},Ve.prototype.backUp=function(e){this.pos-=e},Ve.prototype.column=function(){return this.lastColumnPos<this.start&&(this.lastColumnValue=R(this.string,this.start,this.tabSize,this.lastColumnPos,this.lastColumnValue),this.lastColumnPos=this.start),this.lastColumnValue-(this.lineStart?R(this.string,this.lineStart,this.tabSize):0)},Ve.prototype.indentation=function(){return R(this.string,null,this.tabSize)-(this.lineStart?R(this.string,this.lineStart,this.tabSize):0)},Ve.prototype.match=function(e,t,n){if("string"!=typeof e){var r=this.string.slice(this.pos).match(e);return r&&r.index>0?null:(r&&!1!==t&&(this.pos+=r[0].length),r)}var i=function(e){return n?e.toLowerCase():e};if(i(this.string.substr(this.pos,e.length))==i(e))return!1!==t&&(this.pos+=e.length),!0},Ve.prototype.current=function(){return this.string.slice(this.start,this.pos)},Ve.prototype.hideFirstChars=function(e,t){this.lineStart+=e;try{return t()}finally{this.lineStart-=e}},Ve.prototype.lookAhead=function(e){var t=this.lineOracle;return t&&t.lookAhead(e)},Ve.prototype.baseToken=function(){var e=this.lineOracle;return e&&e.baseToken(this.pos)};var ut=function(e,t){this.state=e,this.lookAhead=t},ct=function(e,t,n,r){this.state=t,this.doc=e,this.line=n,this.maxLookAhead=r||0,this.baseTokens=null,this.baseTokenPos=1};function ft(e,t,n,r){var i=[e.state.modeGen],o={};wt(e,t.text,e.doc.mode,n,(function(e,t){return i.push(e,t)}),o,r);for(var a=n.state,s=function(r){n.baseTokens=i;var s=e.state.overlays[r],l=1,u=0;n.state=!0,wt(e,t.text,s.mode,n,(function(e,t){for(var n=l;u<e;){var r=i[l];r>e&&i.splice(l,1,e,i[l+1],r),l+=2,u=Math.min(e,r)}if(t)if(s.opaque)i.splice(n,l-n,e,"overlay "+t),l=n+2;else for(;n<l;n+=2){var o=i[n+1];i[n+1]=(o?o+" ":"")+"overlay "+t}}),o),n.state=a,n.baseTokens=null,n.baseTokenPos=1},l=0;l<e.state.overlays.length;++l)s(l);return{styles:i,classes:o.bgClass||o.textClass?o:null}}function dt(e,t,n){if(!t.styles||t.styles[0]!=e.state.modeGen){var r=pt(e,Ye(t)),i=t.text.length>e.options.maxHighlightLength&&ze(e.doc.mode,r.state),o=ft(e,t,r);i&&(r.state=i),t.stateAfter=r.save(!i),t.styles=o.styles,o.classes?t.styleClasses=o.classes:t.styleClasses&&(t.styleClasses=null),n===e.doc.highlightFrontier&&(e.doc.modeFrontier=Math.max(e.doc.modeFrontier,++e.doc.highlightFrontier))}return t.styles}function pt(e,t,n){var r=e.doc,i=e.display;if(!r.mode.startState)return new ct(r,!0,t);var o=function(e,t,n){for(var r,i,o=e.doc,a=n?-1:t-(e.doc.mode.innerMode?1e3:100),s=t;s>a;--s){if(s<=o.first)return o.first;var l=Ue(o,s-1),u=l.stateAfter;if(u&&(!n||s+(u instanceof ut?u.lookAhead:0)<=o.modeFrontier))return s;var c=R(l.text,null,e.options.tabSize);(null==i||r>c)&&(i=s-1,r=c)}return i}(e,t,n),a=o>r.first&&Ue(r,o-1).stateAfter,s=a?ct.fromSaved(r,a,o):new ct(r,qe(r.mode),o);return r.iter(o,t,(function(n){ht(e,n.text,s);var r=s.line;n.stateAfter=r==t-1||r%5==0||r>=i.viewFrom&&r<i.viewTo?s.save():null,s.nextLine()})),n&&(r.modeFrontier=s.line),s}function ht(e,t,n,r){var i=e.doc.mode,o=new Ve(t,e.options.tabSize,n);for(o.start=o.pos=r||0,""==t&&gt(i,n.state);!o.eol();)vt(i,o,n.state),o.start=o.pos}function gt(e,t){if(e.blankLine)return e.blankLine(t);if(e.innerMode){var n=Be(e,t);return n.mode.blankLine?n.mode.blankLine(n.state):void 0}}function vt(e,t,n,r){for(var i=0;i<10;i++){r&&(r[0]=Be(e,n).mode);var o=e.token(t,n);if(t.pos>t.start)return o}throw new Error("Mode "+e.name+" failed to advance stream.")}ct.prototype.lookAhead=function(e){var t=this.doc.getLine(this.line+e);return null!=t&&e>this.maxLookAhead&&(this.maxLookAhead=e),t},ct.prototype.baseToken=function(e){if(!this.baseTokens)return null;for(;this.baseTokens[this.baseTokenPos]<=e;)this.baseTokenPos+=2;var t=this.baseTokens[this.baseTokenPos+1];return{type:t&&t.replace(/( |^)overlay .*/,""),size:this.baseTokens[this.baseTokenPos]-e}},ct.prototype.nextLine=function(){this.line++,this.maxLookAhead>0&&this.maxLookAhead--},ct.fromSaved=function(e,t,n){return t instanceof ut?new ct(e,ze(e.mode,t.state),n,t.lookAhead):new ct(e,ze(e.mode,t),n)},ct.prototype.save=function(e){var t=!1!==e?ze(this.doc.mode,this.state):this.state;return this.maxLookAhead>0?new ut(t,this.maxLookAhead):t};var mt=function(e,t,n){this.start=e.start,this.end=e.pos,this.string=e.current(),this.type=t||null,this.state=n};function yt(e,t,n,r){var i,o,a=e.doc,s=a.mode,l=Ue(a,(t=st(a,t)).line),u=pt(e,t.line,n),c=new Ve(l.text,e.options.tabSize,u);for(r&&(o=[]);(r||c.pos<t.ch)&&!c.eol();)c.start=c.pos,i=vt(s,c,u.state),r&&o.push(new mt(c,i,ze(a.mode,u.state)));return r?o:new mt(c,i,u.state)}function bt(e,t){if(e)for(;;){var n=e.match(/(?:^|\s+)line-(background-)?(\S+)/);if(!n)break;e=e.slice(0,n.index)+e.slice(n.index+n[0].length);var r=n[1]?"bgClass":"textClass";null==t[r]?t[r]=n[2]:new RegExp("(?:^|\\s)"+n[2]+"(?:$|\\s)").test(t[r])||(t[r]+=" "+n[2])}return e}function wt(e,t,n,r,i,o,a){var s=n.flattenSpans;null==s&&(s=e.options.flattenSpans);var l,u=0,c=null,f=new Ve(t,e.options.tabSize,r),d=e.options.addModeClass&&[null];for(""==t&&bt(gt(n,r.state),o);!f.eol();){if(f.pos>e.options.maxHighlightLength?(s=!1,a&&ht(e,t,r,f.pos),f.pos=t.length,l=null):l=bt(vt(n,f,r.state,d),o),d){var p=d[0].name;p&&(l="m-"+(l?p+" "+l:p))}if(!s||c!=l){for(;u<f.start;)i(u=Math.min(f.start,u+5e3),c);c=l}f.start=f.pos}for(;u<f.pos;){var h=Math.min(f.pos,u+5e3);i(h,c),u=h}}var xt=!1,kt=!1;function Ot(e,t,n){this.marker=e,this.from=t,this.to=n}function jt(e,t){if(e)for(var n=0;n<e.length;++n){var r=e[n];if(r.marker==t)return r}}function St(e,t){for(var n,r=0;r<e.length;++r)e[r]!=t&&(n||(n=[])).push(e[r]);return n}function Ct(e,t){if(t.full)return null;var n=Ze(e,t.from.line)&&Ue(e,t.from.line).markedSpans,r=Ze(e,t.to.line)&&Ue(e,t.to.line).markedSpans;if(!n&&!r)return null;var i=t.from.ch,o=t.to.ch,a=0==tt(t.from,t.to),s=function(e,t,n){var r;if(e)for(var i=0;i<e.length;++i){var o=e[i],a=o.marker;if(null==o.from||(a.inclusiveLeft?o.from<=t:o.from<t)||o.from==t&&"bookmark"==a.type&&(!n||!o.marker.insertLeft)){var s=null==o.to||(a.inclusiveRight?o.to>=t:o.to>t);(r||(r=[])).push(new Ot(a,o.from,s?null:o.to))}}return r}(n,i,a),l=function(e,t,n){var r;if(e)for(var i=0;i<e.length;++i){var o=e[i],a=o.marker;if(null==o.to||(a.inclusiveRight?o.to>=t:o.to>t)||o.from==t&&"bookmark"==a.type&&(!n||o.marker.insertLeft)){var s=null==o.from||(a.inclusiveLeft?o.from<=t:o.from<t);(r||(r=[])).push(new Ot(a,s?null:o.from-t,null==o.to?null:o.to-t))}}return r}(r,o,a),u=1==t.text.length,c=K(t.text).length+(u?i:0);if(s)for(var f=0;f<s.length;++f){var d=s[f];if(null==d.to){var p=jt(l,d.marker);p?u&&(d.to=null==p.to?null:p.to+c):d.to=i}}if(l)for(var h=0;h<l.length;++h){var g=l[h];if(null!=g.to&&(g.to+=c),null==g.from)jt(s,g.marker)||(g.from=c,u&&(s||(s=[])).push(g));else g.from+=c,u&&(s||(s=[])).push(g)}s&&(s=Pt(s)),l&&l!=s&&(l=Pt(l));var v=[s];if(!u){var m,y=t.text.length-2;if(y>0&&s)for(var b=0;b<s.length;++b)null==s[b].to&&(m||(m=[])).push(new Ot(s[b].marker,null,null));for(var w=0;w<y;++w)v.push(m);v.push(l)}return v}function Pt(e){for(var t=0;t<e.length;++t){var n=e[t];null!=n.from&&n.from==n.to&&!1!==n.marker.clearWhenEmpty&&e.splice(t--,1)}return e.length?e:null}function At(e){var t=e.markedSpans;if(t){for(var n=0;n<t.length;++n)t[n].marker.detachLine(e);e.markedSpans=null}}function Mt(e,t){if(t){for(var n=0;n<t.length;++n)t[n].marker.attachLine(e);e.markedSpans=t}}function _t(e){return e.inclusiveLeft?-1:0}function Tt(e){return e.inclusiveRight?1:0}function Et(e,t){var n=e.lines.length-t.lines.length;if(0!=n)return n;var r=e.find(),i=t.find(),o=tt(r.from,i.from)||_t(e)-_t(t);if(o)return-o;var a=tt(r.to,i.to)||Tt(e)-Tt(t);return a||t.id-e.id}function Lt(e,t){var n,r=kt&&e.markedSpans;if(r)for(var i=void 0,o=0;o<r.length;++o)(i=r[o]).marker.collapsed&&null==(t?i.from:i.to)&&(!n||Et(n,i.marker)<0)&&(n=i.marker);return n}function Nt(e){return Lt(e,!0)}function Dt(e){return Lt(e,!1)}function It(e,t){var n,r=kt&&e.markedSpans;if(r)for(var i=0;i<r.length;++i){var o=r[i];o.marker.collapsed&&(null==o.from||o.from<t)&&(null==o.to||o.to>t)&&(!n||Et(n,o.marker)<0)&&(n=o.marker)}return n}function Ft(e,t,n,r,i){var o=Ue(e,t),a=kt&&o.markedSpans;if(a)for(var s=0;s<a.length;++s){var l=a[s];if(l.marker.collapsed){var u=l.marker.find(0),c=tt(u.from,n)||_t(l.marker)-_t(i),f=tt(u.to,r)||Tt(l.marker)-Tt(i);if(!(c>=0&&f<=0||c<=0&&f>=0)&&(c<=0&&(l.marker.inclusiveRight&&i.inclusiveLeft?tt(u.to,n)>=0:tt(u.to,n)>0)||c>=0&&(l.marker.inclusiveRight&&i.inclusiveLeft?tt(u.from,r)<=0:tt(u.from,r)<0)))return!0}}}function Rt(e){for(var t;t=Nt(e);)e=t.find(-1,!0).line;return e}function $t(e,t){var n=Ue(e,t),r=Rt(n);return n==r?t:Ye(r)}function Ht(e,t){if(t>e.lastLine())return t;var n,r=Ue(e,t);if(!Wt(e,r))return t;for(;n=Dt(r);)r=n.find(1,!0).line;return Ye(r)+1}function Wt(e,t){var n=kt&&t.markedSpans;if(n)for(var r=void 0,i=0;i<n.length;++i)if((r=n[i]).marker.collapsed){if(null==r.from)return!0;if(!r.marker.widgetNode&&0==r.from&&r.marker.inclusiveLeft&&zt(e,t,r))return!0}}function zt(e,t,n){if(null==n.to){var r=n.marker.find(1,!0);return zt(e,r.line,jt(r.line.markedSpans,n.marker))}if(n.marker.inclusiveRight&&n.to==t.text.length)return!0;for(var i=void 0,o=0;o<t.markedSpans.length;++o)if((i=t.markedSpans[o]).marker.collapsed&&!i.marker.widgetNode&&i.from==n.to&&(null==i.to||i.to!=n.from)&&(i.marker.inclusiveLeft||n.marker.inclusiveRight)&&zt(e,t,i))return!0}function Bt(e){for(var t=0,n=(e=Rt(e)).parent,r=0;r<n.lines.length;++r){var i=n.lines[r];if(i==e)break;t+=i.height}for(var o=n.parent;o;o=(n=o).parent)for(var a=0;a<o.children.length;++a){var s=o.children[a];if(s==n)break;t+=s.height}return t}function qt(e){if(0==e.height)return 0;for(var t,n=e.text.length,r=e;t=Nt(r);){var i=t.find(0,!0);r=i.from.line,n+=i.from.ch-i.to.ch}for(r=e;t=Dt(r);){var o=t.find(0,!0);n-=r.text.length-o.from.ch,n+=(r=o.to.line).text.length-o.to.ch}return n}function Vt(e){var t=e.display,n=e.doc;t.maxLine=Ue(n,n.first),t.maxLineLength=qt(t.maxLine),t.maxLineChanged=!0,n.iter((function(e){var n=qt(e);n>t.maxLineLength&&(t.maxLineLength=n,t.maxLine=e)}))}var Ut=function(e,t,n){this.text=e,Mt(this,t),this.height=n?n(this):1};function Gt(e){e.parent=null,At(e)}Ut.prototype.lineNo=function(){return Ye(this)},ye(Ut);var Kt={},Jt={};function Yt(e,t){if(!e||/^\s*$/.test(e))return null;var n=t.addModeClass?Jt:Kt;return n[e]||(n[e]=e.replace(/\S+/g,"cm-$&"))}function Xt(e,t){var n=_("span",null,null,l?"padding-right: .1px":null),r={pre:_("pre",[n],"CodeMirror-line"),content:n,col:0,pos:0,cm:e,trailingSpace:!1,splitSpaces:e.getOption("lineWrapping")};t.measure={};for(var i=0;i<=(t.rest?t.rest.length:0);i++){var o=i?t.rest[i-1]:t.line,a=void 0;r.pos=0,r.addToken=Qt,Me(e.display.measure)&&(a=ue(o,e.doc.direction))&&(r.addToken=en(r.addToken,a)),r.map=[],nn(o,r,dt(e,o,t!=e.display.externalMeasured&&Ye(o))),o.styleClasses&&(o.styleClasses.bgClass&&(r.bgClass=N(o.styleClasses.bgClass,r.bgClass||"")),o.styleClasses.textClass&&(r.textClass=N(o.styleClasses.textClass,r.textClass||""))),0==r.map.length&&r.map.push(0,0,r.content.appendChild(Ae(e.display.measure))),0==i?(t.measure.map=r.map,t.measure.cache={}):((t.measure.maps||(t.measure.maps=[])).push(r.map),(t.measure.caches||(t.measure.caches=[])).push({}))}if(l){var s=r.content.lastChild;(/\bcm-tab\b/.test(s.className)||s.querySelector&&s.querySelector(".cm-tab"))&&(r.content.className="cm-tab-wrap-hack")}return he(e,"renderLine",e,t.line,r.pre),r.pre.className&&(r.textClass=N(r.pre.className,r.textClass||"")),r}function Zt(e){var t=M("span","•","cm-invalidchar");return t.title="\\u"+e.charCodeAt(0).toString(16),t.setAttribute("aria-label",t.title),t}function Qt(e,t,n,r,i,o,l){if(t){var u,c=e.splitSpaces?function(e,t){if(e.length>1&&!/  /.test(e))return e;for(var n=t,r="",i=0;i<e.length;i++){var o=e.charAt(i);" "!=o||!n||i!=e.length-1&&32!=e.charCodeAt(i+1)||(o=" "),r+=o,n=" "==o}return r}(t,e.trailingSpace):t,f=e.cm.state.specialChars,d=!1;if(f.test(t)){u=document.createDocumentFragment();for(var p=0;;){f.lastIndex=p;var h=f.exec(t),g=h?h.index-p:t.length-p;if(g){var v=document.createTextNode(c.slice(p,p+g));a&&s<9?u.appendChild(M("span",[v])):u.appendChild(v),e.map.push(e.pos,e.pos+g,v),e.col+=g,e.pos+=g}if(!h)break;p+=g+1;var m=void 0;if("\t"==h[0]){var y=e.cm.options.tabSize,b=y-e.col%y;(m=u.appendChild(M("span",G(b),"cm-tab"))).setAttribute("role","presentation"),m.setAttribute("cm-text","\t"),e.col+=b}else"\r"==h[0]||"\n"==h[0]?((m=u.appendChild(M("span","\r"==h[0]?"␍":"␤","cm-invalidchar"))).setAttribute("cm-text",h[0]),e.col+=1):((m=e.cm.options.specialCharPlaceholder(h[0])).setAttribute("cm-text",h[0]),a&&s<9?u.appendChild(M("span",[m])):u.appendChild(m),e.col+=1);e.map.push(e.pos,e.pos+1,m),e.pos++}}else e.col+=t.length,u=document.createTextNode(c),e.map.push(e.pos,e.pos+t.length,u),a&&s<9&&(d=!0),e.pos+=t.length;if(e.trailingSpace=32==c.charCodeAt(t.length-1),n||r||i||d||o||l){var w=n||"";r&&(w+=r),i&&(w+=i);var x=M("span",[u],w,o);if(l)for(var k in l)l.hasOwnProperty(k)&&"style"!=k&&"class"!=k&&x.setAttribute(k,l[k]);return e.content.appendChild(x)}e.content.appendChild(u)}}function en(e,t){return function(n,r,i,o,a,s,l){i=i?i+" cm-force-border":"cm-force-border";for(var u=n.pos,c=u+r.length;;){for(var f=void 0,d=0;d<t.length&&!((f=t[d]).to>u&&f.from<=u);d++);if(f.to>=c)return e(n,r,i,o,a,s,l);e(n,r.slice(0,f.to-u),i,o,null,s,l),o=null,r=r.slice(f.to-u),u=f.to}}}function tn(e,t,n,r){var i=!r&&n.widgetNode;i&&e.map.push(e.pos,e.pos+t,i),!r&&e.cm.display.input.needsContentAttribute&&(i||(i=e.content.appendChild(document.createElement("span"))),i.setAttribute("cm-marker",n.id)),i&&(e.cm.display.input.setUneditable(i),e.content.appendChild(i)),e.pos+=t,e.trailingSpace=!1}function nn(e,t,n){var r=e.markedSpans,i=e.text,o=0;if(r)for(var a,s,l,u,c,f,d,p=i.length,h=0,g=1,v="",m=0;;){if(m==h){l=u=c=s="",d=null,f=null,m=1/0;for(var y=[],b=void 0,w=0;w<r.length;++w){var x=r[w],k=x.marker;if("bookmark"==k.type&&x.from==h&&k.widgetNode)y.push(k);else if(x.from<=h&&(null==x.to||x.to>h||k.collapsed&&x.to==h&&x.from==h)){if(null!=x.to&&x.to!=h&&m>x.to&&(m=x.to,u=""),k.className&&(l+=" "+k.className),k.css&&(s=(s?s+";":"")+k.css),k.startStyle&&x.from==h&&(c+=" "+k.startStyle),k.endStyle&&x.to==m&&(b||(b=[])).push(k.endStyle,x.to),k.title&&((d||(d={})).title=k.title),k.attributes)for(var O in k.attributes)(d||(d={}))[O]=k.attributes[O];k.collapsed&&(!f||Et(f.marker,k)<0)&&(f=x)}else x.from>h&&m>x.from&&(m=x.from)}if(b)for(var j=0;j<b.length;j+=2)b[j+1]==m&&(u+=" "+b[j]);if(!f||f.from==h)for(var S=0;S<y.length;++S)tn(t,0,y[S]);if(f&&(f.from||0)==h){if(tn(t,(null==f.to?p+1:f.to)-h,f.marker,null==f.from),null==f.to)return;f.to==h&&(f=!1)}}if(h>=p)break;for(var C=Math.min(p,m);;){if(v){var P=h+v.length;if(!f){var A=P>C?v.slice(0,C-h):v;t.addToken(t,A,a?a+l:l,c,h+A.length==m?u:"",s,d)}if(P>=C){v=v.slice(C-h),h=C;break}h=P,c=""}v=i.slice(o,o=n[g++]),a=Yt(n[g++],t.cm.options)}}else for(var M=1;M<n.length;M+=2)t.addToken(t,i.slice(o,o=n[M]),Yt(n[M+1],t.cm.options))}function rn(e,t,n){this.line=t,this.rest=function(e){for(var t,n;t=Dt(e);)e=t.find(1,!0).line,(n||(n=[])).push(e);return n}(t),this.size=this.rest?Ye(K(this.rest))-n+1:1,this.node=this.text=null,this.hidden=Wt(e,t)}function on(e,t,n){for(var r,i=[],o=t;o<n;o=r){var a=new rn(e.doc,Ue(e.doc,o),o);r=o+a.size,i.push(a)}return i}var an=null;var sn=null;function ln(e,t){var n=de(e,t);if(n.length){var r,i=Array.prototype.slice.call(arguments,2);an?r=an.delayedCallbacks:sn?r=sn:(r=sn=[],setTimeout(un,0));for(var o=function(e){r.push((function(){return n[e].apply(null,i)}))},a=0;a<n.length;++a)o(a)}}function un(){var e=sn;sn=null;for(var t=0;t<e.length;++t)e[t]()}function cn(e,t,n,r){for(var i=0;i<t.changes.length;i++){var o=t.changes[i];"text"==o?pn(e,t):"gutter"==o?gn(e,t,n,r):"class"==o?hn(e,t):"widget"==o&&vn(e,t,r)}t.changes=null}function fn(e){return e.node==e.text&&(e.node=M("div",null,null,"position: relative"),e.text.parentNode&&e.text.parentNode.replaceChild(e.node,e.text),e.node.appendChild(e.text),a&&s<8&&(e.node.style.zIndex=2)),e.node}function dn(e,t){var n=e.display.externalMeasured;return n&&n.line==t.line?(e.display.externalMeasured=null,t.measure=n.measure,n.built):Xt(e,t)}function pn(e,t){var n=t.text.className,r=dn(e,t);t.text==t.node&&(t.node=r.pre),t.text.parentNode.replaceChild(r.pre,t.text),t.text=r.pre,r.bgClass!=t.bgClass||r.textClass!=t.textClass?(t.bgClass=r.bgClass,t.textClass=r.textClass,hn(e,t)):n&&(t.text.className=n)}function hn(e,t){!function(e,t){var n=t.bgClass?t.bgClass+" "+(t.line.bgClass||""):t.line.bgClass;if(n&&(n+=" CodeMirror-linebackground"),t.background)n?t.background.className=n:(t.background.parentNode.removeChild(t.background),t.background=null);else if(n){var r=fn(t);t.background=r.insertBefore(M("div",null,n),r.firstChild),e.display.input.setUneditable(t.background)}}(e,t),t.line.wrapClass?fn(t).className=t.line.wrapClass:t.node!=t.text&&(t.node.className="");var n=t.textClass?t.textClass+" "+(t.line.textClass||""):t.line.textClass;t.text.className=n||""}function gn(e,t,n,r){if(t.gutter&&(t.node.removeChild(t.gutter),t.gutter=null),t.gutterBackground&&(t.node.removeChild(t.gutterBackground),t.gutterBackground=null),t.line.gutterClass){var i=fn(t);t.gutterBackground=M("div",null,"CodeMirror-gutter-background "+t.line.gutterClass,"left: "+(e.options.fixedGutter?r.fixedPos:-r.gutterTotalWidth)+"px; width: "+r.gutterTotalWidth+"px"),e.display.input.setUneditable(t.gutterBackground),i.insertBefore(t.gutterBackground,t.text)}var o=t.line.gutterMarkers;if(e.options.lineNumbers||o){var a=fn(t),s=t.gutter=M("div",null,"CodeMirror-gutter-wrapper","left: "+(e.options.fixedGutter?r.fixedPos:-r.gutterTotalWidth)+"px");if(e.display.input.setUneditable(s),a.insertBefore(s,t.text),t.line.gutterClass&&(s.className+=" "+t.line.gutterClass),!e.options.lineNumbers||o&&o["CodeMirror-linenumbers"]||(t.lineNumber=s.appendChild(M("div",Qe(e.options,n),"CodeMirror-linenumber CodeMirror-gutter-elt","left: "+r.gutterLeft["CodeMirror-linenumbers"]+"px; width: "+e.display.lineNumInnerWidth+"px"))),o)for(var l=0;l<e.display.gutterSpecs.length;++l){var u=e.display.gutterSpecs[l].className,c=o.hasOwnProperty(u)&&o[u];c&&s.appendChild(M("div",[c],"CodeMirror-gutter-elt","left: "+r.gutterLeft[u]+"px; width: "+r.gutterWidth[u]+"px"))}}}function vn(e,t,n){t.alignable&&(t.alignable=null);for(var r=j("CodeMirror-linewidget"),i=t.node.firstChild,o=void 0;i;i=o)o=i.nextSibling,r.test(i.className)&&t.node.removeChild(i);yn(e,t,n)}function mn(e,t,n,r){var i=dn(e,t);return t.text=t.node=i.pre,i.bgClass&&(t.bgClass=i.bgClass),i.textClass&&(t.textClass=i.textClass),hn(e,t),gn(e,t,n,r),yn(e,t,r),t.node}function yn(e,t,n){if(bn(e,t.line,t,n,!0),t.rest)for(var r=0;r<t.rest.length;r++)bn(e,t.rest[r],t,n,!1)}function bn(e,t,n,r,i){if(t.widgets)for(var o=fn(n),a=0,s=t.widgets;a<s.length;++a){var l=s[a],u=M("div",[l.node],"CodeMirror-linewidget"+(l.className?" "+l.className:""));l.handleMouseEvents||u.setAttribute("cm-ignore-events","true"),wn(l,u,n,r),e.display.input.setUneditable(u),i&&l.above?o.insertBefore(u,n.gutter||n.text):o.appendChild(u),ln(l,"redraw")}}function wn(e,t,n,r){if(e.noHScroll){(n.alignable||(n.alignable=[])).push(t);var i=r.wrapperWidth;t.style.left=r.fixedPos+"px",e.coverGutter||(i-=r.gutterTotalWidth,t.style.paddingLeft=r.gutterTotalWidth+"px"),t.style.width=i+"px"}e.coverGutter&&(t.style.zIndex=5,t.style.position="relative",e.noHScroll||(t.style.marginLeft=-r.gutterTotalWidth+"px"))}function xn(e){if(null!=e.height)return e.height;var t=e.doc.cm;if(!t)return 0;if(!T(document.body,e.node)){var n="position: relative;";e.coverGutter&&(n+="margin-left: -"+t.display.gutters.offsetWidth+"px;"),e.noHScroll&&(n+="width: "+t.display.wrapper.clientWidth+"px;"),A(t.display.measure,M("div",[e.node],null,n))}return e.height=e.node.parentNode.offsetHeight}function kn(e,t){for(var n=Oe(t);n!=e.wrapper;n=n.parentNode)if(!n||1==n.nodeType&&"true"==n.getAttribute("cm-ignore-events")||n.parentNode==e.sizer&&n!=e.mover)return!0}function On(e){return e.lineSpace.offsetTop}function jn(e){return e.mover.offsetHeight-e.lineSpace.offsetHeight}function Sn(e){if(e.cachedPaddingH)return e.cachedPaddingH;var t=A(e.measure,M("pre","x","CodeMirror-line-like")),n=window.getComputedStyle?window.getComputedStyle(t):t.currentStyle,r={left:parseInt(n.paddingLeft),right:parseInt(n.paddingRight)};return isNaN(r.left)||isNaN(r.right)||(e.cachedPaddingH=r),r}function Cn(e){return 50-e.display.nativeBarWidth}function Pn(e){return e.display.scroller.clientWidth-Cn(e)-e.display.barWidth}function An(e){return e.display.scroller.clientHeight-Cn(e)-e.display.barHeight}function Mn(e,t,n){if(e.line==t)return{map:e.measure.map,cache:e.measure.cache};for(var r=0;r<e.rest.length;r++)if(e.rest[r]==t)return{map:e.measure.maps[r],cache:e.measure.caches[r]};for(var i=0;i<e.rest.length;i++)if(Ye(e.rest[i])>n)return{map:e.measure.maps[i],cache:e.measure.caches[i],before:!0}}function _n(e,t,n,r){return Ln(e,En(e,t),n,r)}function Tn(e,t){if(t>=e.display.viewFrom&&t<e.display.viewTo)return e.display.view[cr(e,t)];var n=e.display.externalMeasured;return n&&t>=n.lineN&&t<n.lineN+n.size?n:void 0}function En(e,t){var n=Ye(t),r=Tn(e,n);r&&!r.text?r=null:r&&r.changes&&(cn(e,r,n,or(e)),e.curOp.forceUpdate=!0),r||(r=function(e,t){var n=Ye(t=Rt(t)),r=e.display.externalMeasured=new rn(e.doc,t,n);r.lineN=n;var i=r.built=Xt(e,r);return r.text=i.pre,A(e.display.lineMeasure,i.pre),r}(e,t));var i=Mn(r,t,n);return{line:t,view:r,rect:null,map:i.map,cache:i.cache,before:i.before,hasHeights:!1}}function Ln(e,t,n,r,i){t.before&&(n=-1);var o,l=n+(r||"");return t.cache.hasOwnProperty(l)?o=t.cache[l]:(t.rect||(t.rect=t.view.text.getBoundingClientRect()),t.hasHeights||(!function(e,t,n){var r=e.options.lineWrapping,i=r&&Pn(e);if(!t.measure.heights||r&&t.measure.width!=i){var o=t.measure.heights=[];if(r){t.measure.width=i;for(var a=t.text.firstChild.getClientRects(),s=0;s<a.length-1;s++){var l=a[s],u=a[s+1];Math.abs(l.bottom-u.bottom)>2&&o.push((l.bottom+u.top)/2-n.top)}}o.push(n.bottom-n.top)}}(e,t.view,t.rect),t.hasHeights=!0),(o=function(e,t,n,r){var i,o=In(t.map,n,r),l=o.node,u=o.start,c=o.end,f=o.collapse;if(3==l.nodeType){for(var d=0;d<4;d++){for(;u&&re(t.line.text.charAt(o.coverStart+u));)--u;for(;o.coverStart+c<o.coverEnd&&re(t.line.text.charAt(o.coverStart+c));)++c;if((i=a&&s<9&&0==u&&c==o.coverEnd-o.coverStart?l.parentNode.getBoundingClientRect():Fn(S(l,u,c).getClientRects(),r)).left||i.right||0==u)break;c=u,u-=1,f="right"}a&&s<11&&(i=function(e,t){if(!window.screen||null==screen.logicalXDPI||screen.logicalXDPI==screen.deviceXDPI||!function(e){if(null!=Ne)return Ne;var t=A(e,M("span","x")),n=t.getBoundingClientRect(),r=S(t,0,1).getBoundingClientRect();return Ne=Math.abs(n.left-r.left)>1}(e))return t;var n=screen.logicalXDPI/screen.deviceXDPI,r=screen.logicalYDPI/screen.deviceYDPI;return{left:t.left*n,right:t.right*n,top:t.top*r,bottom:t.bottom*r}}(e.display.measure,i))}else{var p;u>0&&(f=r="right"),i=e.options.lineWrapping&&(p=l.getClientRects()).length>1?p["right"==r?p.length-1:0]:l.getBoundingClientRect()}if(a&&s<9&&!u&&(!i||!i.left&&!i.right)){var h=l.parentNode.getClientRects()[0];i=h?{left:h.left,right:h.left+ir(e.display),top:h.top,bottom:h.bottom}:Dn}for(var g=i.top-t.rect.top,v=i.bottom-t.rect.top,m=(g+v)/2,y=t.view.measure.heights,b=0;b<y.length-1&&!(m<y[b]);b++);var w=b?y[b-1]:0,x=y[b],k={left:("right"==f?i.right:i.left)-t.rect.left,right:("left"==f?i.left:i.right)-t.rect.left,top:w,bottom:x};i.left||i.right||(k.bogus=!0);e.options.singleCursorHeightPerLine||(k.rtop=g,k.rbottom=v);return k}(e,t,n,r)).bogus||(t.cache[l]=o)),{left:o.left,right:o.right,top:i?o.rtop:o.top,bottom:i?o.rbottom:o.bottom}}var Nn,Dn={left:0,right:0,top:0,bottom:0};function In(e,t,n){for(var r,i,o,a,s,l,u=0;u<e.length;u+=3)if(s=e[u],l=e[u+1],t<s?(i=0,o=1,a="left"):t<l?o=(i=t-s)+1:(u==e.length-3||t==l&&e[u+3]>t)&&(i=(o=l-s)-1,t>=l&&(a="right")),null!=i){if(r=e[u+2],s==l&&n==(r.insertLeft?"left":"right")&&(a=n),"left"==n&&0==i)for(;u&&e[u-2]==e[u-3]&&e[u-1].insertLeft;)r=e[2+(u-=3)],a="left";if("right"==n&&i==l-s)for(;u<e.length-3&&e[u+3]==e[u+4]&&!e[u+5].insertLeft;)r=e[(u+=3)+2],a="right";break}return{node:r,start:i,end:o,collapse:a,coverStart:s,coverEnd:l}}function Fn(e,t){var n=Dn;if("left"==t)for(var r=0;r<e.length&&(n=e[r]).left==n.right;r++);else for(var i=e.length-1;i>=0&&(n=e[i]).left==n.right;i--);return n}function Rn(e){if(e.measure&&(e.measure.cache={},e.measure.heights=null,e.rest))for(var t=0;t<e.rest.length;t++)e.measure.caches[t]={}}function $n(e){e.display.externalMeasure=null,P(e.display.lineMeasure);for(var t=0;t<e.display.view.length;t++)Rn(e.display.view[t])}function Hn(e){$n(e),e.display.cachedCharWidth=e.display.cachedTextHeight=e.display.cachedPaddingH=null,e.options.lineWrapping||(e.display.maxLineChanged=!0),e.display.lineNumChars=null}function Wn(){return c&&v?-(document.body.getBoundingClientRect().left-parseInt(getComputedStyle(document.body).marginLeft)):window.pageXOffset||(document.documentElement||document.body).scrollLeft}function zn(){return c&&v?-(document.body.getBoundingClientRect().top-parseInt(getComputedStyle(document.body).marginTop)):window.pageYOffset||(document.documentElement||document.body).scrollTop}function Bn(e){var t=0;if(e.widgets)for(var n=0;n<e.widgets.length;++n)e.widgets[n].above&&(t+=xn(e.widgets[n]));return t}function qn(e,t,n,r,i){if(!i){var o=Bn(t);n.top+=o,n.bottom+=o}if("line"==r)return n;r||(r="local");var a=Bt(t);if("local"==r?a+=On(e.display):a-=e.display.viewOffset,"page"==r||"window"==r){var s=e.display.lineSpace.getBoundingClientRect();a+=s.top+("window"==r?0:zn());var l=s.left+("window"==r?0:Wn());n.left+=l,n.right+=l}return n.top+=a,n.bottom+=a,n}function Vn(e,t,n){if("div"==n)return t;var r=t.left,i=t.top;if("page"==n)r-=Wn(),i-=zn();else if("local"==n||!n){var o=e.display.sizer.getBoundingClientRect();r+=o.left,i+=o.top}var a=e.display.lineSpace.getBoundingClientRect();return{left:r-a.left,top:i-a.top}}function Un(e,t,n,r,i){return r||(r=Ue(e.doc,t.line)),qn(e,r,_n(e,r,t.ch,i),n)}function Gn(e,t,n,r,i,o){function a(t,a){var s=Ln(e,i,t,a?"right":"left",o);return a?s.left=s.right:s.right=s.left,qn(e,r,s,n)}r=r||Ue(e.doc,t.line),i||(i=En(e,r));var s=ue(r,e.doc.direction),l=t.ch,u=t.sticky;if(l>=r.text.length?(l=r.text.length,u="before"):l<=0&&(l=0,u="after"),!s)return a("before"==u?l-1:l,"before"==u);function c(e,t,n){return a(n?e-1:e,1==s[t].level!=n)}var f=se(s,l,u),d=ae,p=c(l,f,"before"==u);return null!=d&&(p.other=c(l,d,"before"!=u)),p}function Kn(e,t){var n=0;t=st(e.doc,t),e.options.lineWrapping||(n=ir(e.display)*t.ch);var r=Ue(e.doc,t.line),i=Bt(r)+On(e.display);return{left:n,right:n,top:i,bottom:i+r.height}}function Jn(e,t,n,r,i){var o=et(e,t,n);return o.xRel=i,r&&(o.outside=r),o}function Yn(e,t,n){var r=e.doc;if((n+=e.display.viewOffset)<0)return Jn(r.first,0,null,-1,-1);var i=Xe(r,n),o=r.first+r.size-1;if(i>o)return Jn(r.first+r.size-1,Ue(r,o).text.length,null,1,1);t<0&&(t=0);for(var a=Ue(r,i);;){var s=er(e,a,i,t,n),l=It(a,s.ch+(s.xRel>0||s.outside>0?1:0));if(!l)return s;var u=l.find(1);if(u.line==i)return u;a=Ue(r,i=u.line)}}function Xn(e,t,n,r){r-=Bn(t);var i=t.text.length,o=oe((function(t){return Ln(e,n,t-1).bottom<=r}),i,0);return{begin:o,end:i=oe((function(t){return Ln(e,n,t).top>r}),o,i)}}function Zn(e,t,n,r){return n||(n=En(e,t)),Xn(e,t,n,qn(e,t,Ln(e,n,r),"line").top)}function Qn(e,t,n,r){return!(e.bottom<=n)&&(e.top>n||(r?e.left:e.right)>t)}function er(e,t,n,r,i){i-=Bt(t);var o=En(e,t),a=Bn(t),s=0,l=t.text.length,u=!0,c=ue(t,e.doc.direction);if(c){var f=(e.options.lineWrapping?nr:tr)(e,t,n,o,c,r,i);s=(u=1!=f.level)?f.from:f.to-1,l=u?f.to:f.from-1}var d,p,h=null,g=null,v=oe((function(t){var n=Ln(e,o,t);return n.top+=a,n.bottom+=a,!!Qn(n,r,i,!1)&&(n.top<=i&&n.left<=r&&(h=t,g=n),!0)}),s,l),m=!1;if(g){var y=r-g.left<g.right-r,b=y==u;v=h+(b?0:1),p=b?"after":"before",d=y?g.left:g.right}else{u||v!=l&&v!=s||v++,p=0==v?"after":v==t.text.length?"before":Ln(e,o,v-(u?1:0)).bottom+a<=i==u?"after":"before";var w=Gn(e,et(n,v,p),"line",t,o);d=w.left,m=i<w.top?-1:i>=w.bottom?1:0}return Jn(n,v=ie(t.text,v,1),p,m,r-d)}function tr(e,t,n,r,i,o,a){var s=oe((function(s){var l=i[s],u=1!=l.level;return Qn(Gn(e,et(n,u?l.to:l.from,u?"before":"after"),"line",t,r),o,a,!0)}),0,i.length-1),l=i[s];if(s>0){var u=1!=l.level,c=Gn(e,et(n,u?l.from:l.to,u?"after":"before"),"line",t,r);Qn(c,o,a,!0)&&c.top>a&&(l=i[s-1])}return l}function nr(e,t,n,r,i,o,a){var s=Xn(e,t,r,a),l=s.begin,u=s.end;/\s/.test(t.text.charAt(u-1))&&u--;for(var c=null,f=null,d=0;d<i.length;d++){var p=i[d];if(!(p.from>=u||p.to<=l)){var h=Ln(e,r,1!=p.level?Math.min(u,p.to)-1:Math.max(l,p.from)).right,g=h<o?o-h+1e9:h-o;(!c||f>g)&&(c=p,f=g)}}return c||(c=i[i.length-1]),c.from<l&&(c={from:l,to:c.to,level:c.level}),c.to>u&&(c={from:c.from,to:u,level:c.level}),c}function rr(e){if(null!=e.cachedTextHeight)return e.cachedTextHeight;if(null==Nn){Nn=M("pre",null,"CodeMirror-line-like");for(var t=0;t<49;++t)Nn.appendChild(document.createTextNode("x")),Nn.appendChild(M("br"));Nn.appendChild(document.createTextNode("x"))}A(e.measure,Nn);var n=Nn.offsetHeight/50;return n>3&&(e.cachedTextHeight=n),P(e.measure),n||1}function ir(e){if(null!=e.cachedCharWidth)return e.cachedCharWidth;var t=M("span","xxxxxxxxxx"),n=M("pre",[t],"CodeMirror-line-like");A(e.measure,n);var r=t.getBoundingClientRect(),i=(r.right-r.left)/10;return i>2&&(e.cachedCharWidth=i),i||10}function or(e){for(var t=e.display,n={},r={},i=t.gutters.clientLeft,o=t.gutters.firstChild,a=0;o;o=o.nextSibling,++a){var s=e.display.gutterSpecs[a].className;n[s]=o.offsetLeft+o.clientLeft+i,r[s]=o.clientWidth}return{fixedPos:ar(t),gutterTotalWidth:t.gutters.offsetWidth,gutterLeft:n,gutterWidth:r,wrapperWidth:t.wrapper.clientWidth}}function ar(e){return e.scroller.getBoundingClientRect().left-e.sizer.getBoundingClientRect().left}function sr(e){var t=rr(e.display),n=e.options.lineWrapping,r=n&&Math.max(5,e.display.scroller.clientWidth/ir(e.display)-3);return function(i){if(Wt(e.doc,i))return 0;var o=0;if(i.widgets)for(var a=0;a<i.widgets.length;a++)i.widgets[a].height&&(o+=i.widgets[a].height);return n?o+(Math.ceil(i.text.length/r)||1)*t:o+t}}function lr(e){var t=e.doc,n=sr(e);t.iter((function(e){var t=n(e);t!=e.height&&Je(e,t)}))}function ur(e,t,n,r){var i=e.display;if(!n&&"true"==Oe(t).getAttribute("cm-not-content"))return null;var o,a,s=i.lineSpace.getBoundingClientRect();try{o=t.clientX-s.left,a=t.clientY-s.top}catch(e){return null}var l,u=Yn(e,o,a);if(r&&u.xRel>0&&(l=Ue(e.doc,u.line).text).length==u.ch){var c=R(l,l.length,e.options.tabSize)-l.length;u=et(u.line,Math.max(0,Math.round((o-Sn(e.display).left)/ir(e.display))-c))}return u}function cr(e,t){if(t>=e.display.viewTo)return null;if((t-=e.display.viewFrom)<0)return null;for(var n=e.display.view,r=0;r<n.length;r++)if((t-=n[r].size)<0)return r}function fr(e,t,n,r){null==t&&(t=e.doc.first),null==n&&(n=e.doc.first+e.doc.size),r||(r=0);var i=e.display;if(r&&n<i.viewTo&&(null==i.updateLineNumbers||i.updateLineNumbers>t)&&(i.updateLineNumbers=t),e.curOp.viewChanged=!0,t>=i.viewTo)kt&&$t(e.doc,t)<i.viewTo&&pr(e);else if(n<=i.viewFrom)kt&&Ht(e.doc,n+r)>i.viewFrom?pr(e):(i.viewFrom+=r,i.viewTo+=r);else if(t<=i.viewFrom&&n>=i.viewTo)pr(e);else if(t<=i.viewFrom){var o=hr(e,n,n+r,1);o?(i.view=i.view.slice(o.index),i.viewFrom=o.lineN,i.viewTo+=r):pr(e)}else if(n>=i.viewTo){var a=hr(e,t,t,-1);a?(i.view=i.view.slice(0,a.index),i.viewTo=a.lineN):pr(e)}else{var s=hr(e,t,t,-1),l=hr(e,n,n+r,1);s&&l?(i.view=i.view.slice(0,s.index).concat(on(e,s.lineN,l.lineN)).concat(i.view.slice(l.index)),i.viewTo+=r):pr(e)}var u=i.externalMeasured;u&&(n<u.lineN?u.lineN+=r:t<u.lineN+u.size&&(i.externalMeasured=null))}function dr(e,t,n){e.curOp.viewChanged=!0;var r=e.display,i=e.display.externalMeasured;if(i&&t>=i.lineN&&t<i.lineN+i.size&&(r.externalMeasured=null),!(t<r.viewFrom||t>=r.viewTo)){var o=r.view[cr(e,t)];if(null!=o.node){var a=o.changes||(o.changes=[]);-1==H(a,n)&&a.push(n)}}}function pr(e){e.display.viewFrom=e.display.viewTo=e.doc.first,e.display.view=[],e.display.viewOffset=0}function hr(e,t,n,r){var i,o=cr(e,t),a=e.display.view;if(!kt||n==e.doc.first+e.doc.size)return{index:o,lineN:n};for(var s=e.display.viewFrom,l=0;l<o;l++)s+=a[l].size;if(s!=t){if(r>0){if(o==a.length-1)return null;i=s+a[o].size-t,o++}else i=s-t;t+=i,n+=i}for(;$t(e.doc,n)!=n;){if(o==(r<0?0:a.length-1))return null;n+=r*a[o-(r<0?1:0)].size,o+=r}return{index:o,lineN:n}}function gr(e){for(var t=e.display.view,n=0,r=0;r<t.length;r++){var i=t[r];i.hidden||i.node&&!i.changes||++n}return n}function vr(e){e.display.input.showSelection(e.display.input.prepareSelection())}function mr(e,t){void 0===t&&(t=!0);for(var n=e.doc,r={},i=r.cursors=document.createDocumentFragment(),o=r.selection=document.createDocumentFragment(),a=0;a<n.sel.ranges.length;a++)if(t||a!=n.sel.primIndex){var s=n.sel.ranges[a];if(!(s.from().line>=e.display.viewTo||s.to().line<e.display.viewFrom)){var l=s.empty();(l||e.options.showCursorWhenSelecting)&&yr(e,s.head,i),l||wr(e,s,o)}}return r}function yr(e,t,n){var r=Gn(e,t,"div",null,null,!e.options.singleCursorHeightPerLine),i=n.appendChild(M("div"," ","CodeMirror-cursor"));if(i.style.left=r.left+"px",i.style.top=r.top+"px",i.style.height=Math.max(0,r.bottom-r.top)*e.options.cursorHeight+"px",r.other){var o=n.appendChild(M("div"," ","CodeMirror-cursor CodeMirror-secondarycursor"));o.style.display="",o.style.left=r.other.left+"px",o.style.top=r.other.top+"px",o.style.height=.85*(r.other.bottom-r.other.top)+"px"}}function br(e,t){return e.top-t.top||e.left-t.left}function wr(e,t,n){var r=e.display,i=e.doc,o=document.createDocumentFragment(),a=Sn(e.display),s=a.left,l=Math.max(r.sizerWidth,Pn(e)-r.sizer.offsetLeft)-a.right,u="ltr"==i.direction;function c(e,t,n,r){t<0&&(t=0),t=Math.round(t),r=Math.round(r),o.appendChild(M("div",null,"CodeMirror-selected","position: absolute; left: "+e+"px;\n                             top: "+t+"px; width: "+(null==n?l-e:n)+"px;\n                             height: "+(r-t)+"px"))}function f(t,n,r){var o,a,f=Ue(i,t),d=f.text.length;function p(n,r){return Un(e,et(t,n),"div",f,r)}function h(t,n,r){var i=Zn(e,f,null,t),o="ltr"==n==("after"==r)?"left":"right";return p("after"==r?i.begin:i.end-(/\s/.test(f.text.charAt(i.end-1))?2:1),o)[o]}var g=ue(f,i.direction);return function(e,t,n,r){if(!e)return r(t,n,"ltr",0);for(var i=!1,o=0;o<e.length;++o){var a=e[o];(a.from<n&&a.to>t||t==n&&a.to==t)&&(r(Math.max(a.from,t),Math.min(a.to,n),1==a.level?"rtl":"ltr",o),i=!0)}i||r(t,n,"ltr")}(g,n||0,null==r?d:r,(function(e,t,i,f){var v="ltr"==i,m=p(e,v?"left":"right"),y=p(t-1,v?"right":"left"),b=null==n&&0==e,w=null==r&&t==d,x=0==f,k=!g||f==g.length-1;if(y.top-m.top<=3){var O=(u?w:b)&&k,j=(u?b:w)&&x?s:(v?m:y).left,S=O?l:(v?y:m).right;c(j,m.top,S-j,m.bottom)}else{var C,P,A,M;v?(C=u&&b&&x?s:m.left,P=u?l:h(e,i,"before"),A=u?s:h(t,i,"after"),M=u&&w&&k?l:y.right):(C=u?h(e,i,"before"):s,P=!u&&b&&x?l:m.right,A=!u&&w&&k?s:y.left,M=u?h(t,i,"after"):l),c(C,m.top,P-C,m.bottom),m.bottom<y.top&&c(s,m.bottom,null,y.top),c(A,y.top,M-A,y.bottom)}(!o||br(m,o)<0)&&(o=m),br(y,o)<0&&(o=y),(!a||br(m,a)<0)&&(a=m),br(y,a)<0&&(a=y)})),{start:o,end:a}}var d=t.from(),p=t.to();if(d.line==p.line)f(d.line,d.ch,p.ch);else{var h=Ue(i,d.line),g=Ue(i,p.line),v=Rt(h)==Rt(g),m=f(d.line,d.ch,v?h.text.length+1:null).end,y=f(p.line,v?0:null,p.ch).start;v&&(m.top<y.top-2?(c(m.right,m.top,null,m.bottom),c(s,y.top,y.left,y.bottom)):c(m.right,m.top,y.left-m.right,m.bottom)),m.bottom<y.top&&c(s,m.bottom,null,y.top)}n.appendChild(o)}function xr(e){if(e.state.focused){var t=e.display;clearInterval(t.blinker);var n=!0;t.cursorDiv.style.visibility="",e.options.cursorBlinkRate>0?t.blinker=setInterval((function(){e.hasFocus()||Sr(e),t.cursorDiv.style.visibility=(n=!n)?"":"hidden"}),e.options.cursorBlinkRate):e.options.cursorBlinkRate<0&&(t.cursorDiv.style.visibility="hidden")}}function kr(e){e.state.focused||(e.display.input.focus(),jr(e))}function Or(e){e.state.delayingBlurEvent=!0,setTimeout((function(){e.state.delayingBlurEvent&&(e.state.delayingBlurEvent=!1,Sr(e))}),100)}function jr(e,t){e.state.delayingBlurEvent&&(e.state.delayingBlurEvent=!1),"nocursor"!=e.options.readOnly&&(e.state.focused||(he(e,"focus",e,t),e.state.focused=!0,L(e.display.wrapper,"CodeMirror-focused"),e.curOp||e.display.selForContextMenu==e.doc.sel||(e.display.input.reset(),l&&setTimeout((function(){return e.display.input.reset(!0)}),20)),e.display.input.receivedFocus()),xr(e))}function Sr(e,t){e.state.delayingBlurEvent||(e.state.focused&&(he(e,"blur",e,t),e.state.focused=!1,C(e.display.wrapper,"CodeMirror-focused")),clearInterval(e.display.blinker),setTimeout((function(){e.state.focused||(e.display.shift=!1)}),150))}function Cr(e){for(var t=e.display,n=t.lineDiv.offsetTop,r=0;r<t.view.length;r++){var i=t.view[r],o=e.options.lineWrapping,l=void 0,u=0;if(!i.hidden){if(a&&s<8){var c=i.node.offsetTop+i.node.offsetHeight;l=c-n,n=c}else{var f=i.node.getBoundingClientRect();l=f.bottom-f.top,!o&&i.text.firstChild&&(u=i.text.firstChild.getBoundingClientRect().right-f.left-1)}var d=i.line.height-l;if((d>.005||d<-.005)&&(Je(i.line,l),Pr(i.line),i.rest))for(var p=0;p<i.rest.length;p++)Pr(i.rest[p]);if(u>e.display.sizerWidth){var h=Math.ceil(u/ir(e.display));h>e.display.maxLineLength&&(e.display.maxLineLength=h,e.display.maxLine=i.line,e.display.maxLineChanged=!0)}}}}function Pr(e){if(e.widgets)for(var t=0;t<e.widgets.length;++t){var n=e.widgets[t],r=n.node.parentNode;r&&(n.height=r.offsetHeight)}}function Ar(e,t,n){var r=n&&null!=n.top?Math.max(0,n.top):e.scroller.scrollTop;r=Math.floor(r-On(e));var i=n&&null!=n.bottom?n.bottom:r+e.wrapper.clientHeight,o=Xe(t,r),a=Xe(t,i);if(n&&n.ensure){var s=n.ensure.from.line,l=n.ensure.to.line;s<o?(o=s,a=Xe(t,Bt(Ue(t,s))+e.wrapper.clientHeight)):Math.min(l,t.lastLine())>=a&&(o=Xe(t,Bt(Ue(t,l))-e.wrapper.clientHeight),a=l)}return{from:o,to:Math.max(a,o+1)}}function Mr(e,t){var n=e.display,r=rr(e.display);t.top<0&&(t.top=0);var i=e.curOp&&null!=e.curOp.scrollTop?e.curOp.scrollTop:n.scroller.scrollTop,o=An(e),a={};t.bottom-t.top>o&&(t.bottom=t.top+o);var s=e.doc.height+jn(n),l=t.top<r,u=t.bottom>s-r;if(t.top<i)a.scrollTop=l?0:t.top;else if(t.bottom>i+o){var c=Math.min(t.top,(u?s:t.bottom)-o);c!=i&&(a.scrollTop=c)}var f=e.curOp&&null!=e.curOp.scrollLeft?e.curOp.scrollLeft:n.scroller.scrollLeft,d=Pn(e)-(e.options.fixedGutter?n.gutters.offsetWidth:0),p=t.right-t.left>d;return p&&(t.right=t.left+d),t.left<10?a.scrollLeft=0:t.left<f?a.scrollLeft=Math.max(0,t.left-(p?0:10)):t.right>d+f-3&&(a.scrollLeft=t.right+(p?0:10)-d),a}function _r(e,t){null!=t&&(Lr(e),e.curOp.scrollTop=(null==e.curOp.scrollTop?e.doc.scrollTop:e.curOp.scrollTop)+t)}function Tr(e){Lr(e);var t=e.getCursor();e.curOp.scrollToPos={from:t,to:t,margin:e.options.cursorScrollMargin}}function Er(e,t,n){null==t&&null==n||Lr(e),null!=t&&(e.curOp.scrollLeft=t),null!=n&&(e.curOp.scrollTop=n)}function Lr(e){var t=e.curOp.scrollToPos;t&&(e.curOp.scrollToPos=null,Nr(e,Kn(e,t.from),Kn(e,t.to),t.margin))}function Nr(e,t,n,r){var i=Mr(e,{left:Math.min(t.left,n.left),top:Math.min(t.top,n.top)-r,right:Math.max(t.right,n.right),bottom:Math.max(t.bottom,n.bottom)+r});Er(e,i.scrollLeft,i.scrollTop)}function Dr(e,t){Math.abs(e.doc.scrollTop-t)<2||(n||li(e,{top:t}),Ir(e,t,!0),n&&li(e),ri(e,100))}function Ir(e,t,n){t=Math.max(0,Math.min(e.display.scroller.scrollHeight-e.display.scroller.clientHeight,t)),(e.display.scroller.scrollTop!=t||n)&&(e.doc.scrollTop=t,e.display.scrollbars.setScrollTop(t),e.display.scroller.scrollTop!=t&&(e.display.scroller.scrollTop=t))}function Fr(e,t,n,r){t=Math.max(0,Math.min(t,e.display.scroller.scrollWidth-e.display.scroller.clientWidth)),(n?t==e.doc.scrollLeft:Math.abs(e.doc.scrollLeft-t)<2)&&!r||(e.doc.scrollLeft=t,fi(e),e.display.scroller.scrollLeft!=t&&(e.display.scroller.scrollLeft=t),e.display.scrollbars.setScrollLeft(t))}function Rr(e){var t=e.display,n=t.gutters.offsetWidth,r=Math.round(e.doc.height+jn(e.display));return{clientHeight:t.scroller.clientHeight,viewHeight:t.wrapper.clientHeight,scrollWidth:t.scroller.scrollWidth,clientWidth:t.scroller.clientWidth,viewWidth:t.wrapper.clientWidth,barLeft:e.options.fixedGutter?n:0,docHeight:r,scrollHeight:r+Cn(e)+t.barHeight,nativeBarWidth:t.nativeBarWidth,gutterWidth:n}}var $r=function(e,t,n){this.cm=n;var r=this.vert=M("div",[M("div",null,null,"min-width: 1px")],"CodeMirror-vscrollbar"),i=this.horiz=M("div",[M("div",null,null,"height: 100%; min-height: 1px")],"CodeMirror-hscrollbar");r.tabIndex=i.tabIndex=-1,e(r),e(i),fe(r,"scroll",(function(){r.clientHeight&&t(r.scrollTop,"vertical")})),fe(i,"scroll",(function(){i.clientWidth&&t(i.scrollLeft,"horizontal")})),this.checkedZeroWidth=!1,a&&s<8&&(this.horiz.style.minHeight=this.vert.style.minWidth="18px")};$r.prototype.update=function(e){var t=e.scrollWidth>e.clientWidth+1,n=e.scrollHeight>e.clientHeight+1,r=e.nativeBarWidth;if(n){this.vert.style.display="block",this.vert.style.bottom=t?r+"px":"0";var i=e.viewHeight-(t?r:0);this.vert.firstChild.style.height=Math.max(0,e.scrollHeight-e.clientHeight+i)+"px"}else this.vert.style.display="",this.vert.firstChild.style.height="0";if(t){this.horiz.style.display="block",this.horiz.style.right=n?r+"px":"0",this.horiz.style.left=e.barLeft+"px";var o=e.viewWidth-e.barLeft-(n?r:0);this.horiz.firstChild.style.width=Math.max(0,e.scrollWidth-e.clientWidth+o)+"px"}else this.horiz.style.display="",this.horiz.firstChild.style.width="0";return!this.checkedZeroWidth&&e.clientHeight>0&&(0==r&&this.zeroWidthHack(),this.checkedZeroWidth=!0),{right:n?r:0,bottom:t?r:0}},$r.prototype.setScrollLeft=function(e){this.horiz.scrollLeft!=e&&(this.horiz.scrollLeft=e),this.disableHoriz&&this.enableZeroWidthBar(this.horiz,this.disableHoriz,"horiz")},$r.prototype.setScrollTop=function(e){this.vert.scrollTop!=e&&(this.vert.scrollTop=e),this.disableVert&&this.enableZeroWidthBar(this.vert,this.disableVert,"vert")},$r.prototype.zeroWidthHack=function(){var e=y&&!p?"12px":"18px";this.horiz.style.height=this.vert.style.width=e,this.horiz.style.pointerEvents=this.vert.style.pointerEvents="none",this.disableHoriz=new $,this.disableVert=new $},$r.prototype.enableZeroWidthBar=function(e,t,n){e.style.pointerEvents="auto",t.set(1e3,(function r(){var i=e.getBoundingClientRect();("vert"==n?document.elementFromPoint(i.right-1,(i.top+i.bottom)/2):document.elementFromPoint((i.right+i.left)/2,i.bottom-1))!=e?e.style.pointerEvents="none":t.set(1e3,r)}))},$r.prototype.clear=function(){var e=this.horiz.parentNode;e.removeChild(this.horiz),e.removeChild(this.vert)};var Hr=function(){};function Wr(e,t){t||(t=Rr(e));var n=e.display.barWidth,r=e.display.barHeight;zr(e,t);for(var i=0;i<4&&n!=e.display.barWidth||r!=e.display.barHeight;i++)n!=e.display.barWidth&&e.options.lineWrapping&&Cr(e),zr(e,Rr(e)),n=e.display.barWidth,r=e.display.barHeight}function zr(e,t){var n=e.display,r=n.scrollbars.update(t);n.sizer.style.paddingRight=(n.barWidth=r.right)+"px",n.sizer.style.paddingBottom=(n.barHeight=r.bottom)+"px",n.heightForcer.style.borderBottom=r.bottom+"px solid transparent",r.right&&r.bottom?(n.scrollbarFiller.style.display="block",n.scrollbarFiller.style.height=r.bottom+"px",n.scrollbarFiller.style.width=r.right+"px"):n.scrollbarFiller.style.display="",r.bottom&&e.options.coverGutterNextToScrollbar&&e.options.fixedGutter?(n.gutterFiller.style.display="block",n.gutterFiller.style.height=r.bottom+"px",n.gutterFiller.style.width=t.gutterWidth+"px"):n.gutterFiller.style.display=""}Hr.prototype.update=function(){return{bottom:0,right:0}},Hr.prototype.setScrollLeft=function(){},Hr.prototype.setScrollTop=function(){},Hr.prototype.clear=function(){};var Br={native:$r,null:Hr};function qr(e){e.display.scrollbars&&(e.display.scrollbars.clear(),e.display.scrollbars.addClass&&C(e.display.wrapper,e.display.scrollbars.addClass)),e.display.scrollbars=new Br[e.options.scrollbarStyle]((function(t){e.display.wrapper.insertBefore(t,e.display.scrollbarFiller),fe(t,"mousedown",(function(){e.state.focused&&setTimeout((function(){return e.display.input.focus()}),0)})),t.setAttribute("cm-not-content","true")}),(function(t,n){"horizontal"==n?Fr(e,t):Dr(e,t)}),e),e.display.scrollbars.addClass&&L(e.display.wrapper,e.display.scrollbars.addClass)}var Vr=0;function Ur(e){var t;e.curOp={cm:e,viewChanged:!1,startHeight:e.doc.height,forceUpdate:!1,updateInput:0,typing:!1,changeObjs:null,cursorActivityHandlers:null,cursorActivityCalled:0,selectionChanged:!1,updateMaxLine:!1,scrollLeft:null,scrollTop:null,scrollToPos:null,focus:!1,id:++Vr},t=e.curOp,an?an.ops.push(t):t.ownsGroup=an={ops:[t],delayedCallbacks:[]}}function Gr(e){var t=e.curOp;t&&function(e,t){var n=e.ownsGroup;if(n)try{!function(e){var t=e.delayedCallbacks,n=0;do{for(;n<t.length;n++)t[n].call(null);for(var r=0;r<e.ops.length;r++){var i=e.ops[r];if(i.cursorActivityHandlers)for(;i.cursorActivityCalled<i.cursorActivityHandlers.length;)i.cursorActivityHandlers[i.cursorActivityCalled++].call(null,i.cm)}}while(n<t.length)}(n)}finally{an=null,t(n)}}(t,(function(e){for(var t=0;t<e.ops.length;t++)e.ops[t].cm.curOp=null;!function(e){for(var t=e.ops,n=0;n<t.length;n++)Kr(t[n]);for(var r=0;r<t.length;r++)Jr(t[r]);for(var i=0;i<t.length;i++)Yr(t[i]);for(var o=0;o<t.length;o++)Xr(t[o]);for(var a=0;a<t.length;a++)Zr(t[a])}(e)}))}function Kr(e){var t=e.cm,n=t.display;!function(e){var t=e.display;!t.scrollbarsClipped&&t.scroller.offsetWidth&&(t.nativeBarWidth=t.scroller.offsetWidth-t.scroller.clientWidth,t.heightForcer.style.height=Cn(e)+"px",t.sizer.style.marginBottom=-t.nativeBarWidth+"px",t.sizer.style.borderRightWidth=Cn(e)+"px",t.scrollbarsClipped=!0)}(t),e.updateMaxLine&&Vt(t),e.mustUpdate=e.viewChanged||e.forceUpdate||null!=e.scrollTop||e.scrollToPos&&(e.scrollToPos.from.line<n.viewFrom||e.scrollToPos.to.line>=n.viewTo)||n.maxLineChanged&&t.options.lineWrapping,e.update=e.mustUpdate&&new oi(t,e.mustUpdate&&{top:e.scrollTop,ensure:e.scrollToPos},e.forceUpdate)}function Jr(e){e.updatedDisplay=e.mustUpdate&&ai(e.cm,e.update)}function Yr(e){var t=e.cm,n=t.display;e.updatedDisplay&&Cr(t),e.barMeasure=Rr(t),n.maxLineChanged&&!t.options.lineWrapping&&(e.adjustWidthTo=_n(t,n.maxLine,n.maxLine.text.length).left+3,t.display.sizerWidth=e.adjustWidthTo,e.barMeasure.scrollWidth=Math.max(n.scroller.clientWidth,n.sizer.offsetLeft+e.adjustWidthTo+Cn(t)+t.display.barWidth),e.maxScrollLeft=Math.max(0,n.sizer.offsetLeft+e.adjustWidthTo-Pn(t))),(e.updatedDisplay||e.selectionChanged)&&(e.preparedSelection=n.input.prepareSelection())}function Xr(e){var t=e.cm;null!=e.adjustWidthTo&&(t.display.sizer.style.minWidth=e.adjustWidthTo+"px",e.maxScrollLeft<t.doc.scrollLeft&&Fr(t,Math.min(t.display.scroller.scrollLeft,e.maxScrollLeft),!0),t.display.maxLineChanged=!1);var n=e.focus&&e.focus==E();e.preparedSelection&&t.display.input.showSelection(e.preparedSelection,n),(e.updatedDisplay||e.startHeight!=t.doc.height)&&Wr(t,e.barMeasure),e.updatedDisplay&&ci(t,e.barMeasure),e.selectionChanged&&xr(t),t.state.focused&&e.updateInput&&t.display.input.reset(e.typing),n&&kr(e.cm)}function Zr(e){var t=e.cm,n=t.display,r=t.doc;(e.updatedDisplay&&si(t,e.update),null==n.wheelStartX||null==e.scrollTop&&null==e.scrollLeft&&!e.scrollToPos||(n.wheelStartX=n.wheelStartY=null),null!=e.scrollTop&&Ir(t,e.scrollTop,e.forceScroll),null!=e.scrollLeft&&Fr(t,e.scrollLeft,!0,!0),e.scrollToPos)&&function(e,t){if(!ge(e,"scrollCursorIntoView")){var n=e.display,r=n.sizer.getBoundingClientRect(),i=null;if(t.top+r.top<0?i=!0:t.bottom+r.top>(window.innerHeight||document.documentElement.clientHeight)&&(i=!1),null!=i&&!h){var o=M("div","​",null,"position: absolute;\n                         top: "+(t.top-n.viewOffset-On(e.display))+"px;\n                         height: "+(t.bottom-t.top+Cn(e)+n.barHeight)+"px;\n                         left: "+t.left+"px; width: "+Math.max(2,t.right-t.left)+"px;");e.display.lineSpace.appendChild(o),o.scrollIntoView(i),e.display.lineSpace.removeChild(o)}}}(t,function(e,t,n,r){var i;null==r&&(r=0),e.options.lineWrapping||t!=n||(n="before"==(t=t.ch?et(t.line,"before"==t.sticky?t.ch-1:t.ch,"after"):t).sticky?et(t.line,t.ch+1,"before"):t);for(var o=0;o<5;o++){var a=!1,s=Gn(e,t),l=n&&n!=t?Gn(e,n):s,u=Mr(e,i={left:Math.min(s.left,l.left),top:Math.min(s.top,l.top)-r,right:Math.max(s.left,l.left),bottom:Math.max(s.bottom,l.bottom)+r}),c=e.doc.scrollTop,f=e.doc.scrollLeft;if(null!=u.scrollTop&&(Dr(e,u.scrollTop),Math.abs(e.doc.scrollTop-c)>1&&(a=!0)),null!=u.scrollLeft&&(Fr(e,u.scrollLeft),Math.abs(e.doc.scrollLeft-f)>1&&(a=!0)),!a)break}return i}(t,st(r,e.scrollToPos.from),st(r,e.scrollToPos.to),e.scrollToPos.margin));var i=e.maybeHiddenMarkers,o=e.maybeUnhiddenMarkers;if(i)for(var a=0;a<i.length;++a)i[a].lines.length||he(i[a],"hide");if(o)for(var s=0;s<o.length;++s)o[s].lines.length&&he(o[s],"unhide");n.wrapper.offsetHeight&&(r.scrollTop=t.display.scroller.scrollTop),e.changeObjs&&he(t,"changes",t,e.changeObjs),e.update&&e.update.finish()}function Qr(e,t){if(e.curOp)return t();Ur(e);try{return t()}finally{Gr(e)}}function ei(e,t){return function(){if(e.curOp)return t.apply(e,arguments);Ur(e);try{return t.apply(e,arguments)}finally{Gr(e)}}}function ti(e){return function(){if(this.curOp)return e.apply(this,arguments);Ur(this);try{return e.apply(this,arguments)}finally{Gr(this)}}}function ni(e){return function(){var t=this.cm;if(!t||t.curOp)return e.apply(this,arguments);Ur(t);try{return e.apply(this,arguments)}finally{Gr(t)}}}function ri(e,t){e.doc.highlightFrontier<e.display.viewTo&&e.state.highlight.set(t,I(ii,e))}function ii(e){var t=e.doc;if(!(t.highlightFrontier>=e.display.viewTo)){var n=+new Date+e.options.workTime,r=pt(e,t.highlightFrontier),i=[];t.iter(r.line,Math.min(t.first+t.size,e.display.viewTo+500),(function(o){if(r.line>=e.display.viewFrom){var a=o.styles,s=o.text.length>e.options.maxHighlightLength?ze(t.mode,r.state):null,l=ft(e,o,r,!0);s&&(r.state=s),o.styles=l.styles;var u=o.styleClasses,c=l.classes;c?o.styleClasses=c:u&&(o.styleClasses=null);for(var f=!a||a.length!=o.styles.length||u!=c&&(!u||!c||u.bgClass!=c.bgClass||u.textClass!=c.textClass),d=0;!f&&d<a.length;++d)f=a[d]!=o.styles[d];f&&i.push(r.line),o.stateAfter=r.save(),r.nextLine()}else o.text.length<=e.options.maxHighlightLength&&ht(e,o.text,r),o.stateAfter=r.line%5==0?r.save():null,r.nextLine();if(+new Date>n)return ri(e,e.options.workDelay),!0})),t.highlightFrontier=r.line,t.modeFrontier=Math.max(t.modeFrontier,r.line),i.length&&Qr(e,(function(){for(var t=0;t<i.length;t++)dr(e,i[t],"text")}))}}var oi=function(e,t,n){var r=e.display;this.viewport=t,this.visible=Ar(r,e.doc,t),this.editorIsHidden=!r.wrapper.offsetWidth,this.wrapperHeight=r.wrapper.clientHeight,this.wrapperWidth=r.wrapper.clientWidth,this.oldDisplayWidth=Pn(e),this.force=n,this.dims=or(e),this.events=[]};function ai(e,t){var n=e.display,r=e.doc;if(t.editorIsHidden)return pr(e),!1;if(!t.force&&t.visible.from>=n.viewFrom&&t.visible.to<=n.viewTo&&(null==n.updateLineNumbers||n.updateLineNumbers>=n.viewTo)&&n.renderedView==n.view&&0==gr(e))return!1;di(e)&&(pr(e),t.dims=or(e));var i=r.first+r.size,o=Math.max(t.visible.from-e.options.viewportMargin,r.first),a=Math.min(i,t.visible.to+e.options.viewportMargin);n.viewFrom<o&&o-n.viewFrom<20&&(o=Math.max(r.first,n.viewFrom)),n.viewTo>a&&n.viewTo-a<20&&(a=Math.min(i,n.viewTo)),kt&&(o=$t(e.doc,o),a=Ht(e.doc,a));var s=o!=n.viewFrom||a!=n.viewTo||n.lastWrapHeight!=t.wrapperHeight||n.lastWrapWidth!=t.wrapperWidth;!function(e,t,n){var r=e.display;0==r.view.length||t>=r.viewTo||n<=r.viewFrom?(r.view=on(e,t,n),r.viewFrom=t):(r.viewFrom>t?r.view=on(e,t,r.viewFrom).concat(r.view):r.viewFrom<t&&(r.view=r.view.slice(cr(e,t))),r.viewFrom=t,r.viewTo<n?r.view=r.view.concat(on(e,r.viewTo,n)):r.viewTo>n&&(r.view=r.view.slice(0,cr(e,n)))),r.viewTo=n}(e,o,a),n.viewOffset=Bt(Ue(e.doc,n.viewFrom)),e.display.mover.style.top=n.viewOffset+"px";var u=gr(e);if(!s&&0==u&&!t.force&&n.renderedView==n.view&&(null==n.updateLineNumbers||n.updateLineNumbers>=n.viewTo))return!1;var c=function(e){if(e.hasFocus())return null;var t=E();if(!t||!T(e.display.lineDiv,t))return null;var n={activeElt:t};if(window.getSelection){var r=window.getSelection();r.anchorNode&&r.extend&&T(e.display.lineDiv,r.anchorNode)&&(n.anchorNode=r.anchorNode,n.anchorOffset=r.anchorOffset,n.focusNode=r.focusNode,n.focusOffset=r.focusOffset)}return n}(e);return u>4&&(n.lineDiv.style.display="none"),function(e,t,n){var r=e.display,i=e.options.lineNumbers,o=r.lineDiv,a=o.firstChild;function s(t){var n=t.nextSibling;return l&&y&&e.display.currentWheelTarget==t?t.style.display="none":t.parentNode.removeChild(t),n}for(var u=r.view,c=r.viewFrom,f=0;f<u.length;f++){var d=u[f];if(d.hidden);else if(d.node&&d.node.parentNode==o){for(;a!=d.node;)a=s(a);var p=i&&null!=t&&t<=c&&d.lineNumber;d.changes&&(H(d.changes,"gutter")>-1&&(p=!1),cn(e,d,c,n)),p&&(P(d.lineNumber),d.lineNumber.appendChild(document.createTextNode(Qe(e.options,c)))),a=d.node.nextSibling}else{var h=mn(e,d,c,n);o.insertBefore(h,a)}c+=d.size}for(;a;)a=s(a)}(e,n.updateLineNumbers,t.dims),u>4&&(n.lineDiv.style.display=""),n.renderedView=n.view,function(e){if(e&&e.activeElt&&e.activeElt!=E()&&(e.activeElt.focus(),!/^(INPUT|TEXTAREA)$/.test(e.activeElt.nodeName)&&e.anchorNode&&T(document.body,e.anchorNode)&&T(document.body,e.focusNode))){var t=window.getSelection(),n=document.createRange();n.setEnd(e.anchorNode,e.anchorOffset),n.collapse(!1),t.removeAllRanges(),t.addRange(n),t.extend(e.focusNode,e.focusOffset)}}(c),P(n.cursorDiv),P(n.selectionDiv),n.gutters.style.height=n.sizer.style.minHeight=0,s&&(n.lastWrapHeight=t.wrapperHeight,n.lastWrapWidth=t.wrapperWidth,ri(e,400)),n.updateLineNumbers=null,!0}function si(e,t){for(var n=t.viewport,r=!0;;r=!1){if(r&&e.options.lineWrapping&&t.oldDisplayWidth!=Pn(e))r&&(t.visible=Ar(e.display,e.doc,n));else if(n&&null!=n.top&&(n={top:Math.min(e.doc.height+jn(e.display)-An(e),n.top)}),t.visible=Ar(e.display,e.doc,n),t.visible.from>=e.display.viewFrom&&t.visible.to<=e.display.viewTo)break;if(!ai(e,t))break;Cr(e);var i=Rr(e);vr(e),Wr(e,i),ci(e,i),t.force=!1}t.signal(e,"update",e),e.display.viewFrom==e.display.reportedViewFrom&&e.display.viewTo==e.display.reportedViewTo||(t.signal(e,"viewportChange",e,e.display.viewFrom,e.display.viewTo),e.display.reportedViewFrom=e.display.viewFrom,e.display.reportedViewTo=e.display.viewTo)}function li(e,t){var n=new oi(e,t);if(ai(e,n)){Cr(e),si(e,n);var r=Rr(e);vr(e),Wr(e,r),ci(e,r),n.finish()}}function ui(e){var t=e.gutters.offsetWidth;e.sizer.style.marginLeft=t+"px"}function ci(e,t){e.display.sizer.style.minHeight=t.docHeight+"px",e.display.heightForcer.style.top=t.docHeight+"px",e.display.gutters.style.height=t.docHeight+e.display.barHeight+Cn(e)+"px"}function fi(e){var t=e.display,n=t.view;if(t.alignWidgets||t.gutters.firstChild&&e.options.fixedGutter){for(var r=ar(t)-t.scroller.scrollLeft+e.doc.scrollLeft,i=t.gutters.offsetWidth,o=r+"px",a=0;a<n.length;a++)if(!n[a].hidden){e.options.fixedGutter&&(n[a].gutter&&(n[a].gutter.style.left=o),n[a].gutterBackground&&(n[a].gutterBackground.style.left=o));var s=n[a].alignable;if(s)for(var l=0;l<s.length;l++)s[l].style.left=o}e.options.fixedGutter&&(t.gutters.style.left=r+i+"px")}}function di(e){if(!e.options.lineNumbers)return!1;var t=e.doc,n=Qe(e.options,t.first+t.size-1),r=e.display;if(n.length!=r.lineNumChars){var i=r.measure.appendChild(M("div",[M("div",n)],"CodeMirror-linenumber CodeMirror-gutter-elt")),o=i.firstChild.offsetWidth,a=i.offsetWidth-o;return r.lineGutter.style.width="",r.lineNumInnerWidth=Math.max(o,r.lineGutter.offsetWidth-a)+1,r.lineNumWidth=r.lineNumInnerWidth+a,r.lineNumChars=r.lineNumInnerWidth?n.length:-1,r.lineGutter.style.width=r.lineNumWidth+"px",ui(e.display),!0}return!1}function pi(e,t){for(var n=[],r=!1,i=0;i<e.length;i++){var o=e[i],a=null;if("string"!=typeof o&&(a=o.style,o=o.className),"CodeMirror-linenumbers"==o){if(!t)continue;r=!0}n.push({className:o,style:a})}return t&&!r&&n.push({className:"CodeMirror-linenumbers",style:null}),n}function hi(e){var t=e.gutters,n=e.gutterSpecs;P(t),e.lineGutter=null;for(var r=0;r<n.length;++r){var i=n[r],o=i.className,a=i.style,s=t.appendChild(M("div",null,"CodeMirror-gutter "+o));a&&(s.style.cssText=a),"CodeMirror-linenumbers"==o&&(e.lineGutter=s,s.style.width=(e.lineNumWidth||1)+"px")}t.style.display=n.length?"":"none",ui(e)}function gi(e){hi(e.display),fr(e),fi(e)}function vi(e,t,r,i){var o=this;this.input=r,o.scrollbarFiller=M("div",null,"CodeMirror-scrollbar-filler"),o.scrollbarFiller.setAttribute("cm-not-content","true"),o.gutterFiller=M("div",null,"CodeMirror-gutter-filler"),o.gutterFiller.setAttribute("cm-not-content","true"),o.lineDiv=_("div",null,"CodeMirror-code"),o.selectionDiv=M("div",null,null,"position: relative; z-index: 1"),o.cursorDiv=M("div",null,"CodeMirror-cursors"),o.measure=M("div",null,"CodeMirror-measure"),o.lineMeasure=M("div",null,"CodeMirror-measure"),o.lineSpace=_("div",[o.measure,o.lineMeasure,o.selectionDiv,o.cursorDiv,o.lineDiv],null,"position: relative; outline: none");var u=_("div",[o.lineSpace],"CodeMirror-lines");o.mover=M("div",[u],null,"position: relative"),o.sizer=M("div",[o.mover],"CodeMirror-sizer"),o.sizerWidth=null,o.heightForcer=M("div",null,null,"position: absolute; height: 50px; width: 1px;"),o.gutters=M("div",null,"CodeMirror-gutters"),o.lineGutter=null,o.scroller=M("div",[o.sizer,o.heightForcer,o.gutters],"CodeMirror-scroll"),o.scroller.setAttribute("tabIndex","-1"),o.wrapper=M("div",[o.scrollbarFiller,o.gutterFiller,o.scroller],"CodeMirror"),a&&s<8&&(o.gutters.style.zIndex=-1,o.scroller.style.paddingRight=0),l||n&&m||(o.scroller.draggable=!0),e&&(e.appendChild?e.appendChild(o.wrapper):e(o.wrapper)),o.viewFrom=o.viewTo=t.first,o.reportedViewFrom=o.reportedViewTo=t.first,o.view=[],o.renderedView=null,o.externalMeasured=null,o.viewOffset=0,o.lastWrapHeight=o.lastWrapWidth=0,o.updateLineNumbers=null,o.nativeBarWidth=o.barHeight=o.barWidth=0,o.scrollbarsClipped=!1,o.lineNumWidth=o.lineNumInnerWidth=o.lineNumChars=null,o.alignWidgets=!1,o.cachedCharWidth=o.cachedTextHeight=o.cachedPaddingH=null,o.maxLine=null,o.maxLineLength=0,o.maxLineChanged=!1,o.wheelDX=o.wheelDY=o.wheelStartX=o.wheelStartY=null,o.shift=!1,o.selForContextMenu=null,o.activeTouch=null,o.gutterSpecs=pi(i.gutters,i.lineNumbers),hi(o),r.init(o)}oi.prototype.signal=function(e,t){me(e,t)&&this.events.push(arguments)},oi.prototype.finish=function(){for(var e=0;e<this.events.length;e++)he.apply(null,this.events[e])};var mi=0,yi=null;function bi(e){var t=e.wheelDeltaX,n=e.wheelDeltaY;return null==t&&e.detail&&e.axis==e.HORIZONTAL_AXIS&&(t=e.detail),null==n&&e.detail&&e.axis==e.VERTICAL_AXIS?n=e.detail:null==n&&(n=e.wheelDelta),{x:t,y:n}}function wi(e){var t=bi(e);return t.x*=yi,t.y*=yi,t}function xi(e,t){var r=bi(t),i=r.x,o=r.y,a=e.display,s=a.scroller,u=s.scrollWidth>s.clientWidth,c=s.scrollHeight>s.clientHeight;if(i&&u||o&&c){if(o&&y&&l)e:for(var d=t.target,p=a.view;d!=s;d=d.parentNode)for(var h=0;h<p.length;h++)if(p[h].node==d){e.display.currentWheelTarget=d;break e}if(i&&!n&&!f&&null!=yi)return o&&c&&Dr(e,Math.max(0,s.scrollTop+o*yi)),Fr(e,Math.max(0,s.scrollLeft+i*yi)),(!o||o&&c)&&be(t),void(a.wheelStartX=null);if(o&&null!=yi){var g=o*yi,v=e.doc.scrollTop,m=v+a.wrapper.clientHeight;g<0?v=Math.max(0,v+g-50):m=Math.min(e.doc.height,m+g+50),li(e,{top:v,bottom:m})}mi<20&&(null==a.wheelStartX?(a.wheelStartX=s.scrollLeft,a.wheelStartY=s.scrollTop,a.wheelDX=i,a.wheelDY=o,setTimeout((function(){if(null!=a.wheelStartX){var e=s.scrollLeft-a.wheelStartX,t=s.scrollTop-a.wheelStartY,n=t&&a.wheelDY&&t/a.wheelDY||e&&a.wheelDX&&e/a.wheelDX;a.wheelStartX=a.wheelStartY=null,n&&(yi=(yi*mi+n)/(mi+1),++mi)}}),200)):(a.wheelDX+=i,a.wheelDY+=o))}}a?yi=-.53:n?yi=15:c?yi=-.7:d&&(yi=-1/3);var ki=function(e,t){this.ranges=e,this.primIndex=t};ki.prototype.primary=function(){return this.ranges[this.primIndex]},ki.prototype.equals=function(e){if(e==this)return!0;if(e.primIndex!=this.primIndex||e.ranges.length!=this.ranges.length)return!1;for(var t=0;t<this.ranges.length;t++){var n=this.ranges[t],r=e.ranges[t];if(!nt(n.anchor,r.anchor)||!nt(n.head,r.head))return!1}return!0},ki.prototype.deepCopy=function(){for(var e=[],t=0;t<this.ranges.length;t++)e[t]=new Oi(rt(this.ranges[t].anchor),rt(this.ranges[t].head));return new ki(e,this.primIndex)},ki.prototype.somethingSelected=function(){for(var e=0;e<this.ranges.length;e++)if(!this.ranges[e].empty())return!0;return!1},ki.prototype.contains=function(e,t){t||(t=e);for(var n=0;n<this.ranges.length;n++){var r=this.ranges[n];if(tt(t,r.from())>=0&&tt(e,r.to())<=0)return n}return-1};var Oi=function(e,t){this.anchor=e,this.head=t};function ji(e,t,n){var r=e&&e.options.selectionsMayTouch,i=t[n];t.sort((function(e,t){return tt(e.from(),t.from())})),n=H(t,i);for(var o=1;o<t.length;o++){var a=t[o],s=t[o-1],l=tt(s.to(),a.from());if(r&&!a.empty()?l>0:l>=0){var u=ot(s.from(),a.from()),c=it(s.to(),a.to()),f=s.empty()?a.from()==a.head:s.from()==s.head;o<=n&&--n,t.splice(--o,2,new Oi(f?c:u,f?u:c))}}return new ki(t,n)}function Si(e,t){return new ki([new Oi(e,t||e)],0)}function Ci(e){return e.text?et(e.from.line+e.text.length-1,K(e.text).length+(1==e.text.length?e.from.ch:0)):e.to}function Pi(e,t){if(tt(e,t.from)<0)return e;if(tt(e,t.to)<=0)return Ci(t);var n=e.line+t.text.length-(t.to.line-t.from.line)-1,r=e.ch;return e.line==t.to.line&&(r+=Ci(t).ch-t.to.ch),et(n,r)}function Ai(e,t){for(var n=[],r=0;r<e.sel.ranges.length;r++){var i=e.sel.ranges[r];n.push(new Oi(Pi(i.anchor,t),Pi(i.head,t)))}return ji(e.cm,n,e.sel.primIndex)}function Mi(e,t,n){return e.line==t.line?et(n.line,e.ch-t.ch+n.ch):et(n.line+(e.line-t.line),e.ch)}function _i(e){e.doc.mode=$e(e.options,e.doc.modeOption),Ti(e)}function Ti(e){e.doc.iter((function(e){e.stateAfter&&(e.stateAfter=null),e.styles&&(e.styles=null)})),e.doc.modeFrontier=e.doc.highlightFrontier=e.doc.first,ri(e,100),e.state.modeGen++,e.curOp&&fr(e)}function Ei(e,t){return 0==t.from.ch&&0==t.to.ch&&""==K(t.text)&&(!e.cm||e.cm.options.wholeLineUpdateBefore)}function Li(e,t,n,r){function i(e){return n?n[e]:null}function o(e,n,i){!function(e,t,n,r){e.text=t,e.stateAfter&&(e.stateAfter=null),e.styles&&(e.styles=null),null!=e.order&&(e.order=null),At(e),Mt(e,n);var i=r?r(e):1;i!=e.height&&Je(e,i)}(e,n,i,r),ln(e,"change",e,t)}function a(e,t){for(var n=[],o=e;o<t;++o)n.push(new Ut(u[o],i(o),r));return n}var s=t.from,l=t.to,u=t.text,c=Ue(e,s.line),f=Ue(e,l.line),d=K(u),p=i(u.length-1),h=l.line-s.line;if(t.full)e.insert(0,a(0,u.length)),e.remove(u.length,e.size-u.length);else if(Ei(e,t)){var g=a(0,u.length-1);o(f,f.text,p),h&&e.remove(s.line,h),g.length&&e.insert(s.line,g)}else if(c==f)if(1==u.length)o(c,c.text.slice(0,s.ch)+d+c.text.slice(l.ch),p);else{var v=a(1,u.length-1);v.push(new Ut(d+c.text.slice(l.ch),p,r)),o(c,c.text.slice(0,s.ch)+u[0],i(0)),e.insert(s.line+1,v)}else if(1==u.length)o(c,c.text.slice(0,s.ch)+u[0]+f.text.slice(l.ch),i(0)),e.remove(s.line+1,h);else{o(c,c.text.slice(0,s.ch)+u[0],i(0)),o(f,d+f.text.slice(l.ch),p);var m=a(1,u.length-1);h>1&&e.remove(s.line+1,h-1),e.insert(s.line+1,m)}ln(e,"change",e,t)}function Ni(e,t,n){!function e(r,i,o){if(r.linked)for(var a=0;a<r.linked.length;++a){var s=r.linked[a];if(s.doc!=i){var l=o&&s.sharedHist;n&&!l||(t(s.doc,l),e(s.doc,r,l))}}}(e,null,!0)}function Di(e,t){if(t.cm)throw new Error("This document is already in use.");e.doc=t,t.cm=e,lr(e),_i(e),Ii(e),e.options.lineWrapping||Vt(e),e.options.mode=t.modeOption,fr(e)}function Ii(e){("rtl"==e.doc.direction?L:C)(e.display.lineDiv,"CodeMirror-rtl")}function Fi(e){this.done=[],this.undone=[],this.undoDepth=1/0,this.lastModTime=this.lastSelTime=0,this.lastOp=this.lastSelOp=null,this.lastOrigin=this.lastSelOrigin=null,this.generation=this.maxGeneration=e||1}function Ri(e,t){var n={from:rt(t.from),to:Ci(t),text:Ge(e,t.from,t.to)};return Bi(e,n,t.from.line,t.to.line+1),Ni(e,(function(e){return Bi(e,n,t.from.line,t.to.line+1)}),!0),n}function $i(e){for(;e.length;){if(!K(e).ranges)break;e.pop()}}function Hi(e,t,n,r){var i=e.history;i.undone.length=0;var o,a,s=+new Date;if((i.lastOp==r||i.lastOrigin==t.origin&&t.origin&&("+"==t.origin.charAt(0)&&i.lastModTime>s-(e.cm?e.cm.options.historyEventDelay:500)||"*"==t.origin.charAt(0)))&&(o=function(e,t){return t?($i(e.done),K(e.done)):e.done.length&&!K(e.done).ranges?K(e.done):e.done.length>1&&!e.done[e.done.length-2].ranges?(e.done.pop(),K(e.done)):void 0}(i,i.lastOp==r)))a=K(o.changes),0==tt(t.from,t.to)&&0==tt(t.from,a.to)?a.to=Ci(t):o.changes.push(Ri(e,t));else{var l=K(i.done);for(l&&l.ranges||zi(e.sel,i.done),o={changes:[Ri(e,t)],generation:i.generation},i.done.push(o);i.done.length>i.undoDepth;)i.done.shift(),i.done[0].ranges||i.done.shift()}i.done.push(n),i.generation=++i.maxGeneration,i.lastModTime=i.lastSelTime=s,i.lastOp=i.lastSelOp=r,i.lastOrigin=i.lastSelOrigin=t.origin,a||he(e,"historyAdded")}function Wi(e,t,n,r){var i=e.history,o=r&&r.origin;n==i.lastSelOp||o&&i.lastSelOrigin==o&&(i.lastModTime==i.lastSelTime&&i.lastOrigin==o||function(e,t,n,r){var i=t.charAt(0);return"*"==i||"+"==i&&n.ranges.length==r.ranges.length&&n.somethingSelected()==r.somethingSelected()&&new Date-e.history.lastSelTime<=(e.cm?e.cm.options.historyEventDelay:500)}(e,o,K(i.done),t))?i.done[i.done.length-1]=t:zi(t,i.done),i.lastSelTime=+new Date,i.lastSelOrigin=o,i.lastSelOp=n,r&&!1!==r.clearRedo&&$i(i.undone)}function zi(e,t){var n=K(t);n&&n.ranges&&n.equals(e)||t.push(e)}function Bi(e,t,n,r){var i=t["spans_"+e.id],o=0;e.iter(Math.max(e.first,n),Math.min(e.first+e.size,r),(function(n){n.markedSpans&&((i||(i=t["spans_"+e.id]={}))[o]=n.markedSpans),++o}))}function qi(e){if(!e)return null;for(var t,n=0;n<e.length;++n)e[n].marker.explicitlyCleared?t||(t=e.slice(0,n)):t&&t.push(e[n]);return t?t.length?t:null:e}function Vi(e,t){var n=function(e,t){var n=t["spans_"+e.id];if(!n)return null;for(var r=[],i=0;i<t.text.length;++i)r.push(qi(n[i]));return r}(e,t),r=Ct(e,t);if(!n)return r;if(!r)return n;for(var i=0;i<n.length;++i){var o=n[i],a=r[i];if(o&&a)e:for(var s=0;s<a.length;++s){for(var l=a[s],u=0;u<o.length;++u)if(o[u].marker==l.marker)continue e;o.push(l)}else a&&(n[i]=a)}return n}function Ui(e,t,n){for(var r=[],i=0;i<e.length;++i){var o=e[i];if(o.ranges)r.push(n?ki.prototype.deepCopy.call(o):o);else{var a=o.changes,s=[];r.push({changes:s});for(var l=0;l<a.length;++l){var u=a[l],c=void 0;if(s.push({from:u.from,to:u.to,text:u.text}),t)for(var f in u)(c=f.match(/^spans_(\d+)$/))&&H(t,Number(c[1]))>-1&&(K(s)[f]=u[f],delete u[f])}}}return r}function Gi(e,t,n,r){if(r){var i=e.anchor;if(n){var o=tt(t,i)<0;o!=tt(n,i)<0?(i=t,t=n):o!=tt(t,n)<0&&(t=n)}return new Oi(i,t)}return new Oi(n||t,t)}function Ki(e,t,n,r,i){null==i&&(i=e.cm&&(e.cm.display.shift||e.extend)),Qi(e,new ki([Gi(e.sel.primary(),t,n,i)],0),r)}function Ji(e,t,n){for(var r=[],i=e.cm&&(e.cm.display.shift||e.extend),o=0;o<e.sel.ranges.length;o++)r[o]=Gi(e.sel.ranges[o],t[o],null,i);Qi(e,ji(e.cm,r,e.sel.primIndex),n)}function Yi(e,t,n,r){var i=e.sel.ranges.slice(0);i[t]=n,Qi(e,ji(e.cm,i,e.sel.primIndex),r)}function Xi(e,t,n,r){Qi(e,Si(t,n),r)}function Zi(e,t,n){var r=e.history.done,i=K(r);i&&i.ranges?(r[r.length-1]=t,eo(e,t,n)):Qi(e,t,n)}function Qi(e,t,n){eo(e,t,n),Wi(e,e.sel,e.cm?e.cm.curOp.id:NaN,n)}function eo(e,t,n){(me(e,"beforeSelectionChange")||e.cm&&me(e.cm,"beforeSelectionChange"))&&(t=function(e,t,n){var r={ranges:t.ranges,update:function(t){this.ranges=[];for(var n=0;n<t.length;n++)this.ranges[n]=new Oi(st(e,t[n].anchor),st(e,t[n].head))},origin:n&&n.origin};return he(e,"beforeSelectionChange",e,r),e.cm&&he(e.cm,"beforeSelectionChange",e.cm,r),r.ranges!=t.ranges?ji(e.cm,r.ranges,r.ranges.length-1):t}(e,t,n));var r=n&&n.bias||(tt(t.primary().head,e.sel.primary().head)<0?-1:1);to(e,ro(e,t,r,!0)),n&&!1===n.scroll||!e.cm||Tr(e.cm)}function to(e,t){t.equals(e.sel)||(e.sel=t,e.cm&&(e.cm.curOp.updateInput=1,e.cm.curOp.selectionChanged=!0,ve(e.cm)),ln(e,"cursorActivity",e))}function no(e){to(e,ro(e,e.sel,null,!1))}function ro(e,t,n,r){for(var i,o=0;o<t.ranges.length;o++){var a=t.ranges[o],s=t.ranges.length==e.sel.ranges.length&&e.sel.ranges[o],l=oo(e,a.anchor,s&&s.anchor,n,r),u=oo(e,a.head,s&&s.head,n,r);(i||l!=a.anchor||u!=a.head)&&(i||(i=t.ranges.slice(0,o)),i[o]=new Oi(l,u))}return i?ji(e.cm,i,t.primIndex):t}function io(e,t,n,r,i){var o=Ue(e,t.line);if(o.markedSpans)for(var a=0;a<o.markedSpans.length;++a){var s=o.markedSpans[a],l=s.marker,u="selectLeft"in l?!l.selectLeft:l.inclusiveLeft,c="selectRight"in l?!l.selectRight:l.inclusiveRight;if((null==s.from||(u?s.from<=t.ch:s.from<t.ch))&&(null==s.to||(c?s.to>=t.ch:s.to>t.ch))){if(i&&(he(l,"beforeCursorEnter"),l.explicitlyCleared)){if(o.markedSpans){--a;continue}break}if(!l.atomic)continue;if(n){var f=l.find(r<0?1:-1),d=void 0;if((r<0?c:u)&&(f=ao(e,f,-r,f&&f.line==t.line?o:null)),f&&f.line==t.line&&(d=tt(f,n))&&(r<0?d<0:d>0))return io(e,f,t,r,i)}var p=l.find(r<0?-1:1);return(r<0?u:c)&&(p=ao(e,p,r,p.line==t.line?o:null)),p?io(e,p,t,r,i):null}}return t}function oo(e,t,n,r,i){var o=r||1,a=io(e,t,n,o,i)||!i&&io(e,t,n,o,!0)||io(e,t,n,-o,i)||!i&&io(e,t,n,-o,!0);return a||(e.cantEdit=!0,et(e.first,0))}function ao(e,t,n,r){return n<0&&0==t.ch?t.line>e.first?st(e,et(t.line-1)):null:n>0&&t.ch==(r||Ue(e,t.line)).text.length?t.line<e.first+e.size-1?et(t.line+1,0):null:new et(t.line,t.ch+n)}function so(e){e.setSelection(et(e.firstLine(),0),et(e.lastLine()),z)}function lo(e,t,n){var r={canceled:!1,from:t.from,to:t.to,text:t.text,origin:t.origin,cancel:function(){return r.canceled=!0}};return n&&(r.update=function(t,n,i,o){t&&(r.from=st(e,t)),n&&(r.to=st(e,n)),i&&(r.text=i),void 0!==o&&(r.origin=o)}),he(e,"beforeChange",e,r),e.cm&&he(e.cm,"beforeChange",e.cm,r),r.canceled?(e.cm&&(e.cm.curOp.updateInput=2),null):{from:r.from,to:r.to,text:r.text,origin:r.origin}}function uo(e,t,n){if(e.cm){if(!e.cm.curOp)return ei(e.cm,uo)(e,t,n);if(e.cm.state.suppressEdits)return}if(!(me(e,"beforeChange")||e.cm&&me(e.cm,"beforeChange"))||(t=lo(e,t,!0))){var r=xt&&!n&&function(e,t,n){var r=null;if(e.iter(t.line,n.line+1,(function(e){if(e.markedSpans)for(var t=0;t<e.markedSpans.length;++t){var n=e.markedSpans[t].marker;!n.readOnly||r&&-1!=H(r,n)||(r||(r=[])).push(n)}})),!r)return null;for(var i=[{from:t,to:n}],o=0;o<r.length;++o)for(var a=r[o],s=a.find(0),l=0;l<i.length;++l){var u=i[l];if(!(tt(u.to,s.from)<0||tt(u.from,s.to)>0)){var c=[l,1],f=tt(u.from,s.from),d=tt(u.to,s.to);(f<0||!a.inclusiveLeft&&!f)&&c.push({from:u.from,to:s.from}),(d>0||!a.inclusiveRight&&!d)&&c.push({from:s.to,to:u.to}),i.splice.apply(i,c),l+=c.length-3}}return i}(e,t.from,t.to);if(r)for(var i=r.length-1;i>=0;--i)co(e,{from:r[i].from,to:r[i].to,text:i?[""]:t.text,origin:t.origin});else co(e,t)}}function co(e,t){if(1!=t.text.length||""!=t.text[0]||0!=tt(t.from,t.to)){var n=Ai(e,t);Hi(e,t,n,e.cm?e.cm.curOp.id:NaN),ho(e,t,n,Ct(e,t));var r=[];Ni(e,(function(e,n){n||-1!=H(r,e.history)||(yo(e.history,t),r.push(e.history)),ho(e,t,null,Ct(e,t))}))}}function fo(e,t,n){var r=e.cm&&e.cm.state.suppressEdits;if(!r||n){for(var i,o=e.history,a=e.sel,s="undo"==t?o.done:o.undone,l="undo"==t?o.undone:o.done,u=0;u<s.length&&(i=s[u],n?!i.ranges||i.equals(e.sel):i.ranges);u++);if(u!=s.length){for(o.lastOrigin=o.lastSelOrigin=null;;){if(!(i=s.pop()).ranges){if(r)return void s.push(i);break}if(zi(i,l),n&&!i.equals(e.sel))return void Qi(e,i,{clearRedo:!1});a=i}var c=[];zi(a,l),l.push({changes:c,generation:o.generation}),o.generation=i.generation||++o.maxGeneration;for(var f=me(e,"beforeChange")||e.cm&&me(e.cm,"beforeChange"),d=function(n){var r=i.changes[n];if(r.origin=t,f&&!lo(e,r,!1))return s.length=0,{};c.push(Ri(e,r));var o=n?Ai(e,r):K(s);ho(e,r,o,Vi(e,r)),!n&&e.cm&&e.cm.scrollIntoView({from:r.from,to:Ci(r)});var a=[];Ni(e,(function(e,t){t||-1!=H(a,e.history)||(yo(e.history,r),a.push(e.history)),ho(e,r,null,Vi(e,r))}))},p=i.changes.length-1;p>=0;--p){var h=d(p);if(h)return h.v}}}}function po(e,t){if(0!=t&&(e.first+=t,e.sel=new ki(J(e.sel.ranges,(function(e){return new Oi(et(e.anchor.line+t,e.anchor.ch),et(e.head.line+t,e.head.ch))})),e.sel.primIndex),e.cm)){fr(e.cm,e.first,e.first-t,t);for(var n=e.cm.display,r=n.viewFrom;r<n.viewTo;r++)dr(e.cm,r,"gutter")}}function ho(e,t,n,r){if(e.cm&&!e.cm.curOp)return ei(e.cm,ho)(e,t,n,r);if(t.to.line<e.first)po(e,t.text.length-1-(t.to.line-t.from.line));else if(!(t.from.line>e.lastLine())){if(t.from.line<e.first){var i=t.text.length-1-(e.first-t.from.line);po(e,i),t={from:et(e.first,0),to:et(t.to.line+i,t.to.ch),text:[K(t.text)],origin:t.origin}}var o=e.lastLine();t.to.line>o&&(t={from:t.from,to:et(o,Ue(e,o).text.length),text:[t.text[0]],origin:t.origin}),t.removed=Ge(e,t.from,t.to),n||(n=Ai(e,t)),e.cm?function(e,t,n){var r=e.doc,i=e.display,o=t.from,a=t.to,s=!1,l=o.line;e.options.lineWrapping||(l=Ye(Rt(Ue(r,o.line))),r.iter(l,a.line+1,(function(e){if(e==i.maxLine)return s=!0,!0})));r.sel.contains(t.from,t.to)>-1&&ve(e);Li(r,t,n,sr(e)),e.options.lineWrapping||(r.iter(l,o.line+t.text.length,(function(e){var t=qt(e);t>i.maxLineLength&&(i.maxLine=e,i.maxLineLength=t,i.maxLineChanged=!0,s=!1)})),s&&(e.curOp.updateMaxLine=!0));(function(e,t){if(e.modeFrontier=Math.min(e.modeFrontier,t),!(e.highlightFrontier<t-10)){for(var n=e.first,r=t-1;r>n;r--){var i=Ue(e,r).stateAfter;if(i&&(!(i instanceof ut)||r+i.lookAhead<t)){n=r+1;break}}e.highlightFrontier=Math.min(e.highlightFrontier,n)}})(r,o.line),ri(e,400);var u=t.text.length-(a.line-o.line)-1;t.full?fr(e):o.line!=a.line||1!=t.text.length||Ei(e.doc,t)?fr(e,o.line,a.line+1,u):dr(e,o.line,"text");var c=me(e,"changes"),f=me(e,"change");if(f||c){var d={from:o,to:a,text:t.text,removed:t.removed,origin:t.origin};f&&ln(e,"change",e,d),c&&(e.curOp.changeObjs||(e.curOp.changeObjs=[])).push(d)}e.display.selForContextMenu=null}(e.cm,t,r):Li(e,t,r),eo(e,n,z),e.cantEdit&&oo(e,et(e.firstLine(),0))&&(e.cantEdit=!1)}}function go(e,t,n,r,i){var o;r||(r=n),tt(r,n)<0&&(n=(o=[r,n])[0],r=o[1]),"string"==typeof t&&(t=e.splitLines(t)),uo(e,{from:n,to:r,text:t,origin:i})}function vo(e,t,n,r){n<e.line?e.line+=r:t<e.line&&(e.line=t,e.ch=0)}function mo(e,t,n,r){for(var i=0;i<e.length;++i){var o=e[i],a=!0;if(o.ranges){o.copied||((o=e[i]=o.deepCopy()).copied=!0);for(var s=0;s<o.ranges.length;s++)vo(o.ranges[s].anchor,t,n,r),vo(o.ranges[s].head,t,n,r)}else{for(var l=0;l<o.changes.length;++l){var u=o.changes[l];if(n<u.from.line)u.from=et(u.from.line+r,u.from.ch),u.to=et(u.to.line+r,u.to.ch);else if(t<=u.to.line){a=!1;break}}a||(e.splice(0,i+1),i=0)}}}function yo(e,t){var n=t.from.line,r=t.to.line,i=t.text.length-(r-n)-1;mo(e.done,n,r,i),mo(e.undone,n,r,i)}function bo(e,t,n,r){var i=t,o=t;return"number"==typeof t?o=Ue(e,at(e,t)):i=Ye(t),null==i?null:(r(o,i)&&e.cm&&dr(e.cm,i,n),o)}function wo(e){this.lines=e,this.parent=null;for(var t=0,n=0;n<e.length;++n)e[n].parent=this,t+=e[n].height;this.height=t}function xo(e){this.children=e;for(var t=0,n=0,r=0;r<e.length;++r){var i=e[r];t+=i.chunkSize(),n+=i.height,i.parent=this}this.size=t,this.height=n,this.parent=null}Oi.prototype.from=function(){return ot(this.anchor,this.head)},Oi.prototype.to=function(){return it(this.anchor,this.head)},Oi.prototype.empty=function(){return this.head.line==this.anchor.line&&this.head.ch==this.anchor.ch},wo.prototype={chunkSize:function(){return this.lines.length},removeInner:function(e,t){for(var n=e,r=e+t;n<r;++n){var i=this.lines[n];this.height-=i.height,Gt(i),ln(i,"delete")}this.lines.splice(e,t)},collapse:function(e){e.push.apply(e,this.lines)},insertInner:function(e,t,n){this.height+=n,this.lines=this.lines.slice(0,e).concat(t).concat(this.lines.slice(e));for(var r=0;r<t.length;++r)t[r].parent=this},iterN:function(e,t,n){for(var r=e+t;e<r;++e)if(n(this.lines[e]))return!0}},xo.prototype={chunkSize:function(){return this.size},removeInner:function(e,t){this.size-=t;for(var n=0;n<this.children.length;++n){var r=this.children[n],i=r.chunkSize();if(e<i){var o=Math.min(t,i-e),a=r.height;if(r.removeInner(e,o),this.height-=a-r.height,i==o&&(this.children.splice(n--,1),r.parent=null),0==(t-=o))break;e=0}else e-=i}if(this.size-t<25&&(this.children.length>1||!(this.children[0]instanceof wo))){var s=[];this.collapse(s),this.children=[new wo(s)],this.children[0].parent=this}},collapse:function(e){for(var t=0;t<this.children.length;++t)this.children[t].collapse(e)},insertInner:function(e,t,n){this.size+=t.length,this.height+=n;for(var r=0;r<this.children.length;++r){var i=this.children[r],o=i.chunkSize();if(e<=o){if(i.insertInner(e,t,n),i.lines&&i.lines.length>50){for(var a=i.lines.length%25+25,s=a;s<i.lines.length;){var l=new wo(i.lines.slice(s,s+=25));i.height-=l.height,this.children.splice(++r,0,l),l.parent=this}i.lines=i.lines.slice(0,a),this.maybeSpill()}break}e-=o}},maybeSpill:function(){if(!(this.children.length<=10)){var e=this;do{var t=new xo(e.children.splice(e.children.length-5,5));if(e.parent){e.size-=t.size,e.height-=t.height;var n=H(e.parent.children,e);e.parent.children.splice(n+1,0,t)}else{var r=new xo(e.children);r.parent=e,e.children=[r,t],e=r}t.parent=e.parent}while(e.children.length>10);e.parent.maybeSpill()}},iterN:function(e,t,n){for(var r=0;r<this.children.length;++r){var i=this.children[r],o=i.chunkSize();if(e<o){var a=Math.min(t,o-e);if(i.iterN(e,a,n))return!0;if(0==(t-=a))break;e=0}else e-=o}}};var ko=function(e,t,n){if(n)for(var r in n)n.hasOwnProperty(r)&&(this[r]=n[r]);this.doc=e,this.node=t};function Oo(e,t,n){Bt(t)<(e.curOp&&e.curOp.scrollTop||e.doc.scrollTop)&&_r(e,n)}ko.prototype.clear=function(){var e=this.doc.cm,t=this.line.widgets,n=this.line,r=Ye(n);if(null!=r&&t){for(var i=0;i<t.length;++i)t[i]==this&&t.splice(i--,1);t.length||(n.widgets=null);var o=xn(this);Je(n,Math.max(0,n.height-o)),e&&(Qr(e,(function(){Oo(e,n,-o),dr(e,r,"widget")})),ln(e,"lineWidgetCleared",e,this,r))}},ko.prototype.changed=function(){var e=this,t=this.height,n=this.doc.cm,r=this.line;this.height=null;var i=xn(this)-t;i&&(Wt(this.doc,r)||Je(r,r.height+i),n&&Qr(n,(function(){n.curOp.forceUpdate=!0,Oo(n,r,i),ln(n,"lineWidgetChanged",n,e,Ye(r))})))},ye(ko);var jo=0,So=function(e,t){this.lines=[],this.type=t,this.doc=e,this.id=++jo};function Co(e,t,n,r,i){if(r&&r.shared)return function(e,t,n,r,i){(r=F(r)).shared=!1;var o=[Co(e,t,n,r,i)],a=o[0],s=r.widgetNode;return Ni(e,(function(e){s&&(r.widgetNode=s.cloneNode(!0)),o.push(Co(e,st(e,t),st(e,n),r,i));for(var l=0;l<e.linked.length;++l)if(e.linked[l].isParent)return;a=K(o)})),new Po(o,a)}(e,t,n,r,i);if(e.cm&&!e.cm.curOp)return ei(e.cm,Co)(e,t,n,r,i);var o=new So(e,i),a=tt(t,n);if(r&&F(r,o,!1),a>0||0==a&&!1!==o.clearWhenEmpty)return o;if(o.replacedWith&&(o.collapsed=!0,o.widgetNode=_("span",[o.replacedWith],"CodeMirror-widget"),r.handleMouseEvents||o.widgetNode.setAttribute("cm-ignore-events","true"),r.insertLeft&&(o.widgetNode.insertLeft=!0)),o.collapsed){if(Ft(e,t.line,t,n,o)||t.line!=n.line&&Ft(e,n.line,t,n,o))throw new Error("Inserting collapsed marker partially overlapping an existing one");kt=!0}o.addToHistory&&Hi(e,{from:t,to:n,origin:"markText"},e.sel,NaN);var s,l=t.line,u=e.cm;if(e.iter(l,n.line+1,(function(e){u&&o.collapsed&&!u.options.lineWrapping&&Rt(e)==u.display.maxLine&&(s=!0),o.collapsed&&l!=t.line&&Je(e,0),function(e,t){e.markedSpans=e.markedSpans?e.markedSpans.concat([t]):[t],t.marker.attachLine(e)}(e,new Ot(o,l==t.line?t.ch:null,l==n.line?n.ch:null)),++l})),o.collapsed&&e.iter(t.line,n.line+1,(function(t){Wt(e,t)&&Je(t,0)})),o.clearOnEnter&&fe(o,"beforeCursorEnter",(function(){return o.clear()})),o.readOnly&&(xt=!0,(e.history.done.length||e.history.undone.length)&&e.clearHistory()),o.collapsed&&(o.id=++jo,o.atomic=!0),u){if(s&&(u.curOp.updateMaxLine=!0),o.collapsed)fr(u,t.line,n.line+1);else if(o.className||o.startStyle||o.endStyle||o.css||o.attributes||o.title)for(var c=t.line;c<=n.line;c++)dr(u,c,"text");o.atomic&&no(u.doc),ln(u,"markerAdded",u,o)}return o}So.prototype.clear=function(){if(!this.explicitlyCleared){var e=this.doc.cm,t=e&&!e.curOp;if(t&&Ur(e),me(this,"clear")){var n=this.find();n&&ln(this,"clear",n.from,n.to)}for(var r=null,i=null,o=0;o<this.lines.length;++o){var a=this.lines[o],s=jt(a.markedSpans,this);e&&!this.collapsed?dr(e,Ye(a),"text"):e&&(null!=s.to&&(i=Ye(a)),null!=s.from&&(r=Ye(a))),a.markedSpans=St(a.markedSpans,s),null==s.from&&this.collapsed&&!Wt(this.doc,a)&&e&&Je(a,rr(e.display))}if(e&&this.collapsed&&!e.options.lineWrapping)for(var l=0;l<this.lines.length;++l){var u=Rt(this.lines[l]),c=qt(u);c>e.display.maxLineLength&&(e.display.maxLine=u,e.display.maxLineLength=c,e.display.maxLineChanged=!0)}null!=r&&e&&this.collapsed&&fr(e,r,i+1),this.lines.length=0,this.explicitlyCleared=!0,this.atomic&&this.doc.cantEdit&&(this.doc.cantEdit=!1,e&&no(e.doc)),e&&ln(e,"markerCleared",e,this,r,i),t&&Gr(e),this.parent&&this.parent.clear()}},So.prototype.find=function(e,t){var n,r;null==e&&"bookmark"==this.type&&(e=1);for(var i=0;i<this.lines.length;++i){var o=this.lines[i],a=jt(o.markedSpans,this);if(null!=a.from&&(n=et(t?o:Ye(o),a.from),-1==e))return n;if(null!=a.to&&(r=et(t?o:Ye(o),a.to),1==e))return r}return n&&{from:n,to:r}},So.prototype.changed=function(){var e=this,t=this.find(-1,!0),n=this,r=this.doc.cm;t&&r&&Qr(r,(function(){var i=t.line,o=Ye(t.line),a=Tn(r,o);if(a&&(Rn(a),r.curOp.selectionChanged=r.curOp.forceUpdate=!0),r.curOp.updateMaxLine=!0,!Wt(n.doc,i)&&null!=n.height){var s=n.height;n.height=null;var l=xn(n)-s;l&&Je(i,i.height+l)}ln(r,"markerChanged",r,e)}))},So.prototype.attachLine=function(e){if(!this.lines.length&&this.doc.cm){var t=this.doc.cm.curOp;t.maybeHiddenMarkers&&-1!=H(t.maybeHiddenMarkers,this)||(t.maybeUnhiddenMarkers||(t.maybeUnhiddenMarkers=[])).push(this)}this.lines.push(e)},So.prototype.detachLine=function(e){if(this.lines.splice(H(this.lines,e),1),!this.lines.length&&this.doc.cm){var t=this.doc.cm.curOp;(t.maybeHiddenMarkers||(t.maybeHiddenMarkers=[])).push(this)}},ye(So);var Po=function(e,t){this.markers=e,this.primary=t;for(var n=0;n<e.length;++n)e[n].parent=this};function Ao(e){return e.findMarks(et(e.first,0),e.clipPos(et(e.lastLine())),(function(e){return e.parent}))}function Mo(e){for(var t=function(t){var n=e[t],r=[n.primary.doc];Ni(n.primary.doc,(function(e){return r.push(e)}));for(var i=0;i<n.markers.length;i++){var o=n.markers[i];-1==H(r,o.doc)&&(o.parent=null,n.markers.splice(i--,1))}},n=0;n<e.length;n++)t(n)}Po.prototype.clear=function(){if(!this.explicitlyCleared){this.explicitlyCleared=!0;for(var e=0;e<this.markers.length;++e)this.markers[e].clear();ln(this,"clear")}},Po.prototype.find=function(e,t){return this.primary.find(e,t)},ye(Po);var _o=0,To=function(e,t,n,r,i){if(!(this instanceof To))return new To(e,t,n,r,i);null==n&&(n=0),xo.call(this,[new wo([new Ut("",null)])]),this.first=n,this.scrollTop=this.scrollLeft=0,this.cantEdit=!1,this.cleanGeneration=1,this.modeFrontier=this.highlightFrontier=n;var o=et(n,0);this.sel=Si(o),this.history=new Fi(null),this.id=++_o,this.modeOption=t,this.lineSep=r,this.direction="rtl"==i?"rtl":"ltr",this.extend=!1,"string"==typeof e&&(e=this.splitLines(e)),Li(this,{from:o,to:o,text:e}),Qi(this,Si(o),z)};To.prototype=X(xo.prototype,{constructor:To,iter:function(e,t,n){n?this.iterN(e-this.first,t-e,n):this.iterN(this.first,this.first+this.size,e)},insert:function(e,t){for(var n=0,r=0;r<t.length;++r)n+=t[r].height;this.insertInner(e-this.first,t,n)},remove:function(e,t){this.removeInner(e-this.first,t)},getValue:function(e){var t=Ke(this,this.first,this.first+this.size);return!1===e?t:t.join(e||this.lineSeparator())},setValue:ni((function(e){var t=et(this.first,0),n=this.first+this.size-1;uo(this,{from:t,to:et(n,Ue(this,n).text.length),text:this.splitLines(e),origin:"setValue",full:!0},!0),this.cm&&Er(this.cm,0,0),Qi(this,Si(t),z)})),replaceRange:function(e,t,n,r){go(this,e,t=st(this,t),n=n?st(this,n):t,r)},getRange:function(e,t,n){var r=Ge(this,st(this,e),st(this,t));return!1===n?r:r.join(n||this.lineSeparator())},getLine:function(e){var t=this.getLineHandle(e);return t&&t.text},getLineHandle:function(e){if(Ze(this,e))return Ue(this,e)},getLineNumber:function(e){return Ye(e)},getLineHandleVisualStart:function(e){return"number"==typeof e&&(e=Ue(this,e)),Rt(e)},lineCount:function(){return this.size},firstLine:function(){return this.first},lastLine:function(){return this.first+this.size-1},clipPos:function(e){return st(this,e)},getCursor:function(e){var t=this.sel.primary();return null==e||"head"==e?t.head:"anchor"==e?t.anchor:"end"==e||"to"==e||!1===e?t.to():t.from()},listSelections:function(){return this.sel.ranges},somethingSelected:function(){return this.sel.somethingSelected()},setCursor:ni((function(e,t,n){Xi(this,st(this,"number"==typeof e?et(e,t||0):e),null,n)})),setSelection:ni((function(e,t,n){Xi(this,st(this,e),st(this,t||e),n)})),extendSelection:ni((function(e,t,n){Ki(this,st(this,e),t&&st(this,t),n)})),extendSelections:ni((function(e,t){Ji(this,lt(this,e),t)})),extendSelectionsBy:ni((function(e,t){Ji(this,lt(this,J(this.sel.ranges,e)),t)})),setSelections:ni((function(e,t,n){if(e.length){for(var r=[],i=0;i<e.length;i++)r[i]=new Oi(st(this,e[i].anchor),st(this,e[i].head));null==t&&(t=Math.min(e.length-1,this.sel.primIndex)),Qi(this,ji(this.cm,r,t),n)}})),addSelection:ni((function(e,t,n){var r=this.sel.ranges.slice(0);r.push(new Oi(st(this,e),st(this,t||e))),Qi(this,ji(this.cm,r,r.length-1),n)})),getSelection:function(e){for(var t,n=this.sel.ranges,r=0;r<n.length;r++){var i=Ge(this,n[r].from(),n[r].to());t=t?t.concat(i):i}return!1===e?t:t.join(e||this.lineSeparator())},getSelections:function(e){for(var t=[],n=this.sel.ranges,r=0;r<n.length;r++){var i=Ge(this,n[r].from(),n[r].to());!1!==e&&(i=i.join(e||this.lineSeparator())),t[r]=i}return t},replaceSelection:function(e,t,n){for(var r=[],i=0;i<this.sel.ranges.length;i++)r[i]=e;this.replaceSelections(r,t,n||"+input")},replaceSelections:ni((function(e,t,n){for(var r=[],i=this.sel,o=0;o<i.ranges.length;o++){var a=i.ranges[o];r[o]={from:a.from(),to:a.to(),text:this.splitLines(e[o]),origin:n}}for(var s=t&&"end"!=t&&function(e,t,n){for(var r=[],i=et(e.first,0),o=i,a=0;a<t.length;a++){var s=t[a],l=Mi(s.from,i,o),u=Mi(Ci(s),i,o);if(i=s.to,o=u,"around"==n){var c=e.sel.ranges[a],f=tt(c.head,c.anchor)<0;r[a]=new Oi(f?u:l,f?l:u)}else r[a]=new Oi(l,l)}return new ki(r,e.sel.primIndex)}(this,r,t),l=r.length-1;l>=0;l--)uo(this,r[l]);s?Zi(this,s):this.cm&&Tr(this.cm)})),undo:ni((function(){fo(this,"undo")})),redo:ni((function(){fo(this,"redo")})),undoSelection:ni((function(){fo(this,"undo",!0)})),redoSelection:ni((function(){fo(this,"redo",!0)})),setExtending:function(e){this.extend=e},getExtending:function(){return this.extend},historySize:function(){for(var e=this.history,t=0,n=0,r=0;r<e.done.length;r++)e.done[r].ranges||++t;for(var i=0;i<e.undone.length;i++)e.undone[i].ranges||++n;return{undo:t,redo:n}},clearHistory:function(){var e=this;this.history=new Fi(this.history.maxGeneration),Ni(this,(function(t){return t.history=e.history}),!0)},markClean:function(){this.cleanGeneration=this.changeGeneration(!0)},changeGeneration:function(e){return e&&(this.history.lastOp=this.history.lastSelOp=this.history.lastOrigin=null),this.history.generation},isClean:function(e){return this.history.generation==(e||this.cleanGeneration)},getHistory:function(){return{done:Ui(this.history.done),undone:Ui(this.history.undone)}},setHistory:function(e){var t=this.history=new Fi(this.history.maxGeneration);t.done=Ui(e.done.slice(0),null,!0),t.undone=Ui(e.undone.slice(0),null,!0)},setGutterMarker:ni((function(e,t,n){return bo(this,e,"gutter",(function(e){var r=e.gutterMarkers||(e.gutterMarkers={});return r[t]=n,!n&&te(r)&&(e.gutterMarkers=null),!0}))})),clearGutter:ni((function(e){var t=this;this.iter((function(n){n.gutterMarkers&&n.gutterMarkers[e]&&bo(t,n,"gutter",(function(){return n.gutterMarkers[e]=null,te(n.gutterMarkers)&&(n.gutterMarkers=null),!0}))}))})),lineInfo:function(e){var t;if("number"==typeof e){if(!Ze(this,e))return null;if(t=e,!(e=Ue(this,e)))return null}else if(null==(t=Ye(e)))return null;return{line:t,handle:e,text:e.text,gutterMarkers:e.gutterMarkers,textClass:e.textClass,bgClass:e.bgClass,wrapClass:e.wrapClass,widgets:e.widgets}},addLineClass:ni((function(e,t,n){return bo(this,e,"gutter"==t?"gutter":"class",(function(e){var r="text"==t?"textClass":"background"==t?"bgClass":"gutter"==t?"gutterClass":"wrapClass";if(e[r]){if(j(n).test(e[r]))return!1;e[r]+=" "+n}else e[r]=n;return!0}))})),removeLineClass:ni((function(e,t,n){return bo(this,e,"gutter"==t?"gutter":"class",(function(e){var r="text"==t?"textClass":"background"==t?"bgClass":"gutter"==t?"gutterClass":"wrapClass",i=e[r];if(!i)return!1;if(null==n)e[r]=null;else{var o=i.match(j(n));if(!o)return!1;var a=o.index+o[0].length;e[r]=i.slice(0,o.index)+(o.index&&a!=i.length?" ":"")+i.slice(a)||null}return!0}))})),addLineWidget:ni((function(e,t,n){return function(e,t,n,r){var i=new ko(e,n,r),o=e.cm;return o&&i.noHScroll&&(o.display.alignWidgets=!0),bo(e,t,"widget",(function(t){var n=t.widgets||(t.widgets=[]);if(null==i.insertAt?n.push(i):n.splice(Math.min(n.length-1,Math.max(0,i.insertAt)),0,i),i.line=t,o&&!Wt(e,t)){var r=Bt(t)<e.scrollTop;Je(t,t.height+xn(i)),r&&_r(o,i.height),o.curOp.forceUpdate=!0}return!0})),o&&ln(o,"lineWidgetAdded",o,i,"number"==typeof t?t:Ye(t)),i}(this,e,t,n)})),removeLineWidget:function(e){e.clear()},markText:function(e,t,n){return Co(this,st(this,e),st(this,t),n,n&&n.type||"range")},setBookmark:function(e,t){var n={replacedWith:t&&(null==t.nodeType?t.widget:t),insertLeft:t&&t.insertLeft,clearWhenEmpty:!1,shared:t&&t.shared,handleMouseEvents:t&&t.handleMouseEvents};return Co(this,e=st(this,e),e,n,"bookmark")},findMarksAt:function(e){var t=[],n=Ue(this,(e=st(this,e)).line).markedSpans;if(n)for(var r=0;r<n.length;++r){var i=n[r];(null==i.from||i.from<=e.ch)&&(null==i.to||i.to>=e.ch)&&t.push(i.marker.parent||i.marker)}return t},findMarks:function(e,t,n){e=st(this,e),t=st(this,t);var r=[],i=e.line;return this.iter(e.line,t.line+1,(function(o){var a=o.markedSpans;if(a)for(var s=0;s<a.length;s++){var l=a[s];null!=l.to&&i==e.line&&e.ch>=l.to||null==l.from&&i!=e.line||null!=l.from&&i==t.line&&l.from>=t.ch||n&&!n(l.marker)||r.push(l.marker.parent||l.marker)}++i})),r},getAllMarks:function(){var e=[];return this.iter((function(t){var n=t.markedSpans;if(n)for(var r=0;r<n.length;++r)null!=n[r].from&&e.push(n[r].marker)})),e},posFromIndex:function(e){var t,n=this.first,r=this.lineSeparator().length;return this.iter((function(i){var o=i.text.length+r;if(o>e)return t=e,!0;e-=o,++n})),st(this,et(n,t))},indexFromPos:function(e){var t=(e=st(this,e)).ch;if(e.line<this.first||e.ch<0)return 0;var n=this.lineSeparator().length;return this.iter(this.first,e.line,(function(e){t+=e.text.length+n})),t},copy:function(e){var t=new To(Ke(this,this.first,this.first+this.size),this.modeOption,this.first,this.lineSep,this.direction);return t.scrollTop=this.scrollTop,t.scrollLeft=this.scrollLeft,t.sel=this.sel,t.extend=!1,e&&(t.history.undoDepth=this.history.undoDepth,t.setHistory(this.getHistory())),t},linkedDoc:function(e){e||(e={});var t=this.first,n=this.first+this.size;null!=e.from&&e.from>t&&(t=e.from),null!=e.to&&e.to<n&&(n=e.to);var r=new To(Ke(this,t,n),e.mode||this.modeOption,t,this.lineSep,this.direction);return e.sharedHist&&(r.history=this.history),(this.linked||(this.linked=[])).push({doc:r,sharedHist:e.sharedHist}),r.linked=[{doc:this,isParent:!0,sharedHist:e.sharedHist}],function(e,t){for(var n=0;n<t.length;n++){var r=t[n],i=r.find(),o=e.clipPos(i.from),a=e.clipPos(i.to);if(tt(o,a)){var s=Co(e,o,a,r.primary,r.primary.type);r.markers.push(s),s.parent=r}}}(r,Ao(this)),r},unlinkDoc:function(e){if(e instanceof Pa&&(e=e.doc),this.linked)for(var t=0;t<this.linked.length;++t){if(this.linked[t].doc==e){this.linked.splice(t,1),e.unlinkDoc(this),Mo(Ao(this));break}}if(e.history==this.history){var n=[e.id];Ni(e,(function(e){return n.push(e.id)}),!0),e.history=new Fi(null),e.history.done=Ui(this.history.done,n),e.history.undone=Ui(this.history.undone,n)}},iterLinkedDocs:function(e){Ni(this,e)},getMode:function(){return this.mode},getEditor:function(){return this.cm},splitLines:function(e){return this.lineSep?e.split(this.lineSep):Te(e)},lineSeparator:function(){return this.lineSep||"\n"},setDirection:ni((function(e){var t;("rtl"!=e&&(e="ltr"),e!=this.direction)&&(this.direction=e,this.iter((function(e){return e.order=null})),this.cm&&Qr(t=this.cm,(function(){Ii(t),fr(t)})))}))}),To.prototype.eachLine=To.prototype.iter;var Eo=0;function Lo(e){var t=this;if(No(t),!ge(t,e)&&!kn(t.display,e)){be(e),a&&(Eo=+new Date);var n=ur(t,e,!0),r=e.dataTransfer.files;if(n&&!t.isReadOnly())if(r&&r.length&&window.FileReader&&window.File)for(var i=r.length,o=Array(i),s=0,l=function(){++s==i&&ei(t,(function(){var e={from:n=st(t.doc,n),to:n,text:t.doc.splitLines(o.filter((function(e){return null!=e})).join(t.doc.lineSeparator())),origin:"paste"};uo(t.doc,e),Zi(t.doc,Si(st(t.doc,n),st(t.doc,Ci(e))))}))()},u=function(e,n){if(t.options.allowDropFileTypes&&-1==H(t.options.allowDropFileTypes,e.type))l();else{var r=new FileReader;r.onerror=function(){return l()},r.onload=function(){var e=r.result;/[\x00-\x08\x0e-\x1f]{2}/.test(e)||(o[n]=e),l()},r.readAsText(e)}},c=0;c<r.length;c++)u(r[c],c);else{if(t.state.draggingText&&t.doc.sel.contains(n)>-1)return t.state.draggingText(e),void setTimeout((function(){return t.display.input.focus()}),20);try{var f=e.dataTransfer.getData("Text");if(f){var d;if(t.state.draggingText&&!t.state.draggingText.copy&&(d=t.listSelections()),eo(t.doc,Si(n,n)),d)for(var p=0;p<d.length;++p)go(t.doc,"",d[p].anchor,d[p].head,"drag");t.replaceSelection(f,"around","paste"),t.display.input.focus()}}catch(e){}}}}function No(e){e.display.dragCursor&&(e.display.lineSpace.removeChild(e.display.dragCursor),e.display.dragCursor=null)}function Do(e){if(document.getElementsByClassName){for(var t=document.getElementsByClassName("CodeMirror"),n=[],r=0;r<t.length;r++){var i=t[r].CodeMirror;i&&n.push(i)}n.length&&n[0].operation((function(){for(var t=0;t<n.length;t++)e(n[t])}))}}var Io=!1;function Fo(){var e;Io||(fe(window,"resize",(function(){null==e&&(e=setTimeout((function(){e=null,Do(Ro)}),100))})),fe(window,"blur",(function(){return Do(Sr)})),Io=!0)}function Ro(e){var t=e.display;t.cachedCharWidth=t.cachedTextHeight=t.cachedPaddingH=null,t.scrollbarsClipped=!1,e.setSize()}for(var $o={3:"Pause",8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"CapsLock",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",44:"PrintScrn",45:"Insert",46:"Delete",59:";",61:"=",91:"Mod",92:"Mod",93:"Mod",106:"*",107:"=",109:"-",110:".",111:"/",145:"ScrollLock",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",224:"Mod",63232:"Up",63233:"Down",63234:"Left",63235:"Right",63272:"Delete",63273:"Home",63275:"End",63276:"PageUp",63277:"PageDown",63302:"Insert"},Ho=0;Ho<10;Ho++)$o[Ho+48]=$o[Ho+96]=String(Ho);for(var Wo=65;Wo<=90;Wo++)$o[Wo]=String.fromCharCode(Wo);for(var zo=1;zo<=12;zo++)$o[zo+111]=$o[zo+63235]="F"+zo;var Bo={};function qo(e){var t,n,r,i,o=e.split(/-(?!$)/);e=o[o.length-1];for(var a=0;a<o.length-1;a++){var s=o[a];if(/^(cmd|meta|m)$/i.test(s))i=!0;else if(/^a(lt)?$/i.test(s))t=!0;else if(/^(c|ctrl|control)$/i.test(s))n=!0;else{if(!/^s(hift)?$/i.test(s))throw new Error("Unrecognized modifier name: "+s);r=!0}}return t&&(e="Alt-"+e),n&&(e="Ctrl-"+e),i&&(e="Cmd-"+e),r&&(e="Shift-"+e),e}function Vo(e){var t={};for(var n in e)if(e.hasOwnProperty(n)){var r=e[n];if(/^(name|fallthrough|(de|at)tach)$/.test(n))continue;if("..."==r){delete e[n];continue}for(var i=J(n.split(" "),qo),o=0;o<i.length;o++){var a=void 0,s=void 0;o==i.length-1?(s=i.join(" "),a=r):(s=i.slice(0,o+1).join(" "),a="...");var l=t[s];if(l){if(l!=a)throw new Error("Inconsistent bindings for "+s)}else t[s]=a}delete e[n]}for(var u in t)e[u]=t[u];return e}function Uo(e,t,n,r){var i=(t=Yo(t)).call?t.call(e,r):t[e];if(!1===i)return"nothing";if("..."===i)return"multi";if(null!=i&&n(i))return"handled";if(t.fallthrough){if("[object Array]"!=Object.prototype.toString.call(t.fallthrough))return Uo(e,t.fallthrough,n,r);for(var o=0;o<t.fallthrough.length;o++){var a=Uo(e,t.fallthrough[o],n,r);if(a)return a}}}function Go(e){var t="string"==typeof e?e:$o[e.keyCode];return"Ctrl"==t||"Alt"==t||"Shift"==t||"Mod"==t}function Ko(e,t,n){var r=e;return t.altKey&&"Alt"!=r&&(e="Alt-"+e),(k?t.metaKey:t.ctrlKey)&&"Ctrl"!=r&&(e="Ctrl-"+e),(k?t.ctrlKey:t.metaKey)&&"Mod"!=r&&(e="Cmd-"+e),!n&&t.shiftKey&&"Shift"!=r&&(e="Shift-"+e),e}function Jo(e,t){if(f&&34==e.keyCode&&e.char)return!1;var n=$o[e.keyCode];return null!=n&&!e.altGraphKey&&(3==e.keyCode&&e.code&&(n=e.code),Ko(n,e,t))}function Yo(e){return"string"==typeof e?Bo[e]:e}function Xo(e,t){for(var n=e.doc.sel.ranges,r=[],i=0;i<n.length;i++){for(var o=t(n[i]);r.length&&tt(o.from,K(r).to)<=0;){var a=r.pop();if(tt(a.from,o.from)<0){o.from=a.from;break}}r.push(o)}Qr(e,(function(){for(var t=r.length-1;t>=0;t--)go(e.doc,"",r[t].from,r[t].to,"+delete");Tr(e)}))}function Zo(e,t,n){var r=ie(e.text,t+n,n);return r<0||r>e.text.length?null:r}function Qo(e,t,n){var r=Zo(e,t.ch,n);return null==r?null:new et(t.line,r,n<0?"after":"before")}function ea(e,t,n,r,i){if(e){"rtl"==t.doc.direction&&(i=-i);var o=ue(n,t.doc.direction);if(o){var a,s=i<0?K(o):o[0],l=i<0==(1==s.level)?"after":"before";if(s.level>0||"rtl"==t.doc.direction){var u=En(t,n);a=i<0?n.text.length-1:0;var c=Ln(t,u,a).top;a=oe((function(e){return Ln(t,u,e).top==c}),i<0==(1==s.level)?s.from:s.to-1,a),"before"==l&&(a=Zo(n,a,1))}else a=i<0?s.to:s.from;return new et(r,a,l)}}return new et(r,i<0?n.text.length:0,i<0?"before":"after")}Bo.basic={Left:"goCharLeft",Right:"goCharRight",Up:"goLineUp",Down:"goLineDown",End:"goLineEnd",Home:"goLineStartSmart",PageUp:"goPageUp",PageDown:"goPageDown",Delete:"delCharAfter",Backspace:"delCharBefore","Shift-Backspace":"delCharBefore",Tab:"defaultTab","Shift-Tab":"indentAuto",Enter:"newlineAndIndent",Insert:"toggleOverwrite",Esc:"singleSelection"},Bo.pcDefault={"Ctrl-A":"selectAll","Ctrl-D":"deleteLine","Ctrl-Z":"undo","Shift-Ctrl-Z":"redo","Ctrl-Y":"redo","Ctrl-Home":"goDocStart","Ctrl-End":"goDocEnd","Ctrl-Up":"goLineUp","Ctrl-Down":"goLineDown","Ctrl-Left":"goGroupLeft","Ctrl-Right":"goGroupRight","Alt-Left":"goLineStart","Alt-Right":"goLineEnd","Ctrl-Backspace":"delGroupBefore","Ctrl-Delete":"delGroupAfter","Ctrl-S":"save","Ctrl-F":"find","Ctrl-G":"findNext","Shift-Ctrl-G":"findPrev","Shift-Ctrl-F":"replace","Shift-Ctrl-R":"replaceAll","Ctrl-[":"indentLess","Ctrl-]":"indentMore","Ctrl-U":"undoSelection","Shift-Ctrl-U":"redoSelection","Alt-U":"redoSelection",fallthrough:"basic"},Bo.emacsy={"Ctrl-F":"goCharRight","Ctrl-B":"goCharLeft","Ctrl-P":"goLineUp","Ctrl-N":"goLineDown","Alt-F":"goWordRight","Alt-B":"goWordLeft","Ctrl-A":"goLineStart","Ctrl-E":"goLineEnd","Ctrl-V":"goPageDown","Shift-Ctrl-V":"goPageUp","Ctrl-D":"delCharAfter","Ctrl-H":"delCharBefore","Alt-D":"delWordAfter","Alt-Backspace":"delWordBefore","Ctrl-K":"killLine","Ctrl-T":"transposeChars","Ctrl-O":"openLine"},Bo.macDefault={"Cmd-A":"selectAll","Cmd-D":"deleteLine","Cmd-Z":"undo","Shift-Cmd-Z":"redo","Cmd-Y":"redo","Cmd-Home":"goDocStart","Cmd-Up":"goDocStart","Cmd-End":"goDocEnd","Cmd-Down":"goDocEnd","Alt-Left":"goGroupLeft","Alt-Right":"goGroupRight","Cmd-Left":"goLineLeft","Cmd-Right":"goLineRight","Alt-Backspace":"delGroupBefore","Ctrl-Alt-Backspace":"delGroupAfter","Alt-Delete":"delGroupAfter","Cmd-S":"save","Cmd-F":"find","Cmd-G":"findNext","Shift-Cmd-G":"findPrev","Cmd-Alt-F":"replace","Shift-Cmd-Alt-F":"replaceAll","Cmd-[":"indentLess","Cmd-]":"indentMore","Cmd-Backspace":"delWrappedLineLeft","Cmd-Delete":"delWrappedLineRight","Cmd-U":"undoSelection","Shift-Cmd-U":"redoSelection","Ctrl-Up":"goDocStart","Ctrl-Down":"goDocEnd",fallthrough:["basic","emacsy"]},Bo.default=y?Bo.macDefault:Bo.pcDefault;var ta={selectAll:so,singleSelection:function(e){return e.setSelection(e.getCursor("anchor"),e.getCursor("head"),z)},killLine:function(e){return Xo(e,(function(t){if(t.empty()){var n=Ue(e.doc,t.head.line).text.length;return t.head.ch==n&&t.head.line<e.lastLine()?{from:t.head,to:et(t.head.line+1,0)}:{from:t.head,to:et(t.head.line,n)}}return{from:t.from(),to:t.to()}}))},deleteLine:function(e){return Xo(e,(function(t){return{from:et(t.from().line,0),to:st(e.doc,et(t.to().line+1,0))}}))},delLineLeft:function(e){return Xo(e,(function(e){return{from:et(e.from().line,0),to:e.from()}}))},delWrappedLineLeft:function(e){return Xo(e,(function(t){var n=e.charCoords(t.head,"div").top+5;return{from:e.coordsChar({left:0,top:n},"div"),to:t.from()}}))},delWrappedLineRight:function(e){return Xo(e,(function(t){var n=e.charCoords(t.head,"div").top+5,r=e.coordsChar({left:e.display.lineDiv.offsetWidth+100,top:n},"div");return{from:t.from(),to:r}}))},undo:function(e){return e.undo()},redo:function(e){return e.redo()},undoSelection:function(e){return e.undoSelection()},redoSelection:function(e){return e.redoSelection()},goDocStart:function(e){return e.extendSelection(et(e.firstLine(),0))},goDocEnd:function(e){return e.extendSelection(et(e.lastLine()))},goLineStart:function(e){return e.extendSelectionsBy((function(t){return na(e,t.head.line)}),{origin:"+move",bias:1})},goLineStartSmart:function(e){return e.extendSelectionsBy((function(t){return ra(e,t.head)}),{origin:"+move",bias:1})},goLineEnd:function(e){return e.extendSelectionsBy((function(t){return function(e,t){var n=Ue(e.doc,t),r=function(e){for(var t;t=Dt(e);)e=t.find(1,!0).line;return e}(n);r!=n&&(t=Ye(r));return ea(!0,e,n,t,-1)}(e,t.head.line)}),{origin:"+move",bias:-1})},goLineRight:function(e){return e.extendSelectionsBy((function(t){var n=e.cursorCoords(t.head,"div").top+5;return e.coordsChar({left:e.display.lineDiv.offsetWidth+100,top:n},"div")}),q)},goLineLeft:function(e){return e.extendSelectionsBy((function(t){var n=e.cursorCoords(t.head,"div").top+5;return e.coordsChar({left:0,top:n},"div")}),q)},goLineLeftSmart:function(e){return e.extendSelectionsBy((function(t){var n=e.cursorCoords(t.head,"div").top+5,r=e.coordsChar({left:0,top:n},"div");return r.ch<e.getLine(r.line).search(/\S/)?ra(e,t.head):r}),q)},goLineUp:function(e){return e.moveV(-1,"line")},goLineDown:function(e){return e.moveV(1,"line")},goPageUp:function(e){return e.moveV(-1,"page")},goPageDown:function(e){return e.moveV(1,"page")},goCharLeft:function(e){return e.moveH(-1,"char")},goCharRight:function(e){return e.moveH(1,"char")},goColumnLeft:function(e){return e.moveH(-1,"column")},goColumnRight:function(e){return e.moveH(1,"column")},goWordLeft:function(e){return e.moveH(-1,"word")},goGroupRight:function(e){return e.moveH(1,"group")},goGroupLeft:function(e){return e.moveH(-1,"group")},goWordRight:function(e){return e.moveH(1,"word")},delCharBefore:function(e){return e.deleteH(-1,"codepoint")},delCharAfter:function(e){return e.deleteH(1,"char")},delWordBefore:function(e){return e.deleteH(-1,"word")},delWordAfter:function(e){return e.deleteH(1,"word")},delGroupBefore:function(e){return e.deleteH(-1,"group")},delGroupAfter:function(e){return e.deleteH(1,"group")},indentAuto:function(e){return e.indentSelection("smart")},indentMore:function(e){return e.indentSelection("add")},indentLess:function(e){return e.indentSelection("subtract")},insertTab:function(e){return e.replaceSelection("\t")},insertSoftTab:function(e){for(var t=[],n=e.listSelections(),r=e.options.tabSize,i=0;i<n.length;i++){var o=n[i].from(),a=R(e.getLine(o.line),o.ch,r);t.push(G(r-a%r))}e.replaceSelections(t)},defaultTab:function(e){e.somethingSelected()?e.indentSelection("add"):e.execCommand("insertTab")},transposeChars:function(e){return Qr(e,(function(){for(var t=e.listSelections(),n=[],r=0;r<t.length;r++)if(t[r].empty()){var i=t[r].head,o=Ue(e.doc,i.line).text;if(o)if(i.ch==o.length&&(i=new et(i.line,i.ch-1)),i.ch>0)i=new et(i.line,i.ch+1),e.replaceRange(o.charAt(i.ch-1)+o.charAt(i.ch-2),et(i.line,i.ch-2),i,"+transpose");else if(i.line>e.doc.first){var a=Ue(e.doc,i.line-1).text;a&&(i=new et(i.line,1),e.replaceRange(o.charAt(0)+e.doc.lineSeparator()+a.charAt(a.length-1),et(i.line-1,a.length-1),i,"+transpose"))}n.push(new Oi(i,i))}e.setSelections(n)}))},newlineAndIndent:function(e){return Qr(e,(function(){for(var t=e.listSelections(),n=t.length-1;n>=0;n--)e.replaceRange(e.doc.lineSeparator(),t[n].anchor,t[n].head,"+input");t=e.listSelections();for(var r=0;r<t.length;r++)e.indentLine(t[r].from().line,null,!0);Tr(e)}))},openLine:function(e){return e.replaceSelection("\n","start")},toggleOverwrite:function(e){return e.toggleOverwrite()}};function na(e,t){var n=Ue(e.doc,t),r=Rt(n);return r!=n&&(t=Ye(r)),ea(!0,e,r,t,1)}function ra(e,t){var n=na(e,t.line),r=Ue(e.doc,n.line),i=ue(r,e.doc.direction);if(!i||0==i[0].level){var o=Math.max(n.ch,r.text.search(/\S/)),a=t.line==n.line&&t.ch<=o&&t.ch;return et(n.line,a?0:o,n.sticky)}return n}function ia(e,t,n){if("string"==typeof t&&!(t=ta[t]))return!1;e.display.input.ensurePolled();var r=e.display.shift,i=!1;try{e.isReadOnly()&&(e.state.suppressEdits=!0),n&&(e.display.shift=!1),i=t(e)!=W}finally{e.display.shift=r,e.state.suppressEdits=!1}return i}var oa=new $;function aa(e,t,n,r){var i=e.state.keySeq;if(i){if(Go(t))return"handled";if(/\'$/.test(t)?e.state.keySeq=null:oa.set(50,(function(){e.state.keySeq==i&&(e.state.keySeq=null,e.display.input.reset())})),sa(e,i+" "+t,n,r))return!0}return sa(e,t,n,r)}function sa(e,t,n,r){var i=function(e,t,n){for(var r=0;r<e.state.keyMaps.length;r++){var i=Uo(t,e.state.keyMaps[r],n,e);if(i)return i}return e.options.extraKeys&&Uo(t,e.options.extraKeys,n,e)||Uo(t,e.options.keyMap,n,e)}(e,t,r);return"multi"==i&&(e.state.keySeq=t),"handled"==i&&ln(e,"keyHandled",e,t,n),"handled"!=i&&"multi"!=i||(be(n),xr(e)),!!i}function la(e,t){var n=Jo(t,!0);return!!n&&(t.shiftKey&&!e.state.keySeq?aa(e,"Shift-"+n,t,(function(t){return ia(e,t,!0)}))||aa(e,n,t,(function(t){if("string"==typeof t?/^go[A-Z]/.test(t):t.motion)return ia(e,t)})):aa(e,n,t,(function(t){return ia(e,t)})))}var ua=null;function ca(e){var t=this;if(!(e.target&&e.target!=t.display.input.getField()||(t.curOp.focus=E(),ge(t,e)))){a&&s<11&&27==e.keyCode&&(e.returnValue=!1);var r=e.keyCode;t.display.shift=16==r||e.shiftKey;var i=la(t,e);f&&(ua=i?r:null,i||88!=r||Le||!(y?e.metaKey:e.ctrlKey)||t.replaceSelection("",null,"cut")),n&&!y&&!i&&46==r&&e.shiftKey&&!e.ctrlKey&&document.execCommand&&document.execCommand("cut"),18!=r||/\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className)||function(e){var t=e.display.lineDiv;function n(e){18!=e.keyCode&&e.altKey||(C(t,"CodeMirror-crosshair"),pe(document,"keyup",n),pe(document,"mouseover",n))}L(t,"CodeMirror-crosshair"),fe(document,"keyup",n),fe(document,"mouseover",n)}(t)}}function fa(e){16==e.keyCode&&(this.doc.sel.shift=!1),ge(this,e)}function da(e){var t=this;if(!(e.target&&e.target!=t.display.input.getField()||kn(t.display,e)||ge(t,e)||e.ctrlKey&&!e.altKey||y&&e.metaKey)){var n=e.keyCode,r=e.charCode;if(f&&n==ua)return ua=null,void be(e);if(!f||e.which&&!(e.which<10)||!la(t,e)){var i=String.fromCharCode(null==r?n:r);"\b"!=i&&(function(e,t,n){return aa(e,"'"+n+"'",t,(function(t){return ia(e,t,!0)}))}(t,e,i)||t.display.input.onKeyPress(e))}}}var pa,ha,ga=function(e,t,n){this.time=e,this.pos=t,this.button=n};function va(e){var t=this,n=t.display;if(!(ge(t,e)||n.activeTouch&&n.input.supportsTouch()))if(n.input.ensurePolled(),n.shift=e.shiftKey,kn(n,e))l||(n.scroller.draggable=!1,setTimeout((function(){return n.scroller.draggable=!0}),100));else if(!ba(t,e)){var r=ur(t,e),i=je(e),o=r?function(e,t){var n=+new Date;return ha&&ha.compare(n,e,t)?(pa=ha=null,"triple"):pa&&pa.compare(n,e,t)?(ha=new ga(n,e,t),pa=null,"double"):(pa=new ga(n,e,t),ha=null,"single")}(r,i):"single";window.focus(),1==i&&t.state.selectingText&&t.state.selectingText(e),r&&function(e,t,n,r,i){var o="Click";"double"==r?o="Double"+o:"triple"==r&&(o="Triple"+o);return aa(e,Ko(o=(1==t?"Left":2==t?"Middle":"Right")+o,i),i,(function(t){if("string"==typeof t&&(t=ta[t]),!t)return!1;var r=!1;try{e.isReadOnly()&&(e.state.suppressEdits=!0),r=t(e,n)!=W}finally{e.state.suppressEdits=!1}return r}))}(t,i,r,o,e)||(1==i?r?function(e,t,n,r){a?setTimeout(I(kr,e),0):e.curOp.focus=E();var i,o=function(e,t,n){var r=e.getOption("configureMouse"),i=r?r(e,t,n):{};if(null==i.unit){var o=b?n.shiftKey&&n.metaKey:n.altKey;i.unit=o?"rectangle":"single"==t?"char":"double"==t?"word":"line"}(null==i.extend||e.doc.extend)&&(i.extend=e.doc.extend||n.shiftKey);null==i.addNew&&(i.addNew=y?n.metaKey:n.ctrlKey);null==i.moveOnDrag&&(i.moveOnDrag=!(y?n.altKey:n.ctrlKey));return i}(e,n,r),u=e.doc.sel;e.options.dragDrop&&Pe&&!e.isReadOnly()&&"single"==n&&(i=u.contains(t))>-1&&(tt((i=u.ranges[i]).from(),t)<0||t.xRel>0)&&(tt(i.to(),t)>0||t.xRel<0)?function(e,t,n,r){var i=e.display,o=!1,u=ei(e,(function(t){l&&(i.scroller.draggable=!1),e.state.draggingText=!1,pe(i.wrapper.ownerDocument,"mouseup",u),pe(i.wrapper.ownerDocument,"mousemove",c),pe(i.scroller,"dragstart",f),pe(i.scroller,"drop",u),o||(be(t),r.addNew||Ki(e.doc,n,null,null,r.extend),l&&!d||a&&9==s?setTimeout((function(){i.wrapper.ownerDocument.body.focus({preventScroll:!0}),i.input.focus()}),20):i.input.focus())})),c=function(e){o=o||Math.abs(t.clientX-e.clientX)+Math.abs(t.clientY-e.clientY)>=10},f=function(){return o=!0};l&&(i.scroller.draggable=!0);e.state.draggingText=u,u.copy=!r.moveOnDrag,i.scroller.dragDrop&&i.scroller.dragDrop();fe(i.wrapper.ownerDocument,"mouseup",u),fe(i.wrapper.ownerDocument,"mousemove",c),fe(i.scroller,"dragstart",f),fe(i.scroller,"drop",u),Or(e),setTimeout((function(){return i.input.focus()}),20)}(e,r,t,o):function(e,t,n,r){var i=e.display,o=e.doc;be(t);var a,s,l=o.sel,u=l.ranges;r.addNew&&!r.extend?(s=o.sel.contains(n),a=s>-1?u[s]:new Oi(n,n)):(a=o.sel.primary(),s=o.sel.primIndex);if("rectangle"==r.unit)r.addNew||(a=new Oi(n,n)),n=ur(e,t,!0,!0),s=-1;else{var c=ma(e,n,r.unit);a=r.extend?Gi(a,c.anchor,c.head,r.extend):c}r.addNew?-1==s?(s=u.length,Qi(o,ji(e,u.concat([a]),s),{scroll:!1,origin:"*mouse"})):u.length>1&&u[s].empty()&&"char"==r.unit&&!r.extend?(Qi(o,ji(e,u.slice(0,s).concat(u.slice(s+1)),0),{scroll:!1,origin:"*mouse"}),l=o.sel):Yi(o,s,a,B):(s=0,Qi(o,new ki([a],0),B),l=o.sel);var f=n;function d(t){if(0!=tt(f,t))if(f=t,"rectangle"==r.unit){for(var i=[],u=e.options.tabSize,c=R(Ue(o,n.line).text,n.ch,u),d=R(Ue(o,t.line).text,t.ch,u),p=Math.min(c,d),h=Math.max(c,d),g=Math.min(n.line,t.line),v=Math.min(e.lastLine(),Math.max(n.line,t.line));g<=v;g++){var m=Ue(o,g).text,y=V(m,p,u);p==h?i.push(new Oi(et(g,y),et(g,y))):m.length>y&&i.push(new Oi(et(g,y),et(g,V(m,h,u))))}i.length||i.push(new Oi(n,n)),Qi(o,ji(e,l.ranges.slice(0,s).concat(i),s),{origin:"*mouse",scroll:!1}),e.scrollIntoView(t)}else{var b,w=a,x=ma(e,t,r.unit),k=w.anchor;tt(x.anchor,k)>0?(b=x.head,k=ot(w.from(),x.anchor)):(b=x.anchor,k=it(w.to(),x.head));var O=l.ranges.slice(0);O[s]=function(e,t){var n=t.anchor,r=t.head,i=Ue(e.doc,n.line);if(0==tt(n,r)&&n.sticky==r.sticky)return t;var o=ue(i);if(!o)return t;var a=se(o,n.ch,n.sticky),s=o[a];if(s.from!=n.ch&&s.to!=n.ch)return t;var l,u=a+(s.from==n.ch==(1!=s.level)?0:1);if(0==u||u==o.length)return t;if(r.line!=n.line)l=(r.line-n.line)*("ltr"==e.doc.direction?1:-1)>0;else{var c=se(o,r.ch,r.sticky),f=c-a||(r.ch-n.ch)*(1==s.level?-1:1);l=c==u-1||c==u?f<0:f>0}var d=o[u+(l?-1:0)],p=l==(1==d.level),h=p?d.from:d.to,g=p?"after":"before";return n.ch==h&&n.sticky==g?t:new Oi(new et(n.line,h,g),r)}(e,new Oi(st(o,k),b)),Qi(o,ji(e,O,s),B)}}var p=i.wrapper.getBoundingClientRect(),h=0;function g(t){var n=++h,a=ur(e,t,!0,"rectangle"==r.unit);if(a)if(0!=tt(a,f)){e.curOp.focus=E(),d(a);var s=Ar(i,o);(a.line>=s.to||a.line<s.from)&&setTimeout(ei(e,(function(){h==n&&g(t)})),150)}else{var l=t.clientY<p.top?-20:t.clientY>p.bottom?20:0;l&&setTimeout(ei(e,(function(){h==n&&(i.scroller.scrollTop+=l,g(t))})),50)}}function v(t){e.state.selectingText=!1,h=1/0,t&&(be(t),i.input.focus()),pe(i.wrapper.ownerDocument,"mousemove",m),pe(i.wrapper.ownerDocument,"mouseup",y),o.history.lastSelOrigin=null}var m=ei(e,(function(e){0!==e.buttons&&je(e)?g(e):v(e)})),y=ei(e,v);e.state.selectingText=y,fe(i.wrapper.ownerDocument,"mousemove",m),fe(i.wrapper.ownerDocument,"mouseup",y)}(e,r,t,o)}(t,r,o,e):Oe(e)==n.scroller&&be(e):2==i?(r&&Ki(t.doc,r),setTimeout((function(){return n.input.focus()}),20)):3==i&&(O?t.display.input.onContextMenu(e):Or(t)))}}function ma(e,t,n){if("char"==n)return new Oi(t,t);if("word"==n)return e.findWordAt(t);if("line"==n)return new Oi(et(t.line,0),st(e.doc,et(t.line+1,0)));var r=n(e,t);return new Oi(r.from,r.to)}function ya(e,t,n,r){var i,o;if(t.touches)i=t.touches[0].clientX,o=t.touches[0].clientY;else try{i=t.clientX,o=t.clientY}catch(e){return!1}if(i>=Math.floor(e.display.gutters.getBoundingClientRect().right))return!1;r&&be(t);var a=e.display,s=a.lineDiv.getBoundingClientRect();if(o>s.bottom||!me(e,n))return xe(t);o-=s.top-a.viewOffset;for(var l=0;l<e.display.gutterSpecs.length;++l){var u=a.gutters.childNodes[l];if(u&&u.getBoundingClientRect().right>=i)return he(e,n,e,Xe(e.doc,o),e.display.gutterSpecs[l].className,t),xe(t)}}function ba(e,t){return ya(e,t,"gutterClick",!0)}function wa(e,t){kn(e.display,t)||function(e,t){if(!me(e,"gutterContextMenu"))return!1;return ya(e,t,"gutterContextMenu",!1)}(e,t)||ge(e,t,"contextmenu")||O||e.display.input.onContextMenu(t)}function xa(e){e.display.wrapper.className=e.display.wrapper.className.replace(/\s*cm-s-\S+/g,"")+e.options.theme.replace(/(^|\s)\s*/g," cm-s-"),Hn(e)}ga.prototype.compare=function(e,t,n){return this.time+400>e&&0==tt(t,this.pos)&&n==this.button};var ka={toString:function(){return"CodeMirror.Init"}},Oa={},ja={};function Sa(e,t,n){if(!t!=!(n&&n!=ka)){var r=e.display.dragFunctions,i=t?fe:pe;i(e.display.scroller,"dragstart",r.start),i(e.display.scroller,"dragenter",r.enter),i(e.display.scroller,"dragover",r.over),i(e.display.scroller,"dragleave",r.leave),i(e.display.scroller,"drop",r.drop)}}function Ca(e){e.options.lineWrapping?(L(e.display.wrapper,"CodeMirror-wrap"),e.display.sizer.style.minWidth="",e.display.sizerWidth=null):(C(e.display.wrapper,"CodeMirror-wrap"),Vt(e)),lr(e),fr(e),Hn(e),setTimeout((function(){return Wr(e)}),100)}function Pa(e,t){var n=this;if(!(this instanceof Pa))return new Pa(e,t);this.options=t=t?F(t):{},F(Oa,t,!1);var r=t.value;"string"==typeof r?r=new To(r,t.mode,null,t.lineSeparator,t.direction):t.mode&&(r.modeOption=t.mode),this.doc=r;var i=new Pa.inputStyles[t.inputStyle](this),o=this.display=new vi(e,r,i,t);for(var u in o.wrapper.CodeMirror=this,xa(this),t.lineWrapping&&(this.display.wrapper.className+=" CodeMirror-wrap"),qr(this),this.state={keyMaps:[],overlays:[],modeGen:0,overwrite:!1,delayingBlurEvent:!1,focused:!1,suppressEdits:!1,pasteIncoming:-1,cutIncoming:-1,selectingText:!1,draggingText:!1,highlight:new $,keySeq:null,specialChars:null},t.autofocus&&!m&&o.input.focus(),a&&s<11&&setTimeout((function(){return n.display.input.reset(!0)}),20),function(e){var t=e.display;fe(t.scroller,"mousedown",ei(e,va)),fe(t.scroller,"dblclick",a&&s<11?ei(e,(function(t){if(!ge(e,t)){var n=ur(e,t);if(n&&!ba(e,t)&&!kn(e.display,t)){be(t);var r=e.findWordAt(n);Ki(e.doc,r.anchor,r.head)}}})):function(t){return ge(e,t)||be(t)});fe(t.scroller,"contextmenu",(function(t){return wa(e,t)})),fe(t.input.getField(),"contextmenu",(function(n){t.scroller.contains(n.target)||wa(e,n)}));var n,r={end:0};function i(){t.activeTouch&&(n=setTimeout((function(){return t.activeTouch=null}),1e3),(r=t.activeTouch).end=+new Date)}function o(e){if(1!=e.touches.length)return!1;var t=e.touches[0];return t.radiusX<=1&&t.radiusY<=1}function l(e,t){if(null==t.left)return!0;var n=t.left-e.left,r=t.top-e.top;return n*n+r*r>400}fe(t.scroller,"touchstart",(function(i){if(!ge(e,i)&&!o(i)&&!ba(e,i)){t.input.ensurePolled(),clearTimeout(n);var a=+new Date;t.activeTouch={start:a,moved:!1,prev:a-r.end<=300?r:null},1==i.touches.length&&(t.activeTouch.left=i.touches[0].pageX,t.activeTouch.top=i.touches[0].pageY)}})),fe(t.scroller,"touchmove",(function(){t.activeTouch&&(t.activeTouch.moved=!0)})),fe(t.scroller,"touchend",(function(n){var r=t.activeTouch;if(r&&!kn(t,n)&&null!=r.left&&!r.moved&&new Date-r.start<300){var o,a=e.coordsChar(t.activeTouch,"page");o=!r.prev||l(r,r.prev)?new Oi(a,a):!r.prev.prev||l(r,r.prev.prev)?e.findWordAt(a):new Oi(et(a.line,0),st(e.doc,et(a.line+1,0))),e.setSelection(o.anchor,o.head),e.focus(),be(n)}i()})),fe(t.scroller,"touchcancel",i),fe(t.scroller,"scroll",(function(){t.scroller.clientHeight&&(Dr(e,t.scroller.scrollTop),Fr(e,t.scroller.scrollLeft,!0),he(e,"scroll",e))})),fe(t.scroller,"mousewheel",(function(t){return xi(e,t)})),fe(t.scroller,"DOMMouseScroll",(function(t){return xi(e,t)})),fe(t.wrapper,"scroll",(function(){return t.wrapper.scrollTop=t.wrapper.scrollLeft=0})),t.dragFunctions={enter:function(t){ge(e,t)||ke(t)},over:function(t){ge(e,t)||(!function(e,t){var n=ur(e,t);if(n){var r=document.createDocumentFragment();yr(e,n,r),e.display.dragCursor||(e.display.dragCursor=M("div",null,"CodeMirror-cursors CodeMirror-dragcursors"),e.display.lineSpace.insertBefore(e.display.dragCursor,e.display.cursorDiv)),A(e.display.dragCursor,r)}}(e,t),ke(t))},start:function(t){return function(e,t){if(a&&(!e.state.draggingText||+new Date-Eo<100))ke(t);else if(!ge(e,t)&&!kn(e.display,t)&&(t.dataTransfer.setData("Text",e.getSelection()),t.dataTransfer.effectAllowed="copyMove",t.dataTransfer.setDragImage&&!d)){var n=M("img",null,null,"position: fixed; left: 0; top: 0;");n.src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",f&&(n.width=n.height=1,e.display.wrapper.appendChild(n),n._top=n.offsetTop),t.dataTransfer.setDragImage(n,0,0),f&&n.parentNode.removeChild(n)}}(e,t)},drop:ei(e,Lo),leave:function(t){ge(e,t)||No(e)}};var u=t.input.getField();fe(u,"keyup",(function(t){return fa.call(e,t)})),fe(u,"keydown",ei(e,ca)),fe(u,"keypress",ei(e,da)),fe(u,"focus",(function(t){return jr(e,t)})),fe(u,"blur",(function(t){return Sr(e,t)}))}(this),Fo(),Ur(this),this.curOp.forceUpdate=!0,Di(this,r),t.autofocus&&!m||this.hasFocus()?setTimeout((function(){n.hasFocus()&&!n.state.focused&&jr(n)}),20):Sr(this),ja)ja.hasOwnProperty(u)&&ja[u](this,t[u],ka);di(this),t.finishInit&&t.finishInit(this);for(var c=0;c<Aa.length;++c)Aa[c](this);Gr(this),l&&t.lineWrapping&&"optimizelegibility"==getComputedStyle(o.lineDiv).textRendering&&(o.lineDiv.style.textRendering="auto")}Pa.defaults=Oa,Pa.optionHandlers=ja;var Aa=[];function Ma(e,t,n,r){var i,o=e.doc;null==n&&(n="add"),"smart"==n&&(o.mode.indent?i=pt(e,t).state:n="prev");var a=e.options.tabSize,s=Ue(o,t),l=R(s.text,null,a);s.stateAfter&&(s.stateAfter=null);var u,c=s.text.match(/^\s*/)[0];if(r||/\S/.test(s.text)){if("smart"==n&&((u=o.mode.indent(i,s.text.slice(c.length),s.text))==W||u>150)){if(!r)return;n="prev"}}else u=0,n="not";"prev"==n?u=t>o.first?R(Ue(o,t-1).text,null,a):0:"add"==n?u=l+e.options.indentUnit:"subtract"==n?u=l-e.options.indentUnit:"number"==typeof n&&(u=l+n),u=Math.max(0,u);var f="",d=0;if(e.options.indentWithTabs)for(var p=Math.floor(u/a);p;--p)d+=a,f+="\t";if(d<u&&(f+=G(u-d)),f!=c)return go(o,f,et(t,0),et(t,c.length),"+input"),s.stateAfter=null,!0;for(var h=0;h<o.sel.ranges.length;h++){var g=o.sel.ranges[h];if(g.head.line==t&&g.head.ch<c.length){var v=et(t,c.length);Yi(o,h,new Oi(v,v));break}}}Pa.defineInitHook=function(e){return Aa.push(e)};var _a=null;function Ta(e){_a=e}function Ea(e,t,n,r,i){var o=e.doc;e.display.shift=!1,r||(r=o.sel);var a=+new Date-200,s="paste"==i||e.state.pasteIncoming>a,l=Te(t),u=null;if(s&&r.ranges.length>1)if(_a&&_a.text.join("\n")==t){if(r.ranges.length%_a.text.length==0){u=[];for(var c=0;c<_a.text.length;c++)u.push(o.splitLines(_a.text[c]))}}else l.length==r.ranges.length&&e.options.pasteLinesPerSelection&&(u=J(l,(function(e){return[e]})));for(var f=e.curOp.updateInput,d=r.ranges.length-1;d>=0;d--){var p=r.ranges[d],h=p.from(),g=p.to();p.empty()&&(n&&n>0?h=et(h.line,h.ch-n):e.state.overwrite&&!s?g=et(g.line,Math.min(Ue(o,g.line).text.length,g.ch+K(l).length)):s&&_a&&_a.lineWise&&_a.text.join("\n")==l.join("\n")&&(h=g=et(h.line,0)));var v={from:h,to:g,text:u?u[d%u.length]:l,origin:i||(s?"paste":e.state.cutIncoming>a?"cut":"+input")};uo(e.doc,v),ln(e,"inputRead",e,v)}t&&!s&&Na(e,t),Tr(e),e.curOp.updateInput<2&&(e.curOp.updateInput=f),e.curOp.typing=!0,e.state.pasteIncoming=e.state.cutIncoming=-1}function La(e,t){var n=e.clipboardData&&e.clipboardData.getData("Text");if(n)return e.preventDefault(),t.isReadOnly()||t.options.disableInput||Qr(t,(function(){return Ea(t,n,0,null,"paste")})),!0}function Na(e,t){if(e.options.electricChars&&e.options.smartIndent)for(var n=e.doc.sel,r=n.ranges.length-1;r>=0;r--){var i=n.ranges[r];if(!(i.head.ch>100||r&&n.ranges[r-1].head.line==i.head.line)){var o=e.getModeAt(i.head),a=!1;if(o.electricChars){for(var s=0;s<o.electricChars.length;s++)if(t.indexOf(o.electricChars.charAt(s))>-1){a=Ma(e,i.head.line,"smart");break}}else o.electricInput&&o.electricInput.test(Ue(e.doc,i.head.line).text.slice(0,i.head.ch))&&(a=Ma(e,i.head.line,"smart"));a&&ln(e,"electricInput",e,i.head.line)}}}function Da(e){for(var t=[],n=[],r=0;r<e.doc.sel.ranges.length;r++){var i=e.doc.sel.ranges[r].head.line,o={anchor:et(i,0),head:et(i+1,0)};n.push(o),t.push(e.getRange(o.anchor,o.head))}return{text:t,ranges:n}}function Ia(e,t,n,r){e.setAttribute("autocorrect",n?"":"off"),e.setAttribute("autocapitalize",r?"":"off"),e.setAttribute("spellcheck",!!t)}function Fa(){var e=M("textarea",null,null,"position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none"),t=M("div",[e],null,"overflow: hidden; position: relative; width: 3px; height: 0px;");return l?e.style.width="1000px":e.setAttribute("wrap","off"),g&&(e.style.border="1px solid black"),Ia(e),t}function Ra(e,t,n,r,i){var o=t,a=n,s=Ue(e,t.line),l=i&&"rtl"==e.direction?-n:n;function u(o){var a,u;if("codepoint"==r){var c=s.text.charCodeAt(t.ch+(r>0?0:-1));a=isNaN(c)?null:new et(t.line,Math.max(0,Math.min(s.text.length,t.ch+n*(c>=55296&&c<56320?2:1))),-n)}else a=i?function(e,t,n,r){var i=ue(t,e.doc.direction);if(!i)return Qo(t,n,r);n.ch>=t.text.length?(n.ch=t.text.length,n.sticky="before"):n.ch<=0&&(n.ch=0,n.sticky="after");var o=se(i,n.ch,n.sticky),a=i[o];if("ltr"==e.doc.direction&&a.level%2==0&&(r>0?a.to>n.ch:a.from<n.ch))return Qo(t,n,r);var s,l=function(e,n){return Zo(t,e instanceof et?e.ch:e,n)},u=function(n){return e.options.lineWrapping?(s=s||En(e,t),Zn(e,t,s,n)):{begin:0,end:t.text.length}},c=u("before"==n.sticky?l(n,-1):n.ch);if("rtl"==e.doc.direction||1==a.level){var f=1==a.level==r<0,d=l(n,f?1:-1);if(null!=d&&(f?d<=a.to&&d<=c.end:d>=a.from&&d>=c.begin)){var p=f?"before":"after";return new et(n.line,d,p)}}var h=function(e,t,r){for(var o=function(e,t){return t?new et(n.line,l(e,1),"before"):new et(n.line,e,"after")};e>=0&&e<i.length;e+=t){var a=i[e],s=t>0==(1!=a.level),u=s?r.begin:l(r.end,-1);if(a.from<=u&&u<a.to)return o(u,s);if(u=s?a.from:l(a.to,-1),r.begin<=u&&u<r.end)return o(u,s)}},g=h(o+r,r,c);if(g)return g;var v=r>0?c.end:l(c.begin,-1);return null==v||r>0&&v==t.text.length||!(g=h(r>0?0:i.length-1,r,u(v)))?null:g}(e.cm,s,t,n):Qo(s,t,n);if(null==a){if(o||(u=t.line+l)<e.first||u>=e.first+e.size||(t=new et(u,t.ch,t.sticky),!(s=Ue(e,u))))return!1;t=ea(i,e.cm,s,t.line,l)}else t=a;return!0}if("char"==r||"codepoint"==r)u();else if("column"==r)u(!0);else if("word"==r||"group"==r)for(var c=null,f="group"==r,d=e.cm&&e.cm.getHelper(t,"wordChars"),p=!0;!(n<0)||u(!p);p=!1){var h=s.text.charAt(t.ch)||"\n",g=ee(h,d)?"w":f&&"\n"==h?"n":!f||/\s/.test(h)?null:"p";if(!f||p||g||(g="s"),c&&c!=g){n<0&&(n=1,u(),t.sticky="after");break}if(g&&(c=g),n>0&&!u(!p))break}var v=oo(e,t,o,a,!0);return nt(o,v)&&(v.hitSide=!0),v}function $a(e,t,n,r){var i,o,a=e.doc,s=t.left;if("page"==r){var l=Math.min(e.display.wrapper.clientHeight,window.innerHeight||document.documentElement.clientHeight),u=Math.max(l-.5*rr(e.display),3);i=(n>0?t.bottom:t.top)+n*u}else"line"==r&&(i=n>0?t.bottom+3:t.top-3);for(;(o=Yn(e,s,i)).outside;){if(n<0?i<=0:i>=a.height){o.hitSide=!0;break}i+=5*n}return o}var Ha=function(e){this.cm=e,this.lastAnchorNode=this.lastAnchorOffset=this.lastFocusNode=this.lastFocusOffset=null,this.polling=new $,this.composing=null,this.gracePeriod=!1,this.readDOMTimeout=null};function Wa(e,t){var n=Tn(e,t.line);if(!n||n.hidden)return null;var r=Ue(e.doc,t.line),i=Mn(n,r,t.line),o=ue(r,e.doc.direction),a="left";o&&(a=se(o,t.ch)%2?"right":"left");var s=In(i.map,t.ch,a);return s.offset="right"==s.collapse?s.end:s.start,s}function za(e,t){return t&&(e.bad=!0),e}function Ba(e,t,n){var r;if(t==e.display.lineDiv){if(!(r=e.display.lineDiv.childNodes[n]))return za(e.clipPos(et(e.display.viewTo-1)),!0);t=null,n=0}else for(r=t;;r=r.parentNode){if(!r||r==e.display.lineDiv)return null;if(r.parentNode&&r.parentNode==e.display.lineDiv)break}for(var i=0;i<e.display.view.length;i++){var o=e.display.view[i];if(o.node==r)return qa(o,t,n)}}function qa(e,t,n){var r=e.text.firstChild,i=!1;if(!t||!T(r,t))return za(et(Ye(e.line),0),!0);if(t==r&&(i=!0,t=r.childNodes[n],n=0,!t)){var o=e.rest?K(e.rest):e.line;return za(et(Ye(o),o.text.length),i)}var a=3==t.nodeType?t:null,s=t;for(a||1!=t.childNodes.length||3!=t.firstChild.nodeType||(a=t.firstChild,n&&(n=a.nodeValue.length));s.parentNode!=r;)s=s.parentNode;var l=e.measure,u=l.maps;function c(t,n,r){for(var i=-1;i<(u?u.length:0);i++)for(var o=i<0?l.map:u[i],a=0;a<o.length;a+=3){var s=o[a+2];if(s==t||s==n){var c=Ye(i<0?e.line:e.rest[i]),f=o[a]+r;return(r<0||s!=t)&&(f=o[a+(r?1:0)]),et(c,f)}}}var f=c(a,s,n);if(f)return za(f,i);for(var d=s.nextSibling,p=a?a.nodeValue.length-n:0;d;d=d.nextSibling){if(f=c(d,d.firstChild,0))return za(et(f.line,f.ch-p),i);p+=d.textContent.length}for(var h=s.previousSibling,g=n;h;h=h.previousSibling){if(f=c(h,h.firstChild,-1))return za(et(f.line,f.ch+g),i);g+=h.textContent.length}}Ha.prototype.init=function(e){var t=this,n=this,r=n.cm,i=n.div=e.lineDiv;function o(e){for(var t=e.target;t;t=t.parentNode){if(t==i)return!0;if(/\bCodeMirror-(?:line)?widget\b/.test(t.className))break}return!1}function a(e){if(o(e)&&!ge(r,e)){if(r.somethingSelected())Ta({lineWise:!1,text:r.getSelections()}),"cut"==e.type&&r.replaceSelection("",null,"cut");else{if(!r.options.lineWiseCopyCut)return;var t=Da(r);Ta({lineWise:!0,text:t.text}),"cut"==e.type&&r.operation((function(){r.setSelections(t.ranges,0,z),r.replaceSelection("",null,"cut")}))}if(e.clipboardData){e.clipboardData.clearData();var a=_a.text.join("\n");if(e.clipboardData.setData("Text",a),e.clipboardData.getData("Text")==a)return void e.preventDefault()}var s=Fa(),l=s.firstChild;r.display.lineSpace.insertBefore(s,r.display.lineSpace.firstChild),l.value=_a.text.join("\n");var u=document.activeElement;D(l),setTimeout((function(){r.display.lineSpace.removeChild(s),u.focus(),u==i&&n.showPrimarySelection()}),50)}}Ia(i,r.options.spellcheck,r.options.autocorrect,r.options.autocapitalize),fe(i,"paste",(function(e){!o(e)||ge(r,e)||La(e,r)||s<=11&&setTimeout(ei(r,(function(){return t.updateFromDOM()})),20)})),fe(i,"compositionstart",(function(e){t.composing={data:e.data,done:!1}})),fe(i,"compositionupdate",(function(e){t.composing||(t.composing={data:e.data,done:!1})})),fe(i,"compositionend",(function(e){t.composing&&(e.data!=t.composing.data&&t.readFromDOMSoon(),t.composing.done=!0)})),fe(i,"touchstart",(function(){return n.forceCompositionEnd()})),fe(i,"input",(function(){t.composing||t.readFromDOMSoon()})),fe(i,"copy",a),fe(i,"cut",a)},Ha.prototype.screenReaderLabelChanged=function(e){e?this.div.setAttribute("aria-label",e):this.div.removeAttribute("aria-label")},Ha.prototype.prepareSelection=function(){var e=mr(this.cm,!1);return e.focus=document.activeElement==this.div,e},Ha.prototype.showSelection=function(e,t){e&&this.cm.display.view.length&&((e.focus||t)&&this.showPrimarySelection(),this.showMultipleSelections(e))},Ha.prototype.getSelection=function(){return this.cm.display.wrapper.ownerDocument.getSelection()},Ha.prototype.showPrimarySelection=function(){var e=this.getSelection(),t=this.cm,r=t.doc.sel.primary(),i=r.from(),o=r.to();if(t.display.viewTo==t.display.viewFrom||i.line>=t.display.viewTo||o.line<t.display.viewFrom)e.removeAllRanges();else{var a=Ba(t,e.anchorNode,e.anchorOffset),s=Ba(t,e.focusNode,e.focusOffset);if(!a||a.bad||!s||s.bad||0!=tt(ot(a,s),i)||0!=tt(it(a,s),o)){var l=t.display.view,u=i.line>=t.display.viewFrom&&Wa(t,i)||{node:l[0].measure.map[2],offset:0},c=o.line<t.display.viewTo&&Wa(t,o);if(!c){var f=l[l.length-1].measure,d=f.maps?f.maps[f.maps.length-1]:f.map;c={node:d[d.length-1],offset:d[d.length-2]-d[d.length-3]}}if(u&&c){var p,h=e.rangeCount&&e.getRangeAt(0);try{p=S(u.node,u.offset,c.offset,c.node)}catch(e){}p&&(!n&&t.state.focused?(e.collapse(u.node,u.offset),p.collapsed||(e.removeAllRanges(),e.addRange(p))):(e.removeAllRanges(),e.addRange(p)),h&&null==e.anchorNode?e.addRange(h):n&&this.startGracePeriod()),this.rememberSelection()}else e.removeAllRanges()}}},Ha.prototype.startGracePeriod=function(){var e=this;clearTimeout(this.gracePeriod),this.gracePeriod=setTimeout((function(){e.gracePeriod=!1,e.selectionChanged()&&e.cm.operation((function(){return e.cm.curOp.selectionChanged=!0}))}),20)},Ha.prototype.showMultipleSelections=function(e){A(this.cm.display.cursorDiv,e.cursors),A(this.cm.display.selectionDiv,e.selection)},Ha.prototype.rememberSelection=function(){var e=this.getSelection();this.lastAnchorNode=e.anchorNode,this.lastAnchorOffset=e.anchorOffset,this.lastFocusNode=e.focusNode,this.lastFocusOffset=e.focusOffset},Ha.prototype.selectionInEditor=function(){var e=this.getSelection();if(!e.rangeCount)return!1;var t=e.getRangeAt(0).commonAncestorContainer;return T(this.div,t)},Ha.prototype.focus=function(){"nocursor"!=this.cm.options.readOnly&&(this.selectionInEditor()&&document.activeElement==this.div||this.showSelection(this.prepareSelection(),!0),this.div.focus())},Ha.prototype.blur=function(){this.div.blur()},Ha.prototype.getField=function(){return this.div},Ha.prototype.supportsTouch=function(){return!0},Ha.prototype.receivedFocus=function(){var e=this;this.selectionInEditor()?this.pollSelection():Qr(this.cm,(function(){return e.cm.curOp.selectionChanged=!0})),this.polling.set(this.cm.options.pollInterval,(function t(){e.cm.state.focused&&(e.pollSelection(),e.polling.set(e.cm.options.pollInterval,t))}))},Ha.prototype.selectionChanged=function(){var e=this.getSelection();return e.anchorNode!=this.lastAnchorNode||e.anchorOffset!=this.lastAnchorOffset||e.focusNode!=this.lastFocusNode||e.focusOffset!=this.lastFocusOffset},Ha.prototype.pollSelection=function(){if(null==this.readDOMTimeout&&!this.gracePeriod&&this.selectionChanged()){var e=this.getSelection(),t=this.cm;if(v&&c&&this.cm.display.gutterSpecs.length&&function(e){for(var t=e;t;t=t.parentNode)if(/CodeMirror-gutter-wrapper/.test(t.className))return!0;return!1}(e.anchorNode))return this.cm.triggerOnKeyDown({type:"keydown",keyCode:8,preventDefault:Math.abs}),this.blur(),void this.focus();if(!this.composing){this.rememberSelection();var n=Ba(t,e.anchorNode,e.anchorOffset),r=Ba(t,e.focusNode,e.focusOffset);n&&r&&Qr(t,(function(){Qi(t.doc,Si(n,r),z),(n.bad||r.bad)&&(t.curOp.selectionChanged=!0)}))}}},Ha.prototype.pollContent=function(){null!=this.readDOMTimeout&&(clearTimeout(this.readDOMTimeout),this.readDOMTimeout=null);var e,t,n,r=this.cm,i=r.display,o=r.doc.sel.primary(),a=o.from(),s=o.to();if(0==a.ch&&a.line>r.firstLine()&&(a=et(a.line-1,Ue(r.doc,a.line-1).length)),s.ch==Ue(r.doc,s.line).text.length&&s.line<r.lastLine()&&(s=et(s.line+1,0)),a.line<i.viewFrom||s.line>i.viewTo-1)return!1;a.line==i.viewFrom||0==(e=cr(r,a.line))?(t=Ye(i.view[0].line),n=i.view[0].node):(t=Ye(i.view[e].line),n=i.view[e-1].node.nextSibling);var l,u,c=cr(r,s.line);if(c==i.view.length-1?(l=i.viewTo-1,u=i.lineDiv.lastChild):(l=Ye(i.view[c+1].line)-1,u=i.view[c+1].node.previousSibling),!n)return!1;for(var f=r.doc.splitLines(function(e,t,n,r,i){var o="",a=!1,s=e.doc.lineSeparator(),l=!1;function u(e){return function(t){return t.id==e}}function c(){a&&(o+=s,l&&(o+=s),a=l=!1)}function f(e){e&&(c(),o+=e)}function d(t){if(1==t.nodeType){var n=t.getAttribute("cm-text");if(n)return void f(n);var o,p=t.getAttribute("cm-marker");if(p){var h=e.findMarks(et(r,0),et(i+1,0),u(+p));return void(h.length&&(o=h[0].find(0))&&f(Ge(e.doc,o.from,o.to).join(s)))}if("false"==t.getAttribute("contenteditable"))return;var g=/^(pre|div|p|li|table|br)$/i.test(t.nodeName);if(!/^br$/i.test(t.nodeName)&&0==t.textContent.length)return;g&&c();for(var v=0;v<t.childNodes.length;v++)d(t.childNodes[v]);/^(pre|p)$/i.test(t.nodeName)&&(l=!0),g&&(a=!0)}else 3==t.nodeType&&f(t.nodeValue.replace(/\u200b/g,"").replace(/\u00a0/g," "))}for(;d(t),t!=n;)t=t.nextSibling,l=!1;return o}(r,n,u,t,l)),d=Ge(r.doc,et(t,0),et(l,Ue(r.doc,l).text.length));f.length>1&&d.length>1;)if(K(f)==K(d))f.pop(),d.pop(),l--;else{if(f[0]!=d[0])break;f.shift(),d.shift(),t++}for(var p=0,h=0,g=f[0],v=d[0],m=Math.min(g.length,v.length);p<m&&g.charCodeAt(p)==v.charCodeAt(p);)++p;for(var y=K(f),b=K(d),w=Math.min(y.length-(1==f.length?p:0),b.length-(1==d.length?p:0));h<w&&y.charCodeAt(y.length-h-1)==b.charCodeAt(b.length-h-1);)++h;if(1==f.length&&1==d.length&&t==a.line)for(;p&&p>a.ch&&y.charCodeAt(y.length-h-1)==b.charCodeAt(b.length-h-1);)p--,h++;f[f.length-1]=y.slice(0,y.length-h).replace(/^\u200b+/,""),f[0]=f[0].slice(p).replace(/\u200b+$/,"");var x=et(t,p),k=et(l,d.length?K(d).length-h:0);return f.length>1||f[0]||tt(x,k)?(go(r.doc,f,x,k,"+input"),!0):void 0},Ha.prototype.ensurePolled=function(){this.forceCompositionEnd()},Ha.prototype.reset=function(){this.forceCompositionEnd()},Ha.prototype.forceCompositionEnd=function(){this.composing&&(clearTimeout(this.readDOMTimeout),this.composing=null,this.updateFromDOM(),this.div.blur(),this.div.focus())},Ha.prototype.readFromDOMSoon=function(){var e=this;null==this.readDOMTimeout&&(this.readDOMTimeout=setTimeout((function(){if(e.readDOMTimeout=null,e.composing){if(!e.composing.done)return;e.composing=null}e.updateFromDOM()}),80))},Ha.prototype.updateFromDOM=function(){var e=this;!this.cm.isReadOnly()&&this.pollContent()||Qr(this.cm,(function(){return fr(e.cm)}))},Ha.prototype.setUneditable=function(e){e.contentEditable="false"},Ha.prototype.onKeyPress=function(e){0==e.charCode||this.composing||(e.preventDefault(),this.cm.isReadOnly()||ei(this.cm,Ea)(this.cm,String.fromCharCode(null==e.charCode?e.keyCode:e.charCode),0))},Ha.prototype.readOnlyChanged=function(e){this.div.contentEditable=String("nocursor"!=e)},Ha.prototype.onContextMenu=function(){},Ha.prototype.resetPosition=function(){},Ha.prototype.needsContentAttribute=!0;var Va=function(e){this.cm=e,this.prevInput="",this.pollingFast=!1,this.polling=new $,this.hasSelection=!1,this.composing=null};Va.prototype.init=function(e){var t=this,n=this,r=this.cm;this.createField(e);var i=this.textarea;function o(e){if(!ge(r,e)){if(r.somethingSelected())Ta({lineWise:!1,text:r.getSelections()});else{if(!r.options.lineWiseCopyCut)return;var t=Da(r);Ta({lineWise:!0,text:t.text}),"cut"==e.type?r.setSelections(t.ranges,null,z):(n.prevInput="",i.value=t.text.join("\n"),D(i))}"cut"==e.type&&(r.state.cutIncoming=+new Date)}}e.wrapper.insertBefore(this.wrapper,e.wrapper.firstChild),g&&(i.style.width="0px"),fe(i,"input",(function(){a&&s>=9&&t.hasSelection&&(t.hasSelection=null),n.poll()})),fe(i,"paste",(function(e){ge(r,e)||La(e,r)||(r.state.pasteIncoming=+new Date,n.fastPoll())})),fe(i,"cut",o),fe(i,"copy",o),fe(e.scroller,"paste",(function(t){if(!kn(e,t)&&!ge(r,t)){if(!i.dispatchEvent)return r.state.pasteIncoming=+new Date,void n.focus();var o=new Event("paste");o.clipboardData=t.clipboardData,i.dispatchEvent(o)}})),fe(e.lineSpace,"selectstart",(function(t){kn(e,t)||be(t)})),fe(i,"compositionstart",(function(){var e=r.getCursor("from");n.composing&&n.composing.range.clear(),n.composing={start:e,range:r.markText(e,r.getCursor("to"),{className:"CodeMirror-composing"})}})),fe(i,"compositionend",(function(){n.composing&&(n.poll(),n.composing.range.clear(),n.composing=null)}))},Va.prototype.createField=function(e){this.wrapper=Fa(),this.textarea=this.wrapper.firstChild},Va.prototype.screenReaderLabelChanged=function(e){e?this.textarea.setAttribute("aria-label",e):this.textarea.removeAttribute("aria-label")},Va.prototype.prepareSelection=function(){var e=this.cm,t=e.display,n=e.doc,r=mr(e);if(e.options.moveInputWithCursor){var i=Gn(e,n.sel.primary().head,"div"),o=t.wrapper.getBoundingClientRect(),a=t.lineDiv.getBoundingClientRect();r.teTop=Math.max(0,Math.min(t.wrapper.clientHeight-10,i.top+a.top-o.top)),r.teLeft=Math.max(0,Math.min(t.wrapper.clientWidth-10,i.left+a.left-o.left))}return r},Va.prototype.showSelection=function(e){var t=this.cm.display;A(t.cursorDiv,e.cursors),A(t.selectionDiv,e.selection),null!=e.teTop&&(this.wrapper.style.top=e.teTop+"px",this.wrapper.style.left=e.teLeft+"px")},Va.prototype.reset=function(e){if(!this.contextMenuPending&&!this.composing){var t=this.cm;if(t.somethingSelected()){this.prevInput="";var n=t.getSelection();this.textarea.value=n,t.state.focused&&D(this.textarea),a&&s>=9&&(this.hasSelection=n)}else e||(this.prevInput=this.textarea.value="",a&&s>=9&&(this.hasSelection=null))}},Va.prototype.getField=function(){return this.textarea},Va.prototype.supportsTouch=function(){return!1},Va.prototype.focus=function(){if("nocursor"!=this.cm.options.readOnly&&(!m||E()!=this.textarea))try{this.textarea.focus()}catch(e){}},Va.prototype.blur=function(){this.textarea.blur()},Va.prototype.resetPosition=function(){this.wrapper.style.top=this.wrapper.style.left=0},Va.prototype.receivedFocus=function(){this.slowPoll()},Va.prototype.slowPoll=function(){var e=this;this.pollingFast||this.polling.set(this.cm.options.pollInterval,(function(){e.poll(),e.cm.state.focused&&e.slowPoll()}))},Va.prototype.fastPoll=function(){var e=!1,t=this;t.pollingFast=!0,t.polling.set(20,(function n(){t.poll()||e?(t.pollingFast=!1,t.slowPoll()):(e=!0,t.polling.set(60,n))}))},Va.prototype.poll=function(){var e=this,t=this.cm,n=this.textarea,r=this.prevInput;if(this.contextMenuPending||!t.state.focused||Ee(n)&&!r&&!this.composing||t.isReadOnly()||t.options.disableInput||t.state.keySeq)return!1;var i=n.value;if(i==r&&!t.somethingSelected())return!1;if(a&&s>=9&&this.hasSelection===i||y&&/[\uf700-\uf7ff]/.test(i))return t.display.input.reset(),!1;if(t.doc.sel==t.display.selForContextMenu){var o=i.charCodeAt(0);if(8203!=o||r||(r="​"),8666==o)return this.reset(),this.cm.execCommand("undo")}for(var l=0,u=Math.min(r.length,i.length);l<u&&r.charCodeAt(l)==i.charCodeAt(l);)++l;return Qr(t,(function(){Ea(t,i.slice(l),r.length-l,null,e.composing?"*compose":null),i.length>1e3||i.indexOf("\n")>-1?n.value=e.prevInput="":e.prevInput=i,e.composing&&(e.composing.range.clear(),e.composing.range=t.markText(e.composing.start,t.getCursor("to"),{className:"CodeMirror-composing"}))})),!0},Va.prototype.ensurePolled=function(){this.pollingFast&&this.poll()&&(this.pollingFast=!1)},Va.prototype.onKeyPress=function(){a&&s>=9&&(this.hasSelection=null),this.fastPoll()},Va.prototype.onContextMenu=function(e){var t=this,n=t.cm,r=n.display,i=t.textarea;t.contextMenuPending&&t.contextMenuPending();var o=ur(n,e),u=r.scroller.scrollTop;if(o&&!f){n.options.resetSelectionOnContextMenu&&-1==n.doc.sel.contains(o)&&ei(n,Qi)(n.doc,Si(o),z);var c,d=i.style.cssText,p=t.wrapper.style.cssText,h=t.wrapper.offsetParent.getBoundingClientRect();if(t.wrapper.style.cssText="position: static",i.style.cssText="position: absolute; width: 30px; height: 30px;\n      top: "+(e.clientY-h.top-5)+"px; left: "+(e.clientX-h.left-5)+"px;\n      z-index: 1000; background: "+(a?"rgba(255, 255, 255, .05)":"transparent")+";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);",l&&(c=window.scrollY),r.input.focus(),l&&window.scrollTo(null,c),r.input.reset(),n.somethingSelected()||(i.value=t.prevInput=" "),t.contextMenuPending=m,r.selForContextMenu=n.doc.sel,clearTimeout(r.detectingSelectAll),a&&s>=9&&v(),O){ke(e);var g=function(){pe(window,"mouseup",g),setTimeout(m,20)};fe(window,"mouseup",g)}else setTimeout(m,50)}function v(){if(null!=i.selectionStart){var e=n.somethingSelected(),o="​"+(e?i.value:"");i.value="⇚",i.value=o,t.prevInput=e?"":"​",i.selectionStart=1,i.selectionEnd=o.length,r.selForContextMenu=n.doc.sel}}function m(){if(t.contextMenuPending==m&&(t.contextMenuPending=!1,t.wrapper.style.cssText=p,i.style.cssText=d,a&&s<9&&r.scrollbars.setScrollTop(r.scroller.scrollTop=u),null!=i.selectionStart)){(!a||a&&s<9)&&v();var e=0,o=function(){r.selForContextMenu==n.doc.sel&&0==i.selectionStart&&i.selectionEnd>0&&"​"==t.prevInput?ei(n,so)(n):e++<10?r.detectingSelectAll=setTimeout(o,500):(r.selForContextMenu=null,r.input.reset())};r.detectingSelectAll=setTimeout(o,200)}}},Va.prototype.readOnlyChanged=function(e){e||this.reset(),this.textarea.disabled="nocursor"==e,this.textarea.readOnly=!!e},Va.prototype.setUneditable=function(){},Va.prototype.needsContentAttribute=!1,function(e){var t=e.optionHandlers;function n(n,r,i,o){e.defaults[n]=r,i&&(t[n]=o?function(e,t,n){n!=ka&&i(e,t,n)}:i)}e.defineOption=n,e.Init=ka,n("value","",(function(e,t){return e.setValue(t)}),!0),n("mode",null,(function(e,t){e.doc.modeOption=t,_i(e)}),!0),n("indentUnit",2,_i,!0),n("indentWithTabs",!1),n("smartIndent",!0),n("tabSize",4,(function(e){Ti(e),Hn(e),fr(e)}),!0),n("lineSeparator",null,(function(e,t){if(e.doc.lineSep=t,t){var n=[],r=e.doc.first;e.doc.iter((function(e){for(var i=0;;){var o=e.text.indexOf(t,i);if(-1==o)break;i=o+t.length,n.push(et(r,o))}r++}));for(var i=n.length-1;i>=0;i--)go(e.doc,t,n[i],et(n[i].line,n[i].ch+t.length))}})),n("specialChars",/[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200c\u200e\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/g,(function(e,t,n){e.state.specialChars=new RegExp(t.source+(t.test("\t")?"":"|\t"),"g"),n!=ka&&e.refresh()})),n("specialCharPlaceholder",Zt,(function(e){return e.refresh()}),!0),n("electricChars",!0),n("inputStyle",m?"contenteditable":"textarea",(function(){throw new Error("inputStyle can not (yet) be changed in a running editor")}),!0),n("spellcheck",!1,(function(e,t){return e.getInputField().spellcheck=t}),!0),n("autocorrect",!1,(function(e,t){return e.getInputField().autocorrect=t}),!0),n("autocapitalize",!1,(function(e,t){return e.getInputField().autocapitalize=t}),!0),n("rtlMoveVisually",!w),n("wholeLineUpdateBefore",!0),n("theme","default",(function(e){xa(e),gi(e)}),!0),n("keyMap","default",(function(e,t,n){var r=Yo(t),i=n!=ka&&Yo(n);i&&i.detach&&i.detach(e,r),r.attach&&r.attach(e,i||null)})),n("extraKeys",null),n("configureMouse",null),n("lineWrapping",!1,Ca,!0),n("gutters",[],(function(e,t){e.display.gutterSpecs=pi(t,e.options.lineNumbers),gi(e)}),!0),n("fixedGutter",!0,(function(e,t){e.display.gutters.style.left=t?ar(e.display)+"px":"0",e.refresh()}),!0),n("coverGutterNextToScrollbar",!1,(function(e){return Wr(e)}),!0),n("scrollbarStyle","native",(function(e){qr(e),Wr(e),e.display.scrollbars.setScrollTop(e.doc.scrollTop),e.display.scrollbars.setScrollLeft(e.doc.scrollLeft)}),!0),n("lineNumbers",!1,(function(e,t){e.display.gutterSpecs=pi(e.options.gutters,t),gi(e)}),!0),n("firstLineNumber",1,gi,!0),n("lineNumberFormatter",(function(e){return e}),gi,!0),n("showCursorWhenSelecting",!1,vr,!0),n("resetSelectionOnContextMenu",!0),n("lineWiseCopyCut",!0),n("pasteLinesPerSelection",!0),n("selectionsMayTouch",!1),n("readOnly",!1,(function(e,t){"nocursor"==t&&(Sr(e),e.display.input.blur()),e.display.input.readOnlyChanged(t)})),n("screenReaderLabel",null,(function(e,t){t=""===t?null:t,e.display.input.screenReaderLabelChanged(t)})),n("disableInput",!1,(function(e,t){t||e.display.input.reset()}),!0),n("dragDrop",!0,Sa),n("allowDropFileTypes",null),n("cursorBlinkRate",530),n("cursorScrollMargin",0),n("cursorHeight",1,vr,!0),n("singleCursorHeightPerLine",!0,vr,!0),n("workTime",100),n("workDelay",100),n("flattenSpans",!0,Ti,!0),n("addModeClass",!1,Ti,!0),n("pollInterval",100),n("undoDepth",200,(function(e,t){return e.doc.history.undoDepth=t})),n("historyEventDelay",1250),n("viewportMargin",10,(function(e){return e.refresh()}),!0),n("maxHighlightLength",1e4,Ti,!0),n("moveInputWithCursor",!0,(function(e,t){t||e.display.input.resetPosition()})),n("tabindex",null,(function(e,t){return e.display.input.getField().tabIndex=t||""})),n("autofocus",null),n("direction","ltr",(function(e,t){return e.doc.setDirection(t)}),!0),n("phrases",null)}(Pa),function(e){var t=e.optionHandlers,n=e.helpers={};e.prototype={constructor:e,focus:function(){window.focus(),this.display.input.focus()},setOption:function(e,n){var r=this.options,i=r[e];r[e]==n&&"mode"!=e||(r[e]=n,t.hasOwnProperty(e)&&ei(this,t[e])(this,n,i),he(this,"optionChange",this,e))},getOption:function(e){return this.options[e]},getDoc:function(){return this.doc},addKeyMap:function(e,t){this.state.keyMaps[t?"push":"unshift"](Yo(e))},removeKeyMap:function(e){for(var t=this.state.keyMaps,n=0;n<t.length;++n)if(t[n]==e||t[n].name==e)return t.splice(n,1),!0},addOverlay:ti((function(t,n){var r=t.token?t:e.getMode(this.options,t);if(r.startState)throw new Error("Overlays may not be stateful.");!function(e,t,n){for(var r=0,i=n(t);r<e.length&&n(e[r])<=i;)r++;e.splice(r,0,t)}(this.state.overlays,{mode:r,modeSpec:t,opaque:n&&n.opaque,priority:n&&n.priority||0},(function(e){return e.priority})),this.state.modeGen++,fr(this)})),removeOverlay:ti((function(e){for(var t=this.state.overlays,n=0;n<t.length;++n){var r=t[n].modeSpec;if(r==e||"string"==typeof e&&r.name==e)return t.splice(n,1),this.state.modeGen++,void fr(this)}})),indentLine:ti((function(e,t,n){"string"!=typeof t&&"number"!=typeof t&&(t=null==t?this.options.smartIndent?"smart":"prev":t?"add":"subtract"),Ze(this.doc,e)&&Ma(this,e,t,n)})),indentSelection:ti((function(e){for(var t=this.doc.sel.ranges,n=-1,r=0;r<t.length;r++){var i=t[r];if(i.empty())i.head.line>n&&(Ma(this,i.head.line,e,!0),n=i.head.line,r==this.doc.sel.primIndex&&Tr(this));else{var o=i.from(),a=i.to(),s=Math.max(n,o.line);n=Math.min(this.lastLine(),a.line-(a.ch?0:1))+1;for(var l=s;l<n;++l)Ma(this,l,e);var u=this.doc.sel.ranges;0==o.ch&&t.length==u.length&&u[r].from().ch>0&&Yi(this.doc,r,new Oi(o,u[r].to()),z)}}})),getTokenAt:function(e,t){return yt(this,e,t)},getLineTokens:function(e,t){return yt(this,et(e),t,!0)},getTokenTypeAt:function(e){e=st(this.doc,e);var t,n=dt(this,Ue(this.doc,e.line)),r=0,i=(n.length-1)/2,o=e.ch;if(0==o)t=n[2];else for(;;){var a=r+i>>1;if((a?n[2*a-1]:0)>=o)i=a;else{if(!(n[2*a+1]<o)){t=n[2*a+2];break}r=a+1}}var s=t?t.indexOf("overlay "):-1;return s<0?t:0==s?null:t.slice(0,s-1)},getModeAt:function(t){var n=this.doc.mode;return n.innerMode?e.innerMode(n,this.getTokenAt(t).state).mode:n},getHelper:function(e,t){return this.getHelpers(e,t)[0]},getHelpers:function(e,t){var r=[];if(!n.hasOwnProperty(t))return r;var i=n[t],o=this.getModeAt(e);if("string"==typeof o[t])i[o[t]]&&r.push(i[o[t]]);else if(o[t])for(var a=0;a<o[t].length;a++){var s=i[o[t][a]];s&&r.push(s)}else o.helperType&&i[o.helperType]?r.push(i[o.helperType]):i[o.name]&&r.push(i[o.name]);for(var l=0;l<i._global.length;l++){var u=i._global[l];u.pred(o,this)&&-1==H(r,u.val)&&r.push(u.val)}return r},getStateAfter:function(e,t){var n=this.doc;return pt(this,(e=at(n,null==e?n.first+n.size-1:e))+1,t).state},cursorCoords:function(e,t){var n=this.doc.sel.primary();return Gn(this,null==e?n.head:"object"==typeof e?st(this.doc,e):e?n.from():n.to(),t||"page")},charCoords:function(e,t){return Un(this,st(this.doc,e),t||"page")},coordsChar:function(e,t){return Yn(this,(e=Vn(this,e,t||"page")).left,e.top)},lineAtHeight:function(e,t){return e=Vn(this,{top:e,left:0},t||"page").top,Xe(this.doc,e+this.display.viewOffset)},heightAtLine:function(e,t,n){var r,i=!1;if("number"==typeof e){var o=this.doc.first+this.doc.size-1;e<this.doc.first?e=this.doc.first:e>o&&(e=o,i=!0),r=Ue(this.doc,e)}else r=e;return qn(this,r,{top:0,left:0},t||"page",n||i).top+(i?this.doc.height-Bt(r):0)},defaultTextHeight:function(){return rr(this.display)},defaultCharWidth:function(){return ir(this.display)},getViewport:function(){return{from:this.display.viewFrom,to:this.display.viewTo}},addWidget:function(e,t,n,r,i){var o,a,s,l=this.display,u=(e=Gn(this,st(this.doc,e))).bottom,c=e.left;if(t.style.position="absolute",t.setAttribute("cm-ignore-events","true"),this.display.input.setUneditable(t),l.sizer.appendChild(t),"over"==r)u=e.top;else if("above"==r||"near"==r){var f=Math.max(l.wrapper.clientHeight,this.doc.height),d=Math.max(l.sizer.clientWidth,l.lineSpace.clientWidth);("above"==r||e.bottom+t.offsetHeight>f)&&e.top>t.offsetHeight?u=e.top-t.offsetHeight:e.bottom+t.offsetHeight<=f&&(u=e.bottom),c+t.offsetWidth>d&&(c=d-t.offsetWidth)}t.style.top=u+"px",t.style.left=t.style.right="","right"==i?(c=l.sizer.clientWidth-t.offsetWidth,t.style.right="0px"):("left"==i?c=0:"middle"==i&&(c=(l.sizer.clientWidth-t.offsetWidth)/2),t.style.left=c+"px"),n&&(o=this,a={left:c,top:u,right:c+t.offsetWidth,bottom:u+t.offsetHeight},null!=(s=Mr(o,a)).scrollTop&&Dr(o,s.scrollTop),null!=s.scrollLeft&&Fr(o,s.scrollLeft))},triggerOnKeyDown:ti(ca),triggerOnKeyPress:ti(da),triggerOnKeyUp:fa,triggerOnMouseDown:ti(va),execCommand:function(e){if(ta.hasOwnProperty(e))return ta[e].call(null,this)},triggerElectric:ti((function(e){Na(this,e)})),findPosH:function(e,t,n,r){var i=1;t<0&&(i=-1,t=-t);for(var o=st(this.doc,e),a=0;a<t&&!(o=Ra(this.doc,o,i,n,r)).hitSide;++a);return o},moveH:ti((function(e,t){var n=this;this.extendSelectionsBy((function(r){return n.display.shift||n.doc.extend||r.empty()?Ra(n.doc,r.head,e,t,n.options.rtlMoveVisually):e<0?r.from():r.to()}),q)})),deleteH:ti((function(e,t){var n=this.doc.sel,r=this.doc;n.somethingSelected()?r.replaceSelection("",null,"+delete"):Xo(this,(function(n){var i=Ra(r,n.head,e,t,!1);return e<0?{from:i,to:n.head}:{from:n.head,to:i}}))})),findPosV:function(e,t,n,r){var i=1,o=r;t<0&&(i=-1,t=-t);for(var a=st(this.doc,e),s=0;s<t;++s){var l=Gn(this,a,"div");if(null==o?o=l.left:l.left=o,(a=$a(this,l,i,n)).hitSide)break}return a},moveV:ti((function(e,t){var n=this,r=this.doc,i=[],o=!this.display.shift&&!r.extend&&r.sel.somethingSelected();if(r.extendSelectionsBy((function(a){if(o)return e<0?a.from():a.to();var s=Gn(n,a.head,"div");null!=a.goalColumn&&(s.left=a.goalColumn),i.push(s.left);var l=$a(n,s,e,t);return"page"==t&&a==r.sel.primary()&&_r(n,Un(n,l,"div").top-s.top),l}),q),i.length)for(var a=0;a<r.sel.ranges.length;a++)r.sel.ranges[a].goalColumn=i[a]})),findWordAt:function(e){var t=Ue(this.doc,e.line).text,n=e.ch,r=e.ch;if(t){var i=this.getHelper(e,"wordChars");"before"!=e.sticky&&r!=t.length||!n?++r:--n;for(var o=t.charAt(n),a=ee(o,i)?function(e){return ee(e,i)}:/\s/.test(o)?function(e){return/\s/.test(e)}:function(e){return!/\s/.test(e)&&!ee(e)};n>0&&a(t.charAt(n-1));)--n;for(;r<t.length&&a(t.charAt(r));)++r}return new Oi(et(e.line,n),et(e.line,r))},toggleOverwrite:function(e){null!=e&&e==this.state.overwrite||((this.state.overwrite=!this.state.overwrite)?L(this.display.cursorDiv,"CodeMirror-overwrite"):C(this.display.cursorDiv,"CodeMirror-overwrite"),he(this,"overwriteToggle",this,this.state.overwrite))},hasFocus:function(){return this.display.input.getField()==E()},isReadOnly:function(){return!(!this.options.readOnly&&!this.doc.cantEdit)},scrollTo:ti((function(e,t){Er(this,e,t)})),getScrollInfo:function(){var e=this.display.scroller;return{left:e.scrollLeft,top:e.scrollTop,height:e.scrollHeight-Cn(this)-this.display.barHeight,width:e.scrollWidth-Cn(this)-this.display.barWidth,clientHeight:An(this),clientWidth:Pn(this)}},scrollIntoView:ti((function(e,t){null==e?(e={from:this.doc.sel.primary().head,to:null},null==t&&(t=this.options.cursorScrollMargin)):"number"==typeof e?e={from:et(e,0),to:null}:null==e.from&&(e={from:e,to:null}),e.to||(e.to=e.from),e.margin=t||0,null!=e.from.line?function(e,t){Lr(e),e.curOp.scrollToPos=t}(this,e):Nr(this,e.from,e.to,e.margin)})),setSize:ti((function(e,t){var n=this,r=function(e){return"number"==typeof e||/^\d+$/.test(String(e))?e+"px":e};null!=e&&(this.display.wrapper.style.width=r(e)),null!=t&&(this.display.wrapper.style.height=r(t)),this.options.lineWrapping&&$n(this);var i=this.display.viewFrom;this.doc.iter(i,this.display.viewTo,(function(e){if(e.widgets)for(var t=0;t<e.widgets.length;t++)if(e.widgets[t].noHScroll){dr(n,i,"widget");break}++i})),this.curOp.forceUpdate=!0,he(this,"refresh",this)})),operation:function(e){return Qr(this,e)},startOperation:function(){return Ur(this)},endOperation:function(){return Gr(this)},refresh:ti((function(){var e=this.display.cachedTextHeight;fr(this),this.curOp.forceUpdate=!0,Hn(this),Er(this,this.doc.scrollLeft,this.doc.scrollTop),ui(this.display),(null==e||Math.abs(e-rr(this.display))>.5||this.options.lineWrapping)&&lr(this),he(this,"refresh",this)})),swapDoc:ti((function(e){var t=this.doc;return t.cm=null,this.state.selectingText&&this.state.selectingText(),Di(this,e),Hn(this),this.display.input.reset(),Er(this,e.scrollLeft,e.scrollTop),this.curOp.forceScroll=!0,ln(this,"swapDoc",this,t),t})),phrase:function(e){var t=this.options.phrases;return t&&Object.prototype.hasOwnProperty.call(t,e)?t[e]:e},getInputField:function(){return this.display.input.getField()},getWrapperElement:function(){return this.display.wrapper},getScrollerElement:function(){return this.display.scroller},getGutterElement:function(){return this.display.gutters}},ye(e),e.registerHelper=function(t,r,i){n.hasOwnProperty(t)||(n[t]=e[t]={_global:[]}),n[t][r]=i},e.registerGlobalHelper=function(t,r,i,o){e.registerHelper(t,r,o),n[t]._global.push({pred:i,val:o})}}(Pa);var Ua="iter insert remove copy getEditor constructor".split(" ");for(var Ga in To.prototype)To.prototype.hasOwnProperty(Ga)&&H(Ua,Ga)<0&&(Pa.prototype[Ga]=function(e){return function(){return e.apply(this.doc,arguments)}}(To.prototype[Ga]));return ye(To),Pa.inputStyles={textarea:Va,contenteditable:Ha},Pa.defineMode=function(e){Pa.defaults.mode||"null"==e||(Pa.defaults.mode=e),Fe.apply(this,arguments)},Pa.defineMIME=function(e,t){Ie[e]=t},Pa.defineMode("null",(function(){return{token:function(e){return e.skipToEnd()}}})),Pa.defineMIME("text/plain","null"),Pa.defineExtension=function(e,t){Pa.prototype[e]=t},Pa.defineDocExtension=function(e,t){To.prototype[e]=t},Pa.fromTextArea=function(e,t){if((t=t?F(t):{}).value=e.value,!t.tabindex&&e.tabIndex&&(t.tabindex=e.tabIndex),!t.placeholder&&e.placeholder&&(t.placeholder=e.placeholder),null==t.autofocus){var n=E();t.autofocus=n==e||null!=e.getAttribute("autofocus")&&n==document.body}function r(){e.value=s.getValue()}var i;if(e.form&&(fe(e.form,"submit",r),!t.leaveSubmitMethodAlone)){var o=e.form;i=o.submit;try{var a=o.submit=function(){r(),o.submit=i,o.submit(),o.submit=a}}catch(e){}}t.finishInit=function(n){n.save=r,n.getTextArea=function(){return e},n.toTextArea=function(){n.toTextArea=isNaN,r(),e.parentNode.removeChild(n.getWrapperElement()),e.style.display="",e.form&&(pe(e.form,"submit",r),t.leaveSubmitMethodAlone||"function"!=typeof e.form.submit||(e.form.submit=i))}},e.style.display="none";var s=Pa((function(t){return e.parentNode.insertBefore(t,e.nextSibling)}),t);return s},function(e){e.off=pe,e.on=fe,e.wheelEventPixels=wi,e.Doc=To,e.splitLines=Te,e.countColumn=R,e.findColumn=V,e.isWordChar=Q,e.Pass=W,e.signal=he,e.Line=Ut,e.changeEnd=Ci,e.scrollbarModel=Br,e.Pos=et,e.cmpPos=tt,e.modes=De,e.mimeModes=Ie,e.resolveMode=Re,e.getMode=$e,e.modeExtensions=He,e.extendMode=We,e.copyState=ze,e.startState=qe,e.innerMode=Be,e.commands=ta,e.keyMap=Bo,e.keyName=Jo,e.isModifierKey=Go,e.lookupKey=Uo,e.normalizeKeyMap=Vo,e.StringStream=Ve,e.SharedTextMarker=Po,e.TextMarker=So,e.LineWidget=ko,e.e_preventDefault=be,e.e_stopPropagation=we,e.e_stop=ke,e.addClass=L,e.contains=T,e.rmClass=C,e.keyNames=$o}(Pa),Pa.version="5.58.1",Pa})),i=function(e){"use strict";e.defineMode("javascript",(function(t,n){var r,i,o=t.indentUnit,a=n.statementIndent,s=n.jsonld,l=n.json||s,u=n.typescript,c=n.wordCharacters||/[\w$\xa1-\uffff]/,f=function(){function e(e){return{type:e,style:"keyword"}}var t=e("keyword a"),n=e("keyword b"),r=e("keyword c"),i=e("keyword d"),o=e("operator"),a={type:"atom",style:"atom"};return{if:e("if"),while:t,with:t,else:n,do:n,try:n,finally:n,return:i,break:i,continue:i,new:e("new"),delete:r,void:r,throw:r,debugger:e("debugger"),var:e("var"),const:e("var"),let:e("var"),function:e("function"),catch:e("catch"),for:e("for"),switch:e("switch"),case:e("case"),default:e("default"),in:o,typeof:o,instanceof:o,true:a,false:a,null:a,undefined:a,NaN:a,Infinity:a,this:e("this"),class:e("class"),super:e("atom"),yield:r,export:e("export"),import:e("import"),extends:r,await:r}}(),d=/[+\-*&%=<>!?|~^@]/,p=/^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;function h(e,t,n){return r=e,i=n,t}function g(e,t){var n,r=e.next();if('"'==r||"'"==r)return t.tokenize=(n=r,function(e,t){var r,i=!1;if(s&&"@"==e.peek()&&e.match(p))return t.tokenize=g,h("jsonld-keyword","meta");for(;null!=(r=e.next())&&(r!=n||i);)i=!i&&"\\"==r;return i||(t.tokenize=g),h("string","string")}),t.tokenize(e,t);if("."==r&&e.match(/^\d[\d_]*(?:[eE][+\-]?[\d_]+)?/))return h("number","number");if("."==r&&e.match(".."))return h("spread","meta");if(/[\[\]{}\(\),;\:\.]/.test(r))return h(r);if("="==r&&e.eat(">"))return h("=>","operator");if("0"==r&&e.match(/^(?:x[\dA-Fa-f_]+|o[0-7_]+|b[01_]+)n?/))return h("number","number");if(/\d/.test(r))return e.match(/^[\d_]*(?:n|(?:\.[\d_]*)?(?:[eE][+\-]?[\d_]+)?)?/),h("number","number");if("/"==r)return e.eat("*")?(t.tokenize=v,v(e,t)):e.eat("/")?(e.skipToEnd(),h("comment","comment")):Ke(e,t,1)?(function(e){for(var t,n=!1,r=!1;null!=(t=e.next());){if(!n){if("/"==t&&!r)return;"["==t?r=!0:r&&"]"==t&&(r=!1)}n=!n&&"\\"==t}}(e),e.match(/^\b(([gimyus])(?![gimyus]*\2))+\b/),h("regexp","string-2")):(e.eat("="),h("operator","operator",e.current()));if("`"==r)return t.tokenize=m,m(e,t);if("#"==r&&"!"==e.peek())return e.skipToEnd(),h("meta","meta");if("#"==r&&e.eatWhile(c))return h("variable","property");if("<"==r&&e.match("!--")||"-"==r&&e.match("->")&&!/\S/.test(e.string.slice(0,e.start)))return e.skipToEnd(),h("comment","comment");if(d.test(r))return">"==r&&t.lexical&&">"==t.lexical.type||(e.eat("=")?"!"!=r&&"="!=r||e.eat("="):/[<>*+\-|&?]/.test(r)&&(e.eat(r),">"==r&&e.eat(r))),"?"==r&&e.eat(".")?h("."):h("operator","operator",e.current());if(c.test(r)){e.eatWhile(c);var i=e.current();if("."!=t.lastType){if(f.propertyIsEnumerable(i)){var o=f[i];return h(o.type,o.style,i)}if("async"==i&&e.match(/^(\s|\/\*.*?\*\/)*[\[\(\w]/,!1))return h("async","keyword",i)}return h("variable","variable",i)}}function v(e,t){for(var n,r=!1;n=e.next();){if("/"==n&&r){t.tokenize=g;break}r="*"==n}return h("comment","comment")}function m(e,t){for(var n,r=!1;null!=(n=e.next());){if(!r&&("`"==n||"$"==n&&e.eat("{"))){t.tokenize=g;break}r=!r&&"\\"==n}return h("quasi","string-2",e.current())}function y(e,t){t.fatArrowAt&&(t.fatArrowAt=null);var n=e.string.indexOf("=>",e.start);if(!(n<0)){if(u){var r=/:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(e.string.slice(e.start,n));r&&(n=r.index)}for(var i=0,o=!1,a=n-1;a>=0;--a){var s=e.string.charAt(a),l="([{}])".indexOf(s);if(l>=0&&l<3){if(!i){++a;break}if(0==--i){"("==s&&(o=!0);break}}else if(l>=3&&l<6)++i;else if(c.test(s))o=!0;else if(/["'\/`]/.test(s))for(;;--a){if(0==a)return;if(e.string.charAt(a-1)==s&&"\\"!=e.string.charAt(a-2)){a--;break}}else if(o&&!i){++a;break}}o&&!i&&(t.fatArrowAt=a)}}var b={atom:!0,number:!0,variable:!0,string:!0,regexp:!0,this:!0,"jsonld-keyword":!0};function w(e,t,n,r,i,o){this.indented=e,this.column=t,this.type=n,this.prev=i,this.info=o,null!=r&&(this.align=r)}function x(e,t){for(var n=e.localVars;n;n=n.next)if(n.name==t)return!0;for(var r=e.context;r;r=r.prev)for(n=r.vars;n;n=n.next)if(n.name==t)return!0}var k={state:null,column:null,marked:null,cc:null};function O(){for(var e=arguments.length-1;e>=0;e--)k.cc.push(arguments[e])}function j(){return O.apply(null,arguments),!0}function S(e,t){for(var n=t;n;n=n.next)if(n.name==e)return!0;return!1}function C(e){var t=k.state;if(k.marked="def",t.context)if("var"==t.lexical.info&&t.context&&t.context.block){var r=P(e,t.context);if(null!=r)return void(t.context=r)}else if(!S(e,t.localVars))return void(t.localVars=new _(e,t.localVars));n.globalVars&&!S(e,t.globalVars)&&(t.globalVars=new _(e,t.globalVars))}function P(e,t){if(t){if(t.block){var n=P(e,t.prev);return n?n==t.prev?t:new M(n,t.vars,!0):null}return S(e,t.vars)?t:new M(t.prev,new _(e,t.vars),!1)}return null}function A(e){return"public"==e||"private"==e||"protected"==e||"abstract"==e||"readonly"==e}function M(e,t,n){this.prev=e,this.vars=t,this.block=n}function _(e,t){this.name=e,this.next=t}var T=new _("this",new _("arguments",null));function E(){k.state.context=new M(k.state.context,k.state.localVars,!1),k.state.localVars=T}function L(){k.state.context=new M(k.state.context,k.state.localVars,!0),k.state.localVars=null}function N(){k.state.localVars=k.state.context.vars,k.state.context=k.state.context.prev}function D(e,t){var n=function(){var n=k.state,r=n.indented;if("stat"==n.lexical.type)r=n.lexical.indented;else for(var i=n.lexical;i&&")"==i.type&&i.align;i=i.prev)r=i.indented;n.lexical=new w(r,k.stream.column(),e,null,n.lexical,t)};return n.lex=!0,n}function I(){var e=k.state;e.lexical.prev&&(")"==e.lexical.type&&(e.indented=e.lexical.indented),e.lexical=e.lexical.prev)}function F(e){return function t(n){return n==e?j():";"==e||"}"==n||")"==n||"]"==n?O():j(t)}}function R(e,t){return"var"==e?j(D("vardef",t),be,F(";"),I):"keyword a"==e?j(D("form"),z,R,I):"keyword b"==e?j(D("form"),R,I):"keyword d"==e?k.stream.match(/^\s*$/,!1)?j():j(D("stat"),q,F(";"),I):"debugger"==e?j(F(";")):"{"==e?j(D("}"),L,ae,I,N):";"==e?j():"if"==e?("else"==k.state.lexical.info&&k.state.cc[k.state.cc.length-1]==I&&k.state.cc.pop()(),j(D("form"),z,R,I,Se)):"function"==e?j(Me):"for"==e?j(D("form"),Ce,R,I):"class"==e||u&&"interface"==t?(k.marked="keyword",j(D("form","class"==e?e:t),Ne,I)):"variable"==e?u&&"declare"==t?(k.marked="keyword",j(R)):u&&("module"==t||"enum"==t||"type"==t)&&k.stream.match(/^\s*\w/,!1)?(k.marked="keyword","enum"==t?j(Ue):"type"==t?j(Te,F("operator"),fe,F(";")):j(D("form"),we,F("{"),D("}"),ae,I,I)):u&&"namespace"==t?(k.marked="keyword",j(D("form"),H,R,I)):u&&"abstract"==t?(k.marked="keyword",j(R)):j(D("stat"),Q):"switch"==e?j(D("form"),z,F("{"),D("}","switch"),L,ae,I,I,N):"case"==e?j(H,F(":")):"default"==e?j(F(":")):"catch"==e?j(D("form"),E,$,R,I,N):"export"==e?j(D("stat"),Re,I):"import"==e?j(D("stat"),He,I):"async"==e?j(R):"@"==t?j(H,R):O(D("stat"),H,F(";"),I)}function $(e){if("("==e)return j(Ee,F(")"))}function H(e,t){return B(e,t,!1)}function W(e,t){return B(e,t,!0)}function z(e){return"("!=e?O():j(D(")"),q,F(")"),I)}function B(e,t,n){if(k.state.fatArrowAt==k.stream.start){var r=n?Y:J;if("("==e)return j(E,D(")"),ie(Ee,")"),I,F("=>"),r,N);if("variable"==e)return O(E,we,F("=>"),r,N)}var i=n?U:V;return b.hasOwnProperty(e)?j(i):"function"==e?j(Me,i):"class"==e||u&&"interface"==t?(k.marked="keyword",j(D("form"),Le,I)):"keyword c"==e||"async"==e?j(n?W:H):"("==e?j(D(")"),q,F(")"),I,i):"operator"==e||"spread"==e?j(n?W:H):"["==e?j(D("]"),Ve,I,i):"{"==e?oe(te,"}",null,i):"quasi"==e?O(G,i):"new"==e?j(function(e){return function(t){return"."==t?j(e?Z:X):"variable"==t&&u?j(ve,e?U:V):O(e?W:H)}}(n)):"import"==e?j(H):j()}function q(e){return e.match(/[;\}\)\],]/)?O():O(H)}function V(e,t){return","==e?j(q):U(e,t,!1)}function U(e,t,n){var r=0==n?V:U,i=0==n?H:W;return"=>"==e?j(E,n?Y:J,N):"operator"==e?/\+\+|--/.test(t)||u&&"!"==t?j(r):u&&"<"==t&&k.stream.match(/^([^<>]|<[^<>]*>)*>\s*\(/,!1)?j(D(">"),ie(fe,">"),I,r):"?"==t?j(H,F(":"),i):j(i):"quasi"==e?O(G,r):";"!=e?"("==e?oe(W,")","call",r):"."==e?j(ee,r):"["==e?j(D("]"),q,F("]"),I,r):u&&"as"==t?(k.marked="keyword",j(fe,r)):"regexp"==e?(k.state.lastType=k.marked="operator",k.stream.backUp(k.stream.pos-k.stream.start-1),j(i)):void 0:void 0}function G(e,t){return"quasi"!=e?O():"${"!=t.slice(t.length-2)?j(G):j(H,K)}function K(e){if("}"==e)return k.marked="string-2",k.state.tokenize=m,j(G)}function J(e){return y(k.stream,k.state),O("{"==e?R:H)}function Y(e){return y(k.stream,k.state),O("{"==e?R:W)}function X(e,t){if("target"==t)return k.marked="keyword",j(V)}function Z(e,t){if("target"==t)return k.marked="keyword",j(U)}function Q(e){return":"==e?j(I,R):O(V,F(";"),I)}function ee(e){if("variable"==e)return k.marked="property",j()}function te(e,t){return"async"==e?(k.marked="property",j(te)):"variable"==e||"keyword"==k.style?(k.marked="property","get"==t||"set"==t?j(ne):(u&&k.state.fatArrowAt==k.stream.start&&(n=k.stream.match(/^\s*:\s*/,!1))&&(k.state.fatArrowAt=k.stream.pos+n[0].length),j(re))):"number"==e||"string"==e?(k.marked=s?"property":k.style+" property",j(re)):"jsonld-keyword"==e?j(re):u&&A(t)?(k.marked="keyword",j(te)):"["==e?j(H,se,F("]"),re):"spread"==e?j(W,re):"*"==t?(k.marked="keyword",j(te)):":"==e?O(re):void 0;var n}function ne(e){return"variable"!=e?O(re):(k.marked="property",j(Me))}function re(e){return":"==e?j(W):"("==e?O(Me):void 0}function ie(e,t,n){function r(i,o){if(n?n.indexOf(i)>-1:","==i){var a=k.state.lexical;return"call"==a.info&&(a.pos=(a.pos||0)+1),j((function(n,r){return n==t||r==t?O():O(e)}),r)}return i==t||o==t?j():n&&n.indexOf(";")>-1?O(e):j(F(t))}return function(n,i){return n==t||i==t?j():O(e,r)}}function oe(e,t,n){for(var r=3;r<arguments.length;r++)k.cc.push(arguments[r]);return j(D(t,n),ie(e,t),I)}function ae(e){return"}"==e?j():O(R,ae)}function se(e,t){if(u){if(":"==e)return j(fe);if("?"==t)return j(se)}}function le(e,t){if(u&&(":"==e||"in"==t))return j(fe)}function ue(e){if(u&&":"==e)return k.stream.match(/^\s*\w+\s+is\b/,!1)?j(H,ce,fe):j(fe)}function ce(e,t){if("is"==t)return k.marked="keyword",j()}function fe(e,t){return"keyof"==t||"typeof"==t||"infer"==t?(k.marked="keyword",j("typeof"==t?W:fe)):"variable"==e||"void"==t?(k.marked="type",j(ge)):"|"==t||"&"==t?j(fe):"string"==e||"number"==e||"atom"==e?j(ge):"["==e?j(D("]"),ie(fe,"]",","),I,ge):"{"==e?j(D("}"),ie(pe,"}",",;"),I,ge):"("==e?j(ie(he,")"),de,ge):"<"==e?j(ie(fe,">"),fe):void 0}function de(e){if("=>"==e)return j(fe)}function pe(e,t){return"variable"==e||"keyword"==k.style?(k.marked="property",j(pe)):"?"==t||"number"==e||"string"==e?j(pe):":"==e?j(fe):"["==e?j(F("variable"),le,F("]"),pe):"("==e?O(_e,pe):void 0}function he(e,t){return"variable"==e&&k.stream.match(/^\s*[?:]/,!1)||"?"==t?j(he):":"==e?j(fe):"spread"==e?j(he):O(fe)}function ge(e,t){return"<"==t?j(D(">"),ie(fe,">"),I,ge):"|"==t||"."==e||"&"==t?j(fe):"["==e?j(fe,F("]"),ge):"extends"==t||"implements"==t?(k.marked="keyword",j(fe)):"?"==t?j(fe,F(":"),fe):void 0}function ve(e,t){if("<"==t)return j(D(">"),ie(fe,">"),I,ge)}function me(){return O(fe,ye)}function ye(e,t){if("="==t)return j(fe)}function be(e,t){return"enum"==t?(k.marked="keyword",j(Ue)):O(we,se,Oe,je)}function we(e,t){return u&&A(t)?(k.marked="keyword",j(we)):"variable"==e?(C(t),j()):"spread"==e?j(we):"["==e?oe(ke,"]"):"{"==e?oe(xe,"}"):void 0}function xe(e,t){return"variable"!=e||k.stream.match(/^\s*:/,!1)?("variable"==e&&(k.marked="property"),"spread"==e?j(we):"}"==e?O():"["==e?j(H,F("]"),F(":"),xe):j(F(":"),we,Oe)):(C(t),j(Oe))}function ke(){return O(we,Oe)}function Oe(e,t){if("="==t)return j(W)}function je(e){if(","==e)return j(be)}function Se(e,t){if("keyword b"==e&&"else"==t)return j(D("form","else"),R,I)}function Ce(e,t){return"await"==t?j(Ce):"("==e?j(D(")"),Pe,I):void 0}function Pe(e){return"var"==e?j(be,Ae):"variable"==e?j(Ae):O(Ae)}function Ae(e,t){return")"==e?j():";"==e?j(Ae):"in"==t||"of"==t?(k.marked="keyword",j(H,Ae)):O(H,Ae)}function Me(e,t){return"*"==t?(k.marked="keyword",j(Me)):"variable"==e?(C(t),j(Me)):"("==e?j(E,D(")"),ie(Ee,")"),I,ue,R,N):u&&"<"==t?j(D(">"),ie(me,">"),I,Me):void 0}function _e(e,t){return"*"==t?(k.marked="keyword",j(_e)):"variable"==e?(C(t),j(_e)):"("==e?j(E,D(")"),ie(Ee,")"),I,ue,N):u&&"<"==t?j(D(">"),ie(me,">"),I,_e):void 0}function Te(e,t){return"keyword"==e||"variable"==e?(k.marked="type",j(Te)):"<"==t?j(D(">"),ie(me,">"),I):void 0}function Ee(e,t){return"@"==t&&j(H,Ee),"spread"==e?j(Ee):u&&A(t)?(k.marked="keyword",j(Ee)):u&&"this"==e?j(se,Oe):O(we,se,Oe)}function Le(e,t){return"variable"==e?Ne(e,t):De(e,t)}function Ne(e,t){if("variable"==e)return C(t),j(De)}function De(e,t){return"<"==t?j(D(">"),ie(me,">"),I,De):"extends"==t||"implements"==t||u&&","==e?("implements"==t&&(k.marked="keyword"),j(u?fe:H,De)):"{"==e?j(D("}"),Ie,I):void 0}function Ie(e,t){return"async"==e||"variable"==e&&("static"==t||"get"==t||"set"==t||u&&A(t))&&k.stream.match(/^\s+[\w$\xa1-\uffff]/,!1)?(k.marked="keyword",j(Ie)):"variable"==e||"keyword"==k.style?(k.marked="property",j(Fe,Ie)):"number"==e||"string"==e?j(Fe,Ie):"["==e?j(H,se,F("]"),Fe,Ie):"*"==t?(k.marked="keyword",j(Ie)):u&&"("==e?O(_e,Ie):";"==e||","==e?j(Ie):"}"==e?j():"@"==t?j(H,Ie):void 0}function Fe(e,t){if("?"==t)return j(Fe);if(":"==e)return j(fe,Oe);if("="==t)return j(W);var n=k.state.lexical.prev;return O(n&&"interface"==n.info?_e:Me)}function Re(e,t){return"*"==t?(k.marked="keyword",j(qe,F(";"))):"default"==t?(k.marked="keyword",j(H,F(";"))):"{"==e?j(ie($e,"}"),qe,F(";")):O(R)}function $e(e,t){return"as"==t?(k.marked="keyword",j(F("variable"))):"variable"==e?O(W,$e):void 0}function He(e){return"string"==e?j():"("==e?O(H):O(We,ze,qe)}function We(e,t){return"{"==e?oe(We,"}"):("variable"==e&&C(t),"*"==t&&(k.marked="keyword"),j(Be))}function ze(e){if(","==e)return j(We,ze)}function Be(e,t){if("as"==t)return k.marked="keyword",j(We)}function qe(e,t){if("from"==t)return k.marked="keyword",j(H)}function Ve(e){return"]"==e?j():O(ie(W,"]"))}function Ue(){return O(D("form"),we,F("{"),D("}"),ie(Ge,"}"),I,I)}function Ge(){return O(we,Oe)}function Ke(e,t,n){return t.tokenize==g&&/^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[\[{}\(,;:]|=>)$/.test(t.lastType)||"quasi"==t.lastType&&/\{\s*$/.test(e.string.slice(0,e.pos-(n||0)))}return N.lex=!0,I.lex=!0,{startState:function(e){var t={tokenize:g,lastType:"sof",cc:[],lexical:new w((e||0)-o,0,"block",!1),localVars:n.localVars,context:n.localVars&&new M(null,null,!1),indented:e||0};return n.globalVars&&"object"==typeof n.globalVars&&(t.globalVars=n.globalVars),t},token:function(e,t){if(e.sol()&&(t.lexical.hasOwnProperty("align")||(t.lexical.align=!1),t.indented=e.indentation(),y(e,t)),t.tokenize!=v&&e.eatSpace())return null;var n=t.tokenize(e,t);return"comment"==r?n:(t.lastType="operator"!=r||"++"!=i&&"--"!=i?r:"incdec",function(e,t,n,r,i){var o=e.cc;for(k.state=e,k.stream=i,k.marked=null,k.cc=o,k.style=t,e.lexical.hasOwnProperty("align")||(e.lexical.align=!0);;)if((o.length?o.pop():l?H:R)(n,r)){for(;o.length&&o[o.length-1].lex;)o.pop()();return k.marked?k.marked:"variable"==n&&x(e,r)?"variable-2":t}}(t,n,r,i,e))},indent:function(t,r){if(t.tokenize==v)return e.Pass;if(t.tokenize!=g)return 0;var i,s=r&&r.charAt(0),l=t.lexical;if(!/^\s*else\b/.test(r))for(var u=t.cc.length-1;u>=0;--u){var c=t.cc[u];if(c==I)l=l.prev;else if(c!=Se)break}for(;("stat"==l.type||"form"==l.type)&&("}"==s||(i=t.cc[t.cc.length-1])&&(i==V||i==U)&&!/^[,\.=+\-*:?[\(]/.test(r));)l=l.prev;a&&")"==l.type&&"stat"==l.prev.type&&(l=l.prev);var f=l.type,p=s==f;return"vardef"==f?l.indented+("operator"==t.lastType||","==t.lastType?l.info.length+1:0):"form"==f&&"{"==s?l.indented:"form"==f?l.indented+o:"stat"==f?l.indented+(function(e,t){return"operator"==e.lastType||","==e.lastType||d.test(t.charAt(0))||/[,.]/.test(t.charAt(0))}(t,r)?a||o:0):"switch"!=l.info||p||0==n.doubleIndentSwitch?l.align?l.column+(p?0:1):l.indented+(p?0:o):l.indented+(/^(?:case|default)\b/.test(r)?o:2*o)},electricInput:/^\s*(?:case .*?:|default:|\{|\})$/,blockCommentStart:l?null:"/*",blockCommentEnd:l?null:"*/",blockCommentContinue:l?null:" * ",lineComment:l?null:"//",fold:"brace",closeBrackets:"()[]{}''\"\"``",helperType:l?"json":"javascript",jsonldMode:s,jsonMode:l,expressionAllowed:Ke,skipExpression:function(e){var t=e.cc[e.cc.length-1];t!=H&&t!=W||e.cc.pop()}}})),e.registerHelper("wordChars","javascript",/[\w$]/),e.defineMIME("text/javascript","javascript"),e.defineMIME("text/ecmascript","javascript"),e.defineMIME("application/javascript","javascript"),e.defineMIME("application/x-javascript","javascript"),e.defineMIME("application/ecmascript","javascript"),e.defineMIME("application/json",{name:"javascript",json:!0}),e.defineMIME("application/x-json",{name:"javascript",json:!0}),e.defineMIME("application/ld+json",{name:"javascript",jsonld:!0}),e.defineMIME("text/typescript",{name:"javascript",typescript:!0}),e.defineMIME("application/typescript",{name:"javascript",typescript:!0})},"object"==typeof n&&"object"==typeof t?i(e("../../lib/codemirror")):"function"==typeof o&&o.amd?o(["../../lib/codemirror"],i):i(r),Object.defineProperty(n,"__esModule",{value:!0}),n.default=r},{"../../lib/codemirror":void 0}],3:[function(e,t,n){var r,i,o,a={Prism:e("/gen/prismjs.js")},s=(t=void 0,function(){const e=arguments[arguments.length-1];r=e(),s=void 0});s.amd=!0,i=this,o=function(){"use strict";const{tokenize:t,languages:n}=a.Prism||e("prismjs"),r={html:{open:({data:e})=>'<span class="token '+e+'">',close:()=>"</span>"}};function i(e,t,n){e.forEach((function(e){"string"!=typeof e&&function(e,t,n){t(n,n+e.length,e.type),Array.isArray(e.content)&&i(e.content,t,n)}(e,t,n),n+=e.length}))}return function(e){return{printer:r,ranges:function(r,o){return i(t(r,n[e]),o,0)}}}},"object"==typeof n&&void 0!==t?t.exports=o():"function"==typeof s&&s.amd?s(o):(i=i||self).hitextPrismjs=o(),Object.defineProperty(n,"__esModule",{value:!0}),n.default=r},{"/gen/prismjs.js":6,prismjs:7}],4:[function(e,t,n){var r,i,o,a={},s=(t=void 0,function(){const e=arguments[arguments.length-1];r=e(),s=void 0});s.amd=!0,i=this,o=function(){"use strict";var e={newLineLength:function(e,t){switch(e.charCodeAt(t)){default:return 0;case 10:return 1;case 13:return t+1<e.length&&10===e.charCodeAt(t+1)?2:1}}};const{newLineLength:t}=e,{newLineLength:n}=e,{newLineLength:r}=e;var i={lines:(e,n)=>{let r=1,i=0;for(let o=0;o<e.length;o++){const a=t(e,o);0!==a&&(n(i,o+a,r++),i=o+a,o+=a-1)}n(i,e.length,r++)},lineContents:(e,t)=>{let r=1,i=0;for(let o=0;o<e.length;o++){const a=n(e,o);0!==a&&(t(i,o,r++),i=o+a,o+=a-1)}t(i,e.length,r++)},matches:function(e){if(e instanceof RegExp){const t=-1!==e.flags.indexOf("g")?e.flags:e.flags+"g",n=new RegExp(e,t);return function(e,t){let r;for(;r=n.exec(e);)t(r.index,r.index+r[0].length)}}return e=String(e),function(t,n){let r=-1;for(;r=t.indexOf(e,r+1),-1!==r;)n(r,r+e.length)}},newlines:(e,t)=>{let n=1;for(let i=0;i<e.length;i++){const o=r(e,i);0!==o&&(t(i,i+o,n++),i+=o-1)}}},o="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:void 0!==a?a:"undefined"!=typeof self?self:{};function s(e){return l.call(null,e)}function l(e){const t=this===o?{}:this||{},n={};return Object.assign(n,t,e,{fork:l.bind(n),ranges:Object.assign({},t.ranges,e&&e.ranges)}),"function"!=typeof n.createHook&&(n.createHook=e=>e()),n}var u={createPrinter:s,forkPrinter:l,forkPrinterSet:function e(t){const n=Object.assign({},this);for(let e in t){const r=t[e];if(r&&"object"==typeof r)if(hasOwnProperty.call(n,e)){const r=n[e];n[e]=r&&"function"==typeof r.fork?r.fork(t[e]):r}else n[e]=s(t[e])}return n.fork=e.bind(n),n}},c=u.createPrinter();const{createPrinter:f}=u;var d=f({print:e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")});const{forkPrinterSet:p}=u;var h=p.call({},{noop:c,html:d,tty:c}),g=function(e,t){const n=[];return t.forEach((({generate:t,marker:r})=>t(e,((e,t,i)=>n.push({type:r,start:e,end:t,data:i}))))),n};const v=()=>"",m=function(){};function y(e,t){return"function"==typeof e?e:t||m}function b(e,t,n){const r=(r,i)=>{const o=t[i||n]||h.noop;return function(e,t,n){const r=y(n.print,(e=>e)),i=Object.assign(Object.defineProperties(Object.create(null),{offset:{get:()=>c},line:{get:()=>f},column:{get:()=>d},start:{get:()=>a.start},end:{get:()=>a.end},data:{get:()=>a.data}}),y(n.createContext)()),o=[];let a={start:0,end:e.length},s=n.ranges||{},l=[],u=1/0,c=0,f=1,d=1,p="";p+=y(n.open,v)(i),s=[].concat(Object.getOwnPropertyNames(s),Object.getOwnPropertySymbols(s)).reduce(((e,t)=>{let i=s[t];return"function"==typeof i&&(s[t]=i=n.createHook(i)),i&&(l.push(t),e[t]={open:y(i.open,v),close:y(i.close,v),print:y(i.print,r)}),e}),{}),t=t.slice().sort(((e,t)=>e.start-t.start||t.end-e.end||l.indexOf(e.type)-l.indexOf(t.type)));const h=e=>s[(a=o[e]).type].close(i)||"",g=t=>{if(c!==t){const n=e.substring(c,t),a=o.length?s[o[o.length-1].type].print:r;for(let n=c;n<t;n++){const t=e.charCodeAt(n);10===t||13===t&&(n>=e.length||10!==e.charCodeAt(n+1))?(f++,d=1):d++}p+=a(n,i),c=t}},m=e=>{for(;u<=e;){g(u);for(let e=o.length-1;e>=0&&o[e].end===u;e--)p+=h(e),o.pop();u=1/0;for(let e=0;e<o.length;e++)o[e].end<u&&(u=o[e].end)}};for(let e=0;e<t.length;e++){const n=t[e];let r=0;if(!1!==s.hasOwnProperty(n.type)&&!(n.start>n.end)&&Number.isFinite(n.start)&&Number.isFinite(n.end)){for(m(n.start),g(n.start),r=0;r<o.length;r++)if(o[r].end<n.end){for(let e=o.length-1;e>=r;e--)p+=h(e);break}for(o.splice(r,0,n);r<o.length;r++)p+=s[(a=o[r]).type].open(i)||"";n.end<u&&(u=n.end)}}m(e.length),g(e.length);for(let e=o.length-1;e>=0;e--)p+=h(e);return p+=y(n.close,v)(i)||"",p}(r,g(r,e),o)};return Object.assign(r,{print:r,generateRanges:t=>g(t,e),use(i,o){const a=Symbol(i.name),s=i.ranges||i,l=Array.isArray(s)?(e,t)=>s.forEach((e=>t(...e))):s;return"function"!=typeof l?r:(o||(o=i.printer),o?b(e.concat(function(e,t){return{marker:e,generate:t}}(a,l)),t.fork(function(e,t){const n={};for(let r in t)n[r]={ranges:{[e]:t[r]}};return n}(a,o)),n):r)},printer:n=>b(e,t,n)})}function w(e,t,n){let r=b([],n||h,t);return Array.isArray(e)&&(r=e.reduce(((e,t)=>Array.isArray(t)?e.use(...t):e.use(t)),r)),r}return Object.assign(w,{gen:i,printer:Object.assign(((...e)=>w().printer(...e)),h),use:(...e)=>w().use(...e)})},"object"==typeof n&&void 0!==t?t.exports=o():"function"==typeof s&&s.amd?s(o):(i=i||self).hitext=o(),Object.defineProperty(n,"__esModule",{value:!0}),n.default=r},{}],5:[function(e,t,n){t=void 0;var r,i=function(){const e=arguments[arguments.length-1];r=e(),i=void 0};i.amd=!0,function(e,r){"object"==typeof n&&void 0!==t?t.exports=r():"function"==typeof i&&i.amd?i(r):(e=e||self).jora=r()}(this,(function(){"use strict";var e="1.0.0-beta.3",t={version:e},n=Object.freeze({__proto__:null,version:e,default:t}),r=function(){var e=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},t=[2,5],n=[1,13],r=[1,38],i=[1,18],o=[1,7],a=[1,8],s=[1,10],l=[1,11],u=[1,12],c=[1,19],f=[1,20],d=[1,21],p=[1,22],h=[1,23],g=[1,24],v=[1,25],m=[1,28],y=[1,31],b=[1,32],w=[1,33],x=[1,34],k=[1,35],O=[1,36],j=[1,37],S=[5,18,55,58],C=[1,42],P=[1,50],A=[1,49],M=[1,43],_=[1,44],T=[1,45],E=[1,46],L=[1,47],N=[1,48],D=[1,51],I=[1,52],F=[1,53],R=[1,54],$=[1,55],H=[1,56],W=[1,57],z=[1,58],B=[1,59],q=[1,60],V=[1,61],U=[5,9,14,15,17,18,19,22,23,24,44,45,46,47,48,49,50,53,55,57,58,59,60,61,62,63,66],G=[5,10,11,18,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,55,58,65,67],K=[1,62],J=[1,63],Y=[1,64],X=[1,65],Z=[1,66],Q=[1,67],ee=[1,68],te=[1,71],ne=[5,18,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,53,55,58,59,60,61,62,63,65,67,74],re=[2,46],ie=[2,48],oe=[1,81],ae=[5,10,11,18,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,53,55,58,59,60,61,62,63,65,67,74],se=[5,10,11,18,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,53,55,57,58,59,60,61,62,63,65,67,74],le=[1,88],ue=[1,89],ce=[1,90],fe=[1,105],de=[1,107],pe=[1,108],he=[1,109],ge=[1,110],ve=[1,111],me=[5,10,11,18,21,55,58,65,67],ye=[5,10,11,18,21,29,30,41,55,58,65,67],be=[5,10,11,18,21,23,24,25,26,27,28,29,30,34,35,36,37,38,39,40,41,55,58,65,67],we=[55,65],xe=[2,99],ke=[11,55],Oe=[65,67],je=[5,10,11,18,21,25,26,27,28,29,30,41,55,58,65,67],Se=[5,10,11,18,21,25,26,27,28,29,30,34,35,40,41,55,58,65,67],Ce=[5,10,11,18,21,25,26,27,28,29,30,34,35,36,37,38,39,40,41,55,58,65,67],Pe=[1,183],Ae=[58,65],Me={trace:function(){},yy:{},symbols_:{error:2,root:3,block:4,EOF:5,definitions:6,e:7,def:8,$:9,";":10,":":11,$ident:12,ident:13,IDENT:14,$IDENT:15,query:16,FUNCTION_START:17,FUNCTION_END:18,FUNCTION:19,sortingCompareList:20,"|":21,NOT:22,"-":23,"+":24,IN:25,HAS:26,NOTIN:27,HASNO:28,AND:29,OR:30,"*":31,"/":32,"%":33,"=":34,"!=":35,"<":36,"<=":37,">":38,">=":39,"~=":40,"?":41,queryRoot:42,relativePath:43,"@":44,"#":45,$$:46,STRING:47,NUMBER:48,REGEXP:49,LITERAL:50,object:51,array:52,"[":53,sliceNotation:54,"]":55,"method()":56,"(":57,")":58,".":59,".(":60,".[":61,"..":62,"..(":63,arguments:64,",":65,"{":66,"}":67,properties:68,property:69,"...":70,arrayElements:71,arrayElement:72,sortingCompare:73,ORDER:74,sliceNotationComponent:75,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",9:"$",10:";",11:":",14:"IDENT",15:"$IDENT",17:"FUNCTION_START",18:"FUNCTION_END",19:"FUNCTION",21:"|",22:"NOT",23:"-",24:"+",25:"IN",26:"HAS",27:"NOTIN",28:"HASNO",29:"AND",30:"OR",31:"*",32:"/",33:"%",34:"=",35:"!=",36:"<",37:"<=",38:">",39:">=",40:"~=",41:"?",44:"@",45:"#",46:"$$",47:"STRING",48:"NUMBER",49:"REGEXP",50:"LITERAL",53:"[",55:"]",57:"(",58:")",59:".",60:".(",61:".[",62:"..",63:"..(",65:",",66:"{",67:"}",70:"...",74:"ORDER"},productions_:[0,[3,2],[4,2],[4,1],[4,1],[4,0],[6,1],[6,2],[8,2],[8,4],[8,2],[8,4],[13,1],[12,1],[7,1],[7,3],[7,2],[7,1],[7,3],[7,4],[7,2],[7,2],[7,2],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,3],[7,5],[16,1],[16,1],[42,1],[42,1],[42,1],[42,1],[42,1],[42,1],[42,1],[42,1],[42,1],[42,1],[42,1],[42,3],[42,1],[42,1],[42,3],[42,4],[42,2],[42,2],[42,3],[42,3],[42,2],[42,2],[42,3],[43,3],[43,4],[43,4],[43,3],[43,3],[43,4],[43,4],[43,3],[43,3],[43,4],[56,3],[56,4],[56,3],[56,4],[64,1],[64,3],[51,2],[51,3],[68,1],[68,3],[69,1],[69,1],[69,1],[69,3],[69,3],[69,3],[69,3],[69,5],[69,1],[69,2],[71,1],[71,3],[72,1],[72,1],[72,2],[52,2],[52,3],[20,1],[20,3],[73,2],[54,1],[54,2],[54,2],[54,3],[75,1],[75,2]],performAction:function(e,t,n,r,i,o,a){var s=o.length-1;switch(i){case 1:return r.buildResult(o[s-1]);case 2:this.$={type:"Block",definitions:o[s-1],body:o[s],range:this._$.range};break;case 3:this.$={type:"Block",definitions:o[s],body:null,range:this._$.range};break;case 4:this.$={type:"Block",definitions:[],body:o[s],range:this._$.range};break;case 5:this.$={type:"Block",definitions:[],body:null,range:this._$.range};break;case 6:case 81:case 85:case 97:case 104:this.$=[o[s]];break;case 7:o[s-1].push(o[s]);break;case 8:this.$={type:"Definition",declarator:{type:"Declarator",name:null,range:a[s-1].range},value:null,range:this._$.range};break;case 9:this.$={type:"Definition",declarator:{type:"Declarator",name:null,range:a[s-3].range},value:o[s-1],range:this._$.range};break;case 10:this.$={type:"Definition",declarator:{type:"Declarator",name:o[s-1].name,range:a[s-1].range},value:null,range:this._$.range};break;case 11:this.$={type:"Definition",declarator:{type:"Declarator",name:o[s-3].name,range:a[s-3].range},value:o[s-1],range:this._$.range};break;case 12:case 13:this.$={type:"Identifier",name:o[s],range:this._$.range};break;case 14:case 42:case 43:case 53:case 54:case 99:break;case 15:this.$={type:"Function",arguments:[],body:o[s-1],legacy:!0,range:this._$.range};break;case 16:this.$={type:"Function",arguments:[],body:o[s],legacy:!1,range:this._$.range};break;case 17:this.$={type:"SortingFunction",compares:o[s],range:this._$.range};break;case 18:this.$={type:"Pipeline",left:o[s-2],right:o[s],range:this._$.range};break;case 19:this.$={type:"Pipeline",left:o[s-3],right:{type:"Block",definitions:o[s-1],body:o[s]},range:this._$.range};break;case 20:case 21:case 22:this.$={type:"Unary",operator:o[s-1],argument:o[s],range:this._$.range};break;case 23:case 24:case 25:case 26:case 27:case 28:case 29:case 30:case 31:case 32:case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 40:this.$={type:"Binary",operator:o[s-1],left:o[s-2],right:o[s],range:this._$.range};break;case 41:this.$={type:"Conditional",test:o[s-4],consequent:o[s-2],alternate:o[s],range:this._$.range};break;case 44:this.$={type:"Data",range:this._$.range};break;case 45:this.$={type:"Context",range:this._$.range};break;case 46:this.$={type:"Current",range:this._$.range};break;case 47:this.$={type:"Arg1",range:this._$.range};break;case 48:this.$={type:"Reference",name:o[s],range:this._$.range};break;case 49:case 50:case 51:case 52:this.$={type:"Literal",value:o[s],range:this._$.range};break;case 55:this.$={type:"SliceNotation",value:null,arguments:o[s-1],range:this._$.range};break;case 56:case 60:this.$={type:"GetProperty",value:null,property:o[s],range:this._$.range};break;case 57:case 61:this.$={type:"MethodCall",value:null,method:o[s],range:this._$.range};break;case 58:this.$={type:"Parentheses",body:o[s-1],range:this._$.range};break;case 59:this.$={type:"Parentheses",body:{type:"Block",definitions:o[s-2],body:o[s-1]},range:this._$.range};break;case 62:this.$={type:"Map",value:null,query:o[s-1],range:this._$.range};break;case 63:this.$={type:"Filter",value:null,query:o[s-1],range:this._$.range};break;case 64:this.$={type:"MapRecursive",value:null,query:{type:"GetProperty",value:null,property:o[s]},range:this._$.range};break;case 65:this.$={type:"MapRecursive",value:null,query:{type:"MethodCall",value:null,method:o[s]},range:this._$.range};break;case 66:this.$={type:"MapRecursive",value:null,query:o[s-1],range:this._$.range};break;case 67:this.$={type:"Pick",value:o[s-2],getter:null,range:this._$.range};break;case 68:this.$={type:"Pick",value:o[s-3],getter:o[s-1],range:this._$.range};break;case 69:this.$={type:"SliceNotation",value:o[s-3],arguments:o[s-1],range:this._$.range};break;case 70:this.$={type:"GetProperty",value:o[s-2],property:o[s],range:this._$.range};break;case 71:this.$={type:"MethodCall",value:o[s-2],method:o[s],range:this._$.range};break;case 72:this.$={type:"Map",value:o[s-3],query:o[s-1],range:this._$.range};break;case 73:this.$={type:"Filter",value:o[s-3],query:o[s-1],range:this._$.range};break;case 74:this.$={type:"MapRecursive",value:o[s-2],query:{type:"GetProperty",value:null,property:o[s]},range:this._$.range};break;case 75:this.$={type:"MapRecursive",value:o[s-2],query:{type:"MethodCall",value:null,method:o[s]},range:this._$.range};break;case 76:this.$={type:"MapRecursive",value:o[s-3],query:o[s-1],range:this._$.range};break;case 77:this.$={type:"Method",reference:o[s-2],arguments:[],range:this._$.range};break;case 78:this.$={type:"Method",reference:o[s-3],arguments:o[s-1],range:this._$.range};break;case 79:this.$={type:"Method",reference:{type:"Reference",name:o[s-2]},arguments:[],range:this._$.range};break;case 80:this.$={type:"Method",reference:{type:"Reference",name:o[s-3]},arguments:o[s-1],range:this._$.range};break;case 82:case 86:case 98:case 105:o[s-2].push(o[s]);break;case 83:this.$={type:"Object",properties:[],range:this._$.range};break;case 84:this.$={type:"Object",properties:o[s-1],range:this._$.range};break;case 87:this.$={type:"ObjectEntry",key:o[s],value:null,range:this._$.range};break;case 88:this.$={type:"ObjectEntry",key:{type:"Current"},value:null,range:this._$.range};break;case 89:this.$={type:"ObjectEntry",key:{type:"Reference",name:o[s]},value:null,range:this._$.range};break;case 90:this.$={type:"ObjectEntry",key:o[s-2],value:o[s],range:this._$.range};break;case 91:case 92:case 93:this.$={type:"ObjectEntry",key:{type:"Literal",value:o[s-2]},value:o[s],range:this._$.range};break;case 94:this.$={type:"ObjectEntry",key:o[s-3],value:o[s],range:this._$.range};break;case 95:this.$={type:"Spread",query:null,array:!1,range:this._$.range};break;case 96:this.$={type:"Spread",query:o[s],array:!1,range:this._$.range};break;case 100:this.$={type:"Spread",query:null,array:!0,range:this._$.range};break;case 101:this.$={type:"Spread",query:o[s],array:!0,range:this._$.range};break;case 102:this.$={type:"Array",elements:[],range:this._$.range};break;case 103:this.$={type:"Array",elements:o[s-1],range:this._$.range};break;case 106:this.$={type:"Compare",query:o[s-1],order:o[s],range:this._$.range};break;case 107:this.$=[null,o[s]];break;case 108:this.$=[null,o[s-1],o[s]];break;case 109:this.$=[o[s-1],o[s]];break;case 110:this.$=[o[s-2],o[s-1],o[s]];break;case 111:this.$=null;break;case 112:this.$=o[s]}},table:[{3:1,4:2,5:t,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{1:[3]},{5:[1,39]},e(S,[2,3],{16:6,20:9,12:14,42:15,43:16,73:17,51:26,52:27,13:29,56:30,7:40,8:41,9:n,14:r,15:i,17:o,19:a,22:s,23:l,24:u,44:c,45:f,46:d,47:p,48:h,49:g,50:v,53:m,57:y,59:b,60:w,61:x,62:k,63:O,66:j}),e(S,[2,4],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(U,[2,6]),e(G,[2,14],{53:K,59:J,60:Y,61:X,62:Z,63:Q,74:ee}),{4:69,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,18:t,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:70,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e([5,10,11,18,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,55,58,67],[2,17],{65:[1,73]}),{7:74,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:75,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:76,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(ne,re,{10:[1,77],11:[1,78]}),e(ne,ie,{10:[1,79],11:[1,80],57:oe}),e(ae,[2,42]),e(ae,[2,43]),e(G,[2,104]),e(se,[2,13]),e(ae,[2,44]),e(ae,[2,45]),e(ae,[2,47]),e(ae,[2,49]),e(ae,[2,50]),e(ae,[2,51]),e(ae,[2,52]),e(ae,[2,53]),e(ae,[2,54]),{7:86,9:te,11:le,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,54:82,55:[1,83],56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,70:ue,71:84,72:87,73:17,75:85},e(ae,[2,56],{57:ce}),e(ae,[2,57]),{6:92,7:91,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{12:95,13:93,14:r,15:i,56:94},{4:96,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,58:t,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{4:97,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,55:t,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{12:95,13:98,14:r,15:i,56:99},{4:100,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,58:t,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{9:fe,12:106,13:104,14:r,15:i,47:de,48:pe,50:he,53:ge,67:[1,101],68:102,69:103,70:ve},e(se,[2,12]),{1:[2,1]},e(S,[2,2],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(U,[2,7]),{6:113,7:112,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:114,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:115,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:116,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:117,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:118,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:119,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:120,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:121,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:122,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:123,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:124,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:125,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:126,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:127,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:128,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:129,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:130,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:131,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:132,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:134,9:te,11:le,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,54:135,55:[1,133],56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17,75:85},{12:95,13:136,14:r,15:i,56:137},{4:138,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,58:t,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{4:139,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,55:t,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{12:95,13:140,14:r,15:i,56:141},{4:142,6:3,7:4,8:5,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,58:t,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(G,[2,106]),{18:[1,143]},e(me,[2,16],{23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(ae,re),e(ae,ie,{57:oe}),{9:te,12:72,13:29,14:r,15:i,16:145,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:144},e(ye,[2,20],{23:P,24:A,25:M,26:_,27:T,28:E,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q}),e(be,[2,21],{31:D,32:I,33:F}),e(be,[2,22],{31:D,32:I,33:F}),e(U,[2,8]),{7:146,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(U,[2,10]),{7:147,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:150,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,58:[1,148],59:b,60:w,61:x,62:k,63:O,64:149,66:j,73:17},{55:[1,151]},e(ae,[2,102]),{55:[1,152],65:[1,153]},{11:le,55:[2,107],75:154},e(we,xe,{75:155,11:le,21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(we,[2,97]),e(ke,[2,111],{16:6,20:9,42:15,43:16,73:17,51:26,52:27,13:29,56:30,12:72,7:156,9:te,14:r,15:i,17:o,19:a,22:s,23:l,24:u,44:c,45:f,46:d,47:p,48:h,49:g,50:v,53:m,57:y,59:b,60:w,61:x,62:k,63:O,66:j}),e(we,[2,100],{16:6,20:9,42:15,43:16,73:17,51:26,52:27,13:29,56:30,12:72,7:157,9:te,14:r,15:i,17:o,19:a,22:s,23:l,24:u,44:c,45:f,46:d,47:p,48:h,49:g,50:v,53:m,57:y,59:b,60:w,61:x,62:k,63:O,66:j}),{7:150,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,58:[1,158],59:b,60:w,61:x,62:k,63:O,64:159,66:j,73:17},{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V,58:[1,160]},{7:161,8:41,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(ae,[2,60],{57:ce}),e(ae,[2,61]),{57:oe},{58:[1,162]},{55:[1,163]},e(ae,[2,64],{57:ce}),e(ae,[2,65]),{58:[1,164]},e(ae,[2,83]),{65:[1,166],67:[1,165]},e(Oe,[2,85]),e(Oe,[2,87],{11:[1,167]}),e(Oe,[2,88]),e(Oe,[2,89]),{11:[1,168]},{11:[1,169]},{11:[1,170]},{7:171,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(Oe,[2,95],{42:15,43:16,51:26,52:27,13:29,56:30,12:72,16:172,9:te,14:r,15:i,44:c,45:f,46:d,47:p,48:h,49:g,50:v,53:m,57:y,59:b,60:w,61:x,62:k,63:O,66:j}),e(me,[2,18],{23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),{7:173,8:41,9:n,12:14,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(je,[2,23],{23:P,24:A,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q}),e(je,[2,24],{23:P,24:A,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q}),e(je,[2,25],{23:P,24:A,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q}),e(je,[2,26],{23:P,24:A,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q}),e(ye,[2,27],{23:P,24:A,25:M,26:_,27:T,28:E,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q}),e([5,10,11,18,21,30,41,55,58,65,67],[2,28],{23:P,24:A,25:M,26:_,27:T,28:E,29:L,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q}),e(be,[2,29],{31:D,32:I,33:F}),e(be,[2,30],{31:D,32:I,33:F}),e(G,[2,31]),e(G,[2,32]),e(G,[2,33]),e(Se,[2,34],{23:P,24:A,31:D,32:I,33:F,36:H,37:W,38:z,39:B}),e(Se,[2,35],{23:P,24:A,31:D,32:I,33:F,36:H,37:W,38:z,39:B}),e(Ce,[2,36],{23:P,24:A,31:D,32:I,33:F}),e(Ce,[2,37],{23:P,24:A,31:D,32:I,33:F}),e(Ce,[2,38],{23:P,24:A,31:D,32:I,33:F}),e(Ce,[2,39],{23:P,24:A,31:D,32:I,33:F}),e(Se,[2,40],{23:P,24:A,31:D,32:I,33:F,36:H,37:W,38:z,39:B}),{11:[1,174],21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V},e(ae,[2,67]),{11:le,21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V,55:[1,175],75:155},{55:[1,176]},e(ae,[2,70],{57:ce}),e(ae,[2,71]),{58:[1,177]},{55:[1,178]},e(ae,[2,74],{57:ce}),e(ae,[2,75]),{58:[1,179]},e(G,[2,15]),e(G,[2,105]),{53:K,59:J,60:Y,61:X,62:Z,63:Q,74:ee},{10:[1,180],21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V},{10:[1,181],21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V},e(ae,[2,79]),{58:[1,182],65:Pe},e(Ae,[2,81],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(ae,[2,55]),e(ae,[2,103]),{7:185,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,70:ue,72:184,73:17},{55:[2,108]},{11:le,55:[2,109],75:186},e(ke,[2,112],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(we,[2,101],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(ae,[2,77]),{58:[1,187],65:Pe},e(ae,[2,58]),{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V,58:[1,188]},e(ae,[2,62]),e(ae,[2,63]),e(ae,[2,66]),e(ae,[2,84]),{9:fe,12:106,13:104,14:r,15:i,47:de,48:pe,50:he,53:ge,69:189,70:ve},{7:190,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:191,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:192,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{7:193,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V,55:[1,194]},e(Oe,[2,96],{53:K,59:J,60:Y,61:X,62:Z,63:Q}),e(me,[2,19],{23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),{7:195,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(ae,[2,68]),e(ae,[2,69]),e(ae,[2,72]),e(ae,[2,73]),e(ae,[2,76]),e(U,[2,9]),e(U,[2,11]),e(ae,[2,80]),{7:196,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(we,[2,98]),e(we,xe,{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),{55:[2,110]},e(ae,[2,78]),e(ae,[2,59]),e(Oe,[2,86]),e(Oe,[2,90],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(Oe,[2,91],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(Oe,[2,92],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(Oe,[2,93],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),{11:[1,197]},e(me,[2,41],{23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),e(Ae,[2,82],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V}),{7:198,9:te,12:72,13:29,14:r,15:i,16:6,17:o,19:a,20:9,22:s,23:l,24:u,42:15,43:16,44:c,45:f,46:d,47:p,48:h,49:g,50:v,51:26,52:27,53:m,56:30,57:y,59:b,60:w,61:x,62:k,63:O,66:j,73:17},e(Oe,[2,94],{21:C,23:P,24:A,25:M,26:_,27:T,28:E,29:L,30:N,31:D,32:I,33:F,34:R,35:$,36:H,37:W,38:z,39:B,40:q,41:V})],defaultActions:{39:[2,1],154:[2,108],186:[2,110]},parseError:function(e,t){if(!t.recoverable){var n=new Error(e);throw n.hash=t,n}this.trace(e)},parse:function(e){var t=this,n=[0],r=[null],i=[],o=this.table,a="",s=0,l=0,u=2,c=1,f=i.slice.call(arguments,1),d=Object.create(this.lexer),p={yy:{}};for(var h in this.yy)Object.prototype.hasOwnProperty.call(this.yy,h)&&(p.yy[h]=this.yy[h]);d.setInput(e,p.yy),p.yy.lexer=d,p.yy.parser=this,void 0===d.yylloc&&(d.yylloc={});var g=d.yylloc;i.push(g);var v=d.options&&d.options.ranges;"function"==typeof p.yy.parseError?this.parseError=p.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var m,y,b,w,x,k,O,j,S=function(){var e;return"number"!=typeof(e=d.lex()||c)&&(e=t.symbols_[e]||e),e},C={};;){if(y=n[n.length-1],this.defaultActions[y]?b=this.defaultActions[y]:(null==m&&(m=S()),b=o[y]&&o[y][m]),void 0===b||!b.length||!b[0]){var P="";for(x in j=[],o[y])this.terminals_[x]&&x>u&&j.push("'"+this.terminals_[x]+"'");P=d.showPosition?"Parse error on line "+(s+1)+":\n"+d.showPosition()+"\nExpecting "+j.join(", ")+", got '"+(this.terminals_[m]||m)+"'":"Parse error on line "+(s+1)+": Unexpected "+(m==c?"end of input":"'"+(this.terminals_[m]||m)+"'"),this.parseError(P,{text:d.match,token:this.terminals_[m]||m,line:d.yylineno,loc:g,expected:j})}if(b[0]instanceof Array&&b.length>1)throw new Error("Parse Error: multiple actions possible at state: "+y+", token: "+m);switch(b[0]){case 1:n.push(m),r.push(d.yytext),i.push(d.yylloc),n.push(b[1]),m=null,l=d.yyleng,a=d.yytext,s=d.yylineno,g=d.yylloc;break;case 2:if(k=this.productions_[b[1]][1],C.$=r[r.length-k],C._$={first_line:i[i.length-(k||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(k||1)].first_column,last_column:i[i.length-1].last_column},v&&(C._$.range=[i[i.length-(k||1)].range[0],i[i.length-1].range[1]]),void 0!==(w=this.performAction.apply(C,[a,l,s,p.yy,b[1],r,i].concat(f))))return w;k&&(n=n.slice(0,-1*k*2),r=r.slice(0,-1*k),i=i.slice(0,-1*k)),n.push(this.productions_[b[1]][0]),r.push(C.$),i.push(C._$),O=o[n[n.length-2]][n[n.length-1]],n.push(O);break;case 3:return!0}}return!0}},_e={EOF:1,parseError:function(e,t){if(!this.yy.parser)throw new Error(e);this.yy.parser.parseError(e,t)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];return this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e,e.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=new Array(e.length+1).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),(r=e[0].match(/(?:\r\n?|\n).*/g))&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var o in i)this[o]=i[o];return!1}return!1},next:function(){if(this.done)return this.EOF;var e,t,n,r;this._input||(this.done=!0),this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),o=0;o<i.length;o++)if((n=this._input.match(this.rules[i[o]]))&&(!t||n[0].length>t[0].length)){if(t=n,r=o,this.options.backtrack_lexer){if(!1!==(e=this.test_match(n,i[o])))return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}return t?!1!==(e=this.test_match(t,i[r]))&&e:""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var e=this.next();return e||this.lex()},begin:function(e){this.conditionStack.push(e)},popState:function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(e){return(e=this.conditionStack.length-1-Math.abs(e||0))>=0?this.conditionStack[e]:"INITIAL"},pushState:function(e){this.begin(e)},stateStackSize:function(){return this.conditionStack.length},options:{ranges:!0},performAction:function(e,t,n,r){switch(n){case 0:e.commentRanges.push(t.yylloc.range);break;case 1:break;case 2:return this.popState(),"/";case 3:return this.popState(),"<";case 4:this.done=!1,this.popState();break;case 5:return this.fnOpenedStack.push(this.fnOpened),this.fnOpened=0,"(";case 6:return this.fnOpened=this.fnOpenedStack.pop()||0,this._input&&this.begin("preventPrimitive"),")";case 7:return this.fnOpenedStack.push(this.fnOpened),this.fnOpened=0,"[";case 8:return this.fnOpened=this.fnOpenedStack.pop()||0,this._input&&this.begin("preventPrimitive"),"]";case 9:return this.fnOpenedStack.push(this.fnOpened),this.fnOpened=0,"{";case 10:return this.fnOpened=this.fnOpenedStack.pop()||0,this._input&&this.begin("preventPrimitive"),"}";case 11:return t.yytext=this.toLiteral(t.yytext),"LITERAL";case 12:return"AND";case 13:return"OR";case 14:return"HASNO";case 15:return"HAS";case 16:return"IN";case 17:return"NOTIN";case 18:return"NOT";case 19:return"ORDER";case 20:return this._input&&this.begin("preventPrimitive"),t.yytext=Number(t.yytext),"NUMBER";case 21:case 22:return this._input&&this.begin("preventPrimitive"),t.yytext=this.toStringLiteral(t.yytext),"STRING";case 23:return this._input&&this.begin("preventPrimitive"),t.yytext=this.toRegExp(t.yytext),"REGEXP";case 24:return this._input&&this.begin("preventPrimitive"),"IDENT";case 25:return this._input&&this.begin("preventPrimitive"),t.yytext=t.yytext.slice(1),"$IDENT";case 26:return this._input&&this.begin("preventPrimitive"),"@";case 27:return this._input&&this.begin("preventPrimitive"),"#";case 28:return this._input&&this.begin("preventPrimitive"),"$$";case 29:return this._input&&this.begin("preventPrimitive"),"$";case 30:return"FUNCTION";case 31:return this.fnOpened++,"FUNCTION_START";case 32:return"=";case 33:return"!=";case 34:return"~=";case 35:return">=";case 36:return"<=";case 37:return"<";case 38:return this.fnOpened?(this.fnOpened--,"FUNCTION_END"):">";case 39:return this.fnOpenedStack.push(this.fnOpened),this.fnOpened=0,"..(";case 40:return this.fnOpenedStack.push(this.fnOpened),this.fnOpened=0,".(";case 41:return this.fnOpenedStack.push(this.fnOpened),this.fnOpened=0,".[";case 42:return"...";case 43:return this._input&&this.begin("preventPrimitive"),"..";case 44:return this._input&&this.begin("preventPrimitive"),".";case 45:return"?";case 46:return",";case 47:return":";case 48:return";";case 49:return"-";case 50:return"+";case 51:return"*";case 52:return"/";case 53:return"%";case 54:return"|";case 55:return"EOF"}},rules:[/^(?:(\/\/.*?(\r|\n|$)))/,/^(?:(\s+))/,/^(?:\/)/,/^(?:<(?!=))/,/^(?:)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\{)/,/^(?:\})/,/^(?:(true|false|null|undefined)(\b))/,/^(?:and(\b))/,/^(?:or(\b))/,/^(?:has(\s+)no(\b))/,/^(?:has(\b))/,/^(?:in(\b))/,/^(?:not(\s+)in(\b))/,/^(?:not?(\b))/,/^(?:(asc|desc)(NA?|AN?)?(\b))/,/^(?:(\d+\.|\.)?\d+([eE][-+]?\d+)?(\b))/,/^(?:"(?:\\.|[^"])*")/,/^(?:'(?:\\.|[^'])*')/,/^(?:(\/(?:\\.|[^/])+\/i?))/,/^(?:([a-zA-Z_][a-zA-Z_$0-9]*))/,/^(?:\$([a-zA-Z_][a-zA-Z_$0-9]*))/,/^(?:@)/,/^(?:#)/,/^(?:\${2})/,/^(?:\$)/,/^(?:=>)/,/^(?:<(?!=))/,/^(?:=)/,/^(?:!=)/,/^(?:~=)/,/^(?:>=)/,/^(?:<=)/,/^(?:<)/,/^(?:>)/,/^(?:\.\.\()/,/^(?:\.\()/,/^(?:\.\[)/,/^(?:\.\.\.)/,/^(?:\.\.)/,/^(?:\.)/,/^(?:\?)/,/^(?:,)/,/^(?::)/,/^(?:;)/,/^(?:\-)/,/^(?:\+)/,/^(?:\*)/,/^(?:\/)/,/^(?:\%)/,/^(?:\|)/,/^(?:$)/],conditions:{preventPrimitive:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55],inclusive:!0},INITIAL:{rules:[0,1,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55],inclusive:!0}}};function Te(){this.yy={}}return Me.lexer=_e,Te.prototype=Me,Me.Parser=Te,function e(t){function n(e,t){Object.entries(t).forEach((([t,n])=>e[t]=n(e[t])))}const r=new Map([["EOF",["<end of input>"]],["IDENT",["ident"]],["$IDENT",["$ident"]],["FUNCTION_START",["'<'"]],["FUNCTION_END",["'>'"]],["FUNCTION",["'=>'"]],["NOT",["'not'"]],["IN",["'in'"]],["HAS",["'has'"]],["NOTIN",["'not in'"]],["HASNO",["'has no'"]],["AND",["'and'"]],["OR",["'or'"]],["STRING",["string"]],["NUMBER",["number"]],["REGEXP",["regexp"]],["LITERAL",["'true'","'false'","'null'","'undefined'"]],["ORDER",["'asc'","'desc'","'ascN'","'descN'"]]]),i=e=>r.get(e)||`'${e}'`,o=function(e,t,n){if(!t.recoverable){const r=n.lexer.yylloc,o=[e.split(/\n/)[0],"",n.lexer.showPosition()],a=Array.isArray(t.expected)?[].concat(...t.expected.map((e=>i(e.slice(1,-1))))):null;a&&o.push("","Expecting "+a.join(", ")+" got "+i(t.token));const s=new SyntaxError(o.join("\n"));throw s.details={rawMessage:e,text:t.text,token:t.token,expected:a,loc:{range:r.range,start:{line:r.first_line,column:r.first_column,offset:r.range[0]},end:{line:r.last_line,column:r.last_column,offset:r.range[1]}}},s}this.trace(e)};Object.assign(t.lexer,{toLiteral:e=>"null"===e?null:"false"!==e&&("true"===e||void 0),toStringLiteral:e=>JSON.parse("'"===e[0]?e.replace(/\\?"/g,'\\"').replace(/\\([^"uU])/g,"$1").replace(/^\'|\'$/g,'"'):e),toRegExp:e=>new RegExp(e.substr(1,e.lastIndexOf("/")-1),e.substr(e.lastIndexOf("/")+1))}),n(t.lexer,{setInput:e=>function(t,n){const r=[];return n.commentRanges=r,n.buildResult=e=>({ast:e,commentRanges:r}),n.parseError=function(...e){return o.call(this,...e,n)},this.fnOpened=0,this.fnOpenedStack=[],this.prevToken=null,this.prevYylloc={first_line:1,last_line:1,first_column:0,last_column:0,range:[0,0]},e.call(this,t,n)}});const a=new t.Parser;a.lexer={...t.lexer},a.yy={...t.yy};const s=["AND","OR","IN","NOTIN","HAS","HASNO"],l=[...s,"NOT","ORDER"],u=["+","-","*","/","%","|","=","!=","~=",">=","<=","<",">"],c=[null,":",";",",",".","..","FUNCTION",...u,...s,"NOT"],f=new Set([",","?",":",";","EOF","]",")","}",...u,...s,"ORDER"]),d=new Map(c.map((e=>[e,f])));return d.set("{",new Set([","])),d.set("[",new Set([","])),d.set("(",new Set([","])),n(a.lexer,{lex:e=>function t(){this.lex=e;const n=this._input,r=this.lex(this);if(this.lex=t,d.has(this.prevToken)&&d.get(this.prevToken).has(r)){const e={first_line:this.prevYylloc.last_line,last_line:this.yylloc.first_line,first_column:this.prevYylloc.last_column,last_column:this.yylloc.first_column,range:[this.prevYylloc.range[1],this.yylloc.range[0]]};if(this.unput(this.yytext),this.pushState("preventPrimitive"),this.done=!1,this.yytext="_",this.yylloc=this.prevYylloc=e,n!==this._input&&l.includes(r)){const t=n.length-this._input.length-1;switch(n[t]){case" ":case"\t":e.last_column--,e.range[1]--;break;case"\n":{const r=n.lastIndexOf("\n",t-1);e.last_line--,e.last_column=-1===r?e.last_column-1:t-r,e.range[1]--;break}}}return this.prevToken="IDENT"}if(this.prevYylloc=this.yylloc,l.includes(r))switch(this._input[0]){case" ":case"\t":this.prevYylloc={...this.prevYylloc,last_column:this.prevYylloc.last_column+1,range:[this.prevYylloc.range[0],this.prevYylloc.range[1]+1]};break;case"\n":this.prevYylloc={...this.prevYylloc,last_line:this.prevYylloc.last_line+1,last_column:0,range:[this.prevYylloc.range[0],this.prevYylloc.range[1]+1]}}return this.prevToken=r}}),Object.assign((function(e,n){return n?a.parse(e):t.parse(e)}),{generateModule:()=>t.generateModule({moduleName:"module.exports"}).replace("new Parser","("+e+")(new Parser)")})}(new Te)}(),i={build:()=>({type:"Arg1"}),compile(e,t){t.put(t.scope.arg1?"arguments[1]":"undefined")},walk(){},stringify(e,t){t.put("$$")}},o={build:e=>({type:"Array",elements:e}),suggest(e,t){0===e.elements.length&&t.queryRoot(e.range[0]+1,e.range[1]-1)},compile(e,t){t.put("["),t.list(e.elements,","),t.put("]")},walk(e,t){t.list(e.elements)},stringify(e,t){t.put("["),t.list(e.elements,","),t.put("]")}};const a={in:"in","not in":"in",has:"-","has no":"-",and:"and",or:"or","+":"add","-":"sub","*":"mul","/":"div","%":"mod","=":"eq","!=":"ne","<":"lt","<=":"lte",">":"gt",">=":"gte","~=":"match"};function s(e,t,n){if("Array"===n.type){0===n.elements.length&&e.range([n.range[0]+1,n.range[1]-1],"value-subset",t,n);for(const{type:r,range:i,value:o}of n.elements)i&&("Literal"===r||"Identifier"===r||"GetProperty"===r&&null===o)&&e.range(i,"value-subset",t,n)}}var l={build:(e,t,n)=>({type:"Binary",operator:e,left:t,right:n}),suggest(e,t){switch(e.operator){case"in":t.range(e.left.range,"in-value",e.right,null),s(t,e.left,e.right);break;case"not in":s(t,e.left,e.right);break;case"has":t.range(e.right.range,"in-value",e.left,null),s(t,e.right,e.left);break;case"has no":s(t,e.right,e.left);break;case"=":case"!=":t.range(e.right.range,"value",e.left,null)}},compile(e,t){if(e.operator in a!=!1)switch("and"!==e.operator&&"not in"!==e.operator&&"has no"!==e.operator||t.put("!"),e.operator){case"or":case"and":{const n=t.allocateVar();t.put(`f.bool(${n}=`),t.node(e.left),t.put(`)?${n}:`),t.scope.captureCurrent.disabled=!0,t.node(e.right),t.scope.captureCurrent.disabled=!1;break}case"has":case"has no":t.put("f.in("),t.node(e.right),t.put(","),t.node(e.left),t.put(")");break;default:t.put("f."),t.put(a[e.operator]),t.put("("),t.node(e.left),t.put(","),t.node(e.right),t.put(")")}else t.error('Unknown operator "'+e.operator+'"',e)},walk(e,t){t.node(e.left),t.node(e.right)},stringify(e,t){t.node(e.left),/^[a-z]/i.test(e.operator)?(t.put(" "),t.put(e.operator),t.put(" ")):t.put(e.operator),t.node(e.right)}},u={build:(e,t)=>({type:"Block",definitions:e,body:t}),suggest(e,t){null===e.body&&t.queryRoot(e.range[1])},compile(e,t){e.definitions.length?t.createScope((()=>{t.put("(()=>{"),t.list(e.definitions),t.put("return "),t.nodeOrCurrent(e.body),t.put("})()")}),((e,t)=>e+t+";")):e.body&&"Object"===e.body.type?(t.put("("),t.nodeOrCurrent(e.body),t.put(")")):t.nodeOrCurrent(e.body)},walk(e,t){t.list(e.definitions),t.nodeOrNothing(e.body)},stringify(e,t){t.list(e.definitions),t.nodeOrNothing(e.body)}};const c={"":"cmp",N:"cmpNatural",A:"cmpAnalytical",NA:"cmpNaturalAnalytical",AN:"cmpNaturalAnalytical"};var f={build:(e,t)=>({type:"Compare",query:e,order:t}),compile(e,t){e.order.startsWith("desc")&&t.put("-"),t.createScope((()=>{const n=c[e.order.slice(3+e.order.startsWith("desc"))]||c[""];t.put("f."+n+"((_q=current=>("),t.node(e.query),t.put("))(a),_q(b))")}),((e,t)=>e+t+","))},walk(e,t){t.node(e.query)},stringify(e,t){t.node(e.query),t.put(" "),t.put(e.order)}},d={build:(e,t,n)=>({type:"Conditional",test:e,consequent:t,alternate:n}),compile(e,t){t.put("f.bool("),t.node(e.test),t.scope.captureCurrent.disabled=!0,t.put(")?"),t.node(e.consequent),t.put(":"),t.node(e.alternate),t.scope.captureCurrent.disabled=!1},walk(e,t){t.node(e.test),t.node(e.consequent),t.node(e.alternate)},stringify(e,t){t.node(e.test),t.put("?"),t.node(e.consequent),t.put(":"),t.node(e.alternate)}},p={build:()=>({type:"Context"}),compile(e,t){t.put("context")},walk(){},stringify(e,t){t.put("#")}},h={build:()=>({type:"Current"}),suggest(e,t){e.range&&t.range(e.range,"var")},compile(e,t){t.put("current")},walk(){},stringify(e,t){t.put("$")}},g={build:()=>({type:"Data"}),compile(e,t){t.put("data")},walk(){},stringify(e,t){t.put("@")}},v={build:e=>({type:"Declarator",name:e}),compile(e,t){e.name&&t.put("$"+e.name)},walk(){},stringify(e,t){t.put(e.name?"$"+e.name:"$")}},m={build:(e,t)=>({type:"GetProperty",value:e,property:t}),suggest(e,t){t.range(e.property.range,"path",e.value||void 0,!e.value),null===e.value&&t.range(e.property.range,"var"),e.range&&null===e.value&&e.property.range[0]!==e.range[0]&&t.queryRoot(e.range[0])},compile(e,t){t.put("f.map("),t.nodeOrCurrent(e.value),t.put(","),"Identifier"===e.property.type?t.put(JSON.stringify(e.property.name)):t.node(e.property),t.put(")")},walk(e,t){t.nodeOrNothing(e.value),t.node(e.property)},stringify(e,t){t.nodeOrNothing(e.value)&&t.put("."),t.node(e.property)}},y={build:e=>({type:"Identifier",name:e}),compile(e,t){t.put(e.name)},walk(){},stringify(e,t){t.put(e.name)}};const b=m.build,w=y.build,x=["data","context","ctx","array","idx","index"];var k={build:(e,t)=>({type:"Definition",declarator:e,value:t}),suggest(e,t){null===e.value&&t.range(e.declarator.range,"path")},compile(e,t){if(null===e.declarator.name)return t.node(e.declarator),t.nodeOrCurrent(e.value),void t.put(";");t.scope.own.includes(e.declarator.name)?t.error(`Identifier "$${e.declarator.name}" has already been declared`,e.declarator):x.includes(e.declarator.name)?t.error(`Identifier "$${e.declarator.name}" is reserved for future use`,e.declarator):(t.put("const "),t.node(e.declarator),t.put("="),t.node(e.value||b(null,w(e.declarator.name))),t.put(";"),t.scope.push(e.declarator.name),t.scope.own.push(e.declarator.name))},walk(e,t){t.node(e.declarator),t.nodeOrNothing(e.value)},stringify(e,t){t.node(e.declarator),null!==e.value&&(t.put(":"),t.node(e.value)),t.put(";")}},O={build:(e,t)=>({type:"Filter",value:e,query:t}),compile(e,t){t.put("f.filter("),t.nodeOrCurrent(e.value),t.createScope((()=>{t.put(",current=>"),t.node(e.query)}),((e,n)=>(t.put(")"),e+"("+n+","))),t.put(")")},walk(e,t){t.nodeOrNothing(e.value),t.node(e.query)},stringify(e,t){t.nodeOrNothing(e.value),t.put(".["),t.node(e.query),t.put("]")}},j={build:(e,t,n)=>({type:"Function",arguments:e,body:t,legacy:Boolean(n)}),compile(e,t){t.createScope((()=>{t.scope.arg1=!0,t.put("function(current){return "),t.node(e.body),t.put("}")}),((e,t)=>e+t+","))},walk(e,t){t.node(e.body)},stringify(e,t){e.legacy?(t.put("<"),t.node(e.body),t.put(">")):(t.put("=>"),t.node(e.body))}},S={build:e=>({type:"Literal",value:e}),compile(e,t){t.put("string"==typeof e.value?JSON.stringify(e.value):String(e.value))},walk(){},stringify(e,t){t.put("string"==typeof e.value?JSON.stringify(e.value):String(e.value))}},C={build:(e,t)=>({type:"Map",value:e,query:t}),compile(e,t){t.put("f.map("),t.nodeOrCurrent(e.value),t.createScope((()=>{t.put(",current=>"),t.node(e.query)}),((e,n)=>(t.put(")"),e+"("+n+","))),t.put(")")},walk(e,t){t.nodeOrNothing(e.value),t.node(e.query)},stringify(e,t){t.nodeOrNothing(e.value),t.put(".("),t.node(e.query),t.put(")")}},P={build:(e,t)=>({type:"MapRecursive",value:e,query:t}),compile(e,t){t.put("f.mapRecursive("),t.nodeOrCurrent(e.value),t.createScope((()=>{t.put(",current=>"),t.node(e.query)}),((e,n)=>(t.put(")"),e+"("+n+","))),t.put(")")},walk(e,t){t.nodeOrNothing(e.value),t.node(e.query)},stringify(e,t){t.nodeOrNothing(e.value),t.put(".."),t.isSimpleGetPropertyQuery(e.query)||t.isSimpleMethodCallQuery(e.query)?t.node(e.query):(t.put("("),t.node(e.query),t.put(")"))}},A={build:(e,t)=>({type:"Method",reference:e,arguments:t}),suggest(e,t){0===e.arguments.length&&t.queryRoot(e.range[1]-1)},compile(e,t,n){t.tolerant&&t.put("(typeof "),"Identifier"===e.reference.type&&t.put("m."),t.node(e.reference),t.tolerant&&(t.put('==="function"?'),"Identifier"===e.reference.type&&t.put("m."),t.node(e.reference)),t.put("("),t.nodeOrCurrent(n),e.arguments.length&&(t.put(","),t.list(e.arguments,",")),t.put(")"),t.tolerant&&t.put(":undefined)")},walk(e,t){t.node(e.reference),t.list(e.arguments)},stringify(e,t){t.node(e.reference),t.put("("),t.list(e.arguments,","),t.put(")")}},M={build:(e,t)=>({type:"MethodCall",value:e,method:t}),compile(e,t){t.node(e.method,e.value)},walk(e,t){t.nodeOrNothing(e.value),t.node(e.method)},stringify(e,t){t.nodeOrNothing(e.value)&&t.put("."),t.node(e.method)}},_={build:e=>({type:"Object",properties:e}),suggest(e,t){0===e.properties.length&&t.queryRoot(e.range[0]+1,e.range[1]-1)},compile(e,t){t.put("{"),t.list(e.properties,","),t.put("}")},walk(e,t){t.list(e.properties)},stringify(e,t){t.put("{"),t.list(e.properties,","),t.put("}")}};const T=m.build,E=y.build,L=new Set(["Literal","Identifier","Reference","Current"]);const N={Arg1:i,Array:o,Binary:l,Block:u,Compare:f,Conditional:d,Context:p,Current:h,Data:g,Declarator:v,Definition:k,Filter:O,Function:j,GetProperty:m,Identifier:y,Literal:S,Map:C,MapRecursive:P,Method:A,MethodCall:M,Object:_,ObjectEntry:{build:(e,t)=>({type:"ObjectEntry",key:e,value:t}),suggest(e,t){if(null===e.value)switch(e.key.type){case"Identifier":t.range(e.range,"path"),t.range(e.range,"var");break;case"Current":case"Reference":t.range(e.range,"var")}},compile(e,t){let n=e.value;switch(e.key.type){case"Current":return;case"Literal":t.node(e.key);break;case"Identifier":t.node(e.key),n=n||T(null,E(e.key.name));break;case"Reference":t.node(e.key.name),n=n||e.key;break;default:t.put("["),t.node(e.key),t.put("]")}t.put(":"),t.node(n)},walk(e,t){t.node(e.key),t.nodeOrNothing(e.value)},stringify(e,t){if(L.has(e.key.type)){if(t.node(e.key),null===e.value)return}else t.put("["),t.node(e.key),t.put("]");t.put(":"),t.node(e.value)}},Parentheses:{build:e=>({type:"Parentheses",body:e}),compile(e,t){t.put("("),t.node(e.body),t.put(")")},walk(e,t){t.node(e.body)},stringify(e,t){t.put("("),t.node(e.body),t.put(")")}},Pick:{build:(e,t)=>({type:"Pick",value:e,getter:t}),suggest(e,t){if(null===e.getter){const n=e.range[1]-1;t.range([n,n],"key",e.value,!1),t.queryRoot(n)}else t.range(e.getter.range,"key",e.value,!1)},compile(e,t){t.put("f.pick("),t.node(e.value),e.getter&&(t.put(","),t.node(e.getter)),t.put(")")},walk(e,t){t.node(e.value),null!==e.getter&&t.node(e.getter)},stringify(e,t){t.node(e.value),t.put("["),null!==e.getter&&t.node(e.getter),t.put("]")}},Pipeline:{build:(e,t)=>({type:"Pipeline",left:e,right:t}),compile(e,t){t.createScope((()=>{t.put("(current=>("),t.node(e.right),t.put("))")}),((e,t)=>e+t+";")),t.put("("),t.node(e.left),t.put(")")},walk(e,t){t.node(e.left),t.node(e.right)},stringify(e,t){t.node(e.left),t.put("|"),t.node(e.right)}},Reference:{build:e=>({type:"Reference",name:e}),suggest(e,t){e.range&&t.range(e.range,"var")},compile(e,t){if(!t.scope.includes(e.name.name)&&t.tolerant)return t.put("(typeof $"),t.node(e.name),t.put('!=="undefined"?$'),t.node(e.name),void t.put(":undefined)");t.put("$"),t.node(e.name)},walk(e,t){t.node(e.name)},stringify(e,t){t.put("$"),t.node(e.name)}},SliceNotation:{build:(e,t)=>({type:"SliceNotation",value:e,arguments:t}),compile(e,t){t.put("f.slice("),t.nodeOrCurrent(e.value),e.arguments.slice(0,3).forEach((e=>{t.put(","),e?t.node(e):t.put("undefined")})),t.put(")")},walk(e,t){t.nodeOrNothing(e.value);for(const n of e.arguments.slice(0,3))n&&t.node(n)},stringify(e,t){const[n,r,i]=e.arguments;t.nodeOrNothing(e.value),t.put("["),n&&t.node(n),t.put(":"),r&&t.node(r),i&&(t.put(":"),t.node(i)),t.put("]")}},SortingFunction:{build:e=>({type:"SortingFunction",compares:e}),compile(e,t){t.put("(a, b)=>{let _q;return "),t.list(e.compares,"||"),t.put("||0}")},walk(e,t){t.list(e.compares)},stringify(e,t){t.list(e.compares,",")}},Spread:{build:(e,t=!1)=>({type:"Spread",query:e,array:t}),suggest(e,t){null===e.query&&t.queryRoot(e.range[1])},compile(e,t){if(e.array)return t.put("...f.ensureArray("),t.nodeOrCurrent(e.query),void t.put(")");t.put("..."),t.nodeOrCurrent(e.query)},walk(e,t){t.nodeOrNothing(e.query)},stringify(e,t){t.put("..."),t.nodeOrNothing(e.query)}},Unary:{build:(e,t)=>({type:"Unary",operator:e,argument:t}),compile(e,t){switch(e.operator){case"no":case"not":t.put("!f.bool("),t.node(e.argument),t.put(")");break;case"+":case"-":t.put(e.operator),t.node(e.argument);break;default:t.error('Unknown operator "'+e.operator+'"',e)}},walk(e,t){t.node(e.argument)},stringify(e,t){t.put(e.operator),"-"!==e.operator&&"+"!==e.operator&&t.put(" "),t.node(e.argument)}}},D=e=>new Map(Object.entries(N).map((([t,n])=>[t,n[e]])).filter((([,e])=>"function"==typeof e))),I={};D("build").forEach(((e,t)=>I[t]=e));var F={nodes:N,build:I,compile:D("compile"),walk:D("walk"),stringify:D("stringify"),suggest:D("suggest")};const R=F.walk;var $=function(e,t){function n(e){if(!R.has(e.type))throw new Error("Unknown node type `"+e.type+"`");i(e),R.get(e.type)(e,r),o(e)}const r={node:n,nodeOrNothing(e){null!==e&&n(e)},list(e){e.forEach(n)}};let i=()=>{},o=()=>{};"function"==typeof t&&(t={enter:t}),t&&("function"==typeof t.enter&&(i=t.enter),"function"==typeof t.leave&&(o=t.leave)),n(e)};const H=F.suggest;function W(e,t){return t>=0&&t<e.length&&/[a-zA-Z_$0-9]/.test(e[t])}function z(e,t){const n=e.charCodeAt(t);return 9===n||10===n||13===n||32===n}function B(e,t,n){for(;t<n;t++)if(!z(e,t))return!1;return!0}function q(e,t,n,r,i){const o=[];for(let n=0;n<r.length;n++){const[i,a]=r[n];if(i>=t)break;i<e||(i===e?o.push(e,e):o.push(e,i),e=a)}return e===n.length&&i||o.push(e,t),o}function V(e,t,n,r){const i=[];for(let o=0;o<e.length;o++){let[a,s,l,u]=e[o];if(B(t,a,s)){for(;a>=0&&z(t,a-1);)a--;for(;s<t.length&&z(t,s);)s++;if(W(t,a-1)){if(a===s)continue;a++}if(W(t,s)){if(a===s)continue;s--}}const c=q(a,s,t,n,r);for(let e=0;e<c.length;e+=2)i.push([c[e],c[e+1],l,u])}return i}var U=function(e,t,n){const r=function(e){let t=null;const n=new Map,r=(e,t)=>{n.has(e)?n.get(e).push(t):n.set(e,[t])},i={range(e,n,i=t,o=!0){r(i,[...e,n,o]),o&&!0!==o&&r(o,[])},queryRoot(e,n=e){r(t,[e,n,"var",!0]),r(t,[e,n,"path",!0])}};return $(e,(e=>{if(H.has(e.type)){const n=t;t=e,H.get(e.type)(e,i),t=n}})),n}(e),i=n.length&&n[n.length-1][1]===t.length&&!/[\r\n]$/.test(t);for(const[e,o]of r)r.set(e,V(o,t,n,i));return r};const G=F.stringify;function K(e){return"GetProperty"===e.type&&((!e.value||"Current"===e.value.type)&&"Identifier"===e.property.type)}function J(e){return"MethodCall"===e.type&&(!e.value||"Current"===e.value.type)}var Y=function(e){function t(e){if(!G.has(e.type))throw new Error("Unknown node type `"+e.type+"`");G.get(e.type)(e,r)}const n=[],r={isSimpleGetPropertyQuery:K,isSimpleMethodCallQuery:J,put(e){n.push(e)},node:t,nodeOrNothing(e){if(null!==e)return t(e),!0},list(e,n){n?e.forEach(((e,i)=>{i>0&&r.put(n),t(e)})):e.forEach(t)}};return t(e),n.join("")};const X=F.compile;var Z=function(e,t=!1,n=null){function r(e){let t;return l.has(e)?t=l.get(e):(s.push(t="s"+s.length),l.set(e,t)),t}function i(e,t,n,r,i){let o=[e,t,JSON.stringify(n)];if("var"===n){if(!d.scope.length)return;o.push(JSON.stringify(d.scope))}else r||s.push(r="s"+s.length),o.push(r),i&&o.push(i);return c.push(o),r}function o(e,t){const n=d.scope,r=f.length;if(d.scope=d.scope.slice(),d.scope.own=[],d.scope.firstCurrent=null,d.scope.captureCurrent=[],d.scope.arg1=n.arg1||!1,e(),d.scope.captureCurrent.length){const e="stat("+d.scope.captureCurrent.reduce(((e,t)=>i(...t,e)),void 0)+",current)";d.scope.firstCurrent?f[d.scope.firstCurrent]=e:f[r]=t(f[r],e)}d.scope=n}function a(e,t){let o=!1;if(null!==n){if(n.has(e))for(const[t,a,s,l]of n.get(e))"var"===s?i(t,a,s):!0===l?d.scope.captureCurrent.push([t,a,s]):(o||(o=r(e),f.push("stat("+o+",")),s&&i(t,a,s,o,l&&r(l)));"Current"===e.type&&null===d.scope.firstCurrent&&!0!==d.scope.captureCurrent.disabled&&(d.scope.firstCurrent=f.length)}if(!X.has(e.type))throw new Error("Unknown node type `"+e.type+"`");X.get(e.type)(e,d,t),o&&f.push(")")}const s=[],l=new WeakMap,u=[],c=[],f=["const current=data;",{toString:()=>u.length>0?"let "+u+";\n":""},{toString:()=>0===s.length?"":["const stat=(s,v)=>(s.add(v),v);\n","const "+s.map((e=>e+"=new Set()"))+";\n"].join("")},"return "],d={tolerant:t,scope:[],createScope:o,error:(e,n)=>{const r=new SyntaxError(e);if(n&&n.range&&(r.details={loc:{range:n.range}}),!t)throw r},allocateVar(){const e="tmp"+u.length;return u.push(e),e},put:e=>f.push(e),node:a,nodeOrNothing(e,t){e&&a(e,t)},nodeOrCurrent(e,t){a(e||{type:"Current"},t)},list(e,t,n){e.forEach(((e,r)=>{r>0&&f.push(t),a(e,n)}))}};o((()=>a(e)),((e,t)=>(f.push(")"),"("+t+","+e))),null!==n&&f.push("\n,["+c.map((e=>"["+e+"]"))+"]");try{return new Function("f","m","data","context",f.join(""))}catch(e){const t=f.join(""),n=function(e,t){const n=Object.create(SyntaxError.prototype),r=new Error;return n.name=e,n.message=t,Object.defineProperty(n,"stack",{get:function(){return(r.stack||"").replace(/^(.+\n){1,3}/,e+": "+t+"\n")}}),n}("SyntaxError","Jora query compilation error");throw n.compiledSource=t,n}};const Q=Object.hasOwnProperty,ee=Object.prototype.toString;var te={addToSet:function(e,t){return void 0!==t&&(Array.isArray(t)?t.forEach((t=>e.add(t))):e.add(t)),e},getPropertyValue:function(e,t){return e&&Q.call(e,t)?e[t]:void 0},isPlainObject:function(e){return null!==e&&"object"==typeof e&&e.constructor===Object},isRegExp:function(e){return"[object RegExp]"===ee.call(e)},isArrayLike:function(e){return e&&Q.call(e,"length")}};const ne=(e,t)=>t<e.length?e.charCodeAt(t):0,re=e=>43===e||45===e,ie=e=>e>=48&&e<=57,oe=e=>9===e||10===e||12===e||13===e||32===e,ae=e=>e>32&&e<256&&(e<65||e>90)&&(e<97||e>122)&&(e<48||e>57)&&43!==e&&45!==e||8470===e;function se(e,t){for(;ie(ne(e,t));)t++;return t}function le(e,t,n,r){if(t>=e.length)return 0;let i=ne(e,t);if(oe(i)){let n=t+1;for(;oe(ne(e,n));)n++;return 1|n-t<<3}if(ae(i)||r&&re(i)){let n=t+1,r=i;do{i=r,r=ne(e,n++)}while(ae(r)||r===i);return 2|n-t-1<<3}let o=ne(e,t+1),a=ne(e,t+2);if(l=o,u=a,re(s=i)?ie(l)||!(46!==l||!ie(u)):!!ie(s))return 3|function(e,t,n){let r=ne(e,t);if(re(r)&&(r=ne(e,t+=1)),ie(r)&&(t=se(e,t+1),r=ne(e,t)),46===r&&ie(ne(e,t+1))){if(n)return t;let r=t+2;if(r=se(e,r),46===ne(e,r))return t;t=r}if(r=ne(e,t),69===r||101===r){let n=0;r=ne(e,t+1),re(r)&&(n=1,r=ne(e,t+2)),ie(r)&&(t=se(e,t+1+n+1))}return t}(e,t,n)-t<<3;var s,l,u;let c=t;do{i=o,o=a,a=ne(e,3+c++)}while(c<e.length&&!oe(i)&&!ae(i)&&!ie(i));return 4|c-t<<3}function ue(e,t,n){let r=0,i=0,o=!1,a=!1,s=0,l=0,u=!0;for(;;){const c=le(e,r,o,a),f=le(t,i,o,a),d=7&c,p=c>>3,h=7&f,g=f>>3;if(d!==h&&u){if(!(1!==d&&2!==d||3!==h&&4!==h)){s=1,l=d,r+=p;continue}if(!(1!==h&&2!==h||3!==d&&4!==d)){s=-1,l=h,i+=g;continue}}if(u=!1,d!==h)return d<h?-1:1;if(o=!1,a=!1,0===d)return s;const v=p<g?p:g;let m=p-g,y=0;for(;y<v;y++){const n=e[r+y],o=t[i+y];if(n!==o){m=n<o?-1:1;break}}if(1===d||2===d)0!==m&&(0===s||d>l)&&(l=d,s=m),o="."===e[r+p-1];else if(3===d){if(a=!0,0!==m){const o=e.substr(r,p)-t.substr(i,g);if(0!==o)return n?-o:o;if(0===s||d>l){const o=ne(e,r),a=ne(t,i),u=45===o?-1:1;l=d,s=o===a||45!==o&&43!==a?o===a||43!==o&&45!==a?(p!==g?p<g:m<0)?-u:u:1:-1,n&&(s=-s)}}}else{if(0!==m){if(y<v){let n=e[r+y].toLowerCase(),o=t[i+y].toLowerCase();if(n!==o)return n<o?-1:1}return m}o="."===e[r+p-1]}r+=p,i+=g}}var ce={naturalCompare:function(e,t){const n=typeof e,r=typeof t;let i=0;return"number"!==n&&"string"!==n||"number"!==r&&"string"!==r||(i=ue(String(e),String(t),!1)),i},naturalAnalyticalCompare:function(e,t){const n=typeof e,r=typeof t;let i=0;return"number"!==n&&"string"!==n||"number"!==r&&"string"!==r||(i=ue(String(e),String(t),!0)),i}};const{addToSet:fe,getPropertyValue:de,isPlainObject:pe,isRegExp:he,isArrayLike:ge}=te,{naturalCompare:ve,naturalAnalyticalCompare:me}=ce;function ye(e){switch(typeof e){case"boolean":return 1;case"number":return e!=e?2:3;case"string":return 4;case"object":return null===e?5:6;default:return 7}}var be=Object.freeze({ensureArray:e=>Array.isArray(e)?e:[e],bool(e){if(Array.isArray(e))return e.length>0;if(pe(e)){for(const t in e)if(hasOwnProperty.call(e,t))return!0;return!1}return Boolean(e)},add:(e,t)=>Array.isArray(e)||Array.isArray(t)?[...new Set([].concat(e,t))]:e+t,sub(e,t){if(Array.isArray(e)){const n=new Set(e);return Array.isArray(t)?t.forEach((e=>n.delete(e))):n.delete(t),[...n]}return e-t},mul:(e,t)=>e*t,div:(e,t)=>e/t,mod:(e,t)=>e%t,eq:(e,t)=>Object.is(e,t),ne:(e,t)=>!Object.is(e,t),lt:(e,t)=>e<t,lte:(e,t)=>e<=t,gt:(e,t)=>e>t,gte:(e,t)=>e>=t,in:(e,t)=>pe(t)?hasOwnProperty.call(t,e):!(!t||"function"!=typeof t.indexOf)&&-1!==t.indexOf(e),cmp(e,t){const n=ye(e),r=ye(t);return n!==r?n<r?-1:1:e<t?-1:e>t?1:0},cmpAnalytical(e,t){const n=ye(e),r=ye(t);return n!==r?n<r?-1:1:3===n?t-e:e<t?-1:e>t?1:0},cmpNatural(e,t){const n=ye(e),r=ye(t);return 3!==n&&4!==n||3!==r&&4!==r?n!==r?n<r?-1:1:e<t?-1:e>t?1:0:ve(e,t)},cmpNaturalAnalytical(e,t){const n=ye(e),r=ye(t);return 3!==n&&4!==n||3!==r&&4!==r?n!==r?n<r?-1:1:e<t?-1:e>t?1:0:me(e,t,!0)},match(e,t){return"function"==typeof t?this.some(e,t):he(t)?this.some(e,t.test.bind(t)):null==t},pick(e,t=(()=>!0)){if(e){if("function"!=typeof t)return Array.isArray(e)||"string"==typeof e?isFinite(t)?e[t<0?e.length+Number(t):Number(t)||0]:void 0:hasOwnProperty.call(e,t)?e[t]:void 0;if(Array.isArray(e)||"string"==typeof e)for(let n=0;n<e.length;n++)if(t(e[n],n))return e[n];for(const n in e)if(hasOwnProperty.call(e,n)&&t(e[n],n))return e[n]}},map(e,t){const n="function"==typeof t?t:e=>de(e,t);return Array.isArray(e)?[...e.reduce(((e,t)=>fe(e,n(t))),new Set)]:void 0!==e?n(e):e},mapRecursive(e,t){const n=new Set;return fe(n,this.map(e,t)),n.forEach((e=>fe(n,this.map(e,t)))),[...n]},some(e,t){return Array.isArray(e)?e.some((e=>this.bool(t(e)))):this.bool(t(e))},filter(e,t){return Array.isArray(e)?e.filter((e=>this.bool(t(e)))):this.bool(t(e))?e:void 0},slice(e,t=0,n=e&&e.length,r=1){if(!ge(e))return[];if(t=parseInt(t,10)||0,n=parseInt(n,10)||e.length,1!==(r=parseInt(r,10)||1)){const i=[];t=t<0?Math.max(0,e.length+t):Math.min(e.length,t),n=n<0?Math.max(0,e.length+n):Math.min(e.length,n);for(let o=r>0?t:n-1;o>=t&&o<n;o+=r)i.push(e[o]);return i}return"string"==typeof e?e.slice(t,n):Array.prototype.slice.call(e,t,n)}});const{addToSet:we,isPlainObject:xe}=te;function ke(){}function Oe(e){return e}function je(e){return{matched:e.slice(),start:e.index,end:e.index+e[0].length,input:e.input,groups:e.groups||null}}var Se=Object.freeze({bool:be.bool,filter:be.filter,map:be.map,pick:be.pick,keys:e=>Object.keys(e||{}),values(e){const t=new Set;for(const n in e)hasOwnProperty.call(e,n)&&we(t,e[n]);return[...t]},entries(e){const t=[];for(const n in e)hasOwnProperty.call(e,n)&&t.push({key:n,value:e[n]});return t},fromEntries(e){const t={};return Array.isArray(e)&&e.forEach((e=>{e&&(t[e.key]=e.value)})),t},size:e=>xe(e)?Object.keys(e).length:e&&e.length||0,sort(e,t){let n;return Array.isArray(e)?("function"==typeof t&&(n=2===t.length?t:(e,n)=>{if(e=t(e),n=t(n),Array.isArray(e)&&Array.isArray(n)){if(e.length!==n.length)return e.length<n.length?-1:1;for(let t=0;t<e.length;t++){if(e[t]<n[t])return-1;if(e[t]>n[t])return 1}return 0}return e<n?-1:e>n}),e.slice().sort(n)):e},reverse:e=>Array.isArray(e)?e.slice().reverse():e,slice:(e,t,n)=>be.slice(e,t,n),group(e,t,n){"function"!=typeof t&&(t=ke),"function"!=typeof n&&(n=Oe),Array.isArray(e)||(e=[e]);const r=new Map,i=[];return e.forEach((e=>{let i=t(e);Array.isArray(i)||(i=[i]),i.forEach((t=>{r.has(t)?r.get(t).add(n(e)):r.set(t,new Set([n(e)]))}))})),r.forEach(((e,t)=>i.push({key:t,value:[...e]}))),i},split:(e,t)=>String(e).split(t),join:(e,t)=>Array.isArray(e)?e.join(t):String(e),match(e,t,n){const r=String(e);if(n){const e=[];let n,i=new RegExp(t,t.flags+"g");for(;n=i.exec(r);)e.push(je(n));return e}const i=String(e).match(t);return i&&je(i)},reduce:(e,t,n)=>Array.isArray(e)?void 0!==n?e.reduce(((e,n)=>t(n,e)),n):e.reduce(((e,n)=>t(n,e))):t(e,n)});const{addToSet:Ce,isPlainObject:Pe}=te,Ae={path:"property",key:"value",value:"value","in-value":"value","value-subset":"value",var:"variable"};function Me(e,t,n,r){const i=[];for(let[o,a,s,l,u=null]of n)if(t>=o&&t<=a&&(r||l.size||l.length)){let n=e.substring(o,a);/\S/.test(n)||(n="",o=a=t),i.push({context:s,current:n,from:o,to:a,values:l,related:u})}return i}var _e=(e,t)=>({stat(n,r){const i=Me(e,n,t,r);return i.forEach((e=>{e.values=[...e.values]})),i.length?i:null},suggestion(n,r){const i=Me(e,n,t,r),o=[];return i.forEach((e=>{const{context:t,current:n,from:r,to:i,values:a,related:s}=e;o.push(...function(e,t,n){const r=new Set,i=e=>{switch(typeof e){case"string":r.add(JSON.stringify(e));break;case"number":r.add(String(e))}};switch(e){case"":case"path":t.forEach((e=>{Array.isArray(e)?e.forEach((e=>{Pe(e)&&Ce(r,Object.keys(e))})):Pe(e)&&Ce(r,Object.keys(e))}));break;case"key":t.forEach((e=>{null===e||"object"!=typeof e||Array.isArray(e)||Object.keys(e).forEach(i)}));break;case"value":t.forEach((e=>{Array.isArray(e)?e.forEach(i):i(e)}));break;case"in-value":t.forEach((e=>{Array.isArray(e)?e.forEach(i):Pe(e)?Object.keys(e).forEach(i):i(e)}));break;case"var":t.forEach((e=>{r.add("$"+e)}));break;case"value-subset":t.forEach((e=>{Array.isArray(e)?e.forEach(i):i(e)})),n.forEach((e=>{e.forEach((e=>{"string"!=typeof e&&"number"!=typeof e||r.delete(JSON.stringify(e))}))}))}return[...r]}(t,a,s).map((e=>({current:n,type:Ae[t],value:e,from:r,to:i}))))})),o.length?o:null}});var Te,Ee=(Te=n)&&Te.default||Te;const{version:Le}=Ee,Ne=new Map,De=new Map,Ie=new Map,Fe=new Map;function Re(e,t){console.log(`[${e}]`),"string"==typeof t?console.log(t):void 0!==t&&console.dir(t,{depth:null}),console.log()}return Object.assign((function(e,t){t=t||{};const n=Boolean(t.stat),i=Boolean(t.tolerant),o=t.methods?{...Se,...t.methods}:Se,a=n?i?Fe:De:i?Ie:Ne;let s;return e=String(e),a.has(e)&&!t.debug?s=a.get(e):(s=function(e,t,n,i){(i="function"==typeof i?i:!!Boolean(i)&&Re)&&(i("========================="),i("Compile query from source",e));const o=r(e,n);i&&(i("AST",o.ast),i("Restored source",Y(o.ast)));const a=t?U(o.ast,e,o.commentRanges):null;if(i&&a){const t=e=>JSON.stringify(e).slice(1,-1),n=[].concat(...[...a.entries()].map((([e,t])=>t.map((t=>[e,...t])))));let r=[],o=null;i("Suggest ranges",n.sort(((e,t)=>e[1]-t[1])).map((([n,...i])=>{const[a,s,l,u]=i;let c;if(l){if(a===r[0]&&s===r[1])c=" ".repeat(o.length);else{const n=t(e.slice(0,a)).length,l=t(e.substring(a,s)).length;r=i,o=" ".repeat(n)+(l?"~".repeat(l):"\\")+" "+a+":"+s,c=t(e)+"\n"+o}return c+" ["+l+"] on "+n.type+(!0===u?" (current)":u?" & "+u.type:"")}})).join("\n"))}const s=Z(o.ast,n,a);return i&&i("Compiled code",s.toString()),s}(e,n,i,t.debug),a.set(e,s)),n?(t,n)=>_e(e,s(be,o,t,n)):(e,t)=>s(be,o,e,t)}),{version:Le,buildin:be,methods:Se,syntax:{parse:r,walk:$,stringify:Y,compile:Z}})})),Object.defineProperty(n,"__esModule",{value:!0}),n.default=r},{}],6:[function(e,t,n){var r={},i=(t=void 0,function(){const e=arguments[arguments.length-1];o=e(),i=void 0});i.amd=!0;var o=function(e){var t=/\blang(?:uage)?-([\w-]+)\b/i,n=0,r={manual:!0,disableWorkerMessageHandler:e.Prism&&e.Prism.disableWorkerMessageHandler,util:{encode:function e(t){return t instanceof i?new i(t.type,e(t.content),t.alias):Array.isArray(t)?t.map(e):t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++n}),e.__id},clone:function e(t,n){var i,o;switch(n=n||{},r.util.type(t)){case"Object":if(o=r.util.objId(t),n[o])return n[o];for(var a in i={},n[o]=i,t)t.hasOwnProperty(a)&&(i[a]=e(t[a],n));return i;case"Array":return o=r.util.objId(t),n[o]?n[o]:(i=[],n[o]=i,t.forEach((function(t,r){i[r]=e(t,n)})),i);default:return t}},getLanguage:function(e){for(;e&&!t.test(e.className);)e=e.parentElement;return e?(e.className.match(t)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(r){var e=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(r.stack)||[])[1];if(e){var t=document.getElementsByTagName("script");for(var n in t)if(t[n].src==e)return t[n]}return null}},isActive:function(e,t,n){for(var r="no-"+t;e;){var i=e.classList;if(i.contains(t))return!0;if(i.contains(r))return!1;e=e.parentElement}return!!n}},languages:{extend:function(e,t){var n=r.util.clone(r.languages[e]);for(var i in t)n[i]=t[i];return n},insertBefore:function(e,t,n,i){var o=(i=i||r.languages)[e],a={};for(var s in o)if(o.hasOwnProperty(s)){if(s==t)for(var l in n)n.hasOwnProperty(l)&&(a[l]=n[l]);n.hasOwnProperty(s)||(a[s]=o[s])}var u=i[e];return i[e]=a,r.languages.DFS(r.languages,(function(t,n){n===u&&t!=e&&(this[t]=a)})),a},DFS:function e(t,n,i,o){o=o||{};var a=r.util.objId;for(var s in t)if(t.hasOwnProperty(s)){n.call(t,s,t[s],i||s);var l=t[s],u=r.util.type(l);"Object"!==u||o[a(l)]?"Array"!==u||o[a(l)]||(o[a(l)]=!0,e(l,n,s,o)):(o[a(l)]=!0,e(l,n,null,o))}}},plugins:{},highlightAll:function(e,t){r.highlightAllUnder(document,e,t)},highlightAllUnder:function(e,t,n){var i={callback:n,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};r.hooks.run("before-highlightall",i),i.elements=Array.prototype.slice.apply(i.container.querySelectorAll(i.selector)),r.hooks.run("before-all-elements-highlight",i);for(var o,a=0;o=i.elements[a++];)r.highlightElement(o,!0===t,i.callback)},highlightElement:function(n,i,o){var a=r.util.getLanguage(n),s=r.languages[a];n.className=n.className.replace(t,"").replace(/\s+/g," ")+" language-"+a;var l=n.parentElement;l&&"pre"===l.nodeName.toLowerCase()&&(l.className=l.className.replace(t,"").replace(/\s+/g," ")+" language-"+a);var u={element:n,language:a,grammar:s,code:n.textContent};function c(e){u.highlightedCode=e,r.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r.hooks.run("after-highlight",u),r.hooks.run("complete",u),o&&o.call(u.element)}if(r.hooks.run("before-sanity-check",u),!u.code)return r.hooks.run("complete",u),void(o&&o.call(u.element));if(r.hooks.run("before-highlight",u),u.grammar)if(i&&e.Worker){var f=new Worker(r.filename);f.onmessage=function(e){c(e.data)},f.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else c(r.highlight(u.code,u.grammar,u.language));else c(r.util.encode(u.code))},highlight:function(e,t,n){var o={code:e,grammar:t,language:n};return r.hooks.run("before-tokenize",o),o.tokens=r.tokenize(o.code,o.grammar),r.hooks.run("after-tokenize",o),i.stringify(r.util.encode(o.tokens),o.language)},tokenize:function(e,t){var n=t.rest;if(n){for(var r in n)t[r]=n[r];delete t.rest}var i=new a;return s(i,i.head,e),o(e,i,t,i.head,0),function(e){var t=[],n=e.head.next;for(;n!==e.tail;)t.push(n.value),n=n.next;return t}(i)},hooks:{all:{},add:function(e,t){var n=r.hooks.all;n[e]=n[e]||[],n[e].push(t)},run:function(e,t){var n=r.hooks.all[e];if(n&&n.length)for(var i,o=0;i=n[o++];)i(t)}},Token:i};function i(e,t,n,r){this.type=e,this.content=t,this.alias=n,this.length=0|(r||"").length}function o(e,t,n,a,u,c){for(var f in n)if(n.hasOwnProperty(f)&&n[f]){var d=n[f];d=Array.isArray(d)?d:[d];for(var p=0;p<d.length;++p){if(c&&c.cause==f+","+p)return;var h=d[p],g=h.inside,v=!!h.lookbehind,m=!!h.greedy,y=0,b=h.alias;if(m&&!h.pattern.global){var w=h.pattern.toString().match(/[imsuy]*$/)[0];h.pattern=RegExp(h.pattern.source,w+"g")}for(var x=h.pattern||h,k=a.next,O=u;k!==t.tail&&!(c&&O>=c.reach);O+=k.value.length,k=k.next){var j=k.value;if(t.length>e.length)return;if(!(j instanceof i)){var S=1;if(m&&k!=t.tail.prev){if(x.lastIndex=O,!(_=x.exec(e)))break;var C=_.index+(v&&_[1]?_[1].length:0),P=_.index+_[0].length,A=O;for(A+=k.value.length;C>=A;)A+=(k=k.next).value.length;if(O=A-=k.value.length,k.value instanceof i)continue;for(var M=k;M!==t.tail&&(A<P||"string"==typeof M.value);M=M.next)S++,A+=M.value.length;S--,j=e.slice(O,A),_.index-=O}else{x.lastIndex=0;var _=x.exec(j)}if(_){v&&(y=_[1]?_[1].length:0);C=_.index+y;var T=_[0].slice(y),E=(P=C+T.length,j.slice(0,C)),L=j.slice(P),N=O+j.length;c&&N>c.reach&&(c.reach=N);var D=k.prev;E&&(D=s(t,D,E),O+=E.length),l(t,D,S),k=s(t,D,new i(f,g?r.tokenize(T,g):T,b,T)),L&&s(t,k,L),S>1&&o(e,t,n,k.prev,O,{cause:f+","+p,reach:N})}}}}}}function a(){var e={value:null,prev:null,next:null},t={value:null,prev:e,next:null};e.next=t,this.head=e,this.tail=t,this.length=0}function s(e,t,n){var r=t.next,i={value:n,prev:t,next:r};return t.next=i,r.prev=i,e.length++,i}function l(e,t,n){for(var r=t.next,i=0;i<n&&r!==e.tail;i++)r=r.next;t.next=r,r.prev=t,e.length-=i}if(i.stringify=function e(t,n){if("string"==typeof t)return t;if(Array.isArray(t)){var i="";return t.forEach((function(t){i+=e(t,n)})),i}var o={type:t.type,content:e(t.content,n),tag:"span",classes:["token",t.type],attributes:{},language:n},a=t.alias;a&&(Array.isArray(a)?Array.prototype.push.apply(o.classes,a):o.classes.push(a)),r.hooks.run("wrap",o);var s="";for(var l in o.attributes)s+=" "+l+'="'+(o.attributes[l]||"").replace(/"/g,"&quot;")+'"';return"<"+o.tag+' class="'+o.classes.join(" ")+'"'+s+">"+o.content+"</"+o.tag+">"},!e.document)return e.addEventListener?(r.disableWorkerMessageHandler||e.addEventListener("message",(function(t){var n=JSON.parse(t.data),i=n.language,o=n.code,a=n.immediateClose;e.postMessage(r.highlight(o,r.languages[i],i)),a&&e.close()}),!1),r):r;var u=r.util.currentScript();function c(){r.manual||r.highlightAll()}if(u&&(r.filename=u.src,u.hasAttribute("data-manual")&&(r.manual=!0)),!r.manual){var f=document.readyState;"loading"===f||"interactive"===f&&u&&u.defer?document.addEventListener("DOMContentLoaded",c):window.requestAnimationFrame?window.requestAnimationFrame(c):window.setTimeout(c,16)}return r}("undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{});
/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */void 0!==t&&t.exports&&(t.exports=o),void 0!==r&&(r.Prism=o),o.languages.markup={comment:/<!--[\s\S]*?-->/,prolog:/<\?[\s\S]+?\?>/,doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/,name:/[^\s<>'"]+/}},cdata:/<!\[CDATA\[[\s\S]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},o.languages.markup.tag.inside["attr-value"].inside.entity=o.languages.markup.entity,o.languages.markup.doctype.inside["internal-subset"].inside=o.languages.markup,o.hooks.add("wrap",(function(e){"entity"===e.type&&(e.attributes.title=e.content.replace(/&amp;/,"&"))})),Object.defineProperty(o.languages.markup.tag,"addInlined",{value:function(e,t){var n={};n["language-"+t]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:o.languages[t]},n.cdata=/^<!\[CDATA\[|\]\]>$/i;var r={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:n}};r["language-"+t]={pattern:/[\s\S]+/,inside:o.languages[t]};var i={};i[e]={pattern:RegExp(/(<__[\s\S]*?>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,(function(){return e})),"i"),lookbehind:!0,greedy:!0,inside:r},o.languages.insertBefore("markup","cdata",i)}}),o.languages.html=o.languages.markup,o.languages.mathml=o.languages.markup,o.languages.svg=o.languages.markup,o.languages.xml=o.languages.extend("markup",{}),o.languages.ssml=o.languages.xml,o.languages.atom=o.languages.xml,o.languages.rss=o.languages.xml,function(e){var t=/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;e.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:/@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\((?!\s*\))\s*)(?:[^()]|\((?:[^()]|\([^()]*\))*\))+?(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+t.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+t.source+"$"),alias:"url"}}},selector:RegExp("[^{}\\s](?:[^{};\"']|"+t.source+")*?(?=\\s*\\{)"),string:{pattern:t,greedy:!0},property:/[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,important:/!important\b/i,function:/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:,]/},e.languages.css.atrule.inside.rest=e.languages.css;var n=e.languages.markup;n&&(n.tag.addInlined("style","css"),e.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:n.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:e.languages.css}},alias:"language-css"}},n.tag))}(o),o.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,boolean:/\b(?:true|false)\b/,function:/\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},o.languages.javascript=o.languages.extend("clike",{"class-name":[o.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,lookbehind:!0}],keyword:[{pattern:/((?:^|})\s*)(?:catch|finally)\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],number:/\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,function:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),o.languages.javascript["class-name"][0].pattern=/(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/,o.languages.insertBefore("javascript","keyword",{regex:{pattern:/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,lookbehind:!0,greedy:!0},"function-variable":{pattern:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,lookbehind:!0,inside:o.languages.javascript},{pattern:/[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,inside:o.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,lookbehind:!0,inside:o.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,lookbehind:!0,inside:o.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),o.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\${|}$/,alias:"punctuation"},rest:o.languages.javascript}},string:/[\s\S]+/}}}),o.languages.markup&&o.languages.markup.tag.addInlined("script","javascript"),o.languages.js=o.languages.javascript,function(){if("undefined"!=typeof self&&self.Prism&&self.document){var e=window.Prism,t={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},n="data-src-status",r="loading",i="loaded",o='pre[data-src]:not([data-src-status="loaded"]):not([data-src-status="loading"])',a=/\blang(?:uage)?-([\w-]+)\b/i;e.hooks.add("before-highlightall",(function(e){e.selector+=", "+o})),e.hooks.add("before-sanity-check",(function(a){var s=a.element;if(s.matches(o)){a.code="",s.setAttribute(n,r);var u=s.appendChild(document.createElement("CODE"));u.textContent="Loading…";var c=s.getAttribute("data-src"),f=a.language;if("none"===f){var d=(/\.(\w+)$/.exec(c)||[,"none"])[1];f=t[d]||d}l(u,f),l(s,f);var p=e.plugins.autoloader;p&&p.loadLanguages(f);var h=new XMLHttpRequest;h.open("GET",c,!0),h.onreadystatechange=function(){var t,r;4==h.readyState&&(h.status<400&&h.responseText?(s.setAttribute(n,i),u.textContent=h.responseText,e.highlightElement(u)):(s.setAttribute(n,"failed"),h.status>=400?u.textContent=(t=h.status,r=h.statusText,"✖ Error "+t+" while fetching file: "+r):u.textContent="✖ Error: File does not exist or is empty"))},h.send(null)}})),e.plugins.fileHighlight={highlight:function(t){for(var n,r=(t||document).querySelectorAll(o),i=0;n=r[i++];)e.highlightElement(n)}};var s=!1;e.fileHighlight=function(){s||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),s=!0),e.plugins.fileHighlight.highlight.apply(this,arguments)}}function l(e,t){var n=e.className;n=n.replace(a," ")+" language-"+t,e.className=n.replace(/\s+/g," ").trim()}}(),o.languages.json={property:{pattern:/"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,greedy:!0},string:{pattern:/"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:true|false)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}},o.languages.webmanifest=o.languages.json,function(e){e.languages.php=e.languages.extend("clike",{keyword:/\b(?:__halt_compiler|abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|parent|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/i,boolean:{pattern:/\b(?:false|true)\b/i,alias:"constant"},constant:[/\b[A-Z_][A-Z0-9_]*\b/,/\b(?:null)\b/i],comment:{pattern:/(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,lookbehind:!0}}),e.languages.insertBefore("php","string",{"shell-comment":{pattern:/(^|[^\\])#.*/,lookbehind:!0,alias:"comment"}}),e.languages.insertBefore("php","comment",{delimiter:{pattern:/\?>$|^<\?(?:php(?=\s)|=)?/i,alias:"important"}}),e.languages.insertBefore("php","keyword",{variable:/\$+(?:\w+\b|(?={))/i,package:{pattern:/(\\|namespace\s+|use\s+)[\w\\]+/,lookbehind:!0,inside:{punctuation:/\\/}}}),e.languages.insertBefore("php","operator",{property:{pattern:/(->)[\w]+/,lookbehind:!0}});var t={pattern:/{\$(?:{(?:{[^{}]+}|[^{}]+)}|[^{}])+}|(^|[^\\{])\$+(?:\w+(?:\[[^\r\n\[\]]+\]|->\w+)*)/,lookbehind:!0,inside:e.languages.php};e.languages.insertBefore("php","string",{"nowdoc-string":{pattern:/<<<'([^']+)'[\r\n](?:.*[\r\n])*?\1;/,greedy:!0,alias:"string",inside:{delimiter:{pattern:/^<<<'[^']+'|[a-z_]\w*;$/i,alias:"symbol",inside:{punctuation:/^<<<'?|[';]$/}}}},"heredoc-string":{pattern:/<<<(?:"([^"]+)"[\r\n](?:.*[\r\n])*?\1;|([a-z_]\w*)[\r\n](?:.*[\r\n])*?\2;)/i,greedy:!0,alias:"string",inside:{delimiter:{pattern:/^<<<(?:"[^"]+"|[a-z_]\w*)|[a-z_]\w*;$/i,alias:"symbol",inside:{punctuation:/^<<<"?|[";]$/}},interpolation:t}},"single-quoted-string":{pattern:/'(?:\\[\s\S]|[^\\'])*'/,greedy:!0,alias:"string"},"double-quoted-string":{pattern:/"(?:\\[\s\S]|[^\\"])*"/,greedy:!0,alias:"string",inside:{interpolation:t}}}),delete e.languages.php.string,e.hooks.add("before-tokenize",(function(t){if(/<\?/.test(t.code)){e.languages["markup-templating"].buildPlaceholders(t,"php",/<\?(?:[^"'/#]|\/(?![*/])|("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|(?:\/\/|#)(?:[^?\n\r]|\?(?!>))*(?=$|\?>|[\r\n])|\/\*[\s\S]*?(?:\*\/|$))*?(?:\?>|$)/gi)}})),e.hooks.add("after-tokenize",(function(t){e.languages["markup-templating"].tokenizePlaceholders(t,"php")}))}(o),o.languages.twig={comment:/\{#[\s\S]*?#\}/,tag:{pattern:/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/,inside:{ld:{pattern:/^(?:\{\{-?|\{%-?\s*\w+)/,inside:{punctuation:/^(?:\{\{|\{%)-?/,keyword:/\w+/}},rd:{pattern:/-?(?:%\}|\}\})$/,inside:{punctuation:/.+/}},string:{pattern:/("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,inside:{punctuation:/^['"]|['"]$/}},keyword:/\b(?:even|if|odd)\b/,boolean:/\b(?:true|false|null)\b/,number:/\b0x[\dA-Fa-f]+|(?:\b\d+\.?\d*|\B\.\d+)(?:[Ee][-+]?\d+)?/,operator:[{pattern:/(\s)(?:and|b-and|b-xor|b-or|ends with|in|is|matches|not|or|same as|starts with)(?=\s)/,lookbehind:!0},/[=<>]=?|!=|\*\*?|\/\/?|\?:?|[-+~%|]/],property:/\b[a-zA-Z_]\w*\b/,punctuation:/[()\[\]{}:.,]/}},other:{pattern:/\S(?:[\s\S]*\S)?/,inside:o.languages.markup}},function(e){var t=/[*&][^\s[\]{},]+/,n=/!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/,r="(?:"+n.source+"(?:[ \t]+"+t.source+")?|"+t.source+"(?:[ \t]+"+n.source+")?)";function i(e,t){t=(t||"").replace(/m/g,"")+"m";var n=/([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|]|}|\s*#))/.source.replace(/<<prop>>/g,(function(){return r})).replace(/<<value>>/g,(function(){return e}));return RegExp(n,t)}e.languages.yaml={scalar:{pattern:RegExp(/([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)[^\r\n]+(?:\2[^\r\n]+)*)/.source.replace(/<<prop>>/g,(function(){return r}))),lookbehind:!0,alias:"string"},comment:/#.*/,key:{pattern:RegExp(/((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)[^\r\n{[\]},#\s]+?(?=\s*:\s)/.source.replace(/<<prop>>/g,(function(){return r}))),lookbehind:!0,alias:"atrule"},directive:{pattern:/(^[ \t]*)%.+/m,lookbehind:!0,alias:"important"},datetime:{pattern:i(/\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?)?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source),lookbehind:!0,alias:"number"},boolean:{pattern:i(/true|false/.source,"i"),lookbehind:!0,alias:"important"},null:{pattern:i(/null|~/.source,"i"),lookbehind:!0,alias:"important"},string:{pattern:i(/("|')(?:(?!\2)[^\\\r\n]|\\.)*\2/.source),lookbehind:!0,greedy:!0},number:{pattern:i(/[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+\.?\d*|\.?\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source,"i"),lookbehind:!0},tag:n,important:t,punctuation:/---|[:[\]{}\-,|>?]|\.\.\./},e.languages.yml=e.languages.yaml}(o),function(e){var t={pattern:/(\b\d+)(?:%|[a-z]+)/,lookbehind:!0},n={pattern:/(^|[^\w.-])-?\d*\.?\d+/,lookbehind:!0},r={comment:{pattern:/(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,lookbehind:!0},url:{pattern:/url\((["']?).*?\1\)/i,greedy:!0},string:{pattern:/("|')(?:(?!\1)[^\\\r\n]|\\(?:\r\n|[\s\S]))*\1/,greedy:!0},interpolation:null,func:null,important:/\B!(?:important|optional)\b/i,keyword:{pattern:/(^|\s+)(?:(?:if|else|for|return|unless)(?=\s+|$)|@[\w-]+)/,lookbehind:!0},hexcode:/#[\da-f]{3,6}/i,color:[/\b(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGr[ae]y|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGr[ae]y|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGr[ae]y|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gr[ae]y|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGr[ae]y|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGr[ae]y|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGr[ae]y|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Transparent|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)\b/i,{pattern:/\b(?:rgb|hsl)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:rgb|hsl)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,inside:{unit:t,number:n,function:/[\w-]+(?=\()/,punctuation:/[(),]/}}],entity:/\\[\da-f]{1,8}/i,unit:t,boolean:/\b(?:true|false)\b/,operator:[/~|[+!\/%<>?=]=?|[-:]=|\*[*=]?|\.{2,3}|&&|\|\||\B-\B|\b(?:and|in|is(?: a| defined| not|nt)?|not|or)\b/],number:n,punctuation:/[{}()\[\];:,]/};r.interpolation={pattern:/\{[^\r\n}:]+\}/,alias:"variable",inside:{delimiter:{pattern:/^{|}$/,alias:"punctuation"},rest:r}},r.func={pattern:/[\w-]+\([^)]*\).*/,inside:{function:/^[^(]+/,rest:r}},e.languages.stylus={"atrule-declaration":{pattern:/(^\s*)@.+/m,lookbehind:!0,inside:{atrule:/^@[\w-]+/,rest:r}},"variable-declaration":{pattern:/(^[ \t]*)[\w$-]+\s*.?=[ \t]*(?:(?:\{[^}]*\}|.+)|$)/m,lookbehind:!0,inside:{variable:/^\S+/,rest:r}},statement:{pattern:/(^[ \t]*)(?:if|else|for|return|unless)[ \t]+.+/m,lookbehind:!0,inside:{keyword:/^\S+/,rest:r}},"property-declaration":{pattern:/((?:^|\{)([ \t]*))(?:[\w-]|\{[^}\r\n]+\})+(?:\s*:\s*|[ \t]+)[^{\r\n]*(?:;|[^{\r\n,](?=$)(?!(?:\r?\n|\r)(?:\{|\2[ \t]+)))/m,lookbehind:!0,inside:{property:{pattern:/^[^\s:]+/,inside:{interpolation:r.interpolation}},rest:r}},selector:{pattern:/(^[ \t]*)(?:(?=\S)(?:[^{}\r\n:()]|::?[\w-]+(?:\([^)\r\n]*\))?|\{[^}\r\n]+\})+)(?:(?:\r?\n|\r)(?:\1(?:(?=\S)(?:[^{}\r\n:()]|::?[\w-]+(?:\([^)\r\n]*\))?|\{[^}\r\n]+\})+)))*(?:,$|\{|(?=(?:\r?\n|\r)(?:\{|\1[ \t]+)))/m,lookbehind:!0,inside:{interpolation:r.interpolation,comment:r.comment,punctuation:/[{},]/}},func:r.func,string:r.string,comment:{pattern:/(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,lookbehind:!0,greedy:!0},interpolation:r.interpolation,punctuation:/[{}()\[\];:.]/}}(o),Object.defineProperty(n,"__esModule",{value:!0}),n.default=o},{}],7:[function(e,t,n){(function(e){var n=function(e){var t=/\blang(?:uage)?-([\w-]+)\b/i,n=0,r={manual:e.Prism&&e.Prism.manual,disableWorkerMessageHandler:e.Prism&&e.Prism.disableWorkerMessageHandler,util:{encode:function e(t){return t instanceof i?new i(t.type,e(t.content),t.alias):Array.isArray(t)?t.map(e):t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++n}),e.__id},clone:function e(t,n){var i,o;switch(n=n||{},r.util.type(t)){case"Object":if(o=r.util.objId(t),n[o])return n[o];for(var a in i={},n[o]=i,t)t.hasOwnProperty(a)&&(i[a]=e(t[a],n));return i;case"Array":return o=r.util.objId(t),n[o]?n[o]:(i=[],n[o]=i,t.forEach((function(t,r){i[r]=e(t,n)})),i);default:return t}},getLanguage:function(e){for(;e&&!t.test(e.className);)e=e.parentElement;return e?(e.className.match(t)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(r){var e=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(r.stack)||[])[1];if(e){var t=document.getElementsByTagName("script");for(var n in t)if(t[n].src==e)return t[n]}return null}},isActive:function(e,t,n){for(var r="no-"+t;e;){var i=e.classList;if(i.contains(t))return!0;if(i.contains(r))return!1;e=e.parentElement}return!!n}},languages:{extend:function(e,t){var n=r.util.clone(r.languages[e]);for(var i in t)n[i]=t[i];return n},insertBefore:function(e,t,n,i){var o=(i=i||r.languages)[e],a={};for(var s in o)if(o.hasOwnProperty(s)){if(s==t)for(var l in n)n.hasOwnProperty(l)&&(a[l]=n[l]);n.hasOwnProperty(s)||(a[s]=o[s])}var u=i[e];return i[e]=a,r.languages.DFS(r.languages,(function(t,n){n===u&&t!=e&&(this[t]=a)})),a},DFS:function e(t,n,i,o){o=o||{};var a=r.util.objId;for(var s in t)if(t.hasOwnProperty(s)){n.call(t,s,t[s],i||s);var l=t[s],u=r.util.type(l);"Object"!==u||o[a(l)]?"Array"!==u||o[a(l)]||(o[a(l)]=!0,e(l,n,s,o)):(o[a(l)]=!0,e(l,n,null,o))}}},plugins:{},highlightAll:function(e,t){r.highlightAllUnder(document,e,t)},highlightAllUnder:function(e,t,n){var i={callback:n,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};r.hooks.run("before-highlightall",i),i.elements=Array.prototype.slice.apply(i.container.querySelectorAll(i.selector)),r.hooks.run("before-all-elements-highlight",i);for(var o,a=0;o=i.elements[a++];)r.highlightElement(o,!0===t,i.callback)},highlightElement:function(n,i,o){var a=r.util.getLanguage(n),s=r.languages[a];n.className=n.className.replace(t,"").replace(/\s+/g," ")+" language-"+a;var l=n.parentElement;l&&"pre"===l.nodeName.toLowerCase()&&(l.className=l.className.replace(t,"").replace(/\s+/g," ")+" language-"+a);var u={element:n,language:a,grammar:s,code:n.textContent};function c(e){u.highlightedCode=e,r.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r.hooks.run("after-highlight",u),r.hooks.run("complete",u),o&&o.call(u.element)}if(r.hooks.run("before-sanity-check",u),!u.code)return r.hooks.run("complete",u),void(o&&o.call(u.element));if(r.hooks.run("before-highlight",u),u.grammar)if(i&&e.Worker){var f=new Worker(r.filename);f.onmessage=function(e){c(e.data)},f.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else c(r.highlight(u.code,u.grammar,u.language));else c(r.util.encode(u.code))},highlight:function(e,t,n){var o={code:e,grammar:t,language:n};return r.hooks.run("before-tokenize",o),o.tokens=r.tokenize(o.code,o.grammar),r.hooks.run("after-tokenize",o),i.stringify(r.util.encode(o.tokens),o.language)},tokenize:function(e,t){var n=t.rest;if(n){for(var r in n)t[r]=n[r];delete t.rest}var i=new a;return s(i,i.head,e),o(e,i,t,i.head,0),function(e){var t=[],n=e.head.next;for(;n!==e.tail;)t.push(n.value),n=n.next;return t}(i)},hooks:{all:{},add:function(e,t){var n=r.hooks.all;n[e]=n[e]||[],n[e].push(t)},run:function(e,t){var n=r.hooks.all[e];if(n&&n.length)for(var i,o=0;i=n[o++];)i(t)}},Token:i};function i(e,t,n,r){this.type=e,this.content=t,this.alias=n,this.length=0|(r||"").length}function o(e,t,n,a,u,c){for(var f in n)if(n.hasOwnProperty(f)&&n[f]){var d=n[f];d=Array.isArray(d)?d:[d];for(var p=0;p<d.length;++p){if(c&&c.cause==f+","+p)return;var h=d[p],g=h.inside,v=!!h.lookbehind,m=!!h.greedy,y=0,b=h.alias;if(m&&!h.pattern.global){var w=h.pattern.toString().match(/[imsuy]*$/)[0];h.pattern=RegExp(h.pattern.source,w+"g")}for(var x=h.pattern||h,k=a.next,O=u;k!==t.tail&&!(c&&O>=c.reach);O+=k.value.length,k=k.next){var j=k.value;if(t.length>e.length)return;if(!(j instanceof i)){var S=1;if(m&&k!=t.tail.prev){if(x.lastIndex=O,!(_=x.exec(e)))break;var C=_.index+(v&&_[1]?_[1].length:0),P=_.index+_[0].length,A=O;for(A+=k.value.length;C>=A;)A+=(k=k.next).value.length;if(O=A-=k.value.length,k.value instanceof i)continue;for(var M=k;M!==t.tail&&(A<P||"string"==typeof M.value);M=M.next)S++,A+=M.value.length;S--,j=e.slice(O,A),_.index-=O}else{x.lastIndex=0;var _=x.exec(j)}if(_){v&&(y=_[1]?_[1].length:0);C=_.index+y;var T=_[0].slice(y),E=(P=C+T.length,j.slice(0,C)),L=j.slice(P),N=O+j.length;c&&N>c.reach&&(c.reach=N);var D=k.prev;E&&(D=s(t,D,E),O+=E.length),l(t,D,S),k=s(t,D,new i(f,g?r.tokenize(T,g):T,b,T)),L&&s(t,k,L),S>1&&o(e,t,n,k.prev,O,{cause:f+","+p,reach:N})}}}}}}function a(){var e={value:null,prev:null,next:null},t={value:null,prev:e,next:null};e.next=t,this.head=e,this.tail=t,this.length=0}function s(e,t,n){var r=t.next,i={value:n,prev:t,next:r};return t.next=i,r.prev=i,e.length++,i}function l(e,t,n){for(var r=t.next,i=0;i<n&&r!==e.tail;i++)r=r.next;t.next=r,r.prev=t,e.length-=i}if(e.Prism=r,i.stringify=function e(t,n){if("string"==typeof t)return t;if(Array.isArray(t)){var i="";return t.forEach((function(t){i+=e(t,n)})),i}var o={type:t.type,content:e(t.content,n),tag:"span",classes:["token",t.type],attributes:{},language:n},a=t.alias;a&&(Array.isArray(a)?Array.prototype.push.apply(o.classes,a):o.classes.push(a)),r.hooks.run("wrap",o);var s="";for(var l in o.attributes)s+=" "+l+'="'+(o.attributes[l]||"").replace(/"/g,"&quot;")+'"';return"<"+o.tag+' class="'+o.classes.join(" ")+'"'+s+">"+o.content+"</"+o.tag+">"},!e.document)return e.addEventListener?(r.disableWorkerMessageHandler||e.addEventListener("message",(function(t){var n=JSON.parse(t.data),i=n.language,o=n.code,a=n.immediateClose;e.postMessage(r.highlight(o,r.languages[i],i)),a&&e.close()}),!1),r):r;var u=r.util.currentScript();function c(){r.manual||r.highlightAll()}if(u&&(r.filename=u.src,u.hasAttribute("data-manual")&&(r.manual=!0)),!r.manual){var f=document.readyState;"loading"===f||"interactive"===f&&u&&u.defer?document.addEventListener("DOMContentLoaded",c):window.requestAnimationFrame?window.requestAnimationFrame(c):window.setTimeout(c,16)}return r}("undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{});
/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */void 0!==t&&t.exports&&(t.exports=n),void 0!==e&&(e.Prism=n),n.languages.markup={comment:/<!--[\s\S]*?-->/,prolog:/<\?[\s\S]+?\?>/,doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/,name:/[^\s<>'"]+/}},cdata:/<!\[CDATA\[[\s\S]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},n.languages.markup.tag.inside["attr-value"].inside.entity=n.languages.markup.entity,n.languages.markup.doctype.inside["internal-subset"].inside=n.languages.markup,n.hooks.add("wrap",(function(e){"entity"===e.type&&(e.attributes.title=e.content.replace(/&amp;/,"&"))})),Object.defineProperty(n.languages.markup.tag,"addInlined",{value:function(e,t){var r={};r["language-"+t]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:n.languages[t]},r.cdata=/^<!\[CDATA\[|\]\]>$/i;var i={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:r}};i["language-"+t]={pattern:/[\s\S]+/,inside:n.languages[t]};var o={};o[e]={pattern:RegExp(/(<__[\s\S]*?>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g,(function(){return e})),"i"),lookbehind:!0,greedy:!0,inside:i},n.languages.insertBefore("markup","cdata",o)}}),n.languages.html=n.languages.markup,n.languages.mathml=n.languages.markup,n.languages.svg=n.languages.markup,n.languages.xml=n.languages.extend("markup",{}),n.languages.ssml=n.languages.xml,n.languages.atom=n.languages.xml,n.languages.rss=n.languages.xml,function(e){var t=/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;e.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:/@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,inside:{rule:/^@[\w-]+/,"selector-function-argument":{pattern:/(\bselector\s*\((?!\s*\))\s*)(?:[^()]|\((?:[^()]|\([^()]*\))*\))+?(?=\s*\))/,lookbehind:!0,alias:"selector"},keyword:{pattern:/(^|[^\w-])(?:and|not|only|or)(?![\w-])/,lookbehind:!0}}},url:{pattern:RegExp("\\burl\\((?:"+t.source+"|"+/(?:[^\\\r\n()"']|\\[\s\S])*/.source+")\\)","i"),greedy:!0,inside:{function:/^url/i,punctuation:/^\(|\)$/,string:{pattern:RegExp("^"+t.source+"$"),alias:"url"}}},selector:RegExp("[^{}\\s](?:[^{};\"']|"+t.source+")*?(?=\\s*\\{)"),string:{pattern:t,greedy:!0},property:/[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,important:/!important\b/i,function:/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:,]/},e.languages.css.atrule.inside.rest=e.languages.css;var n=e.languages.markup;n&&(n.tag.addInlined("style","css"),e.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:n.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:e.languages.css}},alias:"language-css"}},n.tag))}(n),n.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,boolean:/\b(?:true|false)\b/,function:/\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/},n.languages.javascript=n.languages.extend("clike",{"class-name":[n.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,lookbehind:!0}],keyword:[{pattern:/((?:^|})\s*)(?:catch|finally)\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],number:/\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,function:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/}),n.languages.javascript["class-name"][0].pattern=/(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/,n.languages.insertBefore("javascript","keyword",{regex:{pattern:/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,lookbehind:!0,greedy:!0},"function-variable":{pattern:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,lookbehind:!0,inside:n.languages.javascript},{pattern:/[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,inside:n.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,lookbehind:!0,inside:n.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,lookbehind:!0,inside:n.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),n.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\${|}$/,alias:"punctuation"},rest:n.languages.javascript}},string:/[\s\S]+/}}}),n.languages.markup&&n.languages.markup.tag.addInlined("script","javascript"),n.languages.js=n.languages.javascript,function(){if("undefined"!=typeof self&&self.Prism&&self.document){var e=window.Prism,t={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"},n="data-src-status",r="loading",i="loaded",o='pre[data-src]:not([data-src-status="loaded"]):not([data-src-status="loading"])',a=/\blang(?:uage)?-([\w-]+)\b/i;e.hooks.add("before-highlightall",(function(e){e.selector+=", "+o})),e.hooks.add("before-sanity-check",(function(a){var s=a.element;if(s.matches(o)){a.code="",s.setAttribute(n,r);var u=s.appendChild(document.createElement("CODE"));u.textContent="Loading…";var c=s.getAttribute("data-src"),f=a.language;if("none"===f){var d=(/\.(\w+)$/.exec(c)||[,"none"])[1];f=t[d]||d}l(u,f),l(s,f);var p=e.plugins.autoloader;p&&p.loadLanguages(f);var h=new XMLHttpRequest;h.open("GET",c,!0),h.onreadystatechange=function(){var t,r;4==h.readyState&&(h.status<400&&h.responseText?(s.setAttribute(n,i),u.textContent=h.responseText,e.highlightElement(u)):(s.setAttribute(n,"failed"),h.status>=400?u.textContent=(t=h.status,r=h.statusText,"✖ Error "+t+" while fetching file: "+r):u.textContent="✖ Error: File does not exist or is empty"))},h.send(null)}})),e.plugins.fileHighlight={highlight:function(t){for(var n,r=(t||document).querySelectorAll(o),i=0;n=r[i++];)e.highlightElement(n)}};var s=!1;e.fileHighlight=function(){s||(console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),s=!0),e.plugins.fileHighlight.highlight.apply(this,arguments)}}function l(e,t){var n=e.className;n=n.replace(a," ")+" language-"+t,e.className=n.replace(/\s+/g," ").trim()}}()}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],8:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=u(e("../widget/index.js")),i=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==c(e)&&"function"!=typeof e)return{default:e};var t=l();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){var o=r?Object.getOwnPropertyDescriptor(e,i):null;o&&(o.get||o.set)?Object.defineProperty(n,i,o):n[i]=e[i]}n.default=e,t&&t.set(e,n);return n}(e("../views/index-complex.js")),o=u(e("../core/router.js")),a=e("../core/utils/dom.js"),s=e("../core/utils/html.js");function l(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return l=function(){return e},e}function u(e){return e&&e.__esModule?e:{default:e}}function c(e){return(c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function f(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function d(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?f(Object(n),!0).forEach((function(t){p(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):f(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function h(e,t,n,r,i,o,a){try{var s=e[o](a),l=s.value}catch(e){return void n(e)}s.done?t(l):Promise.resolve(l).then(r,i)}function g(e){return function(){var t=this,n=arguments;return new Promise((function(r,i){var o=e.apply(t,n);function a(e){h(o,r,i,a,s,"next",e)}function s(e){h(o,r,i,a,s,"throw",e)}a(void 0)}))}}function v(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function m(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function y(e,t,n){return(y="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=k(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}function b(e,t){return(b=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function w(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=k(e);if(t){var i=k(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return x(this,n)}}function x(e,t){return!t||"object"!==c(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function k(e){return(k=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var O=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&b(e,t)}(c,e);var t,n,r,l,u=w(c);function c(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return v(this,c),(t=u.call(this,e,null,n)).mode=t.options.mode,t.download=t.options.setup.model&&t.options.setup.model.download,t.apply(i),t.apply(o.default),"modelfree"===t.mode?t.nav.append({name:"load-data",onClick:function(){return(0,a.createElement)("input",{type:"file",accept:"application/json,.json",onchange:function(e){return t.loadDataFromEvent(e)}}).click()},content:'text:"Load data"'}):(t.nav.append({name:"index-page",when:function(){return t.pageId!==t.defaultPageId},onClick:function(){return t.setPage(t.defaultPageId)},content:'text:"Index"'}),t.nav.append({name:"report-page",when:function(){return t.pageId!==t.reportPageId},onClick:function(){return t.setPage(t.reportPageId)},content:'text:"Make report"'}),t.nav.menu.append({name:"download",when:function(){return t.download},data:'{text:"Download report",href:"'.concat(t.download,'"}')}),t.nav.menu.append({name:"drop-cache",when:function(){return t.options.cache},onClick:function(){return fetch("drop-cache").then((function(){return location.reload()}))},content:'text:"Reload with no cache"'}),t.nav.menu.append({name:"switch-model",when:function(){return"multi"===t.mode},onClick:function(){return location.href=".."},content:'text:"Switch model"'})),t}return t=c,(n=[{key:"setData",value:function(e,t){var n=this,r=y(k(c.prototype),"setData",this).call(this,e,t);return"modelfree"===this.mode&&r.then((function(){n.defaultPageId=n.reportPageId,n.setPageHash(n.pageHash,!0)})),r}},{key:"loadDataFromEvent",value:function(e){var t=this,n=e.dataTransfer||e.target,r=n&&n.files&&n.files[0];if(e.stopPropagation(),e.preventDefault(),"application/json"===r.type){var i=new FileReader;i.onload=function(e){var n=JSON.parse(e.target.result);t.setData(n,{name:"Discover file: ".concat(r.name),createdAt:new Date,data:n})},i.readAsText(r)}}},{key:"loadDataFromUrl",value:(l=g((function*(e,t){var n,r,i=this,o=this.dom.loadingOverlay,a="string"==typeof e?void 0:e,l=Date.now(),u=function(e){return o.querySelector(".title").textContent=e},c=function(e){return o.style.setProperty("--progress",e)},f=(n=g((function*(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){};try{return u(e+"..."),yield new Promise(requestAnimationFrame),c(t),yield n()}finally{console.log("[Discovery] ".concat(e," in ").concat(p.time(),"ms")),yield new Promise(requestAnimationFrame)}})),function(e,t){return n.apply(this,arguments)}),p={start:Date.now(),time:function(){try{return Date.now()-this.start}finally{this.start=Date.now()}}};return o.innerHTML='<div class="title"></div><div class="progress"></div>',o.classList.remove("error","done"),o.classList.add("init"),requestAnimationFrame((function(){return o.classList.remove("init")})),f("Awaiting data",0,(function(){return fetch(a?"data:application/json,{}":e)})).then((function(e){return f("Receiving data",0,(function(){return new Response(new ReadableStream({start:function(t){return g((function*(){for(var n,r,i=Number(e.headers.get("x-file-size1"))||!e.headers.get("content-encoding")&&Number(e.headers.get("x-file-size")),o=e.body.getReader(),a=Date.now(),s=0,l=0,f=Date.now();;){var d=yield o.read(),p=d.done,h=d.value;if(p){c(.9),yield new Promise(requestAnimationFrame),t.close();break}t.enqueue(h),s+=h.length,i?(l=s/i,n=Math.round(100*l)+"%"):(l=.1+Math.min(.9,(Date.now()-a)/2e4),n=(s/1048576).toFixed(1)+"MB"),n!==r&&(1===l||Date.now()-f>50)&&(f=Date.now(),r=n,u("Receiving data (".concat(n,")...")),c(.9*l),yield new Promise(requestAnimationFrame))}}))()}})).text()}))})).then((function(e){return f("Processing data (parse)",.95,(function(){return a||JSON.parse(e)}))})).then((r=g((function*(e){if(console.log("[Discovery] loadDataFromUrl() done in",Date.now()-l),e.error){var n=new Error(e.error);throw n.stack=null,n}var r=t?e[t]:e,a=d(d({name:"Discovery"},t?e:{data:e}),{},{createdAt:t&&e.createdAt?new Date(Date.parse(e.createdAt)):new Date});yield f("Processing data (prepare)",1,(function(){return i.setData(r,a)})),o.classList.add("done")})),function(e){return r.apply(this,arguments)})).catch((function(e){o.classList.add("error"),o.innerHTML=(i.options.cache?'<button class="view-button" onclick="fetch(\'drop-cache\').then(() => location.reload())">Reload with no cache</button>':"")+'<pre><div class="view-alert view-alert-danger">Error loading data</div><div class="view-alert view-alert-danger">'+(0,s.escapeHtml)(e.stack||String(e)).replace(/^Error:\s*(\S+Error:)/,"$1")+"</div></pre>",console.error("[Discovery] Error loading data:",e)}))})),function(e,t){return l.apply(this,arguments)})},{key:"setContainer",value:function(e){var t=this;y(k(c.prototype),"setContainer",this).call(this,e),this.dom.container&&(this.dom.container.append(this.dom.loadingOverlay=(0,a.createElement)("div","loading-overlay done")),"modelfree"===this.options.mode&&(this.dom.container.addEventListener("drop",(function(e){return t.loadDataFromEvent(e)}),!0),this.dom.container.addEventListener("dragover",(function(e){e.stopPropagation(),e.preventDefault()}),!0)))}},{key:"getRenderContext",value:function(){return d(d({},y(k(c.prototype),"getRenderContext",this).call(this)),{},{modelfree:"modelfree"===this.mode})}},{key:"renderPage",value:function(){return document.title=this.getRenderContext().name||document.title,y(k(c.prototype),"renderPage",this).call(this)}}])&&m(t.prototype,n),r&&m(t,r),c}(r.default);n.default=O},{"../core/router.js":14,"../core/utils/dom.js":19,"../core/utils/html.js":20,"../views/index-complex.js":68,"../widget/index.js":121}],9:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r,i=(r=e("./emitter.js"))&&r.__esModule?r:{default:r};function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function a(e){return function(e){if(Array.isArray(e))return s(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return s(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return s(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function l(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function u(e,t){return(u=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function c(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=p(e);if(t){var i=p(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return f(this,n)}}function f(e,t){return!t||"object"!==o(t)&&"function"!=typeof t?d(e):t}function d(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function p(e){return(p=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var h=new WeakMap,g=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&u(e,t)}(o,e);var t,n,r,i=c(o);function o(){var e;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,o),e=i.call(this),h.set(d(e),new Map),e}return t=o,(n=[{key:"define",value:function(e,t){return h.get(this).set(e,t),this.emit("define",e,t),t}},{key:"isDefined",value:function(e){return h.get(this).has(e)}},{key:"get",value:function(e){return h.get(this).get(e)}},{key:"names",get:function(){return a(h.get(this).keys())}},{key:"keys",get:function(){return h.get(this).keys()}},{key:"values",get:function(){return h.get(this).values()}},{key:"entries",get:function(){return h.get(this).entries()}}])&&l(t.prototype,n),r&&l(t,r),o}(i.default);n.default=g},{"./emitter.js":10}],10:[function(e,t,n){"use strict";function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var i=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.listeners=Object.create(null)}var t,n,i;return t=e,(n=[{key:"on",value:function(e,t){return this.listeners[e]={callback:t,next:this.listeners[e]||null},this}},{key:"once",value:function(e,t){return this.on(e,(function n(){for(var r=arguments.length,i=new Array(r),o=0;o<r;o++)i[o]=arguments[o];t.apply(this,i),this.off(e,n)}))}},{key:"off",value:function(e,t){for(var n=this.listeners[e],r=null;n;){if(n.callback===t){n.callback=null,r?r.next=n.next:this.listeners[e]=n.next;break}r=n,n=n.next}return this}},{key:"emit",value:function(e){for(var t=this.listeners[e],n=!1,r=arguments.length,i=new Array(r>1?r-1:0),o=1;o<r;o++)i[o-1]=arguments[o];for(;t;)"function"==typeof t.callback&&t.callback.apply(this,i),n=!0,t=t.next;return n}}])&&r(t.prototype,n),i&&r(t,i),e}();n.default=i},{}],11:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r,i=(r=e("./dict.js"))&&r.__esModule?r:{default:r};function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function s(e,t,n){return(s="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=f(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}function l(e,t){return(l=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function u(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=f(e);if(t){var i=f(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return c(this,n)}}function c(e,t){return!t||"object"!==d(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function f(e){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function d(e){return(d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function p(e){return function(e){if(Array.isArray(e))return m(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||v(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function h(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||v(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function g(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=v(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}function v(e,t){if(e){if("string"==typeof e)return m(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?m(e,t):void 0}}function m(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var y=new Map,b=null;function w(){b=null;var e,t=g(y.entries());try{for(t.s();!(e=t.n()).done;){var n=h(e.value,2),r=n[0],i=n[1];console.groupCollapsed("".concat(r," (").concat(i.length,")")),i.forEach((function(e){var t;return(t=console).warn.apply(t,p(e))})),console.groupEnd()}}catch(e){t.e(e)}finally{t.f()}y.clear()}function x(e){null===b&&0===y.size&&(b=setTimeout(w,1));for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];y.has(e)?y.get(e).push(n):y.set(e,[n])}function k(e,t,n){switch(d(t)){case"function":return t;case"string":return Object.assign((function(e){return e&&Object.hasOwnProperty.call(e,t)?e[t]:void 0}),{getterFromString:"object[".concat(JSON.stringify(t),"]")});default:throw new Error('[Discovery] Bad type "'.concat("undefined"==typeof key?"undefined":d(key),'" for ').concat(n,' in object marker "').concat(e,'" config (must be a string or a function)'))}}function O(e,t,n,r){return t&&hasOwnProperty.call(t,n)?k(e,t[n],'"'.concat(n,'" option')):r}function j(e,t,n){return(Array.isArray(t[n])?t[n]:[]).map((function(t){return k(e,t,'"'.concat(n,'" option'))}))}var S=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&l(e,t)}(c,e);var t,n,r,i=u(c);function c(){return o(this,c),i.apply(this,arguments)}return t=c,(n=[{key:"define",value:function(e,t){if(!this.isDefined(e)){var n=j(e,t=t||{},"refs"),r=j(e,t,"lookupRefs"),i="string"==typeof t.page?t.page:null,o=O(e,t,"ref",null),a=O(e,t,"title",o||function(){return null});return s(f(c.prototype),"define",this).call(this,e,function(e){var t=e.name,n=e.indexRefs,r=e.lookupRefs,i=e.page,o=e.getRef,a=e.getTitle;i&&(null!==o?n.unshift(o):console.warn('Option "ref" for "'.concat(t,'" marker must be specified when "page" options is defined ("page" option ignored)'))),n.length>0&&r.unshift((function(e){return e}));var s=new Set,l=new Map,u=new Map,c=new WeakMap;return{page:null!==o?i:null,mark:function(e){if(null!==e&&"object"===d(e)){s.add(e);var r,i=g(n);try{for(i.s();!(r=i.n()).done;){var o=r.value,a=o(e),u=null===a?"null":d(a);if("object"===u||"string"===u||"number"===u){if(!l.has(a)){l.set(a,e);continue}l.get(a)!==e&&x('The same reference value used for different objects for "'.concat(t,'" marker'),'Reference value "'.concat(a,'"'),{refGetter:o.getterFromString||o,ref:a,currentObject:l.get(a),newObject:e})}}}catch(e){i.e(e)}finally{i.f()}}else console.warn('Invalid value used for "'.concat(t,'" marker (should be an object)'))},lookup:function(e){var n=null===e?"null":d(e);if("object"!==n&&"string"!==n&&"number"!==n)return null;if(u.has(e))return u.get(e);if(c.has(e))return c.get(e);var f=null,p=null;if(s.has(e))p=e;else{var h,v=g(r);try{for(v.s();!(h=v.n()).done;){var m=(0,h.value)(e);if(l.has(m)){p=l.get(m);break}}}catch(e){v.e(e)}finally{v.f()}}if(null!==p){if(u.has(p))f=u.get(p);else{var y=null!==o?o(p):null;f=Object.freeze({type:t,object:p,ref:y,title:a(p),href:null!==i&&null!==y?"#".concat(encodeURIComponent(i),":").concat(encodeURIComponent(y)):null}),u.set(p,f)}e!==p&&("object"!==d(e)?u.set(e,f):c.set(e,f))}return f}}}({name:e,indexRefs:n,lookupRefs:r,page:i,getRef:o,getTitle:a}))}console.error('[Discovery] Object marker "'.concat(e,'" is already defined, new definition ignored'))}},{key:"lookup",value:function(e,t){if(t)return this.get(t).lookup(e);var n,r=g(this.values);try{for(r.s();!(n=r.n()).done;){var i=n.value.lookup,o=i(e);if(null!==o)return o}}catch(e){r.e(e)}finally{r.f()}return null}},{key:"resolveAll",value:function(e){var t,n=[],r=g(this.values);try{for(r.s();!(t=r.n()).done;){var i=(0,t.value.lookup)(e);null!==i&&n.push(i)}}catch(e){r.e(e)}finally{r.f()}return null}}])&&a(t.prototype,n),r&&a(t,r),c}(i.default);n.default=S},{"./dict.js":9}],12:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r,i=(r=e("./dict.js"))&&r.__esModule?r:{default:r};function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function u(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t,n){return(c="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=h(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function d(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=h(e);if(t){var i=h(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return p(this,n)}}function p(e,t){return!t||"object"!==o(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function h(e){return(h=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var g={name:"not-found",render:function(e,t){var n=t.name;e.style.cssText="color:#a00",e.innerText="Page `".concat(n,"` not found")}},v=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(o,e);var t,n,r,i=d(o);function o(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,o),(t=i.call(this)).view=e,t.lastPage=null,t.lastPageId=null,t}return t=o,(n=[{key:"define",value:function(e,t,n){var r=this;c(h(o.prototype),"define",this).call(this,e,Object.freeze({name:e,render:"function"==typeof t?t.bind(this.view):function(e,n,i){return r.view.render(e,t,n,i)},options:Object.freeze(s({},n))}))}},{key:"render",value:function(e,t,n,r){var i,o=Date.now(),a=this.get(t);a||(a=this.get("not-found")||g,n={name:t});var s=a.options||{},l=s.reuseEl,u=s.init,c=s.keepScrollOffset,f=void 0===c||c,d=this.lastPage!==t,p=r&&r.id,h=this.lastPageId!==p,v=l&&!d?e:document.createElement("article"),m=e.parentNode;this.lastPage=t,this.lastPageId=p,v.id=e.id,v.classList.add("page","page-"+t),d&&"function"==typeof u&&u(v);try{i=a.render(v,n,r)}catch(e){i=this.view.render(v,"alert-danger",String(e)+" (see details in console)"),console.error(e)}return v!==e&&m.replaceChild(v,e),(d||h||!f)&&(m.scrollTop=0),{pageEl:v,renderState:Promise.resolve(i).then((function(){return console.log("[Discovery] Page `"+a.name+"` rendered in "+(Date.now()-o)+"ms")}))}}}])&&u(t.prototype,n),r&&u(t,r),o}(i.default);n.default=v},{"./dict.js":9}],13:[function(e,t,n){"use strict";var r;function i(e){return(i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function a(e,t,n){return(a="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=c(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function l(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=c(e);if(t){var i=c(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return u(this,n)}}function u(e,t){return!t||"object"!==i(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function c(e){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var f=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}(u,e);var t,n,r,i=l(u);function u(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,u),(t=i.call(this)).view=e,t}return t=u,(n=[{key:"define",value:function(e,t){var n=this;t=JSON.parse(JSON.stringify(t)),a(c(u.prototype),"define",this).call(this,e,Object.freeze({name:e,render:function(e,r,i,o){return n.view.render(e,t,i,o)},config:t}))}},{key:"render",value:function(e,t,n,r){var i=this.get(t);if(!i){var o="Preset `"+t+"` is not found";console.error(o,t);var a=e.appendChild(document.createElement("div"));return a.style.cssText="color:#a00;border:1px dashed #a00;font-size:12px;padding:4px",a.innerText=o,Promise.resolve()}return i.render(e,null,n,r)}}])&&o(t.prototype,n),r&&o(t,r),u}(((r=e("./dict.js"))&&r.__esModule?r:{default:r}).default);n.default=f},{"./dict.js":9}],14:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.setPageHash(location.hash),e.cancelScheduledRender(),window.addEventListener("hashchange",(function(){return e.setPageHash(location.hash)}),!1),e.on("pageHashChange",(function(t){var n=e.pageHash||"#";("#"!==n||location.hash)&&(t?location.replace(n):location.hash=n)}))}},{}],15:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.encode=function(e){var t="";Array.isArray(e)||(e=function(e){e=function(e){for(var t="",n=0;n<e.length;n++){var i=e.charCodeAt(n);t+=i<128?r[i]:i<2048?r[i>>6|192]+r[63&i|128]:r[i>>12|224]+r[i>>6&63|128]+r[63&i|128]}return t}(e);for(var t=new Array(e.length),n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}(e));for(var n=0;n<e.length;){var o=e[n++],a=e[n++],s=e[n++],l=(3&o)<<4|a>>4,u=(15&a)<<2|s>>6,c=63&s;null==a?u=c=64:null==s&&(c=64),t+=i[o>>2]+i[l]+i[u]+i[c]}return t},n.decode=function(e){var t,n,i,a,s=[];e=e.replace(/[^a-zA-Z0-9\+\/]/g,"");for(var l=0;l<e.length;){t=o[e.charAt(l++)],n=o[e.charAt(l++)],i=o[e.charAt(l++)],a=o[e.charAt(l++)];var u=t<<2|n>>4,c=(15&n)<<4|i>>2,f=(3&i)<<6|a;s.push(u,c,f)}null!=i&&64!=i||s.pop();null!=a&&64!=a||s.pop();return function(e){return function(e){for(var t="",n=0;n<e.length;){var r=e.charCodeAt(n++);if(r<128)t+=String.fromCharCode(r);else{var i=e.charCodeAt(n++);if(32&r){var o=e.charCodeAt(n++);t+=String.fromCharCode((15&r)<<12|(63&i)<<6|63&o)}else t+=String.fromCharCode((31&r)<<6|63&i)}}return t}(e.map((function(e){return r[e]})).join(""))}(s)};for(var r=[],i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split(""),o=i.reduce((function(e,t,n){return e[t]=n,e}),{}),a=0;a<255;a++)r[a]=String.fromCharCode(a)},{}],16:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.equal=function(e,t){if(e===t)return!0;for(var n in e)if(r.call(e,n)&&(!r.call(t,n)||e[n]!==t[n]))return!1;for(var i in t)if(r.call(t,i)&&(!r.call(e,i)||e[i]!==t[i]))return!1;return!0},n.fuzzyStringCompare=function(e,t){var n=i(e,0),r=i(e,e.length-1);return-1!==t.toLowerCase().indexOf(e.toLowerCase().substring(n,e.length-r),i(t,0))};var r=Object.hasOwnProperty;function i(e,t){var n=e.charCodeAt(t);return 34===n||39===n?1:0}},{}],17:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){navigator.clipboard?navigator.clipboard.writeText(e):function(e){var t=window.getSelection(),n=document.createRange();document.body.appendChild(r),r.firstChild.nodeValue=e,n.selectNodeContents(r),t.removeAllRanges(),t.addRange(n);try{document.execCommand("copy")}catch(e){console.error(e)}t.removeAllRanges(),r.remove()}(e)};var r=(0,e("./dom.js").createElement)("div",{style:["position: fixed","overflow: hidden","font-size: 1px","width: 1px","height: 1px","top: 0","left: 0","white-space: pre"].join(";")},["text"])},{"./dom.js":19}],18:[function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var i=function(e,t){if("number"==typeof t&&(t={wait:t}),i=r(n=t),null==n||"object"!==i&&"function"!==i)return e;var n,i,o,a,s,l,u,c,f,d,p=t.wait,h=0,g=!0;if("function"!=typeof e)throw new TypeError("Expected a function");function v(t){var n=o,r=a;return o=a=void 0,h=t,l=e.apply(r,n)}function m(e,t){return setTimeout(e,t)}function y(e){return h=e,u=m(w,p),f?v(e):l}function b(e){var t=e-c;return void 0===c||t>=p||t<0||d&&e-h>=s}function w(){var e=Date.now();if(b(e))return x(e);u=m(w,function(e){var t=e-h,n=p-(e-c);return d?Math.min(n,s-t):n}(e))}function x(e){return u=void 0,g&&o?v(e):(o=a=void 0,l)}function k(){for(var e=Date.now(),t=b(e),n=arguments.length,r=new Array(n),i=0;i<n;i++)r[i]=arguments[i];if(o=r,a=this,c=e,t){if(void 0===u)return y(c);if(d)return u=m(w,p),v(c)}return void 0===u&&(u=m(w,p)),l}return p=Number(p)||0,f=Boolean(t.leading),s=(d="maxWait"in t)?Math.max(Number(t.maxWait)||0,p):s,g="trailing"in t?Boolean(t.trailing):g,k.cancel=function(){void 0!==u&&clearTimeout(u),h=0,o=c=a=u=void 0},k.flush=function(){return void 0===u?l:x(Date.now())},k.pending=function(){return void 0!==u},k};n.default=i},{}],19:[function(e,t,n){"use strict";function r(e){return document.createTextNode(String(e))}Object.defineProperty(n,"__esModule",{value:!0}),n.createElement=function(e,t,n){var i=document.createElement(e);"string"==typeof t&&(t={class:t});for(var o in t)if(hasOwnProperty.call(t,o)){if(void 0===t[o])continue;o.startsWith("on")?i.addEventListener(o.substr(2),t[o]):i.setAttribute(o,t[o])}Array.isArray(n)?n.forEach((function(e){return i.appendChild(e instanceof Node?e:r(e))})):"string"==typeof n&&(i.innerHTML=n);return i},n.createText=r,n.createFragment=function(){for(var e=document.createDocumentFragment(),t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];return n.forEach((function(t){return e.appendChild(t instanceof Node?t:r(t))})),e}},{}],20:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.escapeHtml=function(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}},{}],21:[function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var i=p(e("./base64.js")),o=p(e("./compare.js")),a=f(e("./copy-text.js")),s=p(e("./dom.js")),l=p(e("./html.js")),u=p(e("./layout.js")),c=f(e("./safe-filter-rx.js"));function f(e){return e&&e.__esModule?e:{default:e}}function d(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return d=function(){return e},e}function p(e){if(e&&e.__esModule)return e;if(null===e||"object"!==r(e)&&"function"!=typeof e)return{default:e};var t=d();if(t&&t.has(e))return t.get(e);var n={},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var a=i?Object.getOwnPropertyDescriptor(e,o):null;a&&(a.get||a.set)?Object.defineProperty(n,o,a):n[o]=e[o]}return n.default=e,t&&t.set(e,n),n}function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function g(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach((function(t){v(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function v(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var m=g(g(g(g(g({base64:i},o),{},{copyText:a.default},s),l),u),{},{safeFilterRx:c.default});n.default=m},{"./base64.js":15,"./compare.js":16,"./copy-text.js":17,"./dom.js":19,"./html.js":20,"./layout.js":23,"./safe-filter-rx.js":24}],22:[function(e,t,n){"use strict";var r;function i(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return o(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}Object.defineProperty(n,"__esModule",{value:!0}),n.jsonStringifyAsJavaScript=function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:4,r=[],i=function(e,t){return"string"==typeof t&&"[object Date]"===l.call(this[e])&&(t=this[e]),null!==t&&u.has(l.call(t))?(r.push(t),"{{{__placeholder__}}}"):t};return String(JSON.stringify(e,t||i,n)).replace(/"((?:\\.|[^"])*)"(:?)/g,(function(e,t,n){return n&&/^[a-z$_][a-z$_\d]*$/i.test(t)?t+n:"'".concat(t.replace(/\\"/g,'"').replace(/'/g,"\\'"),"'")+n})).replace(/(^|\n)([ \t]*)(.*?)([a-zA-Z$_][a-zA-Z0-9$_]+:\s*)?'{{{__placeholder__}}}'/g,(function(e,t,n,i,o){return t+n+i+s(r.shift(),n,o)}))},n.jsonStringifyInfo=void 0;var a=((r=e("/gen/@discoveryjs/json-ext.js"))&&r.__esModule?r:{default:r}).default.stringifyInfo;function s(e,t,n){return"function"==typeof e?function(e,t,n){var r=String(e),o=i(r.match(/^(?:\S+\s+)?(\S+)\(/)||[],2),a=o[0],s=o[1];if("function"!==a&&"function*"!==a&&s===n.trim().slice(0,-1)&&(n=""),-1===r.indexOf("\n"))return n+r;var l=r.split(/\n/),u=l[l.length-1].match(/^\s*/)[0].length,c=new RegExp("^\\s{0,"+u+"}");return n+l.map((function(e,n){return n&&e.length?e.replace(c,t):e})).join("\n")}(e,t,n):e instanceof Date?"".concat(n,'new Date("').concat(e.toISOString(),'")'):n+String(e)}n.jsonStringifyInfo=a;var l=Object.prototype.toString,u=new Set(["[object Function]","[object RegExp]","[object Date]"])},{"/gen/@discoveryjs/json-ext.js":1}],23:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.getOffsetParent=function(e){var t=e.offsetParent||r;for(;t&&t!==r&&"static"==getComputedStyle(t).position;)t=t.offsetParent;return t||r},n.getPageOffset=o,n.getBoundingRect=a,n.getViewportRect=function(e,t){var n,r,s=i?document.documentElement:document.body,l=e!==s||t?a(e,t):o(),u=l.top,c=l.left;e&&e!==window?(u+=e.clientTop,c+=e.clientLeft,n=e.clientWidth,r=e.clientHeight):(n=window.innerWidth||0,r=window.innerHeight||0);return{top:u,left:c,right:c+n,bottom:u+r,width:n,height:r}};var r=document.documentElement,i="CSS1Compat"===document.compatMode;function o(e){var t=0,n=0;if(e&&e.getBoundingClientRect){var o=e.getBoundingClientRect();t=-o.top,n=-o.left}else if(i)t=window.pageYOffset||r.scrollTop,n=window.pageXOffset||r.scrollLeft;else{var a=document.body;e!==a&&(t=a.scrollTop-a.clientTop,n=a.scrollLeft-a.clientLeft)}return{left:n,top:t}}function a(e,t){var n=o(t),r=0,i=0,a=0,s=0;if(e&&e.getBoundingClientRect){var l=e.getBoundingClientRect();r=l.top,i=l.left,a=l.right,s=l.bottom}return{top:r+n.top,left:i+n.left,right:a+n.left,bottom:s+n.top,width:a-i,height:s-r}}},{}],24:[function(e,t,n){"use strict";function r(e,t){try{return new RegExp("((?:"+e+")+)",t)}catch(e){}return new RegExp("((?:"+e.replace(/[\[\]\(\)\?\+\*\{\}\\]/g,"\\$&")+")+)",t)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"i",n=r(e,t);return n.rawSource=e,n}},{}],25:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r,i=(r=e("./dict.js"))&&r.__esModule?r:{default:r};function o(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||y(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function u(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t,n){return(c="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=g(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function d(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=g(e);if(t){var i=g(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return p(this,n)}}function p(e,t){return!t||"object"!==v(t)&&"function"!=typeof t?h(e):t}function h(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function g(e){return(g=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function v(e){return(v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function m(e){return function(e){if(Array.isArray(e))return b(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||y(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function y(e,t){if(e){if("string"==typeof e)return b(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?b(e,t):void 0}}function b(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var w=Object.freeze({});function x(e,t,n,r,i){return!Object.hasOwnProperty.call(n,e)||void 0===n[e]||t.queryBool(!0===n[e]?"":n[e],r,i)}function k(e,t,n,r,i){var o=e.options.tag,a=!1===o||null===o?document.createDocumentFragment():document.createElement(o||"div"),s=Promise.resolve(e.render(a,n,r,i));return"function"==typeof n.postRender&&(s=s.then((function(){return n.postRender(a,n,r,i)}))),s.then((function(){if(a.classList&&(e.name&&a.classList.add("view-".concat(e.name)),n.className)){var o,s=n.className;if("string"==typeof s)a.classList.add(s);else Array.isArray(s)||(s=[s]),(o=a.classList).add.apply(o,m(s.map((function(e){return"function"==typeof e?e(r,i):e})).filter(Boolean)))}t.replaceWith(a)}))}function O(e,t,n,r){var i=this;if(Array.isArray(t))return Promise.all(t.map((function(t){return O.call(i,e,t,n,r)})));var o=null;switch(v(t.view)){case"function":o={render:t.view,name:!1,options:w};break;case"string":if("render"===t.view){var a=t,s=a.config,l=void 0===s?"":s,u=a.context,c=void 0===u?"":u;o={render:function(e,t,o){var a=""!==l?i.host.query(l,n,r):o,s=i.host.query(c,r,n);return i.render(e,a,o!==a?o:n,s)},name:!1,options:{tag:!1}}}else if(t.view.startsWith("preset/")){var f=t.view.substr(7);if(!this.host.preset.isDefined(f))return this.host.preset.render(e,f,n,r);o={render:this.host.preset.get(f).render,name:!1,options:{tag:!1}}}else o=this.get(t.view)}if(!o){var d="string"==typeof t.view?"View `"+t.view+"` is not found":"Render is not a function";console.error(d,t),o=this.get("config-error")||this.defaultConfigErrorRenderer,t={reason:d,config:t}}if(e||(e=document.createDocumentFragment()),"when"in t==!1||x("when",this.host,t,n,r)){var p=e.appendChild(document.createComment(""));return Promise.resolve("data"in t?this.host.query(t.data,n,r):n).then((function(e){return x("whenData",i.host,t,e,r)?k(o,p,t,e,r):p.remove()})).catch((function(e){k(i.get("alert-danger"),p,{postRender:function(e){e.style.whiteSpace="pre-wrap",e.style.fontFamily="monospace",e.style.fontSize="12px"}},e),console.error(e)}))}return Promise.resolve()}var j=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(a,e);var t,n,r,i=d(a);function a(e){var t,n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),(t=i.call(this)).host=e,t.defaultConfigErrorRenderer=(n=h(t),{name:"config-error",render:function(e,t){if(e.className="buildin-view-config-error",e.textContent=t.reason,"config"in t){var r=e.appendChild(document.createElement("span"));r.className="show-config",r.textContent="show config...",r.addEventListener("click",(function(){r.remove();var i=document.createDocumentFragment();n.render(i,{view:"struct",expanded:1},t.config).then((function(){e.appendChild(i),e.classList.add("expanded")}))}))}},options:w}),t}return t=a,(n=[{key:"define",value:function(e,t,n){var r=this;c(g(a.prototype),"define",this).call(this,e,Object.freeze({name:e,render:"function"==typeof t?t.bind(this):function(e,n,i,o){return r.render(e,t,i,o)},options:Object.freeze(s({},n))}))}},{key:"normalizeConfig",value:function(e){var t=this;if(!e)return null;if(Array.isArray(e))return e.reduce((function(e,n){return e.concat(t.normalizeConfig(n)||[])}),[]);if("string"==typeof e){var n=o(e.match(/^(\S+?):((?:.|\s)+)$/)||[],3),r=n[1],i=n[2];e=r?{view:r,data:i}:{view:e}}else"function"==typeof e&&(e={view:e});return e}},{key:"ensureValidConfig",value:function(e){var t=this;return Array.isArray(e)?e.map((function(e){return t.ensureValidConfig(e)})):e&&e.view?e:{view:this.defaultConfigErrorRenderer.render,reason:e?"Option `view` is missed":"Config is not a valid value",config:e}}},{key:"composeConfig",value:function(e,t){return e=this.normalizeConfig(e),t=this.normalizeConfig(t),e&&t?Array.isArray(e)?e.map((function(e){return s(s({},e),t)})):s(s({},e),t):e||t}},{key:"render",value:function(e,t,n,r){return O.call(this,e,this.ensureValidConfig(this.normalizeConfig(t)),n,r)}},{key:"listLimit",value:function(e,t){return!1!==e&&(!e||isNaN(e)?t:Math.max(parseInt(e,10),0)||t)}},{key:"renderList",value:function(e,t,n,r){var i=this,o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,a=arguments.length>5&&void 0!==arguments[5]&&arguments[5],l=arguments.length>6?arguments[6]:void 0;!1===a&&(a=n.length);var u=Promise.all(n.slice(o,o+a).map((function(a,l,u){return i.render(e,t,a,s(s({},r),{},{index:o+l,array:n,sliceIndex:l,slice:u}))})));return this.maybeMoreButtons(l||e,null,n.length,o+a,a,(function(o,a){return i.renderList(e,t,n,r,o,a,l)})),u}},{key:"maybeMoreButtons",value:function(e,t,n,r,i,o){var a=n-r,s=a<=0?null:document.createElement("span");return a>i&&this.renderMoreButton(s,"Show "+i+" more...",(function(){return o(r,i)})),a>0&&this.renderMoreButton(s,"Show all the rest "+a+" items...",(function(){return o(r,1/0)})),null!==s&&(s.className="more-buttons",e.insertBefore(s,t)),s}},{key:"renderMoreButton",value:function(e,t,n){var r=document.createElement("button");r.className="more-button",r.innerHTML=t,r.addEventListener("click",(function(){e.remove(),n()})),e.appendChild(r)}}])&&u(t.prototype,n),r&&u(t,r),a}(i.default);n.default=j},{"./dict.js":9}],26:[function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"Widget",{enumerable:!0,get:function(){return i.default}}),Object.defineProperty(n,"App",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(n,"router",{enumerable:!0,get:function(){return u.default}}),Object.defineProperty(n,"utils",{enumerable:!0,get:function(){return c.default}}),n.pages=n.complexViews=n.views=void 0;var i=p(e("./widget/index.js")),o=p(e("./app/index.js")),a=d(e("./views/index.js"));n.views=a;var s=d(e("./views/index-complex.js"));n.complexViews=s;var l=d(e("./pages/index.js"));n.pages=l;var u=p(e("./core/router.js")),c=p(e("./core/utils/index.js"));function f(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return f=function(){return e},e}function d(e){if(e&&e.__esModule)return e;if(null===e||"object"!==r(e)&&"function"!=typeof e)return{default:e};var t=f();if(t&&t.has(e))return t.get(e);var n={},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var a=i?Object.getOwnPropertyDescriptor(e,o):null;a&&(a.get||a.set)?Object.defineProperty(n,o,a):n[o]=e[o]}return n.default=e,t&&t.set(e,n),n}function p(e){return e&&e.__esModule?e:{default:e}}},{"./app/index.js":8,"./core/router.js":14,"./core/utils/index.js":21,"./pages/index.js":28,"./views/index-complex.js":68,"./views/index.js":69,"./widget/index.js":121}],27:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.page.define("default",{view:"switch",content:[{when:"#.modelfree",content:[{view:"h1",className:"modelfree",content:['text:"Discovery "','badge:{ text: "model free mode" }']},'html:"<p>Running in <b>model free mode</b>, because no config or no models is set up. Please, read <a href=\\"https://github.com/discoveryjs/discovery/blob/master/README.md\\" href=\\"_blank\\">documention</a> to learn how to set up models."','html:"<p>In this mode you can load a data (JSON), via a button in top right corner or via dropping a file on the page.</p>"']},{content:["h1:#.name",{view:"struct",expanded:1}]}]})}},{}],28:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"default",{enumerable:!0,get:function(){return r.default}}),Object.defineProperty(n,"notFound",{enumerable:!0,get:function(){return i.default}}),Object.defineProperty(n,"report",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(n,"viewsShowcase",{enumerable:!0,get:function(){return a.default}});var r=s(e("./default.js")),i=s(e("./not-found.js")),o=s(e("./report.js")),a=s(e("./views-showcase.js"));function s(e){return e&&e.__esModule?e:{default:e}}},{"./default.js":27,"./not-found.js":29,"./report.js":30,"./views-showcase.js":35}],29:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.page.define("not-found",['alert-warning:"Page `" + name + "` not found"'])}},{}],30:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(t,n){return e.setPageParams(c(c({},e.pageParams),t),n)}var n=(0,o.default)(e,t),l=(0,a.default)(e,t),u=(0,s.default)(e,t),f=(0,r.createElement)("div",{class:"report-editor",hidden:!0},[l.el,u.el]),d=(0,r.createElement)("div","report-content"),p=[n.el,f,d];e.page.define("report",(function(e,t,r){f.hidden=r.params.noedit,n.render(t,r);var i=l.perform(t,r);if(i.error)return u.el.hidden=!0,void(d.hidden=!0);u.el.hidden=!1,d.hidden=!1,u.render(i.data,r,d)}),{reuseEl:!0,init:function(e){p.forEach((function(t){return e.appendChild(t)}))},encodeParams:i.encodeParams,decodeParams:i.decodeParams})};var r=e("../core/utils/dom.js"),i=e("./report/params.js"),o=l(e("./report/header.js")),a=l(e("./report/editor-query.js")),s=l(e("./report/editor-view.js"));function l(e){return e&&e.__esModule?e:{default:e}}function u(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?u(Object(n),!0).forEach((function(t){f(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function f(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},{"../core/utils/dom.js":19,"./report/editor-query.js":31,"./report/editor-view.js":32,"./report/header.js":33,"./report/params.js":34}],31:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e,t){var n,o,a=!1,l={},u=new e.view.QueryEditor((function(t,n){return e.querySuggestions(t,n,e.data,e.context)})).on("change",(function(e){return n.checked&&t({query:e},!0)})),c=e.getQueryEngineInfo(),f=(0,r.createElement)("div","buttons"),d=(0,r.createElement)("div","data-query-result"),p=(0,r.createElement)("div","form query-editor-form",[(0,r.createElement)("div","query-editor",[u.el,(0,r.createElement)("div","editor-toolbar",[(0,r.createElement)("span","syntax-hint",'Use <a class="view-link" href="'.concat(c.link,'" target="_blank">').concat(c.name,"</a> ").concat(c.version||""," syntax for queries")),(0,r.createElement)("label",null,[n=(0,r.createElement)("input",{class:"live-update",type:"checkbox",checked:!0,onchange:function(e){e.target.checked&&t({query:u.getValue()},!0)}})," process on input"]),f])]),d]);return e.view.render(f,{view:"button-primary",content:'text:"Process"',onClick:function(){l={},t({query:u.getValue()},!0),e.scheduleRender("page")}}),{el:p,perform:function(t,n){var c,f,p=n.params.query;if(u.setValue(p),l.query===p&&l.data===t&&l.context===n)f=l.results;else{o&&(o.clear(),o=null);try{c=Date.now(),f=e.query(p,t,n),c=Date.now()-c}catch(e){var h=e.details&&e.details.loc,g=u.cm.doc;return h&&(o="EOF"===e.details.token?g.setBookmark(g.posFromIndex(e.details.loc.range[0]),{widget:(0,r.createElement)("span","discovery-editor-error"," ")}):g.markText(g.posFromIndex(e.details.loc.range[0]),g.posFromIndex(e.details.loc.range[1]),{className:"discovery-editor-error"})),l={},d.innerHTML='<div class="report-error query-error">'+(0,i.escapeHtml)(e.message)+"</div>",{error:e}}l={data:t,query:p,context:n,results:f},d.innerHTML="",e.view.render(d,{view:"expand",title:'text:"'.concat(s(f)," in ").concat(parseInt(c,10),'ms"'),expanded:a,onToggle:function(e){return a=e},content:{view:"struct",expanded:1}},f)}return{data:f}}}};var r=e("../../core/utils/dom.js"),i=e("../../core/utils/html.js");function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function a(e,t,n){return e.length?"".concat(e.length," ").concat(1===e.length?t:n):"empty"}function s(e){return Array.isArray(e)?"Array (".concat(a(e,"element","elements"),")"):e&&"object"===o(e)?"Object (".concat(a(Object.keys(e),"key","keys"),")"):"Scalar (".concat(null===e?"null":o(e),")")}},{"../../core/utils/dom.js":19,"../../core/utils/html.js":20}],32:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e,t){var n,r,c,f,h,g,v={},m=Array.isArray(e.options.viewPresets)?p.concat(e.options.viewPresets):p,y=new e.view.ViewEditor(e).on("change",(function(e){return g.checked&&t({view:e},!0)})),b=(0,i.createElement)("div","buttons"),w=(0,i.createElement)("div","form view-editor-form",[(0,i.createElement)("div","report-editor-tabs view-mode",h=["Default","Custom"].map((function(e){return(0,i.createElement)("div",{class:"report-editor-tab","data-mode":e.toLowerCase(),onclick:function(){return t({view:"Default"===e?void 0:d},!0)}},e)}))),(0,i.createElement)("div","report-editor-tabs presets",m.map((function(e){return function(e,t,n){return(0,i.createElement)("div",{class:"report-editor-tab",onclick:function(){return n({view:t})}},e||"Untitled preset")}(e.name,e.content,t)}))),n=(0,i.createElement)("div",{class:"view-editor-form-content",hidden:!0},[(0,i.createElement)("button",{class:"view-button formatting",title:"Prettify (input should be a JSON)",onclick:function(){y.focus();try{var e=y.getValue().trim(),n=new Function("return 0,"+e)();t({view:(0,a.jsonStringifyAsJavaScript)(n)})}catch(e){console.error("[Discovery] Prettify failed",e)}}}),y.el,(0,i.createElement)("div","editor-toolbar",[r=(0,i.createElement)("div","view-expand",[(0,i.createElement)("div",{class:"header",onclick:function(){r.classList.toggle("expanded"),f.classList.toggle("visible")}},[c=(0,i.createElement)("div","Available views:"),(0,i.createElement)("div","trigger")]),f=(0,i.createElement)("div","view-editor-view-list")]),(0,i.createElement)("label",null,[g=(0,i.createElement)("input",{class:"live-update",type:"checkbox",checked:!0,onchange:function(e){e.target.checked&&t({view:y.getValue()},!0)}})," build on input"]),b])])]);e.view.render(b,{view:"button-primary",content:'text:"Build"',onClick:function(){v={},t({view:y.getValue()},!0),e.scheduleRender("page")}}),new e.view.Popup({className:"view-editor-view-list-hint",hoverTriggers:".view-editor-view-list .item.with-usage",render:function(t,n){e.view.render(t,(0,s.default)(e),e.view.get(n.textContent),{})}}),c.textContent="Available ".concat(u(e.view.entries).filter((function(e){return l(e,2)[1].options.usage})).length," views");var x=function(){return f.innerHTML='<a href="#views-showcase" class="view-link">Views showcase</a><br><br>'+u(e.view.entries).sort().map((function(e){var t=l(e,2),n=t[0],r=t[1];return'<div><a class="item view-link'.concat(r.options.usage?" with-usage":"",'" ').concat(r.options.usage?'href="#views-showcase:'+n+'"':"",">").concat(n,"</a></div>")})).join("")};return x(),e.view.on("define",x),{el:w,render:function(t,r,i){var a="string"==typeof r.params.view?"custom":"default",s=r.params.view,l=null;if(y.setValue(s),n.hidden="custom"!==a,h.forEach((function(e){return e.classList.toggle("active",e.dataset.mode===a)})),s||"default"!==a||(s=d),v.data!==t||v.view!==s){i.innerHTML="";try{l=Function("return "+(s?"0,"+s:"null"))(),e.view.render(i,l,t,r)}catch(t){e.view.render(i,(function(e){e.className="report-error render-error",e.innerHTML=(0,o.escapeHtml)(String(t))+"<br>(see details in console)",console.error(t)}))}v={data:t,view:s}}}}},n.defaultViewSource=void 0;var r,i=e("../../core/utils/dom.js"),o=e("../../core/utils/html.js"),a=e("../../core/utils/json.js"),s=(r=e("../../views/_usage.js"))&&r.__esModule?r:{default:r};function l(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||c(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function u(e){return function(e){if(Array.isArray(e))return f(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||c(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function c(e,t){if(e){if("string"==typeof e)return f(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?f(e,t):void 0}}function f(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var d="{\n    view: 'struct',\n    expanded: 1\n}";n.defaultViewSource=d;var p=[{name:"Table",content:(0,a.jsonStringifyAsJavaScript)({view:"table"})},{name:"Auto-link list",content:(0,a.jsonStringifyAsJavaScript)({view:"ol",item:"auto-link"})},{name:"Signature",content:(0,a.jsonStringifyAsJavaScript)({view:"signature",expanded:2})}]},{"../../core/utils/dom.js":19,"../../core/utils/html.js":20,"../../core/utils/json.js":22,"../../views/_usage.js":36}],33:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e,t){var n,r,a,s,l=new e.view.Popup({render:function(t,n,r){return e.view.render(t,{view:"menu",data:[{text:"Copy link to report",action:function(){return(0,o.default)(location)}},{text:"Copy report as JSON",action:function(){return(0,o.default)((t=e.pageParams,n=function(e){return e.replace(/\\/g,"\\\\").replace(/\t/g,"\\t").replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/'/g,"\\'")},r=t.title,i=t.query,a=t.view,s={title:r,query:i,view:a},"{\n".concat(Object.keys(s).reduce((function(e,t){return e.concat(s[t]?"    ".concat(t,": '").concat(n(s[t]),"'"):[])}),[]).join(",\n"),"\n}")));var t,n,r,i,a,s}}],onClick:function(e){r(),e.action()}})}});return{el:(0,i.createElement)("div","report-header",[(0,i.createElement)("div",{class:"report-header-text","data-title":" "},[n=(0,i.createElement)("input",{placeholder:"Untitled report",oninput:function(e){var n=e.target;return t({title:n.value},!0)},onkeypress:function(e){13!==e.charCode&&13!==e.keyCode||e.target.blur()}}),(0,i.createElement)("span","timestamp",[r=(0,i.createElement)("span",null,"&nbsp;"),a=(0,i.createElement)("span")])]),(0,i.createElement)("div","report-actions",[s=(0,i.createElement)("button",{class:"edit-mode",title:"Toggle edit mode",onclick:function(n){n.target.blur(),t({noedit:!e.pageParams.noedit})}}),(0,i.createElement)("button",{class:"share",title:"Share ...",onclick:function(e){var t=e.target;t.blur(),l.show(t)}}),(0,i.createElement)("button",{class:"toggle-fullscreen",title:"Toggle fullscreen mode",onclick:function(n){n.target.blur(),t({dzen:!e.pageParams.dzen})}})])]),render:function(e,t){var i=t.params,o=i.title,l=i.noedit;n.parentNode.dataset.title=o||n.placeholder,n.value=o,s.classList.toggle("disabled",l),r.innerText=t.createdAt&&"function"==typeof t.createdAt.toLocaleString?"Data collected at "+t.createdAt.toLocaleString().replace(",","")+" | ":"",a.innerText="View built at "+(new Date).toLocaleString().replace(",","")}}};var r,i=e("../../core/utils/dom.js"),o=(r=e("../../core/utils/copy-text.js"))&&r.__esModule?r:{default:r}},{"../../core/utils/copy-text.js":17,"../../core/utils/dom.js":19}],34:[function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(n,"__esModule",{value:!0}),n.encodeParams=function(e){var t=["query","view","title","dzen","noedit"],n="string"==typeof e?{query:e}:e,r=n.query,o=n.view,a=n.title,s=n.dzen,l=n.noedit,u=n.extra,c=[];s&&c.push(["dzen"]);l&&c.push(["noedit"]);a&&c.push(["title",a]);r&&c.push(["q",i.encode(r)]);"string"==typeof o&&c.push(o?["v",i.encode(o)]:["v"]);return Object.keys(u||{}).sort().forEach((function(e){t.includes(e)||c.push([e,u[e]])})),c},n.decodeParams=function(e){var t=Object.fromEntries(e),n=["q","v","title","dzen","noedit"],r={title:t.title||"",query:i.decode(a(t.q,"")),view:"v"in t?i.decode(a(t.v,"")):void 0,dzen:"dzen"in t,noedit:"noedit"in t};return Object.keys(t).forEach((function(e){n.includes(e)||(r[e]=t[e])})),r};var i=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==r(e)&&"function"!=typeof e)return{default:e};var t=o();if(t&&t.has(e))return t.get(e);var n={},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if(Object.prototype.hasOwnProperty.call(e,a)){var s=i?Object.getOwnPropertyDescriptor(e,a):null;s&&(s.get||s.set)?Object.defineProperty(n,a,s):n[a]=e[a]}n.default=e,t&&t.set(e,n);return n}(e("../../core/utils/base64.js"));function o(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return o=function(){return e},e}function a(e,t){return"string"==typeof e?e:t||""}},{"../../core/utils/base64.js":15}],35:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.page.define("views-showcase",{view:"context",data:function(){return function(e){if(Array.isArray(e))return o(e)}(t=e.view.values)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(t)||function(e,t){if(e){if("string"==typeof e)return o(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?o(e,t):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}();var t},modifiers:[{view:"block",className:"sidebar",content:{view:"content-filter",content:{view:"menu",name:"view",limit:!1,data:"\n                            .[name ~= #.filter]\n                            .sort(name asc)\n                            .({ ..., disabled: no options.usage })\n                        ",item:"text-match:{ text: name, match: #.filter }"}}}],content:{view:"block",className:"content",data:"$[=> name=(#.view.name or #.id)]",content:{view:"switch",content:[{when:"no $ and #.id",content:'alert-warning:"View \\"" + #.id + "\\" not found"'},{when:"no $",content:'text:"Select a view"'},{content:[{view:"context",postRender:function(t,n,r,i){e.setPageRef(r.name),e.cancelScheduledRender(),i.id=e.pageRef}},(0,i.default)(e)]}]}}},{sidebar:!1})};var r,i=(r=e("../views/_usage.js"))&&r.__esModule?r:{default:r};function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}},{"../views/_usage.js":36}],36:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t={view:"context",modifiers:[{view:"switch",when:"beforeDemo",content:[{when:function(e){return"string"==typeof e.beforeDemo},content:'html:"<p>" + beforeDemo + "</p>"'},{content:{view:"render",config:"beforeDemo",context:"{}"}}]},{view:"block",className:"usage-render",postRender:function(e,t){return(0,t.onInit)(e,"root")},content:{view:"render",config:"demo or view",context:"{}"}},{view:"switch",when:"afterDemo",content:[{when:function(e){return"string"==typeof e.afterDemo},content:'html:"<p>" + afterDemo + "</p>"'},{content:{view:"render",config:"afterDemo",context:"{}"}}]}],content:{view:"tabs",className:"usage-sources",name:"code",tabs:[{value:"config",text:"Config (JS)"},{value:"config-json",text:"Config (JSON)"},{value:"html",text:"HTML"}],content:{view:"switch",content:[{when:'#.code="config"',content:{view:"source",className:"first-tab",data:function(e){return{syntax:"discovery-view",content:(0,r.jsonStringifyAsJavaScript)(e.demo||e.view)}}}},{when:'#.code="config-json"',content:{view:"source",data:function(e){return{syntax:"json",content:JSON.stringify(e.demo||e.view,null,4)}}}},{when:'#.code="html"',content:{view:"source",data:function(e,t){return{syntax:"html",content:d(t.root)}}}}]}}};return{view:"block",className:"discovery-view-usage",data:function(t){var n,r=t.name,i=t.options,a=(n=e.view.values,function(e){if(Array.isArray(e))return c(e)}(n)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(n)||u(n)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()).filter((function(e){return e.options.usage===i.usage})).map((function(e){return e.name}));return a.includes(r)||a.unshift(r),o(o({demo:{view:r,data:'"'+r+'"'}},"function"==typeof i.usage?i.usage(r,a):Array.isArray(i.usage)?{examples:i.usage}:i.usage),{},{name:r,group:a})},content:["h1:name",t,{view:"list",data:"examples",whenData:!0,itemConfig:{className:"usage-section"},item:["h2:title",t]}]}};var r=e("../core/utils/json.js");function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||u(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=u(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}function u(e,t){if(e){if("string"==typeof e)return c(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?c(e,t):void 0}}function c(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function f(e){return Boolean(e&&e.nodeType===Node.TEXT_NODE)}function d(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"\n",r="",i=l(e.childNodes);try{for(i.s();!(t=i.n()).done;){var o=t.value;f(o)||!o.previousSibling||f(o.previousSibling)||(r+=n),r+=p(o,n)}}catch(e){i.e(e)}finally{i.f()}return r}function p(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"\n";switch(e.nodeType){case Node.ELEMENT_NODE:var n=e.cloneNode().outerHTML.split(/(?=<\/[^>]+>$)/),r=s(n,2),i=r[0],o=r[1],a=void 0===o?"":o;return i+(e.firstChild&&!f(e.firstChild)?t+"  ":"")+d(e,t+"  ")+(e.lastChild&&!f(e.lastChild)?t:"")+a;case Node.TEXT_NODE:return e.nodeValue;case Node.COMMENT_NODE:return"\x3c!--"+e.nodeValue+"--\x3e";case Node.DOCUMENT_FRAGMENT_NODE:return d(e,t)}return""}},{"../core/utils/json.js":22}],37:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(t,n,r,i){var o=n.content,a=void 0===o?"text":o;return t.classList.add("view-alert"),e.view.render(t,a,r,i)}e.view.define("alert",t,{usage:i.default}),e.view.define("alert-success",t,{usage:i.default}),e.view.define("alert-danger",t,{usage:i.default}),e.view.define("alert-warning",t,{usage:i.default})};var r,i=(r=e("./alerts.usage.js"))&&r.__esModule?r:{default:r}},{"./alerts.usage.js":38}],38:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default=function(e,t){return{demo:{view:e,data:'"Alert"'},examples:[{title:"Variations",demo:t.map((function(e){return"".concat(e,':"').concat(e,'"')}))},{title:"Complex content",demo:{view:e,content:['h3:"Some header"','text:"Hello world!"']}}]}}},{}],39:[function(e,t,n){"use strict";function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("auto-link",(function(t,n,r,o){var a=n.content,s=n.fallback,l=n.href;if(r){var u=e.resolveValueLinks(r),c=u?("function"==typeof l?l:function(e){return e})(u[0].href,r,o):null;return c?e.view.render(t,{view:"link",content:a},i(i({},u[0]),{},{href:c}),o):e.view.render(t,s||a||"text",r,o)}}),{tag:!1})}},{}],40:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(t,n,r,i){var a=n.content,s=r||{},l=s.color,u=s.text,c=s.href,f=s.prefix,d=s.postfix;"string"!=typeof r&&"number"!=typeof r&&"boolean"!=typeof r||(u=r),t.style.backgroundColor=l,c&&(t.href=c),o(t,"prefix",f),a?e.view.render(t,a,r,i):t.appendChild(document.createTextNode(String(u))),o(t,"postfix",d)}e.view.define("badge",t,{tag:"a",usage:i.default}),e.view.define("pill-badge",t,{tag:"a",usage:i.default})};var r,i=(r=e("./badges.usage.js"))&&r.__esModule?r:{default:r};function o(e,t,n){if(n){var r=e.appendChild(document.createElement("span"));r.className=t,r.textContent=n}}},{"./badges.usage.js":41}],41:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default=function(e,t){return{demo:{view:e,data:JSON.stringify(e)},examples:[{title:"Variations",demo:t.map((function(e){return"".concat(e,':"').concat(e,'"')}))},{title:"With color",demo:{view:e,data:{color:"#F9E4A9",text:"Colored badge"}}},{title:"As a link",demo:{view:e,data:{href:"#",text:"Click me!"}}},{title:"Prefix and postfix",demo:{view:e,data:{prefix:"prefix",postfix:"postfix",text:"text"}}}]}}},{}],42:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("block",(function(t,n,r,i){var o=n.content,a=void 0===o?[]:o,s=n.onInit,l=n.onChange,u="function"!=typeof s&&"function"!=typeof l?a:this.composeConfig(a,{onInit:s,onChange:l});return e.view.render(t,u,r,i)}),{usage:i.default})};var r,i=(r=e("./block.usage.js"))&&r.__esModule?r:{default:r}},{"./block.usage.js":43}],43:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={beforeDemo:"A block has no its own look. It's using for wrapping some content with a `className` (btw `className` is a common property for any view when appropriate)",demo:{view:"block",className:"foo",content:['text:"Content inside block"']}}},{}],44:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(t,n,r,i){var o=n.content,a=n.disabled,s=void 0!==a&&a,l=n.onClick,u=r||{},c=u.text,f=void 0===c?"":c,d=u.href,p=u.external;if(t.classList.add("view-button"),e.query(s,r,i)?t.disabled=!0:"function"==typeof l?(t.addEventListener("click",(function(){return l(t,r,i)})),t.classList.add("onclick")):d&&(t.href=d,t.target=p?"_blank":""),o)return e.view.render(t,o,r,i);t.textContent=f}e.view.define("button",t,{tag:"button",usage:i.default}),e.view.define("button-primary",t,{tag:"button",usage:i.default}),e.view.define("button-danger",t,{tag:"button",usage:i.default}),e.view.define("button-warning",t,{tag:"button",usage:i.default})};var r,i=(r=e("./button.usage.js"))&&r.__esModule?r:{default:r}},{"./button.usage.js":45}],45:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default=function(e,t){return{demo:{view:e,onClick:function(){return alert("Hello world!")},data:{text:"Button"}},examples:[{title:"Variations",demo:t.map((function(e){return"".concat(e,':{ text: "').concat(e,'" }')}))}]}}},{}],46:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("checkbox-list",(function(t,n,r,i){var a=n.name,s=void 0===a?"filter":a,u=n.checkbox,c=n.checkboxValue,f=void 0===c?"$":c,d=n.emptyText,p=n.limit,h=n.onChange,g=n.onInit,v=new Set;if(!1!==d&&""!==d&&t.setAttribute("emptyText",d||"Empty list"),!Array.isArray(r)&&r&&(r=[r]),Array.isArray(r))return e.view.renderList(t,this.composeConfig(l(l({view:"checkbox"},u),{},{onInit:function(t,n,r,i){t&&v.add(e.query(f,r,i))},onChange:function(t,n,r,i){var a=v.size,l=e.query(f,r,i);t?v.add(l):v.delete(l),a!==v.size&&"function"==typeof h&&h(o(v),s)}})),r,i,0,e.view.listLimit(p,25)).then((function(){"function"==typeof g&&g(o(v),s)}))}),{usage:i.default})};var r,i=(r=e("./checkbox-list.usage.js"))&&r.__esModule?r:{default:r};function o(e){return function(e){if(Array.isArray(e))return a(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return a(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return a(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){u(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function u(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},{"./checkbox-list.usage.js":47}],47:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"checkbox-list",checkbox:{content:"text"},data:["one","two","three"]}}},{}],48:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("checkbox",(function(t,n,r,i){var o=n.name,l=n.checked,u=n.readonly,c=n.content,f=n.onInit,d=n.onChange,p=t.appendChild(document.createElement("input")),h=null;if(p.type="checkbox",p.checked=void 0!==l?e.queryBool(l,r,i):Boolean(i[o]),p.readOnly=u,p.addEventListener("click",(function(e){u&&e.preventDefault()})),p.addEventListener("change",(function(){"function"==typeof d&&(d(p.checked,o,r,i),null!==h&&h())})),"function"==typeof f&&f(p.checked,o,r,i),c){var g=t.appendChild(document.createElement("span"));return(h=function(){var t=o?a(a({},i),{},s({},o,p.checked)):i;return g.innerHTML="",e.view.render(g,c,r,t)})()}}),{tag:"label",usage:i.default})};var r,i=(r=e("./checkbox.usage.js"))&&r.__esModule?r:{default:r};function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},{"./checkbox.usage.js":49}],49:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r={demo:{view:"checkbox",content:'text:"checkbox caption"'},examples:[{title:"Checked state",beforeDemo:"Checked state is set up with `checked` property. Its value can be a query",demo:[{view:"checkbox",checked:!0,content:'text:"should be checked"'},{view:"checkbox",checked:"1 > 5",content:'text:"shouldn\'t be checked"'},{view:"checkbox",checked:"1 < 5",content:'text:"should be checked"'}]},{title:"Readonly checkbox",demo:{view:"checkbox",readonly:!0,content:'text:"checkbox caption"'}},{title:"On change",demo:{view:"checkbox",onChange:function(e,t,n,r){return alert("Changed to ".concat(e,"!"))},content:'text:"click me!"'}}]};n.default=r},{}],50:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("column",(function(t,n,r,i){var o=n.content,a=void 0===o?[]:o;return e.view.render(t,a,r,i)}),{usage:i.default})};var r,i=(r=e("./columns.usage.js"))&&r.__esModule?r:{default:r}},{"./columns.usage.js":52}],51:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("columns",(function(t,n,r,i){var o=n.column,a=n.columnConfig,s=n.emptyText,l=n.limit;if(!1!==s&&""!==s&&t.setAttribute("emptyText",s||"Empty"),!Array.isArray(r)&&r&&(r=[r]),Array.isArray(r))return e.view.renderList(t,this.composeConfig({view:"column",content:o},a),r,i,0,e.view.listLimit(l,25))}),{usage:i.default})};var r,i=(r=e("./columns.usage.js"))&&r.__esModule?r:{default:r}},{"./columns.usage.js":52}],52:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"columns",data:["one","two","three","four"],column:"text"}}},{}],53:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("content-filter",(function(t,n,r,i){var o=n.name,a=void 0===o?"filter":o,s=n.type,l=void 0===s?"regexp":s,u=n.placeholder,c=n.content,f=n.onInit,d=n.onChange;return e.view.render(t,{view:"context",modifiers:{view:"input",name:a,type:l,placeholder:u||"Filter"},content:{view:"block",className:"content",content:c,onInit:f,onChange:d}},r,i)}),{usage:i.default})};var r,i=(r=e("./content-filter.usage.js"))&&r.__esModule?r:{default:r}},{"./content-filter.usage.js":54}],54:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"content-filter",data:["foo","bar","baz"],content:{view:"list",data:".[$ ~= #.filter]"}},examples:[{title:"Using with text-match",demo:{view:"content-filter",data:[{name:"foo"},{name:"bar"},{name:"baz"}],name:"customName",content:{view:"list",data:".[name ~= #.customName]",item:"text-match:{ text: name, match: #.customName }"}}}]}},{}],55:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("context",(function(t,n,r,i){function s(){for(var t=f.previousSibling;t&&t!==c;)(t=t.previousSibling).nextSibling.remove();var n=d=document.createDocumentFragment();return e.view.render(n,m,r,u).then((function(){n===d&&c.after(n)}))}function l(e,t){t&&(u[t]=e,p&&s())}var u=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},i),c=null,f=null,d=null,p=!1,h=n.modifiers,g=void 0===h?[]:h,v=n.content,m=void 0===v?[]:v;Array.isArray(g)||(g=[g]);var y=e.view.render(t,this.composeConfig(g,{onInit:l,onChange:l}),r,i);return c=t.appendChild(document.createComment('{ view: "context" } content start')),f=t.appendChild(document.createComment('{ view: "context" } content end')),y.then((function(){p=!0,s()}))}),{tag:!1,usage:i.default})};var r,i=(r=e("./context.usage.js"))&&r.__esModule?r:{default:r};function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},{"./context.usage.js":56}],56:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"context",data:{name:"text",demo:123},content:["text:name","table"]},examples:[{title:"Using with modifiers",demo:{view:"context",modifiers:['h2:"Modifiers"',{view:"input",name:"inputValue"},{view:"select",name:"selectValue",data:["foo","bar","baz"]}],content:['h2:"Values"',"struct:#"]}}]}},{}],57:[function(e,t,n){"use strict";var r,i=(r=e("/gen/codemirror.js"))&&r.__esModule?r:{default:r};function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function s(e,t,n){return t&&a(e.prototype,t),n&&a(e,n),e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var f="discovery-view-editor-hints-popup",d="active",p=window.requestAnimationFrame||function(e){return setTimeout(e,1e3/60)},h=window.cancelAnimationFrame||clearTimeout;i.default.commands.autocomplete=i.default.showHint,i.default.defineOption("showHintOptions",null),i.default.defineExtension("showHint",(function(e){e=u(u({closeOnUnfocus:!0,container:null},this.options.showHintOptions),e),this.state.completionActive&&this.state.completionActive.close(),this.listSelections().length>1||this.somethingSelected()||"function"==typeof e.hint&&(this.state.completionActive=new g(this,e),this.state.completionActive.update(!0),i.default.signal(this,"startCompletion",this))}));var g=function(){function e(t,n){var r,i=this;(o(this,e),this.cm=t,this.options=n,this.widget=null,this.debounce=0,this.tick=0,this.startPos=this.cm.getCursor("start"),this.startLen=this.cm.getLine(this.startPos.line).length-this.cm.getSelection().length,t.on("cursorActivity",this.activityFunc=function(){return i.cursorActivity()}),n.closeOnUnfocus)&&(this.onFocus=function(){return clearTimeout(r)},this.onBlur=function(){return r=setTimeout((function(){return i.close()}),100)},t.on("focus",this.onFocus),t.on("blur",this.onBlur))}return s(e,[{key:"close",value:function(){this.active()&&(this.cm.state.completionActive=null,this.tick=null,this.cm.off("cursorActivity",this.activityFunc),this.options.closeOnUnfocus&&(this.cm.off("blur",this.onBlur),this.cm.off("focus",this.onFocus)),this.widget&&(this.data&&i.default.signal(this.data,"close"),this.widget.close()),i.default.signal(this.cm,"endCompletion",this.cm))}},{key:"active",value:function(){return this.cm.state.completionActive===this}},{key:"pick",value:function(e,t){var n=e.list[t];n.hint?n.hint(this.cm,e,n):this.cm.replaceRange(v(n),n.from||e.from,n.to||e.to,"complete"),i.default.signal(e,"pick",n),this.close()}},{key:"cursorActivity",value:function(){var e=this;this.debounce&&(h(this.debounce),this.debounce=0);var t=this.cm.getCursor(),n=this.cm.getLine(t.line);t.line!=this.startPos.line||n.length-t.ch!=this.startLen-this.startPos.ch||t.ch<this.startPos.ch||this.cm.somethingSelected()?this.close():(this.debounce=p((function(){return e.update()})),this.widget&&this.widget.disable())}},{key:"update",value:function(e){var t=this;if(null!==this.tick){var n=++this.tick;Promise.resolve(this.options.hint(this.cm,this.options)).then((function(r){t.tick==n&&t.finishUpdate(r,e)}))}}},{key:"finishUpdate",value:function(e){this.data&&i.default.signal(this.data,"update");var t=this.widget&&this.widget.picked;this.widget&&this.widget.close(),this.data=e,e&&e.list.length&&(t&&1==e.list.length?this.pick(e,0):(this.widget=new m(this,e),i.default.signal(e,"shown")))}}]),e}();function v(e){return"string"==typeof e?e:e.text}var m=function(){function e(t,n){var r=this;o(this,e);var a=t.cm,s=this.hintsEl=document.createElement("ul"),l=[f,t.cm.options.theme,t.options.isolateStyleMarker].filter(Boolean);this.completion=t,this.data=n,this.picked=!1,this.selectedHint=n.selectedHint||0,l.forEach((function(e){return s.classList.add(e)})),(t.options.container||document.body).appendChild(s),this.items=n.list.map((function(e,t){var i=s.appendChild(document.createElement("li"));return i.className="discovery-view-editor-hint",t===r.selectedHint&&i.classList.add(d),e.render?e.render(i,n,e):i.appendChild(document.createTextNode(e.displayText||v(e))),i})),a.addKeyMap(this.keyMap={Up:function(){return r.changeActive(r.selectedHint-1)},Down:function(){return r.changeActive(r.selectedHint+1)},Enter:function(){return r.pick()},Tab:function(){return r.pick()},Esc:function(){return t.close()}}),this.updatePosSize(),document.addEventListener("scroll",this.onScroll=function(){return r.updatePosSize()},!0),i.default.on(s,"mousedown",(function(){return setTimeout((function(){return a.focus()}),20)})),i.default.on(s,"click",(function(e){var t=function(e,t){for(;t&&t.parentNode!==e;)t=t.parentNode;return t}(s,e.target),n=r.items.indexOf(t);-1!==n&&(r.changeActive(n),r.pick())})),i.default.signal(n,"select",n.list[this.selectedHint],this.items[this.selectedHint])}return s(e,[{key:"close",value:function(){this.completion.widget===this&&(this.completion.widget=null,this.completion.cm.removeKeyMap(this.keyMap),this.hintsEl.remove(),document.removeEventListener("scroll",this.onScroll,!0))}},{key:"disable",value:function(){var e=this;this.completion.cm.removeKeyMap(this.keyMap),this.keyMap={Enter:function(){return e.picked=!0}},this.completion.cm.addKeyMap(this.keyMap)}},{key:"pick",value:function(){this.completion.pick(this.data,this.selectedHint)}},{key:"changeActive",value:function(e,t){e>=this.items.length?e=t?this.items.length-1:0:e<0&&(e=t?0:this.items.length-1);var n=this.items[this.selectedHint],r=this.items[this.selectedHint=e];r!==n&&(n&&n.classList.remove(d),r.classList.add(d),r.offsetTop<this.hintsEl.scrollTop?this.hintsEl.scrollTop=r.offsetTop-3:r.offsetTop+r.offsetHeight>this.hintsEl.scrollTop+this.hintsEl.clientHeight&&(this.hintsEl.scrollTop=r.offsetTop+r.offsetHeight-this.hintsEl.clientHeight+3),i.default.signal(this.data,"select",this.data.list[this.selectedHint],r))}},{key:"updatePosSize",value:function(){var e=this.completion,t=this.hintsEl,n=this.data,r=e.cm,i=r.cursorCoords(),o=i.left,a=i.bottom;t.style.left=o+"px",t.style.top=a+"px";var s=window.innerWidth,l=window.innerHeight,u=t.getBoundingClientRect();if(u.bottom-l>0){var c=u.bottom-u.top;if(i.top-(i.bottom-u.top)-c>0)t.style.top=(a=i.top-c)+"px";else if(c>l){t.style.height=l-5+"px",t.style.top=(a=i.bottom-u.top)+"px";var f=r.getCursor();n.from.ch!=f.ch&&(i=r.cursorCoords(f),t.style.left=(o=i.left)+"px",u=t.getBoundingClientRect())}}var d=u.right-s;d>0&&(u.right-u.left>s&&(t.style.width=s-5+"px",d-=u.right-u.left-s),t.style.left=(o=i.left-d)+"px")}}]),e}()},{"/gen/codemirror.js":2}],58:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){Object.assign(e.view,{QueryEditor:function(t){g(r,t);var n=m(r);function r(){return d(this,r),n.apply(this,arguments)}return h(r,[{key:"getIsolateStyleMarker",value:function(){return e.isolateStyleMarker}}]),r}(k),ViewEditor:function(t){g(r,t);var n=m(r);function r(){return d(this,r),n.apply(this,arguments)}return h(r,[{key:"isViewDefined",value:function(t){return e.view.isDefined(t)}},{key:"getIsolateStyleMarker",value:function(){return e.isolateStyleMarker}}]),r}(O)})};var r=e("../core/utils/dom.js"),i=e("../core/utils/html.js"),o=s(e("../core/emitter.js")),a=s(e("/gen/codemirror.js"));function s(e){return e&&e.__esModule?e:{default:e}}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function f(e){return(f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function d(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function p(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function h(e,t,n){return t&&p(e.prototype,t),n&&p(e,n),e}function g(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&v(e,t)}function v(e,t){return(v=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function m(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=b(e);if(t){var i=b(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return y(this,n)}}function y(e,t){return!t||"object"!==f(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function b(e){return(b=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function w(e,t,n){var o=n.entry,a=o.value,s=o.current,l=o.type,u=s[0],c=s[s.length-1],f='"'===u||"'"===u?1:0,d='"'===c||"'"===c?1:0,p=s.toLowerCase().substring(f,s.length-d),h=p?a.toLowerCase().indexOf(p,'"'===a[0]||"'"===a[0]?1:0):-1;-1!==h&&(a=(0,i.escapeHtml)(a.substring(0,h))+'<span class="match">'+(0,i.escapeHtml)(a.substr(h,p.length))+"</span>"+(0,i.escapeHtml)(a.substr(h+p.length))),e.appendChild((0,r.createElement)("span","name",a)),e.appendChild((0,r.createElement)("span","type",l))}e("./editors-hint.js");var x=function(e){g(n,e);var t=m(n);function n(e){var r,i=e.hint,o=e.mode;d(this,n),(r=t.call(this)).el=document.createElement("div"),r.el.className="discovery-editor";var s=(0,a.default)(r.el,{extraKeys:{"Alt-Space":"autocomplete"},mode:o||"javascript",theme:"neo",indentUnit:0,showHintOptions:{hint:i,isolateStyleMarker:r.getIsolateStyleMarker()}});return s.on("change",(function(){return r.emit("change",s.getValue())})),"function"==typeof i&&(s.on("cursorActivity",(function(e){e.state.focused&&e.showHint()})),s.on("focus",(function(e){return!e.state.completionActive&&e.showHint()}))),r.cm=s,r}return h(n,[{key:"getValue",value:function(){return this.cm.getValue()}},{key:"setValue",value:function(e){var t=this;Promise.resolve().then((function(){return t.cm.refresh()})),"string"==typeof e&&this.getValue()!==e&&this.cm.setValue(e||"")}},{key:"focus",value:function(){this.cm.focus()}},{key:"getIsolateStyleMarker",value:function(){}}]),n}(o.default),k=function(e){g(n,e);var t=m(n);function n(e){return d(this,n),t.call(this,{mode:"discovery-query",hint:function(t){var n=t.getCursor(),r=e(t.getValue(),t.doc.indexFromPos(n));if(r)return{list:r.slice(0,50).map((function(e){return{entry:e,text:e.value,render:w,from:t.posFromIndex(e.from),to:t.posFromIndex(e.to)}}))}}})}return n}(x),O=function(e){g(n,e);var t=m(n);function n(){var e;return d(this,n),e=t.call(this,{mode:{name:"discovery-view",isDiscoveryViewDefined:function(t){return e.isViewDefined(t)}}})}return n}(x);a.default.defineMode("discovery-query",(function(e){var t=a.default.getMode(e,{name:"javascript",json:!0});return u(u({},t),{},{indent:function(t,n){return t.indented+e.indentUnit*("{"===t.lastType&&"}"!==n.trim()[0]||"("===t.lastType&&")"!==n.trim()[0]||"["===t.lastType&&"]"!==n.trim()[0])},token:function(e,n){var r=e.peek();return"#"===r||"@"===r?(t.token(new a.default.StringStream("$",4,e.lineOracle),n),e.pos++,"variable"):t.token(e,n)}})})),a.default.defineMode("discovery-view",(function(e,t){var n="function"==typeof t.isDiscoveryViewDefined?t.isDiscoveryViewDefined:function(){},r=a.default.getMode(e,{name:"javascript",json:!0});return u(u({},r),{},{indent:function(t,n){return t.indented+e.indentUnit*("{"===t.lastType&&"}"!==n.trim()[0]||"("===t.lastType&&")"!==n.trim()[0]||"["===t.lastType&&"]"!==n.trim()[0])},token:function(e,t){if(t.suspendTokens){var i=t.suspendTokens.shift(),o=i.pos,a=i.token;return e.pos=o,0===t.suspendTokens.length&&(t.suspendTokens=null),a}var s=e.pos,l=r.token(e,t);if("string"===l){var u=e.pos,c=e.string.slice(s+1,u-1).split(":")[0];n(c)&&(e.pos=s+1,t.suspendTokens=[{pos:s+1+c.length,token:"string discovery-view-name"},{pos:u,token:l}])}return l}})}))},{"../core/emitter.js":10,"../core/utils/dom.js":19,"../core/utils/html.js":20,"./editors-hint.js":57,"/gen/codemirror.js":2}],59:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("expand",(function(t,n,r,i){function o(){p&&(p.remove(),p=null),a?(t.classList.add("expanded"),p=document.createElement("div"),e.view.render(p,l,r,i),t.appendChild(p)):t.classList.remove("expanded")}var a=n.expanded,s=n.title,l=n.content,u=n.onToggle,c=t.appendChild(document.createElement("div")),f=c.appendChild(document.createElement("div")),d=c.appendChild(document.createElement("div")),p=null;a=e.queryBool(a,r,i),c.className="header",d.className="trigger",c.addEventListener("click",(function(){a=!a,o(),"function"==typeof u&&u(a)})),e.view.render(f,s||{view:"text",data:'"No title"'},r,i),o()}),{usage:i.default})};var r,i=(r=e("./expand.usage.js"))&&r.__esModule?r:{default:r}},{"./expand.usage.js":60}],60:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"expand",title:'text:"Expand me!"',content:'text:"Content"'}}},{}],61:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(t,n,r,i){var o=n.content;t.classList.add("view-header"),e.view.render(t,o||"text",r,i)}e.view.define("header",t,{tag:"h4",usage:i.default}),e.view.define("h1",t,{tag:"h1",usage:i.default}),e.view.define("h2",t,{tag:"h2",usage:i.default}),e.view.define("h3",t,{tag:"h3",usage:i.default}),e.view.define("h4",t,{tag:"h4",usage:i.default}),e.view.define("h5",t,{tag:"h5",usage:i.default})};var r,i=(r=e("./headers.usage.js"))&&r.__esModule?r:{default:r}},{"./headers.usage.js":62}],62:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default=function(e,t){return{demo:"".concat(e,':"Header \\"').concat(e,'\\""'),examples:[{title:"Variations",view:t.map((function(e){return"".concat(e,':"Header \\"').concat(e,'\\""')}))},{title:"Complex content",demo:{view:e,content:['text:"Text "','link:{text:"Link"}']}}]}}},{}],63:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("hstack",(function(t,n,r,i){var o=n.content,a=void 0===o?[]:o;return e.view.render(t,a,r,i)}),{usage:i.default})};var r,i=(r=e("./hstack.usage.js"))&&r.__esModule?r:{default:r}},{"./hstack.usage.js":64}],64:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"hstack",content:['button:{text:"First button"}','button-primary:{text:"Second button"}']}}},{}],65:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t=document.createElement("div");e.view.define("html",(function(e,n,r){for(t.innerHTML=r;t.firstChild;)e.appendChild(t.firstChild)}),{tag:null,usage:i.default})};var r,i=(r=e("./html.usage.js"))&&r.__esModule?r:{default:r}},{"./html.usage.js":66}],66:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"html",data:'"<h1>I am inner HTML</h1>"'}}},{}],67:[function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("image-preview",(function(e,t,n){var r=n||{},o=r.content,a=r.binary,s=r.mime;e.hidden=!0,/^image\//i.test(s)&&(e.hidden=!1,a||(o=i.encode(o)),e.innerHTML='<img src="data:'.concat(s,";base64,").concat(o,'">'))}))};var i=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==r(e)&&"function"!=typeof e)return{default:e};var t=o();if(t&&t.has(e))return t.get(e);var n={},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if(Object.prototype.hasOwnProperty.call(e,a)){var s=i?Object.getOwnPropertyDescriptor(e,a):null;s&&(s.get||s.set)?Object.defineProperty(n,a,s):n[a]=e[a]}n.default=e,t&&t.set(e,n);return n}(e("../core/utils/base64.js"));function o(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return o=function(){return e},e}},{"../core/utils/base64.js":15}],68:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"source",{enumerable:!0,get:function(){return i.default}});var r,i=(r=e("./source.js"))&&r.__esModule?r:{default:r}},{"./source.js":96}],69:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"alerts",{enumerable:!0,get:function(){return r.default}}),Object.defineProperty(n,"autoLink",{enumerable:!0,get:function(){return i.default}}),Object.defineProperty(n,"badges",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(n,"block",{enumerable:!0,get:function(){return a.default}}),Object.defineProperty(n,"button",{enumerable:!0,get:function(){return s.default}}),Object.defineProperty(n,"checkboxList",{enumerable:!0,get:function(){return l.default}}),Object.defineProperty(n,"checkbox",{enumerable:!0,get:function(){return u.default}}),Object.defineProperty(n,"column",{enumerable:!0,get:function(){return c.default}}),Object.defineProperty(n,"columns",{enumerable:!0,get:function(){return f.default}}),Object.defineProperty(n,"contentFilter",{enumerable:!0,get:function(){return d.default}}),Object.defineProperty(n,"context",{enumerable:!0,get:function(){return p.default}}),Object.defineProperty(n,"editors",{enumerable:!0,get:function(){return h.default}}),Object.defineProperty(n,"expand",{enumerable:!0,get:function(){return g.default}}),Object.defineProperty(n,"headers",{enumerable:!0,get:function(){return v.default}}),Object.defineProperty(n,"hstack",{enumerable:!0,get:function(){return m.default}}),Object.defineProperty(n,"html",{enumerable:!0,get:function(){return y.default}}),Object.defineProperty(n,"imagePreview",{enumerable:!0,get:function(){return b.default}}),Object.defineProperty(n,"indicator",{enumerable:!0,get:function(){return w.default}}),Object.defineProperty(n,"input",{enumerable:!0,get:function(){return x.default}}),Object.defineProperty(n,"link",{enumerable:!0,get:function(){return k.default}}),Object.defineProperty(n,"listItem",{enumerable:!0,get:function(){return O.default}}),Object.defineProperty(n,"lists",{enumerable:!0,get:function(){return j.default}}),Object.defineProperty(n,"menu",{enumerable:!0,get:function(){return S.default}}),Object.defineProperty(n,"menuItem",{enumerable:!0,get:function(){return C.default}}),Object.defineProperty(n,"navButton",{enumerable:!0,get:function(){return P.default}}),Object.defineProperty(n,"popup",{enumerable:!0,get:function(){return A.default}}),Object.defineProperty(n,"section",{enumerable:!0,get:function(){return M.default}}),Object.defineProperty(n,"select",{enumerable:!0,get:function(){return _.default}}),Object.defineProperty(n,"signature",{enumerable:!0,get:function(){return T.default}}),Object.defineProperty(n,"struct",{enumerable:!0,get:function(){return E.default}}),Object.defineProperty(n,"switch",{enumerable:!0,get:function(){return L.default}}),Object.defineProperty(n,"tableCell",{enumerable:!0,get:function(){return N.default}}),Object.defineProperty(n,"tableRow",{enumerable:!0,get:function(){return D.default}}),Object.defineProperty(n,"table",{enumerable:!0,get:function(){return I.default}}),Object.defineProperty(n,"tab",{enumerable:!0,get:function(){return F.default}}),Object.defineProperty(n,"tabs",{enumerable:!0,get:function(){return R.default}}),Object.defineProperty(n,"text",{enumerable:!0,get:function(){return $.default}}),Object.defineProperty(n,"textMatch",{enumerable:!0,get:function(){return H.default}}),Object.defineProperty(n,"tocSection",{enumerable:!0,get:function(){return W.default}}),Object.defineProperty(n,"treeItem",{enumerable:!0,get:function(){return z.default}}),Object.defineProperty(n,"tree",{enumerable:!0,get:function(){return B.default}});var r=q(e("./alerts.js")),i=q(e("./auto-link.js")),o=q(e("./badges.js")),a=q(e("./block.js")),s=q(e("./button.js")),l=q(e("./checkbox-list.js")),u=q(e("./checkbox.js")),c=q(e("./column.js")),f=q(e("./columns.js")),d=q(e("./content-filter.js")),p=q(e("./context.js")),h=q(e("./editors.js")),g=q(e("./expand.js")),v=q(e("./headers.js")),m=q(e("./hstack.js")),y=q(e("./html.js")),b=q(e("./image-preview.js")),w=q(e("./indicator.js")),x=q(e("./input.js")),k=q(e("./link.js")),O=q(e("./list-item.js")),j=q(e("./lists.js")),S=q(e("./menu.js")),C=q(e("./menu-item.js")),P=q(e("./nav-button.js")),A=q(e("./popup.js")),M=q(e("./section.js")),_=q(e("./select.js")),T=q(e("./signature.js")),E=q(e("./struct.js")),L=q(e("./switch.js")),N=q(e("./table-cell.js")),D=q(e("./table-row.js")),I=q(e("./table.js")),F=q(e("./tab.js")),R=q(e("./tabs.js")),$=q(e("./text.js")),H=q(e("./text-match.js")),W=q(e("./toc-section.js")),z=q(e("./tree-leaf.js")),B=q(e("./tree.js"));function q(e){return e&&e.__esModule?e:{default:e}}},{"./alerts.js":37,"./auto-link.js":39,"./badges.js":40,"./block.js":42,"./button.js":44,"./checkbox-list.js":46,"./checkbox.js":48,"./column.js":50,"./columns.js":51,"./content-filter.js":53,"./context.js":55,"./editors.js":58,"./expand.js":59,"./headers.js":61,"./hstack.js":63,"./html.js":65,"./image-preview.js":67,"./indicator.js":70,"./input.js":72,"./link.js":74,"./list-item.js":76,"./lists.js":77,"./menu-item.js":79,"./menu.js":81,"./nav-button.js":83,"./popup.js":85,"./section.js":86,"./select.js":88,"./signature.js":90,"./struct.js":97,"./switch.js":103,"./tab.js":105,"./table-cell.js":107,"./table-row.js":108,"./table.js":109,"./tabs.js":111,"./text-match.js":113,"./text.js":115,"./toc-section.js":117,"./tree-leaf.js":118,"./tree.js":119}],70:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("indicator",(function(t,n,r,i){var o=n.value,a=n.label,s=(r||{}).href,l=t.appendChild(document.createElement("div")),u=t.appendChild(document.createElement("div"));l.className="value",e.view.render(l,o||"text:value",r,i),u.className="label",e.view.render(u,a||"text:label",r,i),s&&(t.href=s)}),{tag:"a",usage:i.default})};var r,i=(r=e("./indicator.usage.js"))&&r.__esModule?r:{default:r}},{"./indicator.usage.js":71}],71:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"indicator",data:{label:"Label",value:"1234"}},examples:[{title:"Indicator as link",demo:{view:"indicator",data:{label:"Label",value:"4321",href:"#"}}}]}},{}],72:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t={regexp:function(e){return e?(0,i.default)(e):null},text:function(e){return e}};e.view.define("input",(function(n,r,i,a){var s=r.name,l=r.value,u=r.type,c=void 0===u?"text":u,f=r.placeholder,d=r.onInit,p=r.onChange,h=r.htmlType,g=void 0===h?"text":h,v=r.htmlMin,m=r.htmlMax,y=r.debounce,b=t[c]||t.text,w=n.appendChild(document.createElement("input")),x=l?e.query(l,i,a):a[s];"string"!=typeof x&&(x=""),w.type=g,w.value=x,w.placeholder=[f||"",b!==t.text?"("+c+")":""].filter(Boolean).join(" "),void 0!==v&&(w.min=v),m&&(w.max=m),w.addEventListener("input",(0,o.default)((function(){var e=w.value.trim();x!==e&&(x=e,"function"==typeof p&&p(b(e),s,i,a))}),y)),"function"==typeof d&&d(b(w.value.trim()),s,i,a)}),{usage:r.default})};var r=a(e("./input.usage.js")),i=a(e("../core/utils/safe-filter-rx.js")),o=a(e("../core/utils/debounce.js"));function a(e){return e&&e.__esModule?e:{default:e}}},{"../core/utils/debounce.js":18,"../core/utils/safe-filter-rx.js":24,"./input.usage.js":73}],73:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=function(){return alert("changed!")},i={examples:[{title:"Input with value",demo:{view:"input",value:'"value"'}},{title:"Input with placeholder",demo:{view:"input",placeholder:"placeholder"}},{title:"Input type number with min and max",demo:{view:"input",htmlType:"number",htmlMin:10,htmlMax:20}},{title:"Input with onChange",demo:{view:"input",onChange:r}},{title:"Input with onChange debounced",demo:{view:"input",onChange:r,debounce:300}}]};n.default=i},{}],74:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("link",(function(t,n,r,i){var o=n.content,a=r||{},s=a.href,l=a.text,u=a.external;if("string"==typeof r&&(s=l=r),!l&&s?l=s:!s&&l&&(s=l),t.href=s,u&&t.setAttribute("target","_blank"),o)return e.view.render(t,o,r,i);t.textContent=l}),{tag:"a",usage:i.default})};var r,i=(r=e("./link.usage.js"))&&r.__esModule?r:{default:r}},{"./link.usage.js":75}],75:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"link",data:{text:"I am link",href:"#"}},examples:[{title:"Link opened in new tab",demo:{view:"link",data:{text:"Discovery github",href:"https://github.com/discoveryjs/discovery",external:!0}}}]}},{}],76:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("list-item",(function(t,n,r,i){var o=n.content,a=void 0===o?"text":o;return e.view.render(t,a,r,i)}),{tag:"li"})}},{}],77:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(t,n,r,i){var o=n.item,a=n.itemConfig,s=n.limit,l=n.emptyText;if(!1!==l&&""!==l&&t.setAttribute("emptyText",l||"Empty list"),!Array.isArray(r)&&r&&(r=[r]),Array.isArray(r))return e.view.renderList(t,this.composeConfig({view:"list-item",content:o},a),r,i,0,e.view.listLimit(s,25))}e.view.define("list",t,{usage:i.default}),e.view.define("inline-list",t,{usage:i.default}),e.view.define("comma-list",t,{usage:i.default}),e.view.define("ol",t,{tag:"ol",usage:i.default}),e.view.define("ul",t,{tag:"ul",usage:i.default})};var r,i=(r=e("./lists.usage.js"))&&r.__esModule?r:{default:r}},{"./lists.usage.js":78}],78:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default=function(e,t){return{demo:{view:e,data:["one","two","three","four"]},examples:[{title:"Variations",demo:{view:"context",data:["foo","bar","baz"],content:t.map((function(e){return["header:"+JSON.stringify("# "+e),e]}))}},{title:"Configure item's content",demo:[{view:e,data:["one","two","three","four"],item:['text:"<item> "',{view:"link",data:'{ href: "#" + $ }'}]}]},{title:"Configure item's config",demo:{view:e,data:["one","two","three","four"],itemConfig:{className:"special"},item:{view:"text",data:'"prefix-" + $'}}}]}}},{}],79:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("menu-item",(function(t,n,r,i){var o=n.content,a=n.onClick,s=r||{},l=s.text,u=s.selected,c=void 0!==u&&u,f=s.disabled,d=void 0!==f&&f,p=s.href,h=s.external;if(d?t.classList.add("disabled"):"function"==typeof a?(t.addEventListener("click",(function(){return a(r,i)})),t.classList.add("onclick")):p&&(t.href=p,t.target=h?"_blank":""),c&&t.classList.add("selected"),o)return e.view.render(t,o,r,i);t.textContent="string"==typeof r?r:l||"Untitled item"}),{tag:"a",usage:i.default})};var r,i=(r=e("./menu-item.usage.js"))&&r.__esModule?r:{default:r}},{"./menu-item.usage.js":80}],80:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"menu",data:[{text:"one",href:"#"},{text:"two",href:"#"},{text:"three",href:"#"}]},examples:[{title:"Preselected item",demo:{view:"menu",data:[{text:"one",href:"#"},{text:"two",href:"#",selected:!0},{text:"three",href:"#"}]}},{title:"Disabled item",demo:{view:"menu",data:[{text:"one",href:"#"},{text:"two",href:"#",disabled:!0},{text:"three",href:"#"}]}},{title:"External links",demo:{view:"menu",data:[{text:"one",external:!0,href:"https://github.com/discoveryjs/discovery"},{text:"two",external:!0,href:"https://github.com/discoveryjs/discovery"},{text:"three",external:!0,href:"https://github.com/discoveryjs/discovery"}]}}]}},{}],81:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("menu",(function(t,n,r,i){var o=n.name,a=void 0===o?"filter":o,s=n.item,l=n.itemConfig,u=n.limit,c=n.emptyText,f=n.onClick,d=n.onInit,p=n.onChange;if(!1!==c&&""!==c&&t.setAttribute("emptyText",c||"No items"),Array.isArray(r)){var h=this.composeConfig({view:"menu-item",content:s,onClick:"function"==typeof f?f:"function"==typeof p?function(e){return p(e,a)}:void 0},l);return e.view.renderList(t,h,r,i,0,e.view.listLimit(u,25)).then((function(){"function"==typeof d&&d(e.query(".[selected].pick()",r,i),a)}))}}),{usage:i.default})};var r,i=(r=e("./menu.usage.js"))&&r.__esModule?r:{default:r}},{"./menu.usage.js":82}],82:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r={demo:{view:"menu",data:[{text:"one",href:"#"},{text:"two",href:"#"},{text:"three",href:"#"}]},examples:[{title:"With limit",demo:{view:"menu",data:[{text:"one",href:"#"},{text:"two",href:"#"},{text:"three",href:"#"}],limit:2}},{title:"With custom item",demo:{view:"menu",data:[{text:"one",href:"#"},{text:"two",href:"#"},{text:"three",href:"#"}],item:"h1:text"}},{title:"On chage handler",demo:{view:"menu",onChange:function(){return alert("changed!")},data:[{text:"one",href:"#"},{text:"two",href:"#"},{text:"three",href:"#"}]}}]};n.default=r},{}],83:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("nav-button",(function(t,n,r,i){var o=n.name,a=n.content,s=n.disabled,l=void 0!==s&&s,u=n.onClick,c=r||{},f=c.text,d=void 0===f?"":f,p=c.href,h=c.external;if(o&&(t.dataset.name=o),e.query(l,r,i)?t.classList.add("disabled"):"function"==typeof u?(t.addEventListener("click",(function(){return u(t,r,i)})),t.classList.add("onclick")):p&&(t.href=p,t.target=h?"_blank":""),a)return e.view.render(t,a,r,i);t.textContent=d}),{tag:"a",usage:i.default})};var r,i=(r=e("./nav-button.usage.js"))&&r.__esModule?r:{default:r}},{"./nav-button.usage.js":84}],84:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r={demo:{data:{text:"I am nav button"},view:"nav-button"},examples:[{title:"With href",demo:{view:"nav-button",data:{text:"I am nav button",href:"#"}}},{title:"External link",demo:{view:"nav-button",data:{text:"I am nav button",external:!0,href:"https://github.com/discoveryjs/discovery"}}},{title:"On click handler",demo:{view:"nav-button",data:{text:"I am nav button"},onClick:function(){return alert("changed!")}}}]};n.default=r},{}],85:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.Popup=function(){function t(n){var r=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),this.options=o(o({},c),n),this.el=document.createElement("div"),this.el.classList.add("discovery-view-popup",e.isolateStyleMarker),this.el.dataset.discoveryInstanceId=e.instanceId,this.hide=this.hide.bind(this),this.hideTimer,this.lastTriggerEl=null,this.lastHoverTriggerEl=null,this.hoverPinned=!1,this.options.className&&this.el.classList.add(this.options.className),u.includes(this.options.hoverPin)||(console.warn("Bad value for `Popup#options.hoverPin` (should be ".concat(u.join(", "),"):"),this.options.hoverPin),this.options.hoverPin=!1),this.options.hoverTriggers&&(this.el.classList.add("show-on-hover"),this.el.dataset.pinMode=this.options.hoverPin||"none",e.addGlobalEventListener("mouseenter",(function(e){var t=e.target;if(t!==document){var n=f(r,t),i=n?n.el:t.closest(r.options.hoverTriggers);i&&(r.hideTimer=clearTimeout(r.hideTimer),i!==r.lastHoverTriggerEl&&(n&&n.hoverPinned||(r.lastHoverTriggerEl=i),n||(r.hoverPinned=!1,r.el.classList.remove("pinned"),r.show(i))))}}),!0),e.addGlobalEventListener("mouseleave",(function(e){var t=e.target;r.lastHoverTriggerEl&&r.lastHoverTriggerEl===t&&(r.lastHoverTriggerEl=null,r.hideTimer=setTimeout(r.hide,100))}),!0),"trigger-click"===this.options.hoverPin&&e.addGlobalEventListener("click",(function(e){r.lastHoverTriggerEl&&r.lastTriggerEl.contains(e.target)&&(r.lastHoverTriggerEl=null,r.hoverPinned=!0,r.el.classList.add("pinned"),e.stopPropagation())}),!0))}return function(e,t,n){t&&s(e.prototype,t);n&&s(e,n)}(t,[{key:"toggle",value:function(){this.visible?this.hide():this.show.apply(this,arguments)}},{key:"show",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.options.render,n=document.body,i=(0,r.getBoundingRect)(e,n),o=(0,r.getOffsetParent)(n.firstChild),a=(0,r.getViewportRect)(window,o),s=i.top-a.top-3,u=a.bottom-i.bottom-3,c=i.right-a.left-3,f=a.right-i.left-3;s>u?(this.el.style.maxHeight=s+"px",this.el.style.top="auto",this.el.style.bottom=a.bottom-i.top+"px",this.el.dataset.vTo="top"):(this.el.style.maxHeight=u+"px",this.el.style.top=i.bottom-a.top+"px",this.el.style.bottom="auto",this.el.dataset.vTo="bottom"),c>f?(this.el.style.left="auto",this.el.style.right=a.right-i.right+"px",this.el.style.maxWidth=c+"px",this.el.dataset.hTo="left"):(this.el.style.left=i.left-a.left+"px",this.el.style.right="auto",this.el.style.maxWidth=f+"px",this.el.dataset.hTo="right"),this.hideTimer=clearTimeout(this.hideTimer),this.relatedPopups.forEach((function(e){return e.hide()})),"function"==typeof t&&(this.el.innerHTML="",t(this.el,e,this.hide)),this.lastTriggerEl&&this.lastTriggerEl.classList.remove("discovery-view-popup-active"),e.classList.add("discovery-view-popup-active"),this.lastTriggerEl=e,n.appendChild(this.el),this.visible||(l.push(this),window.addEventListener("resize",this.hide),1===l.length&&(document.addEventListener("scroll",d,!0),document.addEventListener("click",d,!0)))}},{key:"hide",value:function(){this.hideTimer=clearTimeout(this.hideTimer),this.visible&&(this.relatedPopups.forEach((function(e){return e.hide()})),l.splice(l.indexOf(this),1),this.el.remove(),this.lastTriggerEl&&(this.lastTriggerEl.classList.remove("discovery-view-popup-active"),this.lastTriggerEl=null),window.removeEventListener("resize",this.hide),0===l.length&&(document.removeEventListener("scroll",d,!0),document.removeEventListener("click",d,!0)))}},{key:"hideIfEventOutside",value:function(e){var t=e.target;this.lastTriggerEl&&this.lastTriggerEl.contains(t)||f(this,t)||this.hide()}},{key:"relatedPopups",get:function(){var e=this;return l.filter((function(t){return e.el.contains(t.lastTriggerEl)}))}},{key:"visible",get:function(){return l.includes(this)}}]),t}()};var r=e("../core/utils/layout.js");function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var l=[],u=[!1,"popup-hover","trigger-click"],c={hoverTriggers:null,hoverPin:!1,render:void 0};function f(e,t){return e.el.contains(t)?e:e.relatedPopups.reduce((function(e,n){return e||f(n,t)}),null)}function d(e){l.slice().forEach((function(t){return t.hideIfEventOutside(e)}))}},{"../core/utils/layout.js":23}],86:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("section",(function(t,n,r,i){var o=n.header,a=n.content;e.view.render(t,[{view:"header",content:o},a],r,i)}),{usage:i.default})};var r,i=(r=e("./section.usage.js"))&&r.__esModule?r:{default:r}},{"./section.usage.js":87}],87:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"section",header:'text:"I am section"',content:['text:"content"']}}},{}],88:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t="{ value: $, text: #.selectVariantTextQuery.query($, #) }",n=new e.view.Popup({className:"view-select-popup"});e.view.define("select",(function(r,i,o,s){function l(){r.innerHTML="",void 0!==C&&e.view.render(r,e.view.composeConfig({view:"menu-item",data:t,content:w},x),C,P)}var u=i.name,c=i.value,f=i.text,d=void 0===f?"$":f,p=i.placeholder,h=i.limit,g=i.minItemsFilter,v=void 0===g?10:g,m=i.resetItem,y=void 0!==m&&m,b=i.item,w=void 0===b?"text-match:{ text, match: #.filter }":b,x=i.itemConfig,k=i.beforeItems,O=i.afterItems,j=i.onInit,S=i.onChange,C=c?e.query(c,o,s):s[u],P=a(a({},s),{},{selectMinItemsFilter:v,selectCurrentValue:C,selectVariantTextQuery:d,selectResetItem:y?[a(a({value:void 0,text:""},y),{},{resetItem:!0})]:[]}),A=[];k&&A.push(e.view.composeConfig(k,{onInit:j,onChange:S})),A.push({view:"context",data:".(".concat(t,")"),modifiers:{view:"input",when:"size() >= #.selectMinItemsFilter",type:"regexp",name:"filter",className:"view-select__filter",placeholder:"Filter"},content:{view:"menu",className:"view-select__variants",data:"#.selectResetItem + .[no #.filter or text~=#.filter]",limit:h,itemConfig:e.view.composeConfig({className:[function(e){return e.resetItem?"reset-item":""},function(e){return e.value===C?"selected":""}]},x),item:w,onClick:function(e){n.hide(),C!==e.value&&(C=e.value,P=a(a({},P),{},{selectCurrentValue:C}),l(),"function"==typeof S&&S(e.value,u,e,s))}}}),O&&A.push(e.view.composeConfig(O,{onInit:j,onChange:S})),p&&(r.dataset.placeholder=p),r.tabIndex=0,r.addEventListener("click",(function(){n.toggle(r,(function(t){return e.view.render(t,A,o,P).then((function(){return(t.querySelector(".view-select__filter input")||{focus:function(){}}).focus()}))}))})),"function"==typeof j&&j(C,u,o,s),l()}),{usage:i.default})};var r,i=(r=e("./select.usage.js"))&&r.__esModule?r:{default:r};function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},{"./select.usage.js":89}],89:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r={demo:{view:"select",data:["one","two","three","four"]},examples:[{title:"Select with value",demo:{view:"select",value:'"three"',data:["one","two","three","four"]}},{title:"Select with reset option",demo:{view:"select",resetItem:!0,value:'"three"',data:["one","two","three","four"]}},{title:"Select with placeholder",demo:{view:"select",placeholder:"placeholder",data:["one","two","three","four"]}},{title:"Select with onChange",demo:{view:"select",onChange:function(){return alert("changed!")},data:["one","two","three","four"]}},{title:"Select with custom options",demo:{view:"select",item:"h1:text",data:["one","two","three","four"]}}]};n.default=r},{}],90:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"default",{enumerable:!0,get:function(){return i.default}});var r,i=(r=e("./signature/index.js"))&&r.__esModule?r:{default:r}},{"./signature/index.js":93}],91:[function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t,n){for(var r in e)if(hasOwnProperty.call(e,r)){if(!t){n.properties=null;break}var i=void 0;n.dictMode?((i=n.dictMode).count++,i.keys.add(r)):n.properties.has(r)?(i=n.properties.get(r)).count++:(i={count:1,map:Object.create(null)},n.properties.set(r,i)),o(e[r],t-1,i.map)}}function o(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:Object.create(null),a=null===e?"null":Array.isArray(e)?"array":r(e);switch(a){default:a in n==!1&&(n[a]=new Map),n[a].set(e,(n[a].get(e)||0)+1);break;case"object":"object"in n==!1&&(n.object=new Map,n.object.count=0,n.object.properties=new Map,n.object.dictMode=null,n.object.sortKeys=!1),n.object.count++,n.object.has(e)?n.object.set(e,n.object.get(e)+1):(n.object.set(e,1),i(e,t,n.object));break;case"array":"array"in n==!1&&(n.array=new Map,n.array.count=0,n.array.map=Object.create(null)),n.array.count++,n.array.set(e,(n.array.get(e)||0)+1);for(var s=0;s<e.length;s++)o(e[s],t,n.array.map)}return n}Object.defineProperty(n,"__esModule",{value:!0}),n.collectObjectMap=i,n.collectStat=o},{}],92:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.typeOrder=n.colors=void 0;n.colors=["#7ede78","#f5f061","#f7b28a","#af8af7","#61a3f5","#ef9898","#80ccb4","#b1ae8a","#e290d3","#91d9ea","#bbb"];n.typeOrder=["null","undefined","string","number","bigint","boolean","symbol","function","array","object"]},{}],93:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t=new WeakMap;document.addEventListener("click",(function(e){var n="expand",o=e.target.closest("\n            .view-signature .expand,\n            .view-signature [data-action]\n        ");if(o){o.dataset.action&&(n=o.dataset.action,o=o.parentNode);var a=t.get(o);if(a){var s=a.path,l=a.map,u=a.offset,c=document.createDocumentFragment();switch(n){case"sort-keys":l.sortKeys=!l.sortKeys;break;case"dict-mode":if(l.dictMode)l.dictMode=null;else{var f=l.dictMode={keys:new Set,count:0,map:Object.create(null)};l.forEach((function(e,t){for(var n in t)hasOwnProperty.call(t,n)&&(f.keys.add(n),f.count++,(0,r.collectStat)(t[n],1,f.map))}))}break;default:null===l.properties?(l.properties=new Map,l.forEach((function(e,t){return(0,r.collectObjectMap)(t,1,l)}))):l.properties=null}(0,i.renderStat)(c,{object:l},t,s,u),o.replaceWith(c)}}}),!1),new e.view.Popup({className:"signature-details",hoverPin:"trigger-click",hoverTriggers:"\n            .view-signature .property,\n            .view-signature .type\n        ",render:function(n,r){var i=t.get(r);switch(i.type){case"property":return(0,o.renderPropertyDetails)(n,i,e);case"type":return(0,o.renderTypeDetails)(n,i,e)}}}),e.view.define("signature",(function(e,n,o){var a=n.expanded,s=n.path,l=(0,r.collectStat)(o,a),u=Array.isArray(s)?s.map((function(e,t){return"number"==typeof e?"".concat(t?"":"$","[").concat(e,"]"):"."+e})):void 0;(0,i.renderStat)(e,l,t,u)}))};var r=e("./collect-stat.js"),i=e("./render-stat.js"),o=e("./render-details.js")},{"./collect-stat.js":91,"./render-details.js":94,"./render-stat.js":95}],94:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.renderPropertyDetails=function(e,t,n){var r=t.stat.object.dictMode||t.stat.object.properties.get(t.name),i=r.count,o=r.map,a=(t.stat.object.dictMode||t.stat.object).count,s={name:t.name,path:t.path,total:a,count:i,percent:d(100*i/a,1)+"%"};n.view.render(e,[{view:"inline-list",when:"path",className:"path",data:"path",item:"text"},{view:"h1",className:"property",content:["text:name",{view:"html",when:"count != total",data:'"<span class=\\"usage-stat optional\\">" + (\n                        "(in <span class=\\"num\\">" + count + "</span> of <span class=\\"num\\">" + total + "</span> objects, <span class=\\"num\\">" + percent + "</span>)"\n                    ) + "</span>"'}]}],s),g(e,{map:o,count:i},n)},n.renderTypeDetails=v;var r=e("../../core/utils/html.js"),i=e("./const.js");function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||c(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function u(e){return function(e){if(Array.isArray(e))return f(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||c(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function c(e,t){if(e){if("string"==typeof e)return f(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?f(e,t):void 0}}function f(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function d(e,t){return e.toFixed(t).replace(/\.?0+$/,"")}function p(e){return[Math.cos(2*Math.PI*e),Math.sin(2*Math.PI*e)]}function h(e){var t=0;return['<svg viewBox="-1 -1 2 2" class="pie">'].concat(u(e.map((function(e){var n=l(p(t),2),r=n[0],i=n[1],o=l(p(t+=e.percent),2),a=o[0],s=o[1],u=e.percent>.5?1:0,c=["M ".concat(r," ").concat(i),"A 1 1 0 ".concat(u," 1 ").concat(a," ").concat(s),"L 0 0"];return'<path d="'.concat(c.join(" "),'" fill="').concat(e.color,'"/>')}))),["</svg>"]).join("\n")}function g(e,t,n){var o=t.map,a=t.count,s=function(e){var t=Object.create(null),n=function(n){t[n]=0,e[n].forEach((function(e){return t[n]+=e}))};for(var r in e)n(r);return t}(o),u=[],c=i.typeOrder.filter((function(e){return e in o}));Object.entries(s).sort((function(e,t){return l(e,2)[1]-l(t,2)[1]})).reverse().forEach((function(e,t){var n=l(e,2),o=n[0],s=n[1];u.push({name:(0,r.escapeHtml)(o),count:s,percent:s/a,percent100:d(100*s/a,1),color:i.colors[t]})})),n.view.render(e,{view:"block",when:"typeStat.size() > 1",data:"typeStat",className:"pie-stat",content:[{view:"block",content:{view:"html",data:h}},{view:"block",content:['html:"<span class=\\"list-header\\">Types usage:</span>"',{view:"list",item:'html:\n                            "<span class=\\"dot\\" style=\\"--size: 10px; background-color: " + color + "\\"></span> " +\n                            "<span class=\\"caption\\">" + name + "</span>" +\n                            "<span class=\\"times\\"> × " + count + " (" + percent100 + "%)</span>"\n                        '}]}]},u),c.forEach((function(t){return v(e,{name:t,stat:o},n)}))}function v(e,t,n){var o,s=t.stat[t.name],l=function(e){var t=0;for(var n in e)e[n].forEach((function(e){return t+=e}));return t}(t.stat),u=[];switch(t.name){case"number":var c=[],f=0,p=0,v=0,m=1/0,y=-1/0;s.forEach((function(e,t){c.push({count:e,value:t}),f+=t*e,p+=e,e>1&&v++,t<m&&(m=t),t>y&&(y=t)})),(o={type:t.name,count:p,distinct:s.size,duplicated:v,min:m,max:y,sum:f,avg:d(f/p,3),values:c.sort((function(e,t){return t.count-e.count||e.value-t.value}))}).distinct>1&&u.push({view:"block",className:"overview-stat",content:'html:\n                        "range: (min) <span class=\\"num\\">" + min + "</span> ... " +\n                        "<span class=\\"num\\">" + max + "</span> (max), " +\n                        "avg: <span class=\\"num\\">" + avg + "</span>"\n                    '});break;default:var b=[],w=0,x=0;s.forEach((function(e,t){b.push({count:e,value:t}),w+=e,e>1&&x++})),o={type:t.name,count:w,distinct:s.size,duplicated:x,values:"object"===t.name||"array"===t.name?b.sort((function(e,t){return t.count-e.count})):b.sort((function(e,t){return t.count-e.count||e.value>t.value||-(e.value<t.value)}))}}if("undefined"!==t.name&&"null"!==t.name){if(u.unshift({view:"block",className:"overview-stat",content:['html:"<span class=\\"num\\">" + count + "</span> " + (count > 1 ? "values, " : "value")',{view:"switch",when:"count > 1",content:[{when:"distinct = 1",content:'text:"a single unique value:"'},{when:"distinct = count",content:'text:"all unique, no duplicates"'},{content:['html:"<span class=\\"num\\">" + distinct + "</span> unique, "','html:duplicated = distinct ? "all occur more than once" : "<span class=\\"num\\">" + duplicated + "</span> occur more than once"']}]}]}),o.values.length>1&&o.duplicated&&"object"!==t.name&&"array"!==t.name){for(var k=[],O=10===o.values.length?10:Math.min(9,o.values.length),j=0,S=0;S<O;S++){var C=o.values[S],P=C.count,A=C.value;j+=P,k.push({name:(0,r.escapeHtml)(String(A)),count:P,percent:P/o.count,percent100:d(100*P/o.count,1),color:i.colors[S]})}if(k.length){var M=o.count-j;M>0&&k.push({name:"...",count:M,percent:M/o.count,percent100:d(100*M/o.count,1),color:i.colors[k.length]}),u.push({view:"block",className:"pie-stat",data:k,content:[{view:"block",content:{view:"html",data:h}},{view:"block",content:['html:"<span class=\\"list-header\\">Dominators:</span>"',{view:"list",item:'html:\n                                        "<span class=\\"dot\\" style=\\"--size: 10px; background-color: " + color + "\\"></span> " +\n                                        "<span class=\\"caption\\" title=\\"" + name + "\\">" + name + "</span>" +\n                                        "<span class=\\"times\\"> × " + count + " (" + percent100 + "%)</span>"\n                                    '}]}]})}}o.values.length>1?"number"!==t.name&&"string"!==t.name||u.push({view:"content-filter",name:"filter",content:{view:"menu",data:"values.[no #.filter or value~=#.filter].sort(<value>)",item:[{view:"block",className:"caption",content:"text-match:{ text: value, match: #.filter }"},{view:"block",when:"count > 1",className:"count",content:'text:" × " + count'}]}}):"number"!==t.name&&"string"!==t.name&&"boolean"!==t.name||u.push({view:"struct",data:"values.pick().value"}),"object"===t.name&&u.push({view:"list",className:"struct-list",data:"values",item:["struct:value",{view:"block",when:"count > 1",className:"count",content:'text:" × " + count'}]}),"array"===t.name&&Object.keys(s.map).length&&u.push({view:"block",className:"array-types",content:function(e){return g(e,s,n)}})}n.view.render(e,[{view:"inline-list",when:"path",className:"path",data:"path",item:'text:"." + $'},{view:"h1",className:"type",content:["text:name",'html:"<span class=\\"usage-stat\\">" + (\n                    count = total\n                        ? "only this type is used"\n                        : "used in <span class=\\"num\\">" + count + "</span> of <span class=\\"num\\">" + total + "</span> cases (<span class=\\"num\\">" + percent + "</span>)"\n                ) + "</span>"']}].concat(u),a(a({},o),{},{name:t.name,path:t.path,total:l,percent:d(100*o.count/l,1)+"%"}),{})}},{"../../core/utils/html.js":20,"./const.js":92}],95:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.renderStat=function e(t,n,l){var u=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],c=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"";Object.keys(n).sort((function(e,t){return i.typeOrder.indexOf(e)-i.typeOrder.indexOf(t)})).forEach((function(i,f){switch(f>0&&t.appendChild((0,r.createText)(" | ")),i){default:var d=t.appendChild((0,r.createElement)("span","type",i));l.set(d,{type:"type",path:u,stat:n,name:i});break;case"object":var p=n[i],h=p.properties,g=p.dictMode,v=p.sortKeys;if(null===h){l.set(t.appendChild((0,r.createElement)("span","expand","{…}")),{type:"expand",path:u,map:n[i],offset:c});break}if(0===h.size){t.appendChild((0,r.createElement)("span","object","{}"));break}var m=p.size,y=g?[["[key]",g]]:s(h.entries()),b=c+"    ",w=t.appendChild((0,r.createElement)("span","object",["{",(0,r.createElement)("span",{"data-action":"collapse"})]));h.size>1&&(w.appendChild((0,r.createElement)("span",{title:"Toggle dictionary mode (collapse all the values in a single signature)","data-action":"dict-mode","data-enabled":null!==g})),y.some((function(e,t){var n=a(e,1)[0];return 0!==t&&n<y[t-1][0]}))&&w.appendChild((0,r.createElement)("span",{title:"Toggle keys sorting","data-action":"sort-keys","data-enabled":v}))),l.set(w,{type:"shape",path:u,map:n[i],offset:c}),m>1&&(w.appendChild((0,r.createElement)("span","count")).dataset.value=String(m)),v&&y.sort((function(e,t){var n=a(e,1)[0],r=a(t,1)[0];return n<r?-1:n>r?1:0}));var x,k=o(y);try{for(k.s();!(x=k.n()).done;){var O=a(x.value,2),j=O[0],S=O[1],C=S.count,P=S.map,A=(0,r.createElement)("span","property",[j]);l.set(A,{type:"property",path:u,stat:n,name:j,map:P}),w.appendChild((0,r.createText)("\n".concat(b))),w.appendChild(A),C!==m&&null===g&&A.appendChild((0,r.createElement)("span","optional","?")),w.appendChild((0,r.createText)(": ")),e(w,P,l,u.concat(j),b),w.appendChild((0,r.createText)(";"))}}catch(e){k.e(e)}finally{k.f()}";"===w.lastChild.nodeValue&&w.appendChild((0,r.createText)("\n".concat(c))),w.appendChild((0,r.createText)("}"));break;case"array":t.appendChild((0,r.createText)("[")),e(t,n[i].map,l,u,c),t.appendChild((0,r.createText)("]"))}}))};var r=e("../../core/utils/dom.js"),i=e("./const.js");function o(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=l(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}function a(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||l(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(e){return function(e){if(Array.isArray(e))return u(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||l(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(e,t){if(e){if("string"==typeof e)return u(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?u(e,t):void 0}}function u(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}},{"../../core/utils/dom.js":19,"./const.js":92}],96:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("source",(function(t,n,o){var a=[],f=o.mime,p=o.binary,h=o.size,g=o.syntax,v=o.content,m=o.refs,y=o.error;if(o.disabled)return t.classList.add("disabled"),void(t.textContent=y);if(y)return t.classList.add("error"),void(t.textContent=y);if("string"==typeof v){if(v.length<102400){var b=g||u.get(f);b&&a.push("discovery-view"===b||"discovery-query"===b?[c(b,e),{html:{open:function(e){return'<span class="token '+e.data+'">'},close:function(){return"</span>"}}}]:(0,i.default)(b))}Array.isArray(m)&&a.push([function(e,t){return m.forEach((function(e){e.range&&t(e.range[0],e.range[1],function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({type:"spotlight"},e))}))},d]),t.innerHTML=p?"Binary content"+("number"==typeof h?" ("+h+" bytes)":""):'<div class="lines">'+v.split(/\r\n?|\n/g).map((function(e,t){return"<span>"+(t+1)+"</span>"})).join("")+"</div><div>"+(0,r.default)(a,"html")(v)+"</div>"}}))};var r=a(e("/gen/hitext.js")),i=a(e("/gen/hitext-prismjs.js")),o=a(e("/gen/codemirror.js"));function a(e){return e&&e.__esModule?e:{default:e}}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var u=new Map(Object.entries({"application/javascript":"javascript","application/x-httpd-php":"php","application/xml":"xml","application/json":"json","text/html":"html","text/css":"css","text/stylus":"stylus","text/yaml":"yaml","image/svg+xml":"svg"}));function c(e,t){var n=o.default.getMode(o.default.defaults,{name:e,isDiscoveryViewDefined:function(e){return t.view.isDefined(e)}});return function(e,t){for(var r=new o.default.StringStream(e,null),i=o.default.startState(n);!r.eol();){var a=n.token(r,i);a&&t(r.start,r.pos,a),r.start=r.pos}}}function f(e,t){var n=e&&e.className,r=[t,Array.isArray(n)?n.join(" "):"string"==typeof n&&n].filter(Boolean).join(" ");return r?' class="'.concat(r,'"'):""}var d={html:{open:function(e){var t=e.data;switch(t.type){case"link":return'<a href="'.concat(t.href,'"').concat(f(t)).concat(t.marker?' data-marker="'.concat(t.marker,'"'):"",">");case"spotlight":return"<span ".concat(f(t,"spotlight")).concat(t.marker?' data-marker="'.concat(t.marker,'"'):"",">")}},close:function(e){switch(e.data.type){case"link":return"</a>";case"spotlight":return"</span>"}}}}},{"/gen/codemirror.js":2,"/gen/hitext-prismjs.js":3,"/gen/hitext.js":4}],97:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"default",{enumerable:!0,get:function(){return i.default}});var r,i=(r=e("./struct/index.js"))&&r.__esModule?r:{default:r}},{"./struct/index.js":99}],98:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.objectKeyProtoEl=n.valueProtoEl=n.entryProtoEl=n.objectValueProto=n.arrayValueProto=n.stringValueProto=void 0;var r=e("../../core/utils/dom.js"),i={get collapse(){return(0,r.createElement)("span",{class:"struct-action-button struct-collapse-value","data-action":"collapse"})},get signature(){return(0,r.createElement)("span",{class:"struct-action-button show-signature","data-action":"show-signature"})},get actions(){return(0,r.createElement)("span",{class:"struct-action-button",title:"Value actions","data-action":"value-actions"})},get stringMode(){return(0,r.createElement)("span",{class:"struct-action-button",title:"Toggle string show mode","data-action":"toggle-string-mode"})},get sortKeys(){return(0,r.createElement)("span",{class:"struct-action-button",title:"Toggle key sorting","data-action":"toggle-sort-keys"})}},o=(0,r.createFragment)('"',i.collapse,i.actions,i.stringMode,(0,r.createElement)("span","string-length"),(0,r.createElement)("span","string-text-wrapper",[(0,r.createElement)("span","string-text")]),'"');n.stringValueProto=o;var a=(0,r.createFragment)("[",i.collapse,i.signature,i.actions,(0,r.createElement)("span","value-size"),"]");n.arrayValueProto=a;var s=(0,r.createFragment)("{",i.collapse,i.signature,i.actions,i.sortKeys,(0,r.createElement)("span","value-size"),"}");n.objectValueProto=s;var l=(0,r.createElement)("div","entry-line");n.entryProtoEl=l;var u=(0,r.createElement)("span","value");n.valueProtoEl=u;var c=(0,r.createElement)("span","label",["    ",(0,r.createElement)("span","property"),": "]);n.objectKeyProtoEl=c},{"../../core/utils/dom.js":19}],99:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(e,t,r){var i=g.get(e);if(e.classList.remove("struct-expand-value"),"string"==typeof i){var o=u.stringValueProto.cloneNode(!0),a=o.lastChild.previousSibling,s=JSON.stringify(i);m(a.firstChild,s.slice(1,-1)),m(a.previousSibling,"length: ".concat(s.length," chars")),e.innerHTML="",e.appendChild(o)}else if(Array.isArray(i)){var l=w.get(e),d=x.get(e);e.innerHTML="",e.appendChild(u.arrayValueProto.cloneNode(!0)),b(e,i,"elements"),c(e,e.lastChild,i,(function(e,r,o){n(e,r,t,d,Object.freeze({parent:l,host:i,key:o,index:o}))}),0,d.limit)}else{var p=w.get(e),h=x.get(e),v=Object.entries(i);e.innerHTML="",e.appendChild(u.objectValueProto.cloneNode(!0)),b(e,v,"entries"),function(e,t,n){t.length<=1||t.every((function(e,n){var r=f(e,1)[0];return 0===n||r>t[n-1][0]}))?e.querySelector('[data-action="toggle-sort-keys"]').remove():n&&t.sort((function(e,t){var n=f(e,1)[0],r=f(t,1)[0];return n<r?-1:n>r?1:0}))}(e,v,r),c(e,e.lastChild,v,(function(e,r,o){var a,s,l,c=f(r,2),d=c[0],g=c[1];a=e,s=d,m((l=u.objectKeyProtoEl.cloneNode(!0)).firstElementChild,s),a.appendChild(l),n(e,g,t,h,Object.freeze({parent:p,host:i,key:d,index:o}))}),0,h.limit)}}function n(n,r,i,o,s){var l=v(r),c=u.valueProtoEl.cloneNode(!0);g.set(c,r),w.set(c,s),x.set(c,o),l&&"string"!=typeof r&&i?(n.classList.add("struct-expanded-value"),t(c,i-1)):(l&&c.classList.add("struct-expand-value"),c.innerHTML=(0,a.default)(r,!1,o)),function(t,n,r,i){var o,a=function(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=d(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}(r.annotations);try{for(a.s();!(o=a.n()).done;){var s=o.value;try{var l=s.query,u=s.debug,c=e.query(l,n,i);u&&console.info({annotation:s,value:n,context:i,data:c}),c&&O.push({el:t,data:c})}catch(e){console.error(e)}}}catch(e){a.e(e)}finally{a.f()}h()}(c,r,o,s),n.appendChild(c)}function c(t,n,r,i){var o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,a=arguments.length>5&&void 0!==arguments[5]?arguments[5]:50,s=r.length-o-1,l=document.createDocumentFragment();!1===a&&(a=r.length),r.slice(o,o+a).forEach((function(e,t){var n=u.entryProtoEl.cloneNode(!0);i(n,e,o+t),t!==s&&m(n,","),l.appendChild(n)})),t.insertBefore(l,n),e.view.maybeMoreButtons(t,n,r.length,o+a,a,(function(e,o){return c(t,n,r,i,e,o)}))}function p(e,t){for(var n=[],r=w.get(e);null!==r&&null!==r.parent;)n.unshift(r.key),r=r.parent;return t?n:n.map((function(e,t){return"number"!=typeof e&&/^[a-zA-Z_][a-zA-Z_$0-9]*$/.test(e)?0===t?e:"."+e:0===t?"$[".concat(JSON.stringify(e),"]"):"[".concat(JSON.stringify(e),"]")}))}function h(){null===j&&O.length&&(j=Promise.resolve().then((function(){j=null,(0,s.default)(O),O.length&&h()}),0))}var g=new WeakMap,w=new WeakMap,x=new WeakMap,k=new WeakSet,O=[],j=null,S=new e.view.Popup({className:"view-struct-actions-popup",render:function(t,n){var a=n.parentNode,s=g.get(a),l=[];if("string"==typeof s)l=[{text:"Copy as quoted string",action:function(){return(0,o.default)(JSON.stringify(s))}},{text:"Copy as unquoted string",action:function(){return(0,o.default)(JSON.stringify(s).slice(1,-1))}},{text:"Copy a value (unescaped)",action:function(){return(0,o.default)(s)}}];else{var u=p(a).join(""),c=1073741824,f=(0,i.jsonStringifyInfo)(s),d=f.minLength,h=!1,v=!1,m=0;f.circular.length?h=v="Can't be copied: Converting circular structure to JSON":d>c?h=v="Can't be copied: Resulting JSON is over 1 Gb":(m=(0,i.jsonStringifyInfo)(s,null,4).minLength)>c&&(h="Can't be copied: Resulting JSON is over 1 Gb"),u&&l.push({text:"Copy path:",notes:(0,r.escapeHtml)(u),action:function(){return(0,o.default)(u)}}),l.push({text:"Copy as JSON",notes:"(formatted".concat(y(m),")"),error:h,disabled:Boolean(h),action:function(){return(0,o.default)(JSON.stringify(s,null,4))}}),l.push({text:"Copy as JSON",notes:"(compact".concat(v?"":y(d),")"),error:v,disabled:Boolean(v),action:function(){return(0,o.default)(JSON.stringify(s))}})}e.view.render(t,{view:"menu",onClick:function(e){S.hide(),e.action()},item:["html:text",{view:"block",when:"notes",className:"notes",content:"html:notes"},{view:"block",when:"error",className:"error",content:"text:error"}]},l)}}),C=new e.view.Popup({hoverPin:"popup-hover",hoverTriggers:".view-struct .show-signature",render:function(t,n){var r=n.parentNode,i=g.get(r);e.view.render(t,{view:"signature",expanded:2,path:p(r,!0)},i)}}),P=function(e){var n,r,i,o="expand",s=e.target.closest("\n            .view-struct.struct-expand,\n            .view-struct .struct-expand-value,\n            .view-struct .struct-action-button\n        ");if(s)switch(s.dataset.action&&(o=s.dataset.action),o){case"expand":s.classList.contains("struct-expand")&&(s=s.lastChild),t(s,0),h(),s.parentNode.classList.add("struct-expanded-value"),k.has(s.parentNode)&&s.parentNode.classList.remove("struct-expand");break;case"collapse":s=s.parentNode,n=s,r=x.get(n),i=g.get(n),n.classList.add("struct-expand-value"),n.innerHTML=(0,a.default)(i,!1,r),h(),s.parentNode.classList.remove("struct-expanded-value"),k.has(s.parentNode)&&s.parentNode.classList.add("struct-expand");break;case"show-signature":C.show(s);break;case"value-actions":S.show(s);break;case"toggle-sort-keys":t(s.parentNode,0,s.parentNode.classList.toggle("sort-keys")),h();break;case"toggle-string-mode":var l=(s=s.parentNode).querySelector(".string-text").firstChild;l.nodeValue=s.classList.toggle("string-value-as-text")?JSON.parse('"'.concat(l.nodeValue,'"')):JSON.stringify(l.nodeValue).slice(1,-1)}};return e.addGlobalEventListener("click",P,!1),e.view.define("struct",(function(t,r,i){var o=r.expanded,a=r.limit,s=r.limitCollapsed,l=r.annotations,u=v(i),c={limitCollapsed:e.view.listLimit(s,4),limit:e.view.listLimit(a,50),annotations:e.annotations.concat(l||[]),maxStringLength:150,maxLinearStringLength:50};k.add(t),n(t,i,o,c,{parent:null,host:{"":i},key:"",index:0}),h(),u&&!o&&t.classList.add("struct-expand")}),{usage:l.default}),function(){document.removeEventListener("click",P,!1)}};var r=e("../../core/utils/html.js"),i=e("../../core/utils/json.js"),o=c(e("../../core/utils/copy-text.js")),a=c(e("./value-to-html.js")),s=c(e("./render-annotations.js")),l=c(e("./struct.usage.js")),u=e("./el-proto.js");function c(e){return e&&e.__esModule?e:{default:e}}function f(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||d(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function d(e,t){if(e){if("string"==typeof e)return p(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?p(e,t):void 0}}function p(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var h=Object.prototype.hasOwnProperty,g=Object.prototype.toString;function v(e){if(Array.isArray(e))return e.length>0;if("string"==typeof e&&(e.length>150||/[\r\n\f\t]/.test(e)))return!0;if(e&&"[object Object]"===g.call(e))for(var t in e)if(h.call(e,t))return!0;return!1}function m(e,t){e.appendChild(document.createTextNode(t))}function y(e){return e?", "+String(e).replace(/\B(?=(\d{3})+$)/g,'<span class="num-delim"></span>')+" bytes":""}function b(e,t,n){t.length>1&&m(e.lastElementChild,t.length+" "+n)}},{"../../core/utils/copy-text.js":17,"../../core/utils/html.js":20,"../../core/utils/json.js":22,"./el-proto.js":98,"./render-annotations.js":100,"./struct.usage.js":101,"./value-to-html.js":102}],100:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){for(var t=Date.now(),n=0;n<e.length&&!(n%20==0&&Date.now()-t>10);n++){var a=e[n],s=a.el,l=a.data,u=l.place,c=void 0===u?"after":u,f=l.className,d=l.text,p=void 0===d?"object"!==i(l)?String(l):"":d,h=l.title,g=l.icon,v=l.href,m=l.external,y=["value-annotation","style-"+(o.includes(l.style)?l.style:"before"===c?"none":"default"),"before"===c?"before":"after",""!==p?"has-text":"",f||""].join(" "),b=(0,r.createElement)(v?"a":"span",{class:y,title:h,href:v,target:m?"_blank":void 0},""!==p?[p]:void 0);g&&(b.classList.add("icon"),/^[a-z_$][a-z0-9_$-]*$/i.test(g)?b.classList.add("icon-"+g):b.style.setProperty("--annotation-image",'url("'.concat(g,'")'))),"before"===c?s.before(b):s.parentNode.append(b)}e.splice(0,n)};var r=e("../../core/utils/dom.js");function i(e){return(i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var o=["none","default","badge"]},{"../../core/utils/dom.js":19}],101:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"struct",data:{foo:"bar",baz:[1,2,3]}},examples:[{title:"Define expanded levels by default and limit entries when collapsed and expanded",demo:{view:"struct",expanded:2,limit:5,limitCollapsed:1,data:{level1:{level2:{level3:{level4:{}},level3_2:2,level3_3:3,level3_4:4,level3_5:5,level2_6:6},level2_2:2,level2_3:3,level2_4:4,level2_5:5,level2_6:6},level1_2:2,level1_3:3,level1_4:4,level1_5:5,level1_6:6,level1_7:7}}}]}},{}],102:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function e(t,n,l){switch(i(t)){case"boolean":case"undefined":return a("keyword",t);case"number":case"bigint":var u=String(t);return u.length>3&&(u=u.replace(/\..+$|\B(?=(\d{3})+(\D|$))/g,(function(e){return e||'<span class="num-delim"></span>'}))),a("number",u);case"symbol":return a("symbol",t);case"function":return"ƒn";case"string":var c=n?l.maxLinearStringLength:l.maxStringLength;if(t.length>c+15)return a("string",(0,r.escapeHtml)(JSON.stringify(t.substr(0,c))).replace(/"$/,s(t.length-c)+'"'));var f=(0,r.escapeHtml)(JSON.stringify(t));return a("string",n||"h"!==t[0]&&"/"!==t[0]||!o.test(t)?f:'"<a href="'.concat((0,r.escapeHtml)(t),'" target="_blank">').concat(f.substr(1,f.length-2),'</a>"'));case"object":if(null===t)return a("keyword","null");switch(toString.call(t)){case"[object Array]":var d=!1===l.limitCollapsed?t.length:l.limitCollapsed,p=t.slice(0,d).map((function(t){return e(t,!0,l)}));return t.length>d&&p.push("".concat(s(t.length-d)," ")),"[".concat(p.join(", "),"]");case"[object Date]":return a("date",t);case"[object RegExp]":return a("regexp",t)}if(n){for(var h in t)if(hasOwnProperty.call(t,h))return"{…}";return"{}"}var g=!1===l.limitCollapsed?1/0:l.limitCollapsed,v=[],m=0;for(var y in t)hasOwnProperty.call(t,y)&&(m<g&&v.push("".concat(a("property",y),": ").concat(e(t[y],!0,l))),m++);return m>g&&v.push(s(m-g)),v.length?"{ ".concat(v.join(", ")," }"):"{}";default:return'unknown type "'.concat(i(t),'"')}};var r=e("../../core/utils/html.js");function i(e){return(i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var o=/^(?:https?:)?\/\/(?:[a-z0-9]+(?:\.[a-z0-9]+)+|\d+(?:\.\d+){3})(?:\:\d+)?(?:\/\S*?)?$/i;function a(e,t){return'<span class="'.concat(e,'">').concat(t,"</span>")}function s(e){return a("more","…".concat(e," more…"))}},{"../../core/utils/html.js":20}],103:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("switch",(function(t,n,r,i){var o=n.content,a='alert-warning:"No case choosen"';if(Array.isArray(o))for(var s=0;s<o.length;s++){var l=o[s];if(l&&e.queryBool(l.when||!0,r,i)){a="data"in l?{view:"context",data:l.data,content:l.content}:l.content;break}}e.view.render(t,a,r,i)}),{tag:!1,usage:i.default})};var r,i=(r=e("./switch.usage.js"))&&r.__esModule?r:{default:r}},{"./switch.usage.js":104}],104:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"switch",data:{enabled:!0},content:[{when:"not enabled",content:'text:"I am disabled"'},{when:"enabled",content:'text:"I am enabled"'}]},examples:[{title:"Using with tabs",demo:{view:"context",modifiers:{view:"tabs",tabs:["foo","bar","baz"],name:"section"},content:{view:"switch",content:[{when:'#.section="foo"',content:'text:"FOO!"'},{when:'#.section="bar"',content:'text:"BAR!!"'},{content:'text:"When no other conditions are met"'}]}}}]}},{}],105:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("tab",(function(t,n,r,i){var o=n.content,a=n.active,s=void 0!==a&&a,l=n.disabled,u=void 0!==l&&l,c=n.onClick,f=n.value,d=n.text,p=void 0===d?String(f).replace(/^./,(function(e){return e.toUpperCase()})):d;if(e.query(u,r,i)?t.classList.add("disabled"):"function"==typeof c&&(t.addEventListener("click",(function(){return c(f)})),t.classList.add("onclick")),s&&t.classList.add("active"),o)return e.view.render(t,o,r,i);t.textContent=p}),{usage:i.default})};var r,i=(r=e("./tab.usage.js"))&&r.__esModule?r:{default:r}},{"./tab.usage.js":106}],106:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=function(){return alert("clicked!")},i={demo:{view:"tabs",name:"tabs",tabs:[{value:"one",text:"One"},{value:"two",text:"Two"},{value:"three",text:"Three"}],content:{view:"switch",content:[{when:'#.tabs="one"',content:'text:"One"'},{when:'#.tabs="two"',content:'text:"Two"'},{when:'#.tabs="three"',content:'text:"Three"'}]}},examples:[{title:"Active & disabled tab",demo:{view:"tabs",name:"tabs",tabs:[{value:"one",text:"One"},{value:"two",text:"Two",active:!0},{value:"three",text:"Three",disabled:!0}],content:{view:"switch",content:[{when:'#.tabs="one"',content:'text:"One"'},{when:'#.tabs="two"',content:'text:"Two"'},{when:'#.tabs="three"',content:'text:"Three"'}]}}},{title:"On click handler",demo:{view:"tabs",name:"tabs",tabs:[{value:"one",text:"One",onClick:r},{value:"two",text:"Two",onClick:r},{value:"three",text:"Three",onClick:r}],content:{view:"switch",content:[{when:'#.tabs="one"',content:'text:"One"'},{when:'#.tabs="two"',content:'text:"Two"'},{when:'#.tabs="three"',content:'text:"Three"'}]}}}]};n.default=i},{}],107:[function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("table-cell",(function(t,n,o,a){var s=n.content,l=n.details;if("function"==typeof s){if(!(s=s(o,a)))return;s=s.content}if((l||!s&&o&&"object"===r(o))&&(t.classList.add("details"),t.addEventListener("click",(function(n){var r=n.target;if(r===t){var s=r.parentNode,u=s.parentNode,c=Array.from(u.querySelectorAll(".view-table-cell.details-expanded")).find((function(e){return e.parentNode.parentNode===u})),f=null;if(c){var d=c.parentNode;if(c.classList.remove("details-expanded"),c===t)return void s.parentNode.removeChild(s.nextSibling);d!==s?d.parentNode.removeChild(d.nextSibling):(f=s.nextSibling.firstChild).innerHTML=""}null===f&&((f=s.parentNode.insertBefore(document.createElement("tr"),s.nextSibling).appendChild(document.createElement("td"))).parentNode.className="view-table-cell-details-content",f.colSpan=1e3),t.classList.add("details-expanded"),e.view.render(f,l||i,o,a)}}))),s)return e.view.render(t,s,o,a);!function(e,t){if(Array.isArray(t))return e.classList.add("complex"),void(e.textContent=t.length?"[…]":"[]");if(t&&"object"===r(t)){for(var n in e.classList.add("complex"),t)if(Object.prototype.hasOwnProperty.call(t,n))return void(e.textContent="{…}");return void(e.textContent="{}")}if(void 0===t)return void(e.textContent="");"number"==typeof t&&e.classList.add("number");e.textContent=t}(t,o)}),{tag:"td"})};var i={view:"struct",expanded:1}},{}],108:[function(e,t,n){"use strict";function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("table-row",(function(t,n,r,o){var a=n.cols;Array.isArray(a)&&a.forEach((function(n,a){return e.view.render(t,n,r,i(i({},o),{},{colIndex:a}))}))}),{tag:"tr"})}},{}],109:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("table",(function(t,n,r,i){var s=this,u=n.cols,f=n.rowConfig,v=n.limit,m=u&&"object"===l(u)?u:{},y=!1;Array.isArray(r)||(r=r?[r]:[]);var b=t.appendChild((0,o.createElement)("thead")),w=[],x=t.appendChild((0,o.createElement)("tbody")),k=t.appendChild((0,o.createElement)("tbody")).appendChild((0,o.createElement)("tr")).appendChild((0,o.createElement)("td")),O=function(t){x.innerHTML="",k.innerHTML="";var n,r=a(w);try{for(r.s();!(n=r.n()).done;){var o=n.value,l=g(t,o.sorting);o.el.classList.toggle("asc",1===l),o.el.classList.toggle("desc",-1===l)}}catch(e){r.e(e)}finally{r.f()}e.view.renderList(x,s.composeConfig({view:"table-row",cols:u},f),t,i,0,e.view.listLimit(v,25),k)};if(Array.isArray(u))u=u.map((function(e,t){return"string"==typeof e?p(e):c({header:"col"+t,view:"table-cell"},e)}));else{var j=new Set;u=[],r.forEach((function(e){if(e&&"object"===l(e))for(var t in e)j.add(t);else y=!0})),Object.keys(m).forEach((function(e){return m[e]?j.add(e):j.delete(e)})),y&&u.push({header:"[value]",view:"table-cell",data:String}),j.forEach((function(e){return u.push(d.call(m,e)?function(e,t){"string"==typeof t&&(t={content:t});return d.call(t,"content")||d.call(t,"data")?c({header:e,view:"table-cell"},t):c(c({},p(e)),t)}(e,m[e]):p(e))}))}var S,C=a(u=u.filter((function(t){return!d.call(t,"when")||e.queryBool(t.when,r,i)})));try{var P=function(){var t=S.value;if(d.call(t,"whenData")&&void 0!==t.whenData){var n=t.whenData,a=t.content;t.whenData=void 0,t.content=function(t,r){return e.queryBool(n,t,r)?{content:a}:void 0}}var s=b.appendChild((0,o.createElement)("th")),l={el:s};w.push(l),s.textContent=t.header;var u=e.query(d.call(t,"sorting")?t.sorting:h(t.content,!0)||h(t.data),null,i),c="function"==typeof u?g(r,u):0;0!==c?(t.sorting=u,l.sorting=u,s.classList.add("sortable"),s.addEventListener("click",(function(){s.classList.contains("asc")?O(r.slice().sort((function(e,t){return-u(e,t)}))):s.classList.contains("desc")&&!c?O(r):O(r.slice().sort(u))}))):t.sorting=!1};for(C.s();!(S=C.n()).done;)P()}catch(e){C.e(e)}finally{C.f()}k.colSpan=u.length,O(r)}),{tag:"table",usage:i.default})};var r,i=(r=e("./table.usage.js"))&&r.__esModule?r:{default:r},o=e("../core/utils/dom.js");function a(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=function(e,t){if(!e)return;if("string"==typeof e)return s(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return s(e,t)}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,l=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){l=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(l)throw o}}}}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function l(e){return(l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function u(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?u(Object(n),!0).forEach((function(t){f(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function f(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var d=Object.hasOwnProperty;function p(e){return{header:e,view:"table-cell",data:function(t){return t[e]},sorting:"$[".concat(JSON.stringify(e),"] ascN")}}function h(e,t){if("string"==typeof e){if(t){var n=e.indexOf(":");if(-1===n)return;e=e.slice(n+1)}return"(".concat(e||"$",") ascN")}}function g(e,t){if("function"!=typeof t)return!1;for(var n=0,r=1;r<e.length;r++){var i=Math.sign(t(e[r-1],e[r]));if(i){if(n&&i!==n)return!1;n=i}}return-n}},{"../core/utils/dom.js":19,"./table.usage.js":110}],110:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"table",data:[{foo:1,bar:"bar",baz:"zab"},{foo:2,baz:"xyz"},{foo:3,bar:"qux",baz:"baz"},{foo:4,bar:"aaa",baz:"abc"}]},examples:[{title:"Columns setup",demo:{view:"table",cols:[{header:"Header Col 1",data:"col1",content:'text:"prefix-" + $'},{header:"Header Col 3",data:"col3",content:'text:$ + "-suffix"'}],data:[{col1:"foo",col2:"bar",col3:"baz"},{col1:"qux",col2:"oof",col3:"zab"}]}}]}},{}],111:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("tabs",(function(t,n,r,i){function a(t){var n=x?p:d;if(k!==t){var o=c||f||u?s(s({},i),{},l({},h,t)):null;k=t,x=!0,Array.isArray(g)&&(m.innerHTML="",c&&(b.innerHTML="",e.view.render(b,c,r,o),m.appendChild(b)),g.forEach((function(t){return e.view.render(m,e.view.composeConfig(t,{active:t.value===k}),r,i)})),f&&(w.innerHTML="",e.view.render(w,f,r,o),m.appendChild(w))),u&&(y.innerHTML="",e.view.render(y,u,r,o)),"function"==typeof n&&n(k,h,r,i)}}var u=n.content,c=n.beforeTabs,f=n.afterTabs,d=n.onInit,p=n.onChange,h=n.name,g=n.tabs,v=n.tabConfig,m=t.appendChild(document.createElement("div")),y=null,b=null,w=null,x=!1,k=NaN,O="value"in n?n.value:h in i?i[h]:void 0;g=e.query(g,r,i),v=e.view.composeConfig({view:"tab",onClick:a},v),m.className="view-tabs-buttons",c&&((b=document.createElement("div")).className="view-tabs-buttons-before"),f&&((w=document.createElement("div")).className="view-tabs-buttons-after"),u&&((y=t.appendChild(document.createElement("div"))).className="view-tabs-content"),"string"!=typeof h&&(h="filter"),g=Array.isArray(g)?g.map((function(e){var t=o(e);return"string"!==t&&"number"!==t&&"boolean"!==t||(e={value:e}),(void 0===O||e.active)&&(O=e.value),s(s({},v),e)})):[],a(O)}),{usage:i.default})};var r,i=(r=e("./tabs.usage.js"))&&r.__esModule?r:{default:r};function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},{"./tabs.usage.js":112}],112:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r={demo:{view:"tabs",name:"tabs",tabs:[{value:"one",text:"One"},{value:"two",text:"Two"},{value:"three",text:"Three"}],content:{view:"switch",content:[{when:'#.tabs="one"',content:'text:"One"'},{when:'#.tabs="two"',content:'text:"Two"'},{when:'#.tabs="three"',content:'text:"Three"'}]}},examples:[{title:"With before and after content",demo:{view:"tabs",name:"tabs",tabs:[{value:"one",text:"One"},{value:"two",text:"Two"},{value:"three",text:"Three"}],beforeTabs:'h1:"I am before tabs"',afterTabs:'h1:"I am after tabs"',content:{view:"switch",content:[{when:'#.tabs="one"',content:'text:"One"'},{when:'#.tabs="two"',content:'text:"Two"'},{when:'#.tabs="three"',content:'text:"Three"'}]}}},{title:"On change handler",demo:{view:"tabs",name:"tabs",tabs:[{value:"one",text:"One"},{value:"two",text:"Two"},{value:"three",text:"Three"}],onChange:function(){return alert("changed!")},content:{view:"switch",content:[{when:'#.tabs="one"',content:'text:"One"'},{when:'#.tabs="two"',content:'text:"Two"'},{when:'#.tabs="three"',content:'text:"Three"'}]}}}]};n.default=r},{}],113:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t=document.createElement("span");t.className="view-text-match",e.view.define("text-match",(function(e,n,r){var i=r.text,a=r.match;("[object RegExp]"===o.call(a)?String(i).split(a):[String(i)]).forEach((function(n,r){if(""!==n){var i=e;r%2&&(i=i.appendChild(t.cloneNode())),i.appendChild(document.createTextNode(n))}}))}),{tag:!1,usage:i.default})};var r,i=(r=e("./text-match.usage.js"))&&r.__esModule?r:{default:r};var o=Object.prototype.toString},{"./text-match.usage.js":114}],114:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"text-match",data:{text:"I am matched text or a text with matches!",match:/(match)/}}}},{}],115:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("text",(function(e,t,n){e.appendChild(document.createTextNode(String(n)))}),{tag:!1,usage:i.default})};var r,i=(r=e("./text.usage.js"))&&r.__esModule?r:{default:r}},{"./text.usage.js":116}],116:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default={demo:{view:"text",data:'"Hello world!"'},examples:[{title:"Shorthand usage",view:'text:"Hello world!"'}]}},{}],117:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){e.view.define("toc-section",(function(t,n,r,i){var o=n.header,a=n.content;e.view.render(t,[{view:"block",className:"header",content:o},{view:"block",className:"content",content:a}],r,i)}),{tag:"section"})}},{}],118:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){var t=new WeakMap;e.addGlobalEventListener("click",(function(e){var n=e.target.closest(".view-tree-leaf-toggle");if(n){var r=t.get(n),i=!n.parentNode.classList.toggle("collapsed");"function"==typeof r.render&&r.render(),"function"==typeof r.onToggle&&r.onToggle(i,n.parentNode,r.data,r.context)}}),!1),e.view.define("tree-leaf",(function(n,i,o,a){var s=this,l=i.expanded,u=i.content,c=void 0===u?"text":u,f=i.itemConfig,d=i.collapsible,p=void 0===d||d,h=i.last,g=i.hasChildren,v=i.children,m=i.limit,y=i.onToggle,b=n.appendChild((0,r.createElement)("span","view-tree-leaf-toggle")),w=n.appendChild((0,r.createElement)("span","view-tree-leaf-content")),x=null,k=g;if(h&&n.classList.add("last"),p||n.classList.add("non-collapsible"),this.render(w,c,o,a),v&&(x=e.query(v,o,a),k=Array.isArray(x)&&x.length>0),k){var O=n.appendChild((0,r.createElement)("ul","view-tree-leaf-children")),j={data:o,context:a,onToggle:y,render:null},S=function(e,t){"number"==typeof t&&t--,s.renderList(O,s.composeConfig({view:"tree-leaf",expanded:t,itemConfig:f,content:c,collapsible:p,children:v,limit:m,onToggle:y},f),e,a,0,s.listLimit(m,25))};n.classList.add("has-children"),t.set(b,j),("function"==typeof l?l(o,a):l)?x&&S(x,l):(n.classList.add("collapsed"),x&&(j.render=function(){j.render=null,S(x,l||1)}))}}),{tag:"li"})};var r=e("../core/utils/dom.js")},{"../core/utils/dom.js":19}],119:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){function t(n,r,i,o,s,l){!1===l&&(l=i.length),i.slice(s,s+l).reduce((function(t,n){return t.then((function(){var t=r,i=t.container,s=t.itemConfig;return e.view.render(i,a(a({},s),{},{expanded:n.expanded,last:n.last,hasChildren:n.hasChildren,children:n.children}),n.data,o).then((function(){if(n.expanded&&n.hasChildren){var t=i.lastChild.querySelector(".view-tree-leaf-children");t.classList.add("incomplete"),r={container:t,itemConfig:e.view.composeConfig(s,s.itemConfig),prev:r}}else for(;n.shift--;)r.container.classList.remove("incomplete"),r=r.prev}))}))}),Promise.resolve()).then((function(){return e.view.maybeMoreButtons(n,null,i.length,s+l,l,(function(e,a){return t(n,r,i,o,e,a)}))}))}e.view.define("tree",(function(n,r,i,o){var a=r.children,s=void 0===a?"children":a,l=r.item,u=void 0===l?"text":l,c=r.itemConfig,f=r.collapsible,d=r.emptyText,p=r.onToggle,h=r.expanded,g=r.limit,v=r.limitLines,m=void 0===v||v;if(!1!==d&&""!==d&&n.setAttribute("emptyText",d||"Empty tree"),!Array.isArray(i)&&i&&(i=[i]),Array.isArray(i))if(g=e.view.listLimit(g,25),m=e.view.listLimit(m,25),h="function"==typeof h?h:e.view.listLimit(h,1),m){var y=function(t,n,r,i){var o=[],a=new Set;return function t(i,s){var l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;i.forEach((function(i,u,c){var f=e.query(r,i,n),d=Array.isArray(f)&&f.length>0,p=u===c.length-1,h=a.has(i)?0:"function"==typeof s?s(i,n):s;a.add(i),o.push({data:i,expanded:h,last:p,hasChildren:d,children:h?null:r,shift:!p||h&&d?0:l+1}),d&&h&&t(f,"number"==typeof s?s-1:s,p?l+1:0)}))}(t,i),o}(i,o,s,h);t(n,{container:n,itemConfig:this.composeConfig({view:"tree-leaf",itemConfig:c,content:u,collapsible:f,onToggle:p},c)},y,o,0,m)}else this.renderList(n,this.composeConfig({view:"tree-leaf",itemConfig:c,content:u,collapsible:f,expanded:h,children:s,limit:g,onToggle:p},c),i,o,0,g)}),{tag:"ul",usage:i.default})};var r,i=(r=e("./tree.usage.js"))&&r.__esModule?r:{default:r};function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},{"./tree.usage.js":120}],120:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r={demo:{view:"tree",item:"text:text",data:{text:"Root",children:[{text:"Child"},{text:"Another child",children:[{text:"Lvl 2 child"},{text:"Lvl 2 child"}]}]}},examples:[{title:"Expanded tree",demo:{view:"tree",item:"text:text",expanded:999,data:{text:"Root",children:[{text:"Child"},{text:"Another child",children:[{text:"Lvl 2 child"},{text:"Lvl 2 child"}]}]}}},{title:"With empty text",demo:{view:"tree",emptyText:"This tree is empty",data:null}},{title:"With toggle handler",demo:{view:"tree",item:"text:text",onToggle:function(){return alert("toggled!")},data:{text:"Root",children:[{text:"Child"},{text:"Another child",children:[{text:"Lvl 2 child"},{text:"Lvl 2 child"}]}]}}}]};n.default=r},{}],121:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=m(e("../core/emitter.js")),i=m(e("../core/view.js")),o=m(e("../core/preset.js")),a=m(e("../core/page.js")),s=m(e("../core/object-maker.js")),l=v(e("../views/index.js")),u=v(e("../pages/index.js")),c=e("../core/utils/dom.js"),f=e("../core/utils/compare.js"),d=e("./nav.js"),p=v(e("../lib.js")),h=m(e("/gen/jora.js"));function g(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return g=function(){return e},e}function v(e){if(e&&e.__esModule)return e;if(null===e||"object"!==O(e)&&"function"!=typeof e)return{default:e};var t=g();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){var o=r?Object.getOwnPropertyDescriptor(e,i):null;o&&(o.get||o.set)?Object.defineProperty(n,i,o):n[i]=e[i]}return n.default=e,t&&t.set(e,n),n}function m(e){return e&&e.__esModule?e:{default:e}}function y(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||x(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function b(e,t,n,r,i,o,a){try{var s=e[o](a),l=s.value}catch(e){return void n(e)}s.done?t(l):Promise.resolve(l).then(r,i)}function w(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=x(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}function x(e,t){if(e){if("string"==typeof e)return k(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?k(e,t):void 0}}function k(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function O(e){return(O="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function j(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function S(e,t){return(S=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function C(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=M(e);if(t){var i=M(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return P(this,n)}}function P(e,t){return!t||"object"!==O(t)&&"function"!=typeof t?A(e):t}function A(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function M(e){return(M=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function T(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?_(Object(n),!0).forEach((function(t){E(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):_(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function E(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var L=new WeakMap,N=new WeakMap,D=new WeakMap,I=function(e){return e},F=function(e){return Object.fromEntries(e)};function R(e,t,n){n?e.dataset[t]=!0:delete e.dataset[t]}function $(e,t,n,r){var i=function(e,t,n,r){var i=e.page.get(t);return i&&Object.hasOwnProperty.call(i.options,n)?i.options[n]:r}(e,t,n,r);return"function"==typeof i?i:r}function H(e){var t=new s.default,n=[],r=[],i={query:function(){return e.query.apply(e,arguments)},pageLink:function(t,n,r){return e.encodePageHash(n,t,r)},marker:function(e,n){return t.lookup(e,n)},markerAll:function(e){return t.lookupAll(e)}},o=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];"boolean"==typeof t&&(t={debug:t}),r.push(T({query:e},t))};return{apply:function(){Object.assign(e,{objectMarkers:t,linkResolvers:n,annotations:r,queryExtensions:i})},methods:{defineObjectMarker:function(r,i){var a=t.define(r,i)||{},s=a.page,l=a.mark,u=a.lookup;if(!u)return function(){};if(null!==s){if(!e.page.isDefined(i.page))return void console.error('[Discovery] Page reference "'.concat(i.page,"\" doesn't exist"));n.push((function(e){var t=u(e);if(null!==t)return{type:s,text:t.title,href:t.href,entity:t.object}})),o((function(e,t){var n=u(e);if(n&&n.object!==t.host)return{place:"before",style:"badge",text:s,href:n.href}}))}else o((function(e,t){var n=u(e);if(n&&n.object!==t.host)return{place:"before",style:"badge",text:r}}));return l},addValueAnnotation:o,addQueryHelpers:function(e){Object.assign(i,e)}}}}var W=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&S(e,t)}(g,e);var t,n,r,s=C(g);function g(e,t,n){var r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,g),(r=s.call(this)).lib=p,r.options=n||{},r.view=new i.default(A(r)),r.nav=new d.WidgetNavigation(A(r)),r.preset=new o.default(r.view),r.page=new a.default(r.view),r.page.on("define",(function(e,t){if(void 0!==t.options.resolveLink&&console.warn('"resolveLink" in "page.define()" options is deprecated, use "page" option for "defineObjectMarker()" method in prepare function'),r.pageId===e&&"#"!==r.pageHash){var n=r.pageHash;r.pageHash="#",r.setPageHash(n),r.cancelScheduledRender()}})),D.set(A(r),new Set),r.prepare=function(e){return e},r.objectMarkers=[],r.linkResolvers=[],r.annotations=[],r.queryExtensions={query:function(){var e;return(e=r).query.apply(e,arguments)},pageLink:function(e,t,n){return r.encodePageHash(t,e,n)}},r.defaultPageId=r.options.defaultPageId||"default",r.reportPageId=r.options.reportPageId||"report",r.pageId=r.defaultPageId,r.pageRef=null,r.pageParams={},r.pageHash=r.encodePageHash(r.pageId,r.pageRef,r.pageParams),r.instanceId=function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:16,t=function(e){return Math.round(e).toString(36)},n=t(10+25*Math.random());n.length<e;)n+=t(Date.now()*Math.random());return n.substr(0,e)}(),r.isolateStyleMarker=r.options.isolateStyleMarker||"style-boundary-8H37xEyN",r.dom={},r.apply(l),r.apply(u),t&&r.page.define(r.defaultPageId,t),r.options.extensions&&r.apply(r.options.extensions),r.setContainer(e),r}return t=g,(n=[{key:"apply",value:function(e){var t=this;Array.isArray(e)?e.forEach((function(e){return t.apply(e)})):"function"==typeof e?e.call(window,this):e?this.apply(Object.values(e)):console.error("Bad type of extension:",e)}},{key:"setPrepare",value:function(e){if("function"!=typeof e)throw new Error("An argument should be a function");this.prepare=e}},{key:"setData",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=Date.now(),i=H(this);this._extensitionApi=i.methods;var o=function(){if(L.get(t)!==a)throw new Error("Prevented by another setData()")},a=Promise.resolve(e).then((function(e){return o(),t.prepare(e,i.methods)||e})).then((function(e){o(),t.data=e,t.context=n,i.apply(t),t.emit("data"),console.log("[Discovery] Data prepared in ".concat(Date.now()-r,"ms"))}));return L.set(this,a),a.then((function(){t.scheduleRender("sidebar"),t.scheduleRender("page")})),a}},{key:"addEntityResolver",value:function(){console.error('[Discovery] "Widget#addEntityResolver()" method was removed, use "defineObjectMarker()" instead, i.e. setPrepare((data, { defineObjectMarker }) => objects.forEach(defineObjectMarker(...)))')}},{key:"addValueLinkResolver",value:function(){console.error('[Discovery] "Widget#addValueLinkResolver()" method was removed, use "defineObjectMarker()" with "page" option instead, i.e. setPrepare((data, { defineObjectMarker }) => objects.forEach(defineObjectMarker("marker-name", { ..., page: "page-name" })))')}},{key:"resolveValueLinks",value:function(e){var t=[],n=O(e);if(e&&("object"===n||"string"===n)){var r,i=w(this.linkResolvers);try{for(i.s();!(r=i.n()).done;){var o=(0,r.value)(e);o&&t.push(o)}}catch(e){i.e(e)}finally{i.f()}}return t.length?t:null}},{key:"query",value:function(e,t,n){switch(O(e)){case"function":return e(t,n);case"string":return(0,h.default)(e,{methods:this.queryExtensions})(t,n);default:return e}}},{key:"queryBool",value:function(){try{return h.default.buildin.bool(this.query.apply(this,arguments))}catch(e){return!1}}},{key:"querySuggestions",value:function(e,t,n,r){var i,o=["property","value","method"];try{var a=N.get(this);if(!a||a.query!==e||a.data!==n||a.context!==r){var s={methods:this.queryExtensions,tolerant:!0,stat:!0};N.set(this,a={query:e,data:n,context:r,suggestion:function(){}}),Object.assign(a,(0,h.default)(e,s)(n,r))}if(i=a.suggestion(t))return i.filter((function(e){return e.value!==e.current&&(0,f.fuzzyStringCompare)(e.current,e.value)})).sort((function(e,t){return o.indexOf(e.type)-o.indexOf(t.type)||(e.value<t.value?-1:1)}))}catch(e){return console.groupCollapsed("[Discovery] Error on getting suggestions for query"),console.error(e),void console.groupEnd()}}},{key:"getQueryEngineInfo",value:function(){return{name:"jora",version:h.default.version,link:"https://github.com/discoveryjs/jora"}}},{key:"addQueryHelpers",value:function(){console.error('[Discovery] "Widget#addQueryHelpers()" method was removed, use "addQueryHelpers()" instead, i.e. setPrepare((data, { addQueryHelpers }) => addQueryHelpers(...))')}},{key:"setContainer",value:function(e){var t=e||null,n=this.dom;this.dom.container!==t&&(this.dom={},null!==t&&(this.dom.container=t,t.classList.add("discovery",this.isolateStyleMarker),t.dataset.discoveryInstanceId=this.instanceId,t.appendChild(this.dom.sidebar=(0,c.createElement)("nav","discovery-sidebar")),t.appendChild((0,c.createElement)("main","discovery-content",[this.dom.nav=(0,c.createElement)("div","discovery-content-badges"),this.dom.pageContent=(0,c.createElement)("article")])),this.nav.render(this.dom.nav)),this.emit("container-changed",this.dom,n))}},{key:"addGlobalEventListener",value:function(e,t,n){var r=this.instanceId,i=function(e){var n=e.target!==document?e.target.closest("[data-discovery-instance-id]"):null;n&&n.dataset.discoveryInstanceId===r&&t.call(this,e)};return document.addEventListener(e,i,n),function(){return document.removeEventListener(e,i,n)}}},{key:"addBadge",value:function(){console.error("Widget#addBadge() is obsoleted, use Widget#nav API instead")}},{key:"scheduleRender",value:function(e){var t,n=this,r=D.get(this);r.has(e)||(r.add(e),r.timer||(r.timer=Promise.resolve().then((t=function*(){var e,t=w(r);try{for(t.s();!(e=t.n()).done;)switch(e.value){case"sidebar":yield n.renderSidebar();break;case"page":yield n.renderPage()}}catch(e){t.e(e)}finally{t.f()}r.timer=null},function(){var e=this,n=arguments;return new Promise((function(r,i){var o=t.apply(e,n);function a(e){b(o,r,i,a,s,"next",e)}function s(e){b(o,r,i,a,s,"throw",e)}a(void 0)}))}))))}},{key:"cancelScheduledRender",value:function(e){var t=D.get(this);t&&(e?t.delete(e):t.clear())}},{key:"getRenderContext",value:function(){return T({page:this.pageId,id:this.pageRef,params:this.pageParams},this.context)}},{key:"renderSidebar",value:function(){if(D.get(this).delete("sidebar"),this.view.isDefined("sidebar")){var e=Date.now();return this.dom.sidebar.innerHTML="",this.view.render(this.dom.sidebar,"sidebar",this.data,this.getRenderContext()).then((function(){return console.log("[Discovery] Sidebar rendered in ".concat(Date.now()-e,"ms"))}))}}},{key:"encodePageHash",value:function(e,t,n){var r=$(this,e,"encodeParams",I)(n||{});return r&&"string"!=typeof r&&(Array.isArray(r)||(r=Object.entries(r)),r=r.map((function(e){return e.map(encodeURIComponent).join("=")})).join("&")),"#".concat(e!==this.defaultPageId?encodeURIComponent(e):"").concat("string"==typeof t&&t||"number"==typeof t?":"+encodeURIComponent(t):"").concat(r?"&"+r:"")}},{key:"decodePageHash",value:function(e){var t=(e.indexOf("&")+1||e.length+1)-1,n=y(e.substring(1,t).split(":").map(decodeURIComponent),2),r=n[0],i=n[1],o=$(this,r||this.defaultPageId,"decodeParams",F),a=e.substr(t+1).split("&").filter(Boolean).map((function(e){var t=e.indexOf("=");return-1!==t?[decodeURIComponent(e.slice(0,t)),decodeURIComponent(e.slice(t+1))]:[decodeURIComponent(e),!0]}));return{pageId:r||this.defaultPageId,pageRef:i,pageParams:o(a)}}},{key:"setPage",value:function(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]&&arguments[3];return this.setPageHash(this.encodePageHash(e||this.defaultPageId,t,n),r)}},{key:"setPageRef",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return this.setPage(this.pageId,e,this.pageParams,t)}},{key:"setPageParams",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return this.setPage(this.pageId,this.pageRef,e,t)}},{key:"setPageHash",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=this.decodePageHash(e),r=n.pageId,i=n.pageRef,o=n.pageParams;return!(this.pageId===r&&this.pageRef===i&&(0,f.equal)(this.pageParams,o)||(this.pageId=r,this.pageRef=i,this.pageParams=o,this.scheduleRender("page"),e===this.pageHash)||(this.pageHash=e,this.emit("pageHashChange",t),0))}},{key:"renderPage",value:function(){D.get(this).delete("page");var e=this.page.render(this.dom.pageContent,this.pageId,this.data,this.getRenderContext()),t=e.pageEl,n=e.renderState;return this.dom.pageContent=t,this.nav.render(this.dom.nav),R(this.dom.container,"dzen",this.pageParams.dzen),R(this.dom.container,"compact",this.options.compact),n}}])&&j(t.prototype,n),r&&j(t,r),g}(r.default);n.default=W},{"../core/emitter.js":10,"../core/object-maker.js":11,"../core/page.js":12,"../core/preset.js":13,"../core/utils/compare.js":16,"../core/utils/dom.js":19,"../core/view.js":25,"../lib.js":26,"../pages/index.js":28,"../views/index.js":69,"./nav.js":122,"/gen/jora.js":5}],122:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.WidgetNavigation=void 0;var r=e("../core/utils/dom.js");function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e){return function(e){if(Array.isArray(e))return l(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return l(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return l(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function u(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t){var n=[],r=function(r,i,o){switch(i){case"after":-1===(i=n.findIndex((function(e){return e.name===o})))?i=n.length:i++;break;case"before":-1===(i=n.findIndex((function(e){return e.name===o})))&&(i=n.length);break;default:void 0!==i&&!isNaN(i)&&isFinite(i)||(i=n.length)}n.splice(Math.max(0,Math.min(n.length,i)),0,e.view.composeConfig(t,r))};return Object.assign(n,{insert:r,prepend:function(e){r(e,0)},append:function(e){r(e)},before:function(e,t){r(t,"before",e)},after:function(e,t){r(t,"after",e)}})}var f=function(){function e(t){var n=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.host=t,this.popup=null,this.primary=c(t,"nav-button"),this.secondary=c(t,"nav-button"),this.menu=c(t,"menu-item"),this.config=[this.secondary,{view:"nav-button",name:"burger",data:function(){var e=(0,r.createFragment)();return n.host.view.render(e,n.menu,n.host.data,n.host.context).then((function(){return s(e.childNodes)}))},whenData:!0,onClick:function(e,t){n.popup||(n.popup=new n.host.view.Popup),n.popup.toggle(e,(function(e){return e.append.apply(e,s(t))}))}},this.primary],Object.assign(this,this.secondary)}var t,n,i;return t=e,(n=[{key:"render",value:function(){var e=this.host,t=e.view,n=e.data,r=e.context,i=e.dom,a=i&&i.nav;a&&(a.innerHTML="",t.render(a,this.config,n,o(o({},r),{},{widget:this.host})))}}])&&u(t.prototype,n),i&&u(t,i),e}();n.WidgetNavigation=f},{"../core/utils/dom.js":19}]},{},[26])(26)}));
},{}]},{},[5])(5)
});
