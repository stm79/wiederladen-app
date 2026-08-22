# --- Builder ---------------------------------------------------------------
FROM node:24-slim AS builder
WORKDIR /app

# Prisma's query engine needs OpenSSL at both generate-time and runtime.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# A throwaway, migrated SQLite file so `next build`'s static page generation
# (pages that read Firearms/Loads at build time) has a real schema to query
# against. It never ships — docker-compose bind-mounts the real ./data over
# this path at container start, and the entrypoint re-runs migrate deploy
# against that real, persistent database before the server starts.
ENV DATABASE_URL="file:../data/db/wiederladen.db"
RUN mkdir -p data/db data/uploads \
    && npx prisma generate \
    && npx prisma migrate deploy \
    && npm run build

# --- Runner ------------------------------------------------------------------
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL="file:../data/db/wiederladen.db"
ENV UPLOADS_DIR="./data/uploads"

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
