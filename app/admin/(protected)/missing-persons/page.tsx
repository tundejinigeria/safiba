import Link from 'next/link';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { getMissingPersons } from '@/src/actions/admin/missing-persons';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function MissingPersonsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string; search?: string }>
}) {
  const params = await searchParams;
  const result = await getMissingPersons({
    cursor: params.cursor,
    limit: 25,
    filters: { status: params.status || 'all', search: params.search || '' },
  });

  // Summary stats
  const activeCount = result.items.filter(p => p.status === 'active').length;
  const foundSafeCount = result.items.filter(p => p.status === 'found_safe').length;
  const closedCount = result.items.filter(p => p.status === 'closed' || p.status === 'found_deceased').length;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Missing Persons</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage missing persons cases</p>
      </div>

      {/* Active Cases Alert */}
      {activeCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 border border-amber-200 bg-amber-50">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{activeCount} active case{activeCount !== 1 ? 's' : ''}</span> currently being investigated
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border border-amber-100 bg-amber-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-amber-700">{activeCount}</p>
          <p className="text-xs text-amber-600">Active</p>
        </div>
        <div className="border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-lg font-semibold text-emerald-700">{foundSafeCount}</p>
          <p className="text-xs text-emerald-600">Found Safe</p>
        </div>
        <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-lg font-semibold text-neutral-700">{closedCount}</p>
          <p className="text-xs text-neutral-500">Closed</p>
        </div>
      </div>

      <form className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search by name, description, or location..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
          />
        </div>
        <select name="status" defaultValue={params.status || 'all'} className="px-3 py-2 text-sm border border-neutral-200 bg-white">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="found_safe">Found Safe</option>
          <option value="found_deceased">Found Deceased</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700">Filter</button>
      </form>

      {result.items.length > 0 ? (
        <div className="border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Last Seen</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Case ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden lg:table-cell">Reported</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.items.map((person) => (
                <tr key={person.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{person.name}</p>
                    {person.age && <p className="text-xs text-neutral-500">{person.age} yrs{person.gender ? ` · ${person.gender}` : ''}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={person.status} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-neutral-500 text-xs max-w-[150px] truncate">
                    {person.lastSeenLocation.name || '—'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500 text-xs font-mono">{person.caseId}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                    {person.createdAt ? new Date(person.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/missing-persons/${person.id}`} className="text-neutral-400 hover:text-neutral-900">
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.nextCursor && (
            <div className="px-4 py-3 border-t border-neutral-200 flex justify-end">
              <Link href={`/admin/missing-persons?cursor=${result.nextCursor}`} className="text-xs text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50">
                Next page →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <EmptyState icon={Search} title="No cases found" description="Missing persons cases will appear here" />
      )}
    </div>
  );
}
