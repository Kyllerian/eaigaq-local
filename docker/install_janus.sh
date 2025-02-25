#docker/install_janus.sh
#!/bin/bash
set -e

## Обновляем пакеты и устанавливаем зависимости для Janus
#apt-get update && apt-get install -y --no-install-recommends \
#  libmicrohttpd-dev libjansson-dev libnice-dev \
#  libssl-dev libsrtp2-dev libsofia-sip-ua-dev libopus-dev \
#  libogg-dev libcurl4-openssl-dev liblua5.3-dev libconfig-dev \
#  pkg-config gengetopt libtool automake autoconf make cmake git \
#  libavutil-dev libavformat-dev libavcodec-dev libwebsockets-dev \
#  libglew-dev libedit-dev

wget https://curl.se/download/curl-7.68.0.tar.gz
tar xzf curl-7.68.0.tar.gz
cd curl-7.68.0
./configure --prefix=/usr --with-openssl --enable-rtsp --enable-digest-auth
make -j4
make install
cd ..


# Основные зависимости:
apt update
apt install -y \
    libmicrohttpd-dev \
    libjansson-dev \
    libssl-dev \
    libsofia-sip-ua-dev \
    libglib2.0-dev \
    libopus-dev \
    libogg-dev \
    liblua5.3-dev \
    libconfig-dev \
    pkg-config \
    libtool \
    automake \
    meson \
    ninja-build \
    cmake \
    git \
    build-essential \
    zlib1g-dev
# убран libcurl4-openssl-dev \

# libsrtp2 (рекомендуется установить 2.x):
#apt remove -y libsrtp0 libsrtp0-dev
# libsrtp2 из исходников:
wget https://github.com/cisco/libsrtp/archive/v2.2.0.tar.gz
tar xfv v2.2.0.tar.gz
cd libsrtp-2.2.0
./configure --prefix=/usr --enable-openssl
make shared_library && make install
cd ..

# usrsctp (для поддержки Data Channels)
git clone https://github.com/sctplab/usrsctp
cd usrsctp
./bootstrap
./configure --prefix=/usr --disable-programs --disable-inet --disable-inet6
make -j4 && make install
cd ..

# libnice для ICE-TCP
git clone https://gitlab.freedesktop.org/libnice/libnice
cd libnice
meson --prefix=/usr build && ninja -C build && ninja -C build install
cd ..

# libwebsockets (для поддержки WebSockets)
git clone https://github.com/warmcat/libwebsockets.git
cd libwebsockets
mkdir build && cd build
cmake .. -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DLWS_WITH_SSL=ON -DCMAKE_INSTALL_PREFIX=/usr -DCMAKE_C_FLAGS="-fpic"
make -j4 && make install
cd ..


# Клонируем репозиторий Janus
cd /tmp
git clone https://github.com/meetecho/janus-gateway.git
cd janus-gateway

# Запускаем скрипты конфигурации, сборки и установки
sh autogen.sh
./configure --prefix=/usr/local --enable-libsrtp2 --enable-json-logger
make -j4
make install
make configs

# Уборка после установки
cd /
rm -rf /tmp/janus-gateway
apt-get clean
rm -rf /var/lib/apt/lists/*