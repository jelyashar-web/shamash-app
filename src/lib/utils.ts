import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(d);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
  }).format(amount);
}

export function formatPhone(phone: string): string {
  // Format Israeli phone numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 9) {
    return `0${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}

export function getHebrewRole(role: string): string {
  const roles: Record<string, string> = {
    kohen: 'כהן',
    levi: 'לוי',
    yisrael: 'ישראל',
    admin: 'מנהל',
    gabbai: 'גבאי',
  };
  return roles[role] || role;
}

export function getAliyahTypeName(type: string): string {
  const types: Record<string, string> = {
    kohen: 'כהן',
    levi: 'לוי',
    shlishi: 'שלישי',
    revii: 'רביעי',
    chamishi: 'חמישי',
    shishi: 'שישי',
    shevii: 'שביעי',
    maftir: 'מפטיר',
  };
  return types[type] || type;
}
