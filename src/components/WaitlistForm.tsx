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
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5 text-center">
        <p className="text-green-700 font-semibold mb-1">You&apos;re on the list. ✓</p>
        <p className="text-[13px] text-green-600/70">
          We&apos;ll reach out when Safiba launches. Stay safe out there.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-orange-500 text-white px-8 py-4 rounded-full text-[15px] font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-200"
      >
        {pending ? 'Joining…' : 'Join Waitlist'}
      </button>
      {!state.success && state.error && (
        <p className="text-[13px] text-red-500 text-center">{state.error}</p>
      )}
      <p className="text-[12px] text-gray-400 text-center">
        No spam. Just the launch date and early access.
      </p>
    </form>
  );
}
