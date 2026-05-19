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
        className="bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-600 transition-colors max-w-sm"
      />

      {/* Table */}
      <div className="border border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-neutral-900 border-b border-neutral-800">
          <span className="text-xs tracking-widest uppercase text-neutral-500">Email</span>
          <span className="text-xs tracking-widest uppercase text-neutral-500">Joined</span>
          <span className="text-xs tracking-widest uppercase text-neutral-500">Action</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-600">
            {search ? 'No results found.' : 'No signups yet.'}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filtered.map((entry) => (
              <div
                key={entry.pk}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 items-start sm:items-center px-5 py-3.5 hover:bg-neutral-900/50 transition-colors"
              >
                <span className="text-sm text-white font-medium">{entry.email}</span>
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
                  className="text-xs text-red-500 border border-red-900/50 px-2.5 py-1 hover:border-red-700 hover:text-red-400 disabled:opacity-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-600">
        Showing {filtered.length} of {entries.length} entries
      </p>
    </div>
  );
}
