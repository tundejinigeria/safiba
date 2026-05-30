import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { getMissingPersons } from '@/src/actions/admin/missing-persons';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { EmptyState } from '@/src/components/admin/EmptyState';

export default async function MissingPersonsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>
}) {
  const params = await searchParams;
  const result = await getMissingPersons({
    cursor: params.cursor,
    limit: 25,
    filters: { status: params.status || 'all' },
  });

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Missing Persons</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage missing persons cases</p>
      </div>

      <form className="flex gap-3 mb-6">
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
