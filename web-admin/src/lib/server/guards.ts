/**
 * Guardas para route handlers — sistema JWT unificado.
 *
 * requireJwt(req)   → Bearer token de productor (app mobile / PWA /app)
 * requireAdmin(req) → cookie httpOnly `vita_admin` (panel web).
 *                     Si no hay cookie, acepta Bearer como fallback (CLI/curl).
 *
 * Las dos lanzan AppError(401/403) y jsonError() las transforma en respuesta.
 */
import { NextRequest } from 'next/server';
import { AppError } from './errors';
import { verifyToken, JwtPayload } from './auth';
import { db } from './db';

function bearer(req: NextRequest): string {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ')) {
    throw new AppError(401, 'NO_TOKEN', 'Missing bearer token');
  }
  return h.slice(7);
}

export function requireJwt(req: NextRequest): JwtPayload {
  const token = bearer(req);
  try {
    return verifyToken(token);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export function requireAdmin(req: NextRequest): AdminUser {
  // Browser: cookie httpOnly. CLI / curl: Bearer header como fallback.
  let token = req.cookies.get('vita_admin')?.value;
  if (!token) {
    const h = req.headers.get('authorization');
    if (h?.startsWith('Bearer ')) token = h.slice(7);
  }
  if (!token) throw new AppError(401, 'NO_TOKEN', 'Missing admin session');

  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  const admin = db()
    .prepare('SELECT id, email, role FROM admin_users WHERE email = ?')
    .get(payload.email) as AdminUser | undefined;
  if (!admin) throw new AppError(403, 'NOT_ADMIN', 'Not an admin user');
  return admin;
}
