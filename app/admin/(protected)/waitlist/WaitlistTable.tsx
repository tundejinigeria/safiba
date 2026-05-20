'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWaitlistEntry } from '@/src/actions/admin/waitlist';
import type { WaitlistEntry } from '@/src/actions/admin/waitlist';

export default function WaitlistTable({ entries }: { entries: WaitlistEntry[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');

  const filtered = entries.filter((e) =>
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(pk: string, email: string) {
    if (!confirm(`Remove ${email} from the waitlist?`)) return;
    startTransition(async () => {
      await deleteWaitlistEntry(pk);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-white border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-200 transition-colors max-w-sm"
      />

      {/* Table */}
      <div className="border border-neutral-200 bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200">
          <span className="text-xs tracking-widest uppercase text-neutral-500">Email</span>
          <span className="text-xs tracking-widest uppercase text-neutral-500">Joined</span>
          <span className="text-xs tracking-widest uppercase text-neutral-500">Action</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">
            {search ? 'No results found.' : 'No signups yet.'}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((entry) => (
              <div
                key={entry.pk}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 items-start sm:items-center px-5 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <span className="text-sm text-neutral-900 font-medium">{entry.email}</span>
                <span className="text-xs text-neutral-500">
                  {new Date(entry.joinedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.pk, entry.email)}
                  disabled={isPending}
                  className="text-xs text-red-600 border border-red-200 px-2.5 py-1 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        Showing {filtered.length} of {entries.length} entries
      </p>
    </div>
  );
}
