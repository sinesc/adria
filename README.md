adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module handling</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

About
-----

**Disclaimer:** This is a spare time project not meant to be used in a production environment. Features and syntax are still in flux and will be for quite some time.

#### The basics

- part of the curly-brackets family with a syntax similar to Javascript
- expression focussed syntax (i.e. allows prototype properties to inline further prototypes)
- block-scoped references
- syntax-checking parser, compile-time errors for undeclared variables or redeclaration of variables, notices for potential issues (unused references, shadowing, ...)
- optional parameter-type checks for annotated parameters
- commonJS-like module structure, resolved and compiled to single file by command-line compiler
- compiler support for resource-inclusion
- [pretty output](https://github.com/sinesc/adria/blob/master/bin/adria.js) (adria compiled by itself, unmodified compiler output with license header, shell-wrapper and external resources merged)

#### A few language elements

- `proto` keyword for prototype creation/inheritance: `var Sub = proto (Base) { };`
- `func` keyword replaces `function`
- `::` accesses the prototype: `MyBase::newFunc = func() { };`
- `->` calls the left-hand side constructors right-hand side prototype property into the current context: `MyParent->someMethod(...)` (would be MyParent.prototype.someMethod.call(this, ...) in Javascript)
- advanced default parameters: `Listenable::on = func(event, [ [ args = [] ], context = this ], method) {  };`
- also supports simple `<param> = <value>` default parameters and rest parameter: `func concat(target, ...items) {  }`
- property expression syntax via `prop` keyword: `MyBase::myProp = prop { get: <getter> set: <setter> };`
- `parent` and `self` keywords, i.e. `parent->constructor( ... );`
- `await` keyword to wait for asynchronous functions or callback functions and `([...,] # [, ...])` operator (async-wrap): `var result = await fs.readFile(name, #);` (waits for `fs.readFile` to invoke the callback passed as second parameter, then returns the value passed to it)
- extended for/in statement: `for (var key, value in object) { }`
- type specific catch blocks, i.e. `try { ... } catch (IOException e) { ... } catch (Exception) { ... }`
- modules access other modules by using the require literal, i.e. `var Document = require('./document');`
- the `export` and `module` statements make module-internal references available for other modules to `require`
- parameter annotation syntax with optional runtime-checks: `var stackDiff = func(Array stack, Array lastStack, finite minStackLen) { }`

Installation/Use
----------------

- Install a [recent NodeJS](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#wiki-ubuntu-mint-elementary-os) version, i.e. `apt-get install nodejs`
- `npm install -g adria` (leave out the global flag -g to install for current user only)
- `adria <input .adria file(s)> -o <output.js>`
- `node <output.js>` (include --harmony flag to use generators)

Use `adria --help` for more help.

Basic application
-----------------

Create a new file `main.adria`:

```javascript
var Log = require('./log');

Log::write('hello', 'world');
```

Create another file `log.adria`:

```javascript
module Log = proto {
    write: func(...args) {
        for (var id, arg in args) {
            console.log(id + ': ' + arg);
        }
    }
};
```

Compile to a shell executable file with `adria main.adria -o hello.js --shellwrap` and run with `./hello.js`

```
root@ubuntuvbox:~/dev/adria/stuff# ./hello.js
0: hello
1: world
```

In `main.adria`, `require('./log')` returns the `Log` constructor exported by `log.adria` (as the module). `Log::write(...)` accesses the constructor's prototype
and invokes its `write` method with the given arguments. `write` uses the rest parameter operator to gather all parameters into a new array `args` and the loops
through the array using Adria's extended for-in syntax.

`log.adria` was not specified at the compiler command line. It was added because it was `require`d by `main.adria`.
