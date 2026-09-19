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

## Fase 3: Dashboard y Visualización (COMPLETADA)
- [x] T3.1: Gráfica predicción vs real (base)
- [x] T3.2: Tabla + alertas de optimización
- [x] T3.3: Tarjetas de estado refinadas + KPI densos + sparklines
- [x] T3.4: Power Flow animado + gauges + DaySummary + Alerts + Navbar
- [x] T3.5: Skeleton loaders + Empty states
- [x] T3.6: Histórico multi-día (UI + API con MAE y desviación)
- [x] T3.7: kWh reales diarios (API + UI con integración trapezoidal)
- [x] T3.8: Vista de Consola del Motor Solar y Cockpit Operativo en vivo
- [x] T3.9: Week Forecast Widget (7 días) + Day Chart interactivo (24h) con Brush
- [x] T3.10: Política estricta de unidades (W / Wh / kWh) en backend y frontend
- [x] T3.11: Ventana de aprovechamiento óptimo para cargas pesadas
- [x] T3.12: Widget en vivo de constantes meteorológicas (GHI/DNI/DHI/Temp)

## Fase 4: Alertas y Pulido
- [ ] T4.1 Bot Telegram (opcional)
- [ ] T4.2 Refactor y limpieza
- [ ] T4.3 MQTT EcoFlow real (cuando haya credenciales)

## Fase 5: Confiabilidad, Multi-proveedor 100% Gratis y Autocorrección (COMPLETADA)
- [x] T5.1 Resiliencia de red y logging de sincronización (`ProviderSyncLog`)
- [x] T5.2 Arquitectura multi-proveedor 100% gratis (`OpenMeteoBestMatchProvider` y `OpenMeteoIconProvider`)
- [x] T5.3 Métricas de skill (MAE, Bias) por proveedor
- [x] T5.4 Módulo de autocorrección de sesgo (`CalibrationState`, scale factor online)
- [x] T5.5 Verificación de tests unitarios y de integración (44 tests verdes)

## Fase 6: Configuración Dinámica y Consistencia Global (COMPLETADA - Sesión #14)
- [x] T6.1 Parámetros de instalación en SystemConfig: `panel_tilt`, `panel_azimuth`, `albedo`
- [x] T6.2 Recálculo automático de pronóstico al cambiar config (`PUT /api/v1/system-config`)
- [x] T6.3 Búsqueda de predicción "hora actual" en endpoints `/api/current-status` y `/api/cockpit/now`
- [x] T6.4 Pipeline pvlib dinámico con parámetros de config (tilt, azimuth, albedo, losses, inverter_limit)
- [x] T6.3 Proveedores Open-Meteo consumen config dinámica (tilt, azimuth, albedo, pmax_stc, etc.)
- [x] T6.4 Widget unificado de constantes meteorológicas en Motor Solar (GHI/DNI/DHI/Temp)
- [x] T6.5 Tarjetas de pipeline muestran valores reales hora actual (raw_dc, clipped, final_ac)
- [x] T6.6 Indicador "AHORA" dinámico en gráfico Motor Solar (ReferenceLine por hora actual)
- [x] T6.7 Dashboard limpio: gauges eliminados, tabla de datos restaurada
- [x] T6.8 Configuración persistente: tilt/azimuth/albedo se guardan, recalculan y propagan globalmente
- [x] T6.9 Tests con migración de esquema (drop_all/create_all) y seeds actualizados
- [x] T6.10 Verificación completa: 44/44 tests backend + build frontend limpio