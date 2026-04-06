# תיעוד מערכת שמש / Shamash Documentation

ברוכים הבאים לתיעוד המקיף של מערכת שמש - מערכת ניהול בית כנסת.

Welcome to the comprehensive documentation for Shamash - Synagogue Management System.

---

## מסמכים זמינים / Available Documents

### למפתחים / For Developers

| מסמך | תיאור |
|-------|-------|
| [DEVELOPERS.md](./DEVELOPERS.md) | תיעוד מפתחים מקיף - מדריך טכני מלא |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | תיאור הארכיטקטורה - תרשימים וזרימת מידע |
| [API.md](./API.md) | תיעוד API - כל הנקודות הקצה והבקשות |

### למשתמשים / For Users

| מסמך | תיאור |
|-------|-------|
| [USER_GUIDE.md](./USER_GUIDE.md) | מדריך משתמש בעברית - הוראות שימוש מפורטות |

### עיקרי / Quick Links

- **התחלה מהירה**: ראו [DEVELOPERS.md#development-setup](./DEVELOPERS.md#development-setup)
- **מבנה הפרויקט**: ראו [DEVELOPERS.md#directory-structure](./DEVELOPERS.md#directory-structure)
- **מדריך למשתמש**: ראו [USER_GUIDE.md](./USER_GUIDE.md)
- **תיעוד API**: ראו [API.md](./API.md)

---

## תיאור המערכת / System Description

**שמש (Shamash)** היא מערכת ניהול בית כנסת מודרנית שפותחה בטכנולוגיות web מתקדמות:

- **Local-first** - עובדת גם ללא אינטרנט
- **Offline-capable** - שמירת נתונים מקומית
- **Real-time sync** - סנכרון בזמן אמת
- **Secure** - אימות מאובטח
- **Hebrew RTL** - תמיכה מלאה בעברית

### תכונות עיקריות / Key Features

- ✅ ניהול חברים (Members)
- ✅ שיבוץ עליות לתורה (Aliyot)
- ✅ רישום תרומות (Donations)
- ✅ ניהול הוצאות (Expenses)
- ✅ לוח אירועים (Events)
- ✅ חישוב זמני היום (Zmanim)
- ✅ סנכרון אופליין (Offline sync)

---

## מבנה התיעוד / Documentation Structure

```
docs/
├── README.md           # אתם כאן / You are here
├── DEVELOPERS.md      # Developer guide
├── ARCHITECTURE.md    # System architecture
├── API.md            # API reference
└── USER_GUIDE.md     # Hebrew user guide
```

---

## התקנה והפעלה / Installation

```bash
# Clone repository
git clone <repo-url>
cd shamash-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Initialize database
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development
npm run dev
```

ברירת המחדל: [http://localhost:3000](http://localhost:3000)

---

## Default Logins

| תפקיד | אימייל | סיסמה |
|-------|--------|-------|
| מנהל | admin@shamash.app | admin123 |
| גבאי | gabbai@shamash.app | gabbai123 |

---

## טכנולוגיות / Tech Stack

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Database | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| Auth | JWT (jose) |
| State | Zustand |
| Real-time | WebSocket (ws) |
| Offline | IndexedDB (idb) |

---

## רשיון / License

MIT License

---

**גרסה / Version:** 1.0.0  
**עודכן / Updated:** 2024-01-15
