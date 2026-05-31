import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AppError, jsonError, jsonOk } from '@/lib/server/errors';
import { db, uuid } from '@/lib/server/db';
import { hashPassword, signToken } from '@/lib/server/auth';

export const runtime = 'nodejs';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  region: z.string().min(2),
  municipality: z.string().optional(),
  province: z.string().optional(),
  gps_lat: z.coerce.number().optional(),
  gps_lng: z.coerce.number().optional(),
  crop_main: z.string().min(2),
  hectares: z.coerce.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = RegisterSchema.parse(await req.json());
    const password_hash = await hashPassword(body.password);
    const id = uuid();

    const conn = db();
    const existing = conn.prepare('SELECT id FROM users WHERE email = ?').get(body.email);
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');

    conn
      .prepare(
        `INSERT INTO users (
           id, email, password_hash, name, region, municipality, province,
           crop_main, hectares, gps_lat, gps_lng
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        body.email,
        password_hash,
        body.name,
        body.region,
        body.municipality ?? null,
        body.province ?? null,
        body.crop_main,
        body.hectares ?? null,
        body.gps_lat ?? null,
        body.gps_lng ?? null,
      );

    const user = conn
      .prepare(
        'SELECT id, email, name, region, municipality, province, crop_main, hectares, gps_lat, gps_lng FROM users WHERE id = ?',
      )
      .get(id);

    const token = signToken({ userId: id, email: body.email });
    return jsonOk({ user, token }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
