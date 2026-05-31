'use client';
import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud, CloudRain, Sun, TrendingDown, TrendingUp, Send, Sparkles } from 'lucide-react';
import {
  MobileHeader, ScreenBody, Card, PrimaryButton, m,
} from '@/components/app-ui';
import { productorFetch, getProductor } from '@/lib/productor';

interface Treatment {
  method?: string;
  ingredients?: string[];
  dosage?: string;
  frequency?: string;
  notes?: string;
  actives?: string[];
  dosage_per_ha?: string;
  timing?: string;
  brands?: string[];
}

interface WeatherWindow {
  rain_total_mm: number;
  next_rain_at: string | null;
  ok_to_spray: boolean;
  recommended_day: string | null;
  summary: string;
}

interface Economic {
  hectares: number;
  cost_act_bob: number;
  cost_inaction_bob: number;
  net_benefit_bob: number;
  recommendation: 'fumigar' | 'esperar' | 'monitorear';
  explanation: string;
}

interface Scan {
  id: string;
  image_url: string;
  detected_pest_name: string | null;
  severity: 'low' | 'medium' | 'high' | null;
  severity_pct: number | null;
  confidence: number | null;
  treatment_organic_json: Treatment | null;
  treatment_chemical_json: Treatment | null;
  prevention: string | null;
  economic_json: Economic | null;
  weather_window_json: WeatherWindow | null;
  crop: string | null;
  region: string | null;
  created_at: string;
}

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [scan, setScan] = useState<Scan | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getProductor()) {
      router.replace('/app/onboarding');
      return;
    }
    productorFetch<{ scan: Scan }>(`/scans/${id}`)
      .then((r) => setScan(r.scan))
      .catch((e) => setErr(e.message));
    productorFetch<{ messages: ChatMsg[]; suggestions: string[] }>(`/scans/${id}/chat`)
      .then((r) => {
        setMessages(r.messages);
        setSuggestions(r.suggestions);
      })
      .catch(() => {});
  }, [id, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setDraft('');
    // Optimistic
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: 'user', content: text, created_at: new Date().toISOString() }]);
    try {
      const r = await productorFetch<{ user: ChatMsg; assistant: ChatMsg }>(`/scans/${id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        r.user,
        r.assistant,
      ]);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      const msg = e instanceof Error ? e.message : 'Error';
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', content: `⚠ ${msg}`, created_at: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (err) {
    return (
      <>
        <MobileHeader title="Resultado" back="/app" />
        <ScreenBody><Card tone="copper"><p>{err}</p></Card></ScreenBody>
      </>
    );
  }
  if (!scan) {
    return (
      <>
        <MobileHeader title="Resultado" back="/app" />
        <ScreenBody><p style={{ color: m.mute }}>Cargando…</p></ScreenBody>
      </>
    );
  }

  const sev = scan.severity ?? 'low';
  const sevLabel = sev === 'high' ? 'Alta' : sev === 'medium' ? 'Media' : 'Baja';
  const sevColor = sev === 'high' ? m.danger : sev === 'medium' ? m.copperBright : m.leaf;
  const conf = scan.confidence ? Math.round(scan.confidence * 100) : 0;

  return (
    <>
      <MobileHeader title="Resultado" back="/app" />
      <ScreenBody>
        {/* Hero: foto + diagnóstico */}
        <Card padded={false}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scan.image_url} alt="" className="w-full aspect-[5/4] object-cover" />
          <div className="p-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span
                className="text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                style={{ background: `${sevColor}1A`, color: sevColor, fontFamily: 'var(--font-geist-mono)' }}
              >
                Severidad {sevLabel}
              </span>
              <span className="text-xs" style={{ color: m.mute }}>{conf}% confianza</span>
            </div>
            <h2 className="text-2xl tracking-tight leading-tight" style={{ color: m.ink }}>
              {scan.detected_pest_name ?? 'Sin coincidencia clara'}
            </h2>
            <p className="text-xs mt-1" style={{ color: m.mute }}>
              {scan.crop} · {scan.region}
            </p>
          </div>
        </Card>

        {/* Cápsula decisión económica */}
        {scan.economic_json && <EconomicCard e={scan.economic_json} />}

        {/* Cápsula clima */}
        {scan.weather_window_json && <WeatherCard w={scan.weather_window_json} />}

        {/* Chat con agrónomo */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4" style={{ color: m.leafDeep }} />
            <p className="text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: 'var(--font-geist-mono)', color: m.mute }}>
              Hablá con tu agrónomo
            </p>
          </div>

          {messages.length === 0 && (
            <p className="text-sm mb-3" style={{ color: m.inkSoft }}>
              Sé que tenés un{' '}
              <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
                {scan.detected_pest_name ?? 'problema'}
              </em>{' '}
              en {scan.hectares ?? 'tu'} ha de {scan.crop}. Preguntame lo que necesités.
            </p>
          )}

          <div className="space-y-2 mb-3 max-h-[400px] overflow-y-auto">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias chips */}
          {messages.length === 0 && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={sending}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: m.leafSoft,
                    color: m.leafDeep,
                    border: `1px solid #D7E3C2`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(draft); }}
            className="flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={sending ? 'Pensando…' : 'Preguntale al agrónomo…'}
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-2xl text-sm"
              style={{ background: '#FBF8EE', border: `1px solid ${m.line}`, color: m.ink }}
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl"
              style={{
                background: m.ink,
                color: m.bg,
                opacity: !draft.trim() || sending ? 0.5 : 1,
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </Card>

        {/* Tratamientos */}
        {scan.treatment_organic_json && (
          <TreatmentBlock title="Tratamiento orgánico" t={scan.treatment_organic_json} />
        )}
        {scan.treatment_chemical_json && (
          <TreatmentBlock title="Tratamiento químico" t={scan.treatment_chemical_json} />
        )}
        {scan.prevention && (
          <Card>
            <p
              className="text-[10px] uppercase tracking-[0.18em] mb-2"
              style={{ fontFamily: 'var(--font-geist-mono)', color: m.mute }}
            >
              Prevención
            </p>
            <p className="text-sm" style={{ color: m.ink }}>{scan.prevention}</p>
          </Card>
        )}

        <PrimaryButton onClick={() => router.push('/app/scan')}>
          Escanear otra planta
        </PrimaryButton>
      </ScreenBody>
    </>
  );
}

function EconomicCard({ e }: { e: Economic }) {
  const fumigar = e.recommendation === 'fumigar';
  const tone = fumigar ? 'leaf' : e.recommendation === 'esperar' ? 'copper' : 'paper';
  return (
    <Card tone={tone}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            Decisión económica · {e.hectares} ha
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {e.recommendation === 'fumigar' ? '✅ Fumigá' : e.recommendation === 'esperar' ? '⏳ Esperá' : '👀 Monitoreá'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest opacity-70" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            ahorro
          </p>
          <p className="text-xl font-semibold">
            Bs {e.net_benefit_bob.toLocaleString('es-BO')}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="opacity-70 text-[11px]">Fumigar te cuesta</p>
          <p className="font-medium flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            Bs {e.cost_act_bob.toLocaleString('es-BO')}
          </p>
        </div>
        <div>
          <p className="opacity-70 text-[11px]">No hacer pierde</p>
          <p className="font-medium flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Bs {e.cost_inaction_bob.toLocaleString('es-BO')}
          </p>
        </div>
      </div>
      <p className="text-xs mt-3 opacity-90">{e.explanation}</p>
    </Card>
  );
}

function WeatherCard({ w }: { w: WeatherWindow }) {
  const Icon = w.ok_to_spray ? Sun : w.rain_total_mm > 0 ? CloudRain : Cloud;
  const tone = w.ok_to_spray ? 'paper' : 'copper';
  return (
    <Card tone={tone}>
      <div className="flex items-start gap-3">
        <Icon className="h-6 w-6 shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            Ventana climática
          </p>
          <p className="text-base font-semibold leading-tight">{w.summary}</p>
          {w.recommended_day && !w.ok_to_spray && (
            <p className="text-xs mt-2 opacity-90">
              Mejor momento sugerido: <strong>{formatRecommended(w.recommended_day)}</strong>
            </p>
          )}
          <p className="text-[11px] mt-2 opacity-70">
            Lluvia próx. 24h: {w.rain_total_mm.toFixed(1)} mm
          </p>
        </div>
      </div>
    </Card>
  );
}

function formatRecommended(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-BO', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm"
        style={
          isUser
            ? { background: m.ink, color: m.bg, borderBottomRightRadius: 6 }
            : { background: m.leafSoft, color: m.leafDeep, borderBottomLeftRadius: 6 }
        }
      >
        {msg.content}
      </div>
    </div>
  );
}

function TreatmentBlock({ title, t }: { title: string; t: Treatment }) {
  return (
    <Card>
      <p
        className="text-[10px] uppercase tracking-[0.18em] mb-2"
        style={{ fontFamily: 'var(--font-geist-mono)', color: m.mute }}
      >
        {title}
      </p>
      {t.method && <p className="font-semibold mb-1" style={{ color: m.ink }}>{t.method}</p>}
      {t.ingredients && t.ingredients.length > 0 && (
        <p className="text-sm mb-1" style={{ color: m.inkSoft }}>
          Ingredientes: {t.ingredients.join(', ')}
        </p>
      )}
      {t.actives && t.actives.length > 0 && (
        <p className="text-sm mb-1" style={{ color: m.inkSoft }}>
          Activos: {t.actives.join(', ')}
        </p>
      )}
      {t.dosage && <p className="text-sm" style={{ color: m.inkSoft }}>Dosis: {t.dosage}</p>}
      {t.dosage_per_ha && <p className="text-sm" style={{ color: m.inkSoft }}>Dosis/ha: {t.dosage_per_ha}</p>}
      {t.frequency && <p className="text-sm" style={{ color: m.inkSoft }}>Frecuencia: {t.frequency}</p>}
      {t.timing && <p className="text-sm" style={{ color: m.inkSoft }}>Momento: {t.timing}</p>}
      {t.brands && t.brands.length > 0 && (
        <p className="text-sm mt-2" style={{ color: m.mute }}>Marcas: {t.brands.join(' · ')}</p>
      )}
      {t.notes && <p className="text-xs mt-2 italic" style={{ color: m.mute }}>{t.notes}</p>}
    </Card>
  );
}
