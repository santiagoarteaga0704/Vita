import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/server/errors';
import { requireAdmin } from '@/lib/server/guards';
import { db } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const conn = db();

    const totalScans = (conn.prepare('SELECT COUNT(*) as n FROM scans').get() as { n: number }).n;
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const weekScans = (conn
      .prepare('SELECT COUNT(*) as n FROM scans WHERE created_at > ?')
      .get(since) as { n: number }).n;
    const totalUsers = (conn.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).n;

    const validated = conn
      .prepare(
        `SELECT admin_validated, latency_ms FROM scans WHERE admin_validated IS NOT NULL`,
      )
      .all() as { admin_validated: string; latency_ms: number | null }[];

    const correct = validated.filter((r) => r.admin_validated === 'correct').length;
    const precision = validated.length ? (correct / validated.length) * 100 : 0;
    const avgLat = validated.length
      ? validated.reduce((a, r) => a + (r.latency_ms ?? 0), 0) / validated.length
      : 0;

    return jsonOk({
      total_scans: totalScans,
      weekly_scans: weekScans,
      total_users: totalUsers,
      ia_precision_pct: Math.round(precision),
      avg_latency_ms: Math.round(avgLat),
    });
  } catch (e) {
    return jsonError(e);
  }
}
