# Shamash Developer Documentation

## Project Overview

**Shamash (שמש)** is a local-first, offline-capable synagogue management system built with Next.js 14. It manages synagogue operations including member records, Torah reading assignments (aliyot), donations, expenses, events, and prayer time calculations (zmanim).

### Philosophy

- **Local-first**: Data lives locally in SQLite, works without internet
- **Offline-capable**: IndexedDB caching with automatic sync
- **Real-time**: WebSocket-based live updates across connected clients
- **Secure**: JWT authentication with role-based access control
- **Accessible**: Hebrew RTL interface with full dark mode support

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 14.2.0 (App Router) |
| Language | TypeScript | 5.3.3 |
| Styling | TailwindCSS | 3.4.1 |
| Database | SQLite (better-sqlite3) | 9.4.3 |
| ORM | Drizzle ORM | 0.30.0 |
| Auth | jose (JWT) | 5.2.3 |
| State | Zustand | 4.5.2 |
| Real-time | ws (WebSocket) | 8.16.0 |
| Offline | idb (IndexedDB) | 8.0.0 |
| Validation | Zod | 3.22.4 |
| PDF | jspdf | 2.5.1 |
| Dates | date-fns | 3.3.1 |
| Zmanim | suncalc | 1.9.0 |

---

## Directory Structure

```
shamash-app/
├── drizzle/                    # Database migrations
│   └── meta/
├── public/                     # Static assets
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── me/route.ts
│   │   │   ├── aliyot/       # Aliyot CRUD
│   │   │   ├── donations/    # Donations CRUD
│   │   │   ├── events/       # Events CRUD
│   │   │   ├── expenses/     # Expenses CRUD
│   │   │   └── members/      # Members CRUD
│   │   ├── (pages)/          # Application pages
│   │   │   ├── dashboard/
│   │   │   ├── members/
│   │   │   ├── aliyot/
│   │   │   ├── donations/
│   │   │   ├── expenses/
│   │   │   ├── events/
│   │   │   ├── gabai/
│   │   │   ├── login/
│   │   │   └── settings/
│   │   ├── layout.tsx        # Root layout with RTL
│   │   └── page.tsx          # Root redirect
│   ├── components/           # React components
│   │   ├── navbar.tsx        # Main navigation
│   │   ├── MemberCard.tsx    # Member display card
│   │   ├── MemberAvatar.tsx  # Avatar with fallback
│   │   ├── PhotoUpload.tsx   # Image upload component
│   │   ├── providers.tsx     # Theme provider
│   │   └── toaster.tsx       # Toast notifications
│   ├── db/                   # Database layer
│   │   ├── index.ts          # DB singleton
│   │   ├── migrate.ts        # Migration runner
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   └── seed.ts           # Demo data seeder
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.ts        # Auth state management
│   ├── lib/                  # Utilities
│   │   ├── api-response.ts   # API response helpers
│   │   ├── auth.ts           # JWT verification
│   │   ├── utils.ts          # cn() and helpers
│   │   ├── validation.ts     # Zod schemas
│   │   └── zmanim.ts         # Prayer time calculations
│   └── stores/               # Zustand stores
│       └── syncStore.ts      # Offline sync state
├── .env.example              # Environment template
├── .env.local               # Local environment (gitignored)
├── CLAUDE.md                # AI assistant instructions
├── README.md                # Project readme
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── tsconfig.json            # TypeScript configuration
└── websocket-server.js      # Standalone WebSocket server
```

---

## Database Schema

### Tables

