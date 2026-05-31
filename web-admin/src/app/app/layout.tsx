/**
 * Layout mobile-first para la PWA del productor.
 *
 * Restringe el ancho a ~420px y centra. Pensado para abrirse en el celular
 * del jurado vía QR. Si abrís en desktop, se ve como un celular en el medio
 * con el fondo claro alrededor — feature, no bug: es la app real, no una
 * versión "web" diferente.
 */
import type { Metadata } from 'next';
import { Geist, Instrument_Serif } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });
const serif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vita',
  description: 'Visión inteligente para tu cosecha',
};

export default function AppMobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${geist.className} min-h-screen`}
      style={{
        background: '#0E1F14',
      }}
    >
      <div
        className="mx-auto min-h-screen flex flex-col"
        style={{
          maxWidth: 460,
          background: '#F7F4EB',
          color: '#0E1F14',
          boxShadow: '0 0 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Hacemos disponible la fuente serif vía CSS var para usar en acentos */}
        <div
          style={{ ['--font-serif' as string]: serif.style.fontFamily } as React.CSSProperties}
          className="flex flex-col flex-1"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
