import Link from 'next/link';
import { Users, Search, ArrowRight, Download } from 'lucide-react';
import { getUsers } from '@/src/actions/admin/users';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { TrustScoreBar } from '@/src/components/admin/TrustScoreBar';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; search?: string; status?: string; role?: string }>
}) {
  const params = await searchParams;
  const result = await getUsers({
    cursor: params.cursor,
    limit: 25,
    filters: {
      search: params.search || '',
      status: params.status || 'all',
      role: params.role || 'all',
    },
  });

  // Compute summary stats from current page
  const activeCount = result.items.filter(u => u.status === 'active').length;
  const suspendedCount = result.items.filter(u => u.status === 'suspended').length;
  const bannedCount = result.items.filter(u => u.status === 'banned').length;
  const avgTrustScore = result.items.length > 0
    ? Math.round(result.items.reduce((sum, u) => sum + u.trustScore, 0) / result.items.length)
    : 0;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Users</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage registered app users</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-neutral-200 bg-white px-4 py-3">
          <p className="text-lg font-semibold text-neutral-900">{result.count}</p>
          <p className="text-xs text-neutral-500">Showing</p>
        </div>
        <div className="border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-emerald-700">{activeCount}</p>
          <p className="text-xs text-emerald-600">Active</p>
        </div>
        <div className="border border-amber-100 bg-amber-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-amber-700">{suspendedCount + bannedCount}</p>
          <p className="text-xs text-amber-600">Suspended/Banned</p>
        </div>
        <div className="border border-indigo-100 bg-indigo-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-indigo-700">{avgTrustScore}</p>
          <p className="text-xs text-indigo-600">Avg Trust Score</p>
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
            placeholder="Search by name, username, email, or phone..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
          />
        </div>
        <select
          name="status"
          defaultValue={params.status || 'all'}
          className="px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <select
          name="role"
          defaultValue={params.role || 'all'}
          className="px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="community_leader">Community Leader</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
        >
          Filter
        </button>
      </form>

      {/* User Table */}
      {result.items.length > 0 ? (
        <div className="border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Trust Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-neutral-900">{user.name || 'No name'}</p>
                      <p className="text-xs text-neutral-500">@{user.username || 'unknown'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-neutral-600">{user.phone || '—'}</td>
                  <td className="px-4 py-3 w-40">
                    <TrustScoreBar score={user.trustScore} showLabel={false} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-neutral-600 capitalize">{user.role.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
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
                href={`/admin/users?cursor=${result.nextCursor}${params.search ? `&search=${params.search}` : ''}${params.status && params.status !== 'all' ? `&status=${params.status}` : ''}${params.role && params.role !== 'all' ? `&role=${params.role}` : ''}`}
                className="text-xs text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 transition-colors"
              >
                Next page →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No users found"
          description={params.search ? 'Try a different search term' : 'Users will appear here once people sign up'}
        />
      )}
    </div>
  );
}
