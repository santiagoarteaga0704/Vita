# Vita — Métrica central y modelo de pricing

**Fecha:** 2026-05-30
**Estado:** propuesta para revisión
**Contexto:** ajuste estratégico tras feedback de pitch ("menos tecnología, más beneficio · enfocar SaaS · pensar en hectáreas").

---

## 1. La métrica central

> **Hectárea Pagada Activa (HPA)** — número de hectáreas cubiertas por
> una suscripción Vita vigente, con al menos un escaneo en los últimos
> 30 días.

### Por qué hectárea y no usuario

| Métrica | Problema en agro |
|---|---|
| Usuarios registrados | Un productor con 5 ha vale lo mismo que uno con 5.000 ha — ridículo. |
| MAU | Los productores no usan la app a diario; usan en momento crítico (brote). El proxy correcto de valor no es uso, es **área protegida**. |
| Escaneos | Métrica de output. Buenas semanas dan picos, malas semanas dan ceros. Volátil. |
| **Hectárea Pagada Activa** | Escala lineal con valor real para el cliente (más ha = más rinde que cuidar = más Bs en riesgo). Estable. Comparable con métricas que el sector ya usa: rinde/ha, costo agroquímico/ha. |

### Métricas derivadas (que el panel ya muestra)

| Métrica | Cálculo | Para qué |
|---|---|---|
| MRR | Σ precio mensual por cuenta | Salud financiera mensual |
| ARPH | MRR ÷ HPA | Precio efectivo por hectárea — comparable contra el costo evitado por hectárea, que es la prueba de valor |
| Cobertura SCZ | HPA ÷ 2.500.000 ha cultivadas SCZ | Mercado capturado |
| Hectáreas protegidas | HPA con scan en los últimos 30 días | Engagement real |
| Bs ahorrados estimados | HPA × Bs 500 (mediana) | El número que va en el pitch |

### Lo que mide la app del productor

| Captura | Por qué |
|---|---|
| **Hectáreas totales** del productor (one-time al onboarding) | Define el plan que le toca y el techo de su negocio para nosotros |
| **Cultivo principal por hectárea** (puede ser 1 o N) | Permite alertas zonales filtradas correctamente |
| **GPS de cada escaneo** | Confirma que las hectáreas declaradas están donde dice — anti-fraude para planes grandes |
| **Cobertura de scan por parcela** | Una hectárea sin scan en 30 días deja de contar como "protegida" |

### Quién registra las hectáreas (decisión 30-may)

Modelo de dos vías, **configurable por cuenta** con flag `hectares_registration_mode`:

| Tipo de cuenta | Modo default | Quién carga las parcelas | Verificación |
|---|---|---|---|
| Productor Free | `self` | El productor en onboarding (input simple de hectáreas) | Ninguna (zero-cost para nosotros) |
| Productor Pro | `self` | El productor en onboarding | Auto-verifica cuando hay ≥1 scan georeferenciado por bloque de 50 ha |
| **Cooperativa / Empresa / Gobierno** | **`managed`** | **Equipo Vita** registra parcelas con GPS por ellos | Validada por nosotros durante onboarding |

El toggle se ve y se cambia desde `/empresas/[id]` (panel admin). El default
puede revertirse: una agroempresa puede pedir `self` si tiene su propio admin
técnico (caso de Las Brisas SRL en el demo). Una coop puede arrancar en `self`
para piloto barato y migrar a `managed` al pasar a plan Cooperativa pago.

**Por qué esta separación importa para el negocio:**
- En `managed`, Vita tiene **datos de calidad superior** (parcelas con GPS
  preciso, área medida, cultivo declarado). Eso vale más para el stream
  "Licencia datos agregados" → SENASAG/INIAF pagan más por dataset verificado.
- En `managed` también podemos cobrar un **fee de onboarding único** (Bs 1.500
  típicamente, no recurrente) para cubrir el costo del agrónomo que carga las
  parcelas. Eso recupera el CAC en mes 1.
- En `self`, el costo marginal por cuenta es ~Bs 0 → escala infinito sin
  contratar gente nuestra.

---

## 2. Modelo de pricing

Tres planes con la **hectárea como unidad de venta** en los planes pagos.
Precios en Bs/mes.

