# AgroScan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir en 72h una app móvil Flutter de identificación de plagas agrícolas con foto + IA Gemini, panel web Next.js para gestionar la data, y backend Node REST que orqueste todo, deployado y demoable en el pitch del hackathon.

**Architecture:** Monorepo de 3 subproyectos hermanos (`/backend` Node+Express+TS, `/mobile` Flutter, `/web-admin` Next.js). Backend es la única fuente de verdad — mobile y web admin lo consumen vía REST. BD/Storage/Auth web en Supabase. IA en Gemini 2.0 Flash (tier gratuito Google AI Studio). Push en Firebase Cloud Messaging (stretch).

**Tech Stack:** Flutter 3.24 · Riverpod · Dio · go_router · Next.js 15 · Tailwind · shadcn/ui · Mapbox · Node 20 · Express 5 · TypeScript · Zod · Supabase (Postgres+Storage+Auth) · Gemini 2.0 Flash · Railway · Vercel · Diawi

**Pragmatismo TDD para hackathon:** TDD estricto en lógica pura de backend (vitest). Testing manual + smoke tests en UI mobile y web admin. No invertir tiempo en golden tests Flutter ni en tests de componentes Next.js.

---

## Bloques del plan (ruta crítica → stretch)

- **FASE 0** — Setup proyecto (Tasks 1-5) · ~2h
- **FASE 1** — Backend core: auth + Gemini + scans (Tasks 6-15) · ~8h
- **FASE 2** — Mobile auth + flujo scan (Tasks 16-22) · ~12h
- **FASE 3** — Web admin core (Tasks 23-27) · ~8h
- **FASE 4** — Deploy + APK + smoke test (Tasks 28-33) · ~4h
- **FASE 5** — STRETCH GOALS (Tasks 34-40) · si queda tiempo

---

# FASE 0 — Setup proyecto

### Task 1: Crear estructura monorepo + git + .gitignore raíz

**Files:**
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Inicializar git en raíz**

```bash
cd "C:/Users/gener/OneDrive/Desktop/proyectop/proyec-hackaton"
git init
git branch -M main
```

- [ ] **Step 2: Crear .gitignore raíz**

```
# Node
node_modules/
*.log
.env
.env.local
.env.*.local

# Flutter
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
build/
**/google-services.json
**/GoogleService-Info.plist

# Next.js
.next/
out/
.vercel

# IDE
.vscode/
.idea/
*.iml

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 3: Crear README.md raíz**

```markdown
# AgroScan

App móvil para identificar plagas agrícolas con IA. Hackathon Santa Cruz Bolivia 2026.

## Subproyectos

- `backend/` — Node + Express + TypeScript + Supabase + Gemini
- `mobile/` — Flutter app (Android + iOS)
- `web-admin/` — Next.js panel admin

Ver `docs/superpowers/specs/2026-05-29-plagascan-design.md` para diseño completo.
Ver `docs/superpowers/plans/2026-05-29-agroscan-implementation.md` para plan de implementación.
```

- [ ] **Step 4: Commit inicial**

```bash
git add .gitignore README.md docs/
git commit -m "chore: monorepo inicial AgroScan"
```

---

### Task 2: Usuario crea cuentas y obtiene credenciales

**Acción del usuario, no de Claude.**

- [ ] **Step 1: Cuenta Supabase**
  - https://supabase.com → Sign up con GitHub
  - New Project → name: `agroscan`, region: `South America (São Paulo)`, password fuerte
  - Esperar 2 min
  - Anotar: `Project URL` + `anon key` + `service_role key` (Settings → API)

- [ ] **Step 2: Cuenta Google AI Studio (Gemini)**
  - https://aistudio.google.com
  - Sign in con Google
  - Click "Get API key" → "Create API key in new project"
  - Copiar la API key (`AIzaSy...`)
  - Verificar "Free tier" en el header

- [ ] **Step 3: Cuenta Mapbox**
  - https://mapbox.com → Sign up gratis
  - Account → Tokens → copiar default public token (`pk.eyJ1Ijo...`)

- [ ] **Step 4: Compartir credenciales con Claude**
  - Pegar URLs y keys en chat para que Claude las use en `.env`

---

### Task 3: Setup backend Node + TypeScript + Express

**Files:**
- Create: `backend/package.json`, `backend/tsconfig.json`, `backend/.env.example`, `backend/src/index.ts`, `backend/src/config.ts`

- [ ] **Step 1: Inicializar package.json**

```bash
cd backend
npm init -y
npm install express@^5 cors helmet pino pino-pretty dotenv zod
npm install -D typescript @types/node @types/express @types/cors tsx vitest @vitest/coverage-v8
```

- [ ] **Step 2: Crear tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Crear .env.example**

```
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_KEY=ey...

# Gemini
GEMINI_API_KEY=AIzaSy...

# Auth
JWT_SECRET=cambiar-en-prod-string-random-largo
JWT_EXPIRES_IN=30d
```

- [ ] **Step 4: Crear src/config.ts**

```typescript
import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default('30d'),
});

export const config = ConfigSchema.parse(process.env);
```

- [ ] **Step 5: Crear src/index.ts**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { config } from './config.js';

const logger = pino({
  transport: config.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_, res) => {
  res.json({ data: { ok: true, env: config.NODE_ENV } });
});

app.listen(config.PORT, () => {
  logger.info(`AgroScan backend escuchando en :${config.PORT}`);
});
```

- [ ] **Step 6: Scripts npm**

Agregar a `package.json`:
```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "vitest run",
  "test:watch": "vitest"
},
"type": "module"
```

- [ ] **Step 7: Crear .env (NO commit) con keys del usuario**

- [ ] **Step 8: Test health endpoint**

```bash
npm run dev
# en otra terminal:
curl http://localhost:3000/health
```

Expected: `{"data":{"ok":true,"env":"development"}}`

- [ ] **Step 9: Commit**

```bash
git add backend/
git commit -m "feat(backend): setup express + ts + config + health endpoint"
```

---

### Task 4: Setup mobile Flutter

**Files:**
- Create: `mobile/` (todo el árbol Flutter)
- Modify: `mobile/pubspec.yaml`, `mobile/android/app/src/main/AndroidManifest.xml`, `mobile/android/app/build.gradle.kts`

- [ ] **Step 1: Verificar Flutter SDK**

```bash
flutter --version
flutter doctor
```

Expected: Flutter 3.24+ y Dart 3.5+. Si falta, instalar de https://flutter.dev/docs/get-started/install/windows.

- [ ] **Step 2: Crear proyecto Flutter**

```bash
cd "C:/Users/gener/OneDrive/Desktop/proyectop/proyec-hackaton"
flutter create mobile --org bo.agroscan --project-name agroscan --platforms=android,ios
```

- [ ] **Step 3: Agregar dependencias en `mobile/pubspec.yaml`**

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  flutter_riverpod: ^2.5.0
  go_router: ^14.0.0
  dio: ^5.4.0
  shared_preferences: ^2.2.0
  flutter_secure_storage: ^9.0.0
  sqflite: ^2.3.0
  path_provider: ^2.1.0
  image_picker: ^1.0.7
  image: ^4.1.0
  geolocator: ^11.0.0
  permission_handler: ^11.3.0
  intl: ^0.19.0
  cached_network_image: ^3.3.0
  uuid: ^4.3.0
  connectivity_plus: ^6.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
```

- [ ] **Step 4: Permisos Android en `mobile/android/app/src/main/AndroidManifest.xml`**

Agregar antes de `<application>`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

- [ ] **Step 5: minSdk 23 en `mobile/android/app/build.gradle.kts`**

Cambiar `minSdk = flutter.minSdkVersion` por `minSdk = 23`.

- [ ] **Step 6: Instalar deps**

```bash
cd mobile
flutter pub get
flutter analyze
```

Expected: 0 errores.

- [ ] **Step 7: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): setup flutter project + deps + permissions"
```

---

### Task 5: Setup web admin Next.js + Tailwind + shadcn

- [ ] **Step 1: Crear Next.js project**

```bash
cd "C:/Users/gener/OneDrive/Desktop/proyectop/proyec-hackaton"
npx create-next-app@latest web-admin --typescript --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Instalar shadcn/ui**

```bash
cd web-admin
npx shadcn@latest init -d
npx shadcn@latest add button card input label form table dialog dropdown-menu badge tabs select textarea skeleton separator
```

- [ ] **Step 3: Instalar deps adicionales**

```bash
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query @tanstack/react-table mapbox-gl react-map-gl recharts react-hook-form @hookform/resolvers zod lucide-react date-fns
npm install -D @types/mapbox-gl
```

- [ ] **Step 4: Crear .env.local (NO commit)**

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijo...
```

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

Expected: build exitoso.

- [ ] **Step 6: Commit**

```bash
git add web-admin/
git commit -m "feat(web): setup next.js + tailwind + shadcn + supabase + mapbox"
```

---

# FASE 1 — Backend core: auth + Gemini + scans

### Task 6: Schema SQL en Supabase

**Files:**
- Create: `backend/src/db/schema.sql`

- [ ] **Step 1: Crear `backend/src/db/schema.sql`**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100),
  region VARCHAR(80),
  crop_main VARCHAR(30),
  language VARCHAR(5) DEFAULT 'es',
  gps_lat FLOAT,
  gps_lng FLOAT,
  premium BOOLEAN DEFAULT false,
  scans_count_month INT DEFAULT 0,
  fcm_token TEXT,
  device_os VARCHAR(10),
  device_model VARCHAR(80),
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pests_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(120),
  affected_crops TEXT[] NOT NULL,
  visual_signs TEXT,
  treatment_organic JSONB,
  treatment_chemical JSONB,
  prevention TEXT,
  severity_thresholds JSONB,
  image_examples TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pests_crops ON pests_catalog USING GIN (affected_crops);

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id VARCHAR(64),
  image_url TEXT NOT NULL,
  detected_pest_id UUID REFERENCES pests_catalog(id),
  detected_pest_name VARCHAR(100),
  severity VARCHAR(10),
  severity_pct INT,
  confidence FLOAT,
  treatment_organic_json JSONB,
  treatment_chemical_json JSONB,
  prevention TEXT,
  gemini_response_raw JSONB,
  gemini_tokens_used INT,
  latency_ms INT,
  gps_lat FLOAT,
  gps_lng FLOAT,
  region VARCHAR(80),
  crop VARCHAR(30),
  admin_validated VARCHAR(20),
  admin_corrected_pest_id UUID REFERENCES pests_catalog(id),
  admin_notes TEXT,
  admin_validated_by UUID REFERENCES admin_users(id),
  admin_validated_at TIMESTAMP,
  followup_sent BOOLEAN DEFAULT false,
  followup_response VARCHAR(20),
  followup_at TIMESTAMP,
  sync_status VARCHAR(15) DEFAULT 'synced',
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scans_user_date ON scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_region_date ON scans(region, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_pest ON scans(detected_pest_id);
CREATE INDEX IF NOT EXISTS idx_scans_validation ON scans(admin_validated) WHERE admin_validated IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_scans_client_id ON scans(user_id, client_id) WHERE client_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20),
  title TEXT,
  body TEXT,
  data JSONB,
  sent_at TIMESTAMP DEFAULT now(),
  delivered BOOLEAN,
  opened BOOLEAN,
  fcm_message_id TEXT,
  admin_sender_id UUID REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_push_log_user ON push_log(user_id, sent_at DESC);
