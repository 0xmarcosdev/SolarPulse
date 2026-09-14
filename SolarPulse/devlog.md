# 📓 DEVLOG - Registro de Sesiones de Desarrollo

## [2026-09-10] - Sesión #8: Debugging & E2E Testing of Configuration and Optimization System
- **Objetivo:** Resolver errores "Failed to fetch" / HTML en `/config`, corregir reglas de linter/tipos en frontend, sincronizar base de datos con lifespan automático y agregar tests exhaustivos.
- **Realizado:**
  - **Backend (`main.py`, `init_db.py`, `models.py`):**
    - Añadido auto-provisionamiento de `SystemConfig` en el lifespan handler de FastAPI y en endpoints `GET/PUT /api/v1/system-config`.
    - Agregado soporte CORS explícito para `http://127.0.0.1:3000` además de `http://localhost:3000`.
  - **Solar Service (`services/solar.py`):**
    - Asegurada retrocompatibilidad total con llamadas que no pasen parámetros opcionales (`inverter_limit=500.0`, `system_losses=0.15`).
    - Añadidas funciones puras para temperatura de celda por NOCT y cálculo de ganancia bifacial.
  - **Frontend (`src/app/config/page.tsx`, `src/app/optimization/page.tsx`, `src/app/page.tsx`, `src/components/StatusCard.tsx`):**
    - Implementado manejo resiliente de `API_BASE_URL` con fallback automático `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`.
    - Agregados estados de reintento, carga y feedback visual de guardado exitoso con Lucide icons.
    - Eliminados `any` y corregido el patrón React `set-state-in-effect` según recomendaciones de React 19 / Next.js.
    - Reemplazados tags `<a>` por `<Link>` de Next.js para navegación SPA instantánea sin recarga.
    - Creada la página completa de optimización técnica `/optimization` con detalles de clipping a 500W, coeficientes térmicos TOPCon (-0.29%/°C) y factor bifacial.
  - **Pruebas Automatizadas:**
    - Creado `backend/tests/test_config_api.py` (4 tests: GET, auto-init, PUT parcial, validación de rangos 422).
    - Expandido `backend/tests/test_solar.py` a 20 tests.
    - Verificados **34 tests pasando al 100%** en `pytest`.
    - Verificado `npm run lint` sin advertencias ni errores.
- **Bloqueos:** Incompatibilidad de argumentos posicionales en funciones de servicio tras desacoplar constantes; resuelto con parámetros por defecto e interfaces tipadas.
- **Próximo paso:** Integración con stream MQTT directo o polling a API EcoFlow Cloud cuando se suministren credenciales.

## [2026-09-10] - Sesión #7: Frontend Dashboard Refinement
- **Objetivo:** Construir dashboard profesional de análisis solar.
- **Realizado:**
  - Creada página `frontend/src/app/config/page.tsx` para gestión de parámetros del sistema (`GET`/`PUT` a `/api/v1/system-config`).
  - Implementada gráfica `ComposedChart` de Recharts en `frontend/src/app/page.tsx` con comparación predicción/real y línea de referencia de límite EcoFlow.
  - Añadida tabla de datos crudos colapsable.
  - Creado componente `OptimizationTips.tsx` con lógica de alertas de calor y clipping.
  - Esquema de colores: Dark mode (zinc palette) profesional.
- **Bloqueos:** Ninguno.
- **Próximo paso:** Integración final de datos reales.

## [2026-09-10] - Sesión #6: Refactor Prediction Engine for RUNERGY HY-DH144N8-585

- **Objetivo:** Preparar la Fase 2 (Integración EcoFlow) implementando simulación offline, esqueleto MQTT, tests unitarios y formulario de entrada manual en el dashboard mientras se espera la API key oficial.
- **Realizado:**
  - Creado `backend/services/ecoflow_service.py` con generación de lecturas simuladas realistas y esqueleto de cliente MQTT.
  - Actualizado `backend/config.py` con `ecoflow_simulation_mode`.
  - Creado `backend/tests/test_ecoflow.py` (2 nuevos tests, total 25 tests pasando OK).
  - Actualizado `frontend/src/components/StatusCard.tsx` con formulario desplegable de **Entrada Manual (T2.3)** para registrar SoC, potencia de entrada y salida con `source: "manual"`.
  - Actualizado `ROADMAP.md` marcando T2.3 como completada (en modo preparación).
