/**
 * Localidades del departamento de Santa Cruz (Bolivia).
 *
 * Dataset hardcodeado para que el selector funcione 100% local, sin
 * Nominatim ni Mapbox geocoder. Incluye capitales de municipio + localidades
 * agrícolas reconocidas. ~110 puntos.
 *
 * Coordenadas aprox (lat, lng) — calibradas para que el SVG del departamento
 * las muestre bien posicionadas. Si hace falta una localidad puntual que no
 * está, se agrega acá sin tocar nada más.
 *
 * Fuente: conocimiento general + INE 2024 (ranking por provincias).
 */
export interface SczLocation {
  name: string;
  municipality: string;
  province: string;
  lat: number;
  lng: number;
  /** Cultivos típicos de la zona (para sugerencias inteligentes) */
  crops?: string[];
}

export const SCZ_LOCATIONS: SczLocation[] = [
  /* ─── Andrés Ibáñez (capital) ─── */
  { name: 'Santa Cruz de la Sierra', municipality: 'Santa Cruz de la Sierra', province: 'Andrés Ibáñez', lat: -17.78, lng: -63.18, crops: ['soya', 'maíz'] },
  { name: 'La Guardia', municipality: 'La Guardia', province: 'Andrés Ibáñez', lat: -17.89, lng: -63.32, crops: ['soya', 'maíz', 'cítricos'] },
  { name: 'El Torno', municipality: 'El Torno', province: 'Andrés Ibáñez', lat: -17.97, lng: -63.38, crops: ['cítricos', 'caña'] },
  { name: 'Cotoca', municipality: 'Cotoca', province: 'Andrés Ibáñez', lat: -17.82, lng: -63.05, crops: ['soya', 'maíz', 'arroz'] },
  { name: 'Porongo', municipality: 'Porongo', province: 'Andrés Ibáñez', lat: -17.74, lng: -63.30, crops: ['cítricos', 'caña'] },

  /* ─── Warnes ─── */
  { name: 'Warnes', municipality: 'Warnes', province: 'Warnes', lat: -17.52, lng: -63.17, crops: ['soya', 'maíz', 'caña'] },
  { name: 'Okinawa Uno', municipality: 'Okinawa Uno', province: 'Warnes', lat: -17.18, lng: -62.95, crops: ['soya', 'arroz'] },
  { name: 'San Aurelio', municipality: 'Warnes', province: 'Warnes', lat: -17.54, lng: -63.19, crops: ['caña', 'soya'] },

  /* ─── Obispo Santistevan ─── */
  { name: 'Montero', municipality: 'Montero', province: 'Obispo Santistevan', lat: -17.34, lng: -63.26, crops: ['caña', 'soya'] },
  { name: 'Mineros', municipality: 'Mineros', province: 'Obispo Santistevan', lat: -17.13, lng: -63.22, crops: ['caña', 'soya', 'algodón'] },
  { name: 'General Saavedra', municipality: 'General Saavedra', province: 'Obispo Santistevan', lat: -17.23, lng: -63.20, crops: ['soya', 'caña'] },
  { name: 'Fernández Alonso', municipality: 'Fernández Alonso', province: 'Obispo Santistevan', lat: -17.18, lng: -63.30, crops: ['soya', 'caña'] },
  { name: 'San Pedro', municipality: 'San Pedro', province: 'Obispo Santistevan', lat: -16.98, lng: -63.40, crops: ['soya', 'algodón'] },

  /* ─── Sara ─── */
  { name: 'Portachuelo', municipality: 'Portachuelo', province: 'Sara', lat: -17.35, lng: -63.39, crops: ['caña', 'maíz'] },
  { name: 'Santa Rosa del Sara', municipality: 'Santa Rosa del Sara', province: 'Sara', lat: -17.10, lng: -63.58, crops: ['arroz', 'maíz'] },
  { name: 'Colpa Bélgica', municipality: 'Portachuelo', province: 'Sara', lat: -17.30, lng: -63.50, crops: ['caña'] },

  /* ─── Ichilo ─── */
  { name: 'Buena Vista', municipality: 'Buena Vista', province: 'Ichilo', lat: -17.46, lng: -63.67, crops: ['cítricos', 'cacao'] },
  { name: 'San Carlos', municipality: 'San Carlos', province: 'Ichilo', lat: -17.40, lng: -63.75, crops: ['cítricos', 'arroz'] },
  { name: 'Yapacaní', municipality: 'Yapacaní', province: 'Ichilo', lat: -17.39, lng: -64.05, crops: ['arroz', 'soya', 'cítricos'] },
  { name: 'San Juan de Yapacaní', municipality: 'San Juan de Yapacaní', province: 'Ichilo', lat: -17.20, lng: -63.83, crops: ['arroz', 'soya'] },

  /* ─── Ñuflo de Chávez ─── */
  { name: 'Concepción', municipality: 'Concepción', province: 'Ñuflo de Chávez', lat: -16.13, lng: -62.03, crops: ['soya', 'sorgo'] },
  { name: 'San Javier', municipality: 'San Javier', province: 'Ñuflo de Chávez', lat: -16.27, lng: -62.50, crops: ['soya', 'maíz'] },
  { name: 'San Ramón', municipality: 'San Ramón', province: 'Ñuflo de Chávez', lat: -16.71, lng: -62.69, crops: ['soya'] },
  { name: 'Cuatro Cañadas', municipality: 'Cuatro Cañadas', province: 'Ñuflo de Chávez', lat: -17.27, lng: -62.65, crops: ['soya', 'sorgo', 'maíz'] },
  { name: 'San Julián', municipality: 'San Julián', province: 'Ñuflo de Chávez', lat: -16.84, lng: -62.46, crops: ['soya', 'sorgo'] },
  { name: 'San Antonio de Lomerío', municipality: 'San Antonio de Lomerío', province: 'Ñuflo de Chávez', lat: -16.45, lng: -61.85, crops: ['maíz', 'yuca'] },

  /* ─── Velasco ─── */
  { name: 'San Ignacio de Velasco', municipality: 'San Ignacio', province: 'Velasco', lat: -16.37, lng: -60.95, crops: ['soya', 'maíz'] },
  { name: 'San Miguel de Velasco', municipality: 'San Miguel', province: 'Velasco', lat: -16.69, lng: -60.96, crops: ['maíz', 'yuca'] },
  { name: 'San Rafael de Velasco', municipality: 'San Rafael', province: 'Velasco', lat: -16.78, lng: -60.67, crops: ['maíz'] },

  /* ─── Chiquitos ─── */
  { name: 'San José de Chiquitos', municipality: 'San José', province: 'Chiquitos', lat: -17.85, lng: -60.74, crops: ['soya', 'sorgo'] },
  { name: 'Pailón', municipality: 'Pailón', province: 'Chiquitos', lat: -17.65, lng: -62.74, crops: ['soya', 'sorgo', 'maíz'] },
  { name: 'Roboré', municipality: 'Roboré', province: 'Chiquitos', lat: -18.33, lng: -59.76, crops: ['sorgo', 'maíz'] },

  /* ─── Guarayos ─── */
  { name: 'Ascensión de Guarayos', municipality: 'Ascensión', province: 'Guarayos', lat: -15.91, lng: -63.18, crops: ['arroz', 'maíz'] },
  { name: 'El Puente', municipality: 'El Puente', province: 'Guarayos', lat: -15.51, lng: -63.07, crops: ['arroz'] },
  { name: 'Urubichá', municipality: 'Urubichá', province: 'Guarayos', lat: -15.42, lng: -62.83, crops: ['arroz', 'maíz'] },
  { name: 'Yotaú', municipality: 'Ascensión', province: 'Guarayos', lat: -16.20, lng: -62.91, crops: ['arroz', 'maíz'] },

  /* ─── Florida ─── */
  { name: 'Samaipata', municipality: 'Samaipata', province: 'Florida', lat: -18.18, lng: -63.88, crops: ['cítricos', 'durazno', 'maíz'] },
  { name: 'Pampagrande', municipality: 'Pampagrande', province: 'Florida', lat: -18.03, lng: -64.10, crops: ['maíz', 'papa'] },
  { name: 'Los Negros', municipality: 'Pampagrande', province: 'Florida', lat: -18.04, lng: -63.65, crops: ['cítricos', 'durazno', 'tomate'] },
  { name: 'Mairana', municipality: 'Mairana', province: 'Florida', lat: -18.12, lng: -63.95, crops: ['maíz', 'papa', 'durazno'] },
  { name: 'Quirusillas', municipality: 'Quirusillas', province: 'Florida', lat: -18.37, lng: -63.93, crops: ['papa', 'maíz'] },

  /* ─── Vallegrande ─── */
  { name: 'Vallegrande', municipality: 'Vallegrande', province: 'Vallegrande', lat: -18.49, lng: -64.10, crops: ['papa', 'maíz', 'durazno'] },
  { name: 'El Trigal', municipality: 'El Trigal', province: 'Vallegrande', lat: -18.07, lng: -64.16, crops: ['trigo', 'maíz', 'papa'] },
  { name: 'Postrervalle', municipality: 'Postrervalle', province: 'Vallegrande', lat: -18.42, lng: -63.85, crops: ['maíz', 'papa'] },
  { name: 'Pucará', municipality: 'Pucará', province: 'Vallegrande', lat: -18.69, lng: -64.20, crops: ['papa', 'maíz'] },
  { name: 'Moromoro', municipality: 'Moromoro', province: 'Vallegrande', lat: -18.42, lng: -64.42, crops: ['maíz', 'papa'] },

  /* ─── Manuel María Caballero ─── */
  { name: 'Comarapa', municipality: 'Comarapa', province: 'Manuel María Caballero', lat: -17.92, lng: -64.53, crops: ['maíz', 'papa', 'durazno', 'tomate'] },
  { name: 'Saipina', municipality: 'Saipina', province: 'Manuel María Caballero', lat: -18.10, lng: -64.59, crops: ['caña', 'maíz', 'cítricos'] },
  { name: 'Pulquina', municipality: 'Comarapa', province: 'Manuel María Caballero', lat: -17.99, lng: -64.48, crops: ['papa', 'maíz'] },

  /* ─── Cordillera ─── */
  { name: 'Lagunillas', municipality: 'Lagunillas', province: 'Cordillera', lat: -19.62, lng: -63.66, crops: ['maíz', 'soya'] },
  { name: 'Charagua', municipality: 'Charagua', province: 'Cordillera', lat: -19.79, lng: -63.20, crops: ['soya', 'maíz', 'sorgo'] },
  { name: 'Cabezas', municipality: 'Cabezas', province: 'Cordillera', lat: -18.79, lng: -63.32, crops: ['soya', 'maíz', 'sorgo'] },
  { name: 'Cuevo', municipality: 'Cuevo', province: 'Cordillera', lat: -20.45, lng: -63.52, crops: ['maíz', 'soya'] },
  { name: 'Gutiérrez', municipality: 'Gutiérrez', province: 'Cordillera', lat: -19.34, lng: -63.95, crops: ['maíz'] },
  { name: 'Camiri', municipality: 'Camiri', province: 'Cordillera', lat: -20.04, lng: -63.52, crops: ['maíz', 'soya'] },
  { name: 'Boyuibe', municipality: 'Boyuibe', province: 'Cordillera', lat: -20.43, lng: -63.27, crops: ['soya', 'maíz'] },

  /* ─── Germán Busch ─── */
  { name: 'Puerto Suárez', municipality: 'Puerto Suárez', province: 'Germán Busch', lat: -18.97, lng: -57.80, crops: ['arroz', 'maíz'] },
  { name: 'Puerto Quijarro', municipality: 'Puerto Quijarro', province: 'Germán Busch', lat: -19.05, lng: -57.79, crops: ['arroz'] },
  { name: 'Carmen Rivero Tórrez', municipality: 'Carmen Rivero Tórrez', province: 'Germán Busch', lat: -18.92, lng: -58.32, crops: ['arroz', 'maíz'] },

  /* ─── Ángel Sandóval ─── */
  { name: 'San Matías', municipality: 'San Matías', province: 'Ángel Sandóval', lat: -16.37, lng: -58.40, crops: ['maíz', 'arroz'] },

  /* ─── Localidades / colonias agrícolas adicionales ─── */
  { name: 'Colonia Piraí', municipality: 'Warnes', province: 'Warnes', lat: -17.55, lng: -63.10, crops: ['soya', 'maíz'] },
  { name: 'Pozo del Tigre', municipality: 'Pailón', province: 'Chiquitos', lat: -17.55, lng: -62.55, crops: ['soya', 'sorgo'] },
  { name: 'Tres Cruces', municipality: 'Pailón', province: 'Chiquitos', lat: -17.49, lng: -62.60, crops: ['soya'] },
  { name: 'Los Pozos', municipality: 'Cuatro Cañadas', province: 'Ñuflo de Chávez', lat: -17.16, lng: -62.41, crops: ['soya'] },
  { name: 'Las Brechas', municipality: 'San Julián', province: 'Ñuflo de Chávez', lat: -16.92, lng: -62.55, crops: ['soya', 'sorgo'] },
  { name: 'El Tinto', municipality: 'San Julián', province: 'Ñuflo de Chávez', lat: -16.95, lng: -62.32, crops: ['soya'] },
  { name: 'Hardeman', municipality: 'San Pedro', province: 'Obispo Santistevan', lat: -17.05, lng: -63.45, crops: ['soya', 'algodón'] },
  { name: 'Chané', municipality: 'Mineros', province: 'Obispo Santistevan', lat: -17.18, lng: -63.20, crops: ['caña'] },
  { name: 'Hacienda Verde', municipality: 'Pailón', province: 'Chiquitos', lat: -17.70, lng: -62.65, crops: ['soya'] },
  { name: 'Pailas', municipality: 'Pailón', province: 'Chiquitos', lat: -17.79, lng: -62.80, crops: ['soya', 'sorgo'] },
  { name: 'Quimome', municipality: 'San José', province: 'Chiquitos', lat: -17.92, lng: -61.78, crops: ['sorgo'] },
  { name: 'Limoncito', municipality: 'Buena Vista', province: 'Ichilo', lat: -17.43, lng: -63.65, crops: ['cítricos', 'caña'] },
  { name: 'Las Cruces', municipality: 'Mairana', province: 'Florida', lat: -18.15, lng: -63.94, crops: ['maíz', 'durazno'] },
  { name: 'San Isidro', municipality: 'Comarapa', province: 'Manuel María Caballero', lat: -17.88, lng: -64.45, crops: ['papa', 'maíz'] },
  { name: 'Cañadón', municipality: 'Vallegrande', province: 'Vallegrande', lat: -18.55, lng: -64.05, crops: ['papa', 'maíz'] },
  { name: 'Chilón', municipality: 'Postrervalle', province: 'Vallegrande', lat: -18.35, lng: -63.88, crops: ['maíz', 'papa'] },
  { name: 'Pampa Grande', municipality: 'Pampagrande', province: 'Florida', lat: -18.03, lng: -64.10, crops: ['maíz', 'papa'] },
  { name: 'San Lorenzo (Vallegrande)', municipality: 'Vallegrande', province: 'Vallegrande', lat: -18.45, lng: -64.15, crops: ['maíz', 'papa'] },
  { name: 'San Marcos', municipality: 'La Guardia', province: 'Andrés Ibáñez', lat: -17.95, lng: -63.35, crops: ['maíz', 'cítricos'] },
  { name: 'Paurito', municipality: 'Cotoca', province: 'Andrés Ibáñez', lat: -17.74, lng: -62.85, crops: ['arroz', 'maíz'] },
  { name: 'Loma de Cabras', municipality: 'Concepción', province: 'Ñuflo de Chávez', lat: -16.22, lng: -62.10, crops: ['soya'] },
  { name: 'El Carmen Ribero', municipality: 'Concepción', province: 'Ñuflo de Chávez', lat: -16.30, lng: -62.05, crops: ['maíz'] },
  { name: 'Curichi', municipality: 'San Ignacio', province: 'Velasco', lat: -16.50, lng: -60.85, crops: ['maíz'] },
];

