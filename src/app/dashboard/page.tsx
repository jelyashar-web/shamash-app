'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { MemberAvatar } from '@/components/MemberAvatar';
import { MemberCard } from '@/components/MemberCard';
import { ZmanimCard } from '@/components/ZmanimCard';
import { useAuth } from '@/hooks/useAuth';
import { useTodayZmanim } from '@/hooks/useZmanim';
import { useInView } from '@/hooks/useInView';
import { Users, BookOpen, Heart, Calendar, Banknote, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSynagogueSettings } from '@/hooks/useSynagogueSettings';
import Link from 'next/link';

/* ─── Types ─── */
interface Stats { members: number; aliyot: number; donations: number; donationTotal: number; upcomingEvents: number; expenses: number; expenseTotal: number; }
interface Member { id: number; name: string; photo: string | null; role: string; }

/* ─── Category card config ─── */
const CATEGORIES = [
  {
    key: 'members',
    label: 'חברים',
    sub: 'ניהול חברי הקהילה',
    href: '/members',
    icon: Users,
    from: 'from-blue-500',
    to: 'to-blue-700',
    shadow: 'shadow-blue-200 dark:shadow-blue-900',
    stat: (s: Stats) => `${s.members} חברים`,
  },
  {
    key: 'aliyot',
    label: 'עליות',
    sub: 'שיוריינות לתורה',
    href: '/aliyot',
    icon: BookOpen,
    from: 'from-emerald-500',
    to: 'to-emerald-700',
    shadow: 'shadow-emerald-200 dark:shadow-emerald-900',
    stat: (s: Stats) => `${s.aliyot} עליות`,
  },
  {
    key: 'donations',
    label: 'תרומות',
    sub: 'מעקב תרומות ותשלומים',
    href: '/donations',
    icon: Heart,
    from: 'from-purple-500',
    to: 'to-purple-700',
    shadow: 'shadow-purple-200 dark:shadow-purple-900',
    stat: (s: Stats) => formatCurrency(s.donationTotal),
  },
  {
    key: 'events',
    label: 'אירועים',
    sub: 'לוח אירועי הקהילה',
    href: '/events',
    icon: Calendar,
    from: 'from-orange-500',
    to: 'to-orange-700',
    shadow: 'shadow-orange-200 dark:shadow-orange-900',
    stat: (s: Stats) => `${s.upcomingEvents} קרובים`,
  },
  {
    key: 'expenses',
    label: 'הוצאות',
    sub: 'תשלומי בית הכנסת',
    href: '/expenses',
    icon: Banknote,
    from: 'from-rose-500',
    to: 'to-rose-700',
    shadow: 'shadow-rose-200 dark:shadow-rose-900',
    stat: (s: Stats) => formatCurrency(s.expenseTotal),
  },
];

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${inView ? 'reveal-visible' : 'reveal-hidden'} ${className}`}
      style={inView ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ─── Pop-in avatar ─── */
function PopAvatar({ member, delay, onClick }: { member: Member; delay: number; onClick: () => void }) {
  const { ref, inView } = useInView(0.05);
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 group shrink-0 ${inView ? 'pop-visible' : 'pop-hidden'}`}
      style={inView ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="relative">
        <MemberAvatar name={member.name} photo={member.photo} size="md" />
        <span className="absolute inset-0 rounded-full ring-2 ring-primary-400 ring-offset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[64px] truncate text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {member.name.split(' ')[0]}
      </span>
    </button>
  );
}

