import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Mail,
  Users,
  AlertTriangle,
  Search,
  LogOut,
} from 'lucide-react';
import { requireAdmin } from '@/src/lib/session';
import { adminSignOut } from '@/src/actions/auth';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/waitlist', label: 'Waitlist', icon: Mail },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/admin/missing-persons', label: 'Missing Persons', icon: Search },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await requireAdmin();
  if (!email) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 border-r border-neutral-800 bg-neutral-950 z-40">
        <div className="px-6 py-6 border-b border-neutral-800">
          <p className="text-sm font-semibold tracking-widest uppercase text-white">Safiba</p>
          <p className="mt-0.5 text-xs text-neutral-600">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors rounded-sm"
            >
              <Icon size={14} className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-neutral-800">
          <p className="px-3 mb-2 text-xs text-neutral-600 truncate">{email}</p>
          <form action={adminSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors rounded-sm text-left"
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
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <p className="text-sm font-semibold tracking-widest uppercase">Safiba Admin</p>
          <div className="flex items-center gap-4">
            {navLinks.slice(0, 3).map(({ href, icon: Icon }) => (
              <Link key={href} href={href} className="text-neutral-400 hover:text-white transition-colors">
                <Icon size={16} />
              </Link>
            ))}
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
