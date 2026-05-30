import { Router } from 'express';
import { supabase } from '../services/supabase.js';

export const catalogRouter = Router();

catalogRouter.get('/pests', async (req, res, next) => {
  try {
    let q = supabase()
      .from('pests_catalog')
      .select('id, common_name, scientific_name, affected_crops, treatment_organic, treatment_chemical, prevention')
      .eq('active', true);
    if (req.query.crop) q = q.contains('affected_crops', [String(req.query.crop)]);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ data: { pests: data ?? [] } });
  } catch (e) { next(e); }
});
