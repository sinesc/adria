/*
 * The MIT License (MIT)
 *
 * Copyright (C) 2013 Dennis M�hlmann <mail@dennismoehlmann.de>
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
var XRegExp = require('./xregexp');
var util = require('./util');
var Parser = require('./parser');
var Tokenizer = require('./tokenizer');
var Path = require('./definition_parser/path');

/**
 * Parser subclass hardwired with the required node tree to process the syntax of .sdt-files.
 * Provides trainOther() method to train another parser according to input .sdt-file using
 * the other parser's createNode and integrateNodePair methods
 */
var DefinitionParser = Parser.derive(function() {

    Parser.call(this);

    this.tokenizer = new Tokenizer([
        Tokenizer.prefab.breaker(),
        Tokenizer.prefab.regex('WORD', /[a-z_]+/i),
        Tokenizer.prefab.set('DELIM', [ '->', '.', ':', '[', ']', '{', '}', '?' ]),
        Tokenizer.prefab.delimited('STRING', '"'),
        Tokenizer.prefab.delimited('STRING', '\''),
        Tokenizer.prefab.number('NUMERIC'),
        Tokenizer.prefab.delimited(null, '/*', '*/'),
        Tokenizer.prefab.regex(null, /\/\/.*$/m)
    ]);

    // create a definition for the parser definition language

    this.trainSelf();

    // during processing lists (blocks) of node pairs (paths) are required

    this.pathBlocks = { };

    // a temporary used to analyze the current path ( a -> b )

    this.currentPath = new Path();
});

/**
 * callback called by Parser.parse() for all capturepoints found in a valid path
 *
 * @param string name capture name
 * @param string value captured value
 */
DefinitionParser.prototype.capture = function(name, value) {

    // block starting subdefinition

    if (name == 'block_name') {

        this.block_name = value;
        this.pathBlocks[this.block_name] = [ ];
        return;
    }

    // construct path pairs from complete paths (i.e. a->b->c becomes a->b, b->c) [from previous capture]

    if ((name == 'path' || name == 'source_name' || name == 'block_done') && this.currentPath.name[0] != '' && this.currentPath.name[1] != '') {

        // append new path to current block, then reset it (move target to source, clear target)

        var new_path = Path.clone(this.currentPath);
        this.pathBlocks[this.block_name].push(new_path);
        this.currentPath.reset();
    }

    // process current source/target. make sure the capture/label is reset when encountering a 'name'

    if (name == 'source_name') {

        this.currentPath.name[Path.SOURCE]       = value;
        this.currentPath.capture[Path.SOURCE]    = '';
        this.currentPath.label[Path.SOURCE]      = '';
        this.currentPath.condition[Path.SOURCE]  = '';

    } else if (name == 'target_name') {

        this.currentPath.name[Path.TARGET]       = value;
        this.currentPath.capture[Path.TARGET]    = '';
        this.currentPath.label[Path.TARGET]      = '';
        this.currentPath.condition[Path.TARGET]  = '';

    } else if (name == 'source_capture') {

        this.currentPath.capture[Path.SOURCE]    = value;

    } else if (name == 'target_capture') {

        this.currentPath.capture[Path.TARGET]    = value;

    } else if (name == 'source_label') {

        this.currentPath.label[Path.SOURCE]      = value;

    } else if (name == 'target_label') {

        this.currentPath.label[Path.TARGET]      = value;

    } else if (name == 'source_condition') {

        this.currentPath.condition[Path.SOURCE]  = value.slice(1, -1);

    } else if (name == 'target_condition') {

        this.currentPath.condition[Path.TARGET]  = value.slice(1, -1);
    }
};

/**
 * parse file and use callback on captures
 */
DefinitionParser.prototype.parse = function(source) {

    // call parent

    var results = Parser.prototype.parse.call(this, source);
    var result;

    for (var id in results) {

        result = results[id];

        if (result.node.capture != '') {
            this.capture(result.node.capture, result.token.data);
        }
    }

    return results;
};

/**
 * process loaded .sdt using node_creator and node_pair_integrator callbacks from the target parser
 * effectively, this trains the target parser with a language definition
 */
