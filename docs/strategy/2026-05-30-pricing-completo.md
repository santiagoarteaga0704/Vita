# Vita — Análisis de costos + modelo de precios

**Fecha:** 2026-05-30
**Versión:** 2.0 (Free / Pro / Enterprise · post-ajuste con límites concretos)
**Estado:** vigente
**Tipo cambio referencia:** 1 USD = 7 Bs (al 30-may-2026)

---

## 1. Costos unitarios reales

### 1.1 Costo variable por scan completo

| Item | Unidad | Cantidad típica | Costo USD | Costo Bs |
|---|---|---|---|---|
| Gemini 2.5 Flash input (prompt + catálogo) | $0.075/1M tok | 3.000 tokens | $0.000225 | Bs 0.0016 |
| Gemini 2.5 Flash imagen | ~$0.001 por imagen | 1 | $0.001 | Bs 0.007 |
| Gemini 2.5 Flash output (JSON resultado) | $0.30/1M tok | 500 tokens | $0.00015 | Bs 0.001 |
| Open-Meteo (clima) | gratis | 1 request | $0 | Bs 0 |
| Storage Supabase imagen | $0.021/GB-mes | 80 KB | — | Bs 0.0001 |
| **TOTAL POR SCAN** | | | **$0.0014** | **Bs 0.01** |

### 1.2 Costo variable por sesión de chat (agrónomo IA)

| Item | Cantidad | Costo Bs |
|---|---|---|
| 5 turnos chat input (~5.000 tok) | | Bs 0.003 |
| 5 turnos output (~2.000 tok) | | Bs 0.004 |
| **TOTAL CHAT POST-SCAN** | | **Bs 0.007** |

### 1.3 Resumen costo variable por plan

| Plan | Scans/mes | Chats | Costo IA total Bs/mes |
|---|---|---|---|
| Free | 3 | 0 | **Bs 0.03** |
| Pro | 50 | 25 | **Bs 0.68** |
| Enterprise (300 scans / 5 cuentas) | 300 | 150 | **Bs 4.05** |

### 1.4 Costos fijos mensuales

| Item | Bs/mes |
|---|---|
| Hosting (Vercel Pro + Railway) | Bs 140 |
| DB managed (Supabase Pro) | Bs 175 |
| Email transaccional (Resend free tier) | Bs 0 |
| Dominio + SSL amortizado | Bs 9 |
| Backups | Bs 35 |
| **TOTAL TÉCNICO FIJO** | **Bs 360** |

### 1.5 Costos operativos

| Rol | Tiempo | Bs/mes |
|---|---|---|
| 1 agrónomo validador part-time | 20h/sem | Bs 3.000 |
| 1 BD ventas cooperativas part-time | 20h/sem | Bs 4.000 |
| Soporte WhatsApp | 10h/sem | Bs 1.500 |
| Marketing digital ads | — | Bs 500 |
| **TOTAL OPS** | | **Bs 9.000** |

**Costo total mensual a soportar: Bs 9.360 ≈ USD 1.337**

---

## 2. Mercado y comparables

| Producto | Precio mensual |
|---|---|
| Plantix Premium | $4.99 / Bs 35 |
| eFarmer (AR) | Bs 14 |
| CropIn enterprise (India) | $2-10/ha/mes |
| Consultor agrónomo SCZ | Bs 800-1.600/visita |
| **Vita Pro** | **Bs 70** |

### Pérdida por mal diagnóstico

| Cultivo | Pérdida típica | Por ha-evento |
|---|---|---|
| Roya asiática soya | 30-80% rinde | Bs 3.000-4.000 |
| Gusano cogollero maíz | 30-50% | Bs 1.000-1.800 |
| **Promedio anualizado** | 30% chance | **Bs 38/ha-mes** |

**Productor 12 ha promedio → pérdida potencial Bs 456/mes equivalente.**

---

## 3. Planes definitivos

### 🌱 Free — Bs 0/mes

**Para:** primer contacto, smallholder.

| Característica | Free |
|---|---|
| Hectáreas | **1 a 5 ha** |
| Scans/mes | **3** |
| Diagnóstico básico (plaga + severidad + confianza) | ✅ |
| Tratamiento orgánico básico | ✅ |
| Tratamiento químico con dosis | ❌ |
| Chat con agrónomo IA | ❌ |
| Ventana climática | ❌ |
| Decisión económica en Bs | ❌ |
| Historial + export PDF | ❌ |
| Compartir por WhatsApp | ❌ |

**Costo nuestro:** Bs 0.05/mes/cuenta.

---

### 🌾 Pro — Bs 70/mes (o Bs 700/año, 17% off)

