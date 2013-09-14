adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module structure</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

Language overview
-----------------

This document details only differences between Javascript and Adria

## Incompatibilities

- Adria adds the following keywords: `proto`, `property`, `parent`, `require`, `resource`, `global` and `assert`
    Keywords may not be used as identifiers, but they may be used as object property names.

- With the exception of block-statements, all statements must be semicolon-terminated. Block-statements are statements that end on a block, i.e. `while { }` but not `do { } while ()`. Note: function/proto-literals are not statements in themselves.

- Adria tries to infer names for function- and proto-literals from the left side of an assignment or property declaration. The name is valid only in the function scope but may prevent the function from accessing a parent scope object with the same name.

## Changed syntax

### default parameters

`<function> <name>(<parameter> [= <default value>[, <parameter> [= <default value> ...]]])`

Default parameters may be provided for parameters not followed by undefaulted parameters.

### new-prototype

`new <constructor>( [<parameter>] ) { <proto body> }`

Creates a new prototype inheriting from given constuctor's prototype, extends it with proto body and returns an
object created from the new prototype's constructor. This syntax is short for
`new (proto (<constructor>) { <proto body> })( [<parameter>] )`

### for/in statement

`for ([var] <key>[, <value>] in <source>) { ... }`

Support for an optional value argument was added.

### try/catch statement

`try { ... } catch (<type> <exception>) { ... } [ catch ([<type>] <exception>) { ... } ... ] [ finally { ... } ]`

Support for catching specific types of exceptions was added. If an exception is "not instanceof" the first catch-block's type, the exception is passed to the next block until it is caught. If the last catch block is not unconditional and the exception fails that instanceof test as well, it will be rethrown. When mixing unconditional and conditional catch blocks, the unconditional block must come last.

## Added syntax

### async function literals and statements

`var fn = function# [<name>] (<parameter list>) { };`

`function# <name> (<parameter list>) { }`

Creates a new asynchronous function. Asynchronous functions cannot return a specific value, they always return an Async object. Asynchronous functions add support for the yield literal, which will halt execution of the function until its function-argument invokes a callback, passed in via the #-token or until all of its array- or object-argument functions have invoked their callbacks. While the function is halted, other code may run.

In the following examples, a simple sleep function is used. The function follows the NodeJS `callback(err, val)` style and could be replaced with any of NodeJS's callback based functions, i.e. `fs.readFile`.

```javascript
var sleep = function(ms, callback) {
    setTimeout(function() {
        callback(null, '<sleept ' + ms + 'ms>');
    }, ms);
};
```
An asynchronous function can wait for another function to invoke its callback by yielding the results of a wrap-operation on it. The wrap operation looks like an invocation except
that one of the parameters used is the `#` token. A wrap operation marks the position of the callback and sets the functions parameters. If the slight overhead of this operation
is not acceptable in a given situation, the application-wide available Async object also provides a wrap method that does not bind function parameters, allowing the programmer
to pre-wrap all required functions.

```javascript
var testAsync = function#(callback) {

    var result = yield sleep(1000, #);
    console.log('sleep done', result);

    var sleep1000 = sleep(1000, #);    // wrap is allowed anywhere
    result += yield sleep1000;
    console.log('sleep done', result);
};

testAsync();
console.log('start sleeping');

// output:
// start sleeping                               [immediate]
// sleep done <sleept 1000ms>                   [1000ms later]
// sleep done <sleept 1000ms><sleept 1000ms>    [another 1000ms later]
```

To wait for multiple functions, yield supports array or object arguments. The result of a yield operation will then equally be an array or object containing the individual function results associated with their original key, but not neccessarily in the order of original association. The latter is only of practical relevance when using object arguments and iterating over the result keys.

The following example combines serial and parallel yields:

