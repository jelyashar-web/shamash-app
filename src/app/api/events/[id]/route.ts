import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/events/[id]
export const GET = requireAuth(async (req: NextRequest) => {
  try {
    const id = req.url.split('/').pop();
    const eventId = parseInt(id || '');
    if (isNaN(eventId)) {
      return errorResponse('מזהה אירוע לא תקין', 400);
    }

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      return errorResponse('האירוע לא נמצא', 404);
    }

    return successResponse(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return errorResponse('שגיאה בטעינת האירוע', 500);
  }
});

// PUT /api/events/[id]
export const PUT = requireAuth(async (req: NextRequest) => {
  try {
    const id = req.url.split('/').pop();
    const eventId = parseInt(id || '');
    if (isNaN(eventId)) {
      return errorResponse('מזהה אירוע לא תקין', 400);
    }

    const body = await req.json();
    const { title, date, type, description } = body;

    if (!title || !date) {
      return errorResponse('כותרת ותאריך הם שדות חובה', 400);
    }

    const updated = await db.update(events)
      .set({
        title,
        date: new Date(date),
        type: type || 'general',
        description,
      })
      .where(eq(events.id, eventId))
      .returning();

    if (updated.length === 0) {
      return errorResponse('האירוע לא נמצא', 404);
    }

    return successResponse(updated[0], 'האירוע עודכן בהצלחה');
  } catch (error) {
    console.error('Error updating event:', error);
    return errorResponse('שגיאה בעדכון האירוע', 500);
  }
});

// DELETE /api/events/[id]
export const DELETE = requireAuth(async (req: NextRequest) => {
  try {
    const id = req.url.split('/').pop();
    const eventId = parseInt(id || '');
    if (isNaN(eventId)) {
      return errorResponse('מזהה אירוע לא תקין', 400);
    }

    const deleted = await db.delete(events)
      .where(eq(events.id, eventId))
      .returning();

    if (deleted.length === 0) {
      return errorResponse('האירוע לא נמצא', 404);
    }

    return successResponse(null, 'האירוע נמחק בהצלחה');
  } catch (error) {
    console.error('Error deleting event:', error);
    return errorResponse('שגיאה במחיקת האירוע', 500);
  }
});
