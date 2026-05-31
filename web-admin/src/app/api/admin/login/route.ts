/**
 * Login admin. Reemplaza el flujo Supabase Auth (Magic Link).
 *
 * Flujo:
 *   1. POST { email, password } → valida contra admin_users
 *   2. Setea cookie httpOnly 'vita_admin' con el JWT
 *   3. proxy.ts lee la cookie en lugar de la sesión Supabase
 *
 * Admin default seedeado: admin@vita.bo / admin1234
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, jsonError } from '@/lib/server/errors';
import { db } from '@/lib/server/db';
import { verifyPassword, signToken } from '@/lib/server/auth';

export const runtime = 'nodejs';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = LoginSchema.parse(await req.json());
    const admin = db()
      .prepare(
        'SELECT id, email, password_hash, name, role FROM admin_users WHERE email = ?',
      )
      .get(body.email) as AdminRow | undefined;

    if (!admin || !(await verifyPassword(body.password, admin.password_hash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña inválida');
    }

    const token = signToken({ userId: admin.id, email: admin.email });
    const res = NextResponse.json({
      data: { admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } },
    });
    res.cookies.set('vita_admin', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30d
    });
    return res;
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE() {
  const res = NextResponse.json({ data: { ok: true } });
  res.cookies.delete('vita_admin');
  return res;
}
