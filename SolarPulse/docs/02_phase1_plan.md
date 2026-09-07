# Plan de Ejecución de la Fase 1 - SolarPulse MVP

Este plan describe un enfoque atómico y paso a paso para sentar las bases del sistema y poner en marcha el motor de predicción solar. Cada tarea está diseñada para durar entre 1 y 2 horas.

## Checklist de Tareas

- [ ] **Tarea 1: Inicialización del Repositorio y Entorno Local**
  - [ ] Crear estructura de directorios básica en la raíz del espacio de trabajo (`backend/`, `frontend/`, `docs/`).
  - [ ] Crear el repositorio Git e inicializar archivos `.gitignore` separados para Python y Node.js.
  - [ ] En la carpeta `backend/`, crear un entorno virtual de Python (`python -m venv venv`) y activarlo.
  - [ ] Instalar dependencias iniciales del backend mediante pip: `fastapi`, `uvicorn`, `sqlalchemy`, `pvlib`, `pandas`, `openmeteo-requests`, `paho-mqtt`.
  - [ ] Guardar las dependencias instaladas en `backend/requirements.txt`.

- [ ] **Tarea 2: Configuración de Base de Datos SQLite y Modelos ORM**
  - [ ] Crear el archivo de configuración de base de datos `backend/database.py` asegurando usar exactamente la cadena de conexión `sqlite:///./solarpulse.db` para inicializarse correctamente bajo la raíz del directorio backend utilizando SQLAlchemy.
  - [ ] Configurar SQLite con soporte para multi-threading (`check_same_thread=False` en la cadena de conexión).
  - [ ] Definir los modelos de SQLAlchemy mapeados a las tablas de la especificación: `WeatherForecast`, `GenerationForecast`, y `EcoFlowReading` en `backend/models.py`.
  - [ ] Crear un script de inicialización `backend/init_db.py` para generar las tablas físicas en el archivo local `solarpulse.db`.

- [ ] **Tarea 3: Cliente de la API de Clima (Open-Meteo)**
  - [ ] Crear un archivo `backend/weather_client.py`.
  - [ ] Implementar la función de llamada HTTP al endpoint de pronóstico por horas de Open-Meteo incluyendo obligatoriamente el parámetro de zona horaria `timezone=America/Havana` y filtrando por las coordenadas exactas de la estación (Lat: `22.407676`, Lon: `-79.977352`).
  - [ ] Solicitar específicamente las variables meteorológicas requeridas por `pvlib`: GHI (Global Horizontal Irradiance), DNI (Direct Normal Irradiance), DHI (Diffuse Horizontal Irradiance) y Temperatura de Aire a 2 metros.
  - [ ] Diseñar el mapeo de la respuesta JSON cruda de Open-Meteo y persistir los registros resultantes en la tabla `weather_forecasts` de SQLite.

- [ ] **Tarea 4: Motor de Predicción Solar con PVLib (Solar Engine)**
  - [ ] Crear el módulo `backend/solar_engine.py`.
  - [ ] Configurar un objeto de geolocalización de `pvlib` y definir el sistema fotovoltaico (inclinación: 45°, azimut: 180°, potencia panel: 550W).
  - [ ] Implementar la lógica matemática para transformar la radiación GHI/DNI/DHI a radiación sobre el plano inclinado (POA).
  - [ ] Calcular la potencia nominal de salida DC estimada en base al POA y el impacto de la temperatura ambiente.
  - [ ] **Configurar el clipping nativo en PVLib:** Instanciar `pvlib.pvsystem.PVSystem` con `module_parameters={'pdc0': 550}` e `inverter_parameters={'pdc0': 500}` para que el clipping se resuelva de forma física y nativa, guardando explícitamente tanto `raw_dc_power` como `clipped_power` a 500.0W máximos en la BD para auditoría. `power = min(raw_dc, 500.0)`.
  - [ ] Aplicar la penalización de pérdida por eficiencia global del sistema del 15% (`final_power = power * 0.85`).
  - [ ] Guardar los resultados en la tabla `generation_forecasts`.

- [ ] **Tarea 5: Exposición de Endpoints en FastAPI**
  - [ ] Inicializar la aplicación FastAPI en `backend/main.py`.
  - [ ] Configurar middleware de CORS para permitir peticiones procedentes de `http://localhost:3000`.
  - [ ] Implementar el endpoint `GET /api/forecast` que consulte y entregue en formato estructurado los resultados de predicción guardados de las próximas 48 horas.
  - [ ] Implementar el endpoint `GET /api/current-status` que retorne el estado actual de generación combinando la predicción horaria actual y el último registro de la EcoFlow.
  - [ ] Implementar el endpoint de emergencia `POST /api/manual-reading` para escritura manual del SOC de batería e inputs/outputs de la EcoFlow.

- [ ] **Tarea 6: Inicialización del Frontend en Next.js y Conexión de Red**
  - [ ] Crear la base del frontend utilizando `create-next-app` con TypeScript, Tailwind CSS y App Router en la carpeta `frontend/`.
  - [ ] Instalar la librería gráfica `recharts` para visualización de series temporales.
  - [ ] Configurar variables de entorno apuntando a la dirección del backend local (`NEXT_PUBLIC_API_URL=http://localhost:8000`).
  - [ ] Implementar un componente básico de React que consuma mediante fetch el endpoint `GET /api/current-status` y lo renderice en una interfaz preliminar para validar el puente de datos frontend-backend.
