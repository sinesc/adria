adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module handling</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/config.md">Build configurations</a>

Language overview
-----------------

This is a short overview of the differences between Javascript and Adria

## Incompatibilities

- Adria adds/reuses the following keywords: `assert`, `await`, `export`, `func`, `global`, `import`, `interface`, `module`, `parent`, `prop`, `proto`, `require`, `resource`, `self`, `storage`
    Keywords may be used as (property-)names but not as reference identifiers.

- In Adria, the `var` keyword uses block-scope. Redeclaring a variable (using `var`) previously declared in the very same scope results in a compile time error. Using undeclared variables also results in a compile time error.

- With the exception of block-statements, all statements must be semicolon-terminated. Block-statements are statements that end on a block, i.e. `while { }` but not `do { } while ()`. Note: An expression ending on i.e. a function literal will still need to be terminated by semicolon.

- Adria tries to infer names for function- and proto-literals from the left side of an assignment or property declaration. The name is valid only in the function scope but may prevent the function from accessing a parent scope object with the same name.

## Changed syntax

### var statement

`var <name> import <èxternal name>`

Adria's `var` statment creates a block scoped reference. It also support a special syntax used to
[import external references](https://github.com/sinesc/adria/blob/master/doc/modules.md#import).

### Default parameters

`<reference name> [= <default value> ]`

Default parameters may be provided for parameters not followed by undefaulted parameters. Default parameters may refer to references available in the current scope as well as `this` and previous parameters. Example:

```javascript
func secretMath(value, increase = 1, multiplier = 1) {
    return (value + increase) * multiplier;
}
```

### Advanced default parameters

An advanced syntax allows for arbitrary placement of default parameters. The following code represents a valid function (note: args default value is an empty array):

```javascript
func wait(delay, [ context = this, [ args = [] ] ], callback) {
    /* ... */
}
```

The function could be called with the following parameter permutations:

`wait(<delay>, <callback>)`

`wait(<delay>, <context>, <callback>)`

`wait(<delay>, <context>, <args>, <callback>)`

A function definition's parameter-list may have multiple blocks of optional or non-optional parameters, each optional block may contain multiple blocks of optional or non-optional parameters and so on. There may be no two possible permutations with the same number of total arguments, otherwise compilation will result in an error, explaining the conflicting permutations.

Another, more complex example:

```javascript
func insane(a, [ b = 1, c = 2, [ d = 3 ], e = 4 ], f, [ g = 5, h = 6 ]) {
    /* ... */
}
```

The above function accepts 2, 4, 5, 6, 7 or 8 arguments.

### Rest parameter

`...<rest name>`

As last parameter, a rest parameter may follow. Additional parameters passed to the function will be available through the rest parameter array. Example:

```javascript
func rest(a, b = 1, ...c) {
    console.log(c);
}

rest(1, 2, 3, 4, 5); // => [ 3, 4, 5 ]
```

Rest parameters are not supported after advanced parameter lists.

### Parameter-type annotations

`[<type>[<modifier>]] <parameter> [= <default value> ]`

Parameter lists may specify the type of individual or all parameters. The following values are supported for type: `boolean`, `number`, `finite` (finite number, i.e. not `NaN`), `string`, `func`, `object` as well as references to constructors, i.e. `RegExp`. The modifier `?` additionally allows passing (strictly) `null`.

Type annotations compile to no code unless the `--assert` flag is used during compilation, in which case non-matching parameters will throw an `AssertionFailedException`.

```javascript
func plusOne(number value) {
    return value +1;
}
```

```javascript
func increment(number value, number increase = 1) {
    /* ... */
}
```

```javascript
Listenable::on = func(string event, [ object? context = null, [ Array args = [ ] ] ], func callback) {
    /* ... */
}
```

### for/in statement

`for ([var] <key>[, <value>] in <source>) { ... }`

Support for an optional value argument was added.

### try/catch statement

`try { ... } catch (<type> <exception>) { ... } [ catch ([<type>] <exception>) { ... } ... ] [ finally { ... } ]`

Support for catching specific types of exceptions was added. If an exception is "not instanceof" the first catch-block's type, the exception is passed to the next block until it is caught. If the last catch block is not unconditional and the exception fails that instanceof test as well, it will be rethrown. When mixing unconditional and conditional catch blocks, the unconditional block must come last. Example:
```javascript
try {
    /* ... */
} catch (TCPException e) {
    /* connection failed */
} catch (IOException e) {
    /* writing data failed */
} catch (e) {
    /* report unknown error */
} finally {
    /* close sockets and files */
}
```

### new-prototype

`new <constructor>( [<parameter>] ) { <proto body> }`

Creates a new prototype inheriting from given constuctor's prototype, extends it with proto body and returns an
object created from the new prototypes constructor. This syntax is short for
`new (proto (<constructor>) { <proto body> })( [<parameter>] )`

## Added syntax

### proto statement and literal

`proto <name> [(<parent>)] <object literal>`

Creates a new constructor and populates its `prototype`-property with the object literal's properties.
If the object literal has a `constructor` property, it must be a function and will constitute the new constructor, otherwise a blank function will be used.
If a parent constructor is given, the parent's prototype will be used as base for the new constructors prototype and if no constructor property was defined, the blank function will call the parent constructor with all given parameters.

Like Javascript functions, `proto` also offers a literal notation:

`<assignable> = proto [<name>] [(<parent>)] <object literal>`

If `name` is not given, Adria will try to infer it from the left side of the assignment. The name, if found, will be used for the constructor function but not become visible outside of `proto`.

```javascript
var Base = proto {
    value: 1,
    constructor: func(value = 4) {
        this.value = value;
    },
};

var Sub = proto (Base) {
    constructor: func(value = 3) {
        parent->constructor(value * 2);
    },
};
```

### prop literal

`<object>.<name> = prop <object literal>`

Adria allows property assignments. The left side of the assignment must be a valid property. `prop` can also be used within `proto`.

```javascript
proto MyProto {
    message: prop {
        get: func() {
            return 'THE MESSAGE';
        }
    },
    print: func() { console.log(this.loudMessage); }
}

MyProto::loudMessage = prop {
    get: func() {
        return '!!!! ' + this.message + ' !!!!';
    }
};

(new MyProto).print();
// !!!! THE MESSAGE !!!!
```

#### Property inheritance

`inherit get|set`

It is possible to inherit individual parts of a property from a parent prototype using the `inherit get` or `inherit set` syntax.

```javascript
proto Base {
    value: 0,
    test: prop {
        get: func() {
            return this.value;
        },
        set: func(val) {
            this.value = val;
        }
    }
}

proto Sub (Base) {
    test: prop {
        inherit get,
        set: func(val) {
            this.value = val * 2;
        }
    }
}

var sub = new Sub();
sub.test = 1;
console.log(sub.value); // 2
console.log(sub.test); // 2
```

#### Property storage

Getter/setter properties often require an additional property to store the associated data. For this purpose, the `storage` keyword was added.

```javascript
var Test = proto {
    testProperty: prop {
        get: func() {
            return storage;
        },
        set: func(value) {
            storage = value;
        },
    },
};
```

Additionally, it is possible to define a default value using the `default` property.

```javascript
var Test = proto {
    testProperty: prop {
        default: null,
        get: func() {
            return storage;
        },
        set: func(value) {
            storage = value;
        },
    },
};
```

### prototype-access operator

`<constructor>::<property>`

The prototype operator `::` can be used to access properties of a constructor's prototype. Note that if the property is a function, the function's `this`-reference will point to the prototype.
This syntax equals `<constructor>.prototype.<property>`.

### prototype-context-call operator

`<constructor>-><callable>(...)`

The `->`-operator invokes a function from constructors `prototype` within the current `this`-context.
This syntax equals `<constructor>.prototype.<callable>.call(this, ...)`

```javascript
proto Base {
    text: "Text from Base",
    print: func() { console.log(this.text); },
}
proto Sub (Base) {
    text: "Text from Sub",
    print: func() { Base->print(); },
}

(new Sub).print();
// Text from Sub
```

### parent keyword

`parent`

Refers to the parent constructor of the constructor whose prototype defines the current function. `parent` is available wherever `this` is available. It is not limited to `proto`-defined objects. `parent` operates by traversing the prototype chain, starting at `this`.

```javascript
proto Base {
    text: "I'm the base!",
    testFunc: func() {
        return 'testFunc in Base';
    },
    demonstrate: func() {
        console.log(this.text);
        console.log(parent::text);
        console.log(this.testFunc());
        console.log(parent->testFunc());
    },
}

proto Sub (Base) {
    text: "I'm better than the base!",
    testFunc: func() {
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

### self keyword

`self`

Refers to the constructor whose prototype defines the current function. `self` is available wherever `this` is available. It is not limited to `proto`-defined objects. `self` operates by traversing the prototype chain, starting at `this`.

### async function literals and statements

`var fn = func# [<name>] (<parameter list>) { };`

`func# <name> (<parameter list>) { }`

Creates a new asynchronous function. Asynchronous functions cannot return a specific value, they always return an Async object. Asynchronous functions add support for the `await` literal, which will pause execution of the function until its function-argument invokes a callback, passed in via the #-token or until all of its array- or object-argument functions have invoked their callbacks. While the function is paused, other code may run.

*Note: async-functions currently require ES Harmony generators. A future version will drop this requirement (also applies to adria generator functions). Also note: Any exception thrown from an async function after the first await cannot be caught from outside the async function unless callback signification is used (see below).*

In the following examples, a simple sleep function is used. The function follows the NodeJS `callback(err, val)` style and could be replaced with any of NodeJSs callback based functions, i.e. `fs.readFile`.

```javascript
var sleep = func(ms, callback) {
    setTimeout(func() {
        callback(null, '<sleept ' + ms + 'ms>');
    }, ms);
};
```
#### Wrap operation

An asynchronous function can wait for another function to invoke its callback by awaiting the results of a wrap-operation on it. The wrap operation looks like an invocation except that one of the parameters used is the `#` token. A wrap operation marks the position of the callback and sets the functions parameters. If the overhead of this operation is not acceptable in a given situation, the application-wide available Async object also provides a wrap method that does not bind function parameters, allowing the programmer to pre-wrap all required functions.

```javascript
var testAsync = func#() {

    var result = await sleep(1000, #);
    console.log('sleep done', result);

    var sleep1000 = sleep(1000, #);    // wrap is allowed anywhere
    result += await sleep1000;
    console.log('sleep done', result);
};

testAsync();
console.log('start sleeping');

// output:
// start sleeping                               [immediate]
// sleep done <sleept 1000ms>                   [1000ms later]
// sleep done <sleept 1000ms><sleept 1000ms>    [another 1000ms later]
```

#### Waiting in parallel

To wait for multiple functions, `await` supports array or object arguments. The result of an await operation will then equally be an array or object containing the individual function results associated with their original key, but not neccessarily in the order of original association. The latter is only of practical relevance when using object arguments and iterating over the result keys.

The following example combines serial and parallel awaits:

```javascript
var testAsync = func#(callback) {

    console.log('start');

    // wait for single function

    var result = (await sleep(1000, #)) + '\n';
    console.log('single sleep done');

    // wait for an array of functions

    var anArray = await [
        sleep(1200, #),
        sleep(1300, #),
        sleep(500, #),
    ];

    console.log('array sleep done');

    result += anArray.join() + '\n';

    // wait for a set of functions

    var anObject = await {
        sleepOne    : sleep(1200, #),
        sleepTwo    : sleep(1300, #),
        sleepThree  : sleep(500, #),
    };

    console.log('object sleep done');

    result += JSON.stringify(anObject) + '\n';

    callback(null, result);
};

testAsync(func(err, val) {
    console.log('the final result:\n' + val);
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

#### Indicating a callback

Since asynchronous functions cannot directly return a value, it is possible to use `#` in the function's parameter list to signify the position of a callback function, that the `return` statement in an asynchronous function will be mapped to. As a result, `return 'test;'` will translate to `<callback>(null, 'test'); return;` in the usual nodejs (err, val) style.

```javascript
var asyncReturn = func#(#) {

    return await sleep(10, #);
};
```

Additionally, when `#` is provided, Adria ensures that the callback is always invoked at the end of the function or in the case of an uncaught exception.
