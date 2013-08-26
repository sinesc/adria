/*
 * The MIT License (MIT)
 *
 * Copyright (C) 2013 Dennis Möhlmann <mail@dennismoehlmann.de>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var assert = require('assert');
var SourceNode = require('source-map').SourceNode;
var LanguageParser = require('../language_parser');
var CaptureNode = LanguageParser.CaptureNode;
var Transform = require('../transform.js');
var util = require('../util');
var Set = util.Set;

/**
 * creates a childclass of CaptureNode (an AST node) and links it to given definition-block-name
 *
 * @param definitionName the name of the definition block that translates into the new node type
 * @param constructor new types constructor
 * @return new node type, add methods via prototype as usual
 */
var AdriaNode = function(definitionName, constructor) {

    AdriaNode[definitionName] = (typeof constructor === 'function' ? constructor : function(key, value) { CaptureNode.call(this, key, value); });
    AdriaNode[definitionName].prototype = Object.create(CaptureNode.prototype);
    AdriaNode[definitionName].prototype.constructor = AdriaNode[definitionName];
    return AdriaNode[definitionName];
};


var AccessOperationProtocall = AdriaNode('access_operation_protocall');

AccessOperationProtocall.prototype.toSourceNode = function() {

    var params = this.get('call');
    var result = this.csn();

    result.add([ '.prototype.', this.get('item').toSourceNode(), '.call(this' ]);

    params.each(function(param) {
        result.add([ ', ', param.toSourceNode() ]);
    });

    result.add(')');

    return result;
};


var ConstLiteral = AdriaNode('const_literal');

ConstLiteral.prototype.toSourceNode = function() {

    var stringNode = this.get('string');

    if (stringNode.isNode()) {
        return this.csn(stringNode.value);
    } else {
        return this.csn(this.get('numeric').value);
    }
};


var Scope = AdriaNode('scope', function(key, value) {
    this.locals = new Set();
    CaptureNode.call(this, key, value);
});

Scope.prototype.locals = null;

Scope.prototype.toSourceNode = function() {

    // prefix content with local variable

    var content = CaptureNode.prototype.toSourceNode.call(this);
    var result = this.csn();

    if (this.locals.length > 0) {
        result.add([ 'var ', this.locals.toArray().join(', '), ';' + this.nl() ]);
    }

    result.add(content);

    return result;
};


var Module = AdriaNode('module', function(key, value) {
    this.exports = new Set();
    this.locals = new Set();
    CaptureNode.call(this, key, value);
});

Module.prototype.moduleExport = null;
Module.prototype.exports = null;
Module.prototype.locals = null;

Module.prototype.toSourceNode = function() {

    var parser = this.parser();

    this.nl(1);

    var code = CaptureNode.prototype.toSourceNode.call(this);
    var locals = this.locals.toArray();
    var exports = this.exports.toArray();
    var file = parser.file;

    var result = this.csn('module("' + parser.moduleName + '", function(module) {' + this.nl());

    if (locals.length > 0) {
        result.add('var ' + locals.join(', ') + ';' + this.nl());
    }

    result.add(code);

    if (this.moduleExport !== null) {
        result.add('module.exports = ' + this.moduleExport + ';' + this.nl())
    }

    for (var id in exports) {
        result.add('module.exports.' + exports[id] + ' = ' + exports[id] + ';' + this.nl());
    }

    result.add(this.nl(-1) + '});' + this.nl());

    return result;
};


var InvokeOperation = AdriaNode('invoke_operation');

InvokeOperation.prototype.toSourceNode = function() {

    var result = this.csn();
    result.add('(');

    this.each(function(node, first) {

        if (first === false) {
            result.add(', ');
        }

        result.add(node.toSourceNode());
    });

    result.add(')');

    return result;
};


var FunctionLiteral = AdriaNode('function_literal', function(key, value) {
    this.defaultArgs = [ ];
    CaptureNode.call(this, key, value);
});

AdriaNode['function_statement'] = FunctionLiteral;

FunctionLiteral.prototype.defaultArgs = null;
FunctionLiteral.prototype.name = null;

