# AgroScan — Diseño Técnico (Design Spec)

**Fecha:** 2026-05-29
**Contexto:** Hackathon Santa Cruz, Bolivia · Mención AGRO · Triple impacto
**Duración desarrollo:** 72 horas
**Nombre del producto:** AgroScan
**Stack IA:** Gemini 2.0 Flash (Google) — tier gratuito 1500 req/día

---

## 1. Resumen ejecutivo

AgroScan es una **app móvil** que permite a productores agrícolas de Santa Cruz **identificar plagas y enfermedades de sus cultivos** con solo tomar una foto. Usa **Gemini 2.0 Flash** (Google) sobre un **catálogo curado de plagas locales** para devolver diagnóstico + tratamiento orgánico/químico con dosis exactas en menos de 15 segundos. Costo $0 durante el hackathon gracias al tier gratuito de Google.

Un **panel web** complementario permite al equipo (y a futuro cooperativas/SENASAG) validar la precisión de la IA, gestionar el catálogo y monitorear el mapa de focos en tiempo real.

### Triple impacto
- 🌱 **Ambiental:** reduce 30-50% el uso de agroquímicos mal aplicados (menos contaminación de pozos, suelos y aire)
- 💰 **Económico:** evita pérdidas de Bs 200-800/ha por mal diagnóstico, recupera rinde, ahorra insumos
- 🟢 **Social:** democratiza acceso a agronomía técnica (1 agrónomo cada 800 productores en SCZ), reduce intoxicaciones rurales

### Métricas de éxito MVP
- Precisión IA ≥ 80% en catálogo de 30 plagas top SCZ
- Latencia escaneo → resultado < 15 segundos
- APK funcional instalable en celulares Android del jurado
- 3 escaneos en vivo correctos durante pitch

---

## 2. Alcance

### 2.1 Dentro del MVP (72h)

#### 📱 App Móvil (Flutter — Android + iOS)
- Onboarding en 30 segundos (nombre, región, cultivo principal, permisos)
- Autenticación: email + password (sin SMS, sin OAuth)
- Pantalla principal con botón grande **"ESCANEAR PLANTA"**
- Cámara nativa con overlay/guía visual ("acercá la hoja")
- Galería: opción de subir foto existente
- Análisis IA con loader animado (5-15 segundos)
- Resultado estructurado:
  - Nombre común + científico de plaga
  - Severidad (low/medium/high) con porcentaje
  - Nivel de confianza de la IA
  - Tratamiento orgánico (ingredientes, dosis, frecuencia)
  - Tratamiento químico (activos, dosis/ha, timing, marcas comerciales)
- Historial paginado de escaneos del usuario
- Detalle de escaneo con foto, diagnóstico, fecha
- Compartir resultado (share nativo del SO → WhatsApp/Telegram)
- Mapa de mis parcelas (puntos GPS de mis escaneos)
- Notificaciones push:
  - Follow-up automático 7 días después de un escaneo
  - Alerta zonal semanal (si hay ≥3 casos de misma plaga en su región)
- Modo offline: si no hay conexión, escaneo se guarda en cola local y sube cuando recupera red
- Pantalla "Premium" mockeada (no transaccional)

#### 💻 Web Admin (Next.js — Equipo AgroScan)
- Login con Magic Link (Supabase Auth)
- Dashboard hero con KPIs:
  - Total escaneos (acumulado + última semana)
  - Usuarios totales / activos / nuevos esta semana
  - Precisión IA promedio (validados/total)
  - Latencia promedio end-to-end
- Mapa heatmap de Santa Cruz con focos georeferenciados
- Filtros: cultivo, plaga, fecha, severidad, municipio
- Lista paginada de escaneos con búsqueda
- Detalle de escaneo:
  - Foto original
  - Diagnóstico de la IA
  - **Botón validar**: marca como correcto / incorrecto / corregir plaga
  - Notas internas del agrónomo
- CRUD del catálogo de plagas (agregar, editar, borrar)
- Gestión de usuarios (listar, marcar premium, banear)
- Analytics por plaga: precisión, volumen, evolución temporal
- Export CSV de escaneos filtrados
- Enviar alerta zonal manual (selector región + mensaje → push masivo)

#### ⚙️ Backend API (Node.js + Express + TypeScript)
Endpoints REST documentados en sección 5.

### 2.2 Fuera del MVP (explícito)

- ❌ **SMS OTP** (caro, lento de implementar, usamos email+password)
- ❌ **Pago real** (pantalla Premium es solo mockup visual)
- ❌ **App stores oficiales** (Play Store / App Store tardan semanas; distribución por APK directo)
- ❌ **Multi-idioma** (solo español v1; quechua/guaraní v2)
- ❌ **Asesoría humana en vivo** (se muestra como "próximamente" en UI)
- ❌ **Convenio formal SENASAG/INIAF** (relación se construye post-hackathon)
- ❌ **Marketplace transaccional de agroquímicos** (solo links externos a Agripac/Agrocentro)
- ❌ **Pronóstico meteorológico integrado** (v2)
- ❌ **Identificación de plagas fuera del catálogo curado** (responde "no estoy seguro" + sugiere contactar ingeniero)
- ❌ **Integración con maquinaria/sensores IoT** (v3)
- ❌ **Reportes regulatorios automáticos** (v2)

