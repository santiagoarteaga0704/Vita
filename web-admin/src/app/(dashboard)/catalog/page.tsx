'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Pest {
  id: string;
  common_name: string;
  scientific_name: string;
  affected_crops: string[];
}

export default function CatalogPage() {
  const [pests, setPests] = useState<Pest[] | null>(null);

  useEffect(() => {
    apiFetch<{ pests: Pest[] }>('/catalog/pests').then((d) => setPests(d.pests));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Catálogo de plagas {pests ? `(${pests.length})` : ''}
      </h1>
      {!pests ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pests.map((p) => (
            <Card key={p.id} className="p-4">
              <h3 className="font-semibold">{p.common_name}</h3>
              <p className="text-sm italic text-gray-600">{p.scientific_name}</p>
              <div className="mt-2 flex gap-1 flex-wrap">
                {p.affected_crops.map((c) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
