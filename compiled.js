(function() {
var application;
var __require;
var resource;
var module;
var Async;
(function() {
    var resources = { };
    var modules = { };
    var getResource = function(name) {
        return resources[name];
    };
    var Module = function(name, func) {
        this.name = name;
        this.exports = { };
        func(this, getResource);
    };
    Module.prototype.exports = null;
    Module.prototype.name = '';
    module = function(name, func) {
        modules[name] = new Module(name, func);
    };
    resource = function(name, data) {
        resources[name] = data;
    };
    application = function(Constructor /*, params... */) {
        function Application() {
            application = this;
            Constructor.apply(this, Array.prototype.slice.call(arguments));
        };
        Application.prototype = Constructor.prototype;
        var args = Array.prototype.slice.call(arguments);
        args[0] = null;
        return new (Function.prototype.bind.apply(Application, args));
    };
    __require = function(file) {
        return modules[file].exports;
    }; 
    //!todo make builtin, requireable module?
    Async = function Async(generator) {
        this.generator = generator;
        this.boundCallback = this.callback.bind(this);
        this.next();
    }
    Async.wrap = function(func, context) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            return function(callback) {
                args.push(callback);
                func.apply(context, args);
            };
        };
    };
    Async.AsyncError = function AsyncError(message, fileName, lineNumber) {
        Error.call(this, message, fileName, lineNumber);
    };
    Async.AsyncError.prototype = Object.create(Error.prototype);
    Async.AsyncError.prototype.constructor = Async.AsyncError;
    Async.prototype.generator = null;
    Async.prototype.sync = 0;
    Async.prototype.result = undefined;
    Async.prototype.waiting = 0;
    Async.prototype.terminated = false;
    Async.prototype.throw = function(e) {
        if (this.terminated === false) {
            this.terminated = true;
            this.generator.throw(e);
        }
    };
    Async.prototype.next = function() {
        var arg;
        while ((arg = this.generator.next(this.result)).done === false) {
            arg = arg.value;
            this.sync = 0;
            try {
                if (typeof arg === 'function') {
                    arg(this.boundCallback);
                } else {
                    this.waitAll(arg);
                }
            } catch (e) {
                return this.throw(e);
            }
            // check if the function returned before or after the callback was invoked
            if (this.sync === 0) {
                this.sync = -1;
                break;
            }
        }
    };
    Async.prototype.waitAll = function(args) {
        var arg;
        if (args instanceof Array) {
            this.result = new Array(args.length);
        } else if (args instanceof Object) {
            this.result = { };
        }
        for (var id in args) {
            var arg = args[id];
            if (typeof arg === 'function') {
                this.waiting++;
                arg(this._waitAllCallback.bind(this, id));
            } else {
                throw new Async.AsyncError('Property ' + id + ' of yielding object is not a function');
            }
        }
    };
    Async.prototype._waitAllCallback = function(originalId, err, val) {
        var numArgs = arguments.length;
        if (err instanceof Error) {
            return this.throw(err);
        }
        if (this.result.hasOwnProperty(originalId)) {
            return this.throw(new Async.AsyncError('Callback for item ' + originalId + ' of yield was invoked more than once'));
        }
        // add this callbacks result to set of results
        this.result[originalId] = (numArgs === 2 ? err : val);
        this.waiting--;
        // yield result when all is done
        if (this.waiting === 0) {
            this.callback(null, this.result);
        }
    };
    Async.prototype.callback = function(err, val) {
        var numArgs = arguments.length;
        if (err instanceof Error) {
            return this.throw(err);
        }
        this.result = (numArgs === 1 ? err : val);
        if (this.sync === 0) {
            this.sync = 1;
        } else if (this.terminated === false) {
            this.next();
        }
    };
})();
resource('definition/adria/control.sdt', '\n\
/*\n\
 * multipurpose code block\n\
 */\n\
\n\
scope {\n\
    entry -> block -> return\n\
}\n\
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
    entry -> "return":type -> return\n\
    "return":type -> literal_expression:value -> return\n\
}\n\
\n\
flow_statement {\n\
    entry -> "break":type -> return\n\
    entry -> "continue":type -> return\n\
}\n\
\n\
/*\n\
 * if else block\n\
 * "elseif" is achieved by else followed by a new if-block\n\
 */\n\
\n\
if_statement {\n\
    entry -> "if" -> "(" -> expression:condition -> ")" -> block:if_body -> return\n\
    block:if_body -> "else" -> if_statement:else_if -> return\n\
    block:if_body -> "else" -> block:else_body -> return\n\
}\n\
\n\
/*\n\
 * while\n\
 */\n\