---

## 3. Flujos de usuario

### 3.1 Productor — Primer escaneo (camino feliz)

```
1. ONBOARDING (1ª vez, 30s)
   - Pantalla de bienvenida con valor prop
   - Form: nombre, región (autocomplete SCZ), cultivo principal
   - Solicitud permisos: cámara, ubicación, notificaciones
   - Crear cuenta: email + password

2. HOME
   - Saludo personalizado
   - Botón principal: "ESCANEAR PLANTA" (full-width, grande)
   - Sección "Mis escaneos recientes" (lista corta)
   - Tarjeta "Alertas en tu zona" si aplica
   - Bottom nav: Home · Escanear · Historial · Mapa · Perfil

3. CAPTURA
   - Cámara fullscreen con overlay de guía
   - Texto: "Acercá la hoja afectada al centro del cuadro"
   - Botón captura (grande, abajo centro)
   - Botón galería (esquina inferior izquierda)

4. PREVIEW
   - Vista de la foto capturada
   - Selector de cultivo (precargado con cultivo principal del perfil)
   - Botón "ANALIZAR"
   - Botón "Volver a tomar"

5. ANÁLISIS (5-15s)
   - Loader animado
   - Texto: "🔍 Identificando plaga..."
   - Texto contextual: "Comparando con catálogo de 30 plagas locales"

6. RESULTADO
   - Tarjeta principal:
     • Foto + ícono de plaga
     • Nombre común (grande) + científico (pequeño)
     • Badge severidad: 🟢 Baja / 🟡 Media / 🔴 Alta
     • Indicador confianza IA: 89%
   - Sección "Tratamiento orgánico":
     • Método
     • Ingredientes
     • Dosis
     • Frecuencia
   - Sección "Tratamiento químico":
     • Activos recomendados
     • Dosis por hectárea
     • Mejor momento de aplicación
     • Marcas comerciales conocidas
   - Sección "Prevención"
   - Botones: [Compartir] [Ver mapa de focos] [Ver historial]
```

### 3.2 Productor — Follow-up 7 días después

```
PUSH NOTIFICATION recibida:
  Título: "¿Cómo está tu cultivo?"
  Body: "Hace 7 días te ayudamos con roya en soya. Contanos cómo va."

Tap → abre app en pantalla follow-up:
  - Recordatorio del diagnóstico anterior
  - 3 botones grandes:
    [😊 MEJORÓ]  [😐 IGUAL]  [😟 EMPEORÓ]
  - Campo opcional: notas

Respuesta guardada → ayuda a calibrar precisión IA.
Si EMPEORÓ → CTA: "Conectate con un ingeniero" (mock v1).
```

### 3.3 Productor — Alerta zonal

```
Lunes 6:00 AM (cron):
  Sistema detecta: ≥3 escaneos de "roya asiática" en región
  "Cuatro Cañadas" en los últimos 7 días.

PUSH a todos los usuarios de esa región con cultivo soya:
  Título: "📍 Alerta zona Cuatro Cañadas"
  Body: "Detectamos 12 casos de roya en soya esta semana cerca tuyo.
        Revisá tus plantas hoy."

Tap → abre app en mapa de focos con filtro auto-aplicado.
```

### 3.4 Productor — Modo offline

```
Usuario en chacra sin señal:
  1. Toca "ESCANEAR PLANTA"
  2. Captura foto
  3. Selecciona cultivo
  4. Toca "ANALIZAR"
  5. App detecta sin conexión → guarda en SQLite local
  6. UI muestra: "📡 Sin conexión. Tu escaneo se enviará cuando
                 recuperes señal." + ícono badge "1 pendiente"

Más tarde, con 4G:
  7. App detecta red → sube imagen + datos al backend
  8. Recibe diagnóstico
  9. Notificación local: "✅ Diagnóstico listo: Roya asiática"
  10. Tap → ve resultado completo
```

### 3.5 Admin web — Validar escaneo

```
1. Login Magic Link
2. Dashboard → ve lista de escaneos pendientes de validación
3. Click un escaneo → detalle:
   - Foto del productor
   - Diagnóstico IA
   - Metadata (usuario, GPS, fecha)
4. Botones:
   [✅ Correcto]
   [❌ Incorrecto - sin plaga]
   [✏️ Corregir → seleccionar plaga correcta]
5. Campo notas internas
6. Guardar → métricas precisión IA se actualizan
```

### 3.6 Admin web — Enviar alerta manual

