adria
=====

Adria language and programmable transcompiler

Syntax
------

Adria's syntax is mostly backwards-compatible with Javascript but adds various new elements. 

### Prototype creation and inheritance:

The following example shows protoypal inheritance. While it looks a bit like classical inheritance, Base and Sub
can both still be extended.

```javascript
var Base = proto {
    text: 'hi',
    constructor: function() {
        console.log(this.constructor.name);
    },    
    greet: function(name) {
      return this.text + ' ' + name;
    }
};

var Sub = proto (Base) {
    text: 'hello',
    greet: function(name) {
      return Base->greet(name + '!'); // essentially Base.prototype.greet.call(this, name + '!')
    }
};

var base = new Base();
var sub = new Sub();

console.log(base.greet('planet'));
console.log(sub.greet('world'));

// Base
// Sub
// hi planet
// hello world!
```

### Extending a prototype

To avoid having to type `.prototype` over and over, Adria adds a prototype access operator.

```javascript
Sub::exclamation = function(name) {
    return Base->greet(name + '!!!');
};

console.log(sub.exclamation('Joe'));

// hello Joe!!!
```

### Properties

Properties can be "assigned" (or be used in a `proto`-literal).

```javascript
Sub::message = property {
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

### For-In key/value support

There is no comma operator in Adria. The following is valid with or - if declared elsewhere - without `var`.

```javascript
for (var key, value in [ 'zero', 'one', 'two', 'three' ]) {
    console.log(key, value);
}

// 0 zero
// 1 one
// 2 two
// 3 three 
```

### Default parameters

```javascript
function defaulted(a = 'a!', b = 'b!') {
    return [a, b];
}

console.log(defaulted());

// ["a!", "b!"]
```
