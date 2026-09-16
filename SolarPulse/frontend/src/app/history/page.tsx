/**
 * Página de Histórico – Análisis de desempeño de la predicción.
 * 
 * Enfocada en responder: ¿Qué tan bueno es el modelo? ¿Por qué falló?
 * Incluye métricas de error (MAE), contexto meteorológico y calidad de datos.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { 
  Calendar, TrendingUp, Sun, Zap, RefreshCw, 
  AlertCircle, BarChart3, CloudSun, Target
} from "lucide-react";
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
  Cell,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Interfaces ---

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

interface WeatherHistoryItem {
  forecast_time: string;
  temp_air: number;
  ghi: number;
}

interface GenerationForecastItem {
  forecast_time: string;
  final_ac_power: number;
}

interface EcoFlowReadingItem {
  timestamp: string;
  input_watts: number;
}

interface HourlyMergedPoint {
  timeLabel: string;
  predictionW: number;
  actualW: number | null;
  errorW: number | null;
}

export default function HistoryPage() {
  const [days, setDays] = useState<number>(7);
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergyItem[]>([]);
  const [weatherHistory, setWeatherHistory] = useState<WeatherHistoryItem[]>([]);
  const [genHistory, setGenHistory] = useState<GenerationForecastItem[]>([]);
  const [ecoHistory, setEcoHistory] = useState<EcoFlowReadingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async (selectedDays: number) => {
    setLoading(true);
    try {
      const [resDaily, resWx, resGen, resEco] = await Promise.all([
        fetch(`${API_URL}/api/energy/daily?days=${selectedDays}`),
        fetch(`${API_URL}/api/history/weather?days=${selectedDays}`),
        fetch(`${API_URL}/api/history/generation?days=${selectedDays}`),
        fetch(`${API_URL}/api/history/ecoflow?days=${selectedDays}`),
      ]);

      if (resDaily.ok) setDailyEnergy(await resDaily.json());
      if (resWx.ok) setWeatherHistory(await resWx.json());
      if (resGen.ok) setGenHistory(await resGen.json());
      if (resEco.ok) setEcoHistory(await resEco.json());
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(days);
  }, [days, fetchData]);

  // ---------- Cálculos de Desempeño ----------
  
  const daysWithData = dailyEnergy.filter(d => d.actual_kwh > 0 && d.predicted_kwh > 0);
  const totalMAE = daysWithData.length > 0 
    ? (daysWithData.reduce((sum, d) => sum + Math.abs(d.actual_kwh - d.predicted_kwh), 0) / daysWithData.length).toFixed(3)
    : "—";

  const totalCompliance = dailyEnergy.reduce((sum, d) => sum + d.actual_kwh, 0) / 
                          (dailyEnergy.reduce((sum, d) => sum + d.predicted_kwh, 0) || 1);

  const avgTemp = weatherHistory.length > 0
    ? (weatherHistory.reduce((sum, w) => sum + w.temp_air, 0) / weatherHistory.length).toFixed(1)
    : "—";

  // ---------- Fusión de series horarias ----------
  const hourlyPoints: HourlyMergedPoint[] = (() => {
    const map = new Map<string, { pred: number; act: number | null }>();
    
    // Usar buckets de 1 hora
    genHistory.forEach(g => {
      const d = new Date(g.forecast_time);
      d.setMinutes(0, 0, 0);
      const key = d.toISOString();
      map.set(key, { pred: g.final_ac_power, act: null });
    });

    ecoHistory.forEach(e => {
      const d = new Date(e.timestamp);
      d.setMinutes(0, 0, 0);
      const key = d.toISOString();
      const existing = map.get(key);
      if (existing) {
        existing.act = e.input_watts;
      } else {
        map.set(key, { pred: 0, act: e.input_watts });
      }
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => {
        const dt = new Date(key);
        return {
          timeLabel: dt.toLocaleDateString([], { day: 'numeric', month: 'short' }) + " " + dt.getHours() + ":00",
          predictionW: Math.round(val.pred),
          actualW: val.act !== null ? Math.round(val.act) : null,
          errorW: val.act !== null ? Math.round(val.act - val.pred) : null
        };
      });
  })();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
        
        {/* Header Narrativo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <Target className="h-5 w-5 text-sky-400" />
              </div>
              <h1 className="text-xl font-black text-zinc-100">Desempeño de Predicción</h1>
            </div>
            <p className="text-xs text-zinc-500 max-w-lg">
              Analiza la precisión del modelo <b>pvlib_v1</b> comparando la integración de energía (kWh) con las lecturas reales del sensor.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 self-start md:self-auto">
            {[1, 3, 7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  days === d
                    ? "bg-zinc-800 text-amber-400 shadow-inner"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {d === 1 ? "Hoy" : `${d}d`}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs de Desempeño */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PerformanceCard title="Error Medio (MAE)" value={`${totalMAE} kWh`} desc="Desviación promedio por día" icon={AlertCircle} color="text-rose-400" />
          <PerformanceCard title="Cumplimiento" value={`${Math.round(totalCompliance * 100)}%`} desc="Energía Real / Predicha" icon={TrendingUp} color="text-emerald-400" />
          <PerformanceCard title="Temp. Media" value={`${avgTemp}°C`} desc="Ambiente durante el periodo" icon={CloudSun} color="text-sky-400" />
          <PerformanceCard title="Calidad de Datos" value={`${dailyEnergy.length} días`} desc="Registros en el periodo" icon={BarChart3} color="text-violet-400" />
        </div>

        {/* Gráfico 1: Desglose por Día (Energía) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Energía Diaria Integrada</h3>
              <p className="text-[10px] text-zinc-500">kWh acumulados por fecha (Havana Time)</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <div className="w-2.5 h-2.5 bg-sky-500/40 rounded-sm"></div> Predicho
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> Real
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyEnergy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", fontSize: "11px" }}
                />
                <Bar dataKey="predicted_kwh" fill="#38bdf8" fillOpacity={0.4} name="Predicho" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_kwh" fill="#34d399" name="Real" radius={[4, 4, 0, 0]}>
                  {dailyEnergy.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Math.abs(entry.actual_kwh - entry.predicted_kwh) > entry.predicted_kwh * 0.3 ? '#fbbf24' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Error de Predicción & Potencia */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Análisis de Desviación Horaria</h3>
              <p className="text-[10px] text-zinc-500">Error (Real - Predicho) vs Curva de Potencia (W)</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#52525b" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", fontSize: "11px" }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                
                <Bar dataKey="errorW" fill="#f43f5e" name="Desviación (W)" radius={[2, 2, 0, 0]} fillOpacity={0.6} />
                
                <Area type="monotone" dataKey="predictionW" fill="#38bdf8" stroke="#38bdf8" fillOpacity={0.05} strokeWidth={1} name="Predicho (W)" />
                <Line type="monotone" dataKey="actualW" stroke="#34d399" strokeWidth={2} dot={false} name="Real (W)" connectNulls={false} />
                
                <ReferenceLine y={0} stroke="#52525b" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla Detallada */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Detalle Diario de Generación</h3>
            <span className="text-[10px] text-zinc-600">Integración Trapezoidal (1h)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-zinc-300">
              <thead className="bg-zinc-950/50 text-zinc-500">
                <tr>
                  <th className="px-6 py-3 text-left">Fecha</th>
                  <th className="px-6 py-3 text-right">Predicho</th>
                  <th className="px-6 py-3 text-right">Real</th>
                  <th className="px-6 py-3 text-right">Error Abs.</th>
                  <th className="px-6 py-3 text-right">Cumplimiento</th>
                  <th className="px-6 py-3 text-right">Calidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {dailyEnergy.map((row) => {
                  const error = Math.abs(row.actual_kwh - row.predicted_kwh);
                  const compliance = row.predicted_kwh > 0 ? (row.actual_kwh / row.predicted_kwh) * 100 : 0;
                  const isGoodData = row.sample_count_actual >= 12; // 12 samples is ~ half day of hourly data

                  return (
                    <tr key={row.date} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-3 font-bold text-zinc-100">{row.date}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-sky-400/80">{row.predicted_kwh.toFixed(2)} kWh</td>
                      <td className="px-6 py-3 text-right tabular-nums text-emerald-400 font-bold">{row.actual_kwh.toFixed(2)} kWh</td>
                      <td className="px-6 py-3 text-right tabular-nums text-rose-400">{error.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                          compliance > 90 ? 'bg-emerald-500/10 text-emerald-400' :
                          compliance > 70 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {Math.round(compliance)}%
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`text-[10px] ${isGoodData ? 'text-zinc-500' : 'text-amber-500/60 font-medium'}`}>
                          {isGoodData ? 'Óptima' : 'Pobre'} ({row.sample_count_actual} pts)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

function PerformanceCard({ title, value, desc, icon: Icon, color }: { title: string, value: string, desc: string, icon: any, color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 ${color}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{title}</span>
      </div>
      <div>
        <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
        <p className="text-[10px] text-zinc-600 font-medium mt-1">{desc}</p>
      </div>
    </div>
  );
}
