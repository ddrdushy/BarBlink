# Production image for the Barblink landing page.
# Uses Next.js `output: 'standalone'` so the runtime stage has no deps to
# install at all — just node + the traced bundle.
# Build context: apps/landing (docker compose uses context: ./apps/landing)

# ---- deps ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Isolated npm install — no pnpm workspace linking. The landing page is
# self-contained (doesn't import from @barblink/shared-types yet) so this
# gives us a clean, flat node_modules with a single React copy.
COPY package.json ./
RUN npm install --no-audit --no-fund --loglevel=warn --legacy-peer-deps

# ---- build ----
FROM deps AS build
WORKDIR /app
COPY . ./
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    DOCKER_BUILD=1
RUN npx next build

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3100 \
    HOSTNAME=0.0.0.0

# Standalone output is fully self-contained.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3100

USER node
CMD ["node", "server.js"]