| Plan | Audiencia | Precio | Lo que da | Lo que no da |
|---|---|---|---|---|
| **Productor Free** | Smallholder, primer contacto | Bs 0 hasta 25 ha | 10 scans/mes · resultado básico (plaga + severidad) · catálogo público · mapa de focos solo lectura | Sin tratamiento detallado · sin historial > 30 días · sin alertas push de zona |
| **Productor Pro** | Productor mediano, decide compra propia | Bs 0,50 / ha / mes · piso Bs 25/mes · tope Bs 500/mes | Scans ilimitados · tratamiento orgánico y químico con dosis · historial completo · alertas zonales push · follow-up 7 días · exportar PDF para asesor | Sin gestión multi-usuario · sin export CSV masivo |
| **Cooperativa / B2B** | Coop. / SENASAG / INIAF / agroempresa grande | Cotizado · referencia Bs 0,30 / ha / mes a partir de 1.000 ha · piso Bs 800/mes | Todo lo de Pro · panel admin (este panel) · validación de diagnósticos · alertas masivas push · API · export CSV · onboarding asistido · líneas dedicadas | — |

### Por qué este modelo funciona contra Plantix y similares

- **Plantix cobra licencia o es freemium por scans** — métrica que el productor no entiende.
- **Vita cobra por hectárea protegida** — métrica que el productor usa todos los días para todo (semilla, agroquímicos, mano de obra, rinde). El productor ya piensa en Bs/ha. Es una venta natural.
- **El piso (Bs 25 / Bs 800)** protege margen en cuentas pequeñas.
- **El tope Bs 500/mes en Pro** evita que un productor de 5.000 ha se "cuele" en Pro — lo empuja a Cooperativa.

### Streams de ingreso secundarios (mismas hectáreas, otro vector)

1. **Comisión agroquímicos** — link tracked a Agripac / Agrocentro desde el resultado del scan. 5% sobre compra atribuida. Sin tocar precio al productor.
2. **Licencia de datos agregados** — SENASAG / INIAF / MDR pagan por dataset trimestral de focos por región y plaga. No vendemos individual.
3. **Reporte agronómico anual** — Bs 200 por cuenta Pro/Coop. PDF con historial, focos detectados, recomendaciones de rotación.

---

## 3. Costos unitarios (qué nos cuesta una hectárea)

| Costo | Por cuenta paga / mes | Notas |
|---|---|---|
| Gemini 2.0 Flash | ~$0 hasta 1.500 req/día (free tier) · ~$0.001 por scan en paid | Hackathon: cero. Producción: necesitamos ~30 scans/cuenta/mes promedio → ~$0.03 / cuenta / mes |
| Supabase | Free tier hasta 500 MB DB + 1 GB storage · $25/mes Pro | Hasta ~5.000 cuentas con plan free, después scaling |
| Mapbox | Free tier 50K cargas/mes | Generoso para el MVP |
| FCM (push) | Gratis | — |
| Hosting (Railway + Vercel) | $5–20 / mes los primeros meses | — |

**Conclusión:** **Bs 0,50 / ha / mes con piso Bs 25** deja **margen bruto > 90%** desde el primer cliente.

Ejemplo:
- Productor 200 ha → paga Bs 100/mes → costo IA + infra ~Bs 1 → margen 99 %.
- Cooperativa 5.000 ha → paga Bs 1.500/mes (con descuento) → costo ~Bs 15 → margen 99 %.
- El margen lo come la venta humana (BD), no la infra.

---

## 4. Escalabilidad

- **Software escala plano**: el costo por hectárea adicional es ~Bs 0.005 (gemini + storage).
- **Lo que no escala plano es la confianza**: cada cooperativa nueva requiere demo + piloto + agrónomo validador. Por eso el MVP del panel admin lleva validación de diagnósticos — sin eso, no hay piloto vendible.
- **Curva sugerida**:
  - Mes 0-3: 1 coop piloto + 100 productores Free = HPA ~5.000 → ARR Bs 60 K
  - Mes 4-6: 5 coops + 500 Pro = HPA ~50.000 → ARR Bs 600 K
  - Mes 12: 20 coops + 2.000 Pro = HPA ~200.000 → ARR Bs 2.4 M (8% del mercado SCZ)
- **Cap teórico SCZ**: 2.5 M ha cultivadas → ARR techo ~Bs 15 M solo SCZ. Bolivia x4. Latam x40.

---

## 5. Diferenciadores defendibles (vender por atributo)

