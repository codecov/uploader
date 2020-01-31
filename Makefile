clean:
	rm -rf node_modules
	rm -rf out
	rm -rf coverage
	rm -rf .nyc_output

install:
	npm install

test: 
	npm test
	
build: 
	rm -rf out
	npm run build
	npm run build-win
	mv codecov.exe out/

.PHONY: clean install test build