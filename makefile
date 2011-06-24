SRC = src
TEST = test
TEST_SCRIPTS = $(TEST)/scripts
BUILD = build
BUILD_SCRIPTS = $(BUILD)/scripts
TESTENV = testenv
LFC = lfc
LFC_MODULES = lfc/node_modules
LFC_TARGETS = lfc/targets

uglify_test = uglifyjs -i 2 -b -nm -ns
uglify      = uglifyjs
ugcp        = $(uglify) -o $@ $<
nessat      = node tool/nessat.js
lfc_b       = node lfc -t necessaria


all: lfc build test 

clean:
	-rm -rf $(BUILD)/*
	-rm -rf $(LFC)/*
	-rm -rf $(TEST)/*

love:
	@echo Not War?

fLFC = $(BUILD)/lfc/compiler.rt.js \
	   $(BUILD)/lfc/parser.js \
	   $(BUILD)/lfc/codegen.js \
	   $(BUILD)/lfc/compiler.js
fRuntime       = $(BUILD)/eisa.rt.js
fNecessaria    = $(BUILD)/mod.rt.js
fCommonLibs    = $(BUILD)/stl.js $(BUILD)/internl.js $(BUILD)/mod.js
fBrowserLFLibs = $(BUILD)/stdenum.js
fBrowserLibs   = $(fCommonLibs) $(BUILD)/async.js

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
	$(ugcp)

LFCComponents = $(LFC_MODULES)/opts.js \
				$(LFC)/lfc.js
$(LFCComponents):
	$(ugcp)

$(LFC_MODULES)/opts.js: tool/opts.js
$(LFC)/lfc.js: $(SRC)/node/lfc.js


$(LFC)/package.json: $(SRC)/node/lfc.json
	cp $< $@


lfcCore: lfcDirs $(nessaModules) $(nessaLibs) $(LFCTargets) $(LFCComponents) $(LFC)/package.json
lfc: lfcCore

#
# Web Test
#

fRuntimeTest     = $(subst $(BUILD), $(TEST_SCRIPTS), $(fRuntime)) $(TEST_SCRIPTS)/mod.rt.js
fLFCTest         = $(subst $(BUILD), $(TEST_SCRIPTS), $(fLFC))
fBrowserLibsTest = $(subst $(BUILD), $(TEST_SCRIPTS), $(fBrowserLibs))
fLFLibsTest      = $(subst $(BUILD), $(TEST_SCRIPTS), $(fBrowserLFLibs))
fTestEnv         = $(TEST)/index.html $(TEST_SCRIPTS)/inputbox.js

$(fRuntimeTest): $(TEST_SCRIPTS)/%.js : $(SRC)/%.js
	cp $< $@

$(fLFCTest): $(TEST_SCRIPTS)/%.js : $(SRC)/%.js
	cp $< $@

$(fBrowserLibsTest): $(TEST_SCRIPTS)/%.js : $(SRC)/lib/%.js
	cp $< $@

$(fLFLibsTest): $(TEST_SCRIPTS)/%.js : $(SRC)/lib/%.lf
	$(lfc_b) $< | $(uglify_test) -o $@	

$(fTestEnv): 
	cp $< $@
$(TEST)/index.html: $(TESTENV)/index.html
$(TEST_SCRIPTS)/inputbox.js: $(TESTENV)/inputbox.js

testdir:
	@-mkdir $(TEST)
	@-mkdir $(TEST_SCRIPTS)
	@-mkdir $(TEST_SCRIPTS)/lfc

testenv: testdir $(fTestEnv)

test: lfcCore testenv $(fRuntimeTest) $(fLFCTest) $(fBrowserLibsTest) $(fLFLibsTest)

#
# Builded Eisa
#
$(fNecessaria): $(BUILD)/%.js : $(SRC)/%.js
	$(ugcp)

$(fRuntime): $(BUILD)/%.js : $(SRC)/%.js
	$(ugcp)

$(fLFC): $(BUILD)/lfc/%.js : $(SRC)/lfc/%.js
	$(ugcp)

$(fBrowserLibs): $(BUILD)/%.js : $(SRC)/lib/%.js
	$(ugcp)

$(fBrowserLFLibs): $(BUILD)/%.js : $(SRC)/lib/%.lf
	$(lfc_b) $< | $(uglify) -o $@	

buildDir:
	@-mkdir $(BUILD)
	@-mkdir $(BUILD)/lfc

build: lfcCore buildDir \
	$(fNecessaria) $(fRuntime) $(fLFC) $(fBrowserLibs) $(fBrowserLFLibs)


.PHONY: all love clean \
	lfcDirs lfcModules lfcCore lfc \
	testdir testenv test \
	buildDir build
