import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export function StatsCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-green-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
