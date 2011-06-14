//:module: lib/async
//	:author:		infinte (aka. be5invis)
//	:info:			perform essential asynchronous support with YIELD
NECESSARIA_module.declare('async', ['eisa.rt', 'stl'], function(req, exports){
	var derive = req('stl').derive;
	var composing = req('stl').composing;
	var schemata_m = req('eisa.rt').runtime.OBSTRUCTIVE_SCHEMATA_M;
	
	var asyncSchemata = derive(schemata_m);

	exports.async = function(M){
		if(M.build){
			var g = M.build(asyncSchemata);
			return function(){
				return g.apply(this, arguments)()
			}
		} else
			return function(){ return M.apply(this, arguments) }
	};
	exports.asyncTask = function(M){
		if(M.build){
			return function(){
				var s = derive(asyncSchemata);
				if(typeof arguments[arguments.length - 1] === 'function')
					s['return'] = arguments[arguments.length - 1]
				return M.build(s).apply(this, arguments)()
			}
		} else
			return function(){ return M.apply(this, arguments) }
	};
	exports.wait = function(time, f){ return setTimeout(f, time) }
});
