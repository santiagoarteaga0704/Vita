import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
});

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
    .map(
      (p, i) =>
        `${i + 1}. ${p.common_name}${p.scientific_name ? ` (${p.scientific_name})` : ''}\n   - id: ${p.id}\n   - Cultivos: ${p.affected_crops.join(', ')}\n   - Signos visuales: ${p.visual_signs ?? 'sin descripción'}`,
    )
    .join('\n');

  return `Sos un experto agrónomo de Santa Cruz, Bolivia. Identificás plagas y enfermedades de cultivos comparando contra el siguiente catálogo:

CATÁLOGO:
${catalogText}

REGLAS ESTRICTAS:
- Identificá SOLO de este catálogo
- Si la foto no coincide con ninguna plaga del catálogo, devolvé pest_id: null y confidence < 0.5
- Severidad: low (<20% de área afectada), medium (20-50%), high (>50%)
- NO inventes plagas que no estén en el catálogo
- Respondé SIEMPRE en JSON estricto con este schema:
{
  "pest_id": "uuid del catálogo o null",
  "pest_name": "nombre común o null",
  "severity": "low | medium | high | null",
  "severity_pct": "número 0-100 o null",
  "confidence": "número 0.0 a 1.0",
  "visual_observations": "descripción corta de lo que viste en la foto"
}

CONTEXTO DEL USUARIO:
- Cultivo: ${crop}
- Región: ${region}

Devolvé SOLO el JSON, sin texto adicional ni markdown.`;
}

export async function identifyPest(
  imageBase64: string,
  mimeType: string,
  catalog: PestCatalogEntry[],
  crop: string,
  region: string,
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
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }

  let parsed: GeminiPestResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    logger.warn({ rawText }, 'Gemini returned non-JSON, falling back');
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
