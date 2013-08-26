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
var AdriaTransform = require('./adria_transform');
var AdriaDebugParser = require('./adriadebug_parser');

/**
 * Transforms a set of input files into an XML string representing the file's
 * syntax tree.
 *
 * @see Transform
 */
var AdriaDebugTransform = AdriaTransform.derive(function(piped) {

    AdriaTransform.call(this, piped);

    this.options.nocache = true;
});

AdriaDebugTransform.prototype.process = function() {

    // create a prototype parser to clone from (to avoid training overhead)

    this.protoParser = new AdriaDebugParser(this);
    this.protoParser.trainSelf();

    // process piped data and initial files

    if (this.piped !== undefined) {
        this.buildModule('main', this.piped);
    }

    var files = this.options.files;

    for (var id in files) {
        this.buildModule(files[id].stripPostfix(this.fileExt));
    }

    // extract result for join

    var result = [];

    for (var id in this.modules) {
        result.push(this.modules[id].result);
    }

    // merge and return

    if (this.options['outFile'] !== null) {
        fs.writeFileSync(this.options['outFile'], result.join('\n'));
    } else {
        process.stdout.write(result.join('\n'));
    }
};

module.exports = AdriaDebugTransform;