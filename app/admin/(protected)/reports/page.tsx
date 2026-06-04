import Link from 'next/link';
import { Flag, ArrowRight } from 'lucide-react';
import { getReports } from '@/src/actions/admin/reports';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

const CATEGORY_LABELS: Record<string, string> = {
  harassment: 'Harassment',
  spam: 'Spam',
  threats: 'Threats',
  inappropriate_behavior: 'Inappropriate Behavior',
  impersonation: 'Impersonation',
  scam: 'Scam',
  other: 'Other',
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string; category?: string }>
}) {
  const params = await searchParams;
  const result = await getReports({
    cursor: params.cursor,
    limit: 25,
    filters: {
      status: params.status || 'all',
      category: params.category || 'all',
    },
  });

  // Status breakdown
  const pendingCount = result.items.filter(r => r.status === 'pending').length;
  const underReviewCount = result.items.filter(r => r.status === 'under_review').length;
  const resolvedCount = result.items.filter(r => r.status === 'resolved').length;
  const dismissedCount = result.items.filter(r => r.status === 'dismissed').length;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Member Reports</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Review and manage community member reports</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="border border-amber-100 bg-amber-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600">Pending</p>
        </div>
        <div className="border border-blue-100 bg-blue-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-blue-700">{underReviewCount}</p>
          <p className="text-xs text-blue-600">Under Review</p>
        </div>
        <div className="border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-emerald-700">{resolvedCount}</p>
          <p className="text-xs text-emerald-600">Resolved</p>
        </div>
        <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-lg font-semibold text-neutral-700">{dismissedCount}</p>
          <p className="text-xs text-neutral-500">Dismissed</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6">
        <select name="status" defaultValue={params.status || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select name="category" defaultValue={params.category || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All categories</option>
          <option value="harassment">Harassment</option>
          <option value="spam">Spam</option>
          <option value="threats">Threats</option>
          <option value="inappropriate_behavior">Inappropriate Behavior</option>
          <option value="impersonation">Impersonation</option>
          <option value="scam">Scam</option>
          <option value="other">Other</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">
          Filter
        </button>
      </form>

      {/* Reports Table */}
      {result.items.length > 0 ? (
        <div className="border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Reported Member</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Reporter</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Community</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-700">
                    {report.reported_user_name}
                    {report.report_count_against_user >= 3 && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 rounded">
                        ⚠️ Repeat
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-neutral-500">{report.reporter_user_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500 text-xs max-w-[150px] truncate">{report.community_name}</td>
                  <td className="px-4 py-3 text-neutral-700">{CATEGORY_LABELS[report.category] || report.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/reports/${report.id}`} className="text-neutral-400 hover:text-neutral-900">
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
                href={`/admin/reports?cursor=${result.nextCursor}${params.status ? `&status=${params.status}` : ''}${params.category ? `&category=${params.category}` : ''}`}
                className="text-xs text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
              >
                Next page →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <EmptyState icon={Flag} title="No reports found" description="Member reports will appear here as users submit them" />
      )}
    </div>
  );
}
