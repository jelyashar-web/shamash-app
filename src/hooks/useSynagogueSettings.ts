'use client';

import { useEffect, useState } from 'react';

const KEYS = {
  name:   'shamash-synagogue-name',
  logo:   'shamash-synagogue-logo',
  banner: 'shamash-synagogue-banner',
};

function ls(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsSet(key: string, val: string | null) {
  try {
    if (val === null) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {}
}

export function useSynagogueSettings() {
  const [mounted, setMounted]  = useState(false);
  const [name,    setNameState]   = useState('');
  const [logo,    setLogoState]   = useState<string | null>(null);
  const [banner,  setBannerState] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setNameState(ls(KEYS.name)   ?? '');
    setLogoState(ls(KEYS.logo)   ?? null);
    setBannerState(ls(KEYS.banner) ?? null);
  }, []);

  const saveName   = (v: string)           => { setNameState(v);   lsSet(KEYS.name,   v || null); };
  const saveLogo   = (v: string | null)    => { setLogoState(v);   lsSet(KEYS.logo,   v); };
  const saveBanner = (v: string | null)    => { setBannerState(v); lsSet(KEYS.banner, v); };

  return { mounted, name, logo, banner, saveName, saveLogo, saveBanner };
}
