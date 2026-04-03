# apps/web/Dockerfile
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

# --------------------------------------------------
# deps
# --------------------------------------------------
FROM base AS deps

COPY package*.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json

RUN npm ci

# --------------------------------------------------
# builder
# --------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN npm run build --workspace=packages/db
RUN npm run build --workspace=apps/web

# --------------------------------------------------
# runner
# --------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN apk add --no-cache libc6-compat

# standalone executive file
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
