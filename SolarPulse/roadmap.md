# 🗺️ ROADMAP - SolarPulse MVP

## Fase 1: Cimientos y Motor Solar (COMPLETADA)
- [x] T1.1: Estructura de carpetas y configuración inicial de Git.
- [x] T1.2: Configuración de Base de Datos SQLite y Modelos ORM.
- [x] T1.3: Cliente API Open-Meteo (Obtener GHI, DNI, DHI, Temp con timezone America/Havana).
- [x] T1.4: Motor de Predicción PVLib (Cálculo POA, Clipping a 500W, Pérdidas 15%).
- [x] T1.4.1: Refactor motor de predicción con datos de panel real (SystemConfig, NOCT, Bifaciality).
- [x] T1.5: Endpoints FastAPI (`/api/forecast`, `/api/current-status`, `/api/manual-reading`).
- [x] T1.6: Frontend Next.js básico consumiendo el endpoint de estado.

## Fase 2: Integración EcoFlow (EN PROGRESO / MODO PREPARACIÓN)
- [ ] T2.1: Investigar y configurar conexión MQTT o API oficial de EcoFlow.
- [ ] T2.2: Script de polling para leer SoC, input_watts, output_watts cada 1 min.
- [x] T2.3: Fallback a entrada manual si la conexión falla (Formulario UI + Endpoint + Tests).
- [x] T2.4: Implementar patrón adaptador para fuentes de datos (Simulator, MQTT, REST).

## Fase 3: Dashboard y Visualización (EN PROGRESO)
- [x] T3.1: Gráfica Recharts comparando Predicción vs Realidad en tiempo real.
- [x] T3.2: Tabla de datos crudos y alertas de optimización.
- [ ] T3.3: Tarjetas de estado refinadas (Batería %, Potencia actual, Próximo pico solar).

## Fase 4: Alertas y Pulido (PENDIENTE)
- [ ] T4.1: Bot de Telegram para alertas de baja generación o batería crítica.
- [ ] T4.2: Refactorización y limpieza de código.