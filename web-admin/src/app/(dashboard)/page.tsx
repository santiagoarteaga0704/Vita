'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { StatsCard } from '@/components/stats-card';
import { ScanLine, Users, Activity, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Analytics {
  total_scans: number;
  weekly_scans: number;
  total_users: number;
  ia_precision_pct: number;
  avg_latency_ms: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Analytics>('/admin/analytics')
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  if (err)
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-red-600">Error: {err}</p>
        <p className="text-sm text-gray-600">
          Verificá que el backend esté corriendo y que tu email esté en la tabla
          admin_users del backend.
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data ? (
          <>
            <StatsCard
              label="Escaneos totales"
              value={data.total_scans}
              icon={ScanLine}
              hint={`+${data.weekly_scans} esta semana`}
            />
            <StatsCard label="Usuarios" value={data.total_users} icon={Users} />
            <StatsCard
              label="Precisión IA"
              value={`${data.ia_precision_pct}%`}
              icon={Activity}
              hint="validados/total"
            />
            <StatsCard
              label="Latencia avg"
              value={`${data.avg_latency_ms}ms`}
              icon={Clock}
            />
          </>
        ) : (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
        )}
      </div>
    </div>
  );
}
