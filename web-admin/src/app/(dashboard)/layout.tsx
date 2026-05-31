import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: '#F7F4EB' }}>
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto max-w-[1480px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
