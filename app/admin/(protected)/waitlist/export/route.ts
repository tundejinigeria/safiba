import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/session';
import { getWaitlistEntries } from '@/src/actions/admin/waitlist';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entries = await getWaitlistEntries();

  const csv = [
    'Email,Joined At,Source',
    ...entries.map(
      (e) => `${e.email},${e.joinedAt},${e.source}`
    ),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="safiba-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