DefinitionParser.prototype.trainOther = function(parser) {

    // for each path group generated by the capture callback

    for (var block_name in this.pathBlocks) {

        var block_paths = this.pathBlocks[block_name];
        var node_map    = { };
        var node_pair   = [ ];

        // for each path (in each group)

        for (var id in block_paths) {

            var path = block_paths[id];

            // try to insert both source and target node

            for (var i = 0; i < 2; i++) {

                var hash = path.name[i] + ':' + path.capture[i] + ':' + path.label[i];

                // only insert if node not already known

                node_pair[i] = node_map[hash];

                if (node_pair[i] === undefined) {

                    // use userdefined mapping to create the node

                    var node = parser.createNode(path.name[i], path.capture[i], path.label[i], path.condition[i]);

                    // remember node as known and insert it into the pair

                    node_map[hash] = node;
                    node_pair[i] = node;
                }
            }

            // user defined node-integrator

            parser.integrateNodePair(node_pair, block_name);
        }
    }
};

/**
 * prepare definition of this parser for .sdt-file parsing
 */
DefinitionParser.prototype.trainSelf = function() {

    var Type = this.tokenizer.Type;
    var block_root = new Parser.Definition.Node();
    this.definition.createBlock(null, block_root);

    // entry point is an identifier

    var blockname = block_root.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'block_name');
    var body = blockname.createAndAdd(Type.DELIM, '{', '', '{');

    // inside the body, an identifier 'source_name' is expected first (with optional secondary identifier
    // 'source_capture' and optional 'source_label')

    var node1a = body.createAndAdd(Type.WORD | Type.STRING, XRegExp('.+', 's'), 'source_name');
    var node1b = node1a.createAndAdd(Type.DELIM, ':', '', ':');
    var node1c = node1b.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'source_capture');
    var node1d = node1c.createAndAdd(Type.DELIM, '[', '', '[');
    var node1e = node1d.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'source_label');
    var node1f = node1e.createAndAdd(Type.DELIM, ']', '', ']');
    var node1g = node1f.createAndAdd(Type.DELIM, '?', '', '?');
    var node1h = node1g.createAndAdd(Type.STRING, XRegExp('.+', 's'), 'source_condition');
    node1a.add(node1d); // name[label]
    node1a.add(node1g); // name?condition
    node1c.add(node1g); // name[label]?condition

    // the connector symbol '->', attach to source_name, source_capture, source_label and source_condition

    var path1a = node1a.createAndAdd(Type.DELIM, '->', 'path', '->');
    node1h.add(path1a);
    node1f.add(path1a);
    node1c.add(path1a);

    // at least one path to another identifier has to be defined

    var node2a = path1a.createAndAdd(Type.WORD | Type.STRING, XRegExp('.+', 's'), 'target_name');
    var node2b = node2a.createAndAdd(Type.DELIM, ':', '', ':');
    var node2c = node2b.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'target_capture');
    var node2d = node2c.createAndAdd(Type.DELIM, '[', '', '[');
    var node2e = node2d.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'target_label');
    var node2f = node2e.createAndAdd(Type.DELIM, ']', '', ']');
    var node2g = node2f.createAndAdd(Type.DELIM, '?', '', '?');
    var node2h = node2g.createAndAdd(Type.STRING, XRegExp('.+', 's'), 'target_condition');
    node2a.add(node2d); // name[label]
    node2a.add(node2g); // name?condition
    node2c.add(node2g); // name[label]?condition

    // followed by the continuation of this path (capture moves last target to source)

    node2h.add(path1a);
    node2f.add(path1a);
    node2c.add(path1a);
    node2a.add(path1a);

    // ... or another identifier to start a new path ...

    node2h.add(node1a);
    node2f.add(node1a);
    node2c.add(node1a);
    node2a.add(node1a);

    // ... or the end of this body

    var bodyend = node2c.createAndAdd(Type.DELIM, '}', 'block_done', '}');
    node2a.add(bodyend);
    node2f.add(bodyend);
    node2h.add(bodyend);

    // or another block

    bodyend.add(blockname);

    // followed by the end of the document (only the nodetype is considered, set match to dummy)

    var exit = bodyend.createAndAdd(Type.WORD, 'exit');
    exit.type = Parser.Definition.Node.Type.RETURN;
};

/*
 * export
 */
module.exports = DefinitionParser;