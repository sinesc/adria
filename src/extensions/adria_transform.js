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
var fs = require('fs');
var path = require('path');
var SourceNode = require('source-map').SourceNode;
var Template = require('../template');
var Transform = require('../transform');
var AdriaParser = require('./adria_parser');
var util = require('../util');

/**
 * Transforms a set of input files into one or more output files using the
 * Adria language transformation definition
 *
 * @see Transform
 */
var AdriaTransform = Transform.derive(function(piped) {

    Transform.call(this, piped);

    this.globals        = new util.Set();
    this.requires       = new util.Set();
    this.requiresDone   = new util.Set();
    this.modules        = [ ];
    this.sourceCode     = { };

    // defaults

    var options = this.options;

    options.nolink = (options.nolink === undefined ? false : options.nolink);
    options.nomap = (options.nomap === undefined ? false : options.nomap);
    options.fileExt = (options.fileExt === undefined ? '.adria' : options.fileExt);
    options.platform = (options.platform === undefined ? 'web' : options.platform);
    options['tweak-exports'] = (options['tweak-exports'] === undefined ? false : options['tweak-exports']);
});

/**
 * populated by globals node, names of application-wide globals
 */
AdriaTransform.prototype.globals = null;
AdriaTransform.prototype.requires = null;
AdriaTransform.prototype.requiresDone = null;
AdriaTransform.prototype.modules = null;
AdriaTransform.prototype.protoParser = null;

AdriaTransform.prototype.initOptions = function() {

    Transform.prototype.initOptions.call(this);

    this.defineOptions({
        'file-extension': function(extension) {
            this.fileExt = '.' + extension;
        },
        'platform': function(platform) {
            this.platform = platform;
        }
    });
};

/**
 * returns the full filename of given module
 *
 * @param moduleName
 * @return absolute path (including filename) to module
 */
AdriaTransform.prototype.resolveModule = function(moduleName) {

    var slash = moduleName.lastIndexOf('/');
    var baseName = slash > 0 ? moduleName.slice(slash) : moduleName;

    var filename = (baseName.indexOf('.') > -1 ? moduleName : moduleName + this.options.fileExt);
    var fullname = this.options.basePath + filename;
    var current = fullname;

    // check if file exists, if not scan path

    if (fs.existsSync(fullname) !== true) {

        var paths = this.options.paths;

        for (var id in paths) {

            current = this.options.basePath + paths[id] + filename;

            if (fs.existsSync(current)) {
                fullname = current;
                break;
            }
        }
    }

    return path.normalize(fullname);
};

/**
 * build a module and its dependencies recursively and push the
 * result onto AdriaTransform::modules
 *
 * @param moduleName name of the module
 * @param data module source code
 */
AdriaTransform.prototype.buildModule = function(moduleName, data) {

    // create parser from proto-parser

    var parser = AdriaParser.prototype.clone(this.protoParser);
    parser.moduleName = moduleName;

    if (data === undefined) {
        parser.loadSource(this.resolveModule(moduleName));
    } else {
        parser.setSource(moduleName + this.options.fileExt, data);
    }

    // generate result

    var result = parser.output();

    // add globals and requires to transform

    var requires = parser.resultData.requires;

    this.requiresDone.add(moduleName);

    for (var name in requires.data) {
        if (this.requiresDone.has(name) === false) {
            this.buildModule(name);
        }
    }

    // these are used in the template

    this.requires = this.requires.merge(parser.resultData.requires);
    this.globals = this.globals.merge(parser.resultData.globals);

    // push module after all dependencies have been resolved

    this.modules.push({ filename: parser.file, sourceCode: parser.sourceCode, result: result });
};

/**
 * generate JavaScript SourceNode output tree from built modules
 */
AdriaTransform.prototype.generateOutputTree = function() {

    var node = new SourceNode(null, null);
    var tpl = new Template();
    tpl.assign('globals', this.globals.toArray());
    tpl.assign('enableAssert', this.options.assert);

    // wrap with application and merge

    var fwNode, moduleNode;
    var fw = tpl.fetchFile('adria/framework.' + this.options.platform + '.tpl');

    node.add('(function() {\n"use strict";\n');

    fwNode = node.add(new SourceNode(1, 0, 'adria-framework.js', fw));
    fwNode.setSourceContent('adria-framework.js', fw);

    for (var id in this.modules) {
        var module = this.modules[id];

        moduleNode = node.add(new SourceNode(null, null, module.filename, module.result));
        moduleNode.setSourceContent(module.filename, module.sourceCode);
    }

    node.add('\n})();');
    return node;
};

AdriaTransform.prototype.process = function() {

    // create a prototype parser to clone from (to avoid training overhead)

    this.protoParser = new AdriaParser(this);
    this.protoParser.trainSelf();

    // process piped data and initial files

    if (this.piped !== undefined) {
        this.buildModule('main', this.piped);
    }

    var files = this.options.files;

    for (var id in files) {
        this.buildModule(files[id].stripPostfix(this.options.fileExt));
    }

    // result

    var node = this.generateOutputTree();
    var options = this.options;

    if (options.outFile !== null) {

        var jsFile = options.basePath + options.outFile;
        var mapFile = jsFile.stripPostfix('.js') + '.map';

        if (options.nomap !== true) {

            var result = node.toStringWithSourceMap({ file: options.outFile });
            var mapLink = '\n//@ sourceMappingURL=' + path.relative(options.basePath, mapFile);

            fs.writeFileSync(jsFile, result.code + (options.nolink ? '' : mapLink));
            fs.writeFileSync(mapFile, result.map);

        } else {

            fs.writeFileSync(jsFile, node.toString());
        }

    } else {

        process.stdout.write(node.toString());
    }
};

/*
 * export
 */
module.exports = AdriaTransform;