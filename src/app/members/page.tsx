'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { ExpandableMemberCard } from '@/components/ExpandableMemberCard';
import { toast } from '@/components/toaster';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

interface Member {
  id: number; name: string; phone: string | null; email: string | null;
  role: 'kohen' | 'levi' | 'yisrael'; yahrzeitDate: string | null;
  notes: string | null; photo: string | null; createdAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

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
      if (res.ok) { 
        setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id)); 
        toast('החבר נמחק', 'success'); 
      }
      else toast('שגיאה במחיקה', 'error');
    } catch { 
      toast('שגיאה במחיקה', 'error'); 
    }
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
            {/* Expandable Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((member) => (
                <ExpandableMemberCard 
                  key={member.id} 
                  member={member} 
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
            
            {filtered.length === 0 && (
              <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchTerm ? 'לא נמצאו חברים' : 'אין חברים במערכת'}
              </p>
            )}
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
    </div>
  );
}
