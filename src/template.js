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
var XRegExp = require('./xregexp');
var fs      = require('fs');
var Tags    = require('./template/tags');

/**
 * Basic templating class supporting variable replacement and simple control structures
 * in template-textfiles.
 */
var Template = function(tags, delimiterOpen, delimiterClose) {

    tags            = (tags === undefined ? new Tags() : tags);
    delimiterOpen   = (delimiterOpen === undefined ? '<' : delimiterOpen);
    delimiterClose  = (delimiterClose === undefined ? '>' : delimiterClose);

    this.tags = tags;
    this.data = { };
    this.delimiter = { open: XRegExp.escape(delimiterOpen), close: XRegExp.escape(delimiterClose) };
};

Template.Tags = Tags;

Template.prototype.basePath = 'templates/';

/**
 * assign data to template
 *
 * @param string name reference name from within template file
 * @param any value data to assign
 */
Template.prototype.assign = function(name, value) {

    this.data[name] = value;
};

Template.prototype.parse = function(input) {

    var self        = this;
    var tplString   = '';
    var lastIndex   = 0;
    var lastTail    = '';

    var delim       = this.delimiter;
    var regex       = XRegExp(' (?<head>  [\\ \\t]*)' +
                  delim.open + '(?<ident> /?[a-z_][a-z0-9_\\[\\]\\.]+) \\s* (?<params>.*?)' + delim.close +
                               '(?<tail>  \\n){0,1}', 'xis');

    // convert to linux format

    input = input.replace(/\r/g, '');

    // generate javascript template code

    tplString += self.tags.begin();

    XRegExp.forEach(input, regex, function(match, i) {

        // text between tags

        if (i == 0 && match.index > 0) {
            tplString += self.tags.text(lastTail + input.substring(0, match.index) + match.head);
        } else if (i > 0) {
            tplString += self.tags.text(lastTail + input.substring(lastIndex, match.index) + match.head);
        }

        lastIndex = match.index + match[0].length;
        lastTail = (match.tail !== undefined ? match.tail : '');

        // default to fallback tag

        if (match.params === '' && match.ident !== '' && self.tags.supports(match.ident) !== true) {
            match.params = match.ident;
            match.ident = self.tags.fallback();
        }

        // check if tag exists

        if (self.tags.supports(match.ident) !== true) {
            throw new Error('unsupported tag ' + match.ident + ' encountered');
        }

        // add tag code

        tplString += self.tags.tag(match.ident, match.params);
    });

    // add text from behind last tag, then close template and return

    tplString += self.tags.text(lastTail + input.substring(lastIndex));
    tplString += self.tags.end();

    return tplString;
};

Template.prototype.exec = function(tplString) {
    return (function() {
        return eval(tplString);
    }).call(this.data);
};

Template.prototype.fetch = function(input) {

    var tplString = this.parse(input);
    return this.exec(tplString);
};

Template.prototype.fetchFile = function(file) {
    return this.fetch(fs.readFileSync(this.basePath + file, 'UTF-8'));
};

/*
 * export
 */

module.exports = Template;