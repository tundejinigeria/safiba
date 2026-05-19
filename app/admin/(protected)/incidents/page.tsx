import { AlertTriangle, ClipboardCheck, PhoneCall, Map, Flag } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-white mb-2">Incidents</h1>
      <p className="text-sm text-neutral-500 mb-10">Reported safety incidents — available when the mobile app launches.</p>
      <div className="border border-dashed border-neutral-800 p-8 sm:p-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={16} className="text-neutral-600" />
          <p className="text-xs tracking-widest uppercase text-neutral-600">Coming Soon</p>
        </div>
        <h2 className="text-lg font-semibold text-white mb-3">Incident Management</h2>
        <p className="text-sm text-neutral-500 leading-relaxed mb-6">
          Community-reported incidents will appear here. You'll be able to review, verify, escalate to authorities, and manage trust scores.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            { icon: ClipboardCheck, label: 'Incident review queue' },
            { icon: ClipboardCheck, label: 'Verification workflow' },
            { icon: PhoneCall, label: 'Authority escalation' },
            { icon: Map, label: 'Heatmap analytics' },
            { icon: Flag, label: 'False report flagging' },
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
