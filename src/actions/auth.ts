'use server';

import { redirect } from 'next/navigation';
import { cognitoSignIn, cognitoSignOut } from '@/src/lib/aws/cognito';
import {
  setAdminSession,
  clearAdminSession,
  getAdminSession,
} from '@/src/lib/session';

export type AuthResult =
  | { success: true }
  | { success: false; error: string };

export async function adminSignIn(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string | null)?.trim();
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return { success: false, error: 'Invalid credentials.' };
  }

  const tokens = await cognitoSignIn(email, password);

  if (!tokens) {
    return { success: false, error: 'Invalid credentials.' };
  }

  await setAdminSession(tokens.accessToken);
  redirect('/admin');
}

export async function adminSignOut(): Promise<never> {
  const token = await getAdminSession();
  if (token) await cognitoSignOut(token);
  await clearAdminSession();
  redirect('/admin/login');
}
