'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { MemberAvatar } from '@/components/MemberAvatar';
import { MemberCard } from '@/components/MemberCard';
import { toast } from '@/components/toaster';
import Link from 'next/link';
import { Plus, Trash2, Edit, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, getAliyahTypeName, cn } from '@/lib/utils';

interface Member { id: number; name: string; role: string; }
interface Aliyah {
  id: number; memberId: number; member: Member;
  date: string; type: string; parasha: string | null; assigned: boolean;
}

const ALIYAH_TYPES = ['kohen','levi','shlishi','revii','chamishi','shishi','shevii','maftir'];

const TYPE_COLORS: Record<string, string> = {
  kohen:  'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  levi:   'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  maftir: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export default function AliyotPage() {
  const [aliyot, setAliyot]       = useState<Aliyah[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Aliyah | null>(null);
  const [filterType, setFilterType]     = useState('');
  const [filterParasha, setFilterParasha] = useState('');
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [cardMemberId, setCardMemberId] = useState<number | null>(null);

  const fetchAliyot = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch('/api/aliyot', { credentials: 'include', signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setAliyot(d.data || []))
      .catch((e) => { if (e?.name !== 'AbortError') toast('שגיאה בטעינת העליות', 'error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  useEffect(() => { return fetchAliyot(); }, [fetchAliyot]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/aliyot/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { setAliyot((prev) => prev.filter((a) => a.id !== deleteTarget.id)); toast('העלייה נמחקה', 'success'); }
      else toast('שגיאה במחיקה', 'error');
    } catch { toast('שגיאה במחיקה', 'error'); }
    finally { setDeleteTarget(null); }
  }, [deleteTarget]);

  const parashaOptions = useMemo(() => Array.from(new Set(aliyot.map((a) => a.parasha).filter((p): p is string => !!p))), [aliyot]);

  const filtered = useMemo(() => aliyot.filter((a) => {
    if (filterType && a.type !== filterType) return false;
    if (filterParasha && a.parasha !== filterParasha) return false;
    return true;
  }), [aliyot, filterType, filterParasha]);

  const hasFilter = filterType || filterParasha;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">עליות לתורה</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{aliyot.length} עליות</p>
          </div>
          <Link href="/aliyot/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">הוסף עלייה</span>
            <span className="sm:hidden">הוסף</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="sm:hidden flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Filter className="h-4 w-4" />
            סינון {hasFilter && <span className="rounded-full bg-primary-100 text-primary-700 px-1.5 text-xs">פעיל</span>}
            {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <div className={cn('flex flex-wrap gap-3 items-center', !filtersOpen && 'hidden sm:flex')}>
            <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors">
              <option value="">כל הסוגים</option>
              {ALIYAH_TYPES.map((t) => <option key={t} value={t}>{getAliyahTypeName(t)}</option>)}
            </select>
            <select value={filterParasha} onChange={(e) => setFilterParasha(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors">
              <option value="">כל הפרשיות</option>
              {parashaOptions.map((p) => <option key={p!} value={p!}>{p}</option>)}
            </select>
            {hasFilter && (
              <button onClick={() => { setFilterType(''); setFilterParasha(''); }} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 underline">נקה</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((aliyah) => (
                <div key={aliyah.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <button className="flex items-center gap-2 min-w-0 text-right" onClick={() => setCardMemberId(aliyah.member?.id)}>
                      <MemberAvatar name={aliyah.member?.name ?? '?'} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{aliyah.member?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(aliyah.date)}</p>
                      </div>
                    </button>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', TYPE_COLORS[aliyah.type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300')}>
                      {getAliyahTypeName(aliyah.type)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    {aliyah.parasha && <span className="text-xs text-gray-600 dark:text-gray-400">פרשת {aliyah.parasha}</span>}
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium',
                      aliyah.assigned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300')}>
                      {aliyah.assigned ? 'שויין' : 'ממתין'}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <Link href={`/aliyot/${aliyah.id}/edit`} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors">
                      <Edit className="h-3.5 w-3.5" /> עריכה
                    </Link>
                    <button onClick={() => setDeleteTarget(aliyah)} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> מחיקה
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {hasFilter ? 'לא נמצאו עליות בסינון זה' : 'אין עליות במערכת'}
                </p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {['חבר','תאריך','עלייה','פרשה','סטטוס','פעולות'].map((h) => (
                        <th key={h} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map((aliyah) => (
                      <tr key={aliyah.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="flex items-center gap-3 text-right" onClick={() => setCardMemberId(aliyah.member?.id)}>
                            <MemberAvatar name={aliyah.member?.name ?? '?'} size="sm" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{aliyah.member?.name ?? '—'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatDate(aliyah.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium', TYPE_COLORS[aliyah.type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300')}>
                            {getAliyahTypeName(aliyah.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{aliyah.parasha ?? '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            aliyah.assigned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300')}>
                            {aliyah.assigned ? 'שויין' : 'ממתין'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link href={`/aliyot/${aliyah.id}/edit`} className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors"><Edit className="h-4 w-4" /></Link>
                            <button onClick={() => setDeleteTarget(aliyah)} className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        {hasFilter ? 'לא נמצאו עליות' : 'אין עליות במערכת'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-backdrop">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-fade-up">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">אישור מחיקה</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                האם אתה בטוח שברצונך למחוק עלייה {getAliyahTypeName(deleteTarget.type)} של {deleteTarget.member?.name}?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteTarget(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">ביטול</button>
                <button onClick={handleDelete} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">מחק</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {cardMemberId && <MemberCard memberId={cardMemberId} onClose={() => setCardMemberId(null)} />}
    </div>
  );
}
