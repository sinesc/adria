/*
 * The MIT License (MIT)
 *
 * Copyright (C) 2013 Dennis Möhlmann <mail@dennismoehlmann.de>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var XRegExp = require('./xregexp');
var Enum    = require('./util').Enum;
var Result  = require('./tokenizer/result');

/**
 * Splits strings into configurable types of tokens
 *
 * @param definition array of parser functions to use for token identification
 * @param extra array of additional token types to register with Type enum
 */
var Tokenizer = function(definition, extra) {

    this.definition = definition;

    // build type legend

    var legend = [];

    for (var id in definition) {
        legend.push(definition[id].name);
    }

    if (extra instanceof Array) {
        for (var id in extra) {
            legend.push(extra);
        }
    }

    this.Type = Enum(legend);
};

Tokenizer.Result = Result;

function Match(name, data, endPosition, containedRows, lastRowLen) {
    this.name = name;
    this.data = data;
    this.endPosition = endPosition;
    this.containedRows = containedRows;
    this.lastRowLen = lastRowLen;
}

/**
 * process a string to an array of tokens
 *
 * @param data input string
 * @param filename used in error output
 * @return array of tokens
 */
Tokenizer.prototype.process = function(data, filename) {

    var startPos = 0;
    var result = new Result(this);
    var col = 1;
    var row = 1;
    var definition = this.definition;
    var match, found, processor;

    filename = filename === undefined ? 'unnamed' : filename;

    // tokenize string

    while (startPos < data.length) {

        found = false;

        // try each parser until one matches

        for (var defId in definition) {

            processor = definition[defId];
            match = processor.func(data, startPos);

            if (match !== null) {

                if (match.data !== null && match.name !== null) {
                    result.add(match.data, match.name, startPos, col, row);
                }

                row += match.containedRows;
                col = (match.containedRows === 0 ? col + match.lastRowLen : match.lastRowLen + 1);

                found = true;
                startPos = match.endPosition;
                break;
            }
        }

        // none of the parsers were able to match the next token, error out

        if (found !== true) {
            throw new Error(filename + ': no match found at row ' + row + ', column ' + col + ': "' + data.substr(startPos).split(/\r?\n/)[0] + '"');
            return result;
        }
    }

    return result;
};

/*
 * predefined tokenizer functions
 */
Tokenizer.prefab = new (function() {

    var regexFunc = function(name, regex, callback) {
        return {
            name: name,
            func: function(data, start) {
                var result = XRegExp.exec(data, regex, start, 'sticky');

                if (result !== null) {
                    var rows = result[0].occurances('\n');
                    var lastBreak = result[0].lastIndexOf('\n');
                    var lastRowLen = result[0].length - (lastBreak + 1);

                    var match = new Match(this.name, result[0], start + result[0].length, rows, lastRowLen);

                    if (typeof callback === 'function') {
                        return callback(match);
                    } else {
                        return match;
                    }
                }

                return null;
            }
        };
    };

    this.breaker = function() {
        return regexFunc(null, /\s+/);
    };

    this.number = function(name) {
        return regexFunc(name, /\-?[0-9]+(\.[0-9]+)?(e\-?[0-9]+)?/);
    };

    this.delimited = function(name, start, end) {

        start   = start || '"';
        end     = end || start;

        var regex = XRegExp(XRegExp.escape(start) + '.*?' + XRegExp.escape(end), 's');

        return regexFunc(name, regex);
    };

    this.regex = function(name, regex, callback) {

        return regexFunc(name, regex, callback);
    };

    var excludeFunc = function(match) {

        if (this.indexOf(match.data) !== -1) {
            return null;
        }

        return match;
    };

    this.exclude = function(name, regex, exclude) {

        return regexFunc(name, regex, excludeFunc.bind(exclude));
    };

    this.set = function(name, matches) {

        var escaped = [ ];

        for (var id in matches) {
            escaped.push(XRegExp.escape(matches[id]));
        }

        var regex = XRegExp(escaped.join('|'), 's');

        return regexFunc(name, regex);
    };

    this.group = function(name, matches) {

        var escaped = [ ];

        for (var id in matches) {
            escaped.push(XRegExp.escape(matches[id]));
        }

        var regex = XRegExp('[' + escaped.join() + ']+', 's');

        return regexFunc(name, regex);
    };

    this.any = function(name) {
        return regexFunc(name, /[^\s]*/);
    };

})();

/*
 * export
 */
module.exports = Tokenizer;