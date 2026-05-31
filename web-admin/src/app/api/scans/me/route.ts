import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/server/errors';
import { requireJwt } from '@/lib/server/guards';
import { db } from '@/lib/server/db';
import { publicUrl } from '@/lib/server/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScanRow {
  id: string;
  image_url: string;
  detected_pest_name: string | null;
  severity: string | null;
  severity_pct: number | null;
  confidence: number | null;
  crop: string | null;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const me = requireJwt(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);
    const offset = (page - 1) * limit;

    const conn = db();
    const total = (conn
      .prepare('SELECT COUNT(*) as n FROM scans WHERE user_id = ?')
      .get(me.userId) as { n: number }).n;

    const rows = conn
      .prepare(
        `SELECT id, image_url, detected_pest_name, severity, severity_pct, confidence, crop, created_at
         FROM scans WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .all(me.userId, limit, offset) as ScanRow[];

    const scans = rows.map((s) => ({ ...s, image_url: publicUrl(s.image_url) }));
    return jsonOk({ scans, total, page });
  } catch (e) {
    return jsonError(e);
  }
}
