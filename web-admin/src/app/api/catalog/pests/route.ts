import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/server/errors';
import { db, parseJson } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PestRow {
  id: string;
  common_name: string;
  scientific_name: string | null;
  affected_crops: string;
  treatment_organic: string | null;
  treatment_chemical: string | null;
  prevention: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const crop = searchParams.get('crop');

    const rows = db()
      .prepare(
        `SELECT id, common_name, scientific_name, affected_crops,
                treatment_organic, treatment_chemical, prevention
         FROM pests_catalog WHERE active = 1`,
      )
      .all() as PestRow[];

    const pests = rows
      .map((r) => ({
        ...r,
        affected_crops: parseJson<string[]>(r.affected_crops) ?? [],
        treatment_organic: parseJson(r.treatment_organic),
        treatment_chemical: parseJson(r.treatment_chemical),
      }))
      .filter((p) => !crop || p.affected_crops.includes(crop));

    return jsonOk({ pests });
  } catch (e) {
    return jsonError(e);
  }
}
