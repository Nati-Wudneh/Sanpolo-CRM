# better-sqlite3 is a native addon, so it's compiled in a stage with build
# tools, then the compiled node_modules are reused as-is in the runtime
# stage (same base image/glibc, so the binary is compatible).

FROM node:22-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The build seeds an initial ./data/crm.db from the bundled prospect data;
# discard it so the runtime stage starts from the persistent volume instead.
RUN npm run build && rm -rf ./data/crm.db*

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data
COPY package.json next.config.ts ./

EXPOSE 3000
CMD ["npm", "run", "start"]
