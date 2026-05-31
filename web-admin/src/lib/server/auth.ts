/**
 * Auth para la app móvil (productores).
 * JWT propio firmado con JWT_SECRET. bcrypt para password hashing.
 *
 * Para el panel admin web seguimos usando Supabase Auth (Magic Link).
 */
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

export type JwtPayload = { userId: string; email: string };

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET in env');
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '30d') as SignOptions['expiresIn'];
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET in env');
  return jwt.verify(token, secret) as JwtPayload;
}
