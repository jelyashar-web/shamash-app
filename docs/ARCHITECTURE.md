# Shamash Architecture Documentation

## System Overview

Shamash is a local-first, offline-capable synagogue management system built on a modern web stack. This document describes the high-level architecture, data flows, and design decisions.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    React     │  │   Zustand    │  │  IndexedDB   │  │ ServiceWorker│    │
│  │  Components  │  │    Store     │  │   (idb)      │  │    (PWA)     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────┘    │
│         │                 │                 │                               │
│         └─────────────────┴─────────────────┘                               │
│                    Offline-First State Management                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP / WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVER LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        Next.js 14 App                                │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │  │
│  │  │  App Router  │ │  API Routes  │ │   Server     │ │  Middleware  │ │  │
│  │  │   (Pages)    │ │   (REST)     │ │ Components   │ │   (Auth)     │ │  │
│  │  └──────┬───────┘ └──────┬───────┘ └──────────────┘ └──────────────┘ │  │
│  │         │                │                                           │  │
│  └─────────┼────────────────┼───────────────────────────────────────────┘  │
│            │                │                                               │
│            ▼                ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                    WebSocket Server (Port 3001)                       │    │
│  │              Room-based real-time broadcasting                        │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                      SQLite Database                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │    │
│  │  │  users   │ │ members  │ │  aliyot  │ │donations │ │ expenses │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │    │
│  │  ┌──────────┐                                                        │    │
│  │  │  events  │                                                        │    │
│  │  └──────────┘                                                        │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Managed by: Drizzle ORM + better-sqlite3                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
Root Layout (RTL + Dark Mode)
│
├── Providers
│   ├── ThemeProvider (next-themes)
│   └── QueryProvider (@tanstack/react-query)
│
├── Navbar
│   ├── Logo/Brand
│   ├── Navigation Links
│   ├── User Menu
│   └── Logout
│
└── Page Content
    ├── Dashboard
    │   ├── Stats Cards
    │   ├── Zmanim Display
    │   └── Recent Activity
    │
    ├── Members
    │   ├── Member List
    │   ├── Member Card
    │   ├── Member Form
    │   └── Search/Filter
    │
    ├── Aliyot
    │   ├── Calendar View
    │   ├── Aliyah Assignment
    │   └── Report Generator
    │
    ├── Donations
    │   ├── Donation List
    │   ├── Donation Form
    │   └── Summary Charts
    │
    ├── Expenses
    │   ├── Expense List
    │   ├── Expense Form
    │   └── Category Breakdown
    │
    ├── Events
    │   ├── Event Calendar
    │   └── Event Form
    │
    ├── Settings
    │   ├── General Settings
    │   ├── User Management
    │   └── Export Data
    │
    └── Login
        └── Login Form
```

---

## Data Flow

### 1. Normal Operation (Online)

```
User Action
    │
    ▼
[React Component]
    │
    ▼ (API Call)
[Next.js API Route]
    │
    ▼ (SQL Query)
[SQLite Database]
    │
    ▼ (Response)
[React Component] ──▶ [Zustand Store] ──▶ [UI Update]
    │
    ▼ (Broadcast)
[WebSocket] ──▶ [Other Clients Sync]
```

### 2. Offline Operation

```
User Action
    │
    ▼
[React Component]
    │
    ▼ (Queue Mutation)
[Zustand Store]
    │
    ▼ (Persist)
[IndexedDB: mutations]
    │
    ▼ (Optimistic Update)
[IndexedDB: cache] ──▶ [UI Update]
    │
    ▼ (Background Sync)
[API Call when Online] ──▶ [Remove from Queue]
```

### 3. Real-time Sync

```
Client A                    Server                     Client B
   │                          │                          │
   │  POST /api/members       │                          │
   │──────────────────────────▶│                          │
   │                          │                          │
   │                          │  Broadcast Event         │
   │                          │──────────────────────────▶│
   │                          │  {type: 'member_created'}│
   │                          │                          │
   │                          │  Broadcast Event         │
   │  Receive Broadcast       │◀─────────────────────────│
   │◀─────────────────────────│                          │
   │                          │                          │
   │  Update UI               │                          │
   │                          │                          │
