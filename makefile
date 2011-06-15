SRC = src
TEST = test
BUILD = build
TESTENV = testenv
LFC = lfc
LFCM = lfc/node_modules
LFCT = lfc/targets

uglify_test = uglifyjs -i 2 -b -nm -ns
uglify      = uglifyjs
nessa       = node tool/nessa.js
lfc_b       = node lfc -t necessaria

# Web Test

all : eisa

eisa : eisart lfc libs

clean:
	-rm -rf $(BUILD)/*
	-rm -rf $(TEST)/*

eisart:
	cp $(SRC)/*.rt.js $(BUILD)/
libs:
	cp $(SRC)/lib/*.js $(BUILD)/

lfc_test:
	@-mkdir $(TEST)/lfc
	cp $(SRC)/lfc/*.js $(TEST)/lfc/

eisart_test:
	cp $(SRC)/*.rt.js $(TEST)/

lflibs = $(TEST)/stdenum.js

$(lflibs):
	$(lfc_b) $< | $(uglify_test) > $@
	
$(TEST)/stdenum.js : $(SRC)/lib/stdenum.lf

libs_test: $(lflibs)
	cp $(SRC)/lib/*.js $(TEST)/

testenv:
	cp $(TESTENV)/* $(TEST)/

test: testenv eisart_test lfc_test libs_test
	rm -rf $(TEST)/*/*~

# LFC: Command line utlity for Node.js

lfcdirs:
	@-mkdir $(LFC)
	@-mkdir $(LFC)/targets
	@-mkdir $(LFCM)
	@-mkdir $(LFCM)/lfc


nessaModules = $(LFCM)/eisa.rt.js \
			   $(LFCM)/lfc/compiler.rt.js $(LFCM)/lfc/parser.js $(LFCM)/lfc/compiler.js \
			   $(LFCM)/stl.js $(LFCM)/mod.js
$(nessaModules):
	$(nessa) $< $@

$(LFCM)/eisa.rt.js: $(SRC)/eisa.rt.js
$(LFCM)/lfc/compiler.rt.js: $(SRC)/lfc/compiler.rt.js
$(LFCM)/lfc/parser.js: $(SRC)/lfc/parser.js
$(LFCM)/lfc/compiler.js: $(SRC)/lfc/compiler.js
$(LFCM)/stl.js: $(SRC)/lib/stl.js
$(LFCM)/mod.js: $(SRC)/lib/mod.node.js

lfcComponents = $(LFCM)/opts.js $(LFCT)/node.js $(LFCT)/necessaria.js $(LFCT)/node.inc $(LFC)/lfc.js
$(lfcComponents):
	$(uglify) -o $@ $<

$(LFCM)/opts.js: tool/opts.js
$(LFCT)/node.inc: $(SRC)/node/targets/node.inc
$(LFCT)/node.js: $(SRC)/node/targets/node.js
$(LFCT)/necessaria.js: $(SRC)/node/targets/necessaria.js
$(LFC)/lfc.js: $(SRC)/node/lfc.js

lfcmodules: lfcdirs $(nessaModules) $(lfcComponents)

$(LFC)/package.json : $(SRC)/node/lfc.json
	cp $< $@

lfc : lfcmodules $(LFC)/package.json

.PHONY: all eisa clean eisart lfc libs \
	testenv eisarttest lfctest libtest test lfcdirs libsop lfcmodules
