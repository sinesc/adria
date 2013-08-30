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

//!todo needs complete refactoring (result is combined on retrieval, bad)

/**
 * Result constructor
 */
var Result = function(tokenizer) {

    this.position = -1;
    this.match  = [ ];
    this.type   = [ ];
    this.start  = [ ];
    this.col    = [ ];
    this.row    = [ ];
    this.tokenizer = tokenizer;
};

/**
 * add a token to the result
 *
 * @param match
 * @param type
 * @param start
 */
Result.prototype.add = function(match, type, start, col, row) {

    this.match.push(match);
    this.type.push(this.tokenizer.Type[type]);
    this.start.push(start);
    this.col.push(col);
    this.row.push(row);
};

/**
 * advance current element pointer by 1
 */
Result.prototype.next = function() {

    this.position += 1;
    return (this.match[this.position] !== undefined);
};

/**
 * put current element pointer off track. use next to set it to the first element
 */
Result.prototype.reset = function() {

    this.position = -1;
};

/**
 * return number of items in result
 */
Result.prototype.length = function() {

    return this.match.length;
};

var Position = function(row, col) {
    this.row = row;
    this.col = col;
};

Position.prototype.toString = function() {
    return 'line ' + this.row + ', column ' + this.col;
};

/**
 * retrieve a token from the result
 *
 * @param id token id to retrieve
 * @return token object or undefined
 */
Result.prototype.get = function(id) {

    id = (id === undefined ? this.position : id);

    if (typeof this.match[id] === 'undefined') {
        return undefined;
    }

    return {
        data: this.match[id],
        type: this.type[id],
        start: this.start[id],
        pos: new Position(this.row[id], this.col[id])
    };
};

/*
 * export
 */
module.exports = Result;