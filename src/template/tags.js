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
var Util = require('../util');

/**
 * Template-tags constructor
 */
var Tags = function() {

    this.ifDepth    = 0;
    this.eachDepth  = 0;
    this.remDepth   = 0;
    this.resultVar  = '';
};

Tags.prototype.supports = function(tagName) {
    return (this['tag:' + tagName] !== undefined);
};

Tags.prototype.tag = function(tagName, params) {

    if (typeof this['tag:' + tagName] !== 'function') {
        throw new Error('unknown tag ' + tagName + ' called');
    }

    return this['tag:' + tagName](params);
};

Tags.prototype.text = function(string) {

    var repl = string.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\*\//g, '*\\/').replace(/'/g, '\\\'');
    return this.resultVar + ' += \'' + repl + '\';\n';
};

Tags.prototype.fallback = function() {
    return 'out';
};

Tags.prototype.begin = function() {

    this.ifDepth = 0;
    this.eachDepth = 0;
    this.remDepth = 0;
    this.resultVar = '__r' + String.random(8);

    return '(function() { var ' + this.resultVar + ' = \'\'; with (this) {\n';
};

Tags.prototype.end = function() {

    if (this.ifDepth > 0) {
        throw new Error('unclosed if-tag(s)');
    } else if (this.eachDepth > 0) {
        throw new Error('unclosed each-tag(s)');
    } else if (this.remDepth > 0) {
        throw new Error('unclosed rem-tag(s)');
    }

    return '} return ' + this.resultVar + '; }).call(this);';
};

Tags.prototype['tag:out'] = function(params) {

    return this.resultVar + ' += (typeof ' + params + ' !== \'undefined\' ? ' + params + ' : \'\');\n';
};

Tags.prototype['tag:if'] = function(params) {

    this.ifDepth += 1;
    return 'if (' +  params + ') {\n';
};

Tags.prototype['tag:else'] = function() {

    if (this.ifDepth === 0) {
        throw new Error('else: no matching if found');
    }
    return '} else {\n';
};

Tags.prototype['tag:elseif'] = function(params) {

    if (this.ifDepth === 0) {
        throw new Error('elseif: no matching if found');
    }

    return '} else if (' + params + ') {\n';
};

Tags.prototype['tag:/if'] = function() {

    if (this.ifDepth === 0) {
        throw new Error('/if: no matching if found');
    }

    this.ifDepth -= 1;

    return '}\n';
};

Tags.prototype['tag:each'] = function(params) {

    params = params.split(' ');

    if (params[1] !== 'in') {
        throw new Error('each: syntax error');
    }

    var hash = String.random(6);

    var options = {
        name: params[0],
        from: params[2],
        id  : '__i' + hash,
        keys: '__k' + hash,
        len : '__l' + hash
    };

    this.eachDepth += 1;

    return '(function() { \
                if ($from instanceof Object !== true) return; \
                var $keys = ($from instanceof Array ? null : Object.keys($from)); \
                var $len = ($keys === null ? $from.length : $keys.length); \
                for (var $id = 0; $id < $len; $id++) { \
                    var $name = $from[($keys === null ? $id : $keys[$id])];\
                    var each = { first: ($id === 0), last: ($id === $len -1), key: ($keys === null ? $id : $keys[$id]) };\n'.format(options);
};

Tags.prototype['tag:/each'] = function(params) {

    if (this.eachDepth === 0) {
        throw new Error('/each: no matching each found');
    }

    this.eachDepth -= 1;

    return '}})();\n';
};

Tags.prototype['tag:rem'] = function(params) {

    if (this.remDepth > 0) {
        throw new Error('rem: nested comments not supported');
    }

    if (params) {
        return '/* ' + params + ' */';
    } else {
        this.remDepth += 1;
        return '/* ';
    }
};

Tags.prototype['tag:/rem'] = function() {

    if (this.remDepth === 0) {
        throw new Error('/rem: no matching each found');
    }

    this.remDepth -= 1;

    return ' */';
};

/*
 * export
 */
module.exports = Tags;