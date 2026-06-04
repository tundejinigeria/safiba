import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { getCommunity, getCommunityMembers } from '@/src/actions/admin/communities';
import { StatusBadge } from '@/src/components/admin/StatusBadge';
import { CommunityActions } from './CommunityActions';

// Define the member type
interface CommunityMember {
  id: string;
  userId: string;
  name: string;
  username?: string;
  role: string;
  joinedAt?: string;
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [community, members] = await Promise.all([
    getCommunity(id),
    getCommunityMembers(id),
  ]);

  if (!community) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">Community not found</p>
        <Link href="/admin/communities" className="text-sm text-blue-600 mt-2 inline-block">← Back to communities</Link>
      </div>
    );
  }

  // Type assertion for members if getCommunityMembers returns unknown[]
  const typedMembers = members as CommunityMember[];

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

      {/* Members List */}
      <div className="border border-neutral-200 bg-white mt-6">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <Users size={14} className="text-indigo-500" />
          <h2 className="text-sm font-medium text-neutral-900">Members ({typedMembers.length})</h2>
        </div>
        {typedMembers.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {typedMembers.slice(0, 20).map((member) => (
              <div key={member.id || member.userId} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-neutral-600">
                      {(member.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <Link href={`/admin/users/${member.userId}`} className="text-sm text-neutral-700 hover:text-blue-600">
                      {member.name || 'Unknown'}
                    </Link>
                    {member.username && (
                      <p className="text-xs text-neutral-500">@{member.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 capitalize px-2 py-0.5 bg-neutral-100">{member.role}</span>
                  <span className="text-xs text-neutral-400">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
            {typedMembers.length > 20 && (
              <p className="px-5 py-3 text-xs text-neutral-400 text-center">
                Showing 20 of {typedMembers.length} members
              </p>
            )}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-neutral-400 text-center">No members found</p>
        )}
      </div>
    </div>
  );
}