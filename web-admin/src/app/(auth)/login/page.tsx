'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Login admin local.
 *
 * Default seedeado en SQLite:
 *   email:    admin@vita.bo
 *   password: admin1234
 *
 * POST /api/admin/login devuelve JSON y setea cookie httpOnly.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('admin@vita.bo');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? 'Error desconocido');
        return;
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{ background: '#F7F4EB' }}
    >
      {/* Botón Atrás → vuelve a la landing pública */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors hover:bg-white"
        style={{ color: '#3A4A3F', border: '1px solid #E6DFCC' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Atrás
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vita-icon.png" alt="Vita" width={36} height={36} style={{ borderRadius: 8 }} />
            <CardTitle className="text-2xl">Vita · Panel</CardTitle>
          </div>
          <p className="text-sm text-gray-500">Acceso del equipo interno</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Demo local: <code>admin@vita.bo</code> · <code>admin1234</code>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