FunctionLiteral.prototype.toSourceNode = function() {

    // indent child content, compensate by not indenting at opening {

    this.nl(1);

    // fetch function name either directly from function, or if not given, from left side of assignment

    var nameNode = this.get('name');

    if (nameNode.isNode() === false) {
        nameNode = this.ancestor(null, 'expression|dec_def|proto_body_item');

        if (nameNode !== null) {

            if (nameNode.value === 'proto_body_item') {

                // fetch name from prototype literal item

                this.name = nameNode.get('key').toSourceNode();

            } else if (nameNode.value === 'expression') {

                // fetch name from left side of assignment (use only last fragment of symbol)

                var children = nameNode.children;
                var id, found = -1;

                for (id = 0; id < children.length; id++) {
                    if (children[id].key === 'assignment_op') {
                        found = id - 1;
                        break;
                    }
                }

                if (found !== -1 && children[found].value === 'access_operation_member') {
                    this.name = children[found].csn(children[found].get('item').value);
                }
            }
        }

    } else {

        this.name = nameNode.toSourceNode();
    }

    // construct result string

    var result = this.csn();
    result.add('function');

    if (this.name !== null) {
        result.add([ ' ', this.name ]);
    }

    result.add('(');
    result.add(this.get('param_list').toSourceNode());
    result.add(') {' + this.nl());

    for (var id in this.defaultArgs) {
        result.add([ this.defaultArgs[id], ';' + this.nl() ]);
    }

    result.add([ this.get('body').toSourceNode(), this.nl(-1) + '}' ]);

    return result;
};


var FunctionParamList = AdriaNode('function_param_list');

FunctionParamList.prototype.toSourceNode = function() {

    var name, defaultArg, valueNode;
    var result = this.csn();
    var functionNode = this.ancestor('function');

    this.eachKey('item', function(node) {

        name = node.get('name').toSourceNode();

        result.add(name);

        // check for default args, push those to FunctionLiteral's defaultArgs property

        valueNode = node.get('value');

        if (valueNode.isNode()) {

            defaultArg = new SourceNode();
            defaultArg.add([ name, ' = (', name, ' !== undefined ? ', name, ' : (', valueNode.toSourceNode(), '))' ]);
            functionNode.defaultArgs.push(defaultArg);
        }
    });

    return result.join(', ');
};


var BaseLiteral = AdriaNode('base_literal');

BaseLiteral.prototype.toSourceNode = function() {

    var result = '';

    this.each(function(child) {
        switch (child.key) {
            case 'numeric':
            case 'string':
            case 'regexp':
            case 'ident':
            case 'brace':
                result += this.csn(child.value);
                break;

            default:
                result += child.toSourceNode();
        }
    });

    return result;
};


var WhileStatement = AdriaNode('while_statement');

WhileStatement.prototype.toSourceNode = function() {

    var result = this.csn();
    result.add([ 'while (', this.get('condition').toSourceNode(), ') {' + this.nl(1) ]);
    result.add(this.get('body').toSourceNode());
    result.add(this.nl(-1) + '}');

    return result;
};


var IfStatement = AdriaNode('if_statement');

IfStatement.prototype.toSourceNode = function() {

    var result = this.csn();
    result.add([ 'if (', this.get('condition').toSourceNode(), ') {' + this.nl(1) ]);
    result.add([ this.get('if_body').toSourceNode(), this.nl(-1) + '}' ]);

    var elseIf = this.get('else_if');

    if (elseIf.isNode()) {

        result.add([' else ', elseIf.toSourceNode() ]);

    } else {

        var elseBody = this.get('else_body');

        if (elseBody.isNode()) {
            result.add([ ' else {' + this.nl(1), elseBody.toSourceNode(), this.nl(-1) + '}' ]);
        }
    }

    return result;
};


var SwitchStatement = AdriaNode('switch_statement');

SwitchStatement.prototype.toSourceNode = function() {

    var result = this.csn();
    result.add([ 'switch (', this.get('value').toSourceNode(), ') {', this.nl(1) ]);

    // cases

    this.eachKey('case', function(caseNode) {

        result.add(['case ', caseNode.get('match').toSourceNode(), ':' + this.nl(1) ]);
        result.add(caseNode.get('body').toSourceNode());
        result.add(this.nl(-1));
    });

    // default case

    var defaultNode = this.get('default');

    if (defaultNode.isNode()) {
        result.add('default:' + this.nl(1));
        result.add(defaultNode.get('body').toSourceNode());
        result.add(this.nl(-1));
    }

    result.add(this.nl(-1) + '}');

    return result;
};


