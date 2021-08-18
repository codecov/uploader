all:

clean:
	rm -rf node_modules
	rm -rf out
	rm -rf coverage
	rm -rf .nyc_output
	rm -rf dist

install:
	npm install

test: 
	rm -rf coverage
	rm -rf .nyc_output
	npm test
	

build: 
	rm -rf out
	rm -rf dist
	npm run build
	npm run build-linux
	npm run build-macos

build_arm:
	npm run build-macos-arm

build_alpine:
	npm run build
	npm run build-alpine

.PHONY: clean install test build
