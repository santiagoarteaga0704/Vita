'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sprout, Wheat, Building2, Check } from 'lucide-react';
import {
  ScreenBody, PrimaryButton, GhostButton, MobileInput, Card, m,
} from '@/components/app-ui';
import { SczLocationPicker, type SelectedLocation } from '@/components/scz-location-picker';
import { saveSession, type Productor } from '@/lib/productor';

const CULTIVOS = ['soya', 'maíz', 'sorgo', 'algodón', 'arroz', 'papa', 'tomate', 'cítricos', 'cebolla'];

type Plan = 'free' | 'pro' | 'enterprise';

const PLAN_INFO: Record<Plan, { name: string; emoji: string; price: string; tagline: string }> = {
  free: { name: 'Free', emoji: '🌱', price: 'Bs 0/mes', tagline: '1 a 5 ha · 3 scans/mes' },
  pro: { name: 'Pro', emoji: '🌾', price: 'Bs 70/mes', tagline: '5 a 20 ha · 50 scans/mes' },
  enterprise: { name: 'Enterprise', emoji: '🏛', price: 'Bs 1.000/mes', tagline: 'Hectáreas ilimitadas · 300 scans · 5 cuentas' },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'welcome' | 'plan' | 'login' | 'register'>('welcome');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [cropMain, setCropMain] = useState('soya');
  const [hectares, setHectares] = useState('');
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError('Elegí una ubicación en el mapa o desde el buscador.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          region: location.name,
          municipality: location.municipality,
          province: location.province,
          gps_lat: location.lat,
          gps_lng: location.lng,
          crop_main: cropMain,
          hectares: hectares ? parseInt(hectares, 10) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Error');
      // Guardamos el plan elegido en localStorage (en hackathon no hay flujo
      // de pago real; cuando el productor entre a profile va a ver su plan).
      if (typeof window !== 'undefined') {
        localStorage.setItem('vita_productor_plan', plan);
      }
      saveSession(json.data.token, json.data.user as Productor);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setLoading(false);
    }
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Error');
      saveSession(json.data.token, json.data.user as Productor);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'welcome') {
    return (
      <ScreenBody className="flex flex-col items-stretch justify-end min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vita-icon.png"
              alt="Vita"
              className="mx-auto mb-5"
              style={{ width: 72, height: 72, borderRadius: 18, boxShadow: '0 12px 30px -10px rgba(63,90,42,0.35)' }}
            />
            <p
              className="text-[10px] uppercase tracking-[0.32em] mb-3"
              style={{ color: m.mute, fontFamily: 'var(--font-geist-mono)' }}
            >
              Vita
            </p>
            <h1 className="text-4xl tracking-tight leading-[1.05]" style={{ color: m.ink }}>
              <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Visión</em> inteligente
              <br />para tu cosecha.
            </h1>
            <p className="text-sm mt-4 max-w-[300px] mx-auto" style={{ color: m.mute }}>
              Sacá una foto y te decimos qué tiene tu cultivo, qué hacer, cuánto te ahorra y si conviene esperar a que pase la lluvia.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <PrimaryButton onClick={() => setMode('plan')}>Crear cuenta</PrimaryButton>
          <GhostButton onClick={() => setMode('login')}>Ya tengo cuenta</GhostButton>
        </div>
      </ScreenBody>
    );
  }

  if (mode === 'plan') {
    return (
      <>
        <BackBar onBack={() => setMode('welcome')} />
        <ScreenBody className="pb-10">
          <div className="mb-2">
            <p
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ fontFamily: 'var(--font-geist-mono)', color: m.mute }}
            >
              Elegí tu plan
            </p>
            <h2 className="text-3xl mt-1" style={{ color: m.ink }}>
              ¿Cómo querés <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>empezar</em>?
            </h2>
            <p className="text-sm mt-2" style={{ color: m.mute }}>
              Empezá gratis hoy. Cambiás de plan cuando quieras desde tu perfil.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            <PlanOption
              id="free"
              selected={plan === 'free'}
              onClick={() => setPlan('free')}
              icon={<Sprout className="h-5 w-5" />}
              tone="leaf"
            />
            <PlanOption
              id="pro"
              selected={plan === 'pro'}
              onClick={() => setPlan('pro')}
              icon={<Wheat className="h-5 w-5" />}
              tone="copper"
              badge="Más elegido"
            />
            <PlanOption
              id="enterprise"
              selected={plan === 'enterprise'}
              onClick={() => setPlan('enterprise')}
              icon={<Building2 className="h-5 w-5" />}
              tone="ink"
            />
          </div>

          <div className="mt-6">
            <PrimaryButton onClick={() => setMode('register')}>
              Continuar con {PLAN_INFO[plan].name}
            </PrimaryButton>
            {plan !== 'free' && (
              <p className="text-xs mt-3 text-center" style={{ color: m.mute }}>
                No cobramos ahora. Activás el pago después de probar la app.
              </p>
            )}
          </div>
        </ScreenBody>
      </>
    );
  }

  if (mode === 'login') {
    return (
      <>
        <BackBar onBack={() => setMode('welcome')} />
        <ScreenBody className="flex flex-col justify-center">
          <form onSubmit={submitLogin} className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: 'var(--font-geist-mono)', color: m.mute }}>Volvé a tu chacra</p>
            <h2 className="text-3xl mt-1" style={{ color: m.ink }}>Iniciar sesión</h2>
          </div>
          <MobileInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <MobileInput label="Contraseña" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm" style={{ color: m.danger }}>{error}</p>}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </PrimaryButton>
          <button
            type="button"
            className="text-sm w-full text-center mt-2"
            onClick={() => setMode('register')}
            style={{ color: m.leafDeep }}
          >
            ¿Sos nuevo? Creá tu cuenta
          </button>
        </form>
      </ScreenBody>
      </>
    );
  }

  return (
    <>
      <BackBar onBack={() => setMode('plan')} />
      <ScreenBody>
        <form onSubmit={submitRegister} className="space-y-4">
          {/* Badge con el plan elegido */}
          <div
            className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{
              background: plan === 'pro' ? m.copperSoft : plan === 'enterprise' ? m.ink : m.leafSoft,
              color: plan === 'enterprise' ? m.bg : m.ink,
            }}
          >
            <div className="min-w-0">
              <p
                className="text-[10px] uppercase tracking-widest opacity-70"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                Plan elegido
              </p>
              <p className="text-base font-semibold mt-0.5">
                {PLAN_INFO[plan].emoji} {PLAN_INFO[plan].name} · {PLAN_INFO[plan].price}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode('plan')}
              className="text-xs px-3 py-1.5 rounded-full shrink-0"
              style={{
                background: 'rgba(0,0,0,0.08)',
                color: plan === 'enterprise' ? m.bg : m.ink,
                fontFamily: 'var(--font-geist-mono)',
              }}
            >
              CAMBIAR
            </button>
          </div>
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.22em]"
            style={{ fontFamily: 'var(--font-geist-mono)', color: m.mute }}
          >
            Contanos sobre vos
          </p>
          <h2 className="text-3xl mt-1" style={{ color: m.ink }}>
            Tu <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>chacra</em>
          </h2>
          <p className="text-sm mt-1" style={{ color: m.mute }}>
            Datos rápidos. Los usamos para diagnósticos más precisos y para el cálculo en Bs.
          </p>
        </div>

        <MobileInput label="¿Cómo te llamamos?" placeholder="Don Mario" required value={name} onChange={(e) => setName(e.target.value)} />
        <MobileInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <MobileInput label="Contraseña" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />

        <SczLocationPicker value={location} onChange={setLocation} />

        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] block" style={{ color: m.mute, fontFamily: 'var(--font-geist-mono)' }}>Cultivo principal</span>
          <Chips value={cropMain} onChange={setCropMain} options={CULTIVOS} />
        </div>

        <MobileInput
          label="Hectáreas (aprox)"
          type="number"
          min={0}
          placeholder="12"
          value={hectares}
          onChange={(e) => setHectares(e.target.value)}
        />

        <Card tone="leaf">
          <p className="text-xs">
            <strong>Tip:</strong> usamos las hectáreas para calcular cuánto te cuesta fumigar o
            esperar. Si cambia, lo editás después.
          </p>
        </Card>

        {error && <p className="text-sm" style={{ color: m.danger }}>{error}</p>}
        <PrimaryButton type="submit" disabled={loading || !name || !email || !password || !location}>
          {loading ? 'Creando…' : 'Empezar'}
        </PrimaryButton>
        <button
          type="button"
          className="text-sm w-full text-center"
          onClick={() => setMode('login')}
          style={{ color: m.leafDeep }}
        >
          Ya tengo cuenta
        </button>
      </form>
    </ScreenBody>
    </>
  );
}

