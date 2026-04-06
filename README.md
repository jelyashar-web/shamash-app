# שמש (Shamash) - Synagogue Management System

A local-first, production-ready synagogue management system built with Next.js 14, SQLite, and offline-first architecture.

<p align="center">
  <strong>🕯️ Modern. Hebrew. Offline-Capable.</strong>
</p>

---

## Features

- **Members Management** - Full CRUD with yahrzeit tracking and role management
- **Aliyot Management** - Torah reading assignments with role-based tracking (Kohen, Levi, Yisrael)
- **Donations** - Real-time donation recording with payment status tracking
- **Expenses** - Synagogue outgoing payments with categories
- **Events** - Calendar management for synagogue activities
- **Prayer Times** - Local Zmanim calculation using geographic coordinates
- **Real-time Sync** - WebSocket-based live updates across clients
- **Offline-First** - IndexedDB caching with automatic sync when online
- **RTL Hebrew UI** - Complete Hebrew interface with RTL support
- **PWA** - Installable Progressive Web App
- **Dark Mode** - Full dark mode support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS |
| **Database** | SQLite (better-sqlite3), Drizzle ORM |
| **Auth** | JWT (jose) with httpOnly cookies, bcrypt |
| **State** | Zustand |
| **Real-time** | WebSocket (ws) |
| **Offline** | IndexedDB (idb) |
| **Validation** | Zod |
| **PDF** | jsPDF |
| **Dates** | date-fns, suncalc |

---

## Quick Start

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

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Default Login

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@shamash.app | admin123 |
| **Gabbai** | gabbai@shamash.app | gabbai123 |

> **Important!** Change these passwords in production.

---

## Development Commands

```bash
# Development (runs Next.js + WebSocket server)
npm run dev

# Next.js only
npm run dev:next

# WebSocket server only
npm run dev:ws

# Build for production
npm run build

# Production server
npm start

# Lint
npm run lint

# Database commands
npm run db:migrate    # Run migrations
npm run db:seed       # Seed demo data
npm run db:generate   # Generate Drizzle migrations
npm run db:push       # Push schema changes
```

---

## Project Structure

```
shamash-app/
├── docs/                    # Documentation
│   ├── DEVELOPERS.md        # Developer guide
│   ├── ARCHITECTURE.md      # System architecture
│   ├── API.md              # API reference
│   └── USER_GUIDE.md       # Hebrew user manual
├── drizzle/                 # Database migrations
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── members/        # Members CRUD
│   │   ├── aliyot/         # Aliyot management
│   │   ├── donations/      # Donations tracking
│   │   ├── expenses/       # Expenses management
│   │   ├── events/         # Events calendar
│   │   └── settings/       # System settings
│   ├── components/         # React components
│   ├── db/                 # Database schema & config
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & validation
│   └── stores/             # Zustand stores
├── .env.example            # Environment template
├── CLAUDE.md              # AI assistant instructions
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
├── drizzle.config.ts      # Drizzle ORM configuration
└── websocket-server.js    # Standalone WebSocket server
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=file:./data/shamash.db

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# WebSocket
WS_PORT=3001

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## API Routes

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | List all members |
| POST | `/api/members` | Create member |
| GET | `/api/members/:id` | Get member details |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |

### Aliyot

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/aliyot` | List all aliyot |
| POST | `/api/aliyot` | Create aliyah |
| GET | `/api/aliyot/:id` | Get aliyah details |
| PUT | `/api/aliyot/:id` | Update aliyah |
| DELETE | `/api/aliyot/:id` | Delete aliyah |

### Donations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | List all donations |
| POST | `/api/donations` | Create donation |
| GET | `/api/donations/:id` | Get donation details |
| PUT | `/api/donations/:id` | Update donation |
| DELETE | `/api/donations/:id` | Delete donation |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List all expenses |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/:id` | Get expense details |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

See [docs/API.md](docs/API.md) for complete API documentation.

---

## Security

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- Input validation with Zod
- SQL injection prevention via parameterized queries
- Role-based access control (admin/gabbai)
- XSS protection through React's escaping

---

## Offline-First Architecture

Shamash is designed to work without an internet connection:

1. **IndexedDB** - Stores pending mutations when offline
2. **Optimistic UI** - Updates UI immediately, syncs in background
3. **Automatic Sync** - Processes queue when connection restored
4. **Conflict Resolution** - Last-write-wins strategy with timestamps

---

## WebSocket Real-time

A standalone WebSocket server runs on port 3001 for real-time updates:

- Room-based broadcasting
- Automatic reconnection
- Event types: member_created, aliyah_assigned, donation_recorded, etc.

---

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [DEVELOPERS.md](docs/DEVELOPERS.md) - Developer guide with setup, architecture, and API details
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture diagrams and data flows
- [API.md](docs/API.md) - Complete API reference with examples
- [USER_GUIDE.md](docs/USER_GUIDE.md) - Hebrew user manual

---

## Troubleshooting

### Database locked error

```bash
# Stop all processes, then:
rm data/shamash.db
npm run db:migrate
npm run db:seed
```

### WebSocket connection failed

- Check if port 3001 is available
- Verify `WS_PORT` in `.env.local`
- Check firewall settings

### Build fails with TypeScript errors

```bash
npm install  # Ensure all dependencies are installed
npm run build
```

---

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run lint` and `npm run build`
4. Submit a pull request

See [DEVELOPERS.md](docs/DEVELOPERS.md) for detailed contribution guidelines.

---

## License

MIT

---

<p align="center">
  Built with ❤️ for synagogue communities
</p>
