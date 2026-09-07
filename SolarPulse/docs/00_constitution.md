# Constitución del Proyecto - SolarPulse MVP

## 1. Principios de Diseño
El desarrollo de SolarPulse se rige bajo tres pilares fundamentales que garantizan un desarrollo ágil, mantenible y libre de sobrediseño tecnológico:
*   **KISS (Keep It Simple, Stupid):** Evitar la introducción de abstracciones innecesarias, patrones de diseño complejos o arquitecturas distribuidas (microservicios). Todo el sistema se compone de un monolito backend ligero (FastAPI) y un frontend unificado (Next.js) corriendo localmente en la misma máquina.
*   **Local-first:** Toda la computación, el almacenamiento y la visualización ocurren localmente en la máquina Windows del usuario. No se depende de bases de datos cloud, sistemas de autenticación externos o infraestructura de terceros que requiera suscripciones o conexión obligatoria a internet para el núcleo del sistema (salvo para la consulta horaria del pronóstico de Open-Meteo).
*   **Type-safe:** Garantizar la coherencia y robustez de los datos en toda la pila tecnológica mediante tipado estricto en el frontend (TypeScript) y validación rígida de datos mediante esquemas en el backend (Pydantic / SQLAlchemy).

## 2. Reglas de Uso de IA (Cursor / LLMs)
El desarrollo asistido por IA debe seguir directrices estrictas para evitar la corrupción de código o la pérdida de control sobre la base del código:
*   **Confirmación explícita:** La IA nunca debe borrar, renombrar o reestructurar archivos existentes sin antes explicar el impacto y pedir la confirmación explícita del desarrollador.
*   **Ámbito delimitado:** Al solicitar una edición, la IA debe especificar detalladamente qué líneas o bloques se modifican (proporcionando el fragmento antes/después exacto) en lugar de rescribir archivos enteros de forma ciega.
*   **No alucinar dependencias:** No se permite agregar nuevas librerías al archivo `requirements.txt` o `package.json` sin justificación técnica y validación de que son herramientas gratuitas y compatibles con la ejecución local.
*   **Explicabilidad:** Todo código generado por la IA debe estar debidamente documentado con comentarios concisos explicando la lógica técnica aplicada (por ejemplo, el cálculo del ángulo solar o el clipping).

## 3. Stack Tecnológico

### Stack Aprobado
*   **Backend:** Python 3.11+
*   **Framework API:** FastAPI (con ASGI Uvicorn)
*   **ORM / Base de Datos:** SQLAlchemy con SQLite (archivo local `solarpulse.db`)
*   **Cálculo Solar:** `pvlib`, `pandas`
*   **API del Clima:** `openmeteo-requests`
*   **Protocolo de Monitoreo:** `paho-mqtt` (comunicación directa con EcoFlow)
*   **Frontend:** Next.js 14+ (App Router)
*   **Tipado Frontend:** TypeScript (Modo Estricto)
*   **Diseño Interfaz:** Tailwind CSS
*   **Librería Gráfica:** Recharts

### Stack Prohibido
*   **Contenedores / Orquestación:** Docker, Docker Compose, Kubernetes (introducen complejidad innecesaria para ejecución local).
*   **Bases de Datos Robustas:** PostgreSQL, MySQL, Redis (SQLite es más que suficiente para un usuario único).
*   **Frameworks Backend Alternativos:** Django o Flask (FastAPI ofrece asincronía nativa ideal para MQTT/polling y autogeneración de OpenAPI).
*   **Herramientas Cloud Propietarias:** AWS SDK, Firebase, Vercel Postgres (deben evitarse para cumplir con el principio Local-first).

## 4. Manejo de Errores y Robustez
El sistema debe comportarse de forma predecible y tolerante a fallos, asumiendo un entorno físico e inalámbrico inestable:
*   **EcoFlow Offline:** Si la estación de carga no responde al protocolo MQTT (por apagado o desconexión WiFi), el backend no debe colapsar. Debe capturar la excepción, loguear el error y retornar el último estado conocido guardado en la base de datos o valores `null` con un indicador visual de "Desconectado" en el frontend.
*   **Caída del Proveedor de Clima (Open-Meteo):** En caso de fallo de red al consultar el pronóstico, el motor solar debe reutilizar el último pronóstico almacenado con éxito en SQLite para el día en curso, asegurando que el dashboard siga operativo.
*   **Errores del Frontend:** Se implementarán Error Boundaries de React para evitar que un fallo de renderizado en un componente de Recharts rompa toda la experiencia de usuario de la página.