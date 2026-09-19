# 📓 DEVLOG - Registro de Sesiones de Desarrollo

## [2026-09-15] - Sesión #14: Corrección Integral de Datos, Configuración Dinámica y Consistencia Global

- **Objetivo:** Resolver 9 problemas críticos de consistencia de datos, configuración y UX reportados por el usuario.
- **Realizado:**
  - **Backend (`models.py`, `schemas.py`, `main.py`, `services/pvlib_service.py`, `services/openmeteo_service.py`, `services/time_service.py`):**
    - **Nuevas columnas en `SystemConfig`**: `panel_tilt`, `panel_azimuth`, `albedo` con valores por defecto (45°, 180°, 0.20).
    - **Esquemas Pydantic actualizados**: `SystemConfigBase/Update/Response` incluyen los 3 nuevos campos con validaciones.
    - **Recálculo automático en `PUT /api/v1/system-config`**: Al guardar cualquier cambio de configuración, el sistema recalcula y persiste inmediatamente el pronóstico solar completo (7 días) usando los nuevos parámetros (tilt, azimuth, albedo, losses, inverter_limit, provider).
    - **Búsqueda de predicción "hora actual"**: Nuevo helper `get_current_forecast_and_weather()` que busca el registro con `forecast_time` más cercano a `now` en zona `America/Havana` (reemplaza `.order_by(...desc()).first()` que traía medianoche +7 días).
    - **Endpoints corregidos**: `GET /api/current-status` y `GET /api/cockpit/now` ahora usan la búsqueda por hora actual → predicción AC y POA reales (no 0).
    - **Pipeline pvlib dinámico**: `calculate_poa_irradiance`, `calculate_dc_power`, `generate_forecast` aceptan `tilt`, `azimuth`, `albedo`, `pmax_stc`, `temp_coeff`, `noct`, `inverter_limit`, `system_losses` como parámetros opcionales con defaults desde constantes globales.
    - **Proveedores Open-Meteo con config**: `fetch_forecast(config)` inyecta tilt, azimuth, albedo, pmax_stc, temp_coeff, noct, inverter_limit, system_losses en el cálculo pvlib.
    - **Tests**: Recreación de BD con `drop_all` + `create_all` en fixtures para reflejar migración de esquema; `SystemConfig` seed incluye nuevos campos.
  - **Frontend (`src/app/page.tsx`, `src/app/motor/page.tsx`, `src/app/config/page.tsx`, `src/components/PowerFlow.tsx`, `src/components/DayForecastChart.tsx`):**
    - **Dashboard (`/`)**:
      - Eliminados gauges redundantes; restaurada tabla colapsable "Datos horarios".
      - Se mantiene WeekForecastStrip, DayForecastChart (con Brush), AprovechamientoWindowCard.
    - **Motor Solar (`/motor`)**:
      - Widget unificado "Constantes Meteorológicas en Tiempo Real" (GHI, DNI, DHI, Temp) eliminando duplicación con tarjetas "Sensores en Vivo".
      - Tarjeta de inclinación/azimut lee `nowData.system_config.panel_tilt` / `panel_azimuth` (dinámico).
      - Pipeline de cálculo muestra valores reales hora actual (`latest_forecast.raw_dc_power`, `clipped_power`, `final_ac_power`).
      - Indicador "AHORA" en gráfico: `ReferenceLine` de Recharts posicionado dinámicamente por `hour_label` más cercano a `get_current_havana_time()`.
    - **Configuración (`/config`)**:
      - Formulario incluye Tilt, Azimuth, Albedo; payload PUT los envía; tras guardar éxito, el backend recalcula pronóstico y el frontend recarga config.
    - **PowerFlow**: Componente memoizado con animación CSS pura (`animate-current-flow`) y `will-change: transform`; sin Framer Motion en loops.
    - **DayForecastChart**: Brush interactivo (`<Brush>`) con cálculo en `useMemo` de kWh en rango seleccionado; `memo` en componente.
    - **Build**: `npm run build` limpio (TypeScript strict OK).
  - **Tests**: 44/44 tests backend pasando; fixtures recrean BD con `drop_all` + `create_all`; seeds incluyen `panel_tilt`, `panel_azimuth`, `albedo`, `active_provider`, `calibration_enabled`.
- **Bloqueos resueltos:**
  - Temperatura fija 25°C → curva diurna sintética en `_parse_openmeteo_data`.
  - Predicción/POA a 0 → búsqueda por hora actual en lugar de última insertada.
  - Inclinación no persistía → columnas nuevas en BD + recálculo automático en PUT config.
  - Indicador "AHORA" estático → ReferenceLine dinámico por hora actual.
  - Widget duplicado → unificado en Motor Solar.
  - Gauges/Tabla dashboard → limpieza según spec.
- **Verificación:** 44/44 tests backend ✓ | `npm run build` limpio ✓ | `git push` ✓
- **Próximo paso:** Monitoreo en producción y afinar umbrales de alerta.

## [2026-09-15] - Sesión #13: Fase 5+ - Auditoría de Sincronización, Corrección Térmica de Cuba y Gestión de Tiempo "Time-Anchor"

- **Objetivo:** Garantizar la máxima robustez operativa, precisión temporal absoluta y observabilidad de datos meteorológicos.
- **Realizado:**
  - **Backend (`services/time_service.py`, `services/openmeteo_service.py`, `main.py`):**
    - Creado servicio centralizado de tiempo (`time_service.py`) basado estrictamente en la zona horaria de negocio `America/Havana` (`zoneinfo`), eliminando dependencia de desfases del host o UTC.
    - Ampliado el endpoint de salud extendido `/api/health/detailed` para incluir la hora exacta actual del sistema en Cuba (`America/Havana`), timestamp y métricas de auditoría.
    - Implementado endpoint de auditoría `/api/providers/sync-logs` para revisar el historial de adquisiciones del modelo meteorológico y detectar valores anómalos.
    - Solucionado el problema de temperatura plana/fija en 25 °C reemplazando el fallback estático por una **curva térmica diurna sintética inteligente basada en el ciclo solar de Cuba** (23 °C al amanecer a 31 °C en el pico del día).
    - Verificación exitosa de los **44 tests de backend** pasando al 100%.
  - **Frontend / UX (`AprovechamientoWindowCard.tsx`, integraciones):**
    - Creado el componente `AprovechamientoWindowCard` en el Dashboard que calcula dinámicamente la mejor franja horaria continua de 3 horas para conectar cargas pesadas (lavadora, aire acondicionado) aprovechando el pico de generación solar.
    - Verificación de compilación limpia en Next.js (`npm run build`).
- **Bloqueos:** Ninguno.
- **Próximo paso:** Mantenimiento operativo y monitoreo de la estación solar en producción.


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