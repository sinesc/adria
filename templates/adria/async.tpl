module('async.adria', function(module, resource) {

    var Async = function Async(generator) {
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
    Async.prototype.terminated = false;

    Async.prototype.throw = function(e) {
        if (this.terminated === false) {
            this.terminated = true;
            this.generator.throw(e);
        }
    };

    Async.prototype.next = function() {
        var arg;

        while ((arg = this.generator.next(this.result)).done === false) {

            arg = arg.value;
            this.sync = 0;

            try {
                if (typeof arg === 'function') {
                    arg(this.boundCallback);
                } else {
                    this.waitAll(arg);
                }
            } catch (e) {
                return this.throw(e);
            }

            // check if the function returned before or after the callback was invoked

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
                throw new Async.AsyncError('Property ' + id + ' of yielding object is not a function');
            }
        }
    };

    Async.prototype._waitAllCallback = function(originalId, err, val) {

        var numArgs = arguments.length;

        if (err instanceof Error) {
            return this.throw(err);
        }

        if (this.result.hasOwnProperty(originalId)) {
            return this.throw(new Async.AsyncError('Callback for item ' + originalId + ' of yield was invoked more than once'));
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

        if (err instanceof Error) {
            return this.throw(err);
        }

        this.result = (numArgs === 1 ? err : val);

        if (this.sync === 0) {
            this.sync = 1;
        } else if (this.terminated === false) {
            this.next();
        }
    };

    ___Async = Async;
    module.exports = Async;
});
