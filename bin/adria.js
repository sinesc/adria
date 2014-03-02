#!/bin/sh
':' //; exec "`command -v nodejs || command -v node`" --harmony "$0" "$@"
/**
 * Adria transcompiler
 * 
 * Copyright (c) 2014 Dennis Möhlmann
 * Licensed under the MIT license.
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
;(function(___module, ___require, window) {
"use strict";
var require, resource, module;
var log;
var Exception;
(function() {
    var resources = { };
    var modules = { };
    Exception = function Exception(message) {
        this.message = message === undefined ? this.message : message;
        this.name = this.constructor.name === undefined ? 'Exception' : this.constructor.name;
        var current = this;
        var ownTraceSize = 1;
        while ((current = Object.getPrototypeOf(current)) instanceof Error) {
            ownTraceSize++;
        }
        var stack = Error().stack.split('\n').slice(ownTraceSize);
        stack[0] = this.name + ': ' + message;
        this.stack = stack.join('\n');
    };
    Exception.prototype = Object.create(Error.prototype);
    Exception.prototype.constructor = Exception;
    var getResource = function(name) {
        return resources[name];
    };
    var Module = function(name, func) {
        this.name = name;
        this.exports = Object.create(null);
        this.func = func;
    };
    Module.prototype.exports = null;
    Module.prototype.name = '';
    module = function(name, func) {
        modules[name] = new Module(name, func);
    };
    resource = function(name, data) {
        resources[name] = data;
    };
    require = function(file) {
        var module = modules[file];
        if (typeof module.func === 'function') {
            var func = module.func;
            delete module.func;
            func(module, getResource);
        }
        return module.exports;
    };
})();
resource('../definition/adria/control.sdt', '\n\
/*\n\
 * multipurpose code block\n\
 */\n\
\n\
block {\n\
    entry -> "{" -> "}" -> return\n\
    "{" -> statement:statement -> "}"\n\
    statement:statement -> statement:statement\n\
}\n\
\n\
/*\n\
 * break/return/continue\n\
 */\n\
\n\
return_statement {\n\
    entry -> "return":type -> ";" -> return\n\
    "return":type -> literal_expression:value -> ";"\n\
}\n\
\n\
flow_statement {\n\
    entry -> "break":type -> ";" -> return\n\
    entry -> "continue":type -> ";" -> return\n\
}\n\
\n\
/*\n\
 * if...else if...else block\n\
 */\n\
\n\
if_conditional {\n\
    entry -> "if" -> "(" -> expression:condition -> ")" -> block:body -> return\n\
}\n\
\n\
if_unconditional {\n\
    entry -> block:body -> return\n\
}\n\
\n\
if_statement {\n\
\n\
    entry -> if_conditional:if -> return\n\
    if_conditional:if -> "else"[if_to_elseif] -> if_conditional:else_if -> return\n\
    if_conditional:else_if -> "else"[elseif_to_elseif] -> if_conditional:else_if\n\
\n\
    if_conditional:if -> "else"[if_to_else] -> if_unconditional:else -> return\n\
    if_conditional:else_if -> "else"[elseif_to_else] -> if_unconditional:else\n\
}\n\
\n\
/*\n\
 * while\n\
 */\n\
\n\
do_while_statement {\n\
    entry -> "do" -> block:body -> "while" -> "(" -> expression:condition -> ")" -> ";" -> return\n\
}\n\
\n\
while_statement {\n\
    entry -> "while" -> "(" -> expression:condition -> ")" -> block:body -> return\n\
}\n\
\n\
/*\n\
 * for\n\
 */\n\
\n\
for_count_init {\n\
    entry -> var_statement:init -> return\n\
    entry -> expression:init -> ";" -> return\n\
}\n\
\n\
for_count_statement {\n\
    entry -> "for" -> "(" -> for_count_init -> expression:test[full] -> ";" -> expression:cond_op -> ")" -> block:body -> return\n\
    "(" -> expression:test[short] -> ")"\n\
}\n\
\n\
/*\n\
 * for ([var] key[, value] in source) { ... }\n\
 */\n\
\n\
for_in_statement {\n\
    entry -> "for" -> "(" -> ident:key -> "in" -> expression:source -> ")" -> block:body -> return\n\
    "(" -> "var":var -> ident:key\n\
    ident:key -> "," -> ident:value -> "in"\n\
}\n\
\n\
/*\n\
 * switch statement !todo scoping how?\n\
 */\n\
\n\
switch_case {\n\
    entry -> "case" -> expression:match -> ":" -> switch_block:body -> return\n\
    ":" -> return\n\
}\n\
\n\
switch_default {\n\
    entry -> "default" -> ":" -> switch_block:body -> return\n\
}\n\
\n\
switch_block {\n\
    entry -> statement:statement -> return\n\
    statement:statement -> statement:statement\n\
}\n\
\n\
switch_statement {\n\
    entry -> "switch" -> "(" -> expression:value -> ")" -> "{"\n\
    "{" -> switch_case:case -> "}"\n\
    switch_case:case -> switch_case:case\n\
    switch_case:case -> switch_default:default -> "}"\n\
    "}" -> return\n\
}\n\
\n\
/*\n\
 * throw try catch finally\n\
 */\n\
