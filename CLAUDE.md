# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About the App

**שמש (Shamash)** is a synagogue management system — local-first, offline-capable. It manages members, Torah reading assignments (aliyot), donations, events, and prayer times (zmanim). The UI is Hebrew/RTL with dark mode support.

Default logins: `admin@shamash.app / admin123`, `gabbai@shamash.app / gabbai123`

## Commands

```bash
npm run dev          # Start Next.js (port 3000) + WebSocket server (port 3001) concurrently
npm run build        # Production build
npm run lint         # ESLint

# Database
npm run db:migrate   # Run migrations (tsx src/db/migrate.ts)
npm run db:seed      # Seed demo data
npm run db:init      # Initialize DB
npm run db:generate  # Generate Drizzle migrations (drizzle-kit generate)
npm run db:push      # Push schema changes directly (drizzle-kit push)
```

There are no test scripts configured.

## Environment

Requires `.env.local` (copy from `.env.example`):
- `DATABASE_URL` — SQLite path, defaults to `file:./shamash.db`
- `JWT_SECRET` — JWT signing key, defaults to insecure dev value
- `WS_PORT` — WebSocket port, defaults to `3001`

## Architecture

### Two-Process Dev Server
`npm run dev` runs two processes: Next.js app and a standalone WebSocket server (`websocket-server.js`). The WebSocket server supports room-based broadcasting — clients join a room then broadcast events to all room members for real-time sync.

### Database Layer (`src/db/`)
- `schema.ts` — Drizzle ORM schema: `users`, `members`, `aliyot`, `donations`, `events` tables with relations
- `index.ts` — DB singleton (better-sqlite3 + Drizzle)
- Migrations live in `drizzle/` directory
- `yahrzeitDate` stored as `MM-DD` string (not full timestamp)

### Auth (`src/lib/auth.ts`)
JWT via `jose`, stored in httpOnly cookies. Two roles: `admin` and `gabbai`. API routes use `requireAuth(handler)` or `requireRole(['admin'], handler)` wrappers.

### API Routes (`src/app/api/`)
Standard Next.js App Router route handlers. Pattern: wrap with `requireAuth`/`requireRole`, validate with Zod schemas from `src/lib/validation.ts`, query via Drizzle, return via helpers from `src/lib/api-response.ts`.

### Offline-First (`src/stores/syncStore.ts`)
Zustand store backed by two IndexedDB databases:
- `shamash-sync` — pending mutations queue (writes buffered when offline)
- `shamash-data` — local cache of members, aliyot, donations

### Pages (`src/app/`)
App Router with these main routes: `/` (redirect), `/login`, `/dashboard`, `/members`, `/members/new`, `/aliyot`, `/donations`, `/events`, `/gabai`

### Key Utilities
- `src/lib/zmanim.ts` — Prayer time calculations using `suncalc`
- `src/lib/validation.ts` — Zod schemas for all entities
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/hooks/useAuth.ts` — Auth state hook
