/**
 * Auth helper para la PWA del productor (/app).
 *
 * Token JWT guardado en localStorage. Lo emitimos en /api/auth/register y
 * /api/auth/login. Cada request a las routes /api/auth/me, /api/scans/*,
 * /api/catalog/* lo manda en Authorization: Bearer.
 *
 * Distinto del admin (cookie httpOnly) — son dos roles separados con tokens
 * separados, así no se cruzan accidentalmente.
 */

const TOKEN_KEY = 'vita_productor';
const USER_KEY = 'vita_productor_user';
const PLAN_KEY = 'vita_productor_plan';

export type Plan = 'free' | 'pro' | 'enterprise';

export function getPlan(): Plan {
  if (typeof window === 'undefined') return 'free';
  const p = localStorage.getItem(PLAN_KEY);
  return p === 'pro' || p === 'enterprise' ? p : 'free';
}

export function setPlan(p: Plan) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAN_KEY, p);
}

export interface Productor {
  id: string;
  email: string;
  name: string | null;
  region: string | null;
  municipality?: string | null;
  province?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  crop_main: string | null;
  hectares: number | null;
  premium?: number;
  scans_count_month?: number;
}

export function saveSession(token: string, user: Productor) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getProductor(): Productor | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Productor;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PLAN_KEY);
}

/** Fetch con bearer del productor + manejo de errores estándar. */
export async function productorFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers ?? {}) as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? res.statusText);
  }
  const json = await res.json();
  return json.data as T;
}
