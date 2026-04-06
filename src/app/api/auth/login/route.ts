import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { loginSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/api-response';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'shamash-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.reduce((acc, error) => {
        acc[error.path[0]] = error.message;
        return acc;
      }, {} as Record<string, string>);
      return errorResponse('Validation failed', 400);
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return errorResponse('אימייל או סיסמה שגויים', 401);
    }

    // Compare password
    const isValidPassword = await compare(password, user.passwordHash);

    if (!isValidPassword) {
      return errorResponse('אימייל או סיסמה שגויים', 401);
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set cookie
    const response = successResponse({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('שגיאה בכניסה למערכת', 500);
  }
}
