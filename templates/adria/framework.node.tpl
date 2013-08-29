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
var module;<if enableAssert>

/**
 * application-wide assertion support
 */
var assert;</if><if globals.length != 0>

/**
 * application defined globals
 */
var <each global in globals><global><if ! each.last>, </if></each>;</if>

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
    __require = function(file) {<if enableAssert>
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
