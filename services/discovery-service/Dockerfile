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
COPY --from=builder /app/src/prisma/schema.prisma ./src/prisma/schema.prisma
COPY --from=builder /app/src/prisma/generated ./src/prisma/generated
COPY --from=builder /app/src/prisma/generated ./dist/prisma/generated
ENV NODE_ENV=production
EXPOSE 3004
CMD sh -c "npx prisma db push --skip-generate && node dist/main"
