import { NextRequest } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { eventSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq, gte, desc } from 'drizzle-orm';

// GET /api/events - Get events
export async function GET(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const upcoming = searchParams.get('upcoming');

      let query = db.query.events.findMany({
        orderBy: desc(events.date),
      });

      if (upcoming === 'true') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = db.query.events.findMany({
          where: gte(events.date, today),
          orderBy: desc(events.date),
        });
      }

      const data = await query;
      return successResponse(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      return errorResponse('שגיאה בטעינת האירועים', 500);
    }
  })(request);
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const body = await req.json();
      const result = eventSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.errors.reduce((acc, error) => {
          acc[error.path[0]] = error.message;
          return acc;
        }, {} as Record<string, string>);
        return errorResponse('Validation failed', 400);
      }

      const data = result.data;
      const newEvent = await db.insert(events).values({
        title: data.title,
        date: new Date(data.date),
        description: data.description || null,
        type: data.type,
      }).returning();

      return successResponse(newEvent[0], 'אירוע נוסף בהצלחה');
    } catch (error) {
      console.error('Error creating event:', error);
      return errorResponse('שגיאה ביצירת אירוע', 500);
    }
  })(request);
}
