import Link from 'next/link';
import { ArrowRight, ArrowDown, WifiOff, Leaf, ShieldCheck, Users } from 'lucide-react';

// Brand palette tokens (kept inline so we don't touch shadcn theme)
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
  line: 'rgba(239,231,210,0.10)',
  lineStrong: 'rgba(239,231,210,0.18)',
  card: '#122A1B',
  cardHi: '#1A3823',
};

const sans = 'var(--font-geist-sans)';
const mono = 'var(--font-geist-mono)';
const serif = 'var(--font-instrument-serif)';

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: C.bg, color: C.cream, fontFamily: sans }}
    >
      {/* Ambient gradients */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 10%, rgba(123,160,91,0.10), transparent 50%),
            radial-gradient(ellipse at 90% 80%, rgba(184,106,46,0.12), transparent 50%)
          `,
        }}
      />

      <LandingStyles />

      {/* ────────────── NAV ────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: 'color-mix(in oklab, #0E1F14 86%, transparent)',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5" style={{ color: C.cream, textDecoration: 'none' }}>
            <Logo />
            <span className="font-semibold text-[17px] tracking-tight">Vita</span>
            <span
              className="hidden sm:inline pl-2.5 ml-1.5 text-[10px] tracking-widest"
              style={{
                fontFamily: mono,
                color: C.creamMute,
                borderLeft: `1px solid ${C.lineStrong}`,
              }}
            >
              v1.0 BO
            </span>
          </Link>
          <div className="flex items-center gap-7">
            <Link href="#producto" className="hidden md:inline text-[14px] hover:opacity-100 transition" style={{ color: C.creamSoft }}>
              Producto
            </Link>
            <Link href="/precios" className="hidden md:inline text-[14px] hover:opacity-100 transition" style={{ color: C.creamSoft }}>
              Precios
            </Link>
            <Link href="#coops" className="hidden md:inline text-[14px] hover:opacity-100 transition" style={{ color: C.creamSoft }}>
              Cooperativas
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[14px] transition"
              style={{ background: C.cream, color: C.bg }}
            >
              Entrar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ────────────── HERO BENTO ────────────── */}
        <section className="mx-auto max-w-[1320px] px-5 sm:px-8 pt-14 pb-8">
          {/* Live ribbon */}
          <div
            className="inline-flex items-center gap-2.5 pr-3 pl-2 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(123,160,91,0.10)',
              border: '1px solid rgba(123,160,91,0.32)',
              color: C.leafBright,
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.08em',
            }}
          >
            <span className="live-dot" />
            412 escaneos en Santa Cruz hoy
          </div>

          <div className="bento">
            {/* HERO CARD */}
            <article className="card card--hero">
              <CardCorner label="01 / hero" />
              <h1
                className="text-[40px] sm:text-[56px] lg:text-[76px] font-medium tracking-[-0.035em] leading-[0.98]"
                style={{ fontFamily: sans }}
              >
                Diagnostica plagas{' '}
                <em
                  className="not-italic"
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: C.copperBright,
                    letterSpacing: '-0.01em',
                  }}
                >
                  con una foto.
                </em>
              </h1>
              <p className="mt-6 max-w-[440px] text-[17px] leading-[1.5]" style={{ color: C.creamSoft }}>
                Vita identifica plagas y enfermedades de soya, maíz, sorgo y
                algodón en doce segundos. Funciona sin red en plena chacra y
                devuelve tratamiento orgánico y químico con dosis exacta.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <a
                  href="#"
                  className="inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-[10px] text-[15px] font-medium transition"
                  style={{ background: C.cream, color: C.bg }}
                >
                  Descargar app
                  <ArrowDown className="h-3.5 w-3.5" />
                </a>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-[10px] text-[15px] font-medium transition"
                  style={{
                    background: 'transparent',
                    color: C.cream,
                    border: `1px solid ${C.lineStrong}`,
                  }}
                >
                  Acceder al panel
                </Link>
              </div>

              <div
                className="mt-auto pt-9 grid grid-cols-3 gap-6"
                style={{ borderTop: `1px solid ${C.line}` }}
              >
                <Stat n="12s" l="tiempo medio" />
                <Stat n="30" l="plagas en catálogo" />
                <Stat n="5" l="cultivos SCZ" />
              </div>
            </article>

            {/* DEMO CARD */}
            <article className="card card--demo">
              <div className="demo-viz">
                <div className="scangrid" />
                <svg className="leafdemo" viewBox="0 0 200 240" aria-hidden="true">
                  <path
                    d="M100 20 C 40 30, 25 130, 50 200 C 80 240, 150 230, 170 180 C 190 110, 160 30, 100 20 Z"
                    fill={C.leafBright}
                    fillOpacity="0.92"
                  />
                  <path d="M100 25 Q 108 130 115 220" stroke={C.bg} strokeOpacity="0.4" strokeWidth="1.4" fill="none" />
                  <circle cx="80" cy="100" r="8" fill={C.copper} />
                  <circle cx="125" cy="135" r="6" fill={C.copper} />
                  <circle cx="95" cy="160" r="7" fill={C.copper} />
                  <circle cx="140" cy="90" r="5" fill={C.copper} />
                </svg>
                <div className="targetbox" />
                <div className="scanbar" />
              </div>
              <div
                className="px-6 pt-5 pb-[22px]"
                style={{ background: C.card, borderTop: `1px solid ${C.line}` }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.16em] mb-1.5"
                  style={{ fontFamily: mono, color: C.creamMute }}
                >
                  resultado
                </div>
                <div className="font-medium text-[18px] tracking-tight">Roya asiática · soya</div>
                <div
                  className="inline-flex items-center gap-1.5 mt-1 text-[11px]"
                  style={{ fontFamily: mono, color: C.copperBright }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3 5 L4.5 6.5 L7 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  </svg>
                  89% confianza · severidad media
                </div>
              </div>
            </article>

            {/* PRECISION CARD */}
            <article className="card card--precision">
              <CardCorner label="03 / IA" />
              <div
                className="text-[11px] uppercase tracking-[0.16em]"
                style={{ fontFamily: mono, color: C.creamMute }}
              >
                Precisión validada
              </div>
              <h3
                className="text-[28px] mt-3 leading-[1.1] tracking-tight"
                style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 400 }}
              >
                Catálogo curado, no IA libre.
              </h3>
              <div
                className="mt-auto text-[72px] font-medium leading-none tracking-[-0.045em]"
                style={{ color: C.cream }}
              >
                87
                <sup className="text-[28px] font-normal align-[22px] ml-1" style={{ color: C.creamMute }}>
                  %
                </sup>
              </div>
              <div className="mt-6 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(239,231,210,0.08)' }}>
                <div className="fillbar" />
              </div>
              <div
                className="mt-[18px] text-[11px] uppercase tracking-[0.16em]"
                style={{ fontFamily: mono, color: C.creamMute }}
              >
                Validado por agrónomos del Oriente
              </div>
            </article>

            {/* MAP CARD */}
            <article className="card card--map">
              <div className="flex justify-between items-center px-6 pt-[22px] pb-4">
                <h4 className="font-medium text-[16px] tracking-tight m-0">Focos esta semana</h4>
                <span
                  className="text-[10px] tracking-[0.1em] px-2.5 py-1 rounded-full"
                  style={{
                    fontFamily: mono,
                    background: 'rgba(184,106,46,0.18)',
                    color: C.copperBright,
                    border: '1px solid rgba(184,106,46,0.4)',
                  }}
                >
                  EN VIVO
                </span>
              </div>
              <svg className="mapsvg" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
                <path
                  d="M 40 180 C 60 130, 50 80, 100 60 C 170 40, 280 50, 340 90 C 380 130, 360 180, 300 190 C 220 205, 80 200, 40 180 Z"
                  fill={C.bg}
                  stroke={C.leaf}
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
                <path
                  d="M 90 100 Q 180 130 240 110 T 350 140"
                  stroke={C.leaf}
                  strokeOpacity="0.45"
                  strokeWidth="1.4"
                  fill="none"
                />
                <g fill={C.copperBright}>
                  <circle className="pulse-dot" cx="280" cy="100" r="5" />
                  <circle className="pulse-dot" cx="220" cy="135" r="5" style={{ animationDelay: '.5s' }} />
                  <circle className="pulse-dot" cx="160" cy="120" r="5" style={{ animationDelay: '1s' }} />
                  <circle className="pulse-dot" cx="310" cy="160" r="5" style={{ animationDelay: '1.5s' }} />
                </g>
                <g style={{ fontFamily: 'monospace' }} fontSize="8" fill={C.cream} fillOpacity="0.45" letterSpacing="1">
                  <text x="225" y="155">SCZ</text>
                  <text x="240" y="92">CUATRO C.</text>
                  <text x="180" y="138">PAILÓN</text>
                  <text x="320" y="178">SAN JULIÁN</text>
                </g>
              </svg>
            </article>

            {/* OFFLINE CARD */}
            <article
              className="card card--offline"
              style={{ background: `linear-gradient(180deg, ${C.cardHi}, ${C.card})` }}
            >
              <CardCorner label="05 / offline" />
              <WifiOff className="h-7 w-7 mb-[22px]" style={{ color: C.leafBright }} />
              <h4 className="font-medium text-[22px] tracking-[-0.02em] leading-[1.15] m-0">
                Funciona sin señal.
              </h4>
              <p className="m-0 mt-2.5 text-[14px] leading-[1.5]" style={{ color: C.creamSoft }}>
                Capturás en la chacra, el escaneo queda en cola y se sincroniza
                cuando volvés a tener red.
              </p>
              <div
                className="mt-[22px] flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] text-[11px]"
                style={{
                  fontFamily: mono,
                  background: 'rgba(239,231,210,0.05)',
                  border: `1px dashed ${C.lineStrong}`,
                  color: C.creamSoft,
                }}
              >
                <span className="queue-pulse" />
                1 escaneo en cola · sync al recuperar 4G
              </div>
            </article>
          </div>
        </section>

        {/* ────────────── IMPACTO ────────────── */}
        <section id="producto" className="mx-auto max-w-[1320px] px-5 sm:px-8 pt-24 pb-14">
          <SectionHead kicker="Triple impacto" title="Tres frentes a la vez." emphasis="Sin negociar ninguno." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <Impact
              icon={<Leaf className="h-5 w-5" />}
              tone="leaf"
              label="Ambiental"
              title="Menos agroquímicos mal aplicados."
              body="Diagnóstico preciso evita fumigación a ciegas. Menos contaminación de pozos y suelos en la cuenca de SCZ."
              metric="−40%"
              unit="uso reducido"
            />
            <Impact
              icon={<ShieldCheck className="h-5 w-5" />}
              tone="copper"
              label="Económico"
              title="Más rendimiento, menos pérdida."
              body="El mal diagnóstico cuesta entre Bs 200 y Bs 800 por hectárea. Vita recupera rinde y ahorra insumos."
              metric="+800"
              unit="Bs / ha"
            />
            <Impact
              icon={<Users className="h-5 w-5" />}
              tone="leaf"
              label="Social"
              title="Acceso técnico para todos."
              body="Hoy hay un agrónomo cada 800 productores. Vita democratiza conocimiento y reduce intoxicaciones rurales."
              metric="1 : 1"
              unit="agrónomo · productor"
            />
          </div>
        </section>

        {/* ────────────── CIFRAS SCZ ────────────── */}
        <section
          className="py-24"
          style={{
            background: C.bgDeep,
            borderTop: `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
            <SectionHead
              kicker="El problema en cifras"
              title="Santa Cruz no tiene un problema de voluntad,"
              emphasis="tiene uno de escala."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
              <BigStat n="200K" lbl="productores agrícolas activos en el departamento." />
              <BigStat n={<>80<sup className="text-[0.45em] align-[30%] font-normal" style={{ color: C.creamMute }}>%</sup></>} lbl="diagnostica plagas a ojo, sin asistencia técnica." />
              <BigStat n="$50M" lbl="perdidos al año por mal uso de agroquímicos." />
            </div>

            <div
              className="mt-12 pt-5 text-[10px] uppercase tracking-[0.18em]"
              style={{
                borderTop: `1px solid ${C.line}`,
                fontFamily: mono,
                color: C.creamMute,
              }}
            >
              Fuente · INE 2024 · INIAF · Cámara Agropecuaria del Oriente
            </div>
          </div>
        </section>

        {/* ────────────── COOPS CTA ────────────── */}
        <section id="coops" className="mx-auto max-w-[1320px] px-5 sm:px-8 py-28">
          <div
            className="relative overflow-hidden rounded-3xl px-8 md:px-14 py-16 md:py-[72px]"
            style={{
              background: `linear-gradient(135deg, ${C.cardHi} 0%, #2A4F33 100%)`,
              border: `1px solid ${C.lineStrong}`,
            }}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                top: '-50%',
                right: '-20%',
                width: 600,
                height: 600,
                background: 'radial-gradient(circle, rgba(184,106,46,0.25), transparent 60%)',
              }}
            />
            <div className="relative grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-10 items-end">
              <h2
                className="text-[34px] md:text-[44px] lg:text-[52px] font-medium tracking-[-0.035em] leading-[1.02] m-0"
                style={{ fontFamily: sans }}
              >
                El panel donde se ve todo
                <br />
                <em
                  className="not-italic"
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: C.copperBright,
                  }}
                >
                  antes que en el campo.
                </em>
              </h2>
              <div>
                <p className="mt-5 mb-8 max-w-[460px] text-[16px]" style={{ color: C.creamSoft }}>
                  Mapa de focos en vivo, validación de diagnósticos, alertas
                  zonales push y exportes CSV para tu equipo técnico.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-[10px] text-[15px] font-medium transition"
                  style={{ background: C.cream, color: C.bg }}
                >
                  Solicitar acceso institucional
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ────────────── FOOTER ────────────── */}
      <footer
        className="pt-[72px] pb-8"
        style={{
          background: C.bgDeep,
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
            <div>
              <Link href="/" className="flex items-center gap-2.5" style={{ color: C.cream, textDecoration: 'none' }}>
                <Logo />
                <span className="font-semibold text-[17px]">Vita</span>
              </Link>
              <p className="text-[14px] mt-4 max-w-[300px]" style={{ color: C.creamSoft }}>
                Diagnóstico agronómico construido en Santa Cruz, para Santa Cruz.
              </p>
            </div>
            <FooterCol title="Producto" items={[['#', 'Descargar app'], ['/login', 'Panel'], ['#catalogo', 'Catálogo']]} />
            <FooterCol title="Equipo" items={[['#', 'Nosotros'], ['#', 'Aliados'], ['mailto:hola@vita.bo', 'Contacto']]} />
            <FooterCol title="Legal" items={[['#', 'Privacidad'], ['#', 'Términos']]} />
          </div>
          <div
            className="mt-14 pt-[22px] flex justify-between text-[10px] uppercase tracking-[0.2em]"
            style={{
              borderTop: `1px solid ${C.line}`,
              fontFamily: mono,
              color: C.creamMute,
            }}
          >
            <span>© 2026 Vita</span>
            <span>v1.0 — Santa Cruz, Bolivia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────── */

function Logo() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/vita-icon.png"
      alt="Vita"
      width={26}
      height={26}
      style={{ borderRadius: 6, display: 'inline-block' }}
    />
  );
}

