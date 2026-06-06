import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Phone, User, Users, ExternalLink, MessageCircle } from 'lucide-react';
import { getSOSEvent, getSOSContacts, getSOSLiveLocation } from '@/src/actions/admin/sos';
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

function getWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/^0/, '234').replace(/^\+/, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
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

  const contacts = await getSOSContacts(event.userId);
  const liveLocation = await getSOSLiveLocation(event.userId);
  const isActive = event.status === 'active';
  const endTime = event.resolvedAt || event.cancelledAt;

  const sosMessage = `🆘 EMERGENCY: ${event.userName || 'A Safiba user'} triggered an SOS alert. ` +
    (event.location?.address ? `Location: ${event.location.address}. ` : '') +
    (liveLocation?.shareUrl ? `Track live location: ${liveLocation.shareUrl}` : '') +
    ` — Safiba Safety Team`

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
          <p className="text-sm font-medium text-rose-800">This SOS is currently active — user may be in danger</p>
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
              <p className="text-xs text-neutral-500">Duration</p>
              <p className="text-sm text-neutral-700">
                {formatDuration(event.triggeredAt, endTime)}
                {isActive && <span className="text-rose-500 ml-1">(ongoing)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Trigger Location</p>
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
            <Clock size={14} className="text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">Triggered At</p>
              <p className="text-sm text-neutral-700">
                {event.triggeredAt ? new Date(event.triggeredAt).toLocaleString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Location Panel */}
      {isActive && (
        <div className="border border-rose-200 bg-rose-50 p-6 mb-6">
          <h2 className="text-base font-semibold text-rose-900 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-rose-600" />
            Live Location
          </h2>

          {liveLocation ? (
            <div>
              {liveLocation.lat && liveLocation.lng ? (
                <div className="bg-white border border-rose-100 p-4 rounded mb-3">
                  <p className="text-sm text-neutral-700 font-mono">
                    {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Last updated: {liveLocation.lastUpdated ? new Date(liveLocation.lastUpdated).toLocaleString() : 'Pending'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-rose-700 mb-3">Waiting for location data from user's device...</p>
              )}

              <div className="flex flex-wrap gap-2">
                {liveLocation.lat && liveLocation.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${liveLocation.lat},${liveLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-700 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Open in Google Maps
                  </a>
                )}
                {liveLocation.shareUrl && (
                  <a
                    href={liveLocation.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors"
                  >
                    <MapPin size={12} />
                    View Live Tracking Page
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-rose-700">No live location session found for this SOS event.</p>
          )}
        </div>
      )}

      {/* Google Maps embed if location available */}
      {event.location && (
        <div className="border border-neutral-200 bg-white mb-6 overflow-hidden">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${event.location.longitude}!3d${event.location.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sng!4v1`}
            className="w-full h-64 border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Users size={16} className="text-violet-600" />
          Emergency Contacts
          <span className="text-xs text-neutral-400 font-normal">({contacts.length})</span>
        </h2>

        {contacts.length === 0 ? (
          <p className="text-sm text-neutral-500">No emergency contacts registered for this user.</p>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    {contact.name}
                    {contact.isPrimary && (
                      <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5">Primary</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {contact.relationship && `${contact.relationship} · `}{contact.phone}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {contact.isOnSafiba ? '✅ On Safiba' : '⚠️ Not on Safiba'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <Phone size={11} />
                    Call
                  </a>
                  <a
                    href={getWhatsAppUrl(contact.phone, sosMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle size={11} />
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="border border-neutral-200 bg-white p-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 shrink-0" />
            <div>
              <p className="text-sm text-neutral-700">SOS triggered</p>
              <p className="text-xs text-neutral-400">{event.triggeredAt ? new Date(event.triggeredAt).toLocaleString() : '—'}</p>
            </div>
          </div>
          {event.contactsNotified > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-neutral-700">{event.contactsNotified} contact{event.contactsNotified !== 1 ? 's' : ''} notified</p>
              </div>
            </div>
          )}
          {event.cancelledAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-neutral-700">User confirmed safe — SOS cancelled</p>
                <p className="text-xs text-neutral-400">{new Date(event.cancelledAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          {event.resolvedAt && !event.cancelledAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-neutral-700">SOS resolved</p>
                <p className="text-xs text-neutral-400">{new Date(event.resolvedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
