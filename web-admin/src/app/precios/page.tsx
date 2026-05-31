import Link from 'next/link';
import { ArrowLeft, Check, X, Sprout, Wheat, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Precios · Vita',
  description: 'Free 3 scans/mes, Pro Bs 70/mes con 50 scans, Enterprise para empresas. Pagás menos de lo que perdés por mal diagnóstico.',
};

const C = {
  bg: '#0E1F14',
  bgDeep: '#081610',
  cream: '#EFE7D2',
  creamSoft: 'rgba(239,231,210,0.62)',
  creamMute: 'rgba(239,231,210,0.34)',
  copper: '#B86A2E',
  copperBright: '#D88340',
  leaf: '#7BA05B',
  leafBright: '#9BC07A',
  leafDeep: '#3F5A2A',
  line: 'rgba(239,231,210,0.10)',
  lineStrong: 'rgba(239,231,210,0.18)',
  card: '#122A1B',
  cardHi: '#1A3823',
};

const sans = 'var(--font-geist-sans)';
const mono = 'var(--font-geist-mono)';
const serif = 'var(--font-instrument-serif)';

interface Plan {
  id: 'free' | 'pro' | 'enterprise';
  badge: string;
  name: string;
  icon: React.ReactNode;
  price: { value: string; suffix: string; sub?: string };
  cta: { label: string; href: string };
  highlight?: boolean;
  description: string;
  features: { included: boolean; label: string }[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    badge: 'Probá sin pagar',
    name: 'Free',
    icon: <Sprout className="h-5 w-5" />,
    price: { value: 'Bs 0', suffix: '/ mes', sub: 'sin tarjeta · permanente' },
    cta: { label: 'Empezar gratis', href: '/app/onboarding' },
    description: 'Para conocer Vita y resolver tu primera plaga.',
    features: [
      { included: true, label: 'De 1 a 5 hectáreas' },
      { included: true, label: '3 scans por mes' },
      { included: true, label: 'Diagnóstico básico (plaga + severidad)' },
      { included: true, label: 'Tratamiento orgánico básico' },
      { included: false, label: 'Tratamiento químico con dosis y marcas' },
      { included: false, label: 'Chat con agrónomo IA' },
      { included: false, label: 'Ventana climática (warning lluvia)' },
      { included: false, label: 'Decisión económica en Bs' },
      { included: false, label: 'Historial completo + export PDF' },
      { included: false, label: 'Compartir por WhatsApp' },
    ],
  },
  {
    id: 'pro',
    badge: '★ Más elegido',
    name: 'Pro',
    icon: <Wheat className="h-5 w-5" />,
    price: { value: 'Bs 70', suffix: '/ mes', sub: 'o Bs 700 / año · 17% off' },
    cta: { label: 'Quiero Pro', href: '/app/onboarding?plan=pro' },
    highlight: true,
    description: 'Para el productor que toma decisiones serias en su chacra.',
    features: [
      { included: true, label: 'De 5 a 20 hectáreas' },
      { included: true, label: '50 scans por mes' },
      { included: true, label: 'Diagnóstico completo con confianza IA' },
      { included: true, label: 'Tratamiento orgánico + químico con dosis y marcas' },
      { included: true, label: 'Chat ilimitado con agrónomo IA contextual' },
      { included: true, label: 'Ventana climática · warning lluvia' },
      { included: true, label: 'Decisión económica en Bs (fumigar vs esperar)' },
      { included: true, label: 'Historial completo + export PDF' },
      { included: true, label: 'Compartir por WhatsApp' },
      { included: true, label: 'Soporte por email 24-48h' },
    ],
  },
  {
    id: 'enterprise',
    badge: 'Empresas y coops',
    name: 'Enterprise',
    icon: <Building2 className="h-5 w-5" />,
    price: { value: 'Bs 1.000', suffix: '/ mes', sub: 'ha ilimitadas · cotizado' },
    cta: { label: 'Hablar con ventas', href: 'mailto:hola@vita.bo?subject=Plan%20Enterprise' },
    description: 'Para cooperativas, agroempresas, SENASAG e INIAF.',
    features: [
      { included: true, label: 'Hectáreas ilimitadas' },
      { included: true, label: '300 scans por mes' },
      { included: true, label: '5 cuentas con acceso al sistema' },
      { included: true, label: 'Todo lo de Pro multiplicado' },
      { included: true, label: 'Panel admin web con mapa de focos' },
      { included: true, label: 'Validación de diagnósticos por nuestro agrónomo' },
      { included: true, label: 'Alertas zonales push masivas' },
      { included: true, label: 'API REST + Export CSV' },
      { included: true, label: 'Onboarding asistido (registramos parcelas con GPS)' },
      { included: true, label: 'Account manager dedicado · SLA 4h' },
    ],
  },
];

