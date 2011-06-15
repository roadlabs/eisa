var entdef = ['global.require', 'module.exports']

var cf = function(f){
	var s = f + '';
	var decl = s.match(/^\s*function(?:[ \t]+\w+)?\s*\(([^\)]*)\)\s*\{/);
	var enterVars = decl[1].split(/,\s*/);
	var t = ''
	for(var i = 0; i < enterVars.length; i++){
		t += 'var ' + enterVars[i] + ' = ' + entdef[i] + ';';
	};
	return '(' + s + ')(require, exports)'
}

var NECESSARIA_module = function(module){
	var req = require;
	module.provide = function(paths, f){
		fs.writeFileSync(output, cf(f));
	}
	module.declare = function(f){
		fs.writeFileSync(output, cf(arguments[arguments.length - 1]));
	}
	return module
}({})

var vm = require('vm');
var fs = require('fs');
var output = process.argv[3]
var p = process.argv[2];
vm.runInNewContext(fs.readFileSync(p), {
	NECESSARIA_module: NECESSARIA_module
});
