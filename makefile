SRC = src
TEST = test
TEST_SCRIPTS = $(TEST)/scripts
BUILD = build
TESTENV = testenv
LFC = lfc
LFC_MODULES = lfc/node_modules
LFC_TARGETS = lfc/targets

uglify_test = uglifyjs -i 2 -b -nm -ns
uglify      = uglifyjs
nessat      = node tool/nessat.js
lfc_b       = node lfc -t necessaria


all: lfc test 

clean:
	-rm -rf $(BUILD)/*
	-rm -rf $(LFC)/*
	-rm -rf $(TEST)/*

love:
	@echo Not War?

fLFC = $(BUILD)/lfc/compiler.rt.js \
	   $(BUILD)/lfc/parser.js \
	   $(BUILD)/lfc/compiler.js
fRuntime     = $(BUILD)/eisa.rt.js
fNecessaria  = $(BUILD)/mod.rt.js
fCommonLibs  = $(BUILD)/stl.js $(BUILD)/internl.js $(BUILD)/mod.js
fLFLibs      = $(BUILD)/stdenum.js
fBrowserLibs = $(fCommonLibs) $(BUILD)/async.js

#
# LFC: Command line utlity for Node.js
#

lfcDirs:
	@@-mkdir $(LFC)
	@@-mkdir $(LFC)/targets
	@@-mkdir $(LFC_MODULES)
	@@-mkdir $(LFC_MODULES)/lfc

nessaModules = $(subst $(BUILD), $(LFC_MODULES), $(fRuntime)) \
			   $(subst $(BUILD), $(LFC_MODULES), $(fLFC)) 
$(nessaModules): $(LFC_MODULES)/%.js : $(SRC)/%.js
	$(nessat) $< $@

nessaLibs = $(LFC_MODULES)/stl.js $(LFC_MODULES)/mod.js
$(nessaLibs):
	$(nessat) $< $@
$(LFC_MODULES)/stl.js: $(SRC)/lib/stl.js
$(LFC_MODULES)/mod.js: $(SRC)/lib/mod.node.js


LFCTargets = $(LFC_TARGETS)/node.js $(LFC_TARGETS)/necessaria.js $(LFC_TARGETS)/node.inc
$(LFCTargets): $(LFC_TARGETS)/% : $(SRC)/node/targets/%
	$(uglify) -o $@ $<

LFCComponents = $(LFC_MODULES)/opts.js \
				$(LFC)/lfc.js
$(LFCComponents):
	$(uglify) -o $@ $<
$(LFC_MODULES)/opts.js: tool/opts.js
$(LFC)/lfc.js: $(SRC)/node/lfc.js


$(LFC)/package.json: $(SRC)/node/lfc.json
	cp $< $@


lfcCore: lfcDirs $(nessaModules) $(nessaLibs) $(LFCTargets) $(LFCComponents) $(LFC)/package.json
lfc: lfcCore

#
# Web Test
#

fTestRuntime = $(subst $(BUILD), $(TEST_SCRIPTS), $(fRuntime)) \
			   $(TEST_SCRIPTS)/mod.rt.js
$(fTestRuntime): $(TEST_SCRIPTS)/%.js : $(SRC)/%.js
	cp $< $@
eisart_test: $(fTestRuntime)


fLFCTest = $(subst $(BUILD), $(TEST_SCRIPTS), $(fLFC))
$(fLFCTest): $(TEST_SCRIPTS)/%.js : $(SRC)/%.js
	cp $< $@

lfcdirs_test:
	@@-mkdir $(TEST_SCRIPTS)/lfc

lfc_test: lfcdirs_test $(fLFCTest)


fBrowserLibsTest = $(subst $(BUILD), $(TEST_SCRIPTS), $(fBrowserLibs))
$(fBrowserLibsTest): $(TEST_SCRIPTS)/%.js : $(SRC)/lib/%.js
	cp $< $@

fLFLibsTest = $(subst $(BUILD), $(TEST_SCRIPTS), $(fLFLibs))
$(fLFLibsTest): $(TEST_SCRIPTS)/%.js : $(SRC)/lib/%.lf
	$(lfc_b) $< | $(uglify_test) -o $@	

libs_test: $(fBrowserLibsTest) $(fLFLibsTest)


fTestEnv = $(TEST)/index.html $(TEST_SCRIPTS)/inputbox.js
$(fTestEnv): 
	cp $< $@
$(TEST)/index.html: $(TESTENV)/index.html
$(TEST_SCRIPTS)/inputbox.js: $(TESTENV)/inputbox.js

testdir:
	@-mkdir $(TEST)
	@-mkdir $(TEST_SCRIPTS)

testenv: testdir $(fTestEnv)

test: lfcCore testenv eisart_test lfc_test libs_test

.PHONY: all love clean \
	lfcDirs lfcModules lfcCore lfc \
	testdir testenv lfc_test libs_test eisart_test test
