'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ScanLine,
  BookOpen,
  BarChart3,
  DollarSign,
  Building2,
  LogOut,
} from 'lucide-react';
import { BrandMark, brand } from '@/components/panel-shell';

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', group: 'Negocio' },
  { href: '/ingresos', icon: DollarSign, label: 'Ingresos', group: 'Negocio' },
  { href: '/empresas', icon: Building2, label: 'Empresas', group: 'Negocio' },
  { href: '/scans', icon: ScanLine, label: 'Escaneos', group: 'Operación' },
  { href: '/catalog', icon: BookOpen, label: 'Catálogo', group: 'Operación' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics', group: 'Operación' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const groups = Array.from(new Set(items.map((i) => i.group)));

  return (
    <aside
      className="w-64 shrink-0 min-h-screen flex flex-col"
      style={{ background: '#FFFFFF', borderRight: `1px solid ${brand.line}` }}
    >
      <div className="p-6" style={{ borderBottom: `1px solid ${brand.line}` }}>
        <Link href="/" className="flex items-center gap-2.5" style={{ color: brand.ink, textDecoration: 'none' }}>
          <BrandMark size={26} />
          <span className="font-semibold text-[17px] tracking-tight">Vita</span>
        </Link>
        <p
          className="text-[10px] uppercase tracking-[0.22em] mt-2"
          style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}
        >
          Panel · Bolivia
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-auto">
        {groups.map((group) => (
          <div key={group}>
            <p
              className="px-3 pb-2 text-[10px] uppercase tracking-[0.22em]"
              style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}
            >
              {group}
            </p>
            <div className="space-y-0.5">
              {items
                .filter((i) => i.group === group)
                .map(({ href, icon: Icon, label }) => {
                  const active =
                    pathname === href ||
                    (href !== '/dashboard' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        background: active ? '#F1F6EA' : 'transparent',
                        color: active ? brand.leafDeep : brand.inkSoft,
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: `1px solid ${brand.line}` }}>
        <button
          onClick={async () => {
            await fetch('/api/admin/login', { method: 'DELETE', credentials: 'include' });
            router.push('/login');
          }}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50"
          style={{ color: brand.inkSoft }}
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </aside>
  );
}
