import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AppError, jsonError, jsonOk } from '@/lib/server/errors';
import { db } from '@/lib/server/db';
import { verifyPassword, signToken } from '@/lib/server/auth';

export const runtime = 'nodejs';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  region: string | null;
  municipality: string | null;
  province: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  crop_main: string | null;
  hectares: number | null;
  premium: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = LoginSchema.parse(await req.json());
    const user = db()
      .prepare(
        'SELECT id, email, password_hash, name, region, municipality, province, gps_lat, gps_lng, crop_main, hectares, premium FROM users WHERE email = ?',
      )
      .get(body.email) as UserRow | undefined;

    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const { password_hash: _ph, ...safe } = user;
    void _ph;
    const token = signToken({ userId: user.id, email: user.email });
    return jsonOk({ user: safe, token });
  } catch (e) {
    return jsonError(e);
  }
}
