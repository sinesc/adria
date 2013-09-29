var <:if (platform == 'node') { :>__<: } :>require;
var resource;<:if (enableApplication) { :>
var application;<: } :>
var module;<: if (platform == 'node') { :>
var window = global;<: } :><: if (enableAssert) { :>
var assert;<: } :><: if (globals.length != 0) { :>
var <= globals.join(', ') =>;<: } :>
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
        func(this, getResource);
    };
    Module.prototype.exports = null;
    Module.prototype.name = '';
    module = function(name, func) {
        modules[name] = new Module(name, func);
    };
    resource = function(name, data) {
        resources[name] = data;
    };<: if (enableApplication) { :>
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
    <: if (platform == 'node') { :>__<: } :>require = function(file) {<: if (enableAssert) { :>
        if (modules[file] === undefined) {
            throw Error('missing dependency ' + file);
        }
        <: } :>
        return modules[file].exports;
    };<: if (enableAssert) { :>
    assert = function(assertion, message) {
        if (assertion !== true) {
            throw new Error('assertion failed: ' + message);
        }
    };<: } :>
})();
