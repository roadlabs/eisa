//:adapted: QWrap :: DomU, NodeH, EventH
//:author: Akira-sama
//:authorized
EISA_eisa.libmod.library('qwdom.node', function () {

	var DomU = EISA_eisa.libmod.library('qwdom.util');
	var Browser = EISA_eisa.libmod.library('qwdom.env');
	var Selector = EISA_eisa.libmod.library('qwdom.selector');

	var camelize = function(s){
		return s.replace(/^-ms/,'ms').replace(/-([a-z])/g, function(s, $1){
			return $1.toUpperCase();
		});
	}

	/** 
	* 获得element对象
	* @method	$
	* @param	{element|string|wrap}	element	id,Element实例或wrap
	* @param	{object}				doc		(Optional)document 默认为 当前document
	* @return	{element}				得到的对象或null
	*/
	var $ = function (el, doc) {
		if ('string' == typeof el) {
			doc = doc || document;
			return doc.getElementById(el);
		} else {
			return EISA_OWNS(el, '_') ? arguments.callee(el._) : el;
		}
	};

	var regEscape = function (str) {
		return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	};

	var getPixel = function (el, value) {
		if (/px$/.test(value) || !value) return parseInt(value, 10) || 0;
		var right = el.style.right, runtimeRight = el.runtimeStyle.right;
		var result;

		el.runtimeStyle.right = el.currentStyle.right;
		el.style.right = value;
		result = el.style.pixelRight || 0;

		el.style.right = right;
		el.runtimeStyle.right = runtimeRight;
		return result;
	};

	var NodeH = {
		
		/** 
		* 获得element对象的outerHTML属性
		* @method	outerHTML
		* @param	{element|string|wrap}	element	id,Element实例或wrap
		* @param	{object}				doc		(Optional)document 默认为 当前document
		* @return	{string}				outerHTML属性值
		*/
		outerHTML : function () {
			var temp = document.createElement('div');
			
			return function (el, doc) {
				el = $(el);
				if ('outerHTML' in el) {
					return el.outerHTML;
				} else {
					temp.innerHTML='';
					var dtemp = doc && doc.createElement('div') || temp;
					dtemp.appendChild(el.cloneNode(true));
					return dtemp.innerHTML;
				}
			};
		}(),

		/** 
		* 判断element是否包含某个className
		* @method	hasClass
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				className	样式名
		* @return	{void}
		*/
		hasClass : function (el, className) {
			el = $(el);
			return new RegExp('(?:^|\\s)' + regEscape(className) + '(?:\\s|$)').test(el.className);
		},

		/** 
		* 给element添加className
		* @method	addClass
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				className	样式名
		* @return	{void}
		*/
		addClass : function (el, className) {
			el = $(el);
			if (!NodeH.hasClass(el, className))
				el.className = el.className ? el.className + ' ' + className : className;
		},

		/** 
		* 移除element某个className
		* @method	removeClass
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				className	样式名
		* @return	{void}
		*/
		removeClass : function (el, className) {
			el = $(el);
			if (NodeH.hasClass(el, className))
				el.className = el.className.replace(new RegExp('(?:^|\\s)' + regEscape(className) + '(?=\\s|$)', 'ig'), '');
		},

		/** 
		* 替换element的className
		* @method	replaceClass
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				oldClassName	目标样式名
		* @param	{string}				newClassName	新样式名
		* @return	{void}
		*/
		replaceClass : function (el, oldClassName, newClassName) {
			el = $(el);
			if (NodeH.hasClass(el, oldClassName)) {
				el.className = el.className.replace(new RegExp('(^|\\s)' + regEscape(oldClassName) + '(?=\\s|$)', 'ig'), '$1' + newClassName);
			} else {
				NodeH.addClass(el, newClassName);
			}
		},

		/** 
		* element的className1和className2切换
		* @method	toggleClass
		* @param	{element|string|wrap}	element			id,Element实例或wrap
		* @param	{string}				className1		样式名1
		* @param	{string}				className2		(Optional)样式名2
		* @return	{void}
		*/
		toggleClass : function (el, className1, className2) {
			className2 = className2 || '';
			if (NodeH.hasClass(el, className1)) {
				NodeH.replaceClass(el, className1, className2);
			} else {
				NodeH.replaceClass(el, className2, className1);
			}
		},

		/** 
		* 显示element对象
		* @method	show
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				value		(Optional)display的值 默认为空
		* @return	{void}
		*/
		show : function (el, value) {
			el = $(el);
			el.style.display = value || '';
		},

		/** 
		* 隐藏element对象
		* @method	hide
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{void}
		*/
		hide : function (el) {
			el = $(el);
			el.style.display = 'none';
		},

		/** 
		* 隐藏/显示element对象
		* @method	toggle
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				value		(Optional)显示时display的值 默认为空
		* @return	{void}
		*/
		toggle : function (el, value) {
			if (NodeH.isVisible(el)) {
				NodeH.hide(el);
			} else {
				NodeH.show(el, value);
			}
		},

		/** 
		* 判断element对象是否可见
		* @method	isVisible
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{boolean}				判断结果
		*/
		isVisible : function (el) {
			el = $(el);
			//return this.getStyle(element, 'visibility') != 'hidden' && this.getStyle(element, 'display') != 'none';
			//return !!(element.offsetHeight || element.offestWidth);
			return !!((el.offsetHeight + el.offsetWidth) && NodeH.getStyle(el, 'display') != 'none');
		},


		/** 
		* 获取element对象距离doc的xy坐标
		* 参考与YUI3.1.1
		* @refer  https://github.com/yui/yui3/blob/master/build/dom/dom.js
		* @method	getXY
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{array}					x, y
		*/
		getXY : function () {

			var calcBorders = function (node, xy) {
				var t = parseInt(NodeH.getCurrentStyle(node, 'borderTopWidth'), 10) || 0,
					l = parseInt(NodeH.getCurrentStyle(node, 'borderLeftWidth'), 10) || 0;

				if (Browser.gecko) {
					if (/^t(?:able|d|h)$/i.test(node.tagName)) {
						t = l = 0;
					}
				}
				xy[0] += l;
				xy[1] += t;
				return xy;
			};

			return document.documentElement.getBoundingClientRect ? function (node) {
				var doc = node.ownerDocument,
					docRect = DomU.getDocRect(doc),
					scrollLeft = docRect.scrollX,
					scrollTop = docRect.scrollY,
					box = node.getBoundingClientRect(),
					xy = [box.left, box.top],
					off1, off2,
					mode,
					bLeft, bTop;


				if (Browser.ie) {
					off1 = 2;
					off2 = 2;
					mode = doc.compatMode;
					bLeft = NodeH.getCurrentStyle(doc.documentElement, 'borderTopWidth');
					bTop = NodeH.getCurrentStyle(doc.documentElement, 'borderLeftWidth');
					
					if (mode == 'BackCompat') {
						if (bLeft !== 'medium') {
							off1 = parseInt(bLeft, 10);
						}
						if (bTop !== 'medium') {
							off2 = parseInt(bTop, 10);
						}
					} else if (Browser.ie6) {
						off1 = 0;
						off2 = 0;
					}
					
					xy[0] -= off1;
					xy[1] -= off2;

				}

				if (scrollTop || scrollLeft) {
					xy[0] += scrollLeft;
					xy[1] += scrollTop;
				}

				return xy;

			} : function (node, doc) {
				doc = doc || document;

				var xy = [node.offsetLeft, node.offsetTop],
					parentNode = node.parentNode,
					doc = node.ownerDocument,
					docRect = DomU.getDocRect(doc),
					bCheck = !!(Browser.gecko || parseFloat(Browser.webkit) > 519),
					scrollTop = 0,
					scrollLeft = 0;
				
				while ((parentNode = parentNode.offsetParent)) {
					xy[0] += parentNode.offsetLeft;
					xy[1] += parentNode.offsetTop;
					if (bCheck) {
						xy = calcBorders(parentNode, xy);
					}
				}

				if (NodeH.getCurrentStyle(node, 'position') != 'fixed') {
					parentNode = node;

					while ((parentNode = parentNode.parentNode)) {
						scrollTop = parentNode.scrollTop;
						scrollLeft = parentNode.scrollLeft;


						if (Browser.gecko && (NodeH.getCurrentStyle(parentNode, 'overflow') !== 'visible')) {
							xy = calcBorders(parentNode, xy);
						}
						
						if (scrollTop || scrollLeft) {
							xy[0] -= scrollLeft;
							xy[1] -= scrollTop;
						}
					}
					
				}

				xy[0] += docRect.scrollX;
				xy[1] += docRect.scrollY;

				return xy;

			};

		}(),

		/** 
		* 设置element对象的xy坐标
		* @method	setXY
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{int}					x			(Optional)x坐标 默认不设置
		* @param	{int}					y			(Optional)y坐标 默认不设置
		* @return	{void}
		*/
		setXY : function (el, x, y) {
			el = $(el);
			x = parseInt(x, 10);
			y = parseInt(y, 10);
			if ( !isNaN(x) ) NodeH.setStyle(el, 'left', x + 'px');
			if ( !isNaN(y) ) NodeH.setStyle(el, 'top', y + 'px');
		},

		/** 
		* 设置element对象的offset宽高
		* @method	setSize
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{int}					w			(Optional)宽 默认不设置
		* @param	{int}					h			(Optional)高 默认不设置
		* @return	{void}
		*/
		setSize : function (el, w, h) {
			el = $(el);
			w = parseFloat (w, 10);
			h = parseFloat (h, 10);

			if (isNaN(w) && isNaN(h)) return;

			var borders = NodeH.borderWidth(el);
			var paddings = NodeH.paddingWidth(el);

			if ( !isNaN(w) ) NodeH.setStyle(el, 'width', Math.max(+w - borders[1] - borders[3] - paddings[1] - paddings[3], 0) + 'px');
			if ( !isNaN(h) ) NodeH.setStyle(el, 'height', Math.max(+h - borders[0] - borders[2] - paddings[1] - paddings[2], 0) + 'px');
		},

		/** 
		* 设置element对象的宽高
		* @method	setInnerSize
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{int}					w			(Optional)宽 默认不设置
		* @param	{int}					h			(Optional)高 默认不设置
		* @return	{void}
		*/
		setInnerSize : function (el, w, h) {
			el = $(el);
			w = parseFloat (w, 10);
			h = parseFloat (h, 10);

			if ( !isNaN(w) ) NodeH.setStyle(el, 'width', w + 'px');
			if ( !isNaN(h) ) NodeH.setStyle(el, 'height', h + 'px');
		},

		/** 
		* 设置element对象的offset宽高和xy坐标
		* @method	setRect
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{int}					x			(Optional)x坐标 默认不设置
		* @param	{int}					y			(Optional)y坐标 默认不设置
		* @param	{int}					w			(Optional)宽 默认不设置
		* @param	{int}					h			(Optional)高 默认不设置
		* @return	{void}
		*/
		setRect : function (el, x, y, w, h) {
			NodeH.setXY(el, x, y);
			NodeH.setSize(el, w, h);
		},

		/** 
		* 设置element对象的宽高和xy坐标
		* @method	setRect
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{int}					x			(Optional)x坐标 默认不设置
		* @param	{int}					y			(Optional)y坐标 默认不设置
		* @param	{int}					w			(Optional)宽 默认不设置
		* @param	{int}					h			(Optional)高 默认不设置
		* @return	{void}
		*/
		setInnerRect : function (el, x, y, w, h) {
			NodeH.setXY(el, x, y);
			NodeH.setInnerSize(el, w, h);
		},

		/** 
		* 获取element对象的宽高
		* @method	getSize
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{object}				width,height
		*/
		getSize : function (el) {
			el = $(el);
			return { width : el.offsetWidth, height : el.offsetHeight };
		},

		/** 
		* 获取element对象的宽高和xy坐标
		* @method	setRect
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{object}				width,height,left,top,bottom,right
		*/
		getRect : function (el) {
			el = $(el);
			var p = NodeH.getXY(el);
			var x = p[0];
			var y = p[1];
			var w = el.offsetWidth; 
			var h = el.offsetHeight;
			return {
				'width'  : w,    'height' : h,
				'left'   : x,    'top'    : y,
				'bottom' : y+h,  'right'  : x+w
			};
		},

		/** 
		* 向后获取element对象复合条件的兄弟节点
		* @method	nextSibling
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		* @return	{node}					找到的node或null
		*/
		nextSibling : function (el, selector) {
			var fcheck = Selector.selector2Filter(selector || '');
			el = $(el);
			do {
				el = el.nextSibling;
			} while (el && !fcheck(el));
			return el;
		},

		/** 
		* 向前获取element对象复合条件的兄弟节点
		* @method	previousSibling
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		* @return	{node}					找到的node或null
		*/
		previousSibling : function (el, selector) {
			var fcheck = Selector.selector2Filter(selector || '');
			el = $(el);
			do {
				el = el.previousSibling;
			} while (el && !fcheck(el)); 
			return el;
		},

		/** 
		* 向上获取element对象复合条件的兄弟节点
		* @method	previousSibling
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		* @return	{element}					找到的node或null
		*/
		ancestorNode : function (el, selector) {
			var fcheck = Selector.selector2Filter(selector || '');
			el = $(el);
			do {
				el = el.parentNode;
			} while (el && !fcheck(el));
			return el;
		},

		/** 
		* 向上获取element对象复合条件的兄弟节点
		* @method	parentNode
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		* @return	{element}					找到的node或null
		*/
		parentNode : function (el, selector) {
			return NodeH.ancestorNode(el, selector);
		},

		/** 
		* 从element对象内起始位置获取复合条件的节点
		* @method	firstChild
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		* @return	{node}					找到的node或null
		*/
		firstChild : function (el, selector) {
			var fcheck = Selector.selector2Filter(selector || '');
			el = $(el).firstChild;
			while (el && !fcheck(el)) el = el.nextSibling;
			return el;
		},

		/** 
		* 从element对象内结束位置获取复合条件的节点
		* @method	lastChild
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		* @return	{node}					找到的node或null
		*/
		lastChild : function (el, selector) {
			var fcheck = Selector.selector2Filter(selector || '');
			el = $(el).lastChild;
			while (el && !fcheck(el)) el = el.previousSibling;
			return el;
		},

		/** 
		* 判断目标是否是element对象的子孙节点
		* @method	contains
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	target		目标 id,Element实例或wrap
		* @return	{boolean}				判断结果
		*/
		contains : function (el, target) {
			el = $(el), target = $(target);
			return el.contains
				? el != target && el.contains(target)
				: !!(el.compareDocumentPosition(target) & 16);
		},

		/** 
		* 向element对象前/后，内起始，内结尾插入html
		* @method	insertAdjacentHTML
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				type		位置类型
		* @param	{element|string|wrap}	html		插入的html
		* @return	{void}
		*/
		insertAdjacentHTML : function (el, type, html) {
			el = $(el);
			if (el.insertAdjacentHTML) {
				el.insertAdjacentHTML(type, html);
			} else {
				var df;
				var r = el.ownerDocument.createRange();
				switch (String(type).toLowerCase()) {
					case "beforebegin":
						r.setStartBefore(el);
						df = r.createContextualFragment(html);
						break;
					case "afterbegin":
						r.selectNodeContents(el);
						r.collapse(true);
						df = r.createContextualFragment(html);
						break;
					case "beforeend":
						r.selectNodeContents(el);
						r.collapse(false);
						df = r.createContextualFragment(html);
						break;
					case "afterend":
						r.setStartAfter(el);
						df = r.createContextualFragment(html);
						break;
				}
				NodeH.insertAdjacentElement(el, type, df);
			}
		},

		/** 
		* 向element对象前/后，内起始，内结尾插入element对象
		* @method	insertAdjacentElement
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				type		位置类型
		* @param	{element|string|wrap}	target		目标id,Element实例或wrap
		* @return	{element}				目标element对象
		*/
		insertAdjacentElement : function (el, type, target) {
			el = $(el), target = $(target);
			if (el.insertAdjacentElement) {
				el.insertAdjacentElement(type, target);
			} else {
				switch (String(type).toLowerCase()) {
					case "beforebegin":
						el.parentNode.insertBefore(target, el);
						break;
					case "afterbegin":
						el.insertBefore(target, el.firstChild);
						break;
					case "beforeend":
						el.appendChild(target);
						break;
					case "afterend":
						el.parentNode.insertBefore(target, el.nextSibling || null);
						break;
				}
			}
			return target;
		},

		/** 
		* 向element对象内追加element对象
		* @method	appendChild
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	target		目标id,Element实例或wrap
		* @return	{element}				目标element对象
		*/
		appendChild : function (el, target) {
			return $(el).appendChild($(target));
		},

		/** 
		* 向element对象前插入element对象
		* @method	insertSiblingBefore
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	nelement	目标id,Element实例或wrap
		* @return	{element}				目标element对象
		*/
		insertSiblingBefore : function (el, nel) {
			el = $(el);
			return el.parentNode.insertBefore($(nel), el);
		},

		/** 
		* 向element对象后插入element对象
		* @method	insertSiblingAfter
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	nelement	目标id,Element实例或wrap
		* @return	{element}				目标element对象
		*/
		insertSiblingAfter : function (el, nel) {
			el = $(el);
			el.parentNode.insertBefore($(nel), el.nextSibling || null);
		},

		/** 
		* 向element对象内部的某元素前插入element对象
		* @method	insertBefore
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	nelement	目标id,Element实例或wrap
		* @param	{element|string|wrap}	relement	插入到id,Element实例或wrap前
		* @return	{element}				目标element对象
		*/
		insertBefore : function (el, nel, relement) {
			return $(el).insertBefore($(nel), rel && $(rel) || null);
		},

		/** 
		* 向element对象内部的某元素后插入element对象
		* @method	insertAfter
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	nelement	目标id,Element实例或wrap
		* @param	{element|string|wrap}	nelement	插入到id,Element实例或wrap后
		* @return	{element}				目标element对象
		*/
		insertAfter : function (el, nel, rel) {
			return $(el).insertBefore($(nel), rel && $(rel).nextSibling || null);
		},

		/** 
		* 用一个元素替换自己
		* @method	replaceNode
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	nelement		新对象
		* @return	{element}				如替换成功，此方法可返回被替换的节点，如替换失败，则返回 NULL
		*/
		replaceNode : function (el, nel) {
			el = $(el);
			return el.parentNode.replaceChild($(nel), el);
		},

		/** 
		* 从element里把relement替换成nelement
		* @method	replaceChild
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	nelement	新节点id,Element实例或wrap
		* @param	{element|string|wrap}	relement	被替换的id,Element实例或wrap后
		* @return	{element}				如替换成功，此方法可返回被替换的节点，如替换失败，则返回 NULL
		*/
		replaceChild : function (el, nel, rel) {
			return $(el).replaceChild($(nel), $(rel));
		},

		/** 
		* 把element移除掉
		* @method	removeNode
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{element}				如删除成功，此方法可返回被删除的节点，如失败，则返回 NULL。
		*/
		removeNode : function (el) {
			el = $(el);
			return el.parentNode.removeChild(el);
		},

		/** 
		* 从element里把target移除掉
		* @method	removeChild
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{element|string|wrap}	target		目标id,Element实例或wrap后
		* @return	{element}				如删除成功，此方法可返回被删除的节点，如失败，则返回 NULL。
		*/
		removeChild : function (el, target) {
			return $(el).removeChild($(target));
		},

		/** 
		* 获取element对象的属性
		* @method	getAttr
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				attribute	属性名称
		* @param	{int}					iFlags		(Optional)ieonly 获取属性值的返回类型 可设值0,1,2,4 
		* @return	{string}				属性值 ie里有可能不是object
		*/
		getAttr : function (el, attribute, iFlags) {
			el = $(el);
			return el.getAttribute(attribute, iFlags || (el.nodeName == 'A' && attribute.toLowerCase() == 'href') && 2 || null);
		},

		/** 
		* 设置element对象的属性
		* @method	setAttr
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				attribute	属性名称
		* @param	{string}				value		属性的值
		* @param	{int}					iCaseSensitive	(Optional)
		* @return	{void}
		*/
		setAttr : function (el, attribute, value, iCaseSensitive) {
			el = $(el);
			el.setAttribute(attribute, value, iCaseSensitive || null);
		},

		/** 
		* 删除element对象的属性
		* @method	removeAttr
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				attribute	属性名称
		* @param	{int}					iCaseSensitive	(Optional)
		* @return	{void}
		*/
		removeAttr : function (el, attribute, iCaseSensitive) {
			el = $(el);
			return el.removeAttribute(attribute, iCaseSensitive || 0);
		},

		/** 
		* 根据条件查找element内元素组
		* @method	query
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	条件
		* @return	{array}					element元素数组
		*/
		query : function (el, selector) {
			el = $(el);
			return Selector.query(el, selector || '');
		},

		/** 
		* 根据条件查找element内元素
		* @method	one
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				selector	条件
		* @return	{HTMLElement}			element元素
		*/
		one : function (el, selector) {
			el = $(el);
			return Selector.one(el, selector || '');
		},

		/** 
		* 查找element内所有包含className的集合
		* @method	getElementsByClass
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				className	样式名
		* @return	{array}					element元素数组
		*/
		getElementsByClass : function (el, className) {
			el = $(el);
			return Selector.query(el, '.' + className);
		},

		/** 
		* 获取element的value
		* @method	getValue
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{string}				元素value
		*/
		getValue : function (el) {
			el = $(el);
			//if(element.value==element.getAttribute('data-placeholder')) return '';
			return el.value;
		},

		/** 
		* 设置element的value
		* @method	setValue
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				value		内容
		* @return	{void}					
		*/
		setValue : function (el, value) {
			$(el).value=value;
		},

		/** 
		* 获取element的innerHTML
		* @method	getHTML
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{string}					
		*/
		getHtml : function (el) {
			el = $(el);
			return el.innerHTML;
		},

		/** 
		* 设置element的innerHTML
		* @method	setHtml
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				value		内容
		* @return	{void}					
		*/
		setHtml : function (el,value) {
			$(el).innerHTML=value;
		},

		/** 
		* 获得form的所有elements并把value转换成由'&'连接的键值字符串
		* @method	encodeURIForm
		* @param	{element}	element			form对象
		* @param	{string}	filter	(Optional)	过滤函数,会被循环调用传递给item作参数要求返回布尔值判断是否过滤
		* @return	{string}					由'&'连接的键值字符串
		*/
		encodeURIForm : function (el, filter) {

			el = $(el);

			filter = filter || function (el) { return false; };

			var result = []
				, els = el.elements
				, l = els.length
				, i = 0
				, push = function (name, value) {
					result.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
				};
			
			for (; i < l ; ++ i) {
				var el = els[i], name = el.name, value;

				if (el.disabled || !name) continue;
				
				switch (el.type) {
					case "text":
					case "hidden":
					case "password":
					case "textarea":
						if (filter(el)) break;
						push(name, el.value);
						break;
					case "radio":
					case "checkbox":
						if (filter(el)) break;
						if (el.checked) push(name, el.value);
						break;
					case "select-one":
						if (filter(el)) break;
						if (el.selectedIndex > -1) push(name, el.value);
						break;
					case "select-multiple":
						if (filter(el)) break;
						var opts = el.options;
						for (var j = 0 ; j < opts.length ; ++ j) {
							if (opts[j].selected) push(name, opts[j].value);
						}
						break;
				}
			}
			return result.join("&");
		},

		/** 
		* 判断form的内容是否有改变
		* @method	isFormChanged
		* @param	{element}	element			form对象
		* @param	{string}	filter	(Optional)	过滤函数,会被循环调用传递给item作参数要求返回布尔值判断是否过滤
		* @return	{bool}					是否改变
		*/
		isFormChanged : function (el, filter) {

			el = $(el);

			filter = filter || function (el) { return false; };

			var els = el.elements, l = els.length, i = 0, j = 0, el, opts;
			
			for (; i < l ; ++ i, j = 0) {
				el = els[i];
				
				switch (el.type) {
					case "text":
					case "hidden":
					case "password":
					case "textarea":
						if (filter(el)) break;
						if (el.defaultValue != el.value) return true;
						break;
					case "radio":
					case "checkbox":
						if (filter(el)) break;
						if (el.defaultChecked != el.checked) return true;
						break;
					case "select-one":
						j = 1;
					case "select-multiple":
						if (filter(el)) break;
						opts = el.options;
						for (; j < opts.length ; ++ j) {
							if (opts[j].defaultSelected != opts[j].selected) return true;
						}
						break;
				}
			}

			return false;
		},

		/** 
		* 克隆元素
		* @method	cloneNode
		* @param	{element}	element			form对象
		* @param	{bool}		bCloneChildren	(Optional) 是否深度克隆 默认值false
		* @return	{element}					克隆后的元素
		*/
		cloneNode : function (el, bCloneChildren) {
			return $(el).cloneNode(bCloneChildren || false);
		},

		/** 
		* 获得element对象的样式
		* @method	getStyle
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				attribute	样式名
		* @return	{string}				
		*/
		getStyle : function (el, attribute) {
			el = $(el);

			attribute = camelize(attribute);

			var hook = NodeH.cssHooks[attribute], result;

			if (hook) {
				result = hook.get(el);
			} else {
				result = el.style[attribute];
			}
			
			return (!result || result == 'auto') ? null : result;
		},

		/** 
		* 获得element对象当前的样式
		* @method	getCurrentStyle
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				attribute	样式名
		* @return	{string}				
		*/
		getCurrentStyle : function (el, attribute, pseudo) {
			el = $(el);

			var displayAttribute = camelize(attribute);

			var hook = NodeH.cssHooks[displayAttribute], result;

			if (hook) {
				result = hook.get(el, true, pseudo);
			} else if (Browser.ie) {
				result = el.currentStyle[displayAttribute];
			} else {
				var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
				result = style ? style.getPropertyValue(attribute) : null;
			}
			
			return (!result || result == 'auto') ? null : result;
		},

		/** 
		* 设置element对象的样式
		* @method	setStyle
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @param	{string}				attribute	样式名
		* @param	{string}				value		值
		* @return	{void}
		*/
		setStyle : function (el, attributes, value) {
			el = $(el);

			if ('string' == typeof attributes) {
				var temp = {};
				temp[attributes] = value;
				attributes = temp;
			}

			//if (element.currentStyle && !element.currentStyle['hasLayout']) element.style.zoom = 1;
			
			for (var prop in attributes) {

				var displayProp = camelize(prop);

				var hook = NodeH.cssHooks[displayProp];

				if (hook) {
					hook.set(el, attributes[prop]);
				} else {
					el.style[displayProp] = attributes[prop];
				}
			}
		},

		/** 
		* 获取element对象的border宽度
		* @method	borderWidth
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
		*/
		borderWidth : function (el) {
			el = $(el);

			if (el.currentStyle && !el.currentStyle.hasLayout) {
				el.style.zoom = 1;
			}

			return [
				el.clientTop
				, el.offsetWidth - el.clientWidth - el.clientLeft
				, el.offsetHeight - el.clientHeight - el.clientTop
				, el.clientLeft
			];
		},

		/** 
		* 获取element对象的padding宽度
		* @method	paddingWidth
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
		*/
		paddingWidth : function (el) {
			el = $(el);
			return [
				getPixel(el, NodeH.getCurrentStyle(el, 'padding-top'))
				, getPixel(el, NodeH.getCurrentStyle(el, 'padding-right'))
				, getPixel(el, NodeH.getCurrentStyle(el, 'padding-bottom'))
				, getPixel(el, NodeH.getCurrentStyle(el, 'padding-left'))
			];
		},

		/** 
		* 获取element对象的margin宽度
		* @method	marginWidth
		* @param	{element|string|wrap}	element		id,Element实例或wrap
		* @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
		*/
		marginWidth : function (el) {
			el = $(el);
			return [
				getPixel(el, NodeH.getCurrentStyle(el, 'margin-top'))
				, getPixel(el, NodeH.getCurrentStyle(el, 'margin-right'))
				, getPixel(el, NodeH.getCurrentStyle(el, 'margin-bottom'))
				, getPixel(el, NodeH.getCurrentStyle(el, 'margin-left'))
			];
		},

		cssHooks : {
			'float' : {
				get : function (el, current, pseudo) {
					if (current) {
						var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
						return style ? style.getPropertyValue('cssFloat') : null;
					} else {
						return el.style['cssFloat'];
					}
				},
				set : function (el, value) {
					el.style['cssFloat'] = value;
				}
			}
		}

	};

	if (Browser.ie) {
		NodeH.cssHooks['float'] = {
			get : function (el, current) {
				return el[current ? 'currentStyle' : 'style'].styleFloat;
			},
			set : function (el, value) {
				el.style.styleFloat = value;
			}
		};
		
		NodeH.cssHooks.opacity = {
			get : function (el, current) {
				var match = el.currentStyle.filter.match(/alpha\(opacity=(.*)\)/);
				return match && match[1] ? parseInt(match[1], 10) / 100 : 1.0;
			},

			set : function (el, value) {
				el.style.filter = 'alpha(opacity=' + parseInt(value * 100) + ')';
			}
		};
	}

	NodeH.$ = $;
	
	return NodeH;
}());
