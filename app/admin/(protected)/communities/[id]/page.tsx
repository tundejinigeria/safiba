import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { getCommunity, getCommunityMembers } from '@/src/actions/admin/communities';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { CommunityActions } from './CommunityActions';

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const community = await getCommunity(id);

  if (!community) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">Community not found</p>
        <Link href="/admin/communities" className="text-sm text-blue-600 mt-2 inline-block">← Back to communities</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto">
      <Link href="/admin/communities" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to communities
      </Link>

      {/* Community Header */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{community.name}</h1>
            <p className="text-sm text-neutral-500 capitalize mt-1">{community.type.replace('_', ' ')} · {community.locationArea || 'No location'}</p>
          </div>
          <StatusBadge status={community.verified ? 'verified' : 'unverified_community'} label={community.verified ? 'Verified' : 'Unverified'} />
        </div>

        {community.description && (
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">{community.description}</p>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
          <div>
            <p className="text-lg font-semibold text-neutral-900">{community.memberCount}</p>
            <p className="text-xs text-neutral-500">Members</p>
          </div>
          <div>
            <p className="text-sm text-neutral-700">{community.isPrivate ? 'Private' : 'Public'}</p>
            <p className="text-xs text-neutral-500">Visibility</p>
          </div>
          <div>
            <p className="text-sm text-neutral-700">{community.createdAt ? new Date(community.createdAt).toLocaleDateString() : '—'}</p>
            <p className="text-xs text-neutral-500">Created</p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <CommunityActions communityId={community.id} verified={community.verified} memberCount={community.memberCount} />
    </div>
  );
}
