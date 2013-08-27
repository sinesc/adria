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
var util = require('./util');
var Scope = require('./transform/scope');
var UnresolvedSymbol = require('./transform/unresolved_symbol');
var Cache = require('./cache');

/**
 * Base for language transformation file handling. Transforms a set of input
 * files into one or more output files using given options.
 *
 * @param String piped piped data, if any
 */
var Transform = function(piped) {

    this.options            = { basePath: '', paths: [ ], files: [ ], outFile: null }; // merge these agains possible defined ones (by sub)
    this.piped              = piped;
    this.root_scope         = null;
    this.unresolved_symbols = null;
    this.symbol_pass        = 0;

    this.initOptions();
    this.processOptions();

    if (this.options.nocache !== true) {
        this.cache = new Cache();
    }

    if (this.options.debug) {
        util.log.enable();
    }
};

Transform.UnresolvedSymbol = UnresolvedSymbol;
Transform.Scope = Scope;

Transform.prototype.optionsDefinition = null;

/**
 * initialize options definition, extend with own options
 */
Transform.prototype.initOptions = function() {

    this.defineOptions({
        '_default': function(file) {
            this['files'].push(file);
        },
        '_switch': function(param) {
            this[param] = true;
        },
        'base': function(path) {
            this['basePath'] = (path.hasPostfix('/') ? path : path + '/');
        },
        'path': function(path) {
            if (this['paths'] === undefined) {
                this['paths'] = [];
            }
            this['paths'].push((path.hasPostfix('/') ? path : path + '/'));
        },
        'out': function(file) {
            this['outFile'] = file;
        },
        'target': function(target) {
            this['target'] = target;
        }
    });
};

/**
 * adds a set of options to the command line options handler
 *
 * @param optionsDefinition object of handler functions
 */
Transform.prototype.defineOptions = function(optionsDefinition) {

    if (this.optionsDefinition === null) {
        this.optionsDefinition = { };
    }

    for (var id in optionsDefinition) {
        this.optionsDefinition[id] = optionsDefinition[id];
    }
};

/**
 * processes options definition into options
 */
Transform.prototype.processOptions = function() {

    util.processOptions(this.options, this.optionsDefinition);
};

/**
 * output cache
 */
Transform.prototype.cache = null;

/**
 * entry point, run transformation
 */
Transform.prototype.process = function() { };

/*
 * export
 */
module.exports = Transform;