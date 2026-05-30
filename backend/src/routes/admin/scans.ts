import { Router } from 'express';
import { z } from 'zod';
import { authAdmin } from '../../middleware/authAdmin.js';
import { AppError } from '../../middleware/errors.js';
import { supabase } from '../../services/supabase.js';
import { getSignedUrl } from '../../services/storage.js';

export const adminScansRouter = Router();
adminScansRouter.use(authAdmin);

adminScansRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10), 100);
    const offset = (page - 1) * limit;

    let q = supabase()
      .from('scans')
      .select(
        'id, image_url, detected_pest_name, severity, severity_pct, confidence, crop, region, admin_validated, created_at, users!inner(name, region)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.status === 'pending') q = q.is('admin_validated', null);
    if (req.query.status === 'validated') q = q.not('admin_validated', 'is', null);
    if (req.query.region) q = q.eq('region', String(req.query.region));
    if (req.query.pest) q = q.eq('detected_pest_id', String(req.query.pest));

    const { data, error, count } = await q;
    if (error) throw error;
    res.json({ data: { scans: data ?? [], total: count ?? 0, page } });
  } catch (e) { next(e); }
});

adminScansRouter.get('/geo', async (_req, res, next) => {
  try {
    const { data, error } = await supabase()
      .from('scans')
      .select('gps_lat, gps_lng, detected_pest_name, severity, crop')
      .not('gps_lat', 'is', null);
    if (error) throw error;
    res.json({ data: { points: data ?? [] } });
  } catch (e) { next(e); }
});

adminScansRouter.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase()
      .from('scans')
      .select('*, users(name, email, region, crop_main)')
      .eq('id', req.params.id)
      .single();
    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Scan not found');
    const signedUrl = await getSignedUrl(data.image_url);
    res.json({ data: { scan: { ...data, image_url: signedUrl } } });
  } catch (e) { next(e); }
});

const ValidateSchema = z.object({
  validation: z.enum(['correct', 'incorrect', 'corrected']),
  corrected_pest_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

adminScansRouter.post('/:id/validate', async (req, res, next) => {
  try {
    const body = ValidateSchema.parse(req.body);
    const adminId = req.admin!.id;
    const { error } = await supabase()
      .from('scans')
      .update({
        admin_validated: body.validation,
        admin_corrected_pest_id: body.corrected_pest_id ?? null,
        admin_notes: body.notes ?? null,
        admin_validated_by: adminId,
        admin_validated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});
