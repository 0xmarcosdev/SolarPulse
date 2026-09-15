## [2026-09-14 / 2026-09-15] - Sesión Dashboard UX + Identidad Visual + Cimientos de Datos

### Objetivo
Pulir el frontend del dashboard SolarPulse para que se sienta como un producto real: tema unificado, navegación profesional, indicadores densos, sparklines reales, Power Flow, gauges, alertas, resumen del día y estados de carga/vacío. Preparar la contraparte de backend (histórico, kWh reales y explicación del motor de predicción).

### Realizado (Frontend)

#### Identidad visual y layout
- [x] Unificación total a tema oscuro (zinc-950 / zinc-900). Eliminado el choque blanco vs oscuro del StatusCard original.
- [x] Paleta de acentos coherente: ámbar (sol/energía), esmeralda (batería/éxito), sky (predicción), rose (alertas).
- [x] Layout más denso y ergonómico: menos padding muerto, `gap-3`/`gap-5`, `max-w-6xl`, cards `rounded-2xl`.
- [x] Navbar sticky profesional con tabs activos (`usePathname` + `layoutId` de Framer Motion) en Dashboard / Optimización / Configuración.
- [x] Integración de Navbar en `/config` y `/optimization`.

#### Componentes nuevos / mejorados
- [x] `KpiCard` reutilizable con soporte de sparkline, barra de progreso y badge.
- [x] `StatusCard` refactorizado a 4 KPI densos (SoC, Entrada Solar, Predicción AC, POA) con sparklines alimentados por datos reales (`/api/ecoflow?limit=24` y `/api/generation`).
- [x] `PowerFlow` animado (Solar → Batería → Carga) con:
  - Datos reales (`input_watts`, `output_watts`, `battery_soc`)
  - Flujo neto estimado `batteryW = solarW - loadW`
  - Flechas animadas con Framer Motion
  - Modo compacto / expandido (toggle)
  - Mensajes contextuales inteligentes según estado
- [x] `Gauge` circular y semicircular (SVG puro + animación) para SoC, Entrada Solar (límite 500 W) y Predicción AC.
- [x] `AlertsPanel` con tipos clipping / low_battery / info / warning y dismiss.
- [x] `DaySummary` con resumen kWh (estimado), próximo pico solar y horas de sol restantes.
- [x] `Skeleton` y `EmptyState` para carga y ausencia de datos.
- [x] Micro-interacciones: hover en gauges, tooltips contextuales, animaciones de entrada.

#### Correcciones importantes
- [x] Invalid hook call: `useState` de `dismissedIds` estaba fuera del componente `Home` → movido dentro.
- [x] Errores de TypeScript por variables no declaradas (`solarW`, `peak`, `alerts`, `handleDismiss`) y tipado incorrecto en `buildAlerts`.
- [x] Integración correcta de datos de `/api/current-status` en `page.tsx` para PowerFlow y Gauges (antes solo vivían dentro de StatusCard).

#### Dependencias
- Añadida: `framer-motion` (animaciones de UI, Power Flow, gauges, navbar).

### Estado del stack verificado
- Frontend: Next.js 16 (App Router) + React 19 + Tailwind v4 + Recharts + Lucide + Framer Motion.
- Backend existente: FastAPI + SQLite + pvlib + Open-Meteo + endpoints `/api/current-status`, `/api/ecoflow`, `/api/generation`, `/api/forecast/fetch`, `/api/v1/system-config`.

### Limitaciones actuales (conocidas)
- kWh del día siguen siendo **estimaciones** en frontend (`estimateKwh`), no energía real integrada desde backend.
- Histórico multi-día aún no existe como endpoint dedicado.
- Power Flow usa flujo neto estimado; no hay todavía charge/discharge explícito de EcoFlow vía MQTT.
- Datos de Open-Meteo y parámetros del sistema no tienen todavía una vista educativa/explicativa en el dashboard.
- Gráfico principal de generación sigue usando serie mock en parte del flujo (StatusCard ya trae series reales para sparklines).

### Programado / Siguiente fase (Backend + Explicabilidad)

1. **Histórico de últimos X días**
   - Endpoint(s) para series diarias/horarias de generación, EcoFlow y clima.
   - UI de histórico (selector 1/3/7/30 días).

2. **kWh reales**
   - Cálculo/persistencia de energía diaria (integral de potencia o agregación).
   - Sustituir estimaciones del `DaySummary` por valores reales del backend.

3. **Vista educativa del motor de predicción**
   - Sección “Cómo predice SolarPulse” con:
     - Datos que se sensan de Open-Meteo (GHI, DNI, DHI, Temp, etc.) explicados en lenguaje claro.
     - Resumen del setup del usuario (panel, inclinación, azimut, ubicación Cuba, EcoFlow Delta 3, pérdidas 15 %, clipping 500 W).
     - Fórmulas clave del pipeline (POA → DC → clipping → pérdidas → AC final).
     - Gráficos que ayuden a visualizar y retener el flujo del motor.

4. **Pulido adicional**
   - Conectar gráfico principal 100 % a datos reales.
   - Skeleton/empty states también dentro de StatusCard si hace falta.
   - Responsive fino en móvil.

### Notas para agentes
- Cualquier cambio posterior debe actualizar este DEVLOG y marcar tareas en ROADMAP.md.
- Mantener clipping 500 W + factor de pérdidas 0.85 en toda lógica de potencia.
- Timezone: America/Havana.
- No inventar parámetros de pvlib / Open-Meteo / EcoFlow: usar Context7 o docs reales.