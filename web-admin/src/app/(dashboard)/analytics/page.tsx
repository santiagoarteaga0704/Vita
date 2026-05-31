'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Analytics {
  total_scans: number;
  weekly_scans: number;
  total_users: number;
  active_users?: number;
  ia_precision_pct: number;
  avg_latency_ms: number;
  top_pests?: { pest_id: string; pest_name: string; count: number }[];
  top_regions?: { region: string; count: number }[];
  precision_by_pest?: { pest_name: string; precision_pct: number; samples: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Analytics>('/admin/analytics')
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">
          Comportamiento de la IA y volumen por plaga, cultivo y región.
        </p>
      </header>

      {err && (
        <Card>
          <CardContent className="p-6 space-y-2">
            <p className="text-red-600 font-medium">Error: {err}</p>
            <p className="text-sm text-gray-600">
              Verificá que el backend esté corriendo en <code>localhost:3001</code> y
              que tu email esté en la tabla <code>admin_users</code>.
            </p>
          </CardContent>
        </Card>
      )}

      {!err && !data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      )}

      {data && (
        <>
          {/* Resumen */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiBlock label="Escaneos" value={data.total_scans.toLocaleString()} hint={`+${data.weekly_scans} esta semana`} />
            <KpiBlock label="Precisión IA" value={`${data.ia_precision_pct}%`} hint="validados / total" />
            <KpiBlock label="Latencia avg" value={`${data.avg_latency_ms} ms`} hint="end-to-end por scan" />
            <KpiBlock label="Productores" value={(data.total_users ?? 0).toLocaleString()} hint={`${data.active_users ?? 0} activos`} />
          </section>

          {/* Plagas más detectadas */}
          <Card>
            <CardHeader>
              <CardTitle>Plagas más detectadas</CardTitle>
            </CardHeader>
            <CardContent>
              {data.top_pests?.length ? (
                <ul className="divide-y">
                  {data.top_pests.map((p) => (
                    <li key={p.pest_id} className="flex items-center justify-between py-3">
                      <span className="font-medium">{p.pest_name}</span>
                      <span className="text-gray-600">{p.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  El backend todavía no expone <code>top_pests</code>. Endpoint
                  pendiente: <code>GET /admin/analytics</code> con campo{' '}
                  <code>top_pests</code>.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Regiones con más actividad */}
          <Card>
            <CardHeader>
              <CardTitle>Regiones con más actividad</CardTitle>
            </CardHeader>
            <CardContent>
              {data.top_regions?.length ? (
                <ul className="divide-y">
                  {data.top_regions.map((r) => (
                    <li key={r.region} className="flex items-center justify-between py-3">
                      <span className="font-medium">{r.region}</span>
                      <span className="text-gray-600">{r.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Pendiente endpoint con <code>top_regions</code> agregado por
                  semana.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Precisión por plaga (calidad del modelo) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Precisión por plaga
                <Badge variant="secondary">calibración modelo</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.precision_by_pest?.length ? (
                <ul className="divide-y">
                  {data.precision_by_pest.map((p) => (
                    <li key={p.pest_name} className="flex items-center justify-between py-3">
                      <span className="font-medium">{p.pest_name}</span>
                      <span className="text-sm text-gray-600">
                        {p.precision_pct}% · {p.samples} muestras
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Pendiente endpoint que cruce <code>admin_validated</code> con{' '}
                  <code>detected_pest_id</code>.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiBlock({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-semibold mt-2">{value}</p>
        {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}
