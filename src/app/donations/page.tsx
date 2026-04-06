'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { MemberAvatar } from '@/components/MemberAvatar';
import { MemberCard } from '@/components/MemberCard';
import { toast } from '@/components/toaster';
import Link from 'next/link';
import { Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

interface Member { id: number; name: string; }
interface Donation {
  id: number; memberId: number; member: Member;
  amount: number; description: string | null; paid: boolean; date: string;
}

export default function DonationsPage() {
  const [donations, setDonations]   = useState<Donation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Donation | null>(null);
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [cardMemberId, setCardMemberId] = useState<number | null>(null);

  const fetchDonations = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch('/api/donations', { credentials: 'include', signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setDonations(d.data || []))
      .catch((e) => { if (e?.name !== 'AbortError') toast('שגיאה בטעינת התרומות', 'error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  useEffect(() => { return fetchDonations(); }, [fetchDonations]);

  const togglePaid = useCallback(async (donation: Donation) => {
    try {
      const res = await fetch(`/api/donations/${donation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          memberId: donation.memberId, amount: donation.amount,
          description: donation.description || undefined,
          paid: !donation.paid,
          date: new Date(donation.date).toISOString(),
        }),
      });
      if (res.ok) {
        setDonations((prev) => prev.map((d) => d.id === donation.id ? { ...d, paid: !d.paid } : d));
        toast(donation.paid ? 'סומן כלא שולם' : 'סומן כשולם', 'success');
      } else toast('שגיאה בעדכון', 'error');
    } catch { toast('שגיאה בעדכון', 'error'); }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/donations/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { setDonations((prev) => prev.filter((d) => d.id !== deleteTarget.id)); toast('התרומה נמחקה', 'success'); }
      else toast('שגיאה במחיקה', 'error');
    } catch { toast('שגיאה במחיקה', 'error'); }
    finally { setDeleteTarget(null); }
  }, [deleteTarget]);

  const filtered = useMemo(() => donations.filter((d) => {
    if (filterPaid === 'paid')   return d.paid;
    if (filterPaid === 'unpaid') return !d.paid;
    return true;
  }), [donations, filterPaid]);

  const { totalAll, totalPaid, totalUnpaid } = useMemo(() => ({
    totalAll:    donations.reduce((s, d) => s + d.amount, 0),
    totalPaid:   donations.filter((d) => d.paid).reduce((s, d) => s + d.amount, 0),
    totalUnpaid: donations.filter((d) => !d.paid).reduce((s, d) => s + d.amount, 0),
  }), [donations]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">תרומות</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{donations.length} תרומות</p>
          </div>
          <Link href="/donations/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">הוסף תרומה</span>
            <span className="sm:hidden">הוסף</span>
          </Link>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'סה״כ', val: totalAll, border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-900 dark:text-white' },
            { label: 'שולם',  val: totalPaid,   border: 'border-green-200 dark:border-green-800',  text: 'text-green-700 dark:text-green-300' },
            { label: 'ממתין', val: totalUnpaid, border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
          ].map(({ label, val, border, text }) => (
            <div key={label} className={`rounded-lg bg-white dark:bg-gray-800 border ${border} p-3 sm:p-4 shadow-sm`}>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-base sm:text-xl font-bold mt-1 truncate ${text}`}>{formatCurrency(val)}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-2">
          {(['all','paid','unpaid'] as const).map((v) => (
            <button key={v} onClick={() => setFilterPaid(v)}
              className={cn('rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                filterPaid === v
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600')}>
              {v === 'all' ? 'הכל' : v === 'paid' ? 'שולם' : 'ממתין'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((donation) => (
                <div key={donation.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <button className="flex items-center gap-3 min-w-0 text-right" onClick={() => setCardMemberId(donation.member?.id)}>
                      <MemberAvatar name={donation.member?.name ?? '?'} size="md" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{donation.member?.name ?? '—'}</p>
                        {donation.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{donation.description}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(donation.date)}</p>
                      </div>
                    </button>
                    <p className="font-bold text-gray-900 dark:text-white shrink-0">{formatCurrency(donation.amount)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                    <button onClick={() => togglePaid(donation)}
                      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        donation.paid
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300')}>
                      {donation.paid ? <><CheckCircle className="h-3.5 w-3.5" /> שולם</> : <><XCircle className="h-3.5 w-3.5" /> ממתין</>}
                    </button>
                    <div className="flex gap-2">
                      <Link href={`/donations/${donation.id}/edit`} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors"><Edit className="h-3.5 w-3.5" /> עריכה</Link>
                      <button onClick={() => setDeleteTarget(donation)} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 transition-colors"><Trash2 className="h-3.5 w-3.5" /> מחיקה</button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {filterPaid !== 'all' ? 'לא נמצאו תרומות' : 'אין תרומות במערכת'}
                </p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {['חבר','סכום','תיאור','תאריך','סטטוס','פעולות'].map((h) => (
                        <th key={h} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="flex items-center gap-3 text-right" onClick={() => setCardMemberId(donation.member?.id)}>
                            <MemberAvatar name={donation.member?.name ?? '?'} size="sm" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{donation.member?.name ?? '—'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(donation.amount)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{donation.description ?? '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatDate(donation.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => togglePaid(donation)}
                            className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                              donation.paid
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300')}>
                            {donation.paid ? <><CheckCircle className="h-3.5 w-3.5" /> שולם</> : <><XCircle className="h-3.5 w-3.5" /> ממתין</>}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link href={`/donations/${donation.id}/edit`} className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors"><Edit className="h-4 w-4" /></Link>
                            <button onClick={() => setDeleteTarget(donation)} className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        {filterPaid !== 'all' ? 'לא נמצאו תרומות' : 'אין תרומות במערכת'}
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
                האם למחוק תרומת {formatCurrency(deleteTarget.amount)} של {deleteTarget.member?.name}?
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
