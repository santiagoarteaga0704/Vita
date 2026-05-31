-- Vita — Schema SQLite local
-- Convertido del schema Postgres. Diferencias clave:
--   - UUID → TEXT (generamos con crypto.randomUUID() en Node)
--   - JSONB → TEXT (guardamos JSON serializado, parseamos al leer)
--   - TEXT[] → TEXT (guardamos JSON array, parseamos al leer)
--   - TIMESTAMP DEFAULT now() → TEXT DEFAULT CURRENT_TIMESTAMP (ISO 8601)
--   - Materialized view → query en vivo (con 50 scans demo no hace falta cache)
--   - PRAGMA foreign_keys = ON al conectar

-- ============================================
-- USERS (productores que usan /app)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  region TEXT,                    -- nombre de la localidad (ej: "Los Negros")
  municipality TEXT,              -- ej: "Pampagrande"
  province TEXT,                  -- ej: "Florida"
  crop_main TEXT,
  hectares INTEGER,
  language TEXT DEFAULT 'es',
  gps_lat REAL,
  gps_lng REAL,
  premium INTEGER DEFAULT 0,
  scans_count_month INTEGER DEFAULT 0,
  last_active_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);

-- ============================================
-- ADMIN USERS (panel web)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PESTS CATALOG (curado)
-- affected_crops y los treatment_* son JSON serializados como TEXT
-- ============================================
CREATE TABLE IF NOT EXISTS pests_catalog (
  id TEXT PRIMARY KEY,
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  affected_crops TEXT NOT NULL,         -- JSON array
  visual_signs TEXT,
  treatment_organic TEXT,                -- JSON object
  treatment_chemical TEXT,               -- JSON object
  prevention TEXT,
  severity_thresholds TEXT,              -- JSON object
  image_examples TEXT,                   -- JSON array
  -- Diferenciador: condiciones climáticas que favorecen la plaga
  weather_risk TEXT,                     -- JSON: { humidity_min, temp_range, rain_post_application_warn_hours }
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SCANS
-- ============================================
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT,
  image_url TEXT NOT NULL,               -- ruta relativa local /storage/scan-images/...

  detected_pest_id TEXT REFERENCES pests_catalog(id),
  detected_pest_name TEXT,
  severity TEXT,                         -- low/medium/high
  severity_pct INTEGER,
  confidence REAL,

  treatment_organic_json TEXT,           -- JSON
  treatment_chemical_json TEXT,          -- JSON
  prevention TEXT,

  -- Económica: cálculo Bs vs no-acción para el lote del productor
  economic_json TEXT,                    -- JSON: { cost_act_bob, cost_inaction_bob, recommendation }

  -- Clima: ventana óptima de aplicación
  weather_window_json TEXT,              -- JSON: { rain_hours, recommended_day, warning }

  gemini_response_raw TEXT,              -- JSON
  gemini_tokens_used INTEGER,
  latency_ms INTEGER,

  gps_lat REAL,
  gps_lng REAL,
  region TEXT,
  crop TEXT,

  admin_validated TEXT,                  -- correct/incorrect/corrected
  admin_corrected_pest_id TEXT REFERENCES pests_catalog(id),
  admin_notes TEXT,
  admin_validated_by TEXT REFERENCES admin_users(id),
  admin_validated_at TEXT,

  followup_sent INTEGER DEFAULT 0,
  followup_response TEXT,
  followup_at TEXT,

  sync_status TEXT DEFAULT 'synced',

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_scans_user_date ON scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_region_date ON scans(region, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_pest ON scans(detected_pest_id);
CREATE INDEX IF NOT EXISTS idx_scans_validation ON scans(admin_validated) WHERE admin_validated IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_scans_client_id ON scans(user_id, client_id) WHERE client_id IS NOT NULL;

-- ============================================
-- SCAN CHATS — diferenciador: chat persistente por scan
-- ============================================
CREATE TABLE IF NOT EXISTS scan_chats (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                    -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_scan_chats_scan ON scan_chats(scan_id, created_at);

-- ============================================
-- COMPANIES (cooperativas / empresas B2B)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,                    -- cooperativa | agroempresa | gobierno
  region TEXT,
  members_count INTEGER DEFAULT 0,
  hectares_total INTEGER DEFAULT 0,
  hectares_registered INTEGER DEFAULT 0,
  hectares_registration_mode TEXT DEFAULT 'managed', -- managed | self
  plan TEXT DEFAULT 'piloto',
  mrr_bob INTEGER DEFAULT 0,
  pipeline_stage TEXT,
  health TEXT DEFAULT 'verde',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
