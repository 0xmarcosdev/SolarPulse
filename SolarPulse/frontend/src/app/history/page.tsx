/**
 * Página de Histórico – Análisis multi-día de predicción vs generación real.
 *
 * Permite seleccionar el rango de días (1, 3, 7, 30 días) y muestra:
 * - KPIs acumulados (kWh predichos, kWh reales, cumplimiento %, pico max W).
 * - Gráfico de barras/áreas de kWh diarios.
 * - Gráfico de series temporales de potencia (W).
 * - Tabla desglosada por día con estados de carga y vacío.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar, TrendingUp, Sun, Zap, RefreshCw } from "lucide-react";
import {
  ComposedChart,
  BarChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DailyEnergyItem {
  date: string;
  predicted_kwh: number;
  actual_kwh: number;
  sample_count: number;
  sample_count_forecast: number;
  sample_count_actual: number;
  peak_predicted_watts: number;
  peak_actual_watts: number;
  coverage_ratio: number;
}

interface GenerationForecastItem {
  id: number;
  forecast_time: string;
  poa_global: number;
  raw_dc_power: number;
  clipped_power: number;
  final_ac_power: number;
}

interface EcoFlowReadingItem {
  id: number;
  timestamp: string;
  battery_soc: number;
  input_watts: number;
  output_watts: number;
  source: string;
}

interface HourlyMergedPoint {
  timeLabel: string;
  predictionW: number;
  actualW: number;
}

export default function HistoryPage() {
  const [days, setDays] = useState<number>(7);
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergyItem[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationForecastItem[]>([]);
  const [ecoflowHistory, setEcoflowHistory] = useState<EcoFlowReadingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (selectedDays: number) => {
    setLoading(true);
    setError(null);
    try {
      const [resDaily, resGen, resEco] = await Promise.all([
        fetch(`${API_URL}/api/energy/daily?days=${selectedDays}`),
        fetch(`${API_URL}/api/history/generation?days=${selectedDays}`),
        fetch(`${API_URL}/api/history/ecoflow?days=${selectedDays}`),
      ]);

      if (!resDaily.ok || !resGen.ok || !resEco.ok) {
        throw new Error("Error al obtener los datos del historial");
      }

      const dailyJson: DailyEnergyItem[] = await resDaily.json();
      const genJson: GenerationForecastItem[] = await resGen.json();
      const ecoJson: EcoFlowReadingItem[] = await resEco.json();

      setDailyEnergy(dailyJson);
      setGenerationHistory(genJson);
      setEcoflowHistory(ecoJson);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(days);
  }, [days, fetchData]);

  // ---------- Totales acumulados ----------
  const totalPredictedKwh = dailyEnergy.reduce((sum, d) => sum + d.predicted_kwh, 0);
  const totalActualKwh = dailyEnergy.reduce((sum, d) => sum + d.actual_kwh, 0);
  const totalCompliance =
    totalPredictedKwh > 0 ? Math.round((totalActualKwh / totalPredictedKwh) * 100) : 0;
  const maxPeakWatts = Math.max(
    0,
    ...dailyEnergy.map((d) => Math.max(d.peak_predicted_watts, d.peak_actual_watts))
  );

  // ---------- Fusión de series para gráfico de potencia W ----------
  const hourlyPoints: HourlyMergedPoint[] = (() => {
    const map = new Map<string, { pred: number; act: number }>();

    generationHistory.forEach((g) => {
      const dt = new Date(g.forecast_time);
      const label = dt.toLocaleString([], {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const existing = map.get(label) || { pred: 0, act: 0 };
      map.set(label, { ...existing, pred: g.final_ac_power });
    });

    ecoflowHistory.forEach((e) => {
      const dt = new Date(e.timestamp);
      const label = dt.toLocaleString([], {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const existing = map.get(label) || { pred: 0, act: 0 };
      map.set(label, { ...existing, act: e.input_watts });
    });

    return Array.from(map.entries()).map(([timeLabel, val]) => ({
      timeLabel,
      predictionW: Math.round(val.pred),
      actualW: Math.round(val.act),
    }));
  })();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
        {/* Cabecera + Selector de rango */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">Histórico de Generación</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Compara energía estimada (kWh) vs producción real medida por EcoFlow.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
            {[1, 3, 7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  days === d
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                {d === 1 ? "24 horas" : `${d} días`}
              </button>
            ))}
            <button
              onClick={() => void fetchData(days)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 transition-colors ml-1"
              title="Recargar datos"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-zinc-400">Predicción Total</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-sky-400">
              {totalPredictedKwh.toFixed(2)} <span className="text-xs font-medium text-zinc-500">kWh</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Últimos {days} días</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-400">Generación Real</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-emerald-400">
              {totalActualKwh.toFixed(2)} <span className="text-xs font-medium text-zinc-500">kWh</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Integración trapezoidal</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-zinc-400">Cumplimiento</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-amber-400">
              {totalCompliance}%
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Real / Predicho</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-zinc-400">Pico Máximo</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-violet-400">
              {Math.round(maxPeakWatts)} <span className="text-xs font-medium text-zinc-500">W</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Límite EcoFlow: 500 W</p>
          </div>
        </div>

        {/* Gráfico 1: kWh diarios acumulados */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Energía Diaria (kWh)
              </h2>
              <p className="text-xs text-zinc-500">
                Comparativa diaria de energía integrada
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400">
              {dailyEnergy.length} días registrados
            </span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-52 w-full rounded-xl" />
            </div>
          ) : dailyEnergy.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Sin datos de energía diaria"
              description={`No hay registros suficientes en los últimos ${days} días para calcular la energía acumulada.`}
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyEnergy} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="predicted_kwh" fill="#38bdf8" name="Predicho (kWh)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual_kwh" fill="#34d399" name="Real (kWh)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gráfico 2: Curva de potencia horaria (W) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Perfil de Potencia Solar (W)
              </h2>
              <p className="text-xs text-zinc-500">
                Serie temporal con clipping a 500 W aplicado
              </p>
            </div>
            <span className="text-[11px] text-rose-400 font-medium">Límite 500 W</span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-52 w-full rounded-xl" />
            </div>
          ) : hourlyPoints.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="Sin series temporales"
              description="Sincroniza el pronóstico o registra lecturas para ver la curva de potencia."
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hourlyPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="timeLabel" stroke="#52525b" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="predictionW"
                    fill="#38bdf8"
                    stroke="#38bdf8"
                    fillOpacity={0.12}
                    name="Predicción AC (W)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualW"
                    stroke="#34d399"
                    strokeWidth={2}
                    name="EcoFlow Real (W)"
                    dot={false}
                  />
                  <ReferenceLine
                    y={500}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{
                      value: "500 W Límite",
                      fill: "#f43f5e",
                      fontSize: 11,
                      position: "insideTopRight",
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tabla Desglosada */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-200">
              Desglose Diario
            </h3>
          </div>

          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ) : dailyEnergy.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              Sin datos para mostrar en la tabla.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-zinc-300">
                <thead>
                  <tr className="bg-zinc-950/60 text-zinc-400">
                    <th className="px-4 py-3 text-left font-medium">Fecha</th>
                    <th className="px-4 py-3 text-right font-medium">Predicho (kWh)</th>
                    <th className="px-4 py-3 text-right font-medium">Real (kWh)</th>
                    <th className="px-4 py-3 text-right font-medium">Cumplimiento</th>
                    <th className="px-4 py-3 text-right font-medium">Pico Pred. (W)</th>
                    <th className="px-4 py-3 text-right font-medium">Pico Real (W)</th>
                    <th className="px-4 py-3 text-right font-medium">Muestras</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {dailyEnergy.map((row) => {
                    const comp =
                      row.predicted_kwh > 0
                        ? Math.round((row.actual_kwh / row.predicted_kwh) * 100)
                        : 0;

                    return (
                      <tr key={row.date} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-zinc-200">{row.date}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-sky-400">
                          {row.predicted_kwh.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">
                          {row.actual_kwh.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              comp >= 90
                                ? "bg-emerald-500/10 text-emerald-400"
                                : comp >= 60
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {comp}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                          {Math.round(row.peak_predicted_watts)} W
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                          {Math.round(row.peak_actual_watts)} W
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-zinc-500">
                          {row.sample_count} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}