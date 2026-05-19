import { Users, CheckCircle, ShieldOff, Star } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-white mb-2">Users</h1>
      <p className="text-sm text-neutral-500 mb-10">App user management — available when the mobile app launches.</p>
      <ComingSoon
        icon={Users}
        title="User Management"
        desc="Once the Safiba mobile app launches, registered users will appear here. You'll be able to view profiles, verify community leaders, and manage account status."
        features={[
          { icon: Users, label: 'User profiles' },
          { icon: CheckCircle, label: 'Community verification' },
          { icon: ShieldOff, label: 'Account suspension' },
          { icon: Star, label: 'Trust score overview' },
        ]}
      />
    </div>
  );
}

function ComingSoon({
  icon: SectionIcon,
  title,
  desc,
  features,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  features: { icon: React.ElementType; label: string }[];
}) {
  return (
    <div className="border border-dashed border-neutral-800 p-8 sm:p-12 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <SectionIcon size={16} className="text-neutral-600" />
        <p className="text-xs tracking-widest uppercase text-neutral-600">Coming Soon</p>
      </div>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <p className="text-sm text-neutral-500 leading-relaxed mb-6">{desc}</p>
      <ul className="flex flex-col gap-2.5">
        {features.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm text-neutral-600">
            <Icon size={12} className="shrink-0 text-neutral-700" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
