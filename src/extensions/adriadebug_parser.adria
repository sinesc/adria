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
var AdriaParser = require('./adria_parser');
var CaptureNode = require('../language_parser/capture_node');

/**
 * AST node that returns XML like output for AST debugging purposes
 *
 * @see CaptureNode
 */
var XMLNode = function(key, value) {
    CaptureNode.call(this, key, value);
};

XMLNode.prototype = Object.create(CaptureNode.prototype);
XMLNode.prototype.constructor = XMLNode;

XMLNode.prototype.toString = function() {

    var indent = String.repeat(this.depth() * 4, ' ');
    var result = "";

    for (var childId in this.children) {

        var node = this.children[childId];

        if (node.isLeaf()) {
            result += indent + "<" + node.key + " value=\"" + node.value.replace(/\"/g, '\\"') + "\" />\n";
        } else {
            result += indent + "<" + node.key + " value=\"" + node.value.replace(/\"/g, '\\"') + "\">\n";
            result += node.toString();
            result += indent + "</" + node.key + ">\n";
        }
    }

    return result;
};

/**
 * Parser that inherits behaviour from AdriaParser but outputs as XML AST tree
 *
 * @see AdriaParser
 */
var AdriaDebugParser = AdriaParser.derive(function(transform) {
    AdriaParser.call(this, transform);
});

AdriaDebugParser.prototype.outputMethod = 'toString';

AdriaDebugParser.prototype.mapType = function(capture_name, block_name) {

    return XMLNode;
};

module.exports = AdriaDebugParser;