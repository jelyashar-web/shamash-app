import { z } from 'zod';

// User schemas
export const loginSchema = z.object({
  email: z.string().email('אימייל לא תקין'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
});

export const createUserSchema = z.object({
  email: z.string().email('אימייל לא תקין'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  role: z.enum(['admin', 'gabbai']).default('gabbai'),
});

// Member schemas
export const memberSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'שם הוא שדה חובה'),
  phone: z.string().optional(),
  email: z.string().email('אימייל לא תקין').optional().or(z.literal('')),
  role: z.enum(['kohen', 'levi', 'yisrael']).default('yisrael'),
  yahrzeitDate: z.string().regex(/^\d{2}-\d{2}$/, 'פורמט תאריך לא תקין (MM-DD)').optional().or(z.literal('')),
  notes: z.string().optional(),
  photo: z.string().optional(),
});

// Aliyah schemas
export const aliyahSchema = z.object({
  id: z.number().optional(),
  memberId: z.number().min(1, 'יש לבחור חבר'),
  date: z.string().datetime(),
  type: z.enum(['kohen', 'levi', 'shlishi', 'revii', 'chamishi', 'shishi', 'shevii', 'maftir']),
  parasha: z.string().optional(),
  assigned: z.boolean().default(true),
});

// Donation schemas
export const donationSchema = z.object({
  id: z.number().optional(),
  memberId: z.number().min(1, 'יש לבחור חבר'),
  amount: z.number().min(0.01, 'סכום חייב להיות חיובי'),
  description: z.string().optional(),
  paid: z.boolean().default(false),
  date: z.string().datetime(),
});

// Expense schemas
export const expenseSchema = z.object({
  id: z.number().optional(),
  category: z.enum(['cantor','rabbi','food','maintenance','utilities','equipment','salary','other']),
  payee: z.string().min(1, 'יש להזין שם מקבל התשלום'),
  description: z.string().optional(),
  amount: z.number().min(0.01, 'סכום חייב להיות חיובי'),
  paid: z.boolean().default(false),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

// Event schemas
export const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  date: z.string().datetime(),
  description: z.string().optional(),
  type: z.enum(['service', 'holiday', 'meeting', 'general']).default('general'),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
export type AliyahInput = z.infer<typeof aliyahSchema>;
export type DonationInput = z.infer<typeof donationSchema>;
export type EventInput = z.infer<typeof eventSchema>;
