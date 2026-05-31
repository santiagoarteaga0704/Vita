/**
 * DB local SQLite.
 *
 * Reemplazo de Supabase. Un único archivo `vita.db` en la raíz del
 * proyecto. La primera vez aplica el schema y siembra catálogo + admin.
 *
 * better-sqlite3 es síncrono (no devuelve promesas). En route handlers de
 * Next.js eso es perfectamente seguro — los handlers ya corren en su propio
 * worker y la operación SQLite local es de microsegundos.
 *
 * Helpers para serializar JSON / arrays porque SQLite no tiene tipo nativo:
 *   - toJson()   antes de insertar
 *   - parseJson() después de leer
 */
import Database, { Database as DB } from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';

let _db: DB | null = null;

const DB_PATH = path.join(process.cwd(), 'vita.db');
const SCHEMA_PATH = path.join(process.cwd(), 'sql', 'schema-sqlite.sql');
const SEED_PATH = path.join(process.cwd(), 'sql', 'seed-pests.json');

export function db(): DB {
  if (_db) return _db;
  const firstRun = !existsSync(DB_PATH);
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  if (firstRun) {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    _db.exec(schema);
    seedAll(_db);
    console.log('[db] initialized at', DB_PATH);
  }

  // Asegurar uploads dir
  const uploads = path.join(process.cwd(), 'storage', 'scan-images');
  if (!existsSync(uploads)) mkdirSync(uploads, { recursive: true });

  return _db;
}

/* ──────────────────────────────────────────
   Seed
   ────────────────────────────────────────── */

function seedAll(d: DB) {
  // Admin default
  const adminPass = bcrypt.hashSync('admin1234', 10);
  d.prepare(
    `INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, 'admin')`,
  ).run(randomUUID(), 'admin@vita.bo', adminPass, 'Admin Vita');

  // Pests catalog desde JSON
  if (existsSync(SEED_PATH)) {
    const pests = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));
    const insert = d.prepare(`
      INSERT INTO pests_catalog
        (id, common_name, scientific_name, affected_crops, visual_signs,
         treatment_organic, treatment_chemical, prevention, weather_risk, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    const tx = d.transaction((rows: SeedPest[]) => {
      for (const p of rows) {
        insert.run(
          p.id ?? randomUUID(),
          p.common_name,
          p.scientific_name ?? null,
          JSON.stringify(p.affected_crops),
          p.visual_signs ?? null,
          p.treatment_organic ? JSON.stringify(p.treatment_organic) : null,
          p.treatment_chemical ? JSON.stringify(p.treatment_chemical) : null,
          p.prevention ?? null,
          p.weather_risk ? JSON.stringify(p.weather_risk) : null,
        );
      }
    });
    tx(pests as SeedPest[]);
    console.log(`[db] seeded ${pests.length} pests`);
  }
}

interface SeedPest {
  id?: string;
  common_name: string;
  scientific_name?: string | null;
  affected_crops: string[];
  visual_signs?: string | null;
  treatment_organic?: unknown;
  treatment_chemical?: unknown;
  prevention?: string | null;
  weather_risk?: unknown;
}

/* ──────────────────────────────────────────
   JSON helpers
   ────────────────────────────────────────── */

export function toJson(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return JSON.stringify(value);
}

export function parseJson<T = unknown>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Parsea un row aplicando JSON.parse a las columnas indicadas. */
export function hydrate<T extends Record<string, unknown>>(
  row: T | undefined,
  jsonCols: (keyof T)[],
): T | undefined {
  if (!row) return undefined;
  const out: Record<string, unknown> = { ...row };
  for (const c of jsonCols) {
    out[c as string] = parseJson(out[c as string] as string | null);
  }
  return out as T;
}

export function hydrateMany<T extends Record<string, unknown>>(
  rows: T[],
  jsonCols: (keyof T)[],
): T[] {
  return rows.map((r) => hydrate(r, jsonCols)!);
}

/** Genera un UUID compatible con el resto del schema. */
export const uuid = randomUUID;
