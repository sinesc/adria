adria
=====

Adria language and programmable transcompiler

Reference
----------

This document details only differences between Javascript and Adria

## Incompatibilities

- Adria adds the following keywords: `proto`, `property`, `parent`, `require`, `resource`, `global` and `assert`
    Keywords may not be used as identifiers, but they may be used as object property names.

- With the exception of block-statements, all statements must be semicolon-terminated. Block-statements are statements that end on a block, i.e. `while { }` but not `do { } while ()`. Note: function/proto-literals are not statements in themselves.

- Adria tries to infer names for function- and proto-literals from the left side of an assignment or property declaration. The name is valid only in the function scope but may prevent the function from accessing a parent scope object with the same name.

## Changed syntax

### default parameters

`<function>(<parameter> [= <default value>[, <parameter> [= <default value> ...]]])`

Default parameters may be provided for parameters not followed by undefaulted parameters.

### for/in statement

`for ([var] <key>[, <value>] in <source>) { ... }`

Support for an optional value argument was added.

### try/catch statement

`try { ... } catch (<type> <exception>) { ... } [ catch ([<type>] <exception>) { ... } ... ] [ finally { ... } ]`

Support for catching specific types of exceptions was added. If an exception is "not instanceof" the first catch-block's type, the exception is passed to the next block until it is caught. If the last catch block is not unconditional and the exception fails that instanceof test as well, it will be rethrown. When mixing unconditional and conditional catch blocks, the unconditional block must come last.

## Added syntax

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
`parent` is available wherever `this` is available. It is **not** limited to `proto`-defined objects.

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