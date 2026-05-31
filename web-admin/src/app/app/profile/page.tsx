'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Sprout, MapPin, Mail, ArrowRight } from 'lucide-react';
import {
  MobileHeader, ScreenBody, Card, PrimaryButton, m,
} from '@/components/app-ui';
import { clearSession, getProductor, getPlan, type Productor, type Plan } from '@/lib/productor';

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Productor | null>(null);
  const [plan, setPlan] = useState<Plan>('free');

  useEffect(() => {
    const p = getProductor();
    if (!p) router.replace('/app/onboarding');
    else {
      setMe(p);
      setPlan(getPlan());
    }
  }, [router]);

  if (!me) return null;

  const planInfo = {
    free:       { emoji: '🌱', name: 'Free',       price: 'Gratis',     scanLimit: 3,   status: 'Activo' },
    pro:        { emoji: '🌾', name: 'Pro',        price: 'Bs 70/mes',  scanLimit: 50,  status: 'Pendiente de pago' },
    enterprise: { emoji: '🏛', name: 'Enterprise', price: 'Bs 1.000/mes', scanLimit: 300, status: 'Pendiente de pago' },
  }[plan];

  return (
    <>
      <MobileHeader title="Mi chacra" back="/app" />
      <ScreenBody>
        <Card tone="ink">
          <p className="text-[10px] uppercase tracking-[0.22em] opacity-70 mb-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            Productor
          </p>
          <p className="text-2xl">
            <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>{me.name ?? me.email}</em>
          </p>
        </Card>

        <Card>
          <Row icon={<Mail className="h-4 w-4" />} label="Email" value={me.email} />
          <Row icon={<MapPin className="h-4 w-4" />} label="Región" value={me.region ?? '—'} />
          <Row icon={<Sprout className="h-4 w-4" />} label="Cultivo principal" value={me.crop_main ?? '—'} />
          <Row icon={<Sprout className="h-4 w-4" />} label="Hectáreas" value={me.hectares?.toString() ?? '—'} last />
        </Card>

        {/* Plan actual + upgrade */}
        <Card padded={false}>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.22em] mb-1"
                  style={{ fontFamily: 'var(--font-geist-mono)', color: m.mute }}
                >
                  Tu plan
                </p>
                <p className="text-2xl font-semibold" style={{ color: m.ink }}>
                  {planInfo.emoji} {planInfo.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: m.mute }}>
                  {planInfo.price} · {me.scans_count_month ?? 0} de {planInfo.scanLimit} scans este mes
                </p>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: planInfo.status === 'Activo' ? m.leafSoft : m.copperSoft,
                  color: planInfo.status === 'Activo' ? m.leafDeep : '#7A3F0E',
                  fontFamily: 'var(--font-geist-mono)',
                }}
              >
                {planInfo.status}
              </span>
            </div>
            <div className="h-1.5 rounded-full mb-4" style={{ background: m.line }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, ((me.scans_count_month ?? 0) / planInfo.scanLimit) * 100)}%`, background: m.leaf }}
              />
            </div>
            {plan === 'free' ? (
              <Link
                href="/precios"
                className="block text-center py-3 rounded-xl text-sm font-semibold"
                style={{ background: m.ink, color: m.bg, textDecoration: 'none' }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  🌾 Pasar a Pro — Bs 70/mes
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ) : (
              <Link
                href="/precios"
                className="block text-center py-3 rounded-xl text-sm font-semibold"
                style={{ background: m.copperBright, color: m.bg, textDecoration: 'none' }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  Activar pago · {planInfo.price}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )}
            <p className="text-[11px] mt-2 text-center" style={{ color: m.mute }}>
              Scans ilimitados · chat · clima · decisión económica
            </p>
          </div>
        </Card>

        <PrimaryButton
          onClick={() => {
            clearSession();
            router.replace('/app/onboarding');
          }}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </span>
        </PrimaryButton>
      </ScreenBody>
    </>
  );
}

function Row({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: last ? 'none' : `1px solid ${m.line}` }}
    >
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
        style={{ background: m.leafSoft, color: m.leafDeep }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: m.mute, fontFamily: 'var(--font-geist-mono)' }}>
          {label}
        </p>
        <p className="text-sm font-medium truncate" style={{ color: m.ink }}>{value}</p>
      </div>
    </div>
  );
}
