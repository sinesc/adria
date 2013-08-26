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

//!todo no longer in use, check removal

/**
 * hierarchy of scopes
 */
var Scope = function() {

    this.children       = null;
    this.parent         = null;
    this.allow_descend  = true;
    this.allow_ascend   = true;
};

/**
 * create a child-scope of the same type as this scope is
 */
Scope.prototype.create = function(name) {

    var existing = this.get(name);
    if (existing instanceof Scope) {
        return existing;
    }

    var OwnType = Object.getPrototypeOf(this).constructor;
    var child = new OwnType();

    child.parent = this;
    child.name = name;

    if (this.children instanceof Array !== true) {
        this.children = [];
    }

    this.children.push(child);
    return child;
};

/**
 * attach existing scope with new name, reference other's children as own
 */
Scope.prototype.attach = function(name, other) {

    assert(other != null);

    var child = this.create(name);
    child.allow_ascend  = false;
    child.children      = other.children;
    child.origin        = other; //!todo debug only
    return child;
};

/**
 * returns true if this is the root scope (scope without parent)
 *
 * @return bool
 */
Scope.prototype.is_root = function() {
    return this.parent === null;
};

/**
 * returns true if this is a child scope
 *
 * @return bool
 */
Scope.prototype.is_child = function() {
    return this.parent !== null;
};

/**
 * returns true if this is scope has child-scopes
 *
 * @return bool
 */
Scope.prototype.has_children = function() {
    return (this.children instanceof Array && this.children.length > 0);
};

/**
 * returns root scope
 *
 * @return Scope
 */
Scope.prototype.root = function() {

    var current = this;

    while (current.parent instanceof Scope) {
        current = current.parent;
    }

    return current;
};

/**
 * returns immediate child-scope "name" of "scope"
 */
Scope.prototype.get = function(name) {

    if (this.has_children()) {

        for (var id in this.children) {

            var child = this.children[id];

            if (child.name == name) {
                return child;
            }
        }
    }

    return null;
};

/**
 * check if name is known to current scope or any parent scopes to which ascension is allowed
 *
 * @param string name first part of symbol
 * @return Scope? matching scope or null
 */
Scope.prototype.find_base = function(name) {

    var current = this;
    var previous = null;

    // check if name exists in current scope, if not check parent. repeat until root or found.

    do {

        var child = current.get(name);

        if (child instanceof Scope) {
            return child;
        }

        assert(current != current.parent);

        previous = current;
        current = current.parent;

    } while (current instanceof Scope && previous.allow_ascend);

    return null;
};

/**
 * find scope indicated by given symbol (if descending to the leaf is possible)
 *
 * @param string symbol symbol scope
 * @return Scope? matching scope or null
 */
Scope.prototype.find = function(symbol) {

    var parts = symbol.split(".");

    assert(parts != null);
    assert(parts.length > 0);

    // find base scope for symbol

    var current = this.find_base(parts[0]);

    // resolve symbol parts starting at base

    for (var i = 1; i < parts.length && current instanceof Scope; i++) {

        if (current.allow_descend != true) {
            return null;
        }

        var child = current.get(parts[i]);

        if (child == null) {
            return null;
        }

        current = child;
    }

    return current;
};

/*
 * export
 */
module.exports = Scope;