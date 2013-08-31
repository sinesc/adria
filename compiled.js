(function() {
/**
 * application construction function. becomes application reference just *prior* to construction.
 * allows use of application-depending objects within application constructor
 */
var application;

/**
 * application-wide module importer
 */
var __require;

/**
 * hidden module registration function (shadowed by module parameter)
 */
var module;

/**
 * module loader
 */
(function() {
    var Module = function(name, func) {
        this.name = name;
        this.exports = { };
        func(this);
    };
    Module.prototype.exports = null;
    Module.prototype.name = '';
    var modules = { };
    module = function(name, func) {
        modules[name] = new Module(name, func);
    };
    application = function(Constructor /*, params... */) {
        function Application() {
            application = this;
            Constructor.apply(this, Array.prototype.slice.call(arguments));
        };
        Application.prototype = Constructor.prototype;
        var args = Array.prototype.slice.call(arguments);
        args[0] = null;
        return new (Function.prototype.bind.apply(Application, args));
    };
    __require = function(file) {
        return modules[file].exports;
    }; 
})();
module("src/prototype", function(module) {
    var exports = module.exports;
    var firstToUpper;
    firstToUpper = function(match1) {
        return match1.replace('_', '').toUpperCase();
        
        
    };
    
    String.prototype.snakeToCamel = function(upperFirst) {
        if (upperFirst) {
            return this.replace(/((?:^|\_)[a-z])/g, firstToUpper);
            
            
        } else {
            return this.replace(/(\_[a-z])/g, firstToUpper);
            
            
        }
        
    };
    String.prototype.format = function() {
        var args;
        args = Array.prototype.slice.call(arguments);
        
        if (args.length === 1 && args[0] instanceof Object) {
            args = args[0];
            
        }
        return this.replace(/(.?)\$([0-9a-z]+)(\:[0-9a-z]+)?/ig, function(str, prefix, matchname, options) {
            if (prefix == '$') {
                return '$' + matchname + (options !== undefined ? options : '');
                
                
            }
            return(args[matchname] !== undefined ? prefix + args[matchname] : str);
            
        });
        
        
    };
    String.prototype.repeat = function(count) {
        var result, pattern;
        if (count < 1) {
            return '';
            
            
        }
        result = '';
        
        pattern = this.valueOf();
        
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
    String.repeat = function repeat(count, string) {
        string = (string === undefined ? ' ' : string);
        return string.repeat(count);
        
        
    };
    String.prototype.occurances = function(search) {
        var count, index;
        count = 0;
        
        index = this.indexOf(search);
        
        while (index !== -1) {
            count++;
            index = this.indexOf(search, index + 1);
            
        }
        return count;
        
        
    };
    String.prototype.padLeft = function(paddedLength, padChar) {
        padChar = (padChar !== undefined ? padChar : ' ');
        return padChar.repeat(paddedLength - this.length) + this.valueOf();
        
        
    };
    String.prototype.padRight = function(paddedLength, padChar) {
        padChar = (padChar !== undefined ? padChar : ' ');
        return this.valueOf() + padChar.repeat(paddedLength - this.length);
        
        
    };
    String.random = function random(length, chars) {
        var chars, numChars, result, rnum;
        chars = (chars === undefined ? '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' : chars);
        
        numChars = chars.length;
        
        result = '';
        
        for (var i = 0; i < length;i++) {
            rnum = Math.floor(Math.random() * numChars);
            
            result += chars.substr(rnum, 1);
            
        }
        return result;
        
        
    };
    String.prototype.stripPostfix = function(postfix) {
        var len, i;
        
        if (postfix instanceof Array) {
            for (i in postfix) {
                len = postfix[i].length;
                if (this.substr(-len) === postfix[i]) {
                    return this.substr(0, this.length - len);
                    
                    
                }
                
            }
            return this.valueOf();
            
            
        }
        len = postfix.length;
        return(this.substr(-len) === postfix ? this.substr(0, this.length - len) : this.valueOf());
        
    };
    String.prototype.hasPostfix = function(postfix) {
        return(this.substr(-postfix.length) === postfix);
        
    };
    
});
module("src/util", function(module) {
    var exports = module.exports;
    var sysutil, crypto, DebugLog, debugLog, indent, enabled, log, dump, Enumeration, Enum, Set, processOptions, home, md5;
    sysutil = require('util');
    
    crypto = require('crypto');
    
    DebugLog = (function() {
        function DebugLog() {
            this.start = Date.now();
            this.last = this.start;
            console.log('=============================: Log started');
            
        }
        
        DebugLog.prototype.print = function print(source, message, indent) {
            var now, diffStart, diffLast;
            now = Date.now();
            
            diffStart = now - this.start;
            
            diffLast = now - this.last;
            
            this.last = now;
            console.log(('+' + diffLast + '/' + diffStart).padLeft(10) + 'ms: ' + source.padLeft(15) + ': ' + ' '.repeat(indent) + message);
            
        };
        
        return DebugLog;
    })()
    debugLog = null;
    
    indent = 0;
    
    enabled = false;
    
    log = function(source, message, offset) {
        if (enabled !== true) {
            return;
            
        }
        if (debugLog === null) {
            debugLog = new DebugLog(source === true);
            
        }
        if (offset < 0) {
            indent += offset;
            
        }
        if (message !== undefined) {
            debugLog.print(source, message, indent);
            
        }
        if (offset > 0) {
            indent += offset;
            
        }
        
    };
    
    log.enable = function enable() {
        enabled = true;
        
    };
    log.disable = function disable() {
        enabled = false;
        
    };
    dump = function(obj, depth, showHidden) {
        depth = (depth === undefined ? 2 : depth);
        showHidden = (showHidden === undefined ? false : showHidden);
        console.log(sysutil.inspect(obj, showHidden, depth));
        
    };
    
    Enumeration = function(options) {
        var bit, id;
        bit = 0;
        
        for (id in options) {
            if (this[options[id]] === undefined) {
                this[options[id]] = 1 << bit;
                bit += 1;
                
            }
            if (bit >= 32) {
                throw new Error('options is expected to be an array and contain <= 32 unique elements');
                
                
            }
            
        }
        return Object.freeze(this);
        
        
    };
    
    Enum = function(options) {
        return new Enumeration(options);
        
        
    };
    
    Set = (function() {
        function Set(value) {
            this.data = {  };
            if (value !== undefined) {
                this.add(value);
                
            }
            
        }
        
        Set.prototype.merge = function merge() {
            var args, result, key, id;
            args = Array.prototype.slice.call(arguments, 0);
            
            result = new Set();
            
            for (key in this.data) {
                result.data[key] = true;
                
            }
            for (id in args) {
                for (key in args[id].data) {
                    result.data[key] = true;
                    
                }
                
            }
            return result;
            
            
        };
        Set.prototype.add = function add(value) {
            var data, element;
            data = this.data;
            
            if (value instanceof Array) {
                value.forEach(function(element) {
                    data[element] = true;
                    
                });
                
            } else if (value instanceof Set) {
                for (element in value.data) {
                    data[element] = true;
                    
                }
                
            } else {
                data[value] = true;
                
            }
            return this;
            
            
        };
        Set.prototype.remove = function remove(value) {
            var data, element;
            data = this.data;
            
            if (value instanceof Array) {
                value.forEach(function(element) {
                    delete data[element];
                    
                });
                
            } else if (value instanceof Set) {
                for (element in value.data) {
                    delete data[element];
                    
                }
                
            } else {
                delete data[value];
                
            }
            return this;
            
            
        };
        Set.prototype.has = function has(value) {
            var data, id, other, key;
            data = this.data;
            
            if (value instanceof Array) {
                for (id in value) {
                    if (data.hasOwnProperty(value[id]) !== true) {
                        return false;
                        
                        
                    }
                    
                }
                return true;
                
                
            } else if (value instanceof Set) {
                other = value.data;
                
                for (key in other) {
                    if (data.hasOwnProperty(key) !== true) {
                        return false;
                        
                        
                    }
                    
                }
                return true;
                
                
            } else {
                return(data.hasOwnProperty(value));
                
            }
            
        };
        Set.prototype.missing = function missing(value) {
            var result, data, id, other, key;
            result = new Set();
            
            data = this.data;
            
            if (value instanceof Array) {
                for (id in value) {
                    if (data[value[id]] !== true) {
                        result.add(value[id]);
                        
                    }
                    
                }
                
            } else if (value instanceof Set) {
                other = value.data;
                
                for (key in other) {
                    if (data[key] !== true) {
                        result.add(key);
                        
                    }
                    
                }
                
            } else {
                throw new Error('invalid argument');
                
                
            }
            return result;
            
            
        };
        Set.prototype.toArray = function toArray() {
            return Object.keys(this.data);
            
            
        };
        Object.defineProperty(Set.prototype, "empty", {
            get: function empty() {
                var dummy;
                for (dummy in this.data) {
                    return false;
                    
                    
                }
                return true;
                
                
            }
            
        });
        Object.defineProperty(Set.prototype, "length", {
            get: function length() {
                var len, dummy;
                len = 0;
                
                for (dummy in this.data) {
                    len++;
                    
                }
                return len;
                
                
            }
            
        });
        
        return Set;
    })();
    
    processOptions = function(context, handlers) {
        var next, argv, prefix, param;
        next = '_default';
        
        for (var i = 2; i < process.argv.length;i++) {
            argv = process.argv[i];
            
            prefix = argv.slice(0, 2);
            
            param = argv.slice(2);
            
            if (prefix == "--" && typeof handlers[param] === 'function') {
                next = param;
                
            } else if (prefix == "--") {
                if (handlers['_switch'] !== undefined) {
                    handlers['_switch'].call(context, param);
                    
                }
                
            } else {
                if (handlers[next] !== undefined) {
                    handlers[next].call(context, argv);
                    
                }
                next = '_default';
                
            }
            
        }
        
    };
    
    home = function() {
        return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
        
        
    };
    
    md5 = function(input) {
        var md5sum;
        md5sum = crypto.createHash('md5');
        
        md5sum.update(input);
        return md5sum.digest('hex');
        
        
    };
    
    module.exports.log = log;
    module.exports.dump = dump;
    module.exports.Enum = Enum;
    module.exports.Set = Set;
    module.exports.processOptions = processOptions;
    module.exports.home = home;
    module.exports.md5 = md5;
    
});
module("src/xregexp", function(module) {
    var exports = module.exports;
    var XRegExp;
    XRegExp = require('xregexp').XRegExp;
    
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
    module.exports = XRegExp;
    
});
module("src/template/tags", function(module) {
    var exports = module.exports;
    var Util, Tags;
    Util = __require('src/util');
    
    Tags = function() {
        this.ifDepth = 0;
        this.eachDepth = 0;
        this.remDepth = 0;
        this.resultVar = '';
        
    };
    
    Tags.prototype.supports = function supports(tagName) {
        return(this['tag:' + tagName] !== undefined);
        
    };
    Tags.prototype.tag = function tag(tagName, params) {
        if (typeof this['tag:' + tagName] !== 'function') {
            throw new Error('unknown tag ' + tagName + ' called');
            
            
        }
        return this['tag:' + tagName](params);
        
        
    };
    Tags.prototype.text = function text(string) {
        var repl;
        repl = string.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\*\//g, '*\\/').replace(/'/g, '\\\'');
        
        return this.resultVar + ' += \'' + repl + '\';\n';
        
        
    };
    Tags.prototype.fallback = function fallback() {
        return 'out';
        
        
    };
    Tags.prototype.begin = function begin() {
        this.ifDepth = 0;
        this.eachDepth = 0;
        this.remDepth = 0;
        this.resultVar = '__r' + String.random(8);
        return '(function() { var ' + this.resultVar + ' = \'\'; with (this) {\n';
        
        
    };
    Tags.prototype.end = function end() {
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
        return 'if (' + params + ') {\n';
        
        
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
        var hash, options;
        params = params.split(' ');
        if (params[1] !== 'in') {
            throw new Error('each: syntax error');
            
            
        }
        hash = String.random(6);
        
        options = {
            name: params[0],
            from: params[2],
            id: '__i' + hash,
            keys: '__k' + hash,
            len: '__l' + hash
            
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
    module.exports = Tags;
    
});
module("src/template", function(module) {
    var exports = module.exports;
    var XRegExp, fs, Tags, Template;
    XRegExp = __require('src/xregexp');
    
    fs = require('fs');
    
    Tags = __require('src/template/tags');
    
    Template = (function() {
        function Template(tags, delimiterOpen, delimiterClose) {
            tags = (tags === undefined ? new Tags() : tags);
            delimiterOpen = (delimiterOpen === undefined ? '<' : delimiterOpen);
            delimiterClose = (delimiterClose === undefined ? '>' : delimiterClose);
            this.tags = tags;
            this.data = {  };
            this.delimiter = {
                open: XRegExp.escape(delimiterOpen),
                close: XRegExp.escape(delimiterClose)
                
            };
            
        }
        
        Template.prototype.basePath = 'templates/';
        Template.prototype.assign = function assign(name, value) {
            this.data[name] = value;
            
        };
        Template.prototype.parse = function parse(input) {
            var self, tplString, lastIndex, lastTail, delim, regex;
            self = this;
            
            tplString = '';
            
            lastIndex = 0;
            
            lastTail = '';
            
            delim = this.delimiter;
            
            regex = XRegExp(' (?<head>  [\\ \\t]*)' + delim.open + '(?<ident> /?[a-z_][a-z0-9_\\[\\]\\.]+) \\s* (?<params>.*?)' + delim.close + '(?<tail>  \\n){0,1}', 'xis');
            
            input = input.replace(/\r/g, '');
            tplString += self.tags.begin();
            XRegExp.forEach(input, regex, function(match, i) {
                if (i == 0 && match.index > 0) {
                    tplString += self.tags.text(lastTail + input.substring(0, match.index) + match.head);
                    
                } else if (i > 0) {
                    tplString += self.tags.text(lastTail + input.substring(lastIndex, match.index) + match.head);
                    
                }
                lastIndex = match.index + match[0].length;
                lastTail = (match.tail !== undefined ? match.tail : '');
                if (match.params === '' && match.ident !== '' && self.tags.supports(match.ident) !== true) {
                    match.params = match.ident;
                    match.ident = self.tags.fallback();
                    
                }
                if (self.tags.supports(match.ident) !== true) {
                    throw new Error('unsupported tag ' + match.ident + ' encountered');
                    
                    
                }
                tplString += self.tags.tag(match.ident, match.params);
                
            });
            tplString += self.tags.text(lastTail + input.substring(lastIndex));
            tplString += self.tags.end();
            return tplString;
            
            
        };
        Template.prototype.exec = function exec(tplString) {
            return(function() {
                return eval(tplString);
                
                
            }).call(this.data);
            
        };
        Template.prototype.fetch = function fetch(input) {
            var tplString;
            tplString = this.parse(input);
            
            return this.exec(tplString);
            
            
        };
        Template.prototype.fetchFile = function fetchFile(file) {
            return this.fetch(fs.readFileSync(this.basePath + file, 'UTF-8'));
            
            
        };
        
        return Template;
    })();
    
    Template.Tags = Tags;
    module.exports = Template;
    
});
module("src/cache", function(module) {
    var exports = module.exports;
    var fs, path, util, Cache, isFile;
    fs = require('fs');
    
    path = require('path');
    
    util = __require('src/util');
    
    Cache = (function() {
        function Cache() {
            this.checkBaseDir();
            
        }
        
        Cache.prototype.baseDir = util.home() + '/.adria/cache/';
        Cache.prototype.checkBaseDir = function checkBaseDir() {
            var parts, path, id, part;
            if (this.baseDir.slice(0, 1) !== '/' || this.baseDir.slice(-1) !== '/') {
                throw new Error('cache.baseDir needs to be an absolute path');
                
                
            }
            parts = this.baseDir.slice(1, -1).split('/');
            
            path = '/';
            
            for (id in parts) {
                part = parts[id];
                path += part;
                if (fs.existsSync(path)) {
                    if (isFile(path)) {
                        throw new Error(path + ' is a file');
                        
                        
                    }
                    
                } else {
                    fs.mkdirSync(path, (parseInt(id) === parts.length - 1 ? 511 : 493));
                    
                }
                path += '/';
                
            }
            
        };
        Cache.prototype.cacheName = function cacheName(file) {
            var absPath;
            absPath = path.resolve(process.cwd(), file);
            
            return this.baseDir + util.md5(absPath);
            
            
        };
        Cache.prototype.fetch = function fetch(file, variants) {
            var cacheFile, inputStat, cacheStat, resultData, id, variant;
            cacheFile = this.cacheName(file);
            
            if (fs.existsSync(cacheFile) && fs.existsSync(file)) {
                inputStat = fs.statSync(file);
                
                cacheStat = fs.statSync(cacheFile);
                
                if (cacheStat.isFile() && inputStat.mtime.toString() === cacheStat.mtime.toString()) {
                    resultData = {  };
                    
                    for (id in variants) {
                        variant = variants[id];
                        if (variant === 'base') {
                            util.log('Cache', 'reading from ' + cacheFile, 0);
                            resultData['base'] = JSON.parse(fs.readFileSync(cacheFile, 'UTF-8'));
                            
                        } else {
                            resultData[variant] = JSON.parse(fs.readFileSync(cacheFile + '.' + variant, 'UTF-8'));
                            
                        }
                        
                    }
                    return resultData;
                    
                    
                } else {
                    util.log('Cache', 'cache miss for ' + file, 0);
                    
                }
                
            }
            return null;
            
            
        };
        Cache.prototype.insert = function insert(file, variants) {
            var inputStat, cacheFile, ext, variant;
            
            inputStat = fs.statSync(file);
            
            cacheFile = this.cacheName(file);
            
            for (ext in variants) {
                variant = variants[ext];
                if (ext === 'base') {
                    util.log('Cache', 'writing to ' + cacheFile, 0);
                    fs.writeFileSync(cacheFile, JSON.stringify(variant));
                    fs.utimesSync(cacheFile, inputStat.atime, inputStat.mtime);
                    
                } else {
                    fs.writeFileSync(cacheFile + '.' + ext, JSON.stringify(variant));
                    
                }
                
            }
            
        };
        
        return Cache;
    })();
    
    isFile = function(path) {
        var stat;
        stat = fs.statSync(path);
        
        return stat.isFile();
        
        
    };
    
    module.exports = Cache;
    
});
module("src/transform", function(module) {
    var exports = module.exports;
    var util, Cache, Transform;
    util = __require('src/util');
    
    Cache = __require('src/cache');
    
    Transform = (function() {
        function Transform(piped) {
            this.options = { basePath: '', paths: [  ], files: [  ], outFile: null };
            this.piped = piped;
            this.initOptions();
            this.processOptions();
            if (this.options.nocache !== true) {
                this.cache = new Cache();
                
            }
            if (this.options.debug) {
                util.log.enable();
                
            }
            
        }
        
        Transform.prototype.optionsDefinition = null;
        Transform.prototype.options = null;
        Transform.prototype.piped = null;
        Transform.prototype.cache = null;
        Transform.prototype.initOptions = function initOptions() {
            this.defineOptions({
                '_default': function(file) {
                    this['files'].push(file);
                    
                },
                '_switch': function(param) {
                    this[param] = true;
                    
                },
                'base': function(path) {
                    this['basePath'] = (path.hasPostfix('/') ? path : path + '/');
                    
                },
                'path': function(path) {
                    if (this['paths'] === undefined) {
                        this['paths'] = [  ];
                        
                    }
                    this['paths'].push((path.hasPostfix('/') ? path : path + '/'));
                    
                },
                'out': function(file) {
                    this['outFile'] = file;
                    
                },
                'target': function(target) {
                    this['target'] = target;
                    
                }
                
            });
            
        };
        Transform.prototype.defineOptions = function defineOptions(optionsDefinition) {
            var id;
            if (this.optionsDefinition === null) {
                this.optionsDefinition = {  };
                
            }
            for (id in optionsDefinition) {
                this.optionsDefinition[id] = optionsDefinition[id];
                
            }
            
        };
        Transform.prototype.processOptions = function processOptions() {
            util.processOptions(this.options, this.optionsDefinition);
            
        };
        Transform.prototype.run = function run() {
            
        };
        
        return Transform;
    })();
    
    module.exports = Transform;
    
});
module("src/parser/generator_state", function(module) {
    var exports = module.exports;
    var GeneratorState;
    GeneratorState = (function() {
        function GeneratorState() {}
        
        GeneratorState.prototype.generator = null;
        GeneratorState.prototype.node = null;
        GeneratorState.prototype.stack = null;
        GeneratorState.prototype.token = null;
        GeneratorState.prototype.minStack = 0;
        GeneratorState.prototype.done = false;
        GeneratorState.prototype.setGenerator = function setGenerator(generator, token) {
            this.generator = generator;
            this.token = token;
            this.node = null;
            this.stack = null;
            this.minStack = 0;
            this.done = false;
            
        };
        GeneratorState.prototype.next = function next() {
            var state;
            state = this.generator.next();
            
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
module("src/parser/definition/node", function(module) {
    var exports = module.exports;
    var Enum, Type, StackItem, Node;
    Enum = __require('src/util').Enum;
    
    Type = Enum([ 'NONE', 'BLOCK', 'JUMP', 'RETURN' ]);
    
    StackItem = (function() {
        function StackItem(node, token) {
            this.node = node;
            this.token = token;
            
        }
        
        StackItem.prototype.node = null;
        StackItem.prototype.token = null;
        
        return StackItem;
    })();
    
    Node = (function() {
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
            var children, id;
            children = this.children;
            
            for (id in children) {
                if (children[id] === node) {
                    return true;
                    
                    
                }
                
            }
            return false;
            
            
        };
        Node.prototype.add = function add(node) {
            var children, lastId, lastChild;
            
            if (this.hasChild(node)) {
                return;
                
            }
            children = this.children;
            
            if (node.type & Type.RETURN) {
                children.push(node);
                return node;
                
                
            } else {
                lastId = children.length - 1;
                
                if (lastId >= 0) {
                    lastChild = children[lastId];
                    
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
            var node;
            node = new Node();
            
            node.capture = capture;
            node.tokenType = tokenType;
            node.match = match;
            node.description = (description !== undefined ? description : (capture !== undefined ? capture : match));
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
            var children, lastChild;
            children = this.children;
            
            lastChild = children.length - 1;
            
            if (children[lastChild].type === Type.RETURN) {
                if (stack.length === 0) {
                    return true;
                    
                    
                } else {
                    return stack[stack.length - 1].node.reachesExit(stack.slice(0, -1));
                    
                    
                }
                
            }
            return false;
            
            
        };
        Node.prototype.filter = function* filter(parser, token, stack) {
            var children, child, blockRoot, generator, result, message, top;
            children = this.children;
            if (stack.length > 500) {
                message = parser.errorMessage(token, this, stack);
                
                throw new Error('recursion too deep. last error:\n' + message);
                
                
            }for (var id = 0, len = children.length; id < len;id++) {
                child = children[id];
                if (child.type === Type.JUMP) {
                    if (child.condition !== '' && parser.checkCondition(child.condition, stack) === false) {
                        continue;
                        
                    }
                    blockRoot = parser.definition.getBlock(child.match);
                    generator = blockRoot.filter(parser, token, stack.concat(new StackItem(child, token)));
                    while ((result = generator.next()).done === false) {
                        yield result.value;
                        
                        
                    }
                    
                } else if (child.type === Type.RETURN) {
                    if (stack.length === 0) {
                        throw new Error('nothing to yield');
                        
                        
                    }
                    top = stack[stack.length - 1].node;
                    
                    generator = top.filter(parser, token, stack.slice(0, -1));
                    while ((result = generator.next()).done === false) {
                        result.value.minStack = Math.min(result.value.minStack, stack.length - 1);
                        yield result.value;
                        
                        
                    }
                    
                } else if (child.matches(token)) {
                    yield { node: child, stack: stack, minStack: stack.length };
                    
                    
                }
                
            }
        };
        Node.prototype.toString = function toString(owner, known) {
            var data, childId, child, result, item;
            
            if (known === undefined) {
                data = {  };
                
            } else {
                data = known;
                
            }
            for (childId in this.children) {
                child = this.children[childId];
                
                if ((child.type & Type.RETURN) === 0) {
                    if (child.type === Type.JUMP && owner !== undefined) {
                        try {
                            owner.definition.getBlock(child.match).toString(owner, data);
                            
                        } catch (e) {
                            
                        }
                        
                    } else {
                        data[child.description != "" ? child.description : (child.capture != "" ? child.capture : "\"" + child.match + "\"")] = true;
                        
                    }
                    
                }
                
            }
            if (known !== undefined) {
                return "";
                
                
            }
            result = this.type === Type.JUMP ? '[' + this.match + '] ' : '';
            
            for (item in data) {
                if (result != "") {
                    result += ", ";
                    
                }
                result += item;
                
            }
            return result;
            
            
        };
        
        return Node;
    })();
    
    module.exports = Node;
    module.exports.Type = Type;
    module.exports.StackItem = StackItem;
    
});
module("src/parser/definition", function(module) {
    var exports = module.exports;
    var Node, Definition;
    Node = __require('src/parser/definition/node');
    
    Definition = (function() {
        function Definition(initialBlock) {
            this.blockRoot = {  };
            this.initialBlock = (initialBlock === undefined ? 'root' : initialBlock);
            
        }
        
        Definition.prototype.createBlock = function createBlock(name, rootNode) {
            name = (name === null ? this.initialBlock : name);
            rootNode.match = 'block_' + name;
            this.blockRoot[name] = rootNode;
            return rootNode;
            
            
        };
        Definition.prototype.haveBlock = function haveBlock(name) {
            return(this.blockRoot[name] !== undefined);
            
        };
        Definition.prototype.getBlock = function getBlock(name) {
            var node;
            node = this.blockRoot[name];
            
            if (node === undefined) {
                throw new Error('referencing non-existing definition block ' + name);
                
                
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
module("src/parser", function(module) {
    var exports = module.exports;
    var path, XRegExp, util, GeneratorState, Definition, Parser;
    path = require('path');
    
    XRegExp = __require('src/xregexp');
    
    util = __require('src/util');
    
    GeneratorState = __require('src/parser/generator_state');
    
    Definition = __require('src/parser/definition');
    
    Parser = (function() {
        function Parser() {
            this.definition = new Definition('root');
            
        }
        
        Parser.prototype.definition = null;
        Parser.prototype.tokenizer = null;
        Parser.prototype.file = 'unnamed';
        Parser.prototype.clone = function clone() {
            var OwnType, parser;
            OwnType = Object.getPrototypeOf(this).constructor;
            
            parser = new OwnType();
            
            
            parser.definition = this.definition;
            parser.tokenizer = this.tokenizer;
            return parser;
            
            
        };
        Parser.prototype.errorMessage = function errorMessage(token, node, stack) {
            var id, trace, done, levelNode, levelToken;
            stack = stack.slice();
            stack.push({ node: node, token: token });
            id = stack.length - 1;
            
            trace = '';
            
            done = 0;
            
            
            while (id--) {
                levelNode = stack[id].node;
                levelToken = stack[id].token;
                if (levelNode instanceof Object) {
                    trace += (id + 1) + '. ' + levelNode.name + (levelNode.capture !== '' ? ':' + levelNode.capture : '') + (levelNode.label !== '' ? '[' + levelNode.label + ']' : '');
                    
                } else {
                    trace += 'null entry on stack';
                    
                }
                trace += ' at ' + levelToken.pos.toString() + ': ' + levelToken.data + '\n';
                if (done++ > 15 && id > 15) {
                    id = 15;
                    trace += '...\n';
                    
                }
                
            }
            return '$file: Unexpected token "$tokenData" $position. Expected: $validNodes\n\nTrace:\n$trace'.format({
                file: path.normalize(this.file),
                tokenData: token.data,
                position: token.pos.toString(),
                validNodes: node.toString(this),
                trace: trace
                
            });
            
            
        };
        Parser.prototype.checkCondition = function checkCondition(condition, stack) {
            throw Error('NYI: parser::checkCondition');
            
            
        };
        Parser.prototype.parse = function parse(source) {
            var tokens, node, stack, len, id, maxId, maxStack, maxNode, results, success, result, token;
            util.log('Parser', 'tokenizing', 2);
            tokens = this.tokenizer.process(source, this.file);
            
            util.log('Parser', 'done', -2);
            node = this.definition.getInitialBlock();
            
            stack = [  ];
            
            len = tokens.length;
            
            id = len;
            
            maxId = 0;
            
            maxStack = [  ];
            
            maxNode = node;
            
            results = new Array(len);
            
            success = false;
            
            
            while (id--) {
                results[id] = new GeneratorState();
                
            }
            id = 0;
            util.log('Parser', 'processing ' + len + ' tokens according to currrent language definition');
            do {
                result = results[id];
                if (result.generator === null) {
                    token = tokens.get(id);
                    result.setGenerator(node.filter(this, token, stack), token);
                    
                }
                try {
                    result.next();
                    
                } catch (e) {
                    if (e.message === 'nothing to yield') {
                        break;
                        
                    } else {
                        throw e;
                        
                        
                    }
                    
                }
                if (result.done === false && id > maxId) {
                    maxId = id;
                    maxStack = result.stack.slice(0);
                    maxNode = result.node;
                    
                }
                if (result.done) {
                    result.setGenerator(null);
                    id--;
                    
                } else if (id === len - 1) {
                    if (result.node.reachesExit(result.stack)) {
                        success = true;
                        break;
                        
                    } else {
                        continue;
                        
                    }
                    
                } else {
                    node = result.node;
                    stack = result.stack.slice(0);
                    id++;
                    
                }
                
            } while (id >= 0);
            if (success === false) {
                if (maxId + 1 === len) {
                    throw new Error(path.normalize(this.file) + ': Unexpected end of file.');
                    
                    
                } else {
                    throw new Error(this.errorMessage(tokens.get(maxId + 1), maxNode, maxStack));
                    
                    
                }
                
            }
            return results;
            
            
        };
        
        return Parser;
    })();
    
    module.exports = Parser;
    module.exports.Definition = Definition;
    
});
module("src/tokenizer/result", function(module) {
    var exports = module.exports;
    var Position, Token, Result;
    Position = (function() {
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
    
    Token = (function() {
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
    
    Result = (function() {
        function Result(tokenizer) {
            this.tokenizer = tokenizer;
            this.tokens = [  ];
            
        }
        
        Result.prototype.add = function add(data, type, start, col, row) {
            this.tokens.push(new Token(data, type, start, col, row));
            
        };
        Result.prototype.get = function get(tokenId) {
            return this.tokens[tokenId];
            
            
        };
        Object.defineProperty(Result.prototype, "length", {
            get: function length() {
                return this.tokens.length;
                
                
            }
            
        });
        
        return Result;
    })();
    
    module.exports = Result;
    
});
module("src/tokenizer", function(module) {
    var exports = module.exports;
    var XRegExp, Enum, Result, Tokenizer;
    XRegExp = __require('src/xregexp');
    
    Enum = __require('src/util').Enum;
    
    Result = __require('src/tokenizer/result');
    
    Tokenizer = (function() {
        function Tokenizer(definition, extra) {
            var legend, id;
            this.definition = definition;
            legend = [  ];
            
            for (id in definition) {
                legend.push(definition[id].name);
                
            }
            if (extra instanceof Array) {
                for (id in extra) {
                    legend.push(extra);
                    
                }
                
            }
            this.Type = Enum(legend);
            
        }
        
        Tokenizer.prototype.process = function process(data, filename) {
            filename = (filename !== undefined ? filename : ('unnamed'));
            var startPos, result, col, row, definition, match, found, id, processor;
            startPos = 0;
            
            result = new Result(this);
            
            col = 1;
            
            row = 1;
            
            definition = this.definition;
            
            
            while (startPos < data.length) {
                found = false;
                for (id in this.definition) {
                    processor = this.definition[id];
                    match = processor.func(data, startPos);
                    if (match !== null) {
                        if (match.data !== null && match.name !== null) {
                            result.add(match.data, this.Type[match.name], startPos, col, row);
                            
                        }
                        row += match.containedRows;
                        col = (match.containedRows === 0 ? col + match.lastRowLen : match.lastRowLen + 1);
                        found = true;
                        startPos += match.data.length;
                        break;
                        
                    }
                    
                }
                if (found !== true) {
                    throw new Error(filename + ': no match found at row ' + row + ', column ' + col + ': "' + data.substr(startPos).split(/\r?\n/)[0] + '"');
                    
                    return result;
                    
                    
                }
                
            }
            return result;
            
            
        };
        
        return Tokenizer;
    })();
    
    function Match(name, data, endPosition, containedRows, lastRowLen) {
        this.name = name;
        this.data = data;
        this.endPosition = endPosition;
        this.containedRows = containedRows;
        this.lastRowLen = lastRowLen;
        
    }
    Tokenizer.prefab = new (function() {
        var regexFunc, regexEscape, excludeFunc;
        regexFunc = function(name, regex, callback) {
            return {
                name: name,
                func: function(data, start) {
                    var result, rows, lastBreak, lastRowLen, match;
                    result = regex.exec(data.substr(start));
                    
                    if (result !== null) {
                        rows = result[0].occurances('\n');
                        
                        lastBreak = result[0].lastIndexOf('\n');
                        
                        lastRowLen = result[0].length - (lastBreak + 1);
                        
                        match = new Match(this.name, result[0], start + result[0].length, rows, lastRowLen);
                        
                        if (typeof callback === 'function') {
                            return callback(match);
                            
                            
                        } else {
                            return match;
                            
                            
                        }
                        
                    }
                    return null;
                    
                    
                }
                
            };
            
            
        };
        
        regexEscape = function(regexString) {
            return XRegExp.escape(regexString).replace('/', '\\/');
            
            
        };
        
        this.breaker = function breaker() {
            return regexFunc(null, /^(\s+)/);
            
            
        };
        this.number = function number(name) {
            return regexFunc(name, /^(\-?[0-9]+(\.[0-9]+)?(e\-?[0-9]+)?)/);
            
            
        };
        this.delimited = function delimited(name, start, end) {
            var regex;
            start = start || '"';
            end = end || start;
            regex = new RegExp('^(' + regexEscape(start) + '[\\s\\S]*?' + regexEscape(end) + ')');
            
            return regexFunc(name, regex);
            
            
        };
        this.regex = function regex(name, regex, callback) {
            return regexFunc(name, regex, callback);
            
            
        };
        excludeFunc = function(match) {
            if (this.indexOf(match.data) !== -1) {
                return null;
                
                
            }
            return match;
            
            
        };
        
        this.exclude = function exclude(name, regex, exclude) {
            return regexFunc(name, regex, excludeFunc.bind(exclude));
            
            
        };
        this.set = function set(name, matches) {
            var escaped, id, regex;
            escaped = [  ];
            
            for (id in matches) {
                escaped.push(regexEscape(matches[id]));
                
            }
            regex = new RegExp('^(' + escaped.join('|') + ')');
            
            return regexFunc(name, regex);
            
            
        };
        this.group = function group(name, matches) {
            var escaped, id, regex;
            escaped = [  ];
            
            for (id in matches) {
                escaped.push(regexEscape(matches[id]));
                
            }
            regex = new RegExp('^(' + '[' + escaped.join() + ']+)');
            
            return regexFunc(name, regex);
            
            
        };
        this.any = function any(name) {
            return regexFunc(name, /^[^\s]*/);
            
            
        };
        
    })();
    module.exports = Tokenizer;
    module.exports.Result = Result;
    
});
module("src/definition_parser/path", function(module) {
    var exports = module.exports;
    var Path, PathElement;
    Path = (function() {
        function Path(sourceName, sourceCapture, sourceLabel, sourceCondition, targetName, targetCapture, targetLabel, targetCondition) {
            this.source = new PathElement(sourceName, sourceCapture, sourceLabel, sourceCondition);
            this.target = new PathElement(targetName, targetCapture, targetLabel, targetCondition);
            
        }
        
        Path.prototype.source = null;
        Path.prototype.target = null;
        Path.prototype.reset = function reset() {
            this.source = this.target;
            this.target = new PathElement();
            
        };
        Path.prototype.clone = function clone() {
            return new Path(this.source.name, this.source.capture, this.source.label, this.source.condition, this.target.name, this.target.capture, this.target.label, this.target.condition);
            
            
        };
        
        return Path;
    })();
    
    PathElement = (function() {
        function PathElement(name, capture, label, condition) {
            name = (name !== undefined ? name : (''));
            capture = (capture !== undefined ? capture : (''));
            label = (label !== undefined ? label : (''));
            condition = (condition !== undefined ? condition : (''));
            this.name = name;
            this.capture = capture;
            this.label = label;
            this.condition = condition;
            
        }
        
        PathElement.prototype.name = '';
        PathElement.prototype.capture = '';
        PathElement.prototype.label = '';
        PathElement.prototype.condition = '';
        
        return PathElement;
    })();
    
    module.exports = Path;
    
});
module("src/definition_parser", function(module) {
    var exports = module.exports;
    var XRegExp, util, Parser, Tokenizer, Path, DefinitionParser;
    XRegExp = __require('src/xregexp');
    
    util = __require('src/util');
    
    Parser = __require('src/parser');
    
    Tokenizer = __require('src/tokenizer');
    
    Path = __require('src/definition_parser/path');
    
    DefinitionParser = (function(___parent) {
        function DefinitionParser() {
            Parser.prototype.constructor.call(this);
            this.tokenizer = new Tokenizer([
                Tokenizer.prefab.delimited(null, '/*', '*/'),
                Tokenizer.prefab.regex(null, /^\/\/.*/),
                Tokenizer.prefab.breaker(),
                Tokenizer.prefab.regex('WORD', /^[a-z_]+/i),
                Tokenizer.prefab.set('DELIM', [ '->', '.', ':', '[', ']', '{', '}', '?' ]),
                Tokenizer.prefab.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/),
                Tokenizer.prefab.number('NUMERIC')
                
            ]);
            this.trainSelf();
            this.pathBlocks = {  };
            this.currentPath = new Path();
            
        }
        
        DefinitionParser.prototype = Object.create(___parent.prototype);
        DefinitionParser.prototype.constructor = DefinitionParser;
        
        DefinitionParser.prototype.capture = function capture(name, value) {
            var currentPath;
            currentPath = this.currentPath;
            
            if (name == 'block_name') {
                this.block_name = value;
                this.pathBlocks[this.block_name] = [  ];
                return;
                
            }
            if ((name == 'path' || name == 'source_name' || name == 'block_done') && currentPath.source.name != '' && currentPath.target.name != '') {
                this.pathBlocks[this.block_name].push(currentPath.clone());
                currentPath.reset();
                
            }
            if (name == 'source_name') {
                currentPath.source.name = value;
                currentPath.source.capture = '';
                currentPath.source.label = '';
                currentPath.source.condition = '';
                
            } else if (name == 'target_name') {
                currentPath.target.name = value;
                currentPath.target.capture = '';
                currentPath.target.label = '';
                currentPath.target.condition = '';
                
            } else if (name == 'source_capture') {
                currentPath.source.capture = value;
                
            } else if (name == 'target_capture') {
                currentPath.target.capture = value;
                
            } else if (name == 'source_label') {
                currentPath.source.label = value;
                
            } else if (name == 'target_label') {
                currentPath.target.label = value;
                
            } else if (name == 'source_condition') {
                currentPath.source.condition = value.slice(1, -1);
                
            } else if (name == 'target_condition') {
                currentPath.target.condition = value.slice(1, -1);
                
            }
            
        };
        DefinitionParser.prototype.parse = function parse(source) {
            var results, id, result;
            results = Parser.prototype.parse.call(this, source);
            
            for (id in results) {
                result = results[id];
                if (result.node.capture != '') {
                    this.capture(result.node.capture, result.token.data);
                    
                }
                
            }
            return results;
            
            
        };
        DefinitionParser.prototype.trainOther = function trainOther(parser) {
            var parts, block_name, block_paths, node_map, node_pair, id, path, i, part, hash, node;
            parts = [ 'source', 'target' ];
            
            for (block_name in this.pathBlocks) {
                block_paths = this.pathBlocks[block_name];
                node_map = {  };
                
                node_pair = [  ];
                
                for (id in block_paths) {
                    path = block_paths[id];
                    for (i in parts) {
                        part = parts[i];
                        hash = path[part].name + ':' + path[part].capture + ':' + path[part].label;
                        
                        node_pair[i] = node_map[hash];
                        if (node_pair[i] === undefined) {
                            node = parser.createNode(path[part].name, path[part].capture, path[part].label, path[part].condition);
                            
                            node_map[hash] = node;
                            node_pair[i] = node;
                            
                        }
                        
                    }
                    parser.integrateNodePair(node_pair, block_name);
                    
                }
                
            }
            
        };
        DefinitionParser.prototype.trainSelf = function trainSelf() {
            var Type, block_root, blockname, body, node1a, node1b, node1c, node1d, node1e, node1f, node1g, node1h, path1a, node2a, node2b, node2c, node2d, node2e, node2f, node2g, node2h, bodyend, exit;
            Type = this.tokenizer.Type;
            
            block_root = new Parser.Definition.Node();
            
            this.definition.createBlock(null, block_root);
            blockname = block_root.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'block_name');
            
            body = blockname.createAndAdd(Type.DELIM, '{', '', '{');
            
            node1a = body.createAndAdd(Type.WORD | Type.STRING, XRegExp('.+', 's'), 'source_name');
            
            node1b = node1a.createAndAdd(Type.DELIM, ':', '', ':');
            
            node1c = node1b.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'source_capture');
            
            node1d = node1c.createAndAdd(Type.DELIM, '[', '', '[');
            
            node1e = node1d.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'source_label');
            
            node1f = node1e.createAndAdd(Type.DELIM, ']', '', ']');
            
            node1g = node1f.createAndAdd(Type.DELIM, '?', '', '?');
            
            node1h = node1g.createAndAdd(Type.STRING, XRegExp('.+', 's'), 'source_condition');
            
            node1a.add(node1d);
            node1a.add(node1g);
            node1c.add(node1g);
            path1a = node1a.createAndAdd(Type.DELIM, '->', 'path', '->');
            
            node1h.add(path1a);
            node1f.add(path1a);
            node1c.add(path1a);
            node2a = path1a.createAndAdd(Type.WORD | Type.STRING, XRegExp('.+', 's'), 'target_name');
            
            node2b = node2a.createAndAdd(Type.DELIM, ':', '', ':');
            
            node2c = node2b.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'target_capture');
            
            node2d = node2c.createAndAdd(Type.DELIM, '[', '', '[');
            
            node2e = node2d.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'target_label');
            
            node2f = node2e.createAndAdd(Type.DELIM, ']', '', ']');
            
            node2g = node2f.createAndAdd(Type.DELIM, '?', '', '?');
            
            node2h = node2g.createAndAdd(Type.STRING, XRegExp('.+', 's'), 'target_condition');
            
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
            bodyend = node2c.createAndAdd(Type.DELIM, '}', 'block_done', '}');
            
            node2a.add(bodyend);
            node2f.add(bodyend);
            node2h.add(bodyend);
            bodyend.add(blockname);
            exit = bodyend.createAndAdd(Type.WORD, 'exit');
            
            exit.type = Parser.Definition.Node.Type.RETURN;
            
        };
        
        return DefinitionParser;
    })(Parser);
    
    module.exports = DefinitionParser;
    
});
module("src/language_parser/capture_node", function(module) {
    var exports = module.exports;
    var SourceNode, Template, CaptureNode, stackDiff;
    SourceNode = require('source-map').SourceNode;
    
    Template = __require('src/template');
    
    CaptureNode = (function() {
        function CaptureNode(key, value) {
            this.key = key;
            this.value = value;
            
        }
        
        CaptureNode.prototype.parent = null;
        CaptureNode.prototype.children = null;
        CaptureNode.prototype.key = '';
        CaptureNode.prototype.value = '';
        CaptureNode.prototype.tpl = null;
        CaptureNode.prototype.row = 0;
        CaptureNode.prototype.col = 0;
        CaptureNode.prototype.toJSON = function toJSON() {
            var children, id;
            children = [  ];
            
            for (id in this.children) {
                children.push(this.children[id].toJSON());
                
            }
            return {
                _: this.constructor.name,
                s: children,
                k: this.key,
                v: this.value,
                t: this.tpl,
                r: this.row,
                c: this.col
                
            };
            
            
        };
        CaptureNode.prototype.fromJSON = function fromJSON(json, parent, typeMapper) {
            var Type, result, jsonChildren, resultChildren, id;
            Type = typeMapper(null, json._);
            
            result = new Type(json.k, json.v);
            
            result.parent = parent;
            result.tpl = json.t;
            result.row = json.r;
            result.col = json.c;
            result.children = [  ];
            jsonChildren = json.s;
            
            resultChildren = result.children;
            
            for (id in jsonChildren) {
                resultChildren.push(CaptureNode.prototype.fromJSON(jsonChildren[id], result, typeMapper));
                
            }
            return result;
            
            
        };
        CaptureNode.prototype.fromResults = function fromResults(results, typeMapper) {
            var root, current, lastStack, result, stack, diff, node, resultId, nodeId, match;
            root = new CaptureNode();
            
            current = root;
            
            lastStack = [  ];
            
            
            for (resultId in results) {
                result = results[resultId];
                stack = result.stack;
                diff = stackDiff(stack, lastStack, result.minStack);
                while (diff.ascend--) {
                    current = current.parent;
                    
                }
                for (nodeId in diff.create) {
                    node = diff.create[nodeId];
                    current = current.addNew(node.capture, node.name, typeMapper(node.capture, node.name));
                    current.row = result.token.pos.row;
                    current.col = result.token.pos.col;
                    
                }
                node = result.node;
                if (node.capture !== '') {
                    match = current.addNew(node.capture, result.token.data, typeMapper(node.capture, node.name));
                    
                    match.row = result.token.pos.row;
                    match.col = result.token.pos.col;
                    
                }
                lastStack = stack;
                
            }
            return root;
            
            
        };
        CaptureNode.prototype.isNode = function isNode() {
            return this.col !== -1;
            
            
        };
        CaptureNode.prototype.isLeaf = function isLeaf() {
            return(this.children instanceof Array === false);
            
        };
        CaptureNode.prototype.isBranch = function isBranch() {
            return(this.children instanceof Array);
            
        };
        CaptureNode.prototype.length = function length() {
            return(this.children instanceof Array ? this.children.length : 0);
            
        };
        CaptureNode.prototype.depth = function depth() {
            var result, current;
            result = 0;
            
            current = this;
            
            while (current.parent instanceof CaptureNode) {
                result += 1;
                current = current.parent;
                
            }
            return result;
            
            
        };
        CaptureNode.prototype.ancestor = function ancestor(key, value) {
            var current;
            current = this;
            
            key = (typeof key !== 'string' ? null : key.split('|'));
            value = (typeof value !== 'string' ? null : value.split('|'));
            if (key !== null && value !== null) {
                while (current.parent instanceof CaptureNode && key.indexOf(current.parent.key) === -1 && value.indexOf(current.parent.value) === -1) {
                    current = current.parent;
                    
                }
                
            } else if (key !== null) {
                while (current.parent instanceof CaptureNode && key.indexOf(current.parent.key) === -1) {
                    current = current.parent;
                    
                }
                
            } else if (value !== null) {
                while (current.parent instanceof CaptureNode && value.indexOf(current.parent.value) === -1) {
                    current = current.parent;
                    
                }
                
            }
            if (current.parent instanceof CaptureNode) {
                return current.parent;
                
                
            } else {
                return null;
                
                
            }
            
        };
        CaptureNode.prototype.parser = function parser() {
            var current;
            current = this;
            
            while (current.parent !== null && (current.parent instanceof CaptureNode.LanguageParser === false)) {
                current = current.parent;
                
            }
            return current.parent;
            
            
        };
        CaptureNode.prototype.add = function add(child) {
            if (this.children == null) {
                this.children = [  ];
                
            }
            this.children.push(child);
            return child;
            
            
        };
        CaptureNode.prototype.get = function get(key, index, dummy) {
            var id, child;
            index = (index === undefined ? 0 : index);
            dummy = (dummy === undefined ? this.dummy : null);
            if (this.children instanceof Array) {
                for (id in this.children) {
                    child = this.children[id];
                    
                    if (child.key == key && index-- == 0) {
                        return child;
                        
                        
                    }
                    
                }
                
            }
            return dummy;
            
            
        };
        CaptureNode.prototype.path = function path(path, dummy) {
            var step, current, id;
            
            current = this;
            
            dummy = (dummy === undefined ? this.dummy : null);
            path = path.split('.');
            for (id in path) {
                step = path[id].split('[');
                if (step.length === 1) {
                    current = current.get(step[0]);
                    
                } else {
                    current = current.get(step[0], parseInt(step[1].slice(0, -1)));
                    
                }
                if (current === null) {
                    return dummy;
                    
                    
                }
                
            }
            return current;
            
            
        };
        CaptureNode.prototype.addNew = function addNew(key, value, Type) {
            var child;
            child = new Type(key, value);
            
            
            child.parent = this;
            return this.add(child);
            
            
        };
        CaptureNode.prototype.nl = function nl(indent) {
            var parser;
            indent = (indent === undefined ? 0 : indent);
            parser = this.parser();
            
            parser.indent += indent;
            return '\n' + String.repeat(parser.indent * 4, ' ');
            
            
        };
        CaptureNode.prototype.csn = function csn(code) {
            return new SourceNode(this.row, this.col - 1, this.parser().file, code);
            
            
        };
        CaptureNode.prototype.toString = function toString() {
            var result, id;
            result = '';
            
            if (this.children instanceof Array) {
                for (id in this.children) {
                    result += this.children[id].toString();
                    
                }
                
            }
            return result;
            
            
        };
        CaptureNode.prototype.toSourceNode = function toSourceNode() {
            var result, id;
            result = new SourceNode(null, null);
            
            if (this.children instanceof Array) {
                for (id in this.children) {
                    result.add(this.children[id].toSourceNode());
                    
                }
                
            }
            return result;
            
            
        };
        CaptureNode.prototype.each = function each(fn) {
            var children, last, id;
            children = this.children;
            
            if (children instanceof Array) {
                last = children.length - 1;
                
                for (id in children) {
                    fn.call(this, children[id], +id === 0, +id === last);
                    
                }
                
            }
            
        };
        CaptureNode.prototype.eachKey = function eachKey(key, fn) {
            var part, children, len, prevChild, first, id, child;
            part = key.split('.');
            
            if (this.children instanceof Array) {
                children = this.children;
                
                len = children.length;
                
                prevChild = null;
                
                first = true;
                
                
                for (id = 0; id < len;id++) {
                    child = children[id];
                    
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
                if (prevChild.key === part[0] && part.length === 1) {
                    fn.call(this, prevChild, false, true);
                    
                }
                
            }
            
        };
        CaptureNode.prototype.setTemplate = function setTemplate(fileName) {
            this.tpl = new Template();
            this.tplFile = fileName;
            
        };
        CaptureNode.prototype.processTemplate = function processTemplate() {
            
            return this.tpl.fetchFile(this.tplFile);
            
            
        };
        CaptureNode.prototype.assign = function assign(uri, value) {
            this.tpl.assign(uri, value);
            
        };
        
        return CaptureNode;
    })();
    
    CaptureNode.prototype.dummy = new CaptureNode('', '');
    CaptureNode.prototype.dummy.row = -1;
    CaptureNode.prototype.dummy.col = -1;
    stackDiff = function(stack, lastStack, minStackLen) {
        var deepestCommonCapture, minLen, numCaptures, lastLen, captures, len;
        deepestCommonCapture = -1;
        
        minLen = Math.min(stack.length, lastStack.length, minStackLen);
        
        for (var i = 0; i < minLen;i++) {
            if (stack[i].node === lastStack[i].node) {
                if (stack[i].node.capture !== '') {
                    deepestCommonCapture = i;
                    
                }
                
            } else {
                break;
                
            }
            
        }
        numCaptures = 0;
        
        lastLen = lastStack.length;
        
        for (var i = deepestCommonCapture + 1; i < lastLen;i++) {
            if (lastStack[i].node.capture !== '') {
                numCaptures++;
                
            }
            
        }
        captures = [  ];
        
        len = stack.length;
        
        for (var i = deepestCommonCapture + 1; i < len;i++) {
            if (stack[i].node.capture !== '') {
                captures.push(stack[i].node);
                
            }
            
        }
        return { ascend: numCaptures, create: captures };
        
        
    };
    
    module.exports = CaptureNode;
    
});
module("src/language_parser", function(module) {
    var exports = module.exports;
    var fs, XRegExp, util, Parser, DefinitionParser, CaptureNode, LanguageParser;
    fs = require('fs');
    
    XRegExp = __require('src/xregexp');
    
    util = __require('src/util');
    
    Parser = __require('src/parser');
    
    DefinitionParser = __require('src/definition_parser');
    
    CaptureNode = __require('src/language_parser/capture_node');
    
    LanguageParser = (function(___parent) {
        function LanguageParser(transform) {
            Parser.prototype.constructor.call(this, transform);
            this.transform = transform;
            this.resultData = {  };
            
        }
        
        LanguageParser.prototype = Object.create(___parent.prototype);
        LanguageParser.prototype.constructor = LanguageParser;
        
        LanguageParser.prototype.trainer = null;
        LanguageParser.prototype.sourceCode = null;
        LanguageParser.prototype.captureTree = null;
        LanguageParser.prototype.resultData = null;
        LanguageParser.prototype.cacheData = null;
        LanguageParser.prototype.outputMethod = 'toSourceNode';
        LanguageParser.prototype.clone = function clone() {
            var parser;
            parser = Parser.prototype.clone.call(this);
            
            parser.transform = this.transform;
            parser.source = this.source;
            return parser;
            
            
        };
        LanguageParser.prototype.trainSelf = function trainSelf() {
            
            this.definition = new Parser.Definition();
            this.trainer.trainOther(this);
            this.trainer = null;
            
        };
        LanguageParser.prototype.loadDefinition = function loadDefinition(resource) {
            var fileContents;
            util.log('LanguageParser', 'loading defintion file ' + resource);
            fileContents = fs.readFileSync(resource, 'UTF-8');
            
            if (this.trainer == null) {
                this.trainer = new DefinitionParser();
                
            }
            util.log('LanguageParser', 'processing definition', 2);
            this.trainer.file = resource;
            this.trainer.parse(fileContents);
            util.log('LanguageParser', 'done', -2);
            
        };
        LanguageParser.prototype.mapType = function mapType(capture_name, block_name) {
            return CaptureNode;
            
            
        };
        LanguageParser.prototype.createNode = function createNode(name, capture, label, condition) {
            var Node, node, numChars;
            Node = Parser.Definition.Node;
            
            node = new Node();
            
            node.name = name;
            node.capture = capture;
            node.label = label;
            node.condition = condition;
            switch (name) {
                case 'entry':
                    
                case 'return':
                    node.match = name;
                    node.tokenType = -1;
                    node.type = (name == 'entry' ? Node.Type.BLOCK : Node.Type.RETURN);
                    node.description = name;
                    break;
                    
                case 'string':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.STRING;
                    node.type = 0;
                    node.description = 'string';
                    break;
                    
                case 'numeric':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.NUMERIC;
                    node.type = 0;
                    node.description = 'numerical';
                    break;
                    
                default:
                    numChars = name.length;
                    
                    if (name[0] == '\"') {
                        
                        node.match = XRegExp('^' + XRegExp.escape(name.slice(1, numChars - 1)) + '$', 's');
                        node.tokenType = -1;
                        node.type = 0;
                        node.description = name.slice(1, numChars - 1);
                        
                    } else if (name[0] == '\'') {
                        
                        node.match = XRegExp(name.slice(1, numChars - 1), 's');
                        node.tokenType = -1;
                        node.type = 0;
                        node.description = name.slice(1, numChars - 1);
                        
                    } else {
                        node.match = name;
                        node.tokenType = -1;
                        node.type = Node.Type.JUMP;
                        node.description = 'definition jump';
                        
                    }
                    break;
                    
                
            }
            return node;
            
            
        };
        LanguageParser.prototype.integrateNodePair = function integrateNodePair(pair, blockName) {
            pair[0].add(pair[1], Parser.Definition.Node.Type.RETURN & pair[1].type);
            if (pair[0].type == Parser.Definition.Node.Type.BLOCK && this.definition.haveBlock(blockName) == false) {
                this.definition.createBlock(blockName, pair[0]);
                
            }
            
        };
        LanguageParser.prototype.setSource = function setSource(resource, data) {
            var captures;
            this.captureTree = null;
            this.file = resource;
            this.sourceCode = data.replace('\r\n', '\n');
            util.log('LanguageParser', 'processing source ' + resource, 2);
            captures = this.parse(this.sourceCode);
            
            util.log('LanguageParser', 'done', -2);
            this.captureTree = CaptureNode.prototype.fromResults(captures, this.mapType.bind(this));
            this.captureTree.parent = this;
            
        };
        LanguageParser.prototype.loadSourceFromCache = function loadSourceFromCache(resource) {
            this.cacheData = this.transform.cache.fetch(resource, [ 'base' ]);
            if (this.cacheData !== null) {
                this.file = resource;
                this.captureTree = CaptureNode.prototype.fromJSON(this.cacheData['base'], this, this.mapType.bind(this));
                
            }
            
        };
        LanguageParser.prototype.loadSource = function loadSource(resource) {
            if (this.transform.options.nocache !== true && this.cacheData === null) {
                this.loadSourceFromCache(resource);
                
            }
            if (this.cacheData === null) {
                this.setSource(resource, fs.readFileSync(resource, 'UTF-8').replace("var assert = require('assert');", ''));
                
            }
            
        };
        LanguageParser.prototype.output = function output() {
            var result, InitialType;
            
            InitialType = this.mapType('', this.definition.initialBlock);
            
            result = InitialType.prototype[this.outputMethod].call(this.captureTree);
            if (this.transform.options.nocache !== true && this.cacheData === null && fs.existsSync(this.file)) {
                this.transform.cache.insert(this.file, { base: this.captureTree.toJSON() });
                
            }
            return result;
            
            
        };
        
        return LanguageParser;
    })(Parser);
    
    CaptureNode.LanguageParser = LanguageParser;
    LanguageParser.CaptureNode = CaptureNode;
    module.exports = LanguageParser;
    
});
module("src/extensions/adria_node", function(module) {
    var exports = module.exports;
    var path, SourceNode, LanguageParser, CaptureNode, Transform, util, Set, AccessOperationProtocall, ConstLiteral, Scope, YieldingScope, Module, InvokeOperation, FunctionLiteral, GeneratorLiteral, FunctionStatement, GeneratorStatement, FunctionParamList, BaseLiteral, DoWhileStatement, WhileStatement, IfStatement, SwitchStatement, ForCountStatement, ForInStatement, ObjectLiteral, ProtoBodyProperty, ArrayLiteral, Expression, ProtoLiteral, ProtoStatement, ProtoBodyItem, ReturnStatement, YieldStatement, catchSpecificsId, CatchSpecifics, CatchAll, TryCatchFinallyStatement, ThrowStatement, AssertStatement, Statement, InterruptibleStatement, RequireLiteral, ModuleStatement, ExportStatement, GlobalDef, Ident, Name, VarDef;
    path = require('path');
    
    SourceNode = require('source-map').SourceNode;
    
    LanguageParser = __require('src/language_parser');
    
    CaptureNode = LanguageParser.CaptureNode;
    
    Transform = __require('src/transform');
    
    util = __require('src/util');
    
    Set = util.Set;
    
    AccessOperationProtocall = (function(___parent) {
        function AccessOperationProtocall() {
            ___parent.apply(this, arguments);
        }
        
        AccessOperationProtocall.prototype = Object.create(___parent.prototype);
        AccessOperationProtocall.prototype.constructor = AccessOperationProtocall;
        
        AccessOperationProtocall.prototype.toSourceNode = function toSourceNode() {
            var params, result;
            params = this.get('call');
            
            result = this.csn();
            
            result.add([ '.prototype.', this.csn(this.get('item').value), '.call(this' ]);
            params.each(function(param) {
                result.add([ ', ', param.toSourceNode() ]);
                
            });
            result.add(')');
            return result;
            
            
        };
        
        return AccessOperationProtocall;
    })(CaptureNode);
    
    ConstLiteral = (function(___parent) {
        function ConstLiteral() {
            ___parent.apply(this, arguments);
        }
        
        ConstLiteral.prototype = Object.create(___parent.prototype);
        ConstLiteral.prototype.constructor = ConstLiteral;
        
        ConstLiteral.prototype.toSourceNode = function toSourceNode() {
            var stringNode;
            stringNode = this.get('string');
            
            if (stringNode.isNode()) {
                return this.csn(stringNode.value);
                
                
            } else {
                return this.csn(this.get('numeric').value);
                
                
            }
            
        };
        
        return ConstLiteral;
    })(CaptureNode);
    
    Scope = (function(___parent) {
        function Scope(key, value) {
            this.locals = new Set();
            CaptureNode.prototype.constructor.call(this, key, value);
            
        }
        
        Scope.prototype = Object.create(___parent.prototype);
        Scope.prototype.constructor = Scope;
        
        Scope.prototype.locals = null;
        Scope.prototype.toSourceNode = function toSourceNode() {
            var content, result;
            content = CaptureNode.prototype.toSourceNode.call(this);
            
            result = this.csn();
            
            if (this.locals.length > 0) {
                result.add([ 'var ', this.locals.toArray().join(', '), ';' + this.nl() ]);
                
            }
            result.add(content);
            return result;
            
            
        };
        
        return Scope;
    })(CaptureNode);
    
    YieldingScope = Scope;
    
    Module = (function(___parent) {
        function Module(key, value) {
            this.exports = new Set();
            this.locals = new Set();
            CaptureNode.prototype.constructor.call(this, key, value);
            
        }
        
        Module.prototype = Object.create(___parent.prototype);
        Module.prototype.constructor = Module;
        
        Module.prototype.moduleExport = null;
        Module.prototype.exports = null;
        Module.prototype.locals = null;
        Module.prototype.toSourceNode = function toSourceNode() {
            var parser, code, locals, exports, file, result, id;
            parser = this.parser();
            
            this.nl(1);
            code = CaptureNode.prototype.toSourceNode.call(this);
            
            locals = this.locals.toArray();
            
            exports = this.exports.toArray();
            
            file = parser.file;
            
            result = this.csn('module("' + parser.moduleName + '", function(module) {' + this.nl());
            
            if (parser.transform.options['tweak-exports']) {
                result.add('var exports = module.exports;' + this.nl());
                
            }
            if (locals.length > 0) {
                result.add('var ' + locals.join(', ') + ';' + this.nl());
                
            }
            result.add(code);
            if (this.moduleExport !== null) {
                result.add('module.exports = ' + this.moduleExport + ';' + this.nl());
                
            }
            for (id in exports) {
                result.add('module.exports.' + exports[id] + ' = ' + exports[id] + ';' + this.nl());
                
            }
            result.add(this.nl(-1) + '});' + this.nl());
            return result;
            
            
        };
        
        return Module;
    })(CaptureNode);
    
    InvokeOperation = (function(___parent) {
        function InvokeOperation() {
            ___parent.apply(this, arguments);
        }
        
        InvokeOperation.prototype = Object.create(___parent.prototype);
        InvokeOperation.prototype.constructor = InvokeOperation;
        
        InvokeOperation.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            
            result.add('(');
            this.each(function(node, first) {
                if (first === false) {
                    result.add(', ');
                    
                }
                result.add(node.toSourceNode());
                
            });
            result.add(')');
            return result;
            
            
        };
        
        return InvokeOperation;
    })(CaptureNode);
    
    FunctionLiteral = (function(___parent) {
        function FunctionLiteral(key, value) {
            this.defaultArgs = [  ];
            CaptureNode.prototype.constructor.call(this, key, value);
            
        }
        
        FunctionLiteral.prototype = Object.create(___parent.prototype);
        FunctionLiteral.prototype.constructor = FunctionLiteral;
        
        FunctionLiteral.prototype.defaultArgs = null;
        FunctionLiteral.prototype.name = null;
        FunctionLiteral.prototype.toSourceNode = function toSourceNode() {
            var nameNode, children, id, found, result, generator;
            this.nl(1);
            nameNode = this.get('name');
            
            if (nameNode.isNode() === false) {
                nameNode = this.ancestor(null, 'expression|dec_def|proto_body_item');
                if (nameNode !== null) {
                    if (nameNode.value === 'proto_body_item') {
                        this.name = nameNode.get('key').toSourceNode();
                        
                    } else if (nameNode.value === 'expression') {
                        children = nameNode.children;
                        
                        found = -1;
                        
                        for (id = 0; id < children.length;id++) {
                            if (children[id].key === 'assignment_op') {
                                found = id - 1;
                                break;
                                
                            }
                            
                        }
                        if (found !== -1 && children[found].value === 'access_operation_member') {
                            this.name = children[found].csn(children[found].get('item').value);
                            
                        }
                        
                    }
                    
                }
                
            } else {
                this.name = nameNode.toSourceNode();
                
            }
            result = this.csn();
            
            result.add('function');
            generator = this.get('generator');
            
            if (generator.isNode()) {
                result.add(generator.csn(generator.value));
                
            }
            if (this.name !== null) {
                result.add([ ' ', this.name ]);
                
            }
            result.add('(');
            result.add(this.get('param_list').toSourceNode());
            result.add(') {' + this.nl());
            for (id in this.defaultArgs) {
                result.add([ this.defaultArgs[id], ';' + this.nl() ]);
                
            }
            result.add([ this.get('body').toSourceNode(), this.nl(-1) + '}' ]);
            return result;
            
            
        };
        
        return FunctionLiteral;
    })(CaptureNode);
    
    GeneratorLiteral = FunctionLiteral;
    
    FunctionStatement = FunctionLiteral;
    
    GeneratorStatement = FunctionLiteral;
    
    FunctionParamList = (function(___parent) {
        function FunctionParamList() {
            ___parent.apply(this, arguments);
        }
        
        FunctionParamList.prototype = Object.create(___parent.prototype);
        FunctionParamList.prototype.constructor = FunctionParamList;
        
        FunctionParamList.prototype.toSourceNode = function toSourceNode() {
            var name, defaultArg, valueNode, result, functionNode;
            
            result = this.csn();
            
            functionNode = this.ancestor('function');
            
            this.eachKey('item', function(node) {
                name = node.get('name').toSourceNode();
                result.add(name);
                valueNode = node.get('value');
                if (valueNode.isNode()) {
                    defaultArg = new SourceNode();
                    defaultArg.add([
                        name,
                        ' = (',
                        name,
                        ' !== undefined ? ',
                        name,
                        ' : (',
                        valueNode.toSourceNode(),
                        '))'
                        
                    ]);
                    functionNode.defaultArgs.push(defaultArg);
                    
                }
                
            });
            return result.join(', ');
            
            
        };
        
        return FunctionParamList;
    })(CaptureNode);
    
    BaseLiteral = (function(___parent) {
        function BaseLiteral() {
            ___parent.apply(this, arguments);
        }
        
        BaseLiteral.prototype = Object.create(___parent.prototype);
        BaseLiteral.prototype.constructor = BaseLiteral;
        
        BaseLiteral.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = '';
            
            this.each(function(child) {
                switch (child.key) {
                    case 'numeric':
                        
                    case 'string':
                        
                    case 'regexp':
                        
                    case 'ident':
                        
                    case 'brace':
                        result += this.csn(child.value);
                        break;
                        
                    default:
                        result += child.toSourceNode();
                        
                    
                }
                
            });
            return result;
            
            
        };
        
        return BaseLiteral;
    })(CaptureNode);
    
    DoWhileStatement = (function(___parent) {
        function DoWhileStatement() {
            ___parent.apply(this, arguments);
        }
        
        DoWhileStatement.prototype = Object.create(___parent.prototype);
        DoWhileStatement.prototype.constructor = DoWhileStatement;
        
        DoWhileStatement.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            
            result.add('do {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            result.add([ ' while (', this.get('condition').toSourceNode(), ');' ]);
            return result;
            
            
        };
        
        return DoWhileStatement;
    })(CaptureNode);
    
    WhileStatement = (function(___parent) {
        function WhileStatement() {
            ___parent.apply(this, arguments);
        }
        
        WhileStatement.prototype = Object.create(___parent.prototype);
        WhileStatement.prototype.constructor = WhileStatement;
        
        WhileStatement.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            
            result.add([
                'while (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
                
            ]);
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            return result;
            
            
        };
        
        return WhileStatement;
    })(CaptureNode);
    
    IfStatement = (function(___parent) {
        function IfStatement() {
            ___parent.apply(this, arguments);
        }
        
        IfStatement.prototype = Object.create(___parent.prototype);
        IfStatement.prototype.constructor = IfStatement;
        
        IfStatement.prototype.toSourceNode = function toSourceNode() {
            var result, elseIf, elseBody;
            result = this.csn();
            
            result.add([
                'if (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
                
            ]);
            result.add([ this.get('if_body').toSourceNode(), this.nl(-1) + '}' ]);
            elseIf = this.get('else_if');
            
            if (elseIf.isNode()) {
                result.add([ ' else ', elseIf.toSourceNode() ]);
                
            } else {
                elseBody = this.get('else_body');
                
                if (elseBody.isNode()) {
                    result.add([
                        ' else {' + this.nl(1),
                        elseBody.toSourceNode(),
                        this.nl(-1) + '}'
                        
                    ]);
                    
                }
                
            }
            return result;
            
            
        };
        
        return IfStatement;
    })(CaptureNode);
    
    SwitchStatement = (function(___parent) {
        function SwitchStatement() {
            ___parent.apply(this, arguments);
        }
        
        SwitchStatement.prototype = Object.create(___parent.prototype);
        SwitchStatement.prototype.constructor = SwitchStatement;
        
        SwitchStatement.prototype.toSourceNode = function toSourceNode() {
            var result, defaultNode;
            result = this.csn();
            
            result.add([ 'switch (', this.get('value').toSourceNode(), ') {', this.nl(1) ]);
            this.eachKey('case', function(caseNode) {
                result.add([ 'case ', caseNode.get('match').toSourceNode(), ':' + this.nl(1) ]);
                result.add(caseNode.get('body').toSourceNode());
                result.add(this.nl(-1));
                
            });
            defaultNode = this.get('default');
            
            if (defaultNode.isNode()) {
                result.add('default:' + this.nl(1));
                result.add(defaultNode.get('body').toSourceNode());
                result.add(this.nl(-1));
                
            }
            result.add(this.nl(-1) + '}');
            return result;
            
            
        };
        
        return SwitchStatement;
    })(CaptureNode);
    
    ForCountStatement = (function(___parent) {
        function ForCountStatement() {
            ___parent.apply(this, arguments);
        }
        
        ForCountStatement.prototype = Object.create(___parent.prototype);
        ForCountStatement.prototype.constructor = ForCountStatement;
        
        ForCountStatement.prototype.toSourceNode = function toSourceNode() {
            var initNode, init, varDefs, test, condOp, result;
            initNode = this.get('init');
            
            
            if (initNode.value === 'var_def') {
                varDefs = this.csn();
                
                initNode.eachKey('item', function(node) {
                    var valueNode, nameNode, varDef;
                    valueNode = node.get('value');
                    
                    nameNode = node.get('name');
                    
                    if (valueNode.isNode()) {
                        varDef = new SourceNode();
                        
                        varDef.add([ nameNode.toSourceNode(), ' = ', valueNode.toSourceNode() ]);
                        varDefs.add(varDef);
                        
                    } else {
                        varDefs.add(nameNode.toSourceNode);
                        
                    }
                    
                });
                init = new SourceNode();
                init.add([ 'var ', varDefs.join(', ') ]);
                
            } else {
                init = initNode.toSourceNode();
                
            }
            test = this.get('test').toSourceNode();
            
            condOp = this.get('cond_op').toSourceNode();
            
            result = this.csn();
            
            result.add([ 'for (', init, '; ', test, ';', condOp, ') {' + this.nl(1) ]);
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            return result;
            
            
        };
        
        return ForCountStatement;
    })(CaptureNode);
    
    ForInStatement = (function(___parent) {
        function ForInStatement() {
            ___parent.apply(this, arguments);
        }
        
        ForInStatement.prototype = Object.create(___parent.prototype);
        ForInStatement.prototype.constructor = ForInStatement;
        
        ForInStatement.prototype.toSourceNode = function toSourceNode() {
            var keyNode, valueNode, locals, source, key, result;
            keyNode = this.get('key');
            
            valueNode = this.get('value');
            
            if (this.get('var').isNode()) {
                locals = this.ancestor(null, 'yielding_scope|scope|module').locals;
                
                locals.add(keyNode.value);
                if (valueNode.isNode()) {
                    locals.add(valueNode.value);
                    
                }
                
            }
            source = this.get('source').toSourceNode();
            
            key = keyNode.toSourceNode();
            
            result = this.csn();
            
            result.add('for (');
            result.add(key);
            result.add(' in ');
            result.add(source);
            result.add(') {' + this.nl(1));
            if (valueNode.isNode()) {
                result.add([ valueNode.toSourceNode(), ' = ', source, '[', key, '];', this.nl() ]);
                
            }
            result.add([ this.get('body').toSourceNode(), this.nl(-1), '}' ]);
            return result;
            
            
        };
        
        return ForInStatement;
    })(CaptureNode);
    
    ObjectLiteral = (function(___parent) {
        function ObjectLiteral() {
            ___parent.apply(this, arguments);
        }
        
        ObjectLiteral.prototype = Object.create(___parent.prototype);
        ObjectLiteral.prototype.constructor = ObjectLiteral;
        
        ObjectLiteral.prototype.toSourceNode = function toSourceNode() {
            var items, result;
            items = new SourceNode();
            
            this.nl(1);
            this.each(function(child) {
                var item;
                item = new SourceNode();
                
                item.add(child.get('key').csn(child.get('key').value));
                item.add(': ');
                item.add(child.get('value').toSourceNode());
                items.add(item);
                
            });
            result = this.csn();
            
            if (items.toString().length >= 60) {
                result.add('{' + this.nl());
                result.add(items.join(',' + this.nl()));
                result.add(this.nl() + this.nl(-1) + '}');
                
            } else {
                this.nl(-1);
                result.add('{ ');
                result.add(items.join(', '));
                result.add(' }');
                
            }
            return result;
            
            
        };
        
        return ObjectLiteral;
    })(CaptureNode);
    
    ProtoBodyProperty = ObjectLiteral;
    
    ArrayLiteral = (function(___parent) {
        function ArrayLiteral() {
            ___parent.apply(this, arguments);
        }
        
        ArrayLiteral.prototype = Object.create(___parent.prototype);
        ArrayLiteral.prototype.constructor = ArrayLiteral;
        
        ArrayLiteral.prototype.toSourceNode = function toSourceNode() {
            var items, result;
            items = new SourceNode();
            
            this.nl(1);
            this.each(function(child) {
                items.add(child.toSourceNode());
                
            });
            result = this.csn();
            
            if (items.toString().length >= 60) {
                result.add('[' + this.nl());
                result.add(items.join(',' + this.nl()));
                result.add(this.nl() + this.nl(-1) + ']');
                
            } else {
                this.nl(-1);
                result.add('[ ');
                result.add(items.join(', '));
                result.add(' ]');
                
            }
            return result;
            
            
        };
        
        return ArrayLiteral;
    })(CaptureNode);
    
    Expression = (function(___parent) {
        function Expression() {
            ___parent.apply(this, arguments);
        }
        
        Expression.prototype = Object.create(___parent.prototype);
        Expression.prototype.constructor = Expression;
        
        Expression.prototype.toSourceNode = function toSourceNode() {
            var children, child, propertyAssignSplit, result, id;
            children = this.children;
            
            
            propertyAssignSplit = -1;
            
            result = this.csn();
            
            for (id in children) {
                child = children[id];
                if (children[+id + 1] !== undefined && children[+id + 1].key === 'passignment_op') {
                    propertyAssignSplit = +id + 1;
                    break;
                    
                }
                switch (child.key) {
                    case 'member':
                        result.add(child.csn('.' + child.children[0].value));
                        break;
                        
                    case 'index':
                        result.add(child.csn('['));
                        result.add(child.toSourceNode());
                        result.add(child.csn(']'));
                        break;
                        
                    case 'proto':
                        result.add(child.csn('.prototype.' + child.children[0].value));
                        break;
                        
                    case 'call':
                        
                    case 'pcall':
                        result.add(child.csn(child.toSourceNode()));
                        break;
                        
                    case 'ident':
                        
                    case 'brace_op':
                        
                    case 'xfix_op':
                        result.add(child.csn(child.value));
                        break;
                        
                    case 'unary_op':
                        result.add(child.csn(child.value.search(/[a-z]/) > -1 ? child.value + ' ' : child.value));
                        break;
                        
                    case 'binary_op':
                        
                    case 'assignment_op':
                        
                    case 'ternary_op':
                        result.add([ ' ', child.csn(child.value), ' ' ]);
                        break;
                        
                    default:
                        result.add(child.toSourceNode());
                        break;
                        
                    
                }
                
            }
            if (propertyAssignSplit > -1) {
                result.prepend('Object.defineProperty(');
                child = children[propertyAssignSplit - 1];
                switch (child.key) {
                    case 'member':
                        result.add(", '" + child.children[0].value + "',");
                        break;
                        
                    case 'index':
                        result.add(', ');
                        result.add(child.toSourceNode());
                        result.add(', ');
                        break;
                        
                    case 'proto':
                        result.add(".prototype, '" + child.children[0].value + "', ");
                        break;
                        
                    
                }
                if (children[propertyAssignSplit].value === ':=') {
                    result.add('{' + this.nl(1) + 'value: ');
                    result.add(children[propertyAssignSplit + 1].toSourceNode());
                    result.add(',' + this.nl() + 'writable: false' + this.nl(-1) + '})');
                    
                } else {
                    result.add(children[propertyAssignSplit + 1].toSourceNode());
                    result.add(')');
                    
                }
                
            }
            return result;
            
            
        };
        
        return Expression;
    })(CaptureNode);
    
    ProtoLiteral = (function(___parent) {
        function ProtoLiteral(key, value) {
            this.constructorArgs = [  ];
            this.constructorDefaults = [  ];
            CaptureNode.prototype.constructor.call(this, key, value);
            
        }
        
        ProtoLiteral.prototype = Object.create(___parent.prototype);
        ProtoLiteral.prototype.constructor = ProtoLiteral;
        
        ProtoLiteral.prototype.constructorArgs = null;
        ProtoLiteral.prototype.constructorBody = null;
        ProtoLiteral.prototype.constructorDefaults = null;
        ProtoLiteral.prototype.name = '';
        ProtoLiteral.prototype.toSourceNode = function toSourceNode() {
            var nameNode, parentNode, haveParent, assignTo, locals, result, body, id;
            nameNode = this.get('name');
            
            if (nameNode.isNode() === false) {
                this.name = this.ancestor(null, 'dec_def|module_statement|export_statement').get('name').value;
                
            } else {
                this.name = nameNode.value;
                
            }
            parentNode = this.get('parent');
            
            haveParent = parentNode.isNode();
            
            assignTo = '';
            
            if (this.value === 'proto_statement') {
                locals = this.ancestor(null, 'yielding_scope|scope|module').locals;
                
                locals.add(this.name);
                assignTo = this.name + ' = ';
                
            }
            result = this.csn(assignTo + '(function(' + (haveParent ? '___parent' : '') + ') {' + this.nl(1));
            
            body = this.get('body').toSourceNode();
            
            if (this.constructorBody !== null) {
                result.add('function ' + this.name + '(');
                result.add(this.constructorArgs);
                result.add(') {' + this.nl(1));
                for (id in this.constructorDefaults) {
                    result.add(this.constructorDefaults[id]);
                    result.add(';' + this.nl());
                    
                }
                result.add(this.constructorBody);
                result.add(this.nl(-1) + '}' + this.nl() + this.nl());
                
            } else {
                result.add('function ' + this.name + '() {');
                if (haveParent) {
                    result.add(this.nl(1) + '___parent.apply(this, arguments);' + this.nl(-1));
                    
                }
                result.add('}' + this.nl() + this.nl());
                
            }
            if (haveParent) {
                result.add(this.name + '.prototype = Object.create(___parent.prototype);' + this.nl());
                result.add(this.name + '.prototype.constructor = ' + this.name + ';' + this.nl() + this.nl());
                
            }
            result.add(body);
            result.add(this.nl() + 'return ' + this.name + ';' + this.nl(-1));
            result.add('})(');
            result.add(parentNode.toSourceNode());
            result.add(')');
            return result;
            
            
        };
        
        return ProtoLiteral;
    })(CaptureNode);
    
    ProtoStatement = ProtoLiteral;
    
    ProtoBodyItem = (function(___parent) {
        function ProtoBodyItem() {
            ___parent.apply(this, arguments);
        }
        
        ProtoBodyItem.prototype = Object.create(___parent.prototype);
        ProtoBodyItem.prototype.constructor = ProtoBodyItem;
        
        ProtoBodyItem.prototype.toSourceNode = function toSourceNode() {
            var protoNode, constructorName, keyNode, functioNode, valueNode, result, name;
            protoNode = this.ancestor(null, 'proto_literal|proto_statement');
            
            constructorName = protoNode.name;
            
            keyNode = this.get('key');
            
            if (keyNode.value === 'constructor') {
                functioNode = this.path('value.function');
                
                this.nl(1);
                protoNode.constructorArgs = functioNode.get('param_list').toSourceNode();
                protoNode.constructorDefaults = functioNode.defaultArgs;
                protoNode.constructorBody = functioNode.get('body').toSourceNode();
                this.nl(-1);
                return this.csn();
                
                
            } else {
                valueNode = this.get('value');
                
                
                if (valueNode.value === 'proto_body_property') {
                    name = (keyNode.value === 'string' ? keyNode.value : '"' + keyNode.value + '"');
                    
                    result = this.csn('Object.defineProperty(' + constructorName + '.prototype, ' + name + ', ');
                    result.add(valueNode.toSourceNode());
                    result.add(');' + this.nl());
                    return result;
                    
                    
                } else {
                    name = (keyNode.value === 'string' ? '[' + keyNode.value + ']' : '.' + keyNode.value);
                    
                    result = this.csn(constructorName + '.prototype' + name + ' = ');
                    result.add(valueNode.toSourceNode());
                    result.add(';' + this.nl());
                    return result;
                    
                    
                }
                
            }
            
        };
        
        return ProtoBodyItem;
    })(CaptureNode);
    
    ReturnStatement = (function(___parent) {
        function ReturnStatement() {
            ___parent.apply(this, arguments);
        }
        
        ReturnStatement.prototype = Object.create(___parent.prototype);
        ReturnStatement.prototype.constructor = ReturnStatement;
        
        ReturnStatement.prototype.toSourceNode = function toSourceNode() {
            var result, type;
            result = this.csn();
            
            type = this.get('type');
            
            result.add([ type.csn(type.value), ' ' ]);
            result.add(this.get('value').toSourceNode());
            result.add(';' + this.nl());
            return result;
            
            
        };
        
        return ReturnStatement;
    })(CaptureNode);
    
    YieldStatement = ReturnStatement;
    
    catchSpecificsId = 1;
    
    CatchSpecifics = (function(___parent) {
        function CatchSpecifics() {
            ___parent.apply(this, arguments);
        }
        
        CatchSpecifics.prototype = Object.create(___parent.prototype);
        CatchSpecifics.prototype.constructor = CatchSpecifics;
        
        CatchSpecifics.prototype.toSourceNode = function toSourceNode() {
            var name, result, allNode;
            name = '___exc' + (catchSpecificsId++);
            
            result = this.csn();
            
            result.add(' catch (' + name + ') {' + this.nl(1));
            this.eachKey('specific', function(node, first, last) {
                if (first !== true) {
                    result.add(' else ');
                    
                }
                result.add('if (' + name + ' instanceof ');
                result.add(node.get('type').toSourceNode());
                result.add(') {' + this.nl(1));
                result.add('var ' + node.get('value').value + ' = ' + name + ';' + this.nl());
                result.add(node.get('body').toSourceNode());
                result.add(this.nl(-1) + '}');
                
            });
            allNode = this.get('catch');
            
            if (allNode.isNode()) {
                result += ' else { ' + this.nl(1);
                result += 'var ' + allNode.get('value').value + ' = ' + name + ';' + this.nl();
                result += allNode.get('body').toString();
                result += this.nl(-1) + '}';
                
            } else {
                result += ' else { ' + this.nl(1);
                result += 'throw ' + name + ';' + this.nl();
                result += this.nl(-1) + '}';
                
            }
            result += this.nl(-1) + '}';
            return result;
            
            
        };
        
        return CatchSpecifics;
    })(CaptureNode);
    
    CatchAll = (function(___parent) {
        function CatchAll() {
            ___parent.apply(this, arguments);
        }
        
        CatchAll.prototype = Object.create(___parent.prototype);
        CatchAll.prototype.constructor = CatchAll;
        
        CatchAll.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            
            result.add(' catch (');
            result.add(this.get('value').toSourceNode());
            result.add(') {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            return result;
            
            
        };
        
        return CatchAll;
    })(CaptureNode);
    
    TryCatchFinallyStatement = (function(___parent) {
        function TryCatchFinallyStatement() {
            ___parent.apply(this, arguments);
        }
        
        TryCatchFinallyStatement.prototype = Object.create(___parent.prototype);
        TryCatchFinallyStatement.prototype.constructor = TryCatchFinallyStatement;
        
        TryCatchFinallyStatement.prototype.toSourceNode = function toSourceNode() {
            var result, allNode, finallyNode;
            result = this.csn();
            
            result.add('try {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            allNode = this.get('all');
            
            if (allNode.isNode()) {
                result.add(allNode.toSourceNode());
                
            } else {
                result.add(this.get('specifics').toSourceNode());
                
            }
            finallyNode = this.get('finally');
            
            if (finallyNode.isNode()) {
                result.add('finally {' + this.nl(1));
                result.add(finallyNode.toSourceNode());
                result.add(this.nl(-1) + '}');
                
            }
            return result;
            
            
        };
        
        return TryCatchFinallyStatement;
    })(CaptureNode);
    
    ThrowStatement = (function(___parent) {
        function ThrowStatement() {
            ___parent.apply(this, arguments);
        }
        
        ThrowStatement.prototype = Object.create(___parent.prototype);
        ThrowStatement.prototype.constructor = ThrowStatement;
        
        ThrowStatement.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn('throw ');
            
            result.add(this.get('exception').toSourceNode());
            result.add(';' + this.nl());
            return result;
            
            
        };
        
        return ThrowStatement;
    })(CaptureNode);
    
    AssertStatement = (function(___parent) {
        function AssertStatement() {
            ___parent.apply(this, arguments);
        }
        
        AssertStatement.prototype = Object.create(___parent.prototype);
        AssertStatement.prototype.constructor = AssertStatement;
        
        AssertStatement.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            
            if (this.parser().transform.options.assert) {
                result.add('assert(');
                result.add(CaptureNode.prototype.toSourceNode.call(this));
                result.add(');' + this.nl());
                
            }
            return result;
            
            
        };
        
        return AssertStatement;
    })(CaptureNode);
    
    Statement = (function(___parent) {
        function Statement() {
            ___parent.apply(this, arguments);
        }
        
        Statement.prototype = Object.create(___parent.prototype);
        Statement.prototype.constructor = Statement;
        
        Statement.prototype.toSourceNode = function toSourceNode() {
            var type, result;
            type = this.children[0].key;
            
            result = this.csn();
            
            result.add(CaptureNode.prototype.toSourceNode.call(this));
            switch (type) {
                case 'expression':
                    result.add(';' + this.nl());
                    break;
                    
                default:
                    result.add(this.nl());
                    
                
            }
            return result;
            
            
        };
        
        return Statement;
    })(CaptureNode);
    
    InterruptibleStatement = Statement;
    
    RequireLiteral = (function(___parent) {
        function RequireLiteral() {
            ___parent.apply(this, arguments);
        }
        
        RequireLiteral.prototype = Object.create(___parent.prototype);
        RequireLiteral.prototype.constructor = RequireLiteral;
        
        RequireLiteral.prototype.toSourceNode = function toSourceNode() {
            var parser, options, fileNode, moduleName, result, currentDir, absName, relName;
            parser = this.parser();
            
            options = parser.transform.options;
            
            fileNode = this.get('file');
            
            moduleName = fileNode.toSourceNode().toString().slice(1, -1);
            
            result = this.csn();
            
            if (options.platform === 'node') {
                if (moduleName.slice(0, 2) === './' || moduleName.slice(0, 3) === '../') {
                    currentDir = path.dirname(parser.file);
                    
                    absName = currentDir + '/' + moduleName;
                    
                    relName = path.relative(options.basePath, absName);
                    
                    parser.resultData.requires.add(relName);
                    result.add('__require(');
                    result.add(fileNode.csn("'" + relName + "'"));
                    result.add(')');
                    return result;
                    
                    
                }
                
            } else {
                parser.resultData.requires.add(moduleName);
                
            }
            result.add('require(');
            result.add(fileNode.toSourceNode());
            result.add(')');
            return result;
            
            
        };
        
        return RequireLiteral;
    })(CaptureNode);
    
    ModuleStatement = (function(___parent) {
        function ModuleStatement() {
            ___parent.apply(this, arguments);
        }
        
        ModuleStatement.prototype = Object.create(___parent.prototype);
        ModuleStatement.prototype.constructor = ModuleStatement;
        
        ModuleStatement.prototype.toSourceNode = function toSourceNode() {
            var name, moduleNode, result;
            name = this.get('name').value;
            
            moduleNode = this.ancestor(null, 'module');
            
            moduleNode.moduleExport = name;
            moduleNode.locals.add(name);
            result = this.csn();
            
            result.add(name);
            result.add(' = ');
            result.add(this.get('value').toSourceNode());
            result.add(';' + this.nl());
            return result;
            
            
        };
        
        return ModuleStatement;
    })(CaptureNode);
    
    ExportStatement = (function(___parent) {
        function ExportStatement() {
            ___parent.apply(this, arguments);
        }
        
        ExportStatement.prototype = Object.create(___parent.prototype);
        ExportStatement.prototype.constructor = ExportStatement;
        
        ExportStatement.prototype.toSourceNode = function toSourceNode() {
            var name, moduleNode, result;
            name = this.get('name').value;
            
            moduleNode = this.ancestor(null, 'module');
            
            moduleNode.exports.add(name);
            moduleNode.locals.add(name);
            result = this.csn();
            
            result.add(name);
            result.add(' = ');
            result.add(this.get('value').toSourceNode());
            result.add(';' + this.nl());
            return result;
            
            
        };
        
        return ExportStatement;
    })(CaptureNode);
    
    GlobalDef = (function(___parent) {
        function GlobalDef() {
            ___parent.apply(this, arguments);
        }
        
        GlobalDef.prototype = Object.create(___parent.prototype);
        GlobalDef.prototype.constructor = GlobalDef;
        
        GlobalDef.prototype.toSourceNode = function toSourceNode() {
            var valueNode, nameNode, globals, result, nl;
            
            globals = this.parser().resultData.globals;
            
            result = this.csn();
            
            nl = this.nl();
            
            this.eachKey('item', function(node) {
                nameNode = node.get('name');
                valueNode = node.get('value');
                globals.add(nameNode.value);
                if (valueNode.isNode()) {
                    result.add(nameNode.value + ' = ');
                    result.add(valueNode.toSourceNode());
                    result.add(';' + nl);
                    
                }
                
            });
            return result;
            
            
        };
        
        return GlobalDef;
    })(CaptureNode);
    
    Ident = (function(___parent) {
        function Ident() {
            ___parent.apply(this, arguments);
        }
        
        Ident.prototype = Object.create(___parent.prototype);
        Ident.prototype.constructor = Ident;
        
        Ident.prototype.toSourceNode = function toSourceNode() {
            return this.csn(this.value);
            
            
        };
        
        return Ident;
    })(CaptureNode);
    
    Name = Ident;
    
    VarDef = (function(___parent) {
        function VarDef() {
            ___parent.apply(this, arguments);
        }
        
        VarDef.prototype = Object.create(___parent.prototype);
        VarDef.prototype.constructor = VarDef;
        
        VarDef.prototype.toSourceNode = function toSourceNode() {
            var valueNode, nameNode, locals, result, nl;
            
            locals = this.ancestor(null, 'yielding_scope|scope|module').locals;
            
            result = this.csn();
            
            nl = this.nl();
            
            this.eachKey('item', function(node) {
                nameNode = node.get('name');
                valueNode = node.get('value');
                locals.add(nameNode.value);
                if (valueNode.isNode()) {
                    result.add(nameNode.value + ' = ');
                    result.add(valueNode.toSourceNode());
                    result.add(';' + nl);
                    
                }
                
            });
            return result;
            
            
        };
        
        return VarDef;
    })(CaptureNode);
    
    module.exports.AccessOperationProtocall = AccessOperationProtocall;
    module.exports.ConstLiteral = ConstLiteral;
    module.exports.Scope = Scope;
    module.exports.YieldingScope = YieldingScope;
    module.exports.Module = Module;
    module.exports.InvokeOperation = InvokeOperation;
    module.exports.FunctionLiteral = FunctionLiteral;
    module.exports.GeneratorLiteral = GeneratorLiteral;
    module.exports.FunctionStatement = FunctionStatement;
    module.exports.GeneratorStatement = GeneratorStatement;
    module.exports.FunctionParamList = FunctionParamList;
    module.exports.BaseLiteral = BaseLiteral;
    module.exports.DoWhileStatement = DoWhileStatement;
    module.exports.WhileStatement = WhileStatement;
    module.exports.IfStatement = IfStatement;
    module.exports.SwitchStatement = SwitchStatement;
    module.exports.ForCountStatement = ForCountStatement;
    module.exports.ForInStatement = ForInStatement;
    module.exports.ObjectLiteral = ObjectLiteral;
    module.exports.ProtoBodyProperty = ProtoBodyProperty;
    module.exports.ArrayLiteral = ArrayLiteral;
    module.exports.Expression = Expression;
    module.exports.ProtoLiteral = ProtoLiteral;
    module.exports.ProtoStatement = ProtoStatement;
    module.exports.ProtoBodyItem = ProtoBodyItem;
    module.exports.ReturnStatement = ReturnStatement;
    module.exports.YieldStatement = YieldStatement;
    module.exports.CatchSpecifics = CatchSpecifics;
    module.exports.CatchAll = CatchAll;
    module.exports.TryCatchFinallyStatement = TryCatchFinallyStatement;
    module.exports.ThrowStatement = ThrowStatement;
    module.exports.AssertStatement = AssertStatement;
    module.exports.Statement = Statement;
    module.exports.InterruptibleStatement = InterruptibleStatement;
    module.exports.RequireLiteral = RequireLiteral;
    module.exports.ModuleStatement = ModuleStatement;
    module.exports.ExportStatement = ExportStatement;
    module.exports.GlobalDef = GlobalDef;
    module.exports.Ident = Ident;
    module.exports.Name = Name;
    module.exports.VarDef = VarDef;
    
});
module("src/extensions/adria_parser", function(module) {
    var exports = module.exports;
    var fs, util, LanguageParser, AdriaNode, Tokenizer, AdriaParser;
    fs = require('fs');
    
    util = __require('src/util');
    
    LanguageParser = __require('src/language_parser');
    
    AdriaNode = __require('src/extensions/adria_node');
    
    Tokenizer = __require('src/tokenizer');
    
    AdriaParser = (function(___parent) {
        function AdriaParser(transform) {
            LanguageParser.prototype.constructor.call(this, transform);
            this.resultData = { globals: new util.Set(), requires: new util.Set() };
            
        }
        
        AdriaParser.prototype = Object.create(___parent.prototype);
        AdriaParser.prototype.constructor = AdriaParser;
        
        AdriaParser.prototype.moduleName = '';
        AdriaParser.prototype.indent = 0;
        AdriaParser.prototype.trainSelf = function trainSelf() {
            var keywords, matchKeywords;
            keywords = new util.Set([
                'var',
                'global',
                'if',
                'else',
                'for',
                'in',
                'do',
                'while',
                'throw',
                'try',
                'catch',
                'finally',
                'function',
                'proto',
                'property',
                'switch',
                'case',
                'require',
                'assert',
                'delete',
                'new',
                'instanceof',
                'typeof'
                
            ]);
            
            matchKeywords = function(match) {
                if (keywords.has(match.data)) {
                    match.name = 'KEYWORD';
                    
                }
                return match;
                
                
            };
            
            this.tokenizer = new Tokenizer([
                Tokenizer.prefab.delimited(null, '/*', '*/'),
                Tokenizer.prefab.regex(null, /^\/\/.*/),
                Tokenizer.prefab.breaker(),
                Tokenizer.prefab.regex('REGEXP', /^\/([^\/]*?(?:[^\n\\]|\\\\)+?)+?\/[a-z]*/),
                Tokenizer.prefab.set('DELIM', [ ';', '.', ',', '(', ')', '[', ']', '{', '}', '!==', '!=', '!', '++', '--' ]),
                Tokenizer.prefab.group('DELIM', [ '=', '&', '|', '<', '>', ':', '?', '+', '-', '*', '/', '%' ]),
                Tokenizer.prefab.regex('IDENT', /^[a-zA-Z_\$][a-zA-Z0-9_\$]*/, matchKeywords),
                Tokenizer.prefab.number('NUMERIC'),
                Tokenizer.prefab.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/)
                
            ], [ 'KEYWORD' ]);
            util.log('AdriaParser', 'trainer processing adria .sdt-files', 2);
            this.loadDefinition('definition/adria/control.sdt');
            this.loadDefinition('definition/adria/expression.sdt');
            this.loadDefinition('definition/adria/literal.sdt');
            this.loadDefinition('definition/adria/proto.sdt');
            this.loadDefinition('definition/adria/root.sdt');
            this.loadDefinition('definition/adria/statement.sdt');
            util.log('AdriaParser', 'being trained', -2);
            LanguageParser.prototype.trainSelf.call(this);
            util.log('AdriaParser', 'done');
            
        };
        AdriaParser.prototype.mapType = function mapType(captureName, blockName) {
            var typeName;
            typeName = blockName.snakeToCamel(true);
            
            if (typeof AdriaNode[typeName] === 'function') {
                return AdriaNode[typeName];
                
                
            }
            return LanguageParser.prototype.mapType.call(this, captureName, blockName);
            
            
        };
        AdriaParser.prototype.createNode = function createNode(name, capture, label, condition) {
            var node;
            node = LanguageParser.prototype.createNode.call(this, name, capture, label, condition);
            
            if (name === 'ident') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT;
                node.description = 'identifier';
                
            } else if (name === 'name') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT | this.tokenizer.Type.KEYWORD;
                node.description = 'name';
                
            } else if (name === 'regexp') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.REGEXP;
                node.description = 'regexp';
                
            }
            return node;
            
            
        };
        AdriaParser.prototype.loadSourceFromCache = function loadSourceFromCache(resource) {
            LanguageParser.prototype.loadSourceFromCache.call(this, resource);
            if (this.cacheData !== null && this.transform.options.nomap !== true) {
                this.sourceCode = fs.readFileSync(resource, 'UTF-8').replace('\r\n', '\n');
                
            }
            
        };
        
        return AdriaParser;
    })(LanguageParser);
    
    module.exports = AdriaParser;
    
});
module("src/extensions/adria_transform", function(module) {
    var exports = module.exports;
    var fs, path, SourceNode, Template, Transform, AdriaParser, util, AdriaTransform;
    fs = require('fs');
    
    path = require('path');
    
    SourceNode = require('source-map').SourceNode;
    
    Template = __require('src/template');
    
    Transform = __require('src/transform');
    
    AdriaParser = __require('src/extensions/adria_parser');
    
    util = __require('src/util');
    
    AdriaTransform = (function(___parent) {
        function AdriaTransform(piped) {
            var options;
            Transform.prototype.constructor.call(this, piped);
            this.globals = new util.Set();
            this.requires = new util.Set();
            this.requiresDone = new util.Set();
            this.modules = [  ];
            this.sourceCode = {  };
            options = this.options;
            
            options.nolink = (options.nolink === undefined ? false : options.nolink);
            options.nomap = (options.nomap === undefined ? false : options.nomap);
            options.fileExt = (options.fileExt === undefined ? '.adria' : options.fileExt);
            options.platform = (options.platform === undefined ? 'web' : options.platform);
            options['tweak-exports'] = (options['tweak-exports'] === undefined ? false : options['tweak-exports']);
            options['tweak-nostrict'] = (options['tweak-nostrict'] === undefined ? false : options['tweak-nostrict']);
            
        }
        
        AdriaTransform.prototype = Object.create(___parent.prototype);
        AdriaTransform.prototype.constructor = AdriaTransform;
        
        AdriaTransform.prototype.globals = null;
        AdriaTransform.prototype.requires = null;
        AdriaTransform.prototype.requiresDone = null;
        AdriaTransform.prototype.modules = null;
        AdriaTransform.prototype.sourceCode = null;
        AdriaTransform.prototype.protoParser = null;
        AdriaTransform.prototype.initOptions = function initOptions() {
            Transform.prototype.initOptions.call(this, this);
            this.defineOptions({
                'file-extension': function(extension) {
                    this.fileExt = '.' + extension;
                    
                },
                'platform': function(platform) {
                    this.platform = platform;
                    
                }
                
            });
            
        };
        AdriaTransform.prototype.resolveModule = function resolveModule(moduleName) {
            var slash, baseName, filename, fullname, current, paths, id;
            slash = moduleName.lastIndexOf('/');
            
            baseName = slash > 0 ? moduleName.slice(slash) : moduleName;
            
            filename = (baseName.indexOf('.') > -1 ? moduleName : moduleName + this.options.fileExt);
            
            fullname = this.options.basePath + filename;
            
            current = fullname;
            
            if (fs.existsSync(fullname) !== true) {
                paths = this.options.paths;
                
                for (id in paths) {
                    current = this.options.basePath + paths[id] + filename;
                    if (fs.existsSync(current)) {
                        fullname = current;
                        break;
                        
                    }
                    
                }
                
            }
            return path.normalize(fullname);
            
            
        };
        AdriaTransform.prototype.buildModule = function buildModule(moduleName, data) {
            var parser, result, requires, name;
            parser = this.protoParser.clone();
            
            parser.moduleName = moduleName;
            if (data === undefined) {
                parser.loadSource(this.resolveModule(moduleName));
                
            } else {
                parser.setSource(moduleName + this.options.fileExt, data);
                
            }
            result = parser.output();
            
            requires = parser.resultData.requires;
            
            this.requiresDone.add(moduleName);
            for (name in requires.data) {
                if (this.requiresDone.has(name) === false) {
                    this.buildModule(name);
                    
                }
                
            }
            this.requires = this.requires.merge(parser.resultData.requires);
            this.globals = this.globals.merge(parser.resultData.globals);
            this.modules.push({
                filename: parser.file,
                sourceCode: parser.sourceCode,
                result: result
                
            });
            
        };
        AdriaTransform.prototype.generateOutputTree = function generateOutputTree() {
            var node, tpl, fwNode, moduleNode, fw, id, module;
            node = new SourceNode(null, null);
            
            tpl = new Template();
            
            tpl.assign('globals', this.globals.toArray());
            tpl.assign('enableAssert', this.options.assert);
            
            fw = tpl.fetchFile('adria/framework.' + this.options.platform + '.tpl');
            
            node.add('(function() {\n');
            if (this.options['tweak-nostrict'] !== true) {
                node.add('"use strict";\n');
                
            }
            fwNode = node.add(new SourceNode(1, 0, 'adria-framework.js', fw));
            fwNode.setSourceContent('adria-framework.js', fw);
            for (id in this.modules) {
                module = this.modules[id];
                
                moduleNode = node.add(new SourceNode(null, null, module.filename, module.result));
                moduleNode.setSourceContent(module.filename, module.sourceCode);
                
            }
            node.add('\n})();');
            return node;
            
            
        };
        AdriaTransform.prototype.run = function run() {
            var files, id, node, options, jsFile, mapFile, result, mapLink;
            this.protoParser = new AdriaParser(this);
            this.protoParser.trainSelf();
            if (this.piped !== undefined) {
                this.buildModule('main', this.piped);
                
            }
            files = this.options.files;
            
            for (id in files) {
                this.buildModule(files[id].stripPostfix(this.options.fileExt));
                
            }
            node = this.generateOutputTree();
            
            options = this.options;
            
            if (options.outFile !== null) {
                jsFile = options.basePath + options.outFile;
                
                mapFile = jsFile.stripPostfix('.js') + '.map';
                
                if (options.nomap !== true) {
                    result = node.toStringWithSourceMap({ file: options.outFile });
                    
                    mapLink = '\n//@ sourceMappingURL=' + path.relative(options.basePath, mapFile);
                    
                    fs.writeFileSync(jsFile, result.code + (options.nolink ? '' : mapLink));
                    fs.writeFileSync(mapFile, result.map);
                    
                } else {
                    fs.writeFileSync(jsFile, node.toString());
                    
                }
                
            } else {
                process.stdout.write(node.toString());
                
            }
            
        };
        
        return AdriaTransform;
    })(Transform);
    
    module.exports = AdriaTransform;
    
});
module("src/extensions/adriadebug_parser", function(module) {
    var exports = module.exports;
    var AdriaParser, CaptureNode, XMLNode, AdriaDebugParser;
    AdriaParser = __require('src/extensions/adria_parser');
    
    CaptureNode = __require('src/language_parser/capture_node');
    
    XMLNode = (function(___parent) {
        function XMLNode() {
            ___parent.apply(this, arguments);
        }
        
        XMLNode.prototype = Object.create(___parent.prototype);
        XMLNode.prototype.constructor = XMLNode;
        
        XMLNode.prototype.toString = function toString() {
            var indent, result, childId, node;
            indent = String.repeat(this.depth() * 4, ' ');
            
            result = "";
            
            for (childId in this.children) {
                node = this.children[childId];
                
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
        
        return XMLNode;
    })(CaptureNode);
    
    AdriaDebugParser = (function(___parent) {
        function AdriaDebugParser() {
            ___parent.apply(this, arguments);
        }
        
        AdriaDebugParser.prototype = Object.create(___parent.prototype);
        AdriaDebugParser.prototype.constructor = AdriaDebugParser;
        
        AdriaDebugParser.prototype.outputMethod = 'toString';
        AdriaDebugParser.prototype.mapType = function mapType(capture_name, block_name) {
            return XMLNode;
            
            
        };
        
        return AdriaDebugParser;
    })(AdriaParser);
    
    module.exports = AdriaDebugParser;
    
});
module("src/extensions/adriadebug_transform", function(module) {
    var exports = module.exports;
    var AdriaTransform, AdriaDebugParser, AdriaDebugTransform;
    AdriaTransform = __require('src/extensions/adria_transform');
    
    AdriaDebugParser = __require('src/extensions/adriadebug_parser');
    
    AdriaDebugTransform = (function(___parent) {
        function AdriaDebugTransform(piped) {
            AdriaTransform.prototype.constructor.call(this, piped);
            this.options.nocache = true;
            
        }
        
        AdriaDebugTransform.prototype = Object.create(___parent.prototype);
        AdriaDebugTransform.prototype.constructor = AdriaDebugTransform;
        
        AdriaDebugTransform.prototype.process = function process() {
            var files, id, result, mod;
            this.protoParser = new AdriaDebugParser(this);
            this.protoParser.trainSelf();
            if (this.piped !== undefined) {
                this.buildModule('main', this.piped);
                
            }
            files = this.options.files;
            
            for (id in files) {
                this.buildModule(files[id].stripPostfix(this.options.fileExt));
                
            }
            result = [  ];
            
            for (id in this.modules) {
                mod = this.modules[id];
                result.push(mod.result);
                
            }
            if (this.options['outFile'] !== null) {
                fs.writeFileSync(this.options['outFile'], result.join('\n'));
                
            } else {
                process.stdout.write(result.join('\n'));
                
            }
            
        };
        
        return AdriaDebugTransform;
    })(AdriaTransform);
    
    module.exports = AdriaDebugTransform;
    
});
module("main", function(module) {
    var exports = module.exports;
    var util, AdriaTransform, AdriaDebugTransform, target, piped, run, pipeData;
    __require('src/prototype');
    util = __require('src/util');
    
    AdriaTransform = __require('src/extensions/adria_transform');
    
    AdriaDebugTransform = __require('src/extensions/adriadebug_transform');
    
    target = 'adria';
    
    piped = false;
    
    util.processOptions(null, {
        'target': function(type) {
            target = type;
            
        },
        '_switch': function(param) {
            if (param === 'pipe') {
                piped = true;
                
            }
            
        }
        
    });
    run = function(pipeData) {
        var transform;
        
        if (target === 'adria') {
            transform = new AdriaTransform(pipeData);
            
        } else if (target === 'adriadebug') {
            transform = new AdriaDebugTransform(pipeData);
            
        } else {
            throw new Error('Unsupported target "' + target + '".');
            
            
        }
        transform.run();
        
    };
    
    if (piped) {
        pipeData = '';
        
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
    
});

})();
//@ sourceMappingURL=out.map