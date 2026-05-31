'use client';
import { useState } from 'react';
import {
  PanelHeader, PanelCard, CardHead, Pill, Section, brand,
} from '@/components/panel-shell';
import {
  Building2, MapPin, Sprout, Settings2, Users, ArrowRight, Check,
} from 'lucide-react';

/**
 * EMPRESAS — cuentas B2B (cooperativas, SENASAG, INIAF, agroempresas grandes).
 *
 * Distintivo clave vs. productores individuales:
 *   - Productor (Free / Pro) → declara hectáreas en onboarding
 *   - Empresa                → Vita registra parcelas con GPS por ellos
 *
 * El toggle "Gestión de parcelas por Vita" es configurable por cuenta:
 *   - ON (default coops): nuestro equipo carga parcelas, verifica, mantiene
 *   - OFF: la empresa lo hace internamente con su propio admin
 */

type Empresa = {
  id: string;
  name: string;
  type: 'cooperativa' | 'agroempresa' | 'gobierno';
  region: string;
  members: number;
  hectares: number;
  hectares_registered: number;
  managed_parcels: boolean;
  plan: 'piloto' | 'cooperativa' | 'enterprise';
  mrr_bob: number;
  health: 'verde' | 'amarillo' | 'rojo';
};

const DEMO_EMPRESAS: Empresa[] = [
  {
    id: 'e_001',
    name: 'Coop. Integral Cuatro Cañadas',
    type: 'cooperativa',
    region: 'Cuatro Cañadas',
    members: 412,
    hectares: 4_820,
    hectares_registered: 4_820,
    managed_parcels: true,
    plan: 'cooperativa',
    mrr_bob: 2_410,
    health: 'verde',
  },
  {
    id: 'e_002',
    name: 'Anapo zona Pailón',
    type: 'cooperativa',
    region: 'Pailón',
    members: 286,
    hectares: 3_650,
    hectares_registered: 3_180,
    managed_parcels: true,
    plan: 'cooperativa',
    mrr_bob: 1_825,
    health: 'verde',
  },
  {
    id: 'e_003',
    name: 'Coop. Minga San Julián',
    type: 'cooperativa',
    region: 'San Julián',
    members: 198,
    hectares: 2_980,
    hectares_registered: 2_140,
    managed_parcels: true,
    plan: 'cooperativa',
    mrr_bob: 1_490,
    health: 'amarillo',
  },
  {
    id: 'e_004',
    name: 'Agropecuaria Las Brisas SRL',
    type: 'agroempresa',
    region: 'Warnes',
    members: 24,
    hectares: 1_800,
    hectares_registered: 1_800,
    managed_parcels: false,
    plan: 'enterprise',
    mrr_bob: 900,
    health: 'verde',
  },
  {
    id: 'e_005',
    name: 'SENASAG · piloto regional',
    type: 'gobierno',
    region: 'SCZ',
    members: 8,
    hectares: 0,
    hectares_registered: 0,
    managed_parcels: false,
    plan: 'piloto',
    mrr_bob: 0,
    health: 'amarillo',
  },
];

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(DEMO_EMPRESAS);
  const [selected, setSelected] = useState<Empresa | null>(null);
  const [filter, setFilter] = useState<'all' | 'managed' | 'self'>('all');

  const visible = empresas.filter((e) => {
    if (filter === 'managed') return e.managed_parcels;
    if (filter === 'self') return !e.managed_parcels;
    return true;
  });

  const totalHa = empresas.reduce((s, e) => s + e.hectares, 0);
  const managedHa = empresas.filter((e) => e.managed_parcels).reduce((s, e) => s + e.hectares, 0);
  const totalMrr = empresas.reduce((s, e) => s + e.mrr_bob, 0);
  const coverage =
    empresas.reduce((s, e) => s + e.hectares_registered, 0) / Math.max(totalHa, 1);

  const toggleManaged = (id: string) => {
    setEmpresas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, managed_parcels: !e.managed_parcels } : e)),
    );
    setSelected((s) => (s && s.id === id ? { ...s, managed_parcels: !s.managed_parcels } : s));
  };

  return (
    <Section className="space-y-8">
      <PanelHeader
        title="Empresas"
        subtitle={
          <>
            Cuentas B2B: cooperativas, agroempresas y aliados institucionales.
            Solo aquí <strong style={{ color: brand.ink }}>Vita registra las parcelas</strong>{' '}
            por el cliente. Los productores individuales se autodeclaran.
          </>
        }
        meta={<Pill tone="demo" size="xs">datos demo</Pill>}
      />

      {/* KPIs B2B */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiBox icon={<Building2 className="h-4 w-4" />} label="Empresas" value={String(empresas.length)} hint={`${empresas.filter(e => e.plan !== 'piloto').length} pagando`} />
        <KpiBox icon={<Sprout className="h-4 w-4" />} label="Hectáreas B2B" value={fmt(totalHa)} hint={`${(coverage * 100).toFixed(0)}% registradas con GPS`} />
        <KpiBox icon={<Settings2 className="h-4 w-4" />} label="Gestionadas por nosotros" value={fmt(managedHa)} hint={`${empresas.filter(e => e.managed_parcels).length} cuentas`} />
        <KpiBox icon={<Users className="h-4 w-4" />} label="MRR B2B" value={`Bs ${fmt(totalMrr)}`} hint="80% del total" />
      </div>

      {/* Filter strip */}
      <PanelCard padded={false}>
        <div className="flex items-center justify-between gap-3 p-4 flex-wrap" style={{ borderBottom: `1px solid ${brand.line}` }}>
          <div className="flex items-center gap-2">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
              Todas <span className="opacity-60">({empresas.length})</span>
            </FilterChip>
            <FilterChip active={filter === 'managed'} onClick={() => setFilter('managed')}>
              Gestionadas por Vita <span className="opacity-60">({empresas.filter(e => e.managed_parcels).length})</span>
            </FilterChip>
            <FilterChip active={filter === 'self'} onClick={() => setFilter('self')}>
              Auto-administradas <span className="opacity-60">({empresas.filter(e => !e.managed_parcels).length})</span>
            </FilterChip>
          </div>
          <button
            className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: brand.ink, color: brand.bg, fontFamily: 'var(--font-geist-mono)' }}
          >
            + Nueva empresa
          </button>
        </div>

        {/* List */}
        <ul className="divide-y" style={{ borderColor: brand.line }}>
          {visible.map((e) => (
            <EmpresaRow
              key={e.id}
              e={e}
              onOpen={() => setSelected(e)}
              onToggleManaged={() => toggleManaged(e.id)}
            />
          ))}
        </ul>
      </PanelCard>

      {/* Drawer / detail panel — bottom sheet inline */}
      {selected && (
        <EmpresaDrawer
          e={selected}
          onClose={() => setSelected(null)}
          onToggleManaged={() => toggleManaged(selected.id)}
        />
      )}
    </Section>
  );
}

