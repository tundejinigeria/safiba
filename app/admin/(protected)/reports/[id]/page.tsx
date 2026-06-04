import Link from 'next/link';
import { ArrowLeft, User, Flag, Shield, Clock, FileText } from 'lucide-react';
import { getReport, getUserReportHistory } from '@/src/actions/admin/reports';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { ReportActions } from './ReportActions';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">Report not found</p>
        <Link href="/admin/reports" className="text-sm text-blue-600 mt-2 inline-block">← Back to reports</Link>
      </div>
    );
  }

  const history = await getUserReportHistory(report.reported_user_id);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto">
      <Link href="/admin/reports" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to reports
      </Link>

      {/* Report Header */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={report.category} />
            <StatusBadge status={report.status} />
          </div>
          <span className="text-xs text-neutral-400">
            {report.created_at ? new Date(report.created_at).toLocaleString() : '—'}
          </span>
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed">{report.description}</p>
      </div>

      {/* Reporter & Reported Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-neutral-500" />
            <h3 className="text-xs font-medium text-neutral-500 uppercase">Reporter</h3>
          </div>
          <p className="text-sm font-medium text-neutral-900">{report.reporter_profile.full_name}</p>
          <p className="text-xs text-neutral-500 mb-2">@{report.reporter_profile.username}</p>
          <Link href={`/admin/users/${report.reporter_user_id}`} className="text-xs text-blue-600 hover:underline">
            View profile →
          </Link>
        </div>

        <div className="border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flag size={14} className="text-red-500" />
            <h3 className="text-xs font-medium text-neutral-500 uppercase">Reported Member</h3>
          </div>
          <p className="text-sm font-medium text-neutral-900">{report.reported_profile.full_name}</p>
          <p className="text-xs text-neutral-500 mb-2">@{report.reported_profile.username}</p>
          <Link href={`/admin/users/${report.reported_user_id}`} className="text-xs text-blue-600 hover:underline">
            View profile →
          </Link>
        </div>
      </div>

      {/* Report Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500 mb-1">Category</p>
          <p className="text-sm font-medium text-neutral-900 capitalize">{report.category.replace(/_/g, ' ')}</p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500 mb-1">Status</p>
          <p className="text-sm font-medium text-neutral-900 capitalize">{report.status.replace(/_/g, ' ')}</p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500 mb-1">Community</p>
          <p className="text-sm font-medium text-neutral-900">{report.community_name}</p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-1.5">
            <Flag size={12} className="text-red-500" />
            <p className="text-xs text-neutral-500">Reports Against User</p>
          </div>
          <p className="text-lg font-semibold text-neutral-900 mt-1">{report.report_count_against_user}</p>
        </div>
      </div>

      {/* Evidence Section */}
      {report.evidence_urls && report.evidence_urls.length > 0 && (
        <div className="border border-neutral-200 bg-white p-5 mb-6">
          <h2 className="text-sm font-medium text-neutral-900 mb-3">Evidence</h2>
          <div className="flex gap-2 flex-wrap">
            {report.evidence_urls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-20 h-20 bg-neutral-100 border border-neutral-200 overflow-hidden"
              >
                <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Previous Actions Section */}
      {history.previous_actions.length > 0 && (
        <div className="border border-neutral-200 bg-white p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-neutral-600" />
            <h2 className="text-sm font-medium text-neutral-900">Previous Actions</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {history.previous_actions.map((action) => (
              <div key={action.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {action.action_type === 'warn' && <Clock size={12} className="text-amber-500" />}
                    {action.action_type === 'suspend' && <Shield size={12} className="text-orange-500" />}
                    {action.action_type === 'ban' && <Flag size={12} className="text-red-500" />}
                    {action.action_type === 'dismiss' && <FileText size={12} className="text-neutral-500" />}
                    <span className="text-sm font-medium text-neutral-800 capitalize">
                      {action.action_type}
                      {action.duration_days ? ` (${action.duration_days} days)` : ''}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {action.created_at ? new Date(action.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                {action.notes && (
                  <p className="text-xs text-neutral-500 ml-5">{action.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enforcement Actions Panel */}
      <ReportActions reportId={report.id} currentStatus={report.status} />
    </div>
  );
}
