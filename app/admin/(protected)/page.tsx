import Link from 'next/link';
import { Users, AlertTriangle, Globe, Search, Siren, ArrowRight, TrendingUp, MapPin, Clock, UserPlus, ShieldAlert, Radio } from 'lucide-react';
import { getDashboardStats, getRecentActivity } from '@/src/actions/admin/dashboard';

const ACTIVITY_ICONS: Record<string, { icon: typeof Users; color: string }> = {
  user_joined: { icon: UserPlus, color: 'text-indigo-500' },
  alert_created: { icon: AlertTriangle, color: 'text-red-500' },
  sos_triggered: { icon: Radio, color: 'text-rose-500' },
  community_created: { icon: Globe, color: 'text-violet-500' },
  case_reported: { icon: Search, color: 'text-amber-500' },
};

export default async function AdminDashboard() {
  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ]);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Safiba platform overview — real-time data</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-10">
        {[
          { label: 'Users', value: stats.totalUsers, color: 'text-indigo-600', href: '/admin/users' },
          { label: 'Active Alerts', value: stats.activeAlerts, color: 'text-red-600', href: '/admin/incidents' },
          { label: 'Communities', value: stats.totalCommunities, color: 'text-violet-600', href: '/admin/communities' },
          { label: 'Missing Cases', value: stats.activeMissingCases, color: 'text-amber-600', href: '/admin/missing-persons' },
          { label: 'SOS Today', value: stats.sosEventsToday, color: 'text-rose-600', href: '/admin/sos' },
        ].map(({ label, value, color, href }) => (
          <Link
            key={label}
            href={href}
            className="border border-neutral-200 bg-white px-4 py-4 sm:px-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            <p className="text-xs tracking-widest uppercase text-neutral-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* User Growth Chart */}
        <div className="border border-neutral-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-500" />
            <h2 className="text-sm font-medium text-neutral-900">User Growth — Last 30 Days</h2>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end gap-0.5 h-24">
              {stats.userGrowth.map(({ date, count }) => {
                const max = Math.max(...stats.userGrowth.map((d) => d.count), 1);
                const height = Math.max((count / max) * 100, count > 0 ? 8 : 2);
                return (
                  <div key={date} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-sm"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 rounded">
                      {date.slice(5)}: {count}
                    </div>
                  </div>
                );
              })}
            </div>
            {stats.userGrowth.length > 0 && (
              <div className="flex justify-between mt-2">
                <span className="text-xs text-neutral-400">{stats.userGrowth[0]?.date.slice(5)}</span>
                <span className="text-xs text-neutral-400">{stats.userGrowth[stats.userGrowth.length - 1]?.date.slice(5)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Alert Trends Chart */}
        <div className="border border-neutral-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <h2 className="text-sm font-medium text-neutral-900">Alert Trends — Last 14 Days</h2>
          </div>
          <div className="px-5 py-5">
            {stats.alertTrends.length > 0 ? (
              <div className="space-y-2">
                {/* Group by category and show counts */}
                {Object.entries(
                  stats.alertTrends.reduce((acc, { category, count }) => {
                    acc[category] = (acc[category] || 0) + count;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => {
                    const max = Math.max(...Object.values(
                      stats.alertTrends.reduce((acc, { category: c, count: cnt }) => {
                        acc[c] = (acc[c] || 0) + cnt;
                        return acc;
                      }, {} as Record<string, number>)
                    ), 1);
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500 w-20 capitalize truncate">{category}</span>
                        <div className="flex-1 h-4 bg-neutral-100 rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-sm"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-neutral-700 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-8">No alert data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Areas */}
      <div className="border border-neutral-200 bg-white shadow-sm mb-8">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <MapPin size={14} className="text-rose-500" />
          <h2 className="text-sm font-medium text-neutral-900">Top Areas by Incidents</h2>
        </div>
        <div className="divide-y divide-neutral-100">
          {stats.topAreas.length > 0 ? (
            stats.topAreas.map(({ name, incidentCount }, i) => (
              <div key={name} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400 font-mono w-4">{i + 1}</span>
                  <span className="text-sm text-neutral-700">{name}</span>
                </div>
                <span className="text-sm font-medium text-neutral-900">{incidentCount} incidents</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-400 text-center py-8">No incident data yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border border-neutral-200 bg-white shadow-sm mb-8">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <Clock size={14} className="text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-900">Recent Activity</h2>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {recentActivity.map((activity, i) => {
              const config = ACTIVITY_ICONS[activity.type] || { icon: Clock, color: 'text-neutral-500' };
              const Icon = config.icon;
              return (
                <Link key={i} href={activity.href} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <Icon size={14} className={config.color + ' shrink-0'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 truncate">
                      <span className="font-medium">{activity.title}</span>{' '}
                      <span className="text-neutral-500">{activity.description}</span>
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 shrink-0">
                    {activity.timestamp ? formatRelativeTime(activity.timestamp) : ''}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 text-center py-8">No recent activity</p>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/admin/users', label: 'Manage Users', icon: Users, color: 'text-indigo-500', border: 'border-indigo-200' },
          { href: '/admin/incidents', label: 'Review Incidents', icon: AlertTriangle, color: 'text-red-500', border: 'border-red-200' },
          { href: '/admin/communities', label: 'Communities', icon: Globe, color: 'text-violet-500', border: 'border-violet-200' },
          { href: '/admin/missing-persons', label: 'Missing Persons', icon: Search, color: 'text-amber-500', border: 'border-amber-200' },
        ].map(({ href, label, icon: Icon, color, border }) => (
          <Link
            key={href}
            href={href}
            className={`border ${border} bg-white p-4 hover:shadow-sm transition-all flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              <Icon size={14} className={color} />
              <span className="text-sm text-neutral-700">{label}</span>
            </div>
            <ArrowRight size={12} className="text-neutral-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
