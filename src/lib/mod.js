NECESSARIA_module.declare("mod", ['eisa.rt'], function(req, exports){
	var eisa = req('eisa.rt');
	exports.module = NECESSARIA_module;
	exports['imported'] = function(args_){
		var f, libs = [];
		for(var i = 0; i < arguments.length; i++){
			switch(typeof arguments[i]){
				case 'function': f = arguments[i]; break;
				default: libs.push(arguments[i]);
			};
		}
		if(!f){
			return function(f){
				return eisa.using(libs, f)
			}
		} else {
			return eisa.using(libs, f)
		};
	};
});
