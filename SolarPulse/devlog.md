# 📓 DEVLOG - Registro de Sesiones de Desarrollo

## [2026-09-15] - Sesión #11: Week Forecast Widget + Day Chart + Política Estricta de Unidades (W/Wh/kWh)

- **Objetivo:** Transformar el Dashboard en una herramienta de planificación semanal basada en pronóstico solar y energía acumulada, aplicando la política estricta de unidades (W, Wh, kWh).
- **Realizado:**
  - **Backend (`main.py`, `schemas.py`, `tests/test_history_api.py`):**
    - Implementado endpoint `GET /api/forecast/week` que devuelve la previsión a 7 días (kWh predichos, pico W, solar score 0-100).
    - Implementado endpoint `GET /api/forecast/day?date=YYYY-MM-DD` que devuelve los slots de 24h con potencia en W y energía del intervalo en Wh.
    - Añadidos tests específicos en `test_history_api.py` (44 tests pasando al 100%).
  - **Frontend (`src/components/WeekForecastStrip.tsx`, `src/components/DayForecastChart.tsx`, `src/app/page.tsx`):**
    - Creado componente `WeekForecastStrip` con tira de 7 días seleccionables, iconos de calidad solar e indicador de kWh.
    - Creado componente `DayForecastChart` para visualizar la curva de potencia de 24 horas del día seleccionado (con barras superpuestas de Wh e indicador de clipping a 500W).
    - Integración en el Dashboard principal (`page.tsx`) como pieza narrativa central de planificación.
  - **Política de Unidades:**
    - W para potencia instantánea y límites.
    - Wh para intervalos horarios.
    - kWh para totales diarios y acumulados.
- **Bloqueos:** Ninguno.
- **Próximo paso:** Pulido final o despliegue en entorno doméstico con hardware real.



## [2026-09-14 / 2026-09-15] - Sesión Dashboard UX + Identidad Visual + Cimientos de Datos

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
- Power Flow usa flujo neto estimado; no hay todavía charge/discharge explícito de EcoFlow vía MQTT.
- Gráfico principal de generación sigue usando serie mock en parte del flujo (StatusCard ya trae series reales para sparklines).

(End of file - total 130 lines)
