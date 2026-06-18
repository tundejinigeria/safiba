import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Mail,
  Users,
  AlertTriangle,
  Search,
  Globe,
  Siren,
  ShieldAlert,
  CreditCard,
  Flag,
  Tag,
  LogOut,
} from 'lucide-react';
import { requireAdmin } from '@/src/lib/session';
import { adminSignOut } from '@/src/actions/auth';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, iconColor: 'text-blue-600' },
  { href: '/admin/waitlist', label: 'Waitlist', icon: Mail, iconColor: 'text-emerald-600' },
  { href: '/admin/users', label: 'Users', icon: Users, iconColor: 'text-indigo-500' },
  { href: '/admin/incidents', label: 'Incidents', icon: AlertTriangle, iconColor: 'text-red-500' },
  { href: '/admin/communities', label: 'Communities', icon: Globe, iconColor: 'text-violet-500' },
  { href: '/admin/missing-persons', label: 'Missing Persons', icon: Search, iconColor: 'text-amber-500' },
  { href: '/admin/sos', label: 'SOS Events', icon: Siren, iconColor: 'text-rose-500' },
  { href: '/admin/reports', label: 'Reports', icon: Flag, iconColor: 'text-orange-500' },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard, iconColor: 'text-emerald-500' },
  { href: '/admin/pricing', label: 'Pricing', icon: Tag, iconColor: 'text-teal-500' },
  { href: '/admin/moderation', label: 'Moderation', icon: ShieldAlert, iconColor: 'text-neutral-500' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await requireAdmin();
  if (!email) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 border-r border-neutral-200 bg-white z-40">
        <div className="px-6 py-6 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <Image src="/safiba-logo.svg" alt="Safiba" width={20} height={22} className="h-5 w-auto" />
            <p className="text-xs text-neutral-500">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors rounded-sm"
            >
              <Icon size={14} className={`shrink-0 ${iconColor}`} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-neutral-200">
          <p className="px-3 mb-2 text-xs text-neutral-500 truncate">{email}</p>
          <form action={adminSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors rounded-sm text-left"
            >
              <LogOut size={14} className="shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <Image src="/safiba-logo.svg" alt="Safiba" width={18} height={20} className="h-[18px] w-auto" />
            <span className="text-xs text-neutral-500">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            {navLinks.slice(0, 3).map(({ href, icon: Icon, iconColor }) => (
              <Link key={href} href={href} className="text-neutral-500 hover:text-neutral-900 transition-colors">
                <Icon size={16} className={iconColor} />
              </Link>
            ))}
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
