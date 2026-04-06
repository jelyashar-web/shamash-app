'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

export function toast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { id, message, type };
  toasts.push(newToast);
  listeners.forEach((listener) => listener([...toasts]));
  
  setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach((listener) => listener([...toasts]));
    }
  }, 5000);
}

export function Toaster() {
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setVisibleToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setVisibleToasts);
    };
  }, []);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2">
      {visibleToasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-left ${colors[toast.type]}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
