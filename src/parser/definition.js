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
var Node = require('./definition/node.js');
var Type = Node.Type;

/**
 * Parser.Definition
 *
 * constructs a parser-definition, holding blocks of node-trees
 */
var Definition = function(initialBlock) {

    this.blockRoot =  { };
    this.initialBlock = (initialBlock === undefined ? 'root' : initialBlock);
};

Definition.Node = Node;

/**
 * creates a definition block root node
 *
 * @param string name block name
 * @param Node root_node the root node to use
 * @param string capture optional block capture string
 */
Definition.prototype.createBlock = function(name, rootNode) {

    name = (name === null ? this.initialBlock : name);

    // store block name and capture in root node

    rootNode.match = 'block_' + name;
    this.blockRoot[name] = rootNode;
    return rootNode;
};

/**
 * check whether a block exists
 *
 * @param string name the block name
 * @return bool exists
 */
Definition.prototype.haveBlock = function(name) {
    return (this.blockRoot[name] !== undefined);
};

/**
 * returns the root node of a definition block
 *
 * @param string name name of the block of which to retrieve the root node
 * @return Node root node
 */
Definition.prototype.getBlock = function(name) {

    var node = this.blockRoot[name];

    if (node === undefined) {
        throw new Error('referencing non-existing definition block ' + name);
    }

    return node;
};

/**
 * returns the root node of the initial definition block
 *
 * @return Node root node
 */
Definition.prototype.getInitialBlock = function() {

    return this.getBlock(this.initialBlock);
};

/*
 * export
 */
module.exports = Definition;