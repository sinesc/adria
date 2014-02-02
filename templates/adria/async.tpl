module('async.adria', function(module, resource) {

    <*
     * async error object
     *>

    function AsyncException(message) {
        Exception.call(this, message);
    }

    AsyncException.prototype = Object.create(Exception.prototype);
    AsyncException.prototype.constructor = AsyncException;

    <*
     * async object
     *>

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
                func.apply(context, args);
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

    <**
     * throw on following next() iteration and provide partial result via exception
     *
     * @param error
     *>
    Async.prototype.throw = function(error) {

        error.partialResult = this.result;
        this.error = error;
    };

    <**
     * steps through the yields in the async # function. at each yield either a result is returned or
     * an error is thrown. continues until the last yield was processed
     *>
    Async.prototype.next = function() {

        <* the yielded function for which we will wait on its callback before returning that result at the caller yield *>

        var arg;

        <* todo REFACTOR! *>

        while ((arg = (this.error === undefined ? this.generator.next(this.result) : this.generator.throw(this.error))).done === false) {

            this.sync = 0;
            this.error = undefined;
            arg = arg.value;

            try {

                if (typeof arg === 'function') {
                    <: if (enableAssert) { :>assert(arg.prototype === undefined, 'Yielded function is not wrapped (forgot \'#\' ?)');<: } :>
                    arg(this.callback.bind(this, this.step));
                } else {
                    this.waitAll(arg);
                }

            } catch (e) {

                <* yielded expression threw immediately, meaning we're synchronous *>

                this.sync = 1;
                this.throw(e);
            }

            <* check if the function returned before or after the callback was invoked
               synchronous: just continue looping, don't call next in callback to avoid recursion
               asynchronous: break here and have the callback call next() again when done *>

            if (this.sync === 0) {
                this.sync = -1;
                break;
            } else {
                this.step++;
            }
        }

        this.done = this.generator.done;
    };

    <**
     * used by next to call multiple functions and wait for all of them to call back
     *
     * @param args an array or object of async-wrapped functions
     *>
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
                <: if (enableAssert) { :>assert(arg.prototype === undefined, 'Property ' + id + ' of yielded object is not a wrapped function (forgot \'#\' ?)');<: } :>
                this.waiting++;
                arg(this.waitAllCallback.bind(this, this.step, id));
            } else {
                throw new AsyncException('Property ' + id + ' of yielding object is not a function');
            }
        }
    };

    <**
     * callback given to functions during waitAll. tracks number of returned functions and
     * calls the normal async callback when all returned or one excepted
     *
     * @param originalStep the step at which the original function was called
     * @param originalId the array or object key from the original yield
     * @param err typically nodejs callback provide an error as first parameter if there was one. we'll throw it
     * @param val the result
     *>
    Async.prototype.waitAllCallback = function(originalStep, originalId, err, val) {

        <* check if callback is from the current step (may not be if a previous waitAll step threw) *>

        if (this.step !== originalStep) {
<* console.log('discarded waitAllCallback', originalStep, originalId, err, val); *>
            return;
        }

        var error = null;

        if (err instanceof Error) {

            error = err;

        } else if (this.result.hasOwnProperty(originalId)) {

            error = new AsyncException('Callback for item ' + originalId + ' of yield was invoked more than once');

        } else {

            <* add this callbacks result to set of results *>

            this.result[originalId] = (arguments.length === 3 ? err : val);
            this.waiting--;
        }

        <* yield error or when all is done, result *>

        if (error !== null) {
            this.callback(originalStep, error);
        } else if (this.waiting === 0) {
            this.callback(originalStep, null, this.result);
        }
    };

    <**
     * callback given to singular functions
     *
     * @param originalStep the step at which the original function was called
     * @param err typically nodejs callback provide an error as first parameter if there was one. we'll throw it
     * @param val the result
     *>
    Async.prototype.callback = function(originalStep, err, val) {

        <* check if callback is from the current step (may not be if a previous waitAll step threw) *>

        if (this.step !== originalStep) {
<* console.log('discarded callblack', originalStep, err, val); *>
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
