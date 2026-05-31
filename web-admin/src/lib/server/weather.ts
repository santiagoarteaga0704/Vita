/**
 * Pronóstico climático vía Open-Meteo (gratis, sin API key).
 *
 * Usado para dos cosas:
 *   1. Decisión post-scan: "no fumigues si llueve en las próximas X horas"
 *   2. Contexto para el chat con Gemini ("hoy hay 80% humedad y mañana lluvia")
 *
 * https://open-meteo.com/en/docs
 */

interface OpenMeteoResponse {
  hourly?: {
    time: string[];
    precipitation: number[];      // mm
    temperature_2m: number[];     // °C
    relative_humidity_2m: number[]; // %
    wind_speed_10m: number[];     // km/h
  };
}

export interface WeatherWindow {
  /** Próximas N horas resumidas para tomar decisión */
  next_hours: WeatherHour[];
  /** Total mm de lluvia en las próximas window_h horas */
  rain_total_mm: number;
  /** Próxima hora con lluvia >= 0.5mm, o null si no llueve */
  next_rain_at: string | null;
  /** Si el activo del plaguicida necesita N horas sin lluvia para "secar", ¿alcanza? */
  ok_to_spray: boolean;
  /** Mejor día para fumigar (sin lluvia significativa N horas después) */
  recommended_day: string | null;
  /** Resumen humano corto para mostrar */
  summary: string;
  /** Coordenadas reales usadas */
  lat: number;
  lng: number;
}

export interface WeatherHour {
  time: string;
  temperature_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  wind_kmh: number;
}

/** Coordenadas aproximadas de regiones agrícolas SCZ */
const REGION_COORDS: Record<string, [number, number]> = {
  'Santa Cruz': [-17.78, -63.18],
  'Cuatro Cañadas': [-17.27, -62.65],
  'Pailón': [-17.65, -62.74],
  'San Julián': [-17.84, -62.66],
  'Warnes': [-17.52, -63.17],
  'La Guardia': [-17.89, -63.32],
  'Montero': [-17.34, -63.26],
  'Yapacaní': [-17.39, -64.04],
  'Mineros': [-17.13, -63.21],
};

function coordsFor(region: string | null, fallbackLat?: number, fallbackLng?: number): [number, number] {
  if (typeof fallbackLat === 'number' && typeof fallbackLng === 'number') {
    return [fallbackLat, fallbackLng];
  }
  if (region && REGION_COORDS[region]) return REGION_COORDS[region];
  return REGION_COORDS['Santa Cruz']; // default
}

export async function getWeatherWindow(opts: {
  region?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  /** Horas críticas post-fumigación que el activo necesita para "fijarse" */
  rain_warn_hours?: number;
  /** Cuántas horas hacia adelante mirar para sugerir un día seco */
  lookahead_hours?: number;
}): Promise<WeatherWindow> {
  const rainWarn = opts.rain_warn_hours ?? 24;
  const lookahead = Math.max(opts.lookahead_hours ?? 96, rainWarn + 24);

  const [lat, lng] = coordsFor(
    opts.region ?? null,
    opts.gps_lat ?? undefined,
    opts.gps_lng ?? undefined,
  );

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m');
  url.searchParams.set('forecast_days', String(Math.ceil(lookahead / 24) + 1));
  url.searchParams.set('timezone', 'America/La_Paz');

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const data = (await res.json()) as OpenMeteoResponse;
  const h = data.hourly;
  if (!h) throw new Error('open-meteo missing hourly');

  const hours: WeatherHour[] = h.time.slice(0, lookahead).map((t, i) => ({
    time: t,
    temperature_c: h.temperature_2m[i],
    humidity_pct: h.relative_humidity_2m[i],
    precipitation_mm: h.precipitation[i],
    wind_kmh: h.wind_speed_10m[i],
  }));

  const critical = hours.slice(0, rainWarn);
  const rain_total_mm = critical.reduce((s, x) => s + x.precipitation_mm, 0);
  const next_rain = critical.find((x) => x.precipitation_mm >= 0.5);
  const ok_to_spray = rain_total_mm < 5;

  // Buscar el primer bloque de `rainWarn` horas consecutivas con <0.5mm cada hora
  let recommended_day: string | null = null;
  for (let i = 0; i < hours.length - rainWarn; i++) {
    const block = hours.slice(i, i + rainWarn);
    const total = block.reduce((s, x) => s + x.precipitation_mm, 0);
    if (total < 3) {
      recommended_day = hours[i].time;
      break;
    }
  }

  const summary = ok_to_spray
    ? rain_total_mm < 0.5
      ? `Sin lluvia previstas las próximas ${rainWarn} h. Podés fumigar.`
      : `Lluvia leve (${rain_total_mm.toFixed(1)} mm) pero manejable.`
    : next_rain
      ? `⚠ Lluvia ${next_rain.precipitation_mm.toFixed(1)} mm prevista para ${formatTime(next_rain.time)}. NO fumigar.`
      : `⚠ Total ${rain_total_mm.toFixed(1)} mm próximas ${rainWarn} h. Esperá.`;

  return {
    next_hours: hours.slice(0, 24),
    rain_total_mm,
    next_rain_at: next_rain?.time ?? null,
    ok_to_spray,
    recommended_day,
    summary,
    lat,
    lng,
  };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-BO', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}
