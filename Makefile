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

build-alpine:
	docker-compose -f docker-compose-build_alpine.yml up --build --no-deps
	docker create -ti --name dummy uploader_build_alpine:latest bash
	docker cp dummy:/out/codecov-alpine out
	docker rm -f dummy

test-alpine:
	docker build -f Dockerfile.test_alpine .

.PHONY: clean install test build