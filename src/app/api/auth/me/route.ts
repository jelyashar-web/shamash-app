import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);

  if (!user) {
    return errorResponse('לא מחובר', 401);
  }

  return successResponse(user);
}
