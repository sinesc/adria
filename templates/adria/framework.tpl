var <:if (platform == 'node') { :>__<: } :>require;
var resource;<:if (enableApplication) { :>
var application;<: } :>
var module;<: if (platform == 'node') { :>
var window = global;<: } :><: if (enableAssert) { :>
var assert;<: } :><: if (globals.length != 0) { :>
var <= globals.join(', ') =>;<: } :>
var Exception<: if (enableAssert) { :>, AssertionFailedException<: } :>;
(function() {
    var resources = { };
    var modules = { };
    var getResource = function(name) {<: if (enableAssert) { :>
        if (resources[name] === undefined) {
            throw Error('missing resource ' + name);
        }
        <: } :>
        return resources[name];
    };
    var Module = function(name, func) {
        this.name = name;
        this.exports = { };
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
        if (message !== undefined) {
            this.message = message;
        }
        var stack = Error().stack.split('\n').slice(1);
        var name = this.constructor.name;
        stack[0] = (name === undefined ? 'Exception' : name) + ': ' + message;
        this.stack = stack.join('\n');
    };
    Exception.prototype = Object.create(Error.prototype);
    Exception.prototype.constructor = Exception;<: if (enableApplication) { :>
    application = function(Constructor /*, params... */) {
        function Application() {
            application = this;
            Constructor.apply(this, Array.prototype.slice.call(arguments));
        };
        Application.prototype = Constructor.prototype;
        var args = Array.prototype.slice.call(arguments);
        args[0] = null;
        return new (Function.prototype.bind.apply(Application, args));
    };<: } :>
    <: if (platform == 'node') { :>__<: } :>require = function(file) {
        var module = modules[file];<: if (enableAssert) { :>
        if (module === undefined) {
            throw Error('missing dependency ' + file);
        }<: } :>        
        if (typeof module.func === 'function') {
            var func = module.func;
            delete module.func;
            func(module, getResource);
        }
        return module.exports;
    };<: if (enableAssert) { :>
    AssertionFailedException = function AssertionFailedException(message) {
        Exception.call(this, message);
    };
    AssertionFailedException.prototype = Object.create(Exception.prototype);
    AssertionFailedException.prototype.constructor = AssertionFailedException;
    assert = function(assertion, message) {
        if (assertion !== true) {
            throw new AssertionFailedException(message);
        }
    };<: } :>
})();
