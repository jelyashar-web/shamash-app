# AGENTS.md — Shamash (שמש) Synagogue Management System

This file provides essential context for AI coding agents working on the Shamash codebase.

---

## Project Overview

**Shamash** is a local-first, offline-capable synagogue management system built with Next.js 14. It manages synagogue operations including member records, Torah reading assignments (aliyot), donations, expenses, events, and prayer time calculations (zmanim).

### Key Characteristics

- **Local-first**: Data lives locally in SQLite, works without internet
- **Offline-capable**: IndexedDB caching with automatic sync when reconnected
- **Real-time**: WebSocket-based live updates across connected clients
- **RTL Hebrew UI**: Complete Hebrew interface with RTL layout support
- **Dark Mode**: Full dark mode support via next-themes

### Default Logins (Development)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shamash.app` | `admin123` |
| Gabbai | `gabbai@shamash.app` | `gabbai123` |

---

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 14.2.0 (App Router) | React framework with API routes |
| **Language** | TypeScript 5.3.3 | Type-safe development |
| **Database** | SQLite (better-sqlite3) | Local file-based database |
| **ORM** | Drizzle ORM 0.30.0 | Type-safe SQL queries |
| **Auth** | jose (JWT) | JWT signing and verification |
| **Password Hashing** | bcryptjs | Secure password storage |
| **State Management** | Zustand | Client-side state |
| **Styling** | TailwindCSS 3.4.1 | Utility-first CSS |
| **RTL Support** | tailwindcss-rtl | Right-to-left layout |
| **Real-time** | ws (WebSocket) | Standalone WebSocket server |
| **Offline Storage** | idb (IndexedDB) | Browser-based persistence |
| **Validation** | Zod | Runtime type validation |
| **PDF Generation** | jspdf | Export reports to PDF |
| **Date Handling** | date-fns | Date manipulation |
| **Zmanim (Prayer Times)** | suncalc | Sun position calculations |
| **Data Fetching** | @tanstack/react-query | Server state management |
| **Theme** | next-themes | Dark/light mode |
| **Icons** | lucide-react | Icon library |

---

## Build and Development Commands

```bash
# Development (runs Next.js + WebSocket server concurrently)
npm run dev

# Individual servers
npm run dev:next     # Next.js only (port 3000)
npm run dev:ws       # WebSocket server only (port 3001)

# Production
npm run build        # Production build
npm start            # Production server

# Code quality
npm run lint         # ESLint

# Database operations
npm run db:migrate   # Run Drizzle migrations
npm run db:seed      # Seed demo data
npm run db:init      # Initialize database
npm run db:generate  # Generate new migrations (drizzle-kit generate)
npm run db:push      # Push schema changes directly (development only)

# One-time setup
npm run setup        # Run start.sh (creates .env.local, initializes DB, starts server)
```

---

## Environment Variables

Create `.env.local` (copy from `.env.example`):