/* ─────────────────────────────────────── */

function KpiBox({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <PanelCard>
      <div className="flex items-center gap-2 mb-2" style={{ color: brand.mute }}>
        <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span>
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)' }}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight" style={{ color: brand.ink }}>{value}</p>
      {hint && <p className="text-xs mt-1" style={{ color: brand.mute }}>{hint}</p>}
    </PanelCard>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-full transition-colors"
      style={{
        background: active ? brand.ink : 'transparent',
        color: active ? brand.bg : brand.inkSoft,
        border: `1px solid ${active ? brand.ink : brand.line}`,
        fontFamily: 'var(--font-geist-mono)',
      }}
    >
      {children}
    </button>
  );
}

function EmpresaRow({ e, onOpen, onToggleManaged }: { e: Empresa; onOpen: () => void; onToggleManaged: () => void }) {
  const coverage = e.hectares > 0 ? (e.hectares_registered / e.hectares) * 100 : 0;
  const healthColor =
    e.health === 'verde' ? brand.leaf : e.health === 'amarillo' ? '#D4A82E' : brand.danger;
  return (
    <li
      className="px-4 py-4 hover:bg-[#FBF8EE] transition-colors cursor-pointer flex items-center gap-4"
      onClick={onOpen}
    >
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: healthColor }} title={`Salud: ${e.health}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate" style={{ color: brand.ink }}>{e.name}</p>
          <Pill tone={e.type === 'gobierno' ? 'neutral' : e.type === 'agroempresa' ? 'copper' : 'leaf'} size="xs">
            {e.type}
          </Pill>
          {e.managed_parcels && <Pill tone="copper" size="xs">parcelas gestionadas</Pill>}
        </div>
        <p className="text-xs mt-1 flex items-center gap-3" style={{ color: brand.mute }}>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.region}</span>
          <span>{e.members} miembros</span>
          <span>plan {e.plan}</span>
        </p>
      </div>
      <div className="text-right shrink-0 hidden md:block">
        <p className="text-sm font-semibold" style={{ color: brand.ink }}>{fmt(e.hectares)} ha</p>
        <p className="text-xs" style={{ color: brand.mute }}>
          {fmt(e.hectares_registered)} registradas · {coverage.toFixed(0)}%
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold" style={{ color: brand.ink }}>
          {e.mrr_bob > 0 ? `Bs ${fmt(e.mrr_bob)}` : '—'}
        </p>
        <p className="text-xs" style={{ color: brand.mute }}>MRR</p>
      </div>
      <button
        onClick={(ev) => {
          ev.stopPropagation();
          onToggleManaged();
        }}
        className="shrink-0 ml-2 hidden md:block"
        title={e.managed_parcels ? 'Desactivar gestión por Vita' : 'Activar gestión por Vita'}
      >
        <Toggle on={e.managed_parcels} />
      </button>
      <ArrowRight className="h-4 w-4 shrink-0 hidden md:block" style={{ color: brand.mute }} />
    </li>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="inline-flex items-center w-10 h-6 rounded-full p-0.5 transition-colors"
      style={{ background: on ? brand.leaf : '#D9D2BD' }}
    >
      <span
        className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </span>
  );
}

function EmpresaDrawer({ e, onClose, onToggleManaged }: { e: Empresa; onClose: () => void; onToggleManaged: () => void }) {
  const coverage = e.hectares > 0 ? (e.hectares_registered / e.hectares) * 100 : 0;
  return (
    <PanelCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}>
            Detalle de empresa
          </p>
          <h3 className="text-xl font-semibold mt-1 tracking-tight" style={{ color: brand.ink }}>{e.name}</h3>
          <p className="text-sm mt-0.5" style={{ color: brand.mute }}>
            {e.type} · {e.region} · plan {e.plan}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ border: `1px solid ${brand.line}`, color: brand.inkSoft }}
        >
          Cerrar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Mini label="Miembros" value={fmt(e.members)} />
        <Mini label="Hectáreas declaradas" value={fmt(e.hectares)} />
        <Mini label="Registradas con GPS" value={`${fmt(e.hectares_registered)} (${coverage.toFixed(0)}%)`} />
        <Mini label="MRR" value={e.mrr_bob > 0 ? `Bs ${fmt(e.mrr_bob)}` : 'piloto'} />
      </div>

      {/* The toggle the user asked for */}
      <div
        className="rounded-xl p-4 flex items-center justify-between gap-4"
        style={{ background: '#F1F6EA', border: `1px solid #D7E3C2` }}
      >
        <div className="flex items-start gap-3">
          <Settings2 className="h-5 w-5 mt-0.5" style={{ color: brand.leafDeep }} />
          <div>
            <p className="font-semibold" style={{ color: brand.leafDeep }}>
              Gestión de parcelas por Vita
            </p>
            <p className="text-sm mt-1" style={{ color: brand.inkSoft }}>
              {e.managed_parcels
                ? 'Nuestro equipo registra y mantiene las parcelas con GPS para esta empresa. Los miembros no autodeclaran hectáreas.'
                : 'La empresa administra sus propias parcelas. Los miembros autodeclaran como productores individuales.'}
            </p>
            <p className="text-xs mt-2" style={{ color: brand.mute }}>
              Configurable por cuenta · auditado en log de cambios.
            </p>
          </div>
        </div>
        <button
          onClick={onToggleManaged}
          className="shrink-0"
        >
          <Toggle on={e.managed_parcels} />
        </button>
      </div>

      {/* Acciones */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <ActionTile
          enabled={e.managed_parcels}
          icon={<MapPin className="h-4 w-4" />}
          title="Ver parcelas registradas"
          hint={`${fmt(e.hectares_registered)} ha cargadas con GPS`}
        />
        <ActionTile
          enabled={e.managed_parcels}
          icon={<Sprout className="h-4 w-4" />}
          title="Cargar nueva parcela"
          hint="Coordenadas + área + cultivo"
        />
        <ActionTile
          enabled
          icon={<Users className="h-4 w-4" />}
          title="Ver miembros"
          hint={`${e.members} productores afiliados`}
        />
      </div>
    </PanelCard>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: brand.mute }}>
        {label}
      </p>
      <p className="text-base font-semibold mt-1" style={{ color: brand.ink }}>{value}</p>
    </div>
  );
}

function ActionTile({ enabled, icon, title, hint }: { enabled: boolean; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div
      className="rounded-xl p-4 transition-opacity"
      style={{
        background: '#FBF8EE',
        border: `1px solid ${brand.line}`,
        opacity: enabled ? 1 : 0.45,
      }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: brand.leafDeep }}>
        {icon}
        {enabled && <Check className="h-3 w-3" />}
      </div>
      <p className="font-medium text-sm" style={{ color: brand.ink }}>{title}</p>
      <p className="text-xs mt-1" style={{ color: brand.mute }}>{hint}</p>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('es-BO');
}
