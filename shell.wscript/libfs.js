EISA_eisa.dev.lib.register(EISA_eisa.dev.lib.define('fs.wsh', function(xport){
	var getText = function(path){
		var fi = new ActiveXObject("ADODB.Stream");
		fi.Type = 2;
		fi.Mode = 3;
		fi.Charset = "utf-8";
		fi.Open();
		fi.LoadFromFile(path);
		var text = fi.readText(-1);
		fi.Close();
		fi = null;
		return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	};

	xport('getText', getText);
}))
