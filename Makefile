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
	npm run build

.PHONY: clean install test build