var ForCountStatement = AdriaNode('for_count_statement');

ForCountStatement.prototype.toSourceNode = function() {

    var initNode = this.get('init');
    var init;

    if (initNode.value === 'var_def') {

        var varDefs = this.csn();

        initNode.eachKey('item', function(node) {

            var valueNode = node.get('value');
            var nameNode = node.get('name');

            if (valueNode.isNode()) {
                var varDef = new SourceNode();
                varDef.add([ nameNode.toSourceNode(), ' = ', valueNode.toSourceNode() ]);
                varDefs.add(varDef);
            } else {
                varDefs.add(nameNode.toSourceNode);
            }
        });

        init = new SourceNode();
        init.add([ 'var ', varDefs.join(', ') ]);

    } else {

        init = initNode.toSourceNode();
    }

    var test = this.get('test').toSourceNode();
    var condOp = this.get('cond_op').toSourceNode();

    var result = this.csn();
    result.add([ 'for (', init, '; ', test, ';', condOp, ') {' + this.nl(1) ]);
    result.add(this.get('body').toSourceNode());
    result.add(this.nl(-1) + '}');

    return result;
};


var ForInStatement = AdriaNode('for_in_statement');

ForInStatement.prototype.toSourceNode = function() {

    var keyNode = this.get('key');
    var valueNode = this.get('value');

    if (this.get('var').isNode()) {

        var locals = this.ancestor(null, 'scope|module').locals;
        locals.add(keyNode.value);

        if (valueNode.isNode()) {
            locals.add(valueNode.value);
        }
    }

    var source = this.get('source').toSourceNode();
    var key = keyNode.toSourceNode();

    var result = this.csn();
    result.add('for (');
    result.add(key);
    result.add(' in ');
    result.add(source);
    result.add(') {' + this.nl(1));

    if (valueNode.isNode()) {
        result.add([ valueNode.toSourceNode(), ' = ', source, '[', key, '];', this.nl() ]);
    }

    result.add([ this.get('body').toSourceNode(), this.nl(-1), '}' ]);

    return result;
};


var ObjectLiteral = AdriaNode('object_literal');
AdriaNode['proto_body_property'] = ObjectLiteral;

ObjectLiteral.prototype.toSourceNode = function() {

    var items = new SourceNode();

    // indent now, so that children will be indented. correct for this by not indenting during return

    this.nl(1);

    this.each(function(child) {
        var item = new SourceNode();
        item.add(child.get('key').csn(child.get('key').value));
        item.add(': ');
        item.add(child.get('value').toSourceNode());
        items.add(item);
    });

    var result =  this.csn();

    if (items.toString().length >= 60) {

        result.add('{' + this.nl());
        result.add(items.join(',' + this.nl()));
        result.add(this.nl() + this.nl(-1) + '}');

    } else {

        this.nl(-1);
        result.add('{ ');
        result.add(items.join(', '));
        result.add(' }');
    }

    return result;
};


var ArrayLiteral = AdriaNode('array_literal');

ArrayLiteral.prototype.toSourceNode = function() {

    var items = new SourceNode();

    // indent now, so that children will be indented. correct for this by not indenting during return

    this.nl(1);

    this.each(function(child) {
        items.add(child.toSourceNode());
    });

    var result = this.csn();

    if (items.toString().length >= 60) {

        result.add('[' + this.nl());
        result.add(items.join(',' + this.nl()));
        result.add(this.nl() + this.nl(-1) + ']');

    } else {

        this.nl(-1);
        result.add('[ ');
        result.add(items.join(', '));
        result.add(' ]');
    }

    return result;
};


var Expression = AdriaNode('expression');

