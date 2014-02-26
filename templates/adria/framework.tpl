var require, resource, module;{! if (enableApplication): !}
var application;{! endif !}{! if (enableAssert): !}
var assert;{! endif !}{! if (globals.length != 0): !}
var {% globals.join(', ') %};{! endif !}
var Exception{! if (enableAssert): !}, AssertionFailedException{! endif !};
(function() {
    var resources = { };
    var modules = { };

    var getResource = function(name) {{! if (enableAssert): !}
        if (resources[name] === undefined) {
            throw Error('missing resource ' + name);
        }
        {! endif !}
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
    Exception.prototype.constructor = Exception;{! if (enableApplication): !}

    application = function(Constructor /*, params... */) {
        function Application() {
            application = this;
            Constructor.apply(this, Array.prototype.slice.call(arguments));
        };
        Application.prototype = Constructor.prototype;
        var args = Array.prototype.slice.call(arguments);
        args[0] = null;
        return new (Function.prototype.bind.apply(Application, args));
    };{! endif !}

    require = function(file) {
        var module = modules[file];{! if (enableAssert): !}
        if (module === undefined) {
            throw Error('missing dependency ' + file);
        }{! endif !}
        if (typeof module.func === 'function') {
            var func = module.func;
            delete module.func;
            func(module, getResource);
        }
        return module.exports;
    };{! if (enableAssert): !}

    AssertionFailedException = function AssertionFailedException(message) {
        Exception.call(this, message);
    };
    AssertionFailedException.prototype = Object.create(Exception.prototype);
    AssertionFailedException.prototype.constructor = AssertionFailedException;

    assert = function(assertion, message) {
        if (assertion !== true) {
            throw new AssertionFailedException(message);
        }
    };{! endif !}
})();
