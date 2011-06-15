exports.wrap = function(s, l){
	return 'NECESSARIA_module.provide(["eisa.rt"], function(require){ require("eisa.rt").exec_(["stl", "mod"' + 
			(l ? ',' + l.join(',') : '') + '], ' + s + ') });'
}
