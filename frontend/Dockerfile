FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --legacy-peer-deps \
    && npm rebuild lightningcss --build-from-source

COPY . .

RUN npm prune --production

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
