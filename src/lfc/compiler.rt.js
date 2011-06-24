//:module: compiler runtime -- compilerrt
//	:author:		infinte (aka. be5invis)
//	:info:			The essential environment for Eisa Compiler

NECESSARIA_module.declare("lfc/compiler.rt", ['eisa.rt'], function(require, exports){

	var eisa = require('eisa.rt');
	var Nai = eisa.Nai;

	var derive = eisa.derive;
	
	var CompileErrorMeta = exports.CompileErrorMeta = function(prefix){
		return function(message, pos, source){
			var lineno = ('\n' + source.slice(0, pos)).match(/\n/g).length;
			var lineno_l = lineno.toString().length;
			message = '[' + prefix + '] ' + message + '\nat line: ' + lineno;
			message += '\n ' + lineno + ' : ' + (source.split('\n')[lineno - 1]);
			message += '\n-' + (lineno + '').replace(/./g, '-') + '---' + (source.slice(0, pos).split('\n')[lineno - 1].replace(/./g, '-').replace(/$/, '^'));
	
			var e = new Error(message);
			return e;
		};
	};

	var NodeType = exports.NodeType = function () {
		var types = [
			// Unknown type
			'UNKNOWN',
			// Primary
			'VARIABLE', 'TEMPVAR', 'THIS', 'LITERAL', 'ARRAY', 'OBJECT',
			'ARGUMENTS', 'CALLEE', 'ARGN', 'GROUP', 'WAIT', 'YIELD', 'CTOR',
			// Membering
			'MEMBER', 'ITEM', 'MEMBERREFLECT', 
			// Invocation
			'DO', 'CALL', 'NEW', 'FUNCOID',
			// Operators
			'NEGATIVE', 'NOT',

			'of',
			'*', '/','%',
			'+', '-',
			'<<', '>>',
			'<', '>', '<=', '>=', '<=>', 'is', 'in',
			'==', '!=', '=~', '!~', '===', '!==',
			'and', 'or',

			'as', '~~',
			'->',
			// Lambda
			':>',
			// Assignment
			'=',
			// Conditional
			'CONDITIONAL',
			// Statements
			'EXPRSTMT', 
			'IF', 'FOR', 'FORIN', 'WHILE', 'REPEAT', 'CASE', 'PIECEWISE', 'VAR',
			'BREAK', 'LABEL', 'THROW', 'RETURN', 'TRY', 
			// modular
			'USING', 'IMPORT',
			// Variable
			'VARDECL',
			// Large-scale
			'BLOCK', 'FUNCTION', 'PARAMETERS', 'BODY', 'SCRIPT', 'SCOPE'];

		var T = {};
		for (var i = 0; i < types.length; i++)
			T[types[i]] = i;
		return T;
	} ();

	var ScopedScript = exports.ScopedScript = function (id, env) {
		this.code = {type: NodeType.SCRIPT};
		this.variables = env ? derive(env.variables) : new Nai;
		this.varIsArg = new Nai;
		this.labels = {};
		this.upper = null;
		this.type = NodeType.SCOPE;
		this.nest = [];
		this.locals = [];
		this.id = id;
		this.parent = env;
		this.usedVariables = new Nai;
		this.usedVariablesOcc = new Nai;
		this.usedTemps = {};
		this.grDepth = 0;
		this.sharpNo = 0;
		this.finNo = 0;
		this.coroid = false;
		this.initHooks = {};
	};

	ScopedScript.prototype.newVar = function (name, isarg) {
		return ScopedScript.registerVariable(this, name, isarg);
	};
	ScopedScript.prototype.useVar = function (name, position) {
		this.usedVariables[name] = true;
		if(this.usedVariablesOcc[name] === undefined)
			this.usedVariablesOcc[name] = position;
	};
	ScopedScript.prototype.ready = function () {
		if (this.parameters) {
			for (var i = 0; i < this.parameters.names.length; i++) {
				this.newVar(this.parameters.names[i], true)
			}
		}
	};
	ScopedScript.prototype.cleanup = function(){
		delete this.sharpNo;
		delete this.labels;
		delete this.variables;
		delete this.usedVariables;
		delete this.usedVariablesOcc;
	};
	
	ScopedScript.generateQueue = function(scope, trees, arr){
		if(!arr) arr = [];
		for(var i = 0; i < scope.nest.length; i++)
			ScopedScript.generateQueue(trees[scope.nest[i]], trees, (arr));
		arr.push(scope);
		return arr;
	};

	ScopedScript.useTemp = function(scope, name, processing){
		// Processing:
		// 0: As variable
		// 1: As Parameter
		// 2: Special
		scope.usedTemps[name] = (processing || 0) + 1;
	};
	ScopedScript.VARIABLETEMP = 0;
	ScopedScript.PARAMETERTEMP = 1;
	ScopedScript.SPECIALTEMP = 2;
	
	ScopedScript.registerVariable = function(scope, name, argQ, useQ) {
		if (scope.variables[name] === scope.id) return;
		// scope.locals.push(name);
		scope.varIsArg[name] = argQ === true;
		if(useQ){
			scope.usedVariables[name] = true;
		}
		return scope.variables[name] = scope.id;
	};

	var CompileError = exports.CompileError = CompileErrorMeta("EISA");

	exports.walkNode = function(node, f, aux){
		if(!node) return;
		if(!node.type) return;
		for(var each in node) if(node[each]){
			var prop = node[each];
			if(prop.length){
				for(var i = 0; i < prop.length; i++)
					if(prop[i] && prop[i].type)
						f(prop[i], aux)
			} else if (prop.type) {
				f(prop, aux)
			}
		}
	};

});
