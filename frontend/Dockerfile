# ===== BUILDER =====
FROM node:20-bullseye AS builder

WORKDIR /app

# Устанавливаем system deps (важно: без них не пересоберутся нативные зависимости)
RUN apt-get update && apt-get install -y git python3 make g++ && rm -rf /var/lib/apt/lists/*

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем остальной проект
COPY . .

# 🔥 Ключевой момент — удаляем lightningcss после установки
RUN npm uninstall lightningcss || true

# 🔥 Принудительно выключаем его через env
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_LIGHTNINGCSS=1
ENV NODE_ENV=production

# Сборка проекта
RUN npm run build

# ===== RUNNER =====
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_LIGHTNINGCSS=1

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
