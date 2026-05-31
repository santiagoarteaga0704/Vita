# Vita

> **Visión inteligente para tu cosecha**
> Detección de plagas agrícolas con IA, decisión económica en Bolivianos y ventana climática para el productor de Santa Cruz de la Sierra.
>
> Hackathon Build With AI 2026 · Mención **AGRO** · UCB Santa Cruz · 29-31 de mayo de 2026

## Entrega oficial — Hackathon

| Entregable | Archivo |
|---|---|
| Documento técnico (PDF) | [`docs/entrega/Vita-Documento-Tecnico.pdf`](docs/entrega/Vita-Documento-Tecnico.pdf) |
| Diapositivas del pitch (PDF) | [`docs/entrega/Vita-Pitch.pdf`](docs/entrega/Vita-Pitch.pdf) |
| Código MVP funcional | Este mismo repositorio — ver [`COMO_CORRER.md`](COMO_CORRER.md) para arrancarlo en menos de 5 minutos |
| Video demo en YouTube | https://youtube.com/shorts/WCRq5OrJwMI?feature=share |

## Equipo

**Equipo:** Vita

| Nombre | CI |
|---|---|
| Geimbert Santiago Arteaga Silva | 7780954 |
| José Dainer Cáceres Valencia | 6554439 |
| Gabriel Antony Choque Benavides | 7218854 |
| Sebastian Caleb Alcivar Cox | 77888901 |

## El proyecto

Vita es una **app web mobile-first** que usa **IA multimodal (Google Gemini 2.5 Flash)** para identificar plagas y enfermedades agrícolas a partir de una foto y entregar en segundos:

- Diagnóstico de la plaga + nivel de severidad + confianza de la IA
- Tratamiento orgánico y químico con dosis exactas, marcas comerciales y momento de aplicación
- **Decisión económica en Bs** — calcula si fumigar es rentable según las hectáreas del productor (fumigar vs esperar con número)
- **Ventana climática** vía Open-Meteo — si llueve en las próximas 24h, te avisa que esperés
- **Chat persistente con agrónomo IA contextual** — Gemini conoce tu cultivo, hectáreas, región, historial

Se complementa con un **panel admin** para cooperativas y SENASAG/INIAF que geolocaliza los reportes, construye mapa de focos, valida diagnósticos y administra parcelas.

Toda la app vive en **una sola codebase Next.js + SQLite local** — un comando, una BD, sin servicios remotos salvo Gemini.

Diseñada para el productor cruceño que hoy carece de asistencia agronómica oportuna, lo que deriva en pérdidas de cosecha (USD 50M/año en SCZ) y sobreuso de agroquímicos.

## Arquitectura

```
                    ┌──────────────────────────────────┐
                    │  Next.js 16 monolito (puerto 3000)│
                    └──────────────────────────────────┘
                                    │
        ┌───────────────────────────┼────────────────────────────┐
        ▼                           ▼                            ▼
  ┌─────────────┐         ┌─────────────────┐          ┌───────────────────┐
  │  Landing    │         │  PWA productor  │          │   Panel admin     │
  │  pública /  │         │  /app/*         │          │   (dashboard,     │
  │  /precios   │         │  (welcome →     │          │   ingresos,       │
  │  /qr        │         │  plan → reg →   │          │   empresas, etc)  │
  └─────────────┘         │  scan → result) │          └───────────────────┘
                          └─────────────────┘                    │
                                    │                            │
                                    ▼                            ▼
                          ┌────────────────────────────────────────┐
                          │   /api/* (Route Handlers)              │
                          │   ├─ /api/auth/*  (productor + admin)  │
                          │   ├─ /api/scans/* (POST imagen→Gemini) │
                          │   ├─ /api/scans/[id]/chat              │
                          │   ├─ /api/catalog/pests                │
                          │   └─ /api/admin/* (analytics, scans)   │
                          └────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        ┌──────────────┐   ┌─────────────────┐   ┌──────────────┐
        │ SQLite local │   │  Gemini 2.5     │   │ Open-Meteo   │
        │ vita.db      │   │  Flash (Vision) │   │ (clima)      │
        │ + storage/   │   │  ÚNICO servicio │   │ gratis       │
        │   filesys    │   │  remoto         │   │ sin key      │
        └──────────────┘   └─────────────────┘   └──────────────┘
```

| Capa | Tecnología |
|---|---|
| **IA** | Google Gemini 2.5 Flash (vision + chat contextual) |
| **Clima** | Open-Meteo API (gratis, sin key) |
| **Framework** | Next.js 16 (App Router + Route Handlers) + TypeScript + Zod |
| **BD** | SQLite local (`better-sqlite3`) — `vita.db` se autogenera al primer arranque |
| **Storage** | Filesystem local (`web-admin/storage/scan-images/`) |
| **Auth productor (PWA)** | JWT propio (bcrypt + jsonwebtoken) en `localStorage` |
| **Auth admin (panel)** | JWT propio en cookie `httpOnly` |
| **Panel UI** | Tailwind 4 + shadcn/ui + Recharts |
| **Tipografía** | Geist (sans/mono) + Instrument Serif (acentos italic) |

