'use client';

import { useQuery } from '@tanstack/react-query';
import type { ZmanimDay } from '@/lib/zmanim';

interface ZmanimResponse {
  today?: ZmanimDay;
  days?: ZmanimDay[];
  upcomingShabbat?: ZmanimDay;
  weeklyParasha?: string | null;
  upcomingHolidays?: Array<{ date: Date; name: string; type: string }>;
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
