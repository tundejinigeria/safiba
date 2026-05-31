'use client';

import { useActionState } from 'react';
import { joinWaitlist } from '@/src/actions/waitlist';
import type { WaitlistResult } from '@/src/actions/waitlist';

const initialState: WaitlistResult = { success: false, error: '' };

export default function WaitlistForm() {
  const [state, action, pending] = useActionState(
    async (_: WaitlistResult, formData: FormData) => joinWaitlist(formData),
    initialState
  );

  if (state.success) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 px-6 py-5">
        <p className="text-emerald-700 font-medium mb-1">You're on the list. ✓</p>
        <p className="text-sm text-emerald-600">
          We'll reach out when Safiba launches. Stay safe out there.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          className="flex-1 bg-white border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-200 transition-colors"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-neutral-900 text-white px-8 py-3 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {pending ? 'Joining…' : 'Join Waitlist'}
        </button>
      </div>
      {!state.success && state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      <p className="text-xs text-neutral-500">
        No spam. No noise. Just the launch date and early access.
      </p>
    </form>
  );
}
