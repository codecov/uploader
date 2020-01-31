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
	rm -rf dist
	npm run prebuild
	npm run build-linux
	npm run build-macos
	npm run build-windows

.PHONY: clean install test build