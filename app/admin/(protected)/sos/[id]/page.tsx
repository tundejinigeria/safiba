import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Phone, User } from 'lucide-react';
import { getSOSEvent } from '@/src/actions/admin/sos';
import { StatusBadge } from '@/src/components/admin/StatusBadge';

function formatDuration(start: string, end?: string): string {
  if (!start) return '—';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '< 1 minute';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

export default async function SOSDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getSOSEvent(id);

  if (!event) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">SOS event not found</p>
        <Link href="/admin/sos" className="text-sm text-blue-600 mt-2 inline-block">← Back to SOS events</Link>
      </div>
    );
  }

  const isActive = event.status === 'active';
  const endTime = event.resolvedAt || event.cancelledAt;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto">
      <Link href="/admin/sos" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to SOS events
      </Link>

      {/* Active Alert Banner */}
      {isActive && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 border border-rose-200 bg-rose-50 animate-pulse">
          <div className="w-2 h-2 bg-rose-500 rounded-full" />
          <p className="text-sm font-medium text-rose-800">This SOS is currently active</p>
        </div>
      )}

      {/* Event Header */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">SOS Emergency</h1>
            <p className="text-sm text-neutral-500 mt-1">Event ID: {event.id.slice(0, 12)}</p>
          </div>
          <StatusBadge status={event.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
          <div className="flex items-start gap-2">
            <User size={14} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Triggered By</p>
              <Link href={`/admin/users/${event.userId}`} className="text-sm text-blue-600 hover:underline">
                {event.userName || event.userId.slice(0, 12)}
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Triggered At</p>
              <p className="text-sm text-neutral-700">
                {event.triggeredAt ? new Date(event.triggeredAt).toLocaleString() : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Location</p>
              {event.location ? (
                <>
                  <p className="text-sm text-neutral-700">{event.location.address || 'Unknown address'}</p>
                  <p className="text-xs text-neutral-400">
                    {event.location.latitude.toFixed(5)}, {event.location.longitude.toFixed(5)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-neutral-500">No location data</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone size={14} className="text-violet-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Contacts Notified</p>
              <p className="text-sm text-neutral-700">{event.contactsNotified} contact{event.contactsNotified !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Duration / Resolution */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-neutral-500">Duration</p>
              <p className="text-sm font-medium text-neutral-900">
                {formatDuration(event.triggeredAt, endTime)}
                {isActive && <span className="text-rose-500 ml-1">(ongoing)</span>}
              </p>
            </div>
            {event.resolvedAt && (
              <div>
                <p className="text-xs text-neutral-500">Resolved At</p>
                <p className="text-sm text-neutral-700">{new Date(event.resolvedAt).toLocaleString()}</p>
              </div>
            )}
            {event.cancelledAt && (
              <div>
                <p className="text-xs text-neutral-500">Cancelled At</p>
                <p className="text-sm text-neutral-700">{new Date(event.cancelledAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
