.PHONY: clean sync

clean:
	rm -rf build/*

sync:
	cp src/*.js test/
	cp src/lib/*.js test/
	cp -a src/lfc test/
	rm -rf test/*/*~
