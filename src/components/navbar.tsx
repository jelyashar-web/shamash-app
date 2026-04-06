'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSynagogueSettings } from '@/hooks/useSynagogueSettings';
import { Users, BookOpen, Heart, Calendar, LogOut, Menu, X, Settings, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'לוח מחוונים', href: '/dashboard',  icon: Calendar },
  { name: 'חברים',       href: '/members',    icon: Users },
  { name: 'עליות',       href: '/aliyot',     icon: BookOpen },
  { name: 'תרומות',      href: '/donations',  icon: Heart },
  { name: 'הוצאות',      href: '/expenses',   icon: Banknote },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { logo, name: synagogueName } = useSynagogueSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  שמש
                </span>
              </Link>
            </div>
            <div className="hidden md:mr-6 md:flex md:space-x-8 md:space-x-reverse">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-b-2 border-primary-500 text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden md:flex md:items-center md:gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </span>
            <Link
              href="/settings"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              title="הגדרות"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-base font-medium',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                הגדרות
              </div>
            </Link>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="block w-full rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                התנתק
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
