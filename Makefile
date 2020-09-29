clean:
	rm -rf node_modules
	rm -rf out
	rm -rf coverage
	rm -rf .nyc_output

install:
	npm install

test: 
	rm -rf coverage
	rm -rf .nyc_output
	npm test
	
build: 
	rm -rf out
	rm -rf dist
	npm run build-linux
	npm run build-macos
	# npm run build-windows

make.base: docker build --pull --rm -f "Dockerfile" -t uploader:latest --no-cache "." 

.PHONY: clean install test build, build-win make.base