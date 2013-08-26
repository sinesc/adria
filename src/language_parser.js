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
var assert = require('assert');
var XRegExp = require('./xregexp');

var util = require('./util');
var Cache = require('./cache');
var Parser = require('./parser');
var DefinitionParser = require('./definition_parser');
var CaptureNode = require('./language_parser/capture_node');

/**
 * Parser subclass with the capability to use a secondary DefinitionParser to train itself from .sdt-files. Defines
 * defintion fiel entities entry, return, string, numeric as well as literal match (i.e. "matchme") and definition jumps
 * (by using the name of a definition as match component)
 * Also provides CaptureNode baseclass to convert parser captures into an object tree of userdefined node-types.
 */
var LanguageParser = Parser.derive(function(transform) {

    Parser.call(this);

    this.transform = transform;
    this.resultData = { };
});

/**
 * @var DefinitionParser trainer secondary parser that will be used to train this one
 */
LanguageParser.prototype.trainer = null;

/**
 * @var String input file
 */
LanguageParser.prototype.sourceCode = null;

/**
 * @var CaptureNode captureTree contains capture result tree after file parsing
 */
LanguageParser.prototype.captureTree = null;

/**
 * @var Object extra data accumulated during parsing
 */
LanguageParser.prototype.resultData = null;

/**
 * @var Object cache file metadata
 */
LanguageParser.prototype.cacheData = null;

/**
 * @var String method used for output generation
 */
LanguageParser.prototype.outputMethod = 'toSourceNode';

/*
 * subclassing
 */
CaptureNode.LanguageParser = LanguageParser; //!ugly, find better way to avoid circular require
LanguageParser.CaptureNode = CaptureNode;

/**
 * constructs new instance referencing source's definition and
 * transform link
 */
LanguageParser.prototype.clone = function(source) {

    var parser = Parser.prototype.clone(source);
    parser.transform = source.transform;
    parser.source = source.source;
    return parser;
};

/**
 * reset definition, then train this parser with currently loaded .sdt-file definitions
 * this is done using the integrate_node_pair() and createNode() methods
 */
LanguageParser.prototype.trainSelf = function() {

    assert(this.trainer != null);

    this.definition = new Parser.Definition();
    this.trainer.trainOther(this);
    this.trainer = null;
};

/**
 * load definition (currently from file)
 *
 * @param string resource name
 * @return bool false if the file could not be opened
 */
LanguageParser.prototype.loadDefinition = function(resource) {

    util.log('LanguageParser', 'loading defintion file ' + resource);

    var file_contents = fs.readFileSync(resource, 'UTF-8');

    // feed file contents to secondary parser

    if (this.trainer == null) {
        this.trainer = new DefinitionParser();
    }

    util.log('LanguageParser', 'processing definition', 2);
    this.trainer.parse(file_contents);
    util.log('LanguageParser', 'done', -2);
};

/**
 * build symbol table hierarchy
 */
LanguageParser.prototype.scanSymbols = function()  {

    return this.captureTree.scanSymbols(this, this.transform.root_scope);
};

/**
 * called during capture list to tree conversion process to select an appropriate node-type
 */
LanguageParser.prototype.mapType = function(capture_name, block_name) {
    return CaptureNode;
};

/**
 * map a path node ("name:capture[label]?condition") to a new parser node. used by secondary DefinitionParser
 *
 * @param string name path node name part
 * @param string capture capture part
 * @param string label label part
 * @param string condition condition part
 * @return Parser.Definition.Node new definition node
 */