Expression.prototype.toSourceNode = function() {

    var children = this.children;
    var child;
    var propertyAssignSplit = -1;
    var result = this.csn();

    for (var id in children) {
        child = children[id];

        if (children[+id+1] !== undefined && children[+id+1].key === 'passignment_op') {
            propertyAssignSplit = +id + 1;
            break;
        }

        switch (child.key) {
            case 'member':
                result.add(child.csn('.' + child.children[0].value));
                break;
            case 'index':
                result.add(child.csn('['));
                result.add(child.toSourceNode());
                result.add(child.csn(']'));
                break;
            case 'proto':
                result.add(child.csn('.prototype.' + child.children[0].value));
                break;
            case 'call':
            case 'pcall':
                result.add(child.csn(child.toSourceNode()));
                break;
            case 'ident':
            case 'brace_op':
            case 'xfix_op':
                result.add(child.csn(child.value));
                break;
            case 'unary_op':
                result.add(child.csn(child.value.search(/[a-z]/) > -1 ? child.value + ' ' : child.value));
                break;
            case 'binary_op':
            case 'assignment_op':
            case 'ternary_op':
                result.add([ ' ', child.csn(child.value), ' ' ]);
                break;
            default:
                result.add(child.toSourceNode());
                break;
        }
    }

    if (propertyAssignSplit > -1) {

        result.prepend('Object.defineProperty(');
        child = children[propertyAssignSplit - 1];

        switch (child.key) {
            case 'member':
                result.add(", '" + child.children[0].value + "',");
                break;
            case 'index':
                result.add(', ');
                result.add(child.toSourceNode());
                result.add(', ');
                break;
            case 'proto':
                result.add(".prototype, '" + child.children[0].value + "', ");
                break;
        }

        if (children[propertyAssignSplit].value === ':=') {
            result.add('{' + this.nl(1) + 'value: ');
            result.add(children[propertyAssignSplit + 1].toSourceNode());
            result.add(',' + this.nl() + 'writable: false' + this.nl(-1) + '})');
        } else {
            result.add(children[propertyAssignSplit + 1].toSourceNode());
            result.add(')');
        }
    }

    return result;
};


var ProtoLiteral = AdriaNode('proto_literal', function(key, value) {
    this.constructorArgs = [ ];
    this.constructorDefaults = [ ];
    CaptureNode.call(this, key, value);
});

ProtoLiteral.prototype.constructorArgs = null;
ProtoLiteral.prototype.constructorBody = null;
ProtoLiteral.prototype.constructorDefaults = null;
ProtoLiteral.prototype.name = '';

ProtoLiteral.prototype.toSourceNode = function() {

    // fetch proto name either directly from proto, or if not given, from left side of assignment

    var nameNode = this.get('name');

    if (nameNode.isNode() === false) {
        this.name = this.ancestor(null, 'dec_def|module_statement|export_statement').get('name').value;
    } else {
        this.name = nameNode.value;
    }

    // get parent name

    var parentNode = this.get('parent');
    var haveParent = parentNode.isNode();

    // generate output

    var result = this.csn('(function(' + (haveParent ? '___parent' : '') + ') {' + this.nl(1));
    var body = this.get('body').toSourceNode();

    // user- or default-constructor

    if (this.constructorBody !== null) {

        result.add('function ' + this.name + '(');
        result.add(this.constructorArgs);
        result.add(') {' + this.nl(1));

        for (var id in this.constructorDefaults) {
            result.add(this.constructorDefaults);
            result.add(';' + this.nl());
        }

        result.add(this.constructorBody);
        result.add(this.nl(-1) + '}' + this.nl() + this.nl());

    } else {

        result.add('function ' + this.name + '() {');

        if (haveParent) {
            result.add(this.nl(1) + '___parent.apply(this, arguments);' + this.nl(-1));
        }

        result.add('}' + this.nl() + this.nl());
    }

    // chain to parent

    if (haveParent) {
        result.add(this.name + '.prototype = Object.create(___parent.prototype);' + this.nl());
        result.add(this.name + '.prototype.constructor = ' + this.name + ';' + this.nl() + this.nl());
    }

    // body elements

    result.add(body);

    // close and return

    result.add(this.nl() + 'return ' + this.name + ';' + this.nl(-1));
    result.add('})(');
    result.add(parentNode.toSourceNode());
    result.add(')');

    return result;
};