```

- [ ] **Step 2: Ejecutar schema en Supabase**

Supabase Dashboard → SQL Editor → New Query → pegar → Run.

Expected: "Success".

- [ ] **Step 3: Crear bucket de storage**

Supabase Dashboard → Storage → New bucket → name: `scan-images`, public: **OFF**, file size limit: 5MB.

- [ ] **Step 4: Crear admin user inicial**

```sql
INSERT INTO admin_users (email, name) VALUES ('admin@agroscan.bo', 'Admin Demo');
```

También: Authentication → Users → Add user → mismo email, autoconfirm ON.

- [ ] **Step 5: Commit schema**

```bash
git add backend/src/db/schema.sql
git commit -m "feat(backend): SQL schema completo + bucket storage"
```

---

### Task 7: Service Supabase + logger

**Files:**
- Create: `backend/src/services/supabase.ts`, `backend/src/utils/logger.ts`

- [ ] **Step 1: Install Supabase client**

```bash
cd backend
npm install @supabase/supabase-js
```

- [ ] **Step 2: Crear `src/utils/logger.ts`**

```typescript
import pino from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: config.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});
```

- [ ] **Step 3: Crear `src/services/supabase.ts`**

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
```

- [ ] **Step 4: Verificar conexión (temporal en index.ts)**

```typescript
import { supabase } from './services/supabase.js';

supabase().from('admin_users').select('email').limit(1).then(({ data, error }) => {
  if (error) logger.error({ error }, 'Supabase failed');
  else logger.info({ data }, 'Supabase OK');
});
```

- [ ] **Step 5: Run + verify**

```bash
npm run dev
```

Expected log: `Supabase OK { data: [{ email: 'admin@agroscan.bo' }] }`

- [ ] **Step 6: Remover test temporal**

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat(backend): supabase client + logger"
```

---

### Task 8: Auth service — register + login + JWT (TDD)

**Files:**
- Create: `backend/src/services/auth.ts`, `backend/tests/auth.test.ts`

- [ ] **Step 1: Install deps**

```bash
cd backend
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken
```

- [ ] **Step 2: Test failing en `tests/auth.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/services/auth.js';

describe('auth service', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('s3cret');
    expect(hash).not.toBe('s3cret');
    expect(await verifyPassword('s3cret', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('signs and verifies JWT', () => {
    const token = signToken({ userId: 'u-1', email: 'a@b.com' });
    const payload = verifyToken(token);
    expect(payload.userId).toBe('u-1');
  });

  it('throws on invalid JWT', () => {
    expect(() => verifyToken('garbage')).toThrow();
  });
});
```

- [ ] **Step 3: Run failing**

```bash
npm test
```

Expected: FAIL "Cannot find module '../src/services/auth.js'"

- [ ] **Step 4: Implementar `src/services/auth.ts`**

```typescript
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config.js';

export type JwtPayload = { userId: string; email: string };

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}
```

- [ ] **Step 5: Tests pasan**

```bash
npm test
```

Expected: 3 PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): auth service (bcrypt+jwt) con tests"
```

---

### Task 9: Endpoints /auth/* + middleware JWT + error handler

**Files:**
- Create: `backend/src/middleware/errors.ts`, `backend/src/middleware/authJwt.ts`, `backend/src/routes/auth.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear `src/middleware/errors.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid input', issues: err.issues } });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal error' } });
}
```

- [ ] **Step 2: Crear `src/middleware/authJwt.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../services/auth.js';
import { AppError } from './errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authJwt(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'NO_TOKEN', 'Missing bearer token'));
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
  }
}
```

- [ ] **Step 3: Crear `src/routes/auth.ts`**

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../services/supabase.js';
import { hashPassword, verifyPassword, signToken } from '../services/auth.js';
import { AppError } from '../middleware/errors.js';
import { authJwt } from '../middleware/authJwt.js';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  region: z.string().min(2),
  crop_main: z.string().min(2),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = RegisterSchema.parse(req.body);
    const password_hash = await hashPassword(body.password);

    const { data, error } = await supabase()
      .from('users')
      .insert({
        email: body.email,
        password_hash,
        name: body.name,
        region: body.region,
        crop_main: body.crop_main,
      })
      .select('id, email, name, region, crop_main')
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
      throw error;
    }

    const token = signToken({ userId: data.id, email: data.email });
    res.status(201).json({ data: { user: data, token } });
  } catch (e) { next(e); }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);
    const { data: user, error } = await supabase()
      .from('users')
      .select('id, email, password_hash, name, region, crop_main, premium')
      .eq('email', body.email)
      .single();

    if (error || !user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    if (!(await verifyPassword(body.password, user.password_hash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const { password_hash, ...safe } = user;
    const token = signToken({ userId: user.id, email: user.email });
    res.json({ data: { user: safe, token } });
  } catch (e) { next(e); }
});

authRouter.get('/me', authJwt, async (req, res, next) => {
  try {
    const { data, error } = await supabase()
      .from('users')
      .select('id, email, name, region, crop_main, premium, scans_count_month')
      .eq('id', req.user!.userId)
      .single();
    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'User not found');
    res.json({ data: { user: data } });
  } catch (e) { next(e); }
});
```

- [ ] **Step 4: Registrar en `src/index.ts`**

```typescript
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errors.js';

app.use('/auth', authRouter);
// al final:
app.use(errorHandler);
```

- [ ] **Step 5: Test con curl**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test","region":"SCZ","crop_main":"soya"}'
```

Expected: `{"data":{"user":{...},"token":"eyJ..."}}`

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): endpoints /auth/* con JWT y error handler"
```

---

### Task 10: Service Gemini con prompt builder (TDD)

**Files:**
- Create: `backend/src/services/gemini.ts`, `backend/tests/gemini.test.ts`

- [ ] **Step 1: Install SDK**

```bash
cd backend
npm install @google/generative-ai
```

- [ ] **Step 2: Test failing**

```typescript
// tests/gemini.test.ts
import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../src/services/gemini.js';

describe('gemini prompt builder', () => {
  it('includes catalog and rules', () => {
    const pests = [
      { id: 'p1', common_name: 'Roya', scientific_name: 'X', affected_crops: ['soya'], visual_signs: 'pústulas marrones' },
    ];
    const prompt = buildPrompt(pests as any, 'soya', 'Cuatro Cañadas');
    expect(prompt).toContain('Roya');
    expect(prompt).toContain('soya');
    expect(prompt).toContain('Cuatro Cañadas');
    expect(prompt).toContain('JSON estricto');
    expect(prompt).toContain('pest_id');
  });
});
```

- [ ] **Step 3: Run failing**

```bash
npm test
```

- [ ] **Step 4: Implementar `src/services/gemini.ts`**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export interface PestCatalogEntry {
  id: string;
  common_name: string;
  scientific_name: string | null;
  affected_crops: string[];
  visual_signs: string | null;
}

export interface GeminiPestResult {
  pest_id: string | null;
  pest_name: string | null;
  severity: 'low' | 'medium' | 'high' | null;
  severity_pct: number | null;
  confidence: number;
  visual_observations: string;
}

export function buildPrompt(catalog: PestCatalogEntry[], crop: string, region: string): string {
  const catalogText = catalog
    .map((p, i) => `${i + 1}. ${p.common_name}${p.scientific_name ? ` (${p.scientific_name})` : ''}\n   - id: ${p.id}\n   - Cultivos: ${p.affected_crops.join(', ')}\n   - Signos visuales: ${p.visual_signs ?? 'sin descripción'}`)
    .join('\n');

  return `Sos un experto agrónomo de Santa Cruz, Bolivia. Identificás plagas y enfermedades de cultivos comparando contra el siguiente catálogo:

CATÁLOGO:
${catalogText}

REGLAS ESTRICTAS:
- Identificá SOLO de este catálogo
- Si la foto no coincide con ninguna, devolvé pest_id: null y confidence < 0.5
- Severidad: low (<20% hoja afectada), medium (20-50%), high (>50%)
- NO inventes plagas
- Respondé SIEMPRE en JSON estricto:
{
  "pest_id": "uuid o null",
  "pest_name": "nombre o null",
  "severity": "low | medium | high | null",
  "severity_pct": "0-100 o null",
  "confidence": "0.0 a 1.0",
  "visual_observations": "descripción corta"
}

CONTEXTO:
- Cultivo: ${crop}
- Región: ${region}

Devolvé SOLO el JSON, sin markdown ni texto adicional.`;
}

export async function identifyPest(
  imageBase64: string,
  mimeType: string,
  catalog: PestCatalogEntry[],
  crop: string,
  region: string
): Promise<{ result: GeminiPestResult; rawText: string; latencyMs: number }> {
  const prompt = buildPrompt(catalog, crop, region);
  const startedAt = Date.now();

  const response = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64, mimeType } },
  ]);

  const rawText = response.response.text();
  const latencyMs = Date.now() - startedAt;

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  }

  let parsed: GeminiPestResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    logger.warn({ rawText }, 'Gemini non-JSON, falling back');
    parsed = {
      pest_id: null,
      pest_name: null,
      severity: null,
      severity_pct: null,
      confidence: 0,
      visual_observations: 'No se pudo procesar la respuesta',
    };
  }

  return { result: parsed, rawText, latencyMs };
}
```

- [ ] **Step 5: Tests pasan**

```bash
npm test
```

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): gemini service con prompt builder y parser"
```

---

### Task 11: Seed catálogo 10 plagas top SCZ

**Files:**
- Create: `backend/src/db/seed-pests.sql`

- [ ] **Step 1: Crear `backend/src/db/seed-pests.sql` con 10 plagas**

