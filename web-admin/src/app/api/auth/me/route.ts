import { NextRequest } from 'next/server';
import { AppError, jsonError, jsonOk } from '@/lib/server/errors';
import { requireJwt } from '@/lib/server/guards';
import { db } from '@/lib/server/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const me = requireJwt(req);
    const user = db()
      .prepare(
        'SELECT id, email, name, region, municipality, province, gps_lat, gps_lng, crop_main, hectares, premium, scans_count_month FROM users WHERE id = ?',
      )
      .get(me.userId);
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    return jsonOk({ user });
  } catch (e) {
    return jsonError(e);
  }
}
