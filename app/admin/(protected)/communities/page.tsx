import Link from 'next/link';
import { Globe, ArrowRight, Search, Users } from 'lucide-react';
import { getCommunities } from '@/src/actions/admin/communities';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; type?: string; verified?: string; search?: string }>
}) {
  const params = await searchParams;
  const result = await getCommunities({
    cursor: params.cursor,
    limit: 25,
    filters: { type: params.type || 'all', verified: params.verified || 'all', search: params.search || '' },
  });

  // Summary stats
  const verifiedCount = result.items.filter(c => c.verified).length;
  const unverifiedCount = result.items.filter(c => !c.verified).length;
  const totalMembers = result.items.reduce((sum, c) => sum + c.memberCount, 0);
  const privateCount = result.items.filter(c => c.isPrivate).length;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Communities</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage and verify communities</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-neutral-200 bg-white px-4 py-3">
          <p className="text-lg font-semibold text-neutral-900">{result.count}</p>
          <p className="text-xs text-neutral-500">Showing</p>
        </div>
        <div className="border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-emerald-700">{verifiedCount}</p>
          <p className="text-xs text-emerald-600">Verified</p>
        </div>
        <div className="border border-amber-100 bg-amber-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-amber-700">{unverifiedCount}</p>
          <p className="text-xs text-amber-600">Pending Verification</p>
        </div>
        <div className="border border-indigo-100 bg-indigo-50/50 px-4 py-3">
          <div className="flex items-center gap-1">
            <Users size={12} className="text-indigo-500" />
            <p className="text-lg font-semibold text-indigo-700">{totalMembers}</p>
          </div>
          <p className="text-xs text-indigo-600">Total Members</p>
        </div>
      </div>

      <form className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search by name or location..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
          />
        </div>
        <select name="type" defaultValue={params.type || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All types</option>
          <option value="street">Street</option>
          <option value="estate">Estate</option>
          <option value="school">School</option>
          <option value="organisation">Organisation</option>
          <option value="public_place">Public Place</option>
          <option value="family">Family</option>
        </select>
        <select name="verified" defaultValue={params.verified || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700">Filter</button>
      </form>

      {result.items.length > 0 ? (
        <div className="border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Members</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Verified</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((community) => (
                <tr key={community.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{community.name}</p>
                    <p className="text-xs text-neutral-500">{community.locationArea || '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell capitalize text-neutral-600">{community.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-neutral-600">{community.memberCount}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <StatusBadge status={community.verified ? 'verified' : 'unverified_community'} label={community.verified ? 'Verified' : 'Unverified'} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                    {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/communities/${community.id}`} className="text-neutral-400 hover:text-neutral-900">
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.nextCursor && (
            <div className="px-4 py-3 border-t border-neutral-200 flex justify-end">
              <Link href={`/admin/communities?cursor=${result.nextCursor}`} className="text-xs text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50">
                Next page →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <EmptyState icon={Globe} title="No communities found" description="Communities will appear here as users create them" />
      )}
    </div>
  );
}
