clean:
	rm -rf node_modules
	rm -rf out

install:
	npm install

test: 
	npm test
	
build: 
	npm run build

.PHONY: clean install test build