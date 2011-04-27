SRC = src
TEST = test
BUILD = build
TESTENV = testenv

.PHONY: clean eisart lfc libs \
	testenv eisarttest lfctest libtest test

clean:
	rm -rf $(BUILD)/*
	rm -rf $(TEST)/*

eisart:
	cp $(SRC)/*.rt.js $(BUILD)/

LFCD = $(SRC)/lfc

LFCFILE = $(LFCD)/compiler.rt.js \
		  $(LFCD)/ast.js \
		  $(LFCD)/compiler.js

$(BUILD)/lfc.js : $(LFCFILE)
	cat $(LFCFILE) > $(BUILD)/lfc.js

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

test: testenv eisarttest lfctest libtest
	rm -rf $(TEST)/*/*~