var ProtoBodyItem = AdriaNode('proto_body_item');

ProtoBodyItem.prototype.toSourceNode = function()  {

    var protoNode = this.ancestor(null, 'proto_literal')
    var constructorName = protoNode.name;
    var ownName = this.get('key').value;

    // set constructor attributes in ProtoLiteral, do the rest ourselves

    if (ownName === 'constructor') {

        var functioNode = this.path('value.function');
        protoNode.constructorArgs = functioNode.get('param_list').toSourceNode();
        protoNode.constructorBody = functioNode.get('body').toSourceNode();
        protoNode.constructorDefaults = functioNode.defaultArgs;
        return this.csn();

    } else {

        var valueNode = this.get('value');
        var result;

        if  (valueNode.value === 'proto_body_property') {

            result = this.csn('Object.defineProperty(' + constructorName + '.prototype, ' + ownName + ', ');
            result.add(valueNode.toSourceNode());
            result.add(');' + this.nl());
            return result;

        } else {

            result = this.csn(constructorName + '.prototype.' + ownName + ' = ');
            result.add(valueNode.toSourceNode());
            result.add(';' + this.nl());
            return result;
        }
    }
};


var ReturnStatement = AdriaNode('return_statement');

ReturnStatement.prototype.toSourceNode = function() {

    var result = this.csn();

    switch (this.get('type').value) {

        case 'return':
            result.add('return ');
            result.add(this.get('value').toSourceNode());
            result.add(';' + this.nl());
            break;

        default:
            throw Error('!todo');
            break;
    }

    return result;
};


var CatchSpecifics = AdriaNode('catch_specifics');
var catchSpecificsId = 1;

CatchSpecifics.prototype.toSourceNode = function() {

    var name = '___exc' + (catchSpecificsId++);

    var result = this.csn();
    result.add(' catch (' + name + ') {' + this.nl(1));

    // specifics

    this.eachKey('specific', function(node, first, last) {

        if (first !== true) {
            result.add(' else ');
        }

        result.add('if (' + name + ' instanceof ');
        result.add(node.get('type').toSourceNode());
        result.add(') {' + this.nl(1));
        result.add('var ' + node.get('value').value + ' = ' + name + ';' + this.nl());
        result.add(node.get('body').toSourceNode());
        result.add(this.nl(-1) + '}');
    });

    // optional all catch

    var allNode = this.get('catch');

    if (allNode.isNode()) {

        result += ' else { ' + this.nl(1);
        result += 'var ' + allNode.get('value').value + ' = ' + name + ';' + this.nl();
        result += allNode.get('body').toString();
        result += this.nl(-1) + '}';

    } else {

        result += ' else { ' + this.nl(1);
        result += 'throw ' + name + ';' + this.nl();
        result += this.nl(-1) + '}';
    }

    result += this.nl(-1) + '}';

    return result;
};


var CatchAll = AdriaNode('catch_all');

CatchAll.prototype.toSourceNode = function() {

    var result = this.csn();

    result.add(' catch (');
    result.add(this.get('value').toSourceNode());
    result.add(') {' + this.nl(1));
    result.add(this.get('body').toSourceNode());
    result.add(this.nl(-1) + '}');

    return result;
};


var TryCatchFinallyStatement = AdriaNode('try_catch_finally_statement');

TryCatchFinallyStatement.prototype.toSourceNode = function() {

    var result = this.csn();

    result.add('try {' + this.nl(1));
    result.add(this.get('body').toSourceNode());
    result.add(this.nl(-1) + '}');

    var allNode = this.get('all');

    if (allNode.isNode()) {
        result.add(allNode.toSourceNode());
    } else {
        result.add(this.get('specifics').toSourceNode());
    }

    var finallyNode = this.get('finally');

    if (finallyNode.isNode()) {
        result.add('finally {' + this.nl(1));
        result.add(finallyNode.toSourceNode());
        result.add(this.nl(-1) + '}');
    }

    return result;
};


var AssertStatement = AdriaNode('assert_statement');

AssertStatement.prototype.toSourceNode = function() {

    var result = this.csn();

    if (this.parser().transform.options.assert) {
        result.add('assert(');
        result.add(CaptureNode.prototype.toSourceNode.call(this));
        result.add(');' + this.nl());
    }

    return result;
};


