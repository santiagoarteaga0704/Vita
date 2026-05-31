'use client';
import { useMemo, useState } from 'react';
import { MapPin, Search, X, Navigation, Check, Loader2 } from 'lucide-react';
import {
  SCZ_LOCATIONS,
  searchLocations,
  type SczLocation,
} from '@/lib/scz-locations';
import { m } from '@/components/app-ui';

/**
 * Selector de ubicación tipo Google Places — sin mapa, solo autocompletado.
 *
 * UX:
 *   - Input grande. Mientras escribís → resultados con nombre + municipio/provincia.
 *   - Si no escribiste nada → lista de localidades populares de SCZ.
 *   - Botón "Usar mi ubicación" → toma GPS del browser y encuentra la
 *     localidad más cercana del dataset (haversine).
 *
 * Limpio, mobile-first, sin overhead visual. El mapa visual se reserva para
 * el panel admin (mapa de focos) y el resultado del scan.
 */

export interface SelectedLocation {
  name: string;
  municipality: string;
  province: string;
  lat: number;
  lng: number;
}

/** 8 localidades más buscadas/relevantes para mostrar cuando no hay query */
const POPULAR_NAMES = [
  'Cuatro Cañadas', 'Pailón', 'San Julián', 'Warnes',
  'La Guardia', 'Mairana', 'Los Negros', 'Yapacaní',
];

interface Props {
  value: SelectedLocation | null;
  onChange: (v: SelectedLocation) => void;
}

export function SczLocationPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const results = useMemo(() => {
    if (query.trim()) return searchLocations(query, 8);
    return [];
  }, [query]);

  const popular = useMemo(
    () =>
      POPULAR_NAMES.map((n) => SCZ_LOCATIONS.find((l) => l.name === n)).filter(
        Boolean,
      ) as SczLocation[],
    [],
  );

  const showDropdown = focused && (results.length > 0 || (!query.trim() && !value));
  const list = results.length ? results : popular;

  const pick = (loc: SczLocation) => {
    onChange({
      name: loc.name,
      municipality: loc.municipality,
      province: loc.province,
      lat: loc.lat,
      lng: loc.lng,
    });
    setQuery('');
    setFocused(false);
  };

  const useGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Tu navegador no permite ubicación');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Encontrar la localidad más cercana por distancia haversine
        let best = SCZ_LOCATIONS[0];
        let bestD = Infinity;
        for (const l of SCZ_LOCATIONS) {
          const d = haversine(latitude, longitude, l.lat, l.lng);
          if (d < bestD) {
            bestD = d;
            best = l;
          }
        }
        onChange({
          name: best.name,
          municipality: best.municipality,
          province: best.province,
          lat: latitude, // usamos la posición real del GPS
          lng: longitude,
        });
        setGpsLoading(false);
        setFocused(false);
      },
      (err) => {
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? 'Necesitamos permiso para usar tu ubicación'
            : 'No pudimos obtener tu ubicación',
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  };

  return (
    <div className="space-y-3">
      <span
        className="text-[11px] uppercase tracking-[0.18em] block"
        style={{ color: m.mute, fontFamily: 'var(--font-geist-mono)' }}
      >
        Ubicación de tu chacra
      </span>

      {/* Selección actual */}
      {value && !focused && (
        <button
          type="button"
          onClick={() => setFocused(true)}
          className="w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left transition-colors hover:bg-[#F1F6EA]"
          style={{ background: m.leafSoft, border: `1px solid #D7E3C2` }}
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
            style={{ background: m.leafDeep, color: m.bg }}
          >
            <Check className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate" style={{ color: m.leafDeep }}>
              {value.name}
            </p>
            <p className="text-xs truncate" style={{ color: m.mute }}>
              {value.municipality} · {value.province}
            </p>
          </div>
          <span
            className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
            style={{ color: m.mute, border: `1px solid ${m.line}`, fontFamily: 'var(--font-geist-mono)' }}
          >
            Cambiar
          </span>
        </button>
      )}

      {/* Buscador + GPS — visible siempre que no haya selección o cuando hagamos cambio */}
      {(!value || focused) && (
        <>
          <div className="relative">
            <Search
              className="absolute h-4 w-4 left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: m.mute }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Buscá: Los Negros, El Trigal, Cuatro Cañadas…"
              autoComplete="off"
              className="w-full pl-10 pr-10 py-3.5 rounded-xl text-base"
              style={{ background: m.paper, border: `1px solid ${m.line}`, color: m.ink }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: m.line, color: m.inkSoft }}
                aria-label="Limpiar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Botón GPS */}
          <button
            type="button"
            onClick={useGps}
            disabled={gpsLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-[#F1F6EA]"
            style={{
              background: m.paper,
              border: `1px solid ${m.line}`,
              color: m.leafDeep,
              opacity: gpsLoading ? 0.7 : 1,
            }}
          >
            {gpsLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Obteniendo ubicación…
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                Usar mi ubicación
              </>
            )}
          </button>

          {gpsError && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: m.copperSoft, color: '#7A3F0E' }}
            >
              {gpsError}
            </div>
          )}

          {/* Dropdown / lista de resultados */}
          {showDropdown && (
            <div>
              {!query.trim() && (
                <p
                  className="text-[10px] uppercase tracking-[0.18em] px-1 mb-2"
                  style={{ color: m.mute, fontFamily: 'var(--font-geist-mono)' }}
                >
                  Localidades populares
                </p>
              )}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${m.line}`, background: m.paper }}
              >
                {list.map((loc, i) => (
                  <button
                    key={`${loc.name}-${loc.lat}`}
                    type="button"
                    onClick={() => pick(loc)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#FBF8EE]"
                    style={{
                      borderBottom: i === list.length - 1 ? 'none' : `1px solid ${m.line}`,
                    }}
                  >
                    <MapPin
                      className="h-4 w-4 shrink-0"
                      style={{ color: m.leafDeep }}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-medium text-sm truncate"
                        style={{ color: m.ink }}
                      >
                        {loc.name}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: m.mute }}
                      >
                        {loc.municipality} · {loc.province}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {focused && query.trim() && results.length === 0 && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: m.copperSoft, color: '#7A3F0E' }}
            >
              No encontramos &ldquo;{query}&rdquo;. Probá con otra cercana o usá tu ubicación GPS.
            </div>
          )}

          {/* Hide / cancel cuando ya hay una selección */}
          {value && focused && (
            <button
              type="button"
              onClick={() => {
                setFocused(false);
                setQuery('');
              }}
              className="w-full text-center py-2 text-sm"
              style={{ color: m.mute }}
            >
              Mantener {value.name}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** Distancia haversine en km entre dos coords (lat,lng). */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
