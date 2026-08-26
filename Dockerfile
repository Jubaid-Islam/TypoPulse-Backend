FROM oven/bun:latest AS builder

WORKDIR /app

COPY package*.json bun.lock* ./
COPY prisma ./prisma/

RUN bun install

COPY . .

RUN bunx prisma generate
RUN bun build ./src/index.ts --outdir ./dist --target node

FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json bun.lock* ./
RUN bun install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

EXPOSE 4000

CMD ["bun", "dist/index.js"]