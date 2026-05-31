import Link from 'next/link';
import { ArrowLeft, MapPin, CheckCircle, Flag, Trash2 } from 'lucide-react';
import { getAlert } from '@/src/actions/admin/alerts';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { AlertActions } from './AlertActions';

export default async function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = await getAlert(id);

  if (!alert) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">Alert not found</p>
        <Link href="/admin/incidents" className="text-sm text-blue-600 mt-2 inline-block">← Back to incidents</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto">
      <Link href="/admin/incidents" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to incidents
      </Link>

      {/* Alert Header */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
          <span className="text-xs text-neutral-400">
            {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '—'}
          </span>
        </div>

        <h1 className="text-lg font-semibold text-neutral-900 mb-2 capitalize">{alert.category} Alert</h1>
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">{alert.description}</p>

        {/* Location */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-neutral-50 border border-neutral-100">
          <MapPin size={14} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm text-neutral-700">{alert.location.name || 'Unknown location'}</p>
            <p className="text-xs text-neutral-500">
              {alert.location.latitude.toFixed(5)}, {alert.location.longitude.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
          <div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-500" />
              <span className="text-lg font-semibold text-neutral-900">{alert.confirmationCount}</span>
            </div>
            <p className="text-xs text-neutral-500">Confirmations</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Flag size={12} className="text-red-500" />
              <span className="text-lg font-semibold text-neutral-900">{alert.falseReportCount}</span>
            </div>
            <p className="text-xs text-neutral-500">False Reports</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Creator</p>
            <Link href={`/admin/users/${alert.creatorId}`} className="text-sm text-blue-600 hover:underline">
              {alert.creatorName || alert.creatorId.slice(0, 8)}
            </Link>
          </div>
        </div>

        {/* Photos */}
        {alert.photos && alert.photos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 mb-2">Attached Media</p>
            <div className="flex gap-2 flex-wrap">
              {alert.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 bg-neutral-100 border border-neutral-200 overflow-hidden">
                  <img src={url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <AlertActions alertId={alert.id} currentStatus={alert.status} />
    </div>
  );
}
