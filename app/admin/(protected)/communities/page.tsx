import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';
import { getCommunities } from '@/src/actions/admin/communities';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; type?: string; verified?: string }>
}) {
  const params = await searchParams;
  const result = await getCommunities({
    cursor: params.cursor,
    limit: 25,
    filters: { type: params.type || 'all', verified: params.verified || 'all' },
  });

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Communities</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage and verify communities</p>
      </div>

      <form className="flex flex-wrap gap-3 mb-6">
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
