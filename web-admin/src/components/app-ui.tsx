'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const m = {
  bg: '#F7F4EB',
  ink: '#0E1F14',
  inkSoft: '#3A4A3F',
  mute: '#6B7A6F',
  line: '#E6DFCC',
  leaf: '#7BA05B',
  leafDeep: '#3F5A2A',
  leafSoft: '#F1F6EA',
  copper: '#B86A2E',
  copperBright: '#D88340',
  copperSoft: '#FBEEDC',
  danger: '#B83A2E',
  paper: '#FFFFFF',
};

export function MobileHeader({
  title,
  back,
  right,
}: {
  title?: React.ReactNode;
  back?: string;
  right?: React.ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
      style={{
        background: 'rgba(247,244,235,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${m.line}`,
      }}
    >
      <div className="flex items-center gap-2">
        {back && (
          <Link
            href={back}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ border: `1px solid ${m.line}`, color: m.ink }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        {title && (
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: m.ink }}>
            {title}
          </h1>
        )}
      </div>
      {right}
    </header>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  size = 'lg',
  full = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
}) {
  const padding = size === 'sm' ? 'px-3 py-2 text-sm' : size === 'md' ? 'px-4 py-2.5' : 'px-5 py-3.5';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${padding} ${full ? 'w-full' : ''} rounded-2xl font-semibold transition`}
      style={{
        background: disabled ? '#C7D2BB' : m.ink,
        color: m.bg,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const Inner = (
    <span
      className="inline-flex items-center justify-center w-full rounded-2xl px-5 py-3.5 font-medium"
      style={{ border: `1px solid ${m.line}`, color: m.ink, background: m.paper }}
    >
      {children}
    </span>
  );
  if (href) return <Link href={href}>{Inner}</Link>;
  return (
    <button type="button" onClick={onClick} className="w-full">
      {Inner}
    </button>
  );
}

export function MobileInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && (
        <span
          className="text-[11px] uppercase tracking-[0.18em] block mb-1.5"
          style={{ color: m.mute, fontFamily: 'var(--font-geist-mono)' }}
        >
          {label}
        </span>
      )}
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl text-base"
        style={{
          background: m.paper,
          border: `1px solid ${m.line}`,
          color: m.ink,
        }}
      />
    </label>
  );
}

export function Card({
  children,
  className = '',
  tone = 'paper',
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'paper' | 'leaf' | 'copper' | 'ink';
  padded?: boolean;
}) {
  const tones = {
    paper: { bg: m.paper, border: m.line, color: m.ink },
    leaf: { bg: m.leafSoft, border: '#D7E3C2', color: m.leafDeep },
    copper: { bg: m.copperSoft, border: '#F1D9B5', color: '#7A3F0E' },
    ink: { bg: m.ink, border: '#1F3024', color: '#EFE7D2' },
  }[tone];
  return (
    <div
      className={`rounded-2xl overflow-hidden ${padded ? 'p-5' : ''} ${className}`}
      style={{ background: tones.bg, border: `1px solid ${tones.border}`, color: tones.color }}
    >
      {children}
    </div>
  );
}

export function ScreenBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 px-5 pt-5 pb-28 space-y-5 ${className}`}>{children}</div>;
}
