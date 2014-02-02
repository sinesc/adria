adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module structure</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

Module structure
----------------

Each module is contained in exactly one file. During compilation the compiler will merge all modules `require`d by the module to be compiled (the main module) from within the project's basepath into one output file.
Modules can expose individual properties via the `export` statement and/or expose a single function/object as the `module` itself.
Modules can `require` each other, which grants them access to another module's exposed properties. The compiler will resolve non-circular module-dependencies at compile time and merge them in the order of first requirement.
Execution of an application begins in the main module. `require`d modules will be executed the first time they are required, allowing the programmer to solve circular dependencies dynamically.

### export

`export <name> = <expression>;`

The `export` statement exposes the value of given expression as property of the module. Another module `require`ing this module will receive the result of `expression` as the property `<name>` of the require call result.
It will also be available within the entire scope of the module as `name` (even when `export` is used in function scope).

**File main.adria**

```javascript
var utils = require('utils');

console.log(utils.helloWorld());
console.log(utils.helloUniverse());

// Hello World
// Hello Universe
```

**File utils.adria**

```javascript
export helloWorld = func() {
    return 'Hello World';
};

export helloUniverse = func() {
    return 'Hello Universe';
};
```

### global

`global <name>[ = <value>[, ...]];`

Declares one or more variables in the application scope, making them available to all modules.

### import

`import <name>[, <name>[, ...]];`

Imports one or more symbols from the environment. The statement does not compile to any code but informs the compiler about symbols declared outside of the application being compiled.

### module

`module <name> = <expression>;`

The `module` statement exposes the result of `expression` as the module itself. Another module `require`ing this module will receive it as the result of the require call.
It will also be available within the entire scope of the module as `name` (even when `module` is used in function scope).

**File main.adria**

```javascript
var MyProto = require('my_proto');

var my = new MyProto();

// hello world
```

**File my_proto.adria**

```javascript
module MyProto = proto {
    constructor: func() {
        console.log('hello world');
    }
};
```

### require

`var <local name> = require(<module name>);`

The `require` function returns another module. If the module exposed an object or function via the `module` statement, that object or function will be returned as result of `require`. Otherwise an instance of `Object` is returned.
Alternatively or additionally, the module may expose various functions or objects as properties of the returned object or function via the `export` statement.
`<module name>` is expected to be a constant literal, the compiler will exit with an error message if `<module name>` requires runtime evaluation.

**File main.adria**

```javascript
var Items = require('items');

var items = new Items();
items.add(new Items.Item('Hello', 'World'));

// added item [key: Hello, value: World]
```

**File items.adria**

```javascript
export Item = proto {
    key: '',
    value: '',
    constructor: func(key, value) {
        this.key = key;
        this.value = value;
    },
    toString: func() {
        return '[key: ' + this.key + ', value: ' + this.value + ']';
    },
};

module Items = proto {
    items: null,
    constructor: func() {
        this.items = [];
    },
    add: func(item) {
        this.items.push(item);
        console.log('added item ' + item);
    },
};
```

### resource

`var <local name> = resource(<filename>);`

At compiletime, the compiler will append all utf8-encoded files indicated by `resource` function-calls to the sourcecode it is currently generating.
At runtime, the `resource` function immediately returns the contents of files that were embedded during compilation.
`<filename>` is expected to be a constant literal, the compiler will exit with an error message if `<filename>` requires runtime evaluation.

