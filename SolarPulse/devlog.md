# 📓 DEVLOG - Registro de Sesiones de Desarrollo

## [2026-09-15] - Sesión #10: Rediseño Operativo del Motor Solar e Histórico

- **Objetivo:** Transformar `/motor` y `/history` en una consola operativa de predicción solar y laboratorio de desempeño, añadiendo endpoints de cockpit y conectando el dashboard principal a series reales.
- **Realizado:**
  - **Backend (`main.py`, `schemas.py`, `tests/test_history_api.py`):**
    - Creado endpoint `GET /api/cockpit/now` para obtener estado en vivo consolidado (weather, forecast, ecoflow, system_config, last fetch).
    - Creado endpoint `GET /api/cockpit/today-series` para la serie horaria integrada de hoy (predicción vs real en W).
    - Expandido `tests/test_history_api.py` para verificar los nuevos endpoints de cockpit (43 tests pasando al 100%).
  - **Frontend (`src/app/motor/page.tsx`, `src/app/history/page.tsx`, `src/app/page.tsx`, `src/components/Navbar.tsx`):**
    - Rediseñado `/motor` (antes `/how-it-works`) como la sala de control / consola operativa en vivo con sensores en tiempo real, sincronización Open-Meteo con cuenta atrás y pipeline interactivo.
    - Rediseñado `/history` como laboratorio de desempeño con métricas de error (MAE), contexto meteorológico y análisis de desviación horaria.
    - Conectado el gráfico principal del Dashboard (`page.tsx`) a las series reales devueltas por `/api/cockpit/today-series` (eliminando datos simulados estáticos).
    - Actualizado `Navbar` con acceso directo a "Motor Solar".
- **Bloqueos:** Ninguno.
- **Próximo paso:** Pruebas E2E / integración MQTT para EcoFlow en producción.


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