#### users
Authentication table for system access.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| email | TEXT | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| role | TEXT | 'admin' or 'gabbai' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### members
Synagogue member records.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| name | TEXT | NOT NULL |
| phone | TEXT | - |
| email | TEXT | UNIQUE |
| role | TEXT | 'kohen', 'levi', 'yisrael' |
| yahrzeit_date | TEXT | MM-DD format |
| notes | TEXT | - |
| photo | TEXT | Base64 data URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### aliyot
Torah reading assignments.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| member_id | INTEGER | FK → members.id |
| date | TIMESTAMP | NOT NULL |
| type | TEXT | 'kohen', 'levi', 'shlishi', etc. |
| parasha | TEXT | Torah portion name |
| assigned | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### donations
Member donations tracking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| member_id | INTEGER | FK → members.id |
| amount | REAL | NOT NULL |
| description | TEXT | - |
| paid | BOOLEAN | DEFAULT false |
| date | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### expenses
Synagogue outgoing payments.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| category | TEXT | cantor, rabbi, food, etc. |
| payee | TEXT | NOT NULL |
| description | TEXT | - |
| amount | REAL | NOT NULL |
| paid | BOOLEAN | DEFAULT false |
| date | TIMESTAMP | NOT NULL |
| notes | TEXT | - |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### events
Synagogue events calendar.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| title | TEXT | NOT NULL |
| date | TIMESTAMP | NOT NULL |
| description | TEXT | - |
| type | TEXT | 'service', 'holiday', 'meeting', 'general' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Relations

- `members` → has many → `aliyot`
- `members` → has many → `donations`
- `aliyot` → belongs to → `members`
- `donations` → belongs to → `members`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with credentials | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Members

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/members` | List all members | Any |
| POST | `/api/members` | Create member | Admin |
| GET | `/api/members/[id]` | Get member details | Any |
| PUT | `/api/members/[id]` | Update member | Admin |
| DELETE | `/api/members/[id]` | Delete member | Admin |

### Aliyot

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/aliyot` | List all aliyot | Any |
| POST | `/api/aliyot` | Create aliyah | Admin/Gabbai |
| GET | `/api/aliyot/[id]` | Get aliyah details | Any |
| PUT | `/api/aliyot/[id]` | Update aliyah | Admin/Gabbai |
| DELETE | `/api/aliyot/[id]` | Delete aliyah | Admin |

### Donations

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/donations` | List all donations | Any |
| POST | `/api/donations` | Create donation | Admin/Gabbai |
| GET | `/api/donations/[id]` | Get donation details | Any |
| PUT | `/api/donations/[id]` | Update donation | Admin/Gabbai |
| DELETE | `/api/donations/[id]` | Delete donation | Admin |

### Expenses

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/expenses` | List all expenses | Any |
| POST | `/api/expenses` | Create expense | Admin |
| GET | `/api/expenses/[id]` | Get expense details | Any |
| PUT | `/api/expenses/[id]` | Update expense | Admin |
| DELETE | `/api/expenses/[id]` | Delete expense | Admin |

### Events

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/events` | List all events | Any |
| POST | `/api/events` | Create event | Admin/Gabbai |
| PUT | `/api/events/[id]` | Update event | Admin/Gabbai |
| DELETE | `/api/events/[id]` | Delete event | Admin/Gabbai |

---

## Authentication Flow

### Login Flow

```
┌─────────┐         ┌─────────────┐         ┌──────────┐
│ Client  │────────▶│ /api/login  │────────▶│ Database │
└─────────┘         └─────────────┘         └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ bcrypt.compare│
                   │(passwordHash)│
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ jose.signJWT │
                   │ (7 days)     │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Set httpOnly │
                   │ cookie       │
                   └──────────────┘
```

### Request Authentication

1. Client sends request with `Cookie: token=JWT`
2. Server extracts token from cookie
3. Server verifies JWT with `jose.jwtVerify()`
4. If valid, proceeds with request
5. If invalid/expired, returns 401/403

### Role-Based Access

- **admin**: Full access to all operations
- **gabbai**: Can create/read/update aliyot, donations, events; read-only on members

Middleware helpers:
- `requireAuth(handler)` - Any authenticated user
- `requireRole(['admin'], handler)` - Specific role required

---

## WebSocket Implementation

### Architecture

The WebSocket server runs independently on port 3001 (configurable via `WS_PORT`).

```
┌─────────────┐         ┌─────────────────┐
│ Next.js App │         │ WebSocket Server│
│  (Port 3000)│         │  (Port 3001)    │
└──────┬──────┘         └────────┬────────┘
       │                         │
       │    Room-based           │
       │◀───broadcasting────────▶│
       │                         │
       ▼                         ▼