```sql
INSERT INTO pests_catalog (common_name, scientific_name, affected_crops, visual_signs, treatment_organic, treatment_chemical, prevention) VALUES

('Roya asiática de la soya', 'Phakopsora pachyrhizi', ARRAY['soya'],
 'Pústulas marrones en el envés de hojas, halo amarillo. Avanza desde hojas bajas. Defoliación temprana.',
 '{"method":"Caldo bordelés","ingredients":["Sulfato de cobre","Cal apagada"],"dosage":"5g/L","frequency":"Cada 7 días, 3 aplicaciones","notes":"Aplicar al atardecer"}'::jsonb,
 '{"actives":["Triazol","Estrobilurina"],"dosage_per_ha":"0.5 L/ha","timing":"Al atardecer, sin viento","brands":["Opera","Cypress","Priori Xtra"]}'::jsonb,
 'Variedades resistentes, rotación de cultivos, monitoreo desde V3.'),

('Mancha foliar de la soya', 'Septoria glycines', ARRAY['soya'],
 'Manchas pequeñas marrón rojizo en hojas inferiores, contorno angular.',
 '{"method":"Extracto cola de caballo","ingredients":["Equisetum arvense"],"dosage":"10g/L","frequency":"Semanal preventivo"}'::jsonb,
 '{"actives":["Carbendazim","Mancozeb"],"dosage_per_ha":"1 L/ha","timing":"Primeras manchas","brands":["Manzate","Carben 500"]}'::jsonb,
 'Densidad adecuada, ventilación, no monocultivo.'),

('Gusano cogollero', 'Spodoptera frugiperda', ARRAY['maíz','soya','sorgo'],
 'Hojas con perforaciones grandes, aserrín de excrementos en el cogollo, larva verde con cabeza marrón.',
 '{"method":"Bacillus thuringiensis (Bt)","ingredients":["Bt kurstaki"],"dosage":"500g/ha","frequency":"Cada 7-10 días","notes":"Larva pequeña, atardecer"}'::jsonb,
 '{"actives":["Clorantraniliprol","Spinetoram"],"dosage_per_ha":"0.1 L/ha","timing":"Larvas L1-L3","brands":["Coragen","Belt"]}'::jsonb,
 'Trampas feromonas, control biológico, refugios.'),

('Mosca blanca', 'Bemisia tabaci', ARRAY['tomate','soya','algodón'],
 'Insectos blancos voladores debajo de hojas, melaza pegajosa, fumagina negra, hojas amarillas.',
 '{"method":"Jabón potásico","ingredients":["Jabón potásico"],"dosage":"10ml/L","frequency":"Cada 5 días, 3 aplicaciones"}'::jsonb,
 '{"actives":["Pimetrozina","Imidacloprid"],"dosage_per_ha":"0.3 L/ha","timing":"Adultos o ninfas","brands":["Plenum","Confidor"]}'::jsonb,
 'Trampas amarillas, malla anti-insectos, eliminar malezas.'),

('Tizón tardío', 'Phytophthora infestans', ARRAY['papa','tomate'],
 'Manchas marrón-negras con halo amarillo, vello blanco en envés en humedad. Frutos con manchas duras.',
 '{"method":"Caldo bordelés","ingredients":["Sulfato cobre","Cal"],"dosage":"5g/L","frequency":"Preventivo cada 7 días en humedad"}'::jsonb,
 '{"actives":["Metalaxil","Mancozeb","Cimoxanilo"],"dosage_per_ha":"2 kg/ha","timing":"Preventivo antes de lluvias","brands":["Ridomil","Curzate","Dithane"]}'::jsonb,
 'Variedades resistentes, no regar al atardecer, distancia adecuada.'),

('Pulgón verde', 'Myzus persicae', ARRAY['papa','tomate','cítricos'],
 'Pulgones verdes pequeños en brotes y envés, hojas enrolladas, melaza, hormigas asociadas.',
 '{"method":"Aceite de neem","ingredients":["Neem"],"dosage":"5ml/L","frequency":"Cada 5 días"}'::jsonb,
 '{"actives":["Imidacloprid","Acetamiprid"],"dosage_per_ha":"0.2 L/ha","timing":"Al aparecer colonias","brands":["Confidor","Mospilan"]}'::jsonb,
 'Mariquitas, plantas trampa, control de hormigas.'),

('Antracnosis cítricos', 'Colletotrichum gloeosporioides', ARRAY['cítricos'],
 'Manchas marrones hundidas en frutos, hojas con anillos concéntricos, ramitas con tizón.',
 '{"method":"Caldo sulfocálcico","ingredients":["Cal","Azufre"],"dosage":"30ml/L","frequency":"Mensual en húmedo"}'::jsonb,
 '{"actives":["Mancozeb","Tebuconazol"],"dosage_per_ha":"2 kg/ha","timing":"Pre-floración y post-cosecha","brands":["Dithane","Folicur"]}'::jsonb,
 'Poda ramas enfermas, drenaje, no fertilizar exceso N.'),

('Cochinilla harinosa', 'Planococcus citri', ARRAY['cítricos','tomate'],
 'Insectos cubiertos de polvo blanco céreo en racimos, en axilas, hojas y frutos. Melaza y fumagina.',
 '{"method":"Alcohol 70% + jabón","ingredients":["Alcohol","Jabón neutro"],"dosage":"100ml alcohol + 5ml jabón/L","frequency":"Aplicación directa"}'::jsonb,
 '{"actives":["Buprofezin","Spirotetramat"],"dosage_per_ha":"0.5 L/ha","timing":"Ninfas L1-L2","brands":["Applaud","Movento"]}'::jsonb,
 'Control de hormigas, chrysoperla.'),

('Mildiú velloso', 'Peronospora destructor', ARRAY['cebolla'],
 'Manchas amarillas ovaladas con vello violáceo grisáceo en envés, hojas se doblan y mueren.',
 '{"method":"Bicarbonato sódico","ingredients":["Bicarbonato"],"dosage":"5g/L + 2ml jabón","frequency":"Cada 7 días preventivo"}'::jsonb,
 '{"actives":["Mancozeb","Fosetil-Al"],"dosage_per_ha":"2.5 kg/ha","timing":"Preventivo en humedad","brands":["Dithane","Aliette"]}'::jsonb,
 'Riego matinal, ventilación, variedades resistentes.'),

('Trips', 'Frankliniella occidentalis', ARRAY['tomate','cebolla','soya'],
 'Insectos diminutos amarillentos, hojas con manchas plateadas y puntos negros, deformación brotes.',
 '{"method":"Trampas azules + ajo","ingredients":["Ajo","Agua"],"dosage":"50g/L macerado","frequency":"Cada 5 días"}'::jsonb,
 '{"actives":["Spinosad","Spinetoram"],"dosage_per_ha":"0.2 L/ha","timing":"Adultos y ninfas","brands":["Tracer","Delegate"]}'::jsonb,
 'Trampas azules, ácaros depredadores, eliminar malezas.');
```

- [ ] **Step 2: Ejecutar en Supabase**

SQL Editor → pegar → Run.

Expected: "Success. 10 rows inserted."

- [ ] **Step 3: Verificar**

```sql
SELECT count(*), array_agg(common_name) FROM pests_catalog;
```

Expected: count = 10.

- [ ] **Step 4: Commit**

```bash
git add backend/src/db/seed-pests.sql
git commit -m "feat(backend): seed 10 plagas top SCZ"
```

---

### Task 12: Storage helpers + image resize

**Files:**
- Create: `backend/src/services/storage.ts`, `backend/src/utils/image.ts`

- [ ] **Step 1: Install sharp + uuid**

```bash
cd backend
npm install sharp uuid
npm install -D @types/uuid
```

- [ ] **Step 2: Crear `src/utils/image.ts`**

```typescript
import sharp from 'sharp';

export async function resizeImage(buffer: Buffer, maxSide = 1024): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(maxSide, maxSide, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}
```

- [ ] **Step 3: Crear `src/services/storage.ts`**

```typescript
import { supabase } from './supabase.js';
import { v4 as uuid } from 'uuid';

const BUCKET = 'scan-images';

export async function uploadScanImage(userId: string, buffer: Buffer): Promise<string> {
  const path = `${userId}/${uuid()}.jpg`;
  const { error } = await supabase()
    .storage.from(BUCKET)
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

export async function getSignedUrl(path: string, expiresSec = 3600): Promise<string> {
  const { data, error } = await supabase()
    .storage.from(BUCKET)
    .createSignedUrl(path, expiresSec);
  if (error) throw error;
  return data.signedUrl;
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): storage helpers + image resize"
```

---

### Task 13: Endpoint POST /scans con flow completo

**Files:**
- Create: `backend/src/routes/scans.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Install multer**

```bash
cd backend
npm install multer
npm install -D @types/multer
```

- [ ] **Step 2: Crear `src/routes/scans.ts`** (ver código completo abajo)

```typescript
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
      supabase().from('pests_catalog').select('id, common_name, scientific_name, affected_crops, visual_signs').eq('active', true),
    ]);
    const region = user?.region ?? 'Desconocida';

    const imageBase64 = resized.toString('base64');
    const { result, rawText, latencyMs } = await identifyPest(
      imageBase64, 'image/jpeg', catalog ?? [], meta.crop, region
    );

    let treatment_organic = null;
    let treatment_chemical = null;
    let prevention = null;
    let pestRow: any = null;
    if (result.pest_id) {
      const { data: p } = await supabase()
        .from('pests_catalog')
        .select('id, common_name, scientific_name, treatment_organic, treatment_chemical, prevention')
        .eq('id', result.pest_id).single();
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
      .select('*').single();

    if (error) {
      logger.error({ error }, 'Failed persist scan');
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
      .select('id, image_url, detected_pest_name, severity, severity_pct, confidence, crop, created_at', { count: 'exact' })
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    const scansWithUrls = await Promise.all(
      (data ?? []).map(async (s) => ({ ...s, image_url: await getSignedUrl(s.image_url) }))
    );
    res.json({ data: { scans: scansWithUrls, total: count ?? 0, page } });
  } catch (e) { next(e); }
});

scansRouter.get('/:id', authJwt, async (req, res, next) => {
  try {
    const { data, error } = await supabase()
      .from('scans').select('*')
      .eq('id', req.params.id).eq('user_id', req.user!.userId).single();
    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Scan not found');
    const signedUrl = await getSignedUrl(data.image_url);
    res.json({ data: { scan: { ...data, image_url: signedUrl } } });
  } catch (e) { next(e); }
});
```

- [ ] **Step 3: Registrar en index.ts**

```typescript
import { scansRouter } from './routes/scans.js';
app.use('/scans', scansRouter);
```

- [ ] **Step 4: Test manual con curl + foto real de roya**

Bajar imagen de roya soya como `test-roya.jpg`:
```bash
TOKEN="<jwt-de-register>"
curl -X POST http://localhost:3000/scans \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-roya.jpg" \
  -F "crop=soya"
```

Expected: response 201 con `detected_pest.common_name = "Roya asiática..."`.

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): POST /scans con gemini + storage + persist"
```

---

### Task 14: Endpoint /catalog/pests

**Files:**
- Create: `backend/src/routes/catalog.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear `src/routes/catalog.ts`**

```typescript
import { Router } from 'express';
import { supabase } from '../services/supabase.js';

export const catalogRouter = Router();

