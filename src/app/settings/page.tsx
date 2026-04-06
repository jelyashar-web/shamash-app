'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Navbar } from '@/components/navbar';
import { useSynagogueSettings } from '@/hooks/useSynagogueSettings';
import { Sun, Moon, Monitor, Zap, ZapOff, Upload, X, Image as ImageIcon, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeOption = 'light' | 'dark' | 'system';

const THEMES: { value: ThemeOption; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'בהיר', icon: Sun },
  { value: 'dark', label: 'כהה', icon: Moon },
  { value: 'system', label: 'מערכת', icon: Monitor },
];

/* ─── Image compressor ─── */
async function compressToSize(file: File, maxW: number, maxH: number, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/* ─── Mini image uploader ─── */
function ImageUploader({
  value, onChange, label, hint, previewClass, placeholder,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  label: string;
  hint: string;
  previewClass: string;
  placeholder: React.ReactNode;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{label}</p>
      <div className={cn('relative overflow-hidden rounded-xl border-2 border-dashed flex items-center justify-center', previewClass,
        value ? 'border-primary-300 dark:border-primary-700' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
      )}>
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-1.5 left-1.5 rounded-full bg-black/60 text-white p-1 hover:bg-black/80 transition-colors"
              title="הסר"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-colors py-4 w-full"
          >
            {placeholder}
            <span className="text-xs">{hint}</span>
          </button>
        )}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline"
        >
          <Upload className="h-3 w-3" /> החלף תמונה
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f as unknown as string); // handled below via useEffect-like trigger
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animations, setAnimations] = useState(true);

  const { appName, name: synagogueName, logo, banner, saveAppName, saveName, saveLogo, saveBanner } = useSynagogueSettings();

  const logoRef   = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('shamash-animations');
      setAnimations(saved !== 'false');
    } catch {}
  }, []);

  const toggleAnimations = (enabled: boolean) => {
    setAnimations(enabled);
    try {
      localStorage.setItem('shamash-animations', String(enabled));
      if (enabled) {
        document.documentElement.classList.remove('no-animations');
      } else {
        document.documentElement.classList.add('no-animations');
      }
    } catch {}
  };

  const handleLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const compressed = await compressToSize(file, 200, 200);
    saveLogo(compressed);
  };

  const handleBannerFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const compressed = await compressToSize(file, 1200, 400, 0.8);
    saveBanner(compressed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">הגדרות</h1>

        <div className="space-y-6">

          {/* ── App Settings ── */}
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">הגדרות אפליקציה</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">שם המערכת ולוגו</p>

            {/* App name */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                שם המערכת
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => saveAppName(e.target.value)}
                placeholder="לדוגמה: שמש"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">השם שיוצג בכותרת ובלוגו למעלה</p>
            </div>
          </div>

          {/* ── Synagogue Info ── */}
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-primary-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">פרטי בית הכנסת</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">שם, לוגו ותמונת רקע לדף הבית</p>

            {/* Synagogue name */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                שם בית הכנסת
              </label>
              <input
                type="text"
                value={synagogueName}
                onChange={(e) => saveName(e.target.value)}
                placeholder="לדוגמה: בית כנסת שמש"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors"
              />
            </div>

            {/* Logo + Banner side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Logo */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">לוגו</p>
                <div className={cn(
                  'relative overflow-hidden rounded-xl border-2 border-dashed flex items-center justify-center h-28',
                  logo
                    ? 'border-primary-300 dark:border-primary-700'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                )}>
                  {logo ? (
                    <>
                      <img src={logo} alt="לוגו" className="max-h-24 max-w-full object-contain p-2" />
                      <button
                        type="button"
                        onClick={() => saveLogo(null)}
                        className="absolute top-1.5 left-1.5 rounded-full bg-black/60 text-white p-1 hover:bg-black/80 transition-colors"
                        title="הסר"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-colors py-3 w-full"
                    >
                      <Building2 className="h-8 w-8" />
                      <span className="text-xs">לחץ להעלאת לוגו</span>
                    </button>
                  )}
                </div>
                {logo && (
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Upload className="h-3 w-3" /> החלף לוגו
                  </button>
                )}
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); e.target.value = ''; }}
                />
              </div>

              {/* Banner */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">תמונת כותרת (באנר)</p>
                <div className={cn(
                  'relative overflow-hidden rounded-xl border-2 border-dashed flex items-center justify-center h-28',
                  banner
                    ? 'border-primary-300 dark:border-primary-700'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                )}>
                  {banner ? (
                    <>
                      <img src={banner} alt="באנר" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => saveBanner(null)}
                        className="absolute top-1.5 left-1.5 rounded-full bg-black/60 text-white p-1 hover:bg-black/80 transition-colors"
                        title="הסר"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => bannerRef.current?.click()}
                      className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-colors py-3 w-full"
                    >
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">לחץ להעלאת תמונת רקע</span>
                    </button>
                  )}
                </div>
                {banner && (
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Upload className="h-3 w-3" /> החלף תמונה
                  </button>
                )}
                <input
                  ref={bannerRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerFile(f); e.target.value = ''; }}
                />
              </div>
            </div>
          </div>

          {/* ── Theme ── */}
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">מצב תצוגה</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">בחר בין מצב בהיר, כהה, או לפי הגדרות המכשיר</p>

            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(({ value, label, icon: Icon }) => {
                const active = mounted ? theme === value : false;
                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                      active
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                    {mounted && value === 'system' && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({resolvedTheme === 'dark' ? 'כהה' : 'בהיר'})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Animations ── */}
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">אנימציות ומעברים</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">כבה כדי לשפר ביצועים או לנוחות עיניים</p>

            <div className="flex gap-3">
              <button
                onClick={() => toggleAnimations(true)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  animations
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                )}
              >
                <Zap className="h-6 w-6" />
                <span className="text-sm font-medium">מופעל</span>
              </button>
              <button
                onClick={() => toggleAnimations(false)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  !animations
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                )}
              >
                <ZapOff className="h-6 w-6" />
                <span className="text-sm font-medium">כבוי</span>
              </button>
            </div>
          </div>

          {/* ── App info ── */}
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">אודות</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">שם המערכת</dt>
                <dd className="font-medium text-gray-900 dark:text-white">שמש</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">גרסה</dt>
                <dd className="font-medium text-gray-900 dark:text-white">1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">אחסון</dt>
                <dd className="font-medium text-gray-900 dark:text-white">מקומי (SQLite)</dd>
              </div>
            </dl>
          </div>

        </div>
      </main>
    </div>
  );
}
