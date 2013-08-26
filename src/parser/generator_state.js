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
 
/**
 * contains generator as well as its current result
 * used to simplify handling of the Node::filter generator
 */
var GeneratorState = function() { };

/**
 * sets the generator object for this GeneratorState
 *
 * @param object generator 
 * @param string token
 */
GeneratorState.prototype.setGenerator = function(generator, token) {

    this.generator = generator;
    this.token = token;
    this.node = null;
    this.stack = null;
    this.minStack = 0;
    this.done = false;
};

/**
 * fetches next result from generator and makes it accessible via the node, stack and minStack
 * properties. if there are no futher results, the done property will be set to true
 */
GeneratorState.prototype.next = function() {

    var state = this.generator.next();

    if (state.done === false) {
        this.node = state.value.node;
        this.stack = state.value.stack;
        this.minStack = state.value.minStack;
    } else {
        this.node = null;
        this.stack = null;
        this.minStack = 0;
    }

    this.done = state.done;
    return this;
};

/**
 * references the generator object
 */
GeneratorState.prototype.generator = null;

/**
 * references the current result node
 */
GeneratorState.prototype.node = null;

/**
 * references the current stack
 */
GeneratorState.prototype.stack = null;

/**
 * references the token for this state
 */
GeneratorState.prototype.token = null;

/**
 * minimum stacksize encountered during recursive return-node processing.
 * this information is required to construct a capture tree.
 * i.e.: the stacks of two consecutive generators might look like this:
 *
 *      root->statement
 *      root->statement
 *
 * which would be interpreted as one single "statement" spanning two tokens during capture tree generation.
 * but with the second token generator indicating a minStack size of 1, we can deduce that at some point between the tokens,
 * the stack only contained root, so an intermediate third stack can be calculated to give a complete picture:
 *
 *      root->statement
 *      root
 *      root->statement
 *
 * the capture tree generator can convert this to two independent statement nodes.
 */
GeneratorState.prototype.minStack = 0;

/**
 * true once the generator has no more data to yield
 */
GeneratorState.prototype.done = false;

module.exports = GeneratorState;