**Para:** productor medio independiente.

| Característica | Pro |
|---|---|
| Hectáreas | **5 a 20 ha** |
| Scans/mes | **50** |
| Diagnóstico completo | ✅ |
| Tratamiento orgánico + químico con dosis y marcas | ✅ |
| Chat con agrónomo IA contextual | ✅ |
| Ventana climática · warning lluvia | ✅ |
| Decisión económica en Bs | ✅ |
| Historial completo + export PDF | ✅ |
| Compartir por WhatsApp | ✅ |
| Soporte email 24-48h | ✅ |

**Costo nuestro:** Bs 0.70/mes/cuenta.
**Margen bruto:** Bs 69.30/cuenta (99%).

**ROI productor 12 ha:** Bs 456 ÷ Bs 70 = **6.5x**.

---

### 🏛 Enterprise — Bs 1.000/mes

**Para:** cooperativas, agroempresas, SENASAG, INIAF.

| Característica | Enterprise |
|---|---|
| Hectáreas | **Ilimitadas** |
| Scans/mes (compartidos entre cuentas) | **300** |
| Cuentas con acceso al sistema | **5** |
| Todo lo de Pro multiplicado | ✅ |
| Panel admin web con mapa de focos | ✅ |
| Validación de diagnósticos por agrónomo Vita | ✅ |
| Alertas zonales push masivas | ✅ |
| API REST + Export CSV | ✅ |
| Onboarding asistido | ✅ |
| Account manager · SLA 4h | ✅ |

**Costo nuestro:** Bs 30/mes/cuenta.
**Margen bruto:** Bs 970/cuenta (97%).

---

## 4. Streams secundarios

| Stream | Monto | Paga |
|---|---|---|
| Comisión agroquímicos | 5% | Agripac, Agrocentro, Bayer |
| Reporte agronómico anual PDF | Bs 200/año | Productor Pro opcional |
| Licencia datos agregados (B2G) | Bs 50K-200K/año | SENASAG, INIAF, MDR |

---

## 5. Break-even

**Costos fijos + ops: Bs 9.360/mes**

### Escenario A — Realista año 1
| Plan | Cuentas | Revenue |
|---|---|---|
| Free | 1.000 | Bs 0 |
| Pro | 100 | Bs 7.000 |
| Enterprise | 3 | Bs 3.000 |
| **Total** | **1.103** | **Bs 10.000/mes** |

**→ Break-even con Bs 640 de margen.**

### Escenario B — Año 2 (3x growth)
| Plan | Cuentas | Revenue |
|---|---|---|
| Pro | 400 | Bs 28.000 |
| Enterprise | 15 | Bs 15.000 |
| **Total** | | **Bs 43.000/mes** |
| **ARR** | | **USD 74.000** |

### Escenario C — Año 3 (5% SCZ)
| Plan | Cuentas | Revenue |
|---|---|---|
| Pro | 1.500 | Bs 105.000 |
| Enterprise | 40 | Bs 40.000 |
| **Total** | | **Bs 145.000/mes** |
| **ARR** | | **USD 248.000** |

---

## 6. Implementación en la app

### Free (default):
- Badge "🌱 Free" en perfil + contador "X de 3 scans este mes"
- Al 4° scan: modal "Llegaste al límite. Pasate a Pro · Bs 70/mes"
- Features Pro bloqueadas con overlay

### Pro:
- Badge "🌾 Pro" + "X de 50 scans"
- Botón "Renovar" / "Plan anual 17% off"

### Enterprise:
- Acceso al panel admin completo
- Contador 5 cuentas activas + 300 scans usados

### Página `/precios` pública — ✅
### Panel admin (`/dashboard`, `/ingresos`) — ✅ rename a Free/Pro/Enterprise

---

## 7. Resumen para el pitch

| Métrica | Valor |
|---|---|
| Costo por scan completo | **Bs 0.015** |
| Precio Pro | **Bs 70/mes** |
| Precio Enterprise | **Bs 1.000/mes** |
| Margen bruto Pro | **99%** |
| Margen bruto Enterprise | **97%** |
| Break-even | **100 Pro + 3 Enterprise** |
| ROI productor 12 ha | **6.5x el primer mes** |
| ARR año 2 | **USD 74.000** |
| ARR año 3 | **USD 248.000** |

> **Pitch line:** "El productor de soya con 12 ha pierde Bs 456 al mes por mal diagnóstico. Vita le cuesta Bs 70. ROI de 6.5x desde el día uno. A nosotros nos cuesta Bs 1 servirle. Margen 99%. Break-even con apenas 100 productores Pro y 3 cooperativas."
