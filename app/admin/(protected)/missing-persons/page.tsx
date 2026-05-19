import { Search, FilePlus, MapPin, Users, RefreshCw, Bell } from 'lucide-react';

export default function MissingPersonsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-white mb-2">Missing Persons</h1>
      <p className="text-sm text-neutral-500 mb-10">Active missing persons cases — available when the mobile app launches.</p>
      <div className="border border-dashed border-neutral-800 p-8 sm:p-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Search size={16} className="text-neutral-600" />
          <p className="text-xs tracking-widest uppercase text-neutral-600">Coming Soon</p>
        </div>
        <h2 className="text-lg font-semibold text-white mb-3">Missing Persons Registry</h2>
        <p className="text-sm text-neutral-500 leading-relaxed mb-6">
          Cases reported through the Safiba app will be managed here. Coordinate searches, update statuses, and work with families and authorities.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            { icon: FilePlus, label: 'Case creation & management' },
            { icon: MapPin, label: 'Photo & last-seen location' },
            { icon: Users, label: 'Search coordination' },
            { icon: RefreshCw, label: 'Status updates (active/found/closed)' },
            { icon: Bell, label: 'Authority notification' },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm text-neutral-600">
              <Icon size={12} className="shrink-0 text-neutral-700" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
