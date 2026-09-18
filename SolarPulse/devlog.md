# 📓 DEVLOG - Registro de Sesiones de Desarrollo

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
