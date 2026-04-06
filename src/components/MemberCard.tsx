'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Phone, Mail, Calendar, BookOpen, Heart, Edit, CheckCircle, XCircle } from 'lucide-react';
import { MemberAvatar } from './MemberAvatar';
import { formatDate, formatCurrency, getHebrewRole, getAliyahTypeName, formatPhone, cn } from '@/lib/utils';

interface Member {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: 'kohen' | 'levi' | 'yisrael';
  yahrzeitDate: string | null;
  notes: string | null;
  photo: string | null;
}

interface Aliyah {
  id: number;
  date: string;
  type: string;
  parasha: string | null;
  assigned: boolean;
}

interface Donation {
  id: number;
  date: string;
  amount: number;
  description: string | null;
  paid: boolean;
}

interface Props {
  memberId: number;
  onClose: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  kohen: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  levi:  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  yisrael: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export function MemberCard({ memberId, onClose }: Props) {
  const [member, setMember] = useState<Member | null>(null);
  const [aliyot, setAliyot] = useState<Aliyah[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Fetch all data
  useEffect(() => {
    const ctrl = new AbortController();
    const { signal } = ctrl;

    const load = async () => {
      try {
        const [mRes, aRes, dRes] = await Promise.all([
          fetch(`/api/members/${memberId}`, { credentials: 'include', signal }),
          fetch(`/api/aliyot?memberId=${memberId}`, { credentials: 'include', signal }),
          fetch(`/api/donations?memberId=${memberId}`, { credentials: 'include', signal }),
        ]);
        const [m, a, d] = await Promise.all([mRes.json(), aRes.json(), dRes.json()]);
        setMember(m.data);
        setAliyot(a.data || []);
        setDonations(d.data || []);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => ctrl.abort();
  }, [memberId]);

  const totalDonations = donations.reduce((s, d) => s + d.amount, 0);
  const paidDonations  = donations.filter((d) => d.paid).reduce((s, d) => s + d.amount, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-backdrop"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-10 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
          </div>
        ) : !member ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">לא נמצא</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="animate-fade-up bg-gradient-to-bl from-primary-600 to-primary-800 dark:from-primary-700 dark:to-gray-900 px-6 pt-10 pb-6">
              <div className="flex items-center gap-4">
                <MemberAvatar name={member.name} photo={member.photo} size="lg" />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">{member.name}</h2>
                  <span className={cn('mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_COLORS[member.role])}>
                    {getHebrewRole(member.role)}
                  </span>
                </div>
              </div>

              {/* Contact row */}
              <div className="mt-4 flex flex-wrap gap-3">
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {formatPhone(member.phone)}
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {member.email}
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="animate-fade-up-1 grid grid-cols-3 divide-x divide-x-reverse divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
              {[
                { label: 'עליות', value: aliyot.length, icon: BookOpen, color: 'text-green-600 dark:text-green-400' },
                { label: 'תרומות', value: donations.length, icon: Heart, color: 'text-purple-600 dark:text-purple-400' },
                { label: 'שולם', value: formatCurrency(paidDonations), icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex flex-col items-center py-4 px-2 gap-1">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-base font-bold text-gray-900 dark:text-white">{value}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Details */}
              <div className="animate-fade-up-2 space-y-2">
                {member.yahrzeitDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>יארצייט: <strong className="text-gray-900 dark:text-white">{member.yahrzeitDate}</strong></span>
                  </div>
                )}
                {member.notes && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                    {member.notes}
                  </div>
                )}
              </div>

              {/* Recent Aliyot */}
              {aliyot.length > 0 && (
                <div className="animate-fade-up-3">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> עליות אחרונות
                  </h3>
                  <div className="space-y-1.5">
                    {aliyot.slice(0, 5).map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{getAliyahTypeName(a.type)}</span>
                          {a.parasha && <span className="text-gray-500 dark:text-gray-400">· {a.parasha}</span>}
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(a.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Donations */}
              {donations.length > 0 && (
                <div className="animate-fade-up-4">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5" /> תרומות
                    <span className="mr-auto font-bold text-gray-900 dark:text-white">{formatCurrency(totalDonations)}</span>
                  </h3>
                  <div className="space-y-1.5">
                    {donations.slice(0, 5).map((d) => (
                      <div key={d.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium',
                            d.paid
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          )}>
                            {d.paid ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(d.amount)}</span>
                          {d.description && <span className="text-gray-500 dark:text-gray-400 truncate max-w-[100px]">{d.description}</span>}
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(d.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit button */}
            <div className="sticky bottom-0 px-5 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <Link
                href={`/members/${member.id}/edit`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary-600 hover:bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                <Edit className="h-4 w-4" />
                עריכת פרטים
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
