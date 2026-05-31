/**
 * Panel UI primitives — paleta y tipografía Vita para el admin.
 *
 * Mantenemos el panel "tool-like" (denso, scannable) pero con el lenguaje
 * visual de la marca: verde profundo + cream + cobre + serif italic acento.
 */
import { cn } from '@/lib/utils';

export const brand = {
  bg: '#F7F4EB',          // cream papel — fondo del panel
  panel: '#FFFFFF',       // tarjetas blancas
  ink: '#0E1F14',         // verde profundo de la marca, usado como texto principal
  inkSoft: '#3A4A3F',
  mute: '#6B7A6F',
  line: '#E6DFCC',
  leaf: '#7BA05B',
  leafBright: '#9BC07A',
  leafDeep: '#3F5A2A',
  copper: '#B86A2E',
  copperBright: '#D88340',
  copperSoft: '#FBEEDC',
  danger: '#B83A2E',
};

export function PanelHeader({
  title,
  subtitle,
  meta,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <p
          className="text-[10px] uppercase tracking-[0.22em] mb-2"
          style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}
        >
          Vita · panel
        </p>
        <h1
          className="text-3xl font-medium tracking-[-0.02em] leading-tight"
          style={{ color: brand.ink }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5 max-w-2xl" style={{ color: brand.inkSoft }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {meta}
        {children}
      </div>
    </header>
  );
}

export function PanelCard({
  className,
  children,
  padded = true,
  tone = 'paper',
}: {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
  tone?: 'paper' | 'leaf' | 'copper' | 'ink';
}) {
  const tones = {
    paper: { bg: brand.panel, border: brand.line, text: brand.ink },
    leaf: { bg: '#F1F6EA', border: '#D7E3C2', text: brand.leafDeep },
    copper: { bg: brand.copperSoft, border: '#F1D9B5', text: '#7A3F0E' },
    ink: { bg: brand.ink, border: '#1F3024', text: '#EFE7D2' },
  }[tone];
  return (
    <div
      className={cn('rounded-2xl overflow-hidden', padded && 'p-6', className)}
      style={{
        background: tones.bg,
        border: `1px solid ${tones.border}`,
        color: tones.text,
      }}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  hint,
  right,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3">
      <div>
        <h3
          className="text-base font-semibold tracking-tight"
          style={{ color: brand.ink }}
        >
          {title}
        </h3>
        {hint && (
          <p className="text-xs mt-0.5" style={{ color: brand.mute }}>
            {hint}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = 'neutral',
  size = 'sm',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'leaf' | 'copper' | 'danger' | 'demo';
  size?: 'xs' | 'sm';
}) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    neutral: { bg: '#F3EFE0', color: brand.inkSoft, border: brand.line },
    leaf: { bg: '#E6F0D6', color: brand.leafDeep, border: '#C9DCB0' },
    copper: { bg: brand.copperSoft, color: '#7A3F0E', border: '#F1D9B5' },
    danger: { bg: '#F8E1DD', color: brand.danger, border: '#F0C5BD' },
    demo: { bg: '#FFF7E0', color: '#7A5D0E', border: '#F0DA9D' },
  };
  const s = styles[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'xs' ? 'text-[10px] px-2 py-0.5 tracking-wider uppercase' : 'text-xs px-2.5 py-1',
      )}
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontFamily: 'var(--font-geist-mono)' }}
    >
      {children}
    </span>
  );
}

/** Logo Vita — hoja + frame de scan, rounded corners. */
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/vita-icon.png"
      alt="Vita"
      width={size}
      height={size}
      style={{ borderRadius: Math.max(4, size * 0.22), display: 'inline-block' }}
    />
  );
}

/** Big stat / KPI for hero rows */
export function HeroKpi({
  icon,
  label,
  value,
  hint,
  trend,
  tone = 'paper',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: { dir: 'up' | 'down' | 'flat'; pct: number };
  tone?: 'paper' | 'leaf' | 'copper' | 'ink';
}) {
  return (
    <PanelCard tone={tone} className="relative">
      <div className="flex items-start justify-between gap-3 mb-6">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background:
              tone === 'leaf'
                ? '#D7E3C2'
                : tone === 'copper'
                ? '#F1D9B5'
                : tone === 'ink'
                ? '#1F3024'
                : '#F3EFE0',
            color:
              tone === 'leaf'
                ? brand.leafDeep
                : tone === 'copper'
                ? '#7A3F0E'
                : tone === 'ink'
                ? brand.leafBright
                : brand.inkSoft,
          }}
        >
          {icon}
        </span>
        <p
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            color: tone === 'ink' ? 'rgba(239,231,210,0.55)' : brand.mute,
          }}
        >
          {label}
        </p>
      </div>
      <p
        className="text-3xl font-semibold leading-none tracking-[-0.025em]"
        style={{
          color:
            tone === 'ink' ? '#EFE7D2'
            : tone === 'copper' ? '#7A3F0E'
            : tone === 'leaf' ? brand.leafDeep
            : brand.ink,
        }}
      >
        {value}
      </p>
      {hint && (
        <p
          className="text-xs mt-2"
          style={{
            color: tone === 'ink' ? 'rgba(239,231,210,0.6)' : brand.mute,
          }}
        >
          {hint}
        </p>
      )}
      {trend && (
        <p
          className="text-xs mt-1 font-medium"
          style={{
            color:
              trend.dir === 'up'
                ? brand.leafDeep
                : trend.dir === 'down'
                ? brand.danger
                : brand.mute,
          }}
        >
          {trend.dir === 'up' ? '▲' : trend.dir === 'down' ? '▼' : '·'}{' '}
          {trend.pct.toFixed(1)}% vs mes anterior
        </p>
      )}
    </PanelCard>
  );
}

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('space-y-4', className)}>{children}</section>;
}
