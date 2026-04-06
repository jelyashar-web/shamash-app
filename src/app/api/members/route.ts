import { NextRequest } from 'next/server';
import { db } from '@/db';
import { members } from '@/db/schema';
import { memberSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq, like, desc } from 'drizzle-orm';

// GET /api/members - Get all members with optional search
export async function GET(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search');
      const role = searchParams.get('role');

      let query = db.query.members.findMany({
        orderBy: desc(members.createdAt),
      });

      // Apply filters if provided
      if (search) {
        query = db.query.members.findMany({
          where: like(members.name, `%${search}%`),
          orderBy: desc(members.createdAt),
        });
      }

      if (role) {
        query = db.query.members.findMany({
          where: eq(members.role, role as any),
          orderBy: desc(members.createdAt),
        });
      }

      const data = await query;
      return successResponse(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      return errorResponse('שגיאה בטעינת החברים', 500);
    }
  })(request);
}

// POST /api/members - Create a new member
export async function POST(request: NextRequest) {
  return requireAuth(async (req) => {
    try {
      const body = await req.json();
      const result = memberSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.errors.reduce((acc, error) => {
          acc[error.path[0]] = error.message;
          return acc;
        }, {} as Record<string, string>);
        return errorResponse('Validation failed', 400);
      }

      const data = result.data;
      const newMember = await db.insert(members).values({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        role: data.role,
        yahrzeitDate: data.yahrzeitDate || null,
        notes: data.notes || null,
        photo: data.photo || null,
      }).returning();

      return successResponse(newMember[0], 'חבר נוסף בהצלחה');
    } catch (error) {
      console.error('Error creating member:', error);
      return errorResponse('שגיאה ביצירת חבר', 500);
    }
  })(request);
}
