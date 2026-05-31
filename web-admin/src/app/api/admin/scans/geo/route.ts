import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/server/errors';
import { requireAdmin } from '@/lib/server/guards';
import { db } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const points = db()
      .prepare(
        `SELECT gps_lat, gps_lng, detected_pest_name, severity, crop
         FROM scans WHERE gps_lat IS NOT NULL`,
      )
      .all();
    return jsonOk({ points });
  } catch (e) {
    return jsonError(e);
  }
}
