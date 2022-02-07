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

build_alpine:
	npm run build
	npm run build-alpine

.PHONY: clean install test build

.PHONY: run-standards-comparison
run-standards-comparison:
	docker pull codecov/autotest:standards-latest > /dev/null 2>&1
	docker run --network autotest_codecov -e HOST_URL=http://web.local:5000 -e IS_UPLOADER=true -it -v "$(PWD)/out:/usr/app/out" codecov/autotest:standards-latest
