FROM alpine:3.12.0

RUN apk add git python3 openssh g++ make openssl linux-headers python2

# RUN mkdir ~/.ssh

# RUN ssh-keyscan github.com >> ~/.ssh/known_hosts

# RUN ssh-keygen -t rsa -b 4096 -C "Alpine NodeJS Build Image" -f ~/.ssh/id_rsa -N ""

# RUN ssh -T git@github.com

RUN git clone https://github.com/nodejs/node.git 

RUN cd node && git fetch --all --tags

RUN cd node && git checkout tags/v12.18.4 -b build

RUN cd node && ./configure --fully-static

RUN cd node && make -j4