export default function PreciosPage() {
  return (
    <div style={{ background: C.bg, color: C.cream, fontFamily: sans, minHeight: '100vh' }}>
      {/* Ambient gradients */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(123,160,91,0.10), transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(184,106,46,0.10), transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 py-10 sm:py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-10 hover:opacity-100 transition-opacity"
          style={{ color: C.creamSoft, textDecoration: 'none' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </Link>

        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="text-[11px] uppercase tracking-[0.32em] mb-4"
            style={{ fontFamily: mono, color: C.creamMute }}
          >
            Precios · Vita
          </p>
          <h1 className="text-5xl sm:text-6xl tracking-[-0.035em] leading-[1.02] mb-5" style={{ color: C.cream }}>
            Pagás <em style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 400, color: C.copperBright }}>menos</em>
            <br />
            de lo que pierde.
          </h1>
          <p className="text-lg leading-[1.5]" style={{ color: C.creamSoft }}>
            En SCZ un productor con 12 ha pierde en promedio <strong style={{ color: C.cream }}>Bs 456 por mes</strong> por
            mal diagnóstico de plagas. Vita lo evita por <strong style={{ color: C.cream }}>Bs 70</strong>.
            <span className="block mt-2 text-base opacity-80">6,5x de retorno desde el primer mes.</span>
          </p>
        </header>

        {/* Planes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {PLANS.map((p) => <PlanCard key={p.id} p={p} />)}
        </div>

        {/* Calculadora de ROI */}
        <div
          className="mt-20 rounded-3xl p-8 sm:p-10"
          style={{ background: C.cardHi, border: `1px solid ${C.lineStrong}` }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.32em] mb-3"
            style={{ fontFamily: mono, color: C.leafBright }}
          >
            ROI rápido
          </p>
          <h2 className="text-3xl sm:text-4xl mb-8 tracking-tight" style={{ color: C.cream }}>
            ¿Cuánto te <em style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 400, color: C.copperBright }}>ahorra</em> Vita?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoiBox
              top="Lote típico"
              value="12 ha"
              sub="soya en SCZ"
            />
            <RoiBox
              top="Pérdida promedio por mal diagnóstico"
              value="Bs 456"
              sub="por mes equivalente"
              tone="copper"
            />
            <RoiBox
              top="Vita Pro"
              value="Bs 70"
              sub="por mes"
              tone="leaf"
            />
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
            <p className="text-2xl sm:text-3xl tracking-tight" style={{ color: C.cream }}>
              Te quedan{' '}
              <em style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 400, color: C.leafBright }}>
                Bs 386
              </em>{' '}
              en el bolsillo cada mes.
            </p>
          </div>
        </div>

        {/* FAQ chica */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl mb-8 text-center tracking-tight" style={{ color: C.cream }}>
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <Faq
              q="¿Qué pasa cuando se acaban los 3 scans del Free?"
              a="Podés esperar al próximo mes (los scans se renuevan el día 1), o pasarte a Pro por Bs 70 y tener 50 scans al mes de inmediato."
            />
            <Faq
              q="¿Cómo paga el productor desde Bolivia?"
              a="Pagás con tarjeta, transferencia bancaria, o QR (BCP, BNB, BMSC). Si sos cooperativa, factura mensual a 30 días."
            />
            <Faq
              q="¿Puedo cancelar cuando quiera?"
              a="Sí. El plan Pro es mes a mes. Cancelás desde la app cuando quieras y mantenés acceso hasta el final del período pagado."
            />
            <Faq
              q="¿Enterprise incluye soporte presencial?"
              a="Sí. El onboarding asistido incluye que nuestro equipo vaya a tu cooperativa, registre parcelas con GPS, capacite a los técnicos y deje todo andando."
            />
            <Faq
              q="¿Las 5 cuentas de Enterprise pueden usar la app móvil también?"
              a="Sí. Cada técnico puede usar tanto la app móvil como el panel admin con su propio usuario. Los scans cuentan contra el límite mensual compartido (300 scans/mes)."
            />
            <Faq
              q="¿Mis datos son míos?"
              a="Sí. Vita nunca vende datos individuales. Para B2G (SENASAG/INIAF) solo entregamos agregados anónimos por región y plaga."
            />
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-20 text-center">
          <p className="text-sm mb-4" style={{ color: C.creamSoft }}>
            Empezá probando gratis. Sin tarjeta.
          </p>
          <Link
            href="/app/onboarding"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold transition"
            style={{ background: C.leafBright, color: C.bg, textDecoration: 'none' }}
          >
            🌱 Empezar con Free (gratis)
          </Link>
        </div>

        {/* Footer */}
        <div
          className="mt-20 pt-8 flex justify-between text-[10px] uppercase tracking-[0.2em]"
          style={{ borderTop: `1px solid ${C.line}`, color: C.creamMute, fontFamily: mono }}
        >
          <span>© 2026 Vita</span>
          <Link href="/" style={{ color: C.creamMute, textDecoration: 'none' }}>vita.bo</Link>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── */

function PlanCard({ p }: { p: Plan }) {
  const tones = p.highlight
    ? {
        bg: `linear-gradient(180deg, ${C.cardHi} 0%, ${C.card} 100%)`,
        border: `1px solid ${C.leafBright}`,
        ringShadow: `0 0 0 1px ${C.leafBright}66`,
      }
    : { bg: C.card, border: `1px solid ${C.line}`, ringShadow: 'none' };

  return (
    <article
      className="rounded-3xl p-8 flex flex-col relative"
      style={{
        background: tones.bg,
        border: tones.border,
        boxShadow: tones.ringShadow,
      }}
    >
      {p.highlight && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold"
          style={{ background: C.leafBright, color: C.bg, fontFamily: mono }}
        >
          {p.badge}
        </span>
      )}

      <div className="flex items-center gap-3 mb-2">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: p.id === 'brote' ? 'rgba(155,192,122,0.15)' : p.id === 'cosecha' ? 'rgba(216,131,64,0.15)' : 'rgba(239,231,210,0.08)',
            color: p.id === 'brote' ? C.leafBright : p.id === 'cosecha' ? C.copperBright : C.creamSoft,
          }}
        >
          {p.icon}
        </span>
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.22em]"
            style={{ fontFamily: mono, color: C.creamMute }}
          >
            Plan
          </p>
          <h3 className="text-2xl font-semibold leading-tight" style={{ color: C.cream }}>
            {p.name}
          </h3>
        </div>
      </div>

      <p className="text-sm mb-6" style={{ color: C.creamSoft }}>{p.description}</p>

      <div className="mb-6">
        <p className="text-4xl font-semibold tracking-[-0.025em]" style={{ color: C.cream }}>
          {p.price.value}
          <span className="text-base font-normal opacity-60 ml-1.5">{p.price.suffix}</span>
        </p>
        {p.price.sub && (
          <p className="text-xs mt-1.5" style={{ color: C.creamMute }}>{p.price.sub}</p>
        )}
      </div>

      <Link
        href={p.cta.href}
        className="block text-center py-3 rounded-xl text-sm font-semibold mb-8 transition"
        style={{
          background: p.highlight ? C.cream : 'transparent',
          color: p.highlight ? C.bg : C.cream,
          border: p.highlight ? 'none' : `1px solid ${C.lineStrong}`,
          textDecoration: 'none',
        }}
      >
        {p.cta.label}
      </Link>

      <ul className="space-y-3 flex-1">
        {p.features.map((f) => (
          <li key={f.label} className="flex items-start gap-2.5 text-sm" style={{ color: f.included ? C.cream : C.creamMute }}>
            {f.included ? (
              <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: C.leafBright }} />
            ) : (
              <X className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'rgba(239,231,210,0.25)' }} />
            )}
            <span className={f.included ? '' : 'line-through opacity-60'}>{f.label}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function RoiBox({
  top, value, sub, tone,
}: {
  top: string;
  value: string;
  sub: string;
  tone?: 'leaf' | 'copper';
}) {
  const color = tone === 'leaf' ? C.leafBright : tone === 'copper' ? C.copperBright : C.cream;
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-[0.22em] mb-2"
        style={{ fontFamily: mono, color: C.creamMute }}
      >
        {top}
      </p>
      <p className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em]" style={{ color }}>
        {value}
      </p>
      <p className="text-xs mt-1.5" style={{ color: C.creamMute }}>{sub}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{ background: 'rgba(239,231,210,0.04)', border: `1px solid ${C.line}` }}
    >
      <p className="font-semibold mb-1.5" style={{ color: C.cream }}>{q}</p>
      <p className="text-sm" style={{ color: C.creamSoft }}>{a}</p>
    </div>
  );
}