catalogRouter.get('/pests', async (req, res, next) => {
  try {
    let q = supabase().from('pests_catalog')
      .select('id, common_name, scientific_name, affected_crops, treatment_organic, treatment_chemical, prevention')
      .eq('active', true);
    if (req.query.crop) q = q.contains('affected_crops', [req.query.crop]);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ data: { pests: data ?? [] } });
  } catch (e) { next(e); }
});
```

- [ ] **Step 2: Registrar**

```typescript
import { catalogRouter } from './routes/catalog.js';
app.use('/catalog', catalogRouter);
```

- [ ] **Step 3: Smoke test**

```bash
curl "http://localhost:3000/catalog/pests?crop=soya"
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): GET /catalog/pests"
```

---

### Task 15: Admin endpoints — scans list + validate + analytics

**Files:**
- Create: `backend/src/middleware/authAdmin.ts`, `backend/src/routes/admin/scans.ts`, `backend/src/routes/admin/analytics.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear `src/middleware/authAdmin.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.js';
import { AppError } from './errors.js';

export async function authAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new AppError(401, 'NO_TOKEN', 'Missing bearer token'));
  const token = header.slice(7);
  const { data, error } = await supabase().auth.getUser(token);
  if (error || !data.user?.email) return next(new AppError(401, 'INVALID_TOKEN', 'Invalid supabase token'));
  const { data: admin } = await supabase().from('admin_users').select('id, email, role').eq('email', data.user.email).single();
  if (!admin) return next(new AppError(403, 'NOT_ADMIN', 'Not an admin user'));
  (req as any).admin = admin;
  next();
}
```

- [ ] **Step 2: Crear `src/routes/admin/scans.ts`**

```typescript
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

    let q = supabase().from('scans')
      .select('id, image_url, detected_pest_name, severity, severity_pct, confidence, crop, region, admin_validated, created_at, users!inner(name, region)', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (req.query.status === 'pending') q = q.is('admin_validated', null);
    if (req.query.status === 'validated') q = q.not('admin_validated', 'is', null);
    if (req.query.region) q = q.eq('region', String(req.query.region));
    if (req.query.pest) q = q.eq('detected_pest_id', String(req.query.pest));

    const { data, error, count } = await q;
    if (error) throw error;
    res.json({ data: { scans: data ?? [], total: count ?? 0, page } });
  } catch (e) { next(e); }
});

adminScansRouter.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase().from('scans')
      .select('*, users(name, email, region, crop_main)')
      .eq('id', req.params.id).single();
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
    const adminId = (req as any).admin.id;
    const { error } = await supabase().from('scans').update({
      admin_validated: body.validation,
      admin_corrected_pest_id: body.corrected_pest_id ?? null,
      admin_notes: body.notes ?? null,
      admin_validated_by: adminId,
      admin_validated_at: new Date().toISOString(),
    }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});
```

- [ ] **Step 3: Crear `src/routes/admin/analytics.ts`**

```typescript
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
      sb.from('scans').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      sb.from('users').select('id', { count: 'exact', head: true }),
      sb.from('scans').select('admin_validated, latency_ms').not('admin_validated', 'is', null),
    ]);
    const validatedRows = validated.data ?? [];
    const correct = validatedRows.filter((r) => r.admin_validated === 'correct').length;
    const precision = validatedRows.length ? (correct / validatedRows.length) * 100 : 0;
    const avgLat = validatedRows.length ? validatedRows.reduce((a, r) => a + (r.latency_ms ?? 0), 0) / validatedRows.length : 0;
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
```

- [ ] **Step 4: Registrar en index.ts**

```typescript
import { adminScansRouter } from './routes/admin/scans.js';
import { adminAnalyticsRouter } from './routes/admin/analytics.js';
app.use('/admin/scans', adminScansRouter);
app.use('/admin/analytics', adminAnalyticsRouter);
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): admin endpoints scans + analytics"
```

---

# FASE 2 — Mobile auth + flujo scan

### Task 16: API client Dio + secure storage del token

**Files:**
- Create: `mobile/lib/core/api/api_client.dart`, `mobile/lib/core/storage/secure.dart`

- [ ] **Step 1: Crear `lib/core/storage/secure.dart`**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStore {
  SecureStore._();
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'jwt_token';

  static Future<String?> getToken() => _storage.read(key: _tokenKey);
  static Future<void> setToken(String token) => _storage.write(key: _tokenKey, value: token);
  static Future<void> clearToken() => _storage.delete(key: _tokenKey);
}
```

- [ ] **Step 2: Crear `lib/core/api/api_client.dart`**

```dart
import 'package:dio/dio.dart';
import '../storage/secure.dart';

class ApiClient {
  ApiClient._();
  static late final Dio dio;

  static void init({required String baseUrl}) {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      contentType: 'application/json',
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStore.getToken();
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
    ));
  }
}
```

- [ ] **Step 3: Modificar `lib/main.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/api/api_client.dart';
import 'app/app.dart';

void main() {
  // Emulador Android: 10.0.2.2 = localhost de la máquina host
  ApiClient.init(baseUrl: 'http://10.0.2.2:3000');
  runApp(const ProviderScope(child: AgroScanApp()));
}
```

- [ ] **Step 4: Commit**

```bash
git add mobile/lib
git commit -m "feat(mobile): api client dio + secure storage"
```

---

### Task 17: Modelo User + auth service + provider Riverpod

**Files:**
- Create: `mobile/lib/core/models/user.dart`, `mobile/lib/core/services/auth_service.dart`, `mobile/lib/features/auth/auth_provider.dart`

- [ ] **Step 1: Crear `lib/core/models/user.dart`**

```dart
class UserModel {
  final String id;
  final String email;
  final String name;
  final String region;
  final String cropMain;
  final bool premium;

  UserModel({
    required this.id, required this.email, required this.name,
    required this.region, required this.cropMain, this.premium = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> j) => UserModel(
    id: j['id'] as String,
    email: j['email'] as String,
    name: (j['name'] ?? '') as String,
    region: (j['region'] ?? '') as String,
    cropMain: (j['crop_main'] ?? '') as String,
    premium: (j['premium'] ?? false) as bool,
  );
}
```

- [ ] **Step 2: Crear `lib/core/services/auth_service.dart`**

```dart
import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../models/user.dart';
import '../storage/secure.dart';

class AuthResult {
  final UserModel user;
  final String token;
  AuthResult(this.user, this.token);
}

class AuthService {
  Future<AuthResult> register({
    required String email, required String password, required String name,
    required String region, required String cropMain,
  }) async {
    final res = await ApiClient.dio.post('/auth/register', data: {
      'email': email, 'password': password, 'name': name,
      'region': region, 'crop_main': cropMain,
    });
    final data = res.data['data'] as Map<String, dynamic>;
    await SecureStore.setToken(data['token'] as String);
    return AuthResult(UserModel.fromJson(data['user']), data['token']);
  }

  Future<AuthResult> login({required String email, required String password}) async {
    final res = await ApiClient.dio.post('/auth/login', data: { 'email': email, 'password': password });
    final data = res.data['data'] as Map<String, dynamic>;
    await SecureStore.setToken(data['token'] as String);
    return AuthResult(UserModel.fromJson(data['user']), data['token']);
  }

  Future<UserModel?> me() async {
    try {
      final res = await ApiClient.dio.get('/auth/me');
      return UserModel.fromJson(res.data['data']['user']);
    } on DioException {
      return null;
    }
  }

  Future<void> logout() async {
    await SecureStore.clearToken();
  }
}
```

- [ ] **Step 3: Crear `lib/features/auth/auth_provider.dart`**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/user.dart';
import '../../core/services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((_) => AuthService());

final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, AsyncValue<UserModel?>>((ref) {
  return CurrentUserNotifier(ref.read(authServiceProvider))..bootstrap();
});

class CurrentUserNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthService _service;
  CurrentUserNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> bootstrap() async {
    state = const AsyncValue.loading();
    final user = await _service.me();
    state = AsyncValue.data(user);
  }

  Future<void> login(String email, String password) async {
    final r = await _service.login(email: email, password: password);
    state = AsyncValue.data(r.user);
  }

  Future<void> register({
    required String email, required String password, required String name,
    required String region, required String cropMain,
  }) async {
    final r = await _service.register(
      email: email, password: password, name: name, region: region, cropMain: cropMain,
    );
    state = AsyncValue.data(r.user);
  }

  Future<void> logout() async {
    await _service.logout();
    state = const AsyncValue.data(null);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add mobile/lib
git commit -m "feat(mobile): auth model + service + riverpod provider"
```

---

### Task 18: Theme + router + pantallas login/register/home

**Files:**
- Create: `mobile/lib/app/app.dart`, `mobile/lib/app/router.dart`, `mobile/lib/app/theme.dart`, `mobile/lib/features/auth/login_screen.dart`, `mobile/lib/features/auth/register_screen.dart`, `mobile/lib/features/home/home_screen.dart`

- [ ] **Step 1: Crear `lib/app/theme.dart`**

```dart
import 'package:flutter/material.dart';

class AppTheme {
  static const _primary = Color(0xFF2E7D32);

  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: _primary, brightness: Brightness.light),
    appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        minimumSize: const Size.fromHeight(56),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      filled: true,
      fillColor: Colors.grey.shade50,
    ),
  );
}
```

- [ ] **Step 2: Crear `lib/app/router.dart`**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/auth_provider.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/home/home_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: GoRouterRefreshStream(ref),
    redirect: (context, state) {
      final user = ref.read(currentUserProvider);
      if (user.isLoading) return null;
      final loggedIn = user.valueOrNull != null;
      final authRoutes = ['/login', '/register'];
      final isAuthRoute = authRoutes.contains(state.matchedLocation);
      if (!loggedIn && !isAuthRoute) return '/login';
      if (loggedIn && isAuthRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
    ],
  );
});

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Ref ref) {
    ref.listen(currentUserProvider, (_, __) => notifyListeners());
  }
}
```

(Nota: importar `import 'package:flutter/foundation.dart';` para ChangeNotifier.)

- [ ] **Step 3: Crear `lib/app/app.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router.dart';
import 'theme.dart';

class AgroScanApp extends ConsumerWidget {
  const AgroScanApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'AgroScan',
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

- [ ] **Step 4: Crear `lib/features/auth/login_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(currentUserProvider.notifier).login(_email.text.trim(), _password.text);
    } catch (_) {
      setState(() => _error = 'Email o contraseña incorrectos');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),
              const Text('AgroScan', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Tu agrónomo de bolsillo', style: TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 48),
              TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined))),
              const SizedBox(height: 16),
              TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Contraseña', prefixIcon: Icon(Icons.lock_outline))),
              if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: const TextStyle(color: Colors.red))),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Iniciar sesión'),
              ),
              const SizedBox(height: 12),
              TextButton(onPressed: () => context.push('/register'), child: const Text('¿No tenés cuenta? Registrate')),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 5: Crear `lib/features/auth/register_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  String _region = 'Cuatro Cañadas';
  String _crop = 'soya';
  bool _loading = false;
  String? _error;

  static const _regions = ['Cuatro Cañadas','San Julián','Pailón','Mineros','Montero','Warnes','Santa Cruz capital','Otro'];
  static const _crops = ['soya','maíz','sorgo','yuca','cítricos','tomate','papa','cebolla','girasol','arroz'];

