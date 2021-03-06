#!/bin/sh
':' //; exec "`command -v nodejs || command -v node`" --harmony "$0" "$@"
/**
 * Adria transcompiler
 * 
 * Copyright (c) 2014 Dennis Möhlmann
 * Licensed under the MIT license.
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
;(function(window, ___module, ___require) {
"use strict";
var require, resource, module;
var application;
var ___Async;
var Exception;
(function() {
    var resources = { };
    var modules = { };
    var jsPathStack = [ ];
    Exception = function Exception(message) {
        this.message = message === undefined ? this.message : message;
        this.name = this.constructor.name === undefined ? 'Exception' : this.constructor.name;
        var current = this;
        var ownTraceSize = 1;
        while ((current = Object.getPrototypeOf(current)) instanceof Error) {
            ownTraceSize++;
        }
        var stack = Error().stack.split('\n').slice(ownTraceSize);
        stack[0] = this.name + ': ' + message;
        this.stack = stack.join('\n');
    };
    Exception.prototype = Object.create(Error.prototype);
    Exception.prototype.constructor = Exception;
    var getResource = function(name) {
        return resources[name];
    };
    var Module = function(name, func) {
        this.name = name;
        this.exports = Object.create(null);
        this.func = func;
    };
    Module.prototype.exports = null;
    Module.prototype.name = '';
    module = function(name, func) {
        modules[name] = new Module(name, func);
    };
    resource = function(name, data) {
        resources[name] = data;
    };
    application = function(Constructor) {
        function Application() {
            application = this;
            Constructor.apply(this, Array.prototype.slice.call(arguments));
        };
        Application.prototype = Constructor.prototype;
        var args = Array.prototype.slice.call(arguments);
        args[0] = null;
        return new (Function.prototype.bind.apply(Application, args));
    };
    require = function(file) {
        var path = jsPathStack.length > 0 ? jsPathStack[jsPathStack.length -1] : ''
        var module = modules[file.slice(-3) === '.js' && file.slice(0, 2) === './' ? path + file.slice(2) : file];
        if (typeof module.func === 'function') {
            var func = module.func;
            delete module.func;
            jsPathStack.push(file.slice(0, file.lastIndexOf('/') + 1));
            func(module, getResource);
            jsPathStack.pop();
        }
        return module.exports;
    };
})();
module('../../astdlib/astd/prototype/merge.adria', function(module, resource) {
    let merge = function merge(from, to) {
        let props = Object.getOwnPropertyNames(from);
        for (let propId in props) {
            let propName = props[propId];
            if (to.hasOwnProperty(propName) === false && propName !== 'extend') {
                Object.defineProperty(to, propName, Object.getOwnPropertyDescriptor(from, propName));
            }
        }
    };
    module.exports = merge;
});
module('../../astdlib/astd/prototype/string.adria', function(module, resource) {
    let merge = require('../../astdlib/astd/prototype/merge.adria');
    let extend = function extend() {
        merge(StringExtensions, String);
        merge(StringExtensions.prototype, String.prototype);
    };
    let StringExtensions = (function() {
        function StringExtensions() {}
        StringExtensions.prototype.snakeToCamel = (function() {
            let firstToUpper = function firstToUpper(match1) {
                return match1.replace('_', '').toUpperCase();
            };
            return function snakeToCamel(upperFirst) {
                if (upperFirst) {
                    return this.replace(/((?:^|\_)[a-z])/g, firstToUpper);
                } else {
                    return this.replace(/(\_[a-z])/g, firstToUpper);
                }
            };
        })();
        StringExtensions.prototype.hasPrefix = function hasPrefix(prefix) {
            return (this.substr(0, prefix.length) === prefix);
        };
        StringExtensions.prototype.stripPrefix = function stripPrefix(prefix) {
            let len;
            if (prefix instanceof Array) {
                for (let i in prefix) {
                    len = prefix[i].length;
                    if (this.substr(0, len) === prefix[i]) {
                        return this.substr(len);
                    }
                }
                return this.valueOf();
            }
            len = prefix.length;
            return (this.substr(0, len) === prefix ? this.substr(len) : this.valueOf());
        };
        StringExtensions.prototype.addPrefix = function addPrefix(prefix) {
            return this.hasPrefix(prefix) ? this.valueOf() : prefix + this.valueOf();
        };
        StringExtensions.prototype.hasPostfix = function hasPostfix(postfix) {
            return (this.substr(-postfix.length) === postfix);
        };
        StringExtensions.prototype.stripPostfix = function stripPostfix(postfix) {
            let len;
            if (postfix instanceof Array) {
                for (let i in postfix) {
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
        StringExtensions.prototype.addPostfix = function addPostfix(postfix) {
            return this.hasPostfix(postfix) ? this.valueOf() : this.valueOf() + postfix;
        };
        StringExtensions.prototype.format = function format() {
            var ___num$d = arguments.length, args = new Array(___num$d);
            for (var ___i$d = 0; ___i$d < ___num$d; ++___i$d) {
                args[___i$d] = arguments[___i$d];
            }
            if (args.length === 1 && args[0] instanceof Object) {
                args = args[0];
            }
            return this.replace(/(.?)\$([0-9a-z]+)(\:([0-9a-z\:\-]+))?(\.?)/ig, function(str, prefix, matchname, optmatch, options, separator) {
                if (prefix === '$') {
                    return '$' + matchname + (optmatch !== undefined ? optmatch : '') + (separator !== undefined ? separator : '');
                }
                let formatted = args[matchname];
                if (options !== undefined) {
                    if (options.slice(-1) === '.') {
                        options = options.slice(0, -1);
                    }
                    if (options === 'currency') {
                        formatted = Math.floor(formatted * 100) / 100;
                    }
                    if (options.substr(0, 4) === 'pad:') {
                        formatted = String.prototype.padLeft.call('' + formatted, options.substr(4), ' ');
                    }
                }
                return (args[matchname] !== undefined ? prefix + formatted : str);
            });
        };
        StringExtensions.prototype.repeat = function repeat(count) {
            if (count < 1) {
                return '';
            }
            let result = '';
            let pattern = this.valueOf();
            while (count > 1) {
                if (count & 1) {
                    result += pattern;
                }
                count >>= 1;
                pattern += pattern;
            }
            result += pattern;
            return result;
        };
        StringExtensions.prototype.occurances = function occurances(search) {
            let count = 0;
            let index = this.indexOf(search);
            while (index !== -1) {
                count++;
                index = this.indexOf(search, index + 1);
            }
            return count;
        };
        StringExtensions.prototype.padLeft = function padLeft(paddedLength, padChar) {
            var ___al = arguments.length;
            var ___padChar$i = (___al > 1 ? padChar : (' '));
            return ___padChar$i.repeat(Math.max(0, paddedLength - this.length)) + this.valueOf();
        };
        StringExtensions.prototype.padRight = function padRight(paddedLength, padChar) {
            var ___al = arguments.length;
            var ___padChar$k = (___al > 1 ? padChar : (' '));
            return this.valueOf() + ___padChar$k.repeat(Math.max(0, paddedLength - this.length));
        };
        StringExtensions.prototype.jsify = function jsify(quoteType) {
            if (quoteType === "'") {
                return this.replace(/([\\'])/g, "\\$1").replace(/\r?\n/g, '\\n\\\n').replace(/\0/g, "\\0");
            } else if (quoteType === '"') {
                return this.replace(/([\\"])/g, "\\$1").replace(/\r?\n/g, '\\n\\\n').replace(/\0/g, "\\0");
            } else {
                return this.replace(/([\\"'])/g, "\\$1").replace(/\r?\n/g, '\\n\\\n').replace(/\0/g, "\\0");
            }
        };
        StringExtensions.prototype.capitalize = function capitalize() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };
        StringExtensions.prototype.decapitalize = function decapitalize() {
            return this.charAt(0).toLowerCase() + this.slice(1);
        };
        return StringExtensions;
    })();
    let random = function random(length, chars) {
        var ___al = arguments.length;
        var ___length$p = (___al > 0 ? length : (16));
        var ___chars$q = (___al > 1 ? chars : ('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
        let numChars = ___chars$q.length;
        let result = '';
        for (let i = 0; i < ___length$p;i++) {
            let rnum = Math.floor(Math.random() * numChars);
            result += ___chars$q.substr(rnum, 1);
        }
        return result;
    };
    let repeat = function repeat(count, string) {
        var ___al = arguments.length;
        var ___string$s = (___al > 1 ? string : (' '));
        return StringExtensions.prototype.repeat.call(___string$s, count);
    };
    module.exports = StringExtensions;
    module.exports.extend = extend;
    module.exports.random = random;
    module.exports.repeat = repeat;
});
module('../../astdlib/astd/prototype/regexp.adria', function(module, resource) {
    let merge = require('../../astdlib/astd/prototype/merge.adria');
    let extend = function extend() {
        merge(RegExpExtensions, RegExp);
        merge(RegExpExtensions.prototype, RegExp.prototype);
    };
    let RegExpExtensions = (function() {
        function RegExpExtensions() {}
        return RegExpExtensions;
    })();
    let escape = function escape(string) {
        return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    };
    module.exports = RegExpExtensions;
    module.exports.extend = extend;
    module.exports.escape = escape;
});
module('../../astdlib/astd/prototype/object.adria', function(module, resource) {
    let merge = require('../../astdlib/astd/prototype/merge.adria');
    let extend = function extend() {
        merge(ObjectExtensions, Object);
        merge(ObjectExtensions.prototype, Object.prototype);
    };
    let ObjectExtensions = (function() {
        function ObjectExtensions() {}
        Object.defineProperty(ObjectExtensions.prototype, "merge", {
            value: function merge(overwrite) {
                var args, ___num$x = arguments.length - 1;
                if (___num$x > 0) {
                    args = new Array(___num$x);
                    for (var ___i$x = 0; ___i$x < ___num$x; ++___i$x) {
                        args[___i$x] = arguments[___i$x + 1];
                    }
                } else {
                    args = [];
                }
                for (let i = 0, len = args.length; i < len;++i) {
                    let argValue = args[i];
                    let props = Object.getOwnPropertyNames(argValue);
                    if (overwrite === false) {
                        for (let propId in props) {
                            let propName = props[propId];
                            if (this.hasOwnProperty(propName) === false) {
                                Object.defineProperty(this, propName, Object.getOwnPropertyDescriptor(argValue, propName));
                            }
                        }
                    } else {
                        for (let propId in props) {
                            let propName = props[propId];
                            Object.defineProperty(this, propName, Object.getOwnPropertyDescriptor(argValue, propName));
                        }
                    }
                }
            },
            writable: true
        });
        Object.defineProperty(ObjectExtensions.prototype, "clone", {
            value: function clone() {
                return Object.create(Object.getPrototypeOf(this));
            },
            writable: true
        });
        return ObjectExtensions;
    })();
    module.exports = ObjectExtensions;
    module.exports.extend = extend;
});
module('../../astdlib/astd/prototype/date.adria', function(module, resource) {
    let merge = require('../../astdlib/astd/prototype/merge.adria');
    let extend = function extend() {
        merge(DateExtensions, Date);
        merge(DateExtensions.prototype, Date.prototype);
    };
    let dateLocale = {
        enGB: {
            months: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ],
            days: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
            monthsLong: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            daysLong: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ]
        },
        deDE: {
            months: [
                'Jan',
                'Feb',
                'Mrz',
                'Apr',
                'Mai',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Okt',
                'Nov',
                'Dez'
            ],
            days: [ 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa' ],
            monthsLong: [
                'Januar',
                'Februar',
                'März',
                'April',
                'Mai',
                'Juni',
                'Juli',
                'August',
                'September',
                'Oktober',
                'November',
                'Dezember'
            ],
            daysLong: [
                'Sonntag',
                'Montag',
                'Dienstag',
                'Mittwoch',
                'Donnerstag',
                'Freitag',
                'Samstag'
            ]
        }
    };
    let zeroPad = function zeroPad(number) {
        return ('0' + number).substr(-2, 2);
    };
    let dateMarkers = {
        d: [
            'getDate',
            function(v) {
                return zeroPad(v);
            }
        ],
        m: [
            'getMonth',
            function(v) {
                return zeroPad(v + 1);
            }
        ],
        n: [
            'getMonth',
            function(v, locale) {
                return locale.months[v];
            }
        ],
        w: [
            'getDay',
            function(v, locale) {
                return locale.days[v];
            }
        ],
        y: [ 'getFullYear' ],
        H: [
            'getHours',
            function(v) {
                return zeroPad(v);
            }
        ],
        M: [
            'getMinutes',
            function(v) {
                return zeroPad(v);
            }
        ],
        S: [
            'getSeconds',
            function(v) {
                return zeroPad(v);
            }
        ],
        i: [ 'toISOString' ]
    };
    let DateExtensions = (function() {
        function DateExtensions() {}
        DateExtensions.prototype.format = function format(formatString, localeName) {
            var ___al = arguments.length;
            var ___localeName$19 = (___al > 1 ? localeName : ('enGB'));
            let _this = this;
            let locale = dateLocale[___localeName$19];
            return formatString.replace(/%(.)/g, function(m, p) {
                let part = _this[dateMarkers[p][0]]();
                if (typeof dateMarkers[p][1] === 'function') {
                    part = dateMarkers[p][1](part, locale);
                }
                return part;
            });
        };
        return DateExtensions;
    })();
    module.exports = DateExtensions;
    module.exports.extend = extend;
});
module('args.adria', function(module, resource) {
    let parseArgs = ___require('minimist');
    let identity = function identity(val) {
        return val;
    };
    let Args = (function() {
        function Args(processName, title) {
            var ___al = arguments.length;
            var ___title$1d = (___al > 1 ? title : (''));
            this.processName = processName;
            this.title = ___title$1d;
            this.rawArgs = parseArgs(process.argv.slice(2));
        }
        Args.prototype.rawArgs = null;
        Args.prototype.definition = {  };
        Args.prototype.paramMap = {  };
        Args.prototype.processName = '';
        Args.prototype.title = '';
        Args.prototype.add = function add(options) {
            this.definition[options.name] = options;
            if (typeof options.param === 'string') {
                this.paramMap[options.param] = options.name;
            } else if (options.param instanceof Array) {
                for (let i = 0; i < options.param.length;++i) {
                    this.paramMap[options.param[i]] = options.name;
                }
            }
        };
        Args.prototype.addSwitch = function addSwitch(name, help, defaultValue) {
            this.add({ name: name, param: name, defaultValue: defaultValue, help: help });
        };
        Args.prototype.parse = function parse(nullDefaults) {
            var ___al = arguments.length;
            var ___nullDefaults$1h = (___al > 0 ? nullDefaults : (false));
            let parsed = {  };
            let unknown = {  };
            parsed['!'] = unknown;
            for (let paramName in this.rawArgs) {
                let value = this.rawArgs[paramName];
                if (this.paramMap[paramName] === undefined) {
                    unknown[paramName] = value;
                } else if (value instanceof Array === false || value.length > 0) {
                    parsed[this.paramMap[paramName]] = value;
                }
            }
            for (let name in this.definition) {
                let options = this.definition[name];
                let formatter = options.formatter !== undefined ? options.formatter : identity;
                if (parsed[name] === undefined && ___nullDefaults$1h) {
                    parsed[name] = null;
                } else {
                    let value = parsed[name] !== undefined ? parsed[name] : options.defaultValue;
                    parsed[name] = formatter.call(this, value !== undefined ? value : null);
                }
            }
            return parsed;
        };
        Args.prototype.validate = function validate(options) {
            var ___al = arguments.length;
            var ___options$1j = (___al > 0 ? options : (null));
            return true;
        };
        Args.prototype.getDefaults = function getDefaults(nullDefaults) {
            var ___al = arguments.length;
            var ___nullDefaults$1l = (___al > 0 ? nullDefaults : (false));
            let parsed = {  };
            for (let name in this.definition) {
                let options = this.definition[name];
                let formatter = options.formatter !== undefined ? options.formatter : identity;
                parsed[name] = ___nullDefaults$1l ? null : formatter.call(this, options.defaultValue !== undefined ? options.defaultValue : null);
            }
            return parsed;
        };
        Args.prototype.getHelp = function getHelp() {
            let result = '';
            if (this.title !== '') {
                result += this.title + '\n\n';
            }
            result += 'usage: ' + this.processName;
            let length = result.length;
            let positional = null;
            for (let name in this.definition) {
                let options = this.definition[name];
                let isPositional = options.param === '_' || (options.param.length === 1 && options.param[0] === '_');
                if (options.help && isPositional === false) {
                    let param = formatParams(options, true, true);
                    if (length + param.length > 80) {
                        result += "\n  " + param;
                        length = param.length + 2;
                    } else {
                        result += ' ' + param;
                        length += param.length + 1;
                    }
                } else if (isPositional) {
                    positional = name;
                }
            }
            if (positional !== null && this.definition[positional].help) {
                let options = this.definition[positional];
                result += ' ' + options.helpVar + ' [' + options.helpVar + ' ...]';
                result += "\n\nPositional arguments:";
                result += "\n  " + options.helpVar.padRight(20) + options.help;
            }
            result += "\n\nOptional arguments:";
            for (let name in this.definition) {
                let options = this.definition[name];
                if (options.help && options.param !== '_' && (options.param.length !== 1 || options.param[0] !== '_')) {
                    let fullParams = formatParams(options);
                    result += "\n  " + fullParams.padRight(20);
                    if (fullParams.length > 18) {
                        result += "\n  " + " ".repeat(20);
                    }
                    result += options.help;
                    result += formatDefault(options);
                }
            }
            return result;
        };
        return Args;
    })();
    let formatDefault = function formatDefault(options) {
        let defaultValue = options.defaultValue;
        let invertParam = options.param instanceof Array ? options.param[options.param.length - 1] : options.param;
        let stringValue = null;
        if (typeof defaultValue === 'string') {
            stringValue = defaultValue;
        } else if (defaultValue instanceof Array && defaultValue.length > 0) {
            stringValue = defaultValue.join(', ');
        } else if (typeof defaultValue === 'object' && defaultValue !== null && defaultValue instanceof Array === false) {
            stringValue = '!todo';
        } else if (defaultValue === true) {
            stringValue = 'enabled, --no-' + invertParam + ' to disable';
        }
        if (stringValue !== null) {
            return ' [ ' + stringValue + ' ]';
        } else {
            return '';
        }
    };
    let formatParams = function formatParams(options, first, brackets) {
        var ___al = arguments.length;
        var ___first$1p = (___al > 1 ? first : (false));
        var ___brackets$1q = (___al > 2 ? brackets : (false));
        let params = typeof options.param === 'string' ? [ options.param ] : (___first$1p ? [ options.param[0] ] : options.param);
        let result = [  ];
        for (let i in params) {
            let param = params[i];
            if (param !== '_') {
                let item = (param.length === 1 ? '-' : '--') + param;
                if (options.allowed) {
                    item += ' {' + options.allowed.join(',') + '}';
                } else if (options.helpVar) {
                    item += ' <' + options.helpVar + '>';
                }
                if (___brackets$1q) {
                    result.push('[' + item + ']');
                } else {
                    result.push(item);
                }
            }
        }
        return result.join(', ');
    };
    module.exports = Args;
});
module('base_exception.adria', function(module, resource) {
    let BaseException = (function(___parent) {
        function BaseException() {
            var ___num$1s = arguments.length, ___args$1r = new Array(___num$1s);
            for (var ___i$1s = 0; ___i$1s < ___num$1s; ++___i$1s) {
                ___args$1r[___i$1s] = arguments[___i$1s];
            }
            ___parent.apply(this, ___args$1r);
        }
        BaseException.prototype = Object.create(___parent.prototype);
        BaseException.prototype.constructor = BaseException;
        return BaseException;
    })(Exception);
    module.exports = BaseException;
});
module('log.adria', function(module, resource) {
    let singleton = null;
    let log = function log(source, message, offset) {
        var ___al = arguments.length;
        var ___offset$1u = (___al > 2 ? offset : (0));
        initInstance.call(this);
        singleton.print(source, message, ___offset$1u);
    };
    let enable = function enable() {
        initInstance.call(this);
        singleton.enable();
    };
    let disable = function disable() {
        initInstance.call(this);
        singleton.disable();
    };
    let Log = (function() {
        function Log() {}
        Log.prototype.indent = 0;
        Log.prototype.start = 0;
        Log.prototype.last = 0;
        Log.prototype.enabled = false;
        Log.prototype.enable = function enable() {
            this.start = Date.now();
            this.last = this.start;
            this.enabled = true;
            console.log('=============================: Log started');
        };
        Log.prototype.disable = function disable(source) {
            var ___al = arguments.length;
            var ___source$1z = (___al > 0 ? source : ('Log'));
            this.print(___source$1z, 'Log stopped');
            this.enabled = false;
        };
        Log.prototype.print = function print(source, message, offset) {
            var ___al = arguments.length;
            var ___offset$21 = (___al > 2 ? offset : (0));
            let now = Date.now();
            let diffStart = now - this.start;
            let diffLast = now - this.last;
            this.last = now;
            if (___offset$21 < 0) {
                this.indent += ___offset$21;
            }
            if (message !== undefined && this.enabled) {
                console.log(('+' + diffLast + '/' + diffStart).padLeft(10, ' ') + 'ms: ' + source.padLeft(15) + ': ' + ' '.repeat(this.indent) + message);
            }
            if (___offset$21 > 0) {
                this.indent += ___offset$21;
            }
        };
        return Log;
    })();
    let initInstance = function initInstance(initalState) {
        var ___al = arguments.length;
        var ___initalState$23 = (___al > 0 ? initalState : (false));
        if (singleton === null) {
            singleton = new Log(___initalState$23);
        }
    };
    module.exports = log;
    module.exports.enable = enable;
    module.exports.disable = disable;
    module.exports.Log = Log;
});
module('util.adria', function(module, resource) {
    let sysutil = ___require('util');
    let crypto = ___require('crypto');
    let Enumeration = function Enumeration(options) {
        let bit = 0;
        for (let id in options) {
            if (this[options[id]] === undefined) {
                this[options[id]] = 1 << bit;
                bit += 1;
            }
            if (bit >= 32) {
                throw new Exception('options is expected to be an array and contain <= 32 unique elements');
            }
        }
        return Object.freeze(this);
    };
    let Enum = function Enum(options) {
        return new Enumeration(options);
    };
    let dump = function dump(subject, depth, showHidden) {
        var ___al = arguments.length;
        var ___depth$27 = (___al > 1 ? depth : (2));
        var ___showHidden$28 = (___al > 2 ? showHidden : (false));
        console.log(sysutil.inspect(subject, ___showHidden$28, ___depth$27));
    };
    let home = function home() {
        return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
    };
    let normalizeExtension = function normalizeExtension(fullname, defaultExtension) {
        let slash = fullname.lastIndexOf('/');
        let baseName = slash > 0 ? fullname.slice(slash) : fullname;
        return (baseName.indexOf('.') > -1 ? fullname : fullname + defaultExtension);
    };
    let uniqueId = function uniqueId() {
        let result = '';
        let shift = 10000;
        let maxRandom = 4294967294 / (shift * 2);
        let timeMultiplier = Math.abs(Math.sin(Date.now()) * shift) + 1;
        while (result.length < 64) {
            result += Math.floor(Math.random() * maxRandom * timeMultiplier).toString(36).slice(1, -1);
        }
        return result.slice(-64);
    };
    let md5 = function md5(input) {
        let md5sum = crypto.createHash('md5');
        md5sum.update(input);
        return md5sum.digest('hex');
    };
    module.exports.Enum = Enum;
    module.exports.dump = dump;
    module.exports.home = home;
    module.exports.normalizeExtension = normalizeExtension;
    module.exports.uniqueId = uniqueId;
    module.exports.md5 = md5;
});
module('../../astdlib/astd/set.adria', function(module, resource) {
    let Set = (function() {
        function Set(value) {
            this.data = Object.create(null);
            if (value !== undefined) {
                this.add(value);
            }
        }
        Set.prototype.add = function add(value) {
            let data = this.data;
            if (value instanceof Array) {
                value.forEach(function(element) {
                    data[element] = true;
                });
            } else if (value instanceof Set) {
                for (let element in value.data) {
                    data[element] = true;
                }
            } else {
                data[value] = true;
            }
            return this;
        };
        Set.prototype.remove = function remove(value) {
            let data = this.data;
            if (value instanceof Array) {
                value.forEach(function(element) {
                    delete data[element];
                });
            } else if (value instanceof Set) {
                for (let element in value.data) {
                    delete data[element];
                }
            } else {
                delete data[value];
            }
            return this;
        };
        Set.prototype.has = function has(value) {
            let data = this.data;
            if (value instanceof Array) {
                for (let _ in value) {
                    let key = value[_];
                    if (key in data !== true) {
                        return false;
                    }
                }
                return true;
            } else if (value instanceof Set) {
                let other = value.data;
                for (let key in other) {
                    if (key in data !== true) {
                        return false;
                    }
                }
                return true;
            } else {
                return (value in data);
            }
        };
        Set.prototype.lacks = function lacks(value) {
            return this.has(value) === false;
        };
        Set.prototype.difference = function difference() {
            var ___num$2l = arguments.length, sets = new Array(___num$2l);
            for (var ___i$2l = 0; ___i$2l < ___num$2l; ++___i$2l) {
                sets[___i$2l] = arguments[___i$2l];
            }
            let result = new Set();
            for (let key in this.data) {
                let add = true;
                for (let _ in sets) {
                    let set = sets[_];
                    if (key in set.data) {
                        add = false;
                        break ;
                    }
                }
                result.add(key);
            }
            return result;
        };
        Set.prototype.intersect = function intersect() {
            var ___num$2n = arguments.length, sets = new Array(___num$2n);
            for (var ___i$2n = 0; ___i$2n < ___num$2n; ++___i$2n) {
                sets[___i$2n] = arguments[___i$2n];
            }
            let result = new Set();
            for (let key in this.data) {
                let add = true;
                for (let _ in sets) {
                    let set = sets[_];
                    if (key in set.data !== true) {
                        add = false;
                        break ;
                    }
                }
                if (add) {
                    result.add(key);
                }
            }
            return result;
        };
        Set.prototype.union = function union() {
            var ___num$2p = arguments.length, sets = new Array(___num$2p);
            for (var ___i$2p = 0; ___i$2p < ___num$2p; ++___i$2p) {
                sets[___i$2p] = arguments[___i$2p];
            }
            let result = new Set();
            for (let key in this.data) {
                result.data[key] = true;
            }
            for (let _ in sets) {
                let set = sets[_];
                for (let key in set.data) {
                    result.data[key] = true;
                }
            }
            return result;
        };
        Set.prototype.toArray = function toArray() {
            return Object.keys(this.data);
        };
        Object.defineProperty(Set.prototype, "empty", {
            get: function empty() {
                for (let _ in this.data) {
                    return false;
                }
                return true;
            }
        });
        Object.defineProperty(Set.prototype, "length", {
            get: function length() {
                let len = 0;
                for (let _ in this.data) {
                    len++;
                }
                return len;
            }
        });
        return Set;
    })();
    module.exports = Set;
});
module('../../astdlib/astd/map.adria', function(module, resource) {
    let Set = require('../../astdlib/astd/set.adria');
    let Map = (function() {
        function Map(key, value) {
            this.data = Object.create(null);
            if (key !== undefined) {
                this.set(key, value);
            }
        }
        Map.prototype.merge = function merge() {
            var ___num$2v = arguments.length, maps = new Array(___num$2v);
            for (var ___i$2v = 0; ___i$2v < ___num$2v; ++___i$2v) {
                maps[___i$2v] = arguments[___i$2v];
            }
            let result = new Map();
            for (let key in this.data) {
                let value = this.data[key];
                result.data[key] = value;
            }
            for (let id in maps) {
                for (let key in maps[id].data) {
                    let value = maps[id].data[key];
                    result.data[key] = value;
                }
            }
            return result;
        };
        Map.prototype.set = function set(key, value) {
            let data = this.data;
            if (typeof key === 'object') {
                let source = (key instanceof Map ? key.data : key);
                for (let mapKey in source) {
                    let mapValue = source[mapKey];
                    data[mapKey] = mapValue;
                }
            } else {
                data[key] = value;
            }
            return this;
        };
        Map.prototype.inc = function inc(key, value) {
            var ___al = arguments.length;
            var ___value$2y = (___al > 1 ? value : (1));
            if (key in this.data) {
                this.data[key] += ___value$2y;
            } else {
                this.data[key] = ___value$2y;
            }
        };
        Map.prototype.get = function get(key) {
            if (this.lacks(key)) {
                throw new Exception('key "' + key + '" not defined in map');
            }
            return this.data[key];
        };
        Map.prototype.unset = function unset(key) {
            let data = this.data;
            if (key instanceof Array) {
                for (let _ in key) {
                    let item = key[_];
                    delete data[item];
                }
            } else if (key instanceof Set) {
                for (let item in key.data) {
                    delete data[item];
                }
            } else {
                delete data[key];
            }
            return this;
        };
        Map.prototype.has = function has(key) {
            let data = this.data;
            if (key instanceof Array) {
                for (let _ in key) {
                    let item = key[_];
                    if (item in data !== true) {
                        return false;
                    }
                }
                return true;
            } else if (key instanceof Set) {
                for (let item in key.data) {
                    if (item in data !== true) {
                        return false;
                    }
                }
                return true;
            } else {
                return (key in data);
            }
        };
        Map.prototype.lacks = function lacks(key) {
            return this.has(key) === false;
        };
        Map.prototype.keys = function keys() {
            return Object.keys(this.data);
        };
        Map.prototype.values = function values() {
            let result = [  ];
            for (let _ in this.data) {
                let value = this.data[_];
                result.push(value);
            }
            return result;
        };
        Object.defineProperty(Map.prototype, "empty", {
            get: function empty() {
                for (let _ in this.data) {
                    return false;
                }
                return true;
            }
        });
        Object.defineProperty(Map.prototype, "length", {
            get: function length() {
                let len = 0;
                for (let _ in this.data) {
                    len++;
                }
                return len;
            }
        });
        Map.prototype.find = function find(searchValue, notFoundResult) {
            var ___al = arguments.length;
            var ___notFoundResult$38 = (___al > 1 ? notFoundResult : (undefined));
            for (let key in this.data) {
                let value = this.data[key];
                if (value === searchValue) {
                    return key;
                }
            }
            return ___notFoundResult$38;
        };
        return Map;
    })();
    module.exports = Map;
});
module('source_node.adria', function(module, resource) {
    let MozillaSourceNode = ___require('source-map').SourceNode;
    let SourceNode = (function(___parent) {
        function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
            MozillaSourceNode.prototype.constructor.call(this, aLine, aColumn !== null ? aColumn - 1 : null, aSource, aChunks, aName);
        }
        SourceNode.prototype = Object.create(___parent.prototype);
        SourceNode.prototype.constructor = SourceNode;
        SourceNode.prototype.trim = function trim() {
            let id = this.children.length;
            while (id--) {
                let lastChild = this.children[id];
                if (lastChild instanceof MozillaSourceNode) {
                    if (lastChild.trim()) {
                        this.children.pop();
                    } else {
                        break ;
                    }
                } else if (typeof lastChild === 'string') {
                    this.children[id] = lastChild.replace(/\s+$/, '');
                    if (this.children[id] === '') {
                        this.children.pop();
                    } else {
                        break ;
                    }
                }
            }
            return this.children.length === 0;
        };
        return SourceNode;
    })(MozillaSourceNode);
    module.exports = SourceNode;
});
module('../../astdlib/astd/template.adria', function(module, resource) {
    let Template = (function() {
        function Template() {
            this.data = {  };
            this.preprocessors = {  };
        }
        Template.prototype.data = null;
        Template.prototype.debug = false;
        Template.prototype.statementDelimiters = [ '{!', '!}' ];
        Template.prototype.expressionDelimiters = [ '{%', '%}' ];
        Template.prototype.commentDelimiters = [ '{*', '*}' ];
        Template.prototype.source = '';
        Template.prototype.preprocessors = null;
        Template.prototype.assign = function assign(name, value) {
            if (name instanceof Object && value === undefined) {
                this.data.merge(true, name);
            } else {
                this.data[name] = value;
            }
        };
        Template.prototype.registerPreprocessor = function registerPreprocessor(name, context, handler) {
            if (typeof context === 'function' && handler === undefined) {
                handler = context;
                context = this;
            }
            this.preprocessors[name] = handler.bind(context);
        };
        Template.prototype.setup = function setup() {
            let openStatement = RegExp.escape(this.statementDelimiters[0]);
            let closeStatement = RegExp.escape(this.statementDelimiters[1]);
            let openExpression = RegExp.escape(this.expressionDelimiters[0]);
            let closeExpression = RegExp.escape(this.expressionDelimiters[1]);
            let openComment = RegExp.escape(this.commentDelimiters[0]);
            let closeComment = RegExp.escape(this.commentDelimiters[1]);
            let statement = '(' + openStatement + ').+?' + closeStatement;
            let expression = '(' + openExpression + ').+?' + closeExpression;
            let comment = '(' + openComment + ')[\\s\\S]+?' + closeComment;
            let text = '(?:(?!' + openStatement + '|' + openExpression + '|' + openComment + ')[\\s\\S])+';
            return new RegExp(statement + '|' + expression + '|' + comment + '|' + text, 'g');
        };
        Template.prototype.parse = function parse(input) {
            let regexp = this.setup();
            let match;
            let jsString = '';
            while (match = regexp.exec(input)) {
                if (match[1] === undefined && match[2] === undefined && match[3] === undefined) {
                    jsString += 'this.source += "' + match[0].jsify('"') + '";\n';
                } else if (match[1] !== undefined) {
                    let preprocessor;
                    let statement = match[0].slice(2, -2);
                    statement = statement.replace(/\:\s*$/, '{');
                    statement = statement.replace(/^\s*while/, '} while');
                    statement = statement.replace(/^\s*end(if|for|while)/, '}');
                    if ((preprocessor = this.checkPreprocessor(statement)) !== null) {
                        jsString += this.runPreprocessor(preprocessor, statement);
                    } else {
                        jsString += statement + '\n';
                    }
                } else if (match[2] !== undefined) {
                    jsString += 'this.source += ' + match[0].slice(2, -2) + ';\n';
                } else if (this.debug && match[3] !== undefined) {
                    jsString += 'this.source += "/*' + match[0].slice(2, -2).jsify('"') + '*/";\n';
                }
            }
            return jsString;
        };
        Template.prototype.checkPreprocessor = function checkPreprocessor(statement) {
            let nameMatch = statement.match(/^\s*([a-z][a-z0-9_]*)\s*\(/);
            if (nameMatch !== null && this.preprocessors[nameMatch[1]] !== undefined) {
                return nameMatch[1];
            } else {
                return null;
            }
        };
        Template.prototype.runPreprocessor = function runPreprocessor(name, statement) {
            return eval('(function() { var ' + name + ' = this.preprocessors[name]; return ' + statement + '; }).call(this)');
        };
        Template.prototype.exec = function exec(tplString) {
            let varDefs = 'this.source = "";\n';
            for (let name in this.data) {
                let value = this.data[name];
                varDefs += 'var ' + name + ' = this.data.' + name + ';\n';
            }
            return eval('(function() { ' + varDefs + tplString + 'return this.source; }).call(this)');
        };
        Template.prototype.fetch = function fetch(input) {
            return this.exec(this.parse(input));
        };
        return Template;
    })();
    module.exports = Template;
});
module('template.adria', function(module, resource) {
    let fs = ___require('fs');
    let ASTDTemplate = require('../../astdlib/astd/template.adria');
    let Template = (function(___parent) {
        function Template() {
            var ___num$3n = arguments.length, ___args$3m = new Array(___num$3n);
            for (var ___i$3n = 0; ___i$3n < ___num$3n; ++___i$3n) {
                ___args$3m[___i$3n] = arguments[___i$3n];
            }
            ___parent.apply(this, ___args$3m);
        }
        Template.prototype = Object.create(___parent.prototype);
        Template.prototype.constructor = Template;
        Template.prototype.basePath = 'templates/';
        Template.prototype.fetch = function fetch(source) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.fetch !== fetch || ___c.hasOwnProperty('fetch') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            return ___p.prototype.fetch.call(this, source).replace(/\n[\ \n]*\n/g, '\n');
        };
        Template.prototype.fetchFile = function fetchFile(file) {
            return this.fetch(fs.readFileSync(this.basePath + file, 'UTF-8'));
        };
        return Template;
    })(ASTDTemplate);
    module.exports = Template;
});
module('cache.adria', function(module, resource) {
    let fs = ___require('fs');
    let path = ___require('path');
    let util = require('util.adria');
    let Cache = (function() {
        function Cache() {
            this.checkBaseDir();
        }
        Cache.prototype.version = "1t0j5dbeclxiy2w110yz4ejb0g5m2r21j648gl20l5ualh04a3bq5aimu6vbyb4d";
        Cache.prototype.baseDir = util.home() + '/.adria/cache/';
        Cache.prototype.checkBaseDir = function checkBaseDir() {
            if (this.baseDir.slice(0, 1) !== '/' || this.baseDir.slice(-1) !== '/') {
                throw new Exception('cache.baseDir needs to be an absolute path');
            }
            let parts = this.baseDir.slice(1, -1).split('/');
            let path = '/';
            for (let id in parts) {
                let part = parts[id];
                path += part;
                if (fs.existsSync(path)) {
                    if (fs.statSync(path).isFile()) {
                        throw new Exception(path + ' is a file');
                    }
                } else {
                    fs.mkdirSync(path, (parseInt(id) === parts.length - 1 ? 511 : 493));
                }
                path += '/';
            }
        };
        Cache.prototype.cacheName = function cacheName(file, modifier) {
            var ___al = arguments.length;
            var ___modifier$3r = (___al > 1 ? modifier : (null));
            let absPath = path.resolve(process.cwd(), file);
            return this.baseDir + util.md5(absPath + ' -- ' + ___modifier$3r + ' -- ' + this.version);
        };
        Cache.prototype.fetch = function fetch(file, variants, modifier) {
            var ___al = arguments.length;
            var ___modifier$3t = (___al > 2 ? modifier : (null));
            let cacheFile = this.cacheName(file, ___modifier$3t);
            if (fs.existsSync(cacheFile) && fs.existsSync(file)) {
                let inputStat = fs.statSync(file);
                let cacheStat = fs.statSync(cacheFile);
                if (cacheStat.isFile() && inputStat.mtime.toString() === cacheStat.mtime.toString()) {
                    let resultData = {  };
                    for (let id in variants) {
                        let variant = variants[id];
                        if (variant === 'base') {
                            application.log('Cache', 'reading from ' + cacheFile, 0);
                            resultData['base'] = JSON.parse(fs.readFileSync(cacheFile, 'UTF-8'));
                        } else {
                            resultData[variant] = JSON.parse(fs.readFileSync(cacheFile + '.' + variant, 'UTF-8'));
                        }
                    }
                    return resultData;
                } else {
                    application.log('Cache', 'cache dirty for ' + file, 0);
                }
            } else {
                application.log('Cache', 'cache miss for ' + file, 0);
            }
            return null;
        };
        Cache.prototype.insert = function insert(file, variants, modifier) {
            var ___al = arguments.length;
            var ___modifier$3v = (___al > 2 ? modifier : (null));
            let inputStat = fs.statSync(file);
            let cacheFile = this.cacheName(file, ___modifier$3v);
            for (let ext in variants) {
                let variant = variants[ext];
                if (ext === 'base') {
                    application.log('Cache', 'writing to ' + cacheFile, 0);
                    fs.writeFileSync(cacheFile, JSON.stringify(variant));
                    fs.utimesSync(cacheFile, inputStat.atime, inputStat.mtime);
                } else {
                    fs.writeFileSync(cacheFile + '.' + ext, JSON.stringify(variant));
                }
            }
        };
        return Cache;
    })();
    module.exports = Cache;
});
module('transform.adria', function(module, resource) {
    let fs = ___require('fs');
    let Cache = require('cache.adria');
    let util = require('util.adria');
    let Set = require('../../astdlib/astd/set.adria');
    let Map = require('../../astdlib/astd/map.adria');
    let Transform = (function() {
        function Transform(stdin) {
            var ___al = arguments.length;
            var ___stdin$3x = (___al > 0 ? stdin : (null));
            this.stdin = ___stdin$3x;
            this.initOptions();
            this.processOptions();
            if (this.options['cache']) {
                this.cache = new Cache();
            }
        }
        Transform.prototype.options = null;
        Transform.prototype.stdin = null;
        Transform.prototype.cache = null;
        Transform.prototype.uid = 1;
        Transform.prototype.reset = function reset() {
            this.uid = 1;
        };
        Transform.prototype.initOptions = function initOptions() {
            application.args.add({
                name: 'cache',
                param: [ 'cache' ],
                defaultValue: true,
                help: 'Cache generated code'
            });
            application.args.add({
                name: 'help',
                param: [ 'h', 'help' ],
                defaultValue: false,
                help: 'Show this help message'
            });
            application.args.add({
                name: 'readConfig',
                param: [ 'c', 'config' ],
                help: 'Use build configuration',
                helpVar: 'file',
                formatter: function(value) {
                    return value === true ? 'build.abc' : (value === null ? null : util.normalizeExtension(value, '.abc'));
                }
            });
            application.args.add({
                name: 'writeConfig',
                param: [ 'write-config' ],
                help: 'Write build configuration',
                helpVar: 'file',
                formatter: function(value) {
                    return value === true ? 'build.abc' : (value === null ? null : util.normalizeExtension(value, '.abc'));
                }
            });
        };
        Transform.prototype.mergeOptions = function mergeOptions(base, depend) {
            let result = {  };
            for (let key in depend) {
                let value = depend[key];
                result[key] = value;
            }
            for (let key in base) {
                let value = base[key];
                if (result[key] === undefined) {
                    result[key] = value;
                }
                if (result[key] instanceof Array && value instanceof Array) {
                    result[key] = (new Set(depend[key])).add(value).toArray();
                } else if (typeof result[key] === 'object' && value !== null && typeof value === 'object') {
                    result[key] = (new Map(depend[key])).set(value).data;
                } else if (value !== null) {
                    result[key] = value;
                }
            }
            return result;
        };
        Transform.prototype.readOptions = function readOptions(file) {
            let options = JSON.parse(fs.readFileSync(file));
            if (typeof options['depend'] === 'string') {
                options = this.mergeOptions(options, this.readOptions(options['depend']));
            }
            return options;
        };
        Transform.prototype.writeOptions = function writeOptions(file, options) {
            let saveOptions = {  };
            for (let key in options) {
                let value = options[key];
                if (key !== 'writeConfig' && key !== 'readConfig' && key !== 'depend' && value !== null) {
                    saveOptions[key] = value;
                }
            }
            fs.writeFileSync(file, JSON.stringify(saveOptions, null, '\t'));
        };
        Transform.prototype.processOptions = function processOptions() {
            let options = application.args.parse(true);
            if (options['readConfig'] !== null) {
                options = this.mergeOptions(options, this.readOptions(options['readConfig']));
            }
            if (options['help']) {
                console.log(application.args.getHelp());
                process.exit(0);
            }
            if (options['writeConfig'] !== null) {
                this.writeOptions(options['writeConfig'], options);
            }
            this.options = this.mergeOptions(options, application.args.getDefaults());
        };
        Transform.prototype.makeUID = function makeUID() {
            return (this.uid++).toString(36);
        };
        Transform.prototype.run = function run() {
        };
        return Transform;
    })();
    module.exports = Transform;
});
module('tokenizer/token.adria', function(module, resource) {
    let Token = (function() {
        function Token(data, type, start, col, row) {
            this.data = data;
            this.type = type;
            this.start = start;
            this.pos = new Position(col, row);
        }
        Token.prototype.data = '';
        Token.prototype.type = 0;
        Token.prototype.start = 0;
        Token.prototype.pos = null;
        return Token;
    })();
    let Position = (function() {
        function Position(col, row) {
            this.col = col;
            this.row = row;
        }
        Position.prototype.col = 0;
        Position.prototype.row = 0;
        Position.prototype.toString = function toString() {
            return 'line ' + this.row + ', column ' + this.col;
        };
        return Position;
    })();
    module.exports = Token;
    module.exports.Position = Position;
});
module('parser/generator_state.adria', function(module, resource) {
    let Token = require('tokenizer/token.adria');
    let GeneratorState = (function() {
        function GeneratorState() {}
        GeneratorState.prototype.generator = null;
        GeneratorState.prototype.node = null;
        GeneratorState.prototype.stack = null;
        GeneratorState.prototype.token = null;
        GeneratorState.prototype.minStack = 0;
        GeneratorState.prototype.done = false;
        GeneratorState.prototype.setGenerator = function setGenerator(generator, token) {
            var ___al = arguments.length;
            var ___generator$4c = (___al > 0 ? generator : (null));
            var ___token$4d = (___al > 1 ? token : (null));
            this.generator = ___generator$4c;
            this.token = ___token$4d;
            this.node = null;
            this.stack = null;
            this.minStack = 0;
            this.done = false;
        };
        GeneratorState.prototype.next = function next() {
            let state = this.generator.next();
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
        return GeneratorState;
    })();
    module.exports = GeneratorState;
});
module('parser/syntax_exception.adria', function(module, resource) {
    let BaseException = require('base_exception.adria');
    let Token = require('tokenizer/token.adria');
    let path = ___require('path');
    let SyntaxException = (function(___parent) {
        function SyntaxException() {
            var ___al = arguments.length;
            var parser, includeTrace, token, node, stack, message;
            if (___al === 5) {
                parser = arguments[0];
                includeTrace = arguments[1];
                token = arguments[2];
                node = arguments[3];
                stack = arguments[4];
                message = null;
            } else if (___al === 6) {
                parser = arguments[0];
                includeTrace = arguments[1];
                token = arguments[2];
                node = arguments[3];
                stack = arguments[4];
                message = arguments[5];
            } else if (___al === 1) {
                parser = arguments[0];
                includeTrace = false;
                token = null;
                node = null;
                stack = null;
                message = null;
            } else if (___al === 2) {
                parser = arguments[0];
                message = arguments[1];
                includeTrace = false;
                token = null;
                node = null;
                stack = null;
            } else {
                throw new Exception('invalid number of arguments');
            }
            this.file = parser.file;
            this.token = token;
            this.definition = parser.definition;
            this.node = node;
            this.stack = stack;
            if (message === null) {
                message = this.unexpectedTokenMessage(includeTrace, parser, token, node, stack);
            } else {
                message = this.file + ': ' + message;
            }
            BaseException.prototype.constructor.call(this, message);
        }
        SyntaxException.prototype = Object.create(___parent.prototype);
        SyntaxException.prototype.constructor = SyntaxException;
        SyntaxException.prototype.file = '';
        SyntaxException.prototype.token = null;
        SyntaxException.prototype.definition = null;
        SyntaxException.prototype.node = null;
        SyntaxException.prototype.stack = null;
        SyntaxException.prototype.unexpectedTokenMessage = function unexpectedTokenMessage(includeTrace, parser, token, node, stack) {
            let trace;
            let message = '$file: Unexpected token "$tokenData" $position. Expected: $validNodes';
            if (includeTrace) {
                trace = this.definitionTrace(token, node, stack);
                message += '\n\nTrace:\n$trace';
            }
            return message.format({
                file: path.normalize(parser.file),
                tokenData: token.data,
                position: token.pos.toString(),
                validNodes: node.toString(parser.definition, stack),
                trace: trace
            });
        };
        SyntaxException.prototype.definitionTrace = function definitionTrace(token, node, traceStack) {
            let stack = traceStack.slice();
            stack.push({ node: node, token: token });
            let id = stack.length - 1;
            let result = '';
            let done = 0;
            let levelNode;
            let levelToken;
            while (id--) {
                levelNode = stack[id].node;
                levelToken = stack[id].token;
                if (levelNode instanceof Object) {
                    result += (id + 1) + '. ' + levelNode.name + (levelNode.capture !== '' ? ':' + levelNode.capture : '') + (levelNode.label !== '' ? '[' + levelNode.label + ']' : '');
                } else {
                    result += 'null entry on stack';
                }
                result += ' at ' + levelToken.pos.toString() + ': ' + levelToken.data + '\n';
                if (done++ > 15 && id > 15) {
                    id = 15;
                    result += '...\n';
                }
            }
            return result.trim();
        };
        return SyntaxException;
    })(BaseException);
    module.exports = SyntaxException;
});
module('parser/definition/node.adria', function(module, resource) {
    let Enum = require('util.adria').Enum;
    let Token = require('tokenizer/token.adria');
    let SyntaxException = require('parser/syntax_exception.adria');
    let Node = (function() {
        function Node() {
            this.children = [  ];
        }
        Node.prototype.children = null;
        Node.prototype.tokenType = 0;
        Node.prototype.match = '';
        Node.prototype.type = 0;
        Node.prototype.name = '';
        Node.prototype.capture = '';
        Node.prototype.label = '';
        Node.prototype.description = '';
        Node.prototype.hasChild = function hasChild(node) {
            let children = this.children;
            for (let id in children) {
                if (children[id] === node) {
                    return true;
                }
            }
            return false;
        };
        Node.prototype.add = function add(node) {
            if (this.hasChild(node)) {
                return ;
            }
            let children = this.children;
            if (node.type & Type.RETURN) {
                children.push(node);
                return node;
            } else {
                let lastId = children.length - 1;
                if (lastId >= 0) {
                    let lastChild = children[lastId];
                    if (lastChild.type & Type.RETURN) {
                        children[lastId] = node;
                        children.push(lastChild);
                        return node;
                    }
                }
            }
            children.push(node);
            return node;
        };
        Node.prototype.createAndAdd = function createAndAdd(tokenType, match, capture, description) {
            var ___al = arguments.length;
            var ___capture$4m = (___al > 2 ? capture : (''));
            var ___description$4n = (___al > 3 ? description : (''));
            let node = new Node();
            node.capture = ___capture$4m;
            node.tokenType = tokenType;
            node.match = match;
            node.description = (___description$4n !== '' ? ___description$4n : (___capture$4m !== '' ? ___capture$4m : match));
            return this.add(node);
        };
        Node.prototype.matches = function matches(token) {
            if ((token.type & this.tokenType) === 0) {
                return false;
            }
            if (this.match === '') {
                return true;
            } else if (typeof this.match === 'string') {
                return token.data === this.match;
            } else {
                return this.match.test(token.data);
            }
        };
        Node.prototype.reachesExit = function reachesExit(stack) {
            let children = this.children;
            let lastChild = children.length - 1;
            if (children[lastChild].type === Type.RETURN) {
                if (stack.length === 0) {
                    return true;
                } else {
                    return stack[stack.length - 1].node.reachesExit(stack.slice(0, -1));
                }
            }
            return false;
        };
        Node.prototype.matchingTokens = function matchingTokens(definition, stack, result) {
            var ___al = arguments.length;
            var ___result$4r = (___al > 2 ? result : ({  }));
            let children = this.children;
            for (let _ in children) {
                let child = children[_];
                if (child.type === Type.RETURN) {
                    if (stack.length === 0) {
                        break ;
                    }
                    let returnTo = stack[stack.length - 1].node;
                    returnTo.matchingTokens(definition, stack.slice(0, -1), ___result$4r);
                } else if (child.type === Type.JUMP) {
                    let jumpTo = definition.getBlock(child.match);
                    jumpTo.matchingTokens(definition, stack.concat([ new StackItem(child, null) ]), ___result$4r);
                } else if (child.type === Type.BLOCK) {
                    child.matchingTokens(definition, stack, ___result$4r);
                } else {
                    ___result$4r[child.description !== '' ? child.description : (child.capture !== '' ? child.capture : '"' + child.match + '"')] = true;
                }
            }
            return ___result$4r;
        };
        Node.prototype.filter = function* filter(parser, token, stack) {
            let children = this.children;
            let result;
            if (stack.length > 250) {
                let message = SyntaxException.prototype.unexpectedTokenMessage(true, parser, token, this, stack);
                throw new Exception('recursion too deep. last error:\n' + message + '\n');
            }
            for (let id = 0, len = children.length; id < len;id++) {
                let child = children[id];
                if (child.type === Type.JUMP) {
                    if (child.condition !== '' && parser.checkCondition(child.condition, stack) === false) {
                        continue ;
                    }
                    let blockRoot = parser.definition.getBlock(child.match);
                    let generator = blockRoot.filter(parser, token, stack.concat(new StackItem(child, token)));
                    while ((result = generator.next()).done === false) {
                        yield result.value;
                    }
                } else if (child.type === Type.RETURN) {
                    if (stack.length === 0) {
                        break ;
                    }
                    let top = stack[stack.length - 1].node;
                    let generator = top.filter(parser, token, stack.slice(0, -1));
                    while ((result = generator.next()).done === false) {
                        result.value.minStack = Math.min(result.value.minStack, stack.length - 1);
                        yield result.value;
                    }
                } else if (child.matches(token)) {
                    yield { node: child, stack: stack, minStack: stack.length };
                }
            }
        };
        Node.prototype.toString = function toString(definition, stack) {
            let result = this.matchingTokens(definition, stack);
            return Object.keys(result).join(', ');
        };
        return Node;
    })();
    let Type = Enum([ 'NONE', 'BLOCK', 'JUMP', 'RETURN' ]);
    let StackItem = (function() {
        function StackItem(node, token) {
            this.node = node;
            this.token = token;
        }
        StackItem.prototype.node = null;
        StackItem.prototype.token = null;
        return StackItem;
    })();
    module.exports = Node;
    module.exports.Type = Type;
    module.exports.StackItem = StackItem;
});
module('parser/definition.adria', function(module, resource) {
    let Node = require('parser/definition/node.adria');
    let Definition = (function() {
        function Definition(initialBlock) {
            var ___al = arguments.length;
            var ___initialBlock$4w = (___al > 0 ? initialBlock : ('root'));
            this.blockRoot = {  };
            this.initialBlock = ___initialBlock$4w;
        }
        Definition.prototype.createBlock = function createBlock(rootNode, name) {
            var ___al = arguments.length;
            var ___name$4y = (___al > 1 ? name : (this.initialBlock));
            rootNode.match = 'block_' + ___name$4y;
            this.blockRoot[___name$4y] = rootNode;
            return rootNode;
        };
        Definition.prototype.haveBlock = function haveBlock(name) {
            return (this.blockRoot[name] !== undefined);
        };
        Definition.prototype.getBlock = function getBlock(name) {
            let node = this.blockRoot[name];
            if (node === undefined) {
                throw new Exception('referencing non-existing definition block ' + name);
            }
            return node;
        };
        Definition.prototype.getInitialBlock = function getInitialBlock() {
            return this.getBlock(this.initialBlock);
        };
        return Definition;
    })();
    module.exports = Definition;
    module.exports.Node = Node;
});
module('parser.adria', function(module, resource) {
    let GeneratorState = require('parser/generator_state.adria');
    let SyntaxException = require('parser/syntax_exception.adria');
    let Definition = require('parser/definition.adria');
    let Parser = (function() {
        function Parser() {
            this.definition = new Definition('root');
        }
        Parser.prototype.definition = null;
        Parser.prototype.tokenizer = null;
        Parser.prototype.file = 'unnamed';
        Parser.prototype.includeTrace = true;
        Parser.prototype.clone = function clone() {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.clone !== clone || ___c.hasOwnProperty('clone') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let parser = ___p.prototype.clone.call(this);
            parser.definition = this.definition;
            parser.tokenizer = this.tokenizer;
            parser.file = this.file;
            parser.includeTrace = this.includeTrace;
            return parser;
        };
        Parser.prototype.checkCondition = function checkCondition(condition, stack) {
            throw Exception('NYI: parser::checkCondition');
        };
        Parser.prototype.parse = function parse(source) {
            application.log('Parser', 'tokenizing', 2);
            let tokens = this.tokenizer.process(source, this.file);
            application.log('Parser', 'done', -2);
            if (tokens.length === 0) {
                throw new SyntaxException(this, 'File is empty');
            }
            let node = this.definition.getInitialBlock();
            let stack = [  ];
            let numTokens = tokens.length;
            let tokenId = numTokens;
            let maxId = 0;
            let maxStack = [  ];
            let maxNode = node;
            let results = new Array(numTokens);
            let success = false;
            let eofReached = false;
            while (tokenId--) {
                results[tokenId] = new GeneratorState();
            }
            tokenId = 0;
            application.log('Parser', 'processing ' + numTokens + ' tokens according to currrent language definition');
            do {
                let result = results[tokenId];
                if (result.generator === null) {
                    let token = tokens[tokenId];
                    result.setGenerator(node.filter(this, token, stack), token);
                }
                result.next();
                if (result.done) {
                    result.setGenerator();
                    tokenId--;
                } else if (tokenId === numTokens - 1) {
                    if (result.node.reachesExit(result.stack)) {
                        success = true;
                        break ;
                    } else {
                        eofReached = true;
                        continue ;
                    }
                } else {
                    if (tokenId > maxId) {
                        maxId = tokenId;
                        maxStack = result.stack.slice(0);
                        maxNode = result.node;
                    }
                    node = result.node;
                    stack = result.stack.slice(0);
                    tokenId++;
                }
            } while (tokenId >= 0);
            if (success === false) {
                if (maxId >= numTokens - 2 && eofReached) {
                    throw new SyntaxException(this, 'Unexpected end of file');
                } else {
                    throw new SyntaxException(this, this.includeTrace, tokens[maxId + 1], maxNode, maxStack);
                }
            }
            return results;
        };
        return Parser;
    })();
    module.exports = Parser;
    module.exports.Definition = Definition;
});
module('tokenizer/definition_item.adria', function(module, resource) {
    let DefinitionItem = (function() {
        function DefinitionItem(name, match) {
            this.name = name;
            this.match = match;
        }
        DefinitionItem.prototype.name = null;
        DefinitionItem.prototype.match = null;
        return DefinitionItem;
    })();
    module.exports = DefinitionItem;
});
module('tokenizer/match.adria', function(module, resource) {
    let Match = (function() {
        function Match(name, data, endPosition, containedRows, lastRowLen) {
            this.name = name;
            this.data = data;
            this.endPosition = endPosition;
            this.containedRows = containedRows;
            this.lastRowLen = lastRowLen;
        }
        Match.prototype.name = null;
        Match.prototype.data = '';
        Match.prototype.endPosition = -1;
        Match.prototype.containedRows = -1;
        Match.prototype.lastRowLen = -1;
        return Match;
    })();
    module.exports = Match;
});
module('tokenizer/prefabs.adria', function(module, resource) {
    let Match = require('tokenizer/match.adria');
    let DefinitionItem = require('tokenizer/definition_item.adria');
    let regex = function regex(name, thisRegex, lastRegex, callback) {
        var ___al = arguments.length;
        var ___lastRegex$59 = (___al > 2 ? lastRegex : (null));
        var ___callback$5a = (___al > 3 ? callback : (null));
        return regexFunc(name, thisRegex, ___lastRegex$59, ___callback$5a);
    };
    let breaker = function breaker() {
        return regexFunc(null, /^(\s+)/, null, null);
    };
    let number = function number(name) {
        return regexFunc(name, /^(\-?[0-9]+(\.[0-9]+)?(e\-?[0-9]+)?)/, null, null);
    };
    let delimited = function delimited(name, start, end) {
        var ___al = arguments.length;
        var ___start$5e = (___al > 1 ? start : ('"'));
        var ___end$5f = (___al > 2 ? end : (___start$5e));
        let regex = new RegExp('^(' + regexEscape(___start$5e) + '[\\s\\S]*?' + regexEscape(___end$5f) + ')');
        return regexFunc(name, regex, null, null);
    };
    let exclude = function exclude(name, regex, excluded) {
        return regexFunc(name, regex, null, excludeFunc.bind(excluded));
    };
    let set = function set(name, matches) {
        let escaped = [  ];
        for (let id in matches) {
            escaped.push(regexEscape(matches[id]));
        }
        let regex = new RegExp('^(' + escaped.join('|') + ')');
        return regexFunc(name, regex, null, null);
    };
    let group = function group(name, matches) {
        let escaped = [  ];
        for (let id in matches) {
            escaped.push(regexEscape(matches[id]));
        }
        let regex = new RegExp('^([' + escaped.join() + ']+)');
        return regexFunc(name, regex, null, null);
    };
    let any = function any(name) {
        return regexFunc(name, /^[^\s]*/, null, null);
    };
    let regexFunc = function regexFunc(name, regex, lastRegex, callback) {
        return new DefinitionItem(name, function(data, start, lastMatch) {
            let result = regex.exec(data.substr(start));
            if (result !== null && (lastRegex === null || lastRegex.exec(lastMatch) !== null)) {
                let rows = result[0].occurances('\n');
                let lastBreak = result[0].lastIndexOf('\n');
                let lastRowLen = result[0].length - (lastBreak + 1);
                let match = new Match(this.name, result[0], start + result[0].length, rows, lastRowLen);
                if (callback !== null) {
                    return callback(match);
                } else {
                    return match;
                }
            }
            return null;
        });
    };
    let regexEscape = function regexEscape(regexString) {
        return RegExp.escape(regexString).replace('/', '\\/');
    };
    let excludeFunc = function excludeFunc(match) {
        if (this.has(match.data)) {
            return null;
        }
        return match;
    };
    module.exports.regex = regex;
    module.exports.breaker = breaker;
    module.exports.number = number;
    module.exports.delimited = delimited;
    module.exports.exclude = exclude;
    module.exports.set = set;
    module.exports.group = group;
    module.exports.any = any;
});
module('tokenizer.adria', function(module, resource) {
    let Enum = require('util.adria').Enum;
    let BaseException = require('base_exception.adria');
    let DefinitionItem = require('tokenizer/definition_item.adria');
    let Token = require('tokenizer/token.adria');
    let Match = require('tokenizer/match.adria');
    let prefabs = require('tokenizer/prefabs.adria');
    let Tokenizer = (function() {
        function Tokenizer(definition, extra) {
            var ___al = arguments.length;
            var ___extra$5p = (___al > 1 ? extra : (null));
            let legend = [  ];
            for (let id in definition) {
                legend.push(definition[id].name);
            }
            if (___extra$5p instanceof Array) {
                for (let id in ___extra$5p) {
                    legend.push(___extra$5p);
                }
            }
            this.definition = definition;
            this.Type = Enum(legend);
        }
        Tokenizer.prototype.process = function ___process$5r(data, filename) {
            var ___al = arguments.length;
            var ___filename$5s = (___al > 1 ? filename : ('unnamed'));
            let startPos = 0;
            let result = [  ];
            let col = 1;
            let row = 1;
            let lastMatch = null;
            let match;
            let found;
            while (startPos < data.length) {
                found = false;
                for (let _ in this.definition) {
                    let processor = this.definition[_];
                    match = processor.match(data, startPos, lastMatch);
                    if (match !== null) {
                        if (match.data !== null && match.name !== null) {
                            result.push(new Token(match.data, this.Type[match.name], startPos, col, row));
                            lastMatch = match.data;
                        }
                        row += match.containedRows;
                        col = (match.containedRows === 0 ? col + match.lastRowLen : match.lastRowLen + 1);
                        found = true;
                        startPos += match.data.length;
                        break ;
                    }
                }
                if (found !== true) {
                    throw new BaseException(___filename$5s + ': invalid token at row ' + row + ', column ' + col + ': "' + data.substr(startPos).split(/\r?\n/)[0] + '"');
                }
            }
            return result;
        };
        return Tokenizer;
    })();
    module.exports = Tokenizer;
    module.exports.DefinitionItem = DefinitionItem;
    module.exports.Token = Token;
    module.exports.Match = Match;
    module.exports.prefabs = prefabs;
});
module('definition_parser/path.adria', function(module, resource) {
    let Path = (function() {
        function Path(source, target) {
            var ___al = arguments.length;
            var ___source$5u = (___al > 0 ? source : (new PathElement()));
            var ___target$5v = (___al > 1 ? target : (new PathElement()));
            this.source = ___source$5u;
            this.target = ___target$5v;
        }
        Path.prototype.source = null;
        Path.prototype.target = null;
        Path.prototype.reset = function reset() {
            this.source = this.target;
            this.target = new PathElement();
        };
        Path.prototype.clone = function clone() {
            return new Path(this.source.clone(), this.target.clone());
        };
        return Path;
    })();
    let PathElement = (function() {
        function PathElement(name, capture, label, condition) {
            var ___al = arguments.length;
            var ___name$5z = (___al > 0 ? name : (''));
            var ___capture$60 = (___al > 1 ? capture : (''));
            var ___label$61 = (___al > 2 ? label : (''));
            var ___condition$62 = (___al > 3 ? condition : (''));
            this.name = ___name$5z;
            this.capture = ___capture$60;
            this.label = ___label$61;
            this.condition = ___condition$62;
        }
        PathElement.prototype = Object.create(null);
        PathElement.prototype.constructor = PathElement;
        PathElement.prototype.name = '';
        PathElement.prototype.capture = '';
        PathElement.prototype.label = '';
        PathElement.prototype.condition = '';
        PathElement.prototype.clone = function clone() {
            return new PathElement(this.name, this.capture, this.label, this.condition);
        };
        return PathElement;
    })();
    module.exports = Path;
});
module('definition_parser.adria', function(module, resource) {
    let Parser = require('parser.adria');
    let Tokenizer = require('tokenizer.adria');
    let Path = require('definition_parser/path.adria');
    let DefinitionParser = (function(___parent) {
        function DefinitionParser() {
            Parser.prototype.constructor.call(this);
            this.tokenizer = new Tokenizer([
                Tokenizer.prefabs.delimited(null, '/*', '*/'),
                Tokenizer.prefabs.regex(null, /^\/\/.*/),
                Tokenizer.prefabs.breaker(),
                Tokenizer.prefabs.regex('WORD', /^[a-z_]+/i),
                Tokenizer.prefabs.set('DELIM', [ '->', '.', ':', '[', ']', '{', '}', '?' ]),
                Tokenizer.prefabs.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/),
                Tokenizer.prefabs.number('NUMERIC')
            ]);
            this.trainSelf();
            this.pathBlocks = {  };
            this.currentPath = new Path();
        }
        DefinitionParser.prototype = Object.create(___parent.prototype);
        DefinitionParser.prototype.constructor = DefinitionParser;
        DefinitionParser.prototype.capture = function capture(name, value) {
            let currentPath = this.currentPath;
            if (name === 'block_name') {
                this.block_name = value;
                this.pathBlocks[this.block_name] = [  ];
                return ;
            }
            if ((name === 'path' || name === 'source_name' || name === 'block_done') && currentPath.source.name !== '' && currentPath.target.name !== '') {
                this.pathBlocks[this.block_name].push(currentPath.clone());
                currentPath.reset();
            }
            if (name === 'source_name') {
                currentPath.source.name = value;
                currentPath.source.capture = '';
                currentPath.source.label = '';
                currentPath.source.condition = '';
            } else if (name === 'target_name') {
                currentPath.target.name = value;
                currentPath.target.capture = '';
                currentPath.target.label = '';
                currentPath.target.condition = '';
            } else if (name === 'source_capture') {
                currentPath.source.capture = value;
            } else if (name === 'target_capture') {
                currentPath.target.capture = value;
            } else if (name === 'source_label') {
                currentPath.source.label = value;
            } else if (name === 'target_label') {
                currentPath.target.label = value;
            } else if (name === 'source_condition') {
                currentPath.source.condition = value.slice(1, -1);
            } else if (name === 'target_condition') {
                currentPath.target.condition = value.slice(1, -1);
            }
        };
        DefinitionParser.prototype.parse = function parse(source) {
            let results = Parser.prototype.parse.call(this, source);
            for (let id in results) {
                let result = results[id];
                if (result.node.capture !== '') {
                    this.capture(result.node.capture, result.token.data);
                }
            }
            return results;
        };
        DefinitionParser.prototype.trainOther = function trainOther(parser) {
            let parts = [ 'source', 'target' ];
            for (let blockName in this.pathBlocks) {
                let blockPaths = this.pathBlocks[blockName];
                let nodeMap = {  };
                let nodePair = [  ];
                for (let _ in blockPaths) {
                    let path = blockPaths[_];
                    for (let i in parts) {
                        let part = parts[i];
                        let hash = path[part].name + ':' + path[part].capture + ':' + path[part].label;
                        nodePair[i] = nodeMap[hash];
                        if (nodePair[i] === undefined) {
                            let node = parser.createNode(path[part].name, path[part].capture, path[part].label, path[part].condition);
                            nodeMap[hash] = node;
                            nodePair[i] = node;
                        }
                    }
                    parser.integrateNodePair(nodePair, blockName);
                }
            }
        };
        DefinitionParser.prototype.trainSelf = function trainSelf() {
            let Type = this.tokenizer.Type;
            let blockRoot = new Parser.Definition.Node();
            this.definition.createBlock(blockRoot);
            let blockname = blockRoot.createAndAdd(Type.WORD, /[\S\s]+/, 'block_name');
            let body = blockname.createAndAdd(Type.DELIM, '{', '', '{');
            let node1a = body.createAndAdd(Type.WORD | Type.STRING, /[\S\s]+/, 'source_name');
            let node1b = node1a.createAndAdd(Type.DELIM, ':', '', ':');
            let node1c = node1b.createAndAdd(Type.WORD, /[\S\s]+/, 'source_capture');
            let node1d = node1c.createAndAdd(Type.DELIM, '[', '', '[');
            let node1e = node1d.createAndAdd(Type.WORD, /[\S\s]+/, 'source_label');
            let node1f = node1e.createAndAdd(Type.DELIM, ']', '', ']');
            let node1g = node1f.createAndAdd(Type.DELIM, '?', '', '?');
            let node1h = node1g.createAndAdd(Type.STRING, /[\S\s]+/, 'source_condition');
            node1a.add(node1d);
            node1a.add(node1g);
            node1c.add(node1g);
            let path1a = node1a.createAndAdd(Type.DELIM, '->', 'path', '->');
            node1h.add(path1a);
            node1f.add(path1a);
            node1c.add(path1a);
            let node2a = path1a.createAndAdd(Type.WORD | Type.STRING, /[\S\s]+/, 'target_name');
            let node2b = node2a.createAndAdd(Type.DELIM, ':', '', ':');
            let node2c = node2b.createAndAdd(Type.WORD, /[\S\s]+/, 'target_capture');
            let node2d = node2c.createAndAdd(Type.DELIM, '[', '', '[');
            let node2e = node2d.createAndAdd(Type.WORD, /[\S\s]+/, 'target_label');
            let node2f = node2e.createAndAdd(Type.DELIM, ']', '', ']');
            let node2g = node2f.createAndAdd(Type.DELIM, '?', '', '?');
            let node2h = node2g.createAndAdd(Type.STRING, /[\S\s]+/, 'target_condition');
            node2a.add(node2d);
            node2a.add(node2g);
            node2c.add(node2g);
            node2h.add(path1a);
            node2f.add(path1a);
            node2c.add(path1a);
            node2a.add(path1a);
            node2h.add(node1a);
            node2f.add(node1a);
            node2c.add(node1a);
            node2a.add(node1a);
            let bodyend = node2c.createAndAdd(Type.DELIM, '}', 'block_done', '}');
            node2a.add(bodyend);
            node2f.add(bodyend);
            node2h.add(bodyend);
            bodyend.add(blockname);
            let exit = bodyend.createAndAdd(Type.WORD, 'exit');
            exit.type = Parser.Definition.Node.Type.RETURN;
        };
        return DefinitionParser;
    })(Parser);
    module.exports = DefinitionParser;
});
module('language_parser/capture_node.adria', function(module, resource) {
    let SourceNode = require('source_node.adria');
    let CaptureNode = (function() {
        function CaptureNode(key, value) {
            this.key = key;
            this.value = value;
        }
        CaptureNode.prototype.key = '';
        CaptureNode.prototype.value = '';
        CaptureNode.prototype.parser = null;
        CaptureNode.prototype.parent = null;
        CaptureNode.prototype.children = null;
        CaptureNode.prototype.row = 0;
        CaptureNode.prototype.col = 0;
        CaptureNode.prototype.toJSON = function toJSON() {
            let children = [  ];
            for (let id in this.children) {
                children.push(this.children[id].toJSON());
            }
            return {
                _: this.constructor.name,
                s: children,
                k: this.key,
                v: this.value,
                r: this.row,
                c: this.col
            };
        };
        CaptureNode.prototype.fromJSON = function fromJSON(json, parentNode, typeMapper) {
            let Type = typeMapper('', json._);
            let result = new Type(json.k, json.v);
            result.parser = parentNode instanceof CaptureNode ? parentNode.parser : parentNode;
            result.parent = parentNode;
            result.row = json.r;
            result.col = json.c;
            result.children = [  ];
            let jsonChildren = json.s;
            let resultChildren = result.children;
            for (let id in jsonChildren) {
                resultChildren.push(CaptureNode.prototype.fromJSON(jsonChildren[id], result, typeMapper));
            }
            return result;
        };
        CaptureNode.prototype.fromResults = function fromResults(results, parser, typeMapper) {
            let InitialType = parser.mapType('', '');
            let root = new InitialType('', '');
            let current = root;
            let lastStack = [  ];
            let result;
            let stack;
            let diff;
            let node;
            root.parser = parser;
            root.parent = parser;
            for (let resultId in results) {
                result = results[resultId];
                stack = result.stack;
                diff = stackDiff(stack, lastStack, result.minStack);
                while (diff.ascend--) {
                    current = current.parent;
                }
                for (let nodeId in diff.create) {
                    node = diff.create[nodeId];
                    current = current.addNew(node.capture, node.name, typeMapper(node.capture, node.name));
                    current.row = result.token.pos.row;
                    current.col = result.token.pos.col;
                }
                node = result.node;
                if (node.capture !== '') {
                    let match = current.addNew(node.capture, result.token.data, typeMapper(node.capture, node.name));
                    match.row = result.token.pos.row;
                    match.col = result.token.pos.col;
                }
                lastStack = stack;
            }
            return root;
        };
        CaptureNode.prototype.add = function add(child) {
            if (this.children === null) {
                this.children = [  ];
            }
            child.parser = this.parser;
            child.parent = this;
            this.children.push(child);
            return child;
        };
        CaptureNode.prototype.addNew = function addNew(key, value, Constructor) {
            return this.add(new Constructor(key, value));
        };
        CaptureNode.prototype.isNode = function isNode() {
            return this.col !== -1;
        };
        CaptureNode.prototype.isDummy = function isDummy() {
            return this.col === -1;
        };
        CaptureNode.prototype.isLeaf = function isLeaf() {
            return (this.children instanceof Array === false);
        };
        CaptureNode.prototype.isBranch = function isBranch() {
            return (this.children instanceof Array);
        };
        Object.defineProperty(CaptureNode.prototype, "length", {
            get: function length() {
                return (this.children instanceof Array ? this.children.length : 0);
            }
        });
        CaptureNode.prototype.depth = function depth() {
            let result = 0;
            let current = this;
            while (current.parent instanceof CaptureNode) {
                result += 1;
                current = current.parent;
            }
            return result;
        };
        CaptureNode.prototype.ancestor = function ancestor(key, value, dummy) {
            var ___al = arguments.length;
            var ___value$6m = (___al > 1 ? value : (null));
            var ___dummy$6n = (___al > 2 ? dummy : (this.dummy));
            let current = this;
            key = typeof key === 'string' ? [ key ] : key;
            ___value$6m = typeof ___value$6m === 'string' ? [ ___value$6m ] : ___value$6m;
            if (key !== null && ___value$6m !== null) {
                while (current.parent instanceof CaptureNode && key.indexOf(current.parent.key) === -1 && ___value$6m.indexOf(current.parent.value) === -1) {
                    current = current.parent;
                }
            } else if (key !== null) {
                while (current.parent instanceof CaptureNode && key.indexOf(current.parent.key) === -1) {
                    current = current.parent;
                }
            } else if (___value$6m !== null) {
                while (current.parent instanceof CaptureNode && ___value$6m.indexOf(current.parent.value) === -1) {
                    current = current.parent;
                }
            }
            if (current.parent instanceof CaptureNode) {
                return current.parent;
            } else {
                return ___dummy$6n;
            }
        };
        CaptureNode.prototype.findProto = function findProto(Constructor, StopConstructor, fromParent, dummy) {
            var ___al = arguments.length;
            var ___StopConstructor$6p = (___al > 1 ? StopConstructor : (null));
            var ___fromParent$6q = (___al > 2 ? fromParent : (true));
            var ___dummy$6r = (___al > 3 ? dummy : (this.dummy));
            let current = ___fromParent$6q ? this.parent : this;
            while (current instanceof CaptureNode && current instanceof Constructor === false && (___StopConstructor$6p === null || current instanceof ___StopConstructor$6p === false)) {
                current = current.parent;
            }
            return current instanceof Constructor ? current : ___dummy$6r;
        };
        CaptureNode.prototype.findFirstProto = function findFirstProto(constructors, StopConstructor, fromParent, dummy) {
            var ___al = arguments.length;
            var ___StopConstructor$6t = (___al > 1 ? StopConstructor : (null));
            var ___fromParent$6u = (___al > 2 ? fromParent : (true));
            var ___dummy$6v = (___al > 3 ? dummy : (this.dummy));
            let current = ___fromParent$6u ? this.parent : this;
            while (current instanceof CaptureNode && (___StopConstructor$6t === null || current instanceof ___StopConstructor$6t === false) && isMatch(constructors, current) === false) {
                current = current.parent;
            }
            return isMatch(constructors, current) ? current : ___dummy$6v;
        };
        CaptureNode.prototype.get = function get(key, index, dummy) {
            var ___al = arguments.length;
            var ___index$6x = (___al > 1 ? index : (0));
            var ___dummy$6y = (___al > 2 ? dummy : (this.dummy));
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    if (child.key === key && ___index$6x-- === 0) {
                        return child;
                    }
                }
            }
            return ___dummy$6y;
        };
        CaptureNode.prototype.has = function has(key) {
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    if (child.key === key) {
                        return true;
                    }
                }
            }
            return false;
        };
        CaptureNode.prototype.each = function each(fn) {
            let children = this.children;
            if (children instanceof Array) {
                let last = children.length - 1;
                for (let id in children) {
                    fn.call(this, children[id], +id === 0, +id === last);
                }
            }
        };
        CaptureNode.prototype.eachKey = function eachKey(key, fn) {
            let part = key.split('.');
            if (this.children instanceof Array) {
                let children = this.children;
                let len = children.length;
                let prevChild = null;
                let first = true;
                let id;
                for (id = 0; id < len;id++) {
                    let child = children[id];
                    if (child.key === part[0]) {
                        if (part.length === 1) {
                            if (prevChild !== null) {
                                fn.call(this, prevChild, first, false);
                                first = false;
                            }
                            prevChild = child;
                        } else if (part.length > 1) {
                            child.eachKey(part.slice(1).join('.'), fn);
                        }
                    }
                }
                if (prevChild !== null && prevChild.key === part[0] && part.length === 1) {
                    fn.call(this, prevChild, first, true);
                }
            }
        };
        CaptureNode.prototype.path = function path(pathString, splitter, dummy) {
            var ___al = arguments.length;
            var ___splitter$73 = (___al > 1 ? splitter : ('.'));
            var ___dummy$74 = (___al > 2 ? dummy : (this.dummy));
            let step;
            let current = this;
            pathString = pathString.split(___splitter$73);
            for (let id in pathString) {
                step = pathString[id].split('[');
                if (step.length === 1) {
                    current = current.get(step[0]);
                } else {
                    current = current.get(step[0], parseInt(step[1].slice(0, -1)));
                }
                if (current.isDummy()) {
                    return ___dummy$74;
                }
            }
            return current;
        };
        CaptureNode.prototype.extract = function extract(from, to) {
            return this.children.splice(from, to - from + 1);
        };
        CaptureNode.prototype.nest = function nest(from, to, Constructor) {
            var ___al = arguments.length;
            var ___Constructor$77 = (___al > 2 ? Constructor : (this.constructor));
            let node = new ___Constructor$77(this.key, this.value);
            node.children = this.children.splice(from, to - from + 1, node);
            node.parent = this;
            node.row = node.children[0].row;
            node.col = node.children[0].col;
            for (let id in node.children) {
                let child = node.children[id];
                child.parent = node;
            }
        };
        CaptureNode.prototype.nl = function nl(indent, node) {
            var ___al = arguments.length;
            var ___indent$79 = (___al > 0 ? indent : (0));
            var ___node$7a = (___al > 1 ? node : (null));
            this.parser.indent += ___indent$79;
            if (___node$7a !== null) {
                ___node$7a.trim();
            }
            return '\n' + String.repeat(this.parser.indent * 4, ' ');
        };
        CaptureNode.prototype.csn = function csn(code) {
            return new SourceNode(this.row, this.col, this.parser.file, code);
        };
        CaptureNode.prototype.loc = function loc() {
            return ' in $0 line $1, column $2'.format(this.parser.file, this.row, this.col);
        };
        CaptureNode.prototype.preprocess = function preprocess(state) {
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    child.preprocess(state);
                }
            }
        };
        CaptureNode.prototype.toString = function toString() {
            let result = '';
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    result += this.children[id].toString();
                }
            }
            return result;
        };
        CaptureNode.prototype.toSourceNode = function toSourceNode() {
            let result = new SourceNode(null, null);
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id].toSourceNode();
                    if (child !== '') {
                        result.add(child);
                    }
                }
            }
            return result;
        };
        CaptureNode.prototype.prescan = function prescan(state) {
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    child.prescan(state);
                }
            }
        };
        CaptureNode.prototype.scan = function scan(state) {
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    child.scan(state);
                }
            }
        };
        CaptureNode.prototype.reset = function reset(state) {
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    child.reset(state);
                }
            }
        };
        return CaptureNode;
    })();
    CaptureNode.prototype.dummy = new CaptureNode('', '');
    CaptureNode.prototype.dummy.row = -1;
    CaptureNode.prototype.dummy.col = -1;
    let stackDiff = function stackDiff(stack, lastStack, minStackLen) {
        let deepestCommonCapture = -1;
        let minLen = Math.min(stack.length, lastStack.length, minStackLen);
        for (let i = 0; i < minLen;i++) {
            if (stack[i].node === lastStack[i].node) {
                if (stack[i].node.capture !== '') {
                    deepestCommonCapture = i;
                }
            } else {
                break ;
            }
        }
        let numCaptures = 0;
        let lastLen = lastStack.length;
        for (let i = deepestCommonCapture + 1; i < lastLen;i++) {
            if (lastStack[i].node.capture !== '') {
                numCaptures++;
            }
        }
        let captures = [  ];
        let len = stack.length;
        for (let i = deepestCommonCapture + 1; i < len;i++) {
            if (stack[i].node.capture !== '') {
                captures.push(stack[i].node);
            }
        }
        return { ascend: numCaptures, create: captures };
    };
    let isMatch = function isMatch(constructors, obj) {
        for (let i = 0, len = constructors.length; i < len;++i) {
            if (obj instanceof constructors[i]) {
                return true;
            }
        }
        return false;
    };
    module.exports = CaptureNode;
});
module('language_parser/ast_exception.adria', function(module, resource) {
    let CaptureNode = require('language_parser/capture_node.adria');
    let BaseException = require('base_exception.adria');
    let ASTException = (function(___parent) {
        function ASTException(message, node) {
            this.row = node.row;
            this.col = node.col;
            this.file = node.parser.file;
            BaseException.prototype.constructor.call(this, message + ' in ' + node.parser.file + ' line ' + node.row + ', column ' + node.col);
        }
        ASTException.prototype = Object.create(___parent.prototype);
        ASTException.prototype.constructor = ASTException;
        ASTException.prototype.row = 0;
        ASTException.prototype.col = 0;
        ASTException.prototype.file = '';
        return ASTException;
    })(BaseException);
    module.exports = ASTException;
});
module('language_parser.adria', function(module, resource) {
    let fs = ___require('fs');
    let Parser = require('parser.adria');
    let DefinitionParser = require('definition_parser.adria');
    let Transform = require('transform.adria');
    let CaptureNode = require('language_parser/capture_node.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let LanguageParser = (function(___parent) {
        function LanguageParser(transform) {
            Parser.prototype.constructor.call(this, transform);
            this.transform = transform;
            this.includeTrace = transform.options['debug'];
            this.resultData = {  };
        }
        LanguageParser.prototype = Object.create(___parent.prototype);
        LanguageParser.prototype.constructor = LanguageParser;
        LanguageParser.prototype.trainer = null;
        LanguageParser.prototype.sourceCode = null;
        LanguageParser.prototype.captureTree = null;
        LanguageParser.prototype.resultData = null;
        LanguageParser.prototype.cacheData = null;
        LanguageParser.prototype.cacheModifier = null;
        LanguageParser.prototype.forceNoCache = false;
        LanguageParser.prototype.transform = null;
        LanguageParser.prototype.processMethod = 'toSourceNode';
        LanguageParser.prototype.clone = function clone() {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.clone !== clone || ___c.hasOwnProperty('clone') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let parser = ___p.prototype.clone.call(this);
            parser.trainer = this.trainer;
            parser.sourceCode = this.sourceCode;
            parser.captureTree = this.captureTree;
            parser.resultData = this.resultData;
            parser.cacheData = this.cacheData;
            parser.cacheModifier = this.cacheModifier;
            parser.forceNoCache = this.forceNoCache;
            parser.transform = this.transform;
            parser.processMethod = this.processMethod;
            parser.includeTrace = this.includeTrace;
            return parser;
        };
        LanguageParser.prototype.trainSelf = function trainSelf() {
            this.definition = new Parser.Definition();
            this.trainer.trainOther(this);
            this.trainer = null;
        };
        LanguageParser.prototype.setDefinition = function setDefinition(data, filename) {
            application.log('LanguageParser', 'setting definition file ' + filename);
            if (this.trainer === null) {
                this.trainer = new DefinitionParser();
            }
            application.log('LanguageParser', 'processing definition', 2);
            this.trainer.file = filename;
            this.trainer.parse(data);
            application.log('LanguageParser', 'done', -2);
        };
        LanguageParser.prototype.loadDefinition = function loadDefinition(filename) {
            application.log('LanguageParser', 'loading definition file ' + filename);
            let fileContents = fs.readFileSync(filename, 'UTF-8');
            this.setDefinition(fileContents, filename);
        };
        LanguageParser.prototype.mapType = function mapType(captureName, blockName) {
            return CaptureNode;
        };
        LanguageParser.prototype.createNode = function createNode(name, capture, label, condition) {
            let Node = Parser.Definition.Node;
            let node = new Node();
            node.name = name;
            node.capture = capture;
            node.label = label;
            node.condition = condition;
            switch (name) {
                case 'entry':
                case 'return':
                    node.match = '';
                    node.tokenType = -1;
                    node.type = (name === 'entry' ? Node.Type.BLOCK : Node.Type.RETURN);
                    node.description = '<Please file a bug-report if you ever see this message (' + name + ')>';
                    break ;
                case 'string':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.STRING;
                    node.type = Node.Type.NONE;
                    node.description = '<string literal>';
                    break ;
                case 'numeric':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.NUMERIC;
                    node.type = Node.Type.NONE;
                    node.description = '<numeric literal>';
                    break ;
                default:
                    let numChars = name.length;
                    if (name[0] === '\"') {
                        node.match = new RegExp('^' + RegExp.escape(name.slice(1, numChars - 1)) + '$');
                        node.tokenType = -1;
                        node.type = Node.Type.NONE;
                        node.description = name.slice(1, numChars - 1);
                    } else if (name[0] === '\'') {
                        node.match = new RegExp(name.slice(1, numChars - 1));
                        node.tokenType = -1;
                        node.type = Node.Type.NONE;
                        node.description = name.slice(1, numChars - 1);
                    } else {
                        node.match = name;
                        node.tokenType = -1;
                        node.type = Node.Type.JUMP;
                        node.description = 'definition jump';
                    }
                    break ;
            }
            return node;
        };
        LanguageParser.prototype.integrateNodePair = function integrateNodePair(pair, blockName) {
            pair[0].add(pair[1], Parser.Definition.Node.Type.RETURN & pair[1].type);
            if (pair[0].type === Parser.Definition.Node.Type.BLOCK && this.definition.haveBlock(blockName) === false) {
                this.definition.createBlock(pair[0], blockName);
            }
        };
        LanguageParser.prototype.setSource = function setSource(filename, data, cacheModifier) {
            var ___al = arguments.length;
            var ___cacheModifier$7v = (___al > 2 ? cacheModifier : (null));
            let that = this;
            this.cacheModifier = ___cacheModifier$7v;
            this.captureTree = null;
            this.file = filename;
            this.sourceCode = this.preprocessRaw(data);
            application.log('LanguageParser', 'processing source ' + filename, 2);
            let captures = this.parse(this.sourceCode);
            application.log('LanguageParser', 'done', -2);
            this.captureTree = CaptureNode.prototype.fromResults(captures, this, function(captureName, blockName) {
                return that.mapType(captureName, blockName);
            });
        };
        LanguageParser.prototype.loadSourceFromCache = function loadSourceFromCache(filename, cacheModifier) {
            var ___al = arguments.length;
            var ___cacheModifier$7y = (___al > 1 ? cacheModifier : (null));
            let that = this;
            this.cacheModifier = ___cacheModifier$7y;
            this.cacheData = this.transform.cache.fetch(filename, [ 'base' ], ___cacheModifier$7y);
            if (this.cacheData !== null) {
                this.file = filename;
                this.captureTree = CaptureNode.prototype.fromJSON(this.cacheData['base'], this, function(captureName, blockName) {
                    return that.mapType(captureName, blockName);
                });
                return true;
            }
            return false;
        };
        LanguageParser.prototype.loadSource = function loadSource(filename, cacheModifier) {
            var ___al = arguments.length;
            var ___cacheModifier$81 = (___al > 1 ? cacheModifier : (null));
            let fromCache = false;
            if (this.transform.options['cache'] && this.cacheData === null) {
                fromCache = this.loadSourceFromCache(filename, ___cacheModifier$81);
            }
            if (fromCache !== true) {
                this.setSource(filename, fs.readFileSync(filename, 'UTF-8'), ___cacheModifier$81);
                return false;
            }
            return true;
        };
        LanguageParser.prototype.preprocessRaw = function preprocessRaw(data) {
            return data.replace('\r\n', '\n');
        };
        LanguageParser.prototype.preprocess = function preprocess(state) {
            this.captureTree.preprocess(state);
        };
        LanguageParser.prototype.process = function ___process$85() {
            let result = this.captureTree[this.processMethod]();
            if (this.transform.options['cache'] && this.cacheData === null && fs.existsSync(this.file)) {
                if (this.forceNoCache) {
                    application.log('LanguageParser', 'caching of ' + this.file + ' explicitly disabled');
                } else {
                    this.transform.cache.insert(this.file, { base: this.captureTree.toJSON() }, this.cacheModifier);
                }
            }
            return result;
        };
        LanguageParser.prototype.prescan = function prescan(state) {
            this.captureTree.prescan(state);
        };
        LanguageParser.prototype.scan = function scan(state) {
            this.captureTree.scan(state);
        };
        LanguageParser.prototype.reset = function reset(state) {
            this.captureTree.reset(state);
        };
        return LanguageParser;
    })(Parser);
    module.exports = LanguageParser;
    module.exports.CaptureNode = CaptureNode;
    module.exports.ASTException = ASTException;
});
module('mode/adria/name.adria', function(module, resource) {
    let Name = (function() {
        function Name(node, plain, mangled) {
            var ___al = arguments.length;
            var ___node$8a = (___al > 0 ? node : (null));
            var ___plain$8b = (___al > 1 ? plain : (null));
            var ___mangled$8c = (___al > 2 ? mangled : (null));
            this.node = ___node$8a;
            this.plain = ___plain$8b;
            this.mangled = ___mangled$8c;
            this.valid = /^([\'\"]).*\1$/.test(___plain$8b) === false && ___node$8a !== null && ___plain$8b !== null;
        }
        Name.prototype.node = null;
        Name.prototype.plain = null;
        Name.prototype.mangled = null;
        Name.prototype.valid = false;
        Name.prototype.getPlain = function getPlain() {
            return (this.valid ? this.plain : null);
        };
        Name.prototype.getMangled = function getMangled() {
            if (this.mangled !== null && this.valid) {
                return this.mangled;
            }
            let plain = this.getPlain();
            if (plain !== null) {
                let name = this.node.findScope().getRef(plain);
                this.mangled = (name === null ? plain : name);
                return this.mangled;
            }
            return null;
        };
        Name.prototype.getPlainNode = function getPlainNode() {
            let plain = this.getPlain();
            if (plain !== null) {
                return this.node.csn(plain);
            } else {
                throw new Exception('Attempted to get plain name node of string name');
            }
        };
        Name.prototype.getMangledNode = function getMangledNode() {
            let mangled = this.getMangled();
            if (mangled !== null) {
                return this.node.csn(mangled);
            } else {
                throw new Exception('Attempted to get mangled name node of string name');
            }
        };
        return Name;
    })();
    module.exports = Name;
});
module('mode/adria/node.adria', function(module, resource) {
    let Map = require('../../astdlib/astd/map.adria');
    let LanguageParser = require('language_parser.adria');
    let ASTException = LanguageParser.ASTException;
    let CaptureNode = LanguageParser.CaptureNode;
    let Name = require('mode/adria/name.adria');
    let Node = (function(___parent) {
        function Node() {
            var ___num$8u = arguments.length, ___args$8t = new Array(___num$8u);
            for (var ___i$8u = 0; ___i$8u < ___num$8u; ++___i$8u) {
                ___args$8t[___i$8u] = arguments[___i$8u];
            }
            ___parent.apply(this, ___args$8t);
        }
        Node.prototype = Object.create(___parent.prototype);
        Node.prototype.constructor = Node;
        Node.prototype.Scope = null;
        Node.prototype.toBeMarkedAsUsed = null;
        Node.prototype.prescan = function prescan(state) {
            if (this.toBeMarkedAsUsed !== null) {
                for (let name in this.toBeMarkedAsUsed.data) {
                    let fromParent = this.toBeMarkedAsUsed.data[name];
                    this.markUsed(name, fromParent);
                }
            }
            CaptureNode.prototype.prescan.call(this, state);
        };
        Node.prototype.markUsed = function markUsed(name, fromParent) {
            var ___al = arguments.length;
            var ___fromParent$8j = (___al > 1 ? fromParent : (false));
            let refScope = this.findRefScope(name, ___fromParent$8j);
            if (refScope !== null) {
                refScope.usages.inc(name);
                return true;
            } else {
                if (this.toBeMarkedAsUsed === null) {
                    this.toBeMarkedAsUsed = new Map();
                }
                if (this.toBeMarkedAsUsed.lacks(name)) {
                    this.toBeMarkedAsUsed.set(name, ___fromParent$8j);
                }
                return false;
            }
        };
        Node.prototype.findScope = function findScope(fromParent) {
            var ___al = arguments.length;
            var ___fromParent$8l = (___al > 0 ? fromParent : (false));
            return this.findProto(Node.prototype.Scope, null, ___fromParent$8l, null);
        };
        Node.prototype.findRefScope = function findRefScope(name, fromParent) {
            var ___al = arguments.length;
            var ___fromParent$8n = (___al > 1 ? fromParent : (false));
            let current = this.findScope(___fromParent$8n);
            do {
                if (current.getOwnRef(name) !== null) {
                    return current;
                }
            } while ((current = current.findScope(true)) !== null);
            return current;
        };
        Node.prototype.checkDefined = function checkDefined(name) {
            let transform = this.parser.transform;
            if (transform.globalReferences.has(name)) {
                return false;
            }
            if (this.findScope().getRef(name) !== null) {
                return true;
            }
            throw new ASTException('Undefined reference "' + name + '"', this);
        };
        Node.prototype.findName = function findName() {
            let result = null;
            let nameNode = this.get('name');
            if (nameNode.isNode() === false) {
                nameNode = this.ancestor(null, [
                    'module_statement',
                    'export_statement',
                    'expression',
                    'dec_def',
                    'dec_def_import',
                    'proto_body_item'
                ]);
                if (nameNode.isNode()) {
                    if (nameNode.value === 'dec_def' || nameNode.value === 'dec_def_import' || nameNode.value === 'module_statement' || nameNode.value === 'export_statement') {
                        let item = nameNode.get('name');
                        return new Name(item, item.value);
                    } else if (nameNode.value === 'proto_body_item') {
                        let item = nameNode.get('key');
                        return new Name(item, item.value);
                    } else if (nameNode.value === 'expression') {
                        return nameNode.findAssignee();
                    }
                }
            } else {
                return new Name(nameNode, nameNode.value);
            }
            return result;
        };
        Node.prototype.toString = function toString() {
            return this.toSourceNode().toString();
        };
        Node.prototype.jsCopyArguments = function jsCopyArguments(targetName, numSkip) {
            var ___al = arguments.length;
            var ___numSkip$8s = (___al > 1 ? numSkip : (0));
            let uid = '$' + this.parser.transform.makeUID();
            if (___numSkip$8s > 0) {
                return this.csn([
                    'var ',
                    targetName,
                    ', $0 = arguments.length - $1;'.format('___num' + uid, ___numSkip$8s) + this.nl(),
                    'if (___num' + uid + ' > 0) {' + this.nl(1),
                    targetName,
                    ' = new Array(___num' + uid + ');' + this.nl(),
                    'for (var $0 = 0; $0 < $1; ++$0) {'.format('___i' + uid, '___num' + uid) + this.nl(1),
                    targetName,
                    '[$0] = arguments[$0 + $1];'.format('___i' + uid, ___numSkip$8s) + this.nl(-1),
                    '}' + this.nl(-1),
                    '} else {' + this.nl(1),
                    targetName,
                    ' = [];' + this.nl(-1),
                    '}' + this.nl()
                ]);
            } else {
                return this.csn([
                    'var ___num' + uid + ' = arguments.length, ',
                    targetName,
                    ' = new Array(___num' + uid + ');' + this.nl(),
                    'for (var $0 = 0; $0 < $1; ++$0) {'.format('___i' + uid, '___num' + uid) + this.nl(1),
                    targetName,
                    '[$0] = arguments[$0];'.format('___i' + uid) + this.nl(-1),
                    '}' + this.nl()
                ]);
            }
        };
        return Node;
    })(CaptureNode);
    module.exports = Node;
});
module('mode/adria/value_type.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ValueType = (function(___parent) {
        function ValueType() {
            var ___num$8x = arguments.length, ___args$8w = new Array(___num$8x);
            for (var ___i$8x = 0; ___i$8x < ___num$8x; ++___i$8x) {
                ___args$8w[___i$8x] = arguments[___i$8x];
            }
            ___parent.apply(this, ___args$8w);
        }
        ValueType.prototype = Object.create(___parent.prototype);
        ValueType.prototype.constructor = ValueType;
        ValueType.prototype.toSourceNode = function toSourceNode() {
            return this.csn(this.value);
        };
        return ValueType;
    })(Node);
    module.exports = ValueType;
});
module('mode/adria/definition/ident.adria', function(module, resource) {
    let ValueType = require('mode/adria/value_type.adria');
    let Ident = (function(___parent) {
        function Ident() {
            var ___num$90 = arguments.length, ___args$8z = new Array(___num$90);
            for (var ___i$90 = 0; ___i$90 < ___num$90; ++___i$90) {
                ___args$8z[___i$90] = arguments[___i$90];
            }
            ___parent.apply(this, ___args$8z);
        }
        Ident.prototype = Object.create(___parent.prototype);
        Ident.prototype.constructor = Ident;
        Ident.prototype.toSourceNode = function toSourceNode() {
            let name = this.findScope().getRef(this.value);
            return this.csn(name !== null ? name : this.value);
        };
        return Ident;
    })(ValueType);
    module.exports = Ident;
});
module('mode/adria/definition/function_literal.adria', function(module, resource) {
    let SourceNode = require('source_node.adria');
    let Scope = require('mode/adria/definition/scope.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let Name = require('mode/adria/name.adria');
    let FunctionLiteral = (function(___parent) {
        function FunctionLiteral(key, value) {
            this.specialArgs = [  ];
            Scope.prototype.constructor.call(this, key, value);
        }
        FunctionLiteral.prototype = Object.create(___parent.prototype);
        FunctionLiteral.prototype.constructor = FunctionLiteral;
        FunctionLiteral.prototype.thisId = 0;
        FunctionLiteral.prototype.provideContext = false;
        FunctionLiteral.prototype.provideParent = false;
        FunctionLiteral.prototype.provideSelf = false;
        FunctionLiteral.prototype.provideArgumentsLength = false;
        FunctionLiteral.prototype.name = null;
        FunctionLiteral.prototype.registerWithParent = false;
        FunctionLiteral.prototype.specialArgs = null;
        FunctionLiteral.prototype.reset = function reset(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.reset !== reset || ___c.hasOwnProperty('reset') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            this.specialArgs = [  ];
            ___p.prototype.reset.call(this, state);
        };
        FunctionLiteral.prototype.scan = function scan(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.scan !== scan || ___c.hasOwnProperty('scan') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            if (this.name.valid) {
                let transform = this.parser.transform;
                let plain = this.name.getPlain();
                if (transform.globalReservations.has(plain)) {
                    let importedAs = transform.globalReferences.find(plain, null);
                    let message = '"$0" locally shadows external "$0"' + (importedAs !== null ? ' (imported as "$1")' : '');
                    application.notice(message + this.loc(), plain, importedAs);
                }
            }
            ___p.prototype.scan.call(this, state);
        };
        FunctionLiteral.prototype.toSourceNode = function toSourceNode() {
            this.thisId = this.parser.transform.makeUID();
            this.nl(1);
            let result = this.csn();
            this.setLocalName();
            this.preParamList(result);
            result.add([ '(', this.get('param_list').toSourceNode(), ') {' + this.nl() ]);
            this.preBody(result);
            let body = this.get('body').toSourceNode();
            if (this.provideArgumentsLength) {
                result.add([
                    'var ',
                    this.jsArgumentsLength(),
                    ' = arguments.length;' + this.nl()
                ]);
            }
            result.add(this.refsToSourceNode());
            for (let id in this.specialArgs) {
                result.add([ this.specialArgs[id], this.nl() ]);
            }
            if (this.provideContext) {
                result.add([ 'var ', this.storeContext(), ' = this;' + this.nl() ]);
            }
            if (this.provideParent || this.provideSelf) {
                result.add(this.jsProtoLookup(this.name.valid ? this.name.getMangled() : ''));
            }
            result.add(this.nl(0, result));
            result.add(body);
            this.postBody(result);
            return result;
        };
        FunctionLiteral.prototype.preParamList = function preParamList(result) {
            result.add('function');
            if (this.name.valid) {
                result.add([ ' ', this.name.getMangledNode() ]);
            }
        };
        FunctionLiteral.prototype.preBody = function preBody(result) {
        };
        FunctionLiteral.prototype.postBody = function postBody(result) {
            result.add(this.nl(-1, result) + '}');
        };
        FunctionLiteral.prototype.storeContext = function storeContext() {
            this.provideContext = true;
            return '___ths$' + this.thisId;
        };
        FunctionLiteral.prototype.jsArgumentsLength = function jsArgumentsLength() {
            this.provideArgumentsLength = true;
            return '___al';
        };
        FunctionLiteral.prototype.jsParent = function jsParent() {
            this.provideParent = true;
            return '___p';
        };
        FunctionLiteral.prototype.jsSelf = function jsSelf() {
            this.provideSelf = true;
            return '___s';
        };
        FunctionLiteral.prototype.jsProtoLookup = function jsProtoLookup(lookupName, ownName) {
            var ___al = arguments.length;
            var ___ownName$9d = (___al > 1 ? ownName : (lookupName));
            if (lookupName === '') {
                throw new ASTException('Unable to determine function name required by parent/self lookup', this);
            }
            let result = this.csn();
            let declarations = this.provideSelf ? '___p, ___s, ___c, ___c0 = ___c = ___s' : '___p, ___c, ___c0 = ___c';
            result.add('var ' + declarations + ' = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));' + this.nl());
            result.add('while (___c !== null && (___c.' + lookupName + ' !== ' + ___ownName$9d + ' || ___c.hasOwnProperty(\'' + lookupName + '\') === false)) {' + this.nl(1));
            if (this.provideSelf) {
                result.add('___s = ___c,' + this.nl());
            }
            result.add('___c = Object.getPrototypeOf(___c);' + this.nl(-1));
            result.add('}' + this.nl());
            if (this.provideSelf) {
                result.add('___s = ___s.constructor,' + this.nl());
            }
            result.add('___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);' + this.nl());
            return result;
        };
        FunctionLiteral.prototype.setLocalName = function setLocalName() {
            let name = this.findName();
            if (this.registerWithParent) {
                if (name.valid) {
                    let mangledName = this.parent.findScope().addLocal(name.getPlain(), false);
                    this.name = new Name(name.node, name.getPlain(), mangledName);
                } else {
                    throw new ASTException('Unable to determine function name in func statement', this);
                }
            } else {
                if (name !== null && name.valid) {
                    let mangledName = this.addLocal(name.getPlain(), false, true);
                    this.name = new Name(name.node, name.getPlain(), mangledName);
                } else {
                    this.name = new Name();
                }
            }
        };
        return FunctionLiteral;
    })(Scope);
    module.exports = FunctionLiteral;
});
module('mode/adria/definition/scope.adria', function(module, resource) {
    let Map = require('../../astdlib/astd/map.adria');
    let Set = require('../../astdlib/astd/set.adria');
    let Node = require('mode/adria/node.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let Scope = (function(___parent) {
        function Scope(key, value) {
            this.localDeclarations = new Set();
            this.localReferences = new Map();
            this.usages = new Map();
            Node.prototype.constructor.call(this, key, value);
        }
        Scope.prototype = Object.create(___parent.prototype);
        Scope.prototype.constructor = Scope;
        Scope.prototype.localDeclarations = null;
        Scope.prototype.localReferences = null;
        Scope.prototype.usages = null;
        Scope.prototype.reset = function reset(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.reset !== reset || ___c.hasOwnProperty('reset') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            this.localDeclarations = new Set();
            this.localReferences = new Map();
            this.usages = new Map();
            ___p.prototype.reset.call(this, state);
        };
        Scope.prototype.addLocal = function addLocal(name, declare, ignore, forceMangling) {
            var ___al = arguments.length;
            var ___declare$9i = (___al > 1 ? declare : (true));
            var ___ignore$9j = (___al > 2 ? ignore : (false));
            var ___forceMangling$9k = (___al > 3 ? forceMangling : (false));
            if (___ignore$9j === false && this.getOwnRef(name) !== null) {
                throw new ASTException('Reference "' + name + '" already defined in local scope', this);
            }
            let localName = this.createLocalName(name, ___forceMangling$9k);
            this.localReferences.set(name, localName);
            if (___declare$9i) {
                this.localDeclarations.add(localName);
            }
            return localName;
        };
        Scope.prototype.getOwnRef = function getOwnRef(name) {
            if (this.localReferences.has(name)) {
                return this.localReferences.get(name);
            }
            return null;
        };
        Scope.prototype.getRef = function getRef(name, checkGlobals) {
            var ___al = arguments.length;
            var ___checkGlobals$9n = (___al > 1 ? checkGlobals : (true));
            let scope = this.findRefScope(name);
            if (scope !== null) {
                return scope.getOwnRef(name);
            }
            if (___checkGlobals$9n) {
                let globalReferences = this.parser.transform.globalReferences;
                if (globalReferences.has(name)) {
                    return globalReferences.get(name);
                }
            }
            return null;
        };
        Scope.prototype.refsToSourceNode = function refsToSourceNode() {
            if (this.localDeclarations.empty) {
                return this.csn();
            } else {
                return this.csn([
                    'var ',
                    this.localDeclarations.toArray().join(', '),
                    ';' + this.nl()
                ]);
            }
        };
        Scope.prototype.createLocalName = function createLocalName(name, forceMangling) {
            var ___al = arguments.length;
            var ___forceMangling$9q = (___al > 1 ? forceMangling : (false));
            let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
            let transform = this.parser.transform;
            let refName = null;
            if (___forceMangling$9q === false) {
                if (transform.globalReservations.has(name)) {
                    refName = name;
                } else {
                    let scope = this;
                    do {
                        if ((refName = scope.getOwnRef(name)) !== null) {
                            break ;
                        }
                    } while (scope instanceof FunctionLiteral === false && (scope = scope.findProto(Scope, FunctionLiteral, true, null)) !== null);
                }
            }
            if (refName !== null || ___forceMangling$9q) {
                return '___' + name + '$' + transform.makeUID();
            }
            return name;
        };
        return Scope;
    })(Node);
    Node.prototype.Scope = Scope;
    module.exports = Scope;
});
module('mode/adria/definition/module.adria', function(module, resource) {
    let Map = require('../../astdlib/astd/map.adria');
    let Scope = require('mode/adria/definition/scope.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let Module = (function(___parent) {
        function Module(key, value) {
            this.exports = new Map();
            Scope.prototype.constructor.call(this, key, value);
        }
        Module.prototype = Object.create(___parent.prototype);
        Module.prototype.constructor = Module;
        Module.prototype.moduleExport = null;
        Module.prototype.exports = null;
        Module.prototype.interfaceName = null;
        Module.prototype.reset = function reset(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.reset !== reset || ___c.hasOwnProperty('reset') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            this.exports = new Map();
            this.moduleExport = null;
            this.interfaceName = null;
            ___p.prototype.reset.call(this, state);
        };
        Module.prototype.setInterface = function setInterface(name) {
            if (this.interfaceName !== null) {
                throw new ASTException('Duplicate interface declaration', this);
            }
            let parser = this.parser;
            parser.resultData.interfaceName = name;
            this.interfaceName = name;
        };
        Module.prototype.setModuleExport = function setModuleExport(name) {
            if (this.getOwnRef(name)) {
                throw new ASTException('Reference "' + name + '" already defined in local scope', this);
            }
            let localName = this.addLocal(name, false);
            this.moduleExport = localName;
            return localName;
        };
        Module.prototype.addExport = function addExport(name) {
            if (this.getOwnRef(name)) {
                throw new ASTException('Reference "' + name + '" already defined in local scope', this);
            }
            let localName = this.addLocal(name, false);
            this.exports.set(name, localName);
            return localName;
        };
        Module.prototype.getOwnRef = function getOwnRef(name) {
            let refName;
            if ((refName = Scope.prototype.getOwnRef.call(this, name)) !== null) {
                return refName;
            }
            if (this.exports.has(name)) {
                return this.exports.get(name);
            } else if (this.moduleExport === name) {
                return this.moduleExport;
            }
            return null;
        };
        Module.prototype.toSourceNode = function toSourceNode() {
            this.nl(1);
            let code = Scope.prototype.toSourceNode.call(this);
            let result = this.csn('module(\'' + this.parser.moduleName + '\', function(module, resource) {' + this.nl());
            result.add(this.refsToSourceNode());
            result.add(code);
            if (this.moduleExport !== null) {
                result.add([ 'module.exports = ', this.moduleExport, ';' + this.nl() ]);
            }
            let exports = this.exports.keys();
            for (let id in exports) {
                result.add([
                    'module.exports.' + exports[id] + ' = ',
                    this.exports.get(exports[id]),
                    ';' + this.nl()
                ]);
            }
            if (this.interfaceName !== null) {
                result.add('___module.exports = module.exports;' + this.nl());
            }
            result.add(this.nl(-1, result) + '});' + this.nl());
            return result;
        };
        return Module;
    })(Scope);
    module.exports = Module;
});
module('mode/adria/file_node.adria', function(module, resource) {
    let path = ___require('path');
    let fs = ___require('fs');
    let Node = require('mode/adria/node.adria');
    let FileNode = (function(___parent) {
        function FileNode() {
            var ___num$a5 = arguments.length, ___args$a4 = new Array(___num$a5);
            for (var ___i$a5 = 0; ___i$a5 < ___num$a5; ++___i$a5) {
                ___args$a4[___i$a5] = arguments[___i$a5];
            }
            ___parent.apply(this, ___args$a4);
        }
        FileNode.prototype = Object.create(___parent.prototype);
        FileNode.prototype.constructor = FileNode;
        FileNode.prototype.isRelativePath = function isRelativePath(filename) {
            return filename.slice(0, 2) === './' || filename.slice(0, 3) === '../';
        };
        FileNode.prototype.makeBaseRelative = function makeBaseRelative(filename, parser) {
            let absName = path.dirname(parser.file) + '/' + filename;
            return path.relative(parser.transform.options['basePath'], absName);
        };
        FileNode.prototype.resolvePath = function resolvePath(filename, parser, scanNodePaths) {
            var ___al = arguments.length;
            var ___scanNodePaths$a1 = (___al > 2 ? scanNodePaths : (false));
            let options = parser.transform.options;
            let relname;
            if (this.isRelativePath(filename)) {
                relname = this.makeBaseRelative(filename, parser);
                if (fs.existsSync(options['basePath'] + relname)) {
                    return path.normalize(relname);
                }
            } else {
                for (let id in options['paths']) {
                    let includePath = options['paths'][id];
                    relname = includePath + filename;
                    if (fs.existsSync(options['basePath'] + relname)) {
                        return path.normalize(relname);
                    }
                }
                if (___scanNodePaths$a1) {
                    return this.resolveNodePath(filename, parser);
                }
            }
            return null;
        };
        FileNode.prototype.resolveNodePath = function resolveNodePath(filename, parser, extension) {
            var ___al = arguments.length;
            var ___extension$a3 = (___al > 2 ? extension : ('.js'));
            let basePath = parser.transform.options['basePath'];
            let currentLevel = process.cwd() + '/' + basePath;
            let split;
            let rootName = path.basename(filename, ___extension$a3);
            if ((split = filename.indexOf('/')) > -1) {
                rootName = filename.slice(0, split);
            }
            do {
                let nodeModules = currentLevel + 'node_modules/';
                if (fs.existsSync(nodeModules)) {
                    if (rootName + ___extension$a3 === filename) {
                        if (fs.existsSync(nodeModules + rootName + '/index.js')) {
                            return path.relative(basePath, nodeModules + rootName + '/index.js');
                        } else if (fs.existsSync(nodeModules + rootName + '/package.json')) {
                            let json = JSON.parse(fs.readFileSync(nodeModules + rootName + '/package.json'));
                            if (json.main) {
                                return path.relative(basePath, nodeModules + rootName + '/' + json.main);
                            }
                        }
                    } else if (fs.existsSync(nodeModules + filename)) {
                        return path.relative(basePath, nodeModules + '/' + filename);
                    }
                }
                if (currentLevel !== '/') {
                    currentLevel = path.normalize(currentLevel + '../');
                }
            } while (currentLevel !== '/');
            return null;
        };
        return FileNode;
    })(Node);
    module.exports = FileNode;
});
module('mode/adria/definition/require_literal.adria', function(module, resource) {
    let util = require('util.adria');
    let FileNode = require('mode/adria/file_node.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let RequireLiteral = (function(___parent) {
        function RequireLiteral() {
            var ___num$a9 = arguments.length, ___args$a8 = new Array(___num$a9);
            for (var ___i$a9 = 0; ___i$a9 < ___num$a9; ++___i$a9) {
                ___args$a8[___i$a9] = arguments[___i$a9];
            }
            ___parent.apply(this, ___args$a8);
        }
        RequireLiteral.prototype = Object.create(___parent.prototype);
        RequireLiteral.prototype.constructor = RequireLiteral;
        RequireLiteral.prototype.moduleName = '';
        RequireLiteral.prototype.requireFunction = '';
        RequireLiteral.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let parser = this.parser;
            let options = parser.transform.options;
            this.moduleName = this.get('file').toString().slice(1, -1);
            this.requireFunction = 'require';
            let resolvedName = util.normalizeExtension(this.moduleName, options['extension']);
            if (parser.transform.builtins[resolvedName] !== undefined) {
                parser.transform.usedBuiltins.add(resolvedName);
                this.moduleName = resolvedName;
                if (resolvedName === 'async.adria') {
                    parser.resultData.globalDeclarations.add('___Async');
                }
            } else {
                let resolvedPath = this.resolvePath(resolvedName, parser);
                if (resolvedPath !== null && resolvedPath.hasPostfix(options['extension'])) {
                    this.moduleName = resolvedPath;
                    parser.resultData.requires.add(this.moduleName);
                } else if (this.moduleName.hasPostfix(options['extension']) === false) {
                    if (options['platform'] === 'node') {
                        this.requireFunction = '___require';
                    } else {
                        let resolvedJsPath = this.resolvePath(util.normalizeExtension(this.moduleName, '.js'), parser, true);
                        if (resolvedJsPath === null) {
                            throw new ASTException('Could not find require "' + this.moduleName + '"', this);
                        }
                        this.moduleName = resolvedJsPath;
                        parser.resultData.jsRequires.add(this.moduleName);
                    }
                } else {
                    throw new ASTException('Could not find require "' + this.moduleName + '"', this);
                }
            }
            ___p.prototype.preprocess.call(this, state);
        };
        RequireLiteral.prototype.toSourceNode = function toSourceNode() {
            return this.csn([
                this.requireFunction + '(',
                this.get('file').csn("'" + this.moduleName + "'"),
                ')'
            ]);
        };
        return RequireLiteral;
    })(FileNode);
    module.exports = RequireLiteral;
});
module('mode/adria/definition/resource_literal.adria', function(module, resource) {
    let FileNode = require('mode/adria/file_node.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let ResourceLiteral = (function(___parent) {
        function ResourceLiteral() {
            var ___num$ad = arguments.length, ___args$ac = new Array(___num$ad);
            for (var ___i$ad = 0; ___i$ad < ___num$ad; ++___i$ad) {
                ___args$ac[___i$ad] = arguments[___i$ad];
            }
            ___parent.apply(this, ___args$ac);
        }
        ResourceLiteral.prototype = Object.create(___parent.prototype);
        ResourceLiteral.prototype.constructor = ResourceLiteral;
        ResourceLiteral.prototype.resolvedName = '';
        ResourceLiteral.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let fileName = this.get('file').toString().slice(1, -1);
            this.resolvedName = this.resolvePath(fileName, this.parser);
            if (this.resolvedName !== null) {
                this.parser.resultData.resources.add(this.resolvedName);
            } else {
                throw new ASTException('Could not find resource "' + fileName + '"', this);
            }
            ___p.prototype.preprocess.call(this, state);
        };
        ResourceLiteral.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add('resource(');
            result.add(this.get('file').csn("'" + this.resolvedName + "'"));
            result.add(')');
            return result;
        };
        return ResourceLiteral;
    })(FileNode);
    module.exports = ResourceLiteral;
});
module('mode/adria/definition/generator_literal.adria', function(module, resource) {
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let SourceNode = require('source_node.adria');
    let GeneratorLiteral = (function(___parent) {
        function GeneratorLiteral() {
            var ___num$ag = arguments.length, ___args$af = new Array(___num$ag);
            for (var ___i$ag = 0; ___i$ag < ___num$ag; ++___i$ag) {
                ___args$af[___i$ag] = arguments[___i$ag];
            }
            ___parent.apply(this, ___args$af);
        }
        GeneratorLiteral.prototype = Object.create(___parent.prototype);
        GeneratorLiteral.prototype.constructor = GeneratorLiteral;
        GeneratorLiteral.prototype.preParamList = function preParamList(result) {
            result.add('function*');
            if (this.name.valid) {
                result.add([ ' ', this.name.getPlain() ]);
            }
        };
        return GeneratorLiteral;
    })(FunctionLiteral);
    module.exports = GeneratorLiteral;
});
module('mode/adria/definition/async_literal.adria', function(module, resource) {
    let GeneratorLiteral = require('mode/adria/definition/generator_literal.adria');
    let SourceNode = require('source_node.adria');
    let AsyncLiteral = (function(___parent) {
        function AsyncLiteral() {
            var ___num$ao = arguments.length, ___args$an = new Array(___num$ao);
            for (var ___i$ao = 0; ___i$ao < ___num$ao; ++___i$ao) {
                ___args$an[___i$ao] = arguments[___i$ao];
            }
            ___parent.apply(this, ___args$an);
        }
        AsyncLiteral.prototype = Object.create(___parent.prototype);
        AsyncLiteral.prototype.constructor = AsyncLiteral;
        AsyncLiteral.prototype.useCallback = false;
        AsyncLiteral.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let parser = this.parser;
            parser.resultData.globalDeclarations.add('___Async');
            parser.transform.usedBuiltins.add('async.adria');
            ___p.prototype.preprocess.call(this, state);
        };
        AsyncLiteral.prototype.storeCallback = function storeCallback() {
            this.useCallback = true;
            return '___cbh$' + this.thisId;
        };
        AsyncLiteral.prototype.preParamList = function preParamList(result) {
            result.add('function*');
        };
        AsyncLiteral.prototype.preBody = function preBody(result) {
            if (this.useCallback) {
                result.add('try {' + this.nl(1));
            }
        };
        AsyncLiteral.prototype.postBody = function postBody(result) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.postBody !== postBody || ___c.hasOwnProperty('postBody') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            if (this.useCallback) {
                let name = '___aex$' + this.thisId;
                result.add([
                    this.storeCallback() + '(null, undefined);',
                    this.nl(-1) + '}'
                ]);
                result.add([
                    ' catch (' + name + ') {' + this.nl(1) + this.storeCallback() + '(' + name + ', undefined);',
                    this.nl(-1) + '}'
                ]);
            }
            ___p.prototype.postBody.call(this, result);
        };
        AsyncLiteral.prototype.toSourceNode = function toSourceNode() {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.toSourceNode !== toSourceNode || ___c.hasOwnProperty('toSourceNode') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let result = this.csn();
            result.add('(function() {' + this.nl(1));
            result.add([
                'var ___self = ',
                ___p.prototype.toSourceNode.call(this),
                ';',
                this.nl()
            ]);
            result.add([
                'return function',
                this.name.valid ? ' ' + this.name.getPlain() : '',
                '() {' + this.nl(1)
            ]);
            let argsName = '___args$' + this.parser.transform.makeUID();
            result.add(this.jsCopyArguments(argsName));
            result.add('return new ___Async(___self.apply(this, ' + argsName + '));' + this.nl(-1));
            result.add('};' + this.nl(-1));
            result.add('})()');
            return result;
        };
        return AsyncLiteral;
    })(GeneratorLiteral);
    module.exports = AsyncLiteral;
});
module('mode/adria/params_node.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Map = require('../../astdlib/astd/map.adria');
    let ParamsNode = (function(___parent) {
        function ParamsNode() {
            var ___num$az = arguments.length, ___args$ay = new Array(___num$az);
            for (var ___i$az = 0; ___i$az < ___num$az; ++___i$az) {
                ___args$ay[___i$az] = arguments[___i$az];
            }
            ___parent.apply(this, ___args$ay);
        }
        ParamsNode.prototype = Object.create(___parent.prototype);
        ParamsNode.prototype.constructor = ParamsNode;
        ParamsNode.prototype.countActiveOptionals = function countActiveOptionals() {
            let result = 0;
            this.eachKey('opt_items', function(node) {
                if (node.optionalIsActive === true) {
                    let items = 0;
                    node.eachKey('item', function() {
                        items++;
                    });
                    result += items + node.countActiveOptionals();
                }
            });
            return result;
        };
        ParamsNode.prototype.indexOptionals = function indexOptionals() {
            let result = [  ];
            this.eachKey('opt_items', function(node) {
                result.push(node);
                let nestedOptionals = node.indexOptionals();
                if (nestedOptionals.length > 0) {
                    result.push.apply(result, nestedOptionals);
                }
            });
            return result;
        };
        ParamsNode.prototype.indexParameters = function indexParameters() {
            let result = [  ];
            this.each(function(node) {
                if (node.key === 'opt_items') {
                    let nestedParameters = node.indexParameters();
                    if (nestedParameters.length > 0) {
                        result.push.apply(result, nestedParameters);
                    }
                } else {
                    result.push(node);
                }
            });
            return result;
        };
        ParamsNode.prototype.findValidOptionalPermutations = function findValidOptionalPermutations(optionals) {
            let bits = optionals.length;
            let permutations = Math.pow(2, bits);
            let patterns = new Map();
            for (let permutation = 0; permutation < permutations;permutation++) {
                let pattern = '';
                for (let bit = 0; bit < bits;bit++) {
                    let actuallySet = optionals[bit].setOptionalActive((permutation & (1 << bit)) > 0);
                    pattern += actuallySet ? '1' : '0';
                }
                if (patterns.lacks(pattern)) {
                    patterns.set(pattern, this.countActiveOptionals());
                }
            }
            return patterns;
        };
        ParamsNode.prototype.applyOptionalPermutation = function applyOptionalPermutation(permutation, optionals) {
            for (let id = 0; id < permutation.length;id++) {
                optionals[id].optionalIsActive = (permutation.slice(id, id + 1) === '1');
            }
        };
        return ParamsNode;
    })(Node);
    module.exports = ParamsNode;
});
module('mode/adria/definition/function_param_list.adria', function(module, resource) {
    let Set = require('../../astdlib/astd/set.adria');
    let ParamsNode = require('mode/adria/params_node.adria');
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let Scope = require('mode/adria/definition/scope.adria');
    let SourceNode = require('source_node.adria');
    let Node = require('mode/adria/node.adria');
    let FunctionParamList = (function(___parent) {
        function FunctionParamList() {
            var ___num$b9 = arguments.length, ___args$b8 = new Array(___num$b9);
            for (var ___i$b9 = 0; ___i$b9 < ___num$b9; ++___i$b9) {
                ___args$b8[___i$b9] = arguments[___i$b9];
            }
            ___parent.apply(this, ___args$b8);
        }
        FunctionParamList.prototype = Object.create(___parent.prototype);
        FunctionParamList.prototype.constructor = FunctionParamList;
        FunctionParamList.prototype.numParams = 0;
        FunctionParamList.prototype.optionalPermutations = null;
        FunctionParamList.prototype.optionalGroups = null;
        FunctionParamList.prototype.types = new Set([ 'boolean', 'number', 'finite', 'string', 'scalar', 'func', 'object' ]);
        FunctionParamList.prototype.reset = function reset(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.reset !== reset || ___c.hasOwnProperty('reset') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            this.numParams = 0;
            this.optionalPermutations = null;
            this.optionalGroups = null;
            ___p.prototype.reset.call(this, state);
        };
        FunctionParamList.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            let functionNode = this.findProto(FunctionLiteral);
            let scope = this.findScope();
            if (this.has('opt_items')) {
                this.initOptionals();
                this.generatePermutationSwitch(functionNode);
            }
            this.each(function(node) {
                this.handle(functionNode, scope, result, node);
            });
            return result.join(', ');
        };
        FunctionParamList.prototype.handle = function handle(functionNode, scope, result, node) {
            if (node.key === 'item') {
                let nameSN = node.get('name').toSourceNode();
                if (this.optionalPermutations === null) {
                    result.add(nameSN);
                }
                let valueNode = node.get('value');
                let localName;
                if (this.optionalPermutations === null) {
                    if (valueNode.isNode()) {
                        localName = scope.addLocal(nameSN.toString(), false, true, true);
                    } else {
                        localName = scope.addLocal(nameSN.toString(), false, true);
                    }
                } else {
                    localName = scope.addLocal(nameSN.toString(), true);
                }
                if (valueNode.isNode() && this.optionalPermutations === null) {
                    let defaultArg = this.csn([
                        'var ' + localName + ' = (' + functionNode.jsArgumentsLength() + ' > ' + this.numParams + ' ? ',
                        nameSN,
                        ' : (',
                        valueNode.toSourceNode(),
                        '));'
                    ]);
                    functionNode.specialArgs.push(defaultArg);
                }
                this.generateAnnotationChecks(node, functionNode);
                this.numParams++;
                return true;
            } else if (node.key === 'opt_items') {
                let that = this;
                node.each(function(child) {
                    that.handle(functionNode, scope, result, child);
                });
            } else if (node.key === 'rest') {
                let name = node.get('name').toSourceNode();
                scope.addLocal(name.toString(), false, true);
                let restArg = this.jsCopyArguments(name, this.numParams);
                functionNode.specialArgs.push(restArg);
                return true;
            }
            return false;
        };
        FunctionParamList.prototype.initOptionals = function initOptionals() {
            let optionals = this.indexOptionals();
            let permutations = this.findValidOptionalPermutations(optionals);
            let counts = new Set();
            for (let permutation in permutations.data) {
                let numParameters = permutations.data[permutation];
                if (counts.has(numParameters)) {
                    throw new ASTException('Ambiguous parameter-list, multiple permutations result in ' + numParameters + ' optional parameters', this);
                }
                counts.add(numParameters);
            }
            this.optionalGroups = optionals;
            this.optionalPermutations = permutations.data;
        };
        FunctionParamList.prototype.generateAnnotationChecks = function generateAnnotationChecks(node, functionNode) {
            let annotationNode = node.get('annotation');
            if (annotationNode.isDummy()) {
                return ;
            }
            let type = annotationNode.toString();
            if (this.types.has(type) === false) {
                this.markUsed(type);
            }
            if (this.parser.transform.options['assert'] === false) {
                return ;
            }
            let allowNull = node.get('annotation_mod').value === '?';
            let name = node.get('name').toString();
            let argId = this.numParams + 1;
            if (this.types.has(type)) {
                let check = "'$0', $1, $2, 'argument $3 ($2)'".format(type, allowNull ? 'true' : 'false', name, argId);
                functionNode.specialArgs.push(this.csn([ 'assert.type(', check, ');' ]));
            } else {
                let check = "$0, $1, $2, 'argument $3 ($2)', '$0'".format(type, allowNull ? 'true' : 'false', name, argId);
                functionNode.specialArgs.push(this.csn([ 'assert.instance(', check, ');' ]));
            }
        };
        FunctionParamList.prototype.generatePermutationSwitch = function generatePermutationSwitch(functionNode) {
            let FunctionParamsOptional = require('mode/adria/definition/function_params_optional.adria');
            let parameters = this.indexParameters();
            let parameterGroups = new Array(parameters.length);
            let numUngrouped = 0;
            let result = this.csn();
            for (let id in parameters) {
                let parameter = parameters[id];
                let optionalGroup = parameter.findProto(FunctionParamsOptional, FunctionParamList);
                if (optionalGroup instanceof FunctionParamsOptional) {
                    parameterGroups[id] = optionalGroup;
                } else {
                    parameterGroups[id] = null;
                    numUngrouped++;
                }
            }
            for (let permutation in this.optionalPermutations) {
                let numGrouped = this.optionalPermutations[permutation];
                result.add('if (' + functionNode.jsArgumentsLength() + ' === ' + (numGrouped + numUngrouped) + ') {' + this.nl(1));
                let argId = 0;
                this.applyOptionalPermutation(permutation, this.optionalGroups);
                for (let id in parameters) {
                    let parameter = parameters[id];
                    if (parameterGroups[id] === null || parameterGroups[id].optionalIsActive) {
                        result.add([
                            parameter.get('name').toSourceNode(),
                            ' = arguments[' + (argId++) + '];' + this.nl()
                        ]);
                    }
                }
                for (let id in parameters) {
                    let parameter = parameters[id];
                    if (parameterGroups[id] !== null && parameterGroups[id].optionalIsActive !== true) {
                        result.add([
                            parameter.get('name').toSourceNode(),
                            ' = ',
                            parameter.get('value').toSourceNode(),
                            ';' + this.nl()
                        ]);
                    }
                }
                result.add(this.nl(-1, result) + '} else ');
            }
            result.add('{' + this.nl(1) + 'throw new Exception(\'invalid number of arguments\');' + this.nl(-1) + '}');
            functionNode.specialArgs.unshift(result);
        };
        return FunctionParamList;
    })(ParamsNode);
    module.exports = FunctionParamList;
});
module('mode/adria/definition/function_params_optional.adria', function(module, resource) {
    let ParamsNode = require('mode/adria/params_node.adria');
    let FunctionParamList = require('mode/adria/definition/function_param_list.adria');
    let FunctionParamsOptional = (function(___parent) {
        function FunctionParamsOptional() {
            var ___num$bd = arguments.length, ___args$bc = new Array(___num$bd);
            for (var ___i$bd = 0; ___i$bd < ___num$bd; ++___i$bd) {
                ___args$bc[___i$bd] = arguments[___i$bd];
            }
            ___parent.apply(this, ___args$bc);
        }
        FunctionParamsOptional.prototype = Object.create(___parent.prototype);
        FunctionParamsOptional.prototype.constructor = FunctionParamsOptional;
        FunctionParamsOptional.prototype.optionalIsActive = true;
        FunctionParamsOptional.prototype.reset = function reset(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.reset !== reset || ___c.hasOwnProperty('reset') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            this.optionalIsActive = true;
            ___p.prototype.reset.call(this, state);
        };
        FunctionParamsOptional.prototype.setOptionalActive = function setOptionalActive(tryStatus) {
            let container = this.findProto(FunctionParamsOptional, FunctionParamList);
            if (container instanceof FunctionParamsOptional) {
                this.optionalIsActive = container.optionalIsActive && tryStatus;
            } else {
                this.optionalIsActive = tryStatus;
            }
            return this.optionalIsActive;
        };
        return FunctionParamsOptional;
    })(ParamsNode);
    module.exports = FunctionParamsOptional;
});
module('mode/adria/definition/async_param_list.adria', function(module, resource) {
    let AsyncLiteral = require('mode/adria/definition/async_literal.adria');
    let FunctionParamList = require('mode/adria/definition/function_param_list.adria');
    let Scope = require('mode/adria/definition/scope.adria');
    let SourceNode = require('source_node.adria');
    let Node = require('mode/adria/node.adria');
    let AsyncParamList = (function(___parent) {
        function AsyncParamList() {
            var ___num$bg = arguments.length, ___args$bf = new Array(___num$bg);
            for (var ___i$bg = 0; ___i$bg < ___num$bg; ++___i$bg) {
                ___args$bf[___i$bg] = arguments[___i$bg];
            }
            ___parent.apply(this, ___args$bf);
        }
        AsyncParamList.prototype = Object.create(___parent.prototype);
        AsyncParamList.prototype.constructor = AsyncParamList;
        AsyncParamList.prototype.handle = function handle(functionNode, scope, result, node) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.handle !== handle || ___c.hasOwnProperty('handle') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            if (___p.prototype.handle.call(this, functionNode, scope, result, node)) {
                return true;
            }
            if (node.key === 'callback') {
                result.add(functionNode.storeCallback());
                this.numParams++;
                return true;
            }
            return false;
        };
        return AsyncParamList;
    })(FunctionParamList);
    module.exports = AsyncParamList;
});
module('mode/adria/definition/expression.adria', function(module, resource) {
    let Set = require('../../astdlib/astd/set.adria');
    let Node = require('mode/adria/node.adria');
    let Name = require('mode/adria/name.adria');
    let Expression = (function(___parent) {
        function Expression() {
            var ___num$bn = arguments.length, ___args$bm = new Array(___num$bn);
            for (var ___i$bn = 0; ___i$bn < ___num$bn; ++___i$bn) {
                ___args$bm[___i$bn] = arguments[___i$bn];
            }
            ___parent.apply(this, ___args$bm);
        }
        Expression.prototype = Object.create(___parent.prototype);
        Expression.prototype.constructor = Expression;
        Expression.prototype.wrapPrefix = new Set([ 'member', 'index', 'proto', 'call', 'pcall', 'item' ]);
        Expression.prototype.preprocess = function preprocess(state) {
            Node.prototype.preprocess.call(this, state);
            let children = this.children;
            let id = children.length;
            let end = -1;
            while (id--) {
                if (children[id].key === 'wrap') {
                    end = id;
                } else if (end > -1 && this.wrapPrefix.lacks(children[id].key)) {
                    this.nest(id + 1, end);
                    end = -1;
                } else if (end > -1 && end < children.length - 1 && id === 0) {
                    this.nest(0, end);
                }
            }
        };
        Expression.prototype.scan = function scan(state) {
            Node.prototype.scan.call(this, state);
            this.eachKey('ident', function(child) {
                this.checkDefined(child.value);
            });
        };
        Expression.prototype.toSourceNode = function toSourceNode() {
            let children = this.children;
            let propertyAssignSplit = -1;
            let result = this.csn();
            for (let id in children) {
                let child = children[id];
                if (children[+id + 1] !== undefined && children[+id + 1].key === 'passignment_op') {
                    propertyAssignSplit = +id + 1;
                    break ;
                }
                switch (child.key) {
                    case 'member':
                        result.add(child.csn('.' + child.children[0].value));
                        break ;
                    case 'index':
                        result.add(child.csn('['));
                        result.add(child.toSourceNode());
                        result.add(child.csn(']'));
                        break ;
                    case 'proto':
                        result.add(child.csn('.prototype.' + child.children[0].value));
                        break ;
                    case 'ident':
                        this.markUsed(child.value);
                    case 'call':
                    case 'pcall':
                    case 'wrap':
                        result.add(child.csn(child.toSourceNode()));
                        break ;
                    case 'brace_op':
                    case 'xfix_op':
                        result.add(child.csn(child.value));
                        break ;
                    case 'unary_op':
                        result.add(child.csn(child.value.search(/[a-z]/) > -1 ? child.value + ' ' : child.value));
                        break ;
                    case 'binary_op':
                        let value = child.value;
                        if (value === '==') {
                            value = '===';
                        } else if (value === '!=') {
                            value = '!==';
                        } else if (value === '===' || value === '!==') {
                            application.notice('binary operator $0 is deprecated (comparisons is always strict)' + child.loc(), value);
                        }
                        result.add([ ' ', child.csn(value), ' ' ]);
                        break ;
                    case 'assignment_op':
                    case 'ternary_op':
                        result.add([ ' ', child.csn(child.value), ' ' ]);
                        break ;
                    default:
                        result.add(child.toSourceNode());
                        break ;
                }
            }
            if (propertyAssignSplit > -1) {
                let target;
                let name;
                let child = children[propertyAssignSplit - 1];
                switch (child.key) {
                    case 'member':
                        target = result;
                        name = "'" + child.children[0].value + "'";
                        break ;
                    case 'index':
                        target = result;
                        name = child.toSourceNode();
                        break ;
                    case 'proto':
                        result.add('.prototype');
                        target = result;
                        name = "'" + child.children[0].value + "'";
                        break ;
                }
                if (children[propertyAssignSplit].value === ':=') {
                    result.prepend('Object.defineProperty(');
                    result.add([ ', ', name, ', {' + this.nl(1) + 'value: ' ]);
                    result.add(children[propertyAssignSplit + 1].toSourceNode());
                    result.add(',' + this.nl() + 'writable: false' + this.nl(-1) + '})');
                } else {
                    result = children[propertyAssignSplit + 1].assignmentToSourceNode(name, target);
                }
            }
            let wrapper = this.get('wrap');
            if (wrapper.isNode()) {
                let locals = '';
                let params = wrapper.params.join(', ');
                for (let id = 0; id < wrapper.params.length;id++) {
                    locals += '___' + id + ', ';
                }
                result = this.csn([
                    '(function(' + locals + '___callback) {',
                    this.nl(1),
                    'return ',
                    result,
                    ';',
                    this.nl(-1),
                    '}).bind(this' + (wrapper.params.length > 0 ? ', ' + params : '') + ')'
                ]);
            }
            return result;
        };
        Expression.prototype.findAssignee = function findAssignee() {
            let children = this.children;
            let found = -1;
            for (let id = 0; id < children.length;id++) {
                if (children[id].key === 'assignment_op') {
                    found = id - 1;
                    break ;
                }
            }
            if (found !== -1) {
                let child = children[found];
                if (child.value === 'access_operation_member' || child.value === 'access_operation_proto') {
                    let item = child.get('item');
                    return new Name(item, item.value);
                }
                if (child.key === 'ident') {
                    return new Name(child, child.value);
                }
            }
            return null;
        };
        return Expression;
    })(Node);
    module.exports = Expression;
});
module('mode/adria/definition/object_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ObjectLiteral = (function(___parent) {
        function ObjectLiteral() {
            var ___num$bs = arguments.length, ___args$br = new Array(___num$bs);
            for (var ___i$bs = 0; ___i$bs < ___num$bs; ++___i$bs) {
                ___args$br[___i$bs] = arguments[___i$bs];
            }
            ___parent.apply(this, ___args$br);
        }
        ObjectLiteral.prototype = Object.create(___parent.prototype);
        ObjectLiteral.prototype.constructor = ObjectLiteral;
        ObjectLiteral.prototype.assembleItemList = function assembleItemList() {
            let items = this.csn();
            this.each(function(child) {
                let item = this.csn();
                item.add(child.get('key').csn(child.get('key').value));
                item.add(': ');
                item.add(child.get('value').toSourceNode());
                items.add(item);
            });
            return items;
        };
        ObjectLiteral.prototype.toSourceNode = function toSourceNode() {
            this.nl(1);
            let items = this.assembleItemList();
            let result = this.csn();
            if (items.toString().length >= 60) {
                result.add('{' + this.nl());
                result.add(items.join(',' + this.nl()));
                result.add(this.nl(-1) + '}');
            } else {
                this.nl(-1);
                result.add('{ ');
                result.add(items.join(', '));
                result.add(' }');
            }
            return result;
        };
        return ObjectLiteral;
    })(Node);
    module.exports = ObjectLiteral;
});
module('mode/adria/definition/property_literal.adria', function(module, resource) {
    let ObjectLiteral = require('mode/adria/definition/object_literal.adria');
    let SourceNode = require('source_node.adria');
    let PropertyLiteral = (function(___parent) {
        function PropertyLiteral() {
            var ___num$c1 = arguments.length, ___args$c0 = new Array(___num$c1);
            for (var ___i$c1 = 0; ___i$c1 < ___num$c1; ++___i$c1) {
                ___args$c0[___i$c1] = arguments[___i$c1];
            }
            ___parent.apply(this, ___args$c0);
        }
        PropertyLiteral.prototype = Object.create(___parent.prototype);
        PropertyLiteral.prototype.constructor = PropertyLiteral;
        PropertyLiteral.prototype.useStorage = false;
        PropertyLiteral.prototype.defaultValueNode = 'undefined';
        PropertyLiteral.prototype.target = 'undefined';
        PropertyLiteral.prototype.name = 'undefined';
        PropertyLiteral.prototype.preprocess = function preprocess(state) {
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    child.preprocess(state);
                }
            }
            this.each(function(child) {
                let childKey = child.get('key');
                let childValue = child.get('value');
                if (childKey.value === 'default') {
                    this.defaultValueNode = childValue.toSourceNode();
                    this.useStorage = true;
                } else if (childKey.value === 'storage') {
                    this.useStorage = true;
                }
            });
        };
        PropertyLiteral.prototype.assignmentToSourceNode = function assignmentToSourceNode(name, target) {
            this.target = target;
            this.name = name;
            let result = this.csn();
            let initial = this.useStorage;
            if (this.useStorage) {
                result.add('((function() {' + this.nl(1));
                this.getStorageCode(result);
            }
            result.add([ 'Object.defineProperty(', target, ', ', name, ', ' ]);
            result.add([ ObjectLiteral.prototype.toSourceNode.call(this), ')' ]);
            if (initial !== this.useStorage) {
                throw new Exception();
            }
            if (this.useStorage) {
                result.add(';' + this.nl(-1));
                result.add('})())');
            }
            return result;
        };
        PropertyLiteral.prototype.getStorageCode = function getStorageCode(result) {
            result.add([ 'let ___storage = Symbol();' + this.nl() ]);
            result.add('Object.defineProperty(' + this.target + ', ___storage, {' + this.nl(1));
            result.add([ 'value: ', this.defaultValueNode, ',' + this.nl() ]);
            result.add('writable: true' + this.nl(-1));
            result.add('});' + this.nl());
        };
        PropertyLiteral.prototype.getLookupCode = function getLookupCode(result, type) {
            result.add('(function() {' + this.nl(1));
            result.add([ 'var descriptor, level = ', this.target, ';' + this.nl() ]);
            result.add([
                'while ((level = Object.getPrototypeOf(level)) !== null && (descriptor = Object.getOwnPropertyDescriptor(level, ',
                this.name,
                ')) === undefined);' + this.nl()
            ]);
            result.add('return descriptor.' + type + ';' + this.nl(-1));
            result.add('})()');
        };
        PropertyLiteral.prototype.assembleItemList = function assembleItemList() {
            let items = this.csn();
            this.each(function(child) {
                let childKey = child.get('key');
                let inherit = child.has('inherit');
                if (childKey.value !== 'default' && childKey.value !== 'storage') {
                    let item = this.csn();
                    item.add(childKey.csn(childKey.value));
                    item.add(': ');
                    if (inherit) {
                        this.getLookupCode(item, childKey.value);
                    } else {
                        item.add(child.get('value').toSourceNode());
                    }
                    items.add(item);
                }
            });
            return items;
        };
        return PropertyLiteral;
    })(ObjectLiteral);
    module.exports = PropertyLiteral;
});
module('mode/adria/definition/proto_literal.adria', function(module, resource) {
    let ASTException = require('language_parser/ast_exception.adria');
    let Node = require('mode/adria/node.adria');
    let SourceNode = require('source_node.adria');
    let Name = require('mode/adria/name.adria');
    let ProtoLiteral = (function(___parent) {
        function ProtoLiteral() {
            var ___num$cd = arguments.length, ___args$cc = new Array(___num$cd);
            for (var ___i$cd = 0; ___i$cd < ___num$cd; ++___i$cd) {
                ___args$cc[___i$cd] = arguments[___i$cd];
            }
            ___parent.apply(this, ___args$cc);
        }
        ProtoLiteral.prototype = Object.create(___parent.prototype);
        ProtoLiteral.prototype.constructor = ProtoLiteral;
        ProtoLiteral.prototype.constructorSN = null;
        ProtoLiteral.prototype.provideParent = false;
        ProtoLiteral.prototype.name = null;
        ProtoLiteral.prototype.setLocalName = function setLocalName() {
            let name = this.findName();
            if (name !== null && name.valid) {
                let plain = name.getPlain();
                let isReserved = this.parser.transform.globalReservations.has(plain);
                this.name = new Name(name.node, plain, (isReserved ? '___' : '') + plain);
            } else {
                this.name = new Name();
            }
        };
        ProtoLiteral.prototype.preBody = function preBody(result, name) {
        };
        ProtoLiteral.prototype.postBody = function postBody(result) {
        };
        ProtoLiteral.prototype.toSourceNode = function toSourceNode() {
            let parentNode = this.get('parent');
            let haveParent = parentNode.isNode();
            let blankParent = (haveParent ? parentNode.toString() === 'null' : false);
            let chainToParent = haveParent && blankParent === false;
            this.setLocalName();
            let name = this.name.valid ? this.name.getPlain() : 'Anonymous';
            let mangledName = this.name.valid ? this.name.getMangled() : 'Anonymous';
            let result = this.csn();
            this.preBody(result, name);
            result.add('(function(' + (chainToParent ? '___parent' : '') + ') {' + this.nl(1));
            let body = this.get('body').toSourceNode();
            if (this.constructorSN !== null) {
                result.add([ this.constructorSN, this.nl() ]);
            } else {
                this.addDefaultConstructor(result, name, mangledName, chainToParent);
            }
            if (haveParent) {
                result.add(mangledName + '.prototype = Object.create(' + (blankParent ? 'null' : '___parent.prototype') + ');' + this.nl());
                result.add(mangledName + '.prototype.constructor = ' + mangledName + ';' + this.nl());
            }
            let mixinSources = [  ];
            this.eachKey('mixin', function(node) {
                mixinSources.push(node.toSourceNode());
            });
            result.add(this.jsMixin(mangledName, mixinSources));
            result.add(body);
            result.add('return ' + mangledName + ';' + this.nl(-1));
            result.add([ '})(', (chainToParent ? parentNode.toSourceNode() : ''), ')' ]);
            this.postBody(result);
            return result;
        };
        ProtoLiteral.prototype.jsMixin = function jsMixin(target, sources) {
            if (sources.length === 0) {
                return '';
            }
            let result = this.csn();
            result.add('(function(___srcs) {' + this.nl(1));
            if (sources.length > 1) {
                result.add('for (var ___src = ___srcs.length -1; ___src >= 0; --___src) {' + this.nl(1));
                result.add('var ___proto = ___srcs[___src].prototype;' + this.nl());
            } else {
                result.add([ 'var ___proto = ___srcs.prototype;' + this.nl() ]);
            }
            result.add('var ___props = Object.getOwnPropertyNames(___proto);' + this.nl());
            result.add('for (var ___prop = 0; ___prop < ___props.length; ++___prop) {' + this.nl(1));
            result.add('var ___propName = ___props[___prop];' + this.nl());
            result.add('if (' + target + '.prototype.hasOwnProperty(___propName) === false) {' + this.nl(1));
            result.add('Object.defineProperty(' + target + '.prototype, ___propName, Object.getOwnPropertyDescriptor(___proto, ___propName));' + this.nl(-1));
            result.add('}' + this.nl(-1));
            result.add('}' + this.nl(-1));
            if (sources.length > 1) {
                result.add('}' + this.nl(-1));
                result.add([ '})([ ', sources.join(', '), ' ]);' + this.nl() ]);
            } else {
                result.add([ '})(', sources[0], ');' + this.nl() ]);
            }
            return result;
        };
        ProtoLiteral.prototype.jsSelf = function jsSelf() {
            return this.name.valid ? this.name.getMangled() : 'Anonymous';
        };
        ProtoLiteral.prototype.jsParent = function jsParent(requestOrigin) {
            var ___al = arguments.length;
            var ___requestOrigin$ca = (___al > 0 ? requestOrigin : (null));
            let parentNode = this.get('parent');
            let haveParent = parentNode.isNode();
            let blankParent = (haveParent ? parentNode.toString() === 'null' : false);
            if (haveParent && blankParent === false) {
                return '___parent';
            } else if (blankParent === false) {
                return 'Object';
            } else {
                throw new ASTException('Attempted to access parent from null-proto', ___requestOrigin$ca || this);
            }
        };
        ProtoLiteral.prototype.addDefaultConstructor = function addDefaultConstructor(result, name, mangledName, chain) {
            if (name !== mangledName) {
                result.add('var ' + mangledName + ' = function ' + name + '() {');
            } else {
                result.add('function ' + name + '() {');
            }
            if (chain) {
                let argsName = '___args$' + this.parser.transform.makeUID();
                result.add(this.nl(1));
                result.add(this.jsCopyArguments(argsName));
                result.add('___parent.apply(this, ' + argsName + ');' + this.nl(-1));
            }
            result.add((name !== mangledName ? '};' : '}') + this.nl());
        };
        return ProtoLiteral;
    })(Node);
    module.exports = ProtoLiteral;
});
module('mode/adria/definition/proto_statement.adria', function(module, resource) {
    let ProtoLiteral = require('mode/adria/definition/proto_literal.adria');
    let SourceNode = require('source_node.adria');
    let ProtoStatement = (function(___parent) {
        function ProtoStatement() {
            var ___num$ch = arguments.length, ___args$cg = new Array(___num$ch);
            for (var ___i$ch = 0; ___i$ch < ___num$ch; ++___i$ch) {
                ___args$cg[___i$ch] = arguments[___i$ch];
            }
            ___parent.apply(this, ___args$cg);
        }
        ProtoStatement.prototype = Object.create(___parent.prototype);
        ProtoStatement.prototype.constructor = ProtoStatement;
        ProtoStatement.prototype.preBody = function preBody(result, name) {
            result.add([ 'let ', this.findScope().addLocal(name, false) + ' = ' ]);
        };
        ProtoStatement.prototype.postBody = function postBody(result) {
            result.add(';');
        };
        return ProtoStatement;
    })(ProtoLiteral);
    module.exports = ProtoStatement;
});
module('mode/adria/definition/proto_body_item.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Ident = require('mode/adria/definition/ident.adria');
    let ProtoBodyItem = (function(___parent) {
        function ProtoBodyItem() {
            var ___num$ck = arguments.length, ___args$cj = new Array(___num$ck);
            for (var ___i$ck = 0; ___i$ck < ___num$ck; ++___i$ck) {
                ___args$cj[___i$ck] = arguments[___i$ck];
            }
            ___parent.apply(this, ___args$cj);
        }
        ProtoBodyItem.prototype = Object.create(___parent.prototype);
        ProtoBodyItem.prototype.constructor = ProtoBodyItem;
        ProtoBodyItem.prototype.toSourceNode = function toSourceNode() {
            let protoNode = this.ancestor(null, [ 'new_proto_literal', 'proto_literal', 'proto_statement' ]);
            let keyNode = this.get('key');
            let mangledName = protoNode.name.valid ? protoNode.name.getMangled() : 'Anonymous';
            if (keyNode.value === 'constructor') {
                protoNode.constructorSN = this.get('value').toSourceNode();
                return this.csn();
            } else {
                let valueNode = this.get('value');
                let result;
                if (valueNode.value === 'property_literal') {
                    let name = (keyNode instanceof Ident === false ? keyNode.value : '"' + keyNode.value + '"');
                    return this.csn([
                        valueNode.assignmentToSourceNode(name, mangledName + '.prototype'),
                        ';' + this.nl()
                    ]);
                } else {
                    let name = (keyNode instanceof Ident === false ? '[' + keyNode.value + ']' : '.' + keyNode.value);
                    result = this.csn(mangledName + '.prototype' + name + ' = ');
                    result.add(valueNode.toSourceNode());
                    result.add(';' + this.nl());
                    return result;
                }
            }
        };
        return ProtoBodyItem;
    })(Node);
    module.exports = ProtoBodyItem;
});
module('mode/adria/definition/proto_body_constructor.adria', function(module, resource) {
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let ProtoLiteral = require('mode/adria/definition/proto_literal.adria');
    let SourceNode = require('source_node.adria');
    let ProtoBodyConstructor = (function(___parent) {
        function ProtoBodyConstructor() {
            var ___num$cr = arguments.length, ___args$cq = new Array(___num$cr);
            for (var ___i$cr = 0; ___i$cr < ___num$cr; ++___i$cr) {
                ___args$cq[___i$cr] = arguments[___i$cr];
            }
            ___parent.apply(this, ___args$cq);
        }
        ProtoBodyConstructor.prototype = Object.create(___parent.prototype);
        ProtoBodyConstructor.prototype.constructor = ProtoBodyConstructor;
        ProtoBodyConstructor.prototype.requiresMangling = false;
        ProtoBodyConstructor.prototype.setLocalName = function setLocalName() {
            let protoLiteral = this.findProto(ProtoLiteral);
            this.name = protoLiteral.name;
            if (this.name.valid) {
                this.addLocal(this.name.getPlain(), false, true);
            }
        };
        ProtoBodyConstructor.prototype.preParamList = function preParamList(result) {
            if (this.name.valid) {
                let name = this.name.valid ? this.name.getPlain() : 'Anonymous';
                let mangledName = this.name.valid ? this.name.getMangled() : 'Anonymous';
                if (name !== mangledName) {
                    this.requiresMangling = true;
                    result.add([
                        'var ',
                        this.name.getMangledNode(),
                        ' = function ',
                        this.name.getPlainNode()
                    ]);
                } else {
                    result.add([ 'function ', this.name.getPlainNode() ]);
                }
            } else {
                result.add([ 'function Anonymous' ]);
            }
        };
        ProtoBodyConstructor.prototype.postBody = function postBody(result) {
            result.add(this.nl(-1, result) + (this.requiresMangling ? '};' : '}'));
        };
        ProtoBodyConstructor.prototype.jsProtoLookup = function jsProtoLookup(lookupName, ownName) {
            var ___al = arguments.length;
            var ___ownName$cp = (___al > 1 ? ownName : (lookupName));
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.jsProtoLookup !== jsProtoLookup || ___c.hasOwnProperty('jsProtoLookup') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            return ___p.prototype.jsProtoLookup.call(this, 'constructor', ___ownName$cp !== '' ? ___ownName$cp : 'Anonymous');
        };
        return ProtoBodyConstructor;
    })(FunctionLiteral);
    module.exports = ProtoBodyConstructor;
});
module('mode/adria/definition/try_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Scope = require('mode/adria/definition/scope.adria');
    let Try = (function(___parent) {
        function Try() {
            var ___num$cu = arguments.length, ___args$ct = new Array(___num$cu);
            for (var ___i$cu = 0; ___i$cu < ___num$cu; ++___i$cu) {
                ___args$ct[___i$cu] = arguments[___i$cu];
            }
            ___parent.apply(this, ___args$ct);
        }
        Try.prototype = Object.create(___parent.prototype);
        Try.prototype.constructor = Try;
        Try.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add('try {' + this.nl(1));
            let body = this.get('body').toSourceNode();
            result.add(this.refsToSourceNode());
            result.add(body);
            result.add(this.nl(-1, body) + '}');
            return result;
        };
        return Try;
    })(Scope);
    let Catch = (function(___parent) {
        function Catch() {
            var ___num$cy = arguments.length, ___args$cx = new Array(___num$cy);
            for (var ___i$cy = 0; ___i$cy < ___num$cy; ++___i$cy) {
                ___args$cx[___i$cy] = arguments[___i$cy];
            }
            ___parent.apply(this, ___args$cx);
        }
        Catch.prototype = Object.create(___parent.prototype);
        Catch.prototype.constructor = Catch;
        Catch.prototype.exceptionName = '';
        Catch.prototype.toSourceNode = function toSourceNode() {
            this.exceptionName = '___exc$' + this.parser.transform.makeUID();
            let result = this.csn();
            result.add(' catch (' + this.exceptionName + ') {' + this.nl(1));
            this.each(function(node, first, last) {
                if (node instanceof CatchAll && first !== true) {
                    let block;
                    result.add([
                        ' else {' + this.nl(1),
                        block = node.toSourceNode(),
                        this.nl(-1, block) + '}'
                    ]);
                } else if (node instanceof CatchSpecific && first !== true) {
                    result.add([ ' else ', node.toSourceNode() ]);
                } else {
                    result.add(node.toSourceNode());
                }
                if (last && node instanceof CatchAll !== true) {
                    result.add(' else { ' + this.nl(1, result));
                    result.add('throw ' + this.exceptionName + ';' + this.nl());
                    result.add(this.nl(-1, result) + '}');
                }
            });
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return Catch;
    })(Node);
    let CatchAll = (function(___parent) {
        function CatchAll() {
            var ___num$d1 = arguments.length, ___args$d0 = new Array(___num$d1);
            for (var ___i$d1 = 0; ___i$d1 < ___num$d1; ++___i$d1) {
                ___args$d0[___i$d1] = arguments[___i$d1];
            }
            ___parent.apply(this, ___args$d0);
        }
        CatchAll.prototype = Object.create(___parent.prototype);
        CatchAll.prototype.constructor = CatchAll;
        CatchAll.prototype.toSourceNode = function toSourceNode() {
            let catchNode = this.findProto(Catch);
            let valueNode = this.get('value');
            let localName = this.addLocal(valueNode.value, false);
            let result = this.csn();
            result.add([
                'let ',
                valueNode.csn(localName),
                ' = ' + catchNode.exceptionName + ';' + this.nl()
            ]);
            result.add(this.get('body').toSourceNode());
            return result;
        };
        return CatchAll;
    })(Scope);
    let CatchSpecific = (function(___parent) {
        function CatchSpecific() {
            var ___num$d4 = arguments.length, ___args$d3 = new Array(___num$d4);
            for (var ___i$d4 = 0; ___i$d4 < ___num$d4; ++___i$d4) {
                ___args$d3[___i$d4] = arguments[___i$d4];
            }
            ___parent.apply(this, ___args$d3);
        }
        CatchSpecific.prototype = Object.create(___parent.prototype);
        CatchSpecific.prototype.constructor = CatchSpecific;
        CatchSpecific.prototype.toSourceNode = function toSourceNode() {
            let catchNode = this.findProto(Catch);
            let valueNode = this.get('value');
            let localName = this.addLocal(valueNode.value, false);
            let result = this.csn();
            result.add([
                'if (' + catchNode.exceptionName + ' instanceof ',
                this.get('type').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            result.add([
                'let ',
                valueNode.csn(localName),
                ' = ' + catchNode.exceptionName + ';' + this.nl()
            ]);
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return CatchSpecific;
    })(Scope);
    let Finally = (function(___parent) {
        function Finally() {
            var ___num$d7 = arguments.length, ___args$d6 = new Array(___num$d7);
            for (var ___i$d7 = 0; ___i$d7 < ___num$d7; ++___i$d7) {
                ___args$d6[___i$d7] = arguments[___i$d7];
            }
            ___parent.apply(this, ___args$d6);
        }
        Finally.prototype = Object.create(___parent.prototype);
        Finally.prototype.constructor = Finally;
        Finally.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add(' finally {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return Finally;
    })(Scope);
    module.exports.Try = Try;
    module.exports.Catch = Catch;
    module.exports.CatchAll = CatchAll;
    module.exports.CatchSpecific = CatchSpecific;
    module.exports.Finally = Finally;
});
module('mode/adria/definition/for_count_statement.adria', function(module, resource) {
    let Scope = require('mode/adria/definition/scope.adria');
    let Node = require('mode/adria/node.adria');
    let ForCountStatement = (function(___parent) {
        function ForCountStatement() {
            var ___num$db = arguments.length, ___args$da = new Array(___num$db);
            for (var ___i$db = 0; ___i$db < ___num$db; ++___i$db) {
                ___args$da[___i$db] = arguments[___i$db];
            }
            ___parent.apply(this, ___args$da);
        }
        ForCountStatement.prototype = Object.create(___parent.prototype);
        ForCountStatement.prototype.constructor = ForCountStatement;
        ForCountStatement.prototype.toSourceNode = function toSourceNode() {
            let initNode = this.get('init');
            let init;
            if (initNode.value === 'var_statement') {
                let varDefs = this.csn();
                let ownScope = this;
                initNode.eachKey('item', function(node) {
                    let valueNode = node.get('value');
                    let nameNode = node.get('name');
                    let localName = ownScope.addLocal(nameNode.value, false);
                    if (valueNode.isNode()) {
                        varDefs.add(this.csn([ nameNode.csn(localName), ' = ', valueNode.toSourceNode() ]));
                    } else {
                        varDefs.add(nameNode.csn(localName));
                    }
                });
                init = this.csn();
                init.add([ 'let ', varDefs.join(', ') ]);
            } else {
                init = initNode.toSourceNode();
            }
            let test = this.get('test').toSourceNode();
            let condOp = this.get('cond_op').toSourceNode();
            this.nl(1);
            let body = this.get('body').toSourceNode();
            this.nl(-1);
            let result = this.csn();
            result.add(this.refsToSourceNode());
            result.add([ 'for (', init, '; ', test, ';', condOp, ') {' + this.nl(1) ]);
            result.add([ body, this.nl(-1, body) + '}' ]);
            return result;
        };
        return ForCountStatement;
    })(Scope);
    module.exports = ForCountStatement;
});
module('mode/adria/definition/import_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let ImportStatement = (function(___parent) {
        function ImportStatement() {
            var ___num$dh = arguments.length, ___args$dg = new Array(___num$dh);
            for (var ___i$dh = 0; ___i$dh < ___num$dh; ++___i$dh) {
                ___args$dg[___i$dh] = arguments[___i$dh];
            }
            ___parent.apply(this, ___args$dg);
        }
        ImportStatement.prototype = Object.create(___parent.prototype);
        ImportStatement.prototype.constructor = ImportStatement;
        ImportStatement.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let resultData = this.parser.resultData;
            this.eachKey('item', function(node) {
                resultData.globalReservations.add(node.value);
            });
            ___p.prototype.preprocess.call(this, state);
        };
        ImportStatement.prototype.toSourceNode = function toSourceNode() {
            let scope = this.findScope();
            this.eachKey('item', function(node) {
                if (scope.localReferences.has(node.value)) {
                    throw new ASTException('Reference "' + node.value + '" already defined in local scope', this);
                }
                scope.localReferences.set(node.value, node.value);
            });
            return this.csn();
        };
        return ImportStatement;
    })(Node);
    module.exports = ImportStatement;
});
module('mode/adria/definition/application_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ApplicationStatement = (function(___parent) {
        function ApplicationStatement() {
            var ___num$dl = arguments.length, ___args$dk = new Array(___num$dl);
            for (var ___i$dl = 0; ___i$dl < ___num$dl; ++___i$dl) {
                ___args$dk[___i$dl] = arguments[___i$dl];
            }
            ___parent.apply(this, ___args$dk);
        }
        ApplicationStatement.prototype = Object.create(___parent.prototype);
        ApplicationStatement.prototype.constructor = ApplicationStatement;
        ApplicationStatement.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            if (this.findScope().getRef('application', false) === null) {
                this.parser.transform.addApplication = true;
            }
            ___p.prototype.preprocess.call(this, state);
        };
        ApplicationStatement.prototype.toSourceNode = function toSourceNode() {
            return this.csn([ 'application', this.get('call').toSourceNode(), ';' ]);
        };
        return ApplicationStatement;
    })(Node);
    module.exports = ApplicationStatement;
});
module('mode/adria/definition/access_operation_protocall.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let AccessOperationProtocall = (function(___parent) {
        function AccessOperationProtocall() {
            var ___num$dp = arguments.length, ___args$do = new Array(___num$dp);
            for (var ___i$dp = 0; ___i$dp < ___num$dp; ++___i$dp) {
                ___args$do[___i$dp] = arguments[___i$dp];
            }
            ___parent.apply(this, ___args$do);
        }
        AccessOperationProtocall.prototype = Object.create(___parent.prototype);
        AccessOperationProtocall.prototype.constructor = AccessOperationProtocall;
        AccessOperationProtocall.prototype.toSourceNode = function toSourceNode() {
            let params = this.get('call');
            let result = this.csn();
            result.add([ '.prototype.', this.csn(this.get('item').value), '.call(this' ]);
            params.each(function(param) {
                result.add([ ', ', param.toSourceNode() ]);
            });
            result.add(')');
            return result;
        };
        return AccessOperationProtocall;
    })(Node);
    module.exports = AccessOperationProtocall;
});
module('mode/adria/definition/const_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ConstLiteral = (function(___parent) {
        function ConstLiteral() {
            var ___num$ds = arguments.length, ___args$dr = new Array(___num$ds);
            for (var ___i$ds = 0; ___i$ds < ___num$ds; ++___i$ds) {
                ___args$dr[___i$ds] = arguments[___i$ds];
            }
            ___parent.apply(this, ___args$dr);
        }
        ConstLiteral.prototype = Object.create(___parent.prototype);
        ConstLiteral.prototype.constructor = ConstLiteral;
        ConstLiteral.prototype.toSourceNode = function toSourceNode() {
            let stringNode = this.get('string');
            if (stringNode.isNode()) {
                return this.csn(stringNode.value);
            } else {
                return this.csn(this.get('numeric').value);
            }
        };
        return ConstLiteral;
    })(Node);
    module.exports = ConstLiteral;
});
module('mode/adria/definition/invoke_operation.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let InvokeOperation = (function(___parent) {
        function InvokeOperation() {
            var ___num$dx = arguments.length, ___args$dw = new Array(___num$dx);
            for (var ___i$dx = 0; ___i$dx < ___num$dx; ++___i$dx) {
                ___args$dw[___i$dx] = arguments[___i$dx];
            }
            ___parent.apply(this, ___args$dw);
        }
        InvokeOperation.prototype = Object.create(___parent.prototype);
        InvokeOperation.prototype.constructor = InvokeOperation;
        InvokeOperation.prototype.toSourceNode = function toSourceNode(includeBraces) {
            var ___al = arguments.length;
            var ___includeBraces$du = (___al > 0 ? includeBraces : (true));
            let result = this.csn();
            if (___includeBraces$du) {
                result.add('(');
            }
            this.each(function(node, first) {
                if (first === false) {
                    result.add(', ');
                }
                result.add(node.toSourceNode());
            });
            if (___includeBraces$du) {
                result.add(')');
            }
            return result;
        };
        return InvokeOperation;
    })(Node);
    module.exports = InvokeOperation;
});
module('mode/adria/definition/async_wrap_operation.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let AsyncWrapOperation = (function(___parent) {
        function AsyncWrapOperation() {
            var ___num$e1 = arguments.length, ___args$e0 = new Array(___num$e1);
            for (var ___i$e1 = 0; ___i$e1 < ___num$e1; ++___i$e1) {
                ___args$e0[___i$e1] = arguments[___i$e1];
            }
            ___parent.apply(this, ___args$e0);
        }
        AsyncWrapOperation.prototype = Object.create(___parent.prototype);
        AsyncWrapOperation.prototype.constructor = AsyncWrapOperation;
        AsyncWrapOperation.prototype.params = null;
        AsyncWrapOperation.prototype.toSourceNode = function toSourceNode() {
            let id = 0;
            let result = this.csn();
            this.params = [  ];
            result.add('(');
            this.each(function(node, first) {
                if (first === false) {
                    result.add(', ');
                }
                if (node.value === '#') {
                    result.add('___callback');
                } else {
                    result.add('___' + id++);
                    this.params.push(node.toSourceNode().toString());
                }
            });
            result.add(')');
            return result;
        };
        return AsyncWrapOperation;
    })(Node);
    module.exports = AsyncWrapOperation;
});
module('mode/adria/definition/base_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let BaseLiteral = (function(___parent) {
        function BaseLiteral() {
            var ___num$e7 = arguments.length, ___args$e6 = new Array(___num$e7);
            for (var ___i$e7 = 0; ___i$e7 < ___num$e7; ++___i$e7) {
                ___args$e6[___i$e7] = arguments[___i$e7];
            }
            ___parent.apply(this, ___args$e6);
        }
        BaseLiteral.prototype = Object.create(___parent.prototype);
        BaseLiteral.prototype.constructor = BaseLiteral;
        BaseLiteral.prototype.scan = function scan(state) {
            Node.prototype.scan.call(this, state);
            this.eachKey('ident', function(child) {
                this.checkDefined(child.value);
            });
        };
        BaseLiteral.prototype.toSourceNode = function toSourceNode() {
            let result = '';
            this.each(function(child) {
                switch (child.key) {
                    case 'numeric':
                    case 'string':
                    case 'regexp':
                    case 'brace':
                        result += this.csn(child.value);
                        break ;
                    case 'ident':
                        this.markUsed(child.value);
                    default:
                        result += child.toSourceNode();
                }
            });
            return result;
        };
        return BaseLiteral;
    })(Node);
    module.exports = BaseLiteral;
});
module('mode/adria/definition/do_while_statement.adria', function(module, resource) {
    let Scope = require('mode/adria/definition/scope.adria');
    let DoWhileStatement = (function(___parent) {
        function DoWhileStatement() {
            var ___num$ea = arguments.length, ___args$e9 = new Array(___num$ea);
            for (var ___i$ea = 0; ___i$ea < ___num$ea; ++___i$ea) {
                ___args$e9[___i$ea] = arguments[___i$ea];
            }
            ___parent.apply(this, ___args$e9);
        }
        DoWhileStatement.prototype = Object.create(___parent.prototype);
        DoWhileStatement.prototype.constructor = DoWhileStatement;
        DoWhileStatement.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add('do {' + this.nl(1));
            let body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body ]);
            result.add([
                this.nl(-1, body) + '} while (',
                this.get('condition').toSourceNode(),
                ');'
            ]);
            return result;
        };
        return DoWhileStatement;
    })(Scope);
    module.exports = DoWhileStatement;
});
module('mode/adria/definition/while_statement.adria', function(module, resource) {
    let Scope = require('mode/adria/definition/scope.adria');
    let WhileStatement = (function(___parent) {
        function WhileStatement() {
            var ___num$ed = arguments.length, ___args$ec = new Array(___num$ed);
            for (var ___i$ed = 0; ___i$ed < ___num$ed; ++___i$ed) {
                ___args$ec[___i$ed] = arguments[___i$ed];
            }
            ___parent.apply(this, ___args$ec);
        }
        WhileStatement.prototype = Object.create(___parent.prototype);
        WhileStatement.prototype.constructor = WhileStatement;
        WhileStatement.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add([
                'while (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            let body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body ]);
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return WhileStatement;
    })(Scope);
    module.exports = WhileStatement;
});
module('mode/adria/definition/switch_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let SwitchStatement = (function(___parent) {
        function SwitchStatement() {
            var ___num$eh = arguments.length, ___args$eg = new Array(___num$eh);
            for (var ___i$eh = 0; ___i$eh < ___num$eh; ++___i$eh) {
                ___args$eg[___i$eh] = arguments[___i$eh];
            }
            ___parent.apply(this, ___args$eg);
        }
        SwitchStatement.prototype = Object.create(___parent.prototype);
        SwitchStatement.prototype.constructor = SwitchStatement;
        SwitchStatement.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add([ 'switch (', this.get('value').toSourceNode(), ') {', this.nl(1) ]);
            this.eachKey('case', function(caseNode) {
                result.add([
                    this.nl(0, result) + 'case ',
                    caseNode.get('match').toSourceNode(),
                    ':' + this.nl(1)
                ]);
                result.add(caseNode.get('body').toSourceNode());
                result.add(this.nl(-1));
            });
            let defaultNode = this.get('default');
            if (defaultNode.isNode()) {
                result.add(this.nl(0, result) + 'default:' + this.nl(1));
                result.add(defaultNode.get('body').toSourceNode());
                result.add(this.nl(-1));
            }
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return SwitchStatement;
    })(Node);
    module.exports = SwitchStatement;
});
module('mode/adria/definition/for_in_statement.adria', function(module, resource) {
    let Scope = require('mode/adria/definition/scope.adria');
    let ForInStatement = (function(___parent) {
        function ForInStatement() {
            var ___num$ek = arguments.length, ___args$ej = new Array(___num$ek);
            for (var ___i$ek = 0; ___i$ek < ___num$ek; ++___i$ek) {
                ___args$ej[___i$ek] = arguments[___i$ek];
            }
            ___parent.apply(this, ___args$ej);
        }
        ForInStatement.prototype = Object.create(___parent.prototype);
        ForInStatement.prototype.constructor = ForInStatement;
        ForInStatement.prototype.toSourceNode = function toSourceNode() {
            let keyNode = this.get('key');
            let valueNode = this.get('value');
            let keySN;
            let valueSN;
            let isVar = false;
            if (this.get('var').isNode()) {
                isVar = true;
                keySN = keyNode.csn(this.addLocal(keyNode.value, false));
                if (valueNode.isNode()) {
                    valueSN = valueNode.csn(this.addLocal(valueNode.value, false));
                }
            } else {
                keySN = keyNode.toSourceNode();
                valueSN = valueNode.toSourceNode();
            }
            let source = this.get('source').toSourceNode();
            this.nl(1);
            let body = this.get('body').toSourceNode();
            this.nl(-1);
            let result = this.csn();
            result.add(this.refsToSourceNode());
            result.add([
                'for (' + (isVar ? 'let ' : ''),
                keySN,
                ' in ',
                source,
                ') {' + this.nl(1)
            ]);
            if (valueNode.isNode()) {
                result.add([ 'let ', valueSN, ' = ', source, '[', keySN, '];', this.nl() ]);
            }
            result.add([ body, this.nl(-1, body), '}' ]);
            return result;
        };
        return ForInStatement;
    })(Scope);
    module.exports = ForInStatement;
});
module('mode/adria/definition/for_of_statement.adria', function(module, resource) {
    let Scope = require('mode/adria/definition/scope.adria');
    let ForOfStatement = (function(___parent) {
        function ForOfStatement() {
            var ___num$en = arguments.length, ___args$em = new Array(___num$en);
            for (var ___i$en = 0; ___i$en < ___num$en; ++___i$en) {
                ___args$em[___i$en] = arguments[___i$en];
            }
            ___parent.apply(this, ___args$em);
        }
        ForOfStatement.prototype = Object.create(___parent.prototype);
        ForOfStatement.prototype.constructor = ForOfStatement;
        ForOfStatement.prototype.toSourceNode = function toSourceNode() {
            let keySN;
            let keyNode = this.get('key');
            let isVar = false;
            if (this.get('var').isNode()) {
                isVar = true;
                keySN = keyNode.csn(this.addLocal(keyNode.value, false));
            } else {
                keySN = keyNode.toSourceNode();
            }
            let source = this.get('source').toSourceNode();
            this.nl(1);
            let body = this.get('body').toSourceNode();
            this.nl(-1);
            let result = this.csn();
            result.add(this.refsToSourceNode());
            result.add([
                'for (' + (isVar ? 'let ' : ''),
                keySN,
                ' of ',
                source,
                ') {' + this.nl(1)
            ]);
            result.add([ body, this.nl(-1, body), '}' ]);
            return result;
        };
        return ForOfStatement;
    })(Scope);
    module.exports = ForOfStatement;
});
module('mode/adria/definition/if_block.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Scope = require('mode/adria/definition/scope.adria');
    let IfStatement = (function(___parent) {
        function IfStatement() {
            var ___num$er = arguments.length, ___args$eq = new Array(___num$er);
            for (var ___i$er = 0; ___i$er < ___num$er; ++___i$er) {
                ___args$eq[___i$er] = arguments[___i$er];
            }
            ___parent.apply(this, ___args$eq);
        }
        IfStatement.prototype = Object.create(___parent.prototype);
        IfStatement.prototype.constructor = IfStatement;
        IfStatement.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            this.each(function(child) {
                if (child.key === 'else_if' || child.key === 'else') {
                    result.add(' else ');
                }
                result.add(child.toSourceNode());
            });
            return result;
        };
        return IfStatement;
    })(Node);
    let IfConditional = (function(___parent) {
        function IfConditional() {
            var ___num$eu = arguments.length, ___args$et = new Array(___num$eu);
            for (var ___i$eu = 0; ___i$eu < ___num$eu; ++___i$eu) {
                ___args$et[___i$eu] = arguments[___i$eu];
            }
            ___parent.apply(this, ___args$et);
        }
        IfConditional.prototype = Object.create(___parent.prototype);
        IfConditional.prototype.constructor = IfConditional;
        IfConditional.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add([
                'if (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            let body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body, this.nl(-1, body) + '}' ]);
            return result;
        };
        return IfConditional;
    })(Scope);
    let IfUnconditional = (function(___parent) {
        function IfUnconditional() {
            var ___num$ex = arguments.length, ___args$ew = new Array(___num$ex);
            for (var ___i$ex = 0; ___i$ex < ___num$ex; ++___i$ex) {
                ___args$ew[___i$ex] = arguments[___i$ex];
            }
            ___parent.apply(this, ___args$ew);
        }
        IfUnconditional.prototype = Object.create(___parent.prototype);
        IfUnconditional.prototype.constructor = IfUnconditional;
        IfUnconditional.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            result.add([ '{' + this.nl(1) ]);
            let body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body, this.nl(-1, body) + '}' ]);
            return result;
        };
        return IfUnconditional;
    })(Scope);
    module.exports.IfStatement = IfStatement;
    module.exports.IfConditional = IfConditional;
    module.exports.IfUnconditional = IfUnconditional;
});
module('mode/adria/definition/array_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ArrayLiteral = (function(___parent) {
        function ArrayLiteral() {
            var ___num$f1 = arguments.length, ___args$f0 = new Array(___num$f1);
            for (var ___i$f1 = 0; ___i$f1 < ___num$f1; ++___i$f1) {
                ___args$f0[___i$f1] = arguments[___i$f1];
            }
            ___parent.apply(this, ___args$f0);
        }
        ArrayLiteral.prototype = Object.create(___parent.prototype);
        ArrayLiteral.prototype.constructor = ArrayLiteral;
        ArrayLiteral.prototype.toSourceNode = function toSourceNode() {
            let items = this.csn();
            this.nl(1);
            this.each(function(child) {
                items.add(child.toSourceNode());
            });
            let result = this.csn();
            if (items.toString().length >= 60) {
                result.add('[' + this.nl());
                result.add(items.join(',' + this.nl()));
                result.add(this.nl(-1) + ']');
            } else {
                this.nl(-1);
                result.add('[ ');
                result.add(items.join(', '));
                result.add(' ]');
            }
            return result;
        };
        return ArrayLiteral;
    })(Node);
    module.exports = ArrayLiteral;
});
module('mode/adria/definition/new_proto_literal.adria', function(module, resource) {
    let ProtoLiteral = require('mode/adria/definition/proto_literal.adria');
    let NewProtoLiteral = (function(___parent) {
        function NewProtoLiteral() {
            var ___num$f4 = arguments.length, ___args$f3 = new Array(___num$f4);
            for (var ___i$f4 = 0; ___i$f4 < ___num$f4; ++___i$f4) {
                ___args$f3[___i$f4] = arguments[___i$f4];
            }
            ___parent.apply(this, ___args$f3);
        }
        NewProtoLiteral.prototype = Object.create(___parent.prototype);
        NewProtoLiteral.prototype.constructor = NewProtoLiteral;
        NewProtoLiteral.prototype.toSourceNode = function toSourceNode() {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.toSourceNode !== toSourceNode || ___c.hasOwnProperty('toSourceNode') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let result = this.csn();
            result.add('new (');
            result.add(___p.prototype.toSourceNode.call(this));
            result.add(')(');
            let paramList = this.get('param_list');
            if (paramList.isNode()) {
                result.add(paramList.toSourceNode());
            }
            result.add(')');
            return result;
        };
        return NewProtoLiteral;
    })(ProtoLiteral);
    module.exports = NewProtoLiteral;
});
module('mode/adria/definition/return_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let AsyncLiteral = require('mode/adria/definition/async_literal.adria');
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let ReturnStatement = (function(___parent) {
        function ReturnStatement() {
            var ___num$f7 = arguments.length, ___args$f6 = new Array(___num$f7);
            for (var ___i$f7 = 0; ___i$f7 < ___num$f7; ++___i$f7) {
                ___args$f6[___i$f7] = arguments[___i$f7];
            }
            ___parent.apply(this, ___args$f6);
        }
        ReturnStatement.prototype = Object.create(___parent.prototype);
        ReturnStatement.prototype.constructor = ReturnStatement;
        ReturnStatement.prototype.toSourceNode = function toSourceNode() {
            let type = this.get('type');
            let hostFunction = this.findProto(FunctionLiteral);
            let result;
            if (hostFunction instanceof AsyncLiteral && hostFunction.useCallback) {
                result = this.csn([
                    hostFunction.storeCallback() + '(null, ',
                    this.get('value').toSourceNode(),
                    ');' + this.nl() + 'return;'
                ]);
            } else {
                result = this.csn([ type.value, ' ', this.get('value').toSourceNode(), ';' ]);
            }
            return result;
        };
        return ReturnStatement;
    })(Node);
    module.exports = ReturnStatement;
});
module('mode/adria/definition/yield_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let YieldLiteral = (function(___parent) {
        function YieldLiteral() {
            var ___num$fb = arguments.length, ___args$fa = new Array(___num$fb);
            for (var ___i$fb = 0; ___i$fb < ___num$fb; ++___i$fb) {
                ___args$fa[___i$fb] = arguments[___i$fb];
            }
            ___parent.apply(this, ___args$fa);
        }
        YieldLiteral.prototype = Object.create(___parent.prototype);
        YieldLiteral.prototype.constructor = YieldLiteral;
        YieldLiteral.prototype.checkEnvironment = function checkEnvironment() {
            if (this.ancestor([ 'function', 'generator', 'async' ]).key !== 'generator') {
                throw new ASTException('Encountered "yield" outside of generator', this);
            }
        };
        YieldLiteral.prototype.toSourceNode = function toSourceNode() {
            this.checkEnvironment();
            return this.csn([ 'yield ', this.get('value').toSourceNode() ]);
        };
        return YieldLiteral;
    })(Node);
    module.exports = YieldLiteral;
});
module('mode/adria/definition/await_literal.adria', function(module, resource) {
    let YieldLiteral = require('mode/adria/definition/yield_literal.adria');
    let AsyncLiteral = require('mode/adria/definition/async_literal.adria');
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let AwaitLiteral = (function(___parent) {
        function AwaitLiteral() {
            var ___num$fe = arguments.length, ___args$fd = new Array(___num$fe);
            for (var ___i$fe = 0; ___i$fe < ___num$fe; ++___i$fe) {
                ___args$fd[___i$fe] = arguments[___i$fe];
            }
            ___parent.apply(this, ___args$fd);
        }
        AwaitLiteral.prototype = Object.create(___parent.prototype);
        AwaitLiteral.prototype.constructor = AwaitLiteral;
        AwaitLiteral.prototype.checkEnvironment = function checkEnvironment() {
            if (this.findProto(FunctionLiteral) instanceof AsyncLiteral === false) {
                throw new ASTException('Encountered "await" outside of asynchronous function', this);
            }
        };
        return AwaitLiteral;
    })(YieldLiteral);
    module.exports = AwaitLiteral;
});
module('mode/adria/definition/throw_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ThrowStatement = (function(___parent) {
        function ThrowStatement() {
            var ___num$fh = arguments.length, ___args$fg = new Array(___num$fh);
            for (var ___i$fh = 0; ___i$fh < ___num$fh; ++___i$fh) {
                ___args$fg[___i$fh] = arguments[___i$fh];
            }
            ___parent.apply(this, ___args$fg);
        }
        ThrowStatement.prototype = Object.create(___parent.prototype);
        ThrowStatement.prototype.constructor = ThrowStatement;
        ThrowStatement.prototype.toSourceNode = function toSourceNode() {
            return this.csn([ 'throw ', this.get('exception').toSourceNode(), ';' ]);
        };
        return ThrowStatement;
    })(Node);
    module.exports = ThrowStatement;
});
module('mode/adria/definition/assert_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let AssertStatement = (function(___parent) {
        function AssertStatement() {
            var ___num$fk = arguments.length, ___args$fj = new Array(___num$fk);
            for (var ___i$fk = 0; ___i$fk < ___num$fk; ++___i$fk) {
                ___args$fj[___i$fk] = arguments[___i$fk];
            }
            ___parent.apply(this, ___args$fj);
        }
        AssertStatement.prototype = Object.create(___parent.prototype);
        AssertStatement.prototype.constructor = AssertStatement;
        AssertStatement.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            let params = this.get('call');
            let paramsSN = params.toSourceNode(false);
            if (this.parser.transform.options['assert']) {
                result.add([ 'assert(', paramsSN ]);
                if (params.length < 2) {
                    result.add([ ", '" + paramsSN.toString().jsify("'") + "'" ]);
                }
                result.add(');');
            }
            return result;
        };
        return AssertStatement;
    })(Node);
    module.exports = AssertStatement;
});
module('mode/adria/definition/statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Statement = (function(___parent) {
        function Statement() {
            var ___num$fn = arguments.length, ___args$fm = new Array(___num$fn);
            for (var ___i$fn = 0; ___i$fn < ___num$fn; ++___i$fn) {
                ___args$fm[___i$fn] = arguments[___i$fn];
            }
            ___parent.apply(this, ___args$fm);
        }
        Statement.prototype = Object.create(___parent.prototype);
        Statement.prototype.constructor = Statement;
        Statement.prototype.toSourceNode = function toSourceNode() {
            let type = this.children[0].key;
            let body = Node.prototype.toSourceNode.call(this);
            let result = this.csn(body);
            switch (type) {
                case 'expression':
                    result.add(';' + this.nl());
                    break ;
                case 'import':
                case 'interface':
                    break ;
                case 'var':
                case 'global':
                case 'assert':
                    if (body.trim()) {
                        break ;
                    }
                default:
                    result.add(this.nl());
            }
            return result;
        };
        return Statement;
    })(Node);
    module.exports = Statement;
});
module('mode/adria/definition/interface_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Module = require('mode/adria/definition/module.adria');
    let InterfaceStatement = (function(___parent) {
        function InterfaceStatement() {
            var ___num$fr = arguments.length, ___args$fq = new Array(___num$fr);
            for (var ___i$fr = 0; ___i$fr < ___num$fr; ++___i$fr) {
                ___args$fq[___i$fr] = arguments[___i$fr];
            }
            ___parent.apply(this, ___args$fq);
        }
        InterfaceStatement.prototype = Object.create(___parent.prototype);
        InterfaceStatement.prototype.constructor = InterfaceStatement;
        InterfaceStatement.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let publishAs = this.get('publish_as').value;
            this.findProto(Module).setInterface(publishAs);
            ___p.prototype.preprocess.call(this, state);
        };
        InterfaceStatement.prototype.toSourceNode = function toSourceNode() {
            return this.csn();
        };
        return InterfaceStatement;
    })(Node);
    module.exports = InterfaceStatement;
});
module('mode/adria/definition/module_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Module = require('mode/adria/definition/module.adria');
    let ModuleStatement = (function(___parent) {
        function ModuleStatement() {
            var ___num$fu = arguments.length, ___args$ft = new Array(___num$fu);
            for (var ___i$fu = 0; ___i$fu < ___num$fu; ++___i$fu) {
                ___args$ft[___i$fu] = arguments[___i$fu];
            }
            ___parent.apply(this, ___args$ft);
        }
        ModuleStatement.prototype = Object.create(___parent.prototype);
        ModuleStatement.prototype.constructor = ModuleStatement;
        ModuleStatement.prototype.toSourceNode = function toSourceNode() {
            let name = this.get('name').value;
            let moduleNode = this.findProto(Module);
            let mangledName = moduleNode.setModuleExport(name);
            return this.csn([ 'let ', mangledName, ' = ', this.get('value').toSourceNode(), ';' ]);
        };
        return ModuleStatement;
    })(Node);
    module.exports = ModuleStatement;
});
module('mode/adria/definition/export_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let Module = require('mode/adria/definition/module.adria');
    let ExportStatement = (function(___parent) {
        function ExportStatement() {
            var ___num$fx = arguments.length, ___args$fw = new Array(___num$fx);
            for (var ___i$fx = 0; ___i$fx < ___num$fx; ++___i$fx) {
                ___args$fw[___i$fx] = arguments[___i$fx];
            }
            ___parent.apply(this, ___args$fw);
        }
        ExportStatement.prototype = Object.create(___parent.prototype);
        ExportStatement.prototype.constructor = ExportStatement;
        ExportStatement.prototype.toSourceNode = function toSourceNode() {
            let name = this.get('name').value;
            let moduleNode = this.findProto(Module);
            let mangledName = moduleNode.addExport(name);
            return this.csn([ 'let ', mangledName, ' = ', this.get('value').toSourceNode(), ';' ]);
        };
        return ExportStatement;
    })(Node);
    module.exports = ExportStatement;
});
module('mode/adria/definition/global_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let GlobalStatement = (function(___parent) {
        function GlobalStatement() {
            var ___num$g3 = arguments.length, ___args$g2 = new Array(___num$g3);
            for (var ___i$g3 = 0; ___i$g3 < ___num$g3; ++___i$g3) {
                ___args$g2[___i$g3] = arguments[___i$g3];
            }
            ___parent.apply(this, ___args$g2);
        }
        GlobalStatement.prototype = Object.create(___parent.prototype);
        GlobalStatement.prototype.constructor = GlobalStatement;
        GlobalStatement.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let resultData = this.parser.resultData;
            this.eachKey('item', function(node) {
                let nameNode = node.get('name');
                let fromNameNode = node.get('from_name');
                if (fromNameNode.isNode()) {
                    resultData.globalReservations.add(fromNameNode.value);
                    resultData.globalReferences.set(nameNode.value, fromNameNode.value);
                } else {
                    resultData.globalDeclarations.add(nameNode.value);
                    resultData.globalReferences.set(nameNode.value, nameNode.value);
                }
            });
            ___p.prototype.preprocess.call(this, state);
        };
        GlobalStatement.prototype.toSourceNode = function toSourceNode() {
            let result = this.csn();
            let nl = this.nl();
            this.eachKey('item', function(node, first, last) {
                let nameNode = node.get('name');
                let valueNode = node.get('value');
                if (valueNode.isNode()) {
                    result.add([
                        nameNode.value + ' = ',
                        valueNode.toSourceNode(),
                        ';' + (last ? '' : nl)
                    ]);
                }
            });
            return result.children.length > 0 ? result : '';
        };
        return GlobalStatement;
    })(Node);
    module.exports = GlobalStatement;
});
module('mode/adria/definition/var_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let VarStatement = (function(___parent) {
        function VarStatement() {
            var ___num$gb = arguments.length, ___args$ga = new Array(___num$gb);
            for (var ___i$gb = 0; ___i$gb < ___num$gb; ++___i$gb) {
                ___args$ga[___i$gb] = arguments[___i$gb];
            }
            ___parent.apply(this, ___args$ga);
        }
        VarStatement.prototype = Object.create(___parent.prototype);
        VarStatement.prototype.constructor = VarStatement;
        VarStatement.prototype.preprocess = function preprocess(state) {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.preprocess !== preprocess || ___c.hasOwnProperty('preprocess') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            let resultData = this.parser.resultData;
            this.eachKey('item', function(node) {
                let fromNameNode = node.get('from_name');
                if (fromNameNode.isNode()) {
                    resultData.globalReservations.add(fromNameNode.value);
                }
            });
            ___p.prototype.preprocess.call(this, state);
        };
        VarStatement.prototype.scan = function scan(state) {
            let usages = this.findScope().usages;
            this.eachKey('item', function(node) {
                let ident = node.get('name').value;
                if (usages.lacks(ident)) {
                    application.notice('unused reference "$0"' + this.loc(), ident);
                }
            });
            Node.prototype.scan.call(this, state);
        };
        VarStatement.prototype.toSourceNode = function toSourceNode() {
            let scope = this.findScope();
            let result = this.csn();
            let nl = this.nl();
            this.eachKey('item', function(node, first, last) {
                let nameNode = node.get('name');
                let valueNode = node.get('value');
                let fromNameNode = node.get('from_name');
                if (fromNameNode.isNode()) {
                    if (scope.localReferences.has(nameNode.value)) {
                        throw new ASTException('Reference "' + nameNode.value + '" already defined in local scope', this);
                    }
                    scope.localReferences.set(nameNode.value, fromNameNode.value);
                } else {
                    let localName = scope.addLocal(nameNode.value, false);
                    result.add([ 'let ' + nameNode.csn(localName) ]);
                    if (valueNode.isNode()) {
                        result.add([ ' = ', valueNode.toSourceNode() ]);
                    }
                    result.add([ ';' + (last ? '' : nl) ]);
                }
            });
            return result;
        };
        return VarStatement;
    })(Node);
    module.exports = VarStatement;
});
module('mode/adria/definition/storage_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let PropertyLiteral = require('mode/adria/definition/property_literal.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let StorageLiteral = (function(___parent) {
        function StorageLiteral() {
            var ___num$gf = arguments.length, ___args$ge = new Array(___num$gf);
            for (var ___i$gf = 0; ___i$gf < ___num$gf; ++___i$gf) {
                ___args$ge[___i$gf] = arguments[___i$gf];
            }
            ___parent.apply(this, ___args$ge);
        }
        StorageLiteral.prototype = Object.create(___parent.prototype);
        StorageLiteral.prototype.constructor = StorageLiteral;
        StorageLiteral.prototype.preprocess = function preprocess(state) {
            if (this.children instanceof Array) {
                for (let id in this.children) {
                    let child = this.children[id];
                    child.preprocess(state);
                }
            }
            let propertyItem = this.ancestor(null, 'property_accessor_item');
            if (propertyItem.parent instanceof PropertyLiteral) {
                propertyItem.parent.useStorage = true;
            }
        };
        StorageLiteral.prototype.toSourceNode = function toSourceNode() {
            let propertyItem = this.ancestor(null, 'property_accessor_item');
            let propertySelf = propertyItem.parent;
            let propertyFunction = propertyItem.get('value').get('function');
            if (propertySelf instanceof PropertyLiteral && propertyFunction instanceof FunctionLiteral) {
                return this.csn(propertyFunction.storeContext() + '[___storage]');
            }
            throw new ASTException('Invalid use of "storage" literal', this);
        };
        return StorageLiteral;
    })(Node);
    module.exports = StorageLiteral;
});
module('mode/adria/definition/parent_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let ProtoLiteral = require('mode/adria/definition/proto_literal.adria');
    let ParentLiteral = (function(___parent) {
        function ParentLiteral() {
            var ___num$gi = arguments.length, ___args$gh = new Array(___num$gi);
            for (var ___i$gi = 0; ___i$gi < ___num$gi; ++___i$gi) {
                ___args$gh[___i$gi] = arguments[___i$gi];
            }
            ___parent.apply(this, ___args$gh);
        }
        ParentLiteral.prototype = Object.create(___parent.prototype);
        ParentLiteral.prototype.constructor = ParentLiteral;
        ParentLiteral.prototype.toSourceNode = function toSourceNode() {
            let host = this.findFirstProto([ ProtoLiteral, FunctionLiteral ]);
            return this.csn(host.jsParent(this));
        };
        return ParentLiteral;
    })(Node);
    module.exports = ParentLiteral;
});
module('mode/adria/definition/self_literal.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let ProtoLiteral = require('mode/adria/definition/proto_literal.adria');
    let SelfLiteral = (function(___parent) {
        function SelfLiteral() {
            var ___num$gl = arguments.length, ___args$gk = new Array(___num$gl);
            for (var ___i$gl = 0; ___i$gl < ___num$gl; ++___i$gl) {
                ___args$gk[___i$gl] = arguments[___i$gl];
            }
            ___parent.apply(this, ___args$gk);
        }
        SelfLiteral.prototype = Object.create(___parent.prototype);
        SelfLiteral.prototype.constructor = SelfLiteral;
        SelfLiteral.prototype.toSourceNode = function toSourceNode() {
            let host = this.findFirstProto([ ProtoLiteral, FunctionLiteral ]);
            return this.csn(host.jsSelf());
        };
        return SelfLiteral;
    })(Node);
    module.exports = SelfLiteral;
});
module('mode/adria/definition/flow_statement.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let FlowStatement = (function(___parent) {
        function FlowStatement() {
            var ___num$go = arguments.length, ___args$gn = new Array(___num$go);
            for (var ___i$go = 0; ___i$go < ___num$go; ++___i$go) {
                ___args$gn[___i$go] = arguments[___i$go];
            }
            ___parent.apply(this, ___args$gn);
        }
        FlowStatement.prototype = Object.create(___parent.prototype);
        FlowStatement.prototype.constructor = FlowStatement;
        FlowStatement.prototype.toSourceNode = function toSourceNode() {
            return this.csn([
                this.get('type').value,
                ' ',
                this.get('value').toSourceNode(),
                ';'
            ]);
        };
        return FlowStatement;
    })(Node);
    module.exports = FlowStatement;
});
module('mode/adria/definition.adria', function(module, resource) {
    let Node = require('mode/adria/node.adria');
    let ValueType = require('mode/adria/value_type.adria');
    let Ident = require('mode/adria/definition/ident.adria');
    let Name = Ident;
    let ___String$gp = (function(___parent) {
        var ___String = function String() {
            var ___num$gr = arguments.length, ___args$gq = new Array(___num$gr);
            for (var ___i$gr = 0; ___i$gr < ___num$gr; ++___i$gr) {
                ___args$gq[___i$gr] = arguments[___i$gr];
            }
            ___parent.apply(this, ___args$gq);
        };
        ___String.prototype = Object.create(___parent.prototype);
        ___String.prototype.constructor = ___String;
        return ___String;
    })(ValueType);
    let Numeric = (function(___parent) {
        function Numeric() {
            var ___num$gt = arguments.length, ___args$gs = new Array(___num$gt);
            for (var ___i$gt = 0; ___i$gt < ___num$gt; ++___i$gt) {
                ___args$gs[___i$gt] = arguments[___i$gt];
            }
            ___parent.apply(this, ___args$gs);
        }
        Numeric.prototype = Object.create(___parent.prototype);
        Numeric.prototype.constructor = Numeric;
        return Numeric;
    })(ValueType);
    let Scope = require('mode/adria/definition/scope.adria');
    let Module = require('mode/adria/definition/module.adria');
    let RequireLiteral = require('mode/adria/definition/require_literal.adria');
    let ResourceLiteral = require('mode/adria/definition/resource_literal.adria');
    let FunctionLiteral = require('mode/adria/definition/function_literal.adria');
    let GeneratorLiteral = require('mode/adria/definition/generator_literal.adria');
    let AsyncLiteral = require('mode/adria/definition/async_literal.adria');
    let FunctionStatement = (function(___parent) {
        function FunctionStatement() {
            var ___num$gv = arguments.length, ___args$gu = new Array(___num$gv);
            for (var ___i$gv = 0; ___i$gv < ___num$gv; ++___i$gv) {
                ___args$gu[___i$gv] = arguments[___i$gv];
            }
            ___parent.apply(this, ___args$gu);
        }
        FunctionStatement.prototype = Object.create(___parent.prototype);
        FunctionStatement.prototype.constructor = FunctionStatement;
        FunctionStatement.prototype.registerWithParent = true;
        return FunctionStatement;
    })(FunctionLiteral);
    let GeneratorStatement = (function(___parent) {
        function GeneratorStatement() {
            var ___num$gx = arguments.length, ___args$gw = new Array(___num$gx);
            for (var ___i$gx = 0; ___i$gx < ___num$gx; ++___i$gx) {
                ___args$gw[___i$gx] = arguments[___i$gx];
            }
            ___parent.apply(this, ___args$gw);
        }
        GeneratorStatement.prototype = Object.create(___parent.prototype);
        GeneratorStatement.prototype.constructor = GeneratorStatement;
        GeneratorStatement.prototype.registerWithParent = true;
        return GeneratorStatement;
    })(GeneratorLiteral);
    let AsyncStatement = (function(___parent) {
        function AsyncStatement() {
            var ___num$gz = arguments.length, ___args$gy = new Array(___num$gz);
            for (var ___i$gz = 0; ___i$gz < ___num$gz; ++___i$gz) {
                ___args$gy[___i$gz] = arguments[___i$gz];
            }
            ___parent.apply(this, ___args$gy);
        }
        AsyncStatement.prototype = Object.create(___parent.prototype);
        AsyncStatement.prototype.constructor = AsyncStatement;
        AsyncStatement.prototype.registerWithParent = true;
        return AsyncStatement;
    })(AsyncLiteral);
    let FunctionParamsOptional = require('mode/adria/definition/function_params_optional.adria');
    let FunctionParamList = require('mode/adria/definition/function_param_list.adria');
    let AsyncParamList = require('mode/adria/definition/async_param_list.adria');
    let Expression = require('mode/adria/definition/expression.adria');
    let ObjectLiteral = require('mode/adria/definition/object_literal.adria');
    let PropertyLiteral = require('mode/adria/definition/property_literal.adria');
    let ProtoLiteral = require('mode/adria/definition/proto_literal.adria');
    let ProtoStatement = require('mode/adria/definition/proto_statement.adria');
    let ProtoBodyItem = require('mode/adria/definition/proto_body_item.adria');
    let ProtoBodyConstructor = require('mode/adria/definition/proto_body_constructor.adria');
    let TryStatement = require('mode/adria/definition/try_statement.adria');
    let Try = TryStatement.Try;
    let Catch = TryStatement.Catch;
    let CatchAll = TryStatement.CatchAll;
    let CatchSpecific = TryStatement.CatchSpecific;
    let Finally = TryStatement.Finally;
    let ForCountStatement = require('mode/adria/definition/for_count_statement.adria');
    let ImportStatement = require('mode/adria/definition/import_statement.adria');
    let ApplicationStatement = require('mode/adria/definition/application_statement.adria');
    let AccessOperationProtocall = require('mode/adria/definition/access_operation_protocall.adria');
    let ConstLiteral = require('mode/adria/definition/const_literal.adria');
    let InvokeOperation = require('mode/adria/definition/invoke_operation.adria');
    let AsyncWrapOperation = require('mode/adria/definition/async_wrap_operation.adria');
    let BaseLiteral = require('mode/adria/definition/base_literal.adria');
    let DoWhileStatement = require('mode/adria/definition/do_while_statement.adria');
    let WhileStatement = require('mode/adria/definition/while_statement.adria');
    let SwitchStatement = require('mode/adria/definition/switch_statement.adria');
    let ForInStatement = require('mode/adria/definition/for_in_statement.adria');
    let ForOfStatement = require('mode/adria/definition/for_of_statement.adria');
    let IfBlock = require('mode/adria/definition/if_block.adria');
    let IfStatement = IfBlock.IfStatement;
    let IfConditional = IfBlock.IfConditional;
    let IfUnconditional = IfBlock.IfUnconditional;
    let ArrayLiteral = require('mode/adria/definition/array_literal.adria');
    let NewProtoLiteral = require('mode/adria/definition/new_proto_literal.adria');
    let ReturnStatement = require('mode/adria/definition/return_statement.adria');
    let YieldLiteral = require('mode/adria/definition/yield_literal.adria');
    let AwaitLiteral = require('mode/adria/definition/await_literal.adria');
    let ThrowStatement = require('mode/adria/definition/throw_statement.adria');
    let AssertStatement = require('mode/adria/definition/assert_statement.adria');
    let Statement = require('mode/adria/definition/statement.adria');
    let InterfaceStatement = require('mode/adria/definition/interface_statement.adria');
    let ModuleStatement = require('mode/adria/definition/module_statement.adria');
    let ExportStatement = require('mode/adria/definition/export_statement.adria');
    let GlobalStatement = require('mode/adria/definition/global_statement.adria');
    let VarStatement = require('mode/adria/definition/var_statement.adria');
    let StorageLiteral = require('mode/adria/definition/storage_literal.adria');
    let ParentLiteral = require('mode/adria/definition/parent_literal.adria');
    let SelfLiteral = require('mode/adria/definition/self_literal.adria');
    let FlowStatement = require('mode/adria/definition/flow_statement.adria');
    module.exports.Node = Node;
    module.exports.Ident = Ident;
    module.exports.Name = Name;
    module.exports.String = ___String$gp;
    module.exports.Numeric = Numeric;
    module.exports.Scope = Scope;
    module.exports.Module = Module;
    module.exports.RequireLiteral = RequireLiteral;
    module.exports.ResourceLiteral = ResourceLiteral;
    module.exports.FunctionLiteral = FunctionLiteral;
    module.exports.GeneratorLiteral = GeneratorLiteral;
    module.exports.AsyncLiteral = AsyncLiteral;
    module.exports.FunctionStatement = FunctionStatement;
    module.exports.GeneratorStatement = GeneratorStatement;
    module.exports.AsyncStatement = AsyncStatement;
    module.exports.FunctionParamsOptional = FunctionParamsOptional;
    module.exports.FunctionParamList = FunctionParamList;
    module.exports.AsyncParamList = AsyncParamList;
    module.exports.Expression = Expression;
    module.exports.ObjectLiteral = ObjectLiteral;
    module.exports.PropertyLiteral = PropertyLiteral;
    module.exports.ProtoLiteral = ProtoLiteral;
    module.exports.ProtoStatement = ProtoStatement;
    module.exports.ProtoBodyItem = ProtoBodyItem;
    module.exports.ProtoBodyConstructor = ProtoBodyConstructor;
    module.exports.Try = Try;
    module.exports.Catch = Catch;
    module.exports.CatchAll = CatchAll;
    module.exports.CatchSpecific = CatchSpecific;
    module.exports.Finally = Finally;
    module.exports.ForCountStatement = ForCountStatement;
    module.exports.ImportStatement = ImportStatement;
    module.exports.ApplicationStatement = ApplicationStatement;
    module.exports.AccessOperationProtocall = AccessOperationProtocall;
    module.exports.ConstLiteral = ConstLiteral;
    module.exports.InvokeOperation = InvokeOperation;
    module.exports.AsyncWrapOperation = AsyncWrapOperation;
    module.exports.BaseLiteral = BaseLiteral;
    module.exports.DoWhileStatement = DoWhileStatement;
    module.exports.WhileStatement = WhileStatement;
    module.exports.SwitchStatement = SwitchStatement;
    module.exports.ForInStatement = ForInStatement;
    module.exports.ForOfStatement = ForOfStatement;
    module.exports.IfStatement = IfStatement;
    module.exports.IfConditional = IfConditional;
    module.exports.IfUnconditional = IfUnconditional;
    module.exports.ArrayLiteral = ArrayLiteral;
    module.exports.NewProtoLiteral = NewProtoLiteral;
    module.exports.ReturnStatement = ReturnStatement;
    module.exports.YieldLiteral = YieldLiteral;
    module.exports.AwaitLiteral = AwaitLiteral;
    module.exports.ThrowStatement = ThrowStatement;
    module.exports.AssertStatement = AssertStatement;
    module.exports.Statement = Statement;
    module.exports.InterfaceStatement = InterfaceStatement;
    module.exports.ModuleStatement = ModuleStatement;
    module.exports.ExportStatement = ExportStatement;
    module.exports.GlobalStatement = GlobalStatement;
    module.exports.VarStatement = VarStatement;
    module.exports.StorageLiteral = StorageLiteral;
    module.exports.ParentLiteral = ParentLiteral;
    module.exports.SelfLiteral = SelfLiteral;
    module.exports.FlowStatement = FlowStatement;
});
module('mode/adria/parser.adria', function(module, resource) {
    let fs = ___require('fs');
    let Set = require('../../astdlib/astd/set.adria');
    let Map = require('../../astdlib/astd/map.adria');
    let LanguageParser = require('language_parser.adria');
    let Tokenizer = require('tokenizer.adria');
    let Match = require('tokenizer/match.adria');
    let definition = require('mode/adria/definition.adria');
    let AdriaParser = (function(___parent) {
        function AdriaParser(transform) {
            LanguageParser.prototype.constructor.call(this, transform);
            this.resetResult();
        }
        AdriaParser.prototype = Object.create(___parent.prototype);
        AdriaParser.prototype.constructor = AdriaParser;
        AdriaParser.prototype.moduleName = '';
        AdriaParser.prototype.indent = 0;
        AdriaParser.prototype.resultData = null;
        AdriaParser.prototype.clone = function clone() {
            let parser = LanguageParser.prototype.clone.call(this);
            parser.resetResult();
            return parser;
        };
        AdriaParser.prototype.resetResult = function resetResult() {
            this.resultData = {
                globalDeclarations: new Set(),
                globalReservations: new Set(),
                globalReferences: new Map(),
                requires: new Set(),
                jsRequires: new Set(),
                resources: new Set(),
                interfaceName: null
            };
        };
        AdriaParser.prototype.preprocessRaw = function preprocessRaw(data) {
            data = LanguageParser.prototype.preprocessRaw.call(this, data);
            let defines = this.transform.options.defines;
            let that = this;
            return data.replace(/\{\{([_a-zA-Z][_a-zA-Z_0-9]*)\}\}/g, function(matches, key) {
                if (key.slice(0, 3) === '___') {
                    that.forceNoCache = true;
                }
                return (defines[key] === undefined ? '' : defines[key]);
            });
        };
        AdriaParser.prototype.trainSelf = function trainSelf() {
            let keywords = new Set([
                'var',
                'global',
                'if',
                'else',
                'for',
                'in',
                'do',
                'while',
                'switch',
                'case',
                'break',
                'continue',
                'return',
                'throw',
                'try',
                'catch',
                'finally',
                'yield',
                'await',
                'parent',
                'self',
                'func',
                'proto',
                'mixin',
                'prop',
                'storage',
                'require',
                'resource',
                'module',
                'export',
                'import',
                'interface',
                'delete',
                'new',
                'instanceof',
                'typeof',
                'assert'
            ]);
            let matchKeywords = function matchKeywords(match) {
                if (keywords.has(match.data)) {
                    match.name = 'KEYWORD';
                }
                return match;
            };
            this.tokenizer = new Tokenizer([
                Tokenizer.prefabs.delimited(null, '/*', '*/'),
                Tokenizer.prefabs.regex(null, /^\/\/.*/),
                Tokenizer.prefabs.breaker(),
                Tokenizer.prefabs.regex('REGEXP', /^\/(?:(?=(\\?))\1.)*?\/[a-z]*/, /^(\(|=|==|===|\+|!=|!==|,|;|&&|\|\||!|\:)$/),
                Tokenizer.prefabs.set('DELIM', [ ';', '...', '.', ',', '(', ')', '[', ']', '{', '}', '!==', '!=', '!', '++', '--', '~', '#' ]),
                Tokenizer.prefabs.group('DELIM', [ '=', '&', '|', '<', '>', ':', '?', '+', '-', '*', '/', '%' ]),
                Tokenizer.prefabs.regex('IDENT', /^[a-zA-Z_\$][a-zA-Z0-9_\$]*/, null, matchKeywords),
                Tokenizer.prefabs.regex('NUMERIC', /^0x[a-fA-F0-9]+/),
                Tokenizer.prefabs.number('NUMERIC'),
                Tokenizer.prefabs.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/)
            ], [ 'KEYWORD' ]);
            application.log('AdriaParser', 'trainer processing adria .sdt-files', 2);
            this.setDefinition(resource('../definition/adria/control.sdt'), 'control');
            this.setDefinition(resource('../definition/adria/expression.sdt'), 'expression');
            this.setDefinition(resource('../definition/adria/literal.sdt'), 'literal');
            this.setDefinition(resource('../definition/adria/proto.sdt'), 'proto');
            this.setDefinition(resource('../definition/adria/root.sdt'), 'root');
            this.setDefinition(resource('../definition/adria/statement.sdt'), 'statement');
            application.log('AdriaParser', 'being trained', -2);
            LanguageParser.prototype.trainSelf.call(this);
            application.log('AdriaParser', 'done');
        };
        AdriaParser.prototype.mapType = function mapType(captureName, blockName) {
            let typeName = blockName.snakeToCamel(true);
            if (typeof definition[typeName] === 'function') {
                return definition[typeName];
            }
            return definition.Node;
        };
        AdriaParser.prototype.createNode = function createNode(name, capture, label, condition) {
            let node = LanguageParser.prototype.createNode.call(this, name, capture, label, condition);
            if (name === 'ident') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT;
                node.description = '<identifier>';
            } else if (name === 'name') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT | this.tokenizer.Type.KEYWORD;
                node.description = '<name>';
            } else if (name === 'regexp') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.REGEXP;
                node.description = '<regular expression>';
            }
            return node;
        };
        AdriaParser.prototype.loadSourceFromCache = function loadSourceFromCache(filename, cacheModifier) {
            var ___al = arguments.length;
            var ___cacheModifier$ha = (___al > 1 ? cacheModifier : (null));
            LanguageParser.prototype.loadSourceFromCache.call(this, filename, ___cacheModifier$ha);
            if (this.cacheData !== null && this.transform.options['map']) {
                this.sourceCode = fs.readFileSync(filename, 'UTF-8').replace('\r\n', '\n');
            }
        };
        return AdriaParser;
    })(LanguageParser);
    module.exports = AdriaParser;
});
module('../../astdlib/astd/util.adria', function(module, resource) {
    let defer = (function defer() {
        let asap;
        if (typeof process === 'object' && typeof process.nextTick === 'function') {
            asap = function asap(context, params, callback) {
                process.nextTick(function() {
                    callback.apply(context, params);
                });
            };
        } else {
            asap = function asap(context, params, callback) {
                setTimeout(function() {
                    callback.apply(context, params);
                }, 0);
            };
        }
        return function defer() {
            var ___al = arguments.length;
            var context, params, callback;
            if (___al === 2) {
                context = arguments[0];
                callback = arguments[1];
                params = [  ];
            } else if (___al === 3) {
                context = arguments[0];
                params = arguments[1];
                callback = arguments[2];
            } else if (___al === 1) {
                callback = arguments[0];
                context = null;
                params = [  ];
            } else {
                throw new Exception('invalid number of arguments');
            }
            asap(context, params, callback);
        };
    })();
    module.exports.defer = defer;
});
module('../../astdlib/astd/exceptions.adria', function(module, resource) {
    let InvalidArgumentException = (function(___parent) {
        function InvalidArgumentException() {
            var ___num$hi = arguments.length, ___args$hh = new Array(___num$hi);
            for (var ___i$hi = 0; ___i$hi < ___num$hi; ++___i$hi) {
                ___args$hh[___i$hi] = arguments[___i$hi];
            }
            ___parent.apply(this, ___args$hh);
        }
        InvalidArgumentException.prototype = Object.create(___parent.prototype);
        InvalidArgumentException.prototype.constructor = InvalidArgumentException;
        return InvalidArgumentException;
    })(Exception);
    let LogicException = (function(___parent) {
        function LogicException() {
            var ___num$hk = arguments.length, ___args$hj = new Array(___num$hk);
            for (var ___i$hk = 0; ___i$hk < ___num$hk; ++___i$hk) {
                ___args$hj[___i$hk] = arguments[___i$hk];
            }
            ___parent.apply(this, ___args$hj);
        }
        LogicException.prototype = Object.create(___parent.prototype);
        LogicException.prototype.constructor = LogicException;
        return LogicException;
    })(Exception);
    module.exports.InvalidArgumentException = InvalidArgumentException;
    module.exports.LogicException = LogicException;
});
module('../../astdlib/astd/prototype/array.adria', function(module, resource) {
    let merge = require('../../astdlib/astd/prototype/merge.adria');
    let extend = function extend() {
        merge(ArrayExtensions, Array);
        merge(ArrayExtensions.prototype, Array.prototype);
    };
    let ArrayExtensions = (function() {
        function ArrayExtensions() {}
        Object.defineProperty(ArrayExtensions.prototype, "first", {
            get: function first() {
                for (let i in this) {
                    return parseInt(i);
                }
                return null;
            }
        });
        Object.defineProperty(ArrayExtensions.prototype, "insert", {
            value: function insert(value) {
                return this.push(value) - 1;
            }
        });
        Object.defineProperty(ArrayExtensions.prototype, "remove", {
            value: function remove(id) {
                this[id] = this[this.length - 1];
                return --this.length;
            }
        });
        Object.defineProperty(ArrayExtensions.prototype, "random", {
            value: function random() {
                return this[Math.floor(Math.random() * this.length)];
            }
        });
        Object.defineProperty(ArrayExtensions.prototype, "unique", {
            value: function unique(arr) {
                let hash = Object.create(null);
                let result = [  ];
                for (let i = 0, l = this.length; i < l;++i) {
                    let value = this[i];
                    if (value in hash === false) {
                        hash[value] = true;
                        result.push(value);
                    }
                }
                return result;
            }
        });
        return ArrayExtensions;
    })();
    module.exports = ArrayExtensions;
    module.exports.extend = extend;
});
module('../../astdlib/astd/listenable.adria', function(module, resource) {
    let util = require('../../astdlib/astd/util.adria');
    let InvalidArgumentException = require('../../astdlib/astd/exceptions.adria').InvalidArgumentException;
    let ArrayExtensions = require('../../astdlib/astd/prototype/array.adria');
    let Listenable = (function() {
        function Listenable() {}
        Object.defineProperty(Listenable.prototype, "_listener", { value: null, writable: true });
        Listenable.prototype.subscribe = function subscribe(listenable) {
            initListener.call(listenable, '_');
            let listener = new Listener([  ], this, null, false);
            listenable._listener['_'].push(listener);
            return listener;
        };
        Listenable.prototype.unsubscribe = function unsubscribe(listenable) {
            offCallback(listenable._listener['_'], this, null);
        };
        Listenable.prototype.execute = function execute(eventName) {
            var args, ___num$hu = arguments.length - 1;
            if (___num$hu > 0) {
                args = new Array(___num$hu);
                for (var ___i$hu = 0; ___i$hu < ___num$hu; ++___i$hu) {
                    args[___i$hu] = arguments[___i$hu + 1];
                }
            } else {
                args = [];
            }
            if (this._listener === null || (this._listener[eventName] === undefined && this._listener['_'] === undefined)) {
                return ;
            }
            let eventListener = this._listener[eventName];
            if (eventListener !== undefined) {
                let id = eventListener.length;
                while (id--) {
                    let listener = eventListener[id];
                    listener.callback.apply(listener.context, listener.params.concat(args));
                    if (listener.once) {
                        this.off(eventName, listener.context, listener.callback);
                    }
                }
            }
            eventListener = this._listener['_'];
            if (eventListener !== undefined) {
                let methodName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
                let method;
                for (let id in eventListener) {
                    let listener = eventListener[id];
                    method = listener.context[methodName];
                    if (typeof method === 'function') {
                        method.apply(listener.context, args);
                    }
                }
            }
        };
        Listenable.prototype.forward = function forward(eventName) {
            var args, ___num$hw = arguments.length - 1;
            if (___num$hw > 0) {
                args = new Array(___num$hw);
                for (var ___i$hw = 0; ___i$hw < ___num$hw; ++___i$hw) {
                    args[___i$hw] = arguments[___i$hw + 1];
                }
            } else {
                args = [];
            }
            let bindArgs = [ this, eventName ];
            bindArgs.push.apply(bindArgs, args);
            return this.execute.bind.apply(this.execute, bindArgs);
        };
        Listenable.prototype.trigger = function trigger() {
            var ___num$hy = arguments.length, args = new Array(___num$hy);
            for (var ___i$hy = 0; ___i$hy < ___num$hy; ++___i$hy) {
                args[___i$hy] = arguments[___i$hy];
            }
            util.defer(this, args, this.execute);
        };
        Listenable.prototype.on = function on() {
            var ___al = arguments.length;
            var eventName, params, context, callback;
            if (___al === 3) {
                eventName = arguments[0];
                context = arguments[1];
                callback = arguments[2];
                params = [  ];
            } else if (___al === 4) {
                eventName = arguments[0];
                params = arguments[1];
                context = arguments[2];
                callback = arguments[3];
            } else if (___al === 2) {
                eventName = arguments[0];
                callback = arguments[1];
                params = [  ];
                context = this;
            } else {
                throw new Exception('invalid number of arguments');
            }
            if (expand.call(this, this.on, 0, eventName, params, context, callback)) {
                return ;
            }
            initListener.call(this, eventName);
            this._listener[eventName].push(new Listener(params, context, callback, false));
        };
        Listenable.prototype.once = function once() {
            var ___al = arguments.length;
            var eventName, params, context, callback;
            if (___al === 3) {
                eventName = arguments[0];
                context = arguments[1];
                callback = arguments[2];
                params = [  ];
            } else if (___al === 4) {
                eventName = arguments[0];
                params = arguments[1];
                context = arguments[2];
                callback = arguments[3];
            } else if (___al === 2) {
                eventName = arguments[0];
                callback = arguments[1];
                params = [  ];
                context = this;
            } else {
                throw new Exception('invalid number of arguments');
            }
            if (expand.call(this, this.once, 0, eventName, params, context, callback)) {
                return ;
            }
            initListener.call(this, eventName);
            this._listener[eventName].push(new Listener(params, context, callback, true));
        };
        Listenable.prototype.off = function off(eventName, context, callback) {
            if (expand.call(this, this.off, 0, eventName, context, callback)) {
                return ;
            }
            if (this._listener === null || this._listener[eventName] === undefined) {
                return false;
            }
            if (callback === undefined) {
                if (context instanceof Listener) {
                    return offListener(this._listener[eventName], context);
                } else if (typeof context === 'function') {
                    return offCallback(this._listener[eventName], this, context);
                } else if (context === undefined) {
                    delete this._listener[eventName];
                    return true;
                } else {
                    throw new InvalidArgumentException('expected Listener or Function as argument 2');
                }
            } else {
                return offCallback(this._listener[eventName], context, callback);
            }
        };
        return Listenable;
    })();
    let Listener = (function() {
        function Listener(params, context, callback, once) {
            this.params = params;
            this.context = context;
            this.callback = callback;
            this.once = once;
        }
        Listener.prototype.params = null;
        Listener.prototype.context = null;
        Listener.prototype.callback = null;
        Listener.prototype.once = false;
        return Listener;
    })();
    let expand = function expand(fn, expansionArgId) {
        var args, ___num$i4 = arguments.length - 2;
        if (___num$i4 > 0) {
            args = new Array(___num$i4);
            for (var ___i$i4 = 0; ___i$i4 < ___num$i4; ++___i$i4) {
                args[___i$i4] = arguments[___i$i4 + 2];
            }
        } else {
            args = [];
        }
        let expansionArgs = args[expansionArgId];
        if (expansionArgs instanceof Array) {
            for (let i = 0, len = expansionArgs.length; i < len;i++) {
                args[expansionArgId] = expansionArgs[i];
                fn.apply(this, args);
            }
            return true;
        }
        return false;
    };
    let initListener = function initListener(eventName) {
        if (this._listener === null) {
            this._listener = {  };
        }
        if (this._listener[eventName] === undefined) {
            this._listener[eventName] = [  ];
        }
    };
    let offListener = function offListener(eventListener, listener) {
        let id = eventListener.length;
        while (id--) {
            if (eventListener[id] === listener) {
                ArrayExtensions.prototype.remove.call(eventListener, id);
                return true;
            }
        }
        return false;
    };
    let offCallback = function offCallback(eventListener, context, callback) {
        let id = eventListener.length;
        while (id--) {
            if (eventListener[id].context === context && eventListener[id].callback === callback) {
                ArrayExtensions.prototype.remove.call(eventListener, id);
                return true;
            }
        }
        return false;
    };
    module.exports = Listenable;
    module.exports.Listener = Listener;
});
module('monitor.adria', function(module, resource) {
    let Set = require('../../astdlib/astd/set.adria');
    let Listenable = require('../../astdlib/astd/listenable.adria');
    let fs = ___require('fs');
    let fspath = ___require('path');
    let Monitor = (function(___parent) {
        function Monitor(paths, ignoreFiles, delay, usePolling) {
            var ___al = arguments.length;
            var ___paths$i9 = (___al > 0 ? paths : ([  ]));
            var ___ignoreFiles$ia = (___al > 1 ? ignoreFiles : ([  ]));
            var ___delay$ib = (___al > 2 ? delay : (250));
            var ___usePolling$ic = (___al > 3 ? usePolling : (false));
            this.paths = ___paths$i9;
            this.delay = ___delay$ib;
            this.ignoreFiles = new Set();
            this.usePolling = ___usePolling$ic;
            for (let _ in ___ignoreFiles$ia) {
                let file = ___ignoreFiles$ia[_];
                this.ignoreFiles.add(fspath.normalize(file));
            }
        }
        Monitor.prototype = Object.create(___parent.prototype);
        Monitor.prototype.constructor = Monitor;
        Monitor.prototype.paths = null;
        Monitor.prototype.ignoreFiles = null;
        Monitor.prototype.delay = 0;
        Monitor.prototype.diff = null;
        Monitor.prototype.rescan = false;
        Monitor.prototype.timeout = null;
        Monitor.prototype.watcher = null;
        Monitor.prototype.usePolling = false;
        Monitor.prototype.getExpandedPaths = function getExpandedPaths() {
            let result = [  ];
            for (let _ in this.paths) {
                let path = this.paths[_];
                result.push.apply(result, recursePath(path, false, this.usePolling));
            }
            return result;
        };
        Monitor.prototype.start = function start() {
            this.stop();
            this.watcher = [  ];
            this.rescan = false;
            this.diff = new Set();
            let paths = this.getExpandedPaths();
            for (let _ in paths) {
                let path = paths[_];
                this.addWatcher(path);
            }
        };
        Monitor.prototype.stop = function stop() {
            if (this.watcher !== null) {
                for (let _ in this.watcher) {
                    let watcher = this.watcher[_];
                    this.removeWatcher(watcher);
                }
                this.watcher = null;
            }
        };
        Monitor.prototype.addWatcher = function addWatcher(path) {
            if (this.usePolling) {
                let file = fspath.basename(path);
                let pathToFile = fspath.dirname(path);
                let that = this;
                fs.watchFile(path, { persistent: true, interval: 507 }, function(curr, prev) {
                    if (curr.mtime !== prev.mtime) {
                        that.compounder(pathToFile, 'rename', file);
                    }
                });
                this.watcher.push(path);
            } else {
                let watcher = fs.watch(path, this.compounder.bind(this, path));
                this.watcher.push(watcher);
            }
        };
        Monitor.prototype.removeWatcher = function removeWatcher(watcher) {
            if (this.usePolling) {
                fs.unwatchFile(watcher);
            } else {
                watcher.close();
            }
        };
        Monitor.prototype.compounder = function compounder(path, event, file) {
            let fullName = fspath.normalize(path + '/' + file);
            if (path.hasPostfix(file) && fs.existsSync(fullName) === false) {
                return ;
            }
            if (this.ignoreFiles.has(fullName)) {
                return ;
            }
            this.diff.add(fullName);
            if (event === 'rename') {
                this.rescan = true;
            }
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.handler.bind(this), this.delay);
        };
        Monitor.prototype.handler = function handler() {
            let diff = this.diff;
            if (this.rescan) {
                this.stop();
                this.start();
            } else {
                this.diff = new Set();
            }
            this.execute('change', diff);
        };
        return Monitor;
    })(Listenable);
    let recursePath = function recursePath(path, includeHidden, grabFiles) {
        var ___al = arguments.length;
        var ___path$im = (___al > 0 ? path : ('.'));
        var ___includeHidden$in = (___al > 1 ? includeHidden : (false));
        var ___grabFiles$io = (___al > 2 ? grabFiles : (false));
        let files = fs.readdirSync(___path$im);
        let result = [  ];
        ___path$im = ___path$im.replace(/\/$/, '');
        if (___grabFiles$io !== true) {
            result.push(___path$im);
        }
        for (let file in files) {
            if (___includeHidden$in === true || files[file].substr(0, 1) !== '.') {
                let stat = fs.statSync(___path$im + '/' + files[file]);
                if (stat.isDirectory()) {
                    result.push.apply(result, recursePath(___path$im + '/' + files[file], ___includeHidden$in, ___grabFiles$io));
                } else if (___grabFiles$io && stat.isFile()) {
                    result.push(___path$im + '/' + files[file]);
                }
            }
        }
        return result;
    };
    module.exports = Monitor;
});
module('mode/adria/transform.adria', function(module, resource) {
    let fs = ___require('fs');
    let path = ___require('path');
    let util = require('util.adria');
    let Set = require('../../astdlib/astd/set.adria');
    let Map = require('../../astdlib/astd/map.adria');
    let SourceNode = require('source_node.adria');
    let Template = require('template.adria');
    let Transform = require('transform.adria');
    let AdriaParser = require('mode/adria/parser.adria');
    let ASTException = require('language_parser/ast_exception.adria');
    let Monitor = require('monitor.adria');
    let BaseException = require('base_exception.adria');
    let AdriaTransform = (function(___parent) {
        function AdriaTransform(stdin) {
            Transform.prototype.constructor.call(this, stdin);
            this.cachedParsers = new Map();
        }
        AdriaTransform.prototype = Object.create(___parent.prototype);
        AdriaTransform.prototype.constructor = AdriaTransform;
        AdriaTransform.prototype.globalDeclarations = null;
        AdriaTransform.prototype.globalReservations = null;
        AdriaTransform.prototype.globalReferences = null;
        AdriaTransform.prototype.requires = null;
        AdriaTransform.prototype.requiresDone = null;
        AdriaTransform.prototype.jsRequires = null;
        AdriaTransform.prototype.modules = null;
        AdriaTransform.prototype.resources = null;
        AdriaTransform.prototype.usedBuiltins = null;
        AdriaTransform.prototype.interfaceName = null;
        AdriaTransform.prototype.addApplication = false;
        AdriaTransform.prototype.protoParser = null;
        AdriaTransform.prototype.cachedParsers = null;
        AdriaTransform.prototype.cacheModifier = null;
        AdriaTransform.prototype.startTime = 0;
        AdriaTransform.prototype.numCompiled = 0;
        AdriaTransform.prototype.builtins = { 'async.adria': resource('../templates/adria/async.tpl') };
        AdriaTransform.prototype.reset = function reset() {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.reset !== reset || ___c.hasOwnProperty('reset') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            ___p.prototype.reset.call(this);
            this.numCompiled = 0;
            this.globalDeclarations = new Set();
            this.globalReservations = new Set();
            this.globalReferences = new Map();
            this.requires = new Set();
            this.resources = new Set();
            this.jsRequires = new Set();
            this.requiresDone = new Set();
            this.usedBuiltins = new Set();
            this.modules = [  ];
            this.interfaceName = null;
            this.addApplication = false;
            this.defineImplicits();
        };
        AdriaTransform.prototype.run = function run() {
            this.time();
            this.protoParser = new AdriaParser(this);
            this.protoParser.trainSelf();
            this.time('Setup $0.ms');
            if (this.options['monitor']) {
                this.startMonitoring();
            } else {
                this.compile();
            }
        };
        AdriaTransform.prototype.compile = function compile(forceReload, resourceChanges) {
            var ___al = arguments.length;
            var ___forceReload$it = (___al > 0 ? forceReload : (null));
            var ___resourceChanges$iu = (___al > 1 ? resourceChanges : (true));
            this.reset();
            if (this.stdin !== null) {
                this.recurseDependencies('main' + this.options['extension'], this.stdin, ___forceReload$it);
            }
            let files = this.options['files'];
            for (let id in files) {
                this.recurseDependencies(util.normalizeExtension(files[id], this.options['extension']), null, ___forceReload$it);
            }
            this.time('Load/preprocess $0.ms');
            for (let id in this.modules) {
                let currentModule = this.modules[id];
                currentModule.result = currentModule.parser.preprocess({  });
            }
            for (let id in this.modules) {
                let currentModule = this.modules[id];
                currentModule.result = currentModule.parser.process();
            }
            this.time('Process $0.ms');
            if (this.options['scan']) {
                for (let id in this.modules) {
                    let currentModule = this.modules[id];
                    currentModule.parser.prescan({  });
                }
                for (let id in this.modules) {
                    let currentModule = this.modules[id];
                    currentModule.parser.scan({  });
                }
                this.time('Scan $0.ms');
            }
            if (this.options['monitor'] && this.numCompiled === 0 && ___resourceChanges$iu === false) {
                return ;
            }
            let code = this.mergeAll();
            this.time('Merge $0.ms');
            this.output(code);
            this.time('Write $0.ms');
            if (this.options['monitor']) {
                console.log((new Date()).format('Monitor: [%H:%M:%S] Compiled to ' + path.normalize(this.options['basePath'] + this.options['outFile'])));
            }
        };
        AdriaTransform.prototype.recurseDependencies = function recurseDependencies(moduleName, data, forceReload) {
            var ___al = arguments.length;
            var ___data$iw = (___al > 1 ? data : (null));
            var ___forceReload$ix = (___al > 2 ? forceReload : (null));
            let parser = this.getParser(moduleName, ___data$iw, ___forceReload$ix);
            parser.preprocess({  });
            let requires = parser.resultData.requires;
            this.requiresDone.add(moduleName);
            for (let name in requires.data) {
                if (this.requiresDone.has(name) === false) {
                    this.recurseDependencies(name, null, ___forceReload$ix);
                }
            }
            this.globalDeclarations = this.globalDeclarations.union(parser.resultData.globalDeclarations);
            this.globalReservations = this.globalReservations.union(parser.resultData.globalReservations);
            this.globalReferences = this.globalReferences.merge(parser.resultData.globalReferences);
            this.requires = this.requires.union(parser.resultData.requires);
            this.jsRequires = this.jsRequires.union(parser.resultData.jsRequires);
            this.resources = this.resources.union(parser.resultData.resources);
            if (parser.resultData.interfaceName !== null) {
                if (this.interfaceName !== null) {
                    throw new ASTException('Interface already defined (' + this.interfaceName + ')', parser);
                }
                this.interfaceName = parser.resultData.interfaceName;
            }
            this.modules.push({ parser: parser, result: null });
        };
        AdriaTransform.prototype.time = function time(message) {
            var ___al = arguments.length;
            var ___message$iz = (___al > 0 ? message : (null));
            if (this.options['time'] && this.options['outFile'] !== null) {
                if (___message$iz !== null) {
                    console.log('Timing: ' + ___message$iz.format(Date.now() - this.startTime));
                }
                this.startTime = Date.now();
            }
        };
        AdriaTransform.prototype.initOptions = function initOptions() {
            Transform.prototype.initOptions.call(this, this);
            let args = application.args;
            args.add({
                name: 'files',
                param: [ '_' ],
                defaultValue: [  ],
                help: 'File(s) to compile',
                helpVar: 'file'
            });
            args.add({
                name: 'outFile',
                param: [ 'o', 'out' ],
                help: 'Output file',
                helpVar: 'file'
            });
            args.add({
                name: 'basePath',
                param: [ 'b', 'base' ],
                defaultValue: './',
                help: 'Base path, include paths are relative to this',
                helpVar: 'path'
            });
            args.add({
                name: 'paths',
                param: [ 'p', 'path' ],
                defaultValue: [  ],
                help: 'Additional path to look for includes',
                helpVar: 'path'
            });
            args.add({
                name: 'extension',
                param: [ 'extension' ],
                defaultValue: 'adria',
                help: 'Adria file extension',
                helpVar: 'extension',
                formatter: function(data) {
                    return '.' + data;
                }
            });
            args.add({
                name: 'platform',
                param: [ 't', 'target' ],
                allowed: [ 'node', 'web' ],
                defaultValue: 'node',
                help: 'Platform to generate code for'
            });
            args.add({
                name: 'headerFile',
                param: [ 'header' ],
                help: 'File to include as commentblock before output',
                helpVar: 'file'
            });
            args.add({
                name: 'defines',
                param: [ 'D', 'define' ],
                defaultValue: [  ],
                help: 'Define preprocessor value',
                helpVar: '"key=value"',
                formatter: function(data) {
                    let result = {  };
                    for (let id in data) {
                        let value = data[id];
                        let pair = value.split('=');
                        result[pair[0]] = (pair[1] === undefined ? true : pair[1]);
                    }
                    return result;
                }
            });
            args.addSwitch('shellwrap', 'Wrap in shell-script and flag executable', false);
            args.add({
                name: 'shellargs',
                param: [ 'shellargs' ],
                help: 'Arguments for shellwrap to pass to runtime',
                helpVar: '"arguments"'
            });
            args.addSwitch('monitor', 'Don\'t exit after compilation, watch for and rebuild on file changes', false);
            args.addSwitch('poll', 'Use polling instead of inotify to monitor file changes (has issues)', false);
            args.addSwitch('assert', 'Add assert() support', false);
            args.addSwitch('scan', 'Perform basic logic checks', true);
            args.addSwitch('map', 'Generate source map', false);
            args.addSwitch('link', 'Link sourcemap to output', true);
            args.addSwitch('time', 'Report compilation duration', false);
        };
        AdriaTransform.prototype.processOptions = function processOptions() {
            var ___p, ___c, ___c0 = ___c = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.processOptions !== processOptions || ___c.hasOwnProperty('processOptions') === false)) {
                ___c = Object.getPrototypeOf(___c);
            }
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            ___p.prototype.processOptions.call(this);
            if (this.options['files'].length < 1 || this.options['!'].length > 0) {
                console.log(application.args.getHelp());
                process.exit(1);
            }
            this.cacheModifier = util.md5(JSON.stringify(this.options));
            this.options['defines']['___uniqueId'] = util.uniqueId();
            this.options['defines']['___date'] = (new Date()).format('%y-%m-%d');
            this.options['defines']['___time'] = (new Date()).format('%H:%M:%S');
        };
        AdriaTransform.prototype.getParser = function getParser(moduleName, data, forceReload) {
            var ___al = arguments.length;
            var ___data$j5 = (___al > 1 ? data : (null));
            var ___forceReload$j6 = (___al > 2 ? forceReload : (null));
            let parser;
            let fullName = path.normalize(this.options['basePath'] + moduleName);
            if (this.cachedParsers.has(moduleName) && ___forceReload$j6 !== null && ___forceReload$j6.lacks(fullName)) {
                parser = this.cachedParsers.get(moduleName);
                parser.resetResult();
                parser.reset();
            } else {
                if (___forceReload$j6 !== null) {
                    
                }
                parser = this.protoParser.clone();
                parser.moduleName = moduleName;
                if (___data$j5 === null) {
                    parser.loadSource(fullName, this.cacheModifier);
                } else {
                    parser.setSource(moduleName, ___data$j5, this.cacheModifier);
                }
                this.cachedParsers.set(moduleName, parser);
                this.numCompiled++;
            }
            return parser;
        };
        AdriaTransform.prototype.defineImplicits = function defineImplicits() {
            let transform = this;
            let addReferences = function addReferences() {
                var ___num$j9 = arguments.length, refs = new Array(___num$j9);
                for (var ___i$j9 = 0; ___i$j9 < ___num$j9; ++___i$j9) {
                    refs[___i$j9] = arguments[___i$j9];
                }
                for (let _ in refs) {
                    let ref = refs[_];
                    transform.globalReferences.set(ref, ref);
                    transform.globalReservations.add(ref);
                }
            };
            addReferences('window', 'arguments', 'this', 'true', 'false', 'null', 'undefined', 'Infinity', 'NaN', 'Array', 'Boolean', 'Date', 'Intl', 'JSON', 'Function', 'Math', 'Number', 'Object', 'RegExp', 'String', 'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array', 'Int16Array', 'Int32Array', 'Int8Array', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'eval', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'console', 'debugger', 'application', 'Exception');
            if (this.options['platform'] === 'node') {
                addReferences('process', 'Buffer');
            } else if (this.options['platform'] === 'web') {
                addReferences('screen', 'document', 'location', 'performance', 'alert', 'XMLHttpRequest', 'Worker');
            }
            if (this.options['assert']) {
                addReferences('AssertionFailedException');
            }
            this.globalReservations.add('implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static');
            this.globalReservations.add('function', 'class', 'enum', 'extends', 'super');
        };
        AdriaTransform.prototype.mergeAll = function mergeAll() {
            let options = this.options;
            let node = new SourceNode(null, null);
            let tpl = new Template();
            tpl.debug = this.options['debug'];
            tpl.assign('globals', this.globalDeclarations.toArray());
            tpl.assign('builtins', this.usedBuiltins.toArray());
            tpl.assign('enableAssert', options['assert']);
            tpl.assign('enableApplication', this.addApplication);
            tpl.assign('interfaceName', this.interfaceName);
            tpl.assign('platform', options['platform']);
            if (options['shellwrap']) {
                node.add([
                    '#!/bin/sh\n',
                    '\':\' //; exec "`command -v nodejs || command -v node`" --harmony' + (options['shellargs'] === null ? '' : ' ' + options['shellargs']) + ' "$0" "$@"\n'
                ]);
            }
            if (options['headerFile'] !== null) {
                let header = fs.readFileSync(options['basePath'] + options['headerFile'], 'UTF-8');
                node.add('/**\n * ' + header.trim().replace(/\r?\n/g, '\n * ') + '\n */\n');
            }
            let closureParams = new Map();
            if (options['platform'] === 'node') {
                closureParams.set({
                    'global': 'window',
                    'module': '___module',
                    'require': '___require'
                });
            } else {
                closureParams.set('self', 'window');
                if (this.interfaceName !== null) {
                    closureParams.set('typeof define === "undefined" ? null : define', '___define');
                    closureParams.set('typeof module !== "object" ? { ___nomodule: true } : module', '___module');
                }
            }
            node.add(';(function(' + closureParams.values().join(', ') + ') {\n"use strict";\n');
            let fw = tpl.fetch(resource('../templates/adria/framework.tpl'));
            node.add(new SourceNode(1, 1, 'adria-framework.js', fw)).setSourceContent('adria-framework.js', fw);
            for (let fileName in this.jsRequires.data) {
                let contents = fs.readFileSync(options['basePath'] + fileName, 'UTF-8');
                let wrapped = 'module(\'' + fileName + '\', function(module, resource) {\nvar exports = module.exports;\n' + contents + '\n});\n';
                node.add(new SourceNode(1, 1, fileName, wrapped)).setSourceContent(fileName, contents);
            }
            for (let id in this.modules) {
                let currentModule = this.modules[id];
                node.add(new SourceNode(1, 1, currentModule.parser.file, currentModule.result)).setSourceContent(currentModule.parser.file, currentModule.parser.sourceCode);
            }
            let usedBuiltins = this.usedBuiltins.toArray();
            for (let id in usedBuiltins) {
                let name = usedBuiltins[id];
                let builtIn = tpl.fetch(this.builtins[name]);
                node.add(new SourceNode(1, 1, name.replace('.adria', '.js'), builtIn)).setSourceContent(name.replace('.adria', '.js'), builtIn);
            }
            for (let fileName in this.resources.data) {
                let contents = fs.readFileSync(options['basePath'] + fileName, 'UTF-8');
                let wrapped = 'resource(\'' + fileName + '\', \'' + contents.jsify("'") + '\');\n';
                node.add(new SourceNode(1, 1, fileName, wrapped)).setSourceContent(fileName, contents);
            }
            node.trim();
            for (let id in usedBuiltins) {
                let name = usedBuiltins[id];
                node.add('\nrequire(\'' + name + '\');');
            }
            for (let id in options['files']) {
                let file = options['files'][id];
                node.add('\nrequire(\'' + util.normalizeExtension(file, this.options['extension']) + '\');');
            }
            if (this.interfaceName !== null) {
                let interfaceTpl = tpl.fetch(resource('../templates/adria/interface.tpl'));
                node.add(new SourceNode(1, 1, 'adria-interface.js', interfaceTpl));
            }
            node.add('\n})(' + closureParams.keys().join(', ') + ');');
            return node;
        };
        AdriaTransform.prototype.output = function output(node) {
            if (this.options['outFile'] !== null) {
                let jsFile = this.options['basePath'] + this.options['outFile'];
                if (this.options['map']) {
                    let mapFile = jsFile.stripPostfix('.js') + '.map';
                    let result = node.toStringWithSourceMap({ file: path.basename(jsFile) });
                    if (this.options['link']) {
                        result.code += '\n//# sourceMappingURL=' + path.basename(mapFile);
                    }
                    fs.writeFileSync(jsFile, result.code);
                    fs.writeFileSync(mapFile, result.map);
                } else {
                    fs.writeFileSync(jsFile, node.toString());
                }
                if (this.options['shellwrap']) {
                    fs.chmodSync(jsFile, 493);
                }
            } else {
                process.stdout.write(node.toString());
            }
        };
        AdriaTransform.prototype.startMonitoring = function startMonitoring() {
            let paths = [ this.options['basePath'] ];
            for (let _ in this.options['paths']) {
                let path = this.options['paths'][_];
                paths.push(this.options['basePath'] + path);
            }
            let ignore = [  ];
            if (this.options['outFile'] !== null) {
                let jsFile = this.options['basePath'] + this.options['outFile'];
                ignore.push(jsFile);
                if (this.options['map']) {
                    ignore.push(jsFile.stripPostfix('.js') + '.map');
                }
            }
            let monitor = new Monitor(paths, ignore, 250, this.options['poll']);
            monitor.on('change', this, function(forceReload) {
                try {
                    this.compile(forceReload, forceReload.intersect(this.resources).empty === false);
                } catch (___exc$je) {
                    if (___exc$je instanceof BaseException) {
                        let e = ___exc$je;
                        this.monitorError(e.message);
                    } else { 
                        throw ___exc$je;
                    }
                }
            });
            try {
                this.compile();
            } catch (___exc$jf) {
                if (___exc$jf instanceof BaseException) {
                    let e = ___exc$jf;
                    this.monitorError(e.message);
                } else { 
                    throw ___exc$jf;
                }
            }
            monitor.start();
        };
        AdriaTransform.prototype.monitorError = function monitorError(message) {
            try {
                let jsFile = this.options['basePath'] + this.options['outFile'];
                fs.unlinkSync(jsFile);
                fs.unlinkSync(jsFile.stripPostfix('.js') + '.map');
            } catch (___exc$jh) {
                let e = ___exc$jh;
            }
            process.stderr.write('Error: ' + message + '\n');
        };
        return AdriaTransform;
    })(Transform);
    module.exports = AdriaTransform;
});
module('mode/adriadebug/parser.adria', function(module, resource) {
    let AdriaParser = require('mode/adria/parser.adria');
    let Node = require('mode/adria/node.adria');
    Node.prototype.toString = function toString() {
        let indent = String.repeat(this.depth() * 4, ' ');
        let result = "";
        for (let childId in this.children) {
            let node = this.children[childId];
            if (node.isLeaf()) {
                result += indent + "<" + node.key + " value=\"" + node.value.replace(/\"/g, '\\"') + "\" />\n";
            } else {
                result += indent + "<" + node.key + " value=\"" + node.value.replace(/\"/g, '\\"') + "\">\n";
                result += node.toString();
                result += indent + "</" + node.key + ">\n";
            }
        }
        return result;
    };
    let AdriaDebugParser = (function(___parent) {
        function AdriaDebugParser() {
            var ___num$jk = arguments.length, ___args$jj = new Array(___num$jk);
            for (var ___i$jk = 0; ___i$jk < ___num$jk; ++___i$jk) {
                ___args$jj[___i$jk] = arguments[___i$jk];
            }
            ___parent.apply(this, ___args$jj);
        }
        AdriaDebugParser.prototype = Object.create(___parent.prototype);
        AdriaDebugParser.prototype.constructor = AdriaDebugParser;
        AdriaDebugParser.prototype.processMethod = 'toString';
        return AdriaDebugParser;
    })(AdriaParser);
    module.exports = AdriaDebugParser;
});
module('mode/adriadebug/transform.adria', function(module, resource) {
    let fs = ___require('fs');
    let util = require('util.adria');
    let AdriaTransform = require('mode/adria/transform.adria');
    let AdriaDebugParser = require('mode/adriadebug/parser.adria');
    let AdriaDebugTransform = (function(___parent) {
        function AdriaDebugTransform(stdin) {
            AdriaTransform.prototype.constructor.call(this, stdin);
            this.options['cache'] = false;
            this.options['scan'] = false;
        }
        AdriaDebugTransform.prototype = Object.create(___parent.prototype);
        AdriaDebugTransform.prototype.constructor = AdriaDebugTransform;
        AdriaDebugTransform.prototype.run = function run() {
            this.protoParser = new AdriaDebugParser(this);
            this.protoParser.trainSelf();
            this.reset();
            if (this.stdin !== null) {
                this.recurseDependencies('main' + this.options['extension'], this.stdin);
            }
            let files = this.options['files'];
            for (let id in files) {
                this.recurseDependencies(util.normalizeExtension(files[id], this.options['extension']));
            }
            let result = [  ];
            for (let id in this.modules) {
                let currentModule = this.modules[id];
                result.push(currentModule.parser.process());
            }
            if (this.options['outFile'] !== null) {
                fs.writeFileSync(this.options['basePath'] + this.options['outFile'], result.join('\n'));
            } else {
                process.stdout.write(result.join('\n'));
            }
        };
        return AdriaDebugTransform;
    })(AdriaTransform);
    module.exports = AdriaDebugTransform;
});
module('application.adria', function(module, resource) {
    let Args = require('args.adria');
    let BaseException = require('base_exception.adria');
    let log = require('log.adria');
    let Application = (function() {
        function Application() {
            this.log = log;
            this.args = new Args('adria', 'Adria transcompiler v0.3.3');
            this.args.add({
                name: 'mode',
                param: [ 'm', 'mode' ],
                allowed: [ 'adria', 'adriadebug' ],
                defaultValue: 'adria',
                help: 'Translation mode'
            });
            this.args.addSwitch('stdin', 'Read from stdin', false);
            this.args.addSwitch('debug', 'Enable debug mode', false);
        }
        Application.prototype.args = null;
        Application.prototype.log = null;
        Application.prototype.run = (function() {
            var ___self = function*() {
                let options = this.args.parse();
                if (options['debug']) {
                    debugger;
                    this.log.enable();
                }
                let stdin = null;
                if (options['stdin']) {
                    stdin = yield (function(___callback) {
                        return this.readStdIn(___callback);
                    }).bind(this);
                }
                if (options['debug']) {
                    this.handle(options['mode'], stdin);
                } else {
                    try {
                        this.handle(options['mode'], stdin);
                    } catch (___exc$jp) {
                        if (___exc$jp instanceof BaseException) {
                            let e = ___exc$jp;
                            this.error(e.message);
                        } else { 
                            throw ___exc$jp;
                        }
                    }
                }
            };
            return function run() {
                var ___num$jr = arguments.length, ___args$jq = new Array(___num$jr);
                for (var ___i$jr = 0; ___i$jr < ___num$jr; ++___i$jr) {
                    ___args$jq[___i$jr] = arguments[___i$jr];
                }
                return new ___Async(___self.apply(this, ___args$jq));
            };
        })();
        Application.prototype.handle = function handle(mode, stdin) {
            let transform;
            if (mode === 'adria') {
                let AdriaTransform = require('mode/adria/transform.adria');
                transform = new AdriaTransform(stdin);
            } else if (mode === 'adriadebug') {
                let AdriaDebugTransform = require('mode/adriadebug/transform.adria');
                transform = new AdriaDebugTransform(stdin);
            } else {
                this.error('Unsupported mode "' + mode + '".');
            }
            transform.run();
        };
        Application.prototype.readStdIn = function readStdIn(callback) {
            let data = '';
            process.stdin.on('data', function(chunk) {
                data += chunk.toString();
            });
            process.stdin.on('end', function() {
                callback(null, data);
            });
            process.stdin.resume();
        };
        Application.prototype.error = function error(message, exitCode) {
            var ___al = arguments.length;
            var ___exitCode$jx = (___al > 1 ? exitCode : (1));
            process.stderr.write('Error: ' + message + '\n');
            process.exit(___exitCode$jx);
        };
        Application.prototype.notice = function notice(message) {
            var vars, ___num$jz = arguments.length - 1;
            if (___num$jz > 0) {
                vars = new Array(___num$jz);
                for (var ___i$jz = 0; ___i$jz < ___num$jz; ++___i$jz) {
                    vars[___i$jz] = arguments[___i$jz + 1];
                }
            } else {
                vars = [];
            }
            process.stderr.write('Notice: ' + message.format(vars) + '\n');
        };
        return Application;
    })();
    module.exports = Application;
});
module('main.adria', function(module, resource) {
    require('../../astdlib/astd/prototype/string.adria').extend();
    require('../../astdlib/astd/prototype/regexp.adria').extend();
    require('../../astdlib/astd/prototype/object.adria').extend();
    require('../../astdlib/astd/prototype/date.adria').extend();
    let Application = require('application.adria');
    application(Application);
    application.run();
});
module('async.adria', function(module, resource) {
    function AsyncException(message) {
        Exception.call(this, message);
    }
    AsyncException.prototype = Object.create(Exception.prototype);
    AsyncException.prototype.constructor = AsyncException;
    function Async(generator) {
        this.generator = generator;
        this.next();
    }
    Async.AsyncException = AsyncException;
    Async.wrap = function(func, context) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            return function(callback) {
                args.push(callback);
                return func.apply(context, args);
            };
        };
    };
    Async.prototype.generator = null;
    Async.prototype.sync = 0;
    Async.prototype.result = undefined;
    Async.prototype.error = undefined;
    Async.prototype.waiting = 0;
    Async.prototype.step = 0;
    Async.prototype.done = false;
    Async.prototype.throw = function(error) {
        error.partialResult = this.result;
        this.error = error;
    };
    Async.prototype.next = function() {
        var current;
        while ((current = (this.error === undefined ? this.generator.next(this.result) : this.generator.throw(this.error))).done === false) {
            this.sync = 0;
            this.error = undefined;
            try {
                if (typeof current.value === 'function') {
                    current.value(this.callback.bind(this, this.step));
                } else {
                    this.waitAll(current.value);
                }
            } catch (e) {
                this.sync = 1;
                this.throw(e);
            }
            if (this.sync === 0) {
                this.sync = -1;
                break;
            } else {
                this.step++;
            }
        }
        this.done = current.done;
    };
    Async.prototype.waitAll = function(args) {
        if (args instanceof Array) {
            this.result = new Array(args.length);
        } else if (args instanceof Object) {
            this.result = { };
        } else {
            throw new AsyncException('Yielding invalid type ' + (typeof args));
        }
        this.waiting = 0;
        for (var id in args) {
            var arg = args[id];
            if (typeof arg === 'function') {
                this.waiting++;
                arg(this.waitAllCallback.bind(this, this.step, id));
            } else {
                throw new AsyncException('Property ' + id + ' of yielding object is not a function');
            }
        }
    };
    Async.prototype.waitAllCallback = function(originalStep, originalId, err, val) {
        if (this.step !== originalStep) {
            return;
        }
        var error = null;
        if (err instanceof Error) {
            error = err;
        } else if (this.result.hasOwnProperty(originalId)) {
            error = new AsyncException('Callback for item ' + originalId + ' of yield was invoked more than once');
        } else {
            this.result[originalId] = (arguments.length === 3 ? err : val);
            this.waiting--;
        }
        if (error !== null) {
            this.callback(originalStep, error);
        } else if (this.waiting === 0) {
            this.callback(originalStep, null, this.result);
        }
    };
    Async.prototype.callback = function(originalStep, err, val) {
        if (this.step !== originalStep) {
            return;
        }
        if (err instanceof Error) {
            this.throw(err);
        } else {
            this.result = (arguments.length === 2 ? err : val);
        }
        if (this.sync === 0) {
            this.sync = 1;
        } else {
            this.step++;
            this.next();
        }
    };
    ___Async = Async;
    module.exports = Async;
});
resource('../definition/adria/control.sdt', '\n\
/*\n\
 * multipurpose code block\n\
 */\n\
\n\
block {\n\
    entry -> "{" -> "}" -> return\n\
    "{" -> statement:statement -> "}"\n\
    statement:statement -> statement:statement\n\
}\n\
\n\
/*\n\
 * break/return/continue\n\
 */\n\
\n\
return_statement {\n\
    entry -> "return":type -> ";" -> return\n\
    "return":type -> literal_expression:value -> ";"\n\
}\n\
\n\
flow_statement {\n\
    entry -> "break":type -> ";" -> return\n\
    entry -> "continue":type -> ";" -> return\n\
}\n\
\n\
/*\n\
 * if...else if...else block\n\
 */\n\
\n\
if_conditional {\n\
    entry -> "if" -> "(" -> expression:condition -> ")" -> block:body -> return\n\
}\n\
\n\
if_unconditional {\n\
    entry -> block:body -> return\n\
}\n\
\n\
if_statement {\n\
\n\
    entry -> if_conditional:if -> return\n\
    if_conditional:if -> "else"[if_to_elseif] -> if_conditional:else_if -> return\n\
    if_conditional:else_if -> "else"[elseif_to_elseif] -> if_conditional:else_if\n\
\n\
    if_conditional:if -> "else"[if_to_else] -> if_unconditional:else -> return\n\
    if_conditional:else_if -> "else"[elseif_to_else] -> if_unconditional:else\n\
}\n\
\n\
/*\n\
 * while\n\
 */\n\
\n\
do_while_statement {\n\
    entry -> "do" -> block:body -> "while" -> "(" -> expression:condition -> ")" -> ";" -> return\n\
}\n\
\n\
while_statement {\n\
    entry -> "while" -> "(" -> expression:condition -> ")" -> block:body -> return\n\
}\n\
\n\
/*\n\
 * for\n\
 */\n\
\n\
for_count_init {\n\
    entry -> var_statement:init -> return\n\
    entry -> expression:init -> ";" -> return\n\
}\n\
\n\
for_count_statement {\n\
    entry -> "for" -> "(" -> for_count_init -> expression:test[full] -> ";" -> expression:cond_op -> ")" -> block:body -> return\n\
    "(" -> expression:test[short] -> ")"\n\
}\n\
\n\
/*\n\
 * for ([var] key[, value] in source) { ... }\n\
 */\n\
\n\
for_in_statement {\n\
    entry -> "for" -> "(" -> ident:key -> "in" -> expression:source -> ")" -> block:body -> return\n\
    "(" -> "var":var -> ident:key\n\
    ident:key -> "," -> ident:value -> "in"\n\
}\n\
\n\
for_of_statement {\n\
    entry -> "for" -> "(" -> ident:key -> "of" -> expression:source -> ")" -> block:body -> return\n\
    "(" -> "var":var -> ident:key\n\
}\n\
\n\
/*\n\
 * switch statement !todo scoping how?\n\
 */\n\
\n\
switch_case {\n\
    entry -> "case" -> expression:match -> ":" -> switch_block:body -> return\n\
    ":" -> return\n\
}\n\
\n\
switch_default {\n\
    entry -> "default" -> ":" -> switch_block:body -> return\n\
}\n\
\n\
switch_block {\n\
    entry -> statement:statement -> return\n\
    statement:statement -> statement:statement\n\
}\n\
\n\
switch_statement {\n\
    entry -> "switch" -> "(" -> expression:value -> ")" -> "{"\n\
    "{" -> switch_case:case -> "}"\n\
    switch_case:case -> switch_case:case\n\
    switch_case:case -> switch_default:default -> "}"\n\
    "}" -> return\n\
}\n\
\n\
/*\n\
 * throw try catch finally\n\
 */\n\
\n\
throw_statement {\n\
    entry -> "throw" -> expression:exception -> ";" -> return\n\
}\n\
\n\
try {\n\
    entry -> "try" -> block:body -> return\n\
}\n\
\n\
catch_specific {\n\
    entry -> "catch" -> "(" -> expression:type -> ident:value -> ")" -> block:body -> return\n\
}\n\
\n\
catch_all {\n\
    entry -> "catch" -> "(" -> ident:value -> ")" -> block:body -> return\n\
}\n\
\n\
catch {\n\
    entry -> catch_all:all -> return\n\
    entry -> catch_specific:specific -> return\n\
    catch_specific:specific -> catch_specific:specific\n\
    catch_specific:specific -> catch_all:all\n\
}\n\
\n\
finally {\n\
    entry -> "finally" -> block:body -> return\n\
}\n\
\n\
try_catch_finally_statement {\n\
    entry -> try:try -> catch:catch -> return\n\
    catch:catch -> finally:finally -> return\n\
}\n\
');
resource('../definition/adria/expression.sdt', '\n\
literal_expression {\n\
    entry -> complex_literal -> return\n\
    entry -> expression:expression -> return\n\
}\n\
\n\
expression {\n\
    // a  and  a()\n\
    entry -> base_literal:item -> return\n\
    base_literal:item -> invoke_operation:call -> return\n\
\n\
    // a && b\n\
    base_literal:item -> binary_operation -> return\n\
    invoke_operation:call -> binary_operation\n\
\n\
    // a.b   a->b().c || ...\n\
    base_literal:item -> access_operation -> return\n\
    invoke_operation:call -> access_operation -> binary_operation\n\
    access_operation -> ternary_operation -> return\n\
\n\
    // a?b:c\n\
    base_literal:item -> ternary_operation\n\
    invoke_operation:call -> ternary_operation\n\
\n\
    // a = b   or   a++\n\
    entry -> ident:ident -> assignment_operation -> return\n\
    entry -> storage_literal:storage -> assignment_operation\n\
    assignment_operation -> binary_operation\n\
\n\
    entry -> prefix_operation -> return\n\
    entry -> unary_operation -> return\n\
\n\
    // (a || b).c   (a || b)()\n\
\n\
    entry -> brace_operation -> return\n\
    brace_operation -> invoke_operation:call\n\
    brace_operation -> access_operation\n\
\n\
    // ()()\n\
\n\
    invoke_operation:call -> invoke_operation:call\n\
\n\
    // end on async wrap\n\
\n\
    brace_operation -> async_wrap_operation:wrap -> return\n\
    invoke_operation:call -> async_wrap_operation:wrap\n\
    base_literal:item -> async_wrap_operation:wrap\n\
}\n\
\n\
brace_operation {\n\
    // braced expression, continues with binary or access operation\n\
    entry -> "(":brace_op -> expression:item -> ")":brace_op -> return\n\
    ")":brace_op -> binary_operation -> return\n\
    ")":brace_op -> access_operation -> return\n\
    ")":brace_op -> invoke_operation:call -> return\n\
    invoke_operation:call -> binary_operation\n\
    invoke_operation:call -> access_operation\n\
    invoke_operation:call -> invoke_operation:call\n\
}\n\
\n\
unary_operation {\n\
    entry -> unary_operator -> expression:item -> return\n\
}\n\
\n\
binary_operation {\n\
    entry -> binary_operator -> expression:item -> return\n\
}\n\
\n\
ternary_operation {\n\
    entry -> "?":ternary_op -> literal_expression:true_expression -> ":":ternary_op -> literal_expression:false_expression -> return\n\
    entry -> "?":ternary_op -> ":":ternary_op_default -> literal_expression:false_expression -> return\n\
}\n\
\n\
assignment_operation {\n\
    entry -> assignment_operator -> literal_expression:value -> return\n\
    entry -> xfix_operator -> return\n\
}\n\
\n\
prefix_operation {\n\
    // ++expression.assignable\n\
    entry -> xfix_operator -> ident:ident -> return\n\
    xfix_operator -> expression:item -> access_operation_types_assignable -> return\n\
}\n\
\n\
property_assignment_operation {\n\
    // a::b = property...\n\
    entry -> "=":passignment_op -> property_literal:value -> return\n\
    entry -> ":=":passignment_op -> literal_expression:value -> return\n\
}\n\
\n\
access_operation {\n\
    // degraded from generic expression to member access, cannot go back to generic, i.e. (a || b).c.d::e ...\n\
    entry -> access_operation_types -> return\n\
    access_operation_types -> invoke_operation:call -> return\n\
    access_operation_types -> async_wrap_operation:wrap -> return\n\
    access_operation_types -> access_operation -> return\n\
    invoke_operation:call -> access_operation\n\
\n\
    entry -> access_operation_types_assignable -> property_assignment_operation -> return\n\
    entry -> access_operation_types_assignable -> assignment_operation -> return\n\
\n\
    invoke_operation:call -> invoke_operation:call\n\
    invoke_operation:call -> async_wrap_operation:wrap\n\
}\n\
\n\
invoke_operation {\n\
    entry -> "(" -> ")" -> return\n\
    "(" -> invoke_param_list -> ")"\n\
}\n\
\n\
async_wrap_operation {\n\
    entry -> "(" -> async_wrap_param_list -> ")" -> return\n\
}\n\
\n\
/*\n\
 * ary ops\n\
 */\n\
\n\
unary_operator {\n\
    entry -> "+":unary_op -> return\n\
    entry -> "-":unary_op -> return\n\
    entry -> "!":unary_op -> return\n\
    entry -> "~":unary_op -> return\n\
    entry -> "new":unary_op -> return\n\
    entry -> "typeof":unary_op -> return\n\
    entry -> "delete":unary_op -> return\n\
}\n\
\n\
binary_operator {\n\
    entry -> "===":binary_op -> return\n\
    entry -> "!==":binary_op -> return\n\
\n\
    entry -> "+":binary_op -> return\n\
    entry -> "-":binary_op -> return\n\
    entry -> "*":binary_op -> return\n\
    entry -> "/":binary_op -> return\n\
    entry -> "%":binary_op -> return\n\
\n\
    entry -> "==":binary_op -> return\n\
    entry -> "!=":binary_op -> return\n\
    entry -> "<":binary_op -> return\n\
    entry -> ">":binary_op -> return\n\
    entry -> "<=":binary_op -> return\n\
    entry -> ">=":binary_op -> return\n\
    entry -> "&&":binary_op -> return\n\
    entry -> "||":binary_op -> return\n\
\n\
    entry -> "&":binary_op -> return\n\
    entry -> "|":binary_op -> return\n\
    entry -> "^":binary_op -> return\n\
    entry -> "<<":binary_op -> return\n\
    entry -> ">>":binary_op -> return\n\
    entry -> ">>>":binary_op -> return\n\
    entry -> "instanceof":binary_op -> return\n\
    entry -> "in":binary_op -> return\n\
}\n\
\n\
/*\n\
 * access ops\n\
 */\n\
access_operation_types_assignable {\n\
    entry -> access_operation_member:member -> return\n\
    entry -> access_operation_index:index -> return\n\
    entry -> access_operation_proto:proto -> return\n\
}\n\
\n\
access_operation_types {\n\
    entry -> access_operation_types_assignable -> return\n\
    entry -> access_operation_protocall:pcall -> return\n\
}\n\
\n\
access_operation_member {\n\
    entry -> "." -> name:item -> return\n\
}\n\
\n\
access_operation_index {\n\
    entry -> "[" -> expression:item -> "]" -> return\n\
}\n\
\n\
access_operation_proto {\n\
    entry -> "::" -> name:item -> return\n\
}\n\
\n\
access_operation_protocall {\n\
    entry -> "->" -> name:item -> invoke_operation:call -> return\n\
    //invoke_operation:call -> invoke_operation:call\n\
}\n\
\n\
/*\n\
 * invoke op\n\
 */\n\
\n\
invoke_param_list {\n\
    entry -> literal_expression:param -> return\n\
    literal_expression:param -> "," -> literal_expression:param\n\
}\n\
\n\
async_wrap_param_list {\n\
\n\
    // start with lit.exp. or #\n\
\n\
    entry -> literal_expression:param[before]\n\
    entry -> "#":param -> return\n\
\n\
    // lit.exp may be followed by another or by a #\n\
\n\
    literal_expression:param[before] -> ","[before] -> literal_expression:param[before]\n\
    literal_expression:param[before] -> ","[before] -> "#":param\n\
\n\
    // # may be followed by another literal expression, but must remain the only #\n\
\n\
    "#":param -> ","[after] -> literal_expression:param[after]\n\
    literal_expression:param[after] -> ","[after]-> literal_expression:param[after] -> return\n\
}\n\
\n\
\n\
/*\n\
 * assignment ops\n\
 */\n\
\n\
assignment_operator {\n\
    entry -> "=":assignment_op -> return\n\
\n\
    entry -> "+=":assignment_op -> return\n\
    entry -> "-=":assignment_op -> return\n\
    entry -> "*=":assignment_op -> return\n\
    entry -> "/=":assignment_op -> return\n\
    entry -> "%=":assignment_op -> return\n\
\n\
    entry -> "&&=":assignment_op -> return\n\
    entry -> "||=":assignment_op -> return\n\
    entry -> "^^=":assignment_op -> return\n\
\n\
    entry -> "&=":assignment_op -> return\n\
    entry -> "|=":assignment_op -> return\n\
    entry -> "^=":assignment_op -> return\n\
    entry -> "<<=":assignment_op -> return\n\
    entry -> ">>=":assignment_op -> return\n\
}\n\
\n\
xfix_operator {\n\
    entry -> "++":xfix_op -> return\n\
    entry -> "--":xfix_op -> return\n\
}');
resource('../definition/adria/literal.sdt', '\n\
/*\n\
 * object literal\n\
 */\n\
\n\
object_literal_item {\n\
    entry -> name:key -> ":"\n\
    entry -> string:key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
\n\
object_literal {\n\
    entry -> "{" -> "}" -> return\n\
    "{" -> object_literal_item:item -> "}"\n\
    object_literal_item:item -> ","[any] -> object_literal_item:item\n\
\n\
    // allow comma behind last item\n\
\n\
    object_literal_item:item -> ","[last] -> "}"\n\
}\n\
\n\
/*\n\
 * property literal\n\
 */\n\
\n\
property_literal {\n\
    entry -> "prop" -> property_accessor -> return\n\
    entry -> "prop" -> property_data -> return\n\
}\n\
\n\
property_accessor {\n\
    entry -> "{" -> property_accessor_item:item -> "}" -> return\n\
    property_accessor_item:item -> ","[any] -> property_accessor_item:item\n\
    property_accessor_item:item -> ","[last] -> "}" -> return\n\
}\n\
\n\
property_data {\n\
    entry -> "{" -> property_data_item:item -> "}" -> return\n\
    property_data_item:item -> ","[any] -> property_data_item:item\n\
    property_data_item:item -> ","[last] -> "}" -> return\n\
}\n\
\n\
property_accessor_item {\n\
    entry -> "inherit":inherit -> "get":key[inherited] -> return\n\
    "inherit":inherit -> "set":key[inherited] -> return\n\
\n\
    entry -> "default":key -> ":"\n\
    entry -> "get":key -> ":"\n\
    entry -> "set":key -> ":"\n\
    entry -> "configurable":key -> ":"\n\
    entry -> "enumerable":key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
\n\
property_data_item {\n\
    entry -> "value":key -> ":"\n\
    entry -> "writable":key -> ":"\n\
    entry -> "configurable":key -> ":"\n\
    entry -> "enumerable":key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
\n\
/*\n\
 * array literal\n\
 */\n\
\n\
array_literal {\n\
    entry -> "[" -> "]" -> return\n\
    "[" -> literal_expression:item -> "]"\n\
    literal_expression:item -> ","[any] -> literal_expression:item\n\
\n\
    // allow comma behind last literal item\n\
\n\
    literal_expression:item -> ","[last] -> "]"\n\
}\n\
\n\
/*\n\
 * function literals\n\
 */\n\
\n\
async_literal {\n\
    entry -> "func" -> "#":async -> "(" -> ")" -> block:body -> return\n\
    "#":async -> ident:name -> "("\n\
    "(" -> async_param_list:param_list -> ")"\n\
}\n\
\n\
generator_literal {\n\
    entry -> "func" -> "*":generator -> "(" -> ")" -> block:body -> return\n\
    "*":generator -> ident:name -> "("\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
function_literal {\n\
    entry -> "func" -> "(" -> ")" -> block:body -> return\n\
    "func" -> ident:name -> "("\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
/*\n\
 * function parameter lists\n\
 */\n\
\n\
function_annotation {\n\
    entry -> name:annotation -> "?":annotation_mod -> return\n\
    name:annotation -> return\n\
}\n\
\n\
function_param {\n\
    entry -> function_annotation -> ident:name\n\
    entry -> ident:name -> return\n\
}\n\
\n\
function_params {\n\
    // standard params: a, b, c ....\n\
    entry -> function_param:item -> return\n\
    function_param:item -> "," -> function_param:item\n\
}\n\
\n\
function_param_default {\n\
    entry -> function_annotation -> ident:name\n\
    entry -> ident:name -> "=" -> expression:value -> return\n\
}\n\
\n\
function_params_default {\n\
    // defaulted params: d = 1, e = 2, f = 3 ....\n\
    entry -> function_param_default:item -> return\n\
    function_param_default:item -> "," -> function_param_default:item\n\
}\n\
\n\
function_param_rest {\n\
    entry -> "..." -> function_param:rest -> return\n\
}\n\
\n\
function_params_optional {\n\
    // optional params: a [ b, c [ d ] ] e\n\
    entry -> "[" -> function_params_default -> "]" -> return\n\
    "[" -> function_params_optional:opt_items -> "]"\n\
\n\
    function_params_optional:opt_items -> ","[opt_to_default] -> function_params_default\n\
    function_params_default -> ","[default_to_opt] -> function_params_optional:opt_items\n\
    function_params_optional:opt_items -> ","[opt_to_opt] -> function_params_optional:opt_items\n\
}\n\
\n\
function_param_list {\n\
\n\
    entry -> function_params -> return\n\
    entry -> function_params_default -> return\n\
    entry -> function_params_optional:opt_items -> return\n\
\n\
    // defaulted params following standard params: a, b, c, d = 1, e = 2, f = 3\n\
\n\
    entry -> function_params -> ","[nodefault_to_default] -> function_params_default -> return\n\
\n\
    // optional params following standard params, possibly with standard params following\n\
\n\
    entry -> function_params -> ","[nodefault_to_optional] -> function_params_optional:opt_items -> return\n\
    function_params_optional:opt_items -> ","[opt_to_nodefault] -> function_params[post_opt] -> return\n\
    function_params_optional:opt_items -> ","[opt_to_opt] -> function_params_optional:opt_items -> return\n\
    function_params[post_opt] -> ","[nodefault_to_optional] // full circle\n\
\n\
    // rest parameter following standard or default\n\
\n\
    entry -> function_param_rest -> return\n\
    function_params -> ","[nodefault_to_rest] -> function_param_rest\n\
    function_params_default -> ","[default_to_rest] -> function_param_rest\n\
}\n\
\n\
async_param_list {\n\
\n\
    //!todo cheapo solution for testing\n\
    entry -> "#":callback -> function_param_list -> return\n\
    entry -> function_param_list -> "#":callback -> return\n\
    entry -> function_param_list -> return\n\
}\n\
\n\
/*\n\
 * require literal\n\
 */\n\
\n\
require_literal {\n\
    // this is really just a function, but it has to be evaluable at compilation time\n\
    entry -> "require" -> "(" -> const_literal:file -> ")" -> return\n\
}\n\
\n\
/*\n\
 * resource\n\
 */\n\
\n\
resource_literal {\n\
    // this is really just a function, but it has to be evaluable at compilation time\n\
    entry -> "resource" -> "(" -> const_literal:file -> ")" -> return\n\
}\n\
\n\
/*\n\
 * generator/async yield\n\
 */\n\
\n\
yield_literal {\n\
    entry -> "yield":type -> return\n\
    "yield":type -> literal_expression:value -> return\n\
}\n\
\n\
await_literal {\n\
    entry -> "await":type -> return\n\
    "await":type -> literal_expression:value -> return\n\
}\n\
\n\
/*\n\
 * inheritance\n\
 */\n\
\n\
parent_literal {\n\
    entry -> "parent" -> return\n\
}\n\
\n\
self_literal {\n\
    entry -> "self" -> return\n\
}\n\
\n\
/*\n\
 * storage\n\
 */\n\
\n\
storage_literal {\n\
    entry -> "storage" -> return\n\
}\n\
\n\
/*\n\
 * literal groups\n\
 */\n\
\n\
const_literal {\n\
    entry -> numeric:numeric -> return\n\
    entry -> string:string -> return\n\
    entry -> regexp:regexp -> return\n\
}\n\
\n\
base_literal {\n\
    // usable in expressions\n\
    entry -> const_literal -> return\n\
    entry -> ident:ident -> return\n\
    entry -> object_literal:object -> return\n\
    entry -> array_literal:array -> return\n\
    entry -> require_literal:require -> return\n\
    entry -> resource_literal:resource -> return\n\
    entry -> parent_literal:parent -> return\n\
    entry -> self_literal:self -> return\n\
    entry -> storage_literal:storage -> return\n\
    entry -> yield_literal:yield -> return\n\
    entry -> await_literal:await -> return\n\
    entry -> "(":brace -> complex_literal -> ")":brace -> return\n\
}\n\
\n\
complex_literal {\n\
    // not directly usable in expressions\n\
    entry -> function_literal:function -> return\n\
    entry -> proto_literal:proto -> return\n\
    entry -> new_proto_literal:newproto -> return\n\
    entry -> generator_literal:generator -> return\n\
    entry -> async_literal:async -> return\n\
}\n\
\n\
literal {\n\
    entry -> base_literal -> return\n\
    entry -> complex_literal -> return\n\
}\n\
');
resource('../definition/adria/proto.sdt', '\n\
proto_statement {\n\
\n\
    // proto name [ ( [ parent ] ) ] [ mixin ( exp [, exp, ...] ) ] body\n\
\n\
    entry -> "proto" -> ident:name -> "(" -> expression:parent -> ")" -> proto_body:body -> return\n\
    ident:name -> proto_body:body\n\
    "(" -> ")"\n\
\n\
    ident:name -> proto_mixin\n\
    ")" -> proto_mixin -> proto_body:body\n\
}\n\
\n\
proto_literal {\n\
\n\
    // proto [ name ] [ ( [ parent ] ) ] [ mixin ( exp [, exp, ...] ) ] body\n\
\n\
    entry -> "proto" -> "(" -> expression:parent -> ")" -> proto_body:body -> return\n\
    "proto" -> ident:name -> "("\n\
    ident:name -> proto_body:body\n\
    "(" -> ")"\n\
    "proto" -> proto_body:body\n\
\n\
    "proto" -> proto_mixin\n\
    ident:name -> proto_mixin\n\
    ")" -> proto_mixin -> proto_body:body\n\
}\n\
\n\
proto_mixin {\n\
    entry -> "mixin" -> "(" -> expression:mixin -> ")" -> return\n\
    expression:mixin -> "," -> expression:mixin\n\
}\n\
\n\
new_proto_literal {\n\
\n\
    // new parent(...) body\n\
\n\
    entry -> "new" -> expression:parent -> "(" -> ")" -> proto_body:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
proto_body {\n\
    entry -> "{" -> "}" -> return\n\
    "{" -> proto_body_item:item -> "}"\n\
    proto_body_item:item -> ","[any] -> proto_body_item:item\n\
\n\
    // allow comma behind last literal item\n\
\n\
    proto_body_item:item -> ","[last] -> "}"\n\
}\n\
\n\
proto_body_item {\n\
    entry -> proto_access -> "constructor":key -> ":"[constructor] -> proto_body_constructor:value -> return\n\
\n\
    entry -> proto_access -> name:key -> ":"\n\
    entry -> proto_access -> string:key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
    ":" -> property_literal:value -> return\n\
}\n\
\n\
proto_body_constructor {\n\
    entry -> function_literal -> return\n\
}\n\
\n\
proto_access {\n\
    entry -> return\n\
    entry -> "public" -> return\n\
    entry -> "protected" -> return\n\
    entry -> "private" -> return\n\
}\n\
');
resource('../definition/adria/root.sdt', '/*\n\
 * defined in DefinitionParser\n\
 *\n\
 * blockname {                  define a new definition block "blockname" containing textual representations of language definition nodes\n\
 *     ->                       connects two nodes (can be chained)\n\
 *     match:capture[unique]    matches "match" and captures it in the output syntax tree as "capture"\n\
 *                              any nodes with the same match and capture represent the same definition node unless "unique" differs\n\
 *                              capture and unique are optional\n\
 * }\n\
 *\n\
 * defined in LanguageParser\n\
 *\n\
 * entry        a node that attaches itself to the block root (required)\n\
 * return       valid exitpoint for current block. it needs to be reached during parsing or the parsed document\n\
 *              fragment doesn\'t match the block\n\
 * string       matches a string "string" or \'string\'\n\
 * numeric      matches a number [0-9\\.]+ (exponential representation !todo)\n\
 * "word"       matches "word" literally\n\
 * \'[a-z]+\'     matches via regex [a-z]+\n\
 * blockname    jump to definition block "blockname"\n\
 *\n\
 * follow up with :capture to capture the exact match as a node in the output syntax tree\n\
 *\n\
 * defined in AdriaParser::createNode\n\
 *\n\
 * ident        matches identifier of the format [a-zA-Z_\\\\$][a-zA-Z0-9_\\\\$]* except for defined keywords (see AdriaParser::trainSelf)\n\
 * name         matches everything ident matches as well as keywords (see AdriaParser::trainSelf)\n\
 * regexp       matches JavaScript regular expression literals\n\
 */\n\
\n\
 /*\n\
  * the root node for the definition tree (as defined by Parser.initialBlock)\n\
  */\n\
\n\
root {\n\
    entry -> module:module -> return\n\
}\n\
\n\
module {\n\
    entry -> statement:statement -> return\n\
    statement:statement -> statement:statement\n\
}\n\
');
resource('../definition/adria/statement.sdt', '\n\
/*\n\
 * declaration/definition\n\
 */\n\
\n\
module_statement {\n\
    entry -> "module" -> dec_def -> ";" -> return\n\
}\n\
\n\
export_statement {\n\
    entry -> "export" -> dec_def -> ";" -> return\n\
}\n\
\n\
import_statement {\n\
    entry -> "import" -> ident:item -> ";" -> return\n\
    ident:item -> "," -> ident:item\n\
}\n\
\n\
var_statement {\n\
    entry -> "var" -> dec_def_import_list -> ";" -> return\n\
}\n\
\n\
//!todo\n\
/*const_statement {\n\
    entry -> "const" -> dec_def_import_list -> ";" -> return\n\
}*/\n\
\n\
global_statement {\n\
    entry -> "global" -> dec_def_import_list -> ";" -> return\n\
}\n\
\n\
function_statement {\n\
    entry -> "func" -> ident:name -> "(" -> ")" -> block:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
generator_statement {\n\
    entry -> "func" -> "*":generator -> ident:name -> "(" -> ")" -> block:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
async_statement {\n\
    entry -> "func" -> "#":async -> ident:name -> "(" -> ")" -> block:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
/*\n\
 * application statement\n\
 */\n\
\n\
application_statement {\n\
    entry -> "application" -> invoke_operation:call -> ";" -> return\n\
}\n\
\n\
/*\n\
 * assert statement\n\
 */\n\
\n\
assert_statement {\n\
    entry -> "assert" -> invoke_operation:call -> ";" -> return\n\
}\n\
\n\
/*\n\
 * array deconstruction\n\
 */\n\
\n\
//!todo\n\
/*deconstruct {\n\
    entry -> "[" -> ident:item -> "]" -> "=" -> literal_expression:source -> return\n\
    ident:item -> "," -> ident:item\n\
}*/\n\
\n\
/*\n\
 * interface\n\
 */\n\
\n\
interface_statement {\n\
    entry -> "interface" -> ";" -> return\n\
    "interface" -> ident:publish_as -> ";"\n\
}\n\
\n\
\n\
/*\n\
 * statement groups\n\
 */\n\
\n\
statement {\n\
\n\
    entry -> var_statement:var -> return\n\
\n\
    entry -> if_statement:if -> return\n\
    entry -> for_in_statement:for_in -> return\n\
    entry -> return_statement:control -> return\n\
    entry -> for_count_statement:for_count -> return\n\
    entry -> while_statement:while -> return\n\
    entry -> throw_statement:throw -> return\n\
    entry -> for_of_statement:for_of -> return\n\
    entry -> flow_statement:flow -> return\n\
    entry -> application_statement:application -> return    /* needs to come before expression as application is intentionally not a keyword */\n\
\n\
    entry -> expression:expression -> ";" -> return\n\
\n\
    entry -> global_statement:global -> return\n\
    entry -> import_statement:import -> return\n\
    entry -> export_statement:export -> return\n\
    entry -> module_statement:module -> return\n\
    entry -> interface_statement:interface -> return\n\
\n\
    entry -> function_statement:function -> return\n\
    entry -> generator_statement:generator -> return\n\
    entry -> async_statement:async -> return\n\
    entry -> proto_statement:proto -> return\n\
\n\
    entry -> try_catch_finally_statement:try_catch_finally -> return\n\
    entry -> switch_statement:switch -> return\n\
    entry -> do_while_statement:do_while -> return\n\
\n\
    entry -> assert_statement:assert -> return\n\
    // entry -> deconstruct:deconstruct -> return\n\
    // entry -> const_statement:const -> return\n\
}\n\
\n\
/*\n\
 * declaration lists\n\
 */\n\
\n\
dec_def {\n\
    entry -> ident:name -> "=" -> literal_expression:value -> return\n\
    entry -> ident:name -> return\n\
}\n\
\n\
dec_def_list {\n\
    entry -> dec_def:item -> return\n\
    dec_def:item -> "," -> dec_def:item\n\
}\n\
\n\
dec_def_import {\n\
    entry -> ident:name -> "import" -> ident:from_name -> return\n\
    entry -> dec_def -> return\n\
}\n\
\n\
dec_def_import_list {\n\
    entry -> dec_def_import:item -> return\n\
    dec_def_import:item -> "," -> dec_def_import:item\n\
}\n\
');
resource('../templates/adria/async.tpl', 'module(\'async.adria\', function(module, resource) {\n\
\n\
    {*\n\
     * async error object\n\
     *}\n\
\n\
    function AsyncException(message) {\n\
        Exception.call(this, message);\n\
    }\n\
\n\
    AsyncException.prototype = Object.create(Exception.prototype);\n\
    AsyncException.prototype.constructor = AsyncException;\n\
\n\
    {*\n\
     * async object\n\
     *}\n\
\n\
    function Async(generator) {\n\
        this.generator = generator;\n\
        this.next();\n\
    }\n\
\n\
    Async.AsyncException = AsyncException;\n\
\n\
    Async.wrap = function(func, context) {\n\
        return function() {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return function(callback) {\n\
                args.push(callback);\n\
                return func.apply(context, args);\n\
            };\n\
        };\n\
    };\n\
\n\
    Async.prototype.generator = null;\n\
    Async.prototype.sync = 0;\n\
    Async.prototype.result = undefined;\n\
    Async.prototype.error = undefined;\n\
    Async.prototype.waiting = 0;\n\
    Async.prototype.step = 0;\n\
    Async.prototype.done = false;\n\
\n\
    {**\n\
     * throw on following next() iteration and provide partial result via exception\n\
     *\n\
     * @param error\n\
     *}\n\
    Async.prototype.throw = function(error) {\n\
\n\
        error.partialResult = this.result;\n\
        this.error = error;\n\
    };\n\
\n\
    {**\n\
     * steps through the yields in the async # function. at each yield either a result is returned or\n\
     * an error is thrown. continues until the last yield was processed\n\
     *}\n\
    Async.prototype.next = function() {\n\
\n\
        {* the yielded function for which we will wait on its callback before returning that result at the caller yield *}\n\
\n\
        var current;\n\
\n\
        {* todo REFACTOR! *}\n\
\n\
        while ((current = (this.error === undefined ? this.generator.next(this.result) : this.generator.throw(this.error))).done === false) {\n\
\n\
            this.sync = 0;\n\
            this.error = undefined;\n\
\n\
            try {\n\
\n\
                if (typeof current.value === \'function\') {\n\
                    {! if (enableAssert): !}assert(current.value.prototype === undefined, \'Yielded function is not wrapped (forgot \\\'#\\\' ?)\');{! endif !}\n\
                    current.value(this.callback.bind(this, this.step));\n\
                } else {\n\
                    this.waitAll(current.value);\n\
                }\n\
\n\
            } catch (e) {\n\
\n\
                {* yielded expression threw immediately, meaning we\'re synchronous *}\n\
\n\
                this.sync = 1;\n\
                this.throw(e);\n\
            }\n\
\n\
            {* check if the function returned before or after the callback was invoked\n\
               synchronous: just continue looping, don\'t call next in callback to avoid recursion\n\
               asynchronous: break here and have the callback call next() again when done *}\n\
\n\
            if (this.sync === 0) {\n\
                this.sync = -1;\n\
                break;\n\
            } else {\n\
                this.step++;\n\
            }\n\
        }\n\
\n\
        this.done = current.done;\n\
    };\n\
\n\
    {**\n\
     * used by next to call multiple functions and wait for all of them to call back\n\
     *\n\
     * @param args an array or object of async-wrapped functions\n\
     *}\n\
    Async.prototype.waitAll = function(args) {\n\
\n\
        if (args instanceof Array) {\n\
            this.result = new Array(args.length);\n\
        } else if (args instanceof Object) {\n\
            this.result = { };\n\
        } else {\n\
            throw new AsyncException(\'Yielding invalid type \' + (typeof args));\n\
        }\n\
\n\
        this.waiting = 0;\n\
\n\
        for (var id in args) {\n\
            var arg = args[id];\n\
            if (typeof arg === \'function\') {\n\
                {! if (enableAssert): !}assert(arg.prototype === undefined, \'Property \' + id + \' of yielded object is not a wrapped function (forgot \\\'#\\\' ?)\');{! endif !}\n\
                this.waiting++;\n\
                arg(this.waitAllCallback.bind(this, this.step, id));\n\
            } else {\n\
                throw new AsyncException(\'Property \' + id + \' of yielding object is not a function\');\n\
            }\n\
        }\n\
    };\n\
\n\
    {**\n\
     * callback given to functions during waitAll. tracks number of returned functions and\n\
     * calls the normal async callback when all returned or one excepted\n\
     *\n\
     * @param originalStep the step at which the original function was called\n\
     * @param originalId the array or object key from the original yield\n\
     * @param err typically nodejs callback provide an error as first parameter if there was one. we\'ll throw it\n\
     * @param val the result\n\
     *}\n\
    Async.prototype.waitAllCallback = function(originalStep, originalId, err, val) {\n\
\n\
        {* check if callback is from the current step (may not be if a previous waitAll step threw) *}\n\
\n\
        if (this.step !== originalStep) {\n\
{* console.log(\'discarded waitAllCallback\', originalStep, originalId, err, val); *}\n\
            return;\n\
        }\n\
\n\
        var error = null;\n\
\n\
        if (err instanceof Error) {\n\
\n\
            error = err;\n\
\n\
        } else if (this.result.hasOwnProperty(originalId)) {\n\
\n\
            error = new AsyncException(\'Callback for item \' + originalId + \' of yield was invoked more than once\');\n\
\n\
        } else {\n\
\n\
            {* add this callbacks result to set of results *}\n\
\n\
            this.result[originalId] = (arguments.length === 3 ? err : val);\n\
            this.waiting--;\n\
        }\n\
\n\
        {* yield error or when all is done, result *}\n\
\n\
        if (error !== null) {\n\
            this.callback(originalStep, error);\n\
        } else if (this.waiting === 0) {\n\
            this.callback(originalStep, null, this.result);\n\
        }\n\
    };\n\
\n\
    {**\n\
     * callback given to singular functions\n\
     *\n\
     * @param originalStep the step at which the original function was called\n\
     * @param err typically nodejs callback provide an error as first parameter if there was one. we\'ll throw it\n\
     * @param val the result\n\
     *}\n\
    Async.prototype.callback = function(originalStep, err, val) {\n\
\n\
        {* check if callback is from the current step (may not be if a previous waitAll step threw) *}\n\
\n\
        if (this.step !== originalStep) {\n\
{* console.log(\'discarded callblack\', originalStep, err, val); *}\n\
            return;\n\
        }\n\
\n\
        if (err instanceof Error) {\n\
            this.throw(err);\n\
        } else {\n\
            this.result = (arguments.length === 2 ? err : val);\n\
        }\n\
\n\
        if (this.sync === 0) {\n\
            this.sync = 1;\n\
        } else {\n\
            this.step++;\n\
            this.next();\n\
        }\n\
    };\n\
\n\
    ___Async = Async;\n\
    module.exports = Async;\n\
});\n\
');
resource('../templates/adria/framework.tpl', 'var require, resource, module;{! if (enableApplication): !}\n\
var application;{! endif !}{! if (enableAssert): !}\n\
var assert;{! endif !}{! if (globals.length != 0): !}\n\
var {% globals.join(\', \') %};{! endif !}\n\
var Exception{! if (enableAssert): !}, AssertionFailedException{! endif !};\n\
\n\
(function() {\n\
    var resources = { };\n\
    var modules = { };\n\
    var jsPathStack = [ ];\n\
\n\
    Exception = function Exception(message) {\n\
        this.message = message === undefined ? this.message : message;\n\
        this.name = this.constructor.name === undefined ? \'Exception\' : this.constructor.name;\n\
        var current = this;\n\
        var ownTraceSize = 1;\n\
        while ((current = Object.getPrototypeOf(current)) instanceof Error) {\n\
            ownTraceSize++;\n\
        }\n\
        var stack = Error().stack.split(\'\\n\').slice(ownTraceSize);\n\
        stack[0] = this.name + \': \' + message;\n\
        this.stack = stack.join(\'\\n\');\n\
    };\n\
    Exception.prototype = Object.create(Error.prototype);\n\
    Exception.prototype.constructor = Exception;\n\
\n\
    var getResource = function(name) {{! if (enableAssert): !}\n\
        if (resources[name] === undefined) {\n\
            throw Error(\'missing resource \' + name);\n\
        }\n\
        {! endif !}\n\
        return resources[name];\n\
    };\n\
\n\
    var Module = function(name, func) {\n\
        this.name = name;\n\
        this.exports = Object.create(null);\n\
        this.func = func;\n\
    };\n\
    Module.prototype.exports = null;\n\
    Module.prototype.name = \'\';\n\
\n\
    module = function(name, func) {\n\
        modules[name] = new Module(name, func);\n\
    };\n\
    resource = function(name, data) {\n\
        resources[name] = data;\n\
    };{! if (enableApplication): !}\n\
\n\
    application = function(Constructor{*, params... *}) {\n\
        function Application() {\n\
            application = this;\n\
            Constructor.apply(this, Array.prototype.slice.call(arguments));\n\
        };\n\
        Application.prototype = Constructor.prototype;\n\
        var args = Array.prototype.slice.call(arguments);\n\
        args[0] = null;\n\
        return new (Function.prototype.bind.apply(Application, args));\n\
    };{! endif !}\n\
\n\
    require = function(file) {\n\
        var path = jsPathStack.length > 0 ? jsPathStack[jsPathStack.length -1] : \'\'\n\
        var module = modules[file.slice(-3) === \'.js\' && file.slice(0, 2) === \'./\' ? path + file.slice(2) : file];{! if (enableAssert): !}\n\
        if (module === undefined) {\n\
            throw Error(\'missing dependency \' + file);\n\
        }{! endif !}\n\
        if (typeof module.func === \'function\') {\n\
            var func = module.func;\n\
            delete module.func;\n\
            jsPathStack.push(file.slice(0, file.lastIndexOf(\'/\') + 1));\n\
            func(module, getResource);\n\
            jsPathStack.pop();\n\
        }\n\
        return module.exports;\n\
    };{! if (enableAssert): !}\n\
\n\
    AssertionFailedException = function AssertionFailedException(message) {\n\
        Exception.call(this, message);\n\
    };\n\
    AssertionFailedException.prototype = Object.create(Exception.prototype);\n\
    AssertionFailedException.prototype.constructor = AssertionFailedException;\n\
\n\
    assert = function(assertion, message) {\n\
        if (assertion !== true) {\n\
            throw new AssertionFailedException(message);\n\
        }\n\
    };\n\
\n\
    assert.instance = function(type, allowNull, value, name, typeName) {\n\
\n\
        if (value === null) {\n\
            if (allowNull) {\n\
                return;\n\
            } else {\n\
                throw new AssertionFailedException(name + \' expected to be instance of \' + typeName + \', got null instead\');\n\
            }\n\
        }\n\
\n\
        if (value instanceof type !== true) {\n\
            var actualName = (typeof value === \'object\' && typeof value.constructor === \'function\' && typeof value.constructor.name === \'string\' ? value.constructor.name : \'type \' + typeof value);\n\
            throw new AssertionFailedException(name + \' expected to be instance of \' + typeName + \', got \' + actualName + \' instead\');\n\
        }\n\
    }\n\
\n\
    assert.type = function(type, allowNull, value, name) {\n\
\n\
        type = (type !== \'func\' ? type : \'function\');\n\
\n\
        if (value === null) {\n\
            if (allowNull) {\n\
                return;\n\
            } else {\n\
                throw new AssertionFailedException(name + \' expected to be of type \' + type + \', got null instead\');\n\
            }\n\
        }\n\
\n\
        var actualType = typeof value;\n\
\n\
        if (type === \'finite\' || type === \'number\') {\n\
\n\
            if (actualType !== \'number\') {\n\
                throw new AssertionFailedException(name + \' expected to be of type number, got \' + actualType + \' instead\');\n\
            }\n\
            if (type === \'finite\' && isFinite(value) === false) {\n\
                throw new AssertionFailedException(name + \' expected to be finite number, got \' + value + \' instead\');\n\
            }\n\
\n\
        } else if (type === \'scalar\') {\n\
\n\
            if (actualType === \'number\' && isFinite(value) === false) {\n\
                throw new AssertionFailedException(name + \' expected to be scalar, got \' + value + \' instead\');\n\
            } else if (actualType !== \'string\' && actualType !== \'boolean\' && actualType !== \'number\') {\n\
                throw new AssertionFailedException(name + \' expected to be scalar, got \' + actualType + \' instead\');\n\
            }\n\
\n\
        } else if (type !== actualType) {\n\
\n\
            throw new AssertionFailedException(name + \' expected to be of type \' + type + \', got \' + actualType + \' instead\');\n\
        }\n\
    };\n\
    {! endif !}\n\
})();\n\
');
resource('../templates/adria/interface.tpl', '\n\
{*\n\
 * ___module refers to a possible outside "module" variable used by module loaders\n\
 * if no "module" was present, ___module will be a dummy with one property "___nomodule"\n\
 *\n\
 * the adria module containing the interface statement will already have set ___module.exports, so\n\
 * we only need to handle the AMD and lack of module loader cases here\n\
 *}\n\
\n\
if(typeof ___define == \'function\' && typeof ___define.amd == \'object\' && ___define.amd) {\n\
\n\
    ___define(function() {\n\
        return ___module.exports;\n\
    });\n\
\n\
} else if (___module.___nomodule) {\n\
\n\
    {* ___nomodule set by transform::mergeAll, no module loader found *}\n\
\n\
    {! if (interfaceName !== \'\'): !}\n\
    window["{% interfaceName %}"] = ___module.exports;\n\
    {! endif !}\n\
}');
require('async.adria');
require('main.adria');
})(global, module, require);