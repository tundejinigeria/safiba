import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { getAlerts } from '@/src/actions/admin/alerts';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string; severity?: string; category?: string }>
}) {
  const params = await searchParams;
  const result = await getAlerts({
    cursor: params.cursor,
    limit: 25,
    filters: {
      status: params.status || 'all',
      severity: params.severity || 'all',
      category: params.category || 'all',
    },
  });

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Incidents</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Review and moderate safety alerts</p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6">
        <select name="status" defaultValue={params.status || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All statuses</option>
          <option value="unverified">Unverified</option>
          <option value="community_confirmed">Community Confirmed</option>
          <option value="official_confirmed">Official Confirmed</option>
          <option value="false_report">False Report</option>
          <option value="resolved">Resolved</option>
        </select>
        <select name="severity" defaultValue={params.severity || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select name="category" defaultValue={params.category || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All categories</option>
          <option value="suspicious">Suspicious</option>
          <option value="theft">Theft</option>
          <option value="assault">Assault</option>
          <option value="fire">Fire</option>
          <option value="accident">Accident</option>
          <option value="other">Other</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">
          Filter
        </button>
      </form>

      {/* Alert Table */}
      {result.items.length > 0 ? (
        <div className="border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Confirmations</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((alert) => (
                <tr key={alert.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 capitalize text-neutral-700">{alert.category}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge status={alert.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={alert.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500 text-xs max-w-[150px] truncate">
                    {alert.location.name || `${alert.location.latitude.toFixed(3)}, ${alert.location.longitude.toFixed(3)}`}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-600">{alert.confirmationCount}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/incidents/${alert.id}`} className="text-neutral-400 hover:text-neutral-900">
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.nextCursor && (
            <div className="px-4 py-3 border-t border-neutral-200 flex justify-end">
              <Link
                href={`/admin/incidents?cursor=${result.nextCursor}${params.status ? `&status=${params.status}` : ''}${params.severity ? `&severity=${params.severity}` : ''}${params.category ? `&category=${params.category}` : ''}`}
                className="text-xs text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
              >
                Next page →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <EmptyState icon={AlertTriangle} title="No incidents found" description="Alerts will appear here as users report them" />
      )}
    </div>
  );
}
