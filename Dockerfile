FROM alpine:3.12.0

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
