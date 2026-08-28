FROM oven/bun:latest AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++

COPY package*.json bun.lock* ./
COPY prisma ./prisma/

RUN bun install

COPY . .

ENV DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
RUN bunx prisma generate
RUN bun build ./src/server.ts --outdir ./dist --target node

FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV=production


COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

EXPOSE 4000

CMD ["bun", "dist/server.js"]