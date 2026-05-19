'use client';

import { useActionState } from 'react';
import { adminSignIn } from '@/src/actions/auth';
import type { AuthResult } from '@/src/actions/auth';

const initialState: AuthResult = { success: false, error: '' };

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminSignIn, initialState);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-neutral-500 mb-2">Safiba</p>
          <h1 className="text-2xl font-semibold text-white">Admin Portal</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to manage Safiba records.</p>
        </div>

        <form action={action} className="flex flex-col gap-5">
          {!state.success && state.error && (
            <div className="border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium tracking-widest uppercase text-neutral-400">
              Email
            </label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              placeholder="admin@safiba.com"
              className="bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-700 outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium tracking-widest uppercase text-neutral-400">
              Password
            </label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              placeholder="••••••••"
              className="bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-700 outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          <button
            type="submit" disabled={pending}
            className="w-full bg-white text-black py-2.5 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
