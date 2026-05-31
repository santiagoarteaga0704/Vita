import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/server/errors';
import { requireAdmin } from '@/lib/server/guards';
import { db } from '@/lib/server/db';
import { publicUrl } from '@/lib/server/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScanListRow {
  id: string;
  image_url: string;
  detected_pest_name: string | null;
  severity: string | null;
  severity_pct: number | null;
  confidence: number | null;
  crop: string | null;
  region: string | null;
  admin_validated: string | null;
  created_at: string;
  user_name: string | null;
  user_region: string | null;
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const offset = (page - 1) * limit;

    const filters: string[] = [];
    const params: (string | number)[] = [];

    const status = searchParams.get('status');
    if (status === 'pending') filters.push('s.admin_validated IS NULL');
    if (status === 'validated') filters.push('s.admin_validated IS NOT NULL');
    const region = searchParams.get('region');
    if (region) { filters.push('s.region = ?'); params.push(region); }
    const pest = searchParams.get('pest');
    if (pest) { filters.push('s.detected_pest_id = ?'); params.push(pest); }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const conn = db();

    const total = (conn
      .prepare(`SELECT COUNT(*) as n FROM scans s ${where}`)
      .get(...params) as { n: number }).n;

    const rows = conn
      .prepare(
        `SELECT s.id, s.image_url, s.detected_pest_name, s.severity, s.severity_pct,
                s.confidence, s.crop, s.region, s.admin_validated, s.created_at,
                u.name as user_name, u.region as user_region
         FROM scans s LEFT JOIN users u ON s.user_id = u.id
         ${where}
         ORDER BY s.created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .all(...params, limit, offset) as ScanListRow[];

    const scans = rows.map((s) => ({ ...s, image_url: publicUrl(s.image_url) }));
    return jsonOk({ scans, total, page });
  } catch (e) {
    return jsonError(e);
  }
}
