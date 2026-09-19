/**
 * Motor Solar – Consola operativa de predicción (Cockpit).
 * 
 * Muestra variables meteorológicas en vivo, estado físico del sistema,
 * comparación real vs predicho y la gráfica interactiva del día.
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Gauge } from "@/components/ui/Gauge";
import { 
  BookOpen, Zap, Sun, Thermometer, Database, GitBranch, 
  RefreshCw, Clock, ArrowRight, AlertTriangle, Info, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposedChart,
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

// --- Interfaces ---

interface CockpitNowData {
  latest_weather: {
    ghi: number;
    dni: number;
    dhi: number;
    temp_air: number;
    forecast_time: string;
  } | null;
  latest_forecast: {
    poa_global: number;
    raw_dc_power: number;
    clipped_power: number;
    final_ac_power: number;
    forecast_time: string;
  } | null;
  latest_ecoflow: {
    battery_soc: number;
    input_watts: number;
    output_watts: number;
    timestamp: string;
  } | null;
  system_config: {
    panel_model: string;
    pmax_stc: number;
    inverter_limit: number;
    system_losses: number;
    noct: number;
    bifaciality: number;
  };
  active_model: string;
  last_openmeteo_fetch_at: string | null;
  recommended_refresh_minutes: number;
}

interface TodaySeriesItem {
  time: string;
  prediction_ac: number;
  real_input: number | null;
  poa_global: number | null;
}

// --- Componentes Auxiliares ---

function SensorCard({ title, value, unit, icon: Icon, colorClass, secondary }: { 
  title: string; value: string | number; unit?: string; icon: any; colorClass: string; secondary?: string 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 ${colorClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">{title}</span>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-zinc-100 tabular-nums">{value}</span>
          {unit && <span className="text-xs text-zinc-500 font-medium">{unit}</span>}
        </div>
        {secondary && <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{secondary}</p>}
      </div>
    </motion.div>
  );
}

// --- Página Principal ---

export default function MotorSolarPage() {
  const [nowData, setNowData] = useState<CockpitNowData | null>(null);
  const [seriesData, setSeriesData] = useState<TodaySeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [nowRes, seriesRes] = await Promise.all([
        fetch(`${API_URL}/api/cockpit/now`),
        fetch(`${API_URL}/api/cockpit/today-series`)
      ]);
      if (nowRes.ok) setNowData(await nowRes.json());
      if (seriesRes.ok) setSeriesData(await seriesRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualSync = async () => {
    setRefreshing(true);
    try {
      await fetch(`${API_URL}/api/forecast/fetch`, { method: "POST" });
      await fetchData();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchData();
    const timer = setInterval(() => void fetchData(), 30000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Countdown logic
  useEffect(() => {
    if (!nowData?.last_openmeteo_fetch_at) return;
    
    const updateCountdown = () => {
      const last = new Date(nowData.last_openmeteo_fetch_at!).getTime();
      const next = last + nowData.recommended_refresh_minutes * 60 * 1000;
      const diff = next - Date.now();
      
      if (diff <= 0) {
        setCountdown("Recomendado ahora");
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(`${mins}m ${secs}s`);
      }
    };

    updateCountdown();
    const t = setInterval(updateCountdown, 1000);
    return () => clearInterval(t);
  }, [nowData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
          <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  const latestFetch = nowData?.last_openmeteo_fetch_at 
    ? new Date(String(nowData.last_openmeteo_fetch_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "—";

  const errorW = (nowData?.latest_ecoflow?.input_watts ?? 0) - (nowData?.latest_forecast?.final_ac_power ?? 0);
  const errorPct = nowData?.latest_forecast?.final_ac_power 
    ? Math.round((Math.abs(errorW) / nowData.latest_forecast.final_ac_power) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        
        {/* Header Operativo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-amber-500/10 text-amber-500/50 text-[8px] font-bold uppercase tracking-widest rotate-90 origin-top-right">
            Operation Room
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-zinc-100">Motor Solar</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {nowData?.active_model}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                Última sync: <span className="text-zinc-300">{latestFetch}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Próximo refresh: <span className={countdown === "Recomendado ahora" ? "text-amber-400 font-bold" : "text-zinc-300"}>
                  {countdown}
                </span>
              </span>
            </div>
          </div>

          <button 
            onClick={handleManualSync}
            disabled={refreshing}
            className="group flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-zinc-900' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {refreshing ? "Actualizando..." : "Sincronizar Open-Meteo"}
          </button>
        </div>

        {/* Widget de Constantes Meteorológicas en Tiempo Real */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-[var(--shadow-card)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)]">
                <Sun className="h-4 w-4 animate-spin-slow" />
              </div>
              <h3 className="text-xs font-[family-name:var(--font-ui)] uppercase tracking-wider font-semibold text-[var(--color-foreground)]">
                Constantes Meteorológicas en Tiempo Real (Open-Meteo)
              </h3>
            </div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-cyan)] bg-[var(--color-surface-2)] px-2.5 py-1 rounded-full border border-[var(--color-border)]">
              Lat: 22.41° N · Lon: -79.98° O
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--color-surface-2)] p-3.5 rounded-2xl border border-[var(--color-border)]">
              <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">GHI (Horizontal)</span>
              <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent)] tabular-nums">
                {nowData?.latest_weather?.ghi ?? 0} <span className="text-xs text-[var(--color-muted)] font-normal">W/m²</span>
              </span>
            </div>
            <div className="bg-[var(--color-surface-2)] p-3.5 rounded-2xl border border-[var(--color-border)]">
              <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">DNI (Directa)</span>
              <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-[var(--color-cyan)] tabular-nums">
                {nowData?.latest_weather?.dni ?? 0} <span className="text-xs text-[var(--color-muted)] font-normal">W/m²</span>
              </span>
            </div>
            <div className="bg-[var(--color-surface-2)] p-3.5 rounded-2xl border border-[var(--color-border)]">
              <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">DHI (Difusa)</span>
              <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-violet-400 tabular-nums">
                {nowData?.latest_weather?.dhi ?? 0} <span className="text-xs text-[var(--color-muted)] font-normal">W/m²</span>
              </span>
            </div>
            <div className="bg-[var(--color-surface-2)] p-3.5 rounded-2xl border border-[var(--color-border)]">
              <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">Temp. Aire (2m)</span>
              <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-[var(--color-danger)] tabular-nums">
                {nowData?.latest_weather?.temp_air ?? 25.0} <span className="text-xs text-[var(--color-muted)] font-normal">°C</span>
              </span>
            </div>
          </div>
        </div>

        {/* Sensores en Vivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SensorCard title="GHI" value={nowData?.latest_weather?.ghi ?? 0} unit="W/m²" icon={Sun} colorClass="text-amber-400" secondary="Irrad. Horizontal" />
          <SensorCard title="POA" value={Math.round(nowData?.latest_forecast?.poa_global ?? 0)} unit="W/m²" icon={MapPin} colorClass="text-sky-400" secondary="Plane of Array" />
          <SensorCard title="Temp Aire" value={nowData?.latest_weather?.temp_air ?? 25} unit="°C" icon={Thermometer} colorClass="text-rose-400" secondary="Ambiente 2m" />
          <SensorCard title="Inclinación" value={45} unit="°" icon={GitBranch} colorClass="text-emerald-400" secondary="Azimut 180°" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Corazón: Gráfica interactiva */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-200">Ciclo Solar Operativo</h3>
                <p className="text-[10px] text-zinc-500">Pasado (Real) vs Futuro (Predicho) · Límite 500W</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                  <span className="text-[10px] text-zinc-400">Predicción</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-[10px] text-zinc-400">EcoFlow</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={seriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#52525b" 
                    tick={{ fontSize: 9 }} 
                    tickFormatter={(str) => new Date(str).getHours() + ":00"}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis stroke="#52525b" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", fontSize: "11px" }}
                    labelFormatter={(label) => new Date(String(label)).toLocaleString()}
                  />
                  <ReferenceLine y={500} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '500W', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                  <Area 
                    type="monotone" 
                    dataKey="prediction_ac" 
                    stroke="#38bdf8" 
                    fill="#38bdf8" 
                    fillOpacity={0.1} 
                    strokeWidth={2} 
                    name="Predicción"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="real_input" 
                    stroke="#34d399" 
                    strokeWidth={2.5} 
                    dot={false}
                    name="Real"
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Marcador Ahora (Estimado en el eje X) */}
            <div className="absolute bottom-10 left-[45%] h-64 w-[2px] bg-amber-500/30 border-l border-amber-500/50 dashed pointer-events-none hidden md:block">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-zinc-950 text-[8px] font-black rounded-full uppercase">Ahora</div>
            </div>
          </div>

          {/* Comparativa & Pipeline */}
          <div className="space-y-4">
            
            {/* Ahora vs Predicción */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Desempeño en Vivo</h3>
              <div className="flex items-center justify-between">
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-zinc-500 font-medium">EcoFlow Real</p>
                  <p className="text-2xl font-black text-emerald-400 tabular-nums">
                    {Math.round(nowData?.latest_ecoflow?.input_watts ?? 0)}W
                  </p>
                </div>
                <div className="h-10 w-[1px] bg-zinc-800"></div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-zinc-500 font-medium">Predicción</p>
                  <p className="text-2xl font-black text-sky-400 tabular-nums">
                    {Math.round(nowData?.latest_forecast?.final_ac_power ?? 0)}W
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-2xl flex items-center justify-between ${errorPct > 15 ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                <div className="flex items-center gap-2">
                  {errorPct > 15 ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : <Zap className="h-4 w-4 text-emerald-400" />}
                  <span className="text-xs font-bold">{errorPct}% Error</span>
                </div>
                <span className="text-[10px] text-zinc-500">Delta: {Math.round(errorW)}W</span>
              </div>
            </div>

            {/* Pipeline Vivo */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Pipeline de Cálculo</h3>
              <div className="space-y-3">
                <PipelineRow 
                  icon={Sun} 
                  label="POA → DC" 
                  value={`${Math.round(nowData?.latest_forecast?.raw_dc_power ?? 0)}W`} 
                  desc="Irradiancia + Temp Celda" 
                />
                <PipelineRow 
                  icon={ArrowRight} 
                  label="Clipping" 
                  value={`${Math.round(nowData?.latest_forecast?.clipped_power ?? 0)}W`} 
                  desc="Límite 500W Delta 3" 
                  active={ (nowData?.latest_forecast?.raw_dc_power ?? 0) > 500 }
                />
                <PipelineRow 
                  icon={Zap} 
                  label="Pérdidas" 
                  value={`${Math.round(nowData?.latest_forecast?.final_ac_power ?? 0)}W`} 
                  desc="Factor de sistema 0.85" 
                />
              </div>
            </div>

            {/* Config Quick View */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-4 flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Info className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-[10px]">
                <p className="text-zinc-300 font-bold">Panel: {nowData?.system_config.panel_model}</p>
                <p className="text-zinc-500">Location: Lat 22.40 / Lon -79.97 (Cuba)</p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

function PipelineRow({ icon: Icon, label, value, desc, active }: { icon: any, label: string, value: string, desc: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${active ? 'bg-rose-500/10 border border-rose-500/20' : 'hover:bg-zinc-950/50'}`}>
      <div className={`p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 ${active ? 'text-rose-400' : 'text-zinc-500'}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-zinc-200">{label}</span>
          <span className="text-[11px] font-black text-zinc-100">{value}</span>
        </div>
        <p className="text-[9px] text-zinc-500 leading-none mt-1">{desc}</p>
      </div>
    </div>
  );
}
