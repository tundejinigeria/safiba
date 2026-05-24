'use client';

import { useActionState, useState, useEffect } from 'react';
import { adminSignIn } from '@/src/actions/auth';
import type { AuthResult } from '@/src/actions/auth';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const initialState: AuthResult = { success: false, error: '' };

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(adminSignIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect when login is successful
  useEffect(() => {
    if (state.success) {
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-neutral-200 p-8 shadow-sm">
        <div className="mb-8">
          <Image src="/safiba-logo.svg" alt="Safiba" width={28} height={32} className="h-7 w-auto mb-4" />
          <h1 className="text-2xl font-semibold text-neutral-900">Admin Portal</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to manage Safiba records.</p>
        </div>

        <form action={action} className="flex flex-col gap-5">
          {!state.success && state.error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium tracking-widest uppercase text-neutral-600">
              Email
            </label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              placeholder="admin@safiba.com"
              className="bg-white border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-200 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium tracking-widest uppercase text-neutral-600">
              Password
            </label>
            <div className="relative">
              <input
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                autoComplete="current-password"
                placeholder="••••••••"
                className="bg-white border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-200 transition-colors w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={pending}
            className="w-full bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