```bash
# Database
DATABASE_URL=file:./data/shamash.db

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# WebSocket Server Port
WS_PORT=3001

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: The default `JWT_SECRET` is insecure for production. Always change it.

---

## Project Structure

```
shamash-app/
├── drizzle/                    # Database migrations
│   ├── 0000_*.sql             # Migration files
│   └── meta/                  # Migration metadata
├── public/                     # Static assets
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes (REST endpoints)
│   │   │   ├── auth/         # Authentication (login/logout/me)
│   │   │   ├── aliyot/       # Aliyot CRUD
│   │   │   ├── donations/    # Donations CRUD
│   │   │   ├── events/       # Events CRUD
│   │   │   ├── expenses/     # Expenses CRUD
│   │   │   └── members/      # Members CRUD
│   │   ├── aliyot/           # Aliyot pages
│   │   ├── dashboard/        # Dashboard page
│   │   ├── donations/        # Donations pages
│   │   ├── events/           # Events pages
│   │   ├── expenses/         # Expenses pages
│   │   ├── login/            # Login page
│   │   ├── members/          # Members CRUD pages
│   │   ├── settings/         # Settings page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout (RTL, dark mode)
│   │   └── page.tsx          # Root redirect
│   ├── components/           # React components
│   │   ├── MemberAvatar.tsx  # Member avatar with fallback
│   │   ├── MemberCard.tsx    # Member display card
│   │   ├── PhotoUpload.tsx   # Image upload component
│   │   ├── navbar.tsx        # Main navigation
│   │   ├── providers.tsx     # Theme and query providers
│   │   └── toaster.tsx       # Toast notifications
│   ├── db/                   # Database layer
│   │   ├── index.ts          # Database singleton (better-sqlite3 + Drizzle)
│   │   ├── init.ts           # Database initialization
│   │   ├── migrate.ts        # Migration runner
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   └── seed.ts           # Demo data seeder
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication state hook
│   │   ├── useInView.ts      # Intersection observer hook
│   │   └── useSynagogueSettings.ts # Settings hook
│   ├── lib/                  # Utilities and helpers
│   │   ├── api-response.ts   # API response helpers (success/error/validation)
│   │   ├── auth.ts           # JWT verification, requireAuth, requireRole
│   │   ├── utils.ts          # cn() (clsx + tailwind-merge), formatters
│   │   ├── validation.ts     # Zod schemas for all entities
│   │   └── zmanim.ts         # Prayer time calculations
│   └── stores/               # Zustand stores
│       └── syncStore.ts      # Offline sync state and mutation queue
├── .env.example              # Environment template
├── CLAUDE.md                # Claude Code specific instructions
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── start.sh                 # Setup and startup script
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── websocket-server.js      # Standalone WebSocket server
```

---

## Database Schema

### Tables

#### `users` — Authentication
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, auto-increment |
| email | TEXT | Unique, not null |
| password_hash | TEXT | bcrypt hashed |
| role | TEXT | 'admin' or 'gabbai' |
| created_at | TIMESTAMP | Auto-generated |

#### `members` — Synagogue Members
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, auto-increment |
| name | TEXT | Not null |
| phone | TEXT | Optional |
| email | TEXT | Optional, indexed |
| role | TEXT | 'kohen', 'levi', 'yisrael' |
| yahrzeit_date | TEXT | MM-DD format (not full date) |
| notes | TEXT | Free text |
| photo | TEXT | Base64 data URL |
| created_at | TIMESTAMP | Auto-generated |

#### `aliyot` — Torah Reading Assignments
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, auto-increment |
| member_id | INTEGER | FK → members.id (cascade delete) |
| date | TIMESTAMP | Assignment date |
| type | TEXT | 'kohen', 'levi', 'shlishi', 'revii', 'chamishi', 'shishi', 'shevii', 'maftir' |
| parasha | TEXT | Torah portion name |
| assigned | BOOLEAN | Default true |
| created_at | TIMESTAMP | Auto-generated |

#### `donations` — Member Donations
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, auto-increment |
| member_id | INTEGER | FK → members.id (cascade delete) |
| amount | REAL | Not null |
| description | TEXT | Optional |
| paid | BOOLEAN | Default false |
| date | TIMESTAMP | Donation date |
| created_at | TIMESTAMP | Auto-generated |

#### `expenses` — Synagogue Expenses
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, auto-increment |
| category | TEXT | 'cantor', 'rabbi', 'food', 'maintenance', 'utilities', 'equipment', 'salary', 'other' |
| payee | TEXT | Who receives payment |
| description | TEXT | Optional |
| amount | REAL | Not null |
| paid | BOOLEAN | Default false |
| date | TIMESTAMP | Expense date |
| notes | TEXT | Optional |
| created_at | TIMESTAMP | Auto-generated |

#### `events` — Synagogue Events
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK, auto-increment |
| title | TEXT | Not null |
| date | TIMESTAMP | Event date |
| description | TEXT | Optional |
| type | TEXT | 'service', 'holiday', 'meeting', 'general' |
| created_at | TIMESTAMP | Auto-generated |

### Relations

- `members` has many `aliyot`
- `members` has many `donations`
- `aliyot` belongs to `members`
- `donations` belongs to `members`

### Key Implementation Notes

- **Foreign keys are enabled** (`PRAGMA foreign_keys = ON`)
- **yahrzeit_date is stored as MM-DD string** (not a full timestamp) to handle recurring annual dates
- **Photos are stored as Base64 data URLs** in the database
- All tables have appropriate indexes for common queries

---

## Architecture

### Two-Process Development Server

```
┌─────────────┐         ┌─────────────────┐
│ Next.js App │         │ WebSocket Server│
│  Port 3000  │         │   Port 3001     │
└──────┬──────┘         └────────┬────────┘
       │                         │
       │    HTTP API calls       │
       │◀───────────────────────▶│
       │                         │
       │    Room-based           │
       │◀───broadcasting────────▶│
       │                         │
       ▼                         ▼
