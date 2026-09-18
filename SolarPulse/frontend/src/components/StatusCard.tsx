/**
 * StatusCard – Panel de estado en vivo del sistema SolarPulse.
 *
 * Responsabilidades:
 * - Mostrar 4 KPI densos (Batería, Entrada Solar, Predicción, POA)
 * - Sparklines alimentados con datos reales de /api/ecoflow y /api/generation
 * - Formulario de entrada manual (fallback)
 * - Botón de actualización de Open-Meteo
 *
 * Endpoints usados:
 * - GET  /api/current-status
 * - GET  /api/ecoflow?limit=24
 * - GET  /api/generation
 * - POST /api/forecast/fetch
 * - POST /api/ecoflow
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Battery,
  Sun,
  Zap,
  Thermometer,
  RefreshCw,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";

interface StatusData {
  ecoflow?: {
    battery_soc: number;
    input_watts: number;
    output_watts: number;
    timestamp: string;
    source: string;
  } | null;
  generation_forecast?: {
    forecast_time: string;
    poa_global: number;
    raw_dc_power: number;
    clipped_power: number;
    final_ac_power: number;
  } | null;
}

interface SparkPoint {
  value: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function StatusCard() {
  const [data, setData] = useState<StatusData | null>(null);
  const [sparkBattery, setSparkBattery] = useState<SparkPoint[]>([]);
  const [sparkInput, setSparkInput] = useState<SparkPoint[]>([]);
  const [sparkPrediction, setSparkPrediction] = useState<SparkPoint[]>([]);
  const [sparkPoa, setSparkPoa] = useState<SparkPoint[]>([]);

  const [fetchingForecast, setFetchingForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [soc, setSoc] = useState("80");
  const [inputW, setInputW] = useState("250");
  const [outputW, setOutputW] = useState("200");
  const [submittingManual, setSubmittingManual] = useState(false);

  /** Carga el estado actual + series para sparklines */
  const fetchAll = useCallback(async () => {
    try {
      // 1. Estado actual
      const statusRes = await fetch(`${API_URL}/api/current-status`);
      if (!statusRes.ok) throw new Error("Error al obtener estado actual");
      const statusJson = await statusRes.json();
      setData(statusJson);

      // 2. Histórico EcoFlow (últimas lecturas → sparkline de batería y entrada)
      const ecoRes = await fetch(`${API_URL}/api/ecoflow?limit=24`);
      if (ecoRes.ok) {
        const ecoData = await ecoRes.json();
        // Ordenamos de más antiguo a más reciente para el sparkline
        const sorted = [...ecoData].reverse();
        setSparkBattery(
          sorted.map((r: { battery_soc: number }) => ({ value: r.battery_soc }))
        );
        setSparkInput(
          sorted.map((r: { input_watts: number }) => ({ value: r.input_watts }))
        );
      }

      // 3. Histórico de generación (predicción + POA)
      const genRes = await fetch(`${API_URL}/api/generation`);
      if (genRes.ok) {
        const genData = await genRes.json();
        // Tomamos las últimas 24 horas aproximadamente
        const recent = genData.slice(-24);
        setSparkPrediction(
          recent.map((g: { final_ac_power: number }) => ({
            value: g.final_ac_power,
          }))
        );
        setSparkPoa(
          recent.map((g: { poa_global: number }) => ({ value: g.poa_global }))
        );
      }

      setError(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error conectando con el backend";
      setError(msg);
    }
  }, []);

  const handleFetchForecast = async () => {
    try {
      setFetchingForecast(true);
      const res = await fetch(`${API_URL}/api/forecast/fetch`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Error al actualizar Open-Meteo");
      await fetchAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setFetchingForecast(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingManual(true);
      const payload = {
        timestamp: new Date().toISOString(),
        battery_soc: parseInt(soc, 10),
        input_watts: parseFloat(inputW),
        output_watts: parseFloat(outputW),
        source: "manual",
      };
      const res = await fetch(`${API_URL}/api/ecoflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar lectura manual");
      setShowManualForm(false);
      await fetchAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmittingManual(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchAll();
    };
    void load();
    const interval = setInterval(() => {
      void load();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Valores derivados
  const batterySoc = data?.ecoflow?.battery_soc ?? 0;
  const inputWatts = data?.ecoflow?.input_watts ?? 0;
  const prediction = data?.generation_forecast?.final_ac_power ?? 0;
  const poa = data?.generation_forecast?.poa_global ?? 0;
  const source = data?.ecoflow?.source ?? "—";

  return (
    <div className="w-full space-y-3">
      {/* Acciones */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Estado en vivo
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {showManualForm ? "Cerrar" : "Manual"}
          </button>
          <button
            onClick={handleFetchForecast}
            disabled={fetchingForecast}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${fetchingForecast ? "animate-spin" : ""}`}
            />
            {fetchingForecast ? "..." : "Open-Meteo"}
          </button>
        </div>
      </div>

      {/* Formulario manual */}
      {showManualForm && (
        <form
          onSubmit={handleManualSubmit}
          className="bg-zinc-900 p-4 rounded-2xl border border-amber-500/30 space-y-3"
        >
          <h3 className="text-xs font-semibold text-amber-400">
            Registro Manual EcoFlow
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">SoC %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={soc}
                onChange={(e) => setSoc(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Entrada W</label>
              <input
                type="number"
                min="0"
                max="500"
                value={inputW}
                onChange={(e) => setInputW(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Salida W</label>
              <input
                type="number"
                min="0"
                value={outputW}
                onChange={(e) => setOutputW(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingManual}
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50"
            >
              {submittingManual ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de 4 KPI con tokens Clean Pulse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="SoC Batería"
          value={data?.ecoflow ? batterySoc : "—"}
          unit="%"
          subtitle={data?.ecoflow ? `Fuente: ${source}` : "Sin lecturas"}
          icon={Battery}
          iconColor="text-[var(--color-success)]"
          iconBg="bg-[var(--color-success)]/10 border-[var(--color-success)]/20"
          progress={batterySoc}
          progressColor="bg-[var(--color-success)]"
          badge={data?.ecoflow ? "en vivo" : undefined}
          sparkData={sparkBattery}
          sparkColor="var(--color-success)"
        />

        <KpiCard
          title="Entrada Solar"
          value={data?.ecoflow ? Math.round(inputWatts) : "—"}
          unit="W"
          subtitle={
            data?.ecoflow
              ? `Salida: ${Math.round(data.ecoflow.output_watts)} W`
              : "Esperando datos"
          }
          icon={Zap}
          iconColor="text-[var(--color-accent)]"
          iconBg="bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20"
          progress={Math.min(100, (inputWatts / 500) * 100)}
          progressColor="bg-[var(--color-accent)]"
          badge={inputWatts > 480 ? "clipping" : undefined}
          sparkData={sparkInput}
          sparkColor="var(--color-accent)"
        />

        <KpiCard
          title="Predicción AC"
          value={data?.generation_forecast ? Math.round(prediction) : "—"}
          unit="W"
          subtitle={
            data?.generation_forecast
              ? `Clip: ${Math.round(data.generation_forecast.clipped_power)} W`
              : "Actualiza Open-Meteo"
          }
          icon={Sun}
          iconColor="text-[var(--color-cyan)]"
          iconBg="bg-[var(--color-cyan)]/10 border-[var(--color-cyan)]/20"
          sparkData={sparkPrediction}
          sparkColor="var(--color-cyan)"
        />

        <KpiCard
          title="POA Global"
          value={data?.generation_forecast ? Math.round(poa) : "—"}
          unit="W/m²"
          subtitle={
            data?.generation_forecast
              ? new Date(
                  data.generation_forecast.forecast_time
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Sin pronóstico"
          }
          icon={Thermometer}
          iconColor="text-[var(--color-cyan)]"
          iconBg="bg-[var(--color-cyan)]/10 border-[var(--color-cyan)]/20"
          sparkData={sparkPoa}
          sparkColor="var(--color-cyan)"
        />
      </div>
    </div>
  );
}