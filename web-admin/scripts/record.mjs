/**
 * Vita — Demo video recording (Playwright)
 *
 * Genera demo-assets/scenes/*.webm con todo el recorrido sin audio.
 * Voiceover ElevenLabs se sincroniza después con ffmpeg.
 *
 * Target ~90s a 30fps. waitUntil:'domcontentloaded' para evitar
 * networkidle timeouts en páginas con polling.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCENES_DIR = path.join(__dirname, '..', '..', 'demo-assets', 'scenes');

const BASE = 'http://localhost:3000';

const PRODUCTOR_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZDFkNmE0NS01NzkwLTQ2MWMtYjM3Ni05N2YyYjQzZGU0NmYiLCJlbWFpbCI6ImRlbW9Adml0YS5ibyIsImlhdCI6MTc4MDIyOTE3OCwiZXhwIjoxNzgyODIxMTc4fQ.r3gOyhUeMRUYXr-LXRnYARIfQirxMpUOQmH8nZGjdjU';

const PRODUCTOR_USER = JSON.stringify({
  id: '7d1d6a45-5790-461c-b376-97f2b43de46f',
  email: 'demo@vita.bo',
  name: 'Pedro Mamani',
  region: 'Santa Cruz',
  municipality: 'San Julián',
  crop_main: 'Soya',
  hectares: 12,
  gps_lat: -17.5,
  gps_lng: -62.3,
});

const SCAN_ID = 'a262cf5c-2eed-4783-8ed9-eaa2386088a0';

const ADMIN_COOKIE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NzM0MDU2Zi1mMjc2LTQ0OWUtYTI5NS1mMWJlZWFlODcwMjIiLCJlbWFpbCI6ImFkbWluQHZpdGEuYm8iLCJpYXQiOjE3ODAyMjkxNjgsImV4cCI6MTc4MjgyMTE2OH0.Hi4lwHs4EdyJlOSQwPh75_tqS3jR675Gcm1KQvKjVB0';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function smoothScroll(page, distance, durationMs) {
  const steps = Math.max(20, Math.floor(durationMs / 16));
  const stepDistance = distance / steps;
  const stepDelay = durationMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy(0, d), stepDistance);
    await sleep(stepDelay);
  }
}

async function safeGoto(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (e) {
    console.warn(`[rec] goto ${url} timeout, continuing:`, e.message);
  }
  await sleep(800); // let things settle
}

async function main() {
  console.log('[rec] launching chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: SCENES_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  await context.addCookies([
    {
      name: 'vita_admin',
      value: ADMIN_COOKIE,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  await context.addInitScript(
    ({ token, user }) => {
      try {
        localStorage.setItem('vita_productor', token);
        localStorage.setItem('vita_productor_user', user);
        localStorage.setItem('vita_productor_plan', 'pro');
      } catch (e) {
        console.warn('localStorage seed failed', e);
      }
    },
    { token: PRODUCTOR_TOKEN, user: PRODUCTOR_USER },
  );

  const page = await context.newPage();

  try {
    // SCENE 1 — Hero landing (0–10s)
    console.log('[rec] Scene 1: Hero landing');
    await safeGoto(page, `${BASE}/`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(8500);

    // SCENE 2 — Landing scroll (10–18s)
    console.log('[rec] Scene 2: Landing scroll');
    await smoothScroll(page, 1400, 5500);
    await sleep(1000);

    // SCENE 3 — /precios (18–28s)
    console.log('[rec] Scene 3: Precios');
    await safeGoto(page, `${BASE}/precios`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(2500);
    await smoothScroll(page, 700, 4000);
    await sleep(2500);

    // SCENE 4 — App productor home (28–35s)
    console.log('[rec] Scene 4: App home');
    await safeGoto(page, `${BASE}/app`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(6000);

    // SCENE 5 — Scan page (35–42s)
    console.log('[rec] Scene 5: Scan');
    await safeGoto(page, `${BASE}/app/scan`);
    await sleep(6000);

    // SCENE 6 — Result page top (42–55s)
    console.log('[rec] Scene 6: Result top');
    await safeGoto(page, `${BASE}/app/result/${SCAN_ID}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(6500);
    await smoothScroll(page, 600, 5000);
    await sleep(1500);

    // SCENE 7 — Result middle — económico (55–62s)
    console.log('[rec] Scene 7: Result economic');
    await smoothScroll(page, 500, 4000);
    await sleep(3000);

    // SCENE 8 — Admin dashboard (62–70s)
    console.log('[rec] Scene 8: Admin dashboard');
    await safeGoto(page, `${BASE}/dashboard`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(7500);

    // SCENE 9 — /dashboard/empresas (70–78s)
    console.log('[rec] Scene 9: Empresas');
    await safeGoto(page, `${BASE}/dashboard/empresas`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(7500);

    // SCENE 10 — Precios planes cierre (78–88s)
    console.log('[rec] Scene 10: Cierre precios');
    await safeGoto(page, `${BASE}/precios`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(2500);
    await smoothScroll(page, 600, 5000);
    await sleep(2500);
  } catch (e) {
    console.error('[rec] ERROR during recording:', e);
  } finally {
    console.log('[rec] closing page to flush video...');
    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();
    await browser.close();
    console.log('[rec] video saved at:', videoPath);
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
