"use client";

import { useEffect, useState } from "react";
import { Battery, Sun, Zap, RefreshCw, AlertCircle } from "lucide-react";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function StatusCard() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingForecast, setFetchingForecast] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/current-status`);
      if (!res.ok) throw new Error("Failed to fetch status from backend");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchForecast = async () => {
    try {
      setFetchingForecast(true);
      const res = await fetch(`${API_URL}/api/forecast/fetch`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to fetch forecast from Open-Meteo");
      await fetchStatus();
    } catch (err: any) {
      alert(err.message || "Error fetching forecast");
    } finally {
      setFetchingForecast(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <span className="text-sm font-medium text-zinc-600">
          Estado del Sistema Solarpulse
        </span>
        <button
          onClick={handleFetchForecast}
          disabled={fetchingForecast}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${fetchingForecast ? "animate-spin" : ""}`} />
          {fetchingForecast ? "Actualizando Clima..." : "Actualizar Open-Meteo"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error} (¿Está corriendo FastAPI en puerto 8000?)</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EcoFlow Status Card */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Battery className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-500">EcoFlow Delta 3</h2>
              <p className="text-xl font-bold text-zinc-900">
                {data?.ecoflow ? `${data.ecoflow.battery_soc}% SoC` : "Sin lecturas"}
              </p>
            </div>
          </div>
          {data?.ecoflow ? (
            <div className="text-xs text-zinc-500 space-y-1">
              <p>Entrada: <span className="font-semibold text-zinc-800">{data.ecoflow.input_watts} W</span></p>
              <p>Salida: <span className="font-semibold text-zinc-800">{data.ecoflow.output_watts} W</span></p>
              <p>Fuente: <span className="font-semibold text-zinc-800 uppercase">{data.ecoflow.source}</span></p>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Registra una lectura o conecta EcoFlow.</p>
          )}
        </div>

        {/* Generation Forecast Card */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-500">Predicción Solar (AC)</h2>
              <p className="text-xl font-bold text-zinc-900">
                {data?.generation_forecast ? `${Math.round(data.generation_forecast.final_ac_power)} W` : "0 W"}
              </p>
            </div>
          </div>
          {data?.generation_forecast ? (
            <div className="text-xs text-zinc-500 space-y-1">
              <p>POA Global: <span className="font-semibold text-zinc-800">{Math.round(data.generation_forecast.poa_global)} W/m²</span></p>
              <p>Clip (500W Max): <span className="font-semibold text-zinc-800">{Math.round(data.generation_forecast.clipped_power)} W</span></p>
              <p>Hora: <span className="font-semibold text-zinc-800">{new Date(data.generation_forecast.forecast_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Haz clic en &quot;Actualizar Open-Meteo&quot; para calcular pronóstico.</p>
          )}
        </div>
      </div>
    </div>
  );
}
