//:module: compiler
//	:author:		infinte (aka. be5invis)
//	:info:			The code generator for Eisa Runtime

NECESSARIA_module.declare("lfc/compiler", ['eisa.rt', 'lfc/compiler.rt', 'lfc/parser', 'lfc/codegen'], function (require, exports) {
	var eisa = require('eisa.rt');
	var EISA_UNIQ = eisa.runtime.UNIQ;
	var OWNS = eisa.runtime.OWNS;
	var C_TEMP = require('lfc/codegen').C_TEMP;
	var PART = require('lfc/codegen').PART;
	var lfcrt = require('lfc/compiler.rt');
	var nt = lfcrt.NodeType;
	var ScopedScript = lfcrt.ScopedScript;

	//============
	var lex = exports.lex = require('lfc/parser').lex;
	var parse = exports.parse = require('lfc/parser').parse;

	var compileFunction = require('lfc/codegen').compileFunction;

	var compile = exports.compile = function (ast) {
		
		var trees = ast.scopes;
		var enter = trees[0];

		var enterText = "var undefined;\n" + function(){
			var s = '';
			for(var item in eisa.runtime) if(OWNS(eisa.runtime, item)) {
				s += 'var EISA_' + item + ' = ' + PART(C_TEMP('RUNTIME'), item) + ';\n';
			};
			return s;
		}();

		var generatedSource = compileFunction(enter, '', '', trees);

		var finalSource = enterText + 'return ' + generatedSource;
		var f = Function(C_TEMP('RUNTIME'), C_TEMP('INIT'), finalSource);
		return {
			func: f,
			source: finalSource,
			generatedSource: generatedSource,
			wrappedSource: 'function(' + [C_TEMP('RUNTIME'), C_TEMP('INIT')].join(',') + '){' + finalSource + '}'
		}
	};

	exports.Script = function(source, config, libraries, callback) {
		var libs = libraries || [];
		eisa.using(libs, function(initvs, inita) {
			var ast = parse(lex(source), source, inita);
			var lfcr;

			return callback({
				compile: function() {
					lfcr = compile(ast); 
					return lfcr;
				},
				start: function() {
					if (!lfcr) this.compile();
					eisa.exec_(libs, lfcr.func, this, arguments);
				}
			})
		});
	};
});
