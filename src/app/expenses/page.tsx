'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { toast } from '@/components/toaster';
import { useInView } from '@/hooks/useInView';
import Link from 'next/link';
import {
  Plus, Trash2, Edit, CheckCircle, XCircle,
  Mic, BookOpen, UtensilsCrossed, Wrench, Zap, Package, Banknote, MoreHorizontal,
} from 'lucide-react';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

/* ─── Types ─── */
type Category = 'cantor'|'rabbi'|'food'|'maintenance'|'utilities'|'equipment'|'salary'|'other';

interface Expense {
  id: number; category: Category; payee: string;
  description: string | null; amount: number; paid: boolean;
  date: string; notes: string | null;
}

/* ─── Category meta ─── */
export const EXPENSE_CATEGORIES: Record<Category, {
  label: string; icon: React.ElementType;
  bg: string; text: string; border: string;
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

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}
      className={inView ? 'reveal-visible' : 'reveal-hidden'}
      style={inView ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/* ─── Category badge ─── */
function CategoryBadge({ category, size = 'sm' }: { category: Category; size?: 'sm' | 'md' }) {
  const meta = EXPENSE_CATEGORIES[category];
  const Icon = meta.icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium border',
      meta.bg, meta.text, meta.border,
      size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
    )}>
      <Icon className={size === 'md' ? 'h-4 w-4' : 'h-3 w-3'} />
      {meta.label}
    </span>
  );
}

