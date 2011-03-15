EISA_eisa.environment = "WSH";
var getText = function(path, encoding){
	var fi = new ActiveXObject("ADODB.Stream");
	fi.Type = 2;
	fi.Mode = 3;
	fi.Charset = encoding || "utf-8";
	fi.Open();
	fi.LoadFromFile(path);
	var text = fi.readText(-1);
	fi.Close();
	fi = null;
	return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};
