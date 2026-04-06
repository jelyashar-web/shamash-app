'use client';

import { useEffect, useState } from 'react';

const KEYS = {
  appName: 'shamash-app-name',
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
  const [appName, setAppNameState] = useState('שמש');
  const [name,    setNameState]   = useState('');
  const [logo,    setLogoState]   = useState<string | null>(null);
  const [banner,  setBannerState] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setAppNameState(ls(KEYS.appName) ?? 'שמש');
    setNameState(ls(KEYS.name)   ?? '');
    setLogoState(ls(KEYS.logo)   ?? null);
    setBannerState(ls(KEYS.banner) ?? null);
  }, []);

  const saveAppName = (v: string)          => { 
    setAppNameState(v); 
    lsSet(KEYS.appName, v || null); 
    // Dispatch event to update title immediately
    window.dispatchEvent(new Event('appname-updated'));
  };
  const saveName   = (v: string)           => { setNameState(v);   lsSet(KEYS.name,   v || null); };
  const saveLogo   = (v: string | null)    => { setLogoState(v);   lsSet(KEYS.logo,   v); };
  const saveBanner = (v: string | null)    => { setBannerState(v); lsSet(KEYS.banner, v); };

  return { mounted, appName, name, logo, banner, saveAppName, saveName, saveLogo, saveBanner };
}