var Statement = AdriaNode('statement');
AdriaNode['interruptible_statement'] = Statement;

Statement.prototype.toSourceNode = function() {

    var type = this.children[0].key;
    var result = this.csn();

    result.add(CaptureNode.prototype.toSourceNode.call(this));

    switch (type) {
        case 'expression':
            result.add(';' + this.nl());
            break;

        default:
            result.add(this.nl());
    }

    return result;
};


var RequireLiteral = AdriaNode('require_literal');

RequireLiteral.prototype.toSourceNode = function() {

    var fileNode = this.get('file');

    this.parser().resultData.requires.add(fileNode.toSourceNode().toString().slice(1, -1));

    var result = this.csn();
    result.add('require(');
    result.add(fileNode.toSourceNode());
    result.add(')');
    return result;
};

/*
 * parent accessor
 */
/*
var ParentCall = AdriaNode('parent_call');

ParentCall.prototype.toString = function() {

    var node = this.ancestor(null, 'assignment|proto_literal');

    if (node.isNode()) {

        var funcNode = this.ancestor('function', 'function_literal');
        var params = this.get('param_list').toString();

        if (node.value === 'proto_literal') {

            var parentName = node.get('parent').toString();
            return (parentName !== '' ? parentName : 'Object') + '.prototype.' + funcNode.name + '.call(this' + (params !== '' ? ', ' + params : '') + ')';

        } else if (node.value === 'assignment') {

            var ownName = node.get('name').toString();
            ownName = ownName.slice(0, ownName.lastIndexOf('.prototype'));
            //ownName = ownName.slice(ownName.lastIndexOf('.') + 1);

            return 'Object.getPrototypeOf(' + ownName + '.prototype).' + funcNode.name + '.call(this' + (params !== '' ? ', ' + params : '') + ')';
        }

    }

    throw new Error('usage of parent keyword restricted to prototype methods');
};
*/

var ModuleStatement = AdriaNode('module_statement');

ModuleStatement.prototype.toSourceNode = function() {

    var name = this.get('name').value;
    var moduleNode = this.ancestor(null, 'module')
    moduleNode.moduleExport = name;
    moduleNode.locals.add(name);

    var result = this.csn();
    result.add(name);
    result.add(' = ');
    result.add(this.get('value').toSourceNode());
    result.add(';' + this.nl());
    return result;
};


var ExportStatement = AdriaNode('export_statement');

ExportStatement.prototype.toSourceNode = function() {

    var name = this.get('name').value;
    var moduleNode = this.ancestor(null, 'module');
    moduleNode.exports.add(name);
    moduleNode.locals.add(name);

    var result = this.csn();
    result.add(name);
    result.add(' = ');
    result.add(this.get('value').toSourceNode());
    result.add(';' + this.nl());
    return result;
};


var GlobalDef = AdriaNode('global_def');

GlobalDef.prototype.toSourceNode = function() {

    var valueNode;
    var globals = this.parser().resultData.globals;
    var result = this.csn();
    var nl = this.nl();

    this.eachKey('item', function(node) {
        nameNode = node.get('name');
        valueNode = node.get('value');

        globals.add(nameNode.value);

        if (valueNode.isNode()) {
            result.add(nameNode.value + ' = ');
            result.add(valueNode.toSourceNode());
            result.add(';' + nl);
        }
    });

    return result;
};


var Ident = AdriaNode('ident');
AdriaNode['name'] = Ident;

Ident.prototype.toSourceNode = function() {
    return this.csn(this.value);
};


var VarDef = AdriaNode('var_def');

VarDef.prototype.toSourceNode = function() {

    var valueNode;
    var locals = this.ancestor(null, 'scope|module').locals;
    var result = this.csn();
    var nl = this.nl();

    this.eachKey('item', function(node) {
        nameNode = node.get('name');
        valueNode = node.get('value');

        locals.add(nameNode.value);

        if (valueNode.isNode()) {
            result.add(nameNode.value + ' = ');
            result.add(valueNode.toSourceNode());
            result.add(';' + nl);
        }
    });

    return result;
};

module.exports = AdriaNode;