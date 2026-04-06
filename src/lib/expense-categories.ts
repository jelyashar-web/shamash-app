import type { ReactNode } from 'react';
import {
  Mic, BookOpen, UtensilsCrossed, Wrench, Zap, Package, Banknote, MoreHorizontal,
} from 'lucide-react';

export type ExpenseCategory = 'cantor'|'rabbi'|'food'|'maintenance'|'utilities'|'equipment'|'salary'|'other';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
}> = {
  cantor:      { label: 'חזן',         icon: Mic,              bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  rabbi:       { label: 'רב',          icon: BookOpen,         bg: 'bg-amber-100 dark:bg-amber-900/40',   text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-800'   },
  food:        { label: 'קידוש / אוכל', icon: UtensilsCrossed, bg: 'bg-green-100 dark:bg-green-900/40',   text: 'text-green-700 dark:text-green-300',   border: 'border-green-200 dark:border-green-800'   },
  maintenance: { label: 'תחזוקה',      icon: Wrench,           bg: 'bg-slate-100 dark:bg-slate-800',      text: 'text-slate-700 dark:text-slate-300',   border: 'border-slate-200 dark:border-slate-700'   },
  utilities:   { label: 'חשמל / מים',  icon: Zap,              bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
  equipment:   { label: 'ציוד',        icon: Package,          bg: 'bg-blue-100 dark:bg-blue-900/40',     text: 'text-blue-700 dark:text-blue-300',     border: 'border-blue-200 dark:border-blue-800'     },
  salary:      { label: 'משכורת',      icon: Banknote,         bg: 'bg-teal-100 dark:bg-teal-900/40',     text: 'text-teal-700 dark:text-teal-300',     border: 'border-teal-200 dark:border-teal-800'     },
  other:       { label: 'אחר',         icon: MoreHorizontal,   bg: 'bg-gray-100 dark:bg-gray-700',        text: 'text-gray-700 dark:text-gray-300',     border: 'border-gray-200 dark:border-gray-600'     },
};