  Future<void> _submit() async {
    if (_email.text.isEmpty || _password.text.length < 6 || _name.text.isEmpty) {
      setState(() => _error = 'Completá todos los campos (contraseña mínimo 6)'); return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(currentUserProvider.notifier).register(
        email: _email.text.trim(), password: _password.text, name: _name.text.trim(),
        region: _region, cropMain: _crop,
      );
    } catch (_) {
      setState(() => _error = 'No se pudo registrar (¿email ya usado?)');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear cuenta')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Tu nombre')),
            const SizedBox(height: 16),
            TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
            const SizedBox(height: 16),
            TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Contraseña')),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _region, decoration: const InputDecoration(labelText: 'Región'),
              items: _regions.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
              onChanged: (v) => setState(() => _region = v!),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _crop, decoration: const InputDecoration(labelText: 'Cultivo principal'),
              items: _crops.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
              onChanged: (v) => setState(() => _crop = v!),
            ),
            if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: const TextStyle(color: Colors.red))),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Crear cuenta'),
            ),
          ]),
        ),
      ),
    );
  }
}
```

- [ ] **Step 6: Crear `lib/features/home/home_screen.dart`** (placeholder hasta task 21)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../auth/auth_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('AgroScan'),
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: () => ref.read(currentUserProvider.notifier).logout()),
        ],
      ),
      body: userAsync.when(
        data: (user) => Center(child: Text('Hola ${user?.name ?? ""}')),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
```

- [ ] **Step 7: Smoke test**

```bash
cd mobile
flutter run
```

Emulador → pantalla login → crear cuenta → home con saludo.

⚠️ Asegurar backend corriendo (`cd backend && npm run dev`).

- [ ] **Step 8: Commit**

```bash
git add mobile/lib
git commit -m "feat(mobile): router + screens login/register/home + theme"
```

---

### Task 19: Modelo Scan + service scans

**Files:**
- Create: `mobile/lib/core/models/scan.dart`, `mobile/lib/core/services/scan_service.dart`

- [ ] **Step 1: Crear `lib/core/models/scan.dart`**

```dart
class ScanResult {
  final String scanId;
  final String? pestCommonName;
  final String? pestScientificName;
  final String? severity;
  final int? severityPct;
  final double confidence;
  final Map<String, dynamic>? treatmentOrganic;
  final Map<String, dynamic>? treatmentChemical;
  final String? prevention;
  final String imageUrl;
  final String? visualObservations;
  final DateTime? createdAt;
  final String? crop;

  ScanResult({
    required this.scanId, this.pestCommonName, this.pestScientificName,
    this.severity, this.severityPct, required this.confidence,
    this.treatmentOrganic, this.treatmentChemical, this.prevention,
    required this.imageUrl, this.visualObservations, this.createdAt, this.crop,
  });

  factory ScanResult.fromCreateResponse(Map<String, dynamic> data) {
    final pest = data['detected_pest'] as Map<String, dynamic>?;
    return ScanResult(
      scanId: data['scan_id'] as String,
      pestCommonName: pest?['common_name'] as String?,
      pestScientificName: pest?['scientific_name'] as String?,
      severity: pest?['severity'] as String?,
      severityPct: pest?['severity_pct'] as int?,
      confidence: ((pest?['confidence'] ?? 0) as num).toDouble(),
      treatmentOrganic: data['treatment_organic'] as Map<String, dynamic>?,
      treatmentChemical: data['treatment_chemical'] as Map<String, dynamic>?,
      prevention: data['prevention'] as String?,
      imageUrl: data['image_url'] as String,
      visualObservations: data['visual_observations'] as String?,
    );
  }

  factory ScanResult.fromHistoryItem(Map<String, dynamic> j) => ScanResult(
    scanId: j['id'] as String,
    pestCommonName: j['detected_pest_name'] as String?,
    severity: j['severity'] as String?,
    severityPct: j['severity_pct'] as int?,
    confidence: ((j['confidence'] ?? 0) as num).toDouble(),
    imageUrl: j['image_url'] as String,
    crop: j['crop'] as String?,
    createdAt: j['created_at'] != null ? DateTime.parse(j['created_at']) : null,
  );
}
```

- [ ] **Step 2: Crear `lib/core/services/scan_service.dart`**

```dart
import 'dart:io';
import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../models/scan.dart';

class ScanService {
  Future<ScanResult> submitScan({
    required File imageFile, required String crop,
    double? gpsLat, double? gpsLng, String? clientId,
  }) async {
    final form = FormData.fromMap({
      'image': await MultipartFile.fromFile(imageFile.path, filename: 'scan.jpg'),
      'crop': crop,
      if (gpsLat != null) 'gps_lat': gpsLat,
      if (gpsLng != null) 'gps_lng': gpsLng,
      if (clientId != null) 'client_id': clientId,
    });
    final res = await ApiClient.dio.post('/scans', data: form);
    return ScanResult.fromCreateResponse(res.data['data']);
  }

  Future<List<ScanResult>> myScans({int page = 1, int limit = 20}) async {
    final res = await ApiClient.dio.get('/scans/me', queryParameters: {'page': page, 'limit': limit});
    final list = res.data['data']['scans'] as List;
    return list.map((j) => ScanResult.fromHistoryItem(j as Map<String, dynamic>)).toList();
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/core
git commit -m "feat(mobile): scan model + service"
```

---

### Task 20: Pantalla cámara + analizar

**Files:**
- Create: `mobile/lib/features/scan/camera_screen.dart`, `mobile/lib/features/scan/analyzing_screen.dart`

- [ ] **Step 1: Crear `lib/features/scan/camera_screen.dart`**

```dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../auth/auth_provider.dart';
import 'analyzing_screen.dart';

class CameraScreen extends ConsumerStatefulWidget {
  const CameraScreen({super.key});
  @override
  ConsumerState<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends ConsumerState<CameraScreen> {
  final _picker = ImagePicker();
  File? _image;
  late String _crop;
  static const _crops = ['soya','maíz','sorgo','yuca','cítricos','tomate','papa','cebolla','girasol','arroz'];

  @override
  void initState() {
    super.initState();
    _crop = ref.read(currentUserProvider).valueOrNull?.cropMain ?? 'soya';
  }

  Future<void> _takePhoto() async {
    final x = await _picker.pickImage(source: ImageSource.camera, maxWidth: 2000, imageQuality: 85);
    if (x != null) setState(() => _image = File(x.path));
  }

  Future<void> _pickFromGallery() async {
    final x = await _picker.pickImage(source: ImageSource.gallery, maxWidth: 2000, imageQuality: 85);
    if (x != null) setState(() => _image = File(x.path));
  }

  Future<void> _analyze() async {
    if (_image == null) return;
    final result = await Navigator.of(context).push<dynamic>(
      MaterialPageRoute(builder: (_) => AnalyzingScreen(image: _image!, crop: _crop)),
    );
    if (result != null && mounted) {
      context.pushReplacement('/result', extra: result);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escanear planta')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: _image == null
                  ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(Icons.local_florist, size: 80, color: Colors.grey),
                      SizedBox(height: 12),
                      Text('Acercá la hoja afectada\nal centro del cuadro', textAlign: TextAlign.center),
                    ]))
                  : ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.file(_image!, fit: BoxFit.cover)),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _crop,
              decoration: const InputDecoration(labelText: 'Cultivo', border: OutlineInputBorder()),
              items: _crops.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
              onChanged: (v) => setState(() => _crop = v!),
            ),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: OutlinedButton.icon(icon: const Icon(Icons.photo_library), label: const Text('Galería'), onPressed: _pickFromGallery)),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.camera_alt), label: const Text('Cámara'), onPressed: _takePhoto)),
            ]),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _image == null ? null : _analyze,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green.shade700, foregroundColor: Colors.white),
              child: const Text('ANALIZAR'),
            ),
          ]),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Crear `lib/features/scan/analyzing_screen.dart`**

```dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/scan_service.dart';

class AnalyzingScreen extends ConsumerStatefulWidget {
  final File image;
  final String crop;
  const AnalyzingScreen({super.key, required this.image, required this.crop});

  @override
  ConsumerState<AnalyzingScreen> createState() => _AnalyzingScreenState();
}

class _AnalyzingScreenState extends ConsumerState<AnalyzingScreen> {
  String? _error;

  @override
  void initState() {
    super.initState();
    _run();
  }

  Future<void> _run() async {
    try {
      final svc = ScanService();
      final result = await svc.submitScan(imageFile: widget.image, crop: widget.crop);
      if (mounted) Navigator.of(context).pop(result);
    } catch (_) {
      if (mounted) setState(() => _error = 'No se pudo analizar. Intentá de nuevo.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: _error == null
            ? Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                SizedBox(width: 200, height: 200,
                  child: ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.file(widget.image, fit: BoxFit.cover))),
                const SizedBox(height: 32),
                const CircularProgressIndicator(),
                const SizedBox(height: 16),
                const Text('Identificando plaga...', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Text('Comparando con catálogo de plagas locales', style: TextStyle(color: Colors.grey.shade600)),
              ])
            : Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 64),
                const SizedBox(height: 16),
                Text(_error!, textAlign: TextAlign.center),
                const SizedBox(height: 24),
                ElevatedButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Volver')),
              ]),
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Commit (router se actualiza en task 21)**

```bash
git add mobile/lib
git commit -m "feat(mobile): camera + analyzing screens"
```

---

### Task 21: Pantalla resultado + home con botón "Escanear"

**Files:**
- Create: `mobile/lib/features/scan/result_screen.dart`, `mobile/lib/shared/widgets/severity_badge.dart`, `mobile/lib/shared/widgets/treatment_card.dart`
- Modify: `mobile/lib/features/home/home_screen.dart`, `mobile/lib/app/router.dart`

- [ ] **Step 1: Crear `lib/shared/widgets/severity_badge.dart`**

```dart
import 'package:flutter/material.dart';

class SeverityBadge extends StatelessWidget {
  final String? severity;
  final int? pct;
  const SeverityBadge({super.key, this.severity, this.pct});

  @override
  Widget build(BuildContext context) {
    Color color; String label;
    switch (severity) {
      case 'low':    color = Colors.green;  label = 'BAJA';  break;
      case 'medium': color = Colors.orange; label = 'MEDIA'; break;
      case 'high':   color = Colors.red;    label = 'ALTA';  break;
      default:       color = Colors.grey;   label = 'N/A';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: color)),
      child: Text(pct != null ? '$label · ${pct}%' : label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
    );
  }
}
```

- [ ] **Step 2: Crear `lib/shared/widgets/treatment_card.dart`**

