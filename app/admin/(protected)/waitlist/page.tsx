import { getWaitlistEntries, deleteWaitlistEntry } from '@/src/actions/admin/waitlist';
import WaitlistTable from './WaitlistTable';

export default async function WaitlistPage() {
  const entries = await getWaitlistEntries();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Waitlist</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{entries.length} signups total</p>
        </div>
        {/* Export CSV link */}
        <a
          href="/admin/waitlist/export"
          className="shrink-0 inline-flex items-center gap-2 border border-neutral-700 px-4 py-2 text-xs tracking-widest uppercase text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
        >
          Export CSV
        </a>
      </div>

      <WaitlistTable entries={entries} />
    </div>
  );
}
