# syntax=docker/dockerfile:1.7-labs

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/ws-server/package.json apps/ws-server/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/game/package.json packages/game/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @repo/db exec prisma generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

RUN corepack enable

COPY --from=base /app .

EXPOSE 3000 3001 8080

CMD ["node", "apps/server/dist/index.js"]
