import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AppError, jsonError, jsonOk } from '@/lib/server/errors';
import { requireJwt } from '@/lib/server/guards';
import { db, uuid, toJson, parseJson } from '@/lib/server/db';
import { identifyPest, PestCatalogEntry } from '@/lib/server/gemini';
import { resizeImage, saveScanImage, publicUrl } from '@/lib/server/storage';
import { getWeatherWindow } from '@/lib/server/weather';
import { computeEconomic } from '@/lib/server/economic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ScanMetaSchema = z.object({
  crop: z.string().min(2),
  gps_lat: z.coerce.number().optional(),
  gps_lng: z.coerce.number().optional(),
  client_id: z.string().optional(),
});

interface PestCatalogRow {
  id: string;
  common_name: string;
  scientific_name: string | null;
  affected_crops: string;       // JSON
  visual_signs: string | null;
  treatment_organic: string | null;   // JSON
  treatment_chemical: string | null;  // JSON
  prevention: string | null;
  weather_risk: string | null;        // JSON
}

export async function POST(req: NextRequest) {
  try {
    const me = requireJwt(req);

    const form = await req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) {
      throw new AppError(400, 'NO_IMAGE', 'image field required');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError(413, 'TOO_LARGE', 'Image exceeds 5MB');
    }

    const meta = ScanMetaSchema.parse({
      crop: form.get('crop'),
      gps_lat: form.get('gps_lat') ?? undefined,
      gps_lng: form.get('gps_lng') ?? undefined,
      client_id: form.get('client_id') ?? undefined,
    });

    const buf = Buffer.from(await file.arrayBuffer());
    const resized = await resizeImage(buf);
    const imagePath = await saveScanImage(me.userId, resized);

    const conn = db();
    const user = conn
      .prepare('SELECT region, hectares FROM users WHERE id = ?')
      .get(me.userId) as { region: string | null; hectares: number | null } | undefined;
    const region = user?.region ?? 'Desconocida';
    const hectares = user?.hectares ?? null;

    const catalogRows = conn
      .prepare(
        `SELECT id, common_name, scientific_name, affected_crops, visual_signs
         FROM pests_catalog WHERE active = 1`,
      )
      .all() as PestCatalogRow[];

    const catalog: PestCatalogEntry[] = catalogRows.map((r) => ({
      id: r.id,
      common_name: r.common_name,
      scientific_name: r.scientific_name,
      affected_crops: parseJson<string[]>(r.affected_crops) ?? [],
      visual_signs: r.visual_signs,
    }));

    const imageBase64 = resized.toString('base64');
    const { result, rawText, latencyMs } = await identifyPest(
      imageBase64,
      'image/jpeg',
      catalog,
      meta.crop,
      region,
    );

    let treatment_organic: unknown = null;
    let treatment_chemical: unknown = null;
    let prevention: string | null = null;
    let pestRow: { common_name: string; scientific_name: string | null } | null = null;
    let weatherRisk: { rain_post_application_warn_hours?: number } | null = null;

    if (result.pest_id) {
      const p = conn
        .prepare(
          `SELECT id, common_name, scientific_name, treatment_organic, treatment_chemical, prevention, weather_risk
           FROM pests_catalog WHERE id = ?`,
        )
        .get(result.pest_id) as (PestCatalogRow & { weather_risk: string | null }) | undefined;
      if (p) {
        pestRow = { common_name: p.common_name, scientific_name: p.scientific_name };
        treatment_organic = parseJson(p.treatment_organic);
        treatment_chemical = parseJson(p.treatment_chemical);
        prevention = p.prevention;
        weatherRisk = parseJson<{ rain_post_application_warn_hours?: number }>(p.weather_risk);
      }
    }

    // ─── Clima + económico (paralelo, no bloquean si fallan) ───
    const [weatherWindow, economic] = await Promise.all([
      getWeatherWindow({
        region,
        gps_lat: meta.gps_lat ?? null,
        gps_lng: meta.gps_lng ?? null,
        rain_warn_hours: weatherRisk?.rain_post_application_warn_hours ?? 24,
      }).catch((e) => {
        console.warn('[scans] weather failed:', e);
        return null;
      }),
      Promise.resolve(
        computeEconomic({
          hectares,
          severity: result.severity,
          crop: meta.crop,
        }),
      ),
    ]);

    const scanId = uuid();
    conn
      .prepare(
        `INSERT INTO scans (
           id, user_id, client_id, image_url,
           detected_pest_id, detected_pest_name, severity, severity_pct, confidence,
           treatment_organic_json, treatment_chemical_json, prevention,
           economic_json, weather_window_json,
           gemini_response_raw, latency_ms,
           gps_lat, gps_lng, region, crop
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        scanId,
        me.userId,
        meta.client_id ?? null,
        imagePath,
        result.pest_id,
        result.pest_name,
        result.severity,
        result.severity_pct,
        result.confidence,
        toJson(treatment_organic),
        toJson(treatment_chemical),
        prevention,
        toJson(economic),
        toJson(weatherWindow),
        toJson({ rawText, parsed: result }),
        latencyMs,
        meta.gps_lat ?? null,
        meta.gps_lng ?? null,
        region,
        meta.crop,
      );

    return jsonOk(
      {
        scan_id: scanId,
        detected_pest: {
          id: result.pest_id,
          common_name: pestRow?.common_name ?? result.pest_name,
          scientific_name: pestRow?.scientific_name ?? null,
          severity: result.severity,
          severity_pct: result.severity_pct,
          confidence: result.confidence,
        },
        treatment_organic,
        treatment_chemical,
        prevention,
        economic,
        weather_window: weatherWindow,
        image_url: publicUrl(imagePath),
        visual_observations: result.visual_observations,
      },
      201,
    );
  } catch (e) {
    return jsonError(e);
  }
}