┌─────────────┐         ┌─────────────────┐
│   SQLite    │         │   WebSocket     │
│  Database   │         │   Clients       │
└─────────────┘         └─────────────────┘
```

The WebSocket server (`websocket-server.js`) runs independently on port 3001 and supports room-based broadcasting for real-time sync across clients.

### Offline-First Architecture

```
User Action
    │
    ▼
[React Component]
    │
    ├── Online? ──YES──▶ [API Call] ──▶ [Server]
    │                       │                │
    │                       ▼                ▼
    │                  [Zustand] ◀────── [SQLite]
    │                       │
    │                       ▼
    │                   [UI Update]
    │
    └── Online? ──NO───▶ [Queue Mutation]
                              │
                              ▼
                        [IndexedDB]
                              │
                              ▼
                    [Optimistic UI Update]
```

Two IndexedDB databases:
- `shamash-sync` — Pending mutations queue (write when offline)
- `shamash-data` — Local cache of members, aliyot, donations

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Server verifies password with bcrypt
3. Server signs JWT with jose (24h expiry)
4. Server sets httpOnly cookie with token
5. Subsequent requests include cookie
6. Server verifies JWT with `verifyAuth()` or `requireAuth()` middleware
7. Role checks via `requireRole(['admin'], handler)`

### API Pattern

All API routes follow this pattern:

```typescript
// src/app/api/members/route.ts
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { memberSchema } from '@/lib/validation';
import { db } from '@/db';

export const GET = requireAuth(async (req, user) => {
  // Fetch data
  const members = await db.query.members.findMany();
  return successResponse(members);
});

export const POST = requireAuth(async (req, user) => {
  // Validate input
  const body = await req.json();
  const result = memberSchema.safeParse(body);
  
  if (!result.success) {
    return errorResponse('Validation failed', 400);
  }
  
  // Create record
  const member = await db.insert(members).values(result.data).returning();
  return successResponse(member[0], 'Member created');
});
```

---

## Code Style Guidelines

### File Naming

- **Components**: PascalCase (e.g., `MemberCard.tsx`, `PhotoUpload.tsx`)
- **Utilities**: camelCase (e.g., `api-response.ts`, `validation.ts`)
- **API Routes**: Next.js convention (`route.ts` in folder named after endpoint)
- **Pages**: Next.js App Router convention (`page.tsx` in route folder)

### Imports

Use path alias `@/` for all imports from `src/`:

```typescript
// Good
import { db } from '@/db';
import { requireAuth } from '@/lib/auth';
import { MemberCard } from '@/components/MemberCard';

// Avoid
import { db } from '../../../db';
```

### TypeScript

- Enable strict mode (configured in `tsconfig.json`)
- Use explicit return types for exported functions
- Define types in schema files (Drizzle infers types)

### Styling

- Use TailwindCSS utility classes exclusively
- Use `cn()` helper for conditional classes
- Support RTL with `tailwindcss-rtl` plugin
- Dark mode uses `dark:` prefix

Example:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "flex items-center gap-2",
  "bg-white dark:bg-gray-800",
  "rounded-lg shadow-sm",
  isActive && "ring-2 ring-primary-500"
)}>
```

