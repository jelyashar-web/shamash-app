'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { toast } from '@/components/toaster';
import { ArrowRight } from 'lucide-react';

interface Member {
  id: number;
  name: string;
}

export default function NewDonationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    description: '',
    paid: false,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetch('/api/members', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setMembers(d.data || []))
      .catch(() => toast('שגיאה בטעינת החברים', 'error'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.memberId) {
      toast('יש לבחור חבר', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast('יש להזין סכום תקין', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          memberId: parseInt(formData.memberId),
          amount,
          description: formData.description || undefined,
          paid: formData.paid,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (res.ok) {
        toast('תרומה נרשמה בהצלחה', 'success');
        router.push('/donations');
      } else {
        const data = await res.json();
        toast(data.error || 'שגיאה ברישום תרומה', 'error');
      }
    } catch {
      toast('שגיאה ברישום תרומה', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/donations')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה לרשימת התרומות
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">רישום תרומה חדשה</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">חבר *</label>
              <select
                required
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">בחר חבר...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">סכום (₪) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="180.00"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">תאריך *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">תיאור</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="למשל: קידוש שבת, קרן בניין..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            {/* Paid */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="paid"
                checked={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="paid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                שולם
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/donations')}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