LanguageParser.prototype.createNode = function(name, capture, label, condition) {

    var Node = Parser.Definition.Node;
    var node = new Node();

    node.name       = name;
    node.capture    = capture;
    node.label      = label;
    node.condition  = condition;

    switch (name) {
        case 'entry':
        case 'return':
            node.match          = name; //!todo is this used somewhere somehow? it cannot be used as a match
            node.tokenType      = -1;
            node.type           = (name == 'entry' ? Node.Type.BLOCK : Node.Type.RETURN);
            node.description    = name;
            break;

        case 'string':
            node.match          = '';
            node.tokenType      = this.tokenizer.Type.STRING;
            node.type           = 0;
            node.description    = 'string';
            break;

        case 'numeric':
            node.match          = '';
            node.tokenType      = this.tokenizer.Type.NUMERIC;
            node.type           = 0;
            node.description    = 'numerical';
            break;

        default:
            var numChars = name.length;

            if (name[0] == '\"') {

                // string match

                assert(numChars >= 3);

                node.match          = XRegExp('^' + XRegExp.escape(name.slice(1, numChars -1)) + '$', 's');
                node.tokenType      = -1;
                node.type           = 0;
                node.description    = name.slice(1, numChars -1);

            } else if (name[0] == '\'') {

                // regex match

                assert(numChars >= 3);

                node.match          = XRegExp(name.slice(1, numChars -1), 's');
                node.tokenType      = -1;
                node.type           = 0;
                node.description    = name.slice(1, numChars -1);

            } else {

                // definition jump

                node.match          = name;
                node.tokenType      = -1;
                node.type           = Node.Type.JUMP;
                node.description    = 'definition jump';
            }

            break;
    }

    return node;
};

/**
 * integrate a pair of two nodes into the definition. used by secondary DefinitionParser
 *
 * @param pair
 * @param blockName
 */
LanguageParser.prototype.integrateNodePair = function(pair, blockName) {

    // connect both nodes of the pair (add return type nodes to the tail(!), others to the head)

    pair[0].add(pair[1], Parser.Definition.Node.Type.RETURN & pair[1].type);

    // append entry-node to definition (once only as it is already fully connected)

    if (pair[0].type == Parser.Definition.Node.Type.BLOCK && this.definition.haveBlock(blockName) == false) {

        this.definition.createBlock(blockName, pair[0]);
    }
};

/**
 * load source file and process it to a CaptureNode tree
 *
 * @param string resource name
 */
LanguageParser.prototype.setSource = function(resource, data) {

    // load source file

    this.captureTree = null;
    this.file = resource;
    this.sourceCode = data;

    // parse file contents

    util.log('LanguageParser', 'processing source' + resource, 2);
    var captures = this.parse(data);
    util.log('LanguageParser', 'done', -2);

    this.captureTree = CaptureNode.prototype.fromResults(captures, this.mapType.bind(this));
    this.captureTree.parent = this;
};

/**
 * serialize resultData for cache writing
 *
 * @return string
 */
LanguageParser.prototype.serializeData = function() {
    return JSON.stringify(this.resultData);
};

/**
 * unserialize resultData when loading result from cache
 */
LanguageParser.prototype.unserializeData = function(resultData) {
    return JSON.parse(resultData);
};

/**
 * load source file and process it to a CaptureNode tree
 *
 * @param string resource name
 */
LanguageParser.prototype.loadSource = function(resource) {

    if (this.transform.options.nocache !== true && this.cacheData === null) {

        this.cacheData = this.transform.cache.fetch(resource, [ 'base', 'resultData' ]);

        if (this.cacheData !== null) {
            this.resultData = this.unserializeData(this.cacheData['resultData']);
        }
    }

    // check if now available from cache, if not, parse

    if (this.cacheData === null) {

        var fileContents = fs.readFileSync(resource, 'UTF-8').replace('\r\n', '\n');
        this.setSource(resource, fileContents);
    }
};

/**
 * process the parse captures into output format
 *
 * @return string output string
 */
LanguageParser.prototype.output = function() {

    var result;

    // generate data unless it's already in the cache

    if (this.cacheData === null) {

        var InitialType = this.mapType('', this.definition.initialBlock);
        result = InitialType.prototype[this.outputMethod].call(this.captureTree);

    } else {

        result = this.cacheData['base'];
    }

    // write new data to cache (don't write it again if it just came from the cache)

    if (this.transform.options.nocache !== true && this.cacheData === null && fs.existsSync(this.file)) {

        this.transform.cache.insert(this.file, {
            base: result,
            resultData: this.serializeData()
        });
    }

    return result;
};

/*
 * export
 */
module.exports = LanguageParser;