//: ^
// Eisa Runtime, by Belleve Invis

//: EISA_eisa
NECESSARIA_module.declare("eisa.rt", function(require, exports) {
	//: Nai
	var Nai = function() {};
	Nai.prototype = {
		constructor: undefined,
	//	toString: undefined, // comment this line for debug.
		valueOf: undefined,
		hasOwnProperty: undefined,
		propertyIsEnumerable: undefined
	};

	//: derive
	var derive = Object.craate ? Object.create : function() {
		var F = function() {};
		return function(obj) {
			F.prototype = obj;
			return new F;
		}
	}();
	var EISA_derive = derive;

	//: OWNS
	var EISA_OWNS = function() {
		var hop = {}.hasOwnProperty;
		return function(o,p) {
			return hop.call(o,p)
		}
	}();

	//: SLICE
	var EISA_SLICE = function() {
		var s = Array.prototype.slice;
		return function(x, m, n) {
			return s.call(x, m, n);
		};
	} ();

	//: UNIQ
	var EISA_UNIQ = function(arr) {
		if (!arr.length) return arr;

		var b = arr.slice(0).sort();
		var t = [b[0]], tn = 1;
		for (var i = 1; i < b.length; i++)
			if (b[i] && b[i] != b[i - 1])
				t[tn++] = b[i];
		return t;
	};

	//: NamedArguments
	var NamedArguments = function() {
		for (var i=arguments.length-2;i>=0;i-=2)
			this[arguments[i]]=arguments[i+1];
	};
	var EISA_NamedArguments = NamedArguments;
	NamedArguments.prototype = new Nai();
	NamedArguments.fetch = function(o, p) {
		if (EISA_OWNS(o, p)) return o[p]
	}
	NamedArguments.enumerate = function(o, f) {	
		for (var each in o)
			if (EISA_OWNS(o, each))
				f.call(o[each], o[each], each);
	}
	NamedArguments.each = NamedArguments.enumerate;

	//: EISA_CNARG
	var EISA_CNARG = function(a) {
		if (a instanceof NamedArguments)
			return a
		else
			return new NamedArguments
	}

	//: AUX-METHODS
	var EISA_M_TOP = function() {return this}();
	var EISA_IINVOKE = function(p, s) {
		return p.item(s).apply(p, EISA_SLICE(arguments,2))
	}
	var EISA_RMETHOD = function(l, r, m) {
		return r[m](l)
	}
	var EISA_YIELDVALUE = function(a) {
		this.value = a[0];
		this.values = a;
	}
	var EISA_RETURNVALUE = function(x) {
		this.value = x
	}
	var EISA_OBSTRUCTIVE = function(f) {
		return {
			build: f
		}
	}
	//: OBSTRUCTIVE_SCHEMATA_M
	var EISA_OBSTRUCTIVE_SCHEMATA_M = {
		'return': function(t, a, v) {
			return v;
		},
		'break': function(j) { return j }
	}

	//: Exceptions
	var EISA_THROW = function(x) {
		throw x || "[?] Unexpected error"
	}
	var EISA_TRY = function(f) {
		var ret, fcatch, ffinally;
		for (var i = arguments.length - 1; i; i--) {
			if (arguments[i] instanceof EISA_NamedArguments) {
				fcatch = arguments[i]['catch'];
				ffinally = arguments[i]['finally'];
				break;
			}
		};
		
		if (!fcatch)
			fcatch = function(e) {};

		var success = false;
		var arg;

		for (var j = 0, argn = arguments.length; j < argn; j++)
			if (typeof (arg = arguments[j]) === "function") {
				try {
					ret = arg();
					success = true
				} catch(e) {
					success = false
					fcatch(e);
				};
				if (success) {
					if (ffinally) ffinally();
					return ret
				}
			}
				
		return ret;
	};

	//: tryDefineProperty	
	var tryDefineProperty = function() {
		var f;
		try {
			f = function(o, n, v) {
				Object.defineProperty(o, n, {
					writable: false,
					value: v,
					enumerable: false,
					configurable: false
				});
				return o;
			};
			f({}, 'a', {});
		} catch (e) {
			f = function(o, n, v) {o[n] = v; return o};
		};
		return f;
	}();

	tryDefineProperty(Function.prototype, 'method_', function(n, v) {
		tryDefineProperty(this.prototype, n, v);
	});


	//: proto-exts
	Object.method_('item', function(i) {
		return this[i];
	});
	Object.method_('itemset', function(i, v) {
		return this[i] = v;
	});
	Object.method_('compareTo',function(b) {
		return this == b ? 0 : this > b ? 1 : -1;
	});
	Object.method_('be',function(b) {
		return this === b
	});
	Object.method_('contains',function(b) {
		return b in this;
	});
	Object.method_('of',function(v) {
		return v[this];
	});

	Function.method_('new', function() {
		var obj = EISA_derive(this.prototype);
		this.apply(obj, arguments);
		return obj;
	});
	Function.method_('be',function(that) {
		return that instanceof this;
	});
	String.be = function(s) {
		return (typeof(s) === 'string') || s instanceof this
	};
	Number.be = function(s) {
		return (typeof(s) === 'string') || s instanceof this
	};
	Boolean.be = function(s) {
		return (typeof(s) === 'string') || s instanceof this
	};

	//: ES5
	// Essential ES5 prototype methods
	if (!Array.prototype.map) {
		Array.prototype.map = function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
				throw new TypeError();

			var res = new Array(len);
			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t)
					res[i] = fun.call(thisp, t[i], i, t);
			}

			return res;
		};
	};
	if (!Array.prototype.some) {
		Array.prototype.some = function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
				throw new TypeError();

			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t && fun.call(thisp, t[i], i, t))
					return true;
			}

			return false;
		};
	}
	if (!Array.prototype.reduce) {
		Array.prototype.reduce = function(fun /*, initialValue */)
		{
			"use strict";

			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
				throw new TypeError();

			// no value to return if no initial value and an empty array
			if (len == 0 && arguments.length == 1)
				throw new TypeError();

			var k = 0;
			var accumulator;
			if (arguments.length >= 2) {
				accumulator = arguments[1];
			} else {
				do {
					if (k in t) {
						accumulator = t[k++];
						break;
					}

					// if array contains no values, no initial value to return
					if (++k >= len) throw new TypeError();
				} while (true);
			}

			while (k < len) {
				if (k in t)
					accumulator = fun.call(undefined, accumulator, t[k], k, t);
				k++;
			}

			return accumulator;
		};
	};
	if (!Array.prototype.reduceRight) {
		Array.prototype.reduceRight = function(callbackfn /*, initialValue */) {
			"use strict";

			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof callbackfn !== "function")
				throw new TypeError();

			// no value to return if no initial value, empty array
			if (len === 0 && arguments.length === 1)
				throw new TypeError();

			var k = len - 1;
			var accumulator;
			if (arguments.length >= 2) {
				accumulator = arguments[1];
			} else {
				do {
					if (k in this) {
						accumulator = this[k--];
						break;
					}

					// if array contains no values, no initial value to return
					if (--k < 0)
						throw new TypeError();
				} while (true);
			}

			while (k >= 0) {
				if (k in t)
					accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
				k--;
			}

			return accumulator;
		};
	}
	if (!Array.prototype.every) {
		Array.prototype.every = function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
				throw new TypeError();

			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t && !fun.call(thisp, t[i], i, t))
					return false;
			}

			return true;
		};
	}
	if (!Array.prototype.filter) {
		Array.prototype.filter = function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
				throw new TypeError();

			var res = [];
			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t) {
					var val = t[i]; // in case fun mutates this
					if (fun.call(thisp, val, i, t))
						res.push(val);
				}
			}

			return res;
		};
	}
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
				throw new TypeError();

			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t)
					fun.call(thisp, t[i], i, t);
			}
		};
	}


	//: Rule
	var EISA_CREATERULE = function(l, r) {
		return new Rule(l, r);
	}
	var Rule = function(l, r) {
		this.left = l,
		this.right = r;
	}
	var EISA_Rule = Rule;
	Rule.prototype.reverse = function() {
		return new Rule(this.right, this.left);
	}
	Rule.prototype.toString = function() {
		return this.left + ' -> ' + this.right;
	}
	Rule.prototype.each = function(f) {
		if (typeof this.left === 'number' && typeof this.right === 'number') {
			if (this.left <= this.right) {
				for (var i = this.left; i <= this.right; i++) {
					f.call(this, i);
				}
			} else {
				for (var i = this.left; i >= this.right; i--) {
					f.call(this, i);
				}
			}
		}
	}


	//: eisa-master
	var eisa = exports;
	eisa.version = 'hoejuu';

	eisa.log = function(message) {};

	eisa.runtime = eisa.rt = {
		CNARG: EISA_CNARG,
		CREATERULE: EISA_CREATERULE,
		IINVOKE: EISA_IINVOKE,
		M_TOP: EISA_M_TOP,
		NamedArguments: EISA_NamedArguments,
		OBSTRUCTIVE: EISA_OBSTRUCTIVE,
		OBSTRUCTIVE_SCHEMATA_M: EISA_OBSTRUCTIVE_SCHEMATA_M,
		OWNS: EISA_OWNS,
		RETURNVALUE: EISA_RETURNVALUE,
		RMETHOD: EISA_RMETHOD,
		Rule: EISA_Rule,
		SLICE: EISA_SLICE,
		THROW: EISA_THROW,
		TRY: EISA_TRY,
		UNIQ: EISA_UNIQ,
		YIELDVALUE: EISA_YIELDVALUE
	};

	eisa.derive = EISA_derive;
	eisa.Nai = Nai;



	//: eisa-module-helpers
	eisa.using = function(libs, f) {
		var importings = [], immediates = [];
		for (var i = 0; i < libs.length; i++) {
			if (typeof libs[i] === 'string')
				importings.push(libs[i]);
			else
				immediates.push(libs[i]);
		};
		module.provide(importings, function(require) {
			var vals = {}, obts = {}, YES = {};
			for (var i = 0; i < importings.length; i++)
				require.enumerate(libs[i], function(n, v) {
					vals[n] = v;
					obts[n] = YES
				});
			for (var i = 0; i < immediates.length; i++) {
				var immlib = immediates[i];
				for (var each in immlib)
					if (EISA_OWNS(immlib, each)) {
						vals[each] = immlib[each];
						obts[each] = YES
					};
			};
			var enumVars = function(f) {
				for (var each in vals)
					if (obts[each] === YES)
						f(vals[each], each)
			};
			return f.call(vals, vals, enumVars);
		});
	};

	eisa.exec_ = function(libs, f){
		eisa.using(libs, function(vals, enum_){
			return f.call({
				runtime: eisa.runtime, 
				inits: vals
			});
		});
	};

	//: eisa-script
	eisa.languages = {};
	eisa.Script = function(source, language, config, libraries, callback) {

		var libs = ['stl', 'mod'].concat(libraries || []);

		eisa.using(libs, function(initvs, inita) {
			var ast = language.parse(language.lex(source), source, inita);
			var lfcr;

			return callback({
				compile: function() {
					lfcr = language.Compiler(ast, config).compile(); 
					return lfcr;
				},
				asyncCompile: function(onSuccess, onStep) {
					language.Compiler(ast, config).asyncCompile(
						function(cm) {
							lfcr = cm;
							onSuccess.apply(this, arguments)
						}, onStep);
				},
				start: function() {
					if (!lfcr) this.compile();
					lfcr.wrappedF.apply({
						runtime: eisa.runtime,
						inits: initvs
					}, arguments);
				}
			})
		});
	};

	return eisa;
});
