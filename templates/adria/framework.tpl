var application;
var <if platform == 'node'>__</if>require;
var resource;
var module;<if enableAssert>
var assert;</if><if globals.length != 0>
var <each global in globals><global><if ! each.last>, </if></each>;</if>
(function() {
    var resources = { };
    var modules = { };
    var getResource = function(name) {<if enableAssert>
        if (resources[name] === undefined) {
            throw Error("missing resource " + name);
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
            throw Error("missing dependency " + file);
        }
        </if>
        return modules[file].exports;
    }; <if enableAssert>
    assert = function(assertion, message) {
        if (assertion !== true) {
            throw new Error('assertion failed: ' + message + ' [typeof: ' + typeof(assertion) + ']');
        }
    };</if>
})();
