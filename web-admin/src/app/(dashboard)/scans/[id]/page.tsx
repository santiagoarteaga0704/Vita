'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle } from 'lucide-react';

interface ScanDetail {
  id: string;
  image_url: string;
  detected_pest_name: string | null;
  severity: string | null;
  severity_pct: number | null;
  confidence: number;
  latency_ms: number | null;
  gps_lat: number | null;
  gps_lng: number | null;
  crop: string;
  region: string;
  created_at: string;
  admin_validated: string | null;
  users: { name: string; email: string } | null;
}

export default function ScanDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ scan: ScanDetail }>(`/admin/scans/${params.id}`).then((d) =>
      setScan(d.scan),
    );
  }, [params.id]);

  const validate = async (validation: 'correct' | 'incorrect') => {
    setSaving(true);
    try {
      await apiFetch(`/admin/scans/${params.id}/validate`, {
        method: 'POST',
        body: JSON.stringify({ validation, notes: notes || undefined }),
      });
      router.push('/scans');
    } finally {
      setSaving(false);
    }
  };

  if (!scan) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">
          {scan.detected_pest_name ?? 'No identificado'}
        </h1>
        <p className="text-gray-600">
          {scan.crop} · {scan.region} · {new Date(scan.created_at).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Foto del productor</h3>
          {scan.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={scan.image_url} alt="" className="w-full rounded" />
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Diagnóstico IA (Gemini)</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Plaga:</strong> {scan.detected_pest_name ?? '—'}
            </p>
            <p>
              <strong>Severidad:</strong>{' '}
              <Badge>{scan.severity ?? '—'}</Badge>{' '}
              {scan.severity_pct !== null ? `${scan.severity_pct}%` : ''}
            </p>
            <p>
              <strong>Confianza:</strong>{' '}
              {Math.round((scan.confidence ?? 0) * 100)}%
            </p>
            <p>
              <strong>Latencia:</strong> {scan.latency_ms ?? '—'} ms
            </p>
            <p>
              <strong>Usuario:</strong> {scan.users?.name} ({scan.users?.email})
            </p>
            <p>
              <strong>GPS:</strong>{' '}
              {scan.gps_lat?.toFixed(4) ?? '—'},{' '}
              {scan.gps_lng?.toFixed(4) ?? '—'}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Validación</h3>
        <Textarea
          placeholder="Notas internas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-4"
        />
        <div className="flex gap-3">
          <Button
            onClick={() => validate('correct')}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            IA Correcta
          </Button>
          <Button
            onClick={() => validate('incorrect')}
            disabled={saving}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            IA Incorrecta
          </Button>
        </div>
        {scan.admin_validated && (
          <p className="mt-3 text-sm text-gray-600">
            Ya validado como <strong>{scan.admin_validated}</strong>
          </p>
        )}
      </Card>
    </div>
  );
}
