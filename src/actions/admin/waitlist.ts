'use server';

import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb';
import { requireAdmin } from '@/src/lib/session';

export interface WaitlistEntry {
  pk: string;
  id: string;
  email: string;
  joinedAt: string;
  source: string;
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLES.WAITLIST,
      FilterExpression: 'sk = :sk',
      ExpressionAttributeValues: { ':sk': 'PROFILE' },
    })
  );

  const items = (result.Items ?? []) as WaitlistEntry[];
  return items.sort(
    (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
  );
}

export async function deleteWaitlistEntry(pk: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  await dynamo.send(
    new DeleteCommand({
      TableName: TABLES.WAITLIST,
      Key: { pk, sk: 'PROFILE' },
    })
  );
}

export interface WaitlistStats {
  total: number;
  today: number;
  thisWeek: number;
  byDay: { date: string; count: number }[];
}

export async function getWaitlistStats(): Promise<WaitlistStats> {
  const entries = await getWaitlistEntries();
  const now = new Date();

  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const today = entries.filter((e) => e.joinedAt.startsWith(todayStr)).length;
  const thisWeek = entries.filter(
    (e) => new Date(e.joinedAt) >= weekAgo
  ).length;

  // Build daily counts for the last 14 days
  const byDayMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    byDayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const entry of entries) {
    const day = entry.joinedAt.slice(0, 10);
    if (day in byDayMap) byDayMap[day]++;
  }

  const byDay = Object.entries(byDayMap).map(([date, count]) => ({
    date,
    count,
  }));

  return { total: entries.length, today, thisWeek, byDay };
}
