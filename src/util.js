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
//!todo this file needs lots of cleanup
var sysutil = require('util');
var crypto = require('crypto');
var assert = require('assert');

/**
 * DebugLog constructor
 */
var DebugLog = function(resetEach) {

    this.start  = Date.now();
    this.last   = this.start;

    console.log('=============================: Log started');
};

DebugLog.prototype.print = function(source, message, indent) {

    var now         = Date.now();
    var diffStart   = now - this.start;
    var diffLast    = now - this.last;

    this.last = now;

    console.log(('+' + diffLast + '/' + diffStart).padLeft(10) + 'ms: ' + source.padLeft(15) + ': ' + ' '.repeat(indent) + message);
};

var debugLog = null;
var indent = 0;
var enabled = false;

var log = function(source, message, offset) {

    if (enabled !== true) {
        return;
    }

    if (debugLog === null) {
        debugLog = new DebugLog(source === true);
    }

    if (offset < 0) {
        indent += offset;
    }

    if (message !== undefined) {
        debugLog.print(source, message, indent);
    }

    if (offset > 0) {
        indent += offset;
    }
};

log.enable = function() {
    enabled = true;
};

log.disable = function() {
    enabled = false;
};


var dump = function(obj, depth, showHidden) {

    depth = (depth === undefined ? 2 : depth);
    showHidden = (showHidden === undefined ? false : showHidden);

    console.log(sysutil.inspect(obj, showHidden, depth));
};


var tree = function(object, structure) {

    // object to work with is required. structure may be dot-separated string or array

    assert(object instanceof Object);
    structure = (structure instanceof Array ? structure : structure.split('.'));

    var current = object;

    structure.forEach(function(name) {

        if (name.substr(-2) !== '[]') {
            current[name] = current[name] || { };
        } else {
            name = name.substr(0, name.length -2);
            current[name] = current[name] || [ ];
        }

        current = current[name];
    });

    return current;
};

/*
 * enum type
 */
var Enumeration = function(options) {

    var bit = 0;

    for (var id in options) {
        if (this[options[id]] === undefined) {
            this[options[id]] = 1 << bit;
            bit += 1;
        }
        if (bit >= 32) {
            throw new Error('options is expected to be an array and contain <= 32 unique elements');
        }
    }

    return Object.freeze(this);
};

var Enum = function(options) {
    return new Enumeration(options);
};


/*
 * set type
 */
var Set = function(value) {

    this.data = { };

    if (value !== undefined) {
        this.add(value);
    }
};

/**
 * merge one or more sets with current and return result
 * does not modify this set
 *
 * @param Set, ... sets to merge
 * @return Set resulting Set
 */
Set.prototype.merge = function() {

    var args    = Array.prototype.slice.call(arguments, 0);
    var result  = new Set();

    for (var key in this.data) {
        result.data[key] = true;
    }

    for (var id in args) {
        for (var key in args[id].data) {
            result.data[key] = true;
        }
    }

    return result;
};

/**
 * add element, array of elements or Set to this Set
 *
 * @param value
 */
Set.prototype.add = function(value) {

    var data = this.data;

    if (value instanceof Array) {

        value.forEach(function(element) {
            data[element] = true;
        });

    } else if (value instanceof Set) {

        for (var element in value.data) {
            data[element] = true;
        }

    } else {

        data[value] = true;
    }

    return this;
};

/**
 * remove element, array of elements or Set from this Set
 *
 * @param value
 */
Set.prototype.remove = function(value) {

    var data = this.data;

    if (value instanceof Array) {

        value.forEach(function(element) {
            delete data[element];
        });

    } else if (value instanceof Set) {

        for (var element in value.data) {
            delete data[element];
        }

    } else {
        delete data[value];
    }

    return this;
};

/**
 * check if set has single value, all values of array or set
 *
 * @param value
 * @return boolean
 */
Set.prototype.has = function(value) {

    var data = this.data;

    if (value instanceof Array) {

        for (var id in value) {
            if (data.hasOwnProperty(value[id]) !== true) {
                return false;
            }
        }

        return true;

    } else if (value instanceof Set) {

        var other = value.data;

        for (var key in other) {
            if (data.hasOwnProperty(key) !== true) {
                return false;
            }
        }

        return true;

    } else {

        return (data.hasOwnProperty(value));
    }
};

/**
 * returns key missing in this set to equal another set or array
 *
 * @param value
 * @return boolean
 */
Set.prototype.missing = function(value) {

    var result = new Set();
    var data = this.data;

    if (value instanceof Array) {

        for (var id in value) {
            if (data[value[id]] !== true) {
                result.add(value[id]);
            }
        }

    } else if (value instanceof Set) {

        var other = value.data;

        for (var key in other) {
            if (data[key] !== true) {
                result.add(key);
            }
        }

    } else {

        throw new Error('invalid argument');
    }

    return result;
};

/**
 * return set values as array
 *
 * @return Array
 */
Set.prototype.toArray = function() {
    return Object.keys(this.data);
};

/**
 * check if the set is empty
 *
 * @return boolean
 */
Object.defineProperty(Set.prototype, 'empty', {
    get : function() {
        for (var dummy in this.data) {
            return false;
        }
        return true;
    },
    enumerable : true,
    configurable : true
});

/**
 * number of elements in set
 *
 * @return integer
 */
Object.defineProperty(Set.prototype, 'length', {
    get : function() {
        var len = 0;
        for (var dummy in this.data) {
            len++;
        }
        return len;
    },
    enumerable : true,
    configurable : true
});

/**
 * simple command line processor
 *
 * handlers['_default'] expected to handle values without parameter prefix
 * handlers['_switch'] expected to handle values without parameter value
 *
 * @param context execution context for given handlers
 * @param handlers object of handler functions
 */
var processOptions = function(context, handlers) {

    var next = '_default';

    for (var i = 2; i < process.argv.length; i++) {

        var argv = process.argv[i];
        var prefix = argv.slice(0, 2);
        var param = argv.slice(2);

        if (prefix == "--" && typeof handlers[param] === 'function') {

            // option with value

            next = param;

        } else if (prefix == "--") {

            // switch

            if (handlers['_switch'] !== undefined) {
                handlers['_switch'].call(context, param);
            }

        } else {

            // value from previous option

            if (handlers[next] !== undefined) {
                handlers[next].call(context, argv);
            }

            next = '_default';
        }
    }
};

var md5 = function(input) {

    var md5sum = crypto.createHash('md5');
    md5sum.update(input);
    return md5sum.digest('hex');
};

exports.log = log;
exports.dump = dump;
exports.tree = tree;
exports.Enum = Enum;
exports.Set = Set;
exports.processOptions = processOptions;
exports.md5 = md5;