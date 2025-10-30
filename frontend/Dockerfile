# ---------- BUILDER ----------
FROM node:20-bullseye AS builder
WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем остальной код
COPY . .

# 🔧 Отключаем Sharp (Next.js не будет использовать его при сборке)
ENV NEXT_SHARP_PATH=disabled
ENV NODE_ENV=production

# Собираем проект
RUN npm run build

# ---------- RUNNER ----------
FROM node:20-bullseye AS runner
WORKDIR /app

ENV NODE_ENV=production

# Копируем минимально нужные файлы
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Отключаем Sharp и в рантайме
ENV NEXT_SHARP_PATH=disabled

EXPOSE 3000

CMD ["npm", "start"]
