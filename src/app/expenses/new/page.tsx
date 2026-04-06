'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { toast } from '@/components/toaster';
import { EXPENSE_CATEGORIES } from '../page';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = keyof typeof EXPENSE_CATEGORIES;

export default function NewExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'other' as Category,
    payee: '',
    description: '',
    amount: '',
    paid: false,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) { toast('יש להזין סכום תקין', 'error'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ...formData, amount, date: new Date(formData.date).toISOString() }),
      });
      if (res.ok) { toast('הוצאה נרשמה בהצלחה', 'success'); router.push('/expenses'); }
      else { const d = await res.json(); toast(d.error || 'שגיאה', 'error'); }
    } catch { toast('שגיאה', 'error'); }
    finally { setIsLoading(false); }
  };

  const inputCls = 'mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <button onClick={() => router.push('/expenses')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors">
          <ArrowRight className="h-4 w-4" /> חזרה להוצאות
        </button>

        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-5">
            <h1 className="text-xl font-bold text-white">רישום הוצאה חדשה</h1>
            <p className="text-rose-100 text-sm mt-0.5">תשלומי בית הכנסת</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Category picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">קטגוריה *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(EXPENSE_CATEGORIES) as Category[]).map((cat) => {
                  const meta = EXPENSE_CATEGORIES[cat];
                  const Icon = meta.icon;
                  const active = formData.category === cat;
                  return (
                    <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-medium transition-all',
                        active ? `${meta.bg} ${meta.text} ${meta.border} scale-[1.03]` : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400'
                      )}>
                      <Icon className="h-5 w-5" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payee + Amount */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">מקבל התשלום *</label>
                <input type="text" required value={formData.payee}
                  onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  placeholder="שם החזן / הרב / ספק..."
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">סכום (₪) *</label>
                <input type="number" required min="0.01" step="0.01" value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00" className={inputCls} />
              </div>
            </div>

            {/* Date + Description */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">תאריך *</label>
                <input type="date" required value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">תיאור</label>
                <input type="text" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="לדוגמה: שירות חתונה, קידוש שבת..."
                  className={inputCls} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">הערות</label>
              <textarea rows={2} value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={inputCls} />
            </div>

            {/* Paid toggle */}
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 px-4 py-3">
              <input type="checkbox" id="paid" checked={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="paid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                הסכום כבר שולם
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => router.push('/expenses')}
                className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                ביטול
              </button>
              <button type="submit" disabled={isLoading}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all">
                {isLoading ? 'שומר...' : 'שמור הוצאה'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