### RTL (Hebrew) Support

- Root layout has `dir="rtl"` and `lang="he"`
- Use logical properties: `ms-4` (margin-start) not `ml-4`
- Tailwind RTL plugin provides `rtl:` variants
- Hebrew text is used in UI labels and validation messages

---

## Security Considerations

### Implemented

- ✅ **Password hashing**: bcrypt with salt rounds 10
- ✅ **JWT in httpOnly cookies**: Secure, SameSite=lax
- ✅ **Input validation**: All endpoints use Zod schemas
- ✅ **SQL injection prevention**: Parameterized queries via Drizzle
- ✅ **XSS prevention**: React's automatic escaping
- ✅ **CSRF protection**: SameSite cookie attribute
- ✅ **Role-based access control**: `admin` and `gabbai` roles

### Required for Production

- ⚠️ **Change default JWT_SECRET**: Currently uses insecure dev default
- ⚠️ **Rate limiting**: Not implemented
- ⚠️ **Content Security Policy**: Not implemented
- ⚠️ **HTTPS**: Required for secure cookie transmission
- ⚠️ **Change default passwords**: admin123 and gabbai123 are for development only

---

## Testing Instructions

### No Automated Tests

This project does not have automated tests configured. All testing is manual.

### Manual Testing Checklist

Before committing changes, verify:

- [ ] Login works with both admin and gabbai credentials
- [ ] Members CRUD operations (admin only for write)
- [ ] Aliyot assignment and listing
- [ ] Donation recording with paid/unpaid status
- [ ] Expense tracking with categories
- [ ] Event creation and display
- [ ] Offline functionality (disable network, make changes, re-enable)
- [ ] WebSocket real-time sync (open two browser windows)
- [ ] RTL Hebrew layout correctness
- [ ] Dark mode toggle works
- [ ] Mobile responsive design

### Testing Commands

```bash
# Linting
npm run lint

# Type checking
npm run build

# Database reset (if needed)
rm data/shamash.db
npm run db:migrate
npm run db:seed
```

---

## Common Issues and Troubleshooting

### Database Locked Error

```bash
# Stop all processes, then:
rm data/shamash.db
npm run db:migrate
npm run db:seed
```

### WebSocket Connection Failed

- Check if port 3001 is available: `lsof -ti tcp:3001`
- Verify `WS_PORT` in `.env.local`
- Check firewall settings

### Port Already in Use

The `start.sh` script automatically kills processes on ports 3000 and 3001.

### TypeScript Errors

```bash
# Ensure all dependencies are installed
npm install

# Clean build
rm -rf .next
npm run build
```

### RTL Layout Issues

- Ensure `dir="rtl"` is on `<html>` element
- Check Tailwind RTL classes are applied
- Verify Hebrew font is loaded

---

## Deployment Notes

### Production Build

```bash
npm run build
npm start
```

### Requirements

1. **Writable data directory**: `data/` must be writable for SQLite
2. **WebSocket port**: Must expose both Next.js port (3000) and WS_PORT (3001)
3. **Environment variables**: Set secure JWT_SECRET
4. **HTTPS**: Required for secure cookie transmission

### Single Server Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000 3001
CMD ["sh", "-c", "node websocket-server.js & npm start"]
```

---

## Documentation

Additional documentation is available in `docs/`:

- `docs/DEVELOPERS.md` — Developer guide with setup, architecture, and API details
- `docs/ARCHITECTURE.md` — System architecture diagrams and data flows
- `docs/API.md` — Complete API reference with examples
- `docs/USER_GUIDE.md` — Hebrew user manual

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Database table definitions and types |
| `src/lib/validation.ts` | Zod schemas for all entities |
| `src/lib/auth.ts` | JWT verification and auth middleware |
| `src/lib/utils.ts` | cn() helper and formatters |
| `src/stores/syncStore.ts` | Offline-first sync state management |
| `websocket-server.js` | Standalone WebSocket server |
| `start.sh` | One-command setup and startup |
