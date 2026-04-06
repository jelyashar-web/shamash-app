'use client';

import { useQuery } from '@tanstack/react-query';

// API returns dates as strings (JSON serialization)
export interface ZmanimDayApi {
  date: string;
  hebrewDate: string;
  parasha: string | null;
  isShabbat: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  candleLighting: string | null;
  havdalah: string | null;
  times: {
    alotHaShachar: string;
    misheyakir: string;
    sunrise: string;
    sofZmanShma: string;
    sofZmanTfilla: string;
    chatzot: string;
    minchaGedola: string;
    minchaKtana: string;
    plagHaMincha: string;
    sunset: string;
    tzeitHaKochavim: string;
  };
}

interface ZmanimResponse {
  today?: ZmanimDayApi;
  days?: ZmanimDayApi[];
  upcomingShabbat?: ZmanimDayApi;
  weeklyParasha?: string | null;
  upcomingHolidays?: Array<{ date: string; name: string; type: string }>;
}

interface UseZmanimOptions {
  date?: string;
  range?: 'day' | 'week';
  include?: string[];
}

export function useZmanim(options: UseZmanimOptions = {}) {
  const { date, range = 'day', include = [] } = options;
  
  const queryParams = new URLSearchParams();
  if (date) queryParams.set('date', date);
  if (range) queryParams.set('range', range);
  if (include.length > 0) queryParams.set('include', include.join(','));
  
  return useQuery<ZmanimResponse>({
    queryKey: ['zmanim', date, range, include],
    queryFn: async () => {
      const response = await fetch(`/api/zmanim?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch zmanim');
      }
      const data = await response.json();
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // שעה אחת
  });
}

export function useTodayZmanim() {
  return useZmanim({ range: 'day' });
}

export function useWeekZmanim() {
  return useZmanim({ range: 'week' });
}

export function useUpcomingShabbat() {
  return useZmanim({ include: ['shabbat', 'parasha'] });
}
