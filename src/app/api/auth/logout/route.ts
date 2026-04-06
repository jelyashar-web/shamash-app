import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-response';

export async function POST() {
  const response = successResponse(null, 'התנתקת בהצלחה');
  
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
