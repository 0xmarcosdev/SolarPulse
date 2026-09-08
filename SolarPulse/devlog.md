# 📓 DEVLOG - Registro de Sesiones de Desarrollo

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