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

make.base: 
	docker build --pull --rm -f "Dockerfile" -t uploader:latest --no-cache "." 

make.node:
	docker container rm node-alpine
	sleep 5
	docker run --name node-alpine uploader:latest
	mkdir -p out
	sleep 5
	docker cp node-alpine:/node/out/Release/node out/node-alpine 
	docker build --pull --rm -f "Dockerfile.build_alpine" -t builder:latest --no-cache "."
	docker container rm codecov-builder
	sleep 5
	docker run --name codecov-builder builder:latest
	mkdir -p out
	sleep 5
	docker cp codecov-builder:out/codecov-alpine out/codecov-alpine  
	
make.test:
	docker build --pull --rm -f "Dockerfile.test_alpine" -t alp-test:latest "."

.PHONY: clean install test build, make.base
