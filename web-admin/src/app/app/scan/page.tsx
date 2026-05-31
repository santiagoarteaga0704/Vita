'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ImagePlus, X } from 'lucide-react';
import {
  MobileHeader, PrimaryButton, ScreenBody, Card, m,
} from '@/components/app-ui';
import { getProductor, productorFetch } from '@/lib/productor';

const CULTIVOS = ['soya', 'maíz', 'sorgo', 'algodón', 'arroz', 'papa', 'tomate', 'cítricos', 'cebolla'];

export default function ScanPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<string>('soya');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const me = getProductor();
    if (!me) router.replace('/app/onboarding');
    else if (me.crop_main) setCrop(me.crop_main);
  }, [router]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('crop', crop);
      const { scan_id } = await productorFetch<{ scan_id: string }>('/scans', {
        method: 'POST',
        body: fd,
      });
      router.replace(`/app/result/${scan_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
      setSubmitting(false);
    }
  };

  return (
    <>
      <MobileHeader title="Escanear" back="/app" />

      <ScreenBody>
        {/* Preview o placeholder cámara */}
        {preview ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ background: m.ink }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="w-full aspect-[4/5] object-cover" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: 'rgba(14,31,20,0.75)', color: m.bg }}
              aria-label="Quitar foto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Card padded={false}>
            <div
              className="aspect-[4/5] flex flex-col items-center justify-center px-6 text-center"
              style={{ background: '#FBF8EE' }}
            >
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                style={{ background: m.leafSoft, color: m.leafDeep }}
              >
                <Camera className="h-7 w-7" />
              </div>
              <p className="font-semibold mb-1" style={{ color: m.ink }}>
                Acercá la hoja afectada
              </p>
              <p className="text-xs" style={{ color: m.mute }}>
                Sin sombra. Que entre toda la hoja. Mejor luz natural.
              </p>
            </div>
          </Card>
        )}

        {/* Cultivo selector */}
        <div className="space-y-1.5">
          <span
            className="text-[11px] uppercase tracking-[0.18em] block"
            style={{ color: m.mute, fontFamily: 'var(--font-geist-mono)' }}
          >
            Cultivo
          </span>
          <div className="flex flex-wrap gap-2">
            {CULTIVOS.map((o) => {
              const active = crop === o;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setCrop(o)}
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
        </div>

        {error && (
          <Card tone="copper">
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {/* Inputs ocultos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />

        {/* CTAs */}
        {!file ? (
          <div className="space-y-3">
            <PrimaryButton onClick={() => fileInputRef.current?.click()}>
              <span className="inline-flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" /> Tomar foto
              </span>
            </PrimaryButton>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium"
              style={{ background: m.paper, border: `1px solid ${m.line}`, color: m.ink }}
            >
              <ImagePlus className="h-4 w-4" /> Subir de la galería
            </button>
          </div>
        ) : (
          <PrimaryButton onClick={submit} disabled={submitting}>
            {submitting ? 'Analizando…' : 'Analizar planta'}
          </PrimaryButton>
        )}

        {submitting && (
          <Card tone="leaf">
            <p className="text-sm">
              🔍 Comparando contra el catálogo de 10 plagas locales, calculando ventana climática y costo.
            </p>
          </Card>
        )}
      </ScreenBody>
    </>
  );
}