/** Normaliza para búsqueda — quita acentos, lowercase, trim */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Busca localidades por substring case/accent-insensitive. */
export function searchLocations(query: string, limit = 12): SczLocation[] {
  const q = normalize(query);
  if (!q) return [];
  const out: { loc: SczLocation; score: number }[] = [];
  for (const loc of SCZ_LOCATIONS) {
    const nName = normalize(loc.name);
    const nMun = normalize(loc.municipality);
    const nProv = normalize(loc.province);
    let score = 0;
    if (nName.startsWith(q)) score = 100;
    else if (nName.includes(q)) score = 80;
    else if (nMun.startsWith(q)) score = 60;
    else if (nMun.includes(q)) score = 50;
    else if (nProv.includes(q)) score = 30;
    if (score > 0) out.push({ loc, score });
  }
  out.sort((a, b) => b.score - a.score || a.loc.name.localeCompare(b.loc.name));
  return out.slice(0, limit).map((x) => x.loc);
}

/** Las 15 provincias de SCZ con polígono real (OSM) y color. */
export interface SczProvince {
  id: string;
  name: string;
  /** Etiqueta corta multilínea para etiquetas en mapas pequeños */
  shortName?: string;
  /** Color de fondo (paleta político tipo INE) */
  color: string;
  /** Contorno tomado de OpenStreetMap, simplificado a ~60 puntos */
  contour: [number, number][];
  /** Centroide (lat,lng) calculado para posicionar la etiqueta */
  labelAt: [number, number];
}

import RAW_GEO from './scz-provinces-geo.json';

/**
 * Polígonos REALES de las 15 provincias de Santa Cruz, tomados de
 * OpenStreetMap (Nominatim) y simplificados a ~60 puntos cada uno.
 *
 * Generado con `temp/fetch-scz-provinces.mjs`. Si querés regenerar:
 *   node fetch-scz-provinces.mjs  (~22s con rate limit Nominatim)
 *
 * Los colores siguen el estilo del mapa político del INE / Wikipedia.
 */
export const SCZ_PROVINCES: SczProvince[] = (RAW_GEO as SczProvince[]);

export function findProvince(id: string): SczProvince | undefined {
  return SCZ_PROVINCES.find((p) => p.id === id);
}
