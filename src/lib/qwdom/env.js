//:adapted: QWrap :: Browser
//:author: Akira-sama
//:authorized


/**
 * @class Browser js的运行环境，浏览器以及版本信息。（Browser仅基于userAgent进行嗅探，存在不严谨的缺陷。）
 * @singleton 
 * @namespace QW 
 */
EISA_eisa.dev.aslib('qwdom.env', function(){

	var na = window.navigator,
		ua = na.userAgent.toLowerCase(),
		browserTester = /(msie|webkit|gecko|presto|opera|safari|firefox|chrome|maxthon)[ \/]([\d.]+)/ig,
		Browser = {platform: na.platform};

	ua.replace(browserTester,function(a,b,c){
		var bLower=b.toLowerCase();
		Browser[bLower]=c;
	});

	if(Browser.opera) {//Opera9.8后版本号位置变化
		ua.replace(/opera.*version\/([\d.]+)/, function(a,b){Browser.opera=b;});
	};

	if(Browser.msie){
		Browser.ie = Browser.msie;
		var v = parseInt(Browser.msie);
		Browser.ie6 = v==6;
		Browser.ie7 = v==7;
		Browser.ie8 = v==8;
		Browser.ie9 = v==9;
	};

	if(Browser.ie){try{document.execCommand("BackgroundImageCache",false,true);}catch(e){}}
	
	return Browser;
}());
