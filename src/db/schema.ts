import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// User roles enum
export const userRoleEnum = ['admin', 'gabbai'] as const;

// Member roles (aliyah categories)
export const memberRoleEnum = ['kohen', 'levi', 'yisrael'] as const;

// Users table for authentication
export const users = sqliteTable(
  'users',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: userRoleEnum }).notNull().default('gabbai'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
);

// Members table for synagogue members
export const members = sqliteTable(
  'members',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    role: text('role', { enum: memberRoleEnum }).notNull().default('yisrael'),
    yahrzeitDate: text('yahrzeit_date'), // Stored as MM-DD format
    notes: text('notes'),
    photo: text('photo'), // Base64 data URL
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: index('members_email_idx').on(table.email),
    nameIdx: index('members_name_idx').on(table.name),
  })
);

// Aliyot table for Torah reading assignments
export const aliyot = sqliteTable(
  'aliyot',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    memberId: integer('member_id', { mode: 'number' })
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    type: text('type').notNull(), // e.g., 'kohen', 'levi', 'shlishi', etc.
    parasha: text('parasha'), // Torah portion name
    assigned: integer('assigned', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    memberIdIdx: index('aliyot_member_id_idx').on(table.memberId),
    dateIdx: index('aliyot_date_idx').on(table.date),
  })
);

// Donations table
export const donations = sqliteTable(
  'donations',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    memberId: integer('member_id', { mode: 'number' })
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    description: text('description'),
    paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    memberIdIdx: index('donations_member_id_idx').on(table.memberId),
    dateIdx: index('donations_date_idx').on(table.date),
  })
);

// Events table for synagogue events
export const events = sqliteTable(
  'events',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    description: text('description'),
    type: text('type').notNull().default('general'), // e.g., 'service', 'holiday', 'meeting', 'general'
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    dateIdx: index('events_date_idx').on(table.date),
  })
);

// Relations
export const usersRelations = relations(users, ({}) => ({}));

export const membersRelations = relations(members, ({ many }) => ({
  aliyot: many(aliyot),
  donations: many(donations),
}));

export const aliyotRelations = relations(aliyot, ({ one }) => ({
  member: one(members, {
    fields: [aliyot.memberId],
    references: [members.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  member: one(members, {
    fields: [donations.memberId],
    references: [members.id],
  }),
}));

export const eventsRelations = relations(events, ({}) => ({}));

// Expenses table — synagogue outgoing payments
export const expenses = sqliteTable(
  'expenses',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    category: text('category').notNull(), // cantor | rabbi | food | maintenance | utilities | equipment | salary | other
    payee: text('payee').notNull(),        // who receives payment
    description: text('description'),
    amount: real('amount').notNull(),
    paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    dateIdx:     index('expenses_date_idx').on(table.date),
    categoryIdx: index('expenses_category_idx').on(table.category),
  })
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type Aliyah = typeof aliyot.$inferSelect;
export type NewAliyah = typeof aliyot.$inferInsert;

export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type UserRole = (typeof userRoleEnum)[number];
export type MemberRole = (typeof memberRoleEnum)[number];
