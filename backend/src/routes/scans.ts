import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authJwt } from '../middleware/authJwt.js';
import { AppError } from '../middleware/errors.js';
import { supabase } from '../services/supabase.js';
import { identifyPest } from '../services/gemini.js';
import { uploadScanImage, getSignedUrl } from '../services/storage.js';
import { resizeImage } from '../utils/image.js';
import { logger } from '../utils/logger.js';

export const scansRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const ScanMetaSchema = z.object({
  crop: z.string().min(2),
  gps_lat: z.coerce.number().optional(),
  gps_lng: z.coerce.number().optional(),
  client_id: z.string().optional(),
});

scansRouter.post('/', authJwt, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'NO_IMAGE', 'image field required');
    const meta = ScanMetaSchema.parse(req.body);
    const userId = req.user!.userId;

    const resized = await resizeImage(req.file.buffer);
    const imagePath = await uploadScanImage(userId, resized);

    const [{ data: user }, { data: catalog }] = await Promise.all([
      supabase().from('users').select('region').eq('id', userId).single(),
      supabase()
        .from('pests_catalog')
        .select('id, common_name, scientific_name, affected_crops, visual_signs')
        .eq('active', true),
    ]);
    const region = user?.region ?? 'Desconocida';

    const imageBase64 = resized.toString('base64');
    const { result, rawText, latencyMs } = await identifyPest(
      imageBase64,
      'image/jpeg',
      catalog ?? [],
      meta.crop,
      region,
    );

    let treatment_organic: unknown = null;
    let treatment_chemical: unknown = null;
    let prevention: string | null = null;
    let pestRow: { common_name?: string; scientific_name?: string | null } | null = null;

    if (result.pest_id) {
      const { data: p } = await supabase()
        .from('pests_catalog')
        .select('id, common_name, scientific_name, treatment_organic, treatment_chemical, prevention')
        .eq('id', result.pest_id)
        .single();
      if (p) {
        pestRow = p;
        treatment_organic = p.treatment_organic;
        treatment_chemical = p.treatment_chemical;
        prevention = p.prevention;
      }
    }

    const { data: scan, error } = await supabase()
      .from('scans')
      .insert({
        user_id: userId,
        client_id: meta.client_id,
        image_url: imagePath,
        detected_pest_id: result.pest_id,
        detected_pest_name: result.pest_name,
        severity: result.severity,
        severity_pct: result.severity_pct,
        confidence: result.confidence,
        treatment_organic_json: treatment_organic,
        treatment_chemical_json: treatment_chemical,
        prevention,
        gemini_response_raw: { rawText, parsed: result },
        latency_ms: latencyMs,
        gps_lat: meta.gps_lat,
        gps_lng: meta.gps_lng,
        region,
        crop: meta.crop,
      })
      .select('*')
      .single();

    if (error) {
      logger.error({ error }, 'Failed to persist scan');
      throw new AppError(500, 'DB_ERROR', 'Could not save scan');
    }

    const signedUrl = await getSignedUrl(imagePath);
    res.status(201).json({
      data: {
        scan_id: scan.id,
        detected_pest: {
          id: scan.detected_pest_id,
          common_name: pestRow?.common_name ?? result.pest_name,
          scientific_name: pestRow?.scientific_name ?? null,
          severity: scan.severity,
          severity_pct: scan.severity_pct,
          confidence: scan.confidence,
        },
        treatment_organic: scan.treatment_organic_json,
        treatment_chemical: scan.treatment_chemical_json,
        prevention: scan.prevention,
        image_url: signedUrl,
        visual_observations: result.visual_observations,
      },
    });
  } catch (e) { next(e); }
});

scansRouter.get('/me', authJwt, async (req, res, next) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10), 50);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase()
      .from('scans')
      .select('id, image_url, detected_pest_name, severity, severity_pct, confidence, crop, created_at', {
        count: 'exact',
      })
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    const scansWithUrls = await Promise.all(
      (data ?? []).map(async (s) => ({ ...s, image_url: await getSignedUrl(s.image_url) })),
    );
    res.json({ data: { scans: scansWithUrls, total: count ?? 0, page } });
  } catch (e) { next(e); }
});

scansRouter.get('/:id', authJwt, async (req, res, next) => {
  try {
    const { data, error } = await supabase()
      .from('scans')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.userId)
      .single();
    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Scan not found');
    const signedUrl = await getSignedUrl(data.image_url);
    res.json({ data: { scan: { ...data, image_url: signedUrl } } });
  } catch (e) { next(e); }
});
