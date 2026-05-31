/**
 * Página /qr — generada server-side.
 *
 * El QR se renderiza como SVG embebido en el HTML inicial. NO depende de
 * JavaScript del cliente. Esto es importante porque:
 *   - Brave / Firefox con shields pueden bloquear Canvas en HTTP
 *   - Algunos celulares con browsers viejos no corren bien React hidratación
 *   - El user igual ve el QR aunque haya un error en otro componente JS
 *
 * Lee `host` del request real (LAN IP o localhost) para que el QR siempre
 * apunte al mismo host con que abriste la página.
 */
import { headers } from 'next/headers';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function QrPage() {
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const url = `${proto}://${host}/app`;

  let qrSvg: string;
  try {
    qrSvg = await QRCode.toString(url, {
      type: 'svg',
      width: 500,
      margin: 2,
      color: { dark: '#0E1F14', light: '#EFE7D2' },
      errorCorrectionLevel: 'M',
    });
  } catch (e) {
    qrSvg = `<div style="padding:48px;color:#B83A2E">Error generando QR: ${e instanceof Error ? e.message : 'desconocido'}</div>`;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#0E1F14',
        color: '#EFE7D2',
        fontFamily: 'var(--font-geist-sans, sans-serif)',
      }}
    >
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vita-icon.png"
          alt="Vita"
          width={72}
          height={72}
          style={{
            display: 'block',
            margin: '0 auto 20px',
            borderRadius: 18,
            boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
          }}
        />
        <h1 style={{ fontSize: 36, letterSpacing: '-0.025em', margin: '0 0 8px' }}>Vita</h1>
        <p
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            opacity: 0.6,
            margin: '0 0 24px',
            fontFamily: 'var(--font-geist-mono, monospace)',
          }}
        >
          Visión inteligente para tu cosecha
        </p>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 28 }}>
          Escaneá el QR con tu celular para abrir la app del productor.
        </p>

        {/* QR embebido server-side como SVG */}
        <div
          style={{
            background: '#EFE7D2',
            borderRadius: 24,
            padding: 24,
            margin: '0 auto',
            width: 360,
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{ width: '100%', aspectRatio: '1', display: 'block' }}
            dangerouslySetInnerHTML={{
              __html: qrSvg.replace(
                /<svg([^>]*)>/,
                '<svg$1 style="width:100%;height:100%;display:block">',
              ),
            }}
          />
        </div>

        {/* URL en grande para escribir a mano si el QR no funciona */}
        <div style={{ marginTop: 24 }}>
          <p
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              opacity: 0.5,
              margin: '0 0 8px',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            o escribí esta URL en el celular
          </p>
          <a
            href={url}
            style={{
              fontSize: 16,
              fontWeight: 500,
              padding: '12px 16px',
              borderRadius: 12,
              display: 'inline-block',
              wordBreak: 'break-all',
              background: 'rgba(239,231,210,0.08)',
              border: '1px solid rgba(239,231,210,0.15)',
              fontFamily: 'var(--font-geist-mono, monospace)',
              color: '#EFE7D2',
              textDecoration: 'none',
            }}
          >
            {url}
          </a>
        </div>

        <div
          style={{
            marginTop: 40,
            textAlign: 'left',
            borderRadius: 16,
            padding: 20,
            fontSize: 14,
            opacity: 0.9,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p style={{ fontWeight: 600, margin: '0 0 8px' }}>¿No funciona el QR?</p>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li style={{ marginBottom: 4 }}>
              El celular tiene que estar en la <strong>misma WiFi</strong> que la PC.
            </li>
            <li style={{ marginBottom: 4 }}>
              Si Windows muestra una alerta de Firewall la primera vez, dale <strong>Permitir</strong>.
            </li>
            <li>
              Si igual no entra, escribí la URL de arriba a mano en Chrome del celular.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