\n\
throw_statement {\n\
    entry -> "throw" -> expression:exception -> ";" -> return\n\
}\n\
\n\
try {\n\
    entry -> "try" -> block:body -> return\n\
}\n\
\n\
catch_specific {\n\
    entry -> "catch" -> "(" -> expression:type -> ident:value -> ")" -> block:body -> return\n\
}\n\
\n\
catch_all {\n\
    entry -> "catch" -> "(" -> ident:value -> ")" -> block:body -> return\n\
}\n\
\n\
catch {\n\
    entry -> catch_all:all -> return\n\
    entry -> catch_specific:specific -> return\n\
    catch_specific:specific -> catch_specific:specific\n\
    catch_specific:specific -> catch_all:all\n\
}\n\
\n\
finally {\n\
    entry -> "finally" -> block:body -> return\n\
}\n\
\n\
try_catch_finally_statement {\n\
    entry -> try:try -> catch:catch -> return\n\
    catch:catch -> finally:finally -> return\n\
}\n\
');
resource('../definition/adria/expression.sdt', '\n\
literal_expression {\n\
    entry -> complex_literal -> return\n\
    entry -> expression:expression -> return\n\
}\n\
\n\
expression {\n\
    // a  and  a()\n\
    entry -> base_literal:item -> return\n\
    base_literal:item -> invoke_operation:call -> return\n\
\n\
    // a && b\n\
    base_literal:item -> binary_operation -> return\n\
    invoke_operation:call -> binary_operation\n\
\n\
    // a.b   a->b().c || ...\n\
    base_literal:item -> access_operation -> return\n\
    invoke_operation:call -> access_operation -> binary_operation\n\
    access_operation -> ternary_operation -> return\n\
\n\
    // a?b:c\n\
    base_literal:item -> ternary_operation\n\
    invoke_operation:call -> ternary_operation\n\
\n\
    // a = b   or   a++\n\
    entry -> ident:ident -> assignment_operation -> return\n\
    entry -> storage_literal:storage -> assignment_operation\n\
    assignment_operation -> binary_operation\n\
\n\
    entry -> prefix_operation -> return\n\
    entry -> unary_operation -> return\n\
\n\
    // (a || b).c   (a || b)()\n\
\n\
    entry -> brace_operation -> return\n\
    brace_operation -> invoke_operation:call\n\
    brace_operation -> access_operation\n\
\n\
    // ()()\n\
\n\
    invoke_operation:call -> invoke_operation:call\n\
\n\
    // end on async wrap\n\
\n\
    brace_operation -> async_wrap_operation:wrap -> return\n\
    invoke_operation:call -> async_wrap_operation:wrap\n\
    base_literal:item -> async_wrap_operation:wrap\n\
}\n\
\n\
brace_operation {\n\
    // braced expression, continues with binary or access operation\n\
    entry -> "(":brace_op -> expression:item -> ")":brace_op -> return\n\
    ")":brace_op -> binary_operation -> return\n\
    ")":brace_op -> access_operation -> return\n\
    ")":brace_op -> invoke_operation:call -> return\n\
    invoke_operation:call -> binary_operation\n\
    invoke_operation:call -> access_operation\n\
    invoke_operation:call -> invoke_operation:call\n\
}\n\
\n\
unary_operation {\n\
    entry -> unary_operator -> expression:item -> return\n\
}\n\
\n\
binary_operation {\n\
    entry -> binary_operator -> expression:item -> return\n\
}\n\
\n\
ternary_operation {\n\
    entry -> "?":ternary_op -> literal_expression:true_expression -> ":":ternary_op -> literal_expression:false_expression -> return\n\
}\n\
\n\
assignment_operation {\n\
    entry -> assignment_operator -> literal_expression:value -> return\n\
    entry -> xfix_operator -> return\n\
}\n\
\n\
prefix_operation {\n\
    // ++expression.assignable\n\
    entry -> xfix_operator -> ident:ident -> return\n\
    xfix_operator -> expression:item -> access_operation_types_assignable -> return\n\
}\n\
\n\
property_assignment_operation {\n\
    // a::b = property...\n\
    entry -> "=":passignment_op -> property_literal:value -> return\n\
    entry -> ":=":passignment_op -> literal_expression:value -> return\n\
}\n\
\n\
access_operation {\n\
    // degraded from generic expression to member access, cannot go back to generic, i.e. (a || b).c.d::e ...\n\
    entry -> access_operation_types -> return\n\
    access_operation_types -> invoke_operation:call -> return\n\
    access_operation_types -> async_wrap_operation:wrap -> return\n\
    access_operation_types -> access_operation -> return\n\
    invoke_operation:call -> access_operation\n\
\n\
    entry -> access_operation_types_assignable -> property_assignment_operation -> return\n\
    entry -> access_operation_types_assignable -> assignment_operation -> return\n\
\n\
    invoke_operation:call -> invoke_operation:call\n\
    invoke_operation:call -> async_wrap_operation:wrap\n\
}\n\
\n\
invoke_operation {\n\
    entry -> "(" -> ")" -> return\n\
    "(" -> invoke_param_list -> ")"\n\
}\n\
\n\
async_wrap_operation {\n\
    entry -> "(" -> async_wrap_param_list -> ")" -> return\n\
}\n\
\n\
/*\n\
 * ary ops\n\
 */\n\
\n\
unary_operator {\n\
    entry -> "+":unary_op -> return\n\
    entry -> "-":unary_op -> return\n\
    entry -> "!":unary_op -> return\n\
    entry -> "new":unary_op -> return\n\
    entry -> "typeof":unary_op -> return\n\
    entry -> "delete":unary_op -> return\n\
}\n\
\n\
binary_operator {\n\
    entry -> "+":binary_op -> return\n\
    entry -> "-":binary_op -> return\n\
    entry -> "*":binary_op -> return\n\
    entry -> "/":binary_op -> return\n\
    entry -> "%":binary_op -> return\n\
\n\
    entry -> "==":binary_op -> return\n\
    entry -> "===":binary_op -> return\n\
    entry -> "!=":binary_op -> return\n\
    entry -> "!==":binary_op -> return\n\
    entry -> "<":binary_op -> return\n\
    entry -> ">":binary_op -> return\n\
    entry -> "<=":binary_op -> return\n\
    entry -> ">=":binary_op -> return\n\
    entry -> "&&":binary_op -> return\n\
    entry -> "||":binary_op -> return\n\
\n\
    entry -> "&":binary_op -> return\n\
    entry -> "|":binary_op -> return\n\
    entry -> "^":binary_op -> return\n\
    entry -> "<<":binary_op -> return\n\
    entry -> ">>":binary_op -> return\n\
    entry -> "instanceof":binary_op -> return\n\
    entry -> "in":binary_op -> return\n\
}\n\
\n\
/*\n\
 * access ops\n\
 */\n\
access_operation_types_assignable {\n\
    entry -> access_operation_member:member -> return\n\
    entry -> access_operation_index:index -> return\n\
    entry -> access_operation_proto:proto -> return\n\
}\n\
\n\
access_operation_types {\n\
    entry -> access_operation_types_assignable -> return\n\
    entry -> access_operation_protocall:pcall -> return\n\
}\n\
\n\
access_operation_member {\n\
    entry -> "." -> name:item -> return\n\
}\n\
\n\
access_operation_index {\n\
    entry -> "[" -> expression:item -> "]" -> return\n\
}\n\
\n\
access_operation_proto {\n\
    entry -> "::" -> name:item -> return\n\
}\n\
\n\
access_operation_protocall {\n\
    entry -> "->" -> name:item -> invoke_operation:call -> return\n\
    //invoke_operation:call -> invoke_operation:call\n\
}\n\
\n\
/*\n\
 * invoke op\n\
 */\n\
\n\
invoke_param_list {\n\
    entry -> literal_expression:param -> return\n\
    literal_expression:param -> "," -> literal_expression:param\n\
}\n\
\n\
async_wrap_param_list {\n\
\n\
    // start with lit.exp. or #\n\
\n\
    entry -> literal_expression:param[before]\n\
    entry -> "#":param -> return\n\
\n\
    // lit.exp may be followed by another or by a #\n\
\n\
    literal_expression:param[before] -> ","[before] -> literal_expression:param[before]\n\
    literal_expression:param[before] -> ","[before] -> "#":param\n\
\n\
    // # may be followed by another literal expression, but must remain the only #\n\
\n\
    "#":param -> ","[after] -> literal_expression:param[after]\n\
    literal_expression:param[after] -> ","[after]-> literal_expression:param[after] -> return\n\
}\n\
\n\
\n\
/*\n\
 * assignment ops\n\
 */\n\
\n\
assignment_operator {\n\
    entry -> "=":assignment_op -> return\n\
\n\
    entry -> "+=":assignment_op -> return\n\
    entry -> "-=":assignment_op -> return\n\
    entry -> "*=":assignment_op -> return\n\
    entry -> "/=":assignment_op -> return\n\
    entry -> "%=":assignment_op -> return\n\
\n\
    entry -> "&&=":assignment_op -> return\n\
    entry -> "||=":assignment_op -> return\n\
    entry -> "^^=":assignment_op -> return\n\
\n\
    entry -> "&=":assignment_op -> return\n\
    entry -> "|=":assignment_op -> return\n\
    entry -> "^=":assignment_op -> return\n\
    entry -> "<<=":assignment_op -> return\n\
    entry -> ">>=":assignment_op -> return\n\
}\n\
\n\
xfix_operator {\n\
    entry -> "++":xfix_op -> return\n\
    entry -> "--":xfix_op -> return\n\
}');
resource('../definition/adria/literal.sdt', '\n\
/*\n\
 * object literal\n\
 */\n\
\n\
object_literal_item {\n\
    entry -> name:key -> ":"\n\
    entry -> string:key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
\n\
object_literal {\n\
    entry -> "{" -> "}" -> return\n\
    "{" -> object_literal_item:item -> "}"\n\
    object_literal_item:item -> ","[any] -> object_literal_item:item\n\
\n\
    // allow comma behind last item\n\
\n\
    object_literal_item:item -> ","[last] -> "}"\n\
}\n\
\n\
/*\n\
 * property literal\n\
 */\n\
\n\
property_literal {\n\
    entry -> "prop" -> property_accessor -> return\n\
    entry -> "prop" -> property_data -> return\n\
}\n\
\n\
property_accessor {\n\
    entry -> "{" -> property_accessor_item:item -> "}" -> return\n\
    property_accessor_item:item -> ","[any] -> property_accessor_item:item\n\
    property_accessor_item:item -> ","[last] -> "}" -> return\n\
}\n\
\n\
property_data {\n\
    entry -> "{" -> property_data_item:item -> "}" -> return\n\
    property_data_item:item -> ","[any] -> property_data_item:item\n\
    property_data_item:item -> ","[last] -> "}" -> return\n\
}\n\
\n\
property_accessor_item {\n\
    entry -> "inherit":inherit -> "get":key[inherited] -> return\n\
    "inherit":inherit -> "set":key[inherited] -> return\n\
\n\
    entry -> "default":key -> ":"\n\
    entry -> "storage":key -> ":"[storage] -> string:value -> return\n\
    entry -> "get":key -> ":"\n\
    entry -> "set":key -> ":"\n\
    entry -> "configurable":key -> ":"\n\
    entry -> "enumerable":key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
\n\
property_data_item {\n\
    entry -> "value":key -> ":"\n\
    entry -> "writable":key -> ":"\n\
    entry -> "configurable":key -> ":"\n\
    entry -> "enumerable":key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
\n\
/*\n\
 * array literal\n\
 */\n\
\n\
array_literal {\n\
    entry -> "[" -> "]" -> return\n\
    "[" -> literal_expression:item -> "]"\n\
    literal_expression:item -> ","[any] -> literal_expression:item\n\
\n\
    // allow comma behind last literal item\n\
\n\
    literal_expression:item -> ","[last] -> "]"\n\
}\n\
\n\
/*\n\
 * scope literal\n\
 */\n\
//!TBD\n\
/*scope_literal {\n\
    entry -> "scope" -> "{" -> block:body -> "}" -> return\n\
}*/\n\
\n\
/*\n\
 * function literals\n\
 */\n\
\n\
async_literal {\n\
    entry -> "func" -> "#":async -> "(" -> ")" -> block:body -> return\n\
    "#":async -> ident:name -> "("\n\
    "(" -> async_param_list:param_list -> ")"\n\
}\n\
\n\
generator_literal {\n\
    entry -> "func" -> "*":generator -> "(" -> ")" -> block:body -> return\n\
    "*":generator -> ident:name -> "("\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
function_literal {\n\
    entry -> "func" -> "(" -> ")" -> block:body -> return\n\
    "func" -> ident:name -> "("\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
proto_body_constructor {\n\
    entry -> function_literal -> return\n\
}\n\
\n\
/*\n\
 * function parameter lists\n\
 */\n\
\n\
function_annotation {\n\
    entry -> name:annotation -> "?":annotation_mod -> return\n\
    name:annotation -> return\n\
}\n\
\n\
function_param {\n\
    entry -> function_annotation -> ident:name\n\
    entry -> ident:name -> return\n\
}\n\
\n\
function_params {\n\
    // standard params: a, b, c ....\n\
    entry -> function_param:item -> return\n\
    function_param:item -> "," -> function_param:item\n\
}\n\
\n\
function_param_default {\n\
    entry -> function_annotation -> ident:name\n\
    entry -> ident:name -> "=" -> expression:value -> return\n\
}\n\
\n\
function_params_default {\n\
    // defaulted params: d = 1, e = 2, f = 3 ....\n\
    entry -> function_param_default:item -> return\n\
    function_param_default:item -> "," -> function_param_default:item\n\
}\n\
\n\
function_param_rest {\n\
    entry -> "..." -> function_param:rest -> return\n\
}\n\
\n\
function_params_optional {\n\
    // optional params: a [ b, c [ d ] ] e\n\
    entry -> "[" -> function_params_default -> "]" -> return\n\
    "[" -> function_params_optional:opt_items -> "]"\n\
\n\
    function_params_optional:opt_items -> ","[opt_to_default] -> function_params_default\n\
    function_params_default -> ","[default_to_opt] -> function_params_optional:opt_items\n\
    function_params_optional:opt_items -> ","[opt_to_opt] -> function_params_optional:opt_items\n\
}\n\
\n\
function_param_list {\n\
\n\
    entry -> function_params -> return\n\
    entry -> function_params_default -> return\n\
    entry -> function_params_optional:opt_items -> return\n\
\n\
    // defaulted params following standard params: a, b, c, d = 1, e = 2, f = 3\n\
\n\
    entry -> function_params -> ","[nodefault_to_default] -> function_params_default -> return\n\
\n\
    // optional params following standard params, possibly with standard params following\n\
\n\
    entry -> function_params -> ","[nodefault_to_optional] -> function_params_optional:opt_items -> return\n\
    function_params_optional:opt_items -> ","[opt_to_nodefault] -> function_params[post_opt] -> return\n\
    function_params_optional:opt_items -> ","[opt_to_opt] -> function_params_optional:opt_items -> return\n\
    function_params[post_opt] -> ","[nodefault_to_optional] // full circle\n\
\n\
    // rest parameter following standard or default\n\
\n\
    entry -> function_param_rest -> return\n\
    function_params -> ","[nodefault_to_rest] -> function_param_rest\n\
    function_params_default -> ","[default_to_rest] -> function_param_rest\n\
}\n\
\n\
async_param_list {\n\
\n\
    //!todo cheapo solution for testing\n\
    entry -> "#":callback -> function_param_list -> return\n\
    entry -> function_param_list -> "#":callback -> return\n\
    entry -> function_param_list -> return\n\
}\n\
\n\
/*\n\
 * require literal\n\
 */\n\
\n\
require_literal {\n\
    // this is really just a function, but it has to be evaluable at compilation time\n\
    entry -> "require" -> "(" -> const_literal:file -> ")" -> return\n\
}\n\
\n\
/*\n\
 * resource\n\
 */\n\
\n\
resource_literal {\n\
    // this is really just a function, but it has to be evaluable at compilation time\n\
    entry -> "resource" -> "(" -> const_literal:file -> ")" -> return\n\
}\n\
\n\
/*\n\
 * generator/async yield\n\
 */\n\
\n\
yield_literal {\n\
    entry -> "yield":type -> return\n\
    "yield":type -> literal_expression:value -> return\n\
}\n\
\n\
await_literal {\n\
    entry -> "await":type -> return\n\
    "await":type -> literal_expression:value -> return\n\
}\n\
\n\
/*\n\
 * interheritance\n\
 */\n\
\n\
parent_literal {\n\
    entry -> "parent" -> return\n\
}\n\
\n\
self_literal {\n\
    entry -> "self" -> return\n\
}\n\
\n\
/*\n\
 * storage\n\
 */\n\
\n\
storage_literal {\n\
    entry -> "storage" -> return\n\
}\n\
\n\
/*\n\
 * literal groups\n\
 */\n\
\n\
const_literal {\n\
    entry -> numeric:numeric -> return\n\
    entry -> string:string -> return\n\
    entry -> regexp:regexp -> return\n\
}\n\
\n\
base_literal {\n\
    // usable in expressions\n\
    entry -> const_literal -> return\n\
    entry -> ident:ident -> return\n\
    entry -> object_literal:object -> return\n\
    entry -> array_literal:array -> return\n\
    entry -> require_literal:require -> return\n\
    entry -> resource_literal:resource -> return\n\
    entry -> parent_literal:parent -> return\n\
    entry -> self_literal:self -> return\n\
    entry -> storage_literal:storage -> return\n\
    entry -> yield_literal:yield -> return\n\
    entry -> await_literal:await -> return\n\
    entry -> "(":brace -> complex_literal -> ")":brace -> return\n\
}\n\
\n\
complex_literal {\n\
    // not directly usable in expressions\n\
    entry -> function_literal:function -> return\n\
    entry -> proto_literal:proto -> return\n\
    entry -> new_proto_literal:newproto -> return\n\
    entry -> generator_literal:generator -> return\n\
    entry -> async_literal:async -> return\n\
}\n\
\n\
literal {\n\
    entry -> base_literal -> return\n\
    entry -> complex_literal -> return\n\
}');
resource('../definition/adria/proto.sdt', '\n\
proto_literal {\n\
\n\
    // proto [ name ] [ ( [ parent ] ) ] body\n\
\n\
    entry -> "proto" -> "(" -> expression:parent -> ")" -> proto_body:body -> return\n\
    "proto" -> ident:name -> "("\n\
    ident:name -> proto_body:body\n\
    "(" -> ")"\n\
    "proto" -> proto_body:body\n\
}\n\
\n\
new_proto_literal {\n\
\n\
    // new parent(...) body\n\
\n\
    entry -> "new" -> expression:parent -> "(" -> ")" -> proto_body:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
proto_body {\n\
    entry -> "{" -> "}" -> return\n\
    "{" -> proto_body_item:item -> "}"\n\
    proto_body_item:item -> ","[any] -> proto_body_item:item\n\
\n\
    // allow comma behind last literal item\n\
\n\
    proto_body_item:item -> ","[last] -> "}"\n\
}\n\
\n\
proto_body_item {\n\
    entry -> "constructor":key -> ":"[constructor] -> proto_body_constructor:value -> return\n\
\n\
    entry -> name:key -> ":"\n\
    entry -> string:key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
    ":" -> property_literal:value -> return\n\
}\n\
\n\
proto_body_constructor {\n\
    entry -> function_literal -> return\n\
}');
resource('../definition/adria/root.sdt', '/*\n\
 * defined in DefinitionParser\n\
 *\n\
 * blockname {                  define a new definition block "blockname" containing textual representations of language definition nodes\n\
 *     ->                       connects two nodes (can be chained)\n\
 *     match:capture[unique]    matches "match" and captures it in the output syntax tree as "capture"\n\
 *                              any nodes with the same match and capture represent the same definition node unless "unique" differs\n\
 *                              capture and unique are optional\n\
 * }\n\
 *\n\
 * defined in LanguageParser\n\
 *\n\
 * entry        a node that attaches itself to the block root (required)\n\
 * return       valid exitpoint for current block. it needs to be reached during parsing or the parsed document\n\
 *              fragment doesn\'t match the block\n\
 * string       matches a string "string" or \'string\'\n\
 * numeric      matches a number [0-9\\.]+ (exponential representation !todo)\n\
 * "word"       matches "word" literally\n\
 * \'[a-z]+\'     matches via regex [a-z]+\n\
 * blockname    jump to definition block "blockname"\n\
 *\n\
 * follow up with :capture to capture the exact match as a node in the output syntax tree\n\
 *\n\
 * defined in AdriaParser::createNode\n\
 *\n\
 * ident        matches identifier of the format [a-zA-Z_\\\\$][a-zA-Z0-9_\\\\$]* except for defined keywords (see AdriaParser::trainSelf)\n\
 * name         matches everything ident matches as well as keywords (see AdriaParser::trainSelf)\n\
 * regexp       matches JavaScript regular expression literals\n\
 */\n\
\n\
 /*\n\
  * the root node for the definition tree (as defined by Parser.initialBlock)\n\
  */\n\
\n\
root {\n\
    entry -> module:module -> return\n\
}\n\
\n\
module {\n\
    entry -> statement:statement -> return\n\
    statement:statement -> statement:statement\n\
}\n\
');
resource('../definition/adria/statement.sdt', '\n\
/*\n\
 * declaration/definition\n\
 */\n\
\n\
module_statement {\n\
    entry -> "module" -> dec_def -> ";" -> return\n\
}\n\
\n\
export_statement {\n\
    entry -> "export" -> dec_def -> ";" -> return\n\
}\n\
\n\
import_statement {\n\
    entry -> "import" -> dec_list -> ";" -> return\n\
}\n\
\n\
var_statement {\n\
    entry -> "var" -> dec_def_list -> ";" -> return\n\
}\n\
\n\
//!todo\n\
/*const_statement {\n\
    entry -> "const" -> dec_def_list -> return\n\
}*/\n\
\n\
global_statement {\n\
    entry -> "global" -> dec_def_list -> ";" -> return\n\
}\n\
\n\
function_statement {\n\
    //entry -> "function" -> ident:name\n\
\n\
    entry -> "func" -> ident:name -> "(" -> ")" -> block:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
proto_statement {\n\
    // proto name [ ( [ parent ] ) ] body\n\
    entry -> "proto" -> ident:name -> "(" -> expression:parent -> ")" -> proto_body:body -> return\n\
    ident:name -> proto_body:body\n\
    "(" -> ")"\n\
}\n\
\n\
generator_statement {\n\
    //entry -> "function" -> "*":generator\n\
\n\
    entry -> "func" -> "*":generator -> ident:name -> "(" -> ")" -> block:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
async_statement {\n\
    //entry -> "function" -> "#":async\n\
\n\
    entry -> "func" -> "#":async -> ident:name -> "(" -> ")" -> block:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
/*\n\
 * assert statement\n\
 */\n\
\n\
assert_statement {\n\
    entry -> "assert" -> invoke_operation:call -> ";" -> return\n\
}\n\
\n\
/*\n\
 * array deconstruction\n\
 */\n\
\n\
/*deconstruct {\n\
    //!todo recursive\n\
    entry -> "[" -> ident:item -> "]" -> "=" -> literal_expression:source -> return\n\
    ident:item -> "," -> ident:item\n\
}*/\n\
\n\
/*\n\
 * interface\n\
 */\n\
\n\
interface_statement {\n\
    entry -> "interface" -> ";" -> return\n\
}\n\
\n\
\n\
/*\n\
 * statement groups\n\
 */\n\
\n\
statement {\n\
\n\
    entry -> var_statement:var -> return\n\
\n\
    entry -> if_statement:if -> return\n\
    entry -> for_in_statement:for_in -> return\n\
    entry -> return_statement:control -> return\n\
    entry -> throw_statement:throw -> return\n\
    entry -> for_count_statement:for_count -> return\n\
    entry -> while_statement:while -> return\n\
    entry -> flow_statement:flow -> return\n\
\n\
    entry -> expression:expression -> ";" -> return\n\
\n\
    entry -> global_statement:global -> return\n\
    entry -> import_statement:import -> return\n\
    entry -> export_statement:export -> return\n\
    entry -> module_statement:module -> return\n\
    entry -> interface_statement:interface -> return\n\
\n\
    entry -> function_statement:function -> return\n\
    entry -> generator_statement:generator -> return\n\
    entry -> async_statement:async -> return\n\
    entry -> proto_statement:proto -> return\n\
\n\
    entry -> try_catch_finally_statement:try_catch_finally -> return\n\
    entry -> switch_statement:switch -> return\n\
    entry -> do_while_statement:do_while -> return\n\
\n\
    entry -> assert_statement:assert -> return\n\
    // entry -> deconstruct:deconstruct -> return\n\
    // entry -> const_statement:const -> return\n\
}\n\
\n\
/*\n\
 * declaration lists\n\
 */\n\
\n\
dec_def {\n\
    entry -> ident:name -> "=" -> literal_expression:value -> return\n\
    entry -> ident:name -> return\n\
}\n\
\n\
dec_def_list {\n\
    entry -> dec_def:item -> return\n\
    dec_def:item -> "," -> dec_def:item\n\
}\n\
\n\
dec_list {\n\
    entry -> ident:item -> return\n\
    ident:item -> "," -> ident:item\n\
}\n\
');
resource('../templates/adria/async.tpl', 'module(\'async.adria\', function(module, resource) {\n\
\n\
    {*\n\
     * async error object\n\
     *}\n\
\n\
    function AsyncException(message) {\n\
        Exception.call(this, message);\n\
    }\n\
\n\
    AsyncException.prototype = Object.create(Exception.prototype);\n\
    AsyncException.prototype.constructor = AsyncException;\n\
\n\
    {*\n\
     * async object\n\
     *}\n\
\n\
    function Async(generator) {\n\
        this.generator = generator;\n\
        this.next();\n\
    }\n\
\n\
    Async.AsyncException = AsyncException;\n\
\n\
    Async.wrap = function(func, context) {\n\
        return function() {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return function(callback) {\n\
                args.push(callback);\n\
                return func.apply(context, args);\n\
            };\n\
        };\n\
    };\n\
\n\
    Async.prototype.generator = null;\n\
    Async.prototype.sync = 0;\n\
    Async.prototype.result = undefined;\n\
    Async.prototype.error = undefined;\n\
    Async.prototype.waiting = 0;\n\
    Async.prototype.step = 0;\n\
    Async.prototype.done = false;\n\
\n\
    {**\n\
     * throw on following next() iteration and provide partial result via exception\n\
     *\n\
     * @param error\n\
     *}\n\
    Async.prototype.throw = function(error) {\n\
\n\
        error.partialResult = this.result;\n\
        this.error = error;\n\
    };\n\
\n\
    {**\n\
     * steps through the yields in the async # function. at each yield either a result is returned or\n\
     * an error is thrown. continues until the last yield was processed\n\
     *}\n\
    Async.prototype.next = function() {\n\
\n\
        {* the yielded function for which we will wait on its callback before returning that result at the caller yield *}\n\
\n\
        var current;\n\
\n\
        {* todo REFACTOR! *}\n\
\n\
        while ((current = (this.error === undefined ? this.generator.next(this.result) : this.generator.throw(this.error))).done === false) {\n\
\n\
            this.sync = 0;\n\
            this.error = undefined;\n\
\n\
            try {\n\
\n\
                if (typeof current.value === \'function\') {\n\
                    {! if (enableAssert): !}assert(current.value.prototype === undefined, \'Yielded function is not wrapped (forgot \\\'#\\\' ?)\');{! endif !}\n\
                    current.value(this.callback.bind(this, this.step));\n\
                } else {\n\
                    this.waitAll(current.value);\n\
                }\n\
\n\
            } catch (e) {\n\
\n\
                {* yielded expression threw immediately, meaning we\'re synchronous *}\n\
\n\
                this.sync = 1;\n\
                this.throw(e);\n\
            }\n\
\n\
            {* check if the function returned before or after the callback was invoked\n\
               synchronous: just continue looping, don\'t call next in callback to avoid recursion\n\
               asynchronous: break here and have the callback call next() again when done *}\n\
\n\
            if (this.sync === 0) {\n\
                this.sync = -1;\n\
                break;\n\
            } else {\n\
                this.step++;\n\
            }\n\
        }\n\
\n\
        this.done = current.done;\n\
    };\n\
\n\
    {**\n\
     * used by next to call multiple functions and wait for all of them to call back\n\
     *\n\
     * @param args an array or object of async-wrapped functions\n\
     *}\n\
    Async.prototype.waitAll = function(args) {\n\
\n\
        if (args instanceof Array) {\n\
            this.result = new Array(args.length);\n\
        } else if (args instanceof Object) {\n\
            this.result = { };\n\
        } else {\n\
            throw new AsyncException(\'Yielding invalid type \' + (typeof args));\n\
        }\n\
\n\
        this.waiting = 0;\n\
\n\
        for (var id in args) {\n\
            var arg = args[id];\n\
            if (typeof arg === \'function\') {\n\
                {! if (enableAssert): !}assert(arg.prototype === undefined, \'Property \' + id + \' of yielded object is not a wrapped function (forgot \\\'#\\\' ?)\');{! endif !}\n\
                this.waiting++;\n\
                arg(this.waitAllCallback.bind(this, this.step, id));\n\
            } else {\n\
                throw new AsyncException(\'Property \' + id + \' of yielding object is not a function\');\n\
            }\n\
        }\n\
    };\n\
\n\
    {**\n\
     * callback given to functions during waitAll. tracks number of returned functions and\n\
     * calls the normal async callback when all returned or one excepted\n\
     *\n\
     * @param originalStep the step at which the original function was called\n\
     * @param originalId the array or object key from the original yield\n\
     * @param err typically nodejs callback provide an error as first parameter if there was one. we\'ll throw it\n\
     * @param val the result\n\
     *}\n\
    Async.prototype.waitAllCallback = function(originalStep, originalId, err, val) {\n\
\n\
        {* check if callback is from the current step (may not be if a previous waitAll step threw) *}\n\
\n\
        if (this.step !== originalStep) {\n\
{* console.log(\'discarded waitAllCallback\', originalStep, originalId, err, val); *}\n\
            return;\n\
        }\n\
\n\
        var error = null;\n\
\n\
        if (err instanceof Error) {\n\
\n\
            error = err;\n\
\n\
        } else if (this.result.hasOwnProperty(originalId)) {\n\
\n\
            error = new AsyncException(\'Callback for item \' + originalId + \' of yield was invoked more than once\');\n\
\n\
        } else {\n\
\n\
            {* add this callbacks result to set of results *}\n\
\n\
            this.result[originalId] = (arguments.length === 3 ? err : val);\n\
            this.waiting--;\n\
        }\n\
\n\
        {* yield error or when all is done, result *}\n\
\n\
        if (error !== null) {\n\
            this.callback(originalStep, error);\n\
        } else if (this.waiting === 0) {\n\
            this.callback(originalStep, null, this.result);\n\
        }\n\
    };\n\
\n\
    {**\n\
     * callback given to singular functions\n\
     *\n\
     * @param originalStep the step at which the original function was called\n\
     * @param err typically nodejs callback provide an error as first parameter if there was one. we\'ll throw it\n\
     * @param val the result\n\
     *}\n\
    Async.prototype.callback = function(originalStep, err, val) {\n\
\n\
        {* check if callback is from the current step (may not be if a previous waitAll step threw) *}\n\
\n\
        if (this.step !== originalStep) {\n\
{* console.log(\'discarded callblack\', originalStep, err, val); *}\n\
            return;\n\
        }\n\
\n\
        if (err instanceof Error) {\n\
            this.throw(err);\n\
        } else {\n\
            this.result = (arguments.length === 2 ? err : val);\n\
        }\n\
\n\
        if (this.sync === 0) {\n\
            this.sync = 1;\n\
        } else {\n\
            this.step++;\n\
            this.next();\n\
        }\n\
    };\n\
\n\
    ___Async = Async;\n\
    module.exports = Async;\n\
});\n\
');
resource('../templates/adria/framework.tpl', 'var require, resource, module;{! if (enableApplication): !}\n\
var application;{! endif !}{! if (enableAssert): !}\n\
var assert;{! endif !}{! if (globals.length != 0): !}\n\
var {% globals.join(\', \') %};{! endif !}\n\
var Exception{! if (enableAssert): !}, AssertionFailedException{! endif !};\n\
(function() {\n\
    var resources = { };\n\
    var modules = { };\n\
\n\
    Exception = function Exception(message) {\n\
        this.message = message === undefined ? this.message : message;\n\
        this.name = this.constructor.name === undefined ? \'Exception\' : this.constructor.name;\n\
        var current = this;\n\
        var ownTraceSize = 1;\n\
        while ((current = Object.getPrototypeOf(current)) instanceof Error) {\n\
            ownTraceSize++;\n\
        }\n\
        var stack = Error().stack.split(\'\\n\').slice(ownTraceSize);\n\
        stack[0] = this.name + \': \' + message;\n\
        this.stack = stack.join(\'\\n\');\n\
    };\n\
    Exception.prototype = Object.create(Error.prototype);\n\
    Exception.prototype.constructor = Exception;\n\
\n\
    var getResource = function(name) {{! if (enableAssert): !}\n\
        if (resources[name] === undefined) {\n\
            throw Error(\'missing resource \' + name);\n\
        }\n\
        {! endif !}\n\
        return resources[name];\n\
    };\n\
\n\
    var Module = function(name, func) {\n\
        this.name = name;\n\
        this.exports = Object.create(null);\n\
        this.func = func;\n\
    };\n\
    Module.prototype.exports = null;\n\
    Module.prototype.name = \'\';\n\
\n\
    module = function(name, func) {\n\
        modules[name] = new Module(name, func);\n\
    };\n\
    resource = function(name, data) {\n\
        resources[name] = data;\n\
    };{! if (enableApplication): !}\n\
\n\
    application = function(Constructor /*, params... */) {\n\
        function Application() {\n\
            application = this;\n\
            Constructor.apply(this, Array.prototype.slice.call(arguments));\n\
        };\n\
        Application.prototype = Constructor.prototype;\n\
        var args = Array.prototype.slice.call(arguments);\n\
        args[0] = null;\n\
        return new (Function.prototype.bind.apply(Application, args));\n\
    };{! endif !}\n\
\n\
    require = function(file) {\n\
        var module = modules[file];{! if (enableAssert): !}\n\
        if (module === undefined) {\n\
            throw Error(\'missing dependency \' + file);\n\
        }{! endif !}\n\
        if (typeof module.func === \'function\') {\n\
            var func = module.func;\n\
            delete module.func;\n\
            func(module, getResource);\n\
        }\n\
        return module.exports;\n\
    };{! if (enableAssert): !}\n\
\n\
    AssertionFailedException = function AssertionFailedException(message) {\n\
        Exception.call(this, message);\n\
    };\n\
    AssertionFailedException.prototype = Object.create(Exception.prototype);\n\
    AssertionFailedException.prototype.constructor = AssertionFailedException;\n\
\n\
    assert = function(assertion, message) {\n\
        if (assertion !== true) {\n\
            throw new AssertionFailedException(message);\n\
        }\n\
    };\n\
    \n\
    assert.instance = function(type, allowNull, value, name, typeName) {\n\
    \n\
        if (value === null) {\n\
            if (allowNull) {\n\
                return;\n\
            } else {\n\
                throw new AssertionFailedException(name + \' expected to be instance of \' + typeName + \', got null instead\');\n\
            }\n\
        }\n\
        \n\
        if (value instanceof type !== true) {\n\
            var actualName = (typeof value === \'object\' && typeof value.constructor === \'function\' && typeof value.constructor.name === \'string\' ? value.constructor.name : \'type \' + typeof value);\n\
            throw new AssertionFailedException(name + \' expected to be instance of \' + typeName + \', got \' + actualName + \' instead\');\n\
        }\n\
    }\n\
    \n\
    assert.type = function(type, allowNull, value, name) {\n\
\n\
        type = (type !== \'func\' ? type : \'function\');\n\
\n\
        if (value === null) {\n\
            if (allowNull) {\n\
                return;\n\
            } else {\n\
                throw new AssertionFailedException(name + \' expected to be of type \' + type + \', got null instead\');\n\
            }\n\
        }\n\
\n\
        var actualType = typeof value;\n\
\n\
        if (type === \'finite\' || type === \'number\') {\n\
            if (actualType !== \'number\') {\n\
                throw new AssertionFailedException(name + \' expected to be of type number, got \' + actualType + \' instead\');\n\
            }\n\
            if (type === \'finite\' && isFinite(value) === false) {\n\
                throw new AssertionFailedException(name + \' expected to be finite number, got \' + value + \' instead\');\n\
            }\n\
\n\
        } else if (type !== actualType) {\n\
            throw new AssertionFailedException(name + \' expected to be of type \' + type + \', got \' + actualType + \' instead\');\n\
        }\n\
    };\n\
    {! endif !}\n\
})();\n\
');
module('../../astdlib/astd/prototype/merge.adria', function(module, resource) {
    var merge;
    merge = function merge(from, to) {
        var props;
        props = Object.getOwnPropertyNames(from);
        var propId, propName;
        for (propId in props) {
            propName = props[propId];
            if (to.hasOwnProperty(propName) === false && propName !== 'extend') {
                Object.defineProperty(to, propName, Object.getOwnPropertyDescriptor(from, propName));
            }
        }
    };
    module.exports = merge;
});
module('../../astdlib/astd/prototype/string.adria', function(module, resource) {
    var merge, extend, StringExtensions, random, repeat;
    merge = require('../../astdlib/astd/prototype/merge.adria');
    extend = function extend() {
        merge(StringExtensions, String);
        merge(StringExtensions.prototype, String.prototype);
    };
    StringExtensions = (function() {
        var ___self = function StringExtensions() {}
        var StringExtensions = ___self;
        ___self.prototype.snakeToCamel = (function() {
            var firstToUpper;
            firstToUpper = function firstToUpper(match1) {
                return match1.replace('_', '').toUpperCase();
            };
            return function snakeToCamel(upperFirst) {
                if (upperFirst) {
                    return this.replace(/((?:^|\_)[a-z])/g, firstToUpper);
                } else {
                    return this.replace(/(\_[a-z])/g, firstToUpper);
                }
            };
        })();
        ___self.prototype.hasPrefix = function hasPrefix(prefix) {
            return (this.substr(0, prefix.length) === prefix);
        };
        ___self.prototype.stripPrefix = function stripPrefix(prefix) {
            var len;
            if (prefix instanceof Array) {
                var i;
                for (i in prefix) {
                    len = prefix[i].length;
                    if (this.substr(0, len) === prefix[i]) {
                        return this.substr(len);
                    }
                }
                return this.valueOf();
            }
            len = prefix.length;
            return (this.substr(0, len) === prefix ? this.substr(len) : this.valueOf());
        };
        ___self.prototype.hasPostfix = function hasPostfix(postfix) {
            return (this.substr(-postfix.length) === postfix);
        };
        ___self.prototype.stripPostfix = function stripPostfix(postfix) {
            var len;
            if (postfix instanceof Array) {
                var i;
                for (i in postfix) {
                    len = postfix[i].length;
                    if (this.substr(-len) === postfix[i]) {
                        return this.substr(0, this.length - len);
                    }
                }
                return this.valueOf();
            }
            len = postfix.length;
            return (this.substr(-len) === postfix ? this.substr(0, this.length - len) : this.valueOf());
        };
        ___self.prototype.format = function format() {
            var args;
            args = Array.prototype.slice.call(arguments);
            if (args.length === 1 && args[0] instanceof Object) {
                args = args[0];
            }
            return this.replace(/(.?)\$([0-9a-z]+)(\:([0-9a-z\:\-]+\.?))?/ig, function(str, prefix, matchname, optmatch, options) {
                var formatted;
                if (prefix === '$') {
                    return '$' + matchname + (optmatch !== undefined ? optmatch : '');
                }
                formatted = args[matchname];
                if (options !== undefined) {
                    if (options.slice(-1) === '.') {
                        options = options.slice(0, -1);
                    }
                    if (options === 'currency') {
                        formatted = Math.floor(formatted * 100) / 100;
                    }
                    if (options.substr(0, 4) === 'pad:') {
                        formatted = String.prototype.padLeft.call('' + formatted, options.substr(4), ' ');
                    }
                }
                return (args[matchname] !== undefined ? prefix + formatted : str);
            });
        };
        ___self.prototype.repeat = function repeat(count) {
            var result, pattern;
            if (count < 1) {
                return '';
            }
            result = '';
            pattern = this.valueOf();
            while (count > 1) {
                if (count & 1) {
                    result += pattern;
                }
                count >>= 1;
                pattern += pattern;
            }
            result += pattern;
            return result;
        };
        ___self.prototype.occurances = function occurances(search) {
            var count, index;
            count = 0;
            index = this.indexOf(search);
            while (index !== -1) {
                count++;
                index = this.indexOf(search, index + 1);
            }
            return count;
        };
        ___self.prototype.padLeft = function padLeft(paddedLength, padChar) {
            padChar = (arguments.length > 1 ? padChar : (' '));
            return padChar.repeat(Math.max(0, paddedLength - this.length)) + this.valueOf();
        };
        ___self.prototype.padRight = function padRight(paddedLength, padChar) {
            padChar = (arguments.length > 1 ? padChar : (' '));
            return this.valueOf() + padChar.repeat(Math.max(0, paddedLength - this.length));
        };
        ___self.prototype.jsify = function jsify(quoteType) {
            if (quoteType === "'") {
                return this.replace(/([\\'])/g, "\\$1").replace(/\r?\n/g, '\\n\\\n').replace(/\0/g, "\\0");
            } else if (quoteType === '"') {
                return this.replace(/([\\"])/g, "\\$1").replace(/\r?\n/g, '\\n\\\n').replace(/\0/g, "\\0");
            } else {
                return this.replace(/([\\"'])/g, "\\$1").replace(/\r?\n/g, '\\n\\\n').replace(/\0/g, "\\0");
            }
        };
        ___self.prototype.capitalize = function capitalize() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };
        ___self.prototype.decapitalize = function decapitalize() {
            return this.charAt(0).toLowerCase() + this.slice(1);
        };
        return ___self;
    })();
    random = function random(length, chars) {
        var numChars, result;
        length = (arguments.length > 0 ? length : (16));
        chars = (arguments.length > 1 ? chars : ('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
        numChars = chars.length;
        result = '';
        var i, rnum;
        for (i = 0; i < length;i++) {
            rnum = Math.floor(Math.random() * numChars);
            result += chars.substr(rnum, 1);
        }
        return result;
    };
    repeat = function repeat(count, string) {
        string = (arguments.length > 1 ? string : (' '));
        return StringExtensions.prototype.repeat.call(string, count);
    };
    module.exports = StringExtensions;
    module.exports.extend = extend;
    module.exports.random = random;
    module.exports.repeat = repeat;
});
module('../../astdlib/astd/prototype/regexp.adria', function(module, resource) {
    var merge, extend, RegExpExtensions, escape;
    merge = require('../../astdlib/astd/prototype/merge.adria');
    extend = function extend() {
        merge(RegExpExtensions, RegExp);
        merge(RegExpExtensions.prototype, RegExp.prototype);
    };
    RegExpExtensions = (function() {
        var ___self = function RegExpExtensions() {}
        var RegExpExtensions = ___self;
        return ___self;
    })();
    escape = function escape(string) {
        return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    };
    module.exports = RegExpExtensions;
    module.exports.extend = extend;
    module.exports.escape = escape;
});
module('../../astdlib/astd/prototype/object.adria', function(module, resource) {
    var merge, extend, ObjectExtensions;
    merge = require('../../astdlib/astd/prototype/merge.adria');
    extend = function extend() {
        merge(ObjectExtensions, Object);
        merge(ObjectExtensions.prototype, Object.prototype);
    };
    ObjectExtensions = (function() {
        var ___self = function ObjectExtensions() {}
        var ObjectExtensions = ___self;
        Object.defineProperty(___self.prototype, "merge", {
            value: function merge(overwrite) {
                var noFlag, args;
                noFlag = overwrite instanceof Object;
                args = Array.prototype.slice.call(arguments, noFlag ? 0 : 1);
                overwrite = (noFlag ? true : overwrite);
                var argId, argValue, props;
                for (argId in args) {
                    argValue = args[argId];
                    props = Object.getOwnPropertyNames(argValue);
                    if (overwrite === false) {
                        var propId, propName;
                        for (propId in props) {
                            propName = props[propId];
                            if (this.hasOwnProperty(propName) === false) {
                                Object.defineProperty(this, propName, Object.getOwnPropertyDescriptor(argValue, propName));
                            }
                        }
                    } else {
                        var propId, propName;
                        for (propId in props) {
                            propName = props[propId];
                            Object.defineProperty(this, propName, Object.getOwnPropertyDescriptor(argValue, propName));
                        }
                    }
                }
            },
            writable: true
        });
        Object.defineProperty(___self.prototype, "clone", {
            value: function clone() {
                return Object.create(Object.getPrototypeOf(this));
            },
            writable: true
        });
        return ___self;
    })();
    module.exports = ObjectExtensions;
    module.exports.extend = extend;
});
module('log.adria', function(module, resource) {
    var instance, enabled, log, enable, disable, Log;
    instance = null;
    enabled = false;
    log = function log(source, message, offset) {
        offset = (arguments.length > 2 ? offset : (0));
        if (enabled !== true) {
            return ;
        }
        if (instance === null) {
            instance = new Log();
        }
        instance.print(source, message, offset);
    };
    enable = function enable() {
        enabled = true;
    };
    disable = function disable() {
        enabled = false;
    };
    Log = (function() {
        var ___self = function Log() {
            this.start = Date.now();
            this.last = this.start;
            console.log('=============================: Log started');
        };
        var Log = ___self;
        ___self.prototype.indent = 0;
        ___self.prototype.start = 0;
        ___self.prototype.last = 0;
        ___self.prototype.print = function print(source, message, offset) {
            var now, diffStart, diffLast;
            offset = (arguments.length > 2 ? offset : (0));
            now = Date.now();
            diffStart = now - this.start;
            diffLast = now - this.last;
            this.last = now;
            if (offset < 0) {
                this.indent += offset;
            }
            if (message !== undefined) {
                console.log(('+' + diffLast + '/' + diffStart).padLeft(10, ' ') + 'ms: ' + source.padLeft(15) + ': ' + ' '.repeat(this.indent) + message);
            }
            if (offset > 0) {
                this.indent += offset;
            }
        };
        return ___self;
    })();
    module.exports = log;
    module.exports.enable = enable;
    module.exports.disable = disable;
    module.exports.Log = Log;
});
module('args.adria', function(module, resource) {
    var argparse, parsed, callbacks, parser, add, addSwitch, parseKnown, parseAll, applyCallbacks;
    argparse = ___require('argparse');
    parsed = null;
    callbacks = {  };
    parser = new argparse.ArgumentParser({
        version: '0.1.12',
        addHelp: false,
        epilog: 'Use --no-... to invert option switches, i.e. --no-strict'
    });
    add = function add(flags, options, callback) {
        callback = (arguments.length > 2 ? callback : (null));
        parser.addArgument(flags, options);
        if (callback !== null) {
            var name;
            name = (options.dest !== undefined ? options.dest : null);
            if (name === null) {
                var id, flag;
                for (id in flags) {
                    flag = flags[id];
                    if (flag.slice(0, 2) === '--') {
                        name = flag.slice(2);
                    }
                }
            }
            callbacks[name] = callback;
        }
        parsed = null;
    };
    addSwitch = function addSwitch(name, help, defaultState) {
        var defaultText, defaultValue;
        defaultState = (arguments.length > 2 ? defaultState : (false));
        defaultText = ' (' + (defaultState ? 'true' : 'false') + ')';
        parser.addArgument([ '--' + name ], { help: help + defaultText, action: 'storeTrue', dest: name });
        parser.addArgument([ '--no-' + name ], { help: argparse.Const.SUPPRESS, action: 'storeFalse', dest: name });
        defaultValue = {  };
        defaultValue[name] = defaultState;
        parser.setDefaults(defaultValue);
    };
    parseKnown = function parseKnown() {
        if (parsed === null) {
            parsed = parser.parseKnownArgs()[0];
            applyCallbacks();
        }
        return parsed;
    };
    parseAll = function parseAll() {
        parser.addArgument([ '-h', '--help' ], {
            action: 'help',
            defaultValue: argparse.Const.SUPPRESS,
            help: 'Show this help message and exit.'
        });
        parsed = parser.parseArgs();
        applyCallbacks();
        return parsed;
    };
    applyCallbacks = function applyCallbacks() {
        var key, value;
        for (key in parsed) {
            value = parsed[key];
            if (callbacks[key] !== undefined) {
                parsed[key] = callbacks[key](value);
            }
        }
    };
    module.exports.add = add;
    module.exports.addSwitch = addSwitch;
    module.exports.parseKnown = parseKnown;
    module.exports.parseAll = parseAll;
});
module('util.adria', function(module, resource) {
    var sysutil, crypto, Enumeration, Enum, dump, home, normalizeExtension, md5;
    sysutil = ___require('util');
    crypto = ___require('crypto');
    Enumeration = function Enumeration(options) {
        var bit;
        bit = 0;
        var id;
        for (id in options) {
            if (this[options[id]] === undefined) {
                this[options[id]] = 1 << bit;
                bit += 1;
            }
            if (bit >= 32) {
                throw new Exception('options is expected to be an array and contain <= 32 unique elements');
            }
        }
        return Object.freeze(this);
    };
    Enum = function Enum(options) {
        return new Enumeration(options);
    };
    dump = function dump(subject, depth, showHidden) {
        depth = (arguments.length > 1 ? depth : (2));
        showHidden = (arguments.length > 2 ? showHidden : (false));
        console.log(sysutil.inspect(subject, showHidden, depth));
    };
    home = function home() {
        return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
    };
    normalizeExtension = function normalizeExtension(fullname, defaultExtension) {
        var slash, baseName;
        slash = fullname.lastIndexOf('/');
        baseName = slash > 0 ? fullname.slice(slash) : fullname;
        return (baseName.indexOf('.') > -1 ? fullname : fullname + defaultExtension);
    };
    md5 = function md5(input) {
        var md5sum;
        md5sum = crypto.createHash('md5');
        md5sum.update(input);
        return md5sum.digest('hex');
    };
    module.exports.Enum = Enum;
    module.exports.dump = dump;
    module.exports.home = home;
    module.exports.normalizeExtension = normalizeExtension;
    module.exports.md5 = md5;
});
module('../../astdlib/astd/set.adria', function(module, resource) {
    var Set;
    Set = (function() {
        var ___self = function Set(value) {
            this.data = Object.create(null);
            if (value !== undefined) {
                this.add(value);
            }
        };
        var Set = ___self;
        ___self.prototype.merge = function merge() {
            var result;
            var sets = Array.prototype.slice.call(arguments, 0);
            result = new Set();
            var key;
            for (key in this.data) {
                result.data[key] = true;
            }
            var _, set;
            for (_ in sets) {
                set = sets[_];
                var key;
                for (key in set.data) {
                    result.data[key] = true;
                }
            }
            return result;
        };
        ___self.prototype.add = function add(value) {
            var data;
            data = this.data;
            if (value instanceof Array) {
                value.forEach(function(element) {
                    data[element] = true;
                });
            } else if (value instanceof Set) {
                var element;
                for (element in value.data) {
                    data[element] = true;
                }
            } else {
                data[value] = true;
            }
            return this;
        };
        ___self.prototype.remove = function remove(value) {
            var data;
            data = this.data;
            if (value instanceof Array) {
                value.forEach(function(element) {
                    delete data[element];
                });
            } else if (value instanceof Set) {
                var element;
                for (element in value.data) {
                    delete data[element];
                }
            } else {
                delete data[value];
            }
            return this;
        };
        ___self.prototype.has = function has(value) {
            var data;
            data = this.data;
            if (value instanceof Array) {
                var _, key;
                for (_ in value) {
                    key = value[_];
                    if (key in data !== true) {
                        return false;
                    }
                }
                return true;
            } else if (value instanceof Set) {
                var other;
                other = value.data;
                var key;
                for (key in other) {
                    if (key in data !== true) {
                        return false;
                    }
                }
                return true;
            } else {
                return (value in data);
            }
        };
        ___self.prototype.lacks = function lacks(value) {
            return this.has(value) === false;
        };
        ___self.prototype.missing = function missing(value) {
            var result, data;
            result = new Set();
            data = this.data;
            if (value instanceof Array) {
                var _, key;
                for (_ in value) {
                    key = value[_];
                    if (data[key] !== true) {
                        result.add(key);
                    }
                }
            } else if (value instanceof Set) {
                var other;
                other = value.data;
                var key;
                for (key in other) {
                    if (data[key] !== true) {
                        result.add(key);
                    }
                }
            } else {
                throw new Error('invalid argument');
            }
            return result;
        };
        ___self.prototype.toArray = function toArray() {
            return Object.keys(this.data);
        };
        Object.defineProperty(___self.prototype, "empty", {
            get: function empty() {
                var _;
                for (_ in this.data) {
                    return false;
                }
                return true;
            }
        });
        Object.defineProperty(___self.prototype, "length", {
            get: function length() {
                var len;
                len = 0;
                var _;
                for (_ in this.data) {
                    len++;
                }
                return len;
            }
        });
        return ___self;
    })();
    module.exports = Set;
});
module('source_node.adria', function(module, resource) {
    var MozillaSourceNode, SourceNode;
    MozillaSourceNode = ___require('source-map').SourceNode;
    SourceNode = (function(___parent) {
        var ___self = function SourceNode() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var SourceNode = ___self;
        ___self.prototype.trim = function trim() {
            var id;
            id = this.children.length;
            while (id--) {
                var lastChild;
                lastChild = this.children[id];
                if (lastChild instanceof MozillaSourceNode) {
                    if (lastChild.trim()) {
                        this.children.pop();
                    } else {
                        break ;
                    }
                } else if (typeof lastChild === 'string') {
                    this.children[id] = lastChild.replace(/\s+$/, '');
                    if (this.children[id] === '') {
                        this.children.pop();
                    } else {
                        break ;
                    }
                }
            }
            return this.children.length === 0;
        };
        return ___self;
    })(MozillaSourceNode);
    module.exports = SourceNode;
});
module('../../astdlib/astd/template.adria', function(module, resource) {
    var Template;
    Template = (function() {
        var ___self = function Template() {
            this.data = {  };
            this.preprocessors = {  };
        };
        var Template = ___self;
        ___self.prototype.data = null;
        ___self.prototype.debug = false;
        ___self.prototype.statementDelimiters = [ '{!', '!}' ];
        ___self.prototype.expressionDelimiters = [ '{%', '%}' ];
        ___self.prototype.commentDelimiters = [ '{*', '*}' ];
        ___self.prototype.source = '';
        ___self.prototype.preprocessors = null;
        ___self.prototype.assign = function assign(name, value) {
            if (name instanceof Object && value === undefined) {
                this.data.merge(name);
            } else {
                this.data[name] = value;
            }
        };
        ___self.prototype.registerPreprocessor = function registerPreprocessor(name, context, handler) {
            if (typeof context === 'function' && handler === undefined) {
                handler = context;
                context = this;
            }
            this.preprocessors[name] = handler.bind(context);
        };
        ___self.prototype.setup = function setup() {
            var openStatement, closeStatement, openExpression, closeExpression, openComment, closeComment, statement, expression, comment, text;
            openStatement = RegExp.escape(this.statementDelimiters[0]);
            closeStatement = RegExp.escape(this.statementDelimiters[1]);
            openExpression = RegExp.escape(this.expressionDelimiters[0]);
            closeExpression = RegExp.escape(this.expressionDelimiters[1]);
            openComment = RegExp.escape(this.commentDelimiters[0]);
            closeComment = RegExp.escape(this.commentDelimiters[1]);
            statement = '(' + openStatement + ').+?' + closeStatement;
            expression = '(' + openExpression + ').+?' + closeExpression;
            comment = '(' + openComment + ')[\\s\\S]+?' + closeComment;
            text = '(?:(?!' + openStatement + '|' + openExpression + '|' + openComment + ')[\\s\\S])+';
            return new RegExp(statement + '|' + expression + '|' + comment + '|' + text, 'g');
        };
        ___self.prototype.parse = function parse(input) {
            var regexp, match, jsString;
            regexp = this.setup();
            jsString = '';
            while (match = regexp.exec(input)) {
                if (match[1] === undefined && match[2] === undefined && match[3] === undefined) {
                    jsString += 'this.source += "' + match[0].jsify('"') + '";\n';
                } else if (match[1] !== undefined) {
                    var preprocessor, statement;
                    statement = match[0].slice(2, -2);
                    statement = statement.replace(/\:\s*$/, '{');
                    statement = statement.replace(/^\s*while/, '} while');
                    statement = statement.replace(/^\s*end(if|for|while)/, '}');
                    if ((preprocessor = this.checkPreprocessor(statement)) !== null) {
                        jsString += this.runPreprocessor(preprocessor, statement);
                    } else {
                        jsString += statement + '\n';
                    }
                } else if (match[2] !== undefined) {
                    jsString += 'this.source += ' + match[0].slice(2, -2) + ';\n';
                } else if (this.debug && match[3] !== undefined) {
                    jsString += 'this.source += "/*' + match[0].slice(2, -2).jsify('"') + '*/";\n';
                }
            }
            return jsString;
        };
        ___self.prototype.checkPreprocessor = function checkPreprocessor(statement) {
            var nameMatch;
            nameMatch = statement.match(/^\s*([a-z][a-z0-9_]*)\s*\(/);
            if (nameMatch !== null && this.preprocessors[nameMatch[1]] !== undefined) {
                return nameMatch[1];
            } else {
                return null;
            }
        };
        ___self.prototype.runPreprocessor = function runPreprocessor(name, statement) {
            return eval('(function() { var ' + name + ' = this.preprocessors[name]; return ' + statement + '; }).call(this)');
        };
        ___self.prototype.exec = function exec(tplString) {
            var varDefs;
            varDefs = 'this.source = "";\n';
            var name, value;
            for (name in this.data) {
                value = this.data[name];
                varDefs += 'var ' + name + ' = this.data.' + name + ';\n';
            }
            return eval('(function() { ' + varDefs + tplString + 'return this.source; }).call(this)');
        };
        ___self.prototype.fetch = function fetch(input) {
            return this.exec(this.parse(input));
        };
        return ___self;
    })();
    module.exports = Template;
});
module('template.adria', function(module, resource) {
    var fs, ASTDTemplate, Template;
    fs = ___require('fs');
    ASTDTemplate = require('../../astdlib/astd/template.adria');
    Template = (function(___parent) {
        var ___self = function Template() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Template = ___self;
        ___self.prototype.basePath = 'templates/';
        ___self.prototype.fetch = function fetch(source) {
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.fetch !== fetch || ___c.hasOwnProperty('fetch') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            return ___p.prototype.fetch.call(this, source).replace(/\n[\ \n]*\n/g, '\n');
        };
        ___self.prototype.fetchFile = function fetchFile(file) {
            return this.fetch(fs.readFileSync(this.basePath + file, 'UTF-8'));
        };
        return ___self;
    })(ASTDTemplate);
    module.exports = Template;
});
module('cache.adria', function(module, resource) {
    var fs, path, util, Cache;
    fs = ___require('fs');
    path = ___require('path');
    util = require('util.adria');
    Cache = (function() {
        var ___self = function Cache() {
            this.checkBaseDir();
        };
        var Cache = ___self;
        ___self.prototype.version = "0.1.12";
        ___self.prototype.baseDir = util.home() + '/.adria/cache/';
        ___self.prototype.checkBaseDir = function checkBaseDir() {
            var parts, ___path_scp1;
            if (this.baseDir.slice(0, 1) !== '/' || this.baseDir.slice(-1) !== '/') {
                throw new Error('cache.baseDir needs to be an absolute path');
            }
            parts = this.baseDir.slice(1, -1).split('/');
            ___path_scp1 = '/';
            var id, part;
            for (id in parts) {
                part = parts[id];
                ___path_scp1 += part;
                if (fs.existsSync(___path_scp1)) {
                    if (fs.statSync(___path_scp1).isFile()) {
                        throw new Error(___path_scp1 + ' is a file');
                    }
                } else {
                    fs.mkdirSync(___path_scp1, (parseInt(id) === parts.length - 1 ? 511 : 493));
                }
                ___path_scp1 += '/';
            }
        };
        ___self.prototype.cacheName = function cacheName(file, modifier) {
            var absPath;
            modifier = (arguments.length > 1 ? modifier : (null));
            absPath = path.resolve(process.cwd(), file);
            return this.baseDir + util.md5(absPath + ' -- ' + modifier + ' -- ' + this.version);
        };
        ___self.prototype.fetch = function fetch(file, variants, modifier) {
            var cacheFile;
            modifier = (arguments.length > 2 ? modifier : (null));
            cacheFile = this.cacheName(file, modifier);
            if (fs.existsSync(cacheFile) && fs.existsSync(file)) {
                var inputStat, cacheStat;
                inputStat = fs.statSync(file);
                cacheStat = fs.statSync(cacheFile);
                if (cacheStat.isFile() && inputStat.mtime.toString() === cacheStat.mtime.toString()) {
                    var resultData;
                    resultData = {  };
                    var id, variant;
                    for (id in variants) {
                        variant = variants[id];
                        if (variant === 'base') {
                            log('Cache', 'reading from ' + cacheFile, 0);
                            resultData['base'] = JSON.parse(fs.readFileSync(cacheFile, 'UTF-8'));
                        } else {
                            resultData[variant] = JSON.parse(fs.readFileSync(cacheFile + '.' + variant, 'UTF-8'));
                        }
                    }
                    return resultData;
                } else {
                    log('Cache', 'cache dirty for ' + file, 0);
                }
            } else {
                log('Cache', 'cache miss for ' + file, 0);
            }
            return null;
        };
        ___self.prototype.insert = function insert(file, variants, modifier) {
            var inputStat, cacheFile;
            modifier = (arguments.length > 2 ? modifier : (null));
            inputStat = fs.statSync(file);
            cacheFile = this.cacheName(file, modifier);
            var ext, variant;
            for (ext in variants) {
                variant = variants[ext];
                if (ext === 'base') {
                    log('Cache', 'writing to ' + cacheFile, 0);
                    fs.writeFileSync(cacheFile, JSON.stringify(variant));
                    fs.utimesSync(cacheFile, inputStat.atime, inputStat.mtime);
                } else {
                    fs.writeFileSync(cacheFile + '.' + ext, JSON.stringify(variant));
                }
            }
        };
        return ___self;
    })();
    module.exports = Cache;
});
module('transform.adria', function(module, resource) {
    var util, args, Cache, Transform;
    util = require('util.adria');
    args = require('args.adria');
    Cache = require('cache.adria');
    Transform = (function() {
        var ___self = function Transform(stdin) {
            stdin = (arguments.length > 0 ? stdin : (null));
            this.stdin = stdin;
            this.initOptions();
            this.processOptions();
            if (this.options['cache']) {
                this.cache = new Cache();
            }
            if (this.options['debug']) {
                log.enable();
            }
        };
        var Transform = ___self;
        ___self.prototype.options = null;
        ___self.prototype.stdin = null;
        ___self.prototype.cache = null;
        ___self.prototype.initOptions = function initOptions() {
            args.addSwitch('cache', 'Cache generated code', true);
        };
        ___self.prototype.processOptions = function processOptions() {
            this.options = args.parseAll();
        };
        ___self.prototype.run = function run() {
        };
        return ___self;
    })();
    module.exports = Transform;
});
module('tokenizer/token.adria', function(module, resource) {
    var Token, Position;
    Token = (function() {
        var ___self = function Token(data, type, start, col, row) {
            this.data = data;
            this.type = type;
            this.start = start;
            this.pos = new Position(col, row);
        };
        var Token = ___self;
        ___self.prototype.data = '';
        ___self.prototype.type = 0;
        ___self.prototype.start = 0;
        ___self.prototype.pos = null;
        return ___self;
    })();
    Position = (function() {
        var ___self = function Position(col, row) {
            this.col = col;
            this.row = row;
        };
        var Position = ___self;
        ___self.prototype.col = 0;
        ___self.prototype.row = 0;
        ___self.prototype.toString = function toString() {
            return 'line ' + this.row + ', column ' + this.col;
        };
        return ___self;
    })();
    module.exports = Token;
    module.exports.Position = Position;
});
module('parser/generator_state.adria', function(module, resource) {
    var Token, GeneratorState;
    Token = require('tokenizer/token.adria');
    GeneratorState = (function() {
        var ___self = function GeneratorState() {}
        var GeneratorState = ___self;
        ___self.prototype.generator = null;
        ___self.prototype.node = null;
        ___self.prototype.stack = null;
        ___self.prototype.token = null;
        ___self.prototype.minStack = 0;
        ___self.prototype.done = false;
        ___self.prototype.setGenerator = function setGenerator(generator, token) {
            generator = (arguments.length > 0 ? generator : (null));
            token = (arguments.length > 1 ? token : (null));
            this.generator = generator;
            this.token = token;
            this.node = null;
            this.stack = null;
            this.minStack = 0;
            this.done = false;
        };
        ___self.prototype.next = function next() {
            var state;
            state = this.generator.next();
            if (state.done === false) {
                this.node = state.value.node;
                this.stack = state.value.stack;
                this.minStack = state.value.minStack;
            } else {
                this.node = null;
                this.stack = null;
                this.minStack = 0;
            }
            this.done = state.done;
            return this;
        };
        return ___self;
    })();
    module.exports = GeneratorState;
});
module('parser/definition/node.adria', function(module, resource) {
    var Enum, Token, Node, Type, StackItem;
    Enum = require('util.adria').Enum;
    Token = require('tokenizer/token.adria');
    Node = (function() {
        var ___self = function Node() {
            this.children = [  ];
        };
        var Node = ___self;
        ___self.prototype.children = null;
        ___self.prototype.tokenType = 0;
        ___self.prototype.match = '';
        ___self.prototype.type = 0;
        ___self.prototype.name = '';
        ___self.prototype.capture = '';
        ___self.prototype.label = '';
        ___self.prototype.description = '';
        ___self.prototype.hasChild = function hasChild(node) {
            var children;
            children = this.children;
            var id;
            for (id in children) {
                if (children[id] === node) {
                    return true;
                }
            }
            return false;
        };
        ___self.prototype.add = function add(node) {
            var children;
            if (this.hasChild(node)) {
                return ;
            }
            children = this.children;
            if (node.type & Type.RETURN) {
                children.push(node);
                return node;
            } else {
                var lastId;
                lastId = children.length - 1;
                if (lastId >= 0) {
                    var lastChild;
                    lastChild = children[lastId];
                    if (lastChild.type & Type.RETURN) {
                        children[lastId] = node;
                        children.push(lastChild);
                        return node;
                    }
                }
            }
            children.push(node);
            return node;
        };
        ___self.prototype.createAndAdd = function createAndAdd(tokenType, match, capture, description) {
            var node;
            capture = (arguments.length > 2 ? capture : (''));
            description = (arguments.length > 3 ? description : (''));
            node = new Node();
            node.capture = capture;
            node.tokenType = tokenType;
            node.match = match;
            node.description = (description !== '' ? description : (capture !== '' ? capture : match));
            return this.add(node);
        };
        ___self.prototype.matches = function matches(token) {
            if ((token.type & this.tokenType) === 0) {
                return false;
            }
            if (this.match === '') {
                return true;
            } else if (typeof this.match === 'string') {
                return token.data === this.match;
            } else {
                return this.match.test(token.data);
            }
        };
        ___self.prototype.reachesExit = function reachesExit(stack) {
            var children, lastChild;
            children = this.children;
            lastChild = children.length - 1;
            if (children[lastChild].type === Type.RETURN) {
                if (stack.length === 0) {
                    return true;
                } else {
                    return stack[stack.length - 1].node.reachesExit(stack.slice(0, -1));
                }
            }
            return false;
        };
        ___self.prototype.matchingTokens = function matchingTokens(definition, stack, result) {
            var children;
            result = (arguments.length > 2 ? result : ({  }));
            children = this.children;
            var _, child;
            for (_ in children) {
                child = children[_];
                if (child.type === Type.RETURN) {
                    var returnTo;
                    returnTo = stack[stack.length - 1].node;
                    returnTo.matchingTokens(definition, stack.slice(0, -1), result);
                } else if (child.type === Type.JUMP) {
                    var jumpTo;
                    jumpTo = definition.getBlock(child.match);
                    jumpTo.matchingTokens(definition, stack.concat([ new StackItem(child, null) ]), result);
                } else if (child.type === Type.BLOCK) {
                    child.matchingTokens(definition, stack, result);
                } else {
                    result[child.description != '' ? child.description : (child.capture != '' ? child.capture : '"' + child.match + '"')] = true;
                }
            }
            return result;
        };
        ___self.prototype.filter = function* filter(parser, token, stack) {
            var children, child, blockRoot, generator, result;
            children = this.children;
            if (stack.length > 500) {
                var message;
                message = parser.errorMessage(token, this, stack);
                throw new Exception('recursion too deep. last error:\n' + message);
            }
            var id, len;
            for (id = 0, len = children.length; id < len;id++) {
                child = children[id];
                if (child.type === Type.JUMP) {
                    if (child.condition !== '' && parser.checkCondition(child.condition, stack) === false) {
                        continue ;
                    }
                    blockRoot = parser.definition.getBlock(child.match);
                    generator = blockRoot.filter(parser, token, stack.concat(new StackItem(child, token)));
                    while ((result = generator.next()).done === false) {
                        yield result.value;
                    }
                } else if (child.type === Type.RETURN) {
                    var top;
                    if (stack.length === 0) {
                        throw new Error('nothing to yield');
                    }
                    top = stack[stack.length - 1].node;
                    generator = top.filter(parser, token, stack.slice(0, -1));
                    while ((result = generator.next()).done === false) {
                        result.value.minStack = Math.min(result.value.minStack, stack.length - 1);
                        yield result.value;
                    }
                } else if (child.matches(token)) {
                    yield { node: child, stack: stack, minStack: stack.length };
                }
            }
        };
        ___self.prototype.toString = function toString(definition, stack) {
            var result;
            result = this.matchingTokens(definition, stack);
            return Object.keys(result).join(', ');
        };
        return ___self;
    })();
    Type = Enum([ 'NONE', 'BLOCK', 'JUMP', 'RETURN' ]);
    StackItem = (function() {
        var ___self = function StackItem(node, token) {
            this.node = node;
            this.token = token;
        };
        var StackItem = ___self;
        ___self.prototype.node = null;
        ___self.prototype.token = null;
        return ___self;
    })();
    module.exports = Node;
    module.exports.Type = Type;
    module.exports.StackItem = StackItem;
});
module('parser/definition.adria', function(module, resource) {
    var Node, Definition;
    Node = require('parser/definition/node.adria');
    Definition = (function() {
        var ___self = function Definition(initialBlock) {
            initialBlock = (arguments.length > 0 ? initialBlock : ('root'));
            this.blockRoot = {  };
            this.initialBlock = initialBlock;
        };
        var Definition = ___self;
        ___self.prototype.createBlock = function createBlock(rootNode, name) {
            name = (arguments.length > 1 ? name : (this.initialBlock));
            rootNode.match = 'block_' + name;
            this.blockRoot[name] = rootNode;
            return rootNode;
        };
        ___self.prototype.haveBlock = function haveBlock(name) {
            return (this.blockRoot[name] !== undefined);
        };
        ___self.prototype.getBlock = function getBlock(name) {
            var node;
            node = this.blockRoot[name];
            if (node === undefined) {
                throw new Exception('referencing non-existing definition block ' + name);
            }
            return node;
        };
        ___self.prototype.getInitialBlock = function getInitialBlock() {
            return this.getBlock(this.initialBlock);
        };
        return ___self;
    })();
    module.exports = Definition;
    module.exports.Node = Node;
});
module('parser.adria', function(module, resource) {
    var path, util, GeneratorState, Token, Definition, Node, Parser;
    path = ___require('path');
    util = require('util.adria');
    GeneratorState = require('parser/generator_state.adria');
    Token = require('tokenizer/token.adria');
    Definition = require('parser/definition.adria');
    Node = Definition.Node;
    Parser = (function() {
        var ___self = function Parser() {
            this.definition = new Definition('root');
        };
        var Parser = ___self;
        ___self.prototype.definition = null;
        ___self.prototype.tokenizer = null;
        ___self.prototype.file = 'unnamed';
        ___self.prototype.includeTrace = true;
        ___self.prototype.clone = function clone() {
            var parser;
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.clone !== clone || ___c.hasOwnProperty('clone') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            parser = ___p.prototype.clone.call(this);
            parser.definition = this.definition;
            parser.tokenizer = this.tokenizer;
            parser.file = this.file;
            parser.includeTrace = this.includeTrace;
            return parser;
        };
        ___self.prototype.trace = function trace(token, node, stack) {
            var id, result, done, levelNode, levelToken;
            stack = stack.slice();
            stack.push({ node: node, token: token });
            id = stack.length - 1;
            result = '';
            done = 0;
            while (id--) {
                levelNode = stack[id].node;
                levelToken = stack[id].token;
                if (levelNode instanceof Object) {
                    result += (id + 1) + '. ' + levelNode.name + (levelNode.capture !== '' ? ':' + levelNode.capture : '') + (levelNode.label !== '' ? '[' + levelNode.label + ']' : '');
                } else {
                    result += 'null entry on stack';
                }
                result += ' at ' + levelToken.pos.toString() + ': ' + levelToken.data + '\n';
                if (done++ > 15 && id > 15) {
                    id = 15;
                    result += '...\n';
                }
            }
            return result;
        };
        ___self.prototype.errorMessage = function errorMessage(token, node, stack) {
            var trace, message;
            message = '$file: Unexpected token "$tokenData" $position. Expected: $validNodes\n';
            if (this.includeTrace) {
                trace = this.trace(token, node, stack);
                message += '\nTrace:\n$trace';
            }
            return message.format({
                file: path.normalize(this.file),
                tokenData: token.data,
                position: token.pos.toString(),
                validNodes: node.toString(this.definition, stack),
                trace: trace
            });
        };
        ___self.prototype.checkCondition = function checkCondition(condition, stack) {
            throw Exception('NYI: parser::checkCondition');
        };
        ___self.prototype.parse = function parse(source) {
            var tokens, node, stack, len, tokenId, maxId, maxStack, maxNode, results, success, result, token;
            log('Parser', 'tokenizing', 2);
            tokens = this.tokenizer.process(source, this.file);
            log('Parser', 'done', -2);
            if (tokens.length === 0) {
                throw new Exception(path.normalize(this.file) + ': File is empty.');
            }
            node = this.definition.getInitialBlock();
            stack = [  ];
            len = tokens.length;
            tokenId = len;
            maxId = 0;
            maxStack = [  ];
            maxNode = node;
            results = new Array(len);
            success = false;
            while (tokenId--) {
                results[tokenId] = new GeneratorState();
            }
            tokenId = 0;
            log('Parser', 'processing ' + len + ' tokens according to currrent language definition');
            do {
                result = results[tokenId];
                if (result.generator === null) {
                    token = tokens[tokenId];
                    result.setGenerator(node.filter(this, token, stack), token);
                }
                try {
                    result.next();
                } catch (___exc2) {
                    var e = ___exc2;
                    if (e.message === 'nothing to yield') {
                        break ;
                    } else {
                        throw e;
                    }
                }
                if (result.done) {
                    result.setGenerator();
                    tokenId--;
                } else if (tokenId === len - 1) {
                    if (result.node.reachesExit(result.stack)) {
                        success = true;
                        break ;
                    } else {
                        continue ;
                    }
                } else {
                    if (tokenId > maxId) {
                        maxId = tokenId;
                        maxStack = result.stack.slice(0);
                        maxNode = result.node;
                    }
                    node = result.node;
                    stack = result.stack.slice(0);
                    tokenId++;
                }
            } while (tokenId >= 0);
            if (success === false) {
                if (maxId + 1 === len) {
                    throw new Exception(path.normalize(this.file) + ': Unexpected end of file.');
                } else {
                    throw new Exception(this.errorMessage(tokens[maxId + 1], maxNode, maxStack));
                }
            }
            return results;
        };
        return ___self;
    })();
    module.exports = Parser;
    module.exports.Definition = Definition;
});
module('tokenizer/definition_item.adria', function(module, resource) {
    var DefinitionItem;
    DefinitionItem = (function() {
        var ___self = function DefinitionItem(name, match) {
            this.name = name;
            this.match = match;
        };
        var DefinitionItem = ___self;
        ___self.prototype.name = null;
        ___self.prototype.match = null;
        return ___self;
    })();
    module.exports = DefinitionItem;
});
module('tokenizer/match.adria', function(module, resource) {
    var Match;
    Match = (function() {
        var ___self = function Match(name, data, endPosition, containedRows, lastRowLen) {
            this.name = name;
            this.data = data;
            this.endPosition = endPosition;
            this.containedRows = containedRows;
            this.lastRowLen = lastRowLen;
        };
        var Match = ___self;
        ___self.prototype.name = null;
        ___self.prototype.data = '';
        ___self.prototype.endPosition = -1;
        ___self.prototype.containedRows = -1;
        ___self.prototype.lastRowLen = -1;
        return ___self;
    })();
    module.exports = Match;
});
module('tokenizer/prefabs.adria', function(module, resource) {
    var Match, DefinitionItem, regex, breaker, number, delimited, exclude, set, group, any, regexFunc, regexEscape, excludeFunc;
    Match = require('tokenizer/match.adria');
    DefinitionItem = require('tokenizer/definition_item.adria');
    regex = function regex(name, thisRegex, lastRegex, callback) {
        lastRegex = (arguments.length > 2 ? lastRegex : (null));
        callback = (arguments.length > 3 ? callback : (null));
        return regexFunc(name, thisRegex, lastRegex, callback);
    };
    breaker = function breaker() {
        return regexFunc(null, /^(\s+)/, null, null);
    };
    number = function number(name) {
        return regexFunc(name, /^(\-?[0-9]+(\.[0-9]+)?(e\-?[0-9]+)?)/, null, null);
    };
    delimited = function delimited(name, start, end) {
        var ___regex_scp2;
        start = (arguments.length > 1 ? start : ('"'));
        end = (arguments.length > 2 ? end : (start));
        ___regex_scp2 = new RegExp('^(' + regexEscape(start) + '[\\s\\S]*?' + regexEscape(end) + ')');
        return regexFunc(name, ___regex_scp2, null, null);
    };
    exclude = function exclude(name, regex, excluded) {
        return regexFunc(name, regex, null, excludeFunc.bind(excluded));
    };
    set = function set(name, matches) {
        var escaped, ___regex_scp3;
        escaped = [  ];
        var id;
        for (id in matches) {
            escaped.push(regexEscape(matches[id]));
        }
        ___regex_scp3 = new RegExp('^(' + escaped.join('|') + ')');
        return regexFunc(name, ___regex_scp3, null, null);
    };
    group = function group(name, matches) {
        var escaped, ___regex_scp4;
        escaped = [  ];
        var id;
        for (id in matches) {
            escaped.push(regexEscape(matches[id]));
        }
        ___regex_scp4 = new RegExp('^([' + escaped.join() + ']+)');
        return regexFunc(name, ___regex_scp4, null, null);
    };
    any = function any(name) {
        return regexFunc(name, /^[^\s]*/, null, null);
    };
    regexFunc = function regexFunc(name, regex, lastRegex, callback) {
        return new DefinitionItem(name, function(data, start, lastMatch) {
            var result;
            result = regex.exec(data.substr(start));
            if (result !== null && (lastRegex === null || lastRegex.exec(lastMatch) !== null)) {
                var rows, lastBreak, lastRowLen, match;
                rows = result[0].occurances('\n');
                lastBreak = result[0].lastIndexOf('\n');
                lastRowLen = result[0].length - (lastBreak + 1);
                match = new Match(this.name, result[0], start + result[0].length, rows, lastRowLen);
                if (callback !== null) {
                    return callback(match);
                } else {
                    return match;
                }
            }
            return null;
        });
    };
    regexEscape = function regexEscape(regexString) {
        return RegExp.escape(regexString).replace('/', '\\/');
    };
    excludeFunc = function excludeFunc(match) {
        if (this.has(match.data)) {
            return null;
        }
        return match;
    };
    module.exports.regex = regex;
    module.exports.breaker = breaker;
    module.exports.number = number;
    module.exports.delimited = delimited;
    module.exports.exclude = exclude;
    module.exports.set = set;
    module.exports.group = group;
    module.exports.any = any;
});
module('tokenizer.adria', function(module, resource) {
    var Set, Enum, DefinitionItem, Token, Match, prefabs, Tokenizer;
    Set = require('../../astdlib/astd/set.adria');
    Enum = require('util.adria').Enum;
    DefinitionItem = require('tokenizer/definition_item.adria');
    Token = require('tokenizer/token.adria');
    Match = require('tokenizer/match.adria');
    prefabs = require('tokenizer/prefabs.adria');
    Tokenizer = (function() {
        var ___self = function Tokenizer(definition, extra) {
            var legend;
            extra = (arguments.length > 1 ? extra : (null));
            legend = [  ];
            var id;
            for (id in definition) {
                legend.push(definition[id].name);
            }
            if (extra instanceof Array) {
                var id;
                for (id in extra) {
                    legend.push(extra);
                }
            }
            this.definition = definition;
            this.Type = Enum(legend);
        };
        var Tokenizer = ___self;
        ___self.prototype.process = function process(data, filename) {
            var startPos, result, col, row, lastMatch, match, found;
            filename = (arguments.length > 1 ? filename : ('unnamed'));
            startPos = 0;
            result = [  ];
            col = 1;
            row = 1;
            lastMatch = null;
            while (startPos < data.length) {
                found = false;
                var _, processor;
                for (_ in this.definition) {
                    processor = this.definition[_];
                    match = processor.match(data, startPos, lastMatch);
                    if (match !== null) {
                        if (match.data !== null && match.name !== null) {
                            result.push(new Token(match.data, this.Type[match.name], startPos, col, row));
                            lastMatch = match.data;
                        }
                        row += match.containedRows;
                        col = (match.containedRows === 0 ? col + match.lastRowLen : match.lastRowLen + 1);
                        found = true;
                        startPos += match.data.length;
                        break ;
                    }
                }
                if (found !== true) {
                    throw new Exception(filename + ': no match found at row ' + row + ', column ' + col + ': "' + data.substr(startPos).split(/\r?\n/)[0] + '"');
                }
            }
            return result;
        };
        return ___self;
    })();
    module.exports = Tokenizer;
    module.exports.DefinitionItem = DefinitionItem;
    module.exports.Token = Token;
    module.exports.Match = Match;
    module.exports.prefabs = prefabs;
});
module('definition_parser/path.adria', function(module, resource) {
    var Path, PathElement;
    Path = (function() {
        var ___self = function Path(source, target) {
            source = (arguments.length > 0 ? source : (new PathElement()));
            target = (arguments.length > 1 ? target : (new PathElement()));
            this.source = source;
            this.target = target;
        };
        var Path = ___self;
        ___self.prototype.source = null;
        ___self.prototype.target = null;
        ___self.prototype.reset = function reset() {
            this.source = this.target;
            this.target = new PathElement();
        };
        ___self.prototype.clone = function clone() {
            return new Path(this.source.clone(), this.target.clone());
        };
        return ___self;
    })();
    PathElement = (function() {
        var ___self = function PathElement(name, capture, label, condition) {
            name = (arguments.length > 0 ? name : (''));
            capture = (arguments.length > 1 ? capture : (''));
            label = (arguments.length > 2 ? label : (''));
            condition = (arguments.length > 3 ? condition : (''));
            this.name = name;
            this.capture = capture;
            this.label = label;
            this.condition = condition;
        };
        ___self.prototype = Object.create(null);
        ___self.prototype.constructor = ___self;
        var PathElement = ___self;
        ___self.prototype.name = '';
        ___self.prototype.capture = '';
        ___self.prototype.label = '';
        ___self.prototype.condition = '';
        ___self.prototype.clone = function clone() {
            return new PathElement(this.name, this.capture, this.label, this.condition);
        };
        return ___self;
    })();
    module.exports = Path;
});
module('definition_parser.adria', function(module, resource) {
    var util, Parser, Tokenizer, Path, DefinitionParser;
    util = require('util.adria');
    Parser = require('parser.adria');
    Tokenizer = require('tokenizer.adria');
    Path = require('definition_parser/path.adria');
    DefinitionParser = (function(___parent) {
        var ___self = function DefinitionParser() {
            Parser.prototype.constructor.call(this);
            this.tokenizer = new Tokenizer([
                Tokenizer.prefabs.delimited(null, '/*', '*/'),
                Tokenizer.prefabs.regex(null, /^\/\/.*/),
                Tokenizer.prefabs.breaker(),
                Tokenizer.prefabs.regex('WORD', /^[a-z_]+/i),
                Tokenizer.prefabs.set('DELIM', [ '->', '.', ':', '[', ']', '{', '}', '?' ]),
                Tokenizer.prefabs.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/),
                Tokenizer.prefabs.number('NUMERIC')
            ]);
            this.trainSelf();
            this.pathBlocks = {  };
            this.currentPath = new Path();
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var DefinitionParser = ___self;
        ___self.prototype.capture = function capture(name, value) {
            var currentPath;
            currentPath = this.currentPath;
            if (name == 'block_name') {
                this.block_name = value;
                this.pathBlocks[this.block_name] = [  ];
                return ;
            }
            if ((name == 'path' || name == 'source_name' || name == 'block_done') && currentPath.source.name != '' && currentPath.target.name != '') {
                this.pathBlocks[this.block_name].push(currentPath.clone());
                currentPath.reset();
            }
            if (name == 'source_name') {
                currentPath.source.name = value;
                currentPath.source.capture = '';
                currentPath.source.label = '';
                currentPath.source.condition = '';
            } else if (name == 'target_name') {
                currentPath.target.name = value;
                currentPath.target.capture = '';
                currentPath.target.label = '';
                currentPath.target.condition = '';
            } else if (name == 'source_capture') {
                currentPath.source.capture = value;
            } else if (name == 'target_capture') {
                currentPath.target.capture = value;
            } else if (name == 'source_label') {
                currentPath.source.label = value;
            } else if (name == 'target_label') {
                currentPath.target.label = value;
            } else if (name == 'source_condition') {
                currentPath.source.condition = value.slice(1, -1);
            } else if (name == 'target_condition') {
                currentPath.target.condition = value.slice(1, -1);
            }
        };
        ___self.prototype.parse = function parse(source) {
            var results;
            results = Parser.prototype.parse.call(this, source);
            var id, result;
            for (id in results) {
                result = results[id];
                if (result.node.capture != '') {
                    this.capture(result.node.capture, result.token.data);
                }
            }
            return results;
        };
        ___self.prototype.trainOther = function trainOther(parser) {
            var parts;
            parts = [ 'source', 'target' ];
            var blockName, blockPaths, nodeMap, nodePair;
            for (blockName in this.pathBlocks) {
                blockPaths = this.pathBlocks[blockName];
                nodeMap = {  };
                nodePair = [  ];
                var _, path;
                for (_ in blockPaths) {
                    path = blockPaths[_];
                    var i, part, hash;
                    for (i in parts) {
                        part = parts[i];
                        hash = path[part].name + ':' + path[part].capture + ':' + path[part].label;
                        nodePair[i] = nodeMap[hash];
                        if (nodePair[i] === undefined) {
                            var node;
                            node = parser.createNode(path[part].name, path[part].capture, path[part].label, path[part].condition);
                            nodeMap[hash] = node;
                            nodePair[i] = node;
                        }
                    }
                    parser.integrateNodePair(nodePair, blockName);
                }
            }
        };
        ___self.prototype.trainSelf = function trainSelf() {
            var Type, blockRoot, blockname, body, node1a, node1b, node1c, node1d, node1e, node1f, node1g, node1h, path1a, node2a, node2b, node2c, node2d, node2e, node2f, node2g, node2h, bodyend, exit;
            Type = this.tokenizer.Type;
            blockRoot = new Parser.Definition.Node();
            this.definition.createBlock(blockRoot);
            blockname = blockRoot.createAndAdd(Type.WORD, /[\S\s]+/, 'block_name');
            body = blockname.createAndAdd(Type.DELIM, '{', '', '{');
            node1a = body.createAndAdd(Type.WORD | Type.STRING, /[\S\s]+/, 'source_name');
            node1b = node1a.createAndAdd(Type.DELIM, ':', '', ':');
            node1c = node1b.createAndAdd(Type.WORD, /[\S\s]+/, 'source_capture');
            node1d = node1c.createAndAdd(Type.DELIM, '[', '', '[');
            node1e = node1d.createAndAdd(Type.WORD, /[\S\s]+/, 'source_label');
            node1f = node1e.createAndAdd(Type.DELIM, ']', '', ']');
            node1g = node1f.createAndAdd(Type.DELIM, '?', '', '?');
            node1h = node1g.createAndAdd(Type.STRING, /[\S\s]+/, 'source_condition');
            node1a.add(node1d);
            node1a.add(node1g);
            node1c.add(node1g);
            path1a = node1a.createAndAdd(Type.DELIM, '->', 'path', '->');
            node1h.add(path1a);
            node1f.add(path1a);
            node1c.add(path1a);
            node2a = path1a.createAndAdd(Type.WORD | Type.STRING, /[\S\s]+/, 'target_name');
            node2b = node2a.createAndAdd(Type.DELIM, ':', '', ':');
            node2c = node2b.createAndAdd(Type.WORD, /[\S\s]+/, 'target_capture');
            node2d = node2c.createAndAdd(Type.DELIM, '[', '', '[');
            node2e = node2d.createAndAdd(Type.WORD, /[\S\s]+/, 'target_label');
            node2f = node2e.createAndAdd(Type.DELIM, ']', '', ']');
            node2g = node2f.createAndAdd(Type.DELIM, '?', '', '?');
            node2h = node2g.createAndAdd(Type.STRING, /[\S\s]+/, 'target_condition');
            node2a.add(node2d);
            node2a.add(node2g);
            node2c.add(node2g);
            node2h.add(path1a);
            node2f.add(path1a);
            node2c.add(path1a);
            node2a.add(path1a);
            node2h.add(node1a);
            node2f.add(node1a);
            node2c.add(node1a);
            node2a.add(node1a);
            bodyend = node2c.createAndAdd(Type.DELIM, '}', 'block_done', '}');
            node2a.add(bodyend);
            node2f.add(bodyend);
            node2h.add(bodyend);
            bodyend.add(blockname);
            exit = bodyend.createAndAdd(Type.WORD, 'exit');
            exit.type = Parser.Definition.Node.Type.RETURN;
        };
        return ___self;
    })(Parser);
    module.exports = DefinitionParser;
});
module('language_parser/capture_node.adria', function(module, resource) {
    var SourceNode, Template, CaptureNode, stackDiff;
    SourceNode = require('source_node.adria');
    Template = require('template.adria');
    CaptureNode = (function() {
        var ___self = function CaptureNode(key, value) {
            this.key = key;
            this.value = value;
        };
        var CaptureNode = ___self;
        ___self.prototype.parent = null;
        ___self.prototype.children = null;
        ___self.prototype.key = '';
        ___self.prototype.value = '';
        ___self.prototype.tpl = null;
        ___self.prototype.row = 0;
        ___self.prototype.col = 0;
        ___self.prototype.toJSON = function toJSON() {
            var children;
            children = [  ];
            var id;
            for (id in this.children) {
                children.push(this.children[id].toJSON());
            }
            return {
                _: this.constructor.name,
                s: children,
                k: this.key,
                v: this.value,
                t: this.tpl,
                r: this.row,
                c: this.col
            };
        };
        ___self.prototype.fromJSON = function fromJSON(json, parentNode, typeMapper) {
            var Type, result, jsonChildren, resultChildren;
            Type = typeMapper(null, json._);
            result = new Type(json.k, json.v);
            result.parent = parentNode;
            result.tpl = json.t;
            result.row = json.r;
            result.col = json.c;
            result.children = [  ];
            jsonChildren = json.s;
            resultChildren = result.children;
            var id;
            for (id in jsonChildren) {
                resultChildren.push(CaptureNode.prototype.fromJSON(jsonChildren[id], result, typeMapper));
            }
            return result;
        };
        ___self.prototype.fromResults = function fromResults(results, parentNode, typeMapper) {
            var root, current, lastStack, result, stack, diff, node;
            root = new CaptureNode('', '');
            current = root;
            lastStack = [  ];
            root.parent = parentNode;
            var resultId;
            for (resultId in results) {
                result = results[resultId];
                stack = result.stack;
                diff = stackDiff(stack, lastStack, result.minStack);
                while (diff.ascend--) {
                    current = current.parent;
                }
                var nodeId;
                for (nodeId in diff.create) {
                    node = diff.create[nodeId];
                    current = current.addNew(node.capture, node.name, typeMapper(node.capture, node.name));
                    current.row = result.token.pos.row;
                    current.col = result.token.pos.col;
                }
                node = result.node;
                if (node.capture !== '') {
                    var match;
                    match = current.addNew(node.capture, result.token.data, typeMapper(node.capture, node.name));
                    match.row = result.token.pos.row;
                    match.col = result.token.pos.col;
                }
                lastStack = stack;
            }
            return root;
        };
        ___self.prototype.isNode = function isNode() {
            return this.col !== -1;
        };
        ___self.prototype.isDummy = function isDummy() {
            return this.col === -1;
        };
        ___self.prototype.isLeaf = function isLeaf() {
            return (this.children instanceof Array === false);
        };
        ___self.prototype.isBranch = function isBranch() {
            return (this.children instanceof Array);
        };
        ___self.prototype.length = function length() {
            return (this.children instanceof Array ? this.children.length : 0);
        };
        ___self.prototype.depth = function depth() {
            var result, current;
            result = 0;
            current = this;
            while (current.parent instanceof CaptureNode) {
                result += 1;
                current = current.parent;
            }
            return result;
        };
        ___self.prototype.ancestor = function ancestor(key, value, dummy) {
            var current;
            value = (arguments.length > 1 ? value : (null));
            dummy = (arguments.length > 2 ? dummy : (this.dummy));
            current = this;
            key = typeof key === 'string' ? [ key ] : key;
            value = typeof value === 'string' ? [ value ] : value;
            if (key !== null && value !== null) {
                while (current.parent instanceof CaptureNode && key.indexOf(current.parent.key) === -1 && value.indexOf(current.parent.value) === -1) {
                    current = current.parent;
                }
            } else if (key !== null) {
                while (current.parent instanceof CaptureNode && key.indexOf(current.parent.key) === -1) {
                    current = current.parent;
                }
            } else if (value !== null) {
                while (current.parent instanceof CaptureNode && value.indexOf(current.parent.value) === -1) {
                    current = current.parent;
                }
            }
            if (current.parent instanceof CaptureNode) {
                return current.parent;
            } else {
                return dummy;
            }
        };
        ___self.prototype.findProto = function findProto(Constructor, StopConstructor, fromParent, dummy) {
            var current;
            StopConstructor = (arguments.length > 1 ? StopConstructor : (null));
            fromParent = (arguments.length > 2 ? fromParent : (true));
            dummy = (arguments.length > 3 ? dummy : (this.dummy));
            current = fromParent ? this.parent : this;
            while (current instanceof CaptureNode && current instanceof Constructor === false && (StopConstructor === null || current instanceof StopConstructor === false)) {
                current = current.parent;
            }
            return current instanceof Constructor ? current : dummy;
        };
        ___self.prototype.parser = function parser() {
            var current, LanguageParser;
            current = this;
            LanguageParser = require('language_parser.adria');
            while (current.parent !== null && (current.parent instanceof LanguageParser === false)) {
                current = current.parent;
            }
            return current.parent;
        };
        ___self.prototype.add = function add(child) {
            if (this.children == null) {
                this.children = [  ];
            }
            this.children.push(child);
            return child;
        };
        ___self.prototype.get = function get(key, index, dummy) {
            index = (arguments.length > 1 ? index : (0));
            dummy = (arguments.length > 2 ? dummy : (this.dummy));
            if (this.children instanceof Array) {
                var id, child;
                for (id in this.children) {
                    child = this.children[id];
                    if (child.key == key && index-- == 0) {
                        return child;
                    }
                }
            }
            return dummy;
        };
        ___self.prototype.has = function has(key) {
            if (this.children instanceof Array) {
                var id, child;
                for (id in this.children) {
                    child = this.children[id];
                    if (child.key == key) {
                        return true;
                    }
                }
            }
            return false;
        };
        ___self.prototype.path = function path(pathString, dummy) {
            var step, current;
            dummy = (arguments.length > 1 ? dummy : (this.dummy));
            current = this;
            pathString = pathString.split('.');
            var id;
            for (id in pathString) {
                step = pathString[id].split('[');
                if (step.length === 1) {
                    current = current.get(step[0]);
                } else {
                    current = current.get(step[0], parseInt(step[1].slice(0, -1)));
                }
                if (current.isDummy()) {
                    return dummy;
                }
            }
            return current;
        };
        ___self.prototype.addNew = function addNew(key, value, Constructor) {
            var child;
            child = new Constructor(key, value);
            child.parent = this;
            return this.add(child);
        };
        ___self.prototype.extract = function extract(from, to) {
            return this.children.splice(from, to - from + 1);
        };
        ___self.prototype.nest = function nest(from, to, Constructor) {
            var node;
            Constructor = (arguments.length > 2 ? Constructor : (this.constructor));
            node = new Constructor(this.key, this.value);
            node.children = this.children.splice(from, to - from + 1, node);
            node.parent = this;
            node.tpl = this.tpl;
            node.row = node.children[0].row;
            node.col = node.children[0].col;
            var id, child;
            for (id in node.children) {
                child = node.children[id];
                child.parent = node;
            }
        };
        ___self.prototype.nl = function nl(indent, node) {
            var parser;
            indent = (arguments.length > 0 ? indent : (0));
            node = (arguments.length > 1 ? node : (null));
            parser = this.parser();
            parser.indent += indent;
            if (node !== null) {
                node.trim();
            }
            return '\n' + String.repeat(parser.indent * 4, ' ');
        };
        ___self.prototype.csn = function csn(code) {
            return new SourceNode(this.row, this.col - 1, null, code);
        };
        ___self.prototype.toString = function toString() {
            var result;
            result = '';
            if (this.children instanceof Array) {
                var id;
                for (id in this.children) {
                    result += this.children[id].toString();
                }
            }
            return result;
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = new SourceNode(null, null);
            if (this.children instanceof Array) {
                var id, child;
                for (id in this.children) {
                    child = this.children[id].toSourceNode();
                    if (child !== '') {
                        result.add(child);
                    }
                }
            }
            return result;
        };
        ___self.prototype.scan = function scan(state) {
            if (this.children instanceof Array) {
                var id, child;
                for (id in this.children) {
                    child = this.children[id];
                    child.scan(state);
                }
            }
        };
        ___self.prototype.preprocess = function preprocess(state) {
            if (this.children instanceof Array) {
                var id, child;
                for (id in this.children) {
                    child = this.children[id];
                    child.preprocess(state);
                }
            }
        };
        ___self.prototype.each = function each(fn) {
            var children;
            children = this.children;
            if (children instanceof Array) {
                var last;
                last = children.length - 1;
                var id;
                for (id in children) {
                    fn.call(this, children[id], +id === 0, +id === last);
                }
            }
        };
        ___self.prototype.eachKey = function eachKey(key, fn) {
            var part;
            part = key.split('.');
            if (this.children instanceof Array) {
                var children, len, prevChild, first, id;
                children = this.children;
                len = children.length;
                prevChild = null;
                first = true;
                var child;
                for (id = 0; id < len;id++) {
                    child = children[id];
                    if (child.key === part[0]) {
                        if (part.length === 1) {
                            if (prevChild !== null) {
                                fn.call(this, prevChild, first, false);
                                first = false;
                            }
                            prevChild = child;
                        } else if (part.length > 1) {
                            child.eachKey(part.slice(1).join('.'), fn);
                        }
                    }
                }
                if (prevChild !== null && prevChild.key === part[0] && part.length === 1) {
                    fn.call(this, prevChild, first, true);
                }
            }
        };
        ___self.prototype.setTemplate = function setTemplate(fileName) {
            this.tpl = new Template();
            this.tpl.debug = this.parser().transform.options['debug'];
            this.tplFile = fileName;
        };
        ___self.prototype.processTemplate = function processTemplate() {
            return this.tpl.fetchFile(this.tplFile);
        };
        ___self.prototype.assign = function assign(name, value) {
            this.tpl.assign(name, value);
        };
        return ___self;
    })();
    CaptureNode.prototype.dummy = new CaptureNode('', '');
    CaptureNode.prototype.dummy.row = -1;
    CaptureNode.prototype.dummy.col = -1;
    stackDiff = function stackDiff(stack, lastStack, minStackLen) {
        var deepestCommonCapture, minLen, numCaptures, lastLen, captures, len;
        deepestCommonCapture = -1;
        minLen = Math.min(stack.length, lastStack.length, minStackLen);
        var i;
        for (i = 0; i < minLen;i++) {
            if (stack[i].node === lastStack[i].node) {
                if (stack[i].node.capture !== '') {
                    deepestCommonCapture = i;
                }
            } else {
                break ;
            }
        }
        numCaptures = 0;
        lastLen = lastStack.length;
        var i;
        for (i = deepestCommonCapture + 1; i < lastLen;i++) {
            if (lastStack[i].node.capture !== '') {
                numCaptures++;
            }
        }
        captures = [  ];
        len = stack.length;
        var i;
        for (i = deepestCommonCapture + 1; i < len;i++) {
            if (stack[i].node.capture !== '') {
                captures.push(stack[i].node);
            }
        }
        return { ascend: numCaptures, create: captures };
    };
    module.exports = CaptureNode;
});
module('language_parser/ast_exception.adria', function(module, resource) {
    var CaptureNode, ASTException;
    CaptureNode = require('language_parser/capture_node.adria');
    ASTException = (function(___parent) {
        var ___self = function ASTException(message, node) {
            this.row = node.row;
            this.col = node.col;
            this.file = node.file;
            Exception.prototype.constructor.call(this, message + ' in ' + node.parser().file + ' line ' + node.row + ', column ' + node.col);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ASTException = ___self;
        ___self.prototype.row = 0;
        ___self.prototype.col = 0;
        ___self.prototype.file = '';
        return ___self;
    })(Exception);
    module.exports = ASTException;
});
module('language_parser.adria', function(module, resource) {
    var fs, util, Parser, DefinitionParser, Transform, CaptureNode, ASTException, LanguageParser;
    fs = ___require('fs');
    util = require('util.adria');
    Parser = require('parser.adria');
    DefinitionParser = require('definition_parser.adria');
    Transform = require('transform.adria');
    CaptureNode = require('language_parser/capture_node.adria');
    ASTException = require('language_parser/ast_exception.adria');
    LanguageParser = (function(___parent) {
        var ___self = function LanguageParser(transform) {
            Parser.prototype.constructor.call(this, transform);
            this.transform = transform;
            this.includeTrace = transform.options['debug'];
            this.resultData = {  };
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var LanguageParser = ___self;
        ___self.prototype.trainer = null;
        ___self.prototype.sourceCode = null;
        ___self.prototype.captureTree = null;
        ___self.prototype.resultData = null;
        ___self.prototype.cacheData = null;
        ___self.prototype.cacheModifier = null;
        ___self.prototype.transform = null;
        ___self.prototype.outputMethod = 'toSourceNode';
        ___self.prototype.clone = function clone() {
            var parser;
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.clone !== clone || ___c.hasOwnProperty('clone') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            parser = ___p.prototype.clone.call(this);
            parser.trainer = this.trainer;
            parser.sourceCode = this.sourceCode;
            parser.captureTree = this.captureTree;
            parser.resultData = this.resultData;
            parser.cacheData = this.cacheData;
            parser.cacheModifier = this.cacheModifier;
            parser.transform = this.transform;
            parser.outputMethod = this.outputMethod;
            parser.includeTrace = this.includeTrace;
            return parser;
        };
        ___self.prototype.trainSelf = function trainSelf() {
            this.definition = new Parser.Definition();
            this.trainer.trainOther(this);
            this.trainer = null;
        };
        ___self.prototype.setDefinition = function setDefinition(data, filename) {
            log('LanguageParser', 'setting definition file ' + filename);
            if (this.trainer == null) {
                this.trainer = new DefinitionParser();
            }
            log('LanguageParser', 'processing definition', 2);
            this.trainer.file = filename;
            this.trainer.parse(data);
            log('LanguageParser', 'done', -2);
        };
        ___self.prototype.loadDefinition = function loadDefinition(filename) {
            var fileContents;
            log('LanguageParser', 'loading definition file ' + filename);
            fileContents = fs.readFileSync(filename, 'UTF-8');
            this.setDefinition(fileContents, filename);
        };
        ___self.prototype.mapType = function mapType(captureName, blockName) {
            return CaptureNode;
        };
        ___self.prototype.createNode = function createNode(name, capture, label, condition) {
            var Node, node, numChars;
            Node = Parser.Definition.Node;
            node = new Node();
            node.name = name;
            node.capture = capture;
            node.label = label;
            node.condition = condition;
            switch (name) {
                case 'entry':
                case 'return':
                    node.match = '';
                    node.tokenType = -1;
                    node.type = (name == 'entry' ? Node.Type.BLOCK : Node.Type.RETURN);
                    node.description = '<Please file a bug-report if you ever see this message (' + name + ')>';
                    break ;
                case 'string':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.STRING;
                    node.type = Node.Type.NONE;
                    node.description = '<string literal>';
                    break ;
                case 'numeric':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.NUMERIC;
                    node.type = Node.Type.NONE;
                    node.description = '<numeric literal>';
                    break ;
                default:
                    numChars = name.length;
                    if (name[0] == '\"') {
                        node.match = new RegExp('^' + RegExp.escape(name.slice(1, numChars - 1)) + '$');
                        node.tokenType = -1;
                        node.type = Node.Type.NONE;
                        node.description = name.slice(1, numChars - 1);
                    } else if (name[0] == '\'') {
                        node.match = new RegExp(name.slice(1, numChars - 1));
                        node.tokenType = -1;
                        node.type = Node.Type.NONE;
                        node.description = name.slice(1, numChars - 1);
                    } else {
                        node.match = name;
                        node.tokenType = -1;
                        node.type = Node.Type.JUMP;
                        node.description = 'definition jump';
                    }
                    break ;
            }
            return node;
        };
        ___self.prototype.integrateNodePair = function integrateNodePair(pair, blockName) {
            pair[0].add(pair[1], Parser.Definition.Node.Type.RETURN & pair[1].type);
            if (pair[0].type == Parser.Definition.Node.Type.BLOCK && this.definition.haveBlock(blockName) == false) {
                this.definition.createBlock(pair[0], blockName);
            }
        };
        ___self.prototype.setSource = function setSource(filename, data, cacheModifier) {
            var captures;
            cacheModifier = (arguments.length > 2 ? cacheModifier : (null));
            this.cacheModifier = cacheModifier;
            this.captureTree = null;
            this.file = filename;
            this.sourceCode = this.preprocessRaw(data);
            log('LanguageParser', 'processing source ' + filename, 2);
            captures = this.parse(this.sourceCode);
            log('LanguageParser', 'done', -2);
            this.captureTree = CaptureNode.prototype.fromResults(captures, this, this.mapType.bind(this));
        };
        ___self.prototype.preprocessRaw = function preprocessRaw(data) {
            return data.replace('\r\n', '\n');
        };
        ___self.prototype.loadSourceFromCache = function loadSourceFromCache(filename, cacheModifier) {
            cacheModifier = (arguments.length > 1 ? cacheModifier : (null));
            this.cacheModifier = cacheModifier;
            this.cacheData = this.transform.cache.fetch(filename, [ 'base' ], cacheModifier);
            if (this.cacheData !== null) {
                this.file = filename;
                this.captureTree = CaptureNode.prototype.fromJSON(this.cacheData['base'], this, this.mapType.bind(this));
            }
        };
        ___self.prototype.loadSource = function loadSource(filename, cacheModifier) {
            cacheModifier = (arguments.length > 1 ? cacheModifier : (null));
            if (this.transform.options['cache'] && this.cacheData === null) {
                this.loadSourceFromCache(filename, cacheModifier);
            }
            if (this.cacheData === null) {
                this.setSource(filename, fs.readFileSync(filename, 'UTF-8'), cacheModifier);
            }
        };
        ___self.prototype.scan = function scan(state) {
            var InitialType;
            InitialType = this.mapType('', this.definition.initialBlock);
            InitialType.prototype.scan.call(this.captureTree, state);
        };
        ___self.prototype.preprocess = function preprocess(state) {
            var InitialType;
            InitialType = this.mapType('', this.definition.initialBlock);
            InitialType.prototype.preprocess.call(this.captureTree, state);
        };
        ___self.prototype.output = function output() {
            var result, InitialType;
            InitialType = this.mapType('', this.definition.initialBlock);
            result = InitialType.prototype[this.outputMethod].call(this.captureTree);
            if (this.transform.options['cache'] && this.cacheData === null && fs.existsSync(this.file)) {
                this.transform.cache.insert(this.file, { base: this.captureTree.toJSON() }, this.cacheModifier);
            }
            return result;
        };
        return ___self;
    })(Parser);
    module.exports = LanguageParser;
    module.exports.CaptureNode = CaptureNode;
    module.exports.ASTException = ASTException;
});
module('targets/adria/base/node.adria', function(module, resource) {
    var LanguageParser, ASTException, CaptureNode, Node;
    LanguageParser = require('language_parser.adria');
    ASTException = LanguageParser.ASTException;
    CaptureNode = LanguageParser.CaptureNode;
    Node = (function(___parent) {
        var ___self = function Node() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Node = ___self;
        ___self.prototype.Scope = null;
        ___self.prototype.findScope = function findScope(fromParent) {
            fromParent = (arguments.length > 0 ? fromParent : (false));
            return this.findProto(Node.prototype.Scope, null, fromParent, null);
        };
        ___self.prototype.checkDefined = function checkDefined(name) {
            var parser;
            parser = this.parser();
            if (parser.transform.implicits.has(name) || parser.transform.globals.has(name)) {
                return ;
            }
            if (this.findScope().findRef(name) !== null) {
                return ;
            }
            throw new ASTException('Undefined reference "' + name + '"', this);
        };
        ___self.prototype.findName = function findName() {
            var result, nameNode;
            result = null;
            nameNode = this.get('name');
            if (nameNode.isNode() === false) {
                nameNode = this.ancestor(null, [
                    'module_statement',
                    'export_statement',
                    'expression',
                    'dec_def',
                    'proto_body_item'
                ]);
                if (nameNode.isNode()) {
                    if (nameNode.value === 'dec_def' || nameNode.value === 'module_statement' || nameNode.value === 'export_statement') {
                        result = nameNode.get('name').toSourceNode();
                    } else if (nameNode.value === 'proto_body_item') {
                        result = nameNode.get('key').toSourceNode();
                    } else if (nameNode.value === 'expression') {
                        result = nameNode.findAssignee();
                    }
                }
            } else {
                result = nameNode.toSourceNode();
            }
            return result;
        };
        ___self.prototype.findAssignee = function findAssignee() {
            var children, found, result;
            children = this.children;
            found = -1;
            result = null;
            var id;
            for (id = 0; id < children.length;id++) {
                if (children[id].key === 'assignment_op') {
                    found = id - 1;
                    break ;
                }
            }
            if (found !== -1) {
                var child;
                child = children[found];
                if (child.value === 'access_operation_member' || child.value === 'access_operation_proto') {
                    result = child.csn(child.get('item').value);
                }
                if (child.key === 'ident') {
                    result = child.csn(child.toSourceNode());
                }
            }
            return result;
        };
        ___self.prototype.toString = function toString() {
            return this.toSourceNode().toString();
        };
        return ___self;
    })(CaptureNode);
    module.exports = Node;
});
module('targets/adria/base/value_type.adria', function(module, resource) {
    var Node, ValueType;
    Node = require('targets/adria/base/node.adria');
    ValueType = (function(___parent) {
        var ___self = function ValueType() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ValueType = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            return this.csn(this.value);
        };
        return ___self;
    })(Node);
    module.exports = ValueType;
});
module('targets/adria/ident.adria', function(module, resource) {
    var ValueType, Ident;
    ValueType = require('targets/adria/base/value_type.adria');
    Ident = (function(___parent) {
        var ___self = function Ident() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Ident = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var name;
            name = this.findScope().findRef(this.value);
            return this.csn(name !== null ? name : this.value);
        };
        return ___self;
    })(ValueType);
    module.exports = Ident;
});
module('../../astdlib/astd/map.adria', function(module, resource) {
    var Set, Map;
    Set = require('../../astdlib/astd/set.adria');
    Map = (function() {
        var ___self = function Map(key, value) {
            this.data = Object.create(null);
            if (key !== undefined) {
                this.set(key, value);
            }
        };
        var Map = ___self;
        ___self.prototype.merge = function merge() {
            var result;
            var maps = Array.prototype.slice.call(arguments, 0);
            result = new Map();
            var key, value;
            for (key in this.data) {
                value = this.data[key];
                result.data[key] = value;
            }
            var id;
            for (id in maps) {
                var key, value;
                for (key in maps[id].data) {
                    value = maps[id].data[key];
                    result.data[key] = value;
                }
            }
            return result;
        };
        ___self.prototype.set = function set(key, value) {
            var data;
            data = this.data;
            if (typeof key === 'object') {
                var source;
                source = (key instanceof Map ? key.data : key);
                var mapKey, mapValue;
                for (mapKey in source) {
                    mapValue = source[mapKey];
                    data[mapKey] = mapValue;
                }
            } else {
                data[key] = value;
            }
            return this;
        };
        ___self.prototype.get = function get(key) {
            if (this.lacks(key)) {
                throw new Exception('key "' + key + '" not defined in map');
            }
            return this.data[key];
        };
        ___self.prototype.unset = function unset(key) {
            var data;
            data = this.data;
            if (key instanceof Array) {
                var _, item;
                for (_ in key) {
                    item = key[_];
                    delete data[item];
                }
            } else if (key instanceof Set) {
                var item;
                for (item in key.data) {
                    delete data[item];
                }
            } else {
                delete data[key];
            }
            return this;
        };
        ___self.prototype.has = function has(key) {
            var data;
            data = this.data;
            if (key instanceof Array) {
                var _, item;
                for (_ in key) {
                    item = key[_];
                    if (item in data !== true) {
                        return false;
                    }
                }
                return true;
            } else if (key instanceof Set) {
                var item;
                for (item in key.data) {
                    if (item in data !== true) {
                        return false;
                    }
                }
                return true;
            } else {
                return (key in data);
            }
        };
        ___self.prototype.lacks = function lacks(key) {
            return this.has(key) === false;
        };
        ___self.prototype.keys = function keys() {
            return Object.keys(this.data);
        };
        ___self.prototype.values = function values() {
            var result;
            result = [  ];
            var _, value;
            for (_ in this.data) {
                value = this.data[_];
                result.push(value);
            }
            return result;
        };
        Object.defineProperty(___self.prototype, "empty", {
            get: function empty() {
                var _;
                for (_ in this.data) {
                    return false;
                }
                return true;
            }
        });
        Object.defineProperty(___self.prototype, "length", {
            get: function length() {
                var len;
                len = 0;
                var _;
                for (_ in this.data) {
                    len++;
                }
                return len;
            }
        });
        return ___self;
    })();
    module.exports = Map;
});
module('targets/adria/scope.adria', function(module, resource) {
    var Map, Node, ASTException, scopeLocalId, Scope, findRefScope, createLocalName;
    Map = require('../../astdlib/astd/map.adria');
    Node = require('targets/adria/base/node.adria');
    ASTException = require('language_parser/ast_exception.adria');
    scopeLocalId = 1;
    Scope = (function(___parent) {
        var ___self = function Scope(key, value) {
            this.locals = new Map();
            this.implicits = new Map();
            Node.prototype.constructor.call(this, key, value);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Scope = ___self;
        ___self.prototype.locals = null;
        ___self.prototype.implicits = null;
        ___self.prototype.addLocal = function addLocal(name) {
            var localName;
            if (this.getOwnRef(name)) {
                throw new ASTException('Reference "' + name + '" already defined in local scope', this);
            }
            localName = createLocalName.call(this, name);
            this.locals.set(name, localName);
            return localName;
        };
        ___self.prototype.addImplicit = function addImplicit(name, ignore) {
            ignore = (arguments.length > 1 ? ignore : (false));
            if (ignore == false && (this.getOwnRef(name) || findRefScope.call(this, name) !== null)) {
                throw new ASTException('Reference "' + name + '" already defined in local scope', this);
            }
            this.implicits.set(name, name);
            return name;
        };
        ___self.prototype.getOwnRef = function getOwnRef(name) {
            if (this.locals.has(name)) {
                return this.locals.get(name);
            } else if (this.implicits.has(name)) {
                return this.implicits.get(name);
            }
            return null;
        };
        ___self.prototype.findRef = function findRef(name) {
            var scope, refName;
            if ((refName = this.getOwnRef(name)) !== null) {
                return refName;
            } else if ((scope = findRefScope.call(this, name)) !== null) {
                if ((refName = scope.getOwnRef(name)) !== null) {
                    return refName;
                } else {
                    
                }
            }
            return null;
        };
        ___self.prototype.refsToSourceNode = function refsToSourceNode() {
            if (this.locals.empty) {
                return this.csn();
            } else {
                return this.csn([ 'var ', this.locals.values().join(', '), ';' + this.nl() ]);
            }
        };
        return ___self;
    })(Node);
    Node.prototype.Scope = Scope;
    findRefScope = function findRefScope(name) {
        var scope;
        scope = this;
        do {
            if (scope.getOwnRef(name) !== null) {
                return scope;
            }
        } while ((scope = scope.findScope(true)) !== null);
        return scope;
    };
    createLocalName = function createLocalName(name) {
        var scope;
        scope = findRefScope.call(this, name);
        if (scope !== null) {
            return '___' + name + '_scp' + scopeLocalId++;
        }
        return name;
    };
    module.exports = Scope;
});
module('targets/adria/module.adria', function(module, resource) {
    var Map, Scope, ASTException, Module;
    Map = require('../../astdlib/astd/map.adria');
    Scope = require('targets/adria/scope.adria');
    ASTException = require('language_parser/ast_exception.adria');
    Module = (function(___parent) {
        var ___self = function Module(key, value) {
            this.exports = new Map();
            Scope.prototype.constructor.call(this, key, value);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Module = ___self;
        ___self.prototype.moduleExport = null;
        ___self.prototype.exports = null;
        ___self.prototype.isInterface = false;
        ___self.prototype.setInterface = function setInterface() {
            var parser;
            if (this.isInterface) {
                throw new ASTException('Duplicate interface declaration', this);
            }
            parser = this.parser();
            parser.resultData.isInterface = true;
            this.isInterface = true;
        };
        ___self.prototype.setModuleExport = function setModuleExport(name) {
            var localName;
            if (this.getOwnRef(name)) {
                throw new ASTException('Reference "' + name + '" already defined in local scope', this);
            }
            localName = this.addLocal(name);
            this.moduleExport = localName;
            return name;
        };
        ___self.prototype.addExport = function addExport(name) {
            var localName;
            if (this.getOwnRef(name)) {
                throw new ASTException('Reference "' + name + '" already defined in local scope', this);
            }
            localName = this.addLocal(name);
            this.exports.set(name, localName);
            return name;
        };
        ___self.prototype.getOwnRef = function getOwnRef(name) {
            var refName;
            if ((refName = Scope.prototype.getOwnRef.call(this, name)) !== null) {
                return refName;
            }
            if (this.exports.has(name)) {
                return this.exports.get(name);
            } else if (this.moduleExport === name) {
                return this.moduleExport;
            }
            return null;
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var parser, code, file, result, exports;
            this.nl(1);
            parser = this.parser();
            code = Scope.prototype.toSourceNode.call(this);
            file = parser.file;
            result = this.csn('module(\'' + parser.moduleName + '\', function(module, resource) {' + this.nl());
            result.add(this.refsToSourceNode());
            result.add(code);
            if (this.moduleExport !== null) {
                result.add([ 'module.exports = ', this.moduleExport, ';' + this.nl() ]);
            }
            exports = this.exports.keys();
            var id;
            for (id in exports) {
                result.add([
                    'module.exports.' + exports[id] + ' = ',
                    this.exports.get(exports[id]),
                    ';' + this.nl()
                ]);
            }
            if (this.isInterface) {
                result.add('___module.exports = module.exports;' + this.nl());
            }
            result.add(this.nl(-1, result) + '});' + this.nl());
            return result;
        };
        return ___self;
    })(Scope);
    module.exports = Module;
});
module('targets/adria/base/file_node.adria', function(module, resource) {
    var path, fs, Node, FileNode;
    path = ___require('path');
    fs = ___require('fs');
    Node = require('targets/adria/base/node.adria');
    FileNode = (function(___parent) {
        var ___self = function FileNode() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var FileNode = ___self;
        ___self.prototype.isRelativePath = function isRelativePath(filename) {
            return filename.slice(0, 2) === './' || filename.slice(0, 3) === '../';
        };
        ___self.prototype.makeBaseRelative = function makeBaseRelative(filename, parser) {
            var absName;
            absName = path.dirname(parser.file) + '/' + filename;
            return path.relative(parser.transform.options['basePath'], absName);
        };
        ___self.prototype.resolvePath = function resolvePath(filename, parser) {
            var options, relname;
            options = parser.transform.options;
            if (this.isRelativePath(filename)) {
                relname = this.makeBaseRelative(filename, parser);
                if (fs.existsSync(options['basePath'] + relname)) {
                    return path.normalize(relname);
                }
            } else {
                var id, includePath;
                for (id in options['paths']) {
                    includePath = options['paths'][id];
                    relname = includePath + filename;
                    if (fs.existsSync(options['basePath'] + relname)) {
                        return path.normalize(relname);
                    }
                }
            }
            return null;
        };
        return ___self;
    })(Node);
    module.exports = FileNode;
});
module('targets/adria/require_literal.adria', function(module, resource) {
    var util, FileNode, ASTException, RequireLiteral;
    util = require('util.adria');
    FileNode = require('targets/adria/base/file_node.adria');
    ASTException = require('language_parser/ast_exception.adria');
    RequireLiteral = (function(___parent) {
        var ___self = function RequireLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var RequireLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var parser, options, fileNode, moduleName, requireFunction, resolvedName;
            parser = this.parser();
            options = parser.transform.options;
            fileNode = this.get('file');
            moduleName = fileNode.toString().slice(1, -1);
            requireFunction = 'require';
            resolvedName = util.normalizeExtension(moduleName, options['extension']);
            if (parser.transform.builtins[resolvedName] !== undefined) {
                parser.transform.usedBuiltins.add(resolvedName);
                moduleName = resolvedName;
                if (resolvedName === 'async.adria') {
                    parser.resultData.globals.add('___Async');
                }
            } else {
                resolvedName = this.resolvePath(util.normalizeExtension(moduleName, options['extension']), parser);
                if (resolvedName !== null) {
                    moduleName = resolvedName;
                    parser.resultData.requires.add(moduleName);
                } else if (options['platform'] === 'node' && moduleName.hasPostfix(options['extension']) === false) {
                    requireFunction = '___require';
                } else {
                    throw new ASTException('Could not find require "' + moduleName + '"', this);
                }
            }
            return this.csn([
                requireFunction + '(',
                fileNode.csn("'" + moduleName + "'"),
                ')'
            ]);
        };
        return ___self;
    })(FileNode);
    module.exports = RequireLiteral;
});
module('targets/adria/resource_literal.adria', function(module, resource) {
    var FileNode, ASTException, ResourceLiteral;
    FileNode = require('targets/adria/base/file_node.adria');
    ASTException = require('language_parser/ast_exception.adria');
    ResourceLiteral = (function(___parent) {
        var ___self = function ResourceLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ResourceLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var parser, options, fileNode, fileName, resolvedName, result;
            parser = this.parser();
            options = parser.transform.options;
            fileNode = this.get('file');
            fileName = fileNode.toSourceNode().toString().slice(1, -1);
            resolvedName = this.resolvePath(fileName, parser);
            if (resolvedName !== null) {
                parser.resultData.resources.add(resolvedName);
            } else {
                throw new ASTException('Could not find resource "' + fileName + '"', this);
            }
            result = this.csn();
            result.add('resource(');
            result.add(fileNode.csn("'" + resolvedName + "'"));
            result.add(')');
            return result;
        };
        return ___self;
    })(FileNode);
    module.exports = ResourceLiteral;
});
module('targets/adria/base/function_node.adria', function(module, resource) {
    var Scope, SourceNode, ASTException, FunctionNode;
    Scope = require('targets/adria/scope.adria');
    SourceNode = require('source_node.adria');
    ASTException = require('language_parser/ast_exception.adria');
    FunctionNode = (function(___parent) {
        var ___self = function FunctionNode() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var FunctionNode = ___self;
        ___self.prototype.provideParent = false;
        ___self.prototype.provideSelf = false;
        ___self.prototype.getParentLookup = function getParentLookup() {
            this.provideParent = true;
            return '___p';
        };
        ___self.prototype.getSelfLookup = function getSelfLookup() {
            this.provideSelf = true;
            return '___s';
        };
        ___self.prototype.getParentLookupCode = function getParentLookupCode(result, lookupName, ownName) {
            ownName = (arguments.length > 2 ? ownName : (lookupName));
            if (this.name === '') {
                throw new ASTException('Unable to determine function name required by parent/self lookup', this);
            }
            result.add('var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));' + this.nl());
            result.add('while (___c !== null && (___c.' + lookupName + ' !== ' + ownName + ' || ___c.hasOwnProperty(\'' + lookupName + '\') === false)) {' + this.nl(1));
            result.add('___s = ___c,' + this.nl());
            result.add('___c = Object.getPrototypeOf(___c);' + this.nl(-1));
            result.add('}' + this.nl());
            result.add('___s = ___s.constructor,' + this.nl());
            result.add('___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);' + this.nl());
        };
        return ___self;
    })(Scope);
    module.exports = FunctionNode;
});
module('targets/adria/function_literal.adria', function(module, resource) {
    var FunctionNode, SourceNode, Scope, ASTException, thisId, FunctionLiteral;
    FunctionNode = require('targets/adria/base/function_node.adria');
    SourceNode = require('source_node.adria');
    Scope = require('targets/adria/scope.adria');
    ASTException = require('language_parser/ast_exception.adria');
    thisId = 1;
    FunctionLiteral = (function(___parent) {
        var ___self = function FunctionLiteral(key, value) {
            this.specialArgs = [  ];
            Scope.prototype.constructor.call(this, key, value);
            this.thisId = thisId++;
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var FunctionLiteral = ___self;
        ___self.prototype.thisId = 0;
        ___self.prototype.name = '';
        ___self.prototype.provideContext = false;
        ___self.prototype.registerWithParent = false;
        ___self.prototype.specialArgs = null;
        ___self.prototype.storeContext = function storeContext() {
            this.provideContext = true;
            return '___ths' + this.thisId;
        };
        ___self.prototype.setLocalName = function setLocalName() {
            var nameSN;
            nameSN = this.findName();
            if (nameSN !== null) {
                var name;
                name = nameSN.toString();
                if (name.match(/^([\'\"]).*\1$/) === null) {
                    this.name = name;
                    this.addImplicit(name, true);
                }
            }
            if (this.registerWithParent) {
                if (this.name === '') {
                    throw new ASTException('Unable to determine function name in func statement', this);
                } else {
                    this.parent.findScope().addImplicit(this.name);
                }
            }
            return this.name === '' ? null : nameSN;
        };
        ___self.prototype.preParamList = function preParamList(result, nameSN) {
            result.add('function');
            if (nameSN !== null) {
                result.add([ ' ', nameSN ]);
            }
        };
        ___self.prototype.preBody = function preBody(result) {
        };
        ___self.prototype.postBody = function postBody(result, body) {
            result.add(this.nl(-1, result) + '}');
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, body;
            this.nl(1);
            result = this.csn();
            this.preParamList(result, this.setLocalName());
            result.add([ '(', this.get('param_list').toSourceNode(), ') {' + this.nl() ]);
            this.preBody(result);
            body = this.get('body').toSourceNode();
            result.add(this.refsToSourceNode());
            var id;
            for (id in this.specialArgs) {
                result.add([ this.specialArgs[id], this.nl() ]);
            }
            if (this.provideContext) {
                result.add([ 'var ', this.storeContext(), ' = this;' + this.nl() ]);
            }
            if (this.provideParent || this.provideSelf) {
                this.getParentLookupCode(result, this.name);
            }
            result.add(this.nl(0, result));
            result.add(body);
            this.postBody(result, body);
            return result;
        };
        return ___self;
    })(FunctionNode);
    module.exports = FunctionLiteral;
});
module('targets/adria/generator_literal.adria', function(module, resource) {
    var FunctionLiteral, SourceNode, GeneratorLiteral;
    FunctionLiteral = require('targets/adria/function_literal.adria');
    SourceNode = require('source_node.adria');
    GeneratorLiteral = (function(___parent) {
        var ___self = function GeneratorLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var GeneratorLiteral = ___self;
        ___self.prototype.preParamList = function preParamList(result, nameSN) {
            result.add('function*');
            if (nameSN !== null) {
                result.add([ ' ', nameSN ]);
            }
        };
        return ___self;
    })(FunctionLiteral);
    module.exports = GeneratorLiteral;
});
module('targets/adria/async_literal.adria', function(module, resource) {
    var GeneratorLiteral, SourceNode, AsyncLiteral;
    GeneratorLiteral = require('targets/adria/generator_literal.adria');
    SourceNode = require('source_node.adria');
    AsyncLiteral = (function(___parent) {
        var ___self = function AsyncLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AsyncLiteral = ___self;
        ___self.prototype.useCallback = false;
        ___self.prototype.storeCallback = function storeCallback() {
            this.useCallback = true;
            return '___cbh' + this.thisId;
        };
        ___self.prototype.preParamList = function preParamList(result, nameSN) {
            result.add('function*');
        };
        ___self.prototype.preBody = function preBody(result) {
            if (this.useCallback) {
                result.add('try {' + this.nl(1));
            }
        };
        ___self.prototype.postBody = function postBody(result, body) {
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.postBody !== postBody || ___c.hasOwnProperty('postBody') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            if (this.useCallback) {
                result.add([
                    this.storeCallback() + '(null, undefined);',
                    this.nl(-1) + '}'
                ]);
                result.add([
                    ' catch (___exc) {' + this.nl(1) + this.storeCallback() + '(___exc, undefined);',
                    this.nl(-1) + '}'
                ]);
            }
            ___p.prototype.postBody.call(this, result, body);
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var parser, result;
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.toSourceNode !== toSourceNode || ___c.hasOwnProperty('toSourceNode') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            parser = this.parser();
            parser.resultData.globals.add('___Async');
            parser.transform.usedBuiltins.add('async.adria');
            result = this.csn();
            result.add('(function() {' + this.nl(1));
            result.add([
                'var ___self = ',
                ___p.prototype.toSourceNode.call(this),
                ';',
                this.nl()
            ]);
            result.add([
                'return function(',
                this.get('param_list').toSourceNode(false),
                ') {' + this.nl(1)
            ]);
            result.add('return new ___Async(___self.apply(this, arguments));' + this.nl(-1));
            result.add('};' + this.nl(-1));
            result.add('})()');
            return result;
        };
        return ___self;
    })(GeneratorLiteral);
    module.exports = AsyncLiteral;
});
module('targets/adria/base/params_node.adria', function(module, resource) {
    var Map, Node, ParamsNode;
    Map = require('../../astdlib/astd/map.adria');
    Node = require('targets/adria/base/node.adria');
    ParamsNode = (function(___parent) {
        var ___self = function ParamsNode() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ParamsNode = ___self;
        ___self.prototype.countActiveOptionals = function countActiveOptionals() {
            var result;
            result = 0;
            this.eachKey('opt_items', function(node) {
                if (node.optionalIsActive === true) {
                    var items;
                    items = 0;
                    node.eachKey('item', function() {
                        items++;
                    });
                    result += items + node.countActiveOptionals();
                }
            });
            return result;
        };
        ___self.prototype.indexOptionals = function indexOptionals() {
            var result;
            result = [  ];
            this.eachKey('opt_items', function(node) {
                var nestedOptionals;
                result.push(node);
                nestedOptionals = node.indexOptionals();
                if (nestedOptionals.length > 0) {
                    result.push.apply(result, nestedOptionals);
                }
            });
            return result;
        };
        ___self.prototype.indexParameters = function indexParameters() {
            var result;
            result = [  ];
            this.each(function(node) {
                if (node.key === 'opt_items') {
                    var nestedParameters;
                    nestedParameters = node.indexParameters();
                    if (nestedParameters.length > 0) {
                        result.push.apply(result, nestedParameters);
                    }
                } else {
                    result.push(node);
                }
            });
            return result;
        };
        return ___self;
    })(Node);
    module.exports = ParamsNode;
});
module('targets/adria/function_param_list.adria', function(module, resource) {
    var Map, Set, ParamsNode, FunctionLiteral, ASTException, Scope, SourceNode, Node, FunctionParamList;
    Map = require('../../astdlib/astd/map.adria');
    Set = require('../../astdlib/astd/set.adria');
    ParamsNode = require('targets/adria/base/params_node.adria');
    FunctionLiteral = require('targets/adria/function_literal.adria');
    ASTException = require('language_parser/ast_exception.adria');
    Scope = require('targets/adria/scope.adria');
    SourceNode = require('source_node.adria');
    Node = require('targets/adria/base/node.adria');
    FunctionParamList = (function(___parent) {
        var ___self = function FunctionParamList() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var FunctionParamList = ___self;
        ___self.prototype.numParams = 0;
        ___self.prototype.optionalPermutations = null;
        ___self.prototype.optionalGroups = null;
        ___self.prototype.types = new Set([ 'boolean', 'number', 'finite', 'string', 'func', 'object' ]);
        ___self.prototype.toSourceNode = function toSourceNode(declare) {
            var result, functionNode, scope;
            declare = (arguments.length > 0 ? declare : (true));
            result = this.csn();
            functionNode = this.findProto(FunctionLiteral);
            scope = this.findScope();
            if (this.has('opt_items')) {
                this.initOptionals();
                this.generatePermutationSwitch(functionNode);
            }
            this.each(this.handle.bind(this, declare, functionNode, scope, result));
            return result.join(', ');
        };
        ___self.prototype.handle = function handle(declare, functionNode, scope, result, node) {
            if (node.key === 'item') {
                var nameSN, valueNode;
                nameSN = node.get('name').toSourceNode();
                if (this.optionalPermutations === null) {
                    result.add(nameSN);
                }
                if (declare) {
                    if (this.optionalPermutations === null) {
                        scope.addImplicit(nameSN.toString(), true);
                    } else {
                        scope.addLocal(nameSN.toString());
                    }
                }
                valueNode = node.get('value');
                if (valueNode.isNode() && this.optionalPermutations === null) {
                    var defaultArg;
                    defaultArg = this.csn([
                        nameSN,
                        ' = (arguments.length > ' + this.numParams + ' ? ',
                        nameSN,
                        ' : (',
                        valueNode.toSourceNode(),
                        '));'
                    ]);
                    functionNode.specialArgs.push(defaultArg);
                }
                this.checkAnnotation(node, functionNode);
                this.numParams++;
                return true;
            } else if (node.key === 'opt_items') {
                node.each(this.handle.bind(this, declare, functionNode, scope, result));
            } else if (node.key === 'rest') {
                var name, restArg;
                name = node.get('name').toSourceNode();
                if (declare) {
                    scope.addImplicit(name.toString(), true);
                }
                restArg = this.csn([
                    'var ',
                    name,
                    ' = Array.prototype.slice.call(arguments, ' + this.numParams + ');'
                ]);
                functionNode.specialArgs.push(restArg);
                return true;
            }
            return false;
        };
        ___self.prototype.initOptionals = function initOptionals() {
            var optionals, permutations, counts;
            optionals = this.indexOptionals();
            permutations = this.findValidOptionalPermutations(optionals);
            counts = new Set();
            var permutation, numParameters;
            for (permutation in permutations.data) {
                numParameters = permutations.data[permutation];
                if (counts.has(numParameters)) {
                    throw new ASTException('Ambiguous parameter-list, multiple permutations result in ' + numParameters + ' optional parameters', this);
                }
                counts.add(numParameters);
            }
            this.optionalGroups = optionals;
            this.optionalPermutations = permutations.data;
        };
        ___self.prototype.checkAnnotation = function checkAnnotation(node, functionNode) {
            var annotationNode, type, allowNull, name, argId;
            annotationNode = node.get('annotation');
            if (annotationNode.isDummy() || this.parser().transform.options['assert'] === false) {
                return ;
            }
            type = annotationNode.toString();
            allowNull = node.get('annotation_mod').value === '?';
            name = node.get('name').toString();
            argId = this.numParams + 1;
            if (this.types.has(type)) {
                var check;
                check = "'$0', $1, $2, 'argument $3 ($2)'".format(type, allowNull ? 'true' : 'false', name, argId);
                functionNode.specialArgs.push(this.csn([ 'assert.type(', check, ');' ]));
            } else {
                var check;
                check = "$0, $1, $2, 'argument $3 ($2)', '$0'".format(type, allowNull ? 'true' : 'false', name, argId);
                functionNode.specialArgs.push(this.csn([ 'assert.instance(', check, ');' ]));
            }
        };
        ___self.prototype.generatePermutationSwitch = function generatePermutationSwitch(functionNode) {
            var FunctionParamsOptional, parameters, parameterGroups, numUngrouped, result;
            FunctionParamsOptional = require('targets/adria/function_params_optional.adria');
            parameters = this.indexParameters();
            parameterGroups = new Array(parameters.length);
            numUngrouped = 0;
            result = this.csn();
            var id, parameter, optionalGroup;
            for (id in parameters) {
                parameter = parameters[id];
                optionalGroup = parameter.findProto(FunctionParamsOptional, FunctionParamList);
                if (optionalGroup instanceof FunctionParamsOptional) {
                    parameterGroups[id] = optionalGroup;
                } else {
                    parameterGroups[id] = null;
                    numUngrouped++;
                }
            }
            var permutation, numGrouped, argId;
            for (permutation in this.optionalPermutations) {
                numGrouped = this.optionalPermutations[permutation];
                result.add('if (arguments.length === ' + (numGrouped + numUngrouped) + ') {' + this.nl(1));
                argId = 0;
                this.applyOptionalPermutation(permutation, this.optionalGroups);
                var id, parameter;
                for (id in parameters) {
                    parameter = parameters[id];
                    if (parameterGroups[id] === null || parameterGroups[id].optionalIsActive) {
                        result.add([
                            parameter.get('name').toSourceNode(),
                            ' = arguments[' + (argId++) + '];' + this.nl()
                        ]);
                    } else {
                        result.add([
                            parameter.get('name').toSourceNode(),
                            ' = ',
                            parameter.get('value').toSourceNode(),
                            ';' + this.nl()
                        ]);
                    }
                }
                result.add(this.nl(-1, result) + '} else ');
            }
            result.add('{' + this.nl(1) + 'throw new Exception(\'invalid number of arguments\');' + this.nl(-1) + '}');
            functionNode.specialArgs.unshift(result);
        };
        ___self.prototype.findValidOptionalPermutations = function findValidOptionalPermutations(optionals) {
            var bits, permutations, patterns;
            bits = optionals.length;
            permutations = Math.pow(2, bits);
            patterns = new Map();
            var permutation, pattern;
            for (permutation = 0; permutation < permutations;permutation++) {
                pattern = '';
                var bit, actuallySet;
                for (bit = 0; bit < bits;bit++) {
                    actuallySet = optionals[bit].setOptionalActive((permutation & (1 << bit)) > 0);
                    pattern += actuallySet ? '1' : '0';
                }
                if (patterns.lacks(pattern)) {
                    patterns.set(pattern, this.countActiveOptionals());
                }
            }
            return patterns;
        };
        ___self.prototype.applyOptionalPermutation = function applyOptionalPermutation(permutation, optionals) {
            var id;
            for (id = 0; id < permutation.length;id++) {
                optionals[id].optionalIsActive = (permutation.slice(id, id + 1) === '1');
            }
        };
        return ___self;
    })(ParamsNode);
    module.exports = FunctionParamList;
});
module('targets/adria/function_params_optional.adria', function(module, resource) {
    var ParamsNode, FunctionParamList, FunctionParamsOptional;
    ParamsNode = require('targets/adria/base/params_node.adria');
    FunctionParamList = require('targets/adria/function_param_list.adria');
    FunctionParamsOptional = (function(___parent) {
        var ___self = function FunctionParamsOptional() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var FunctionParamsOptional = ___self;
        ___self.prototype.optionalIsActive = true;
        ___self.prototype.setOptionalActive = function setOptionalActive(tryStatus) {
            var container;
            container = this.findProto(FunctionParamsOptional, FunctionParamList);
            if (container instanceof FunctionParamsOptional) {
                this.optionalIsActive = container.optionalIsActive && tryStatus;
            } else {
                this.optionalIsActive = tryStatus;
            }
            return this.optionalIsActive;
        };
        return ___self;
    })(ParamsNode);
    module.exports = FunctionParamsOptional;
});
module('targets/adria/async_param_list.adria', function(module, resource) {
    var AsyncLiteral, FunctionParamList, Scope, SourceNode, Node, AsyncParamList;
    AsyncLiteral = require('targets/adria/async_literal.adria');
    FunctionParamList = require('targets/adria/function_param_list.adria');
    Scope = require('targets/adria/scope.adria');
    SourceNode = require('source_node.adria');
    Node = require('targets/adria/base/node.adria');
    AsyncParamList = (function(___parent) {
        var ___self = function AsyncParamList() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AsyncParamList = ___self;
        ___self.prototype.handle = function handle(declare, functionNode, scope, result, node) {
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.handle !== handle || ___c.hasOwnProperty('handle') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            if (___p.prototype.handle.call(this, declare, functionNode, scope, result, node)) {
                return true;
            }
            if (node.key === 'callback') {
                result.add(functionNode.storeCallback());
                this.numParams++;
                return true;
            }
            return false;
        };
        return ___self;
    })(FunctionParamList);
    module.exports = AsyncParamList;
});
module('targets/adria/expression.adria', function(module, resource) {
    var Set, Node, Expression;
    Set = require('../../astdlib/astd/set.adria');
    Node = require('targets/adria/base/node.adria');
    Expression = (function(___parent) {
        var ___self = function Expression() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Expression = ___self;
        ___self.prototype.wrapPrefix = new Set([ 'member', 'index', 'proto', 'call', 'pcall', 'item' ]);
        ___self.prototype.preprocess = function preprocess(state) {
            var children, id, end;
            Node.prototype.preprocess.call(this, state);
            children = this.children;
            id = children.length;
            end = -1;
            while (id--) {
                if (children[id].key === 'wrap') {
                    end = id;
                } else if (end > -1 && this.wrapPrefix.lacks(children[id].key)) {
                    this.nest(id + 1, end);
                    end = -1;
                } else if (end > -1 && end < children.length - 1 && id === 0) {
                    this.nest(0, end);
                }
            }
        };
        ___self.prototype.scan = function scan(state) {
            Node.prototype.scan.call(this, state);
            this.eachKey('ident', function(child) {
                this.checkDefined(child.value);
            });
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var children, propertyAssignSplit, result, wrapper;
            children = this.children;
            propertyAssignSplit = -1;
            result = this.csn();
            var id, child;
            for (id in children) {
                child = children[id];
                if (children[+id + 1] !== undefined && children[+id + 1].key === 'passignment_op') {
                    propertyAssignSplit = +id + 1;
                    break ;
                }
                switch (child.key) {
                    case 'member':
                        result.add(child.csn('.' + child.children[0].value));
                        break ;
                    case 'index':
                        result.add(child.csn('['));
                        result.add(child.toSourceNode());
                        result.add(child.csn(']'));
                        break ;
                    case 'proto':
                        result.add(child.csn('.prototype.' + child.children[0].value));
                        break ;
                    case 'call':
                    case 'pcall':
                    case 'wrap':
                    case 'ident':
                        result.add(child.csn(child.toSourceNode()));
                        break ;
                    case 'brace_op':
                    case 'xfix_op':
                        result.add(child.csn(child.value));
                        break ;
                    case 'unary_op':
                        result.add(child.csn(child.value.search(/[a-z]/) > -1 ? child.value + ' ' : child.value));
                        break ;
                    case 'binary_op':
                    case 'assignment_op':
                    case 'ternary_op':
                        result.add([ ' ', child.csn(child.value), ' ' ]);
                        break ;
                    default:
                        result.add(child.toSourceNode());
                        break ;
                }
            }
            if (propertyAssignSplit > -1) {
                var target, name, child;
                child = children[propertyAssignSplit - 1];
                switch (child.key) {
                    case 'member':
                        target = result;
                        name = "'" + child.children[0].value + "'";
                        break ;
                    case 'index':
                        target = result;
                        name = child.toSourceNode();
                        break ;
                    case 'proto':
                        result.add('.prototype');
                        target = result;
                        name = "'" + child.children[0].value + "'";
                        break ;
                }
                if (children[propertyAssignSplit].value === ':=') {
                    result.prepend('Object.defineProperty(');
                    result.add([ ', ', name, ', {' + this.nl(1) + 'value: ' ]);
                    result.add(children[propertyAssignSplit + 1].toSourceNode());
                    result.add(',' + this.nl() + 'writable: false' + this.nl(-1) + '})');
                } else {
                    result = children[propertyAssignSplit + 1].assignmentToSourceNode(name, target);
                }
            }
            wrapper = this.get('wrap');
            if (wrapper.isNode()) {
                var locals, params;
                locals = '';
                params = wrapper.params.join(', ');
                var id;
                for (id = 0; id < wrapper.params.length;id++) {
                    locals += '___' + id + ', ';
                }
                result = this.csn([
                    '(function(' + locals + '___callback) {',
                    this.nl(1),
                    'return ',
                    result,
                    ';',
                    this.nl(-1),
                    '}).bind(this' + (wrapper.params.length > 0 ? ', ' + params : '') + ')'
                ]);
            }
            return result;
        };
        return ___self;
    })(Node);
    module.exports = Expression;
});
module('targets/adria/object_literal.adria', function(module, resource) {
    var Node, ObjectLiteral;
    Node = require('targets/adria/base/node.adria');
    ObjectLiteral = (function(___parent) {
        var ___self = function ObjectLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ObjectLiteral = ___self;
        ___self.prototype.assembleItemList = function assembleItemList() {
            var items;
            items = this.csn();
            this.each(function(child) {
                var item;
                item = this.csn();
                item.add(child.get('key').csn(child.get('key').value));
                item.add(': ');
                item.add(child.get('value').toSourceNode());
                items.add(item);
            });
            return items;
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var items, result;
            this.nl(1);
            items = this.assembleItemList();
            result = this.csn();
            if (items.toString().length >= 60) {
                result.add('{' + this.nl());
                result.add(items.join(',' + this.nl()));
                result.add(this.nl(-1) + '}');
            } else {
                this.nl(-1);
                result.add('{ ');
                result.add(items.join(', '));
                result.add(' }');
            }
            return result;
        };
        return ___self;
    })(Node);
    module.exports = ObjectLiteral;
});
module('targets/adria/property_literal.adria', function(module, resource) {
    var ObjectLiteral, ASTException, SourceNode, storageId, PropertyLiteral;
    ObjectLiteral = require('targets/adria/object_literal.adria');
    ASTException = require('language_parser/ast_exception.adria');
    SourceNode = require('source_node.adria');
    storageId = 1;
    PropertyLiteral = (function(___parent) {
        var ___self = function PropertyLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var PropertyLiteral = ___self;
        ___self.prototype.useStorage = false;
        ___self.prototype.storageName = null;
        ___self.prototype.defaultValueNode = 'undefined';
        ___self.prototype.target = 'undefined';
        ___self.prototype.name = 'undefined';
        ___self.prototype.assignmentToSourceNode = function assignmentToSourceNode(name, target) {
            var propertyBody, result;
            this.target = target;
            this.name = name;
            propertyBody = ObjectLiteral.prototype.toSourceNode.call(this);
            result = this.csn();
            if (this.useStorage) {
                result.add('(');
                this.getStorageCode(result);
            }
            result.add([ 'Object.defineProperty(', target, ', ', name, ', ' ]);
            result.add(propertyBody);
            result.add(this.useStorage ? '))' : ')');
            return result;
        };
        ___self.prototype.getStorageCode = function getStorageCode(result) {
            result.add('Object.defineProperty(' + this.target + ', ' + this.storageName + ', {' + this.nl(1));
            result.add([ 'value: ', this.defaultValueNode, ',' + this.nl() ]);
            result.add('writable: true' + this.nl(-1));
            result.add('}),' + this.nl());
        };
        ___self.prototype.getLookupCode = function getLookupCode(result, type) {
            result.add('(function() {' + this.nl(1));
            result.add([ 'var descriptor, level = ', this.target, ';' + this.nl() ]);
            result.add([
                'while ((level = Object.getPrototypeOf(level)) !== null && (descriptor = Object.getOwnPropertyDescriptor(level, ',
                this.name,
                ')) === undefined);' + this.nl()
            ]);
            result.add('return descriptor.' + type + ';' + this.nl(-1));
            result.add('})()');
        };
        ___self.prototype.assembleItemList = function assembleItemList() {
            var items;
            this.each(function(child) {
                var childKey, childValue;
                childKey = child.get('key');
                childValue = child.get('value');
                if (childKey.value === 'default') {
                    this.defaultValueNode = childValue.toSourceNode();
                    this.useStorage = true;
                } else if (childKey.value === 'storage') {
                    this.storageName = childValue.value;
                    this.useStorage = true;
                }
            });
            if (this.storageName === null) {
                var nameSN;
                nameSN = this.findName();
                if (nameSN === null) {
                    this.storageName = '\'___psf' + (storageId++) + '\'';
                } else {
                    this.storageName = '\'_' + nameSN.toString() + '\'';
                }
            }
            items = this.csn();
            this.each(function(child) {
                var childKey, inherit;
                childKey = child.get('key');
                inherit = child.has('inherit');
                if (childKey.value !== 'default' && childKey.value !== 'storage') {
                    var item;
                    item = this.csn();
                    item.add(childKey.csn(childKey.value));
                    item.add(': ');
                    if (inherit) {
                        this.getLookupCode(item, childKey.value);
                    } else {
                        item.add(child.get('value').toSourceNode());
                    }
                    items.add(item);
                }
            });
            return items;
        };
        return ___self;
    })(ObjectLiteral);
    module.exports = PropertyLiteral;
});
module('targets/adria/proto_literal.adria', function(module, resource) {
    var FunctionNode, ProtoLiteral;
    FunctionNode = require('targets/adria/base/function_node.adria');
    ProtoLiteral = (function(___parent) {
        var ___self = function ProtoLiteral(key, value) {
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.constructor !== ProtoLiteral || ___c.hasOwnProperty('constructor') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            this.constructorArgs = [  ];
            this.constructorDefaults = [  ];
            ___p.prototype.constructor.call(this, key, value);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ProtoLiteral = ___self;
        ___self.prototype.constructorSN = null;
        ___self.prototype.provideParent = false;
        ___self.prototype.name = '';
        ___self.prototype.toSourceNode = function toSourceNode() {
            var nameSN, parentNode, haveParent, blankParent, result, body;
            nameSN = this.findName();
            if (nameSN !== null) {
                this.name = nameSN.toString();
            }
            parentNode = this.get('parent');
            haveParent = parentNode.isNode();
            blankParent = (haveParent ? parentNode.toString() === 'null' : false);
            result = this.csn();
            if (this.value === 'proto_statement') {
                var mangledName;
                mangledName = this.parent.findScope().addLocal(this.name);
                result.add(mangledName + ' = ');
            }
            result.add('(function(' + (haveParent && blankParent === false ? '___parent' : '') + ') {' + this.nl(1));
            body = this.get('body').toSourceNode();
            if (this.constructorSN !== null) {
                result.add([ this.constructorSN, ';' + this.nl() ]);
            } else {
                result.add('var ___self = function ' + this.name + '() {');
                if (haveParent && blankParent === false) {
                    result.add(this.nl(1) + '___parent.apply(this, arguments);' + this.nl(-1));
                }
                result.add('}' + this.nl());
            }
            if (haveParent) {
                result.add('___self.prototype = Object.create(' + (blankParent ? 'null' : '___parent.prototype') + ');' + this.nl());
                result.add('___self.prototype.constructor = ___self;' + this.nl());
            }
            if (this.name !== '') {
                result.add('var ' + this.name + ' = ___self;' + this.nl());
            }
            result.add(body);
            result.add('return ___self;' + this.nl(-1));
            result.add('})(');
            if (haveParent && blankParent === false) {
                result.add(parentNode.toSourceNode());
            }
            result.add(')');
            if (this.value === 'proto_statement') {
                result.add(';');
            }
            return result;
        };
        return ___self;
    })(FunctionNode);
    module.exports = ProtoLiteral;
});
module('targets/adria/proto_body_constructor.adria', function(module, resource) {
    var FunctionLiteral, ProtoLiteral, SourceNode, ProtoBodyConstructor;
    FunctionLiteral = require('targets/adria/function_literal.adria');
    ProtoLiteral = require('targets/adria/proto_literal.adria');
    SourceNode = require('source_node.adria');
    ProtoBodyConstructor = (function(___parent) {
        var ___self = function ProtoBodyConstructor() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ProtoBodyConstructor = ___self;
        ___self.prototype.setLocalName = function setLocalName() {
            var name;
            name = this.findProto(ProtoLiteral).name;
            if (name !== null) {
                if (name.match(/^([\'\"]).*\1$/) === null) {
                    this.name = name;
                    this.addImplicit(name, true);
                }
            }
            return this.name === '' ? null : this.csn(name);
        };
        ___self.prototype.preParamList = function preParamList(result, nameSN) {
            result.add('var ___self = function');
            if (nameSN !== null) {
                result.add([ ' ', nameSN ]);
            }
        };
        ___self.prototype.getParentLookupCode = function getParentLookupCode(result, lookupName, ownName) {
            ownName = (arguments.length > 2 ? ownName : (lookupName));
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.getParentLookupCode !== getParentLookupCode || ___c.hasOwnProperty('getParentLookupCode') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            ___p.prototype.getParentLookupCode.call(this, result, 'constructor', ownName !== '' ? ownName : '___self');
        };
        return ___self;
    })(FunctionLiteral);
    module.exports = ProtoBodyConstructor;
});
module('targets/adria/proto_body_item.adria', function(module, resource) {
    var Node, Ident, ProtoBodyConstructor, ProtoBodyItem;
    Node = require('targets/adria/base/node.adria');
    Ident = require('targets/adria/ident.adria');
    ProtoBodyConstructor = require('targets/adria/proto_body_constructor.adria');
    ProtoBodyItem = (function(___parent) {
        var ___self = function ProtoBodyItem() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ProtoBodyItem = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var protoNode, keyNode;
            protoNode = this.ancestor(null, [ 'new_proto_literal', 'proto_literal', 'proto_statement' ]);
            keyNode = this.get('key');
            if (keyNode.value === 'constructor') {
                protoNode.constructorSN = this.get('value').toSourceNode();
                return this.csn();
            } else {
                var valueNode, result;
                valueNode = this.get('value');
                if (valueNode.value === 'property_literal') {
                    var name;
                    name = (keyNode instanceof Ident === false ? keyNode.value : '"' + keyNode.value + '"');
                    return this.csn([
                        valueNode.assignmentToSourceNode(name, '___self.prototype'),
                        ';' + this.nl()
                    ]);
                } else {
                    var name;
                    name = (keyNode instanceof Ident === false ? '[' + keyNode.value + ']' : '.' + keyNode.value);
                    result = this.csn('___self.prototype' + name + ' = ');
                    result.add(valueNode.toSourceNode());
                    result.add(';' + this.nl());
                    return result;
                }
            }
        };
        return ___self;
    })(Node);
    module.exports = ProtoBodyItem;
});
module('targets/adria/try_statement.adria', function(module, resource) {
    var Node, Scope, catchId, Try, Catch, CatchAll, CatchSpecific, Finally;
    Node = require('targets/adria/base/node.adria');
    Scope = require('targets/adria/scope.adria');
    catchId = 1;
    Try = (function(___parent) {
        var ___self = function Try() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Try = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, body;
            result = this.csn();
            result.add('try {' + this.nl(1));
            body = this.get('body').toSourceNode();
            result.add(this.refsToSourceNode());
            result.add(body);
            result.add(this.nl(-1, body) + '}');
            return result;
        };
        return ___self;
    })(Scope);
    Catch = (function(___parent) {
        var ___self = function Catch() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Catch = ___self;
        ___self.prototype.exceptionName = '';
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            this.exceptionName = '___exc' + (catchId++);
            result = this.csn();
            result.add(' catch (' + this.exceptionName + ') {' + this.nl(1));
            this.each(function(node, first, last) {
                if (node instanceof CatchAll && first !== true) {
                    var block;
                    result.add([
                        ' else {' + this.nl(1),
                        block = node.toSourceNode(),
                        this.nl(-1, block) + '}'
                    ]);
                } else if (node instanceof CatchSpecific && first !== true) {
                    result.add([ ' else ', node.toSourceNode() ]);
                } else {
                    result.add(node.toSourceNode());
                }
                if (last && node instanceof CatchAll !== true) {
                    result.add(' else { ' + this.nl(1, result));
                    result.add('throw ' + this.exceptionName + ';' + this.nl());
                    result.add(this.nl(-1, result) + '}');
                }
            });
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return ___self;
    })(Node);
    CatchAll = (function(___parent) {
        var ___self = function CatchAll() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var CatchAll = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var catchNode, valueNode, result;
            catchNode = this.findProto(Catch);
            valueNode = this.get('value');
            this.addLocal(valueNode.value);
            result = this.csn();
            result.add([
                'var ',
                valueNode.toSourceNode(),
                ' = ' + catchNode.exceptionName + ';' + this.nl()
            ]);
            result.add(this.get('body').toSourceNode());
            return result;
        };
        return ___self;
    })(Scope);
    CatchSpecific = (function(___parent) {
        var ___self = function CatchSpecific() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var CatchSpecific = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var catchNode, valueNode, result;
            catchNode = this.findProto(Catch);
            valueNode = this.get('value');
            this.addLocal(valueNode.value);
            result = this.csn();
            result.add([
                'if (' + catchNode.exceptionName + ' instanceof ',
                this.get('type').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            result.add([
                'var ',
                valueNode.toSourceNode(),
                ' = ' + catchNode.exceptionName + ';' + this.nl()
            ]);
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return ___self;
    })(Scope);
    Finally = (function(___parent) {
        var ___self = function Finally() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Finally = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            result.add(' finally {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return ___self;
    })(Scope);
    module.exports.Try = Try;
    module.exports.Catch = Catch;
    module.exports.CatchAll = CatchAll;
    module.exports.CatchSpecific = CatchSpecific;
    module.exports.Finally = Finally;
});
module('targets/adria/for_count_statement.adria', function(module, resource) {
    var Scope, Node, ForCountStatement;
    Scope = require('targets/adria/scope.adria');
    Node = require('targets/adria/base/node.adria');
    ForCountStatement = (function(___parent) {
        var ___self = function ForCountStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ForCountStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var initNode, init, test, condOp, body, result;
            initNode = this.get('init');
            if (initNode.value === 'var_statement') {
                var varDefs, ownScope;
                varDefs = this.csn();
                ownScope = this;
                initNode.eachKey('item', function(node) {
                    var valueNode, nameNode;
                    valueNode = node.get('value');
                    nameNode = node.get('name');
                    ownScope.addLocal(nameNode.value);
                    if (valueNode.isNode()) {
                        var varDef;
                        varDef = this.csn([ nameNode.toSourceNode(), ' = ', valueNode.toSourceNode() ]);
                        varDefs.add(varDef);
                    } else {
                        varDefs.add(nameNode.toSourceNode);
                    }
                });
                init = this.csn();
                init.add([ varDefs.join(', ') ]);
            } else {
                init = initNode.toSourceNode();
            }
            test = this.get('test').toSourceNode();
            condOp = this.get('cond_op').toSourceNode();
            this.nl(1);
            body = this.get('body').toSourceNode();
            this.nl(-1);
            result = this.csn();
            result.add(this.refsToSourceNode());
            result.add([ 'for (', init, '; ', test, ';', condOp, ') {' + this.nl(1) ]);
            result.add([ body, this.nl(-1, body) + '}' ]);
            return result;
        };
        return ___self;
    })(Scope);
    module.exports = ForCountStatement;
});
module('targets/adria/import_statement.adria', function(module, resource) {
    var Node, ImportStatement;
    Node = require('targets/adria/base/node.adria');
    ImportStatement = (function(___parent) {
        var ___self = function ImportStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ImportStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var scope;
            scope = this.findScope();
            this.eachKey('item', function(node) {
                scope.addImplicit(node.value);
            });
            return this.csn();
        };
        return ___self;
    })(Node);
    module.exports = ImportStatement;
});
module('targets/adria/access_operation_protocall.adria', function(module, resource) {
    var Node, AccessOperationProtocall;
    Node = require('targets/adria/base/node.adria');
    AccessOperationProtocall = (function(___parent) {
        var ___self = function AccessOperationProtocall() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AccessOperationProtocall = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var params, result;
            params = this.get('call');
            result = this.csn();
            result.add([ '.prototype.', this.csn(this.get('item').value), '.call(this' ]);
            params.each(function(param) {
                result.add([ ', ', param.toSourceNode() ]);
            });
            result.add(')');
            return result;
        };
        return ___self;
    })(Node);
    module.exports = AccessOperationProtocall;
});
module('targets/adria/const_literal.adria', function(module, resource) {
    var Node, ConstLiteral;
    Node = require('targets/adria/base/node.adria');
    ConstLiteral = (function(___parent) {
        var ___self = function ConstLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ConstLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var stringNode;
            stringNode = this.get('string');
            if (stringNode.isNode()) {
                return this.csn(stringNode.value);
            } else {
                return this.csn(this.get('numeric').value);
            }
        };
        return ___self;
    })(Node);
    module.exports = ConstLiteral;
});
module('targets/adria/invoke_operation.adria', function(module, resource) {
    var Node, InvokeOperation;
    Node = require('targets/adria/base/node.adria');
    InvokeOperation = (function(___parent) {
        var ___self = function InvokeOperation() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var InvokeOperation = ___self;
        ___self.prototype.toSourceNode = function toSourceNode(includeBraces) {
            var result;
            includeBraces = (arguments.length > 0 ? includeBraces : (true));
            result = this.csn();
            if (includeBraces) {
                result.add('(');
            }
            this.each(function(node, first) {
                if (first === false) {
                    result.add(', ');
                }
                result.add(node.toSourceNode());
            });
            if (includeBraces) {
                result.add(')');
            }
            return result;
        };
        return ___self;
    })(Node);
    module.exports = InvokeOperation;
});
module('targets/adria/async_wrap_operation.adria', function(module, resource) {
    var Node, AsyncWrapOperation;
    Node = require('targets/adria/base/node.adria');
    AsyncWrapOperation = (function(___parent) {
        var ___self = function AsyncWrapOperation() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AsyncWrapOperation = ___self;
        ___self.prototype.params = null;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var id, result;
            id = 0;
            result = this.csn();
            this.params = [  ];
            result.add('(');
            this.each(function(node, first) {
                if (first === false) {
                    result.add(', ');
                }
                if (node.value === '#') {
                    result.add('___callback');
                } else {
                    result.add('___' + id++);
                    this.params.push(node.toSourceNode().toString());
                }
            });
            result.add(')');
            return result;
        };
        return ___self;
    })(Node);
    module.exports = AsyncWrapOperation;
});
module('targets/adria/base_literal.adria', function(module, resource) {
    var Node, BaseLiteral;
    Node = require('targets/adria/base/node.adria');
    BaseLiteral = (function(___parent) {
        var ___self = function BaseLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var BaseLiteral = ___self;
        ___self.prototype.scan = function scan(state) {
            Node.prototype.scan.call(this, state);
            this.eachKey('ident', function(child) {
                this.checkDefined(child.value);
            });
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = '';
            this.each(function(child) {
                switch (child.key) {
                    case 'numeric':
                    case 'string':
                    case 'regexp':
                    case 'brace':
                        result += this.csn(child.value);
                        break ;
                    default:
                        result += child.toSourceNode();
                }
            });
            return result;
        };
        return ___self;
    })(Node);
    module.exports = BaseLiteral;
});
module('targets/adria/do_while_statement.adria', function(module, resource) {
    var Scope, DoWhileStatement;
    Scope = require('targets/adria/scope.adria');
    DoWhileStatement = (function(___parent) {
        var ___self = function DoWhileStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var DoWhileStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, body;
            result = this.csn();
            result.add('do {' + this.nl(1));
            body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body ]);
            result.add([
                this.nl(-1, body) + '} while (',
                this.get('condition').toSourceNode(),
                ');'
            ]);
            return result;
        };
        return ___self;
    })(Scope);
    module.exports = DoWhileStatement;
});
module('targets/adria/while_statement.adria', function(module, resource) {
    var Scope, WhileStatement;
    Scope = require('targets/adria/scope.adria');
    WhileStatement = (function(___parent) {
        var ___self = function WhileStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var WhileStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, body;
            result = this.csn();
            result.add([
                'while (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body ]);
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return ___self;
    })(Scope);
    module.exports = WhileStatement;
});
module('targets/adria/switch_statement.adria', function(module, resource) {
    var Node, SwitchStatement;
    Node = require('targets/adria/base/node.adria');
    SwitchStatement = (function(___parent) {
        var ___self = function SwitchStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var SwitchStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, defaultNode;
            result = this.csn();
            result.add([ 'switch (', this.get('value').toSourceNode(), ') {', this.nl(1) ]);
            this.eachKey('case', function(caseNode) {
                result.add([
                    this.nl(0, result) + 'case ',
                    caseNode.get('match').toSourceNode(),
                    ':' + this.nl(1)
                ]);
                result.add(caseNode.get('body').toSourceNode());
                result.add(this.nl(-1));
            });
            defaultNode = this.get('default');
            if (defaultNode.isNode()) {
                result.add(this.nl(0, result) + 'default:' + this.nl(1));
                result.add(defaultNode.get('body').toSourceNode());
                result.add(this.nl(-1));
            }
            result.add(this.nl(-1, result) + '}');
            return result;
        };
        return ___self;
    })(Node);
    module.exports = SwitchStatement;
});
module('targets/adria/for_in_statement.adria', function(module, resource) {
    var Scope, ForInStatement;
    Scope = require('targets/adria/scope.adria');
    ForInStatement = (function(___parent) {
        var ___self = function ForInStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ForInStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var keyNode, valueNode, source, key, body, result;
            keyNode = this.get('key');
            valueNode = this.get('value');
            if (this.get('var').isNode()) {
                this.addLocal(keyNode.value);
                if (valueNode.isNode()) {
                    this.addLocal(valueNode.value);
                }
            }
            source = this.get('source').toSourceNode();
            key = keyNode.toSourceNode();
            this.nl(1);
            body = this.get('body').toSourceNode();
            this.nl(-1);
            result = this.csn();
            result.add(this.refsToSourceNode());
            result.add([ 'for (', key, ' in ', source, ') {' + this.nl(1) ]);
            if (valueNode.isNode()) {
                result.add([ valueNode.toSourceNode(), ' = ', source, '[', key, '];', this.nl() ]);
            }
            result.add([ body, this.nl(-1, body), '}' ]);
            return result;
        };
        return ___self;
    })(Scope);
    module.exports = ForInStatement;
});
module('targets/adria/if_statement.adria', function(module, resource) {
    var Node, Scope, IfStatement, IfConditional, IfUnconditional;
    Node = require('targets/adria/base/node.adria');
    Scope = require('targets/adria/scope.adria');
    IfStatement = (function(___parent) {
        var ___self = function IfStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var IfStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            this.each(function(child) {
                if (child.key === 'else_if' || child.key === 'else') {
                    result.add(' else ');
                }
                result.add(child.toSourceNode());
            });
            return result;
        };
        return ___self;
    })(Node);
    IfConditional = (function(___parent) {
        var ___self = function IfConditional() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var IfConditional = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, body;
            result = this.csn();
            result.add([
                'if (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body, this.nl(-1, body) + '}' ]);
            return result;
        };
        return ___self;
    })(Scope);
    IfUnconditional = (function(___parent) {
        var ___self = function IfUnconditional() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var IfUnconditional = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, body;
            result = this.csn();
            result.add([ '{' + this.nl(1) ]);
            body = this.get('body').toSourceNode();
            result.add([ this.refsToSourceNode(), body, this.nl(-1, body) + '}' ]);
            return result;
        };
        return ___self;
    })(Scope);
    module.exports.IfStatement = IfStatement;
    module.exports.IfConditional = IfConditional;
    module.exports.IfUnconditional = IfUnconditional;
});
module('targets/adria/array_literal.adria', function(module, resource) {
    var Node, ArrayLiteral;
    Node = require('targets/adria/base/node.adria');
    ArrayLiteral = (function(___parent) {
        var ___self = function ArrayLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ArrayLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var items, result;
            items = this.csn();
            this.nl(1);
            this.each(function(child) {
                items.add(child.toSourceNode());
            });
            result = this.csn();
            if (items.toString().length >= 60) {
                result.add('[' + this.nl());
                result.add(items.join(',' + this.nl()));
                result.add(this.nl(-1) + ']');
            } else {
                this.nl(-1);
                result.add('[ ');
                result.add(items.join(', '));
                result.add(' ]');
            }
            return result;
        };
        return ___self;
    })(Node);
    module.exports = ArrayLiteral;
});
module('targets/adria/new_proto_literal.adria', function(module, resource) {
    var Node, ProtoLiteral, NewProtoLiteral;
    Node = require('targets/adria/base/node.adria');
    ProtoLiteral = require('targets/adria/proto_literal.adria');
    NewProtoLiteral = (function(___parent) {
        var ___self = function NewProtoLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var NewProtoLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, paramList;
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.toSourceNode !== toSourceNode || ___c.hasOwnProperty('toSourceNode') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            result = this.csn();
            result.add('new (');
            result.add(___p.prototype.toSourceNode.call(this));
            result.add(')(');
            paramList = this.get('param_list');
            if (paramList.isNode()) {
                result.add(paramList.toSourceNode());
            }
            result.add(')');
            return result;
        };
        return ___self;
    })(ProtoLiteral);
    module.exports = NewProtoLiteral;
});
module('targets/adria/return_statement.adria', function(module, resource) {
    var Node, AsyncLiteral, FunctionLiteral, ReturnStatement;
    Node = require('targets/adria/base/node.adria');
    AsyncLiteral = require('targets/adria/async_literal.adria');
    FunctionLiteral = require('targets/adria/function_literal.adria');
    ReturnStatement = (function(___parent) {
        var ___self = function ReturnStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ReturnStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var type, hostFunction, result;
            type = this.get('type');
            hostFunction = this.findProto(FunctionLiteral);
            if (hostFunction instanceof AsyncLiteral && hostFunction.useCallback) {
                result = this.csn([
                    hostFunction.storeCallback() + '(null, ',
                    this.get('value').toSourceNode(),
                    ');' + this.nl() + 'return;'
                ]);
            } else {
                result = this.csn([ type.value, ' ', this.get('value').toSourceNode(), ';' ]);
            }
            return result;
        };
        return ___self;
    })(Node);
    module.exports = ReturnStatement;
});
module('targets/adria/yield_literal.adria', function(module, resource) {
    var Node, ASTException, YieldLiteral;
    Node = require('targets/adria/base/node.adria');
    ASTException = require('language_parser/ast_exception.adria');
    YieldLiteral = (function(___parent) {
        var ___self = function YieldLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var YieldLiteral = ___self;
        ___self.prototype.checkEnvironment = function checkEnvironment() {
            if (this.ancestor([ 'function', 'generator', 'async' ]).key !== 'generator') {
                throw new ASTException('Encountered "yield" outside of generator', this);
            }
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            this.checkEnvironment();
            return this.csn([ 'yield ', this.get('value').toSourceNode() ]);
        };
        return ___self;
    })(Node);
    module.exports = YieldLiteral;
});
module('targets/adria/await_literal.adria', function(module, resource) {
    var YieldLiteral, AsyncLiteral, FunctionLiteral, ASTException, AwaitLiteral;
    YieldLiteral = require('targets/adria/yield_literal.adria');
    AsyncLiteral = require('targets/adria/async_literal.adria');
    FunctionLiteral = require('targets/adria/function_literal.adria');
    ASTException = require('language_parser/ast_exception.adria');
    AwaitLiteral = (function(___parent) {
        var ___self = function AwaitLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AwaitLiteral = ___self;
        ___self.prototype.checkEnvironment = function checkEnvironment() {
            if (this.findProto(FunctionLiteral) instanceof AsyncLiteral === false) {
                throw new ASTException('Encountered "await" outside of asynchronous function', this);
            }
        };
        return ___self;
    })(YieldLiteral);
    module.exports = AwaitLiteral;
});
module('targets/adria/throw_statement.adria', function(module, resource) {
    var Node, ThrowStatement;
    Node = require('targets/adria/base/node.adria');
    ThrowStatement = (function(___parent) {
        var ___self = function ThrowStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ThrowStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            return this.csn([ 'throw ', this.get('exception').toSourceNode(), ';' ]);
        };
        return ___self;
    })(Node);
    module.exports = ThrowStatement;
});
module('targets/adria/assert_statement.adria', function(module, resource) {
    var Node, AssertStatement;
    Node = require('targets/adria/base/node.adria');
    AssertStatement = (function(___parent) {
        var ___self = function AssertStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AssertStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            if (this.parser().transform.options['assert']) {
                var params, paramsSN, numParams;
                params = this.get('call');
                paramsSN = params.toSourceNode(false);
                result.add([ 'assert(', paramsSN ]);
                numParams = 0;
                params.each(function(node, first) {
                    numParams++;
                });
                if (numParams < 2) {
                    result.add([ ", '" + paramsSN.toString().jsify("'") + "'" ]);
                }
                result.add(');');
            }
            return result;
        };
        return ___self;
    })(Node);
    module.exports = AssertStatement;
});
module('targets/adria/statement.adria', function(module, resource) {
    var Node, Statement;
    Node = require('targets/adria/base/node.adria');
    Statement = (function(___parent) {
        var ___self = function Statement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Statement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var type, body, result;
            type = this.children[0].key;
            body = Node.prototype.toSourceNode.call(this);
            result = this.csn(body);
            switch (type) {
                case 'expression':
                    result.add(';' + this.nl());
                    break ;
                case 'import':
                    break ;
                case 'var':
                case 'global':
                case 'assert':
                    if (body.trim()) {
                        break ;
                    }
                default:
                    result.add(this.nl());
            }
            return result;
        };
        return ___self;
    })(Node);
    module.exports = Statement;
});
module('targets/adria/interface_statement.adria', function(module, resource) {
    var Node, Module, InterfaceStatement;
    Node = require('targets/adria/base/node.adria');
    Module = require('targets/adria/module.adria');
    InterfaceStatement = (function(___parent) {
        var ___self = function InterfaceStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var InterfaceStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            this.findProto(Module).setInterface();
            return this.csn();
        };
        return ___self;
    })(Node);
    module.exports = InterfaceStatement;
});
module('targets/adria/module_statement.adria', function(module, resource) {
    var Node, Module, ModuleStatement;
    Node = require('targets/adria/base/node.adria');
    Module = require('targets/adria/module.adria');
    ModuleStatement = (function(___parent) {
        var ___self = function ModuleStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ModuleStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var name, moduleNode;
            name = this.get('name').value;
            moduleNode = this.findProto(Module);
            moduleNode.setModuleExport(name);
            return this.csn([ name, ' = ', this.get('value').toSourceNode(), ';' ]);
        };
        return ___self;
    })(Node);
    module.exports = ModuleStatement;
});
module('targets/adria/export_statement.adria', function(module, resource) {
    var Node, Module, ExportStatement;
    Node = require('targets/adria/base/node.adria');
    Module = require('targets/adria/module.adria');
    ExportStatement = (function(___parent) {
        var ___self = function ExportStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ExportStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var name, moduleNode;
            name = this.get('name').value;
            moduleNode = this.findProto(Module);
            moduleNode.addExport(name);
            return this.csn([ name, ' = ', this.get('value').toSourceNode(), ';' ]);
        };
        return ___self;
    })(Node);
    module.exports = ExportStatement;
});
module('targets/adria/global_statement.adria', function(module, resource) {
    var Node, GlobalStatement;
    Node = require('targets/adria/base/node.adria');
    GlobalStatement = (function(___parent) {
        var ___self = function GlobalStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var GlobalStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var valueNode, nameNode, globals, result, nl;
            globals = this.parser().resultData.globals;
            result = this.csn();
            nl = this.nl();
            this.eachKey('item', function(node, first, last) {
                nameNode = node.get('name');
                valueNode = node.get('value');
                globals.add(nameNode.value);
                if (valueNode.isNode()) {
                    result.add([
                        nameNode.value + ' = ',
                        valueNode.toSourceNode(),
                        ';' + (last ? '' : nl)
                    ]);
                }
            });
            return result.children.length > 0 ? result : null;
        };
        return ___self;
    })(Node);
    module.exports = GlobalStatement;
});
module('targets/adria/var_statement.adria', function(module, resource) {
    var Node, VarStatement;
    Node = require('targets/adria/base/node.adria');
    VarStatement = (function(___parent) {
        var ___self = function VarStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var VarStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var valueNode, nameNode, scope, result, nl;
            scope = this.findScope();
            result = this.csn();
            nl = this.nl();
            this.eachKey('item', function(node, first, last) {
                nameNode = node.get('name');
                valueNode = node.get('value');
                scope.addLocal(nameNode.value);
                if (valueNode.isNode()) {
                    result.add([
                        nameNode.toSourceNode(),
                        ' = ',
                        valueNode.toSourceNode(),
                        ';' + (last ? '' : nl)
                    ]);
                }
            });
            return result;
        };
        return ___self;
    })(Node);
    module.exports = VarStatement;
});
module('targets/adria/storage_literal.adria', function(module, resource) {
    var Node, FunctionLiteral, PropertyLiteral, ASTException, StorageLiteral;
    Node = require('targets/adria/base/node.adria');
    FunctionLiteral = require('targets/adria/function_literal.adria');
    PropertyLiteral = require('targets/adria/property_literal.adria');
    ASTException = require('language_parser/ast_exception.adria');
    StorageLiteral = (function(___parent) {
        var ___self = function StorageLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var StorageLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var propertyItem, propertySelf, propertyFunction;
            propertyItem = this.ancestor(null, 'property_accessor_item');
            propertySelf = propertyItem.parent;
            propertyFunction = propertyItem.get('value').get('function');
            if (propertySelf instanceof PropertyLiteral && propertyFunction instanceof FunctionLiteral) {
                var contextName;
                propertySelf.useStorage = true;
                contextName = propertyFunction.storeContext();
                return this.csn(contextName + '[' + propertySelf.storageName + ']');
            }
            throw new ASTException('Invalid use of "storage" literal', this);
        };
        return ___self;
    })(Node);
    module.exports = StorageLiteral;
});
module('targets/adria/parent_literal.adria', function(module, resource) {
    var Node, FunctionLiteral, ParentLiteral;
    Node = require('targets/adria/base/node.adria');
    FunctionLiteral = require('targets/adria/function_literal.adria');
    ParentLiteral = (function(___parent) {
        var ___self = function ParentLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ParentLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var host;
            host = this.findProto(FunctionLiteral);
            return this.csn(host.getParentLookup());
        };
        return ___self;
    })(Node);
    module.exports = ParentLiteral;
});
module('targets/adria/self_literal.adria', function(module, resource) {
    var Node, FunctionLiteral, SelfLiteral;
    Node = require('targets/adria/base/node.adria');
    FunctionLiteral = require('targets/adria/function_literal.adria');
    SelfLiteral = (function(___parent) {
        var ___self = function SelfLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var SelfLiteral = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var host;
            host = this.findProto(FunctionLiteral);
            return this.csn(host.getSelfLookup());
        };
        return ___self;
    })(Node);
    module.exports = SelfLiteral;
});
module('targets/adria/flow_statement.adria', function(module, resource) {
    var Node, FlowStatement;
    Node = require('targets/adria/base/node.adria');
    FlowStatement = (function(___parent) {
        var ___self = function FlowStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var FlowStatement = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            return this.csn([
                this.get('type').value,
                ' ',
                this.get('value').toSourceNode(),
                ';'
            ]);
        };
        return ___self;
    })(Node);
    module.exports = FlowStatement;
});
module('targets/adria_definition.adria', function(module, resource) {
    var Node, ValueType, Ident, Name, String, Numeric, Scope, Module, RequireLiteral, ResourceLiteral, FunctionLiteral, GeneratorLiteral, AsyncLiteral, FunctionStatement, GeneratorStatement, AsyncStatement, FunctionParamsOptional, FunctionParamList, AsyncParamList, Expression, ObjectLiteral, PropertyLiteral, ProtoLiteral, ProtoStatement, ProtoBodyItem, ProtoBodyConstructor, TryStatement, Try, Catch, CatchAll, CatchSpecific, Finally, ForCountStatement, ImportStatement, AccessOperationProtocall, ConstLiteral, InvokeOperation, AsyncWrapOperation, BaseLiteral, DoWhileStatement, WhileStatement, SwitchStatement, ForInStatement, IfBlock, IfStatement, IfConditional, IfUnconditional, ArrayLiteral, NewProtoLiteral, ReturnStatement, YieldLiteral, AwaitLiteral, ThrowStatement, AssertStatement, Statement, InterfaceStatement, ModuleStatement, ExportStatement, GlobalStatement, VarStatement, StorageLiteral, ParentLiteral, SelfLiteral, FlowStatement;
    Node = require('targets/adria/base/node.adria');
    ValueType = require('targets/adria/base/value_type.adria');
    Ident = require('targets/adria/ident.adria');
    Name = Ident;
    String = (function(___parent) {
        var ___self = function String() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var String = ___self;
        return ___self;
    })(ValueType);
    Numeric = (function(___parent) {
        var ___self = function Numeric() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var Numeric = ___self;
        return ___self;
    })(ValueType);
    Scope = require('targets/adria/scope.adria');
    Module = require('targets/adria/module.adria');
    RequireLiteral = require('targets/adria/require_literal.adria');
    ResourceLiteral = require('targets/adria/resource_literal.adria');
    FunctionLiteral = require('targets/adria/function_literal.adria');
    GeneratorLiteral = require('targets/adria/generator_literal.adria');
    AsyncLiteral = require('targets/adria/async_literal.adria');
    FunctionStatement = (function(___parent) {
        var ___self = function FunctionStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var FunctionStatement = ___self;
        ___self.prototype.registerWithParent = true;
        return ___self;
    })(FunctionLiteral);
    GeneratorStatement = (function(___parent) {
        var ___self = function GeneratorStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var GeneratorStatement = ___self;
        ___self.prototype.registerWithParent = true;
        return ___self;
    })(GeneratorLiteral);
    AsyncStatement = (function(___parent) {
        var ___self = function AsyncStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AsyncStatement = ___self;
        ___self.prototype.registerWithParent = true;
        return ___self;
    })(AsyncLiteral);
    FunctionParamsOptional = require('targets/adria/function_params_optional.adria');
    FunctionParamList = require('targets/adria/function_param_list.adria');
    AsyncParamList = require('targets/adria/async_param_list.adria');
    Expression = require('targets/adria/expression.adria');
    ObjectLiteral = require('targets/adria/object_literal.adria');
    PropertyLiteral = require('targets/adria/property_literal.adria');
    ProtoLiteral = require('targets/adria/proto_literal.adria');
    ProtoStatement = (function(___parent) {
        var ___self = function ProtoStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var ProtoStatement = ___self;
        return ___self;
    })(ProtoLiteral);
    ProtoBodyItem = require('targets/adria/proto_body_item.adria');
    ProtoBodyConstructor = require('targets/adria/proto_body_constructor.adria');
    TryStatement = require('targets/adria/try_statement.adria');
    Try = TryStatement.Try;
    Catch = TryStatement.Catch;
    CatchAll = TryStatement.CatchAll;
    CatchSpecific = TryStatement.CatchSpecific;
    Finally = TryStatement.Finally;
    ForCountStatement = require('targets/adria/for_count_statement.adria');
    ImportStatement = require('targets/adria/import_statement.adria');
    AccessOperationProtocall = require('targets/adria/access_operation_protocall.adria');
    ConstLiteral = require('targets/adria/const_literal.adria');
    InvokeOperation = require('targets/adria/invoke_operation.adria');
    AsyncWrapOperation = require('targets/adria/async_wrap_operation.adria');
    BaseLiteral = require('targets/adria/base_literal.adria');
    DoWhileStatement = require('targets/adria/do_while_statement.adria');
    WhileStatement = require('targets/adria/while_statement.adria');
    SwitchStatement = require('targets/adria/switch_statement.adria');
    ForInStatement = require('targets/adria/for_in_statement.adria');
    IfBlock = require('targets/adria/if_statement.adria');
    IfStatement = IfBlock.IfStatement;
    IfConditional = IfBlock.IfConditional;
    IfUnconditional = IfBlock.IfUnconditional;
    ArrayLiteral = require('targets/adria/array_literal.adria');
    NewProtoLiteral = require('targets/adria/new_proto_literal.adria');
    ReturnStatement = require('targets/adria/return_statement.adria');
    YieldLiteral = require('targets/adria/yield_literal.adria');
    AwaitLiteral = require('targets/adria/await_literal.adria');
    ThrowStatement = require('targets/adria/throw_statement.adria');
    AssertStatement = require('targets/adria/assert_statement.adria');
    Statement = require('targets/adria/statement.adria');
    InterfaceStatement = require('targets/adria/interface_statement.adria');
    ModuleStatement = require('targets/adria/module_statement.adria');
    ExportStatement = require('targets/adria/export_statement.adria');
    GlobalStatement = require('targets/adria/global_statement.adria');
    VarStatement = require('targets/adria/var_statement.adria');
    StorageLiteral = require('targets/adria/storage_literal.adria');
    ParentLiteral = require('targets/adria/parent_literal.adria');
    SelfLiteral = require('targets/adria/self_literal.adria');
    FlowStatement = require('targets/adria/flow_statement.adria');
    module.exports.Node = Node;
    module.exports.Ident = Ident;
    module.exports.Name = Name;
    module.exports.String = String;
    module.exports.Numeric = Numeric;
    module.exports.Scope = Scope;
    module.exports.Module = Module;
    module.exports.RequireLiteral = RequireLiteral;
    module.exports.ResourceLiteral = ResourceLiteral;
    module.exports.FunctionLiteral = FunctionLiteral;
    module.exports.GeneratorLiteral = GeneratorLiteral;
    module.exports.AsyncLiteral = AsyncLiteral;
    module.exports.FunctionStatement = FunctionStatement;
    module.exports.GeneratorStatement = GeneratorStatement;
    module.exports.AsyncStatement = AsyncStatement;
    module.exports.FunctionParamsOptional = FunctionParamsOptional;
    module.exports.FunctionParamList = FunctionParamList;
    module.exports.AsyncParamList = AsyncParamList;
    module.exports.Expression = Expression;
    module.exports.ObjectLiteral = ObjectLiteral;
    module.exports.PropertyLiteral = PropertyLiteral;
    module.exports.ProtoLiteral = ProtoLiteral;
    module.exports.ProtoStatement = ProtoStatement;
    module.exports.ProtoBodyItem = ProtoBodyItem;
    module.exports.ProtoBodyConstructor = ProtoBodyConstructor;
    module.exports.Try = Try;
    module.exports.Catch = Catch;
    module.exports.CatchAll = CatchAll;
    module.exports.CatchSpecific = CatchSpecific;
    module.exports.Finally = Finally;
    module.exports.ForCountStatement = ForCountStatement;
    module.exports.ImportStatement = ImportStatement;
    module.exports.AccessOperationProtocall = AccessOperationProtocall;
    module.exports.ConstLiteral = ConstLiteral;
    module.exports.InvokeOperation = InvokeOperation;
    module.exports.AsyncWrapOperation = AsyncWrapOperation;
    module.exports.BaseLiteral = BaseLiteral;
    module.exports.DoWhileStatement = DoWhileStatement;
    module.exports.WhileStatement = WhileStatement;
    module.exports.SwitchStatement = SwitchStatement;
    module.exports.ForInStatement = ForInStatement;
    module.exports.IfStatement = IfStatement;
    module.exports.IfConditional = IfConditional;
    module.exports.IfUnconditional = IfUnconditional;
    module.exports.ArrayLiteral = ArrayLiteral;
    module.exports.NewProtoLiteral = NewProtoLiteral;
    module.exports.ReturnStatement = ReturnStatement;
    module.exports.YieldLiteral = YieldLiteral;
    module.exports.AwaitLiteral = AwaitLiteral;
    module.exports.ThrowStatement = ThrowStatement;
    module.exports.AssertStatement = AssertStatement;
    module.exports.Statement = Statement;
    module.exports.InterfaceStatement = InterfaceStatement;
    module.exports.ModuleStatement = ModuleStatement;
    module.exports.ExportStatement = ExportStatement;
    module.exports.GlobalStatement = GlobalStatement;
    module.exports.VarStatement = VarStatement;
    module.exports.StorageLiteral = StorageLiteral;
    module.exports.ParentLiteral = ParentLiteral;
    module.exports.SelfLiteral = SelfLiteral;
    module.exports.FlowStatement = FlowStatement;
});
module('targets/adria_parser.adria', function(module, resource) {
    var fs, util, Set, LanguageParser, Tokenizer, Match, definition, AdriaParser;
    fs = ___require('fs');
    util = require('util.adria');
    Set = require('../../astdlib/astd/set.adria');
    LanguageParser = require('language_parser.adria');
    Tokenizer = require('tokenizer.adria');
    Match = require('tokenizer/match.adria');
    definition = require('targets/adria_definition.adria');
    AdriaParser = (function(___parent) {
        var ___self = function AdriaParser(transform) {
            LanguageParser.prototype.constructor.call(this, transform);
            this.resultData = {
                globals: new Set(),
                requires: new Set(),
                resources: new Set(),
                isInterface: false
            };
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AdriaParser = ___self;
        ___self.prototype.moduleName = '';
        ___self.prototype.indent = 0;
        ___self.prototype.resultData = null;
        ___self.prototype.clone = function clone() {
            var parser;
            parser = LanguageParser.prototype.clone.call(this);
            parser.resultData = {
                globals: new Set(),
                requires: new Set(),
                resources: new Set(),
                isInterface: false
            };
            return parser;
        };
        ___self.prototype.preprocessRaw = function preprocessRaw(data) {
            var defines;
            data = LanguageParser.prototype.preprocessRaw.call(this, data);
            defines = this.transform.options.defines;
            return data.replace(/\{\{([a-zA-Z][a-zA-Z_0-9]*)\}\}/g, function(matches, key) {
                return (defines[key] === undefined ? '' : defines[key]);
            });
        };
        ___self.prototype.trainSelf = function trainSelf() {
            var keywords, matchKeywords;
            keywords = new Set([
                'var',
                'global',
                'if',
                'else',
                'for',
                'in',
                'do',
                'while',
                'switch',
                'case',
                'break',
                'continue',
                'return',
                'throw',
                'try',
                'catch',
                'finally',
                'yield',
                'await',
                'parent',
                'self',
                'func',
                'proto',
                'prop',
                'storage',
                'require',
                'resource',
                'module',
                'export',
                'interface',
                'delete',
                'new',
                'instanceof',
                'typeof',
                'assert'
            ]);
            matchKeywords = function matchKeywords(match) {
                if (keywords.has(match.data)) {
                    match.name = 'KEYWORD';
                }
                return match;
            };
            this.tokenizer = new Tokenizer([
                Tokenizer.prefabs.delimited(null, '/*', '*/'),
                Tokenizer.prefabs.regex(null, /^\/\/.*/),
                Tokenizer.prefabs.breaker(),
                Tokenizer.prefabs.regex('REGEXP', /^\/(?:(?=(\\?))\1.)*?\/[a-z]*/, /^(\(|=|==|===|\+|!=|!==|,|;|\:)$/),
                Tokenizer.prefabs.set('DELIM', [ ';', '...', '.', ',', '(', ')', '[', ']', '{', '}', '!==', '!=', '!', '++', '--', '#' ]),
                Tokenizer.prefabs.group('DELIM', [ '=', '&', '|', '<', '>', ':', '?', '+', '-', '*', '/', '%' ]),
                Tokenizer.prefabs.regex('IDENT', /^[a-zA-Z_\$][a-zA-Z0-9_\$]*/, null, matchKeywords),
                Tokenizer.prefabs.number('NUMERIC'),
                Tokenizer.prefabs.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/)
            ], [ 'KEYWORD' ]);
            log('AdriaParser', 'trainer processing adria .sdt-files', 2);
            this.setDefinition(resource('../definition/adria/control.sdt'), 'control');
            this.setDefinition(resource('../definition/adria/expression.sdt'), 'expression');
            this.setDefinition(resource('../definition/adria/literal.sdt'), 'literal');
            this.setDefinition(resource('../definition/adria/proto.sdt'), 'proto');
            this.setDefinition(resource('../definition/adria/root.sdt'), 'root');
            this.setDefinition(resource('../definition/adria/statement.sdt'), 'statement');
            log('AdriaParser', 'being trained', -2);
            LanguageParser.prototype.trainSelf.call(this);
            log('AdriaParser', 'done');
        };
        ___self.prototype.mapType = function mapType(captureName, blockName) {
            var typeName;
            typeName = blockName.snakeToCamel(true);
            if (typeof definition[typeName] === 'function') {
                return definition[typeName];
            }
            return definition.Node;
        };
        ___self.prototype.createNode = function createNode(name, capture, label, condition) {
            var node;
            node = LanguageParser.prototype.createNode.call(this, name, capture, label, condition);
            if (name === 'ident') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT;
                node.description = '<identifier>';
            } else if (name === 'name') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT | this.tokenizer.Type.KEYWORD;
                node.description = '<name>';
            } else if (name === 'regexp') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.REGEXP;
                node.description = '<regular expression>';
            }
            return node;
        };
        ___self.prototype.loadSourceFromCache = function loadSourceFromCache(filename, cacheModifier) {
            cacheModifier = (arguments.length > 1 ? cacheModifier : (null));
            LanguageParser.prototype.loadSourceFromCache.call(this, filename, cacheModifier);
            if (this.cacheData !== null && this.transform.options['map']) {
                this.sourceCode = fs.readFileSync(filename, 'UTF-8').replace('\r\n', '\n');
            }
        };
        return ___self;
    })(LanguageParser);
    module.exports = AdriaParser;
});
module('targets/adria_transform.adria', function(module, resource) {
    var fs, path, util, args, Set, SourceNode, Template, Transform, AdriaParser, ASTException, AdriaTransform;
    fs = ___require('fs');
    path = ___require('path');
    util = require('util.adria');
    args = require('args.adria');
    Set = require('../../astdlib/astd/set.adria');
    SourceNode = require('source_node.adria');
    Template = require('template.adria');
    Transform = require('transform.adria');
    AdriaParser = require('targets/adria_parser.adria');
    ASTException = require('language_parser/ast_exception.adria');
    AdriaTransform = (function(___parent) {
        var ___self = function AdriaTransform(stdin) {
            Transform.prototype.constructor.call(this, stdin);
            this.globals = new Set();
            this.implicits = new Set();
            this.requires = new Set();
            this.resources = new Set();
            this.requiresDone = new Set();
            this.usedBuiltins = new Set();
            this.modules = [  ];
            this.sourceCode = {  };
            this.defineImplicits();
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AdriaTransform = ___self;
        ___self.prototype.cacheModifier = null;
        ___self.prototype.startTime = 0;
        ___self.prototype.globals = null;
        ___self.prototype.implicits = null;
        ___self.prototype.requires = null;
        ___self.prototype.modules = null;
        ___self.prototype.resources = null;
        ___self.prototype.usedBuiltins = null;
        ___self.prototype.requiresDone = null;
        ___self.prototype.sourceCode = null;
        ___self.prototype.protoParser = null;
        ___self.prototype.addInterface = false;
        ___self.prototype.builtins = { 'async.adria': resource('../templates/adria/async.tpl') };
        ___self.prototype.initOptions = function initOptions() {
            Transform.prototype.initOptions.call(this, this);
            args.add([ '-b', '--base' ], {
                help: 'Base path, include paths are relative to this',
                defaultValue: '',
                dest: 'basePath',
                metavar: '<path>',
                required: false
            });
            args.add([ '-p', '--path' ], {
                help: 'Additional path to look for includes',
                action: 'append',
                dest: 'paths',
                metavar: '<path>'
            });
            args.add([ '-o', '--out' ], {
                help: 'Output file',
                action: 'store',
                dest: 'outFile',
                metavar: '<file>'
            });
            args.add([ '--extension' ], {
                help: 'Adria file extension (adria)',
                defaultValue: 'adria',
                metavar: '<ext>',
                required: false
            }, function(value) {
                return '.' + value;
            });
            args.add([ '-t', '--target' ], {
                help: 'Platform to generate code for (node)',
                action: 'store',
                choices: [ 'node', 'web' ],
                dest: 'platform',
                defaultValue: 'node'
            });
            args.add([ '--header' ], {
                help: 'File to include as commentblock before output',
                action: 'store',
                dest: 'headerFile',
                defaultValue: '',
                metavar: '<file>'
            });
            args.add([ '-D', '--define' ], {
                help: 'Define preprocessor value, i.e. version="1.2"',
                metavar: '<key>=<value>',
                action: 'append',
                dest: 'defines'
            }, function(data) {
                var result;
                result = {  };
                var id, value, pair;
                for (id in data) {
                    value = data[id];
                    pair = value.split('=');
                    result[pair[0]] = (pair[1] === undefined ? true : pair[1]);
                }
                return result;
            });
            args.add([ 'files' ], { help: 'File(s) to compile', nargs: '+' });
            args.addSwitch('shellwrap', 'Wrap in shell-script and flag executable', false);
            args.addSwitch('application', 'Generate application global', true);
            args.addSwitch('map', 'Generate source map', false);
            args.addSwitch('link', 'Link sourcemap to output', true);
            args.addSwitch('strict', 'Compile strict Javascript', true);
            args.addSwitch('assert', 'Add assert() support', false);
            args.addSwitch('scan', 'Perform basic logic checks', true);
            args.addSwitch('time', 'Report compilation duration', false);
        };
        ___self.prototype.processOptions = function processOptions() {
            var ___p, ___s, ___c, ___c0 = ___c = ___s = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (___c !== null && (___c.processOptions !== processOptions || ___c.hasOwnProperty('processOptions') === false)) {
                ___s = ___c,
                ___c = Object.getPrototypeOf(___c);
            }
            ___s = ___s.constructor,
            ___p = (___c !== null ? Object.getPrototypeOf(___c).constructor : ___c0);
            ___p.prototype.processOptions.call(this);
            this.cacheModifier = util.md5(JSON.stringify(this.options));
            if (this.options['time']) {
                this.startTime = Date.now();
            }
        };
        ___self.prototype.defineImplicits = function defineImplicits() {
            this.implicits.add([
                'window',
                'arguments',
                'this',
                'true',
                'false',
                'null',
                'undefined',
                'Infinity',
                'NaN',
                'Array',
                'Boolean',
                'Date',
                'Intl',
                'JSON',
                'Function',
                'Math',
                'Number',
                'Object',
                'RegExp',
                'String',
                'ArrayBuffer',
                'DataView',
                'Float32Array',
                'Float64Array',
                'Int16Array',
                'Int32Array',
                'Int8Array',
                'Uint16Array',
                'Uint32Array',
                'Uint8Array',
                'Error',
                'EvalError',
                'RangeError',
                'ReferenceError',
                'SyntaxError',
                'TypeError',
                'URIError',
                'decodeURI',
                'decodeURIComponent',
                'encodeURI',
                'encodeURIComponent',
                'eval',
                'setTimeout',
                'clearTimeout',
                'setInterval',
                'clearInterval',
                'isFinite',
                'isNaN',
                'parseFloat',
                'parseInt',
                'console',
                'debugger',
                'application',
                'Exception'
            ]);
            if (this.options['platform'] === 'node') {
                this.implicits.add([ 'process', 'Buffer' ]);
            } else if (this.options['platform'] === 'web') {
                this.implicits.add([
                    'screen',
                    'document',
                    'location',
                    'performance',
                    'alert',
                    'XMLHttpRequest',
                    'Worker'
                ]);
            }
            if (this.options['assert']) {
                this.implicits.add('AssertionFailedException');
            }
        };
        ___self.prototype.buildModule = function buildModule(moduleName, data) {
            var parser, result, requires;
            data = (arguments.length > 1 ? data : (null));
            parser = this.protoParser.clone();
            parser.moduleName = moduleName;
            if (data === null) {
                parser.loadSource(this.options['basePath'] + moduleName, this.cacheModifier);
            } else {
                parser.setSource(moduleName, data, this.cacheModifier);
            }
            parser.preprocess({  });
            result = parser.output();
            requires = parser.resultData.requires;
            this.requiresDone.add(moduleName);
            var name;
            for (name in requires.data) {
                if (this.requiresDone.has(name) === false) {
                    this.buildModule(name);
                }
            }
            this.requires = this.requires.merge(parser.resultData.requires);
            this.globals = this.globals.merge(parser.resultData.globals);
            this.resources = this.resources.merge(parser.resultData.resources);
            if (parser.resultData.isInterface) {
                if (this.addInterface) {
                    throw new ASTException('Interface already defined', parser);
                }
                this.addInterface = true;
            }
            this.modules.push({ result: result, parser: parser });
        };
        ___self.prototype.generateOutputTree = function generateOutputTree() {
            var options, node, tpl, fw, tmpNode, usedBuiltins;
            options = this.options;
            node = new SourceNode(null, null);
            tpl = new Template();
            tpl.debug = this.options['debug'];
            tpl.assign('globals', this.globals.toArray());
            tpl.assign('builtins', this.usedBuiltins.toArray());
            tpl.assign('enableAssert', options['assert']);
            tpl.assign('enableApplication', options['application']);
            tpl.assign('platform', options['platform']);
            if (options['shellwrap']) {
                node.add([
                    '#!/bin/sh\n',
                    '\':\' //; exec "`command -v nodejs || command -v node`" --harmony "$0" "$@"\n'
                ]);
            }
            if (options['headerFile'] !== '') {
                var header;
                header = fs.readFileSync(options['basePath'] + options['headerFile'], 'UTF-8');
                node.add('/**\n * ' + header.trim().replace(/\r?\n/g, '\n * ') + '\n */\n');
            }
            node.add(';(function(' + (options['platform'] === 'node' ? '___module, ___require, window' : '') + ') {\n');
            if (options['strict']) {
                node.add('"use strict";\n');
            }
            fw = tpl.fetch(resource('../templates/adria/framework.tpl'));
            tmpNode = node.add(new SourceNode(1, 0, 'adria-framework.js', fw));
            tmpNode.setSourceContent('adria-framework.js', fw);
            var fileName, contents, wrapped;
            for (fileName in this.resources.data) {
                contents = fs.readFileSync(options['basePath'] + fileName, 'UTF-8');
                wrapped = 'resource(\'' + fileName + '\', \'' + contents.jsify("'") + '\');\n';
                tmpNode = node.add(new SourceNode(null, null, fileName, wrapped));
                tmpNode.setSourceContent(fileName, contents);
            }
            usedBuiltins = this.usedBuiltins.toArray();
            var id, name;
            for (id in usedBuiltins) {
                name = usedBuiltins[id];
                fw = tpl.fetch(this.builtins[name]);
                tmpNode = node.add(new SourceNode(1, 0, name.replace('.adria', '.js'), fw));
                tmpNode.setSourceContent(name.replace('.adria', '.js'), fw);
            }
            var id, currentModule;
            for (id in this.modules) {
                currentModule = this.modules[id];
                tmpNode = node.add(new SourceNode(null, null, currentModule.parser.file, currentModule.result));
                tmpNode.setSourceContent(currentModule.parser.file, currentModule.parser.sourceCode);
            }
            node.trim();
            var id, name;
            for (id in usedBuiltins) {
                name = usedBuiltins[id];
                node.add('\nrequire(\'' + name + '\');');
            }
            var id, file;
            for (id in options['files']) {
                file = options['files'][id];
                node.add('\nrequire(\'' + util.normalizeExtension(file, this.options['extension']) + '\');');
            }
            node.add('\n})(' + (options['platform'] === 'node' ? 'module, require, global' : '') + ');');
            return node;
        };
        ___self.prototype.scan = function scan() {
            var id, currentModule;
            for (id in this.modules) {
                currentModule = this.modules[id];
                currentModule.parser.scan({  });
            }
        };
        ___self.prototype.run = function run() {
            var files, node;
            this.protoParser = new AdriaParser(this);
            this.protoParser.trainSelf();
            if (this.options['time'] && this.options['outFile'] !== null) {
                var duration;
                duration = Date.now() - this.startTime;
                console.log('Setup duration: ' + duration + 'ms');
                this.startTime = Date.now();
            }
            if (this.stdin !== null) {
                this.buildModule('main' + this.options['extension'], this.stdin);
            }
            files = this.options['files'];
            var id;
            for (id in files) {
                this.buildModule(util.normalizeExtension(files[id], this.options['extension']));
            }
            if (this.options['scan']) {
                this.scan();
            }
            node = this.generateOutputTree();
            if (this.options['outFile'] !== null) {
                var jsFile, mapFile;
                jsFile = this.options['basePath'] + this.options['outFile'];
                mapFile = jsFile.stripPostfix('.js') + '.map';
                if (this.options['map']) {
                    var result, mapLink;
                    result = node.toStringWithSourceMap({ file: this.options['outFile'] });
                    mapLink = '\n//@ sourceMappingURL=' + path.relative(this.options['basePath'], mapFile);
                    fs.writeFileSync(jsFile, result.code + (this.options['link'] ? mapLink : ''));
                    fs.writeFileSync(mapFile, result.map);
                } else {
                    fs.writeFileSync(jsFile, node.toString());
                }
                if (this.options['shellwrap']) {
                    fs.chmodSync(jsFile, 493);
                }
                if (this.options['time']) {
                    var duration;
                    duration = Date.now() - this.startTime;
                    console.log('Transformation duration: ' + duration + 'ms');
                }
            } else {
                process.stdout.write(node.toString());
            }
        };
        return ___self;
    })(Transform);
    module.exports = AdriaTransform;
});
module('targets/adriadebug_parser.adria', function(module, resource) {
    var AdriaParser, Node, AdriaDebugParser;
    AdriaParser = require('targets/adria_parser.adria');
    Node = require('targets/adria/base/node.adria');
    Node.prototype.toString = function toString() {
        var indent, result;
        indent = String.repeat(this.depth() * 4, ' ');
        result = "";
        var childId, node;
        for (childId in this.children) {
            node = this.children[childId];
            if (node.isLeaf()) {
                result += indent + "<" + node.key + " value=\"" + node.value.replace(/\"/g, '\\"') + "\" />\n";
            } else {
                result += indent + "<" + node.key + " value=\"" + node.value.replace(/\"/g, '\\"') + "\">\n";
                result += node.toString();
                result += indent + "</" + node.key + ">\n";
            }
        }
        return result;
    };
    AdriaDebugParser = (function(___parent) {
        var ___self = function AdriaDebugParser() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AdriaDebugParser = ___self;
        ___self.prototype.outputMethod = 'toString';
        return ___self;
    })(AdriaParser);
    module.exports = AdriaDebugParser;
});
module('targets/adriadebug_transform.adria', function(module, resource) {
    var fs, util, AdriaTransform, AdriaDebugParser, AdriaDebugTransform;
    fs = ___require('fs');
    util = require('util.adria');
    AdriaTransform = require('targets/adria_transform.adria');
    AdriaDebugParser = require('targets/adriadebug_parser.adria');
    AdriaDebugTransform = (function(___parent) {
        var ___self = function AdriaDebugTransform(stdin) {
            AdriaTransform.prototype.constructor.call(this, stdin);
            this.options['cache'] = false;
            this.options['scan'] = false;
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        var AdriaDebugTransform = ___self;
        ___self.prototype.run = function run() {
            var options, files, result;
            options = this.options;
            this.protoParser = new AdriaDebugParser(this);
            this.protoParser.trainSelf();
            if (this.stdin !== null) {
                this.buildModule('main' + options['extension'], this.stdin);
            }
            files = options['files'];
            var id;
            for (id in files) {
                this.buildModule(util.normalizeExtension(files[id], options['extension']));
            }
            result = [  ];
            var id, mod;
            for (id in this.modules) {
                mod = this.modules[id];
                result.push(mod.result);
            }
            if (options['outFile'] !== null) {
                fs.writeFileSync(options['basePath'] + options['outFile'], result.join('\n'));
            } else {
                process.stdout.write(result.join('\n'));
            }
        };
        return ___self;
    })(AdriaTransform);
    module.exports = AdriaDebugTransform;
});
module('main.adria', function(module, resource) {
    var args, options, handle, run;
    require('../../astdlib/astd/prototype/string.adria').extend();
    require('../../astdlib/astd/prototype/regexp.adria').extend();
    require('../../astdlib/astd/prototype/object.adria').extend();
    log = require('log.adria');
    args = require('args.adria');
    args.add([ '-m', '--mode' ], {
        help: 'Translation mode (adria)',
        defaultValue: 'adria',
        choices: [ 'adria', 'adriadebug' ],
        required: false
    });
    args.add([ '--stdin' ], { help: 'Read from stdin (false)', action: 'storeTrue' });
    args.add([ '-d', '--debug' ], { help: 'Enable debug mode (false)', action: 'storeTrue' });
    options = args.parseKnown();
    handle = function handle(stdin) {
        var transform;
        if (options['mode'] === 'adria') {
            var AdriaTransform;
            AdriaTransform = require('targets/adria_transform.adria');
            transform = new AdriaTransform(stdin);
        } else if (options['mode'] === 'adriadebug') {
            var AdriaDebugTransform;
            AdriaDebugTransform = require('targets/adriadebug_transform.adria');
            transform = new AdriaDebugTransform(stdin);
        } else {
            throw new Error('Unsupported mode "' + options['mode'] + '".');
        }
        transform.run();
    };
    run = function run(stdin) {
        stdin = (arguments.length > 0 ? stdin : (null));
        if (options['debug']) {
            debugger;
            handle(stdin);
        } else {
            var ASTException;
            ASTException = require('language_parser/ast_exception.adria');
            try {
                handle(stdin);
            } catch (___exc1) {
                if (___exc1 instanceof ASTException) {
                    var e = ___exc1;
                    console.log(e.message);
                    process.exit(1);
                } else { 
                    throw ___exc1;
                }
            }
        }
    };
    if (options['stdin']) {
        var data;
        data = '';
        process.stdin.on('data', function(chunk) {
            data += chunk.toString();
        });
        process.stdin.on('end', function() {
            run(data);
        });
        process.stdin.resume();
    } else {
        run();
    }
});
require('main.adria');
})(module, require, global);