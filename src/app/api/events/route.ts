import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { db } from '@/db';
import { events } from '@/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/events
export const GET = requireAuth(async () => {
  try {
    const allEvents = await db.query.events.findMany({
      orderBy: desc(events.date),
    });
    return successResponse(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return errorResponse('שגיאה בטעינת האירועים', 500);
  }
});

// POST /api/events
export const POST = requireAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { title, date, type, description } = body;

    if (!title || !date) {
      return errorResponse('כותרת ותאריך הם שדות חובה', 400);
    }

    const newEvent = await db.insert(events).values({
      title,
      date: new Date(date),
      type: type || 'general',
      description,
    }).returning();

    return successResponse(newEvent[0], 'האירוע נוצר בהצלחה');
  } catch (error) {
    console.error('Error creating event:', error);
    return errorResponse('שגיאה ביצירת האירוע', 500);
  }
});
