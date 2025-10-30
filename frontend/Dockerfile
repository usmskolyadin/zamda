# ---------- BUILDER ----------
FROM node:20-bullseye AS builder
WORKDIR /app

# Системные зависимости для sharp
RUN apt-get update && apt-get install -y \
    build-essential libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev libvips-dev python3 \
    && rm -rf /var/lib/apt/lists/*

# Копируем только package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости для Linux
RUN npm install --arch=x64 --platform=linux --legacy-peer-deps --include=optional

# Копируем проект
COPY . .

# Билдим Next.js
RUN npm run build

# ---------- RUNNER ----------
FROM node:20-bullseye AS runner
WORKDIR /app

# Копируем только нужное для продакшна
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
