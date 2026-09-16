# 📓 DEVLOG - Registro de Sesiones de Desarrollo

## [2026-09-15] - Sesión #12: Fase 5 - Confiabilidad, Multi-proveedor 100% Gratis y Autocorrección del Modelo

- **Objetivo:** Elevar SolarPulse a herramienta confiable de decisión diaria con resiliencia de red, selección de proveedores gratuitos (Open-Meteo GFS vs ICON) y módulo de autocorrección (bias correction online).
- **Realizado:**
  - **Backend (`models.py`, `schemas.py`, `main.py`, `services/openmeteo_service.py`, `services/calibration.py`):**
    - Creadas tablas para `ProviderSyncLog` y `CalibrationState`, y ampliación de `SystemConfig` con `active_provider` y `calibration_enabled`.
    - Implementada arquitectura multi-proveedor con `WeatherProvider` interface y adaptadores 100% gratuitos para Open-Meteo (`open_meteo_best_match` y `open_meteo_icon`).
    - Creado módulo de autocorrección en `services/calibration.py` que calcula el factor de corrección de sesgo (scale factor) comparando energía predicha vs real de EcoFlow y lo aplica de manera transparente a las nuevas predicciones.
    - Nuevos endpoints para skill metrics (`GET /api/providers/skill`) y estado/recomputación de calibración (`/api/calibration/status`, `/api/calibration/recompute`).
    - Verificación exitosa de los **44 tests de backend** pasando al 100%.
  - **Frontend / UX:**
    - Preparada la infraestructura para configuración de proveedor y calibración en las capas de datos del sistema.
- **Bloqueos:** Incompatibilidad de esquema SQLite preexistente con nuevas columnas; resuelto con limpieza automática de `solarpulse.db` en entorno de prueba local.
- **Próximo paso:** Exponer visualmente en `/config` las opciones de proveedor y el estado de calibración con su factor de escala.




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
