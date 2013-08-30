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

/*
 * string format
 */

String.prototype.format = function() {

    var args = Array.prototype.slice.call(arguments);

    // if first argument is array or object, use only that

    if (args.length === 1 && args[0] instanceof Object) {
        args = args[0];
    }

    return this.replace(/(.?)\$([0-9a-z]+)(\:[0-9a-z]+)?/ig, function(str, prefix, matchname, options) {

        // double $$ means to output a $ instead of a formatstring

        if (prefix == '$') {
            return '$' + matchname + (options !== undefined ? options : '');
        }

        //!todo use of options

        return (args[matchname] !== undefined ? prefix + args[matchname] : str);
    });
};


/*
 * repeat string
 */

String.prototype.repeat = function(count) {

    if (count < 1) {
        return '';
    }

    var result = '';
    var pattern = this.valueOf();

    while (count > 1) {

        // append every time a 1 would be shifted out

        if (count & 1) {
            result += pattern;
        }

        // double pattern length, halv count, next rest now in bit 1

        count >>= 1;
        pattern += pattern;
    }

    // unrolled from count > 0

    result += pattern;

    return result;
};

String.repeat = function(count, string) {

    string = (string === undefined ? ' ' : string);
    return string.repeat(count);
};

String.prototype.occurances = function(search) {

    var count = 0;
    var index = this.indexOf(search);

    while (index !== -1) {
        count++;
        index = this.indexOf(search, index + 1);
    }

    return count;
};

/*
 * pad string
 */

String.prototype.padLeft = function(paddedLength, padChar) {

    padChar = (padChar !== undefined ? padChar : ' ');
    return padChar.repeat(paddedLength - this.length) + this.valueOf();
};

String.prototype.padRight = function(paddedLength, padChar) {

    padChar = (padChar !== undefined ? padChar : ' ');
    return this.valueOf() + padChar.repeat(paddedLength - this.length);
};


/*
 * random string (static)
 */

String.random = function(length, chars) {

    var chars       = (chars === undefined ? '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' : chars);
    var numChars    = chars.length;
    var result      = '';

    for (var i = 0; i < length; i++) {
        var rnum = Math.floor(Math.random() * numChars);
        result += chars.substr(rnum, 1);
    }

    return result;
};

String.prototype.stripPostfix = function(postfix) {

    var len;

    if (postfix instanceof Array) {

        for (var i in postfix) {

            len = postfix[i].length;

            if (this.substr(-len) === postfix[i]) {
                return this.substr(0, this.length - len);
            }
        }

        return this.valueOf();
    }

    len = postfix.length;
    return (this.substr(-len) === postfix ? this.substr(0, this.length - len) : this.valueOf());
};

String.prototype.hasPostfix = function(postfix) {

    return (this.substr(-postfix.length) === postfix);
};

/*
 * Constructor, chain to parent prototype
 */

Function.prototype.derive = function(constructor) {

    var Surrogate = function() { };
    Surrogate.prototype = this.prototype;
    constructor.prototype = new Surrogate();
    constructor.prototype.constructor = constructor;
    return constructor;
};
