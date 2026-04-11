FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/prisma ./src/prisma

ENV NODE_ENV=production
EXPOSE 3001

# Push schema to DB on startup (idempotent), then start server
CMD sh -c "npx prisma db push --skip-generate && node dist/main"
