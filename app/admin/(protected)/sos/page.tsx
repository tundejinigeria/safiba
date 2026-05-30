import { Siren } from 'lucide-react';
import { getSOSEvents } from '@/src/actions/admin/sos';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function SOSPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams;
  const activeOnly = params.filter === 'active';
  const result = await getSOSEvents(activeOnly ? { active: true } : undefined);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">SOS Events</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Monitor emergency SOS activations</p>
      </div>

      <form className="flex gap-3 mb-6">
        <select name="filter" defaultValue={params.filter || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All events</option>
          <option value="active">Active only</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700">Filter</button>
      </form>

      {result.items.length > 0 ? (
        <div className="border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Contacts</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Triggered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((event) => (
                <tr key={event.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{event.userName || event.userId.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-neutral-500 text-xs">
                    {event.location?.address || (event.location ? `${event.location.latitude.toFixed(3)}, ${event.location.longitude.toFixed(3)}` : '—')}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-600">{event.contactsNotified}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {event.triggeredAt ? new Date(event.triggeredAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Siren} title="No SOS events" description="SOS activations will appear here" />
      )}
    </div>
  );
}