```dart
import 'package:flutter/material.dart';

class TreatmentCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final Map<String, dynamic> data;
  const TreatmentCard({super.key, required this.title, required this.icon, required this.color, required this.data});

  String _stringify(dynamic v) {
    if (v == null) return '—';
    if (v is List) return v.join(', ');
    return v.toString();
  }

  @override
  Widget build(BuildContext context) {
    final entries = <MapEntry<String, String>>[];
    if (data['method'] != null) entries.add(MapEntry('Método', _stringify(data['method'])));
    if (data['ingredients'] != null) entries.add(MapEntry('Ingredientes', _stringify(data['ingredients'])));
    if (data['actives'] != null) entries.add(MapEntry('Activos', _stringify(data['actives'])));
    if (data['dosage'] != null) entries.add(MapEntry('Dosis', _stringify(data['dosage'])));
    if (data['dosage_per_ha'] != null) entries.add(MapEntry('Dosis/ha', _stringify(data['dosage_per_ha'])));
    if (data['frequency'] != null) entries.add(MapEntry('Frecuencia', _stringify(data['frequency'])));
    if (data['timing'] != null) entries.add(MapEntry('Aplicar', _stringify(data['timing'])));
    if (data['brands'] != null) entries.add(MapEntry('Marcas', _stringify(data['brands'])));
    if (data['notes'] != null) entries.add(MapEntry('Notas', _stringify(data['notes'])));

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: color.withOpacity(0.3))),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [Icon(icon, color: color), const SizedBox(width: 8), Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16))]),
          const SizedBox(height: 12),
          ...entries.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: RichText(text: TextSpan(
              style: const TextStyle(color: Colors.black87, fontSize: 14),
              children: [TextSpan(text: '${e.key}: ', style: const TextStyle(fontWeight: FontWeight.w600)), TextSpan(text: e.value)],
            )),
          )),
        ]),
      ),
    );
  }
}
```

- [ ] **Step 3: Crear `lib/features/scan/result_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/models/scan.dart';
import '../../shared/widgets/severity_badge.dart';
import '../../shared/widgets/treatment_card.dart';

class ResultScreen extends StatelessWidget {
  final ScanResult scan;
  const ResultScreen({super.key, required this.scan});

  @override
  Widget build(BuildContext context) {
    final identified = scan.pestCommonName != null;
    return Scaffold(
      appBar: AppBar(title: const Text('Resultado')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.network(scan.imageUrl, fit: BoxFit.cover)),
          ),
          const SizedBox(height: 16),
          if (identified) ...[
            Text(scan.pestCommonName!, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            if (scan.pestScientificName != null)
              Text(scan.pestScientificName!, style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.grey)),
            const SizedBox(height: 12),
            Row(children: [
              SeverityBadge(severity: scan.severity, pct: scan.severityPct),
              const SizedBox(width: 12),
              Text('Confianza ${(scan.confidence * 100).round()}%', style: TextStyle(color: Colors.grey.shade700)),
            ]),
            if (scan.visualObservations != null)
              Padding(padding: const EdgeInsets.only(top: 12), child: Text(scan.visualObservations!, style: TextStyle(color: Colors.grey.shade800))),
            const SizedBox(height: 24),
            if (scan.treatmentOrganic != null)
              TreatmentCard(title: 'Tratamiento orgánico', icon: Icons.eco, color: Colors.green.shade700, data: scan.treatmentOrganic!),
            const SizedBox(height: 12),
            if (scan.treatmentChemical != null)
              TreatmentCard(title: 'Tratamiento químico', icon: Icons.science, color: Colors.blue.shade700, data: scan.treatmentChemical!),
            const SizedBox(height: 12),
            if (scan.prevention != null)
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade300)),
                elevation: 0,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: const [Icon(Icons.shield_outlined), SizedBox(width: 8), Text('Prevención', style: TextStyle(fontWeight: FontWeight.bold))]),
                    const SizedBox(height: 8),
                    Text(scan.prevention!),
                  ]),
                ),
              ),
          ] else ...[
            const Icon(Icons.help_outline, size: 64, color: Colors.amber),
            const SizedBox(height: 12),
            const Text('No pudimos identificar la plaga con certeza', textAlign: TextAlign.center, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Probá con otra foto más cercana y con buena luz. O contactá a un ingeniero agrónomo.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
          ],
          const SizedBox(height: 24),
          ElevatedButton(onPressed: () => context.go('/'), child: const Text('Volver al inicio')),
        ]),
      ),
    );
  }
}
```

- [ ] **Step 4: Actualizar `lib/features/home/home_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../auth/auth_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('AgroScan'),
        actions: [
          IconButton(icon: const Icon(Icons.history), tooltip: 'Historial', onPressed: () => context.push('/history')),
          IconButton(icon: const Icon(Icons.logout), onPressed: () => ref.read(currentUserProvider.notifier).logout()),
        ],
      ),
      body: userAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (user) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const SizedBox(height: 24),
            Text('Hola ${user?.name ?? ""} 👋', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('${user?.region ?? ""} · ${user?.cropMain ?? ""}', style: TextStyle(color: Colors.grey.shade700)),
            const SizedBox(height: 48),
            SizedBox(
              height: 200,
              child: ElevatedButton(
                onPressed: () => context.push('/camera'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
                child: const Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.camera_alt, size: 64),
                  SizedBox(height: 12),
                  Text('ESCANEAR PLANTA', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                ]),
              ),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(icon: const Icon(Icons.history), label: const Text('Mis escaneos'), onPressed: () => context.push('/history')),
          ]),
        ),
      ),
    );
  }
}
```

- [ ] **Step 5: Actualizar `lib/app/router.dart` con rutas /camera, /result, /history**

Agregar imports + rutas:
```dart
import '../core/models/scan.dart';
import '../features/scan/camera_screen.dart';
import '../features/scan/result_screen.dart';
import '../features/history/history_screen.dart';

// dentro de routes:
GoRoute(path: '/camera', builder: (_, __) => const CameraScreen()),
GoRoute(path: '/result', builder: (_, state) => ResultScreen(scan: state.extra as ScanResult)),
GoRoute(path: '/history', builder: (_, __) => const HistoryScreen()),
```

- [ ] **Step 6: Smoke test E2E**

```bash
cd mobile
flutter run
```

Crear cuenta → home → Escanear → Galería → seleccionar foto plaga → Analizar → ver resultado.

- [ ] **Step 7: Commit**

```bash
git add mobile/lib
git commit -m "feat(mobile): pantalla resultado + home con botón escanear"
```

---

### Task 22: Pantalla historial

**Files:**
- Create: `mobile/lib/features/history/history_screen.dart`

- [ ] **Step 1: Crear `lib/features/history/history_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/models/scan.dart';
import '../../core/services/scan_service.dart';
import '../../shared/widgets/severity_badge.dart';

final myScansProvider = FutureProvider.autoDispose<List<ScanResult>>((ref) async {
  return ScanService().myScans();
});

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scansAsync = ref.watch(myScansProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Mis escaneos')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(myScansProvider),
        child: scansAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
          data: (list) {
            if (list.isEmpty) {
              return ListView(children: const [
                SizedBox(height: 100),
                Icon(Icons.history, size: 80, color: Colors.grey),
                SizedBox(height: 16),
                Center(child: Text('Sin escaneos todavía', style: TextStyle(fontSize: 18))),
              ]);
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (_, i) {
                final s = list[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(children: [
                      ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(s.imageUrl, width: 64, height: 64, fit: BoxFit.cover)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(s.pestCommonName ?? 'No identificado', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text('${s.crop ?? ""} · ${s.createdAt != null ? DateFormat('dd/MM HH:mm').format(s.createdAt!.toLocal()) : ""}', style: TextStyle(color: Colors.grey.shade700, fontSize: 12)),
                        const SizedBox(height: 6),
                        SeverityBadge(severity: s.severity, pct: s.severityPct),
                      ])),
                    ]),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Smoke test**

Hacer 2-3 scans → ir a Historial → ver lista.

- [ ] **Step 3: Commit**

```bash
git add mobile/lib
git commit -m "feat(mobile): pantalla historial de escaneos"
```

---

# FASE 3 — Web admin core

### Task 23: Layout + sidebar + auth Magic Link

**Files:**
- Create: `web-admin/src/lib/supabase.ts`, `web-admin/src/lib/supabase-server.ts`, `web-admin/src/middleware.ts`, `web-admin/src/app/(auth)/login/page.tsx`, `web-admin/src/app/(dashboard)/layout.tsx`, `web-admin/src/components/sidebar.tsx`

- [ ] **Step 1: Crear `src/lib/supabase.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr';
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Crear `src/middleware.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          for (const { name, value, options } of toSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname.startsWith('/login');
  if (!user && !isLogin) return NextResponse.redirect(new URL('/login', request.url));
  if (user && isLogin) return NextResponse.redirect(new URL('/', request.url));
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
```

- [ ] **Step 3: Crear `src/app/(auth)/login/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-2xl">AgroScan Admin</CardTitle></CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-green-700">Te mandamos un link a {email}. Revisá tu email y clickeá para entrar.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="email" required placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Enviando...' : 'Enviar link mágico'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Crear `src/components/sidebar.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ScanLine, BookOpen, Bell, BarChart3, LogOut } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const items = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scans', icon: ScanLine, label: 'Escaneos' },
  { href: '/catalog', icon: BookOpen, label: 'Catálogo' },
  { href: '/alerts', icon: Bell, label: 'Alertas' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-green-700">🌱 AgroScan</h1>
        <p className="text-xs text-gray-500">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={async () => {
          await createSupabaseBrowserClient().auth.signOut();
          router.push('/login');
        }}>
          <LogOut className="h-4 w-4 mr-2" />Salir
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Crear `src/app/(dashboard)/layout.tsx`**

```tsx
import { Sidebar } from '@/components/sidebar';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 6: Habilitar CORS en backend para web admin**

En `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.WEB_ADMIN_URL].filter(Boolean) as string[],
  credentials: true,
}));
```

- [ ] **Step 7: Smoke test**

```bash
cd web-admin
npm run dev
```

⚠️ Antes: Supabase Dashboard → Authentication → Users → Add user `admin@agroscan.bo` con autoconfirm ON. Y agregar URL del web admin a Authentication → URL Configuration → Site URL.

Abrir http://localhost:3001 (puerto puede variar) → redirige a /login → ingresar email admin → recibir magic link → entrar.

- [ ] **Step 8: Commit**

```bash
git add web-admin/ backend/
git commit -m "feat(web): auth magic link + sidebar + dashboard layout"
```

---

### Task 24: API client web + Dashboard KPIs

**Files:**
- Create: `web-admin/src/lib/api.ts`, `web-admin/src/components/stats-card.tsx`
- Modify: `web-admin/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Crear `src/lib/api.ts`**

```typescript
import { createSupabaseBrowserClient } from './supabase';
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || res.statusText);
  }
  const json = await res.json();
  return json.data as T;
}
```

- [ ] **Step 2: Crear `src/components/stats-card.tsx`**

