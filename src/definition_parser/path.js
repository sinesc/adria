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
var SOURCE = 0;
var TARGET = 1;

/**
 * a single path connecting two nodes within a block in a parser definition file
 * note: LanguageParser::createNode and integrateNodePair are called to convert lists
 * of pairs into connected groups of node trees represented by Parser.Definition
 *
 * @param sourceNode
 * @param sourceCapture
 * @param sourceLabel
 * @param sourceCondition
 * @param targetName
 * @param targetCapture
 * @param targetLabel
 * @param targetCondition
 */
var Path = function(sourceName, sourceCapture, sourceLabel, sourceCondition, targetName, targetCapture, targetLabel, targetCondition) {

    sourceName      = (sourceName === undefined ? '' : sourceName);
    sourceCapture   = (sourceCapture === undefined ? '' : sourceCapture);
    sourceLabel     = (sourceLabel === undefined ? '' : sourceLabel);
    sourceCondition = (sourceCondition === undefined ? '' : sourceCondition);
    targetName      = (targetName === undefined ? '' : targetName);
    targetCapture   = (targetCapture === undefined ? '' : targetCapture);
    targetLabel     = (targetLabel === undefined ? '' : targetLabel);
    targetCondition = (targetCondition === undefined ? '' : targetCondition);

    this.name       = new Array(2);
    this.capture    = new Array(2);
    this.label      = new Array(2);
    this.condition  = new Array(2);

    this.name[SOURCE]       = sourceName;
    this.capture[SOURCE]    = sourceCapture;
    this.label[SOURCE]      = sourceLabel;
    this.condition[SOURCE]  = sourceCondition;

    this.name[TARGET]       = targetName;
    this.capture[TARGET]    = targetCapture;
    this.label[TARGET]      = targetLabel;
    this.condition[TARGET]  = targetCondition;
};

Path.SOURCE = SOURCE;
Path.TARGET = TARGET;

Path.clone = function(node) {

    return new Path(
        node.name[SOURCE], node.capture[SOURCE], node.label[SOURCE], node.condition[SOURCE],
        node.name[TARGET], node.capture[TARGET], node.label[TARGET], node.condition[TARGET]
    );

    return path;
};

/**
 * reset path by moving target to source and then clearing target
 */
Path.prototype.reset = function() {

    this.name[SOURCE]       = this.name[TARGET];
    this.capture[SOURCE]    = this.capture[TARGET];
    this.label[SOURCE]      = this.label[TARGET];
    this.condition[SOURCE]  = this.condition[TARGET];

    this.name[TARGET]       = '';
    this.capture[TARGET]    = '';
    this.label[TARGET]      = '';
    this.condition[TARGET]  = '';
};

module.exports = Path;
