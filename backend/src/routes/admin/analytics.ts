import { Router } from 'express';
import { authAdmin } from '../../middleware/authAdmin.js';
import { supabase } from '../../services/supabase.js';

export const adminAnalyticsRouter = Router();
adminAnalyticsRouter.use(authAdmin);

adminAnalyticsRouter.get('/', async (_req, res, next) => {
  try {
    const sb = supabase();
    const [totalScans, weekScans, totalUsers, validated] = await Promise.all([
      sb.from('scans').select('id', { count: 'exact', head: true }),
      sb
        .from('scans')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      sb.from('users').select('id', { count: 'exact', head: true }),
      sb.from('scans').select('admin_validated, latency_ms').not('admin_validated', 'is', null),
    ]);

    const validatedRows = validated.data ?? [];
    const correct = validatedRows.filter((r) => r.admin_validated === 'correct').length;
    const precision = validatedRows.length ? (correct / validatedRows.length) * 100 : 0;
    const avgLat = validatedRows.length
      ? validatedRows.reduce((a, r) => a + (r.latency_ms ?? 0), 0) / validatedRows.length
      : 0;

    res.json({
      data: {
        total_scans: totalScans.count ?? 0,
        weekly_scans: weekScans.count ?? 0,
        total_users: totalUsers.count ?? 0,
        ia_precision_pct: Math.round(precision),
        avg_latency_ms: Math.round(avgLat),
      },
    });
  } catch (e) { next(e); }
});
