import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { authRouter } from './routes/auth.js';
import { scansRouter } from './routes/scans.js';
import { catalogRouter } from './routes/catalog.js';
import { adminScansRouter } from './routes/admin/scans.js';
import { adminAnalyticsRouter } from './routes/admin/analytics.js';
import { errorHandler } from './middleware/errors.js';

const app = express();

const isDev = config.NODE_ENV === 'development';
const corsOriginCheck = (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return cb(null, true);
  if (isDev && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true);
  const whitelist = ['http://localhost:3000', 'http://localhost:3001', config.WEB_ADMIN_URL].filter(Boolean);
  if (whitelist.includes(origin)) return cb(null, true);
  cb(new Error('CORS not allowed'), false);
};

app.use(helmet());
app.use(cors({ origin: corsOriginCheck, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ data: { ok: true, env: config.NODE_ENV, ts: new Date().toISOString() } });
});

app.use('/auth', authRouter);
app.use('/scans', scansRouter);
app.use('/catalog', catalogRouter);
app.use('/admin/scans', adminScansRouter);
app.use('/admin/analytics', adminAnalyticsRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  logger.info(`AgroScan backend escuchando en :${config.PORT} (${config.NODE_ENV})`);
});
