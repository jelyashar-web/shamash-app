import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { calculateZmanimForDate, DEFAULT_SYNAGOGUE } from '@/lib/zmanim';

// נתוני חגים בסיסיים לשנת 2024-2025
const HOLIDAYS_2025 = [
  { date: '2025-04-13', name: 'פסח', isHoliday: true },
  { date: '2025-04-14', name: 'פסח - יום שני', isHoliday: true },
  { date: '2025-04-15', name: 'פסח - חול המועד', isHoliday: false },
  { date: '2025-04-16', name: 'פסח - חול המועד', isHoliday: false },
  { date: '2025-04-17', name: 'פסח - חול המועד', isHoliday: false },
  { date: '2025-04-18', name: 'פסח - חול המועד', isHoliday: false },
  { date: '2025-04-19', name: 'שביעי של פסח', isHoliday: true },
  { date: '2025-05-01', name: 'יום העצמאות', isHoliday: false },
  { date: '2025-06-02', name: 'שבועות', isHoliday: true },
  { date: '2025-08-03', name: 'תשעה באב', isHoliday: false },
];

// פרשות השבוע לשנת 2025
const PARASHOT_2025: Record<string, string> = {
  '2025-04-05': 'צו',
  '2025-04-12': 'שמיני',
  '2025-04-19': 'פסח',
  '2025-04-26': 'אחרי מות - קדושים',
  '2025-05-03': 'אמר',
  '2025-05-10': 'בהר - בחקתי',
  '2025-05-17': 'במדבר',
  '2025-05-24': 'נשא',
  '2025-05-31': 'בהעלותך',
  '2025-06-07': 'שלח לך',
  '2025-06-14': 'קרח',
};

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getHebrewDate(date: Date): string {
  // פשוט מאוד - רק לצורך הדגמה
  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  return `${date.getDate()} ב${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function getParasha(date: Date): string | null {
  // מציאת שבת הקרובה
  const dayOfWeek = date.getDay();
  const daysUntilShabbat = (6 - dayOfWeek + 7) % 7;
  const shabbat = new Date(date);
  shabbat.setDate(date.getDate() + daysUntilShabbat);
  return PARASHOT_2025[formatDateKey(shabbat)] || null;
}

function getHoliday(date: Date): { name: string | null; isHoliday: boolean } {
  const key = formatDateKey(date);
  const holiday = HOLIDAYS_2025.find(h => h.date === key);
  return {
    name: holiday?.name || null,
    isHoliday: holiday?.isHoliday || false,
  };
}

// עזר לחישוב יום אחד
function calculateDay(date: Date) {
  const hebrewDate = getHebrewDate(date);
  const parasha = getParasha(date);
  const { name: holidayName, isHoliday } = getHoliday(date);
  const isShabbat = date.getDay() === 6;

  return calculateZmanimForDate(date, DEFAULT_SYNAGOGUE, hebrewDate, parasha, holidayName, isHoliday);
}

/**
 * GET /api/zmanim
 * מחזיר זמני היום הנוכחי או לתאריך מסוים
 * 
 * Query params:
 * - date: תאריך ספציפי (ISO format, optional)
 * - range: 'day' | 'week' (default: 'day')
 * - include: 'shabbat' | 'parasha' | 'holidays' (optional, לקבלת מידע נוסף)
 */
export const GET = requireAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // פרמטרים
    const dateParam = searchParams.get('date');
    const range = searchParams.get('range') || 'day';
    const include = searchParams.get('include') || '';
    
    const baseDate = dateParam ? new Date(dateParam) : new Date();
    
    // בדיקת תקינות התאריך
    if (isNaN(baseDate.getTime())) {
      return errorResponse('תאריך לא תקין', 400);
    }
    
    // בניית התשובה
    const response: any = {};
    
    if (range === 'week') {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        days.push(calculateDay(date));
      }
      response.days = days;
    } else {
      response.today = calculateDay(baseDate);
    }
    
    // מידע נוסף לפי בקשה
    if (include.includes('shabbat')) {
      const today = new Date();
      const daysUntilShabbat = (6 - today.getDay() + 7) % 7;
      const shabbatDate = new Date(today);
      shabbatDate.setDate(today.getDate() + daysUntilShabbat);
      response.upcomingShabbat = calculateDay(shabbatDate);
    }
    
    if (include.includes('parasha')) {
      response.weeklyParasha = getParasha(baseDate);
    }
    
    if (include.includes('holidays')) {
      response.upcomingHolidays = HOLIDAYS_2025.map(h => ({
        date: new Date(h.date),
        name: h.name,
        type: h.isHoliday ? 'chag' : 'event',
      }));
    }
    
    return successResponse(response);
  } catch (error) {
    console.error('Error calculating zmanim:', error);
    return errorResponse('שגיאה בחישוב הזמנים', 500);
  }
});