/* ─── Page ─── */
export default function ExpensesPage() {
  const [expenses, setExpenses]   = useState<Expense[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [filterCat, setFilterCat] = useState<Category | ''>('');
  const [filterPaid, setFilterPaid] = useState<'all'|'paid'|'unpaid'>('all');

  const fetchExpenses = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch('/api/expenses', { credentials: 'include', signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setExpenses(d.data || []))
      .catch((e) => { if (e?.name !== 'AbortError') toast('שגיאה בטעינת ההוצאות', 'error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  useEffect(() => { return fetchExpenses(); }, [fetchExpenses]);

  const togglePaid = useCallback(async (exp: Expense) => {
    try {
      const res = await fetch(`/api/expenses/${exp.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ...exp, paid: !exp.paid, date: new Date(exp.date).toISOString() }),
      });
      if (res.ok) {
        setExpenses((prev) => prev.map((e) => e.id === exp.id ? { ...e, paid: !e.paid } : e));
        toast(exp.paid ? 'סומן כלא שולם' : 'סומן כשולם', 'success');
      } else toast('שגיאה בעדכון', 'error');
    } catch { toast('שגיאה בעדכון', 'error'); }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/expenses/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id)); toast('ההוצאה נמחקה', 'success'); }
      else toast('שגיאה במחיקה', 'error');
    } catch { toast('שגיאה במחיקה', 'error'); }
    finally { setDeleteTarget(null); }
  }, [deleteTarget]);

  const filtered = useMemo(() => expenses.filter((e) => {
    if (filterCat  && e.category !== filterCat) return false;
    if (filterPaid === 'paid'   && !e.paid)  return false;
    if (filterPaid === 'unpaid' &&  e.paid)  return false;
    return true;
  }), [expenses, filterCat, filterPaid]);

  const stats = useMemo(() => {
    const total   = expenses.reduce((s, e) => s + e.amount, 0);
    const paid    = expenses.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
    const unpaid  = total - paid;
    // by category
    const byCat = Object.fromEntries(
      (Object.keys(EXPENSE_CATEGORIES) as Category[]).map((c) => [
        c, expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
      ])
    ) as Record<Category, number>;
    return { total, paid, unpaid, byCat };
  }, [expenses]);

  const topCategories = useMemo(() =>
    (Object.keys(EXPENSE_CATEGORIES) as Category[])
      .filter((c) => stats.byCat[c] > 0)
      .sort((a, b) => stats.byCat[b] - stats.byCat[a])
      .slice(0, 4),
    [stats]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <Reveal>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">הוצאות בית הכנסת</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{expenses.length} הוצאות רשומות</p>
            </div>
            <Link href="/expenses/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:scale-[1.03] active:scale-[0.97] transition-all">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">רשום הוצאה</span>
              <span className="sm:hidden">הוסף</span>
            </Link>
          </div>
        </Reveal>

        {/* Summary cards */}
        <Reveal delay={60}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'סה״כ הוצאות', val: stats.total,  cls: 'text-gray-900 dark:text-white',          border: 'border-gray-200 dark:border-gray-700' },
              { label: 'שולם',         val: stats.paid,   cls: 'text-green-700 dark:text-green-300',    border: 'border-green-200 dark:border-green-800' },
              { label: 'ממתין לתשלום', val: stats.unpaid, cls: 'text-orange-700 dark:text-orange-300',  border: 'border-orange-200 dark:border-orange-800' },
            ].map(({ label, val, cls, border }) => (
              <div key={label} className={`rounded-xl bg-white dark:bg-gray-800 border ${border} p-3 sm:p-4 shadow-sm`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`text-sm sm:text-xl font-bold mt-1 truncate ${cls}`}>{formatCurrency(val)}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Category breakdown bar */}
        {expenses.length > 0 && topCategories.length > 0 && (
          <Reveal delay={100}>
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">פילוח לפי קטגוריה</p>
              <div className="space-y-2.5">
                {topCategories.map((cat) => {
                  const meta = EXPENSE_CATEGORIES[cat];
                  const Icon = meta.icon;
                  const pct  = stats.total > 0 ? Math.round((stats.byCat[cat] / stats.total) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${meta.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{meta.label}</span>
                          <span className="text-gray-500 dark:text-gray-400">{formatCurrency(stats.byCat[cat])}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${meta.bg.replace('bg-','').includes('violet') ? 'bg-violet-400' : meta.bg.replace('bg-','').includes('amber') ? 'bg-amber-400' : meta.bg.replace('bg-','').includes('green') ? 'bg-green-400' : meta.bg.replace('bg-','').includes('yellow') ? 'bg-yellow-400' : meta.bg.replace('bg-','').includes('blue') ? 'bg-blue-400' : meta.bg.replace('bg-','').includes('teal') ? 'bg-teal-400' : meta.bg.replace('bg-','').includes('slate') ? 'bg-slate-400' : 'bg-gray-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-left shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}

        {/* Filters */}
        <Reveal delay={80}>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterPaid('all')}
              className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filterPaid === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600')}>
              הכל
            </button>
            <button onClick={() => setFilterPaid('unpaid')}
              className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filterPaid === 'unpaid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600')}>
              ממתין
            </button>
            <button onClick={() => setFilterPaid('paid')}
              className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filterPaid === 'paid' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600')}>
              שולם
            </button>
            <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            {(Object.keys(EXPENSE_CATEGORIES) as Category[]).map((cat) => {
              const meta = EXPENSE_CATEGORIES[cat];
              const Icon = meta.icon;
              return (
                <button key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
                  className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors',
                    filterCat === cat ? `${meta.bg} ${meta.text} ${meta.border}` : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600')}>
                  <Icon className="h-3 w-3" />{meta.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((exp, i) => (
                <Reveal key={exp.id} delay={i * 30}>
                  <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CategoryBadge category={exp.category} />
                        </div>
                        <p className="mt-1.5 font-semibold text-gray-900 dark:text-white">{exp.payee}</p>
                        {exp.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{exp.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(exp.date)}</p>
                      </div>
                      <p className="shrink-0 text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(exp.amount)}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-3">
                      <button onClick={() => togglePaid(exp)}
                        className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                          exp.paid ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300')}>
                        {exp.paid ? <><CheckCircle className="h-3.5 w-3.5" /> שולם</> : <><XCircle className="h-3.5 w-3.5" /> ממתין</>}
                      </button>
                      <div className="flex gap-1">
                        <Link href={`/expenses/${exp.id}/edit`} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"><Edit className="h-4 w-4" /></Link>
                        <button onClick={() => setDeleteTarget(exp)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    {exp.notes && <p className="mt-2 text-xs text-gray-400 italic">{exp.notes}</p>}
                  </div>
                </Reveal>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-12 text-gray-400">אין הוצאות להצגה</p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <Reveal delay={50}>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {['קטגוריה','מקבל תשלום','תיאור','סכום','תאריך','סטטוס','פעולות'].map((h) => (
                            <th key={h} className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filtered.map((exp) => (
                          <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap"><CategoryBadge category={exp.category} /></td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{exp.payee}</span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[180px] truncate">{exp.description ?? '—'}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(exp.amount)}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(exp.date)}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <button onClick={() => togglePaid(exp)}
                                className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                                  exp.paid ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300')}>
                                {exp.paid ? <><CheckCircle className="h-3.5 w-3.5" /> שולם</> : <><XCircle className="h-3.5 w-3.5" /> ממתין</>}
                              </button>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Link href={`/expenses/${exp.id}/edit`} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"><Edit className="h-4 w-4" /></Link>
                                <button onClick={() => setDeleteTarget(exp)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">אין הוצאות להצגה</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Reveal>
            </div>
          </>
        )}
      </main>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-backdrop">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 animate-fade-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">אישור מחיקה</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-5">
              למחוק תשלום {formatCurrency(deleteTarget.amount)} ל{deleteTarget.payee}?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">ביטול</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">מחק</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
