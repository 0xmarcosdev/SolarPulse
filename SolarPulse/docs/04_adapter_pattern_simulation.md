# SPEC: Patrón Adaptador y Simulación de Datos (EcoFlow)

## Objetivo

Desacoplar la adquisición de datos de la lógica de negocio. Implementar un simulador determinista para desarrollar y probar el backend, la base de datos y la API sin depender de la conexión real con EcoFlow, preparando el terreno para integrar MQTT o REST en el futuro con un cambio mínimo de código.

## Reglas Críticas

1. **Contrato Estricto**: Toda fuente de datos (Simulador, MQTT, REST) DEBE implementar el protocolo `StationAdapter` y devolver exclusivamente el modelo `SolarReading`.
2. **Determinismo**: El simulador debe usar una semilla (seed) fija para que las pruebas sean reproducibles.
3. **Configuración por Entorno**: La selección del adaptador se hará ÚNICAMENTE mediante la variable de entorno `DATA_SOURCE` (valores: `simulator`, `mqtt`, `rest`).
4. **No Bloqueo**: La recolección de datos debe ejecutarse en una tarea en segundo plano (background task) usando el `lifespan` de FastAPI, nunca bloqueando las peticiones HTTP.

## 1. Modelo de Datos Normalizado (`app/models.py`)

```python
from datetime import datetime
from pydantic import BaseModel, Field

class SolarReading(BaseModel):
    timestamp: datetime
    serial_number: str
    soc_percent: float | None = Field(default=None, ge=0, le=100)
    solar_input_w: float | None = Field(default=None, ge=0)
    ac_output_w: float | None = Field(default=None, ge=0)
    dc_output_w: float | None = Field(default=None, ge=0)
    source: str  # "simulator", "mqtt", "rest"
    raw: dict | None = None  # Para depuración futura

## 2. Interfaz del Adaptador (app/adapters/base.py)

```python
from typing import Protocol
from app.models import SolarReading

class StationAdapter(Protocol):
    async def start(self) -> None: ...
    async def stop(self) -> None: ...
    async def latest(self) -> SolarReading | None: ...
```

## 3. Estructura de Carpetas Requerida

```text
backend/
├── app/
│   ├── main.py
│   ├── models.py          # Pydantic + SQLAlchemy
│   ├── database.py        # Setup SQLite
│   ├── collector.py       # Tarea en segundo plano (lifespan)
│   └── adapters/
│       ├── base.py        # Protocol StationAdapter
│       ├── simulator.py   # Implementación del simulador
│       ├── mqtt.py        # Placeholder (raise NotImplementedError por ahora)
│       └── factory.py     # Lógica de selección por DATA_SOURCE
├── tests/
│   └── test_simulator.py
├── .env
└── requirements.txt
```

## 4. Comportamiento del Simulador (app/adapters/simulator.py)

- Debe simular un ciclo solar básico: baja entrada por la mañana, pico al mediodía (~500W, respetando el límite de la Delta 3), caída por la tarde.
- El SOC debe fluctuar ligeramente basado en la diferencia entre solar_input_w y ac_output_w.
- Debe aceptar un parámetro seed para reproducibilidad en tests.

## 5. Factory (app/adapters/factory.py)

- Lee DATA_SOURCE de os.getenv.
- Si es simulator, devuelve SimulatorAdapter.
- Si es mqtt, devuelve MqttAdapter (que por ahora puede lanzar una advertencia de que falta configuración, pero no debe romper la app).

---

### PASO 2: Prompts para OpenCode (Fase por Fase)

No le des todo a OpenCode de una vez. Usa estos prompts en orden. Si usas una herramienta como Cursor Composer o OpenCode con capacidad de editar múltiples archivos, funcionará de maravilla.

#### 🟢 FASE 1: Cimientos y Modelo de Datos

*Copia y pega esto en OpenCode:*

```text
@docs/04_adapter_pattern_simulation.md 
@docs/00_constitution.md

Actúa como un Arquitecto de Software Senior en Python. Vamos a implementar la Fase 1 del patrón adaptador.

Tareas:
1. Actualiza o crea `backend/app/models.py` con el modelo Pydantic `SolarReading` y su equivalente en SQLAlchemy para guardar en SQLite (tabla `readings`).
2. Crea `backend/app/adapters/base.py` con el `Protocol` `StationAdapter`.
3. Crea `backend/app/database.py` con la configuración básica de SQLAlchemy para SQLite (`sqlite:///./solar_pulse.db`).
4. Asegúrate de que `backend/requirements.txt` incluya: `fastapi`, `uvicorn`, `pydantic`, `sqlalchemy`, `python-dotenv`, `pytest`, `pytest-asyncio`.

Reglas:
- Usa type hints estrictos.
- No implementes la lógica del adaptador aún, solo las interfaces y modelos.
- Confirma qué archivos creaste o modificaste.