var path = require('path')
var opts = require('opts')
var eisa = require('eisa.rt')
var compiler = require('lfc/compiler')
var util = require('util')
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglifya

var target = require('./targets/necessaria');

var globalVars = {};
var initModules = ['stl', 'mod'];

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

opts.parse([
	{short: 'g', long: 'global', value: true,
		callback: function(v){ globalVars[v] = {} }},
	{short: 't', long: 'target', value: true,
		callback: function(v){ target = require('./targets/' + v);}},
	{short: 'm', long: 'module', value: true,
		callback: function(mod){ initModules.push(mod) }}
], [{name: 'input', required: true, callback: function(value){
	path.exists(value, function(existQ){
		if(existQ){
			new compiler.Script(
				require('fs').readFileSync(value, 'utf-8'), 
				null,
				[globalVars].concat(initModules).concat(target.clibs || {}),
				function(script){
					console.log(target.wrap(script.compile().wrappedSource, initModules.map(STRIZE)))
				})
		} else {
			util.debug('File ' + value + ' Does Not Exist')
		}
	})
}}])
