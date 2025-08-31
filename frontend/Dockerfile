FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && \
    apt-get install -y build-essential python3 libc6-dev git curl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps

RUN npm rebuild lightningcss

COPY . .

RUN npm run build

CMD ["npm", "start"]
