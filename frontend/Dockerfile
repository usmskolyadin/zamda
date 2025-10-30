# Этап сборки (builder)
FROM node:20-bullseye AS builder

WORKDIR /app

# Устанавливаем git, если нужно для зависимостей
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Копируем только package.json и package-lock.json (ускоряет кэширование)
COPY package*.json ./

# Устанавливаем зависимости в окружении Linux
RUN npm ci --legacy-peer-deps

# Копируем всё остальное
COPY . .

# Сборка Next.js проекта
RUN npm run build

# Удаляем dev-зависимости, чтобы контейнер был легче
RUN npm prune --production

# Этап запуска (runner)
FROM node:20-bullseye AS runner

WORKDIR /app
ENV NODE_ENV=production

# Копируем только необходимые артефакты
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
