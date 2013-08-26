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
require('./src/prototype.js');
var util = require('./src/util.js');

var AdriaTransform = require('./src/extensions/adria_transform');
var AdriaDebugTransform = require('./src/extensions/adriadebug_transform');

// process base command line

var target  = 'adria';
var piped = false;

util.processOptions(null, {
    'target': function(type) {
        target = type;
    },
    'pipe': function() {
        piped = true;
    }
});

// transformation performer

var run = function(pipeData) {

    var transform;

    //try {

        if (target === 'adria') {
            transform = new AdriaTransform(pipeData);
        } else if (target === 'adriadebug') {
            transform = new AdriaDebugTransform(pipeData);
        } else {
            throw new Error('unsupported taget "' + target+ '"');
        }

        transform.process();

    //} catch (e) {

     //   console.log(e.message);
    //}
};

// process stdin or run directly

if (piped) {

    var pipeData = '';

    process.stdin.on('data', function(data) {
        pipeData += data.toString();
    });

    process.stdin.on('end', function() {
        run(pipeData);
    });

    process.stdin.resume();

} else {

    run();
}