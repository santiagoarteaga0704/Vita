# AgroScan

> **Detección de plagas agrícolas con IA para el productor de Santa Cruz de la Sierra**
> Hackathon Build With AI 2026 · Mención **AGRO** · UCB Santa Cruz · 29-31 de mayo de 2026

## Equipo

**Equipo:** AgroScan

**Integrantes:**

| Nombre | CI |
|---|---|
| Geimbert Santiago Arteaga Silva | 7780954 |
| José Dainer Cáceres Valencia | 6554439 |
| Gabriel Antony Choque Benavides | 7218854 |
| Sebastian Caleb Alcivar Cox | 77888901 |

## El proyecto

AgroScan es una **app móvil** que usa **IA multimodal (Google Gemini 2.0 Flash)** para identificar plagas y enfermedades agrícolas a partir de una foto, y entregar en segundos un plan de manejo recomendado (orgánico + químico) con dosis exactas. Se complementa con un **panel web administrativo** que geolocaliza los reportes y construye un mapa de focos de plagas para alertar de brotes a tiempo.

Está diseñado para el pequeño y mediano productor cruceño que hoy carece de asistencia agronómica oportuna, lo que deriva en pérdidas de cosecha y sobreuso de agroquímicos.

## Arquitectura

```
[Productor Flutter App] → [Backend Node/Express] → [Gemini 2.0 Flash]
                                ↓                  → [Supabase Postgres + Storage]
                                ↓                  → [Firebase Cloud Messaging]
[Web Admin Next.js]    ←────────┘
```

| Capa | Tecnología |
|---|---|
| **IA** | Google Gemini 2.0 Flash (Google AI Studio, tier gratuito) |
| **Mobile** | Flutter 3.41 + Riverpod + Dio + go_router |
| **Backend** | Node.js 20 + Express 5 + TypeScript + Zod |
| **DB / Storage / Auth web** | Supabase (PostgreSQL + Storage + Auth) |
| **Web Admin** | Next.js 15 + Tailwind CSS + shadcn/ui + Mapbox |
| **Push** | Firebase Cloud Messaging |
| **Deploy** | Railway (backend) + Vercel (web) + Diawi (APK) |

## Subproyectos del monorepo

- `backend/` — API REST que orquesta IA, BD, auth y push
- `mobile/` — App Flutter Android + iOS para el productor
- `web-admin/` — Panel Next.js para gestionar data y validar la IA

## Documentación

- **Spec técnico completo:** `docs/superpowers/specs/2026-05-29-plagascan-design.md`
- **Plan de implementación:** `docs/superpowers/plans/2026-05-29-agroscan-implementation.md`
- **Documento técnico oficial** (FODA, PESTEL, Lean Canvas, financiero): entregado aparte para evaluación

## Cómo correr local

Cada subproyecto tiene su propio README con instrucciones detalladas.

```bash
# Backend
cd backend && npm install && npm run dev

# Mobile (necesita Flutter SDK + emulador Android)
cd mobile && flutter pub get && flutter run

# Web Admin
cd web-admin && npm install && npm run dev
```

## Triple impacto

- 🌱 **Ambiental** — Reduce el uso indiscriminado de agroquímicos al entregar diagnóstico preciso y dosis correctas (en Santa Cruz hoy se aplican hasta 35 kg/ha al año en soya con mezclas de 11 productos).
- 💰 **Económico** — Evita pérdidas de cosecha por mal diagnóstico (en episodios de plagas + sequía se han registrado pérdidas de hasta 80% en soya/maíz/sorgo).
- 🟢 **Social** — Democratiza el acceso a un diagnóstico agronómico confiable para el pequeño productor sin asesor técnico cercano.

## Licencia

Proyecto desarrollado para la Hackathon Build With AI 2026 — Santa Cruz, Bolivia.
