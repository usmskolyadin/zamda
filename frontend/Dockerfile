# Stage 1: build
FROM node:20-bullseye AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential python3 git curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --legacy-peer-deps \
    && npm rebuild lightningcss --build-from-source

COPY . .

RUN npm run build
FROM node:20-bullseye AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
