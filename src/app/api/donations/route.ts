import { NextRequest } from 'next/server';
import { db } from '@/db';
import { donations, members } from '@/db/schema';
import { donationSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/donations - Get donations with filters
export async function GET(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const memberId = searchParams.get('memberId');
      const paid = searchParams.get('paid');

      let query = db.query.donations.findMany({
        with: {
          member: true,
        },
        orderBy: desc(donations.date),
      });

      if (memberId) {
        query = db.query.donations.findMany({
          where: eq(donations.memberId, parseInt(memberId)),
          with: {
            member: true,
          },
          orderBy: desc(donations.date),
        });
      }

      if (paid !== null) {
        const isPaid = paid === 'true';
        query = db.query.donations.findMany({
          where: eq(donations.paid, isPaid),
          with: {
            member: true,
          },
          orderBy: desc(donations.date),
        });
      }

      const data = await query;
      return successResponse(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      return errorResponse('שגיאה בטעינת התרומות', 500);
    }
  })(request);
}

// POST /api/donations - Create a new donation
export async function POST(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const body = await req.json();
      const result = donationSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.errors.reduce((acc, error) => {
          acc[error.path[0]] = error.message;
          return acc;
        }, {} as Record<string, string>);
        return errorResponse('Validation failed', 400);
      }

      const data = result.data;
      const newDonation = await db.insert(donations).values({
        memberId: data.memberId,
        amount: data.amount,
        description: data.description || null,
        paid: data.paid,
        date: new Date(data.date),
      }).returning();

      return successResponse(newDonation[0], 'תרומה נרשמה בהצלחה');
    } catch (error) {
      console.error('Error creating donation:', error);
      return errorResponse('שגיאה ברישום תרומה', 500);
    }
  })(request);
}
