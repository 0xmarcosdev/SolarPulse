"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, AlertCircle, CheckCircle2, Sliders, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface SystemConfigData {
  id?: number;
  panel_model: string;
  pmax_stc: number;
  temp_coeff_pmax: number;
  noct: number;
  bifaciality: number;
  system_losses: number;
  inverter_limit: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ConfigPage() {
  const [config, setConfig] = useState<SystemConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable parameters
  const [tilt, setTilt] = useState<number>(45);
  const [azimuth, setAzimuth] = useState<number>(180);
  const [albedo, setAlbedo] = useState<number>(0.2);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/v1/system-config`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: no se pudo obtener la configuración`);
      }
      const data: SystemConfigData = await res.json();
      setConfig(data);
      if (data.bifaciality !== undefined) {
        setAlbedo(data.bifaciality);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch config:", err);
      const msg = err instanceof Error ? err.message : "Error al conectar con el backend en " + API_BASE_URL;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/system-config`);
        if (!res.ok) {
          throw new Error(`Error ${res.status}: no se pudo obtener la configuración`);
        }
        const data: SystemConfigData = await res.json();
        if (!ignore) {
          setConfig(data);
          if (data.bifaciality !== undefined) {
            setAlbedo(data.bifaciality);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Failed to fetch config:", err);
          const msg = err instanceof Error ? err.message : "Error al conectar con el backend en " + API_BASE_URL;
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const payload = {
        ...config,
        bifaciality: albedo,
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/system-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al guardar los cambios`);
      }

      const updated = await res.json();
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Failed to save config:", err);
      const msg = err instanceof Error ? err.message : "Error al guardar la configuración";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6"></main>
        <header className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema Solar</h1>
              <p className="text-sm text-zinc-400">
                Parámetros técnicos del módulo fotovoltaico y orientación de la instalación.
              </p>
            </div>
          </div>
        </header>

        {/* Status messages */}
        {saveSuccess && (
          <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>Configuración actualizada exitosamente en el motor de predicción.</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchConfig}
              className="px-3 py-1 bg-red-800/60 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-zinc-400">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando parámetros del sistema...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Panel Information Card (Read-only) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Módulo Fotovoltaico
                </span>
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium">
                  Datasheet Verificado
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Panel Solar (Solo Lectura)
                </label>
                <input
                  type="text"
                  disabled
                  value={`Panel: ${config?.panel_model || "RUNERGY HY-DH144N8-585"} (${config?.pmax_stc || 585}W, ${((config?.temp_coeff_pmax || -0.0029) * 100).toFixed(2)}%/°C)`}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-sm cursor-not-allowed opacity-90"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-zinc-400 pt-1">
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                  <span className="block text-zinc-500">Pmax STC</span>
                  <span className="font-semibold text-zinc-200">{config?.pmax_stc || 585.0} W</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                  <span className="block text-zinc-500">NOCT</span>
                  <span className="font-semibold text-zinc-200">{config?.noct || 45.0} °C</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                  <span className="block text-zinc-500">Límite Inversor</span>
                  <span className="font-semibold text-amber-400">{config?.inverter_limit || 500.0} W</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                  <span className="block text-zinc-500">Pérdidas Sistema</span>
                  <span className="font-semibold text-zinc-200">{((config?.system_losses || 0.15) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Editable Configuration Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="border-b border-zinc-800/80 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Parámetros de Instalación
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Inclinación del Panel (Tilt)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="1"
                      value={tilt}
                      onChange={(e) => setTilt(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition text-sm"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-zinc-500 text-sm">°</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Óptimo en Cuba: 22° - 45°
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Azimut (Orientación)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="1"
                      value={azimuth}
                      onChange={(e) => setAzimuth(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition text-sm"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-zinc-500 text-sm">°</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Sur geográfico: 180°
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-300">
                    Albedo del Suelo / Factor Bifacial
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {albedo.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={albedo}
                  onChange={(e) => setAlbedo(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-zinc-950 rounded-lg cursor-pointer border border-zinc-800"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1.5">
                  <span>0.10 (Asfalto oscuro)</span>
                  <span>0.20 (Suelo estándar / Techo)</span>
                  <span>0.80 (Superficie reflectante / Nieve)</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando configuración...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar Configuración</span>
                </>
              )}
            </button>
          </form>
        )}
    </div>
  );
}
