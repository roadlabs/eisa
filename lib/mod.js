ESSENTIA_module.declare("mod", [], function(req, exports){
	exports.module = ESSENTIA_module;
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
				return EISA_eisa.using(libs, f)
			}
		} else {
			return EISA_eisa.using(libs, f)
		};
	};
});
