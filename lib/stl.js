//:^
// Eisa standard library
//	:author:		infinte (aka. be5invis)
//	:info:			The standard library for Lofn.

eisa.stl = NECESSARIA_module.declare('stl', [], function(req, exp){
	
	var reg = function(name, value){
		exp[name] = value
	};

	//: eisart
	reg('Rule', Rule);
	reg('derive', derive);
	reg('NamedArguments', NamedArguments);

	//: composing
	reg('composing', function(obj_){
		var obj = derive(obj_);
		for(var i = 1; i < arguments.length; i++){
			if(arguments[i] instanceof EISA_Rule)
				obj[arguments[i].left] = arguments[i].right;
			else if (arguments[i] instanceof EISA_NamedArguments)
				NamedArguments.each(arguments[i], function(val, prop){
					obj[prop] = val
				});
			else {
				for(var each in arguments[i])
					if(EISA_OWNS(arguments[i], each))
						obj[each] = arguments[i][each];
			}
		}
		return obj;
	});
	reg('endl', '\n');

	//: PrimitiveTypes
	reg('Math', derive(Math));
	reg('RegExp', function(){
		var R = function(){
			return RegExp.apply(this, arguments)
		};
		R.be = function(o){
			return o instanceof RegExp
		};
		R.convertFrom = function(s){
			return RegExp(s)
		};
		
		var rType = function(options){
			R[options] = function(s){
				return RegExp(s, options)
			};
			R[options].convertFrom = function(s){
				return RegExp(s, options)
			}
		};

		rType('g');
		rType('i');
		rType('m');
		rType('gi');
		rType('gm');
		rType('im');
		rType('gim');

		R.walk = function(r, s, fMatch, fGap){
			var l = r.lastIndex;
			fMatch = fMatch || function(){};
			fGap = fGap || function(){};
			var match, last = 0;
			while(match = r.exec(s)){
				if(last < match.index) fGap(s.slice(last, match.index));
				if(fMatch.apply(this, match)) fGap.apply(this, match);
				last = r.lastIndex;
			};
			if(last < s.length) fGap(s.slice(last));
			r.lastIndex = l;
			return s;
		};

		return R;
	}());
	reg('Array', function(){
		var A = function(){
			return Array.apply(this, arguments)
		};
		A.be = function(x){
			return x instanceof Array
		};
		A.convertFrom = function(x){
			return EISA_SLICE(x, 0)
		};

		return A;
	}());
	reg('Date', function(){
		var f = function(){
			var a = arguments;
			switch(a.length){
				case 0: return new Date();
				case 1: return new Date(a[0]);
				case 2: return new Date(a[0], a[1]);
				case 3: return new Date(a[0], a[1], a[2]);
				case 4: return new Date(a[0], a[1], a[2], a[3]);
				case 5: return new Date(a[0], a[1], a[2], a[3], a[4]);
				case 6: return new Date(a[0], a[1], a[2], a[3], a[4], a[5]);
				default: return new Date(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
			};
		};
		f['new'] = f.convertFrom = f;
		f.now = function(){return new Date()};
		return f;
	}());
	
	//: operator
	reg('operator', {
		add:	function (a, b) { return a + b },
		addf:	function (a, b) { return (a - 0) + (b - 0)},
		concat:	function (a, b) { return '' + a + b },
		minus:	function (a, b) { return a - b },
		times:	function (a, b) { return a * b },
		divide:	function (a, b) { return a / b },
		mod:	function (a, b) { return a % b },
		shl:	function (a, n) { return a << n },
		shr:	function (a, n) { return a >> n },
		shrf:	function (a, n) { return a >>> n },
		band:	function (a, b) { return a & b },
		bor:	function (a, b) { return a | b },
		bnot:	function (a, b) { return ~a },
		bxor:	function (a, b) { return a ^ b},
		and:	function (a, b) { return a && b},
		or: 	function (a, b) { return a || b}
	});

	//: tee
	reg('tee', function (x, f) {
		f(x);
		return x
	});

	reg('type', { of : function(x){return typeof x} });
	reg('present', { be : function(x){return x !== undefined && x !== null}});
	reg('absent', { be : function(x){return x === undefined || x === null }});
	reg('YieldValue', {be: function(x){return x instanceof EISA_YIELDVALUE}});
	reg('ReturnValue', {be: function(x){return x instanceof EISA_RETURNVALUE}});

	//: enumerator
	reg('enumerator', function(){
		var enumeratorSchemata = {
			'yield': function(t, a, g, restart){
				return new EISA_YIELDVALUE(g);
			},
			'bypass': function(t, a, g, restart){
				return new EISA_YIELDVALUE(g[0])
			},
			'return': function(t, a, v){
				return new EISA_RETURNVALUE(v)
			}
		}
		return function(M){
			var G = M.build(enumeratorSchemata);
			return function(){
				var t = this, a = arguments;
				return {getEnumerator: function(){
					var d = G.apply(t, a);
					var i = function(f){
						var v;
						while((v = d()) instanceof EISA_YIELDVALUE)
							f.apply(null, v.values)			
					}
					var r = function(f){
						if(f instanceof Function){
							return (r = i)(f)
						} else {
							return (r = d)();
						}
					}
					return {emit: function(f){return r(f)}}
				}}
			}
		}
	}());

	reg('debugger', function(){debugger});

	reg('spawn', function(f){
		var o = {}
		var r = f.call(o);
		return r || o;
	});

	//: prototypes
	RegExp.convertFrom = function(s){
		return new RegExp(s);
	}
	Function['new'] = function (args, body) { return new Function(args, body) };
	String.prototype.stripMargins = function(){
		return this.replace(/^\s*\|/gm, '')
	};

	Function.prototype.shiftIn = function(g){
		var f = this;
		return function(){
			return f(g.apply(this, arguments))
		}
	};

	//: .Array-getEnumerator
	Array.prototype.getEnumerator = function(){
		var cp = this.slice(0);
		var i = 0;
		var f = true
		return {emit: function(){
			if(f){
				f = false;
				return new EISA_YIELDVALUE([cp[0], 0])
			}
			i++;
			if (i >= cp.length) return new EISA_RETURNVALUE();
			return new EISA_YIELDVALUE([cp[i], i]);
		}}
	};
});
