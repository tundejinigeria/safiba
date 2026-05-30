import Link from 'next/link';
import { ShieldAlert, AlertTriangle, Users, Globe, ArrowRight, Clock, TrendingDown } from 'lucide-react';
import { getModerationQueue } from '@/src/actions/admin/moderation';
import { EmptyState } from '@/src/components/admin/EmptyState';

const TYPE_CONFIG = {
  alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', href: '/admin/incidents', priority: 'high' },
  user: { icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', href: '/admin/users', priority: 'medium' },
  community: { icon: Globe, color: 'text-violet-500', bg: 'bg-violet-50', href: '/admin/communities', priority: 'low' },
};

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

export default async function ModerationPage() {
  const queue = await getModerationQueue();

  const alertItems = queue.filter(i => i.type === 'alert');
  const userItems = queue.filter(i => i.type === 'user');
  const communityItems = queue.filter(i => i.type === 'community');

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Moderation Queue</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {queue.length} item{queue.length !== 1 ? 's' : ''} requiring attention
        </p>
      </div>

      {/* Priority Summary */}
      {queue.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-red-100 bg-red-50/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={12} className="text-red-500" />
              <p className="text-lg font-semibold text-red-700">{alertItems.length}</p>
            </div>
            <p className="text-xs text-red-600">Flagged Alerts</p>
          </div>
          <div className="border border-indigo-100 bg-indigo-50/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingDown size={12} className="text-indigo-500" />
              <p className="text-lg font-semibold text-indigo-700">{userItems.length}</p>
            </div>
            <p className="text-xs text-indigo-600">Low Trust Users</p>
          </div>
          <div className="border border-violet-100 bg-violet-50/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Globe size={12} className="text-violet-500" />
              <p className="text-lg font-semibold text-violet-700">{communityItems.length}</p>
            </div>
            <p className="text-xs text-violet-600">Unverified Communities</p>
          </div>
        </div>
      )}

      {queue.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="All clear"
          description="No items require moderation at this time"
        />
      ) : (
        <div className="space-y-6">
          {/* Flagged Alerts — High Priority */}
          {alertItems.length > 0 && (
            <Section title="Flagged Alerts" count={alertItems.length} icon={AlertTriangle} iconColor="text-red-500" priority="high">
              {alertItems.map((item) => (
                <QueueItem key={item.id} item={item} href={`/admin/incidents/${item.id}`} priority="high" />
              ))}
            </Section>
          )}

          {/* Low Trust Users — Medium Priority */}
          {userItems.length > 0 && (
            <Section title="Low Trust Score Users" count={userItems.length} icon={Users} iconColor="text-indigo-500" priority="medium">
              {userItems.map((item) => (
                <QueueItem key={item.id} item={item} href={`/admin/users/${item.id}`} priority="medium" />
              ))}
            </Section>
          )}

          {/* Unverified Communities — Low Priority */}
          {communityItems.length > 0 && (
            <Section title="Unverified Communities" count={communityItems.length} icon={Globe} iconColor="text-violet-500" priority="low">
              {communityItems.map((item) => (
                <QueueItem key={item.id} item={item} href={`/admin/communities/${item.id}`} priority="low" />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  icon: Icon,
  iconColor,
  priority,
  children,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  iconColor: string;
  priority: 'high' | 'medium' | 'low';
  children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[priority]}`} />
          <Icon size={14} className={iconColor} />
          <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 capitalize">{priority} priority</span>
          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{count}</span>
        </div>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </div>
  );
}

function QueueItem({
  item,
  href,
  priority,
}: {
  item: { id: string; title: string; reason: string; createdAt: string };
  href: string;
  priority: 'high' | 'medium' | 'low';
}) {
  return (
    <Link href={href} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-700 truncate">{item.title}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{item.reason}</p>
      </div>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        {item.createdAt && (
          <span className="text-xs text-neutral-400 hidden sm:inline-flex items-center gap-1">
            <Clock size={10} />
            {formatAge(item.createdAt)}
          </span>
        )}
        <ArrowRight size={12} className="text-neutral-400" />
      </div>
    </Link>
  );
}

function formatAge(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 1) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}
