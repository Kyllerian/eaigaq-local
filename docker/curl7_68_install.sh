#!/bin/bash
set -e
wget https://curl.se/download/curl-7.68.0.tar.gz
tar xzf curl-7.68.0.tar.gz
cd curl-7.68.0
./configure --prefix=/usr --with-openssl --enable-rtsp --enable-digest-auth
make -j4
make install
cd ..