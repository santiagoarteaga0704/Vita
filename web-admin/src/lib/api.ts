/**
 * apiFetch — wrapper para llamar a las routes /api/* desde el cliente.
 *
 * Las rutas admin ahora usan cookie httpOnly `vita_admin` (la setea
 * /api/admin/login). El browser la manda automáticamente con
 * `credentials: 'include'`. No hay que tocar Authorization.
 *
 * Las rutas de productor (mobile / /app) seguirán necesitando Bearer token
 * cuando construyamos esa parte — en ese momento agregamos `getMobileToken()`.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || res.statusText);
  }
  const json = await res.json();
  return json.data as T;
}
