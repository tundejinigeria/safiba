import Link from 'next/link';
import { ShieldAlert, AlertTriangle, Users, Globe, ArrowRight } from 'lucide-react';
import { getModerationQueue } from '@/src/actions/admin/moderation';
import { EmptyState } from '@/src/components/admin/EmptyState';

const TYPE_CONFIG = {
  alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', href: '/admin/incidents' },
  user: { icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', href: '/admin/users' },
  community: { icon: Globe, color: 'text-violet-500', bg: 'bg-violet-50', href: '/admin/communities' },
};

export default async function ModerationPage() {
  const queue = await getModerationQueue();

  const alertItems = queue.filter(i => i.type === 'alert');
  const userItems = queue.filter(i => i.type === 'user');
  const communityItems = queue.filter(i => i.type === 'community');

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900">Moderation Queue</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {queue.length} item{queue.length !== 1 ? 's' : ''} requiring attention
        </p>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="All clear"
          description="No items require moderation at this time"
        />
      ) : (
        <div className="space-y-6">
          {/* Flagged Alerts */}
          {alertItems.length > 0 && (
            <Section title="Flagged Alerts" count={alertItems.length} icon={AlertTriangle} iconColor="text-red-500">
              {alertItems.map((item) => (
                <QueueItem key={item.id} item={item} href={`/admin/incidents/${item.id}`} />
              ))}
            </Section>
          )}

          {/* Low Trust Users */}
          {userItems.length > 0 && (
            <Section title="Low Trust Score Users" count={userItems.length} icon={Users} iconColor="text-indigo-500">
              {userItems.map((item) => (
                <QueueItem key={item.id} item={item} href={`/admin/users/${item.id}`} />
              ))}
            </Section>
          )}

          {/* Unverified Communities */}
          {communityItems.length > 0 && (
            <Section title="Unverified Communities" count={communityItems.length} icon={Globe} iconColor="text-violet-500">
              {communityItems.map((item) => (
                <QueueItem key={item.id} item={item} href={`/admin/communities/${item.id}`} />
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
  children,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className={iconColor} />
          <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
        </div>
        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </div>
  );
}

function QueueItem({ item, href }: { item: { id: string; title: string; reason: string; createdAt: string }; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-700 truncate">{item.title}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{item.reason}</p>
      </div>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <span className="text-xs text-neutral-400">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
        </span>
        <ArrowRight size={12} className="text-neutral-400" />
      </div>
    </Link>
  );
}