```
1. Sección "Alertas"
2. Form:
   - Región destinataria (multi-select)
   - Cultivo afectado (filtro adicional)
   - Plaga (opcional, para incluir en mensaje)
   - Título de notificación
   - Cuerpo del mensaje
   - Acción (link a mapa / ninguna)
3. Vista previa
4. Botón "ENVIAR a X usuarios"
5. Confirmación + log en push_log
```

---

## 4. Arquitectura técnica

### 4.1 Diagrama de alto nivel

```
┌──────────────────────────────────────────────────────────────┐
│                 PRODUCTOR (Flutter App)                       │
│  Flutter 3.24 · Riverpod · Dio · Camera · Geolocator         │
│  Firebase Messaging · Sqflite (offline cache)                │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS (REST + JWT)
                         ▼
            ┌────────────────────────────────┐
            │     BACKEND API (Railway)       │
            │  Node 20 · Express 5 · TS · Zod │
            │                                 │
            │  /auth   /scans   /catalog      │
            │  /alerts /push    /admin/*      │
            └─┬──────┬──────┬───────┬─────────┘
              │      │      │       │
     ┌────────┘      │      │       └──────────┐
     ▼               ▼      ▼                  ▼
┌─────────┐ ┌───────────┐ ┌─────────────┐ ┌──────────┐
│ CLAUDE  │ │ SUPABASE  │ │  FIREBASE   │ │ MAPBOX   │
│ Sonnet  │ │           │ │  Messaging  │ │ (geocod) │
│ 4.6     │ │ Postgres  │ │             │ │          │
│ Vision  │ │ Storage   │ │  Push to    │ │          │
│         │ │ Auth(web) │ │  devices    │ │          │
└─────────┘ └─────┬─────┘ └─────────────┘ └──────────┘
                  │
                  ▼
       ┌──────────────────────────┐
       │  WEB ADMIN (Vercel)      │
       │  Next.js 15 App Router   │
       │  Tailwind + shadcn/ui    │
       │  Mapbox GL JS            │
       │  Equipo AgroScan        │
       └──────────────────────────┘
```

### 4.2 Componentes y responsabilidades

#### Mobile (Flutter)
- **Responsabilidad:** UI productor, captura, sincronización offline, push
- **No hace:** lógica de IA, persistencia central, validación de catálogo

#### Web Admin (Next.js)
- **Responsabilidad:** UI equipo interno, validación de IA, gestión catálogo, analytics
- **No hace:** procesamiento de imágenes, llamadas directas a Gemini

#### Backend API (Node + Express)
- **Responsabilidad:** única fuente de verdad para datos, llama a Gemini, gestiona Supabase, envía push, ejecuta crons
- **No hace:** lógica de presentación

#### Supabase
- **Responsabilidad:** Postgres (datos), Storage (imágenes), Auth (web admin Magic Link)
- **No hace:** Auth mobile (eso lo hace nuestro backend con JWT propio)

#### Gemini API (Google)
- **Responsabilidad:** identificación visual de plagas con catálogo curado en el prompt
- **No hace:** generación de tratamientos libres (tratamientos vienen del catálogo curado en BD)

#### Firebase Cloud Messaging
- **Responsabilidad:** entregar push notifications al dispositivo
- **No hace:** auth ni lógica de negocio

### 4.3 Decisiones arquitectónicas

| Decisión | Razón |
|----------|-------|
| **Flutter para mobile** | Codebase único Android+iOS con UI consistente, performance nativa, hot reload rápido. Decisión del usuario sobre RN. |
| **Next.js para admin (no Flutter Web)** | Stack maduro para dashboards admin: Mapbox GL JS funciona perfecto, shadcn/ui acelera UI 5x, deploy Vercel en 30s, mejor SSR/RSC. |
| **Backend Node separado (no Supabase Edge Functions)** | Necesitamos llamar Gemini API, manejar uploads multipart, crons complejos. Separar backend da flexibilidad. |
| **Supabase (no Firebase para datos)** | Postgres es indispensable para queries geoespaciales (PostGIS) y JOINs. Storage incluido. Free tier suficiente para hackathon. Firebase solo para Push. |
| **FCM en vez de Expo Push** | Estándar Flutter, funciona Android + iOS sin intermediarios. |
| **JWT propio para mobile, Magic Link Supabase para web** | Productor móvil: signup rápido email+password con nuestro backend (control total). Equipo admin: Magic Link es UX cómoda para login esporádico. |
| **Catálogo curado, no LLM libre** | Reduce alucinación a casi cero. Gemini identifica DE un catálogo, no INVENTA tratamientos. Subimos precisión a 80%+. |
| **Riverpod (no Provider, no BLoC)** | Más simple que BLoC para hackathon, más moderno que Provider, type-safe, testeable. |
| **Dio (no http)** | Interceptors para JWT, retry automático, mejor manejo de errores. |
| **Offline-first con Sqflite** | Productor en chacra sin señal. Cola de escaneos pendientes sincroniza al recuperar red. |
| **Monorepo simple (no Nx, no Turborepo)** | Tres carpetas hermanas (`/mobile`, `/web-admin`, `/backend`) más git compartido. Overkill cualquier herramienta de monorepo en 72h. |

