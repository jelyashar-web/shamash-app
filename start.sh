#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=== Shamash App Startup ==="

# 1. Ensure .env.local exists
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
fi

# 2. Ensure data directory exists
mkdir -p data

# 3. Check if DB needs initialization (no users table = fresh DB)
DB_PATH="./data/shamash.db"
NEEDS_INIT=false

if [ ! -f "$DB_PATH" ] || [ ! -s "$DB_PATH" ]; then
  NEEDS_INIT=true
else
  # Check if users table exists and has rows
  USER_COUNT=$(node -e "
    try {
      const Database = require('better-sqlite3');
      const db = new Database('$DB_PATH');
      const count = db.prepare(\"SELECT COUNT(*) as n FROM users\").get();
      console.log(count.n);
      db.close();
    } catch(e) { console.log(0); }
  " 2>/dev/null || echo "0")

  if [ "$USER_COUNT" = "0" ]; then
    NEEDS_INIT=true
  fi
fi

if [ "$NEEDS_INIT" = "true" ]; then
  echo "Initializing database..."
  npm run db:init
  echo "Seeding database..."
  npm run db:seed
else
  echo "Database already initialized ($USER_COUNT users found)"
fi

# 4. Kill any existing processes on ports 3000 and 3001
for PORT in 3000 3001; do
  PID=$(lsof -ti tcp:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "Killing existing process on port $PORT (PID $PID)..."
    kill -9 $PID 2>/dev/null || true
    sleep 0.5
  fi
done

echo ""
echo "Starting Shamash..."
echo "  App:       http://localhost:3000"
echo "  WebSocket: ws://localhost:3001"
echo "  Login:     admin@shamash.app / admin123"
echo ""

# 5. Start the dev server
exec npm run dev
