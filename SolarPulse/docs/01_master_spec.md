# Especificación Maestra - SolarPulse MVP

## 1. Objetivo del MVP
El propósito de SolarPulse MVP es proporcionar al usuario único (fundador) un dashboard web de ejecución local y completamente gratuito para monitorizar en tiempo real el estado de carga de su estación EcoFlow Delta 3 Classic y predecir con alta precisión (utilizando modelos físicos) la generación de su panel solar de 550W instalado en una ubicación fija de Cuba (Lat: 22.407676, Lon: -79.977352). Esta herramienta tiene como fin último asistir en la toma de decisiones diarias sobre cuándo conectar consumos domésticos de alto impacto energético.

## 2. No-Objetivos (Fuera de Alcance)
*   **Soporte Multi-usuario o Autenticación:** El sistema asume acceso exclusivo en localhost; no se requiere login, roles ni seguridad multi-inquilino.
*   **Modelos de Machine Learning Avanzados:** La predicción se basará enteramente en física solar matemática a través de `pvlib`, no en entrenamiento de redes neuronales o modelos autorregresivos complejos.
*   **Tarifas Eléctricas Dinámicas:** No se modelará el costo financiero de la red eléctrica en esta fase.
*   **Aplicación Móvil Nativa:** El acceso se realizará desde el navegador web del equipo local o de dispositivos en la misma red local a través de un diseño web responsivo.

## 3. Modelo de Datos (SQLite)

El almacenamiento se gestionará en un archivo local de SQLite estructurado en tres tablas principales. La cadena de conexión de SQLAlchemy debe ser exactamente `sqlite:///./solarpulse.db` para que el archivo se cree de manera controlada y local dentro de la carpeta `backend/`.

### Tabla: `weather_forecasts`
Almacena los datos meteorológicos crudos obtenidos de la API horaria de Open-Meteo.
| Columna | Tipo SQLite | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único del registro |
| `reference_time` | TEXT | NOT NULL | Timestamp ISO8601 de cuándo se realizó la consulta |
| `forecast_time` | TEXT | NOT NULL | Timestamp ISO8601 para el que se predice el clima |
| `ghi` | REAL | NOT NULL | Radiación Global Horizontal (W/m2) |
| `dni` | REAL | NOT NULL | Radiación Directa Normal (W/m2) |
| `dhi` | REAL | NOT NULL | Radiación Difusa Horizontal (W/m2) |
| `temp_air` | REAL | NOT NULL | Temperatura ambiente simulada (ºC) |

### Tabla: `generation_forecasts`
Almacena los resultados del motor solar `pvlib` tras aplicar pérdidas y recortes físicos.
| Columna | Tipo SQLite | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único |
| `forecast_time` | TEXT | NOT NULL | Timestamp ISO8601 de la hora proyectada |
| `poa_global` | REAL | NOT NULL | Radiación total incidente en el plano del panel (W/m2) |
| `raw_dc_power` | REAL | NOT NULL | Potencia de salida teórica DC del panel de 550W (W) |
| `clipped_power` | REAL | NOT NULL | Potencia DC limitada a un máximo de 500W (W) |
| `final_ac_power` | REAL | NOT NULL | Potencia útil final considerando un 15% de pérdidas (W) |

### Tabla: `ecoflow_readings`
Almacena el historial de monitorización de la estación EcoFlow Delta 3 Classic.
| Columna | Tipo SQLite | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador de lectura |
| `timestamp` | TEXT | NOT NULL | Timestamp ISO8601 del momento de la lectura |
| `battery_soc` | INTEGER | NOT NULL | Estado de carga de la batería (Porcentaje 0-100%) |
| `input_watts` | REAL | NOT NULL | Potencia de entrada real medida (solar/red) (W) |
| `output_watts` | REAL | NOT NULL | Consumo de salida real medido (W) |
| `source` | TEXT | NOT NULL | Origen del dato (`mqtt` o `manual` en caso de fallback) |

## 4. Lógica de Negocio Clave: Motor de Predicción Solar
El cálculo de la potencia solar generada estimada para cada hora se realizará a través de un motor por lotes (script programado o bajo demanda) que ejecutará la siguiente lógica algorítmica:

1. **Consulta Open-Meteo (GHI, DNI, DHI, Temp):** Para Latitud 22.407676, Longitud -79.977352. **La consulta a Open-Meteo debe incluir obligatoriamente el parámetro `timezone=America/Havana`** para que los timestamps coincidan exactamente con la hora local del dashboard y se eviten los desfases de huso horario (UTC-5 o UTC-4 según el período estacional correspondiente a Cuba).
2. **Calcular Plane of Array (POA) con PVLib:** Utilizando Inclinación de 45º y Azimut de 180º (Sur).
3. **Calcular DC Power del panel de 550W:** Usando el POA y la temperatura ambiente del paso 1.
4. **Aplicar Clipping a Máximo 500W:** Límite máximo de la EcoFlow Delta 3 Classic (clipped_power = MIN(raw_dc_power, 500.0)).
5. **Aplicar Factor de Pérdida del 15%:** Pérdidas globales del sistema (final_ac_power = clipped_power * 0.85).

### Parámetros de Configuración del Motor:
*   **Ubicación:** Latitud `22.407676`, Longitud `-79.977352` (Cuba).
*   **Parámetros Físicos:** Inclinación (tilt) = `45.0` grados, Azimut (orientación) = `180.0` grados (Sur exacto).
*   **Características del Panel y Configuración de Inversor (Clipping Nativo en PVLib):**
    *   Potencia nominal en condiciones STC del panel = `550.0` W. Coeficiente de temperatura de la potencia = `-0.35` %/ºC.
    *   Se configurará el sistema usando `pvlib.pvsystem.PVSystem` con `module_parameters={'pdc0': 550}` y `inverter_parameters={'pdc0': 500}`. Esto permite que `pvlib` aplique la física del clipping de forma nativa y realista ante picos de radiación solar alta, manteniendo no obstante el valor de la columna `clipped_power` de forma explícita en la base de datos para facilitar tareas de auditoría técnica.
*   **Límite Crítico del Inversor (Clipping EcoFlow):** La EcoFlow Delta 3 Classic tiene un límite estricto de entrada solar de `500.0` W. Si el cálculo de la potencia DC en el paso 3 supera este valor, el algoritmo debe asegurar el truncamiento del valor a exactamente 500.0 W.
*   **Eficiencia del Sistema (Pérdidas):** Se aplica un multiplicador de pérdidas de `0.85` (que representa el 15% de pérdidas agregadas por calentamiento de celdas, suciedad, resistencia del cableado DC y la propia eficiencia de conversión del cargador solar MPPT interno de la EcoFlow).

## 5. API Contracts (Endpoints REST JSON)

### `GET /api/forecast`
Retorna las predicciones de generación solar para las próximas 48 horas.
*   **Request:** No requiere parámetros.
*   **Response (JSON):**
    ```json
    {
      "location": {
        "latitude": 22.407676,
        "longitude": -79.977352
      },
      "forecasts": [
        {
          "time": "2024-11-20T10:00:00Z",
          "poa_global": 750.4,
          "raw_dc_power": 412.5,
          "clipped_power": 412.5,
          "final_ac_power": 350.62
        },
        {
          "time": "2024-11-20T12:00:00Z",
          "poa_global": 980.2,
          "raw_dc_power": 539.1,
          "clipped_power": 500.0,
          "final_ac_power": 425.0
        }
      ]
    }
    ```

### `GET /api/current-status`
Retorna la última lectura conocida de la estación EcoFlow Delta 3 Classic junto con la predicción de generación para la hora actual.
*   **Request:** No requiere parámetros.
*   **Response (JSON):**
    ```json
    {
      "timestamp": "2024-11-20T12:05:00Z",
      "ecoflow": {
        "battery_soc": 78,
        "input_watts": 415.0,
        "output_watts": 120.0,
        "source": "mqtt",
        "status": "online"
      },
      "current_solar_prediction": {
        "time": "2024-11-20T12:00:00Z",
        "final_ac_power": 425.0
      }
    }
    ```

### `POST /api/manual-reading`
Endpoint para registrar manualmente el estado de la estación de carga si la conexión directa MQTT llegase a fallar de manera prolongada.
*   **Request (JSON):**
    ```json
    {
      "battery_soc": 80,
      "input_watts": 350.0,
      "output_watts": 50.0
    }
    ```
*   **Response (JSON):**
    ```json
    {
      "status": "success",
      "message": "Manual reading registered successfully"
    }
    ```