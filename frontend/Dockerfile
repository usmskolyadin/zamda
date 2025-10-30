# ===== BUILDER =====
FROM node:20-bullseye AS builder

WORKDIR /app

# Устанавливаем git (иногда нужен для зависимостей)
RUN apt-get update && apt-get install -y git python3 build-essential && rm -rf /var/lib/apt/lists/*

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Копируем остальной код
COPY . .

# Отключаем LightningCSS (он ломается в контейнере)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_DISABLE_LIGHTNINGCSS=1

# Строим проект
RUN npm run build

# ===== RUNNER =====
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_LIGHTNINGCSS=1

# Копируем нужные файлы
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
