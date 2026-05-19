import Link from 'next/link';
import { Mail, Users, AlertTriangle, Search, ArrowRight } from 'lucide-react';
import { getWaitlistStats } from '@/src/actions/admin/waitlist';

export default async function AdminDashboard() {
  const stats = await getWaitlistStats();

  const sections = [
    { href: '/admin/waitlist', label: 'Waitlist', count: stats.total, desc: 'Email signups', icon: Mail, color: 'text-emerald-400', border: 'border-emerald-900' },
    { href: '/admin/users', label: 'Users', count: 0, desc: 'App users (coming soon)', icon: Users, color: 'text-blue-400', border: 'border-blue-900' },
    { href: '/admin/incidents', label: 'Incidents', count: 0, desc: 'Reported incidents (coming soon)', icon: AlertTriangle, color: 'text-red-400', border: 'border-red-900' },
    { href: '/admin/missing-persons', label: 'Missing Persons', count: 0, desc: 'Active cases (coming soon)', icon: Search, color: 'text-amber-400', border: 'border-amber-900' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Safiba platform overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-10">
        {[
          { label: 'Total signups', value: stats.total },
          { label: 'Today', value: stats.today },
          { label: 'This week', value: stats.thisWeek },
          { label: 'App users', value: 0 },
        ].map(({ label, value }) => (
          <div key={label} className="border border-neutral-800 bg-neutral-900 px-4 py-4 sm:px-5">
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="text-xs tracking-widest uppercase text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Signup trend */}
      <div className="border border-neutral-800 mb-8">
        <div className="px-5 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-medium text-white">Waitlist signups — last 14 days</h2>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-end gap-1 h-24">
            {stats.byDay.map(({ date, count }) => {
              const max = Math.max(...stats.byDay.map((d) => d.count), 1);
              const height = Math.max((count / max) * 100, count > 0 ? 8 : 2);
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors"
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {date.slice(5)}: {count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-neutral-600">{stats.byDay[0]?.date.slice(5)}</span>
            <span className="text-xs text-neutral-600">{stats.byDay[stats.byDay.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map(({ href, label, count, desc, icon: Icon, color, border }) => (
          <Link
            key={href}
            href={href}
            className={`border ${border} bg-neutral-900/50 p-5 hover:bg-neutral-900 transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Icon size={16} className={`${color} mt-0.5 shrink-0`} />
                <div>
                  <p className={`text-2xl font-semibold ${color}`}>{count}</p>
                  <p className="text-sm font-medium text-white mt-1">{label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-neutral-600 shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