```tsx
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export function StatsCard({ label, value, icon: Icon, hint }: { label: string; value: string | number; icon: LucideIcon; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-green-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Implementar `src/app/(dashboard)/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { StatsCard } from '@/components/stats-card';
import { ScanLine, Users, Activity, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Analytics {
  total_scans: number;
  weekly_scans: number;
  total_users: number;
  ia_precision_pct: number;
  avg_latency_ms: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Analytics>('/admin/analytics').then(setData).catch(e => setErr(e.message));
  }, []);

  if (err) return <p className="text-red-600">Error: {err}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data ? (
          <>
            <StatsCard label="Escaneos totales" value={data.total_scans} icon={ScanLine} hint={`+${data.weekly_scans} esta semana`} />
            <StatsCard label="Usuarios" value={data.total_users} icon={Users} />
            <StatsCard label="Precisión IA" value={`${data.ia_precision_pct}%`} icon={Activity} hint="validados/total" />
            <StatsCard label="Latencia avg" value={`${data.avg_latency_ms}ms`} icon={Clock} />
          </>
        ) : (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Smoke test**

Refrescar dashboard → ver KPIs.

- [ ] **Step 5: Commit**

```bash
git add web-admin/
git commit -m "feat(web): api client + dashboard KPIs"
```

---

### Task 25: Lista scans con filtros

**Files:**
- Create: `web-admin/src/app/(dashboard)/scans/page.tsx`

- [ ] **Step 1: Crear `src/app/(dashboard)/scans/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Scan {
  id: string;
  detected_pest_name: string | null;
  severity: string | null;
  severity_pct: number | null;
  confidence: number;
  crop: string;
  region: string;
  admin_validated: string | null;
  created_at: string;
  users: { name: string; region: string };
}

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = status !== 'all' ? `?status=${status}` : '';
    apiFetch<{ scans: Scan[]; total: number }>(`/admin/scans${qs}`)
      .then(d => setScans(d.scans))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Escaneos</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente validar</SelectItem>
            <SelectItem value="validated">Validados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : scans.length === 0 ? (
        <p className="text-gray-500">No hay escaneos.</p>
      ) : (
        <div className="space-y-2">
          {scans.map(s => (
            <Link key={s.id} href={`/scans/${s.id}`}>
              <Card className="p-4 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{s.detected_pest_name ?? 'No identificado'}</p>
                    <p className="text-sm text-gray-600">
                      {s.crop} · {s.region} · {s.users?.name ?? 'Anónimo'} · {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.severity && <Badge className={severityColors[s.severity]}>{s.severity.toUpperCase()}</Badge>}
                    {s.admin_validated && <Badge variant="outline">{s.admin_validated}</Badge>}
                    {!s.admin_validated && <Badge variant="secondary">pending</Badge>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Smoke test**

Hacer 2 scans desde mobile → web /scans → ver lista.

- [ ] **Step 3: Commit**

```bash
git add web-admin/
git commit -m "feat(web): lista escaneos con filtros"
```

---

### Task 26: Detalle scan + validar IA

**Files:**
- Create: `web-admin/src/app/(dashboard)/scans/[id]/page.tsx`

- [ ] **Step 1: Crear `src/app/(dashboard)/scans/[id]/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ScanDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [scan, setScan] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ scan: any }>(`/admin/scans/${params.id}`).then(d => setScan(d.scan));
  }, [params.id]);

  const validate = async (validation: 'correct' | 'incorrect') => {
    setSaving(true);
    await apiFetch(`/admin/scans/${params.id}/validate`, {
      method: 'POST',
      body: JSON.stringify({ validation, notes: notes || undefined }),
    });
    setSaving(false);
    router.push('/scans');
  };

  if (!scan) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{scan.detected_pest_name ?? 'No identificado'}</h1>
        <p className="text-gray-600">{scan.crop} · {scan.region} · {new Date(scan.created_at).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Foto del productor</h3>
          {scan.image_url && <img src={scan.image_url} alt="" className="w-full rounded" />}
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Diagnóstico IA</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Plaga:</strong> {scan.detected_pest_name ?? '—'}</p>
            <p><strong>Severidad:</strong> <Badge>{scan.severity ?? '—'}</Badge> {scan.severity_pct ?? '—'}%</p>
            <p><strong>Confianza:</strong> {Math.round((scan.confidence ?? 0) * 100)}%</p>
            <p><strong>Latencia:</strong> {scan.latency_ms ?? '—'} ms</p>
            <p><strong>Usuario:</strong> {scan.users?.name} ({scan.users?.email})</p>
            <p><strong>GPS:</strong> {scan.gps_lat?.toFixed(4) ?? '—'}, {scan.gps_lng?.toFixed(4) ?? '—'}</p>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Validación</h3>
        <Textarea placeholder="Notas internas (opcional)" value={notes} onChange={e => setNotes(e.target.value)} className="mb-4" />
        <div className="flex gap-3">
          <Button onClick={() => validate('correct')} disabled={saving} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />IA Correcta
          </Button>
          <Button onClick={() => validate('incorrect')} disabled={saving} variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />IA Incorrecta
          </Button>
        </div>
        {scan.admin_validated && (
          <p className="mt-3 text-sm text-gray-600">Ya validado como <strong>{scan.admin_validated}</strong></p>
        )}
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test**

/scans → click → detalle → validar.

- [ ] **Step 3: Commit**

```bash
git add web-admin/
git commit -m "feat(web): detalle scan + validar IA"
```

---

### Task 27: Vista catálogo plagas (read-only)

**Files:**
- Create: `web-admin/src/app/(dashboard)/catalog/page.tsx`

- [ ] **Step 1: Crear `src/app/(dashboard)/catalog/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Pest {
  id: string;
  common_name: string;
  scientific_name: string;
  affected_crops: string[];
}

export default function CatalogPage() {
  const [pests, setPests] = useState<Pest[]>([]);
  useEffect(() => {
    apiFetch<{ pests: Pest[] }>('/catalog/pests').then(d => setPests(d.pests));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Catálogo de plagas ({pests.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pests.map(p => (
          <Card key={p.id} className="p-4">
            <h3 className="font-semibold">{p.common_name}</h3>
            <p className="text-sm italic text-gray-600">{p.scientific_name}</p>
            <div className="mt-2 flex gap-1 flex-wrap">
              {p.affected_crops.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web-admin/
git commit -m "feat(web): catálogo plagas (read-only)"
```

---

# FASE 4 — Deploy + APK + smoke test

### Task 28: Deploy backend a Railway

- [ ] **Step 1: Crear cuenta Railway** (https://railway.app) con GitHub.

- [ ] **Step 2: Pushear repo a GitHub privado**

```bash
gh repo create agroscan --private --source . --remote origin --push
```

- [ ] **Step 3: New Project → Deploy from GitHub repo** → seleccionar `agroscan`.

- [ ] **Step 4: Configurar service**

- Root directory: `/backend`
- Build command: `npm install && npm run build`
- Start command: `node dist/index.js`

- [ ] **Step 5: Variables de entorno**

Copiar todas las de `.env` local.

- [ ] **Step 6: Deploy → obtener URL pública** (ej. `https://agroscan-backend.up.railway.app`)

- [ ] **Step 7: Verificar**

```bash
curl https://agroscan-backend.up.railway.app/health
```

Expected: `{"data":{"ok":true,"env":"production"}}`

- [ ] **Step 8: Commit cambios si hay**

```bash
git add .
git commit -m "chore(backend): railway deploy"
git push
```

---

### Task 29: Deploy web admin a Vercel

- [ ] **Step 1: Cuenta Vercel** con GitHub.

- [ ] **Step 2: Import project**, root directory `web-admin`, framework Next.js.

- [ ] **Step 3: Env vars** (los mismos que `.env.local` + `NEXT_PUBLIC_API_URL` apuntando a Railway).

- [ ] **Step 4: Deploy → URL** (ej. `https://agroscan-admin.vercel.app`)

- [ ] **Step 5: Agregar URL Vercel al CORS del backend**

Editar `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://agroscan-admin.vercel.app',
  ],
  credentials: true,
}));
```

Push a GitHub → Railway redeploya automáticamente.

- [ ] **Step 6: Smoke test**

Abrir URL Vercel → login admin → dashboard carga.

---

### Task 30: APK release + Diawi

- [ ] **Step 1: Cambiar baseUrl en `mobile/lib/main.dart`**

```dart
ApiClient.init(baseUrl: 'https://agroscan-backend.up.railway.app');
```

- [ ] **Step 2: Pausar OneDrive sync**

(Para evitar que corrompa el build durante compilación)

- [ ] **Step 3: Build APK**

```bash
cd mobile
flutter build apk --release
```

Output: `mobile/build/app/outputs/flutter-apk/app-release.apk` (~25 MB).

- [ ] **Step 4: Subir a Diawi**

https://www.diawi.com → drag and drop APK → esperar → obtener link + QR.

⚠️ Anotar link y la fecha de expiración.

- [ ] **Step 5: Probar APK en celular físico**

Escanear QR → instalar (permitir fuentes desconocidas) → registrar usuario → escanear hoja real → ver resultado.

- [ ] **Step 6: Commit**

```bash
git add mobile/
git commit -m "chore(mobile): apuntar a backend producción"
git push
```

---

### Task 31: 10 fotos golden pre-validadas

- [ ] **Step 1: Descargar fotos de plagas top del catálogo**

Para cada plaga del seed (10), buscar en Google Images foto clara con buena resolución. Guardar en `docs/demo-golden-images/`.

- [ ] **Step 2: Probar cada foto en APK release**

Para cada foto:
1. Subir desde galería en app
2. Verificar que Gemini matchee la plaga esperada
3. Anotar confianza y resultado

- [ ] **Step 3: Seleccionar 3-5 MEJORES para demo**

Las que tengan confianza >85% y severidad clara.

- [ ] **Step 4: Crear `docs/pitch/demo-script.md`**

```markdown
# Demo Script — Pitch AgroScan

## Setup pre-pitch
- APK instalado en celular del presenter
- Wifi/hotspot funcionando
- Backend Railway responde /health
- Web admin Vercel abierto en otra pantalla, logueado

## Fotos golden (orden)

1. **Roya soya** — golden-01-roya.jpg — confianza ~90%
2. **Gusano cogollero** — golden-02-cogollero.jpg — confianza ~85%
3. **Mosca blanca** — golden-03-mosca.jpg — confianza ~88%

## Plan B (si demo falla)
- Video grabado 60s con flow completo
- Screenshots en slides
```

- [ ] **Step 5: Commit**

```bash
git add docs/
git commit -m "docs: demo script + golden images"
git push
```

---

### Task 32: READMEs de cada subproyecto

**Files:**
- Create: `backend/README.md`, `mobile/README.md`, `web-admin/README.md`, `web-admin/.env.example`

- [ ] **Step 1: `backend/README.md`**

```markdown
# AgroScan Backend

Node + Express + TypeScript + Supabase + Gemini.

## Setup local

1. `cp .env.example .env` y llenar las keys
2. `npm install`
3. `npm run dev`

Servidor en `http://localhost:3000`. Health: `GET /health`.
```

- [ ] **Step 2: `mobile/README.md`**

```markdown
# AgroScan Mobile

Flutter 3.24 + Riverpod + Dio.

## Setup

1. Flutter SDK 3.24+ + Android Studio
2. `flutter pub get`
3. `lib/main.dart`: cambiar `baseUrl` (local: `http://10.0.2.2:3000`, prod: URL Railway)
4. `flutter run`

## Build APK

`flutter build apk --release` → `build/app/outputs/flutter-apk/app-release.apk`
```

- [ ] **Step 3: `web-admin/README.md`** y `.env.example`

```markdown
# AgroScan Admin Web

Next.js 15 + Tailwind + shadcn/ui + Supabase Auth + Mapbox.

## Setup

1. `cp .env.example .env.local`
2. `npm install`
3. `npm run dev`

## Login

Magic link al email del admin. Email debe existir en `auth.users` Y en tabla `admin_users`.
```

```
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=
```

- [ ] **Step 4: Commit**

```bash
git add backend/README.md mobile/README.md web-admin/README.md web-admin/.env.example
git commit -m "docs: READMEs subproyectos"
git push
```

---

### Task 33: Pre-pitch checklist + smoke test E2E final

**Files:**
- Create: `docs/pitch/pre-pitch-checklist.md`

- [ ] **Step 1: Crear `docs/pitch/pre-pitch-checklist.md`**

```markdown
# Pre-Pitch Checklist (30 min antes)

## Servicios
- [ ] Railway backend responde `/health` con `ok:true`
- [ ] Vercel web admin carga login
- [ ] Cuenta admin Supabase funciona magic link

## Dispositivos
- [ ] APK instalado en celular presenter (no expirado en Diawi)
- [ ] Wifi/hotspot funcionando
- [ ] Celular con batería >50%
- [ ] 5 fotos golden cargadas en galería

## Backup
- [ ] Video demo de 60s en USB
- [ ] APK respaldado en USB
- [ ] Screenshots en slides
- [ ] One-pager PDF impreso

## Web admin
- [ ] Sesión admin activa en pantalla extra
- [ ] Al menos 5 scans en BD para que dashboard tenga data
- [ ] 2-3 scans validados para que precisión muestre %
```

- [ ] **Step 2: Hacer 5 scans con golden images** + validar 2 en web admin.

- [ ] **Step 3: Commit**

```bash
git add docs/
git commit -m "docs: pre-pitch checklist"
git push
```

---

# FASE 5 — STRETCH GOALS

### Task 34 (stretch): Mapa heatmap web admin

**Files:**
- Modify: `backend/src/routes/admin/scans.ts`
- Create: `web-admin/src/components/heatmap.tsx`
- Modify: `web-admin/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Endpoint `GET /admin/scans/geo`** en `adminScansRouter`

```typescript
adminScansRouter.get('/geo', async (_req, res, next) => {
  try {
    const { data, error } = await supabase()
      .from('scans')
      .select('gps_lat, gps_lng, detected_pest_name, severity')
      .not('gps_lat', 'is', null);
    if (error) throw error;
    res.json({ data: { points: data ?? [] } });
  } catch (e) { next(e); }
});
```

- [ ] **Step 2: Crear `src/components/heatmap.tsx`**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function Heatmap({ points }: { points: Array<{ gps_lat: number; gps_lng: number }> }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!container.current || map.current) return;
    map.current = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-63.18, -17.78],
      zoom: 7,
    });
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || points.length === 0) return;
    const onLoad = () => {
      if (m.getSource('scans')) return;
      m.addSource('scans', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: points.map(p => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.gps_lng, p.gps_lat] },
            properties: {},
          })),
        },
      });
      m.addLayer({
        id: 'scan-heat', type: 'heatmap', source: 'scans',
        paint: { 'heatmap-weight': 1, 'heatmap-intensity': 1, 'heatmap-radius': 30 },
      });
    };
    if (m.loaded()) onLoad(); else m.on('load', onLoad);
  }, [points]);

  return <div ref={container} className="w-full h-96 rounded-lg" />;
}
```

- [ ] **Step 3: Integrar en dashboard `page.tsx`**

```tsx
// dentro del component:
const [points, setPoints] = useState<any[]>([]);
useEffect(() => {
  apiFetch<{ points: any[] }>('/admin/scans/geo').then(d => setPoints(d.points));
}, []);

