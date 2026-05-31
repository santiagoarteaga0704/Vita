/**
 * Proxy (Next 16) — gate de auth para el panel admin.
 *
 * Usa cookie `vita_admin` firmada con JWT propio. Reemplaza el flujo
 * Supabase Auth anterior (Magic Link) por email + password local.
 *
 * Rutas públicas: / · /login · /app/* (la PWA del productor) · /api/*
 *   (las rutas /api validan auth por su cuenta — algunas requieren Bearer
 *    token de productor, otras leen esta cookie).
 *
 * Rutas gated (dashboard admin): todo lo demás (/dashboard, /scans, /catalog,
 *   /analytics, /ingresos, /empresas).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_EXACT = new Set<string>(['/', '/login', '/qr', '/precios']);

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith('/app')) return true;     // PWA productor
  if (pathname.startsWith('/api/')) return true;    // routes manejan auth
  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isPublic(pathname)) {
    // Si ya está logueado y entra a /login, mandamos a /dashboard
    if (pathname === '/login' && (await hasValidAdminCookie(request))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (await hasValidAdminCookie(request)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL('/login', request.url));
}

async function hasValidAdminCookie(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('vita_admin')?.value;
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export const config = {
  // Excluimos assets estáticos del public/ por extensión así no piden auth
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|webmanifest)).*)'],
};
