# FourPlay

A modern, full‑stack Connect Four experience built as a monorepo. It features a Next.js web app, a Node.js REST API, a WebSocket matchmaking/game server, and shared packages for game logic, database access (Prisma), TypeScript configs, and linting.

## Tech Stack

- Monorepo and Tooling
  - TurboRepo for task orchestration
  - PNPM workspaces for dependency management
  - TypeScript across all packages and apps
  - Shared ESLint and TSConfig packages

- Web App
  - Next.js (App Router)
  - React
  - Tailwind CSS + PostCSS
  - lucide-react for icons

- Backend
  - Node.js REST API (apps/server)
  - WebSocket server for matchmaking and real‑time game flow (apps/ws-server)
  - Prisma ORM in a dedicated package (packages/db)

- Database
  - Prisma-supported relational database (commonly PostgreSQL)
  - Prisma Migrate for schema migrations

- Game Engine
  - Reusable Connect Four logic in packages/game (create board, drop coin, check winner)

## Repository Structure

```
├── .gitignore
├── .npmrc
├── .vscode
│   └── settings.json
├── README.md
├── apps
│   ├── server
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── tsconfig.json
│   │   └── tsconfig.tsbuildinfo
│   ├── web
│   │   ├── .gitignore
│   │   ├── README.md
│   │   ├── app
│   │   │   ├── favicon.ico
│   │   │   ├── fonts
│   │   │   │   ├── GeistMonoVF.woff
│   │   │   │   └── GeistVF.woff
│   │   │   ├── game
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── home
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── leaderboard
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── signin
│   │   │   │   └── page.tsx
│   │   │   └── signup
│   │   │       └── page.tsx
│   │   ├── components
│   │   │   ├── AuthAwareButton.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   └── UserDropdown.tsx
│   │   ├── eslint.config.js
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── public
│   │   │   ├── file-text.svg
│   │   │   ├── globe.svg
│   │   │   ├── next.svg
│   │   │   ├── turborepo-dark.svg
│   │   │   ├── turborepo-light.svg
│   │   │   ├── vercel.svg
│   │   │   └── window.svg
│   │   └── tsconfig.json
│   └── ws-server
│       ├── package.json
│       ├── src
│       │   └── index.ts
│       ├── tsconfig.json
│       └── tsconfig.tsbuildinfo
├── package.json
├── packages
│   ├── db
│   │   ├── .gitignore
│   │   ├── package.json
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   │   ├── 20250928200418_initialized_schema
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20250928201810_
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20250929113136_
│   │   │   │   │   └── migration.sql
│   │   │   │   └── migration_lock.toml
│   │   │   └── schema.prisma
│   │   ├── src
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── eslint-config
│   │   ├── README.md
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── package.json
│   │   └── react-internal.js
│   ├── game
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── checkWinner.ts
│   │   │   ├── createBoard.ts
│   │   │   ├── dropCoin.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── tsconfig.tsbuildinfo
│   └── typescript-config
│       ├── base.json
│       ├── nextjs.json
│       ├── package.json
│       └── react-library.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

## Key Features

- Authentication with JWT, guarded routes on the web app
- WebSocket matchmaking with fallback to bot after a timeout
- Fully responsive, modern UI with Tailwind CSS
- Shared, tested game logic package
- Prisma-based data access with migrations kept under version control
- Consistent iconography using Lucide React

## Prerequisites

- Node.js 18+ (LTS recommended)
- PNPM 9+
- A PostgreSQL instance (or another Prisma-supported database) and a DATABASE_URL
- Open ports:
  - Next.js web app (default 3000)
  - WebSocket server (default 8080; see client usage)
  - REST API server (configurable)

## Environment Variables

Create the following .env files before running the project:

- Database (Prisma reads .env relative to schema by default)
  - packages/db/.env
    - DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"

- Web app (optional public config)
  - apps/web/.env.local
    - NEXT_PUBLIC_WS_URL="ws://localhost:8080"
    - NEXT_PUBLIC_API_URL="http://localhost:PORT" (if the web app calls the REST API)

- API server
  - apps/server/.env
    - DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
    - JWT_SECRET="your-strong-secret"
    - PORT=3001

- WebSocket server
  - apps/ws-server/.env
    - PORT=8080
    - JWT_SECRET="your-strong-secret" (must match API if verifying tokens)
    - DATABASE_URL=... (if the WS server talks to DB)

Note: The web app code currently references ws://localhost:8080 directly in some places. Consider centralizing this via NEXT_PUBLIC_WS_URL.

## Installation

- Install workspace dependencies at the repo root:
  - pnpm install

- Generate Prisma Client:
  - pnpm --filter ./packages/db prisma generate

- Apply database migrations:
  - For local dev: pnpm --filter ./packages/db prisma migrate dev
  - For production: pnpm --filter ./packages/db prisma migrate deploy

- (Optional) inspect data with Prisma Studio:
  - pnpm --filter ./packages/db prisma studio

## Development

- Start everything with Turbo (if configured in turbo.json):
  - pnpm dev

- Or run per-app:

  - Web app (Next.js):
    - pnpm --filter ./apps/web dev
    - Runs on http://localhost:3000

  - REST API:
    - pnpm --filter ./apps/server dev
    - Default PORT from env (e.g., 3001)

  - WebSocket server:
    - pnpm --filter ./apps/ws-server dev
    - Default PORT from env (e.g., 8080)

## Build and Production

- Build all packages and apps:
  - pnpm build

- Start each service:

  - REST API:
    - pnpm --filter ./apps/server start

  - Web app:
    - pnpm --filter ./apps/web start

  - WebSocket server:
    - pnpm --filter ./apps/ws-server start

Ensure DATABASE_URL and secrets are set in the environment for each service.

## Application Flow

- Registration/Sign-in:
  - Users sign up/sign in from the web app (apps/web), receiving a JWT saved in localStorage.

- Auth Guard:
  - Protected pages use an AuthGuard component that checks for a valid JWT; unauthenticated users are redirected to /signin.

- Matchmaking:
  - From /home, the user initiates matchmaking. The web app opens a WebSocket to the WS server (ws://localhost:8080?token={JWT}).
  - If no human opponent is paired within the timeout window, the server matches the user with a bot.
  - On game start, the WS server sends an event including game state, symbol, and opponent metadata; the web app transitions to /game.

- Gameplay:
  - The shared game logic (packages/game) drives move validation and win detection on the server and/or client.

- Leaderboard:
  - The web app reads scores (via REST API or WS events) and displays the leaderboard. Styling and icons are consistent with the rest of the UI.

## Shared Packages

- packages/db
  - Prisma schema, migrations, and client access
  - Exported PrismaClient instance for use by services

- packages/game
  - Core Connect Four primitives: create board, drop coin, check winner
  - Framework-agnostic TypeScript functions

- packages/eslint-config and packages/typescript-config
  - Centralized linting rules and TS configs for consistent code quality and DX

## Security Notes

- JWTs are stored in localStorage for simplicity. Consider HttpOnly cookies if you need stronger CSRF protection.
- Keep JWT_SECRET, DATABASE_URL, and other secrets out of version control and rotate as needed.
