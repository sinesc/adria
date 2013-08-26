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
var assert = require('assert');
var path = require('path');
var XRegExp = require('./xregexp');
var util = require('./util');
var Definition = require('./parser/definition.js');
var GeneratorState = require('./parser/generator_state.js');

/**
 * Abstract parsing base class. The class uses groups of trees of match-nodes. During parsing, input tokens are tested
 * against the node tree. If a token matches, the following token has to be matched by a child of the current node.
 * This continues until a leaf is reached (in which case the token sequence is valid) or until a token does not match
 * any child, in which case processing continues with the remaining children of the current node-parent recursively
 * going down the tree.
 */
var Parser = function() {

    this.definition = new Definition('root');
    this.tokenizer  = null;
    this.file       = 'unnamed';
};

/*
 * subclassing
 */
Parser.Definition = Definition;

/**
 * constructs new instance referencing source's definition
 */
Parser.prototype.clone = function(source) {

    var OwnType = Object.getPrototypeOf(source).constructor;
    var parser = new OwnType();

    assert(parser instanceof Parser);

    parser.definition    = source.definition;
    parser.tokenizer     = source.tokenizer;

    return parser;
};

Parser.prototype.parseError = function(token, node, stack) {

    // for output simplicy, add current node to stack

    stack = stack.slice();
    stack.push({ node: node, token: token });

    // stacktrace (debugging)

    var id = stack.length -1;
    var trace = '';
    var done = 0;
    var levelNode, levelToken;

    while (id--) {
        levelNode = stack[id].node;
        levelToken = stack[id].token;

        if (levelNode instanceof Object) {
            trace += (id + 1) + '. ' + levelNode.name + (levelNode.capture !== '' ? ':' + levelNode.capture : '') + (levelNode.label !== '' ? '[' + levelNode.label + ']' : '');
        } else {
            trace += 'null entry on stack';
        }

        trace += ' at ' + levelToken.pos.toString() + ': ' + levelToken.data + '\n';

        // if after 15 items there are still more than 15 items on the stack, skip ahead to item 15

        if (done++ > 15 && id > 15) {
            id = 15;
            trace += '...\n';
        }
    }

    return '$file: Unexpected token "$tokenData" $position. Expected: $validNodes\n\nTrace:\n$trace'.format({
        file        : path.normalize(this.file),
        tokenData   : token.data,
        position    : token.pos.toString(),
        validNodes  : node.toString(this),
        trace       : trace
    });
};


/**
 * process language string according to given definition
 *
 * @param string source input string to process
 */
Parser.prototype.parse = function(source) {

    // process tokens and find entry node for the initial definition block

    util.log('Parser', 'tokenizing', 2);
    var tokens = this.tokenizer.process(source, this.file);
    util.log('Parser', 'done', -2);

    var token;
    var node = this.definition.getInitialBlock();
    var stack = [];

    // create a result array

    var len = tokens.length();
    var id = len;
    var maxId = 0
    var maxStack = [];
    var maxNode = node;
    var results = new Array(len);
    var result;

    while (id--) {
        results[id] = new GeneratorState();
    }

    // process tokens

    util.log('Parser', 'processing ' + tokens.length() + ' tokens according to currrent language definition');

    id = 0;

    while (id < len && id >= 0) {

        result = results[id];

        // on first token visit, generate matching nodes

        if (result.generator === null) {
            token = tokens.get(id);
            result.setGenerator(node.filter(this, token, stack), token);
        }

        // check for matches and store current matching node in result.node

        try {
            result.next();
        } catch (e) {
            if (e.message === 'nothing to yield') {
                break;
            } else {
                throw e;
            }
        }

        if (result.done && id < len) {

            // no more matches, discard this generator and go back one token

            result.setGenerator(null);
            id--;

        } else {

            // remember deepest positive match for error reporting

            if (id > maxId) {
                maxId = id;
                maxStack = result.stack.slice(0);
                maxNode = result.node;
            }

            // a(nother) match was found, update node and go to next token

            node = result.node;
            stack = result.stack.slice(0);
            id++;
        }
    }

    // check result

    if (id !== len) {
        throw new Error(this.parseError(tokens.get(maxId+1), maxNode, maxStack));
    }

    return results;
};

/*
 * export
 */
module.exports = Parser;