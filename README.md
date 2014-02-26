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
- commonJS like module structure, resolved and compiled to single file by command-line compiler
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

Installation/Use
----------------

- Install a [recent NodeJS](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#wiki-ubuntu-mint-elementary-os) version, i.e. `apt-get install nodejs`
- `npm install -g adria` (leave out the global flag -g to install for current user only)
- `adria <input .adria file(s)> -o <output.js>`
- `node <output.js>` (include --harmony flag to use generators)

Use `adria --help` for more help.

A few feature examples
----------------------

### Asynchronous functions and callback wrapper syntax

```javascript
// demo function using NodeJS callback style (error, result)
var sleep = func(ms, callback) {
    setTimeout(func() { callback(null, '<sleept ' + ms + 'ms>'); }, ms);
};

// simple async function, adds support for await keyword
var asyncA = func#() {

    // wait for single callback function, # takes place of callback with await return value
    var result = await sleep(500, #);
    console.log('A', result);

    // can also wait for multiple in parallel (also supports arrays, does not have to be a static literal)
    console.log('A', await {
        sleepAOne    : sleep(1200, #),
        sleepATwo    : sleep(1600, #),
        sleepAThree  : sleep(500, #),
    });
};

var asyncB = func#() {
    console.log('B', await sleep(350, #));
    console.log('B', await sleep(2250, #));
};

asyncA();
asyncB();
console.log('start sleeping');

// start sleeping
// B <sleept 350ms>
// A <sleept 500ms>
// A { sleepAThree: '<sleept 500ms>',
//   sleepAOne: '<sleept 1200ms>',
//   sleepATwo: '<sleept 1600ms>' }
// B <sleept 2250ms>
```

### Simple and advanced default parameters

```javascript
function print(greeting, who = 'World!') {
    console.log(greeting + ' ' + who);
}
```

```javascript
func message(delay, [ type = 'warning', [ text = 'default message' ] ], callback) {
    setTimeout(callback.bind(null, type, text), delay);
}
```
Below are some usages for the message-function. See documentation for more realistic examples.
```javascript
message(100, func(type, message) {
    console.log(type + ': ' + message);     // warning: default message
});

message(200, 'notice', func(type, message) {
    console.log(type + ': ' + message);     // notice: default message
});

message(300, 'error', 'awesomeness overflow', func(type, message) {
    console.log(type + ': ' + message);     // error: awesomeness overflow
});
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