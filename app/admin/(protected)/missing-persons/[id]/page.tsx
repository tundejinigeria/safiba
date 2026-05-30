import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Calendar } from 'lucide-react';
import { getMissingPerson } from '@/src/actions/admin/missing-persons';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { CaseActions } from './CaseActions';

export default async function MissingPersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getMissingPerson(id);

  if (!person) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">Case not found</p>
        <Link href="/admin/missing-persons" className="text-sm text-blue-600 mt-2 inline-block">← Back to cases</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto">
      <Link href="/admin/missing-persons" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to cases
      </Link>

      {/* Case Header */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-neutral-500 font-mono mb-1">#{person.caseId}</p>
            <h1 className="text-xl font-semibold text-neutral-900">{person.name}</h1>
            {person.age && (
              <p className="text-sm text-neutral-500 mt-1">{person.age} years old{person.gender ? ` · ${person.gender}` : ''}</p>
            )}
          </div>
          <StatusBadge status={person.status} />
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed mb-4">{person.description}</p>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Last Seen Location</p>
              <p className="text-sm text-neutral-700">{person.lastSeenLocation.name || 'Unknown'}</p>
              {person.lastSeenLocation.latitude !== 0 && (
                <p className="text-xs text-neutral-400">{person.lastSeenLocation.latitude.toFixed(5)}, {person.lastSeenLocation.longitude.toFixed(5)}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Last Seen Date</p>
              <p className="text-sm text-neutral-700">{person.lastSeenDate ? new Date(person.lastSeenDate).toLocaleString() : '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={14} className="text-violet-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Contact Number</p>
              <p className="text-sm text-neutral-700">{person.contactNumber || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Reported</p>
            <p className="text-sm text-neutral-700">{person.createdAt ? new Date(person.createdAt).toLocaleDateString() : '—'}</p>
          </div>
        </div>

        {/* Photos */}
        {person.photos && person.photos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 mb-2">Photos</p>
            <div className="flex gap-2 flex-wrap">
              {person.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-24 h-28 bg-neutral-100 border border-neutral-200 overflow-hidden">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <CaseActions caseId={person.id} currentStatus={person.status} />
    </div>
  );
}
