import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'shamash-secret-key-change-in-production'
);

export default async function HomePage() {
  const token = cookies().get('token')?.value;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      redirect('/dashboard');
    } catch {
      redirect('/login');
    }
  } else {
    redirect('/login');
  }
}
