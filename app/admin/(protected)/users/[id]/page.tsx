import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Users, Shield } from 'lucide-react';
import { getUser, getUserAlerts, getUserCommunities } from '@/src/actions/admin/users';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { TrustScoreBar } from '@/src/components/admin/TrustScoreBar';
import { UserActions } from './UserActions';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, alerts, communities] = await Promise.all([
    getUser(id),
    getUserAlerts(id),
    getUserCommunities(id),
  ]);

  if (!user) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">User not found</p>
        <Link href="/admin/users" className="text-sm text-blue-600 mt-2 inline-block">← Back to users</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to users
      </Link>

      {/* Profile Header */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-neutral-600">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">{user.name || 'No name'}</h1>
              <p className="text-sm text-neutral-500">@{user.username || 'unknown'}</p>
            </div>
          </div>
          <StatusBadge status={user.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Email</p>
            <p className="text-sm text-neutral-900 mt-1">{user.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Phone</p>
            <p className="text-sm text-neutral-900 mt-1">{user.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Role</p>
            <p className="text-sm text-neutral-900 mt-1 capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Joined</p>
            <p className="text-sm text-neutral-900 mt-1">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Trust Score */}
        <div className="mt-6 pt-6 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Trust Score</p>
          <TrustScoreBar score={user.trustScore} />
        </div>
      </div>

      {/* Actions */}
      <UserActions userId={user.id} currentStatus={user.status} currentTrustScore={user.trustScore} />

      {/* Alert History */}
      <div className="border border-neutral-200 bg-white mb-6">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500" />
          <h2 className="text-sm font-medium text-neutral-900">Alert History ({alerts.length})</h2>
        </div>
        {alerts.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {alerts.slice(0, 10).map((alert: any) => (
              <div key={alert.alert_id || alert.SK} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-700">{alert.category || 'Alert'}</p>
                  <p className="text-xs text-neutral-500">{alert.created_at ? new Date(alert.created_at).toLocaleDateString() : '—'}</p>
                </div>
                <StatusBadge status={alert.status || 'unverified'} />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-neutral-400 text-center">No alerts posted</p>
        )}
      </div>

      {/* Communities */}
      <div className="border border-neutral-200 bg-white">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <Users size={14} className="text-indigo-500" />
          <h2 className="text-sm font-medium text-neutral-900">Communities ({communities.length})</h2>
        </div>
        {communities.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {communities.map((c: any) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-700">{c.name}</p>
                  <p className="text-xs text-neutral-500 capitalize">{c.role}</p>
                </div>
                <p className="text-xs text-neutral-400">
                  {c.joinedAt ? new Date(c.joinedAt).toLocaleDateString() : '—'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-neutral-400 text-center">Not a member of any community</p>
        )}
      </div>
    </div>
  );
}
