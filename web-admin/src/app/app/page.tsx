'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, History, User, Bell, Sprout, Cloud } from 'lucide-react';
import {
  MobileHeader, PrimaryButton, GhostButton, Card, ScreenBody, m,
} from '@/components/app-ui';
import { getProductor, productorFetch, type Productor } from '@/lib/productor';

interface ScanSummary {
  id: string;
  detected_pest_name: string | null;
  severity: string | null;
  created_at: string;
  image_url: string;
}

export default function AppHome() {
  const router = useRouter();
  const [me, setMe] = useState<Productor | null>(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<ScanSummary[]>([]);

  useEffect(() => {
    const p = getProductor();
    if (!p) {
      router.push('/app/onboarding');
      return;
    }
    setMe(p);
    productorFetch<{ scans: ScanSummary[] }>('/scans/me?limit=3')
      .then((r) => setRecent(r.scans))
      .catch(() => setRecent([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (!me) {
    return (
      <ScreenBody>
        <p style={{ color: m.mute }}>Cargando…</p>
      </ScreenBody>
    );
  }

  return (
    <>
      <MobileHeader
        title={
          <span>
            Hola, <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>{me.name?.split(' ')[0] ?? 'productor'}</em>
          </span>
        }
        right={
          <Link
            href="/app/profile"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: m.ink, color: m.bg }}
          >
            <User className="h-4 w-4" />
          </Link>
        }
      />

      <ScreenBody>
        {/* Contextual greeting card */}
        <Card tone="ink">
          <p
            className="text-[10px] uppercase tracking-[0.22em] mb-2 opacity-70"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            Tu chacra · {me.region ?? 'sin región'}
          </p>
          <p className="text-2xl leading-tight">
            <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
              {me.crop_main ?? 'cultivo'}
            </em>{' '}
            · {me.hectares ?? '—'} ha
          </p>
          <p className="text-xs mt-3 opacity-70">
            Sacá una foto cuando veas algo raro. En 12 segundos te digo qué es.
          </p>
        </Card>

        {/* CTA principal */}
        <Link
          href="/app/scan"
          className="block rounded-2xl p-6 text-center shadow-md transition-transform active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${m.leaf} 0%, ${m.leafDeep} 100%)`,
            color: '#F7F4EB',
          }}
        >
          <Camera className="h-10 w-10 mx-auto mb-3" />
          <p className="text-xl font-semibold tracking-tight">Escanear planta</p>
          <p className="text-xs opacity-80 mt-1">
            Plagas · enfermedades · clima · tratamiento
          </p>
        </Link>

        {/* Tiles secundarias */}
        <div className="grid grid-cols-2 gap-3">
          <Tile href="/app/history" icon={<History className="h-5 w-5" />} label="Historial" />
          <Tile href="/app/profile" icon={<Sprout className="h-5 w-5" />} label="Mi chacra" />
        </div>

        {/* Últimos escaneos */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold" style={{ color: m.ink }}>
              Últimos escaneos
            </h2>
            <Link href="/app/history" className="text-xs" style={{ color: m.leafDeep }}>
              Ver todos →
            </Link>
          </div>
          {loading ? (
            <p className="text-sm" style={{ color: m.mute }}>Cargando…</p>
          ) : recent.length === 0 ? (
            <Card>
              <p className="text-sm" style={{ color: m.mute }}>
                Todavía no escaneaste nada. Probá con la primera foto.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {recent.map((s) => <RecentRow key={s.id} s={s} />)}
            </div>
          )}
        </div>

        {/* Diferenciador callout */}
        <Card tone="copper">
          <div className="flex items-start gap-3">
            <Cloud className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">El clima decide por vos</p>
              <p className="opacity-90">
                Si va a llover, Vita te avisa que esperés. No tiramos plata al barro.
              </p>
            </div>
          </div>
        </Card>
      </ScreenBody>

      <BottomNav active="home" />
    </>
  );
}

function Tile({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl p-4 flex flex-col gap-2 active:scale-[0.98] transition-transform"
      style={{ background: m.paper, border: `1px solid ${m.line}`, color: m.ink }}
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: m.leafSoft, color: m.leafDeep }}
      >
        {icon}
      </span>
      <p className="text-sm font-medium">{label}</p>
    </Link>
  );
}

function RecentRow({ s }: { s: ScanSummary }) {
  const sev = s.severity ?? 'low';
  const sevColor = sev === 'high' ? m.danger : sev === 'medium' ? m.copperBright : m.leaf;
  return (
    <Link
      href={`/app/result/${s.id}`}
      className="flex gap-3 items-center rounded-2xl p-3 active:scale-[0.99] transition-transform"
      style={{ background: m.paper, border: `1px solid ${m.line}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.image_url}
        alt=""
        className="w-14 h-14 rounded-xl object-cover shrink-0"
        style={{ background: m.line }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate" style={{ color: m.ink }}>
          {s.detected_pest_name ?? 'Sin diagnóstico'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: m.mute }}>
          {new Date(s.created_at).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
        style={{ background: `${sevColor}1A`, color: sevColor }}
      >
        {sev}
      </span>
    </Link>
  );
}

function BottomNav({ active }: { active: 'home' | 'history' | 'profile' }) {
  return (
    <nav
      className="sticky bottom-0 grid grid-cols-3"
      style={{ background: 'rgba(247,244,235,0.96)', borderTop: `1px solid ${m.line}`, backdropFilter: 'blur(10px)' }}
    >
      <BottomItem href="/app" icon={<Bell className="h-5 w-5" />} label="Inicio" on={active === 'home'} />
      <BottomItem href="/app/history" icon={<History className="h-5 w-5" />} label="Historial" on={active === 'history'} />
      <BottomItem href="/app/profile" icon={<User className="h-5 w-5" />} label="Perfil" on={active === 'profile'} />
    </nav>
  );
}

function BottomItem({ href, icon, label, on }: { href: string; icon: React.ReactNode; label: string; on: boolean }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center py-2.5 gap-1"
      style={{ color: on ? m.leafDeep : m.mute }}
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </Link>
  );
}
