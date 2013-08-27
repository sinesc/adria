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
var fs = require('fs');
var XRegExp = require('../xregexp');
var util = require('../util');
var Parser = require('../parser');
var LanguageParser = require('../language_parser');
var AdriaNode = require('./adria_node');
var Tokenizer = require('../tokenizer');

/**
 * LanguageParser subclass defining additional Adria specific .sdt-file
 * entities and setting up blockname to class mappings.
 */
var AdriaParser = LanguageParser.derive(function(transform) {

    LanguageParser.call(this, transform);

    this.resultData = {
        globals: new util.Set(),
        requires: new util.Set(),
    };
});

AdriaParser.prototype.moduleName = '';
AdriaParser.prototype.indent = 0;

/**
 * initialize a tokenizer, load definition files into a trainer and call parent's trainself, which
 * will use the trainer to genererate the definition for this parser
 */
AdriaParser.prototype.trainSelf = function() {

    var keywords = new util.Set([
        'var', 'global',
        'if', 'else',
        'for', 'in', 'do', 'while',
        'throw', 'try', 'catch', 'finally',
        'function', 'proto', 'property',
        'switch', 'case',
        'require', 'assert',
        'delete', 'new',
        'instanceof', 'typeof'
    ]);

    var matchKeywords = function(match) {

        if (keywords.has(match.data)) {
            match.name = 'KEYWORD';
        }
        return match;
    };

    this.tokenizer = new Tokenizer([
        Tokenizer.prefab.delimited(null, '/*', '*/'),
        Tokenizer.prefab.regex(null, /\/\/.*$/m),
        Tokenizer.prefab.breaker(),
        Tokenizer.prefab.regex('REGEXP', /\/(\S|\\\ )*?[^\\]\/[a-z]*/),
        Tokenizer.prefab.set('DELIM', [ ';', '.', ',', '(', ')', '[', ']', '{', '}', '!==', '!=', '!', '++', '--' ]),
        Tokenizer.prefab.group('DELIM', [ '=', '&', '|', '<', '>', ':', '?', '+', '-', '*', '/', '%' ]),
        Tokenizer.prefab.regex('IDENT', /[a-zA-Z_\$][a-zA-Z0-9_\$]*/, matchKeywords),
        Tokenizer.prefab.number('NUMERIC'),
        Tokenizer.prefab.regex('STRING', /(["'])(?:(?=(\\?))\2.)*?\1/),
    ], [ 'KEYWORD' ]);

    util.log('AdriaParser', 'trainer processing adria .sdt-files', 2);
    this.loadDefinition('definition/adria/control.sdt');
    this.loadDefinition('definition/adria/expression.sdt');
    this.loadDefinition('definition/adria/literal.sdt');
    this.loadDefinition('definition/adria/proto.sdt');
    this.loadDefinition('definition/adria/root.sdt');
    this.loadDefinition('definition/adria/statement.sdt');
    util.log('AdriaParser', 'being trained', -2);

    LanguageParser.prototype.trainSelf.call(this);
    util.log('AdriaParser', 'done');
};

/**
 * maps capture_names to subclasses of CaptureNode
 *
 * @param string captureName node capture name (unused at the moment)
 * @param string blockName name of the block containing the node (mapped to classname)
 */
AdriaParser.prototype.mapType = function(captureName, blockName) {

    if (typeof AdriaNode[blockName] === 'function') {
        return AdriaNode[blockName];
    }

    return LanguageParser.prototype.mapType.call(this, captureName, blockName);
};

/**
 * add definition file support for ident, name and regex tag
 *
 * @return Parser.Definition.Node
 */
AdriaParser.prototype.createNode = function(name, capture, label, condition) {

    var node = LanguageParser.prototype.createNode.call(this, name, capture, label, condition);

    if (name === 'ident') {

        node.match          = '';
        node.type           = 0;
        node.tokenType      = this.tokenizer.Type.IDENT;
        node.description    = 'identifier';

    } else if (name === 'name') {

        node.match          = '';
        node.type           = 0;
        node.tokenType      = this.tokenizer.Type.IDENT | this.tokenizer.Type.KEYWORD;
        node.description    = 'name';

    } else if (name === 'regexp') {

        node.match          = '';
        node.type           = 0;
        node.tokenType      = this.tokenizer.Type.REGEXP;
        node.description    = 'regexp';
    }

    return node;
};

AdriaParser.prototype.loadSourceFromCache = function(resource) {

    LanguageParser.prototype.loadSourceFromCache.call(this, resource);

    // if sourcemapping is enabled, we also need the sourcecode

    if (this.cacheData !== null && this.transform.options.nomap !== true) {
        this.sourceCode = fs.readFileSync(resource, 'UTF-8').replace('\r\n', '\n');
    }
};

AdriaParser.prototype.postprocess = function(raw) {
//!todo crappy solution, will break strings

    // remove all blank lines except for \n\n

    raw = raw.replace(/\n[\s]*\n/g, '\n');

    // add blank line before line ending on { if the previous line does not end on , or {

    raw = raw.replace(/([^,{])(\n[^\n}]+?{\n)/g, '$1\n$2');

    // blank line between } and non-block-opening next line

    raw = raw.replace(/(}[\)]*[;]?\n)(\s*[\(A-Za-z0-9_\$][^\n]+?;\n)/g, '$1\n$2');

    // blank line at multiline-function start

    raw = raw.replace(/(function[^\n]+{\n)([^\n]+\n[\ ]*[^\ }])/g, '$1\n$2');

    // blank around single line comments

    raw = raw.replace(/([\n\ ]*)?(\n[\ ]*\/\/[^\n]*)(\n[\ ]*$)?/mg, '\n$2\n');

    return raw;
};

/*
 * export
 */
module.exports = AdriaParser;