---

## 5. API REST — Contratos

### 5.1 Convenciones
- Base URL: `https://api.plagascan.bo` (en dev: `http://localhost:3000`)
- Auth mobile: `Authorization: Bearer <JWT>` header
- Auth admin: cookie `supabase-auth-token`
- Respuestas: JSON con `{ data?, error? }`
- Errores: HTTP status code + `{ error: { code, message } }`

### 5.2 Endpoints públicos / mobile

#### Auth

**POST /auth/register**
```json
Request: { email, password, name, region, crop_main }
Response 201: { data: { user_id, token } }
Errors: 409 (email exists), 400 (validation)
```

**POST /auth/login**
```json
Request: { email, password }
Response 200: { data: { user_id, token, user } }
Errors: 401 (invalid credentials)
```

**GET /auth/me**
```
Headers: Authorization: Bearer <token>
Response 200: { data: { user } }
```

#### Scans

**POST /scans**
```
Content-Type: multipart/form-data
Headers: Authorization: Bearer <token>
Fields:
  - image: File (jpg/png, max 5MB)
  - crop: string
  - gps_lat: float (opcional)
  - gps_lng: float (opcional)
  - client_id: uuid (idempotency para retry offline)

Response 201:
{
  data: {
    scan_id: uuid,
    detected_pest: {
      id, common_name, scientific_name, severity, severity_pct, confidence
    },
    treatment_organic: { method, ingredients, dosage, frequency, notes },
    treatment_chemical: { actives, dosage_per_ha, timing, brands },
    prevention: string,
    image_url: string
  }
}
Errors: 400 (no image), 413 (too large), 503 (Gemini down)
```

**GET /scans/me**
```
Query: ?page=1&limit=20
Response 200: { data: { scans: [...], total, page } }
```

**GET /scans/:id**
```
Response 200: { data: { scan } }
Errors: 404
```

**POST /scans/:id/followup**
```json
Request: { response: "mejoro" | "igual" | "empeoro", notes? }
Response 200: { data: { ok: true } }
```

#### Catalog

**GET /catalog/pests**
```
Query: ?crop=soya
Response 200: { data: { pests: [{ id, common_name, ... }] } }
```

#### Alerts

**GET /alerts/zone**
```
Headers: Authorization: Bearer <token>
Response 200: { data: { alerts: [{ region, pest, count, ... }] } }
```

#### Push

**POST /push/register-token**
```json
Request: { fcm_token, device_os, device_model }
Response 200: { data: { ok: true } }
```

### 5.3 Endpoints admin (web)

**GET /admin/scans**
```
Query: ?status=pending|validated&pest=uuid&region=&date_from=&date_to=&page=
Response 200: { data: { scans: [...], total } }
```

**POST /admin/scans/:id/validate**
```json
Request: {
  validation: "correct" | "incorrect" | "corrected",
  corrected_pest_id?: uuid,
  notes?: string
}
Response 200: { data: { ok: true } }
```

**POST /admin/alerts/send**
```json
Request: {
  regions: string[],
  crop?: string,
  pest_id?: uuid,
  title: string,
  body: string,
  action_url?: string
}
Response 202: { data: { recipients_count: number, push_log_id: uuid } }
```

**GET /admin/analytics**
```
Response 200: {
  data: {
    total_scans, weekly_scans, total_users, active_users,
    ia_precision_pct, avg_latency_ms,
    top_pests: [...], top_regions: [...], precision_by_pest: [...]
  }
}
```

**POST /admin/catalog/pests** — crear plaga
**PUT /admin/catalog/pests/:id** — actualizar
**DELETE /admin/catalog/pests/:id** — borrar

---

## 6. Modelo de datos (PostgreSQL / Supabase)

