FROM alpine:3.12.0 as stage1

RUN apk add git python3 openssh g++ make openssl linux-headers python2

# RUN mkdir ~/.ssh

# RUN ssh-keyscan github.com >> ~/.ssh/known_hosts

# RUN ssh-keygen -t rsa -b 4096 -C "Alpine NodeJS Build Image" -f ~/.ssh/id_rsa -N ""

# RUN ssh -T git@github.com

RUN git clone https://github.com/nodejs/node.git 

RUN cd node && git fetch --all --tags

RUN cd node && git checkout tags/v12.16.1 -b build

COPY patches node/patches

RUN cd node && git apply patches/node.v12.16.1.cpp.patch

RUN cd node && ./configure --fully-static

RUN cd node && make -j4


FROM stage1 as stage2

# RUN git clone https://github.com/nodejs/node.git && \
#     cd node && \
#     git fetch --all --tags && \
#     git checkout tags/v12.16.1 -b build


# COPY  patches node/patches
# RUN cd node && \
#     git apply patches/node.v12.16.1.cpp.patch

# RUN cd node && \
#     ./configure --fully-static && \
#     make -j4

RUN mkdir -p /out && \
    cp /node/out/Release/node /out/node-alpine 

# -=-=-=-=-=-=- May be able to split here -=-=-=-=-=-=-=-=-

# FROM alpine_node_builder:latest as stage3

# RUN apk add \
#     nodejs \
#     npm

# # Dependencies for building nodejs
# RUN apk add \
#     git \
#     patch \
#     python2 \
#     gcc \
#     g++ \
#     make \
#     linux-headers \
#     paxctl

# RUN mkdir -p ~/.pkg-cache/v2.6

# COPY /out/node-alpine /root/.pkg-cache/v2.6/fetched-v12.16.1-alpine-x64

# COPY bin bin
# COPY src src
# COPY package.json package.json
# COPY npm-shrinkwrap.json npm-shrinkwrap.json
# RUN npm ci

# RUN npm run build-alpine

# FROM scratch AS export-stage
# COPY --from=stage3 /out/codecov-alpine .

