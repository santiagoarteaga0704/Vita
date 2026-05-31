import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonError, jsonOk } from '@/lib/server/errors';
import { requireAdmin } from '@/lib/server/guards';
import { db } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ValidateSchema = z.object({
  validation: z.enum(['correct', 'incorrect', 'corrected']),
  corrected_pest_id: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(req);
    const body = ValidateSchema.parse(await req.json());
    const { id } = await ctx.params;

    db()
      .prepare(
        `UPDATE scans SET
           admin_validated = ?,
           admin_corrected_pest_id = ?,
           admin_notes = ?,
           admin_validated_by = ?,
           admin_validated_at = ?
         WHERE id = ?`,
      )
      .run(
        body.validation,
        body.corrected_pest_id ?? null,
        body.notes ?? null,
        admin.id,
        new Date().toISOString(),
        id,
      );

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
