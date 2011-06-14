SRC = src
TEST = test
BUILD = build
TESTENV = testenv

uglify_test = uglify -i 2 -b -nm -ns --overwrite
uglify      = uglify --overwrite

compose = cat $^ > $@

all : eisa

eisa : eisart lfc libs

clean:
	-rm -rf $(BUILD)/*
	-rm -rf $(TEST)/*

eisart:
	cp $(SRC)/*.rt.js $(BUILD)/

LFCD = $(SRC)/lfc
LFCFILE = $(LFCD)/compiler.rt.js \
		  $(LFCD)/parser.js \
		  $(LFCD)/compiler.js

$(BUILD)/lfc.js : $(LFCFILE)
	$(compose)

lfc : $(BUILD)/lfc.js

lfctest:
	-mkdir $(TEST)/lfc
	cp $(SRC)/lfc/*.js $(TEST)/lfc/

libs:
	cp $(SRC)/lib/*.js $(BUILD)/

eisarttest:
	cp $(SRC)/*.rt.js $(TEST)/

libtest:
	cp $(SRC)/lib/*.js $(TEST)/

testenv:
	cp $(TESTENV)/* $(TEST)/

libsop:
	-$(uglify_test) $(TEST)/stdenum.js

test: testenv eisarttest lfctest libtest libsop
	rm -rf $(TEST)/*/*~

.PHONY: all eisa clean eisart lfc libs \
	testenv eisarttest lfctest libtest test