| Atributo | Beneficio concreto | Plantix u otros |
|---|---|---|
| **Catálogo curado de 30 plagas SCZ** | Diagnóstico confiable de la plaga que el productor SÍ tiene cerca | Modelo global → da falsos positivos con plagas africanas/asiáticas |
| **Dosis con marcas comerciales locales** (Agripac, Agrocentro) | El productor compra hoy y aplica mañana | Recomienda activos genéricos, productor sigue sin saber qué comprar |
| **Mapa de focos en vivo de SCZ** | "Hay roya en Cuatro Cañadas esta semana — revisá hoy" | No tiene |
| **Funciona sin red** | En la chacra de verdad | No tiene |
| **Alertas zonales push** | Productor adelanta el problema en vez de reaccionar | No tiene |
| **Validación por agrónomo local** | Cada diagnóstico equivocado se corrige y mejora el modelo | Caja negra global |

---

## 6. Limitante real: conectividad

> "Mapa de señal de Tigo" — del feedback.

- **80% de SCZ rural tiene cobertura 4G de al menos un operador.**
- **20% no** (Guarayos profundo, Charagua, frontera).
- Por eso el modo **offline-first** no es feature, es requisito de mercado.
- **Lo que conviene mostrar en el pitch:** overlay del mapa de cobertura Tigo/Entel sobre el mapa de focos — demuestra que diseñamos para la realidad, no para un PowerPoint.

---

## 7. Lo que cambia en el producto

A partir de esta decisión:

### Backend
- Tabla `users`: agregar `hectares` (INT, NOT NULL en onboarding Pro) y `hectares_verified` (BOOL, default false — flip cuando hay ≥1 scan georeferenciado por bloque de 50 ha).
- Tabla `subscriptions`: nueva — `user_id`, `plan` ('free' | 'pro' | 'coop' | 'enterprise' | 'piloto'), `hectares_billed`, `started_at`, `current_period_end`, `status`.
- Tabla `companies`: nueva — `name`, `type` ('cooperativa' | 'agroempresa' | 'gobierno'), `region`, `members_count`, `total_hectares`, `hectares_registered`, `hectares_registration_mode` ('self' | 'managed'), `plan`, `mrr_bob`, `pipeline_stage`, `health` ('verde' | 'amarillo' | 'rojo'), `created_at`.
- Tabla `parcels`: nueva — para cuentas `managed` — `company_id`, `name`, `gps_polygon` (PostGIS), `hectares`, `crop`, `registered_by_admin_id`, `registered_at`.
- Vista `billing_summary`: agrega MRR, ARPH, HPA por mes — la que va a alimentar la página `/ingresos`.

### Frontend admin
- **Dashboard** → SaaS view: HPA, MRR, hectáreas protegidas, Bs ahorrados, charts de crecimiento. ✅ hecho 30-may.
- **Ingresos** → revenue puro, 3 planes visualizados, pipeline coops, streams secundarios. ✅ hecho 30-may.
- **Empresas** → listado de cuentas B2B con toggle "Gestión de parcelas por Vita", filtros managed/self. ✅ hecho 30-may.
- **Analytics** → métricas técnicas (precisión IA, latencia, top plagas, top regiones). ✅ hecho 30-may.
- **Escaneos** → ya está, solo cambiar columna "Usuario" → "Productor (N ha)" — pendiente.
- **Catálogo** → sin cambios.

### App productor
- Onboarding: pedir hectáreas + cultivo principal con slider/input claro.
- Pantalla "Mi parcela": muestra hectáreas declaradas + última fecha de scan por bloque.
- Aviso cuando se acerca al límite del plan Free (≥80% de 25 ha).

### Landing
- Cambiar el hero de "12 segundos · 30 plagas" (tech) a "**Bs 800 protegidos por hectárea**" (beneficio).
- Sección nueva "Cuánto cuesta" con los 3 planes — esto cierra el "luego añadimos suscripciones".

---

## 8. Lo que NO cambia

- Stack Flutter / Next / Express / Supabase / Gemini — ya está bien.
- Nombre Vita — confirmado.
- Direction visual B (Bento botánico) — confirmado.

---

## 9. Siguiente paso recomendado

1. Confirmar (vos): ¿modelo de pricing OK como propuesta? ¿algún cambio antes de codear?
2. Implementar (yo): rediseño del Dashboard a la vista SaaS con HPA / MRR / Hectáreas protegidas.
3. Implementar (yo): página `/precios` pública en la landing + sección "Cuánto cuesta" en el hero secundario.
4. Implementar (yo): migración SQL para `subscriptions` y `cooperatives` + endpoint `GET /admin/billing/summary`.
5. Implementar (vos / equipo pitch): screenshot del mapa Tigo cobertura SCZ para meter en el deck.
