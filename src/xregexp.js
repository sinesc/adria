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
var XRegExp = require('xregexp').XRegExp;

// check XRegExp version since anything below 3.0.0 pre has serious performance problems with our specific use-case

if (parseInt(XRegExp.version) < 3) {
    console.log('XRegExp version 3 or above strongly recommended.');
    console.log('If it is not yet available in NPM, get it here');
    console.log('   https://github.com/slevithan/xregexp');
    console.log('and either replace xregexp-all.js in node_modules/xregexp');
    console.log('or copy/rename it to adria/src/xregexp.js (replace this file)');
    console.log('Comment/remove process.exit(); in adria/src/xregexp.js to proceed');
    console.log('anyway (tokenizing will be about 15-20 times slower)');
    process.exit();
}

// v3 exposed XRegExp directly as module, do the same

module.exports = XRegExp;