```javascript
var testAsync = function#(callback) {

    console.log('start');

    // wait for single function

    var result = (yield sleep(1000, #)) + '\n';
    console.log('single sleep done');

    // wait for an array of functions

    var anArray = yield [
        sleep(1200, #),
        sleep(1300, #),
        sleep(500, #),
    ];

    console.log('array sleep done');

    result += anArray.join() + '\n';

    // wait for a set of functions

    var anObject = yield {
        sleepOne    : sleep(1200, #),
        sleepTwo    : sleep(1300, #),
        sleepThree  : sleep(500, #),
    };

    console.log('object sleep done');

    result += JSON.stringify(anObject) + '\n';

    callback(result);
};

testAsync(function(result) {
    console.log('the final result:\n' + result);
});

// start
// single sleep done
// array sleep done
// object sleep done
// the final result:
// <sleept 1000ms>
// <sleept 1200ms>,<sleept 1300ms>,<sleept 500ms>
// {"sleepThree":"<sleept 500ms>","sleepOne":"<sleept 1200ms>","sleepTwo":"<sleept 1300ms>"}
```

### proto statement and literal

`proto <name> [(<parent>)] <object literal>`

Creates a new constructor and populates its `prototype`-property with the object literal's properties.
If the object literal has a `constructor` property, it must be a function and will constitute the new constructor, otherwise a blank function will be used.
If a parent constructor is given, the parent's prototype will be used as base for the new constructor's prototype and if no constructor property was defined, the blank function will call the parent constructor with all given parameters.

Like Javascript functions, `proto` also offers a literal notation:

`<assignable> = proto [<name>] [(<parent>)] <object literal>`

If `name` is not given, Adria will try to infer it from the left side of the assignment. The name, if found, will be used for the constructor function but not become visible outside of `proto`.

### prototype-access operator

`<constructor>::<property>`

The prototype operator `::` can be used to access properties of a constructor's prototype. Note that if the property is a function, the function's `this`-reference will point to the prototype.
This syntax equals `<constructor>.prototype.<property>`.

### prototype-context-call operator

`<constructor>-><callable>(...)`

The `->`-operator invokes a function from constructor's `prototype` within the current `this`-context.
This syntax equals `<constructor>.prototype.<callable>.call(this, ...)`

```javascript
proto Base {
    text: "Text from Base",
    print: function() { console.log(this.text); },
}
proto Sub {
    text: "Text from Sub",
    print: function() { Base->print(); },
}

(new Sub).print();
// Text from Sub
```

### parent keyword

`parent`

Refers to the parent of the current this-context's constructor.
*Note that if a method was `call`ed or `apply`ed, `parent` will refer to the parent of that context's constructor.* This is intended behaviour. Adria does not try to imitate classical behaviour with a bound this-context in Javascript.
`parent` is available wherever `this` is available. It is **not limited** to `proto`-defined objects.

```javascript
proto Base {
    text: "I'm the base!",
    testFunc: function() {
        return 'testFunc in Base';
    },
    demonstrate: function() {
        console.log(this.text);
        console.log(parent::text);
        console.log(this.testFunc());
        console.log(parent->testFunc());
    },
}

proto Sub (Base) {
    text: "I'm better than the base!",
    testFunc: function() {
        return 'testFunc in Sub';
    },
}

(new Base).demonstrate();
// I'm the base!
// undefined
// testFunc in Base
// TypeError (parent does not have method "testFunc")

(new Sub).demonstrate();
// I'm better than the base!
// I'm the base!
// testFunc in Sub
// testFunc in Base
```

### property (assignment)

...`<access operator><name> = property <object literal>`

Adria allows property assignments. The left side of the assignment must be a valid property. While unconventional, this syntax greatly simplifies adding new properties to an existing object outside of a proto statement.
`property` can also be used within `proto`.

```javascript
proto MyProto {
    message: property {
        get: function() {
            return 'THE MESSAGE';
        }
    },
    print: function() { console.log(this.loudMessage); }
}

MyProto::loudMessage = property {
    get: function() {
        return '!!!! ' + this.message + ' !!!!';
    }
};


(new MyProto).print();
// !!!! THE MESSAGE !!!!
```