### Lo que cambió respecto del diseño inicial

- **AgroScan → Vita** ("Visión inteligente para tu cosecha")
- **Backend Express separado → fusionado en Next.js Route Handlers** (`/api/*` mismo origen, sin CORS, un proceso)
- **Supabase remoto → SQLite local** (`vita.db`) — cero dependencias remotas excepto Gemini
- **Flutter mobile → PWA dentro de Next.js** (`/app/*`) — el jurado escanea un QR y entra desde su celular sin instalar nada (la carpeta `mobile/` queda archivada)
- **Mapbox → SVG estático** (mapa de focos en el panel) + autocompletado de localidades sin mapa en onboarding
- **2 auth systems (Supabase Auth + JWT) → 1 (JWT propio para ambos roles)**

## Planes (modelo SaaS)

| | 🌱 **Free** | 🌾 **Pro** | 🏛 **Enterprise** |
|---|---|---|---|
| Precio | Bs 0/mes | **Bs 70/mes** (o Bs 700/año) | **Bs 1.000/mes** |
| Hectáreas | 1 a 5 ha | 5 a 20 ha | Ilimitadas |
| Scans/mes | 3 | 50 | 300 (compartidos) |
| Cuentas | 1 | 1 | **5** |
| Chat IA + clima + decisión Bs | ❌ | ✅ | ✅ |
| Panel admin + API + onboarding asistido | ❌ | ❌ | ✅ |

Análisis completo de costos + break-even: `docs/strategy/2026-05-30-pricing-completo.md`.

## Subproyectos del monorepo

- `web-admin/` — Next.js que sirve **TODO**: landing pública (`/`), página de precios (`/precios`), QR de instalación (`/qr`), PWA del productor (`/app/*`), panel admin (`/dashboard`, `/ingresos`, `/empresas`, `/scans`, `/catalog`, `/analytics`) y la API REST (`/api/*`)
- `mobile/` — Flutter original, **archivado** post-pivote. La PWA reemplaza la app nativa
- `docs/` — spec, plans, strategy (pricing, métricas)

## Cómo correr local

```bash
# Una sola app, un solo comando
cd web-admin
npm install
npm run dev
# → http://localhost:3000
```

**URLs principales:**
- `http://localhost:3000/` — landing pública
- `http://localhost:3000/precios` — planes Free/Pro/Enterprise
- `http://localhost:3000/qr` — QR para entrar desde el celular
- `http://localhost:3000/app` — PWA del productor (registro + scan)
- `http://localhost:3000/login` — login del panel admin (`admin@vita.bo` / `admin1234`)

**Para probar desde el celular (LAN):**
1. PC + celular en la misma WiFi
2. Abrí `http://<IP-de-tu-PC>:3000/qr` en la PC (la IP la encontrás con `ipconfig`)
3. Escaneá el QR con el celular → te lleva a la PWA
4. Si Windows pide permiso de Firewall, **Permitir acceso**

**Variables de entorno** (`web-admin/.env.local`, ya está en `.gitignore`):
```bash
NEXT_PUBLIC_API_URL=/api
GEMINI_API_KEY=AQ.Ab8...     # Google AI Studio (gratis hasta 1.500 req/día)
JWT_SECRET=cualquier-string-largo-y-random
JWT_EXPIRES_IN=30d
```

## Triple impacto

- 🌱 **Ambiental** — Reduce el uso indiscriminado de agroquímicos al entregar diagnóstico preciso y dosis correctas (en Santa Cruz hoy se aplican hasta 35 kg/ha al año en soya con mezclas de 11 productos)
- 💰 **Económico** — Evita pérdidas de cosecha por mal diagnóstico (Bs 456/mes promedio en un lote de 12 ha) con ROI 6.5x desde el primer mes en plan Pro
- 🟢 **Social** — Democratiza el acceso a un diagnóstico agronómico confiable para el pequeño productor sin asesor técnico cercano

## Documentación

- `docs/strategy/2026-05-30-metrica-y-pricing.md` — primera propuesta de métrica central
- `docs/strategy/2026-05-30-pricing-completo.md` — análisis costos + planes Free/Pro/Enterprise + break-even
- `docs/superpowers/specs/2026-05-29-plagascan-design.md` — spec técnico original (pre-rebrand)
- `docs/mocks/landing/` — 3 mocks HTML de exploración visual inicial

## Licencia

Proyecto desarrollado para la Hackathon Build With AI 2026 — Santa Cruz, Bolivia.
