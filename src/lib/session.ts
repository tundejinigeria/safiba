import { cookies } from 'next/headers';
import { cognitoGetUser } from './aws/cognito';

const SESSION_COOKIE = 'safiba_admin_token';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function setAdminSession(accessToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Verify the current session and return the admin email.
 * Returns null if not authenticated.
 */
export async function requireAdmin(): Promise<string | null> {
  const token = await getAdminSession();
  if (!token) return null;
  return cognitoGetUser(token);
}
