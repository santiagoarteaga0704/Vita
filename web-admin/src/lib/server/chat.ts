/**
 * Chat con Gemini en el contexto de un scan.
 *
 * El system prompt incluye:
 *   - Diagnóstico de la plaga + severidad + cultivo + región
 *   - Hectáreas del productor
 *   - Ventana climática (lluvia próximas 24h, día recomendado)
 *   - Tratamientos orgánico/químico
 *   - Cálculo económico (fumigar vs no)
 *
 * Esto es lo que hace que el chat "te conozca": no es un Gemini genérico,
 * es un agrónomo que ya leyó tu caso.
 */
import { GoogleGenerativeAI, Content } from '@google/generative-ai';

let _model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;
function model() {
  if (!_model) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('Missing GEMINI_API_KEY in env');
    _model = new GoogleGenerativeAI(key).getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.4 },
    });
  }
  return _model;
}

export interface ChatContext {
  pest_name: string | null;
  severity: string | null;
  confidence: number | null;
  crop: string | null;
  region: string | null;
  hectares: number | null;
  treatment_organic: unknown;
  treatment_chemical: unknown;
  prevention: string | null;
  economic: { cost_act_bob: number; cost_inaction_bob: number; recommendation: string } | null;
  weather: {
    rain_total_mm: number;
    next_rain_at: string | null;
    ok_to_spray: boolean;
    summary: string;
  } | null;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function systemPrompt(ctx: ChatContext): string {
  return [
    'Sos un agrónomo experto de Santa Cruz, Bolivia, conversando con un productor por chat de WhatsApp.',
    'Hablás en español rioplatense neutro (vos), corto, directo, sin jerga académica.',
    'NO repitas el diagnóstico salvo que el productor lo pida — él ya lo vio en pantalla.',
    'Respondé siempre en menos de 6 líneas. Si necesitás listar, máximo 3 bullets.',
    '',
    '--- CONTEXTO DE ESTE PRODUCTOR ---',
    `Cultivo: ${ctx.crop ?? '—'} en ${ctx.region ?? '—'}`,
    `Hectáreas: ${ctx.hectares ?? '—'}`,
    `Plaga detectada: ${ctx.pest_name ?? 'sin coincidencia clara'} (severidad ${ctx.severity ?? '—'}, confianza ${ctx.confidence ? Math.round(ctx.confidence * 100) : '—'}%)`,
    ctx.treatment_chemical ? `Tratamiento químico recomendado: ${JSON.stringify(ctx.treatment_chemical)}` : '',
    ctx.treatment_organic ? `Tratamiento orgánico recomendado: ${JSON.stringify(ctx.treatment_organic)}` : '',
    ctx.prevention ? `Prevención: ${ctx.prevention}` : '',
    ctx.economic
      ? `Cálculo económico: fumigar Bs ${ctx.economic.cost_act_bob}, no fumigar pérdida estimada Bs ${ctx.economic.cost_inaction_bob}. Recomendación: ${ctx.economic.recommendation}.`
      : '',
    ctx.weather
      ? `Clima próximas 24h: ${ctx.weather.summary}. Total lluvia: ${ctx.weather.rain_total_mm.toFixed(1)} mm. Apto para fumigar: ${ctx.weather.ok_to_spray ? 'sí' : 'NO'}.`
      : '',
    '--- FIN DEL CONTEXTO ---',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function chatTurn(ctx: ChatContext, history: ChatTurn[], userMessage: string): Promise<string> {
  const system = systemPrompt(ctx);
  const contents: Content[] = [
    { role: 'user', parts: [{ text: system }] },
    { role: 'model', parts: [{ text: 'Listo. ¿En qué te ayudo?' }] },
    ...history.map((h) => ({
      role: h.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: h.content }],
    })),
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ];

  const res = await model().generateContent({ contents });
  return res.response.text().trim();
}

/** Genera 3 sugerencias contextuales para mostrar como chips iniciales. */
export function defaultSuggestions(ctx: ChatContext): string[] {
  const out: string[] = [];
  if (ctx.weather && !ctx.weather.ok_to_spray) {
    out.push('¿Cuándo conviene fumigar entonces?');
  } else if (ctx.weather) {
    out.push('¿Conviene fumigar mañana?');
  }
  if (ctx.economic) {
    out.push(`¿Cuánto pierdo si no fumigo?`);
  }
  if (ctx.treatment_chemical) {
    out.push('¿Dónde compro el producto cerca mío?');
  }
  if (out.length < 3) {
    out.push('¿Esta plaga se contagia a otros lotes?');
  }
  return out.slice(0, 3);
}
