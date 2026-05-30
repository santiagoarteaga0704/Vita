-- AgroScan — Schema SQL completo
-- Ejecutar en Supabase Dashboard → SQL Editor → Run

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (productores móviles)
-- ============================================
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

-- ============================================
-- ADMIN USERS (panel web)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- PESTS CATALOG (curado manualmente)
-- ============================================
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

-- ============================================
-- SCANS (escaneos del productor)
-- ============================================
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

-- ============================================
-- PUSH LOG
-- ============================================
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

-- ============================================
-- ZONE ALERTS (vista materializada)
-- ============================================
DROP MATERIALIZED VIEW IF EXISTS zone_alerts;
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

CREATE INDEX IF NOT EXISTS idx_zone_alerts_region ON zone_alerts(region);

-- ============================================
-- Admin user inicial
-- ============================================
INSERT INTO admin_users (email, name)
VALUES ('admin@agroscan.bo', 'Admin AgroScan')
ON CONFLICT (email) DO NOTHING;
