import { NextRequest } from 'next/server';
import { db } from '@/db';
import { donations } from '@/db/schema';
import { donationSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq } from 'drizzle-orm';

// PUT /api/donations/:id - Update a donation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req) => {
    try {
      const body = await req.json();
      const result = donationSchema.safeParse(body);

      if (!result.success) {
        return errorResponse('Validation failed', 400);
      }

      const data = result.data;
      const updated = await db
        .update(donations)
        .set({
          memberId: data.memberId,
          amount: data.amount,
          description: data.description || null,
          paid: data.paid,
          date: new Date(data.date),
        })
        .where(eq(donations.id, parseInt(params.id)))
        .returning();

      if (!updated.length) {
        return errorResponse('תרומה לא נמצאה', 404);
      }

      return successResponse(updated[0], 'התרומה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating donation:', error);
      return errorResponse('שגיאה בעדכון התרומה', 500);
    }
  })(request);
}

// DELETE /api/donations/:id - Delete a donation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async () => {
    try {
      const deleted = await db
        .delete(donations)
        .where(eq(donations.id, parseInt(params.id)))
        .returning();

      if (!deleted.length) {
        return errorResponse('תרומה לא נמצאה', 404);
      }

      return successResponse(null, 'התרומה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting donation:', error);
      return errorResponse('שגיאה במחיקת התרומה', 500);
    }
  })(request);
}
