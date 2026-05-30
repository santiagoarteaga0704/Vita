'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ScanLine,
  BookOpen,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const items = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scans', icon: ScanLine, label: 'Escaneos' },
  { href: '/catalog', icon: BookOpen, label: 'Catálogo' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-green-700">🌱 AgroScan</h1>
        <p className="text-xs text-gray-500">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={async () => {
            await createSupabaseBrowserClient().auth.signOut();
            router.push('/login');
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Salir
        </Button>
      </div>
    </aside>
  );
}