/* ─── Main page ─── */
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const stripRef = useRef<HTMLDivElement>(null);
  const { name: synagogueName, logo, banner } = useSynagogueSettings();

  const [stats, setStats]     = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [cardMemberId, setCardMemberId] = useState<number | null>(null);

  const { data: zmanimData, isLoading: zmanimLoading } = useTodayZmanim();

  const fetchAll = useCallback(() => {
    const ctrl = new AbortController();
    const { signal } = ctrl;

    Promise.all([
      fetch('/api/members',            { credentials: 'include', signal }),
      fetch('/api/aliyot',             { credentials: 'include', signal }),
      fetch('/api/donations',          { credentials: 'include', signal }),
      fetch('/api/events?upcoming=true',{ credentials: 'include', signal }),
      fetch('/api/expenses',            { credentials: 'include', signal }),
    ])
      .then((rs) => Promise.all(rs.map((r) => r.json())))
      .then(([m, a, d, e, ex]) => {
        const donationTotal = (d.data  || []).reduce((s: number, x: { amount: number }) => s + x.amount, 0);
        const expenseTotal  = (ex.data || []).reduce((s: number, x: { amount: number }) => s + x.amount, 0);
        setStats({
          members:        m.data?.length  || 0,
          aliyot:         a.data?.length  || 0,
          donations:      d.data?.length  || 0,
          donationTotal,
          upcomingEvents: e.data?.length  || 0,
          expenses:       ex.data?.length || 0,
          expenseTotal,
        });
        setMembers(m.data || []);
      })
      .catch((e) => { if (e?.name !== 'AbortError') console.error(e); });

    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (user) return fetchAll();
  }, [user, fetchAll]);

  const scrollStrip = (dir: 'l' | 'r') => {
    if (!stripRef.current) return;
    stripRef.current.scrollBy({ left: dir === 'l' ? -200 : 200, behavior: 'smooth' });
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* ── Hero greeting ── */}
      <div className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-8 min-h-[9rem]">
        {/* Banner photo or gradient background */}
        {banner ? (
          <>
            <img
              src={banner}
              alt="באנר בית הכנסת"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* dark overlay so text stays readable */}
            <div className="absolute inset-0 bg-black/50 dark:bg-black/65" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-bl from-primary-700 via-primary-600 to-blue-800 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950" />
        )}

        {/* decorative blobs (only when no banner) */}
        {!banner && (
          <>
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          </>
        )}

        <div className="relative mx-auto max-w-7xl animate-fade-up flex items-center gap-4">
          {/* Logo if set */}
          {logo && (
            <img
              src={logo}
              alt="לוגו"
              className="h-14 w-14 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-1 shrink-0 shadow"
            />
          )}
          <div>
            <p className="text-white/70 text-sm font-medium">{greeting},</p>
            <h1 className="mt-0.5 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {synagogueName || user?.email?.split('@')[0]}
            </h1>
            {synagogueName && (
              <p className="mt-1 text-white/60 text-sm">{user?.email?.split('@')[0]} — ברוך הבא ✡</p>
            )}
            {!synagogueName && (
              <p className="mt-2 text-white/60 text-sm">ברוך הבא למערכת שמש ✡</p>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 pb-12 space-y-10">

        {/* ── Category cards ── */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Reveal key={cat.key} delay={i * 70}>
                  <Link
                    href={cat.href}
                    className={`card-shine block rounded-2xl bg-gradient-to-br ${cat.from} ${cat.to} p-5 shadow-lg ${cat.shadow} hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] transition-all duration-200 select-none`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white leading-tight">{cat.label}</p>
                        <p className="text-sm text-white/70 mt-0.5 hidden sm:block">{cat.sub}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                          {stats ? cat.stat(stats) : '...'}
                        </span>
                        <ChevronLeft className="h-4 w-4 text-white/60" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── Member faces strip ── */}
        {members.length > 0 && (
          <section>
            <Reveal>
              <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">חברי הקהילה</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{members.length} חברים רשומים</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => scrollStrip('r')}
                      className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => scrollStrip('l')}
                      className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Strip */}
                <div
                  ref={stripRef}
                  className="scroll-strip flex gap-5 px-5 pb-5 pt-1"
                >
                  {members.map((member, i) => (
                    <PopAvatar
                      key={member.id}
                      member={member}
                      delay={Math.min(i * 40, 600)}
                      onClick={() => setCardMemberId(member.id)}
                    />
                  ))}

                  {/* "See all" cap */}
                  <Link
                    href="/members"
                    className="flex flex-col items-center gap-2 shrink-0 group"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center group-hover:border-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                      <Users className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-primary-500 transition-colors">הכל</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* ── Zmanim Card ── */}
        <section>
          <Reveal>
            <ZmanimCard 
              zmanim={zmanimData?.today} 
              isLoading={zmanimLoading} 
            />
          </Reveal>
        </section>

        {/* ── Quick stats row ── */}
        {stats && (
          <section>
            <Reveal delay={100}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'חברים פעילים', value: stats.members, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                  { label: 'עליות השנה',   value: stats.aliyot,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { label: 'תרומות',       value: stats.donations, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                  { label: 'אירועים קרובים', value: stats.upcomingEvents, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                ].map(({ label, value, color, bg }, i) => (
                  <Reveal key={label} delay={i * 60}>
                    <div className={`rounded-xl ${bg} px-4 py-3 flex items-center gap-3`}>
                      <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{label}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {/* ── Quick actions ── */}
        <section>
          <Reveal delay={50}>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">פעולות מהירות</h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'הוסף חבר',    href: '/members/new',   from: 'from-blue-500',   to: 'to-blue-600',   icon: Users },
              { label: 'עלייה חדשה',  href: '/aliyot/new',    from: 'from-emerald-500',to: 'to-emerald-600',icon: BookOpen },
              { label: 'רשום תרומה',  href: '/donations/new', from: 'from-purple-500', to: 'to-purple-600', icon: Heart },
              { label: 'אירועים',     href: '/events',        from: 'from-orange-500', to: 'to-orange-600', icon: Calendar },
            ].map(({ label, href, from, to, icon: Icon }, i) => (
              <Reveal key={label} delay={i * 60}>
                <Link
                  href={href}
                  className={`card-shine flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${from} ${to} py-3 text-sm font-semibold text-white shadow hover:scale-[1.03] active:scale-[0.97] transition-all duration-150`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

      </main>

      {cardMemberId && <MemberCard memberId={cardMemberId} onClose={() => setCardMemberId(null)} />}
    </div>
  );
}
