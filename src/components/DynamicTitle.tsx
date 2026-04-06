'use client';

import { useEffect } from 'react';

export function DynamicTitle() {
  useEffect(() => {
    const updateTitle = () => {
      const appName = localStorage.getItem('shamash-app-name') || 'שמש';
      document.title = `${appName} - מערכת ניהול בית כנסת`;
    };
    
    updateTitle();
    
    // Listen for storage changes
    window.addEventListener('storage', updateTitle);
    
    // Custom event for same-tab updates
    const handleCustomUpdate = () => updateTitle();
    window.addEventListener('appname-updated', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', updateTitle);
      window.removeEventListener('appname-updated', handleCustomUpdate);
    };
  }, []);

  return null;
}