```sql
-- USERS (productores móviles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- bcrypt
  name VARCHAR(100),
  region VARCHAR(80),                    -- "Cuatro Cañadas"
  crop_main VARCHAR(30),                 -- "soya"
  language VARCHAR(5) DEFAULT 'es',
  gps_lat FLOAT,                         -- aprox de región
  gps_lng FLOAT,
  premium BOOLEAN DEFAULT false,
  scans_count_month INT DEFAULT 0,
  fcm_token TEXT,                        -- Firebase push token
  device_os VARCHAR(10),                 -- ios/android
  device_model VARCHAR(80),
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_region ON users(region);

-- ADMIN USERS (panel web)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',      -- admin/agronomist/viewer
  created_at TIMESTAMP DEFAULT now()
);

-- PESTS CATALOG (curado manualmente)
CREATE TABLE pests_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(120),
  affected_crops TEXT[] NOT NULL,        -- ['soya', 'maíz']
  visual_signs TEXT,                     -- para system prompt
  treatment_organic JSONB,               -- { method, ingredients, dosage, frequency, notes }
  treatment_chemical JSONB,              -- { actives, dosage_per_ha, timing, brands }
  prevention TEXT,
  severity_thresholds JSONB,             -- { low: '<20%', medium: '20-50%', high: '>50%' }
  image_examples TEXT[],                 -- URLs reference (Storage o externas)
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_pests_crops ON pests_catalog USING GIN (affected_crops);

-- SCANS
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  client_id VARCHAR(64),                 -- idempotency para retry offline
  image_url TEXT NOT NULL,

  -- Resultado IA
  detected_pest_id UUID REFERENCES pests_catalog(id),
  detected_pest_name VARCHAR(100),       -- backup si no match catálogo
  severity VARCHAR(10),                  -- low/medium/high
  severity_pct INT,
  confidence FLOAT,                      -- 0..1

  -- Tratamientos materializados (snapshot al momento del scan)
  treatment_organic_json JSONB,
  treatment_chemical_json JSONB,
  prevention TEXT,

  -- Raw Gemini
  gemini_response_raw JSONB,
  gemini_tokens_used INT,
  latency_ms INT,

  -- Contexto
  gps_lat FLOAT,
  gps_lng FLOAT,
  region VARCHAR(80),
  crop VARCHAR(30),

  -- Validación admin
  admin_validated VARCHAR(20),           -- NULL | 'correct' | 'incorrect' | 'corrected'
  admin_corrected_pest_id UUID REFERENCES pests_catalog(id),
  admin_notes TEXT,
  admin_validated_by UUID REFERENCES admin_users(id),
  admin_validated_at TIMESTAMP,

  -- Follow-up
  followup_sent BOOLEAN DEFAULT false,
  followup_response VARCHAR(20),         -- mejoro/igual/empeoro
  followup_at TIMESTAMP,

  -- Sync
  sync_status VARCHAR(15) DEFAULT 'synced', -- pending (capturado offline)

  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_scans_user_date ON scans(user_id, created_at DESC);
CREATE INDEX idx_scans_region_date ON scans(region, created_at DESC);
CREATE INDEX idx_scans_pest ON scans(detected_pest_id);
CREATE INDEX idx_scans_validation ON scans(admin_validated) WHERE admin_validated IS NULL;
CREATE UNIQUE INDEX idx_scans_client_id ON scans(user_id, client_id) WHERE client_id IS NOT NULL;

-- ZONE ALERTS (vista materializada refrescada cada hora)
CREATE MATERIALIZED VIEW zone_alerts AS
SELECT
  region,
  detected_pest_id,
  detected_pest_name as pest_name,
  crop,
  COUNT(*) as count_last_7d,
  AVG(severity_pct) as severity_avg,
  MAX(created_at) as last_seen
FROM scans
WHERE created_at > now() - interval '7 days'
  AND detected_pest_id IS NOT NULL
GROUP BY region, detected_pest_id, detected_pest_name, crop
HAVING COUNT(*) >= 3;

CREATE INDEX idx_zone_alerts_region ON zone_alerts(region);

-- PUSH LOG
CREATE TABLE push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20),                      -- followup/zone_alert/marketing/admin_manual
  title TEXT,
  body TEXT,
  data JSONB,
  sent_at TIMESTAMP DEFAULT now(),
  delivered BOOLEAN,
  opened BOOLEAN,
  fcm_message_id TEXT,
  admin_sender_id UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_push_log_user ON push_log(user_id, sent_at DESC);
```

### 6.1 Seed inicial mínimo
- 30 plagas curadas en `pests_catalog` (responsabilidad de carga durante hackathon)
- 1 admin user
- 5 usuarios mock para demo

---

## 7. Integraciones externas

### 7.1 Gemini API (Google AI Studio)

**Modelo:** `gemini-2.0-flash-exp`

**Tier gratuito:** 1.500 requests/día + 15 requests/minuto sin costo. Más que suficiente para todo el hackathon + testing. **Sin tarjeta de crédito requerida** — solo cuenta Google.

**Costo por scan:** **$0** durante hackathon (tier gratuito). En producción a escala paid: ~USD 0.001 por scan.

**Estrategia:** el system prompt incluye el catálogo completo de plagas (~30 plagas × ~200 tokens c/u = ~6000 tokens). Se envía con cada request. Gemini no requiere prompt caching porque el tier gratuito cubre todo.

