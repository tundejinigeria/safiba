import { AlertTriangle, ClipboardCheck, PhoneCall, Map, Flag } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Incidents</h1>
      <p className="text-sm text-neutral-500 mb-10">Reported safety incidents — available when the mobile app launches.</p>
      <div className="border border-dashed border-neutral-300 bg-white p-8 sm:p-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={16} className="text-red-500" />
          <p className="text-xs tracking-widest uppercase text-neutral-400">Coming Soon</p>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Incident Management</h2>
        <p className="text-sm text-neutral-500 leading-relaxed mb-6">
          Community-reported incidents will appear here. You'll be able to review, verify, escalate to authorities, and manage trust scores.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            { icon: ClipboardCheck, label: 'Incident review queue', iconColor: 'text-emerald-500' },
            { icon: ClipboardCheck, label: 'Verification workflow', iconColor: 'text-blue-500' },
            { icon: PhoneCall, label: 'Authority escalation', iconColor: 'text-violet-500' },
            { icon: Map, label: 'Heatmap analytics', iconColor: 'text-rose-500' },
            { icon: Flag, label: 'False report flagging', iconColor: 'text-orange-500' },
          ].map(({ icon: Icon, label, iconColor }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm text-neutral-500">
              <Icon size={12} className={`shrink-0 ${iconColor}`} />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
