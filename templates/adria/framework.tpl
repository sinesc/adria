var application;
var <if platform == 'node'>__</if>require;
var resource;
var module;<if enableAssert>
var assert;</if><if globals.length != 0>
var <each global in globals><global><if ! each.last>, </if></each>;</if>
var Async;
(function() {
    var resources = { };
    var modules = { };
    var getResource = function(name) {<if enableAssert>
        if (resources[name] === undefined) {
            throw Error('missing resource ' + name);
        }
        </if>
        return resources[name];
    };
    var Module = function(name, func) {
        this.name = name;
        this.exports = { };
        func(this, getResource);
    };
    Module.prototype.exports = null;
    Module.prototype.name = '';
    module = function(name, func) {
        modules[name] = new Module(name, func);
    };
    resource = function(name, data) {
        resources[name] = data;
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
    <if platform == 'node'>__</if>require = function(file) {<if enableAssert>
        if (modules[file] === undefined) {
            throw Error('missing dependency ' + file);
        }
        </if>
        return modules[file].exports;
    }; <if enableAssert>
    assert = function(assertion, message) {
        if (assertion !== true) {
            throw new Error('assertion failed: ' + message);
        }
    };</if><rem><if enableAsync></rem>

    //!todo make builtin, requireable module?
    Async = function Async(generator) {
        this.generator = generator;
        this.boundCallback = this.callback.bind(this);
        this.next();
    }

    Async.wrap = function(func, context) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            return function(callback) {
                args.push(callback);
                func.apply(context, args);
            };
        };
    };

    Async.AsyncError = function AsyncError(message, fileName, lineNumber) {
        Error.call(this, message, fileName, lineNumber);
    };
    Async.AsyncError.prototype = Object.create(Error.prototype);
    Async.AsyncError.prototype.constructor = Async.AsyncError;

    Async.prototype.generator = null;
    Async.prototype.sync = 0;
    Async.prototype.result = undefined;
    Async.prototype.waiting = 0;

    Async.prototype.next = function() {
        var arg;

        while ((arg = this.generator.next(this.result)).done === false) {

            arg = arg.value;
            this.sync = 0;

            if (typeof arg === 'function') {
                arg(this.boundCallback);
            } else {
                this.waitAll(arg);
            }

            // check if the function returned before or after calling its callback (did it call the callback directly or did it defer)

            if (this.sync === 0) {
                this.sync = -1;
                break;
            }
        }
    };

    Async.prototype.waitAll = function(args) {
        var arg;

        if (args instanceof Array) {
            this.result = new Array(args.length);
        } else if (args instanceof Object) {
            this.result = { };
        }

        for (var id in args) {
            var arg = args[id];
            if (typeof arg === 'function') {
                this.waiting++;
                arg(this._waitAllCallback.bind(this, id));
            } else {
                this.generator.throw(new Async.AsyncError('Property ' + id + ' of yielding object is not a function'));
            }
        }
    };

    Async.prototype._waitAllCallback = function(originalId, err, val) {

        var numArgs = arguments.length;

        if (err && numArgs >= 3) {
            return this.generator.throw(err);
        }

        if (this.result.hasOwnProperty(originalId)) {
            this.generator.throw(new Async.AsyncError('Callback for item ' + originalId + ' of yield was invoked more than once'));
        }

        // add this callbacks result to set of results

        this.result[originalId] = (numArgs === 2 ? err : val);
        this.waiting--;

        // yield result when all is done

        if (this.waiting === 0) {
            this.callback(null, this.result);
        }
    };

    Async.prototype.callback = function(err, val) {

        var numArgs = arguments.length;

        if (err && numArgs >= 2) {
            return this.generator.throw(err);
        }

        this.result = (numArgs === 1 ? err : val);

        if (this.sync === 0) {
            this.sync = 1;
        } else {
            this.next();
        }
    };<rem></if></rem>
})();
