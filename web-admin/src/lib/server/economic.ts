/**
 * Cálculo Bs de "fumigar vs no fumigar" para un lote.
 *
 * Heurística simple para el hackathon — números calibrados con literatura
 * pública de INIAF / CAO. Suficiente para el pitch.
 */

export interface EconomicCalc {
  hectares: number;
  cost_act_bob: number;       // fumigar
  cost_inaction_bob: number;  // dejar avanzar la plaga (pérdida estimada)
  net_benefit_bob: number;    // cost_inaction - cost_act
  recommendation: 'fumigar' | 'esperar' | 'monitorear';
  explanation: string;
}

const COST_PER_HA = {
  // Costo total típico fumigación (producto + jornal + equipo) en Bs
  fumigation_bob_per_ha: 120,
};

const YIELD_LOSS_BY_SEVERITY = {
  low: 0.05,      // 5%
  medium: 0.20,   // 20%
  high: 0.50,     // 50%
};

const REVENUE_PER_HA_BY_CROP: Record<string, number> = {
  soya: 4_800,
  maíz: 3_600,
  sorgo: 2_800,
  algodón: 6_500,
  arroz: 4_200,
  papa: 8_000,
  tomate: 9_500,
  cítricos: 7_200,
  cebolla: 7_800,
};

export function computeEconomic(opts: {
  hectares: number | null | undefined;
  severity: 'low' | 'medium' | 'high' | null;
  crop: string | null;
}): EconomicCalc | null {
  const ha = opts.hectares ?? 0;
  if (!ha || !opts.severity || !opts.crop) return null;

  const loss_pct = YIELD_LOSS_BY_SEVERITY[opts.severity];
  const revenue = REVENUE_PER_HA_BY_CROP[opts.crop] ?? 4_000;
  const cost_act = COST_PER_HA.fumigation_bob_per_ha * ha;
  const cost_inaction = revenue * loss_pct * ha;
  const net = cost_inaction - cost_act;

  let recommendation: EconomicCalc['recommendation'];
  if (opts.severity === 'low' && net < cost_act * 0.5) recommendation = 'monitorear';
  else if (net > 0) recommendation = 'fumigar';
  else recommendation = 'esperar';

  const explanation = (() => {
    if (recommendation === 'fumigar') {
      return `Fumigar te cuesta Bs ${cost_act.toLocaleString('es-BO')} y evitás una pérdida estimada de Bs ${cost_inaction.toLocaleString('es-BO')}. Ahorrás Bs ${net.toLocaleString('es-BO')}.`;
    }
    if (recommendation === 'monitorear') {
      return `Severidad baja en ${ha} ha. Esperá 7 días y volvé a escanear — fumigar ahora cuesta más que el daño actual.`;
    }
    return `El costo de fumigar (Bs ${cost_act.toLocaleString('es-BO')}) supera la pérdida estimada (Bs ${cost_inaction.toLocaleString('es-BO')}). Mejor esperá y volvé a evaluar.`;
  })();

  return {
    hectares: ha,
    cost_act_bob: Math.round(cost_act),
    cost_inaction_bob: Math.round(cost_inaction),
    net_benefit_bob: Math.round(net),
    recommendation,
    explanation,
  };
}
