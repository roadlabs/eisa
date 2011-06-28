//:module: compiler
//	:author:		infinte (aka. be5invis)
//	:info:			The code generator for Eisa Runtime

NECESSARIA_module.declare("lfc/compiler", ['eisa.rt', 'lfc/compiler.rt', 'lfc/parser', 'lfc/codegen'], function (require, exports) {
	var eisa = require('eisa.rt');
	var EISA_UNIQ = eisa.runtime.UNIQ;
	var OWNS = eisa.runtime.OWNS;
	var C_TEMP = require('lfc/codegen').C_TEMP;
	var PART = require('lfc/codegen').PART;
	var STRIZE = require('lfc/codegen').STRIZE;
	var lfcrt = require('lfc/compiler.rt');
	var nt = lfcrt.NodeType;
	var ScopedScript = lfcrt.ScopedScript;

	//============
	var lex = exports.lex = require('lfc/parser').lex;
	var parse = exports.parse = require('lfc/parser').parse;

	var compileInit = require('lfc/codegen').init;
	var compileFunction = require('lfc/codegen').compileFunction;

	var compile = exports.compile = function (ast, source) {
		var getSource = function(){
			var a = source.split('\n');
			var remap = [0];
			a.forEach(function(s){
				remap.push(remap[remap.length - 1] + s.length + 1)
			});

			var mins = 0

			return function(s, t){
				for(var i = mins; i < remap.length; i++) if(remap[i] > s)
					for(var j = i; i < remap.length; j++) if(remap[j] > t) {
						mins = j + 1;
						return source.slice(remap[i - 1], remap[j]).replace(/\s+$/, '')
					};
				return ''
			}
		}()

		var trees = ast.scopes;
		var enter = trees[0];

		var enterText = "var undefined;\n" + function(){
			var s = '';
			for(var item in eisa.runtime) if(OWNS(eisa.runtime, item)) {
				s += 'var EISA_' + item + ' = ' + PART(C_TEMP('RUNTIME'), item) + ';\n';
			};
			return s;
		}();

		compileInit(trees);
		var generatedSource = compileFunction(enter, '', '', trees, getSource);

		if(ast.debugQ){
			generatedSource = generatedSource.replace(/^\s*\/\*@LFC-DEBUG (\d+),(\d+)@\*\/.*$/gm, function(m, $1, $2){
				return getSource($1 - 0, $2 - 0).split('\n').filter(function(s){ return !!s })
					.map(function(s){ return STRIZE('[LFC-DEBUG]: ' + s) + ";" }).join('\n')
			})
		}

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
					lfcr = compile(ast, source); 
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
