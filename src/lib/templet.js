NECESSARIA_module.declare('templet', ['stl'], function(r, exports){
	var sEscape = function(s){
		return s.replace(/[\\"\r\n\t]/g, function(s){
			return {'\\': '\\\\', '"': '\\"', '\r': '\\r', '\n': '\\n', '\t': '\\t'}[s];
		});
	};
	exports.make = function(pattern, formats){
		formats = formats || {};
		var walk = r('stl').RegExp.walk;
		var q = [], nslots = 0;
		var uformat = false;
		walk(/%(?!%)(?:([a-zA-Z])(?:\[([^\[\]]*)\])?)?([1-9]\d*)/g, pattern, 
			function(match, method, arg, slot){
				var slotid = parseInt(slot, 10);
				if(slotid > nslots) nslots = slotid;
				if(slotid <= 0) return true;
				var slotv = 's' + slotid;
				if(method && formats[method]){
					uformat = true;
					q.push("this." + method + "(" + slotv + ", \"" + (sEscape(arg || '')) + "\")");
				} else {
					q.push(slotv)
				};
			},
			function(s){
				q.push('"' + sEscape(s.replace(/%%/g, '%')) + '"')
			});

		var args = [];
		for(var i = 0; i < nslots; i++){
			args[i] = 's' + (i + 1);
		};
		if(uformat){
			var f = Function(args, 'return ' + q.join(' + '));
			return function(){
				return f.apply(formats, arguments)
			}
		} else {
			return Function(args, 'return ' + q.join(' + '));
		};
	};
});
