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
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var util = require('./util');

var Cache = function() {

    this.checkBaseDir();
};

Cache.prototype.baseDir = util.home() + '/.adria/cache/';

var isFile = function(path) {
    var stat = fs.statSync(path);
    return stat.isFile();
};

Cache.prototype.checkBaseDir = function() {

    if (this.baseDir.slice(0, 1) !== '/' || this.baseDir.slice(-1) !== '/') {
        throw new Error('cache.baseDir needs to be an absolute path');
    }

    var parts = this.baseDir.slice(1, -1).split('/');
    var path = '/';

    for (var id in parts) {

        path += parts[id];

        if (fs.existsSync(path)) {
            if (isFile(path)) {
                throw new Error(path + ' is a file');
            }
        } else {
            fs.mkdirSync(path, (parseInt(id) === parts.length -1 ? 0777 : 0755));
        }
        path += '/';
    }
};

Cache.prototype.cacheName = function(file) {

    var absPath = path.resolve(process.cwd(), file);
    return this.baseDir + util.md5(absPath);
};

/**
 * fetches data for given file from cache
 *
 * @param file
 * @param variants array of variants to fetch as well
 * @result object of cache result variants
 */
Cache.prototype.fetch = function(file, variants) {

    var cacheFile = this.cacheName(file);

    if (fs.existsSync(cacheFile) && fs.existsSync(file)) {

        var inputStat = fs.statSync(file);
        var cacheStat = fs.statSync(cacheFile);

        if (cacheStat.isFile() && inputStat.mtime.toString() === cacheStat.mtime.toString()) {

            var resultData = { };

            for (var id in variants) {
                if (variants[id] === 'base') {
                    util.log('Cache', 'reading from ' + cacheFile, 0);
                    resultData['base'] = JSON.parse(fs.readFileSync(cacheFile, 'UTF-8'));
                } else {
                    resultData[variants[id]] = JSON.parse(fs.readFileSync(cacheFile + '.' + variants[id], 'UTF-8'));
                }
            }

            return resultData;

        } else {

            util.log('Cache', 'cache miss for ' + file, 0);
        }
    }

    return null;
};

/**
 * writes data for given file to cache
 *
 * @param file
 * @param variants object of cached variants
 */
Cache.prototype.insert = function(file, variants) {

    assert(fs.existsSync(file));

    var inputStat = fs.statSync(file);
    var cacheFile = this.cacheName(file);

    // write output text and set filedate to input file

    for (var ext in variants) {

        if (ext === 'base') {
            util.log('Cache', 'writing to ' + cacheFile, 0);
            fs.writeFileSync(cacheFile, JSON.stringify(variants[ext]));
            fs.utimesSync(cacheFile, inputStat.atime, inputStat.mtime);
        } else {
            fs.writeFileSync(cacheFile + '.' + ext, JSON.stringify(variants[ext]));
        }
    }
};

module.exports = Cache;