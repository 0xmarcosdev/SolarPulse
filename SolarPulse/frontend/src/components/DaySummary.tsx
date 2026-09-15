/**
 * DaySummary – Resumen del día + mini-cards de pico solar y horas restantes.
 *
 * Por ahora usamos estimaciones a partir de los datos disponibles.
 * Cuando el backend exponga kWh diarios reales, solo hay que sustituir los cálculos.
 */

"use client";

import { Sun, Clock, TrendingUp, Battery } from "lucide-react";
import { motion } from "framer-motion";

interface DaySummaryProps {
  /** kWh predichos del día (estimación o valor real del backend) */
  predictedKwh?: number;
  /** kWh reales acumulados hasta ahora */
  actualKwh?: number;
  /** Hora del próximo pico (ej: "13:20") */
  nextPeakHour?: string;
  /** Potencia estimada del pico (W) */
  nextPeakWatts?: number;
  /** Horas de sol restantes aproximadas */
  sunHoursLeft?: number;
}

export function DaySummary({
  predictedKwh = 0,
  actualKwh = 0,
  nextPeakHour = "—",
  nextPeakWatts = 0,
  sunHoursLeft = 0,
}: DaySummaryProps) {
  const compliance =
    predictedKwh > 0 ? Math.round((actualKwh / predictedKwh) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Resumen kWh */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 col-span-1 sm:col-span-2 lg:col-span-1"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <span className="text-xs font-medium text-zinc-400">Resumen del día</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {actualKwh.toFixed(2)}
            <span className="text-sm font-medium text-zinc-500 ml-1">kWh</span>
          </p>
          <p className="text-xs text-zinc-500">
            Predicho: {predictedKwh.toFixed(2)} kWh · {compliance}% cumplido
          </p>
        </div>
      </motion.div>

      {/* Próximo pico solar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xs font-medium text-zinc-400">Próximo pico</span>
        </div>
        <p className="text-xl font-bold tabular-nums text-zinc-50">
          {nextPeakHour}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          ~{Math.round(nextPeakWatts)} W estimados
        </p>
      </motion.div>

      {/* Horas de sol restantes */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <span className="text-xs font-medium text-zinc-400">Sol restante</span>
        </div>
        <p className="text-xl font-bold tabular-nums text-zinc-50">
          {sunHoursLeft.toFixed(1)} h
        </p>
        <p className="text-xs text-zinc-500 mt-1">hasta puesta de sol</p>
      </motion.div>

      {/* Espacio libre / futuro KPI */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Battery className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-zinc-400">Autonomía est.</span>
        </div>
        <p className="text-xl font-bold tabular-nums text-zinc-50">—</p>
        <p className="text-xs text-zinc-500 mt-1">próximamente</p>
      </motion.div>
    </div>
  );
}