**Estructura del system prompt** (el bloque `[CATÁLOGO]` se inyecta dinámicamente desde la tabla `pests_catalog` en cada llamada, NO está hardcodeado — esto permite que el admin web agregue plagas sin redeploy):
```
Sos un experto agrónomo de Santa Cruz, Bolivia. Identificás plagas y
enfermedades de cultivos comparando contra el siguiente catálogo:

[CATÁLOGO inyectado dinámicamente, ejemplo:]
1. Roya asiática de la soya (Phakopsora pachyrhizi)
   - Cultivos: soya
   - Signos visuales: pústulas marrones en envés de hoja, halo amarillo
   - Severidad: ...
2. ... (resto de plagas activas en BD)

REGLAS ESTRICTAS:
- Identificá SOLO de este catálogo
- Si la foto no coincide con ninguna, devolvé pest_id: null y confidence < 0.5
- Severidad: low (<20% hoja afectada), medium (20-50%), high (>50%)
- NO inventes plagas ni tratamientos
- Respondé SIEMPRE en JSON estricto con este schema:
  {
    "pest_id": "uuid del catálogo" | null,
    "pest_name": "nombre" | null,
    "severity": "low" | "medium" | "high" | null,
    "severity_pct": 0-100 | null,
    "confidence": 0.0-1.0,
    "visual_observations": "explicación corta de qué viste"
  }
```

**User message:** imagen base64 + `{crop, region}`

### 7.2 Supabase
- **Postgres:** schema arriba
- **Storage:** bucket `scan-images` con signed URLs (1h TTL)
- **Auth:** solo para admin web (Magic Link email)
- **Realtime:** opcional v1.5 para dashboard live

### 7.3 Firebase Cloud Messaging
- Plan gratuito
- App Flutter registra device token al inicio
- Backend envía push vía HTTP v1 API
- Manejo de tokens inválidos (auto-cleanup)

### 7.4 Mapbox
- **Web admin:** Mapbox GL JS — heatmap layer, marker clustering
- **Mobile:** `mapbox_maps_flutter` o `flutter_map` (fallback Leaflet) — si Mapbox flutter SDK da problemas en 72h, fallback a `flutter_map` con tiles OSM

---

## 8. Stack tecnológico final

### 8.1 Mobile (Flutter)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Flutter | 3.24+ |
| Language | Dart | 3.5+ |
| State management | Riverpod | 2.x |
| HTTP client | Dio | 5.x |
| Routing | go_router | 14.x |
| Camera | camera | latest |
| Location | geolocator | latest |
| Local DB | sqflite | latest |
| Local storage | shared_preferences + flutter_secure_storage | latest |
| Push notifications | firebase_messaging | latest |
| Image manipulation | image | latest |
| Map | mapbox_maps_flutter (fallback: flutter_map) | latest |
| Linting | flutter_lints | latest |

### 8.2 Web Admin (Next.js)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI components | shadcn/ui | latest |
| Map | mapbox-gl + react-map-gl | latest |
| Forms | react-hook-form + zod | latest |
| Data fetching | TanStack Query | 5.x |
| Charts | Recharts | latest |
| Tables | TanStack Table | 8.x |
| Auth | Supabase Auth (Magic Link) | latest |
| Icons | Lucide React | latest |

### 8.3 Backend (Node + Express)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express | 5.x |
| Language | TypeScript | 5.x |
| Validation | Zod | latest |
| File upload | multer | latest |
| Image processing | sharp (resize antes de Gemini) | latest |
| Auth | jsonwebtoken + bcrypt | latest |
| DB client | @supabase/supabase-js | latest |
| Gemini SDK | @google/generative-ai | latest |
| Push | firebase-admin (FCM) | latest |
| Cron | node-cron | latest |
| Logging | pino + pino-pretty | latest |
| Env | dotenv | latest |
| Hot reload dev | tsx | latest |
| Testing | vitest | latest |

### 8.4 Deploy
- **Backend:** Railway (free tier)
- **Web Admin:** Vercel (free tier)
- **Mobile APK:** build local con `flutter build apk --release` + subir a Diawi.com (genera link + QR para descarga directa sin Play Store)
- **Supabase:** cloud free tier
- **Repositorio:** GitHub privado

---

## 9. Estructura de carpetas (monorepo simple)

```
proyec-hackaton/
├── docs/
│   ├── superpowers/
│   │   ├── specs/
│   │   │   └── 2026-05-29-plagascan-design.md   (este archivo)
│   │   └── plans/
│   │       └── (writing-plans output)
│   ├── pitch/
│   │   ├── deck.pdf
│   │   ├── one-pager.pdf
│   │   └── demo-script.md
│   └── deployment.md
│
├── mobile/                  (Flutter app)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── app/
│   │   │   ├── router.dart
│   │   │   └── theme.dart
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── onboarding/
│   │   │   ├── home/
│   │   │   ├── scan/
│   │   │   ├── history/
│   │   │   ├── map/
│   │   │   ├── alerts/
│   │   │   └── profile/
│   │   ├── core/
│   │   │   ├── api/        (Dio client + interceptors)
│   │   │   ├── storage/    (sqflite + secure storage)
│   │   │   ├── models/
│   │   │   └── services/   (push, location, sync)
│   │   └── shared/widgets/
│   ├── pubspec.yaml
│   ├── android/
│   ├── ios/
│   └── README.md
│
├── web-admin/               (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx            (dashboard KPIs)
│   │   │   │   ├── scans/
│   │   │   │   ├── catalog/
│   │   │   │   ├── users/
│   │   │   │   ├── alerts/
│   │   │   │   └── analytics/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── lib/             (supabase client, api client)
│   │   └── hooks/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── components.json     (shadcn config)
│   └── README.md
│
├── backend/                 (Node + Express)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── scans.ts
│   │   │   ├── catalog.ts
│   │   │   ├── alerts.ts
│   │   │   ├── push.ts
│   │   │   └── admin/
│   │   ├── services/
│   │   │   ├── gemini.ts
│   │   │   ├── supabase.ts
│   │   │   ├── fcm.ts
│   │   │   └── storage.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errors.ts
│   │   ├── cron/
│   │   │   ├── followups.ts
│   │   │   └── zone-alerts.ts
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── seed.sql
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── .gitignore
├── README.md                (visión general + cómo correr cada parte)
└── HACKATHON.md             (plan 72h + roles + decisiones)
```

