'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MobileHeader, ScreenBody, Card, m,
} from '@/components/app-ui';
import { productorFetch, getProductor } from '@/lib/productor';

interface ScanRow {
  id: string;
  detected_pest_name: string | null;
  severity: string | null;
  crop: string | null;
  created_at: string;
  image_url: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<ScanRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!getProductor()) {
      router.replace('/app/onboarding');
      return;
    }
    productorFetch<{ scans: ScanRow[] }>('/scans/me?limit=50')
      .then((r) => setScans(r.scans))
      .catch((e) => setErr(e.message));
  }, [router]);

  return (
    <>
      <MobileHeader title="Historial" back="/app" />
      <ScreenBody>
        {err && <Card tone="copper"><p>{err}</p></Card>}
        {!scans && !err && <p style={{ color: m.mute }}>Cargando…</p>}
        {scans && scans.length === 0 && (
          <Card>
            <p style={{ color: m.mute }}>Sin escaneos todavía.</p>
          </Card>
        )}
        {scans?.map((s) => {
          const sev = s.severity ?? 'low';
          const sevColor = sev === 'high' ? m.danger : sev === 'medium' ? m.copperBright : m.leaf;
          return (
            <Link
              key={s.id}
              href={`/app/result/${s.id}`}
              className="flex gap-3 items-center rounded-2xl p-3 active:scale-[0.99] transition-transform"
              style={{ background: m.paper, border: `1px solid ${m.line}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" style={{ background: m.line }} />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate" style={{ color: m.ink }}>
                  {s.detected_pest_name ?? 'Sin diagnóstico'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: m.mute }}>
                  {s.crop ?? '—'} · {new Date(s.created_at).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
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
        })}
      </ScreenBody>
    </>
  );
}
