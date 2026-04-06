import { NextRequest } from 'next/server';
import { db } from '@/db';
import { aliyot } from '@/db/schema';
import { aliyahSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq } from 'drizzle-orm';

// PUT /api/aliyot/:id - Update an aliyah
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req) => {
    try {
      const body = await req.json();
      const result = aliyahSchema.safeParse(body);

      if (!result.success) {
        return errorResponse('Validation failed', 400);
      }

      const data = result.data;
      const updated = await db
        .update(aliyot)
        .set({
          memberId: data.memberId,
          date: new Date(data.date),
          type: data.type,
          parasha: data.parasha || null,
          assigned: data.assigned,
        })
        .where(eq(aliyot.id, parseInt(params.id)))
        .returning();

      if (!updated.length) {
        return errorResponse('עלייה לא נמצאה', 404);
      }

      return successResponse(updated[0], 'העלייה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating aliyah:', error);
      return errorResponse('שגיאה בעדכון העלייה', 500);
    }
  })(request);
}

// DELETE /api/aliyot/:id - Delete an aliyah
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async () => {
    try {
      const deleted = await db
        .delete(aliyot)
        .where(eq(aliyot.id, parseInt(params.id)))
        .returning();

      if (!deleted.length) {
        return errorResponse('עלייה לא נמצאה', 404);
      }

      return successResponse(null, 'העלייה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting aliyah:', error);
      return errorResponse('שגיאה במחיקת העלייה', 500);
    }
  })(request);
}
