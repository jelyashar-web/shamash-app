import { NextRequest } from 'next/server';
import { db } from '@/db';
import { expenses } from '@/db/schema';
import { expenseSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req) => {
    try {
      const body   = await req.json();
      const result = expenseSchema.safeParse(body);
      if (!result.success) return errorResponse('Validation failed', 400);

      const data    = result.data;
      const updated = await db.update(expenses).set({
        category:    data.category,
        payee:       data.payee,
        description: data.description || null,
        amount:      data.amount,
        paid:        data.paid,
        date:        new Date(data.date),
        notes:       data.notes || null,
      }).where(eq(expenses.id, parseInt(params.id))).returning();

      if (!updated.length) return errorResponse('הוצאה לא נמצאה', 404);
      return successResponse(updated[0], 'ההוצאה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating expense:', error);
      return errorResponse('שגיאה בעדכון הוצאה', 500);
    }
  })(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async () => {
    try {
      const deleted = await db.delete(expenses)
        .where(eq(expenses.id, parseInt(params.id))).returning();
      if (!deleted.length) return errorResponse('הוצאה לא נמצאה', 404);
      return successResponse(null, 'ההוצאה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting expense:', error);
      return errorResponse('שגיאה במחיקת הוצאה', 500);
    }
  })(request);
}
