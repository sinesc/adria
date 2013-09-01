adria
=====

Adria language and programmable transcompiler

Framework
---------

By default, Adria includes a small (about 50 lines when not minified) framework in the compiled output. This framework adds support for the following functionality:

## Modules

When compiling with the framework enabled (default), the adria commandline compiler will merge all `require`d files from within the project's basepath into one output file.
Each file will be represented as a module to the other files (= modules). Modules can expose individual properties via the `export` statement and/or expose a single function/object as the `module` itself.
Modules can `require` each other, which grants them access to another module's exposed properties. The compiler will resolve module-dependencies at compiletime and append them in reverse order to the output file.

### module

`module <name> = <expression>;`

The `module` statement exposes the value of given expression as the module itself. Another module `require`ing this module will receive `expression` as the result of the require call.
The value of expression will be available within the entire scope of the module as `name` (even when `module` is used in function scope).

**File main.adria**

```javascript
var MyProto = require('my_proto');

var my = new MyProto();

// hello world
```

**File my_proto.adria**

```javascript
module MyProto = proto {
    constructor: function() {
        console.log('hello world');
    }
};
```

### export

`export <name> = <expression>;`

The `export` statement exposes the value of given expression as property of the module. Another module `require`ing this module will receive `expression` as the property `<name>` of the require call result.
The value of expression will be available within the entire scope of the module as `name` (even when `export` is used in function scope).

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
export helloWorld = function() {
    return 'Hello World';
};

export helloUniverse = function() {
    return 'Hello Universe';
};
```

### require

`require(<module name>);`

The `require` function returns the public "interface" of another module. If the module exposed an object or function via the `module` statement, that object or function will be the result of `require`. Otherwise an instance of `Object` is returned.
Alternatively or additionally, the module may expose various functions or objects as properties of the returned object or function via the `export` statement.

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
    constructor: function(key, value) {
        this.key = key;
        this.value = value;
    },
    toString: function() {
        return '[key: ' + this.key + ', value: ' + this.value + ']';
    },
};

module Items = proto {
    items: null,
    constructor: function() {
        this.items = [];
    },
    add: function(item) {
        this.items.push(item);
        console.log('added item ' + item);
    },
    get: function(id) {
        return this.items[id];
    }
};
```