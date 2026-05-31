'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  PanelHeader, PanelCard, CardHead, HeroKpi, Pill, Section, brand,
} from '@/components/panel-shell';
import {
  Sprout, ShieldCheck, DollarSign, TrendingUp, Users,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

interface Analytics {
  total_scans?: number;
  weekly_scans?: number;
  total_users?: number;
  ia_precision_pct?: number;
}

interface BillingSummary {
  mrr_bob?: number;
  arph_bob?: number;
  paid_hectares?: number;
  protected_hectares?: number;
  total_users?: number;
  paid_users?: number;
  bs_saved_estimate?: number;
  coverage_pct?: number;
  by_plan?: { plan: string; accounts: number; hectares: number; mrr_bob: number }[];
  mrr_series?: { month: string; mrr: number; hectares: number }[];
  top_pests?: { name: string; ha: number }[];
}

const SCZ_CULTIVATED_HA = 2_500_000;
const BS_SAVED_PER_HA = 500;

export default function DashboardPage() {
  const [a, setA] = useState<Analytics | null>(null);
  const [b, setB] = useState<BillingSummary | null>(null);
  const [errA, setErrA] = useState<string | null>(null);
  const [billingLoaded, setBillingLoaded] = useState(false);

  useEffect(() => {
    apiFetch<Analytics>('/admin/analytics').then(setA).catch((e) => setErrA(e.message));
    apiFetch<BillingSummary>('/admin/billing/summary')
      .then(setB)
      .catch(() => setB(DEMO_BILLING))
      .finally(() => setBillingLoaded(true));
  }, []);

  if (errA) {
    return (
      <Section>
        <PanelHeader title="Dashboard" />
        <PanelCard>
          <p className="font-medium" style={{ color: brand.danger }}>
            Error: {errA}
          </p>
          <p className="text-sm mt-2" style={{ color: brand.mute }}>
            Verificá que el backend esté corriendo en <code>localhost:3001</code> y
            que tu email esté en <code>admin_users</code>.
          </p>
        </PanelCard>
      </Section>
    );
  }

  const billing = b ?? DEMO_BILLING;
  const coverage =
    billing.coverage_pct ?? (billing.paid_hectares ?? 0) / SCZ_CULTIVATED_HA;
  const protectionRate =
    (billing.paid_hectares ?? 0) > 0
      ? (billing.protected_hectares ?? 0) / (billing.paid_hectares ?? 1)
      : 0;
  const bsSaved =
    billing.bs_saved_estimate ?? (billing.protected_hectares ?? 0) * BS_SAVED_PER_HA;

  return (
    <Section className="space-y-8">
      <PanelHeader
        title="Dashboard"
        subtitle={
          <>
            Resumen del negocio. Métrica central:{' '}
            <strong style={{ color: brand.ink }}>hectárea pagada activa</strong>{' '}
            (<em style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}>HPA</em>).
          </>
        }
        meta={!b && billingLoaded && <Pill tone="demo" size="xs">datos demo</Pill>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroKpi
          icon={<Sprout className="h-5 w-5" />}
          label="Hectáreas pagas"
          value={fmt(billing.paid_hectares)}
          hint={`${(coverage * 100).toFixed(2)}% del cultivo SCZ`}
          trend={{ dir: 'up', pct: 12.4 }}
          tone="leaf"
        />
        <HeroKpi
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Hectáreas protegidas"
          value={fmt(billing.protected_hectares)}
          hint={`${(protectionRate * 100).toFixed(0)}% engagement 30d`}
          trend={{ dir: 'up', pct: 8.1 }}
        />
        <HeroKpi
          icon={<DollarSign className="h-5 w-5" />}
          label="MRR"
          value={<>Bs {fmt(billing.mrr_bob)}</>}
          hint={`ARPH Bs ${(billing.arph_bob ?? 0).toFixed(2)} / ha`}
          trend={{ dir: 'up', pct: 12.0 }}
          tone="copper"
        />
        <HeroKpi
          icon={<TrendingUp className="h-5 w-5" />}
          label="Bs ahorrados"
          value={<>Bs {fmtCompact(bsSaved)}</>}
          hint={`Bs ${BS_SAVED_PER_HA} / ha protegida`}
          tone="ink"
        />
      </div>

      {/* Growth area chart */}
      <PanelCard>
        <CardHead
          title={<>Crecimiento mensual</>}
          hint="MRR y hectáreas pagas — últimos 6 meses"
          right={
            <div className="flex gap-3 text-[11px]" style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}>
              <Legend swatch={brand.leaf} label="MRR" />
              <Legend swatch={brand.copperBright} label="Hectáreas" />
            </div>
          }
        />
        <div className="h-[260px]">
          <ResponsiveContainer>
            <AreaChart data={billing.mrr_series ?? DEMO_BILLING.mrr_series!} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brand.leaf} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={brand.leaf} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gHa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brand.copperBright} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={brand.copperBright} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: brand.mute, fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
                tickLine={false}
                axisLine={{ stroke: brand.line }}
              />
              <YAxis
                yAxisId="l"
                tick={{ fill: brand.mute, fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <YAxis yAxisId="r" orientation="right" hide />
              <Tooltip
                cursor={{ stroke: brand.line }}
                contentStyle={{
                  background: brand.panel,
                  border: `1px solid ${brand.line}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, name: string) =>
                  name === 'mrr' ? [`Bs ${v.toLocaleString('es-BO')}`, 'MRR'] : [`${v.toLocaleString('es-BO')} ha`, 'Hectáreas']
                }
              />
              <Area
                yAxisId="l"
                type="monotone"
                dataKey="mrr"
                stroke={brand.leaf}
                strokeWidth={2}
                fill="url(#gMrr)"
              />
              <Area
                yAxisId="r"
                type="monotone"
                dataKey="hectares"
                stroke={brand.copperBright}
                strokeWidth={2}
                fill="url(#gHa)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      {/* Composición + Top plagas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PanelCard className="lg:col-span-2">
          <CardHead
            title="Composición por plan"
            hint="Hectáreas pagas distribuidas en los 3 planes"
          />
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center">
            <div className="h-[180px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={(billing.by_plan ?? DEMO_BILLING.by_plan!).filter(p => p.hectares > 0)}
                    dataKey="hectares"
                    nameKey="plan"
                    innerRadius={50}
                    outerRadius={75}
                    strokeWidth={0}
                  >
                    {(billing.by_plan ?? DEMO_BILLING.by_plan!).map((p, i) => (
                      <Cell key={i} fill={planColor(p.plan)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: brand.panel,
                      border: `1px solid ${brand.line}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v.toLocaleString('es-BO')} ha`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {(billing.by_plan ?? DEMO_BILLING.by_plan!).map((p) => {
                const total = (billing.by_plan ?? DEMO_BILLING.by_plan!).reduce((s, x) => s + x.hectares, 0);
                const pct = total > 0 ? (p.hectares / total) * 100 : 0;
                return (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between text-sm" style={{ color: brand.ink }}>
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: planColor(p.plan) }} />
                        <span className="font-medium">{p.plan}</span>
                      </span>
                      <span style={{ color: brand.mute }}>
                        {p.accounts} cuentas · {fmt(p.hectares)} ha · {p.mrr_bob ? `Bs ${fmt(p.mrr_bob)}` : 'gratis'}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full" style={{ background: '#F1EBD8' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: planColor(p.plan) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PanelCard>

        <PanelCard>
          <CardHead
            title="Plagas más detectadas"
            hint="Hectáreas afectadas · últimos 30 días"
          />
          <div className="space-y-3">
            {(billing.top_pests ?? DEMO_BILLING.top_pests!).map((p) => {
              const max = Math.max(...(billing.top_pests ?? DEMO_BILLING.top_pests!).map((x) => x.ha));
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-xs mb-1" style={{ color: brand.inkSoft }}>
                    <span className="font-medium">{p.name}</span>
                    <span style={{ color: brand.mute }}>{fmt(p.ha)} ha</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#F1EBD8' }}>
                    <div className="h-full rounded-full" style={{ width: `${(p.ha / max) * 100}%`, background: brand.copperBright }} />
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>
      </div>

      {/* Funnel + nota */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PanelCard className="lg:col-span-2">
          <CardHead
            title="Productores · embudo"
            hint="Free → Pro → Hacienda (estimación 30 días)"
          />
          <div className="h-[180px]">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { stage: 'Free', count: billing.total_users! - billing.paid_users! },
                  { stage: 'Pro', count: 142 },
                  { stage: 'Hacienda', count: 42 },
                ]}
                margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
              >
                <XAxis dataKey="stage" tick={{ fill: brand.inkSoft, fontSize: 12 }} tickLine={false} axisLine={{ stroke: brand.line }} />
                <YAxis tick={{ fill: brand.mute, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F1EBD8' }}
                  contentStyle={{
                    background: brand.panel,
                    border: `1px solid ${brand.line}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={brand.leaf} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard tone="leaf">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold mb-1">Por qué hectárea</p>
              <p>
                El productor ya piensa en Bs/ha para todo. Cobrar por ha alinea
                precio con valor real y nos da una métrica estable. Las
                métricas técnicas viven en{' '}
                <a href="/analytics" className="underline font-medium">Analytics</a>.
                Las parcelas de empresas se administran en{' '}
                <a href="/empresas" className="underline font-medium">Empresas</a>.
              </p>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Productores compact strip */}
      <PanelCard padded={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor: brand.line }}>
          <CompactBlock icon={<Users />} label="Productores totales" value={fmt(billing.total_users)} />
          <CompactBlock icon={<DollarSign />} label="Pagando" value={fmt(billing.paid_users)} />
          <CompactBlock icon={<ShieldCheck />} label="Cobertura SCZ" value={`${(coverage * 100).toFixed(2)}%`} />
          {a && <CompactBlock icon={<Sprout />} label="Scans esta semana" value={fmt(a.weekly_scans)} />}
        </div>
      </PanelCard>
    </Section>
  );
}

function CompactBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-1.5" style={{ color: brand.mute }}>
        <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span>
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          {label}
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight" style={{ color: brand.ink }}>{value}</p>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: swatch }} />
      <span>{label}</span>
    </span>
  );
}

function planColor(plan: string): string {
  const p = plan.toLowerCase();
  if (p.includes('coop')) return brand.copperBright;
  if (p.includes('pro')) return brand.leaf;
  return '#C7D2BB';
}

function fmt(n: number | undefined | null): string {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('es-BO');
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('es-BO');
}

const DEMO_BILLING: BillingSummary = {
  mrr_bob: 51_940,
  arph_bob: 2.12,
  paid_hectares: 24_500,
  protected_hectares: 18_400,
  total_users: 702,
  paid_users: 184,
  bs_saved_estimate: 18_400 * BS_SAVED_PER_HA,
  coverage_pct: 24_500 / SCZ_CULTIVATED_HA,
  by_plan: [
    { plan: 'Free', accounts: 518, hectares: 1_640, mrr_bob: 0 },
    { plan: 'Pro', accounts: 142, hectares: 1_700, mrr_bob: 9_940 },
    { plan: 'Enterprise', accounts: 42, hectares: 22_800, mrr_bob: 42_000 },
  ],
  mrr_series: [
    { month: 'Dic', mrr: 18_500, hectares: 8_500 },
    { month: 'Ene', mrr: 24_200, hectares: 11_800 },
    { month: 'Feb', mrr: 31_400, hectares: 15_200 },
    { month: 'Mar', mrr: 38_200, hectares: 18_400 },
    { month: 'Abr', mrr: 45_800, hectares: 21_600 },
    { month: 'May', mrr: 51_940, hectares: 24_500 },
  ],
  top_pests: [
    { name: 'Roya asiática', ha: 8_200 },
    { name: 'Chinche verde', ha: 5_400 },
    { name: 'Picudo', ha: 3_800 },
    { name: 'Mosca blanca', ha: 2_900 },
    { name: 'Mancha foliar', ha: 1_700 },
  ],
};
