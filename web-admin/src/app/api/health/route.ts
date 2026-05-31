import { jsonOk } from '@/lib/server/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  return jsonOk({ ok: true, env: process.env.NODE_ENV ?? 'development', ts: new Date().toISOString() });
}