```

---

## Security Model

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Login   │────▶│  Verify  │────▶│ Generate │
│          │     │   API    │     │Password  │     │   JWT    │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
     ▲                                                  │
     │                                                  │
     │         ┌──────────┐     ┌──────────┐          │
     │         │ httpOnly │     │  Store   │◀─────────┘
     │         │  Cookie  │◀────│  Token   │
     │         └────┬─────┘     └──────────┘
     │              │
     └──────────────┘

Subsequent Requests:
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Request │────▶│  Extract │────▶│  Verify  │────▶│  Allow   │
│ + Cookie │     │  Token   │     │   JWT    │     │  Access  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                 │                │                 │
     │                 │                │                 │
     │                 │                │                 │
     ▼                 ▼                ▼                 ▼
   Header         Cookie           jose          Protected
   Check         Parse           Verify           Route
```

### Authorization Matrix

| Resource | Operation | Admin | Gabbai | Guest |
|----------|-----------|-------|--------|-------|
| Members | Read | ✅ | ✅ | ❌ |
| Members | Create/Update/Delete | ✅ | ❌ | ❌ |
| Aliyot | Read | ✅ | ✅ | ❌ |
| Aliyot | Create/Update/Delete | ✅ | ✅ | ❌ |
| Donations | Read | ✅ | ✅ | ❌ |
| Donations | Create/Update/Delete | ✅ | ✅ | ❌ |
| Expenses | Read | ✅ | ❌ | ❌ |
| Expenses | Create/Update/Delete | ✅ | ❌ | ❌ |
| Events | Read | ✅ | ✅ | ❌ |
| Events | Create/Update/Delete | ✅ | ✅ | ❌ |
| Settings | All | ✅ | ❌ | ❌ |

---

## Offline Sync Mechanism

### Sync State Machine

```
                    ┌─────────────────┐
         ┌──────────│   ONLINE MODE   │◀──────────┐
         │          └────────┬────────┘           │
         │                     │                   │
    Network    Network     ┌────▼────┐        Sync
    Lost     Restored    │ MUTATION │      Complete
         │                └────┬────┘           │
         │                     │                 │
         │          ┌───────────▼────────┐        │
         └─────────▶│ OFFLINE QUEUE MODE │──────┘
                    └────────────────────┘
```

### Mutation Queue Processing

```typescript
// Pseudocode for sync engine
async function processMutationQueue() {
  const mutations = await getQueuedMutations();
  
  for (const mutation of mutations) {
    try {
      await sendToServer(mutation);
      await removeFromQueue(mutation.id);
      await updateCache(mutation);
    } catch (error) {
      if (isRetryable(error)) {
        await scheduleRetry(mutation);
      } else {
        await markAsFailed(mutation);
      }
    }
  }
}
```

### Conflict Resolution

Strategy: **Last Write Wins** (timestamp-based)

```
Client A                    Server                     Client B
   │                          │                          │
   │  Update at 10:00        │                          │
   │──────────────────────────▶│                          │
   │                          │                          │
   │                          │  Update at 10:05         │
   │                          │◀─────────────────────────│
   │                          │                          │
   │  Sync at 10:10          │                          │
   │──────────────────────────▶│                          │
   │                          │                          │
   │  Server has 10:05         │                          │
   │  Keep server version    │                          │
   │                          │                          │
```

---

## Database Design

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  users   │       │ members  │       │  aliyot  │
├──────────┤       ├──────────┤       ├──────────┤
│ id (PK)  │       │ id (PK)  │       │ id (PK)  │
│ email    │       │ name     │       │ memberId │─────┐
│ password │       │ phone    │       │ date     │     │
│ role     │       │ email    │       │ type     │     │
│ createdAt│       │ role     │       │ parasha  │     │
└──────────┘       │ yahrzeit │       │ assigned │     │
                   │ notes    │       │ createdAt│     │
                   │ photo    │       └──────────┘     │
                   │ createdAt│                        │
                   └────┬─────┘                        │
                        │                              │
                        │ 1:N                          │
                        │                              │
                        ▼                              │
                   ┌──────────┐                        │
                   │ donations│                        │
                   ├──────────┤                        │
                   │ id (PK)  │                        │
                   │ memberId │────────────────────────┘
                   │ amount   │
                   │ desc     │
                   │ paid     │
                   │ date     │
                   │ createdAt│
                   └──────────┘