- **Bloqueos:** Ninguno.
- **Próximo paso:** Integración final MQTT/Cloud cuando llegue la EcoFlow API Key.

## [2026-09-07] - Sesión #3: Open-Meteo Client & Next.js Frontend Status Dashboard (Phase 1 Complete)
- **Objetivo:** Implementar cliente Open-Meteo (T1.3) con timezone America/Havana, endpoint POST `/api/forecast/fetch`, y UI frontend Next.js (T1.6) consumiendo `/api/current-status`.
- **Realizado:**
  - Creado `backend/services/openmeteo_service.py` para consultar Open-Meteo API (GHI, DNI, DHI, Temp) con lat/lon de Cuba y timezone `America/Havana`.
  - Agregado endpoint FastAPI `POST /api/forecast/fetch` para actualizar y persistir pronósticos en SQLite.
  - Actualizado `frontend/src/components/StatusCard.tsx` con componentes React interactivos conectados a `/api/current-status` y botón de sincronización Open-Meteo.
  - Verificada ejecución exitosa de los 23 tests de backend (`pytest`).
  - Completadas todas las tareas de la **Fase 1**.
- **Bloqueos:** Ninguno.
- **Próximo paso:** Fase 2 - Integración EcoFlow (MQTT / API / Polling).

## [2026-09-07] - Sesión #2: Backend Core - Solar Logic, Schemas, Tests & Config
- **Objetivo:** Implementar lógica de negocio solar (clipping 500W + pérdidas 15%), motor PVLib, schemas Pydantic, migración a DateTime con índices, endpoints tipados, config .env, y tests unitarios.
- **Realizado:** 
  - Creado `backend/services/solar.py` con funciones puras `apply_clipping`, `apply_losses`, `calculate_final_ac_power` + edge cases (None, NaN, negativos → 0.0).
  - Creado `backend/services/pvlib_service.py` con cálculo POA, posición solar, potencia DC, forecast series (separado de clipping).
  - Creado `backend/schemas.py` con modelos Pydantic para WeatherForecast, GenerationForecast, EcoFlowReading (request/response).
  - Migrado `backend/models.py`: timestamps a `DateTime(timezone=True)` + índices en forecast_time/timestamp.
  - Actualizado `backend/main.py`: endpoints CRUD tipados con `response_model`, lifespan para init DB.
  - Agregado `pytest`, `httpx`, `pydantic-settings`, `python-dotenv` a `requirements.txt`.
  - Creados tests: `backend/tests/test_solar.py` (12 tests), `backend/tests/test_pvlib.py` (11 tests) — 23 passed.
  - Creado `backend/config.py` (Settings con pydantic-settings) y `.env.example`.
  - Inicializada DB con nuevo esquema (`init_db.py` OK).
- **Bloqueos:** Timeout instalando pvlib/pandas (red); resuelto instalando en pasos.
- **Próximo paso:** T1.3 - Cliente Open-Meteo con timezone America/Havana.

## [YYYY-MM-DD] - Sesión #1: Setup Inicial y Migración a UV
- **Objetivo:** Configurar entorno, crear DB y migrar de pip a uv.
- **Realizado:** 
  - Creados AGENTS.md, ROADMAP.md, README.md.
  - Eliminada carpeta `venv` antigua.
  - Inicializado entorno con `uv`.
  - Instaladas dependencias de backend y frontend.
  - Verificada creación de `solarpulse.db`.
- **Bloqueos:** Ninguno.
- **Próximo paso:** Implementar T1.3 (Cliente Open-Meteo).