function PlanOption({
  id, selected, onClick, icon, tone, badge,
}: {
  id: Plan;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tone: 'leaf' | 'copper' | 'ink';
  badge?: string;
}) {
  const info = PLAN_INFO[id];
  const features: Record<Plan, string[]> = {
    free: [
      'Diagnóstico básico',
      'Tratamiento orgánico',
    ],
    pro: [
      'Scans + chat + clima',
      'Decisión económica en Bs',
      'Compartir por WhatsApp',
    ],
    enterprise: [
      'Panel admin con mapa de focos',
      'API + onboarding asistido',
      'Account manager dedicado',
    ],
  };

  const accent =
    tone === 'leaf' ? { bg: selected ? m.leafSoft : m.paper, border: selected ? m.leafDeep : m.line, glyphBg: '#D7E3C2', glyphColor: m.leafDeep }
    : tone === 'copper' ? { bg: selected ? m.copperSoft : m.paper, border: selected ? m.copper : m.line, glyphBg: '#F1D9B5', glyphColor: '#7A3F0E' }
    : { bg: selected ? m.ink : m.paper, border: selected ? m.ink : m.line, glyphBg: '#1F3024', glyphColor: '#9BC07A' };
  const textColor = tone === 'ink' && selected ? m.bg : m.ink;
  const subColor = tone === 'ink' && selected ? 'rgba(247,244,235,0.7)' : m.mute;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full text-left rounded-2xl p-4 transition-all"
      style={{
        background: accent.bg,
        border: `1.5px solid ${accent.border}`,
        boxShadow: selected ? `0 8px 22px -10px ${accent.border}` : 'none',
      }}
    >
      {badge && (
        <span
          className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest"
          style={{ background: m.copperBright, color: '#fff', fontFamily: 'var(--font-geist-mono)' }}
        >
          ★ {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{ background: accent.glyphBg, color: accent.glyphColor }}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-lg font-semibold" style={{ color: textColor }}>
              {info.emoji} {info.name}
            </p>
            <p className="text-sm font-semibold shrink-0" style={{ color: textColor }}>
              {info.price}
            </p>
          </div>
          <p className="text-xs mt-0.5" style={{ color: subColor }}>
            {info.tagline}
          </p>
          <ul className="mt-2 space-y-1">
            {features[id].map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-xs" style={{ color: subColor }}>
                <Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: accent.glyphColor }} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        {selected && (
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full shrink-0 ml-1"
            style={{ background: tone === 'ink' ? m.bg : accent.border, color: tone === 'ink' ? m.ink : '#fff' }}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </button>
  );
}

function BackBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-5 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors"
        style={{ color: m.inkSoft, border: `1px solid ${m.line}`, background: m.paper }}
      >
        <ArrowLeft className="h-4 w-4" />
        Atrás
      </button>
    </div>
  );
}

function Chips({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="text-sm px-3.5 py-1.5 rounded-full transition-colors"
            style={{
              background: active ? m.ink : m.paper,
              color: active ? m.bg : m.inkSoft,
              border: `1px solid ${active ? m.ink : m.line}`,
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
