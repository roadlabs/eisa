//:module: compiler
//	:author:		infinte (aka. be5invis)
//	:info:			The code generator for Eisa Runtime

NECESSARIA_module.declare("lfc/compiler", ['eisa.rt', 'lfc/compiler.rt', 'lfc/parser'], function (require, exports) {
	var TO_ENCCD = function (name) {
		return name.replace(/[^a-zA-Z0-9_]/g, function (m) {
			return '$' + m.charCodeAt(0).toString(36) + '$'
		});
	};

	var eisa = require('eisa.rt');
	var lfcrt = require('lfc/compiler.rt');
	var nt = lfcrt.NodeType;
	var ScopedScript = lfcrt.ScopedScript;

	var EISA_UNIQ = eisa.runtime.UNIQ;
	var OWNS = eisa.runtime.OWNS;

	var config;

	var C_NAME,
		C_LABELNAME,
		T_THIS,
		T_ARGN,
		T_ARGS,
		BEFORE_BLOCK,
		AFTER_BLOCK,
		JOIN_STMTS,
		THIS_BIND,
		ARGS_BIND,
		ARGN_BIND,
		C_TEMP,
		BIND_TEMP,
		INDENT,
		currentBlock;

	var $ = function(template, items_){
		var a = arguments;
		return template.replace(/%(\d+)/g, function(m, $1){
			return a[parseInt($1, 10)] || '';
		});
	};

	var SEQ = function(a, b){ return '(' + a + ',' + b + ')' }
	var STRIZE = function(){
		var CTRLCHR = function (c) {
			var n = c.charCodeAt(0);
			return '\\x' + (n > 15 ? n.toString(16) : '0' + n.toString(16));
		};
		return function (s) {
			return '"' + (s || '')
				.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
				.replace(/[\x00-\x1f\x7f]/g, CTRLCHR)
				.replace(/<\/(script)>/ig, '<\x2f$1\x3e') + '"';
		};
	}();
	var GETV = function (node, env) { return C_NAME(node.name) };
	var SETV = function (node, val, env) { return '(' + C_NAME(node.name) + '=' + val + ')' };
	var SPECIALNAMES = {
		"break":1, "continue":1, "do":1, "for":1, "import":1, 
		"new":1, "this":1, "void":1, "case":1, 
		"default":1, "else":1, "function":1, "in":1, 
		"return":1, "typeof":1, "while":1, "comment":1, 
		"delete":1, "export":1, "if":1, "label":1, 
		"switch":1, "var":1, "with":1, "abstract":1, 
		"implements":1, "protected":1, "boolean":1, "instanceof":1, 
		"public":1, "byte":1, "int":1, "short":1, 
		"char":1, "interface":1, "static":1, "double":1, 
		"long":1, "synchronized":1, "false":1, "native":1, 
		"throws":1, "final":1, "null":1, "transient":1, 
		"float":1, "package":1, "true":1, "goto":1, 
		"private":1, "catch":1, "enum":1, "throw":1, 
		"class":1, "extends":1, "try":1, "const":1, 
		"finally":1, "debugger":1, "super":1
	};
	var IDENTIFIER_Q = /^[a-zA-Z$][\w$]*$/;
	var PART = function(left, right){
		if (!IDENTIFIER_Q.test(right) || SPECIALNAMES[right] === 1)
			return left + '[' + STRIZE(right) + ']';
		else 
			return left + '.' + right;
	};



	var listTemp = function(scope){
		var l = []
		for(var each in scope.usedTemps)
			if(scope.usedTemps[each] === 1)
				l.push(each);
		return l;
	};
	var listParTemp = function(scope){
		var l = []
		for(var each in scope.usedTemps)
			if(scope.usedTemps[each] === 2)
				l.push(each);
		return l;
	};

	"Common Functions";
	var compileFunctionBody = function (tree, hook_enter, hook_exit, scopes) {
		if (tree.transformed) return tree.transformed;
		if (tree.oProto) return compileOProto(tree, hook_enter, hook_exit, scopes);
		env = tree;
		g_envs = scopes;
		var s;
		s = transform(tree.code);
		var locals = EISA_UNIQ(tree.locals),
			vars = [],
			temps = listTemp(tree);

		for (var i = 0; i < locals.length; i++)
			if (!(tree.varIsArg[locals[i]])){
				if(tree.initHooks[locals[i]] && tree.initHooks[locals[i]].type)
					vars.push(C_NAME(locals[i]) + '=' + transform(tree.initHooks[locals[i]]))
				else
				vars.push(C_NAME(locals[i]));
			}
		for (var i = 0; i < temps.length; i++)
			temps[i] = BIND_TEMP(tree, temps[i]);

		s = JOIN_STMTS([
				THIS_BIND(tree),
				hook_enter || '',
				ARGS_BIND(tree),
				ARGN_BIND(tree),
				(temps.length ? 'var ' + temps.join(', '): ''),
				(vars.length ? 'var ' + vars.join(',\n    ') : ''),
				s.replace(/^    /gm, ''),
				hook_exit || '']);

		var pars = tree.parameters.names.slice(0), temppars = listParTemp(tree);
		for (var i = 0; i < pars.length; i++)
			pars[i] = C_NAME(pars[i])
		for (var i = 0; i < temppars.length; i++)
			temppars[i] = C_TEMP(temppars[i])
		s = $('(function(%1){%2})',  pars.concat(temppars).join(','), s);
	
		tree.transformed = s;
		return s;
	};

	"Obstructive Protos";
	var compileOProto = function(tree, hook_enter, hook_exit, scopes){
		if(tree.transformed) return tree.transformed;
		var backupenv = env;
		env = tree;
		g_envs = scopes;
		
		var s = transformOProto(tree);

		ScopedScript.useTemp(tree, 'PROGRESS');
		ScopedScript.useTemp(tree, 'SCHEMATA', ScopedScript.SPECIALTEMP);
		ScopedScript.useTemp(tree, 'EOF');
		ScopedScript.useTemp(tree, 'COROFUN');
		ScopedScript.useTemp(tree, 'COEXCEPTION', ScopedScript.SPECIALTEMP);


		var locals = EISA_UNIQ(tree.locals),
			vars = [],
			temps = listTemp(tree);
		for (var i = 0; i < locals.length; i++)
			if (!(tree.varIsArg[locals[i]])){
				if(tree.initHooks[locals[i]] && tree.initHooks[locals[i]].type)
					vars.push(C_NAME(locals[i]) + '=' + transform(tree.initHooks[locals[i]]))
				else
				vars.push(C_NAME(locals[i]));
			}
		for (var i = 0; i < temps.length; i++)
			temps[i] = BIND_TEMP(tree, temps[i]);

		var pars = tree.parameters.names.slice(0), temppars = listParTemp(tree);
		for (var i = 0; i < pars.length; i++)
			pars[i] = C_NAME(pars[i])
		for (var i = 0; i < temppars.length; i++)
			temppars[i] = C_TEMP(temppars[i])

		s = $('({build:function(%1){return function(%2){%3}}})', 
				C_TEMP('SCHEMATA'),
				pars.concat(temppars).join(', '),
				JOIN_STMTS([
					THIS_BIND(tree),
					hook_enter || '',
					ARGS_BIND(tree),
					ARGN_BIND(tree),
					(temps.length ? 'var ' + temps.join(', '): ''),
					(vars.length ? 'var ' + vars.join(', ') : ''),
					C_TEMP('PROGRESS') + '=' + lInital,
					C_TEMP('EOF') + '= false',
					$('return %1 = function(){%2}',
						C_TEMP('COROFUN'),
						JOIN_STMTS([
							$('while(%1)\n%2',
								C_TEMP('PROGRESS'), 
								INDENT($('MASTERCTRL: switch(%1){%2}', C_TEMP('PROGRESS'), s)))
						])),
					hook_exit  || ''
				]));
		tree.transformed = s;
		env = backupenv;
		return s;
	};

	"Transforming Utils";
	var env, g_envs;
	var vmSchemata = [],
		schemata = function (tf, trans) {
			vmSchemata[tf] = trans;
		};
	var transform = function (node, aux) {
		if (vmSchemata[node.type]) {
			return vmSchemata[node.type].call(node, node, env, g_envs, aux);
		} else {
			return '{!UNKNOWN}';
		}
	};

	"Transform Common functions", function(){
		// Standard Schemata
		schemata(nt['='], function (n, env) {
			switch (this.left.type) {
			case nt.ITEM:
				return $('(%1.itemset(%2, %3))', transform(this.left.left), transform(this.left.member), transform(this.right));
			case nt.MEMBER:
				return $('(%1 = %2)', PART(transform(this.left.left), this.left.right), transform(this.right));
			case nt.MEMBERREFLECT:
				return $('(%1[%2] = %3)', transform(this.left.left), transform(this.left.right), transform(this.right));
			case nt.VARIABLE:
				return SETV(this.left, transform(this.right), env);
			case nt.TEMPVAR:
				return $('(%1 = %2)', C_TEMP(this.left.name), transform(this.right));
			default:
				throw new Error('Invalid assignment left value: only VARIABLE, MEMBER, MEMBERREFLECT or ITEM avaliable');
			}
		});

		schemata(nt.MEMBER, function () {
			return '(' + PART(transform(this.left), this.right) + ')';
		});
		schemata(nt.MEMBERREFLECT, function () {
			return $('(%1[%2])',
				transform(this.left), transform(this.right));
		});
		schemata(nt.ITEM, function (node, env) {
			return $('(%1).item(%2)', 
				transform(this.left), transform(this.member));
		});
		schemata(nt.VARIABLE, function (n, env) {
			return GETV(n, env);
		});
		schemata(nt.TEMPVAR, function(){
			return C_TEMP(this.name);
		})
		schemata(nt.GROUP, function(n, env){
			env.grDepth += 1;
			var r = '('+transform(this.operand)+')';
			env.grDepth -= 1;
			return r;
		});
		schemata(nt.THIS, function (nd, e, trees) {
			var n = e;
			while (n.rebindThis) n = trees[n.upper - 1];
			n.thisOccurs = true;
			return T_THIS(e);
		});
		schemata(nt.ARGN, function (nd, e, trees){
			while(e.rebindThis) e = trees[e.upper - 1];
			e.argnOccurs = true;
			e.argsOccurs = true;
			return T_ARGN();
		});
		schemata(nt.ARGUMENTS, function (n, e, trees) {
			var s = e;
			while(s.rebindThis) s = trees[s.upper - 1];
			s.argsOccurs = true;
			return T_ARGS();
		});
		schemata(nt.CALLEE, function () {
			return '(' + T_ARGS() + '.callee)';
		});
		schemata(nt.PARAMETERS, function () {
			throw new Error('Unexpected parameter group');
		});

		var C_ARGS = function(node, env, skip, skips){
			var args = [],
				names = [];
			
			for (var i = (skip || 0); i < node.args.length; i++) {
				if (node.names[i]) {
					names.push(STRIZE(node.names[i]), transform(node.args[i]));
				} else args.push(transform(node.args[i]));
			};

			if(skip)
				args = skips.concat(args);
			if(names.length)
				args.push('(new NamedArguments(' + names.join(',') + '))');

			return {args: args.join(', ')};
		};

		schemata(nt.CALL, function (node, env, trees) {
			var comp, head;
			var skip = 0, skips = [], pipe;

			// this requires special pipeline processing:
			var pipelineQ = node.pipeline && node.func // pipe line invocation...
				&& !(node.func.type === nt.VARIABLE || node.func.type === nt.THIS || node.func.type === nt.DO) // and side-effective.

			if (pipelineQ) {
				// processing pipelined invocations
				env.grDepth += 1;
				skip = 1;
				ScopedScript.useTemp(env, 'PIPE' + env.grDepth);
				pipe = C_TEMP('PIPE' + env.grDepth) + '=' + transform(this.args[0])
				skips = [C_TEMP('PIPE' + env.grDepth)];
			}

			switch (this.func.type) {
				case nt.ITEM:
					head = $('EISA_IINVOKE(%1, %2%3',
							transform(this.func.left), transform(this.func.member), (this.args.length ? ',' : ''));
					break;
				case nt.DO:
					if(this.args.length === 1) {
						var s = env; while(s.rebindThis) s = trees[s.upper - 1];
						ScopedScript.useTemp(s, 'DOF1');
						s.thisOccurs = true;
						s.argsOccurs = true;
						head = C_TEMP('DOF1') + '(';
						break;
					};
				default:
					head = transform(this.func) + '(';
			};
			if(pipelineQ) env.grDepth -= 1;
			var ca = C_ARGS(this, env, skip, skips);
			comp = ca.args + ')';
			return $('(%1%2%3)', 
				(pipe ? (pipe + ', ') : ''), head, comp);
		});
		schemata(nt.OBJECT, function () {
			var inits = [],
				x = 0;
			for (var i = 0; i < this.args.length; i++) {
				if (typeof this.names[i] === "string") {
					inits.push(STRIZE(this.names[i]) + ': ' + transform(this.args[i]));
				} else {
					inits.push(STRIZE('' + x) + ': ' + transform(this.args[i]));
					x++;
				}
			};
			return $('({%1})',
				(this.args.length < 4 ? inits.join(',') : '\n' + INDENT(inits.join(',\n')) + '\n'));
		});
		schemata(nt.ARRAY, function () {
			var args = [];
			for (var i = 0; i < this.args.length; i++) {
				args[i] = transform(this.args[i]);
			};
			return $('([%1])', args.join(','));
		});
		schemata(nt.LITERAL, function () {
			if (typeof this.value === 'string') {
				return STRIZE(this.value);
			} else if (typeof this.value === 'number'){
				return '(' + this.value + ')';	
			} else return '' + this.value.map;
		});

		var binoper = function (operator, tfoper) {
			schemata(nt[operator], function () {
				return $('(%1%2%3)', transform(this.left), tfoper, transform(this.right));
			});
		};
		var methodoper = function (operator, method) {
			schemata(nt[operator], function () {
				return $('(%3.%2(%1))', transform(this.left), method, transform(this.right));
			});
		};
		var lmethodoper = function (operator, method) {
			schemata(nt[operator], function () {
				return $('(%1.%2(%3))', transform(this.left), method, transform(this.right));
			});
		};

		binoper('+', '+');
		binoper('-', '-');
		binoper('*', '*');
		binoper('/', '/');
		binoper('%', '%');
		binoper('<', '<');
		binoper('>', '>');
		binoper('<=', '<=');
		binoper('>=', '>=');
		binoper('==', '===');
		binoper('=~', '==');
		binoper('===', '===');
		binoper('!==', '!==');
		binoper('!=', '!==');
		binoper('!~', '!=');
		binoper('and', '&&');
		binoper('or', '||');
		methodoper('in', 'contains');
		methodoper('is', 'be');
		methodoper('as', 'convertFrom');
		methodoper('>>', 'acceptShiftIn');
		lmethodoper('<=>', 'compareTo');
		lmethodoper('<<', 'shiftIn');
		lmethodoper('of', 'of');

		schemata(nt['~~'], function(){
			return $('(%1, %2)', transform(this.left), transform(this.right));
		});

		schemata(nt['->'], function () {
			return $('(EISA_CREATERULE(%1, %2))', transform(this.left), transform(this.right));
		});
		schemata(nt.NEGATIVE, function () {
			return '(-(' + transform(this.operand) + '))';
		});
		schemata(nt.NOT, function () {
			return '(!(' + transform(this.operand) + '))';
		});

		schemata(nt.DO, function(nd, e, trees){
			var s = e;
			while(s.rebindThis) s = trees[s.upper - 1];
			ScopedScript.useTemp(s, 'DOF');
			s.thisOccurs = true;
			s.argsOccurs = true;
			return C_TEMP('DOF');
		});

		schemata(nt.FUNCTION, function (n, e, trees) {
			var	f = trees[this.tree - 1];
			var s = (f.oProto ? compileOProto : compileFunctionBody) (f, '', '', trees);
			return s;
		});



		schemata(nt.EXPRSTMT, function(){
			return transform(this.expression)
		});
		schemata(nt.VARDECLS, function(){
			var a = this.items;
			var ans = []
			for(var i = 0; i < a.length; i += 1){
				if(a[i].initalizer)
					ans.push( '(' + C_NAME(a[i].name) + '=(' + transform(a[i].initalizer) + '))')
			}
			return ans.join(',');
		});
		schemata(nt.RETURN, function () {
			return 'return ' + transform(this.expression);
		});
		schemata(nt.THROW, function () {
			return 'throw ' + transform(this.expression);
		});
		schemata(nt.IF, function () {
			return $('if (%1){%2}%3', 
				transform(this.condition),
				transform(this.thenPart),
				this.elsePart ? transform(this.elsePart) : '');
		});
		schemata(nt.PIECEWISE, function () {
			var a = [], cond = '';
			for (var i = 0; i < this.conditions.length; i++) {
				if (!this.bodies[i]) { // fallthrough condition
					cond += '(' + transform(this.conditions[i]) + ') || ';
				} else {
					cond += '(' + transform(this.conditions[i]) + ')';
					a.push('if (' + cond + '){' + transform(this.bodies[i]) + '}');
					cond = '';
				}
			}

			var s = a.join(' else ');
			if (this.otherwise) {
				s += ' else {' + transform(this.otherwise) + '}';
			}

			return s;
		});

		schemata(nt.CASE, function () {
			var s = 'switch (' + transform(this.expression) + '){\n';
			var stmts = [];
			for (var i = 0; i < this.conditions.length; i++) {
				stmts.push('  case ' + transform(this.conditions[i]) + ' :')
				if (this.bodies[i]) {
					stmts.push(transform(this.bodies[i]));
					stmts.push('    break;');
				}
			}

			if (this.otherwise) {
				stmts.push('  default:', transform(this.otherwise));
			}
			s += stmts.join('\n');
			s += '\n}';
			return s;
		});
		schemata(nt.REPEAT, function () {
			return $('do{%2}while(%1)', transform(this.condition), transform(this.body));
		});
		schemata(nt.WHILE, function () {
			return $('while(%1){%2}', transform(this.condition), transform(this.body));
		});
		schemata(nt.FORIN, function (nd, e) {
			ScopedScript.useTemp(e, 'ENUMERATOR' + this.no);
			ScopedScript.useTemp(e, 'YV');
			ScopedScript.useTemp(e, 'YVC');
			var varAssign;
			if(this.pass){
				varAssign = C_NAME(this.passVar.name) + '=' + C_TEMP('YV') + '.values'
			} else {
				varAssign = C_NAME(this.vars[0].name) + '=' + C_TEMP('YV') + '.value' ; // v[0] = enumerator.value
				for(var i = 1; i < this.vars.length; i += 1)
					varAssign += $(', %1 = %2.values[%3]', C_NAME(this.vars[i].name), C_TEMP('YV'), i);
			}
			var s_enum = $('(%3 = (%1 = %2.emit()) instanceof EISA_YIELDVALUE) ? ( %4 ): undefined',
				C_TEMP('YV'),
				C_TEMP('ENUMERATOR' + this.no),
				C_TEMP('YVC'),
				varAssign);
			return $('for(%1 = %2.getEnumerator(), %3; %4; %3%5){%6}',
				C_TEMP('ENUMERATOR' + this.no),
				transform(this.range),
				s_enum,
				C_TEMP('YVC'),
				this.step ? transform(this.step) : '',
				transform(this.body));
		});
		schemata(nt.FOR, function(){
			return $('for(%1; %2; %3){%4}',
				this.start ? transform(this.start) : '',
				transform(this.condition),
				this.step ? transform(this.step) : '',
				transform(this.body));
		});
		schemata(nt.BREAK, function () {
			return 'break ' + (this.destination ? C_LABELNAME(this.destination) : '');
		});
		schemata(nt.LABEL, function () {
			return C_LABELNAME(this.name) + ':{' + transform(this.body) + '}';
		});
		schemata(nt.TRY, function(n, e){
			var s = 'try {' + transform(this.trystmts) + '}';
			if(this.catchvar){
				s += 'catch('+C_NAME(this.catchvar.name)+'){'+transform(this.catchstmts)+'};'
			} else {
				ScopedScript.useTemp(e, 'IGNOREDEXCEPTION');
				s += 'catch(' + C_TEMP('IGNOREDEXCEPTION') + '){}'
			}
			return s;
		});
		schemata(nt.USING, function(n, e){
			ScopedScript.useTemp(e, 'USINGSCOPE');
			var s = [];
			s.push( C_TEMP('USINGSCOPE') + '=' + transform(this.expression));
			for(var i = 0; i < this.names.length; i ++)
				s.push( C_NAME(this.names[i].name) + '=' + PART(C_TEMP('USINGSCOPE'), this.names[i].name))
			return JOIN_STMTS(s);
		});
		schemata(nt.IMPORT, function(n, e){
			return C_NAME(this.importVar.name) + '=' + transform(this.expression);
		});

		schemata(nt.SCRIPT, function (n) {
			var a = [];
			for (var i = 0; i < n.content.length; i++) {
				if (n.content[i]){
					a.push(transform(n.content[i]));
				}
			}
			return JOIN_STMTS(a)
		});
	}();

	
	"Obstructive Proto Flow";
	var oProtoFlow = function(){
		var block = [];
		var joint = function(){
			return '\n' + block.join('\n') + '\n';
		};
		var labelN = 0;
		var label_dispatch = function(){
			return ++labelN
		};

		var GOTO = function(label){
			return '{' + C_TEMP('PROGRESS') + '=' + label + '; break MASTERCTRL}'
		}
		var STOP = function(label){
			return C_TEMP('PROGRESS') + '=' + label;
		}
		var LABEL = function(label){
			return block.push('  case ' + label + ':')
		}
		var OVER = function(){
			return '{ ' + C_TEMP('PROGRESS') + '= 0;' + C_TEMP('COROFUN') + '.stopped = true };'
		}
		var pushStatement = function(s){
			if(s) block.push(INDENT(s) + ';')
		};

		return {
			ps: pushStatement,
			GOTO: GOTO,
			STOP: STOP,
			LABEL: LABEL,
			OVER: OVER,
			label: label_dispatch,
			joint: joint
		}
	};

	"Obstructive Protos Transformer";
	var transformOProto = function(tree){
		var cSchemata = vmSchemata.slice(0);
		var ct = function (node) {
			if (!node.obstructive)
				return transform(node);
			if (cSchemata[node.type]) {
				return cSchemata[node.type].call(node, node, env, g_envs);
			} else {
				return '{!UNKNOWN}';
			}
		}

		// import flow manager
		var flowM = oProtoFlow();
		var ps = flowM.ps,
			label = flowM.label,
			GOTO = flowM.GOTO,
			LABEL = flowM.LABEL,
			STOP = flowM.STOP,
			OVER = flowM.OVER;
		var pct = function(node){ return ps(ct(node))};

		var lNearest = 0;
		var scopeLabels = {};
		lInital = label();


		var oSchemata = function(type, func){ cSchemata[type] = func };
		var obstPartID = function(n){
			return function(){
				ScopedScript.useTemp(env, 'OBSTR' + (++n));
				return C_TEMP('OBSTR' + n);
			}
		}(0);
		var expPart = function(node){
			var id = obstPartID();
			ps(id + ' = (' + ct(node) + ')');
			return id;
		};



		// obstructive expressions

		oSchemata(nt['='], function (n, env) {
			switch (this.left.type) {
				case nt.ITEM:
					return '(' + expPart(this.left.left) + '.itemset(' + expPart(this.left.member) + ',' + expPart(this.right) + '))';
				case nt.MEMBER:
					return '(' + PART(expPart(this.left.left), this.left.right) + '=' + expPart(this.right) + ')';
				case nt.MEMBERREFLECT:
					return '((' + expPart(this.left.left) + ')[' + expPart(this.left.right) + ']=' + expPart(this.right) + ')';
				case nt.VARIABLE:
					return SETV(this.left, expPart(this.right), env);
				case nt.TEMPVAR:
					return '(' + C_TEMP(this.left.name) + '=' + expPart(this.right) + ')';
				default:
					throw new Error('Invalid assignment left value: only VARIABLE, MEMBER, MEMBERREFLECT or ITEM avaliable');
			}
		});

		var oC_ARGS = function(node, env, skip, skips){
			var args = [],
				names = [],
				comp = '';
			// if skip is 1, the first item is not named.

			for (var i = (skip || 0); i < node.args.length; i++) {
				if (node.names[i]) {
					names.push(STRIZE(node.names[i]), node.args[i]);
				} else args.push(node.args[i]);
			}

			for(var i = 0; i < args.length; i++)
				args[i] = expPart(args[i]);
			for(var i = 1; i < names.length; i += 2)
				names[i] = expPart(names[i]);

			if(skip)
				args = skips.concat(args);
			if(names.length)
				args.push('(new NamedArguments(' + names.join(',') + '))')
			
			return {args: args.join(', ')};
		};

		oSchemata(nt.CALL, function (node, env, trees) {
			if(this.func && this.func.type === nt.WAIT)
				return awaitCall.apply(this, arguments);
			var comp, head;
			var pipelineQ = node.pipeline && node.func // pipe line invocation...
				&& !(node.func.type === nt.VARIABLE || node.func.type === nt.THIS || node.func.type === nt.DO) 
				// and side-effective.
			var skip = 0;
			var skips = [];
			var obstructive;
			debugger;

			if(pipelineQ){
				skip = 1;
				skips = [expPart(this.args[0])];
			};

			switch (this.func.type) {
				case nt.ITEM:
					head = 'EISA_IINVOKE(' + expPart(this.func.left) + ',' + expPart(this.func.member) + (this.args.length ? ',' : '');
					break;
				case nt.DO:
					if(this.args.length === 1) {
						var s = env; while(s.rebindThis) s = trees[s.upper - 1];
						ScopedScript.useTemp(s, 'DOF1');
						s.thisOccurs = true;
						s.argsOccurs = true;
						head = C_TEMP('DOF1') + '(';
						break;
					};
				default:
					head = expPart(this.func) + '(';
			};
			var ca = oC_ARGS(this, env, skip, skips);
			comp = ca.args + ')'
			return '(' + head + comp + ')';
		});

		var obsPart = function(node){
			switch (this.type) {
				case nt.ITEM:
					var p = expPart(this.left);
					var f = '(' + p + '.item(' + expPart(this.member) + '))';
					return { p: p, f: f }
				case nt.MEMBER:
					var p = expPart(this.left);
					return { p: p, f: PART(p, this.right) }
				case nt.MEMBERREFLECT:
					var p = expPart(this.left);
					return { p: p, f: '((' + p + ')[' + expPart(this.right) + '])' }
				default:
					return {
						f : expPart(this),
						p : 'null'
					}
			}
		};

		var awaitCall = function(node, env){
			var e = obsPart.call(this.func.expression);
			var callbody = oC_ARGS(this, env).args;
			var id = obstPartID();
			var l = label();
			ps(STOP(l));
			ps($('return %1(%2.call(%3, %4 function(x){%5 = x; %6()}))',
				PART(C_TEMP('SCHEMATA'), 'break'),
				e.f,
				e.p,
				callbody ? callbody + "," : "",
				id,
				C_TEMP('COROFUN')));
			LABEL(l);
			return id;
		};

		oSchemata(nt.WAIT, function (n, env) {
			var e = obsPart.call(this.expression);
			var id = obstPartID();
			var l = label();
			ps(STOP(l));
			ps($('return %1(%2.call(%3, function(x){%4 = x; %5()}))',
				PART(C_TEMP('SCHEMATA'), 'break'),
				e.f,
				e.p,
				id,
				C_TEMP('COROFUN')));
			LABEL(l);
			return id;
		});

		oSchemata(nt.OBJECT, function () {
			var inits = [],
				x = 0;
			for (var i = 0; i < this.args.length; i++) {
				if (typeof this.names[i] === 'string') {
					inits.push(STRIZE(this.names[i]) + ':' + expPart(this.args[i]));
				} else {
					inits.push(STRIZE('' + x) + ':' + expPart(this.args[i]));
					x++;
				}
			};
			return '({' + inits.join(', ') + '})';
		});
		oSchemata(nt.ARRAY, function () {
			var args = [];
			for (var i = 0; i < this.args.length; i++) {
				args[i] = expPart(this.args[i]);
			};
			return '([' + args.join(', ') + '])';
		});
		oSchemata(nt.MEMBER, function () {
			return '(' + PART(expPart(this.left), this.right) + ')';
		});
		oSchemata(nt.MEMBERREFLECT, function () {
			return '(' + expPart(this.left) + '[' + expPart(this.right) + '])';
		});
		oSchemata(nt.ITEM, function (node, env) {
			return '(' + expPart(this.left) + ').item(' + expPart(this.member) + ')';
		});

		var binoper = function (operator, tfoper) {
			oSchemata(nt[operator], function () {
				return '(' + expPart(this.left) + tfoper + expPart(this.right) + ')';
			});
		};
		var methodoper = function (operator, method) {
			oSchemata(nt[operator], function () {
				return '(' + expPart(this.right) + '.' + method + '(' + expPart(this.left) + '))'
			});
		};
		var lmethodoper = function (operator, method) {
			oSchemata(nt[operator], function () {
				return '(' + expPart(this.left) + '.' + method + '(' + expPart(this.right) + '))';
			});
		};

		binoper('+', '+');
		binoper('-', '-');
		binoper('*', '*');
		binoper('/', '/');
		binoper('%', '%');
		binoper('<', '<');
		binoper('>', '>');
		binoper('<=', '<=');
		binoper('>=', '>=');
		binoper('==', '===');
		binoper('=~', '==');
		binoper('===', '===');
		binoper('!==', '!==');
		binoper('!=', '!==');
		binoper('!~', '!=');
		methodoper('in', 'contains');
		methodoper('is', 'be');
		methodoper('as', 'convertFrom');
		methodoper('>>', 'acceptShiftIn');
		lmethodoper('<=>', 'compareTo');
		lmethodoper('<<', 'shiftIn');
		lmethodoper('of', 'of');

		oSchemata(nt['~~'], function(){
			return '(' + expPart(this.left) + ',' + expPart(this.right) + ')';
		});

		oSchemata(nt['->'], function () {
			return '(EISA_CREATERULE(' + expPart(this.left) + ',' + expPart(this.right) + '))';
		});
		oSchemata(nt.NEGATIVE, function () {
			return '(-(' + expPart(this.operand) + '))';
		});
		oSchemata(nt.NOT, function () {
			return '(!(' + expPart(this.operand) + '))';
		});

		oSchemata(nt['and'], function(){
			var left = expPart(this.left);
			var lElse = label();
			ps('if(!(' + left + '))' + GOTO(lElse));
			var right = expPart(this.right);
			var lEnd = label();
			ps(GOTO(lEnd));
			(LABEL(lElse));
			ps(right + '= false');
			(LABEL(lEnd));
			return left + '&&' + right;
		});

		oSchemata(nt['or'], function(){
			var left = expPart(this.left);
			var lElse = label();
			ps('if(' + left + ')' + GOTO(lElse));
			var right = expPart(this.right);
			var lEnd = label();
			ps(GOTO(lEnd));
			(LABEL(lElse));
			ps(right + '= true');
			(LABEL(lEnd));
			return left + '||' + right;
		});


		// Statements
		cSchemata[nt.EXPRSTMT] = function(){
			return this.obstructive ? ct(this.expression) : transform(this.expression);
		};

		cSchemata[nt.IF] = function(node){
			var lElse = label();
			var lEnd = label();
			ps('if(!(' + ct(this.condition) + '))' + GOTO(lElse));
			pct(this.thenPart);
			if(this.elsePart){
				ps(GOTO(lEnd));
				(LABEL(lElse));
				pct(this.elsePart);
				(LABEL(lEnd));
			} else {
				(LABEL(lElse));
			}
			return '';
		};
		cSchemata[nt.PIECEWISE] = function () {
			var b = [], l = [], cond = '', lElse;
			for (var i = this.conditions.length-1; i >= 0; i--) {
				if (!this.bodies[i]) { // fallthrough condition
					l[i] = l[i+1]
				} else {
					var li = label();
					l[i] = li;
					b[i] = this.bodies[i];
				}
			};

			for (var i = 0; i < this.conditions.length; i++) {
				ps('if (' + ct(this.conditions[i]) + '){\n' + GOTO(li) + '\n}');
			};

			var lEnd = label();	
			if (this.otherwise) {
				var lElse = label()
				ps(GOTO(lElse));
			} else {
				ps(GOTO(lEnd));
			}

			for(var i = 0; i < b.length; i += 1) if(b[i]) {
				(LABEL(l[i]))
				pct(b[i])
				ps(GOTO(lEnd))
			}

			if (this.otherwise) {
				(LABEL(lElse));
				pct(this.otherwise);
				ps(GOTO(lEnd));
			}
	
			(LABEL(lEnd));
			return '';
		};
		cSchemata[nt.CASE] = function(){
			var b = [], l = [], cond = '', lElse, expr = expPart(this.expression);
			ps(expr);
			for (var i = this.conditions.length-1; i >= 0; i--) {
				if (!this.bodies[i]) { // fallthrough condition
					l[i] = l[i+1]
				} else {
					var li = label();
					l[i] = li;
					b[i] = this.bodies[i];
				}
			};
			
			for (var i = 0; i < this.conditions.length; i++) {
				ps('if (' + expr + '=== (' + ct(this.conditions[i]) + ')){\n' + GOTO(li) + '\n}');
			};

			var lEnd = label();	
			if (this.otherwise) {
				var lElse = label()
				ps(GOTO(lElse));
			} else {
				ps(GOTO(lEnd));
			}

			for(var i = 0; i < b.length; i += 1) if(b[i]) {
				(LABEL(l[i]))
				pct(b[i])
				ps(GOTO(lEnd))
			}

			if (this.otherwise) {
				(LABEL(lElse));
				pct(this.otherwise);
				ps(GOTO(lEnd));
			}
	
			(LABEL(lEnd));
			return '';
		};

		cSchemata[nt.WHILE] = function(){
			var lLoop = label();
			var bk = lNearest;
			var lEnd = lNearest = label();
			(LABEL(lLoop));
			ps('if(!(' + ct(this.condition) + '))' + GOTO(lEnd)); 
			pct(this.body);
			ps(GOTO(lLoop));
			(LABEL(lEnd));
			lNearest = bk;
			return '';
		};
		cSchemata[nt.FOR] = function () {
			var lLoop = label();
			var bk = lNearest;
			var lEnd = lNearest = label();
			ps(ct(this.start));
			(LABEL(lLoop));
			ps('if(!(' + ct(this.condition) + '))' + GOTO(lEnd));
			pct(this.body);
			ps(ct(this.step));
			ps(GOTO(lLoop));
			(LABEL(lEnd));
			lNearest = bk;
			return '';
		};
		cSchemata[nt.FORIN] = function(node, env){
			ScopedScript.useTemp(env, 'ENUMERATOR' + this.no);
			ScopedScript.useTemp(env, 'YV');
			ScopedScript.useTemp(env, 'YVC');

			var varAssign;
			if(this.pass){
				varAssign = C_NAME(this.passVar.name) + '=' + C_TEMP('YV') + '.values'
			} else {
				varAssign = C_NAME(this.vars[0].name) + '=' + C_TEMP('YV') + '.value' ; // v[0] = enumerator.value
				for(var i = 1; i < this.vars.length; i += 1)
					varAssign += $(', %1 = %2.values[%3]', C_NAME(this.vars[i].name), C_TEMP('YV'), i);
			}
			var s_enum = $('(%3 = (%1 = %2.emit()) instanceof EISA_YIELDVALUE) ? ( %4 ): undefined',
				C_TEMP('YV'),
				C_TEMP('ENUMERATOR' + this.no),
				C_TEMP('YVC'),
				varAssign);

			var lLoop = label();
			var bk = lNearest;
			var lEnd = lNearest = label();
			ps(C_TEMP('ENUMERATOR' + this.no) + '=' + ct(this.range) + '.getEnumerator()');
			ps(s_enum);
			(LABEL(lLoop));
			ps('if(!(' + C_TEMP('YVC') + '))' + GOTO(lEnd));
			pct(this.body);
			ps(s_enum);
			ps(GOTO(lLoop));
			(LABEL(lEnd))
			lNearest = bk;
			return '';
	
		};

		cSchemata[nt.REPEAT] = function(){
			var lLoop = label();
			var bk = lNearest;
			var lEnd = lNearest = label();
			(LABEL(lLoop));
			pct(this.body);
			ps('if(!(' + ct(this.condition) + '))' + GOTO(lLoop));
			(LABEL(lEnd));
			lNearest = bk;
			return ''
		};
	

		cSchemata[nt.RETURN] = function() {
			ps(OVER());
			ps($('return %1["return"](%2)',
				C_TEMP('SCHEMATA'),
				ct(this.expression)));
			return '';
		};
		//.obsolete
		cSchemata[nt.LABEL] = function () {
			var l = scopeLabels[this.name] = label();
			pct(this.body);
			(LABEL(l));
			return ''
		};
		cSchemata[nt.BREAK] = function () {
			ps(GOTO(this.destination ? scopeLabels[this.destination] : lNearest));
			return ''
		};
		cSchemata[nt.TRY] = function(){
			throw new Error('Unable to use TRY statement in a coroutine function.');
		};
		cSchemata[nt.USING] = function(n, e){
			ScopedScript.useTemp(e, 'USINGSCOPE');
			ps(C_TEMP('USINGSCOPE') + '=' + expPart(this.expression));
			for(var i = 0; i < this.names.length; i ++)
				ps(C_NAME(this.names[i].name) + '=' + PART(C_TEMP('USINGSCOPE') , this.names[i].name))
			return '';
		};
		cSchemata[nt.IMPORT] = function(n, e){
			ps(C_NAME(this.importVar.name) + '=' + expPart(this.expression));
			return ''
		};


		cSchemata[nt.SCRIPT] = function (n) {
			var gens;
			for (var i = 0; i < n.content.length; i++){
				if (n.content[i]){
					gens = ct(n.content[i]);
					if(gens) ps(gens);
				}
			}
		};

		// -------------------------------------------------------------
		LABEL(lInital);
		ct(tree.code);
		ps(OVER());
		ps('return ' + C_TEMP('SCHEMATA') + '["return"]' + '()');
		return flowM.joint();
	}


	// Configuration binding
	var bindConfig = function (vmConfig) {
		config = vmConfig;
		C_NAME = config.varName;
		C_LABELNAME = config.label;
		T_THIS = config.thisName;
		JOIN_STMTS = config.joinStatements;
		THIS_BIND = config.thisBind;
		ARGN_BIND = config.argnBind;
		ARGS_BIND = config.argsBind;
		T_ARGN = config.argnName;
		T_ARGS = config.argsName;
		C_TEMP = config.tempName;
		BIND_TEMP = config.bindTemp;
		INDENT = config.indent;
		currentBlock = null;
	};
	// Default Lofn compilation config
	var standardTransform = function () {
		var _indent = 0,
			c;
		return c = {
			varName: function (name) {
				return TO_ENCCD(name) + '_$'
			},
			label: function (name) {
				return TO_ENCCD(name) + '_$_L'
			},
			tempName: function (type){
				return type + '_$_'
			},
			thisName: function (env) {
				return '_$_THIS'
			},
			argnName: function(){ return '_$_ARGND' },
			argsName: function(){
				return '_$_ARGS'
			},
			thisBind: function (env) {
				return (!env.thisOccurs || env.rebindThis) ? '' : 'var ' + c.thisName() + ' = (this === EISA_M_TOP ? null : this)'
			},
			argnBind: function (env) {
				return (env.argnOccurs && !env.rebindThis) ? 'var ' + c.argnName() + ' = EISA_CNARG(arguments[arguments.length - 1])' : ''
			},
			argsBind: function (env) {
				return (!env.argsOccurs || env.rebindThis) ? '' : 'var ' + c.argsName() + ' = EISA_SLICE(arguments, 0)'
			},
			bindTemp: function (env, tempName) {
				if(tempName === 'DOF')
					return c.tempName('DOF') + ' = (function(t, a){ return function(f){ if(arguments.length === 1) return f.apply(t, a);\nelse return f.apply(t, EISA_SLICE(arguments, 1).concat(EISA_SLICE(a, arguments.length - 1))) }})('
							+ c.thisName(env) + ',' + c.argsName(env) + ')';
				else if(tempName === 'DOF1')
					return c.tempName('DOF1') + ' = (function(t, a){ return function(f){ return f.apply(t, a) }})('
							+ c.thisName(env) + ',' + c.argsName(env) + ')';
				else
					return c.tempName(tempName);
			},
			joinStatements: function (statements) {
				var ans = [], ansl = 0, statement;
				for(var i = 0; i < statements.length; i++) if((statement = statements[i])){
					statement = statement.replace(/^[\s;]+/g, '').replace(/[\s;]+$/g, '')
					if(/[^\s]/.test(statement))
						ans[ansl++] = statement;
				}
				return '\n' + c.indent(ans.join(';\n')) + ';\n';
			},
			indent: function(s){ return s.replace(/^/gm, '    ') }
		}
	}();
	//============
	exports.lex = require('lfc/parser').lex;
	exports.parse = require('lfc/parser').parse;
	exports.Compiler = function (ast, vmConfig) {

		bindConfig(vmConfig || standardTransform);
		
		var trees = ast.scopes;
		var enter = trees[0];

		var body = '';
		var enterText = "var undefined;\n" + function(){
			var s = '';
			for(var item in eisa.runtime) if(OWNS(eisa.runtime, item)) {
				s += 'var EISA_' + item + ' = ' + PART(C_TEMP('RUNTIME'), item) + ';\n';
			};
			return s;
		}();

		var generateExecutable = function(generatedSource){
			var finalSource = enterText + 'return ' + generatedSource;
			var f = Function(C_TEMP('RUNTIME'), C_TEMP('INIT'), finalSource);
			return {
				func: f,
				source: finalSource,
				generatedSource: generatedSource,
				wrappedSource: 'function(' + [C_TEMP('RUNTIME'), C_TEMP('INIT')].join(',') + '){' + finalSource + '}'
			}
		}

		return {
			compile: function(){
				body = compileFunctionBody(enter, '', '', trees);
				return generateExecutable(body);
			},
			asyncCompile: function(onSuccess, onStep){
				var queue = ScopedScript.generateQueue(enter, trees, []);
				var onStep = onStep || function(){};
				var i = 0, body;
				var step = function(){
					if(i < queue.length){
						body = compileFunctionBody(queue[i], '', '', trees);
						onStep(queue[i], i, body);
						i += 1;

						setTimeout(step, 0);
					} else {
						return onSuccess(generateExecutable(body))
					}
				}
				setTimeout(step, 0);
			}
		}
	};
});
