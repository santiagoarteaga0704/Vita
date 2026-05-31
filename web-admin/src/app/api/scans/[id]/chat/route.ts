import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AppError, jsonError, jsonOk } from '@/lib/server/errors';
import { requireJwt } from '@/lib/server/guards';
import { db, uuid, parseJson } from '@/lib/server/db';
import { chatTurn, defaultSuggestions, ChatContext } from '@/lib/server/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface ScanRow {
  id: string;
  user_id: string;
  detected_pest_name: string | null;
  severity: string | null;
  confidence: number | null;
  crop: string | null;
  region: string | null;
  treatment_organic_json: string | null;
  treatment_chemical_json: string | null;
  prevention: string | null;
  economic_json: string | null;
  weather_window_json: string | null;
}

interface ChatRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function loadContext(scanId: string, userId: string): { ctx: ChatContext; scan: ScanRow } {
  const scan = db()
    .prepare(
      `SELECT id, user_id, detected_pest_name, severity, confidence, crop, region,
              treatment_organic_json, treatment_chemical_json, prevention,
              economic_json, weather_window_json
       FROM scans WHERE id = ? AND user_id = ?`,
    )
    .get(scanId, userId) as ScanRow | undefined;
  if (!scan) throw new AppError(404, 'NOT_FOUND', 'Scan not found');

  const me = db()
    .prepare('SELECT hectares FROM users WHERE id = ?')
    .get(userId) as { hectares: number | null } | undefined;

  const ctx: ChatContext = {
    pest_name: scan.detected_pest_name,
    severity: scan.severity,
    confidence: scan.confidence,
    crop: scan.crop,
    region: scan.region,
    hectares: me?.hectares ?? null,
    treatment_organic: parseJson(scan.treatment_organic_json),
    treatment_chemical: parseJson(scan.treatment_chemical_json),
    prevention: scan.prevention,
    economic: parseJson(scan.economic_json),
    weather: parseJson(scan.weather_window_json),
  };
  return { ctx, scan };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const me = requireJwt(req);
    const { id } = await ctx.params;
    const { ctx: chatCtx } = loadContext(id, me.userId);

    const history = db()
      .prepare(
        'SELECT id, role, content, created_at FROM scan_chats WHERE scan_id = ? ORDER BY created_at ASC',
      )
      .all(id) as ChatRow[];

    return jsonOk({
      messages: history,
      suggestions: defaultSuggestions(chatCtx),
    });
  } catch (e) {
    return jsonError(e);
  }
}

const PostSchema = z.object({ message: z.string().min(1).max(800) });

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const me = requireJwt(req);
    const { id } = await ctx.params;
    const body = PostSchema.parse(await req.json());

    const { ctx: chatCtx } = loadContext(id, me.userId);
    const history = db()
      .prepare(
        'SELECT role, content FROM scan_chats WHERE scan_id = ? ORDER BY created_at ASC',
      )
      .all(id) as { role: 'user' | 'assistant'; content: string }[];

    const reply = await chatTurn(chatCtx, history, body.message);

    const now = new Date().toISOString();
    const userId = uuid();
    const asstId = uuid();
    const insert = db().prepare(
      `INSERT INTO scan_chats (id, scan_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)`,
    );
    const tx = db().transaction(() => {
      insert.run(userId, id, 'user', body.message, now);
      insert.run(asstId, id, 'assistant', reply, new Date(Date.now() + 1).toISOString());
    });
    tx();

    return jsonOk({
      user: { id: userId, role: 'user', content: body.message, created_at: now },
      assistant: { id: asstId, role: 'assistant', content: reply, created_at: new Date(Date.now() + 1).toISOString() },
    });
  } catch (e) {
    return jsonError(e);
  }
}