function CardCorner({ label }: { label: string }) {
  return (
    <span
      className="absolute top-4 right-4 text-[10px] tracking-[0.12em]"
      style={{ fontFamily: mono, color: C.creamMute }}
    >
      {label}
    </span>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-medium text-[28px] tracking-[-0.025em]" style={{ color: C.cream }}>
        {n}
      </div>
      <div
        className="text-[10px] uppercase tracking-[0.14em] mt-1.5"
        style={{ fontFamily: mono, color: C.creamMute }}
      >
        {l}
      </div>
    </div>
  );
}

function SectionHead({ kicker, title, emphasis }: { kicker: string; title: string; emphasis: string }) {
  return (
    <div className="mb-14">
      <span
        className="inline-block text-[11px] uppercase tracking-[0.22em] px-3 py-2 rounded-full mb-6"
        style={{
          fontFamily: mono,
          color: C.leafBright,
          border: '1px solid rgba(123,160,91,0.32)',
          background: 'rgba(123,160,91,0.08)',
        }}
      >
        {kicker}
      </span>
      <h2
        className="font-medium text-[36px] md:text-[48px] lg:text-[60px] tracking-[-0.035em] leading-[1.02] m-0 max-w-[920px]"
        style={{ fontFamily: sans }}
      >
        {title}{' '}
        <em
          className="not-italic"
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontWeight: 400,
            color: C.copperBright,
            letterSpacing: '-0.01em',
          }}
        >
          {emphasis}
        </em>
      </h2>
    </div>
  );
}