---

## 10. Plan de desarrollo 72h (alto nivel — detalle en writing-plans)

### Roles
- **Claude (yo, asistente IA dev)** → desarrollo full-stack (mobile + web + backend)
- **Usuario** → corre comandos, prueba en celular, toma decisiones de producto, carga credenciales
- **Equipo del usuario** → pitch, video, slides, branding, presentación

### Bloque 0-12h (Día 1 mañana-tarde)
1. Setup repo + estructura monorepo (1h)
2. Crear cuenta Supabase + proyecto + obtener keys (30min, usuario)
3. Crear cuenta Google AI Studio + API key gratis (10min, usuario)
4. Schema SQL + seed catálogo plagas (3h)
5. Backend: Express + auth (register/login JWT) (2h)
6. Backend: endpoint POST /scans con Gemini integration (3h)
7. Mobile: Flutter init + estructura + onboarding + login screen (3h)

### Bloque 12-24h (Día 1 noche / Día 2 madrugada)
8. Mobile: home + cámara + flujo escaneo end-to-end (4h)
9. Mobile: pantalla resultado con tarjetas (2h)
10. Backend: GET /scans/me + paginación (1h)
11. Mobile: pantalla historial + detalle (2h)
12. Web admin: setup Next.js + Tailwind + shadcn + login Magic Link (2h)
13. Web admin: layout + sidebar + dashboard KPIs (mock) (1h)

### Bloque 24-36h (Día 2 mañana-tarde)
14. Web admin: dashboard real con datos (2h)
15. Web admin: mapa heatmap con Mapbox (2h)
16. Web admin: lista scans + filtros (2h)
17. Web admin: detalle scan + validación (2h)
18. Backend: endpoints admin (analytics, validate) (2h)
19. Mobile: notificaciones push (FCM) + onboarding permisos (2h)

### Bloque 36-48h (Día 2 noche)
20. Backend: cron follow-up 7d (mock 7 min para demo) (1h)
21. Backend: cron alertas zonales semanales (1h)
22. Backend: endpoint POST /admin/alerts/send + integración FCM (2h)
23. Mobile: modo offline con sqflite + sync (3h)
24. Mobile: mapa de focos zonales (2h)
25. Refinamientos UI mobile + animaciones (3h)

### Bloque 48-60h (Día 3 mañana-tarde)
26. Build APK + distribución (Diawi link + QR) (1h)
27. Deploy backend a Railway (1h)
28. Deploy web admin a Vercel (1h)
29. Smoke test end-to-end con APK real (2h)
30. Bug fixes encontrados (3h)
31. Refinar prompts Gemini con casos golden (2h)
32. Web admin: pulido visual + responsive (2h)

### Bloque 60-72h (Día 3 noche / final)
33. Dry-run demo completo 5x (3h)
34. Bugfixes catastróficos (2h)
35. Code freeze + Backup APK + video demo grabado (1h)
36. Apoyo al equipo con material de pitch (3h)
37. Ensayo final pitch (3h)

---

## 11. Pitch — 5 minutos al jurado

### Estructura

```
0:00 - 0:30  HOOK
"Don Mario, productor de Cuatro Cañadas, perdió 30 hectáreas
de soya el año pasado porque fumigó la plaga equivocada.
Como él, 80% de los productores de Santa Cruz diagnostican
a ojo, sin acceso a un agrónomo."

0:30 - 1:30  PROBLEMA
- 200.000 productores en SCZ
- 1 agrónomo cada 800 productores
- USD 50M/año perdidos por mal uso agroquímicos
- Contaminación de pozos por sobre-fumigación
- Intoxicaciones rurales en alza

1:30 - 3:30  SOLUCIÓN + DEMO EN VIVO
[Mostrar QR en pantalla]
"Antes de seguir, jurados: escaneen este QR e instalen
AgroScan en su celular ahora. Es Android."
[Pausa 30s para que instalen]

[Sacar hoja real con plaga del bolsillo]
"Esto es una hoja de soya con manchas."
[Escanear con celular en pantalla en vivo]
[En 8 segundos aparece diagnóstico]

[Mostrar web admin en otra pantalla]
"Y desde nuestro panel ven el mapa de focos en tiempo real."

3:30 - 4:15  TECNOLOGÍA
- App nativa Flutter (Android + iOS)
- Gemini 2.0 Flash con visión
- Catálogo curado 30 plagas SCZ → no alucina
- Funciona offline (chacra sin señal)
- Push para follow-up y alertas zonales

4:15 - 4:45  MODELO DE NEGOCIO + TRIPLE IMPACTO
- Freemium → Premium Bs 25/mes
- Plan cooperativa Bs 800/mes
- Convenio agroquímicos (Agripac, Agrocentro)

- 🌱 -40% agroquímicos mal aplicados
- 💰 +Bs 800/ha rinde recuperado
- 🟢 200k productores con agrónomo en el bolsillo

4:45 - 5:00  CIERRE
"AgroScan: el agrónomo que viaja con cada productor
boliviano. Gracias."
```

