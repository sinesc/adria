adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module structure</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

About
-----

**Disclaimer:** This is a spare time project not meant to be used in a production environment. Features and syntax are still in flux and will be for quite some time.

Adria is a programming language for NodeJS and the browser and the name for the self-hosting transcompiler used to generate .js from .adria. The language
compiles to JavaScript and is syntactically very similar to it, mostly extending it with new features.
Adria aims to make prototypal inheritance as simple to use as classical inheritance by adding syntax for prototype creation, extension and inheritance. It
also adds adds asynchronous function statements and literals to reign in "NodeJS callback hell". The language uses a CommonJS like module system, its
compiler resolves your application's sourcecode-dependencies and (by default) merges required sourcecode into one sourcemapped file.
It can also merge in any other textual files (i.e. WebGL shaders) you request via the resource literal - which at runtime will return the resource.

A few features in short
-----------------------

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
var testAsync = func#(callback) {   // has a callback, so could be used as await argument in another func#

    var val = await {                   // also supports arrays, does not have to be a static literal
        sleepOne    : sleep(1200, #),
        sleepTwo    : sleep(1600, #),
        sleepThree  : sleep(500, #),
    };

    callback(null, val);
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
Sub::message = property {               // prototype access operator and property assignment
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