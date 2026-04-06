import { NextRequest } from 'next/server';
import { db } from '@/db';
import { aliyot, members } from '@/db/schema';
import { aliyahSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// GET /api/aliyot - Get aliyot with optional date range
export async function GET(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const memberId = searchParams.get('memberId');

      let query = db.query.aliyot.findMany({
        with: {
          member: true,
        },
        orderBy: desc(aliyot.date),
      });

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        query = db.query.aliyot.findMany({
          where: and(
            gte(aliyot.date, start),
            lte(aliyot.date, end)
          ),
          with: {
            member: true,
          },
          orderBy: desc(aliyot.date),
        });
      }

      if (memberId) {
        query = db.query.aliyot.findMany({
          where: eq(aliyot.memberId, parseInt(memberId)),
          with: {
            member: true,
          },
          orderBy: desc(aliyot.date),
        });
      }

      const data = await query;
      return successResponse(data);
    } catch (error) {
      console.error('Error fetching aliyot:', error);
      return errorResponse('שגיאה בטעינת העליות', 500);
    }
  })(request);
}

// POST /api/aliyot - Create a new aliyah
export async function POST(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const body = await req.json();
      const result = aliyahSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.errors.reduce((acc, error) => {
          acc[error.path[0]] = error.message;
          return acc;
        }, {} as Record<string, string>);
        return errorResponse('Validation failed', 400);
      }

      const data = result.data;

      // Check for duplicate assignments on the same date
      const existing = await db.query.aliyot.findFirst({
        where: and(
          eq(aliyot.date, new Date(data.date)),
          eq(aliyot.type, data.type)
        ),
      });

      if (existing) {
        return errorResponse('עלייה כבר שוריינה לתאריך זה', 400);
      }

      const newAliyah = await db.insert(aliyot).values({
        memberId: data.memberId,
        date: new Date(data.date),
        type: data.type,
        parasha: data.parasha || null,
        assigned: data.assigned,
      }).returning();

      return successResponse(newAliyah[0], 'עלייה נוספה בהצלחה');
    } catch (error) {
      console.error('Error creating aliyah:', error);
      return errorResponse('שגיאה ביצירת עלייה', 500);
    }
  })(request);
}
