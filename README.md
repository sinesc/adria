adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module structure</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

About
-----

**Disclaimer:** This is a spare time project not meant to be used in a production environment. Features and syntax are still in flux and will be for quite some time.

This is a short and incomplete list of features:

- part of the curly-brackets family, syntactically quite similar to Javascript
- commonJS like module structure, resolved and compiled to single file by command-line compiler (does not prevent circular references resolution at runtime)
- also supports merging in other resources via `resource` keyword, i.e. `var contributors = resource('contributors.txt');`
- block scope `var` keyword
- default parameters: `func assertEquals(actual, expected = true) { ... }`
- `proto` keyword for prototype creation/inheritance: `var Sub = proto (Base) { ... };` (or as statement: `proto Sub (Base) { ... }`)
- expression focussed syntax (i.e. allows prototype properties to inline further prototypes)
- keywords are good and lower the barrier of entry, but they should be short: `func`, `proto`, `prop`, `await`...
- sometimes operators are good too, `::` accesses the prototype: `MyBase::newFunc = func() { };`
- property expression syntax via `prop` keyword: `MyBase::myProp = prop { get: ... set: ... };`
- `->` calls the left-hand side constructors right-hand side prototype property into the current context: `MyParent->someMethod(...)` (would be MyParent.prototype.someMethod.call(this, ...) in Javascript)
- `parent` keyword returns the parent constructor for the current `this` context (dynamically, so if a method gets `call`ed this will return that contexts parent constructor): `parent->someMethod(...)` as above.
- `await` keyword to wait for asynchronous functions or callback functions and `([...,] # [, ...])` operator (async-wrap): `var result = await fs.readFile(name, #);` (waits for `fs.readFile` to invoke the callback passed as second parameter)

A few feature examples
----------------------

### Asynchronous functions (serially wait for callbacks)

```javascript

// demo function using NodeJS callback style

var sleep = func(ms, callback) {
    setTimeout(func() {
        callback(null, '<sleept ' + ms + 'ms>');    // second argument will be the await return value
    }, ms);                                         // first is error and would be thrown from within testAsync
};

// simple async function, # takes the place of the callback parameter

var testAsync = func#() {

    var result = await sleep(1000, #);
    console.log('sleep done', result);

    result += await sleep(1000, #);
    console.log('sleep done', result);
};

testAsync();
console.log('start sleeping');

// start sleeping                               [immediate]
// sleep done <sleept 1000ms>                   [1000ms later]
// sleep done <sleept 1000ms><sleept 1000ms>    [another 1000ms later]
```

### Default parameters

```javascript
function print(greeting, who = 'World!') {
    console.log(greeting + ' ' + who);
}
```

### For-In key/value support

```javascript
for (var key, value in [ 'zero', 'one', 'two', 'three' ]) {
    console.log(key, value);
}

// 0 zero
// 1 one
// 2 two
// 3 three
```

### Prototype creation

```javascript
proto Base {
    text: 'hi',
    constructor: func() {
        console.log(this.constructor.name);
    },
    greet: func(name) {
        return this.text + ' ' + name;
    }
}
```

### Prototypal inheritance

```javascript
proto Sub (Base) {
    text: 'hello',
    greet: func(name) {
        return Base->greet(name + '!'); // calls Bases prototype function greet in the context of Sub
    }
}

var base = new Base();
var sub = new Sub();

console.log(base.greet('planet'));
console.log(sub.greet('world'));

// Base         [output from Base::constructor]
// Sub          [also from Base::constructor]
// hi planet    [base.greet]
// hello world! [sub.greet]
```

### Asynchronous wait in parallel using return

```javascript
var testAsync = func#(#) {   // has a callback, so could be used as await argument in another func#

    var val = await {                   // also supports arrays, does not have to be a static literal
        sleepOne    : sleep(1200, #),
        sleepTwo    : sleep(1600, #),
        sleepThree  : sleep(500, #),
    };

    return val;     // will pass val to the function passed in via the parameter signified by #
};

// longest sleep is 1600ms, so testAsync should invoke callback after about 1600ms

var now = process.hrtime();

testAsync(func(err, val) {          // instead of using the callback, we could await this from another func#
    var diff = process.hrtime(now);
    console.log(diff[0] + '.' + diff[1] + 's');
    console.log(val);
});

console.log('start');

// start
// 1.607710094s
// { sleepThree: '<sleept 500ms>',  [result in order of callback time but with proper k->v associations]
//   sleepOne: '<sleept 1200ms>',
//   sleepTwo: '<sleept 1600ms>' }
```

### Prototype extension (here with a property)

```javascript
Sub::message = prop {               // prototype access operator and property assignment
    get: func() {
        return 'Greeting is "' + this.text + '"';
    },
    set: func(value) {
        this.text = value;
    }
};

sub.message = 'Hey';
console.log(sub.message);

// Greeting is "Hey"
```