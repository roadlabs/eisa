﻿//:module: parse
//	:author:		infinte (aka. be5invis)
//	:info:			Parser for lofn
// token types

var lofn = {};
lofn.version = 'hoejuu';
eisa.languages.lofn = lofn;

0, function(eisa){

	var lofn = eisa.languages.lofn;

	var 
		CONSTANT = 101,
		ME = 102,
		MY = 103,
		CALLEE = 104,
		ID = 0,
		OPERATOR = 1,
		COLON = 2,
		COMMA = 3,
		NUMBER = 4,
		STRING = 5,
		SEMICOLON = 6,
		STARTBRACE = 7,
		ENDBRACE = 8,
		DOT = 9,
	// --- STATEMENTS ---
		IF = 10,
		FOR = 11,
		WHILE = 12,
		REPEAT = 13,
		UNTIL = 14,
		ARGUMENTS = 15,
		CASE = 18,
		PIECEWISE = 19,
		WHEN = 20,
		FUNCTION = 21,
		RETURN = 22,
		THROW = 23,
		BREAK = 24,
		// CONTINUE = 25,
		LABEL = 26,
		STEP = 27,
		END = 28,
		ELSE = 29,
		OTHERWISE = 30,
		THEN = 31,
		VAR = 32,
		SHARP = 33,
		// FALLTHROUGH = 34,
		OBJECT = 35,
		DO = 36,
		TRY = 37,
		CATCH = 38,
		FINALLY = 39,
		TASK = 40,		//reserved for coro
		LAMBDA = 41,
		PASS = 42,
		AWAIT = 44,
		USING = 45,
		BACKSLASH = 501;

	var Token = function (t, v, p, l, s, i) {
		this.type = t;
		this.value = v;
		this.position = p;
		this.line = l;
		this.spaced = s;
		this.isName = i;
	}
	Token.prototype.toString = function () {
		return '~' + this.type + '[' + this.value + ']'
	}
	var condF = function (match, $1) {
		if ($1.length > 1) {
			return String.fromCharCode(parseInt($1.slice(1), 16));
		} else {
			return {
				'r': '\r',
				'n': '\n',
				'\\': '\\',
				'"': '"',
				't': '\t',
				'v': '\v'
			}[$1];
		}
	};
	var lfUnescape = function (str) {
		return str.replace(/\\(\\|n|"|t|v|u[a-fA-F0-9]{4})/g, condF);
	};
	var REPSTR = function(){
		var cache = [];
		return function(n){
			if(cache[n]) return cache[n];
			if(n <= 0) return '';
			if(n <= 1) return 'T';
			var q = REPSTR(n >>> 1);
			q += q;
			if (n & 1) q += 'T';
			return cache[n] = q;
		};
	}();
	var nameTypes = {
		'is': OPERATOR,
		'and': OPERATOR,
		'not': OPERATOR,
		'or': OPERATOR,
		'in': OPERATOR,
		'of': OPERATOR,
		'as': OPERATOR,
		'if': IF,
		'for': FOR,
		'while': WHILE,
		'repeat': REPEAT,
		'until': UNTIL,
		'case': CASE,
		'piecewise': PIECEWISE,
		'when': WHEN,
		'function': FUNCTION,
		'return': RETURN,
		'throw': THROW,
		'break': BREAK,
		// 'continue': CONTINUE,
		'label': LABEL,
		'end': END,
		'else': ELSE,
		'otherwise': OTHERWISE,
		'then': THEN,
		'var': VAR,
		'me': ME,
		'this': ME,
		'my': MY,
		'true': CONSTANT,
		'false': CONSTANT,
		'null': CONSTANT,
		'undefined': CONSTANT,
		'arguments': ARGUMENTS,
		'callee': CALLEE,
		'object': OBJECT,
		'do': DO,
		'try': TRY,
		'catch': CATCH,
		'finally': FINALLY,
		'TASK': TASK,
		'pass': PASS,
		'using': USING
	};
	var nameType = function (m) {
		if (nameTypes[m] > -65536)
			return nameTypes[m]
		else
			return ID
	};
	var symbolTypes = {
		'+': OPERATOR,
		'-': OPERATOR,
		'*': OPERATOR,
		'/': OPERATOR,
		'%': OPERATOR,
		'<': OPERATOR,
		'>': OPERATOR,
		'=': OPERATOR,
		'+=': OPERATOR,
		'-=': OPERATOR,
		'*=': OPERATOR,
		'/=': OPERATOR,
		'<<=': OPERATOR,
		'>>=': OPERATOR,
		'%=': OPERATOR,
		'<=': OPERATOR,
		'>=': OPERATOR,
		'<<': OPERATOR,
		'>>': OPERATOR,
		'<=>': OPERATOR,
		'==': OPERATOR,
		'!=': OPERATOR,
		'===': OPERATOR,
		'!==': OPERATOR,
		'=~': OPERATOR,
		'!~': OPERATOR,
		'->': OPERATOR,
		'~~' : OPERATOR,
		':>': LAMBDA,
		'#': SHARP,
		'(': STARTBRACE,
		'[': STARTBRACE,
		'{': STARTBRACE,
		'}': ENDBRACE,
		']': ENDBRACE,
		')': ENDBRACE,
		',': COMMA,
		':': COLON,
		'|': THEN,
		'.': DOT,
		'..': AWAIT,
		';': SEMICOLON,
		'@': MY,
		'\\': BACKSLASH
	};
	var symbolType = function (m, p, input) {
		if (symbolTypes[m] > -65536)
			return symbolTypes[m]
		else
			throw token_err('Unspecified symbol ' + m, p, input)
	};

	var token_err = eisa.CompileErrorMeta("LFC");

	var lex = lofn.lex = function (input) {
		var tokens = [], tokl = 0, line = 0, options = {};
		var make = function (t, v, p, as, isn) {
			contt = false;
			tokens[tokl++] = new Token(t, v, p, line, as, isn);
		};
		var option = function(name){
			options[name] = true
		};
		var contt = false;
		var noImplicits = function () {
			while (tokens[tokl - 1] && tokens[tokl - 1].type === SEMICOLON && tokens[tokl - 1].value === 0) tokl--;
		}
		var noSemicolons = function(){
			while (tokens[tokl - 1] && tokens[tokl - 1].type === SEMICOLON) tokl--;
		}
		var p_symbol = function (s, n) {
			var t = symbolType(s, n, input);
			switch (t) {
				case OPERATOR:
				case LAMBDA:
				case COMMA:
				case THEN:
				case DOT:
					noImplicits();
				case COLON:
					make(t, s, n);
					contt = true;
					break;

				case SHARP:
				case MY:
				case AWAIT:
					make(t, s, n);
					break;

				case STARTBRACE:
					make(t, s.charCodeAt(0), n, input.charAt(n-1) === ' ' || input.charAt(n-1) === '\t');
					contt = true;
					break;

				case ENDBRACE:
					noImplicits();
					make(t, s.charCodeAt(0), n);
					break;

				case SEMICOLON:
					noImplicits();
					make(t, 1, n);
					contt = true;
					break;

				case BACKSLASH:
					contt = true;
					break;
			}
		}
		var stringliteral = function(match, n){
			var char0 = match.charAt(0);
			if(char0 === "`")
				return make(STRING, match.slice(1), n);
			if(char0 === "'")
				return make(STRING, match.slice(1, -1).replace(/''/g, "'"), n);
			if(char0 === '"') {
				if(match.charAt(1) === '"')
					return make(STRING, match.slice(3, -3), n)
				else
					return make(STRING, lfUnescape(match.slice(1, -1)), n);
			}
		};

		// This long and terrible regular expression matches every token.
		// Parts are:
		//  * comment
		//  * ! option derivatives
		//  * identifiers
		//  * strings
		//  * unmatched quotes (causes an error)
		//  * numbers
		//  * symbols
		//  * linebreaks

		var ou = input.replace(
			(/(\/\/.*)|(?:^![ \t]*option[ \t]+(\w+)[ \t]*$)|([a-zA-Z_$][\w$]*)|(`[a-zA-Z_$][\w$]*|'[^'\n]*(?:''[^'\n]*)*'|"""[\s\S]*?"""|"[^\\"\n]*(?:\\.[^\\"\n]*)*")|(["'])|(0[xX][a-fA-F0-9]+|\d+(?:\.\d+(?:[eE]-?\d+)?)?)|([+\-*\/<>=!:%~][<>=~]*|\.\.|[()\[\]\{\}|@\\;,\.#])|(\n\s*)/mg),
			function (match, comment, optionname, nme, strlit, strunfin, number, symbol, newline, n, full) {
				after_space = false;
				if(optionname) {
					option(optionname);
				} if (nme) {
					var nty = nameType(match);
					if(nty === OPERATOR)
						noImplicits();
					make(nty, match, n, false, true)
					if(nty === OPERATOR)
						contt = true;
				} else if (strlit) {
					stringliteral(match, n);
				} else if (strunfin) {
					throw token_err("Unfinished string literal", n, input);
				} else if (number) {
					make(NUMBER, (match.replace(/^0+([1-9])/, '$1') - 0), n);
				} else if (symbol) {
					p_symbol(match, n);
				} else if (newline) {
					if (!contt) make(SEMICOLON, 0, n);
					contt = false;
				}
				return '';
			});

		return {
			tokens : tokens,
			options: options
		}
	}


	var HAS_DUPL = function (arr) {
		var b = arr.slice(0).sort();
		for (var i = 0; i < b.length - 1; i++)
			if (b[i] && b[i] == b[i + 1])
				return true;
	}

	var NodeType = eisa.ast.NodeType;
	var ScopedScript = eisa.ast.ScopedScript;

	lofn.parse = function (input, source, initInterator) {
		var PW = function(message, p){
			var pos = p == undefined ? (token ? token.position : source.length) : p;
			var lineno = ('\n' + source.slice(0, pos)).match(/\n/g).length;
			var lineno_l = lineno.toString().length;
			message = '[LFC] ' + message + '\nat line ' + lineno + ' : ' + (source.split('\n')[lineno - 1]);
			message += '\n--------' + (lineno + '').replace(/./g, '-') + '---' + (source.slice(0, pos).split('\n')[lineno - 1].replace(/./g, '-').replace(/$/, '^'));
			return message;
		}
		var PE = function(message, p){
			return PW(message, p);
		};
		
		var resolveVariables = function(scope, trees, explicitQ, aux) {
			for (var each in scope.usedVariables) {
				if (scope.usedVariables[each] === true) {
					if(!(scope.variables[each] > 0)){
						if(!explicitQ) {
							eisa.log(PW('Undeclared variable "' + each + '"' ,
								(scope.usedVariablesOcc && scope.usedVariablesOcc[each]) || 0));
							ScopedScript.registerVariable(scope, each);
							trees[scope.variables[each] - 1].locals.push(each);
						} else {
							throw PE(
								'Undeclared variable "' + each + '" when using `!option explicit`.',
								(scope.usedVariablesOcc && scope.usedVariablesOcc[each]) || 0
							)
						}
					} else {
						trees[scope.variables[each] - 1].locals.push(each);
					}
				}
			};
			for (var i = 0; i < scope.nest.length; i++)
				resolveVariables(trees[scope.nest[i]], trees, explicitQ, aux);
		}

		var ensure = function(c, m, p){
			if(!c) throw PE(m, p);
			return c;
		};

		var Node = function (type, props) {
			var p = props || {};
			p.type = type , p.bp = p.bp || 0, p.line = curline;
			return p
		};

		var implicitReturn = function(node, scope){
			if(!node || !node.content || node.type !== nt.SCRIPT) return node;
			var last = node.content.length - 1;
			while(last >= 0 && node.content[last].type === nt.BREAK) last--;
			var laststmt = node.content[last];
			if(!laststmt) return;
			var lasttype = laststmt.type;
			if(lasttype === nt.EXPRSTMT){
				node.content[last] = new Node(nt.RETURN, {
					expression: laststmt.expression
				})
			} else {
				var c = implicitReturnCpst(laststmt, false, scope);
				if(c){
					node.content.push(new Node(nt.RETURN, {
						expression: new Node(nt.TEMPVAR, {name: 'IMPLICIT'})
					}))
				}
			}
			return node;
		};

		var implicitReturnCpst = function(node, caseQ, scope){
			var ir = caseQ ? implicitReturnCase : implicitReturn;
			var lasttype = node.type;
			if(lasttype === nt.SCRIPT){
				ir(node, scope);
			} else if(lasttype === nt.IF){
				ir(node.thenPart, scope);
				if(node.elsePart){
					ir(node.elsePart, scope);
				}
			} else if(lasttype === nt.PIECEWISE){
				for(var i = 0; i < node.bodies.length; i++){
					ir(node.bodies[i], scope);
				};
				if(node.otherwise){
					ir(node.otherwise, scope);
				};
			} else if(lasttype === nt.CASE){
				for(var i = 0; i < node.bodies.length; i++){
					implicitReturnCase(node.bodies[i], scope);
				};
				if(node.otherwise){
					implicitReturnCase(node.otherwise, scope);
				};
				return true;
			};
		};


		var implicitReturnCase = function(node, s){
			var contents = node.content;
			for(var i = 0; i < contents.length; i++)
				if(contents[i].type === nt.EXPRSTMT ) {
					if(contents[i + 1] && contents[i + 1].type !== nt.EXPRSTMT) {
						ScopedScript.useTemp(s, 'IMPLICIT');
						contents[i] = new Node(nt.EXPRSTMT, {
							expression: new Node(nt['='], {
								left:  new Node(nt.TEMPVAR, {name: 'IMPLICIT'}),
								right: contents[i].expression
							})
						});
					};
				} else {
					implicitReturnCpst(contents[i], true, s);
				}
		};

		var checkBreakPosition = function (node, okayQ) {
			if(node.type === nt.WHILE || node.type === nt.FOR || node.type === nt.REPEAT || node.type === nt.CASE)
				return;
			if(node.type === nt.EXPRSTMT) return;
			if(node.type === nt.BREAK)
				throw PE("Break outside a loop statement or CASE statement");
			return eisa.walkNode(node, checkBreakPosition);
		};

		var generateObstructiveness = function (node) {
			if(!node || !node.type) return false;
			var obs = false;
			if(node.type === nt.AWAIT || node.type === nt.BREAK || node.type === nt.RETURN){
				node.obstructive = true;
				obs = true
			};
			eisa.walkNode(node, function(n){ if(generateObstructiveness(n)) obs = true });
			if(obs)
				node.obstructive = true;
			return obs;
		};


		var 
			tokens = input.tokens,
			scopes = [],
			token = tokens[0],
			next = tokens[1], 
			i = 0, 
			len = tokens.length, 
			workingScopes = [],
			workingScope, 
			nt = NodeType,
			curline, 
			token_type = token ? token.type : undefined,
			token_value = token ? token.value : undefined,
			opt_explicit = !!input.options.explicit,
			opt_colononly = !!input.options.colononly,
			opt_sharpno = !!input.options.sharpno,
			opt_forfunction = !!input.options.forfunction,
			opt_filledbrace = !!input.options.filledbrace,
			opt_notcolony = !!input.options.notcolony
		;
		if (token) curline = token.line;
		function acquire(){};
		var moveNext = function () {
			var t = token;
			acquire();
			i += 1;
			token = tokens[i];
			if(token){
				token_type = token.type;
				token_value = token.value;
			} else {
				token_type = token_value = undefined;
			}
			next = tokens[i + 1];
			if (token) curline = token.line;
			return t;
		};
		var newScope = function (isLE) {
			var n = scopes.length;
			var s = new ScopedScript(n + 1, workingScope);
			s.rebindThis = isLE;
			if (workingScope) {
				workingScope.hasNested = true;
				workingScope.nest.push(n);
			}
			if(workingScope) s.upper = workingScope.id;
			scopes[n] = s;
			workingScopes.push(s);
			workingScope = s;

			return n;
		};
		var endScope = function () {
			workingScopes.pop();
			workingScope = workingScopes[workingScopes.length - 1];
		}
		var advance = function (type, test) {
			var nt, value, t, node;
			if (!token)
				throw PE('Requires token type#' + type);
			if (type !== undefined && token.type !== type)
				throw PE('Unexpected token: got' + token);
			if (test !== undefined && token.value !== test)
				throw PE('Unexpected token: got' + token);
			return moveNext();
		};
		var SQSTART = 91, SQEND = 93, RDSTART = 40, RDEND = 41, CRSTART = 123, CREND = 125;

		var tokenIs = function (t, v) {
			return token && token_type === t && (v ? token_value === v : true);
		}
		var nextIs = function (t, v) {
			return next && next.type === t && (v ? next.value === v : true);
		}
		var shiftIs = function (n, t, v) {
			return tokens[i + n] && tokens[i + n].type === t && (v ? tokens[i + n].value === v : true);
		}

		// Here we go!

		// Identifier: like the javascript
		var variable = function () {
			var t = advance(ID);
			workingScope.useVar(t.value, t.position);
			return new Node(NodeType.VARIABLE, { name: t.value });
		};
		var lname = function () {
			var t = advance(ID);
			return t.value;
		};
		var name = function () {
			if(token.isName) 
				var t = advance();	
			else 
				throw PE("A name is needed!");
			return t.value;
		};

		// literals: number, string
		// number: stricter than javascript, 0.0E(-)0
		// strings: single and double quote. Single quotes only support escaping '' into '
		// Double quotes support \\ \n \" \t \uxxxx
		var literal = function () {
			var t = advance();
			return new Node(NodeType.LITERAL,
			{ value: t.value });
		};

		// constants
		var consts = {
			'true': true,
			'false': false,
			'null': null,
			'undefined': void 0
		};
		var constant = function () {
			var t = advance(CONSTANT);
			return new Node(nt.LITERAL, { value: consts[t.value] });
		};

		// this pointer
		var thisp = function () {
			var t = advance(ME);
			return new Node(nt.THIS);
		};

		// callee
		var calleep = function () {
			var t = advance(CALLEE);
			return new Node(nt.CALLEE);
		};

		// object
		var objinit = function () {
			var arr = [], ams = [];
			advance(STARTBRACE, CRSTART);
			var node = new Node(nt.OBJECT);
			if (tokenIs(ENDBRACE, CREND)) {
				node.args = [];
				advance();
				return node
			};
			arglist(node);
			advance(ENDBRACE, CREND);
			return node;
		};

		// 'my' construct: "my" Identifier
		var thisprp = function () {
			var t = advance(MY);
			var n = name();
			return new Node(nt.MEMBER, { left: new Node(nt.THIS), right: n });
		};

		// 'arguments' pointer
		var argsp = function () {
			var t = advance(ARGUMENTS);
			return new Node(nt.ARGUMENTS);
		};

		// Function body: 
		//		"{" statements "}"
		var functionBody = function (p) {
			advance(STARTBRACE, 123);
			var n = newScope(), s = workingScope, code;
			workingScope.parameters = p || new Node(nt.PARAMETERS, { names: [], anames: [] });
			if(tokenIs(THEN)) { // {|args| } form
				if(p)
					throw PE('Attempting to add parameters to a parameter-given function');
				advance(THEN);
				workingScope.parameters.names = parlist();
				advance(THEN);
			};
			workingScope.ready();
			workingScope.code = code = statements();
			endScope();
			checkBreakPosition(code);
			if(s.coroid)
				generateObstructiveness(code);
			else
				implicitReturn(code, s);
			advance(ENDBRACE, 125);
			return new Node(nt.FUNCTION, { tree: s.id });
		};
		// Function body using
		//		COLON
		//			statements
		//		"end"
		var colonBody = function (p) {
			advance(COLON);
			var n = newScope(), s = workingScope;
			workingScope.parameters = p || new Node(nt.PARAMETERS, { names: [], anames: [] });
			workingScope.ready();
			var code = workingScope.code = statements(END);
			endScope();
			checkBreakPosition(code);
			if(s.coroid)
				generateObstructiveness(code);
			advance(END);
			return new Node(nt.FUNCTION, { tree: s.id });
		};

		// Expressional function body
		// COMMA expression(ALAP)

		var expressionalBody = function(p){
			advance(COMMA);
			var n = newScope(true), s = workingScope;
			s.unCorable = true;
			s.parameters = p || new Node(nt.PARAMETERS, { names: [], anames: [] });
			s.ready();
			s.code = new Node(nt.RETURN, {expression: expression()});
			endScope();
			return new Node(nt.FUNCTION, {
				tree: s.id
			});
		}

		var curryBody = function (p) {
			var n = newScope(), s = workingScope;
			workingScope.parameters = p;
			workingScope.ready();
			workingScope.code = new Node(nt.SCRIPT, {
				content: [new Node(nt.RETURN, { expression: functionLiteral(true) })]
			});
			endScope();
			return new Node(nt.FUNCTION, { tree: s.id });
		};

		//@functionLiteral
		// Function literal
		// "function" [Parameters] FunctionBody
		var functionLiteral = function (rebind) {
			var f;
			if (tokenIs(STARTBRACE, RDSTART)) {
				var p = parameters();
			};
			if (tokenIs(STARTBRACE, RDSTART)) { // currying arguments
				f = curryBody(p, rebind);
			} else if (tokenIs(COLON)) {
				f = colonBody(p, rebind)
			} else if (tokenIs(COMMA)) {
				if(opt_colononly)
					throw PE('Only COLON bodies can be used due to `!option colononly`');
				f = expressionalBody(p, rebind);
			} else
				f = functionBody(p, rebind);
			return f;
		};

		// Parameters ->
		// "(" Parameter { "," Parameter } ")"
		// Parameter ->
		// Identifier

		// Only parameters explicitly defined names can be a named parameter
		var parlist = function(){
			var arr = [];
			arr[0] = name();
			while (tokenIs(COMMA)) {
				advance(COMMA);
				arr[arr.length] = name();
			};
			return arr;
		}
		var parameters = function () {
			var arr = [];
			advance(STARTBRACE, 40);
			if (!tokenIs(ENDBRACE, RDEND)) {
				arr = parlist();
			};
			advance(ENDBRACE, RDEND);
			ensure(!HAS_DUPL(arr), 'Parameter list contains duplicate');
			return new Node(nt.PARAMETERS, { names: arr });
		};

		// Array literal
		// "[" CI { "," CI } "]"
		var arrayLiteral = function () {
			advance(STARTBRACE, SQSTART);
			var n = new Node(nt.ARRAY);
			itemlist(n);
			advance(ENDBRACE, SQEND);
			return n;
		};

		var ISOBJLIT = function(){
			if(
					(next && next.isName && !(nextIs(TRY) || nextIs(AWAIT)) || nextIs(STRING)) 
					&& shiftIs(2, COLON) 
					&& !(shiftIs(3, WHEN) || shiftIs(3, OTHERWISE))
			) {
				if(opt_forfunction)
					throw PE('Object literal denied due to !option forfunction');
				return true
			}
		};

		// Lambda Expression content
		var lambdaCont = function (p) {
			advance(LAMBDA);
			var r = newScope(true);
			var s = workingScope;
			s.parameters = p;
			s.unCorable = true;
			s.ready();
			s.code = new Node(nt.RETURN, { expression: expression() });
			endScope();
			return new Node(nt.FUNCTION, {
				tree: s.id
			});
		};
		var isLambdaPar = function () {
			return (
				nextIs(ENDBRACE, RDEND) && shiftIs(2, LAMBDA) ||
				nextIs(ID) && (shiftIs(2, ENDBRACE, RDEND) && shiftIs(3, LAMBDA) || shiftIs(2, COMMA))
			)
		};
		var primary = function () {
			ensure(token, 'Unable to get operand: missing token');
			switch (token.type) {
				case ID:
					// x :> BODY
					// lambda
					if (nextIs(LAMBDA)) {
						var v = name();
						return lambdaCont(new Node(nt.PARAMETERS, {
							names: [v],
							anames: [null]
						}));
						// or variable
					} else if(nextIs(AWAIT)) {
						if(workingScope.unCorable)
							throw PE("Attempting to use AWAIT in a uncorable function");
						workingScope.coroid = true;
						var n = new Node(nt.AWAIT, {
							pattern: name()
						});
						advance();
						return n;
					} else return variable();
				case NUMBER:
				case STRING:
					return literal();
				case CONSTANT:
					return constant();
				case ME:
					return thisp();
				case CALLEE:
					return calleep();
				case MY:
					return thisprp();
				case ARGUMENTS:
					return argsp();
				case OBJECT:
					advance(OBJECT);
					return objinit();
				case DO:
					advance();
					return new Node(nt.DO);
				case STARTBRACE:
					if (token.value === SQSTART) {
						// array
						return arrayLiteral();
					} else if (token.value === RDSTART && isLambdaPar()) {
						return lambdaCont(parameters());
					} else if (token.value === RDSTART) {
						// braced expression (expr)
						advance();
						if(tokenIs(ENDBRACE, RDEND)){
							if(opt_filledbrace)
								throw PE('() for undefined is disabled due to !option filledbrace');
							advance();
							return new Node(nt.LITERAL, {value: void 0})
						}
						var n = expression();
						advance(ENDBRACE, 41);
						// return new Node(nt.GROUP, {operand: n});
						return n;
					} else if (token.value === CRSTART) {
						if(ISOBJLIT()){
							// object literal
							return objinit()
						}
						// Raw function body
						// with no arguments
						else return functionBody(undefined, false);
					}
				case SHARP:
					// # form
					// depended on coming token
					// #{number} --> Arguments[number]
					// #{identifier} --> ArgNS[identifier]
					var p = advance();
					if (tokenIs(NUMBER)) {
						return new Node(nt.MEMBERREFLECT, {
							left : new Node(nt.ARGUMENTS),
							right : literal()
						});
					} else if (token.isName) {
						return new Node(nt.MEMBERREFLECT, {
							left : new Node(nt.ARGN),
							right : new Node(nt.LITERAL, {value: name()})
						});
					} else if (tokenIs(SHARP)) {
						advance();
						return new Node(nt.ARGUMENTS);
					} else if (tokenIs(MY, '@')){
						advance();
						return new Node(nt.ARGN);
					} else {
						// implicit SHARPs
						if(opt_sharpno)
							throw PE('Implicit # was disabled due to !option sharpno', p.position + 1);
						var s = workingScope;
						while(s && s.rebindThis) s = scopes[s.upper - 1];
						if(s.sharpNo++ >= s.parameters.names.length)
							ScopedScript.useTemp(s, 'IARG', s.sharpNo, 1);
						return new Node(nt.SHARP, {
							id :  s.sharpNo
						});
					};
				case FUNCTION:
					// function literal started with "function"
					advance(FUNCTION);
					return functionLiteral();
				default:
					throw PE('Unexpected token' + token);
			};
		};
		var memberitem = function (left) {
			var right;
			if (tokenIs(STARTBRACE, SQSTART)) {  // .[ Expressuib ]  format
				advance();
				right = callItem();
				advance(ENDBRACE, SQEND);
				return new Node(nt.MEMBERREFLECT, { left: left, right: right });
			} else if (tokenIs(STRING)) {
				right = literal();
				return new Node(nt.MEMBERREFLECT, { left: left, right: right });
			} else { // . Identifier  format
				right = name();
				return new Node(nt.MEMBER, { left: left, right: right });
			}
		}
		var member = function () {
			var m = primary();
			// a.b.[e1].c[e2]			...
			while (tokenIs(DOT) || tokenIs(STARTBRACE, SQSTART) && !token.spaced) {
				var t = advance();
				if (t.type === DOT) {
					m = memberitem(m);
				} else {
					// ITEM
					// x[e] === x.item(e)
					m = new Node(nt.ITEM, {
						left: m,
						member: callItem()
					});
					advance(ENDBRACE, SQEND);
				}
			};
			return m;
		};
		var callExpression = function () {
			var m = primary();
			out: while (tokenIs(STARTBRACE) && !token.spaced || tokenIs(DOT)) {
				switch (token.type) {
					case STARTBRACE:
						if (token.value === RDSTART && !token.spaced) { // invocation f(a,b,c...)
							advance();
							m = new Node(nt.CALL, {
								func: m
							});
							if (tokenIs(ENDBRACE,RDEND)) { m.args = []; advance(); continue; };
							arglist(m);
							advance(ENDBRACE, RDEND);
						} else if (token.value === SQSTART) { // ITEM operator
							// a[e] === a.item(e)
							advance();
							m = new Node(nt.ITEM, {
								left: m,
								member: callItem()
							});
							advance(ENDBRACE, SQEND);
						} else if (token.value === CRSTART && !token.spaced){
							if(ISOBJLIT()){
								m = new Node(nt.CALL, {
									func: m,
									args: [objinit()],
									names: [null]
								})					
							} else {
								m = new Node(nt.CALL, {
									func: m,
									args: [functionBody(undefined)],
									names: [null]
								})
							}
						} else {
							break out;
						}
						continue;
					case DOT:
						advance();
						m = memberitem(m);
						continue;
				}
			};
			return m;
		};
		var arglist = function (nc, omit) {
			var args = [], names = [], pivot, name, sname, nameused;
			do {
				if ((token.isName || tokenIs(STRING)) && nextIs(COLON)) {
					// named argument
					// name : value
					name = token.value, sname = true, nameused = true;
					advance();
					advance();
				}
				// callItem is the "most strict" expression.
				// without omissioned calls and implicit calls.
				// so you cannot write `f(1, 2, a:3)` like `f 1, 2, a:3`.
				pivot = callItem(omit);
				args.push(pivot);
				if (sname) {
					names[args.length - 1] = name;
					sname = false;
				}
				if (!token || token.type !== COMMA) {
					break
				};
				advance();
			} while (true);
			ensure(!HAS_DUPL(names), 'Named argument list contains duplicate');
			nc.args = (nc.args || []).concat(args);
			nc.names = (nc.names || []).concat(names);
			nc.nameused = nc.nameused || nameused;
		};

		var itemlist = function (nc) {
			var args = [], names = [], pivot, name, sname, nameused;
			if (!tokenIs(ENDBRACE, SQEND))
				do {
					pivot = callItem();
					args.push(pivot);
					if (sname) {
						names[args.length - 1] = name;
						sname = false;
					}
					if (!token || token.type !== COMMA) {
						break
					};
					advance();
				} while (true);

			nc.args = args;
			return nc;
		};

		var unary = function () {
			// unary expression
			if (tokenIs(OPERATOR) && (token.value === '-' || token.value === 'not')) {
				var t = advance(OPERATOR);
				var n = callExpression();
				return new Node(t.value === '-' ? nt.NEGATIVE : nt.NOT, { operand: n });
			} else {
				return callExpression();
			}
		};


		var operatorPiece = function(){
			var L = 0, R = 1, N = 2;
			var bp = {
				'of': 5,
				'*': 10, '/': 10, '%': 10,
				'+': 20, '-': 20,	
				'<<': 25, '>>': 25,
				'<=>': 27,
				'<': 30, '>': 30, '<=': 30, '>=': 30,
				'is': 35, 'in': 35,
				'==': 40, '!=': 40, '=~': 40, '!~': 40, '===':40, '!==':40,
				'and': 50, 'or': 55,
				'as': 60,
				'~~' : 65,
				'->': 70
			};
			var combp = {
				'of': R,
				'*': L, '/': L, '%': L,
				'+': L, '-': L,
				'<<': L, '>>': R,
				'<=>': N,
				'<': N, '>': N, '<=': N, '>=': N,
				'is': L, 'in': L,
				'==': N, '!=': N, '=~': N, '!~': N, '===':N, '!==':N,
				'and': R, 'or': R,
				'as': L,
				'~~' : L,
				'->': R
			}

			return function (start, progress) {
				// operators.
				// the "->" operator gets a "Rule" object
				// the "is","in","as",">>","<<" operators are costumizable.
				var uber = { right: start, bp: 65536 }, t, tv, operand, nbp, combining, n, node, p;
				while (tokenIs(OPERATOR) && ensure(bp[token.value] > 0, "Invalid Operator")) { 
					// if is a valid operator, then...
					t = advance(OPERATOR), tv = t.value, p = t.position;
					operand = progress();
					nbp = bp[tv], combining = combp[tv];
					node = new Node(nt[tv], {
						right: operand,
						bp: nbp
					});
					n = uber;
					if(combining === L || combining === N) {
						// Left combining & uncombining
						/*    H       H
						 *   / X ->  / !
						 *    / \     X R
						 *           / \
						 */
						while (n.right.bp > nbp)
							n = n.right;
						if (combining === 2 && n.right.bp === nbp)
							throw PE("Attempting to combine uncombinable operator", p);
						node.left = n.right;
						n.right = node;
					} else if (combining === R){
						/* Right combining
						 *     H             H
						 *      L     ->      L
						 *     / L           / L
						 *      / \           / !
						 *         A           A R
						 */
						while (n.right.bp >= nbp)
							n = n.right;
						node.left = n.right;
						n.right = node;
					}
				};
				uber.right.bp = 0;
				return uber.right;
			};
		}();
		var operating = function(){
			var start = unary();
			return operatorPiece(start, unary);
		}
		var isExpFin = function(){
			var check = [];
			check[END] = 1;
			check[ELSE] = 1;
			check[WHEN] = 1;
			check[OTHERWISE] = 1;
			check[SEMICOLON] = 1;
			check[ENDBRACE] = 1;
			check[THEN] = 1;
			check[TRY] = 1;
			check[CATCH] = 1;
			check[FINALLY] = 1;
			check[IF] = 1;
			check[COMMA] = 1;
			check[COLON] = 1;
			check[DOT] = 1;
			return function(){
				return !token || check[token.type] === 1;
			}
		}();

		var omissionCall = function (node) {
			if (isExpFin()) return node;
			var n_ = node;
			node = new Node(nt.CALL, { func: n_ });
			arglist(node, true);
			if (node.args.length === 1 && node.names[0] == null) {
				return new Node(nt.CALL, {
					func: n_,
					args: [omissionCall(node.args[0])],
					names: [null]
				})
			} else {
				return node;
			}
		};

		var ASSIGNIS = function(){
			var assi = {
				'+=' : 1,
				'-=' : 1,
				'*=' :1,
				'/=':1,
				'%=':1,
				'<<=':1,
				'>>=':1
			};
			return function(){
				return tokenIs(OPERATOR) && assi[token.value]===1
			};

		}();

		var expression = function () {
			// expression.
			// following specifics are supported:
			// - Omissioned calls
			// - "then" syntax for chained calls

			var right, c = unary();
			if (tokenIs(OPERATOR, '=')){
				advance();
				return new Node(nt['='], {
					left: c,
					right: expression()
				});
			} else if (ASSIGNIS()) { //赋值
				var _v = token.value;
				advance();
				return new Node(nt['='], {
					left: c,
					right: new Node(nt[_v.slice(0, _v.length - 1)], {
						left:c, right:expression()
					})
				});
			}


			var method, isOmission = false, curry = false, pipelike = false;
			if(tokenIs(OPERATOR)){
				c = operatorPiece(c, unary);
				isOmission = false
			} else {
				c = omissionCall(c);
			}

			// possible pipelines

			while(tokenIs(THEN)){
				advance();
				isOmission = false;

				if (tokenIs(COLON)) {
					return new Node(nt.CALL, {
						func: c,
						args: [colonBody()],
						names: [null]
					});
				} else if (tokenIs(DOT)) {
					// |.name chaining
					advance(DOT);
					ensure(token && token.isName, 'Missing identifier for Chain invocation');
					method = name();
					c = new Node(nt.CALL, {
						func: new Node(nt.MEMBER, {
							left: c,
							right: method
						}),
						args: [],
						names: []
					});
				} else {
					// pipeline
					method = callExpression();
					c = new Node(nt.CALL, {
						func: method,
						args: [c],
						names: [null],
						pipeline: true
					});
				};
				if(tokenIs(THEN)) continue;
				if(isExpFin()) break;
				arglist(c, true);
			};
			
			c.pipelike = false;

			return c;
		};
		var callItem = function(omit){
			var node = unary();
			if (isExpFin()) return node;
			if(tokenIs(OPERATOR)){
				return operatorPiece(node, unary);
			} else {
				if(omit) return node;
				return new Node(nt.CALL, {
					func: node,
					args: [callItem()],
					names: [null]
				})
			}
			return node;
		};


		var stover = function () {
			return !token || (token.type === SEMICOLON || token.type === END || token.type === ENDBRACE && token.value === CREND);
		}

		var endS = false;
		var stmtover = function(){endS = true}


		var statement =  function(){
			var r = statement_r.apply(this, arguments);
			stmtover();
			return r;
		};
		var statement_r = function () {
			if (token)
				switch (token.type) {
				case PASS:
					advance();
					ensure(stover(), "Unexceped PASS")
					return;
				case RETURN:
					advance();
					return ifaffix(new Node(nt.RETURN, { expression: expression() }));
				case THROW:
					advance();
					return new Node(nt.THROW, { expression: expression() });
				case IF:
					return ifstmt();
				case WHILE:
					return whilestmt();
				case REPEAT:
					return repeatstmt();
				case PIECEWISE:
					return piecewise();
				case CASE:
					return piecewise(true);
				case FOR:
					return forstmt();
				case LABEL:
					return labelstmt();
				case BREAK:
					return brkstmt();
				case END:
				case ELSE:
				case OTHERWISE:
				case WHEN:
					throw PE('Unobtained END,ELSE,WHEN or OTNERWISE');
				case VAR:
					advance();
					return vardecls();
				case USING:
					return usingstmt();
				case TRY:
					return trystmt();
				case ENDBRACE:
					if (token.value === CREND)
						return;
				case OPERATOR:
					if (token.value === '=') {
						advance();
						return ifaffix(new Node(nt.RETURN, { expression: expression() }));
					}
				default:
					return ifaffix(new Node(nt.EXPRSTMT, {expression: expression(), exprStmtQ : true}));
			};
		};
		var blocky = function(node){
			if(node.type !== nt.SCRIPT){
				return new Node(nt.SCRIPT, { content: [node] });
			} else return node;
		}
		var vardecls = function () {
			if (nextIs(OPERATOR, '=')) { // assigned variable
				var v = variable();
				workingScope.newVar(v.name);
				advance();
				return new Node(nt['='], {
					left: new Node(nt.VARIABLE, { name: v.name }),
					right: expression()
				});
			} else {
				var a = [vardecl()];
				while (token && token.type === COMMA) {
					advance();
					a.push(vardecl());
				}
			};
			ensure(stover(), "Invalid VAR declaration");
		};
		var vardecl = function () {
			var v = variable();
			workingScope.newVar(v.name);
			return new Node(nt.VARDECL, {
				name: v.name
			});
		};
		var fivardecl = function (c) {
			var v = variable();
			if(c) workingScope.newVar(v.name);
			return new Node(nt.VARDECL, {
				name: v.name
			});
		};
		var usingstmt = function(){
			advance(USING);
			var n = new Node(nt.USING);
			var a = [fivardecl(true)];
			if(tokenIs(OPERATOR, 'as')){
				advance();
				return new Node(nt.IMPORT,{
					importVar: a[0],
					expression: expression()
				});
			}
			while(tokenIs(COMMA)){
				advance();
				a.push(fivardecl(true));
			};
			advance(OPERATOR, 'in');
			n.names = a;
			n.expression = expression();
			return n;
		}

		var contBlock = function () {
			if(tokenIs(COLON)) {
				var p = advance().position;
				var s = statements();
				ensure(token, 'Unterminated control block', p);
				advance(END);
				return s;
			} else if (tokenIs(COMMA)) {
				if(opt_colononly)
					throw PE('Only COLON bodies can be used due to `!option colononly`');
				advance();
				var s = statement_r();
		//		while (token && token.type === SEMICOLON) advance();
				return blocky(s);
			} else throw PE('Flow control body not started with COMMA or COLON');
		};

		var ifstmt = function () {
			advance(IF);
			var n = new Node(nt.IF);
			n.condition = callItem();
			if(tokenIs(COLON)){
				var p = advance().position;
				n.thenPart = statements(ELSE);
				ensure(token, "Unterminated control block", p);
				if(tokenIs(ELSE)){
					advance(ELSE);
					if(tokenIs(IF)){
						n.elsePart = blocky(ifstmt());
					} else {
						n.elsePart = contBlock();
					}
				} else if (tokenIs(END)) {
					advance(END);
				} else {
					throw PE("Unterminated control block", p);
				}
			} else if (tokenIs(COMMA)){
				advance(COMMA);
				if(opt_colononly)
					throw PE('Only COLON bodies can be used due to `!option colononly`');
				n.thenPart = blocky(statement_r());
				while(tokenIs(SEMICOLON)) advance();
				if(tokenIs(ELSE) && (nextIs(IF) || nextIs(COMMA))){
					advance(ELSE);
					if(tokenIs(IF)){
						n.elsePart = blocky(ifstmt());
					} else {
						advance(COMMA);
						n.elsePart = blocky(statement_r());
					}
				}
			} else {
				throw PE('Flow control body not started with COMMA or COLON');
			}
			return n;
		};
		var ifaffix = function(given){
			if(tokenIs(IF)){
				advance(IF);
				return new Node(nt.IF, {
					condition: callItem(), 
					thenPart: given,
					exprStmtQ: given.exprStmtQ
				});
			} else return given;
		};

		var whilestmt = function () {
			advance(WHILE);
			var n = new Node(nt.WHILE, {
				condition: callItem(),
				body: contBlock()
			});
			return n;
		};
		var repeatstmt = function () {
			advance(REPEAT);
			advance(COLON);
			var n = new Node(nt.REPEAT, {
				body: statements(UNTIL)
			});
			advance(UNTIL);
			n.condition = callItem();
			return n;
		};
		var forstmt = function () {
			var node;
			advance(FOR);
			if(tokenIs(STARTBRACE, RDSTART)){
				node = new Node(nt.FOR);
				advance(STARTBRACE, RDSTART);
				ensure(token);
				if (token.type !== SEMICOLON) {
					if (token.type === VAR) {
						advance(VAR);
						node.start = vardecls();
					} else {
						node.start = expression();
					}
				};
				advance(SEMICOLON);
				if (token.type !== SEMICOLON) {
					node.condition = expression();
				} else {
					throw PE('The condition of a FOR loop mustn\'t be empty.');
				}
				advance(SEMICOLON);
				if (token.type !== ENDBRACE && token.value !== RDEND) {
					node.step = expression();
				};

				advance(ENDBRACE, RDEND);
			} else {
				node = new Node(nt.FORIN);
				node.no = ++ workingScope.finNo;
				var declQ = false;
				if(tokenIs(PASS)){
					advance(PASS);
					if(tokenIs(VAR)){
						advance(VAR);
						declQ = true;
					};
					node.pass = true;
					node.passVar = fivardecl(declQ);
				} else {
					if(tokenIs(VAR)){
						advance(VAR);
						declQ = true;
					};
					var decls = [fivardecl(declQ)];
					while(tokenIs(COMMA)){
						advance(COMMA);
						decls.push(fivardecl(declQ));
					};
				}
				node.vars = decls;
				advance(OPERATOR, 'in');
				node.range = callItem();
			}
			node.body = contBlock();
			return node;
		};
		var stripSemicolons = function () {
			while (tokenIs(SEMICOLON)) advance();
		};
		var piecewise = function (t) {
			var n = new Node(t ? nt.CASE : nt.PIECEWISE);
			n.conditions = [], n.bodies = [];
			advance();
			if (t) {
				n.expression = callItem();
			};
			advance(COLON);
			stripSemicolons();
			ensure(token, 'Unterminated piecewise/case block');
			while (tokenIs(WHEN) || tokenIs(OTHERWISE)) {
				if (tokenIs(WHEN)) {
					advance(WHEN);
					var condition = callItem();
					advance(COLON);
					stripSemicolons();
					if (token.type === WHEN) {
						n.conditions.push(condition);
						n.bodies.push(null);
						continue;
					} else {
						n.conditions.push(condition);
						n.bodies.push(statements(WHEN, OTHERWISE));
					}
				} else {
					advance(OTHERWISE);
					advance(COLON);
					n.otherwise = statements(END);
					break;
				}
			};
			advance(END);

			return n;
		};
		var labelstmt = function () {
			advance(LABEL);
			ensure(tokenIs(ID));
			var label = lname();
			ensure(!workingScope.labels[label] && workingScope.labels[label] !== 0, 'Unable to re-label a statement');
			var node = new Node(nt.LABEL, {
				name: label
			});
			workingScope.labels[label] = node;
			advance(COMMA);
			ensure(tokenIs(WHILE) || tokenIs(FOR) || tokenIs(REPEAT), "You can only label a loop statement");
			node.body = new Node(nt.SCRIPT, {
				content: [ statement() ]
			});
			workingScope.labels[label] = 0;
			return node;
		};
		var brkstmt = function () {
			advance(BREAK);
			if (tokenIs(ID)) {
				var name = token.value;
				advance();
				if (workingScope.labels[name] && workingScope.labels[name].type === nt.LABEL) {
					ensure(stover(), 'Something more after BREAK statement');
					return new Node(nt.BREAK, { destination: name });
				} else {
					throw PE('BREAK statement used a unfound label');
				}
			} else {
				ensure(stover(), 'Something more after BREAK statement');
				return new Node(nt.BREAK, { destination: null });
			}
		};
		var trystmt = function(){
			var n = new Node(nt.TRY), v;
			advance(TRY);
			advance(COLON);
			n.trystmts = statements(CATCH, END);
			if(tokenIs(END)) {
				advance(END);
				return n;
			} else {
				advance(CATCH);
				n.catchvar = v = variable();
				workingScope.newVar(v.name);
				advance(COLON);
				n.catchstmts = statements();
				advance(END);
				return n;
			}
		}
		var statements = function (fin, fin2) {
			var script = new Node(nt.SCRIPT);
			var _t = endS, s;
			stripSemicolons();
			s = statement();
			var a = s ? [s] : [];


			while (endS && token) {
				curline = token.line;
				endS = false;
				stripSemicolons();
				if (token && (tokenIs(fin) || tokenIs(END) || tokenIs(ENDBRACE, CREND) || tokenIs(fin2))) break;
				s = statement();
				if(s)
					a.push(s);
			}
			//ensure(!token || token.type === fin, "Unfinished statement block");
			script.content = a;
			endS = _t;
			return script;
		};



		///
		
		
		newScope();
		var ws = workingScope;
		ws.unCorable = true;
		ws.parameters = new Node(nt.PARAMETERS, {
			names: [],
			anames: []
		});
		ws.code = statements();
		ensure(!token, "Unexpected script ending");

		ws.thisOccurs = true;
		
		initInterator(function(v, n){
			ScopedScript.registerVariable(ws, n);
			// varname = this[varname]
			ws.initHooks[n] = new Node(nt.MEMBER, {
				left: new Node(nt.THIS),
				right: n
			})
		});

	 	resolveVariables(ws, scopes, opt_explicit, {source: source, language: "lofn"});

		return {scopes: scopes, options: input.options};
	};

	lofn.funcoids = {};
	lofn.funcoids["DO"] = function(node, env, args, arg0rear){
		// arg0(arg1..)
		if(arg0rear){
			var a0 = arg0rear.combine(args[0]);
			return "(" + a0.full + ".apply(" + a0.front + ", [" + args.slice(1).join(', ') + "]))"
		} else {
			return '(' + args[0] + '(' + args.slice(1).join(', ') + '))'
		}		
	}
}(EISA_eisa);
