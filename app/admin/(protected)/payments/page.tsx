import Link from 'next/link';
import { CreditCard, Search, ArrowRight, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { getPayments, getPaymentStats, exportPayments } from '@/src/actions/admin/payments';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string; date_from?: string; date_to?: string; search?: string }>
}) {
  const params = await searchParams;
  const [result, stats] = await Promise.all([
    getPayments({
      cursor: params.cursor,
      limit: 25,
      filters: {
        status: params.status || 'all',
        date_from: params.date_from || '',
        date_to: params.date_to || '',
        search: params.search || '',
      },
    }),
    getPaymentStats(),
  ]);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Payments</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Track subscription payments across the platform</p>
        </div>
        <ExportButton filters={{
          status: params.status,
          date_from: params.date_from,
          date_to: params.date_to,
          search: params.search,
        }} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-600" />
            <p className="text-xs text-emerald-600">Total Revenue</p>
          </div>
          <p className="text-lg font-semibold text-emerald-700">₦{stats.total_revenue.toLocaleString()}</p>
        </div>
        <div className="border border-indigo-100 bg-indigo-50/50 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className="text-indigo-600" />
            <p className="text-xs text-indigo-600">Active Subscriptions</p>
          </div>
          <p className="text-lg font-semibold text-indigo-700">{stats.active_subscriptions}</p>
        </div>
        <div className="border border-red-100 bg-red-50/50 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-red-600" />
            <p className="text-xs text-red-600">Failed Payments</p>
          </div>
          <p className="text-lg font-semibold text-red-700">{stats.failed_payments}</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search by reference, user ID, or community ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
          />
        </div>
        <select
          name="status"
          defaultValue={params.status || 'all'}
          className="px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
        >
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <input
          type="date"
          name="date_from"
          defaultValue={params.date_from}
          className="px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
          placeholder="From"
        />
        <input
          type="date"
          name="date_to"
          defaultValue={params.date_to}
          className="px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
          placeholder="To"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Payments Table */}
      {result.items.length > 0 ? (
        <div className="border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Community</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Reference</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-neutral-700 font-mono truncate max-w-[120px]">{payment.user_id || '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-neutral-600 font-mono truncate max-w-[120px]">{payment.community_id || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-900">₦{payment.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500 text-xs">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-neutral-500 font-mono truncate max-w-[140px]">{payment.paystack_reference || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {result.nextCursor && (
            <div className="px-4 py-3 border-t border-neutral-200 flex justify-end">
              <Link
                href={`/admin/payments?cursor=${result.nextCursor}${params.status && params.status !== 'all' ? `&status=${params.status}` : ''}${params.date_from ? `&date_from=${params.date_from}` : ''}${params.date_to ? `&date_to=${params.date_to}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                className="text-xs text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 transition-colors"
              >
                Next page →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description={params.search || params.status !== 'all' ? 'Try adjusting your filters' : 'Payments will appear here once users subscribe'}
        />
      )}
    </div>
  );
}

// ── Export Button (Client Component) ─────────────────────────────────────────

function ExportButton({ filters }: { filters: Record<string, string | undefined> }) {
  return (
    <form action={async () => {
      'use server'
      await exportPayments({
        status: filters.status,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search: filters.search,
      })
    }}>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        <Download size={14} />
        Export CSV
      </button>
    </form>
  )
}