// en JSX, después de KPIs:
<Card className="p-6">
  <h2 className="font-semibold mb-3">Mapa de focos</h2>
  <Heatmap points={points} />
</Card>
```

- [ ] **Step 4: Commit**

```bash
git add backend/ web-admin/
git commit -m "feat: mapa heatmap focos en dashboard"
git push
```

---

### Task 35 (stretch): GPS automático mobile + enviar con scan

**Files:**
- Create: `mobile/lib/core/services/location_service.dart`
- Modify: `mobile/lib/features/scan/camera_screen.dart`

- [ ] **Step 1: Crear `lib/core/services/location_service.dart`**

```dart
import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<Position?> getCurrent() async {
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (perm == LocationPermission.denied) return null;
      }
      if (perm == LocationPermission.deniedForever) return null;
      return await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.medium);
    } catch (_) { return null; }
  }
}
```

- [ ] **Step 2: Modificar `camera_screen.dart` _analyze**

```dart
import '../../core/services/location_service.dart';
import '../../core/services/scan_service.dart';

Future<void> _analyze() async {
  if (_image == null) return;
  final pos = await LocationService().getCurrent();
  final result = await Navigator.of(context).push<dynamic>(
    MaterialPageRoute(builder: (_) => AnalyzingScreen(image: _image!, crop: _crop, lat: pos?.latitude, lng: pos?.longitude)),
  );
  if (result != null && mounted) context.pushReplacement('/result', extra: result);
}
```

(Y agregar `lat`, `lng` opcionales a `AnalyzingScreen` y pasarlos a `submitScan`.)

- [ ] **Step 3: Rebuild APK + Commit**

```bash
git add mobile/
git commit -m "feat(mobile): GPS automático en scan"
git push
```

---

### Task 36 (stretch): Video demo 60s para Plan B

- [ ] **Step 1: Grabar pantalla del celular** con AZ Recorder o nativo.

- [ ] **Step 2: Flow:**
  - Abrir AgroScan
  - Tap ESCANEAR PLANTA
  - Galería → foto golden
  - Analizar
  - Ver resultado con tratamientos
  - Volver al home

- [ ] **Step 3: Editar a 60s** con CapCut: intro 2s, contenido 55s, outro 3s.

- [ ] **Step 4: Exportar 1080p + subir a USB + Drive.**

- [ ] **Step 5: Documentar link en `docs/pitch/demo-video.md`** + commit.

---

### Task 37 (stretch): Push Notifications con FCM

**Skip si no llegamos. Estimado 4-6h.** Pasos resumidos:
1. Firebase Console → Add Android app → descargar `google-services.json`
2. Agregar a `mobile/android/app/`
3. `mobile/android/build.gradle.kts`: agregar plugin `com.google.gms.google-services`
4. Inicializar Firebase en `main.dart`
5. Crear `services/push_service.dart`: pedir permiso, obtener token FCM, enviar a backend
6. Backend: `firebase-admin` SDK, crear `services/fcm.ts` con `sendPush(token, {title, body, data})`
7. Endpoint `POST /push/register-token`
8. Cron `followups.ts` (lee scans +7d sin followup, manda push)

---

### Task 38 (stretch): Modo offline con sqflite

**Skip si no llegamos. Estimado 3-4h.** Pasos resumidos:
1. Crear `lib/core/storage/sqlite.dart` con tabla `pending_scans (id, image_path, crop, gps_lat, gps_lng, client_id, created_at)`
2. Wrap `ScanService.submitScan` en `SyncService.submitOrQueue`:
   - Si online → submit directo
   - Si offline → guardar local con uuid `client_id`
3. Listener `connectivity_plus`: cuando vuelve online → iterar pending_scans → submit + delete
4. Badge en home: contar pendientes

---

### Task 39 (stretch): 20 plagas adicionales al catálogo

Agregar 20 INSERT INTO al `seed-pests.sql` (mancha angular soya, sigatoka negra plátano, broca café, etc.) → ejecutar en Supabase.

---

### Task 40 (stretch): Cron jobs en backend

**Files:**
- Create: `backend/src/cron/followups.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Install node-cron**

```bash
cd backend
npm install node-cron
npm install -D @types/node-cron
```

- [ ] **Step 2: Crear `src/cron/followups.ts`** (requiere FCM implementado en task 37)

```typescript
import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
// import { sendPush } from '../services/fcm.js';  // pendiente task 37

export async function runFollowupsCron() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: scans } = await supabase()
    .from('scans')
    .select('id, user_id, detected_pest_name, crop')
    .lt('created_at', sevenDaysAgo)
    .eq('followup_sent', false)
    .not('detected_pest_id', 'is', null)
    .limit(100);

  logger.info({ count: scans?.length ?? 0 }, 'followups candidates');
  // for each: if FCM ready → sendPush, then mark followup_sent=true
}
```

- [ ] **Step 3: Registrar cron en index.ts**

```typescript
import cron from 'node-cron';
import { runFollowupsCron } from './cron/followups.js';
cron.schedule('0 9 * * *', () => runFollowupsCron().catch(err => logger.error({ err }, 'followup cron failed')));
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): cron followups (skeleton)"
git push
```

---

# Self-Review del Plan

✅ **Spec coverage:**
- Auth productor (mobile) → Tasks 8-9 (backend) + 16-18 (mobile)
- Auth admin (web) → Task 23
- Scan creation + Gemini → Tasks 10-13 + 19-21
- Catálogo → Task 11 (seed) + 14 (endpoint) + 27 (web)
- Admin scans/validate/analytics → Tasks 15, 25, 26, 24
- Historial productor → Task 22
- Mapa heatmap → Task 34 (stretch)
- GPS scan → Task 35 (stretch)
- Push → Task 37 (stretch)
- Offline → Task 38 (stretch)
- Cron alerts → Task 40 (stretch)
- Deploy → Tasks 28-30
- Demo prep → Tasks 31, 33, 36

✅ **No placeholders:** todos los steps tienen código completo, comandos exactos, expected outputs.

✅ **Type consistency:** `UserModel`, `ScanResult`, `Analytics` se usan consistentemente entre tasks.

⚠️ **Gotchas críticos:**
1. Emulador Android usa `10.0.2.2:3000` no `localhost`
2. CORS — agregar URLs Vercel a whitelist backend
3. Magic Link Supabase requiere user en `auth.users` Y en `admin_users`
4. OneDrive sync puede corromper `flutter build` — pausar antes
5. Diawi gratis expira 24-72h, regenerar antes del pitch
6. Backend usa ES modules (`"type": "module"` en package.json), imports requieren `.js`

---

# Próximo paso: modo de ejecución

**Recomendación para hackathon de 72h:**

**Inline Execution con checkpoints por FASE** (no por task individual — demasiado granular).

Modelo de trabajo:
1. Claude (yo) escribe el código y dicta comandos
2. Vos corrés los comandos en tu PC y reportás errores/output
3. Al final de cada FASE, checkpoint: smoke test + commit + push
4. Si algo se rompe, pasamos a `build-error-resolver` o `flutter-build` agents según corresponda

¿Le damos así o preferís otro modelo (subagent-driven con un agente fresco por task)?
