import { NextRequest } from 'next/server';
import { db } from '@/db';
import { expenses } from '@/db/schema';
import { expenseSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category');
      const paid     = searchParams.get('paid');

      let query = db.query.expenses.findMany({ orderBy: desc(expenses.date) });

      if (category) {
        query = db.query.expenses.findMany({
          where: eq(expenses.category, category),
          orderBy: desc(expenses.date),
        });
      }
      if (paid !== null) {
        query = db.query.expenses.findMany({
          where: eq(expenses.paid, paid === 'true'),
          orderBy: desc(expenses.date),
        });
      }

      const data = await query;
      return successResponse(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return errorResponse('שגיאה בטעינת ההוצאות', 500);
    }
  })(request);
}

export async function POST(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const body = await req.json();
      const result = expenseSchema.safeParse(body);
      if (!result.success) return errorResponse('Validation failed', 400);

      const data = result.data;
      const row = await db.insert(expenses).values({
        category:    data.category,
        payee:       data.payee,
        description: data.description || null,
        amount:      data.amount,
        paid:        data.paid,
        date:        new Date(data.date),
        notes:       data.notes || null,
      }).returning();

      return successResponse(row[0], 'הוצאה נרשמה בהצלחה');
    } catch (error) {
      console.error('Error creating expense:', error);
      return errorResponse('שגיאה ברישום הוצאה', 500);
    }
  })(request);
}
