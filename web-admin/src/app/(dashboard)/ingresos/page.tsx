'use client';
import {
  PanelHeader, PanelCard, CardHead, HeroKpi, Pill, Section, brand,
} from '@/components/panel-shell';
import {
  DollarSign, Sprout, TrendingUp, Building2, ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

/**
 * INGRESOS — vista financiera SaaS.
 * Métrica central: hectárea pagada activa (HPA). Acompañada de MRR y ARPH.
 */
export default function IngresosPage() {
  const planSplit = [
    { plan: 'Free', accounts: 518, hectares: 4_200, mrr: 0, color: '#C7D2BB' },
    { plan: 'Pro', accounts: 142, hectares: 9_840, mrr: 3_550, color: brand.leaf },
    { plan: 'Enterprise', accounts: 42, hectares: 22_800, mrr: 14_870, color: brand.copperBright },
  ];
  const totalHa = planSplit.reduce((s, p) => s + p.hectares, 0);

  return (
    <Section className="space-y-8">
      <PanelHeader
        title="Ingresos"
        subtitle={
          <>
            Salud financiera del negocio. Métrica central:{' '}
            <strong style={{ color: brand.ink }}>hectárea pagada activa</strong>.
            Modelo de pricing en{' '}
            <a href="/docs/strategy" className="underline">docs/strategy</a>.
          </>
        }
        meta={<Pill tone="demo" size="xs">datos demo · backend pendiente</Pill>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroKpi
          icon={<DollarSign className="h-5 w-5" />}
          label="MRR"
          value="Bs 18.420"
          hint="ARR proyectado Bs 221K"
          trend={{ dir: 'up', pct: 12.0 }}
          tone="copper"
        />
        <HeroKpi
          icon={<Sprout className="h-5 w-5" />}
          label="Hectáreas pagas"
          value="36.840"
          hint="2.80% del cultivo SCZ"
          trend={{ dir: 'up', pct: 11.8 }}
          tone="leaf"
        />
        <HeroKpi
          icon={<TrendingUp className="h-5 w-5" />}
          label="ARPU"
          value="Bs 100"
          hint="ingreso promedio por cuenta paga"
        />
        <HeroKpi
          icon={<Building2 className="h-5 w-5" />}
          label="Cuentas pagas"
          value="184"
          hint="142 productores · 42 coops"
          trend={{ dir: 'up', pct: 6.4 }}
          tone="ink"
        />
      </div>

      {/* Plans cards (visual del pricing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlanCard
          name="Free"
          price="Bs 0"
          subPrice="1 a 5 ha · 3 scans / mes"
          tone="paper"
          features={['Diagnóstico básico', 'Tratamiento orgánico', 'Sin chat, clima ni decisión Bs']}
          stats={{ accounts: 518, hectares: 1_640, mrr: 0 }}
        />
        <PlanCard
          name="Pro"
          price="Bs 70"
          subPrice="/ mes · 5 a 20 ha · 50 scans"
          tone="leaf"
          features={[
            'Diagnóstico completo + químico',
            'Chat con agrónomo IA',
            'Ventana climática + decisión Bs',
            'Historial · PDF · WhatsApp',
          ]}
          stats={{ accounts: 142, hectares: 1_700, mrr: 9_940 }}
          highlight
        />
        <PlanCard
          name="Enterprise"
          price="Bs 1.000"
          subPrice="/ mes · ha ilimitadas · 300 scans · 5 cuentas"
          tone="copper"
          features={[
            'Todo lo de Pro multiplicado',
            'Panel admin · validación humana',
            'Onboarding asistido + API',
            'Account manager · SLA 4h',
          ]}
          stats={{ accounts: 42, hectares: 22_800, mrr: 42_000 }}
        />
      </div>

      {/* MRR composición por plan (bar chart horizontal-ish) */}
      <PanelCard>
        <CardHead
          title="MRR por plan"
          hint="Quién está poniendo plata hoy"
          right={
            <span
              className="text-[11px]"
              style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}
            >
              Bs {(planSplit.reduce((s, p) => s + p.mrr, 0)).toLocaleString('es-BO')} total
            </span>
          }
        />
        <div className="h-[200px]">
          <ResponsiveContainer>
            <BarChart
              data={planSplit.filter(p => p.mrr > 0)}
              margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
            >
              <XAxis dataKey="plan" tick={{ fill: brand.inkSoft, fontSize: 12 }} tickLine={false} axisLine={{ stroke: brand.line }} />
              <YAxis
                tick={{ fill: brand.mute, fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Bs ${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: '#F1EBD8' }}
                contentStyle={{
                  background: brand.panel,
                  border: `1px solid ${brand.line}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`Bs ${v.toLocaleString('es-BO')}`, 'MRR']}
              />
              <Bar dataKey="mrr" radius={[6, 6, 0, 0]}>
                {planSplit.filter(p => p.mrr > 0).map((p, i) => <Cell key={i} fill={p.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {planSplit.map((p) => {
            const pct = totalHa > 0 ? (p.hectares / totalHa) * 100 : 0;
            return (
              <div key={p.plan} className="text-xs" style={{ color: brand.inkSoft }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  <span className="font-medium">{p.plan}</span>
                </div>
                <p style={{ color: brand.mute }}>{pct.toFixed(0)}% de las hectáreas · {p.accounts} cuentas</p>
              </div>
            );
          })}
        </div>
      </PanelCard>

      {/* Top accounts */}
      <PanelCard>
        <CardHead
          title="Cuentas top por hectáreas"
          hint="Quién mueve el negocio"
          right={
            <a href="/empresas" className="text-xs inline-flex items-center gap-1" style={{ color: brand.leafDeep }}>
              Gestionar empresas <ArrowRight className="h-3 w-3" />
            </a>
          }
        />
        <ul className="divide-y" style={{ borderColor: brand.line }}>
          <AccountRow name="Coop. Integral Cuatro Cañadas" ha={4_820} plan="Hacienda" mrr={2_410} managed />
          <AccountRow name="Anapo zona Pailón" ha={3_650} plan="Hacienda" mrr={1_825} managed />
          <AccountRow name="Coop. Minga San Julián" ha={2_980} plan="Hacienda" mrr={1_490} managed />
          <AccountRow name="Don Mario Rodríguez" ha={820} plan="Cosecha" mrr={410} />
          <AccountRow name="Lucia Mendoza & Hnos" ha={640} plan="Cosecha" mrr={320} />
        </ul>
      </PanelCard>

      {/* Pipeline */}
      <PanelCard>
        <CardHead
          title="Pipeline cooperativas"
          hint="Embudo comercial B2B"
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <PipelineStage label="Contactadas" count={28} ha={64_200} />
          <PipelineStage label="Demo agendada" count={11} ha={31_400} />
          <PipelineStage label="Piloto en curso" count={4} ha={9_800} />
          <PipelineStage label="Cerrado · pagando" count={42} ha={22_800} highlight />
        </div>
      </PanelCard>

      {/* Streams secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RevenueStream
          title="Comisión agroquímicos"
          value="Bs 1.840"
          hint="5% sobre compras atribuidas a Agripac / Agrocentro · últimos 30d"
        />
        <RevenueStream
          title="Licencia datos agregados"
          value="Bs 8.300"
          hint="SENASAG · trimestral · foco de plagas por región"
        />
        <RevenueStream
          title="Reporte agronómico anual"
          value="Bs 4.200"
          hint="21 cuentas Pro/Coop · cierre ene-may"
        />
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────── */

function PlanCard({
  name, price, subPrice, features, stats, tone, highlight,
}: {
  name: string;
  price: string;
  subPrice: string;
  features: string[];
  stats: { accounts: number; hectares: number; mrr: number };
  tone: 'paper' | 'leaf' | 'copper';
  highlight?: boolean;
}) {
  return (
    <PanelCard tone={tone} className={highlight ? 'ring-2' : ''} {...(highlight ? { style: { boxShadow: `0 0 0 2px ${brand.leaf}` } as any } : {})}>
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-semibold text-base">{name}</h3>
        {highlight && <Pill tone="leaf" size="xs">recomendado</Pill>}
      </div>
      <p className="text-3xl font-semibold tracking-tight mt-3">{price}</p>
      <p className="text-xs mt-1 opacity-80">{subPrice}</p>

      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 rounded-full" style={{ background: 'currentColor', opacity: 0.5 }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t text-xs flex justify-between items-center" style={{ borderColor: 'currentColor', borderOpacity: 0.15 } as React.CSSProperties}>
        <span className="opacity-80">
          {stats.accounts} · {stats.hectares.toLocaleString('es-BO')} ha
        </span>
        <span className="font-semibold">
          {stats.mrr > 0 ? `Bs ${stats.mrr.toLocaleString('es-BO')} / mes` : 'gratis'}
        </span>
      </div>
    </PanelCard>
  );
}

function AccountRow({
  name, ha, plan, mrr, managed,
}: { name: string; ha: number; plan: string; mrr: number; managed?: boolean }) {
  return (
    <li className="py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium truncate" style={{ color: brand.ink }}>{name}</p>
        <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: brand.mute }}>
          <span>{plan}</span>
          {managed && <Pill tone="copper" size="xs">parcelas gestionadas</Pill>}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold" style={{ color: brand.ink }}>{ha.toLocaleString('es-BO')} ha</p>
        <p className="text-xs" style={{ color: brand.mute }}>Bs {mrr.toLocaleString('es-BO')} / mes</p>
      </div>
    </li>
  );
}

function PipelineStage({
  label, count, ha, highlight = false,
}: { label: string; count: number; ha: number; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: highlight ? '#E6F0D6' : '#F3EFE0',
        border: `1px solid ${highlight ? '#C9DCB0' : brand.line}`,
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.18em]"
        style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}
      >
        {label}
      </p>
      <p className="text-2xl font-semibold mt-1" style={{ color: highlight ? brand.leafDeep : brand.ink }}>
        {count}
      </p>
      <p className="text-xs mt-1" style={{ color: brand.mute }}>
        {ha.toLocaleString('es-BO')} ha potenciales
      </p>
    </div>
  );
}

function RevenueStream({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <PanelCard>
      <p
        className="text-[10px] uppercase tracking-[0.18em] mb-2"
        style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}
      >
        Stream secundario
      </p>
      <h3 className="font-semibold mb-1" style={{ color: brand.ink }}>{title}</h3>
      <p className="text-2xl font-semibold tracking-tight" style={{ color: brand.copper }}>{value}</p>
      <p className="text-xs mt-2" style={{ color: brand.mute }}>{hint}</p>
    </PanelCard>
  );
}
