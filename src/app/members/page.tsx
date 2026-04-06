'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { MemberAvatar } from '@/components/MemberAvatar';
import { MemberCard } from '@/components/MemberCard';
import { toast } from '@/components/toaster';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Phone, Mail, Calendar } from 'lucide-react';
import { getHebrewRole, formatPhone, cn } from '@/lib/utils';

interface Member {
  id: number; name: string; phone: string | null; email: string | null;
  role: 'kohen' | 'levi' | 'yisrael'; yahrzeitDate: string | null;
  notes: string | null; photo: string | null; createdAt: string;
}

const roleBadge = (role: string) => {
  if (role === 'kohen') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
  if (role === 'levi')  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export default function MembersPage() {
  const [members, setMembers]     = useState<Member[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [cardMemberId, setCardMemberId] = useState<number | null>(null);

  const fetchMembers = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch('/api/members', { credentials: 'include', signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setMembers(d.data || []))
      .catch((e) => { if (e?.name !== 'AbortError') toast('שגיאה בטעינת החברים', 'error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  useEffect(() => { return fetchMembers(); }, [fetchMembers]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/members/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id)); toast('החבר נמחק', 'success'); }
      else toast('שגיאה במחיקה', 'error');
    } catch { toast('שגיאה במחיקה', 'error'); }
    finally { setDeleteTarget(null); }
  }, [deleteTarget]);

  const filtered = useMemo(() =>
    members.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [members, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">ניהול חברים</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{members.length} חברים</p>
          </div>
          <Link href="/members/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">הוסף חבר</span>
            <span className="sm:hidden">הוסף</span>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="חפש חברים..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pr-10 pl-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((member) => (
                <div key={member.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <button className="flex items-center gap-3 min-w-0 text-right" onClick={() => setCardMemberId(member.id)}>
                      <MemberAvatar name={member.name} photo={member.photo} size="md" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{member.name}</p>
                        {member.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{member.notes}</p>}
                      </div>
                    </button>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', roleBadge(member.role))}>
                      {getHebrewRole(member.role)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <a href={`tel:${member.phone}`} className="hover:underline">{formatPhone(member.phone)}</a>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.yahrzeitDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 shrink-0" /><span>יארצייט: {member.yahrzeitDate}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <Link href={`/members/${member.id}/edit`} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors">
                      <Edit className="h-3.5 w-3.5" /> עריכה
                    </Link>
                    <button onClick={() => setDeleteTarget(member)} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> מחיקה
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'לא נמצאו חברים' : 'אין חברים במערכת'}
                </p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {['שם','תפקיד','פרטי קשר','יארצייט','פעולות'].map((h) => (
                        <th key={h} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="flex items-center gap-3 text-right" onClick={() => setCardMemberId(member.id)}>
                            <MemberAvatar name={member.name} photo={member.photo} size="sm" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{member.name}</div>
                              {member.notes && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] truncate">{member.notes}</div>}
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium', roleBadge(member.role))}>
                            {getHebrewRole(member.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {member.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="h-4 w-4" />{formatPhone(member.phone)}
                              </div>
                            )}
                            {member.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="h-4 w-4" />{member.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.yahrzeitDate
                            ? <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Calendar className="h-4 w-4" />{member.yahrzeitDate}</div>
                            : <span className="text-sm text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link href={`/members/${member.id}/edit`} className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors"><Edit className="h-4 w-4" /></Link>
                            <button onClick={() => setDeleteTarget(member)} className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'לא נמצאו חברים התואמים את החיפוש' : 'אין חברים במערכת'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Delete modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-backdrop">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-fade-up">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">אישור מחיקה</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">האם אתה בטוח שברצונך למחוק את {deleteTarget.name}?</p>
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
