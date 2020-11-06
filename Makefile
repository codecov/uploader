all:

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
	# docker-compose -f docker-compose-build_alpine.yml up --build --no-deps
	docker run --name dummy drazisilcodecov/node-static-alpine:version-0.0.3.2
	sleep 5
	docker cp dummy:/node/out/codecov-alpine out
	docker rm -f dummy

.build-in-docker:
	rm -rf out
	docker build --file Dockerfile --output out --no-cache --progress=tty . &> build.log


.build-node-in-docker:
	rm -rf out
	docker build -t alpine_node_builder:latest --file Dockerfile.build_alpine --output out --no-cache --progress=tty . &> build_node.log

make.base: 
	docker build -t uploader2:latest -f "Dockerfile" --no-cache "." 

make.node:
	docker rm -f node-alpine || true
	sleep 5
	docker run --name node-alpine drazisilcodecov/node-static-alpine:version-0.0.3.2
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