\n\
do_while_statement {\n\
    entry -> "do" -> block:body -> "while" -> "(" -> expression:condition -> ")" -> return\n\
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
    entry -> var_def:init -> return\n\
    entry -> expression:init -> return\n\
}\n\
\n\
for_count_statement {\n\
    entry -> "for" -> "(" -> for_count_init -> t -> expression:test[full] -> t -> expression:cond_op -> ")" -> block:body -> return\n\
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
 * switch statement\n\
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
    entry -> "throw" -> expression:exception -> return\n\
}\n\
\n\
catch_all {\n\
    entry -> "catch" -> "(" -> ident:value -> ")" -> block:body -> return\n\
}\n\
\n\
catch_specific {\n\
    entry -> "catch" -> "(" -> expression:type -> ident:value -> ")" -> block:body -> return\n\
}\n\
\n\
finally {\n\
    entry -> "finally" -> block:body -> return\n\
}\n\
\n\
catch_specifics {\n\
    entry -> catch_specific:specific -> return\n\
    catch_specific:specific -> catch_specific:specific\n\
    catch_specific:specific -> catch_all:catch -> return\n\
}\n\
\n\
try_catch_finally_statement {\n\
    entry -> "try" -> block:body -> catch_all:all -> return\n\
    block:body -> catch_specifics:specifics -> return\n\
\n\
    block:body -> finally:finally -> return\n\
    catch_all:all -> finally:finally\n\
    catch_specifics:specifics -> finally:finally\n\
}\n\
');
resource('definition/adria/expression.sdt', '\n\
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
    entry -> "=":passignment_op -> proto_body_property:value -> return\n\
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
resource('definition/adria/literal.sdt', '\n\
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
 * function literal\n\
 */\n\
\n\
async_literal {\n\
    entry -> "function" -> "#":async -> "(" -> ")" -> scope:body -> return\n\
    "#":async -> ident:name -> "("\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
generator_literal {\n\
    entry -> "function" -> "*":generator -> "(" -> ")" -> scope:body -> return\n\
    "*":generator -> ident:name -> "("\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
function_literal {\n\
    entry -> "function" -> "(" -> ")" -> scope:body -> return\n\
    "function" -> ident:name -> "("\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
function_param {\n\
    entry -> ident:name -> return\n\
}\n\
\n\
function_param_default {\n\
    entry -> ident:name -> "=" -> expression:value -> return\n\
}\n\
\n\
function_param_list {\n\
\n\
    // standard params:  a, b, c ....\n\
\n\
    entry -> function_param:item -> return\n\
    function_param:item -> ","[type_standard] -> function_param:item\n\
\n\
    // defaulted params:  d = 1, e = 2, f = 3 ....\n\
\n\
    entry -> function_param_default:item -> return\n\
    function_param_default:item -> ","[type_defaulted] -> function_param_default:item\n\
\n\
    // defaulted params following standard params:  a, b, c, d = 1, e = 2, f = 3\n\
    // note: commas are named to prevent the defintion-parser from linking them and thus\n\
    // creating a backlink from defaulted parameters to standard parameters\n\
\n\
    function_param:item -> ","[one_way_bridge] -> function_param_default:item\n\
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
/*\n\
 * parent\n\
 */\n\
\n\
parent_literal {\n\
    // this is really just a function, but it has to be evaluable at compilation time\n\
    entry -> "parent" -> return\n\
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
    entry -> parent_literal:parent -> return\n\
    entry -> resource_literal:resource -> return\n\
    entry -> yield_literal:yield -> return\n\
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
    entry -> base_literal:base -> return //!todo where is extra base capture used?\n\
    entry -> complex_literal -> return\n\
}');
resource('definition/adria/proto.sdt', '\n\
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
    entry -> name:key -> ":"\n\
    entry -> string:key -> ":"\n\
    ":" -> literal_expression:value -> return // todo verify\n\
    ":" -> proto_body_property:value -> return\n\
}\n\
\n\
proto_body_property {\n\
    entry -> "property" -> proto_body_property_accessor -> return\n\
    entry -> "property" -> proto_body_property_data -> return\n\
}\n\
\n\
proto_body_property_accessor {\n\
    entry -> "{" -> proto_body_property_accessor_item:item -> "}" -> return\n\
    proto_body_property_accessor_item:item -> ","[any] -> proto_body_property_accessor_item:item\n\
    proto_body_property_accessor_item:item -> ","[last] -> "}" -> return\n\
}\n\
\n\
proto_body_property_data {\n\
    entry -> "{" -> proto_body_property_data_item:item -> "}" -> return\n\
    proto_body_property_data_item:item -> ","[any] -> proto_body_property_data_item:item\n\
    proto_body_property_data_item:item -> ","[last] -> "}" -> return\n\
}\n\
\n\
proto_body_property_accessor_item {\n\
    entry -> "get":key -> ":"\n\
    entry -> "set":key -> ":"\n\
    entry -> "configurable":key -> ":"\n\
    entry -> "enumerable":key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
\n\
proto_body_property_data_item {\n\
    entry -> "value":key -> ":"\n\
    entry -> "writable":key -> ":"\n\
    entry -> "configurable":key -> ":"\n\
    entry -> "enumerable":key -> ":"\n\
    ":" -> literal_expression:value -> return\n\
}\n\
');
resource('definition/adria/root.sdt', '/*\n\
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
resource('definition/adria/statement.sdt', '\n\
/*\n\
 * declaration/definition\n\
 */\n\
\n\
module_statement {\n\
    entry -> "module" -> dec_def -> return\n\
}\n\
\n\
export_statement {\n\
    entry -> "export" -> dec_def -> return\n\
}\n\
\n\
import_statement {\n\
    entry -> "import" -> dec_list -> return\n\
}\n\
\n\
var_def {\n\
    entry -> "var" -> dec_def_list -> return\n\
}\n\
\n\
const_def {\n\
    entry -> "const" -> dec_def_list -> return\n\
}\n\
\n\
global_def {\n\
    entry -> "global" -> dec_def_list -> return\n\
}\n\
\n\
function_statement {\n\
    entry -> "function" -> ident:name -> "(" -> ")" -> scope:body -> return\n\
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
    entry -> "function" -> "*":generator -> ident:name -> "(" -> ")" -> scope:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
async_statement {\n\
    entry -> "function" -> "#":async -> ident:name -> "(" -> ")" -> scope:body -> return\n\
    "(" -> function_param_list:param_list -> ")"\n\
}\n\
\n\
/*\n\
 * assert statement\n\
 */\n\
\n\
assert_statement {\n\
    entry -> "assert" -> "(" -> expression:value -> ")" -> return\n\
    expression:value -> "," -> expression:value -> ")"\n\
}\n\
\n\
/*\n\
 * array deconstruction\n\
 */\n\
\n\
deconstruct {\n\
    //!todo recursive\n\
    entry -> "[" -> ident:item -> "]" -> "=" -> literal_expression:source -> return\n\
    ident:item -> "," -> ident:item\n\
}\n\
\n\
/*\n\
 * statement groups\n\
 */\n\
\n\
statement {\n\
\n\
    entry -> var_def:var_def -> t -> return\n\
\n\
    entry -> if_statement:if -> return\n\
    entry -> for_in_statement:for_in -> return\n\
    entry -> for_count_statement:for_count -> return\n\
\n\
    entry -> return_statement:control -> t -> return\n\
    entry -> export_statement:export -> t -> return\n\
    entry -> module_statement:module -> t -> return\n\
    entry -> expression:expression -> t -> return\n\
\n\
    entry -> const_def:const_def -> t -> return\n\
    entry -> global_def:global_def -> t -> return\n\
    entry -> deconstruct:deconstruct -> t -> return\n\
    entry -> throw_statement:throw -> t -> return\n\
    entry -> do_while_statement:do_while -> t -> return\n\
    entry -> assert_statement:assert -> t -> return\n\
\n\
    entry -> flow_statement:control -> t -> return\n\
\n\
    entry -> while_statement:while -> return\n\
    entry -> switch_statement:switch -> return\n\
    entry -> function_statement:function -> return\n\
    entry -> try_catch_finally_statement:try_catch_finally -> return\n\
    entry -> proto_statement:proto -> return\n\
    entry -> generator_statement:generator -> return\n\
\n\
    entry -> import_statement:import -> t -> return\n\
}\n\
\n\
/*\n\
 * statement terminator\n\
 */\n\
\n\
t {\n\
    entry -> ";" -> return\n\
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
resource('templates/adria/framework.tpl', 'var application;\n\
var <if platform == \'node\'>__</if>require;\n\
var resource;\n\
var module;<if enableAssert>\n\
var assert;</if><if globals.length != 0>\n\
var <each global in globals><global><if ! each.last>, </if></each>;</if>\n\
var Async;\n\
(function() {\n\
    var resources = { };\n\
    var modules = { };\n\
    var getResource = function(name) {<if enableAssert>\n\
        if (resources[name] === undefined) {\n\
            throw Error(\'missing resource \' + name);\n\
        }\n\
        </if>\n\
        return resources[name];\n\
    };\n\
    var Module = function(name, func) {\n\
        this.name = name;\n\
        this.exports = { };\n\
        func(this, getResource);\n\
    };\n\
    Module.prototype.exports = null;\n\
    Module.prototype.name = \'\';\n\
    module = function(name, func) {\n\
        modules[name] = new Module(name, func);\n\
    };\n\
    resource = function(name, data) {\n\
        resources[name] = data;\n\
    };\n\
    application = function(Constructor /*, params... */) {\n\
        function Application() {\n\
            application = this;\n\
            Constructor.apply(this, Array.prototype.slice.call(arguments));\n\
        };\n\
        Application.prototype = Constructor.prototype;\n\
        var args = Array.prototype.slice.call(arguments);\n\
        args[0] = null;\n\
        return new (Function.prototype.bind.apply(Application, args));\n\
    };\n\
    <if platform == \'node\'>__</if>require = function(file) {<if enableAssert>\n\
        if (modules[file] === undefined) {\n\
            throw Error(\'missing dependency \' + file);\n\
        }\n\
        </if>\n\
        return modules[file].exports;\n\
    }; <if enableAssert>\n\
    assert = function(assertion, message) {\n\
        if (assertion !== true) {\n\
            throw new Error(\'assertion failed: \' + message);\n\
        }\n\
    };</if><rem><if enableAsync></rem>\n\
\n\
    //!todo make builtin, requireable module?\n\
    Async = function Async(generator) {\n\
        this.generator = generator;\n\
        this.boundCallback = this.callback.bind(this);\n\
        this.next();\n\
    }\n\
\n\
    Async.wrap = function(func, context) {\n\
        return function() {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return function(callback) {\n\
                args.push(callback);\n\
                func.apply(context, args);\n\
            };\n\
        };\n\
    };\n\
\n\
    Async.AsyncError = function AsyncError(message, fileName, lineNumber) {\n\
        Error.call(this, message, fileName, lineNumber);\n\
    };\n\
    Async.AsyncError.prototype = Object.create(Error.prototype);\n\
    Async.AsyncError.prototype.constructor = Async.AsyncError;\n\
\n\
    Async.prototype.generator = null;\n\
    Async.prototype.sync = 0;\n\
    Async.prototype.result = undefined;\n\
    Async.prototype.waiting = 0;\n\
    Async.prototype.terminated = false;\n\
\n\
    Async.prototype.throw = function(e) {\n\
        if (this.terminated === false) {\n\
            this.terminated = true;\n\
            this.generator.throw(e);\n\
        }\n\
    };\n\
\n\
    Async.prototype.next = function() {\n\
        var arg;\n\
\n\
        while ((arg = this.generator.next(this.result)).done === false) {\n\
\n\
            arg = arg.value;\n\
            this.sync = 0;\n\
\n\
            try {\n\
                if (typeof arg === \'function\') {\n\
                    arg(this.boundCallback);\n\
                } else {\n\
                    this.waitAll(arg);\n\
                }\n\
            } catch (e) {\n\
                return this.throw(e);\n\
            }\n\
\n\
            // check if the function returned before or after the callback was invoked\n\
\n\
            if (this.sync === 0) {\n\
                this.sync = -1;\n\
                break;\n\
            }\n\
        }\n\
    };\n\
\n\
    Async.prototype.waitAll = function(args) {\n\
        var arg;\n\
\n\
        if (args instanceof Array) {\n\
            this.result = new Array(args.length);\n\
        } else if (args instanceof Object) {\n\
            this.result = { };\n\
        }\n\
\n\
        for (var id in args) {\n\
            var arg = args[id];\n\
            if (typeof arg === \'function\') {\n\
                this.waiting++;\n\
                arg(this._waitAllCallback.bind(this, id));\n\
            } else {\n\
                throw new Async.AsyncError(\'Property \' + id + \' of yielding object is not a function\');\n\
            }\n\
        }\n\
    };\n\
\n\
    Async.prototype._waitAllCallback = function(originalId, err, val) {\n\
\n\
        var numArgs = arguments.length;\n\
\n\
        if (err instanceof Error) {\n\
            return this.throw(err);\n\
        }\n\
\n\
        if (this.result.hasOwnProperty(originalId)) {\n\
            return this.throw(new Async.AsyncError(\'Callback for item \' + originalId + \' of yield was invoked more than once\'));\n\
        }\n\
\n\
        // add this callbacks result to set of results\n\
\n\
        this.result[originalId] = (numArgs === 2 ? err : val);\n\
        this.waiting--;\n\
\n\
        // yield result when all is done\n\
\n\
        if (this.waiting === 0) {\n\
            this.callback(null, this.result);\n\
        }\n\
    };\n\
\n\
    Async.prototype.callback = function(err, val) {\n\
\n\
        var numArgs = arguments.length;\n\
\n\
        if (err instanceof Error) {\n\
            return this.throw(err);\n\
        }\n\
\n\
        this.result = (numArgs === 1 ? err : val);\n\
\n\
        if (this.sync === 0) {\n\
            this.sync = 1;\n\
        } else if (this.terminated === false) {\n\
            this.next();\n\
        }\n\
    };<rem></if></rem>\n\
})();\n\
');
module('src/prototype.adria', function(module, resource) {
    String.prototype.snakeToCamel = (function() {
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
    String.prototype.jsify = function jsify(quoteType) {
        if (quoteType === "'") {
            return this.replace(/([\\'])/g, "\\$1").replace(/\r?\n/g, '\\n\\\n').replace(/\0/g, "\\0");
        } else if (quoteType === '"') {
            return this.replace(/([\\"])/g, "\\$1").replace(/\r?\n/g, '\\\n').replace(/\0/g, "\\0");
        } else {
            return this.replace(/([\\"'])/g, "\\$1").replace(/\r?\n/g, '\\\n').replace(/\0/g, "\\0");
        }
    };
    String.prototype.format = function format() {
        var args;
        args = Array.prototype.slice.call(arguments);
        if (args.length === 1 && args[0] instanceof Object) {
            args = args[0];
        }
        return this.replace(/(.?)\$([0-9a-z]+)(\:[0-9a-z]+)?/ig, function(str, prefix, matchname, options) {
            if (prefix == '$') {
                return '$' + matchname + (options !== undefined ? options : '');
            }
            return (args[matchname] !== undefined ? prefix + args[matchname] : str);
        });
    };
    String.prototype.repeat = function repeat(count) {
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
    String.repeat = function repeat(count, string) {
        string = (string === undefined ? ' ' : string);
        return string.repeat(count);
    };
    String.prototype.occurances = function occurances(search) {
        var count, index;
        count = 0;
        index = this.indexOf(search);
        while (index !== -1) {
            count++;
            index = this.indexOf(search, index + 1);
        }
        return count;
    };
    String.prototype.padLeft = function padLeft(paddedLength, padChar) {
        padChar = (padChar !== undefined ? padChar : ' ');
        return padChar.repeat(paddedLength - this.length) + this.valueOf();
    };
    String.prototype.padRight = function padRight(paddedLength, padChar) {
        padChar = (padChar !== undefined ? padChar : ' ');
        return this.valueOf() + padChar.repeat(paddedLength - this.length);
    };
    String.random = function random(length, chars) {
        var chars, numChars, result, i, rnum;
        chars = (chars === undefined ? '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' : chars);
        numChars = chars.length;
        result = '';
        for (i = 0; i < length;i++) {
            rnum = Math.floor(Math.random() * numChars);
            result += chars.substr(rnum, 1);
        }
        return result;
    };
    String.prototype.stripPostfix = function stripPostfix(postfix) {
        var len, i;
        if (postfix instanceof Array) {
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
    String.prototype.hasPostfix = function hasPostfix(postfix) {
        return (this.substr(-postfix.length) === postfix);
    };
});
module('src/util.adria', function(module, resource) {
    var sysutil, crypto, DebugLog, debugLog, indent, enabled, log, dump, Enumeration, Enum, Set, processOptions, home, normalizeExtension, md5;
    sysutil = require('util');
    crypto = require('crypto');
    DebugLog = (function() {
        var ___self = function DebugLog() {
            this.start = Date.now();
            this.last = this.start;
            console.log('=============================: Log started');
        };
        ___self.prototype.print = function print(source, message, indent) {
            var now, diffStart, diffLast;
            now = Date.now();
            diffStart = now - this.start;
            diffLast = now - this.last;
            this.last = now;
            console.log(('+' + diffLast + '/' + diffStart).padLeft(10) + 'ms: ' + source.padLeft(15) + ': ' + ' '.repeat(indent) + message);
        };
        return ___self;
    })();
    debugLog = null;
    indent = 0;
    enabled = false;
    log = function log(source, message, offset) {
        if (enabled !== true) {
            return ;
        }
        if (debugLog === null) {
            debugLog = new DebugLog(source === true);
        }
        if (offset < 0) {
            indent += offset;
        }
        if (message !== undefined) {
            debugLog.print(source, message, indent);
        }
        if (offset > 0) {
            indent += offset;
        }
    };
    log.enable = function enable() {
        enabled = true;
    };
    log.disable = function disable() {
        enabled = false;
    };
    dump = function dump(obj, depth, showHidden) {
        depth = (depth === undefined ? 2 : depth);
        showHidden = (showHidden === undefined ? false : showHidden);
        console.log(sysutil.inspect(obj, showHidden, depth));
    };
    Enumeration = function Enumeration(options) {
        var bit, id;
        bit = 0;
        for (id in options) {
            if (this[options[id]] === undefined) {
                this[options[id]] = 1 << bit;
                bit += 1;
            }
            if (bit >= 32) {
                throw new Error('options is expected to be an array and contain <= 32 unique elements');
            }
        }
        return Object.freeze(this);
    };
    Enum = function Enum(options) {
        return new Enumeration(options);
    };
    Set = (function() {
        var ___self = function Set(value) {
            this.data = {  };
            if (value !== undefined) {
                this.add(value);
            }
        };
        ___self.prototype.merge = function merge() {
            var args, result, key, id;
            args = Array.prototype.slice.call(arguments, 0);
            result = new Set();
            for (key in this.data) {
                result.data[key] = true;
            }
            for (id in args) {
                for (key in args[id].data) {
                    result.data[key] = true;
                }
            }
            return result;
        };
        ___self.prototype.add = function add(value) {
            var data, element;
            data = this.data;
            if (value instanceof Array) {
                value.forEach(function(element) {
                    data[element] = true;
                });
            } else if (value instanceof Set) {
                for (element in value.data) {
                    data[element] = true;
                }
            } else {
                data[value] = true;
            }
            return this;
        };
        ___self.prototype.remove = function remove(value) {
            var data, element;
            data = this.data;
            if (value instanceof Array) {
                value.forEach(function(element) {
                    delete data[element];
                });
            } else if (value instanceof Set) {
                for (element in value.data) {
                    delete data[element];
                }
            } else {
                delete data[value];
            }
            return this;
        };
        ___self.prototype.has = function has(value) {
            var data, id, other, key;
            data = this.data;
            if (value instanceof Array) {
                for (id in value) {
                    if (data.hasOwnProperty(value[id]) !== true) {
                        return false;
                    }
                }
                return true;
            } else if (value instanceof Set) {
                other = value.data;
                for (key in other) {
                    if (data.hasOwnProperty(key) !== true) {
                        return false;
                    }
                }
                return true;
            } else {
                return (data.hasOwnProperty(value));
            }
        };
        ___self.prototype.lacks = function lacks(value) {
            return this.has(value) === false;
        };
        ___self.prototype.missing = function missing(value) {
            var result, data, id, other, key;
            result = new Set();
            data = this.data;
            if (value instanceof Array) {
                for (id in value) {
                    if (data[value[id]] !== true) {
                        result.add(value[id]);
                    }
                }
            } else if (value instanceof Set) {
                other = value.data;
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
                var dummy;
                for (dummy in this.data) {
                    return false;
                }
                return true;
            }
        });
        Object.defineProperty(___self.prototype, "length", {
            get: function length() {
                var len, dummy;
                len = 0;
                for (dummy in this.data) {
                    len++;
                }
                return len;
            }
        });
        return ___self;
    })();
    processOptions = function processOptions(context, handlers) {
        var next, i, argv, prefix, param;
        next = '_default';
        for (i = 2; i < process.argv.length;i++) {
            argv = process.argv[i];
            prefix = argv.slice(0, 2);
            param = argv.slice(2);
            if (prefix == "--" && typeof handlers[param] === 'function') {
                next = param;
            } else if (prefix == "--") {
                if (handlers['_switch'] !== undefined) {
                    handlers['_switch'].call(context, param);
                }
            } else {
                if (handlers[next] !== undefined) {
                    handlers[next].call(context, argv);
                }
                next = '_default';
            }
        }
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
    module.exports.log = log;
    module.exports.dump = dump;
    module.exports.Enum = Enum;
    module.exports.Set = Set;
    module.exports.processOptions = processOptions;
    module.exports.home = home;
    module.exports.normalizeExtension = normalizeExtension;
    module.exports.md5 = md5;
});
module('src/xregexp.adria', function(module, resource) {
    var XRegExp;
    XRegExp = require('xregexp').XRegExp;
    if (parseInt(XRegExp.version) < 3) {
        console.log('XRegExp version 3 or above strongly recommended.');
        console.log('If it is not yet available in NPM, get it here');
        console.log('   https://github.com/slevithan/xregexp');
        console.log('and either replace xregexp-all.js in node_modules/xregexp');
        console.log('or copy/rename it to adria/src/xregexp.js (replace this file)');
        console.log('Comment/remove process.exit(); in adria/src/xregexp.js to proceed');
        console.log('anyway (tokenizing will be about 15-20 times slower)');
        process.exit();
    }
    module.exports = XRegExp;
});
module('src/template/tags.adria', function(module, resource) {
    var Util, Tags;
    Util = __require('src/util.adria');
    Tags = function Tags() {
        this.ifDepth = 0;
        this.eachDepth = 0;
        this.remDepth = 0;
        this.resultVar = '';
    };
    Tags.prototype.supports = function supports(tagName) {
        return (this['tag:' + tagName] !== undefined);
    };
    Tags.prototype.tag = function tag(tagName, params) {
        if (typeof this['tag:' + tagName] !== 'function') {
            throw new Error('unknown tag ' + tagName + ' called');
        }
        return this['tag:' + tagName](params);
    };
    Tags.prototype.text = function text(string) {
        var repl;
        repl = string.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\*\//g, '*\\/').replace(/'/g, '\\\'');
        return this.resultVar + ' += \'' + repl + '\';\n';
    };
    Tags.prototype.fallback = function fallback() {
        return 'out';
    };
    Tags.prototype.begin = function begin() {
        this.ifDepth = 0;
        this.eachDepth = 0;
        this.remDepth = 0;
        this.resultVar = '__r' + String.random(8);
        return '(function() { var ' + this.resultVar + ' = \'\'; with (this) {\n';
    };
    Tags.prototype.end = function end() {
        if (this.ifDepth > 0) {
            throw new Error('unclosed if-tag(s)');
        } else if (this.eachDepth > 0) {
            throw new Error('unclosed each-tag(s)');
        } else if (this.remDepth > 0) {
            throw new Error('unclosed rem-tag(s)');
        }
        return '} return ' + this.resultVar + '; }).call(this);';
    };
    Tags.prototype['tag:out'] = function(params) {
        return this.resultVar + ' += (typeof ' + params + ' !== \'undefined\' ? ' + params + ' : \'\');\n';
    };
    Tags.prototype['tag:if'] = function(params) {
        this.ifDepth += 1;
        return 'if (' + params + ') {\n';
    };
    Tags.prototype['tag:else'] = function() {
        if (this.ifDepth === 0) {
            throw new Error('else: no matching if found');
        }
        return '} else {\n';
    };
    Tags.prototype['tag:elseif'] = function(params) {
        if (this.ifDepth === 0) {
            throw new Error('elseif: no matching if found');
        }
        return '} else if (' + params + ') {\n';
    };
    Tags.prototype['tag:/if'] = function() {
        if (this.ifDepth === 0) {
            throw new Error('/if: no matching if found');
        }
        this.ifDepth -= 1;
        return '}\n';
    };
    Tags.prototype['tag:each'] = function(params) {
        var hash, options;
        params = params.split(' ');
        if (params[1] !== 'in') {
            throw new Error('each: syntax error');
        }
        hash = String.random(6);
        options = {
            name: params[0],
            from: params[2],
            id: '__i' + hash,
            keys: '__k' + hash,
            len: '__l' + hash
        };
        this.eachDepth += 1;
        return '(function() { \
                if ($from instanceof Object !== true) return; \
                var $keys = ($from instanceof Array ? null : Object.keys($from)); \
                var $len = ($keys === null ? $from.length : $keys.length); \
                for (var $id = 0; $id < $len; $id++) { \
                    var $name = $from[($keys === null ? $id : $keys[$id])];\
                    var each = { first: ($id === 0), last: ($id === $len -1), key: ($keys === null ? $id : $keys[$id]) };\n'.format(options);
    };
    Tags.prototype['tag:/each'] = function(params) {
        if (this.eachDepth === 0) {
            throw new Error('/each: no matching each found');
        }
        this.eachDepth -= 1;
        return '}})();\n';
    };
    Tags.prototype['tag:rem'] = function(params) {
        if (this.remDepth > 0) {
            throw new Error('rem: nested comments not supported');
        }
        if (params) {
            return '/* ' + params + ' */';
        } else {
            this.remDepth += 1;
            return '/* ';
        }
    };
    Tags.prototype['tag:/rem'] = function() {
        if (this.remDepth === 0) {
            throw new Error('/rem: no matching each found');
        }
        this.remDepth -= 1;
        return ' */';
    };
    module.exports = Tags;
});
module('src/template.adria', function(module, resource) {
    var XRegExp, fs, Tags, Template;
    XRegExp = __require('src/xregexp.adria');
    fs = require('fs');
    Tags = __require('src/template/tags.adria');
    Template = (function() {
        var ___self = function Template(tags, delimiterOpen, delimiterClose) {
            tags = (tags === undefined ? new Tags() : tags);
            delimiterOpen = (delimiterOpen === undefined ? '<' : delimiterOpen);
            delimiterClose = (delimiterClose === undefined ? '>' : delimiterClose);
            this.tags = tags;
            this.data = {  };
            this.delimiter = {
                open: XRegExp.escape(delimiterOpen),
                close: XRegExp.escape(delimiterClose)
            };
        };
        ___self.prototype.basePath = 'templates/';
        ___self.prototype.assign = function assign(name, value) {
            this.data[name] = value;
        };
        ___self.prototype.parse = function parse(input) {
            var self, tplString, lastIndex, lastTail, delim, regex;
            self = this;
            tplString = '';
            lastIndex = 0;
            lastTail = '';
            delim = this.delimiter;
            regex = XRegExp(' (?<head>  [\\ \\t]*)' + delim.open + '(?<ident> /?[a-z_][a-z0-9_\\[\\]\\.]+) \\s* (?<params>.*?)' + delim.close + '(?<tail>  \\n){0,1}', 'xis');
            input = input.replace(/\r/g, '');
            tplString += self.tags.begin();
            XRegExp.forEach(input, regex, function(match, i) {
                if (i == 0 && match.index > 0) {
                    tplString += self.tags.text(lastTail + input.substring(0, match.index) + match.head);
                } else if (i > 0) {
                    tplString += self.tags.text(lastTail + input.substring(lastIndex, match.index) + match.head);
                }
                lastIndex = match.index + match[0].length;
                lastTail = (match.tail !== undefined ? match.tail : '');
                if (match.params === '' && match.ident !== '' && self.tags.supports(match.ident) !== true) {
                    match.params = match.ident;
                    match.ident = self.tags.fallback();
                }
                if (self.tags.supports(match.ident) !== true) {
                    throw new Error('unsupported tag ' + match.ident + ' encountered');
                }
                tplString += self.tags.tag(match.ident, match.params);
            });
            tplString += self.tags.text(lastTail + input.substring(lastIndex));
            tplString += self.tags.end();
            return tplString;
        };
        ___self.prototype.exec = function exec(tplString) {
            return (function() {
                return eval(tplString);
            }).call(this.data);
        };
        ___self.prototype.fetch = function fetch(input) {
            var tplString;
            tplString = this.parse(input);
            return this.exec(tplString);
        };
        ___self.prototype.fetchFile = function fetchFile(file) {
            return this.fetch(fs.readFileSync(this.basePath + file, 'UTF-8'));
        };
        return ___self;
    })();
    Template.Tags = Tags;
    module.exports = Template;
});
module('src/cache.adria', function(module, resource) {
    var fs, path, util, Cache;
    fs = require('fs');
    path = require('path');
    util = __require('src/util.adria');
    Cache = (function() {
        var ___self = function Cache() {
            this.checkBaseDir();
        };
        ___self.prototype.baseDir = util.home() + '/.adria/cache/';
        ___self.prototype.checkBaseDir = function checkBaseDir() {
            var parts, path, id, part;
            if (this.baseDir.slice(0, 1) !== '/' || this.baseDir.slice(-1) !== '/') {
                throw new Error('cache.baseDir needs to be an absolute path');
            }
            parts = this.baseDir.slice(1, -1).split('/');
            path = '/';
            for (id in parts) {
                part = parts[id];
                path += part;
                if (fs.existsSync(path)) {
                    if (fs.statSync(path).isFile()) {
                        throw new Error(path + ' is a file');
                    }
                } else {
                    fs.mkdirSync(path, (parseInt(id) === parts.length - 1 ? 511 : 493));
                }
                path += '/';
            }
        };
        ___self.prototype.cacheName = function cacheName(file) {
            var absPath;
            absPath = path.resolve(process.cwd(), file);
            return this.baseDir + util.md5(absPath);
        };
        ___self.prototype.fetch = function fetch(file, variants) {
            var cacheFile, inputStat, cacheStat, resultData, id, variant;
            cacheFile = this.cacheName(file);
            if (fs.existsSync(cacheFile) && fs.existsSync(file)) {
                inputStat = fs.statSync(file);
                cacheStat = fs.statSync(cacheFile);
                if (cacheStat.isFile() && inputStat.mtime.toString() === cacheStat.mtime.toString()) {
                    resultData = {  };
                    for (id in variants) {
                        variant = variants[id];
                        if (variant === 'base') {
                            util.log('Cache', 'reading from ' + cacheFile, 0);
                            resultData['base'] = JSON.parse(fs.readFileSync(cacheFile, 'UTF-8'));
                        } else {
                            resultData[variant] = JSON.parse(fs.readFileSync(cacheFile + '.' + variant, 'UTF-8'));
                        }
                    }
                    return resultData;
                } else {
                    util.log('Cache', 'cache miss for ' + file, 0);
                }
            }
            return null;
        };
        ___self.prototype.insert = function insert(file, variants) {
            var inputStat, cacheFile, ext, variant;
            inputStat = fs.statSync(file);
            cacheFile = this.cacheName(file);
            for (ext in variants) {
                variant = variants[ext];
                if (ext === 'base') {
                    util.log('Cache', 'writing to ' + cacheFile, 0);
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
module('src/transform.adria', function(module, resource) {
    var util, Cache, Transform;
    util = __require('src/util.adria');
    Cache = __require('src/cache.adria');
    Transform = (function() {
        var ___self = function Transform(piped) {
            this.options = { basePath: '', paths: [  ], files: [  ], outFile: null };
            this.piped = piped;
            this.initOptions();
            this.processOptions();
            if (this.options['no-cache'] !== true) {
                this.cache = new Cache();
            }
            if (this.options.debug) {
                util.log.enable();
            }
        };
        ___self.prototype.optionsDefinition = null;
        ___self.prototype.options = null;
        ___self.prototype.piped = null;
        ___self.prototype.cache = null;
        ___self.prototype.initOptions = function initOptions() {
            this.defineOptions({
                '_default': function(file) {
                    this['files'].push(file);
                },
                '_switch': function(param) {
                    this[param] = true;
                },
                'base': function(path) {
                    this['basePath'] = (path.hasPostfix('/') ? path : path + '/');
                },
                'path': function(path) {
                    if (this['paths'] === undefined) {
                        this['paths'] = [  ];
                    }
                    this['paths'].push((path.hasPostfix('/') ? path : path + '/'));
                },
                'out': function(file) {
                    this['outFile'] = file;
                },
                'target': function(target) {
                    this['target'] = target;
                }
            });
        };
        ___self.prototype.defineOptions = function defineOptions(optionsDefinition) {
            var id;
            if (this.optionsDefinition === null) {
                this.optionsDefinition = {  };
            }
            for (id in optionsDefinition) {
                this.optionsDefinition[id] = optionsDefinition[id];
            }
        };
        ___self.prototype.processOptions = function processOptions() {
            util.processOptions(this.options, this.optionsDefinition);
        };
        ___self.prototype.run = function run() {
        };
        return ___self;
    })();
    module.exports = Transform;
});
module('src/parser/generator_state.adria', function(module, resource) {
    var GeneratorState;
    GeneratorState = (function() {
        var ___self = function GeneratorState() {}
        ___self.prototype.generator = null;
        ___self.prototype.node = null;
        ___self.prototype.stack = null;
        ___self.prototype.token = null;
        ___self.prototype.minStack = 0;
        ___self.prototype.done = false;
        ___self.prototype.setGenerator = function setGenerator(generator, token) {
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
module('src/parser/definition/node.adria', function(module, resource) {
    var Enum, Type, StackItem, Node;
    Enum = __require('src/util.adria').Enum;
    Type = Enum([ 'NONE', 'BLOCK', 'JUMP', 'RETURN' ]);
    StackItem = (function() {
        var ___self = function StackItem(node, token) {
            this.node = node;
            this.token = token;
        };
        ___self.prototype.node = null;
        ___self.prototype.token = null;
        return ___self;
    })();
    Node = (function() {
        var ___self = function Node() {
            this.children = [  ];
        };
        ___self.prototype.children = null;
        ___self.prototype.tokenType = 0;
        ___self.prototype.match = '';
        ___self.prototype.type = 0;
        ___self.prototype.name = '';
        ___self.prototype.capture = '';
        ___self.prototype.label = '';
        ___self.prototype.description = '';
        ___self.prototype.hasChild = function hasChild(node) {
            var children, id;
            children = this.children;
            for (id in children) {
                if (children[id] === node) {
                    return true;
                }
            }
            return false;
        };
        ___self.prototype.add = function add(node) {
            var children, lastId, lastChild;
            if (this.hasChild(node)) {
                return ;
            }
            children = this.children;
            if (node.type & Type.RETURN) {
                children.push(node);
                return node;
            } else {
                lastId = children.length - 1;
                if (lastId >= 0) {
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
            node = new Node();
            node.capture = capture;
            node.tokenType = tokenType;
            node.match = match;
            node.description = (description !== undefined ? description : (capture !== undefined ? capture : match));
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
        ___self.prototype.filter = function* filter(parser, token, stack) {
            var children, child, blockRoot, generator, result, message, id, len, top;
            children = this.children;
            if (stack.length > 500) {
                message = parser.errorMessage(token, this, stack);
                throw new Error('recursion too deep. last error:\n' + message);
            }
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
        ___self.prototype.toString = function toString(owner, known) {
            var data, childId, child, result, item;
            if (known === undefined) {
                data = {  };
            } else {
                data = known;
            }
            for (childId in this.children) {
                child = this.children[childId];
                if ((child.type & Type.RETURN) === 0) {
                    if (child.type === Type.JUMP && owner !== undefined) {
                        try {
                            owner.definition.getBlock(child.match).toString(owner, data);
                        } catch (e) {
                        }
                    } else {
                        data[child.description != "" ? child.description : (child.capture != "" ? child.capture : "\"" + child.match + "\"")] = true;
                    }
                }
            }
            if (known !== undefined) {
                return "";
            }
            result = this.type === Type.JUMP ? '[' + this.match + '] ' : '';
            for (item in data) {
                if (result != "") {
                    result += ", ";
                }
                result += item;
            }
            return result;
        };
        return ___self;
    })();
    module.exports = Node;
    module.exports.Type = Type;
    module.exports.StackItem = StackItem;
});
module('src/parser/definition.adria', function(module, resource) {
    var Node, Definition;
    Node = __require('src/parser/definition/node.adria');
    Definition = (function() {
        var ___self = function Definition(initialBlock) {
            this.blockRoot = {  };
            this.initialBlock = (initialBlock === undefined ? 'root' : initialBlock);
        };
        ___self.prototype.createBlock = function createBlock(name, rootNode) {
            name = (name === null ? this.initialBlock : name);
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
                throw new Error('referencing non-existing definition block ' + name);
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
module('src/parser.adria', function(module, resource) {
    var path, XRegExp, util, GeneratorState, Definition, Parser;
    path = require('path');
    XRegExp = __require('src/xregexp.adria');
    util = __require('src/util.adria');
    GeneratorState = __require('src/parser/generator_state.adria');
    Definition = __require('src/parser/definition.adria');
    Parser = (function() {
        var ___self = function Parser() {
            this.definition = new Definition('root');
        };
        ___self.prototype.definition = null;
        ___self.prototype.tokenizer = null;
        ___self.prototype.file = 'unnamed';
        ___self.prototype.clone = function clone() {
            var OwnType, parser;
            OwnType = Object.getPrototypeOf(this).constructor;
            parser = new OwnType();
            parser.definition = this.definition;
            parser.tokenizer = this.tokenizer;
            return parser;
        };
        ___self.prototype.errorMessage = function errorMessage(token, node, stack) {
            var id, trace, done, levelNode, levelToken;
            stack = stack.slice();
            stack.push({ node: node, token: token });
            id = stack.length - 1;
            trace = '';
            done = 0;
            while (id--) {
                levelNode = stack[id].node;
                levelToken = stack[id].token;
                if (levelNode instanceof Object) {
                    trace += (id + 1) + '. ' + levelNode.name + (levelNode.capture !== '' ? ':' + levelNode.capture : '') + (levelNode.label !== '' ? '[' + levelNode.label + ']' : '');
                } else {
                    trace += 'null entry on stack';
                }
                trace += ' at ' + levelToken.pos.toString() + ': ' + levelToken.data + '\n';
                if (done++ > 15 && id > 15) {
                    id = 15;
                    trace += '...\n';
                }
            }
            return '$file: Unexpected token "$tokenData" $position. Expected: $validNodes\n\nTrace:\n$trace'.format({
                file: path.normalize(this.file),
                tokenData: token.data,
                position: token.pos.toString(),
                validNodes: node.toString(this),
                trace: trace
            });
        };
        ___self.prototype.checkCondition = function checkCondition(condition, stack) {
            throw Error('NYI: parser::checkCondition');
        };
        ___self.prototype.parse = function parse(source) {
            var tokens, node, stack, len, id, maxId, maxStack, maxNode, results, success, result, token;
            util.log('Parser', 'tokenizing', 2);
            tokens = this.tokenizer.process(source, this.file);
            util.log('Parser', 'done', -2);
            node = this.definition.getInitialBlock();
            stack = [  ];
            len = tokens.length;
            id = len;
            maxId = 0;
            maxStack = [  ];
            maxNode = node;
            results = new Array(len);
            success = false;
            while (id--) {
                results[id] = new GeneratorState();
            }
            id = 0;
            util.log('Parser', 'processing ' + len + ' tokens according to currrent language definition');
            do {
                result = results[id];
                if (result.generator === null) {
                    token = tokens.get(id);
                    result.setGenerator(node.filter(this, token, stack), token);
                }
                try {
                    result.next();
                } catch (e) {
                    if (e.message === 'nothing to yield') {
                        break ;
                    } else {
                        throw e;
                    }
                }
                if (result.done === false && id > maxId) {
                    maxId = id;
                    maxStack = result.stack.slice(0);
                    maxNode = result.node;
                }
                if (result.done) {
                    result.setGenerator(null);
                    id--;
                } else if (id === len - 1) {
                    if (result.node.reachesExit(result.stack)) {
                        success = true;
                        break ;
                    } else {
                        continue ;
                    }
                } else {
                    node = result.node;
                    stack = result.stack.slice(0);
                    id++;
                }
            } while (id >= 0);
            if (success === false) {
                if (maxId + 1 === len) {
                    throw new Error(path.normalize(this.file) + ': Unexpected end of file.');
                } else {
                    throw new Error(this.errorMessage(tokens.get(maxId + 1), maxNode, maxStack));
                }
            }
            return results;
        };
        return ___self;
    })();
    module.exports = Parser;
    module.exports.Definition = Definition;
});
module('src/tokenizer/result.adria', function(module, resource) {
    var Position, Token, Result;
    Position = (function() {
        var ___self = function Position(col, row) {
            this.col = col;
            this.row = row;
        };
        ___self.prototype.col = 0;
        ___self.prototype.row = 0;
        ___self.prototype.toString = function toString() {
            return 'line ' + this.row + ', column ' + this.col;
        };
        return ___self;
    })();
    Token = (function() {
        var ___self = function Token(data, type, start, col, row) {
            this.data = data;
            this.type = type;
            this.start = start;
            this.pos = new Position(col, row);
        };
        ___self.prototype.data = '';
        ___self.prototype.type = 0;
        ___self.prototype.start = 0;
        ___self.prototype.pos = null;
        return ___self;
    })();
    Result = (function() {
        var ___self = function Result(tokenizer) {
            this.tokenizer = tokenizer;
            this.tokens = [  ];
        };
        ___self.prototype.add = function add(data, type, start, col, row) {
            this.tokens.push(new Token(data, type, start, col, row));
        };
        ___self.prototype.get = function get(tokenId) {
            return this.tokens[tokenId];
        };
        Object.defineProperty(___self.prototype, "length", {
            get: function length() {
                return this.tokens.length;
            }
        });
        return ___self;
    })();
    module.exports = Result;
});
module('src/tokenizer.adria', function(module, resource) {
    var XRegExp, Enum, Result, Tokenizer;
    XRegExp = __require('src/xregexp.adria');
    Enum = __require('src/util.adria').Enum;
    Result = __require('src/tokenizer/result.adria');
    Tokenizer = (function() {
        var ___self = function Tokenizer(definition, extra) {
            var legend, id;
            this.definition = definition;
            legend = [  ];
            for (id in definition) {
                legend.push(definition[id].name);
            }
            if (extra instanceof Array) {
                for (id in extra) {
                    legend.push(extra);
                }
            }
            this.Type = Enum(legend);
        };
        ___self.prototype.process = function process(data, filename) {
            filename = (filename !== undefined ? filename : ('unnamed'));
            var startPos, result, col, row, definition, match, found, lastMatch, id, processor;
            startPos = 0;
            result = new Result(this);
            col = 1;
            row = 1;
            definition = this.definition;
            lastMatch = null;
            while (startPos < data.length) {
                found = false;
                for (id in this.definition) {
                    processor = this.definition[id];
                    match = processor.func(data, startPos, lastMatch);
                    if (match !== null) {
                        if (match.data !== null && match.name !== null) {
                            result.add(match.data, this.Type[match.name], startPos, col, row);
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
                    throw new Error(filename + ': no match found at row ' + row + ', column ' + col + ': "' + data.substr(startPos).split(/\r?\n/)[0] + '"');
                }
            }
            return result;
        };
        return ___self;
    })();
    function Match(name, data, endPosition, containedRows, lastRowLen) {
        this.name = name;
        this.data = data;
        this.endPosition = endPosition;
        this.containedRows = containedRows;
        this.lastRowLen = lastRowLen;
    }
    Tokenizer.prefab = new (function() {
        var regexFunc, regexEscape, excludeFunc;
        regexFunc = function regexFunc(name, regex, lastRegex, callback) {
            lastRegex = (lastRegex !== undefined ? lastRegex : (null));
            callback = (callback !== undefined ? callback : (null));
            return {
                name: name,
                func: function(data, start, lastMatch) {
                    var result, rows, lastBreak, lastRowLen, match;
                    result = regex.exec(data.substr(start));
                    if (result !== null && (lastRegex === null || lastRegex.exec(lastMatch) !== null)) {
                        rows = result[0].occurances('\n');
                        lastBreak = result[0].lastIndexOf('\n');
                        lastRowLen = result[0].length - (lastBreak + 1);
                        match = new Match(this.name, result[0], start + result[0].length, rows, lastRowLen);
                        if (typeof callback === 'function') {
                            return callback(match);
                        } else {
                            return match;
                        }
                    }
                    return null;
                }
            };
        };
        regexEscape = function regexEscape(regexString) {
            return XRegExp.escape(regexString).replace('/', '\\/');
        };
        this.breaker = function breaker() {
            return regexFunc(null, /^(\s+)/);
        };
        this.number = function number(name) {
            return regexFunc(name, /^(\-?[0-9]+(\.[0-9]+)?(e\-?[0-9]+)?)/);
        };
        this.delimited = function delimited(name, start, end) {
            var regex;
            start = start || '"';
            end = end || start;
            regex = new RegExp('^(' + regexEscape(start) + '[\\s\\S]*?' + regexEscape(end) + ')');
            return regexFunc(name, regex);
        };
        this.regex = function regex(name, regex, lastRegex, callback) {
            return regexFunc(name, regex, lastRegex, callback);
        };
        excludeFunc = function excludeFunc(match) {
            if (this.indexOf(match.data) !== -1) {
                return null;
            }
            return match;
        };
        this.exclude = function exclude(name, regex, exclude) {
            return regexFunc(name, regex, null, excludeFunc.bind(exclude));
        };
        this.set = function set(name, matches) {
            var escaped, id, regex;
            escaped = [  ];
            for (id in matches) {
                escaped.push(regexEscape(matches[id]));
            }
            regex = new RegExp('^(' + escaped.join('|') + ')');
            return regexFunc(name, regex);
        };
        this.group = function group(name, matches) {
            var escaped, id, regex;
            escaped = [  ];
            for (id in matches) {
                escaped.push(regexEscape(matches[id]));
            }
            regex = new RegExp('^(' + '[' + escaped.join() + ']+)');
            return regexFunc(name, regex);
        };
        this.any = function any(name) {
            return regexFunc(name, /^[^\s]*/);
        };
    })();
    module.exports = Tokenizer;
    module.exports.Result = Result;
});
module('src/definition_parser/path.adria', function(module, resource) {
    var Path, PathElement;
    Path = (function() {
        var ___self = function Path(sourceName, sourceCapture, sourceLabel, sourceCondition, targetName, targetCapture, targetLabel, targetCondition) {
            this.source = new PathElement(sourceName, sourceCapture, sourceLabel, sourceCondition);
            this.target = new PathElement(targetName, targetCapture, targetLabel, targetCondition);
        };
        ___self.prototype.source = null;
        ___self.prototype.target = null;
        ___self.prototype.reset = function reset() {
            this.source = this.target;
            this.target = new PathElement();
        };
        ___self.prototype.clone = function clone() {
            return new Path(this.source.name, this.source.capture, this.source.label, this.source.condition, this.target.name, this.target.capture, this.target.label, this.target.condition);
        };
        return ___self;
    })();
    PathElement = (function() {
        var ___self = function PathElement(name, capture, label, condition) {
            name = (name !== undefined ? name : (''));
            capture = (capture !== undefined ? capture : (''));
            label = (label !== undefined ? label : (''));
            condition = (condition !== undefined ? condition : (''));
            this.name = name;
            this.capture = capture;
            this.label = label;
            this.condition = condition;
        };
        ___self.prototype.name = '';
        ___self.prototype.capture = '';
        ___self.prototype.label = '';
        ___self.prototype.condition = '';
        return ___self;
    })();
    module.exports = Path;
});
module('src/definition_parser.adria', function(module, resource) {
    var XRegExp, util, Parser, Tokenizer, Path, DefinitionParser;
    XRegExp = __require('src/xregexp.adria');
    util = __require('src/util.adria');
    Parser = __require('src/parser.adria');
    Tokenizer = __require('src/tokenizer.adria');
    Path = __require('src/definition_parser/path.adria');
    DefinitionParser = (function(___parent) {
        var ___self = function DefinitionParser() {
            Parser.prototype.constructor.call(this);
            this.tokenizer = new Tokenizer([
                Tokenizer.prefab.delimited(null, '/*', '*/'),
                Tokenizer.prefab.regex(null, /^\/\/.*/),
                Tokenizer.prefab.breaker(),
                Tokenizer.prefab.regex('WORD', /^[a-z_]+/i),
                Tokenizer.prefab.set('DELIM', [ '->', '.', ':', '[', ']', '{', '}', '?' ]),
                Tokenizer.prefab.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/),
                Tokenizer.prefab.number('NUMERIC')
            ]);
            this.trainSelf();
            this.pathBlocks = {  };
            this.currentPath = new Path();
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
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
            var results, id, result;
            results = Parser.prototype.parse.call(this, source);
            for (id in results) {
                result = results[id];
                if (result.node.capture != '') {
                    this.capture(result.node.capture, result.token.data);
                }
            }
            return results;
        };
        ___self.prototype.trainOther = function trainOther(parser) {
            var parts, block_name, block_paths, node_map, node_pair, id, path, i, part, hash, node;
            parts = [ 'source', 'target' ];
            for (block_name in this.pathBlocks) {
                block_paths = this.pathBlocks[block_name];
                node_map = {  };
                node_pair = [  ];
                for (id in block_paths) {
                    path = block_paths[id];
                    for (i in parts) {
                        part = parts[i];
                        hash = path[part].name + ':' + path[part].capture + ':' + path[part].label;
                        node_pair[i] = node_map[hash];
                        if (node_pair[i] === undefined) {
                            node = parser.createNode(path[part].name, path[part].capture, path[part].label, path[part].condition);
                            node_map[hash] = node;
                            node_pair[i] = node;
                        }
                    }
                    parser.integrateNodePair(node_pair, block_name);
                }
            }
        };
        ___self.prototype.trainSelf = function trainSelf() {
            var Type, block_root, blockname, body, node1a, node1b, node1c, node1d, node1e, node1f, node1g, node1h, path1a, node2a, node2b, node2c, node2d, node2e, node2f, node2g, node2h, bodyend, exit;
            Type = this.tokenizer.Type;
            block_root = new Parser.Definition.Node();
            this.definition.createBlock(null, block_root);
            blockname = block_root.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'block_name');
            body = blockname.createAndAdd(Type.DELIM, '{', '', '{');
            node1a = body.createAndAdd(Type.WORD | Type.STRING, XRegExp('.+', 's'), 'source_name');
            node1b = node1a.createAndAdd(Type.DELIM, ':', '', ':');
            node1c = node1b.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'source_capture');
            node1d = node1c.createAndAdd(Type.DELIM, '[', '', '[');
            node1e = node1d.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'source_label');
            node1f = node1e.createAndAdd(Type.DELIM, ']', '', ']');
            node1g = node1f.createAndAdd(Type.DELIM, '?', '', '?');
            node1h = node1g.createAndAdd(Type.STRING, XRegExp('.+', 's'), 'source_condition');
            node1a.add(node1d);
            node1a.add(node1g);
            node1c.add(node1g);
            path1a = node1a.createAndAdd(Type.DELIM, '->', 'path', '->');
            node1h.add(path1a);
            node1f.add(path1a);
            node1c.add(path1a);
            node2a = path1a.createAndAdd(Type.WORD | Type.STRING, XRegExp('.+', 's'), 'target_name');
            node2b = node2a.createAndAdd(Type.DELIM, ':', '', ':');
            node2c = node2b.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'target_capture');
            node2d = node2c.createAndAdd(Type.DELIM, '[', '', '[');
            node2e = node2d.createAndAdd(Type.WORD, XRegExp('.+', 's'), 'target_label');
            node2f = node2e.createAndAdd(Type.DELIM, ']', '', ']');
            node2g = node2f.createAndAdd(Type.DELIM, '?', '', '?');
            node2h = node2g.createAndAdd(Type.STRING, XRegExp('.+', 's'), 'target_condition');
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
module('src/language_parser/capture_node.adria', function(module, resource) {
    var SourceNode, Template, CaptureNode, stackDiff;
    SourceNode = require('source-map').SourceNode;
    Template = __require('src/template.adria');
    CaptureNode = (function() {
        var ___self = function CaptureNode(key, value) {
            this.key = key;
            this.value = value;
        };
        ___self.prototype.parent = null;
        ___self.prototype.children = null;
        ___self.prototype.key = '';
        ___self.prototype.value = '';
        ___self.prototype.tpl = null;
        ___self.prototype.row = 0;
        ___self.prototype.col = 0;
        ___self.prototype.toJSON = function toJSON() {
            var children, id;
            children = [  ];
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
            var Type, result, jsonChildren, resultChildren, id;
            Type = typeMapper(null, json._);
            result = new Type(json.k, json.v);
            result.parent = parentNode;
            result.tpl = json.t;
            result.row = json.r;
            result.col = json.c;
            result.children = [  ];
            jsonChildren = json.s;
            resultChildren = result.children;
            for (id in jsonChildren) {
                resultChildren.push(CaptureNode.prototype.fromJSON(jsonChildren[id], result, typeMapper));
            }
            return result;
        };
        ___self.prototype.fromResults = function fromResults(results, typeMapper) {
            var root, current, lastStack, result, stack, diff, node, resultId, nodeId, match;
            root = new CaptureNode();
            current = root;
            lastStack = [  ];
            for (resultId in results) {
                result = results[resultId];
                stack = result.stack;
                diff = stackDiff(stack, lastStack, result.minStack);
                while (diff.ascend--) {
                    current = current.parent;
                }
                for (nodeId in diff.create) {
                    node = diff.create[nodeId];
                    current = current.addNew(node.capture, node.name, typeMapper(node.capture, node.name));
                    current.row = result.token.pos.row;
                    current.col = result.token.pos.col;
                }
                node = result.node;
                if (node.capture !== '') {
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
        ___self.prototype.ancestor = function ancestor(key, value) {
            var current;
            current = this;
            key = (typeof key !== 'string' ? null : key.split('|'));
            value = (typeof value !== 'string' ? null : value.split('|'));
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
                return null;
            }
        };
        ___self.prototype.parser = function parser() {
            var current;
            current = this;
            while (current.parent !== null && (current.parent instanceof CaptureNode.LanguageParser === false)) {
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
            var id, child;
            index = (index === undefined ? 0 : index);
            dummy = (dummy === undefined ? this.dummy : null);
            if (this.children instanceof Array) {
                for (id in this.children) {
                    child = this.children[id];
                    if (child.key == key && index-- == 0) {
                        return child;
                    }
                }
            }
            return dummy;
        };
        ___self.prototype.path = function path(path, dummy) {
            var step, current, id;
            current = this;
            dummy = (dummy === undefined ? this.dummy : null);
            path = path.split('.');
            for (id in path) {
                step = path[id].split('[');
                if (step.length === 1) {
                    current = current.get(step[0]);
                } else {
                    current = current.get(step[0], parseInt(step[1].slice(0, -1)));
                }
                if (current === null) {
                    return dummy;
                }
            }
            return current;
        };
        ___self.prototype.addNew = function addNew(key, value, Type) {
            var child;
            child = new Type(key, value);
            child.parent = this;
            return this.add(child);
        };
        ___self.prototype.extract = function extract(from, to) {
            return this.children.splice(from, to - from + 1);
        };
        ___self.prototype.nest = function nest(from, to, Constructor) {
            Constructor = (Constructor !== undefined ? Constructor : (this.constructor));
            var node, id, child;
            node = new Constructor(this.key, this.value);
            node.children = this.children.splice(from, to - from + 1, node);
            node.parent = this;
            node.tpl = this.tpl;
            node.row = node.children[0].row;
            node.col = node.children[0].col;
            for (id in node.children) {
                child = node.children[id];
                child.parent = node;
            }
        };
        ___self.prototype.nl = function nl(indent) {
            var parser;
            indent = (indent === undefined ? 0 : indent);
            parser = this.parser();
            parser.indent += indent;
            return '\n' + String.repeat(parser.indent * 4, ' ');
        };
        ___self.prototype.csn = function csn(code) {
            return new SourceNode(this.row, this.col - 1, this.parser().file, code);
        };
        ___self.prototype.toString = function toString() {
            var result, id;
            result = '';
            if (this.children instanceof Array) {
                for (id in this.children) {
                    result += this.children[id].toString();
                }
            }
            return result;
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, id;
            result = new SourceNode(null, null);
            if (this.children instanceof Array) {
                for (id in this.children) {
                    result.add(this.children[id].toSourceNode());
                }
            }
            return result;
        };
        ___self.prototype.scan = function scan(state) {
            var id, child;
            if (this.children instanceof Array) {
                for (id in this.children) {
                    child = this.children[id];
                    child.scan(state);
                }
            }
        };
        ___self.prototype.preprocess = function preprocess(state) {
            var id, child;
            if (this.children instanceof Array) {
                for (id in this.children) {
                    child = this.children[id];
                    child.preprocess(state);
                }
            }
        };
        ___self.prototype.each = function each(fn) {
            var children, last, id;
            children = this.children;
            if (children instanceof Array) {
                last = children.length - 1;
                for (id in children) {
                    fn.call(this, children[id], +id === 0, +id === last);
                }
            }
        };
        ___self.prototype.eachKey = function eachKey(key, fn) {
            var part, children, len, prevChild, first, id, child;
            part = key.split('.');
            if (this.children instanceof Array) {
                children = this.children;
                len = children.length;
                prevChild = null;
                first = true;
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
            this.tplFile = fileName;
        };
        ___self.prototype.processTemplate = function processTemplate() {
            return this.tpl.fetchFile(this.tplFile);
        };
        ___self.prototype.assign = function assign(uri, value) {
            this.tpl.assign(uri, value);
        };
        return ___self;
    })();
    CaptureNode.prototype.dummy = new CaptureNode('', '');
    CaptureNode.prototype.dummy.row = -1;
    CaptureNode.prototype.dummy.col = -1;
    stackDiff = function stackDiff(stack, lastStack, minStackLen) {
        var deepestCommonCapture, minLen, i, numCaptures, lastLen, captures, len;
        deepestCommonCapture = -1;
        minLen = Math.min(stack.length, lastStack.length, minStackLen);
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
        for (i = deepestCommonCapture + 1; i < lastLen;i++) {
            if (lastStack[i].node.capture !== '') {
                numCaptures++;
            }
        }
        captures = [  ];
        len = stack.length;
        for (i = deepestCommonCapture + 1; i < len;i++) {
            if (stack[i].node.capture !== '') {
                captures.push(stack[i].node);
            }
        }
        return { ascend: numCaptures, create: captures };
    };
    module.exports = CaptureNode;
});
module('src/language_parser.adria', function(module, resource) {
    var fs, XRegExp, util, Parser, DefinitionParser, CaptureNode, LanguageParser;
    fs = require('fs');
    XRegExp = __require('src/xregexp.adria');
    util = __require('src/util.adria');
    Parser = __require('src/parser.adria');
    DefinitionParser = __require('src/definition_parser.adria');
    CaptureNode = __require('src/language_parser/capture_node.adria');
    LanguageParser = (function(___parent) {
        var ___self = function LanguageParser(transform) {
            Parser.prototype.constructor.call(this, transform);
            this.transform = transform;
            this.resultData = {  };
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.trainer = null;
        ___self.prototype.sourceCode = null;
        ___self.prototype.captureTree = null;
        ___self.prototype.resultData = null;
        ___self.prototype.cacheData = null;
        ___self.prototype.outputMethod = 'toSourceNode';
        ___self.prototype.clone = function clone() {
            var parser;
            parser = Parser.prototype.clone.call(this);
            parser.transform = this.transform;
            parser.source = this.source;
            return parser;
        };
        ___self.prototype.trainSelf = function trainSelf() {
            this.definition = new Parser.Definition();
            this.trainer.trainOther(this);
            this.trainer = null;
        };
        ___self.prototype.setDefinition = function setDefinition(data, filename) {
            util.log('LanguageParser', 'setting definition file ' + filename);
            if (this.trainer == null) {
                this.trainer = new DefinitionParser();
            }
            util.log('LanguageParser', 'processing definition', 2);
            this.trainer.file = filename;
            this.trainer.parse(data);
            util.log('LanguageParser', 'done', -2);
        };
        ___self.prototype.loadDefinition = function loadDefinition(filename) {
            var fileContents;
            util.log('LanguageParser', 'loading definition file ' + filename);
            fileContents = fs.readFileSync(filename, 'UTF-8');
            this.setDefinition(fileContents, filename);
        };
        ___self.prototype.mapType = function mapType(capture_name, block_name) {
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
                    node.match = name;
                    node.tokenType = -1;
                    node.type = (name == 'entry' ? Node.Type.BLOCK : Node.Type.RETURN);
                    node.description = name;
                    break ;
                case 'string':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.STRING;
                    node.type = 0;
                    node.description = 'string';
                    break ;
                case 'numeric':
                    node.match = '';
                    node.tokenType = this.tokenizer.Type.NUMERIC;
                    node.type = 0;
                    node.description = 'numerical';
                    break ;
                default:
                    numChars = name.length;
                    if (name[0] == '\"') {
                        node.match = XRegExp('^' + XRegExp.escape(name.slice(1, numChars - 1)) + '$', 's');
                        node.tokenType = -1;
                        node.type = 0;
                        node.description = name.slice(1, numChars - 1);
                    } else if (name[0] == '\'') {
                        node.match = XRegExp(name.slice(1, numChars - 1), 's');
                        node.tokenType = -1;
                        node.type = 0;
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
                this.definition.createBlock(blockName, pair[0]);
            }
        };
        ___self.prototype.setSource = function setSource(filename, data) {
            var captures;
            this.captureTree = null;
            this.file = filename;
            this.sourceCode = data.replace('\r\n', '\n');
            util.log('LanguageParser', 'processing source ' + filename, 2);
            captures = this.parse(this.sourceCode);
            util.log('LanguageParser', 'done', -2);
            this.captureTree = CaptureNode.prototype.fromResults(captures, this.mapType.bind(this));
            this.captureTree.parent = this;
        };
        ___self.prototype.loadSourceFromCache = function loadSourceFromCache(filename) {
            this.cacheData = this.transform.cache.fetch(filename, [ 'base' ]);
            if (this.cacheData !== null) {
                this.file = filename;
                this.captureTree = CaptureNode.prototype.fromJSON(this.cacheData['base'], this, this.mapType.bind(this));
            }
        };
        ___self.prototype.loadSource = function loadSource(filename) {
            if (this.transform.options['no-cache'] !== true && this.cacheData === null) {
                this.loadSourceFromCache(filename);
            }
            if (this.cacheData === null) {
                this.setSource(filename, fs.readFileSync(filename, 'UTF-8'));
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
            if (this.transform.options['no-cache'] !== true && this.cacheData === null && fs.existsSync(this.file)) {
                this.transform.cache.insert(this.file, { base: this.captureTree.toJSON() });
            }
            return result;
        };
        return ___self;
    })(Parser);
    CaptureNode.LanguageParser = LanguageParser;
    LanguageParser.CaptureNode = CaptureNode;
    module.exports = LanguageParser;
});
module('src/targets/adria_node.adria', function(module, resource) {
    var path, SourceNode, LanguageParser, CaptureNode, Transform, util, Set, AdriaNode, AccessOperationProtocall, ConstLiteral, Scope, Module, InvokeOperation, AsyncWrapOperation, FunctionLiteral, GeneratorLiteral, FunctionStatement, GeneratorStatement, AsyncLiteral, AsyncStatement, FunctionParamList, BaseLiteral, DoWhileStatement, WhileStatement, IfStatement, SwitchStatement, ForCountStatement, ForInStatement, ObjectLiteral, ProtoBodyProperty, ArrayLiteral, Expression, ProtoLiteral, ProtoStatement, NewProtoLiteral, ProtoBodyItem, ReturnStatement, FlowStatement, YieldLiteral, catchSpecificsId, CatchSpecifics, CatchAll, TryCatchFinallyStatement, ThrowStatement, AssertStatement, Statement, InterruptibleStatement, ResourceLiteral, RequireLiteral, ModuleStatement, ExportStatement, GlobalDef, ParentLiteral, Ident, Name, VarDef, ImportStatement;
    path = require('path');
    SourceNode = require('source-map').SourceNode;
    LanguageParser = __require('src/language_parser.adria');
    CaptureNode = LanguageParser.CaptureNode;
    Transform = __require('src/transform.adria');
    util = __require('src/util.adria');
    Set = util.Set;
    AdriaNode = (function(___parent) {
        var ___self = function AdriaNode() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.validIdentifier = {
            common: new Set([
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
                'Async'
            ]),
            node: new Set([ 'process' ]),
            web: new Set([ 'window', 'document', 'performance' ])
        };
        ___self.prototype.findScope = function findScope() {
            return this.ancestor(null, 'scope|module');
        };
        ___self.prototype.checkDefined = function checkDefined(name) {
            var scope, paramNode;
            if (this.validIdentifier.common.has(name) || this.validIdentifier.node.has(name)) {
                return ;
            }
            scope = this;
            do {
                if (scope instanceof Scope !== true) {
                    continue ;
                }
                if (scope.locals.has(name)) {
                    return ;
                }
                if (scope instanceof Scope && scope.implicits.has(name)) {
                    return ;
                }
                if (scope instanceof Module && (scope.exports.has(name) || scope.moduleExport === name)) {
                    return ;
                }
            } while ((scope = scope.findScope()) !== null);
            if (this.parser().transform.globals.has(name)) {
                return ;
            }
            paramNode = this.ancestor(null, 'function_param_list');
            if (paramNode !== null) {
                scope = paramNode.parent.get('body');
                scope.checkDefined(name);
                return ;
            }
            throw new Error('Undefined variable "' + name + '" in ' + this.parser().file + ' line ' + this.row + ', column ' + this.col);
            return false;
        };
        ___self.prototype.addParentLookup = function addParentLookup(result, lookupName, ownName) {
            ownName = (ownName !== undefined ? ownName : (lookupName));
            result.add('var __p, __p0 = __p = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));' + this.nl());
            result.add('while (__p !== null && (__p.' + lookupName + ' !== ' + ownName + ' || __p.hasOwnProperty(\'' + lookupName + '\') === false)) {' + this.nl(1));
            result.add('__p = Object.getPrototypeOf(__p);' + this.nl(-1));
            result.add('}' + this.nl());
            result.add('__p = (__p !== null ? Object.getPrototypeOf(__p).constructor : __p0);' + this.nl());
        };
        ___self.prototype.findName = function findName() {
            var result, nameNode;
            result = null;
            nameNode = this.get('name');
            if (nameNode.isNode() === false) {
                nameNode = this.ancestor(null, 'module_statement|export_statement|expression|dec_def|proto_body_item');
                if (nameNode !== null) {
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
            var children, found, result, id, child;
            children = this.children;
            found = -1;
            result = null;
            for (id = 0; id < children.length;id++) {
                if (children[id].key === 'assignment_op') {
                    found = id - 1;
                    break ;
                }
            }
            if (found !== -1) {
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
        ___self.prototype.isRelativePath = function isRelativePath(filename) {
            return filename.slice(0, 2) === './' || filename.slice(0, 3) === '../';
        };
        ___self.prototype.makeBaseRelative = function makeBaseRelative(filename) {
            var parser, absName;
            parser = this.parser();
            absName = path.dirname(parser.file) + '/' + filename;
            return path.relative(parser.transform.options.basePath, absName);
        };
        return ___self;
    })(CaptureNode);
    AccessOperationProtocall = (function(___parent) {
        var ___self = function AccessOperationProtocall() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
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
    })(AdriaNode);
    ConstLiteral = (function(___parent) {
        var ___self = function ConstLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
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
    })(AdriaNode);
    Scope = (function(___parent) {
        var ___self = function Scope(key, value) {
            this.locals = new Set();
            this.implicits = new Set();
            AdriaNode.prototype.constructor.call(this, key, value);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.locals = null;
        ___self.prototype.implicits = null;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var content, result;
            content = AdriaNode.prototype.toSourceNode.call(this);
            result = this.csn();
            if (this.locals.length > 0) {
                result.add([ 'var ', this.locals.toArray().join(', '), ';' + this.nl() ]);
            }
            result.add(content);
            return result;
        };
        return ___self;
    })(AdriaNode);
    Module = (function(___parent) {
        var ___self = function Module(key, value) {
            this.exports = new Set();
            Scope.prototype.constructor.call(this, key, value);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.moduleExport = null;
        ___self.prototype.exports = null;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var parser, code, exports, file, result, id;
            parser = this.parser();
            if (parser.transform.options['no-framework'] === false) {
                this.nl(1);
            }
            code = Scope.prototype.toSourceNode.call(this);
            exports = this.exports.toArray();
            file = parser.file;
            if (parser.transform.options['no-framework'] === false) {
                result = this.csn('module(\'' + parser.moduleName + '\', function(module, resource) {' + this.nl());
                if (parser.transform.options['tweak-exports']) {
                    result.add('var exports = module.exports;' + this.nl());
                }
                result.add(code);
                if (parser.transform.options['no-framework'] === false) {
                    if (this.moduleExport !== null) {
                        result.add('module.exports = ' + this.moduleExport + ';' + this.nl());
                    }
                    for (id in exports) {
                        result.add('module.exports.' + exports[id] + ' = ' + exports[id] + ';' + this.nl());
                    }
                    result.add(this.nl(-1) + '});' + this.nl());
                }
            } else {
                result = this.csn(code);
            }
            return result;
        };
        return ___self;
    })(Scope);
    InvokeOperation = (function(___parent) {
        var ___self = function InvokeOperation() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            result.add('(');
            this.params = [  ];
            this.each(function(node, first) {
                if (first === false) {
                    result.add(', ');
                }
                result.add(node.toSourceNode());
            });
            result.add(')');
            return result;
        };
        return ___self;
    })(AdriaNode);
    AsyncWrapOperation = (function(___parent) {
        var ___self = function AsyncWrapOperation() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
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
    })(AdriaNode);
    FunctionLiteral = (function(___parent) {
        var ___self = function FunctionLiteral(key, value) {
            this.defaultArgs = [  ];
            AdriaNode.prototype.constructor.call(this, key, value);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.defaultArgs = null;
        ___self.prototype.name = null;
        ___self.prototype.lookupParent = false;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, id, body;
            this.nl(1);
            result = this.csn();
            result.add('function');
            if (this instanceof GeneratorLiteral || this instanceof AsyncLiteral) {
                result.add('*');
            }
            this.name = this.findName();
            if (this.name !== null) {
                this.get('body').implicits.add(this.name);
                result.add([ ' ', this.name ]);
            }
            if (this instanceof FunctionStatement || this instanceof GeneratorStatement) {
                this.findScope().implicits.add(this.name);
            }
            result.add('(');
            result.add(this.get('param_list').toSourceNode());
            result.add(') {' + this.nl());
            for (id in this.defaultArgs) {
                result.add([ this.defaultArgs[id], ';' + this.nl() ]);
            }
            body = this.get('body').toSourceNode();
            if (this.lookupParent) {
                this.addParentLookup(result, this.name);
            }
            result.add([ body, this.nl(-1) + '}' ]);
            return result;
        };
        return ___self;
    })(AdriaNode);
    GeneratorLiteral = (function(___parent) {
        var ___self = function GeneratorLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        return ___self;
    })(FunctionLiteral);
    FunctionStatement = (function(___parent) {
        var ___self = function FunctionStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        return ___self;
    })(FunctionLiteral);
    GeneratorStatement = (function(___parent) {
        var ___self = function GeneratorStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        return ___self;
    })(GeneratorLiteral);
    AsyncLiteral = (function(___parent) {
        var ___self = function AsyncLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            result.add('(function() {' + this.nl(1));
            result.add([
                'var ___self = ',
                FunctionLiteral.prototype.toSourceNode.call(this),
                ';',
                this.nl()
            ]);
            result.add([
                'return function(',
                this.get('param_list').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            result.add('return new Async(___self.apply(this, arguments));' + this.nl(-1));
            result.add('};' + this.nl(-1));
            result.add('})()');
            return result;
        };
        return ___self;
    })(FunctionLiteral);
    AsyncStatement = (function(___parent) {
        var ___self = function AsyncStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        return ___self;
    })(AsyncLiteral);
    FunctionParamList = (function(___parent) {
        var ___self = function FunctionParamList() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var name, defaultArg, valueNode, result, functionNode, scope;
            result = this.csn();
            functionNode = this.ancestor('function|generator|async');
            scope = functionNode.get('body');
            this.eachKey('item', function(node) {
                name = node.get('name').toSourceNode();
                result.add(name);
                scope.implicits.add(name);
                valueNode = node.get('value');
                if (valueNode.isNode()) {
                    defaultArg = new SourceNode();
                    defaultArg.add([
                        name,
                        ' = (',
                        name,
                        ' !== undefined ? ',
                        name,
                        ' : (',
                        valueNode.toSourceNode(),
                        '))'
                    ]);
                    functionNode.defaultArgs.push(defaultArg);
                }
            });
            return result.join(', ');
        };
        return ___self;
    })(AdriaNode);
    BaseLiteral = (function(___parent) {
        var ___self = function BaseLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.scan = function scan(state) {
            AdriaNode.prototype.scan.call(this, state);
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
    })(AdriaNode);
    DoWhileStatement = (function(___parent) {
        var ___self = function DoWhileStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            result.add('do {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            result.add([ ' while (', this.get('condition').toSourceNode(), ');' ]);
            return result;
        };
        return ___self;
    })(AdriaNode);
    WhileStatement = (function(___parent) {
        var ___self = function WhileStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            result.add([
                'while (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            return result;
        };
        return ___self;
    })(AdriaNode);
    IfStatement = (function(___parent) {
        var ___self = function IfStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, elseIf, elseBody;
            result = this.csn();
            result.add([
                'if (',
                this.get('condition').toSourceNode(),
                ') {' + this.nl(1)
            ]);
            result.add([ this.get('if_body').toSourceNode(), this.nl(-1) + '}' ]);
            elseIf = this.get('else_if');
            if (elseIf.isNode()) {
                result.add([ ' else ', elseIf.toSourceNode() ]);
            } else {
                elseBody = this.get('else_body');
                if (elseBody.isNode()) {
                    result.add([
                        ' else {' + this.nl(1),
                        elseBody.toSourceNode(),
                        this.nl(-1) + '}'
                    ]);
                }
            }
            return result;
        };
        return ___self;
    })(AdriaNode);
    SwitchStatement = (function(___parent) {
        var ___self = function SwitchStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, defaultNode;
            result = this.csn();
            result.add([ 'switch (', this.get('value').toSourceNode(), ') {', this.nl(1) ]);
            this.eachKey('case', function(caseNode) {
                result.add([ 'case ', caseNode.get('match').toSourceNode(), ':' + this.nl(1) ]);
                result.add(caseNode.get('body').toSourceNode());
                result.add(this.nl(-1));
            });
            defaultNode = this.get('default');
            if (defaultNode.isNode()) {
                result.add('default:' + this.nl(1));
                result.add(defaultNode.get('body').toSourceNode());
                result.add(this.nl(-1));
            }
            result.add(this.nl(-1) + '}');
            return result;
        };
        return ___self;
    })(AdriaNode);
    ForCountStatement = (function(___parent) {
        var ___self = function ForCountStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var initNode, init, varDefs, test, condOp, result;
            initNode = this.get('init');
            if (initNode.value === 'var_def') {
                varDefs = this.csn();
                initNode.eachKey('item', function(node) {
                    var valueNode, nameNode, varDef;
                    valueNode = node.get('value');
                    nameNode = node.get('name');
                    this.findScope().locals.add(nameNode.value);
                    if (valueNode.isNode()) {
                        varDef = new SourceNode();
                        varDef.add([ nameNode.toSourceNode(), ' = ', valueNode.toSourceNode() ]);
                        varDefs.add(varDef);
                    } else {
                        varDefs.add(nameNode.toSourceNode);
                    }
                });
                init = new SourceNode();
                init.add([ varDefs.join(', ') ]);
            } else {
                init = initNode.toSourceNode();
            }
            test = this.get('test').toSourceNode();
            condOp = this.get('cond_op').toSourceNode();
            result = this.csn();
            result.add([ 'for (', init, '; ', test, ';', condOp, ') {' + this.nl(1) ]);
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            return result;
        };
        return ___self;
    })(AdriaNode);
    ForInStatement = (function(___parent) {
        var ___self = function ForInStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var keyNode, valueNode, locals, source, key, result;
            keyNode = this.get('key');
            valueNode = this.get('value');
            if (this.get('var').isNode()) {
                locals = this.findScope().locals;
                locals.add(keyNode.value);
                if (valueNode.isNode()) {
                    locals.add(valueNode.value);
                }
            }
            source = this.get('source').toSourceNode();
            key = keyNode.toSourceNode();
            result = this.csn();
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
        return ___self;
    })(AdriaNode);
    ObjectLiteral = (function(___parent) {
        var ___self = function ObjectLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var items, result;
            items = new SourceNode();
            this.nl(1);
            this.each(function(child) {
                var item;
                item = new SourceNode();
                item.add(child.get('key').csn(child.get('key').value));
                item.add(': ');
                item.add(child.get('value').toSourceNode());
                items.add(item);
            });
            result = this.csn();
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
        return ___self;
    })(AdriaNode);
    ProtoBodyProperty = ObjectLiteral;
    ArrayLiteral = (function(___parent) {
        var ___self = function ArrayLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var items, result;
            items = new SourceNode();
            this.nl(1);
            this.each(function(child) {
                items.add(child.toSourceNode());
            });
            result = this.csn();
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
        return ___self;
    })(AdriaNode);
    Expression = (function(___parent) {
        var ___self = function Expression() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.wrapPrefix = new Set([ 'member', 'index', 'proto', 'call', 'pcall', 'item' ]);
        ___self.prototype.preprocess = function preprocess(state) {
            var children, id, end;
            AdriaNode.prototype.preprocess.call(this, state);
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
            AdriaNode.prototype.scan.call(this, state);
            this.eachKey('ident', function(child) {
                this.checkDefined(child.value);
            });
        };
        ___self.prototype.toSourceNode = function toSourceNode() {
            var children, propertyAssignSplit, wrapper, result, id, child, locals, params;
            children = this.children;
            propertyAssignSplit = -1;
            wrapper = this.get('wrap');
            result = this.csn();
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
                result.prepend('Object.defineProperty(');
                child = children[propertyAssignSplit - 1];
                switch (child.key) {
                    case 'member':
                        result.add(", '" + child.children[0].value + "',");
                        break ;
                    case 'index':
                        result.add(', ');
                        result.add(child.toSourceNode());
                        result.add(', ');
                        break ;
                    case 'proto':
                        result.add(".prototype, '" + child.children[0].value + "', ");
                        break ;
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
            if (wrapper.isNode()) {
                locals = '';
                params = wrapper.params.join(', ');
                for (id = 0; id < wrapper.params.length;id++) {
                    locals += '___' + id + ', ';
                }
                result = this.csn([
                    '(function(' + locals + '___callback) {',
                    this.nl(1),
                    'try { return ',
                    result,
                    '; } catch (___exc) { ___callback(___exc); }',
                    this.nl(-1),
                    '}).bind(this' + (wrapper.params.length > 0 ? ', ' + params : '') + ')'
                ]);
            }
            return result;
        };
        return ___self;
    })(AdriaNode);
    ProtoLiteral = (function(___parent) {
        var ___self = function ProtoLiteral(key, value) {
            this.constructorArgs = [  ];
            this.constructorDefaults = [  ];
            AdriaNode.prototype.constructor.call(this, key, value);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.constructorArgs = null;
        ___self.prototype.constructorBody = null;
        ___self.prototype.constructorDefaults = null;
        ___self.prototype.lookupParent = false;
        ___self.prototype.name = '';
        ___self.prototype.toSourceNode = function toSourceNode() {
            var nameSN, parentNode, haveParent, assignTo, locals, result, body, id;
            nameSN = this.findName();
            if (nameSN !== null) {
                this.name = nameSN.toString();
            }
            parentNode = this.get('parent');
            haveParent = parentNode.isNode();
            assignTo = '';
            if (this.value === 'proto_statement') {
                locals = this.findScope().locals;
                locals.add(this.name);
                assignTo = this.name + ' = ';
            }
            result = this.csn(assignTo + '(function(' + (haveParent ? '___parent' : '') + ') {' + this.nl(1));
            body = this.get('body').toSourceNode();
            if (this.constructorBody !== null) {
                result.add('var ___self = function ' + this.name + '(');
                result.add(this.constructorArgs);
                result.add(') {' + this.nl(1));
                for (id in this.constructorDefaults) {
                    result.add(this.constructorDefaults[id]);
                    result.add(';' + this.nl());
                }
                if (this.lookupParent) {
                    this.addParentLookup(result, 'constructor', '___self');
                }
                result.add(this.constructorBody);
                result.add(this.nl(-1) + '};' + this.nl() + this.nl());
            } else {
                result.add('var ___self = function ' + this.name + '() {');
                if (haveParent) {
                    result.add(this.nl(1) + '___parent.apply(this, arguments);' + this.nl(-1));
                }
                result.add('}' + this.nl() + this.nl());
            }
            if (haveParent) {
                result.add('___self.prototype = Object.create(___parent.prototype);' + this.nl());
                result.add('___self.prototype.constructor = ___self;' + this.nl() + this.nl());
            }
            result.add(body);
            result.add(this.nl() + 'return ___self;' + this.nl(-1));
            result.add('})(');
            result.add(parentNode.toSourceNode());
            result.add(')');
            if (this.value === 'proto_statement') {
                result.add(';');
            }
            return result;
        };
        return ___self;
    })(AdriaNode);
    ProtoStatement = ProtoLiteral;
    NewProtoLiteral = (function(___parent) {
        var ___self = function NewProtoLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var __p, __p0 = __p = (this === this.constructor.prototype ? this : Object.getPrototypeOf(this));
            while (__p !== null && (__p.toSourceNode !== toSourceNode || __p.hasOwnProperty('toSourceNode') === false)) {
                __p = Object.getPrototypeOf(__p);
            }
            __p = (__p !== null ? Object.getPrototypeOf(__p).constructor : __p0);
            var result, paramList;
            result = this.csn();
            result.add('new (');
            result.add(__p.prototype.toSourceNode.call(this));
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
    ProtoBodyItem = (function(___parent) {
        var ___self = function ProtoBodyItem() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var protoNode, keyNode, functionNode, valueNode, result, name;
            protoNode = this.ancestor(null, 'new_proto_literal|proto_literal|proto_statement');
            keyNode = this.get('key');
            if (keyNode.value === 'constructor') {
                functionNode = this.path('value.function');
                this.nl(1);
                protoNode.constructorArgs = functionNode.get('param_list').toSourceNode();
                protoNode.constructorDefaults = functionNode.defaultArgs;
                protoNode.constructorBody = functionNode.get('body').toSourceNode();
                protoNode.lookupParent = functionNode.lookupParent;
                this.nl(-1);
                return this.csn();
            } else {
                valueNode = this.get('value');
                if (valueNode.value === 'proto_body_property') {
                    name = (keyNode.value === 'string' ? keyNode.value : '"' + keyNode.value + '"');
                    result = this.csn('Object.defineProperty(___self.prototype, ' + name + ', ');
                    result.add(valueNode.toSourceNode());
                    result.add(');' + this.nl());
                    return result;
                } else {
                    name = (keyNode.value === 'string' ? '[' + keyNode.value + ']' : '.' + keyNode.value);
                    result = this.csn('___self.prototype' + name + ' = ');
                    result.add(valueNode.toSourceNode());
                    result.add(';' + this.nl());
                    return result;
                }
            }
        };
        return ___self;
    })(AdriaNode);
    ReturnStatement = (function(___parent) {
        var ___self = function ReturnStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, type;
            result = this.csn();
            type = this.get('type');
            result.add([ type.csn(type.value), ' ' ]);
            result.add(this.get('value').toSourceNode());
            result.add(';' + this.nl());
            return result;
        };
        return ___self;
    })(AdriaNode);
    FlowStatement = ReturnStatement;
    YieldLiteral = (function(___parent) {
        var ___self = function YieldLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, type;
            result = this.csn();
            type = this.get('type');
            result.add([ type.csn(type.value), ' ' ]);
            result.add(this.get('value').toSourceNode());
            return result;
        };
        return ___self;
    })(AdriaNode);
    catchSpecificsId = 1;
    CatchSpecifics = (function(___parent) {
        var ___self = function CatchSpecifics() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var name, result, allNode, valueNode;
            name = '___exc' + (catchSpecificsId++);
            result = this.csn();
            result.add(' catch (' + name + ') {' + this.nl(1));
            this.eachKey('specific', function(node, first, last) {
                var valueNode;
                if (first !== true) {
                    result.add(' else ');
                }
                valueNode = node.get('value');
                this.findScope().locals.add(valueNode.value);
                result.add('if (' + name + ' instanceof ');
                result.add(node.get('type').toSourceNode());
                result.add(') {' + this.nl(1));
                result.add(valueNode.value + ' = ' + name + ';' + this.nl());
                result.add(node.get('body').toSourceNode());
                result.add(this.nl(-1) + '}');
            });
            allNode = this.get('catch');
            if (allNode.isNode()) {
                valueNode = allNode.get('value');
                this.findScope().locals.add(valueNode.value);
                result.add(' else { ' + this.nl(1));
                result.add(valueNode.value + ' = ' + name + ';' + this.nl());
                result.add(allNode.get('body').toSourceNode());
                result.add(this.nl(-1) + '}');
            } else {
                result.add(' else { ' + this.nl(1));
                result.add('throw ' + name + ';' + this.nl());
                result.add(this.nl(-1) + '}');
            }
            result.add(this.nl(-1) + '}');
            return result;
        };
        return ___self;
    })(AdriaNode);
    CatchAll = (function(___parent) {
        var ___self = function CatchAll() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, valueNode;
            result = this.csn();
            valueNode = this.get('value');
            this.findScope().implicits.add(valueNode.value);
            result.add(' catch (');
            result.add(valueNode.toSourceNode());
            result.add(') {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            return result;
        };
        return ___self;
    })(AdriaNode);
    TryCatchFinallyStatement = (function(___parent) {
        var ___self = function TryCatchFinallyStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result, allNode, finallyNode;
            result = this.csn();
            result.add('try {' + this.nl(1));
            result.add(this.get('body').toSourceNode());
            result.add(this.nl(-1) + '}');
            allNode = this.get('all');
            if (allNode.isNode()) {
                result.add(allNode.toSourceNode());
            } else {
                result.add(this.get('specifics').toSourceNode());
            }
            finallyNode = this.get('finally');
            if (finallyNode.isNode()) {
                result.add('finally {' + this.nl(1));
                result.add(finallyNode.toSourceNode());
                result.add(this.nl(-1) + '}');
            }
            return result;
        };
        return ___self;
    })(AdriaNode);
    ThrowStatement = (function(___parent) {
        var ___self = function ThrowStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn('throw ');
            result.add(this.get('exception').toSourceNode());
            result.add(';' + this.nl());
            return result;
        };
        return ___self;
    })(AdriaNode);
    AssertStatement = (function(___parent) {
        var ___self = function AssertStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var result;
            result = this.csn();
            if (this.parser().transform.options.assert) {
                result.add('assert(');
                result.add(AdriaNode.prototype.toSourceNode.call(this));
                result.add(');' + this.nl());
            }
            return result;
        };
        return ___self;
    })(AdriaNode);
    Statement = (function(___parent) {
        var ___self = function Statement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var type, result;
            type = this.children[0].key;
            result = this.csn();
            result.add(AdriaNode.prototype.toSourceNode.call(this));
            switch (type) {
                case 'expression':
                    result.add(';' + this.nl());
                    break ;
                default:
                    result.add(this.nl());
            }
            return result;
        };
        return ___self;
    })(AdriaNode);
    InterruptibleStatement = Statement;
    ResourceLiteral = (function(___parent) {
        var ___self = function ResourceLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var parser, options, fileNode, fileName, result;
            parser = this.parser();
            options = parser.transform.options;
            fileNode = this.get('file');
            fileName = fileNode.toSourceNode().toString().slice(1, -1);
            fileName = this.makeBaseRelative(fileName);
            parser.resultData.resources.add(fileName);
            result = this.csn();
            result.add('resource(');
            result.add(fileNode.csn("'" + fileName + "'"));
            result.add(')');
            return result;
        };
        return ___self;
    })(AdriaNode);
    RequireLiteral = (function(___parent) {
        var ___self = function RequireLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var parser, options, fileNode, moduleName, result, requireFunction;
            parser = this.parser();
            options = parser.transform.options;
            fileNode = this.get('file');
            moduleName = fileNode.toSourceNode().toString().slice(1, -1);
            result = this.csn();
            requireFunction = 'require';
            if (options.platform === 'node' && this.isRelativePath(moduleName)) {
                moduleName = util.normalizeExtension(this.makeBaseRelative(moduleName), options.fileExt);
                parser.resultData.requires.add(moduleName);
                requireFunction = '__require';
            } else if (options.platform !== 'node') {
                moduleName = util.normalizeExtension(this.makeBaseRelative(moduleName), options.fileExt);
                parser.resultData.requires.add(moduleName);
            }
            result.add(requireFunction + '(');
            result.add(fileNode.csn("'" + moduleName + "'"));
            result.add(')');
            return result;
        };
        return ___self;
    })(AdriaNode);
    ModuleStatement = (function(___parent) {
        var ___self = function ModuleStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var name, moduleNode, result;
            name = this.get('name').value;
            moduleNode = this.ancestor(null, 'module');
            moduleNode.moduleExport = name;
            moduleNode.locals.add(name);
            result = this.csn();
            result.add(name);
            result.add(' = ');
            result.add(this.get('value').toSourceNode());
            result.add(';' + this.nl());
            return result;
        };
        return ___self;
    })(AdriaNode);
    ExportStatement = (function(___parent) {
        var ___self = function ExportStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var name, moduleNode, result;
            name = this.get('name').value;
            moduleNode = this.ancestor(null, 'module');
            moduleNode.exports.add(name);
            moduleNode.locals.add(name);
            result = this.csn();
            result.add(name);
            result.add(' = ');
            result.add(this.get('value').toSourceNode());
            result.add(';' + this.nl());
            return result;
        };
        return ___self;
    })(AdriaNode);
    GlobalDef = (function(___parent) {
        var ___self = function GlobalDef() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var valueNode, nameNode, globals, result, nl;
            globals = this.parser().resultData.globals;
            result = this.csn();
            nl = this.nl();
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
        return ___self;
    })(AdriaNode);
    ParentLiteral = (function(___parent) {
        var ___self = function ParentLiteral() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            this.ancestor('function').lookupParent = true;
            return this.csn('__p');
        };
        return ___self;
    })(AdriaNode);
    Ident = (function(___parent) {
        var ___self = function Ident() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            return this.csn(this.value);
        };
        return ___self;
    })(AdriaNode);
    Name = Ident;
    VarDef = (function(___parent) {
        var ___self = function VarDef() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var valueNode, nameNode, locals, result, nl;
            locals = this.findScope().locals;
            result = this.csn();
            nl = this.nl();
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
        return ___self;
    })(AdriaNode);
    ImportStatement = (function(___parent) {
        var ___self = function ImportStatement() {
            ___parent.apply(this, arguments);
        }
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.toSourceNode = function toSourceNode() {
            var locals;
            locals = this.findScope().locals;
            this.eachKey('item', function(node) {
                locals.add(node.value);
            });
            return this.csn();
        };
        return ___self;
    })(AdriaNode);
    module.exports = AdriaNode;
    module.exports.AccessOperationProtocall = AccessOperationProtocall;
    module.exports.ConstLiteral = ConstLiteral;
    module.exports.Scope = Scope;
    module.exports.Module = Module;
    module.exports.InvokeOperation = InvokeOperation;
    module.exports.AsyncWrapOperation = AsyncWrapOperation;
    module.exports.FunctionLiteral = FunctionLiteral;
    module.exports.GeneratorLiteral = GeneratorLiteral;
    module.exports.FunctionStatement = FunctionStatement;
    module.exports.GeneratorStatement = GeneratorStatement;
    module.exports.AsyncLiteral = AsyncLiteral;
    module.exports.AsyncStatement = AsyncStatement;
    module.exports.FunctionParamList = FunctionParamList;
    module.exports.BaseLiteral = BaseLiteral;
    module.exports.DoWhileStatement = DoWhileStatement;
    module.exports.WhileStatement = WhileStatement;
    module.exports.IfStatement = IfStatement;
    module.exports.SwitchStatement = SwitchStatement;
    module.exports.ForCountStatement = ForCountStatement;
    module.exports.ForInStatement = ForInStatement;
    module.exports.ObjectLiteral = ObjectLiteral;
    module.exports.ProtoBodyProperty = ProtoBodyProperty;
    module.exports.ArrayLiteral = ArrayLiteral;
    module.exports.Expression = Expression;
    module.exports.ProtoLiteral = ProtoLiteral;
    module.exports.ProtoStatement = ProtoStatement;
    module.exports.NewProtoLiteral = NewProtoLiteral;
    module.exports.ProtoBodyItem = ProtoBodyItem;
    module.exports.ReturnStatement = ReturnStatement;
    module.exports.FlowStatement = FlowStatement;
    module.exports.YieldLiteral = YieldLiteral;
    module.exports.CatchSpecifics = CatchSpecifics;
    module.exports.CatchAll = CatchAll;
    module.exports.TryCatchFinallyStatement = TryCatchFinallyStatement;
    module.exports.ThrowStatement = ThrowStatement;
    module.exports.AssertStatement = AssertStatement;
    module.exports.Statement = Statement;
    module.exports.InterruptibleStatement = InterruptibleStatement;
    module.exports.ResourceLiteral = ResourceLiteral;
    module.exports.RequireLiteral = RequireLiteral;
    module.exports.ModuleStatement = ModuleStatement;
    module.exports.ExportStatement = ExportStatement;
    module.exports.GlobalDef = GlobalDef;
    module.exports.ParentLiteral = ParentLiteral;
    module.exports.Ident = Ident;
    module.exports.Name = Name;
    module.exports.VarDef = VarDef;
    module.exports.ImportStatement = ImportStatement;
});
module('src/targets/adria_parser.adria', function(module, resource) {
    var fs, util, LanguageParser, AdriaNode, Tokenizer, AdriaParser;
    fs = require('fs');
    util = __require('src/util.adria');
    LanguageParser = __require('src/language_parser.adria');
    AdriaNode = __require('src/targets/adria_node.adria');
    Tokenizer = __require('src/tokenizer.adria');
    AdriaParser = (function(___parent) {
        var ___self = function AdriaParser(transform) {
            LanguageParser.prototype.constructor.call(this, transform);
            this.resultData = {
                globals: new util.Set(),
                requires: new util.Set(),
                resources: new util.Set()
            };
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.moduleName = '';
        ___self.prototype.indent = 0;
        ___self.prototype.resultData = null;
        ___self.prototype.trainSelf = function trainSelf() {
            var keywords, matchKeywords;
            keywords = new util.Set([
                'var',
                'global',
                'if',
                'else',
                'for',
                'in',
                'do',
                'while',
                'break',
                'continue',
                'switch',
                'case',
                'throw',
                'try',
                'catch',
                'finally',
                'function',
                'proto',
                'property',
                'parent',
                'yield',
                'await',
                'require',
                'assert',
                'resource',
                'delete',
                'new',
                'instanceof',
                'typeof'
            ]);
            matchKeywords = function matchKeywords(match) {
                if (keywords.has(match.data)) {
                    match.name = 'KEYWORD';
                }
                return match;
            };
            this.tokenizer = new Tokenizer([
                Tokenizer.prefab.delimited(null, '/*', '*/'),
                Tokenizer.prefab.regex(null, /^\/\/.*/),
                Tokenizer.prefab.breaker(),
                Tokenizer.prefab.regex('REGEXP', /^\/(?:(?=(\\?))\1.)*?\/[a-z]*/, /^(\(|=|==|===|\+|!=|!==|,|;|\:)$/),
                Tokenizer.prefab.set('DELIM', [ ';', '.', ',', '(', ')', '[', ']', '{', '}', '!==', '!=', '!', '++', '--', '#' ]),
                Tokenizer.prefab.group('DELIM', [ '=', '&', '|', '<', '>', ':', '?', '+', '-', '*', '/', '%' ]),
                Tokenizer.prefab.regex('IDENT', /^[a-zA-Z_\$][a-zA-Z0-9_\$]*/, null, matchKeywords),
                Tokenizer.prefab.number('NUMERIC'),
                Tokenizer.prefab.regex('STRING', /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/)
            ], [ 'KEYWORD' ]);
            util.log('AdriaParser', 'trainer processing adria .sdt-files', 2);
            this.setDefinition(resource('definition/adria/control.sdt'), 'control');
            this.setDefinition(resource('definition/adria/expression.sdt'), 'expression');
            this.setDefinition(resource('definition/adria/literal.sdt'), 'literal');
            this.setDefinition(resource('definition/adria/proto.sdt'), 'proto');
            this.setDefinition(resource('definition/adria/root.sdt'), 'root');
            this.setDefinition(resource('definition/adria/statement.sdt'), 'statement');
            util.log('AdriaParser', 'being trained', -2);
            LanguageParser.prototype.trainSelf.call(this);
            util.log('AdriaParser', 'done');
        };
        ___self.prototype.mapType = function mapType(captureName, blockName) {
            var typeName;
            typeName = blockName.snakeToCamel(true);
            if (typeof AdriaNode[typeName] === 'function') {
                return AdriaNode[typeName];
            }
            return AdriaNode;
        };
        ___self.prototype.createNode = function createNode(name, capture, label, condition) {
            var node;
            node = LanguageParser.prototype.createNode.call(this, name, capture, label, condition);
            if (name === 'ident') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT;
                node.description = 'identifier';
            } else if (name === 'name') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.IDENT | this.tokenizer.Type.KEYWORD;
                node.description = 'name';
            } else if (name === 'regexp') {
                node.match = '';
                node.type = 0;
                node.tokenType = this.tokenizer.Type.REGEXP;
                node.description = 'regexp';
            }
            return node;
        };
        ___self.prototype.loadSourceFromCache = function loadSourceFromCache(filename) {
            LanguageParser.prototype.loadSourceFromCache.call(this, filename);
            if (this.cacheData !== null && this.transform.options['no-map'] !== true) {
                this.sourceCode = fs.readFileSync(filename, 'UTF-8').replace('\r\n', '\n');
            }
        };
        return ___self;
    })(LanguageParser);
    module.exports = AdriaParser;
});
module('src/targets/adria_transform.adria', function(module, resource) {
    var fs, path, util, SourceNode, Template, Transform, AdriaParser, AdriaTransform;
    fs = require('fs');
    path = require('path');
    util = __require('src/util.adria');
    SourceNode = require('source-map').SourceNode;
    Template = __require('src/template.adria');
    Transform = __require('src/transform.adria');
    AdriaParser = __require('src/targets/adria_parser.adria');
    AdriaTransform = (function(___parent) {
        var ___self = function AdriaTransform(piped) {
            var options;
            Transform.prototype.constructor.call(this, piped);
            this.globals = new util.Set();
            this.requires = new util.Set();
            this.resources = new util.Set();
            this.requiresDone = new util.Set();
            this.modules = [  ];
            this.sourceCode = {  };
            options = this.options;
            options['no-link'] = (options['no-link'] === undefined ? false : options['no-link']);
            options['no-map'] = (options['no-map'] === undefined ? false : options['no-map']);
            options['no-framework'] = (options['no-framework'] === undefined ? false : options['no-framework']);
            options['no-blanks'] = (options['no-blanks'] === undefined ? false : options['no-blanks']);
            options['no-scan'] = (options['no-scan'] === undefined ? false : options['no-scan']);
            options.fileExt = (options.fileExt === undefined ? '.adria' : options.fileExt);
            options.platform = (options.platform === undefined ? 'web' : options.platform);
            options['tweak-exports'] = (options['tweak-exports'] === undefined ? false : options['tweak-exports']);
            options['tweak-nostrict'] = (options['tweak-nostrict'] === undefined ? false : options['tweak-nostrict']);
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.globals = null;
        ___self.prototype.requires = null;
        ___self.prototype.modules = null;
        ___self.prototype.resources = null;
        ___self.prototype.requiresDone = null;
        ___self.prototype.sourceCode = null;
        ___self.prototype.protoParser = null;
        ___self.prototype.initOptions = function initOptions() {
            Transform.prototype.initOptions.call(this, this);
            this.defineOptions({
                'file-extension': function(extension) {
                    this.fileExt = '.' + extension;
                },
                'platform': function(platform) {
                    this.platform = platform;
                }
            });
        };
        ___self.prototype.resolveModule = function resolveModule(filename) {
            var fullname, paths, current, id;
            fullname = this.options.basePath + filename;
            if (fs.existsSync(fullname) !== true) {
                paths = this.options.paths;
                current = fullname;
                for (id in paths) {
                    current = this.options.basePath + paths[id] + filename;
                    if (fs.existsSync(current)) {
                        fullname = current;
                        break ;
                    }
                }
            }
            return path.normalize(fullname);
        };
        ___self.prototype.buildModule = function buildModule(moduleName, data) {
            var parser, result, requires, name;
            parser = this.protoParser.clone();
            parser.moduleName = moduleName;
            if (data === undefined) {
                parser.loadSource(this.resolveModule(moduleName));
            } else {
                parser.setSource(moduleName, data);
            }
            parser.preprocess({  });
            result = parser.output();
            requires = parser.resultData.requires;
            this.requiresDone.add(moduleName);
            for (name in requires.data) {
                if (this.requiresDone.has(name) === false) {
                    this.buildModule(name);
                }
            }
            this.requires = this.requires.merge(parser.resultData.requires);
            this.globals = this.globals.merge(parser.resultData.globals);
            this.resources = this.resources.merge(parser.resultData.resources);
            if (this.options['no-scan'] !== true) {
                parser.scan({  });
            }
            this.modules.push({
                filename: parser.file,
                sourceCode: parser.sourceCode,
                result: result
            });
        };
        ___self.prototype.generateOutputTree = function generateOutputTree() {
            var options, node, tpl, fw, tmpNode, fileName, contents, wrapped, id, module;
            options = this.options;
            node = new SourceNode(null, null);
            tpl = new Template();
            tpl.assign('globals', this.globals.toArray());
            tpl.assign('enableAssert', options.assert);
            tpl.assign('platform', options.platform);
            if (options['no-framework'] === false) {
                node.add('(function() {\n');
            }
            if (options['tweak-nostrict'] !== true) {
                node.add('"use strict";\n');
            }
            if (options['no-framework'] === false) {
                fw = tpl.fetch(resource('templates/adria/framework.tpl'));
                tmpNode = node.add(new SourceNode(1, 0, 'adria-framework.js', fw));
                tmpNode.setSourceContent('adria-framework.js', fw);
                for (fileName in this.resources.data) {
                    contents = fs.readFileSync(options.basePath + fileName, 'UTF-8');
                    wrapped = 'resource(\'' + fileName + '\', \'' + contents.jsify("'") + '\');\n';
                    tmpNode = node.add(new SourceNode(null, null, fileName, wrapped));
                    tmpNode.setSourceContent(fileName, contents);
                }
            }
            for (id in this.modules) {
                module = this.modules[id];
                tmpNode = node.add(new SourceNode(null, null, module.filename, module.result));
                tmpNode.setSourceContent(module.filename, module.sourceCode);
            }
            if (options['no-framework'] === false) {
                node.add('\n})();');
            }
            return node;
        };
        ___self.prototype.run = function run() {
            var files, id, node, options, jsFile, mapFile, result, mapLink;
            this.protoParser = new AdriaParser(this);
            this.protoParser.trainSelf();
            if (this.piped !== undefined) {
                this.buildModule('main' + this.options.fileExt, this.piped);
            }
            files = this.options.files;
            for (id in files) {
                this.buildModule(util.normalizeExtension(files[id], this.options.fileExt));
            }
            node = this.generateOutputTree();
            options = this.options;
            if (options.outFile !== null) {
                jsFile = options.basePath + options.outFile;
                mapFile = jsFile.stripPostfix('.js') + '.map';
                if (options['no-map'] !== true) {
                    result = node.toStringWithSourceMap({ file: options.outFile });
                    mapLink = '\n//@ sourceMappingURL=' + path.relative(options.basePath, mapFile);
                    fs.writeFileSync(jsFile, result.code + (options['no-link'] ? '' : mapLink));
                    fs.writeFileSync(mapFile, result.map);
                } else {
                    result = node.toString();
                    fs.writeFileSync(jsFile, options['no-blanks'] ? this.postProcess(result) : result);
                }
            } else {
                process.stdout.write(node.toString());
            }
        };
        ___self.prototype.postProcess = function postProcess(code) {
            code = code.replace(/\n[\ \n]*\n/g, '\n');
            return code;
        };
        return ___self;
    })(Transform);
    module.exports = AdriaTransform;
});
module('src/targets/adriadebug_parser.adria', function(module, resource) {
    var AdriaParser, AdriaNode, AdriaDebugParser;
    AdriaParser = __require('src/targets/adria_parser.adria');
    AdriaNode = __require('src/targets/adria_node.adria');
    AdriaNode.prototype.toString = function toString() {
        var indent, result, childId, node;
        indent = String.repeat(this.depth() * 4, ' ');
        result = "";
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
        ___self.prototype.outputMethod = 'toString';
        return ___self;
    })(AdriaParser);
    module.exports = AdriaDebugParser;
});
module('src/targets/adriadebug_transform.adria', function(module, resource) {
    var fs, util, AdriaTransform, AdriaDebugParser, AdriaDebugTransform;
    fs = require('fs');
    util = __require('src/util.adria');
    AdriaTransform = __require('src/targets/adria_transform.adria');
    AdriaDebugParser = __require('src/targets/adriadebug_parser.adria');
    AdriaDebugTransform = (function(___parent) {
        var ___self = function AdriaDebugTransform(piped) {
            AdriaTransform.prototype.constructor.call(this, piped);
            this.options['no-cache'] = true;
            this.options['no-scan'] = true;
        };
        ___self.prototype = Object.create(___parent.prototype);
        ___self.prototype.constructor = ___self;
        ___self.prototype.run = function run() {
            var options, files, id, result, mod;
            options = this.options;
            this.protoParser = new AdriaDebugParser(this);
            this.protoParser.trainSelf();
            if (this.piped !== undefined) {
                this.buildModule('main' + options.fileExt, this.piped);
            }
            files = options.files;
            for (id in files) {
                this.buildModule(util.normalizeExtension(files[id], options.fileExt));
            }
            result = [  ];
            for (id in this.modules) {
                mod = this.modules[id];
                result.push(mod.result);
            }
            if (options['outFile'] !== null) {
                fs.writeFileSync(options.basePath + options.outFile, result.join('\n'));
            } else {
                process.stdout.write(result.join('\n'));
            }
        };
        return ___self;
    })(AdriaTransform);
    module.exports = AdriaDebugTransform;
});
module('main.adria', function(module, resource) {
    var util, AdriaTransform, AdriaDebugTransform, target, piped, debug, handle, run, pipeData;
    __require('src/prototype.adria');
    util = __require('src/util.adria');
    AdriaTransform = __require('src/targets/adria_transform.adria');
    AdriaDebugTransform = __require('src/targets/adriadebug_transform.adria');
    target = 'adria';
    piped = false;
    debug = false;
    util.processOptions(null, {
        'target': function(type) {
            target = type;
        },
        '_switch': function(param) {
            if (param === 'pipe') {
                piped = true;
            } else if (param === 'debug') {
                debug = true;
            }
        }
    });
    handle = function handle() {
        var transform;
        if (target === 'adria') {
            transform = new AdriaTransform(pipeData);
        } else if (target === 'adriadebug') {
            transform = new AdriaDebugTransform(pipeData);
        } else {
            throw new Error('Unsupported target "' + target + '".');
        }
        transform.run();
    };
    run = function run(pipeData) {
        if (debug) {
            debugger;
            handle();
        } else {
            try {
                handle();
            } catch (e) {
                console.log(e.message);
                process.exit(1);
            }
        }
    };
    if (piped) {
        pipeData = '';
        process.stdin.on('data', function(data) {
            pipeData += data.toString();
        });
        process.stdin.on('end', function() {
            run(pipeData);
        });
        process.stdin.resume();
    } else {
        run();
    }
});
})();