import { NextRequest } from 'next/server';
import { AppError, jsonError, jsonOk } from '@/lib/server/errors';
import { requireAdmin } from '@/lib/server/guards';
import { db, hydrate } from '@/lib/server/db';
import { publicUrl } from '@/lib/server/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AdminScanRow {
  id: string;
  image_url: string;
  user_id: string | null;
  treatment_organic_json: string | null;
  treatment_chemical_json: string | null;
  gemini_response_raw: string | null;
  economic_json: string | null;
  weather_window_json: string | null;
  user_name?: string | null;
  user_email?: string | null;
  user_region?: string | null;
  user_crop_main?: string | null;
  [k: string]: unknown;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    requireAdmin(req);
    const { id } = await ctx.params;

    const row = db()
      .prepare(
        `SELECT s.*, u.name as user_name, u.email as user_email,
                u.region as user_region, u.crop_main as user_crop_main
         FROM scans s LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`,
      )
      .get(id) as AdminScanRow | undefined;
    if (!row) throw new AppError(404, 'NOT_FOUND', 'Scan not found');

    const hydrated = hydrate(row, [
      'treatment_organic_json',
      'treatment_chemical_json',
      'gemini_response_raw',
      'economic_json',
      'weather_window_json',
    ]);
    return jsonOk({ scan: { ...hydrated, image_url: publicUrl(row.image_url) } });
  } catch (e) {
    return jsonError(e);
  }
}
