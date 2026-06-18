import Link from 'next/link';
import { Siren, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { getSOSEvents } from '@/src/actions/admin/sos';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

function formatDuration(start: string, end?: string): string {
  if (!start) return '—';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '< 1 min';
  if (diffMins < 60) return `${diffMins} min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

export default async function SOSPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams;
  const filter = params.filter || 'all';
  const result = await getSOSEvents(
    filter === 'active' ? { active: true } :
    filter === 'resolved' ? { active: false } :
    undefined
  );

  // Summary stats
  const activeCount = result.items.filter(e => e.status === 'active').length;
  const resolvedCount = result.items.filter(e => e.status === 'resolved').length;
  const cancelledCount = result.items.filter(e => e.status === 'cancelled').length;
  const totalContacts = result.items.reduce((sum, e) => sum + e.contactsNotified, 0);
  const totalCommunities = result.items.reduce((sum, e) => sum + e.communitiesNotified, 0);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">SOS Events</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Monitor emergency SOS activations</p>
      </div>

      {/* Active SOS Alert */}
      {activeCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 border border-rose-200 bg-rose-50 animate-pulse">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">
            <span className="font-semibold">{activeCount} active SOS</span> — emergency in progress
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="border border-rose-100 bg-rose-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-rose-700">{activeCount}</p>
          <p className="text-xs text-rose-600">Active</p>
        </div>
        <div className="border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-emerald-700">{resolvedCount}</p>
          <p className="text-xs text-emerald-600">Resolved</p>
        </div>
        <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-lg font-semibold text-neutral-700">{cancelledCount}</p>
          <p className="text-xs text-neutral-500">Cancelled</p>
        </div>
        <div className="border border-indigo-100 bg-indigo-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-indigo-700">{totalContacts}</p>
          <p className="text-xs text-indigo-600">Contacts Notified</p>
        </div>
        <div className="border border-violet-100 bg-violet-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-violet-700">{totalCommunities}</p>
          <p className="text-xs text-violet-600">Communities Alerted</p>
        </div>
      </div>

      <form className="flex gap-3 mb-6">
        <select name="filter" defaultValue={filter} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All events</option>
          <option value="active">Active only</option>
          <option value="resolved">Resolved only</option>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Communities</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Triggered</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((event) => (
                <tr key={event.id} className={`hover:bg-neutral-50 ${event.status === 'active' ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-4 py-3 text-neutral-700 font-medium">{event.userName || event.userId.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-neutral-500 text-xs">
                    {event.location?.address || (event.location ? `${event.location.latitude.toFixed(3)}, ${event.location.longitude.toFixed(3)}` : '—')}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-600">{event.contactsNotified}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-600">{event.communitiesNotified}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} />
                      {formatDuration(event.triggeredAt, event.resolvedAt || event.cancelledAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {event.triggeredAt ? new Date(event.triggeredAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/sos/${event.id}`} className="text-neutral-400 hover:text-neutral-900">
                      <ArrowRight size={14} />
                    </Link>
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