function Impact({
  icon,
  tone,
  label,
  title,
  body,
  metric,
  unit,
}: {
  icon: React.ReactNode;
  tone: 'leaf' | 'copper';
  label: string;
  title: string;
  body: string;
  metric: string;
  unit: string;
}) {
  const iconBg = tone === 'copper' ? 'rgba(184,106,46,0.14)' : 'rgba(123,160,91,0.14)';
  const iconColor = tone === 'copper' ? C.copperBright : C.leafBright;
  return (
    <article
      className="card-hover relative flex flex-col overflow-hidden rounded-[18px] p-[30px] min-h-[320px]"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div
        className="w-10 h-10 rounded-[10px] grid place-items-center mb-5"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div
        className="text-[10px] uppercase tracking-[0.2em] mb-2.5"
        style={{ fontFamily: mono, color: C.creamMute }}
      >
        {label}
      </div>
      <h3 className="font-medium text-[24px] tracking-[-0.02em] leading-[1.15] m-0 mb-3">{title}</h3>
      <p className="m-0 text-[14.5px] leading-[1.5]" style={{ color: C.creamSoft }}>
        {body}
      </p>
      <div className="mt-auto pt-7 flex items-baseline gap-2">
        <span
          className="font-medium text-[48px] leading-none tracking-[-0.04em]"
          style={{ color: C.copperBright }}
        >
          {metric}
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.14em]"
          style={{ fontFamily: mono, color: C.creamMute }}
        >
          {unit}
        </span>
      </div>
    </article>
  );
}