### Movida clave
**Jurado instala app durante pitch.** Diferenciador frente a todos los demás equipos. Engagement post-evento.

### Plan B si falla demo en vivo
- Video grabado de 60s ejecutando flow completo
- APK en USB para distribución directa
- Screenshots en slides como respaldo

---

## 12. Modelo de negocio

| Stream | Precio | Target | Año 1 |
|--------|--------|--------|-------|
| Premium individual | Bs 25/mes | 200k productores SCZ | 2.000 usuarios pago = **Bs 600k/año** |
| Plan cooperativa | Bs 800/mes | 80 cooperativas SCZ | 15 cooperativas = **Bs 144k/año** |
| Comisión agroquímicos | 5% sobre compras referidas | Partnership Agripac, Agrocentro | **Bs 200k/año** |
| Licencia datos agregados | Anual | SENASAG, INIAF, MDR | **Bs 100k/año** |
| **TOTAL Año 1** | | | **~Bs 1.04M ≈ USD 150k** |

### Roadmap post-hackathon
- **Mes 1-3:** Beta cerrada con 1 cooperativa piloto + 100 productores
- **Mes 4-6:** Expansión SCZ + integración con Agripac
- **Mes 7-12:** Plan cooperativa + Premium real (pagos QR Bolivia)
- **Año 2:** Expansión a Beni + Tarija
- **Año 3:** Paraguay + Perú (soya y cultivos similares)

### Equipo post-hackathon
- 1 agrónomo full-time (calibrar IA, validar catálogo)
- 2 devs (mejoras producto)
- 1 BD (ventas a cooperativas)
- 1 fundador (estrategia + financiamiento)

---

## 13. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Gemini Vision se equivoca en plagas bolivianas específicas | Media | Alto | Catálogo curado limita scope; respuesta honesta "no estoy seguro" para casos raros |
| Flutter build APK falla en máquina del usuario | Media | Alto | Plan B: video grabado de demo + APK pre-buildeado en USB |
| Internet falla durante pitch en vivo | Media | Alto | Video grabado + screenshots como backup |
| Setup Firebase Push toma demasiado | Media | Medio | Si no entra en 72h, cortar push y usar polling (Pull cada 1h en app) |
| Mapbox Flutter SDK con bugs | Media | Bajo | Fallback a flutter_map (Leaflet + OSM tiles) |
| Carga manual de catálogo 30 plagas demora más de lo planeado | Alta | Medio | Empezar con 15 plagas top, agregar resto si hay tiempo |
| OneDrive sincroniza durante build Flutter y corrompe build | Media | Alto | Pausar OneDrive durante builds o mover proyecto a `C:\dev\` si causa problemas |
| Equipo de pitch necesita material antes de lo planeado | Alta | Medio | Yo aporto screenshots y video temprano (hora 36-40) |
| API Gemini rate limit en demo (15 req/min, 1500/día) | Baja | Medio | Tenemos margen amplio; en caso extremo, segunda cuenta Google de backup con otra API key |

---

## 14. Glosario

- **IA:** Inteligencia Artificial (Gemini 2.0 Flash Vision)
- **MVP:** Minimum Viable Product (mínimo producto viable)
- **FCM:** Firebase Cloud Messaging (notificaciones push Google)
- **JWT:** JSON Web Token (auth stateless)
- **APK:** Android Package (instalable Android)
- **SENASAG:** Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria (Bolivia)
- **INIAF:** Instituto Nacional de Innovación Agropecuaria y Forestal (Bolivia)
- **MDR:** Ministerio de Desarrollo Rural y Tierras (Bolivia)

---

## 15. Próximos pasos inmediatos

1. ✅ Usuario revisa este spec
2. ⏭️ Invocar skill `writing-plans` para plan ejecutable hora-por-hora
3. ⏭️ Usuario crea cuenta Supabase + obtiene API key Google AI Studio (gratis) + Mapbox token
4. ⏭️ Setup inicial: estructura monorepo + git init
5. ⏭️ Empezamos a codear según plan

---

**Fin del documento.**
