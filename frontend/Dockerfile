FROM node:20-bullseye AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    curl \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

COPY package*.json ./

RUN npm install --legacy-peer-deps
RUN npm rebuild lightningcss --build-from-source

COPY . .

RUN npm run build
