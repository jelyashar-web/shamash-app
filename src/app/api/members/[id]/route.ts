import { NextRequest } from 'next/server';
import { db } from '@/db';
import { members } from '@/db/schema';
import { memberSchema } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { eq } from 'drizzle-orm';

// GET /api/members/:id - Get a single member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async () => {
    try {
      const member = await db.query.members.findFirst({
        where: eq(members.id, parseInt(params.id)),
      });

      if (!member) {
        return errorResponse('חבר לא נמצא', 404);
      }

      return successResponse(member);
    } catch (error) {
      console.error('Error fetching member:', error);
      return errorResponse('שגיאה בטעינת החבר', 500);
    }
  })(request);
}

// PUT /api/members/:id - Update a member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      const updatedMember = await db
        .update(members)
        .set({
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          role: data.role,
          yahrzeitDate: data.yahrzeitDate || null,
          notes: data.notes || null,
          photo: data.photo || null,
        })
        .where(eq(members.id, parseInt(params.id)))
        .returning();

      if (!updatedMember.length) {
        return errorResponse('חבר לא נמצא', 404);
      }

      return successResponse(updatedMember[0], 'פרטי החבר עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating member:', error);
      return errorResponse('שגיאה בעדכון החבר', 500);
    }
  })(request);
}

// DELETE /api/members/:id - Delete a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async () => {
    try {
      const deleted = await db
        .delete(members)
        .where(eq(members.id, parseInt(params.id)))
        .returning();

      if (!deleted.length) {
        return errorResponse('חבר לא נמצא', 404);
      }

      return successResponse(null, 'החבר נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting member:', error);
      return errorResponse('שגיאה במחיקת החבר', 500);
    }
  })(request);
}
