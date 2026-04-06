'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { toast } from '@/components/toaster';
import { ArrowRight } from 'lucide-react';

interface Member {
  id: number;
  name: string;
}

const ALIYAH_TYPES = [
  { value: 'kohen', label: 'כהן' },
  { value: 'levi', label: 'לוי' },
  { value: 'shlishi', label: 'שלישי' },
  { value: 'revii', label: 'רביעי' },
  { value: 'chamishi', label: 'חמישי' },
  { value: 'shishi', label: 'שישי' },
  { value: 'shevii', label: 'שביעי' },
  { value: 'maftir', label: 'מפטיר' },
];

export default function EditAliyahPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    memberId: '',
    date: '',
    type: 'kohen',
    parasha: '',
    assigned: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aliyotRes, membersRes] = await Promise.all([
          fetch('/api/aliyot', { credentials: 'include' }),
          fetch('/api/members', { credentials: 'include' }),
        ]);

        if (membersRes.ok) {
          const md = await membersRes.json();
          setMembers(md.data || []);
        }

        if (aliyotRes.ok) {
          const ad = await aliyotRes.json();
          const aliyah = (ad.data || []).find((a: { id: number }) => a.id === parseInt(id));
          if (aliyah) {
            const d = new Date(aliyah.date);
            const dateStr = d.toISOString().split('T')[0];
            setFormData({
              memberId: String(aliyah.memberId),
              date: dateStr,
              type: aliyah.type,
              parasha: aliyah.parasha || '',
              assigned: aliyah.assigned,
            });
          } else {
            toast('עלייה לא נמצאה', 'error');
            router.push('/aliyot');
          }
        }
      } catch {
        toast('שגיאה בטעינת הנתונים', 'error');
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/aliyot/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          memberId: parseInt(formData.memberId),
          date: new Date(formData.date).toISOString(),
          type: formData.type,
          parasha: formData.parasha || undefined,
          assigned: formData.assigned,
        }),
      });

      if (res.ok) {
        toast('העלייה עודכנה בהצלחה', 'success');
        router.push('/aliyot');
      } else {
        const data = await res.json();
        toast(data.error || 'שגיאה בעדכון העלייה', 'error');
      }
    } catch {
      toast('שגיאה בעדכון העלייה', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/aliyot')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה לרשימת העליות
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">עריכת עלייה</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">סוג עלייה *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  {ALIYAH_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">פרשה</label>
              <input
                type="text"
                value={formData.parasha}
                onChange={(e) => setFormData({ ...formData, parasha: e.target.value })}
                placeholder="למשל: בראשית, נח, לך לך..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="assigned"
                checked={formData.assigned}
                onChange={(e) => setFormData({ ...formData, assigned: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="assigned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                שויין לחבר
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/aliyot')}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'שומר...' : 'שמור שינויים'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
