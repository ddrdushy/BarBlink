FROM mcr.microsoft.com/playwright:v1.49.1-noble AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.49.1-noble AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/prisma/schema.prisma ./src/prisma/schema.prisma
COPY --from=builder /app/src/prisma/generated ./src/prisma/generated
COPY --from=builder /app/src/prisma/generated ./dist/prisma/generated
ENV NODE_ENV=production
ENV PLAYWRIGHT_HEADLESS=true
EXPOSE 3009
CMD sh -c "npx prisma db push --skip-generate && node dist/main"
