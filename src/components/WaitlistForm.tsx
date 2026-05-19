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
      <div className="border border-emerald-800 bg-emerald-950/30 px-6 py-5">
        <p className="text-emerald-400 font-medium mb-1">You're on the list. ✓</p>
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
          className="flex-1 bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-600 transition-colors"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-white text-black px-8 py-3 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {pending ? 'Joining…' : 'Join Waitlist'}
        </button>
      </div>
      {!state.success && state.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      <p className="text-xs text-neutral-600">
        No spam. No noise. Just the launch date and early access.
      </p>
    </form>
  );
}
