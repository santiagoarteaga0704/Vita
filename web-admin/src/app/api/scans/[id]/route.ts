import { NextRequest } from 'next/server';
import { AppError, jsonError, jsonOk } from '@/lib/server/errors';
import { requireJwt } from '@/lib/server/guards';
import { db, hydrate } from '@/lib/server/db';
import { publicUrl } from '@/lib/server/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScanRow {
  id: string;
  user_id: string;
  image_url: string;
  treatment_organic_json: string | null;
  treatment_chemical_json: string | null;
  gemini_response_raw: string | null;
  economic_json: string | null;
  weather_window_json: string | null;
  [k: string]: unknown;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const me = requireJwt(req);
    const { id } = await ctx.params;

    const row = db()
      .prepare('SELECT * FROM scans WHERE id = ? AND user_id = ?')
      .get(id, me.userId) as ScanRow | undefined;
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