┌─────────────┐         ┌─────────────────┐
│  Client A   │◀───────▶│    Client B     │
└─────────────┘         └─────────────────┘
```

### Protocol

**Join Room:**
```json
{
  "type": "join_room",
  "room": "synagogue-123"
}
```

**Broadcast Event:**
```json
{
  "type": "broadcast",
  "room": "synagogue-123",
  "event": "member_created",
  "payload": { "id": 1, "name": "..." }
}
```

**Server Response:**
```json
{
  "type": "member_created",
  "payload": { ... }
}
```

### Running the Server

```bash
# Development (runs alongside Next.js)
npm run dev

# WebSocket server only
npm run dev:ws

# Production
node websocket-server.js
```

---

## Offline-First Architecture

### Data Flow

```
User Action
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Zustand   │────▶│  IndexedDB  │     │   Server    │
│    Store    │     │   (Queue)   │     │   (SQLite)  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │                   ▲
                           │    Online?        │
                           ▼                   │
                    ┌─────────────┐            │
                    │ Sync Engine │─────────────┘
                    │  (Process)  │   HTTP API
                    └─────────────┘
```

### IndexedDB Structure

**Database: `shamash-sync`**
- Store: `mutations`
  - Key: `id` (string)
  - Value: Mutation object

**Database: `shamash-data`**
- Store: `members` - Local cache
- Store: `aliyot` - Local cache
- Store: `donations` - Local cache

### Mutation Queue

Each mutation has:
```typescript
interface Mutation {
  id: string;           // Unique ID
  type: 'create' | 'update' | 'delete';
  entity: string;       // 'members', 'aliyot', etc.
  data: any;            // Entity data
  timestamp: number;    // Unix timestamp
}
```

### Sync Process

1. User makes change offline
2. Change stored in IndexedDB queue
3. UI updates optimistically from Zustand
4. When online, sync engine processes queue
5. On success, removes from queue
6. On failure, retries with exponential backoff

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd shamash-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Initialize database
npm run db:migrate

# Seed with demo data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```bash
# .env.local
DATABASE_URL=file:./data/shamash.db
JWT_SECRET=your-super-secret-jwt-key-change-this
WS_PORT=3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development Commands

```bash
npm run dev          # Start Next.js + WebSocket server
npm run dev:next     # Next.js only
npm run dev:ws       # WebSocket only
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema changes
```

---

## Build and Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Considerations

1. **Database**: Ensure `data/` directory is writable
2. **WebSocket**: Ensure port 3001 (or configured WS_PORT) is open
3. **JWT Secret**: Change from default in production
4. **HTTPS**: Use HTTPS for secure cookie transmission

### Docker Deployment (Optional)

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

## Testing Approach

### Manual Testing Checklist

- [ ] Login with admin/gabbai credentials
- [ ] Create, read, update, delete members
- [ ] Assign aliyot to members
- [ ] Record donations with paid/unpaid status
- [ ] Add expenses with categories
- [ ] Create events
- [ ] Test offline functionality
- [ ] Verify WebSocket sync
- [ ] Test RTL Hebrew layout
- [ ] Verify dark mode

### Testing Commands

```bash
# Linting
npm run lint

# Type checking (via Next.js build)
npm run build
```

---

## Contributing Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing file naming conventions
- Use TailwindCSS for styling
- Maintain RTL support for Hebrew

### Commit Messages

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat(members): add photo upload support`

### Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Run lint and build
4. Submit PR with description
5. Request review

---

## Troubleshooting

### Common Issues

**Database locked error:**
```bash
# Stop all processes, then:
rm data/shamash.db
npm run db:migrate
npm run db:seed
```

**WebSocket connection failed:**
- Check if port 3001 is available
- Verify WS_PORT in .env.local
- Check firewall settings

**Build fails with TypeScript errors:**
- Run `npm install` to ensure all deps
- Check `tsconfig.json` configuration

**RTL layout issues:**
- Ensure `dir="rtl"` is set on `<html>`
- Check Tailwind RTL classes

### Debug Mode

Set `NODE_ENV=development` for verbose logging.

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Jewish Calendar API](https://github.com/Hebcal) (reference)