```

### Indexing Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| users | email (unique) | Fast login lookup |
| members | email | Member search |
| members | name | Alphabetic listing |
| aliyot | memberId | Member history |
| aliyot | date | Date range queries |
| donations | memberId | Donor history |
| donations | date | Date range reports |
| expenses | date | Date range reports |
| expenses | category | Category breakdown |
| events | date | Calendar queries |

---

## Performance Considerations

### Optimizations

1. **Database**: IndexedDB for client caching, SQLite server-side
2. **Network**: WebSocket for real-time, HTTP for mutations
3. **Rendering**: React Server Components where possible
4. **Images**: Base64 encoding for small photos, lazy loading
5. **Bundle**: Code splitting by route

### Caching Strategy

```
┌──────────────────────────────────────────────────────────┐
│                     CACHE LAYERS                          │
├──────────────────────────────────────────────────────────┤
│ L1: React State (Zustand) - In-memory, fastest           │
│ L2: IndexedDB - Persistent client cache                    │
│ L3: HTTP Cache - Browser cache for static assets         │
│ L4: Server Cache - SQLite query cache (implicit)         │
└──────────────────────────────────────────────────────────┘
```

---

## Scalability Notes

### Current Scope

Designed for single synagogue deployment:
- Single SQLite database
- Single WebSocket server
- Single Next.js instance

### Future Scaling Options

1. **Database**: Migrate to PostgreSQL for multi-tenant
2. **WebSocket**: Redis pub/sub for multi-server
3. **Files**: S3-compatible storage for photos
4. **CDN**: Cloudflare for static assets

---

## Deployment Architecture

### Single Server Deployment

```
┌─────────────────────────────────────────┐
│             VPS / Server                │
│  ┌─────────────────────────────────┐   │
│  │         Nginx (Reverse Proxy)   │   │
│  │     ┌─────────────────────┐     │   │
│  │     │   Port 80/443       │     │   │
│  │     └──────────┬──────────┘     │   │
│  │                │                 │   │
│  │    ┌───────────┴───────────┐     │   │
│  │    ▼                       ▼     │   │
│  │ ┌──────────┐          ┌──────────┐│   │
│  │ │Next.js   │          │WebSocket ││   │
│  │ │Port 3000 │          │Port 3001││   │
│  │ └────┬─────┘          └──────────┘│   │
│  │      │                            │   │
│  │      ▼                            │   │
│  │ ┌──────────┐                      │   │
│  │ │ SQLite   │                      │   │
│  │ │  File    │                      │   │
│  │ └──────────┘                      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Technology Decisions

### Why Next.js 14?

- **App Router**: Modern routing with Server Components
- **API Routes**: Built-in backend in same codebase
- **TypeScript**: First-class support
- **Performance**: Image optimization, code splitting

### Why SQLite?

- **Simplicity**: Single file, no server setup
- **Portability**: Easy backup and migration
- **Performance**: Good for single-instance workloads
- **Type-safe**: Drizzle ORM provides TypeScript types

### Why Zustand?

- **Simplicity**: Minimal boilerplate vs Redux
- **Performance**: Selective subscription updates
- **DevTools**: Redux DevTools compatibility
- **Persistence**: Easy integration with storage

### Why IndexedDB?

- **Capacity**: Larger than localStorage
- **Structured**: Object store with indexes
- **Async**: Non-blocking operations
- **API**: idb library for Promises

---

## Monitoring & Debugging

### Logs

- WebSocket server: console.log
- Next.js: built-in logging
- Errors: captured in API responses

### Debug Mode

Enable with `NODE_ENV=development`:
```bash
# Verbose WebSocket logging
DEBUG=websocket:* npm run dev:ws

# Next.js dev mode
npm run dev:next
```

### Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Server status |
| WebSocket ping | Connection status |

---

## Security Checklist

- [x] Password hashing (bcrypt)
- [x] JWT in httpOnly cookies
- [x] Input validation (Zod)
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (React escapes by default)
- [x] CSRF protection (SameSite cookies)
- [x] Role-based access control
- [ ] Rate limiting (TODO)
- [ ] Content Security Policy (TODO)
