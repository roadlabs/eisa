var wDump = require('fs').readFileSync(__dirname + '/node.inc', 'utf-8');

exports.wrap = function(s, l){
	return 'require("eisa.rt").exec_(["stl", "mod",' + wDump + (l ? ',' + l.join(',') : '') + '], ' + s + ');'
}
exports.clibs = eval(wDump);