function BigStat({ n, lbl }: { n: React.ReactNode; lbl: string }) {
  return (
    <div>
      <div
        className="font-medium text-[56px] md:text-[80px] lg:text-[96px] leading-none tracking-[-0.045em] mb-3.5"
        style={{ color: C.cream }}
      >
        {n}
      </div>
      <div className="text-[15px] leading-[1.45] max-w-[280px]" style={{ color: C.creamSoft }}>
        {lbl}
      </div>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h5
        className="m-0 mb-4 text-[10px] uppercase tracking-[0.22em]"
        style={{ fontFamily: mono, color: C.creamMute }}
      >
        {title}
      </h5>
      {items.map(([href, label]) => (
        <Link
          key={label}
          href={href}
          className="block py-1.5 text-[14px] hover:opacity-100"
          style={{ color: C.creamSoft, textDecoration: 'none' }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Scoped styles (keyframes + grid + animations)
   ───────────────────────────────────────────────────────── */
function LandingStyles() {
  return (
    <style
      // eslint-disable-next-line react/no-unknown-property
      dangerouslySetInnerHTML={{
        __html: `
        .live-dot { width: 7px; height: 7px; background: ${C.leafBright}; border-radius: 50%; animation: blink 1.4s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }

        .bento {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 14px;
        }
        @media (max-width: 1080px) { .bento { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 720px) { .bento { grid-template-columns: 1fr; } }

        .card {
          background: ${C.card};
          border: 1px solid ${C.line};
          border-radius: 18px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          transition: transform .35s cubic-bezier(.2,.7,.2,1), border-color .25s;
        }
        .card:hover { transform: translateY(-3px); border-color: ${C.lineStrong}; }

        .card--hero {
          grid-column: 1; grid-row: 1 / span 2;
          padding: 36px 36px 32px;
          background: radial-gradient(ellipse at 0% 100%, rgba(184,106,46,0.20), transparent 60%), ${C.card};
          min-height: 580px;
          display: flex; flex-direction: column;
        }
        @media (max-width: 1080px) { .card--hero { grid-column: 1 / -1; grid-row: auto; min-height: auto; } }

        .card--demo {
          grid-column: 2; grid-row: 1;
          background: linear-gradient(180deg, ${C.cardHi} 0%, ${C.card} 100%);
          padding: 0;
          display: flex; flex-direction: column;
          min-height: 280px;
        }
        .demo-viz { position: relative; flex: 1; background: #213F2A; overflow: hidden; }
        .demo-viz::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(123,160,91,0.4) 0%, transparent 60%);
        }
        .scangrid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(239,231,210,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239,231,210,0.06) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .leafdemo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; height: 80%; }
        .scanbar {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, ${C.copperBright}, transparent);
          box-shadow: 0 0 12px ${C.copperBright};
          animation: scan 2.6s cubic-bezier(.4,0,.6,1) infinite;
        }
        @keyframes scan { 0%, 100% { top: 5%; } 50% { top: 95%; } }
        .targetbox {
          position: absolute; top: 30%; left: 40%;
          width: 60px; height: 60px;
          border: 1.5px solid ${C.copperBright};
          border-radius: 6px;
          animation: target-pulse 2.6s infinite;
        }
        .targetbox::before, .targetbox::after {
          content: ''; position: absolute; width: 10px; height: 10px;
          border: 1.5px solid ${C.copperBright};
        }
        .targetbox::before { top: -2px; left: -2px; border-right: none; border-bottom: none; }
        .targetbox::after { bottom: -2px; right: -2px; border-left: none; border-top: none; }
        @keyframes target-pulse { 0%, 100% { opacity: 0.85; } 50% { opacity: 0.4; } }

        .card--precision { grid-column: 3; grid-row: 1; display: flex; flex-direction: column; }
        .fillbar {
          height: 100%; width: 87%;
          background: linear-gradient(90deg, ${C.leaf}, ${C.leafBright});
          border-radius: 999px;
          transform-origin: left;
          transform: scaleX(0);
          animation: fillbar 1.5s cubic-bezier(.2,.7,.2,1) forwards;
        }
        @keyframes fillbar { to { transform: scaleX(1); } }

        .card--map { grid-column: 2; grid-row: 2; padding: 0; background: #1A3823; min-height: 280px; display: flex; flex-direction: column; }
        .mapsvg { width: 100%; flex: 1; display: block; }
        .pulse-dot { transform-origin: center; animation: pulse 2.4s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { r: 5; opacity: 0.95; } 50% { r: 11; opacity: 0.45; } }

        .card--offline { grid-column: 3; grid-row: 2; }
        .queue-pulse {
          width: 8px; height: 8px; background: ${C.copperBright};
          border-radius: 2px; animation: blink 1.4s infinite; display: inline-block;
        }

        .card-hover { transition: transform .35s cubic-bezier(.2,.7,.2,1), border-color .25s; }
        .card-hover:hover { transform: translateY(-3px); border-color: ${C.lineStrong}; }

        /* Mobile/tablet: clear explicit grid placements so bento can collapse cleanly */
        @media (max-width: 1080px) {
          .card--demo, .card--precision, .card--map, .card--offline {
            grid-column: auto !important;
            grid-row: auto !important;
          }
        }
      `,
      }}
    />
  );
}
