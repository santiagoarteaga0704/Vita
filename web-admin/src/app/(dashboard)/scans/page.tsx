'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Scan {
  id: string;
  detected_pest_name: string | null;
  severity: string | null;
  severity_pct: number | null;
  confidence: number;
  crop: string;
  region: string;
  admin_validated: string | null;
  created_at: string;
  users: { name: string; region: string } | null;
}

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = status !== 'all' ? `?status=${status}` : '';
    apiFetch<{ scans: Scan[]; total: number }>(`/admin/scans${qs}`)
      .then((d) => setScans(d.scans))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Escaneos</h1>
        <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente validar</SelectItem>
            <SelectItem value="validated">Validados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : scans.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No hay escaneos todavía.
        </Card>
      ) : (
        <div className="space-y-2">
          {scans.map((s) => (
            <Link key={s.id} href={`/scans/${s.id}`}>
              <Card className="p-4 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {s.detected_pest_name ?? 'No identificado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {s.crop} · {s.region} · {s.users?.name ?? 'Anónimo'} ·{' '}
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.severity && (
                      <Badge className={severityColors[s.severity]}>
                        {s.severity.toUpperCase()}
                      </Badge>
                    )}
                    {s.admin_validated ? (
                      <Badge variant="outline">{s.admin_validated}</Badge>
                    ) : (
                      <Badge variant="secondary">pending</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
