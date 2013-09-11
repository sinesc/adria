adria
=====

- Readme
- <a href="/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="/sinesc/adria/blob/master/doc/framework.md">Minimal default framework</a>
- <a href="/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

About
-----

Adria is a programming language for NodeJS and the browser. It is also the name for the self-hosting transcompiler used to generate .js from .adria.

Adria compiles to JavaScript and is syntactically very similar to it. Most strict Javascript code will either work out of the box or require very little
modification to make it compile, though ultimately you'll want to update existing code to use Adria's extended syntax.

Instead of trying to force data into classes and types, Adria aims to make prototypal inheritance as simple to use as classical inheritance by adding syntax
for prototype creation, extension and inheritance. Adria adds asynchronous function statements and literals to reign in "NodeJS callback hell". The language
uses a CommonJS like module system, its compiler resolves your application's sourcecode-dependencies and (by default) merges required sourcecode into one
sourcemapped file. It can also merge in any other textual files (i.e. WebGL shaders) you request via the resource literal - which at runtime will return
the resource.

A few features in short
-----------------------

### Asynchronous functions (serially wait for callbacks)

```javascript

// demo function using NodeJS callback style

var sleep = function(ms, callback) {
    setTimeout(function() {
        callback(null, '<sleept ' + ms + 'ms>');    // second argument will be the yielded return value
    }, ms);                                         // first is error and would be thrown from within testAsync
};

// simple async function, # takes the place of the callback parameter

var testAsync = function#() {

    var result = yield sleep(1000, #);
    console.log('sleep done', result);

    result += yield sleep(1000, #);
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
function print(greet, who = 'World!') {
    console.log(greeting + ' ' + output);
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
    constructor: function() {
        console.log(this.constructor.name);
    },
    greet: function(name) {
        return this.text + ' ' + name;
    }
}
```

### Prototypal inheritance

```javascript
proto Sub (Base) {
    text: 'hello',
    greet: function(name) {
        return Base->greet(name + '!'); // calls Base's prototype function greet in the context of Sub
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

### Asynchronous wait in parallel

```javascript
var testAsync = function#(callback) {   // has a callback, so could be used as yield argument in another function#

    var val = yield {                   // also supports arrays, does not have to be a static literal
        sleepOne    : sleep(1200, #),
        sleepTwo    : sleep(1600, #),
        sleepThree  : sleep(500, #),
    };

    callback(null, val);
};

// longest sleep is 1600ms, so testAsync should invoke callback after about 1600ms

var now = process.hrtime();

testAsync(function(err, val) {          // instead of using the callback, we could yield this from another function#
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
Sub::message = property {               // prototype access operator and property assignment
    get: function() {
        return 'Greeting is "' + this.text + '"';
    },
    set: function(value) {
        this.text = value;
    }
};

sub.message = 'Hey';
console.log(sub.message);

// Greeting is "Hey"
```