import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { calculateZmanimForDate, DEFAULT_SYNAGOGUE } from '@/lib/zmanim';
import { ZmanimCalendar, GeoLocation } from 'kosher-zmanim';

// טעינת hebcal רק בשרת
let hebcalModule: any = null;
async function getHebcal() {
  if (!hebcalModule) {
    hebcalModule = await import('@hebcal/core');
  }
  return hebcalModule;
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

    // טעינת hebcal
    const { HebrewCalendar, HDate, Location, ParshaEvent } = await getHebcal();
    
    // בניית התשובה
    const response: any = {};
    
    // עזר לחישוב יום אחד
    async function calculateDay(date: Date) {
      const hDate = new HDate(date);
      const hebrewDate = hDate.render('he');

      // קבלת החגים והאירועים להיום
      const hebcalEvents = HebrewCalendar.calendar({
        start: date,
        end: date,
        location: new Location(
          DEFAULT_SYNAGOGUE.latitude, 
          DEFAULT_SYNAGOGUE.longitude, 
          DEFAULT_SYNAGOGUE.elevation || 0, 
          DEFAULT_SYNAGOGUE.timezone, 
          DEFAULT_SYNAGOGUE.name, 
          'IL'
        ),
        isHebrewYear: false,
      });

      // בדיקת פרשת השבוע
      const parashaEvent = hebcalEvents.find((e: any) => e instanceof ParshaEvent);
      const parasha = parashaEvent ? parashaEvent.render('he') : null;

      // בדיקת חג
      const holidayEvent = hebcalEvents.find((e: any) => 
        e.desc !== 'Parashat' && !e.desc.includes('Parashat')
      );
      const holidayName = holidayEvent ? holidayEvent.render('he') : null;

      return calculateZmanimForDate(date, DEFAULT_SYNAGOGUE, hebrewDate, parasha, holidayName);
    }
    
    if (range === 'week') {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        days.push(await calculateDay(date));
      }
      response.days = days;
    } else {
      response.today = await calculateDay(baseDate);
    }
    
    // מידע נוסף לפי בקשה
    if (include.includes('shabbat')) {
      const today = new Date();
      const daysUntilShabbat = (6 - today.getDay() + 7) % 7;
      const shabbatDate = new Date(today);
      shabbatDate.setDate(today.getDate() + daysUntilShabbat);
      response.upcomingShabbat = await calculateDay(shabbatDate);
    }
    
    if (include.includes('parasha')) {
      const dayOfWeek = baseDate.getDay();
      const daysUntilShabbat = (6 - dayOfWeek + 7) % 7;
      const shabbatDate = new Date(baseDate);
      shabbatDate.setDate(baseDate.getDate() + daysUntilShabbat);
      
      const events = HebrewCalendar.calendar({
        start: shabbatDate,
        end: shabbatDate,
        isHebrewYear: false,
      });
      
      const parashaEvent = events.find((e: any) => e instanceof ParshaEvent);
      response.weeklyParasha = parashaEvent ? parashaEvent.render('he') : null;
    }
    
    if (include.includes('holidays')) {
      const endDate = new Date(baseDate);
      endDate.setDate(endDate.getDate() + 30);
      
      const events = HebrewCalendar.calendar({
        start: baseDate,
        end: endDate,
        isHebrewYear: false,
      });
      
      response.upcomingHolidays = events
        .filter((e: any) => !(e instanceof ParshaEvent) && e.desc !== 'Parashat')
        .map((e: any) => ({
          date: e.date.greg(),
          name: e.render('he'),
          type: e.desc,
        }));
    }
    
    return successResponse(response);
  } catch (error) {
    console.error('Error calculating zmanim:', error);
    return errorResponse('שגיאה בחישוב הזמנים', 500);
  }
});
